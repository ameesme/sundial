// In-memory fake of the integration's WebSocket backend, so the panel can run
// fully in the browser (npm run dev) with no Home Assistant. It mirrors the WS
// commands in custom_components/sundial/panel.py and computes timeline/preview
// with the ported engine in ./engine.ts.

import type {
  ConfigPayload,
  GlobalSettings,
  HomeAssistant,
  HourCell,
  LightConfig,
  LightStatus,
  ManualReason,
  Schema,
  StatusPayload,
} from "../src/types";
import { currentHour, defaultLightConfig, defaultSunConfig } from "../src/utils";
import { computeSunState, computeTargets, computeTimeline } from "./engine";

// --- fake devices ------------------------------------------------------------

interface FakeLight {
  entity_id: string;
  name: string;
  area_name: string | null;
  supports_rgb: boolean;
  ct_range: [number, number] | null;
}

const FAKE_LIGHTS: FakeLight[] = [
  { entity_id: "light.living_room", name: "Living Room", area_name: "Living Room", supports_rgb: true, ct_range: [2000, 6500] },
  { entity_id: "light.floor_lamp", name: "Floor Lamp Corner", area_name: "Living Room", supports_rgb: false, ct_range: [2200, 4500] },
  { entity_id: "light.kitchen", name: "Kitchen Spots", area_name: "Kitchen", supports_rgb: false, ct_range: [2200, 4000] },
  { entity_id: "light.bedroom", name: "Bedroom", area_name: "Bedroom", supports_rgb: true, ct_range: null },
  { entity_id: "light.hallway", name: "Hallway", area_name: null, supports_rgb: false, ct_range: [2700, 5000] },
];

const cell = (brightness: number, color_temp: number, rgb_color?: [number, number, number]): HourCell => ({
  brightness,
  color_temp,
  ...(rgb_color ? { rgb_color } : {}),
});

function lightWith(overrides: Record<number, HourCell>): LightConfig {
  const cfg = defaultLightConfig();
  cfg.hours = cfg.hours.map((h, hour) => overrides[hour] ?? h);
  return cfg;
}

function defaultSchema(): Schema {
  return {
    id: "default",
    name: "Default",
    sun: defaultSunConfig(),
    lights: {
      // A mix of explicit cells (incl. an RGB override) and sun-following hours
      // so the timeline shows off every feature on first load.
      "light.living_room": lightWith({
        0: cell(5, 2000),
        7: cell(60, 2700),
        20: cell(45, 2200, [255, 90, 30]),
        22: cell(20, 2000, [200, 40, 120]),
      }),
      "light.bedroom": lightWith({
        22: cell(10, 2000),
        23: cell(5, 2000),
      }),
    },
  };
}

function eveningSchema(): Schema {
  const sun = defaultSunConfig();
  sun.max_color_temp = 4000;
  return {
    id: "evening",
    name: "Cosy Evening",
    sun,
    lights: {
      "light.living_room": lightWith({ 19: cell(35, 2200, [255, 120, 40]) }),
    },
  };
}

const defaultSettings = (): GlobalSettings => ({
  interval: 90,
  transition: 1,
  initial_transition: 1,
  send_split_delay: 350,
  autoreset_control: 0,
  take_over_control: true,
  sun_latitude: null,
  sun_longitude: null,
});

// --- store + WS dispatch -----------------------------------------------------

// Stand-in for coordinator.LightRuntime, so the Status section has something
// to show: one light starts manual and one is off/unavailable.
interface FakeRuntime {
  state: string;
  manual_control: boolean;
  manual_reason: ManualReason | null;
  manual_since: string | null;
}

interface Store {
  settings: GlobalSettings;
  schemas: Record<string, Schema>;
  active_schema_id: string;
  runtime: Record<string, FakeRuntime>;
  started_at: number;
}

const OFFLINE = "light.hallway";
const MANUAL = "light.kitchen";

function newRuntime(): Record<string, FakeRuntime> {
  const runtime: Record<string, FakeRuntime> = {};
  for (const light of FAKE_LIGHTS) {
    const manual = light.entity_id === MANUAL;
    runtime[light.entity_id] = {
      state: light.entity_id === OFFLINE ? "off" : "on",
      manual_control: manual,
      manual_reason: manual ? "explicit_turn_on" : null,
      manual_since: manual ? new Date(Date.now() - 8 * 60_000).toISOString() : null,
    };
  }
  return runtime;
}

