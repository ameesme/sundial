import type { LightConfig, LightInfo, Schema, SunConfig } from "./types";

export const HOURS = Array.from({ length: 24 }, (_, h) => h);

// Slider bounds for color-temperature inputs.
export const KELVIN_MIN = 1500;
export const KELVIN_MAX = 6500;

export function defaultSunConfig(): SunConfig {
  return {
    min_brightness: 5,
    max_brightness: 100,
    min_color_temp: 2000,
    max_color_temp: 5500,
    ramp_dark: 5000,
    ramp_light: 9000,
    sunrise_time: null,
    sunset_time: null,
    sunrise_offset: 5000,
    sunset_offset: -5000,
    min_sunrise_time: null,
    max_sunrise_time: null,
    min_sunset_time: null,
    max_sunset_time: null,
  };
}

export function defaultLightConfig(): LightConfig {
  return {
    min_brightness: 1,
    max_brightness: 100,
    min_color_temp: 2000,
    max_color_temp: 5500,
    separate_turn_on_commands: false,
    limit_mode: "cap",
    render_mode: "auto",
    hours: Array.from({ length: 24 }, () => null),
  };
}

export function defaultSchema(id: string, name: string): Schema {
  return { id, name, sun: defaultSunConfig(), lights: {} };
}

// Whether a light can render colour at all. RGB-only lights count: the
// integration renders their colour temperature as RGB (kelvin_to_rgb), so the
// temperature controls still drive what they do. Only a light that supports
// neither takes brightness alone. Unknown lights are assumed colour-capable so
// the controls don't flicker away before the config lands.
export function hasColor(light: LightInfo | undefined): boolean {
  if (!light) return true;
  return light.supports_color_temp || light.supports_rgb;
}

// Rough Kelvin -> CSS color, used for the timeline swatches.
export function kelvinToCss(kelvin: number): string {
  const temp = Math.max(1000, Math.min(12000, kelvin)) / 100;
  let r: number;
  let g: number;
  let b: number;
  if (temp <= 66) {
    r = 255;
    g = 99.47 * Math.log(temp) - 161.12;
  } else {
    r = 329.7 * Math.pow(temp - 60, -0.1332);
    g = 288.12 * Math.pow(temp - 60, -0.0755);
  }
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = 138.52 * Math.log(temp - 10) - 305.04;
  }
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
}

// CSS gradient sweeping a Kelvin range, for slider indication strips.
export function kelvinGradientCss(minK: number, maxK: number): string {
  const steps = 10;
  const stops: string[] = [];
  for (let i = 0; i <= steps; i++) {
    stops.push(kelvinToCss(minK + ((maxK - minK) * i) / steps));
  }
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

// "45 min" below an hour, "1 h 23 min" above; signed when negative.
export function formatDuration(seconds: number): string {
  const sign = seconds < 0 ? "−" : "";
  const totalMin = Math.round(Math.abs(seconds) / 60);
  const h = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  if (h === 0) return `${sign}${min} min`;
  if (min === 0) return `${sign}${h} h`;
  return `${sign}${h} h ${min} min`;
}

export function hourLabel(hour: number): string {
  return String(hour).padStart(2, "0");
}

export function rgbToHex(rgb: [number, number, number]): string {
  return (
    "#" +
    rgb
      .map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace("#", "");
  return [
    parseInt(v.slice(0, 2), 16) || 0,
    parseInt(v.slice(2, 4), 16) || 0,
    parseInt(v.slice(4, 6), 16) || 0,
  ];
}

// Local hour-of-day right now, snapped to the scrubbers' 5-minute grid so
// the readouts always match the thumb position.
export function currentHour(): number {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return Math.min(1435, Math.round(minutes / 5) * 5) / 60;
}
