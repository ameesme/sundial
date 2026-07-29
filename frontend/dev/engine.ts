// A small JavaScript port of custom_components/sundial/engine.py, used only by
// the local dev harness (mock-backend.ts) so the fake timeline and preview look
// exactly like the real integration. The production panel never imports this —
// the real computation runs in Python. Keep it in step with engine.py.

import type { HourCell, LightConfig, RgbColor, Schema, SunConfig } from "../src/types";
import { HOURS } from "../src/utils";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const round5 = (v: number) => Math.round(v / 5) * 5;

// 0.5*(1+tanh(a*x+b)) through (x1,y1),(x2,y2). atanh(y) = 0.5*ln((1+y)/(1-y)).
// Ported from engine.py; ultimately derived from Adaptive Lighting
// (Apache-2.0 — see THIRD_PARTY_LICENSES at the repository root).
function scaledTanh(x: number, x1: number, x2: number, y1 = 0.05, y2 = 0.95): number {
  const atanh = (y: number) => 0.5 * Math.log((1 + y) / (1 - y));
  const ya = atanh(2 * y1 - 1);
  const yb = atanh(2 * y2 - 1);
  const a = (yb - ya) / (x2 - x1);
  const b = ya - a * x1;
  return 0.5 * (1 + Math.tanh(a * x + b));
}

// --- the sun, in fractional local-hour space --------------------------------
// Home Assistant uses astral for real sunrise/sunset; the harness fakes them at
// fixed clock hours (offsets honoured), which is plenty for UI work.

interface SunEvent {
  hour: number; // absolute hours from local midnight (may be <0 or >24)
  kind: "sunrise" | "sunset";
}

function parseHm(value: string | null): number | null {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  return h + (m || 0) / 60;
}

function sunEvents(sun: SunConfig): SunEvent[] {
  const baseSunrise = parseHm(sun.sunrise_time) ?? 7 + sun.sunrise_offset / 3600;
  const baseSunset = parseHm(sun.sunset_time) ?? 19 + sun.sunset_offset / 3600;
  const events: SunEvent[] = [];
  for (const day of [-1, 0, 1]) {
    events.push({ hour: baseSunrise + 24 * day, kind: "sunrise" });
    events.push({ hour: baseSunset + 24 * day, kind: "sunset" });
  }
  return events.sort((a, b) => a.hour - b.hour);
}

interface SunSnapshot {
  position: number; // -1 (solar midnight) .. 1 (solar noon)
  isDay: boolean;
  nearestSunrise: number;
  nearestSunset: number;
}

function sunSnapshot(now: number, events: SunEvent[]): SunSnapshot {
  let prev: SunEvent | null = null;
  let next: SunEvent | null = null;
  for (const e of events) {
    if (e.hour <= now) prev = e;
    else if (!next) next = e;
  }
  // min(..., default=now) in engine.py: `now` is the fallback for *no* events
  // of that kind, not a starting candidate (seeding the reduce with it would
  // always win at distance 0).
  const nearest = (kind: SunEvent["kind"]) => {
    const hours = events.filter((e) => e.kind === kind).map((e) => e.hour);
    if (!hours.length) return now;
    return hours.reduce((best, h) =>
      Math.abs(h - now) < Math.abs(best - now) ? h : best,
    );
  };
  const nearestSunrise = nearest("sunrise");
  const nearestSunset = nearest("sunset");
  if (!prev || !next) {
    return { position: 0, isDay: true, nearestSunrise, nearestSunset };
  }
  const span = next.hour - prev.hour || 1;
  const frac = clamp((now - prev.hour) / span, 0, 1);
  const isDay = prev.kind === "sunrise";
  const position = Math.sin(Math.PI * frac) * (isDay ? 1 : -1);
  return { position, isDay, nearestSunrise, nearestSunset };
}

function ramp(now: number, start: number, end: number, rising: boolean): number {
  const total = end - start || 1;
  const frac = clamp((now - start) / total, 0, 1);
  const value = scaledTanh(frac, 0, 1);
  return rising ? value : 1 - value;
}

function dayFactor(now: number, snap: SunSnapshot, sun: SunConfig): number {
  const dark = sun.ramp_dark / 3600;
  const light = sun.ramp_light / 3600;
  const srStart = snap.nearestSunrise - dark;
  const srEnd = snap.nearestSunrise + light;
  const ssStart = snap.nearestSunset - light;
  const ssEnd = snap.nearestSunset + dark;
  if (now >= srStart && now <= srEnd) return ramp(now, srStart, srEnd, true);
  if (now >= ssStart && now <= ssEnd) return ramp(now, ssStart, ssEnd, false);
  return snap.isDay ? 1 : 0;
}

interface Drive {
  brightness: number;
  warmth: number;
}

// The sun's normalized drive for each of the 24 local hours.
function sunDrives(sun: SunConfig): Drive[] {
  const events = sunEvents(sun);
  return HOURS.map((hour) => {
    const snap = sunSnapshot(hour, events);
    return { brightness: dayFactor(hour, snap, sun), warmth: clamp(snap.position, 0, 1) };
  });
}