function newStore(): Store {
  return {
    settings: defaultSettings(),
    schemas: { default: defaultSchema(), evening: eveningSchema() },
    active_schema_id: "default",
    runtime: newRuntime(),
    started_at: Date.now(),
  };
}

const entityIds = () => FAKE_LIGHTS.map((l) => l.entity_id);

function configPayload(store: Store): ConfigPayload {
  return {
    settings: store.settings,
    schemas: store.schemas,
    active_schema_id: store.active_schema_id,
    lights: FAKE_LIGHTS.map((l) => ({
      entity_id: l.entity_id,
      name: l.name,
      area_name: l.area_name,
      supports_rgb: l.supports_rgb,
      min_color_temp_kelvin: l.ct_range?.[0] ?? null,
      max_color_temp_kelvin: l.ct_range?.[1] ?? null,
    })),
    home_latitude: 52.3731,
    home_longitude: 4.8922,
    version: "0.0.0-dev",
  };
}

// --- status ------------------------------------------------------------------

const iso = (ms: number) => new Date(ms).toISOString();

// The harness's sun events live in fractional local-hour space; turn one back
// into a wall-clock timestamp for the status readouts.
function hourToIso(hour: number): string {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  return iso(midnight.getTime() + hour * 3600_000);
}

function statusPayload(store: Store): StatusPayload {
  const now = Date.now();
  const hour = currentHour();
  const schema = store.schemas[store.active_schema_id];
  const sun = computeSunState(schema.sun, hour);
  const targets = computeTargets(schema, hour, entityIds(), defaultLightConfig);
  // Fake a pass on the settings interval, counted from harness start.
  const period = store.settings.interval * 1000;
  const elapsed = now - store.started_at;
  const lastPass = store.started_at + Math.floor(elapsed / period) * period;

  const lights: Record<string, LightStatus> = {};
  for (const light of FAKE_LIGHTS) {
    const rt = store.runtime[light.entity_id];
    const cfg = schema.lights[light.entity_id] ?? defaultLightConfig();
    const target = targets[light.entity_id];
    const on = rt.state === "on";
    // A manual light reports something other than what we asked for — that's
    // what made it manual in the first place.
    const reported = rt.manual_control
      ? { brightness_pct: 100, color_temp_kelvin: 2200 }
      : target;
    lights[light.entity_id] = {
      state: rt.state,
      manual_control: rt.manual_control,
      manual_reason: rt.manual_reason,
      manual_since: rt.manual_since,
      auto_reset_at:
        rt.manual_control && store.settings.autoreset_control > 0
          ? iso(now + store.settings.autoreset_control * 1000)
          : null,
      target: { ...target, rgb_color: null },
      reported: {
        brightness_pct: on ? reported.brightness_pct : null,
        color_temp_kelvin: on ? reported.color_temp_kelvin : null,
        rgb_color: null,
        color_mode: on ? (light.supports_rgb ? "rgb" : "color_temp") : null,
      },
      last_applied: rt.manual_control ? null : { ...target, rgb_color: null },
      last_applied_at: rt.manual_control || !on ? null : iso(lastPass),
      last_evaluated_at: iso(lastPass),
      last_outcome: rt.manual_control
        ? "skipped_manual"
        : on
          ? "skipped_at_target"
          : "skipped_light_off",
      settling: false,
      supports: {
        brightness: true,
        color_temp: light.ct_range !== null,
        rgb: light.supports_rgb,
      },
      supported_color_modes: [
        ...(light.ct_range ? ["color_temp"] : []),
        ...(light.supports_rgb ? ["rgb"] : []),
      ],
      config: {
        min_brightness: cfg.min_brightness,
        max_brightness: cfg.max_brightness,
        min_color_temp: cfg.min_color_temp,
        max_color_temp: cfg.max_color_temp,
        limit_mode: cfg.limit_mode,
        render_mode: cfg.render_mode,
        separate_turn_on_commands: cfg.separate_turn_on_commands,
      },
    };
  }

  const custom =
    store.settings.sun_latitude !== null && store.settings.sun_longitude !== null;
  return {
    now: iso(now),
    local_hour: hour,
    sun: {
      position: sun.snap.position,
      is_day: sun.snap.isDay,
      nearest_sunrise: hourToIso(sun.snap.nearestSunrise),
      nearest_sunset: hourToIso(sun.snap.nearestSunset),
      sunrise_source: schema.sun.sunrise_time ? "fixed" : "astral",
      sunset_source: schema.sun.sunset_time ? "fixed" : "astral",
      latitude: custom ? store.settings.sun_latitude : 52.3731,
      longitude: custom ? store.settings.sun_longitude : 4.8922,
      coordinates_source: custom ? "settings" : "home",
      drive: sun.drive,
      values: {
        brightness_pct: sun.brightness,
        color_temp_kelvin: sun.colorTemp,
        rgb_color: null,
      },
    },
    lights,
    global: {
      enabled: true,
      active_schema_id: schema.id,
      active_schema_name: schema.name,
      interval: store.settings.interval,
      transition: store.settings.transition,
      initial_transition: store.settings.initial_transition,
      take_over_control: store.settings.take_over_control,
      autoreset_control: store.settings.autoreset_control,
      last_pass_at: iso(lastPass),
      next_pass_at: iso(lastPass + period),
      pass_running: false,
      light_count: FAKE_LIGHTS.length,
      manual_count: Object.values(store.runtime).filter((r) => r.manual_control)
        .length,
      unavailable_count: 0,
    },
  };
}

