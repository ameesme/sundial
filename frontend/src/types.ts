// Shapes mirroring the Python dataclasses (models.py) and WebSocket payloads
// (panel.py). A schema owns the sun config and one timeline row per light.

export interface SunConfig {
  min_brightness: number;
  max_brightness: number;
  min_color_temp: number;
  max_color_temp: number;
  ramp_dark: number;
  ramp_light: number;
  sunrise_time: string | null;
  sunset_time: string | null;
  sunrise_offset: number;
  sunset_offset: number;
  min_sunrise_time: string | null;
  max_sunrise_time: string | null;
  min_sunset_time: string | null;
  max_sunset_time: string | null;
}

// An hour cell is either an explicit override or null (follow the sun).
// rgb_color (when set) overrides color_temp for RGB-capable lights.
export type RgbColor = [number, number, number];
export type HourCell = {
  brightness: number;
  color_temp: number;
  rgb_color?: RgbColor | null;
} | null;

export interface LightConfig {
  min_brightness: number;
  max_brightness: number;
  min_color_temp: number;
  max_color_temp: number;
  separate_turn_on_commands: boolean;
  // "cap" clamps the sun's value into the range; "scale" maps the sun's 0..1
  // signal onto the range (used on sun-following hours).
  limit_mode: "cap" | "scale";
  // "auto" sends native colour temperature when supported; "rgb" renders the
  // temperature as an RGB colour (for lights that support both).
  render_mode: "auto" | "rgb";
  hours: HourCell[]; // length 24
}

export interface Schema {
  id: string;
  name: string;
  sun: SunConfig;
  lights: Record<string, LightConfig>;
}

export interface GlobalSettings {
  interval: number;
  transition: number;
  initial_transition: number;
  send_split_delay: number;
  autoreset_control: number;
  take_over_control: boolean;
  // null = use Home Assistant's configured location for sun calculation.
  sun_latitude: number | null;
  sun_longitude: number | null;
}

export interface LightInfo {
  entity_id: string;
  name: string;
  area_name: string | null;
  supports_rgb: boolean;
  supports_color_temp: boolean;
  // The bulb's supported colour-temperature range (null for RGB-only lights
  // or while unavailable); used as the default per-light bounds.
  min_color_temp_kelvin: number | null;
  max_color_temp_kelvin: number | null;
}

export interface ConfigPayload {
  settings: GlobalSettings;
  schemas: Record<string, Schema>;
  active_schema_id: string;
  lights: LightInfo[];
  // The home's configured coordinates (the blank-field fallback).
  home_latitude: number;
  home_longitude: number;
  // Integration manifest version, for the settings footer.
  version: string;
}

// Computed per-hour values for rendering the timeline (from sundial/timeline).
export interface TimelineCell {
  brightness: number;
  color_temp: number;
  rgb_color: RgbColor | null;
  explicit: boolean;
}

export interface TimelineData {
  sun: { brightness: number; color_temp: number }[]; // length 24
  lights: Record<string, TimelineCell[]>; // entity_id -> length 24
}

// --- live diagnostics (from sundial/status) ---------------------------------

// Brightness/colour triple, used for the target, what the light reports back,
// and what we last wrote.
export interface StatusValues {
  brightness_pct: number | null;
  color_temp_kelvin: number | null;
  rgb_color: RgbColor | null;
}

export interface ReportedValues extends StatusValues {
  color_mode: string | null;
}

// Why a light is under manual control (coordinator.py constants).
export type ManualReason =
  | "explicit_turn_on"
  | "diverged"
  | "turned_on_while_scheduled_off"
  | "service";

// What the last adaptation pass did with a light (coordinator.py constants).
export type LightOutcome =
  | "applied"
  | "turned_off"
  | "skipped_disabled"
  | "skipped_manual"
  | "skipped_no_state"
  | "skipped_at_target"
  | "skipped_light_off";

export interface LightStatus {
  state: string | null;
  manual_control: boolean;
  manual_reason: ManualReason | null;
  manual_since: string | null;
  auto_reset_at: string | null;
  target: StatusValues | null;
  reported: ReportedValues;
  last_applied: StatusValues | null;
  last_applied_at: string | null;
  last_evaluated_at: string | null;
  last_outcome: LightOutcome | null;
  settling: boolean;
  supports: { brightness: boolean; color_temp: boolean; rgb: boolean };
  supported_color_modes: string[];
  config: {
    min_brightness: number;
    max_brightness: number;
    min_color_temp: number;
    max_color_temp: number;
    limit_mode: string;
    render_mode: string;
    separate_turn_on_commands: boolean;
  };
}

export interface SunStatus {
  position: number; // -1 solar midnight .. 1 solar noon
  is_day: boolean;
  nearest_sunrise: string | null;
  nearest_sunset: string | null;
  sunrise_source: "astral" | "fixed";
  sunset_source: "astral" | "fixed";
  latitude: number | null;
  longitude: number | null;
  coordinates_source: "settings" | "home";
  drive: { brightness: number; warmth: number };
  values: StatusValues;
}

export interface GlobalStatus {
  enabled: boolean;
  active_schema_id: string;
  active_schema_name: string;
  interval: number;
  transition: number;
  initial_transition: number;
  take_over_control: boolean;
  autoreset_control: number;
  last_pass_at: string | null;
  next_pass_at: string | null;
  pass_running: boolean;
  light_count: number;
  manual_count: number;
  unavailable_count: number;
}

export interface StatusPayload {
  now: string;
  local_hour: number;
  sun: SunStatus;
  lights: Record<string, LightStatus>;
  global: GlobalStatus;
}

// Minimal slice of the Home Assistant object the panel relies on.
export interface HomeAssistant {
  connection: {
    sendMessagePromise<T>(message: Record<string, unknown>): Promise<T>;
  };
}