// --- mapping drive -> values, then the 24-hour timeline ----------------------

function sunValues(sun: SunConfig, drives: Drive[]): [number, number][] {
  return drives.map((d) => [
    lerp(sun.min_brightness, sun.max_brightness, clamp(d.brightness, 0, 1)),
    lerp(sun.min_color_temp, sun.max_color_temp, clamp(d.warmth, 0, 1)),
  ]);
}

type Anchor = [number, number, RgbColor | null];

function lightAnchors(
  light: LightConfig,
  sunVals: [number, number][],
  drives: Drive[],
): Anchor[] {
  return HOURS.map((hour): Anchor => {
    const cell: HourCell = light.hours[hour] ?? null;
    if (cell) {
      // An explicit 0 means "off" for that hour; keep it rather than clamping
      // up to the light's minimum.
      const bri =
        cell.brightness <= 0
          ? 0
          : clamp(cell.brightness, light.min_brightness, light.max_brightness);
      const temp = clamp(cell.color_temp, light.min_color_temp, light.max_color_temp);
      const rgb = cell.rgb_color
        ? ([cell.rgb_color[0], cell.rgb_color[1], cell.rgb_color[2]] as RgbColor)
        : null;
      return [bri, temp, rgb];
    }
    if (light.limit_mode === "scale") {
      const d = drives[hour];
      return [
        lerp(light.min_brightness, light.max_brightness, clamp(d.brightness, 0, 1)),
        lerp(light.min_color_temp, light.max_color_temp, clamp(d.warmth, 0, 1)),
        null,
      ];
    }
    return [
      clamp(sunVals[hour][0], light.min_brightness, light.max_brightness),
      clamp(sunVals[hour][1], light.min_color_temp, light.max_color_temp),
      null,
    ];
  });
}

function interpRgb(a: RgbColor | null, b: RgbColor | null, frac: number): RgbColor | null {
  if (a && b) {
    return [
      Math.round(lerp(a[0], b[0], frac)),
      Math.round(lerp(a[1], b[1], frac)),
      Math.round(lerp(a[2], b[2], frac)),
    ];
  }
  if (!a && !b) return null;
  return frac < 0.5 ? a : b;
}

function interpolateCyclic(anchors: Anchor[], hour: number): Anchor {
  hour = ((hour % 24) + 24) % 24;
  const h0 = Math.floor(hour) % 24;
  const h1 = (h0 + 1) % 24;
  const frac = hour - Math.floor(hour);
  return [
    lerp(anchors[h0][0], anchors[h1][0], frac),
    lerp(anchors[h0][1], anchors[h1][1], frac),
    interpRgb(anchors[h0][2], anchors[h1][2], frac),
  ];
}

// --- payloads matching coordinator.compute_timeline / async_preview ----------

export function computeTimeline(schema: Schema, entityIds: string[], defaultLight: () => LightConfig) {
  const drives = sunDrives(schema.sun);
  const sunVals = sunValues(schema.sun, drives);
  const sun = sunVals.map(([bri, temp]) => ({
    brightness: Math.round(bri),
    color_temp: round5(temp),
  }));
  const lights: Record<string, unknown[]> = {};
  for (const entityId of entityIds) {
    const cfg = schema.lights[entityId] ?? defaultLight();
    const anchors = lightAnchors(cfg, sunVals, drives);
    lights[entityId] = HOURS.map((hour) => ({
      brightness: Math.round(anchors[hour][0]),
      color_temp: round5(anchors[hour][1]),
      rgb_color: anchors[hour][2] ? [...anchors[hour][2]] : null,
      explicit: cfg.hours[hour] != null,
    }));
  }
  return { sun, lights };
}

// The sun's live state at one fractional hour, matching the payload
// coordinator.sun_state + engine.drive_to_values produce for sundial/status.
export function computeSunState(sun: SunConfig, hour: number) {
  const snap = sunSnapshot(hour, sunEvents(sun));
  const drive = {
    brightness: dayFactor(hour, snap, sun),
    warmth: clamp(snap.position, 0, 1),
  };
  return {
    snap,
    drive,
    brightness: Math.round(
      lerp(sun.min_brightness, sun.max_brightness, clamp(drive.brightness, 0, 1)),
    ),
    colorTemp: round5(
      lerp(sun.min_color_temp, sun.max_color_temp, clamp(drive.warmth, 0, 1)),
    ),
  };
}

export function computeTargets(
  schema: Schema,
  hour: number,
  entityIds: string[],
  defaultLight: () => LightConfig,
): Record<string, { brightness_pct: number; color_temp_kelvin: number }> {
  const drives = sunDrives(schema.sun);
  const sunVals = sunValues(schema.sun, drives);
  const targets: Record<string, { brightness_pct: number; color_temp_kelvin: number }> = {};
  for (const entityId of entityIds) {
    const cfg = schema.lights[entityId] ?? defaultLight();
    const anchors = lightAnchors(cfg, sunVals, drives);
    const [bri, temp] = interpolateCyclic(anchors, hour);
    targets[entityId] = { brightness_pct: Math.round(bri), color_temp_kelvin: round5(temp) };
  }
  return targets;
}