type Msg = Record<string, unknown>;

function handle(store: Store, msg: Msg): unknown {
  switch (msg.type) {
    case "sundial/get_config":
      return configPayload(store);

    case "sundial/update_settings":
      store.settings = { ...store.settings, ...(msg.settings as Partial<GlobalSettings>) };
      return configPayload(store);

    case "sundial/save_schema": {
      const schema = msg.schema as Schema;
      store.schemas[schema.id] = schema;
      return configPayload(store);
    }

    case "sundial/delete_schema": {
      const id = msg.schema_id as string;
      delete store.schemas[id];
      if (store.active_schema_id === id) store.active_schema_id = "default";
      return configPayload(store);
    }

    case "sundial/set_active_schema":
      store.active_schema_id = msg.schema_id as string;
      return configPayload(store);

    case "sundial/timeline":
      return computeTimeline(msg.schema as Schema, entityIds(), defaultLightConfig);

    case "sundial/preview":
      return {
        targets: computeTargets(
          msg.schema as Schema,
          msg.hour as number,
          entityIds(),
          defaultLightConfig,
        ),
      };

    case "sundial/apply":
      return configPayload(store);

    case "sundial/status":
      return statusPayload(store);

    case "sundial/set_manual_control": {
      const rt = store.runtime[msg.entity_id as string];
      if (rt) {
        rt.manual_control = msg.manual as boolean;
        rt.manual_reason = rt.manual_control ? "service" : null;
        rt.manual_since = rt.manual_control ? new Date().toISOString() : null;
      }
      return statusPayload(store);
    }

    case "sundial/export":
      return {
        settings: store.settings,
        schemas: store.schemas,
        active_schema_id: store.active_schema_id,
      };

    case "sundial/import": {
      const data = msg.data as Partial<Store>;
      store.settings = data.settings ?? store.settings;
      store.schemas = data.schemas ?? store.schemas;
      store.active_schema_id = data.active_schema_id ?? store.active_schema_id;
      return configPayload(store);
    }

    default:
      throw new Error(`mock backend: unhandled message ${String(msg.type)}`);
  }
}

// A HomeAssistant-shaped object whose WS connection talks to the in-memory
// store. A small delay mimics real latency so debounced saves behave naturally.
export function createMockHass(): HomeAssistant {
  const store = newStore();
  return {
    connection: {
      sendMessagePromise<T>(message: Msg): Promise<T> {
        return new Promise((resolve) => {
          setTimeout(() => resolve(handle(store, message) as T), 40);
        });
      },
    },
  };
}
