// Thin wrapper over the Home Assistant WebSocket connection.

import type {
  ConfigPayload,
  GlobalSettings,
  HomeAssistant,
  Schema,
  StatusPayload,
  TimelineData,
} from "./types";

interface PreviewResult {
  targets: Record<
    string,
    { brightness_pct: number | null; color_temp_kelvin: number | null }
  >;
}

export class SundialApi {
  constructor(private hass: HomeAssistant) {}

  setHass(hass: HomeAssistant): void {
    this.hass = hass;
  }

  getConfig(): Promise<ConfigPayload> {
    return this.send("sundial/get_config");
  }

  updateSettings(settings: Partial<GlobalSettings>): Promise<ConfigPayload> {
    return this.send("sundial/update_settings", { settings });
  }

  saveSchema(schema: Schema): Promise<ConfigPayload> {
    return this.send("sundial/save_schema", { schema });
  }

  deleteSchema(schemaId: string): Promise<ConfigPayload> {
    return this.send("sundial/delete_schema", { schema_id: schemaId });
  }

  setActiveSchema(schemaId: string): Promise<ConfigPayload> {
    return this.send("sundial/set_active_schema", { schema_id: schemaId });
  }

  // Pass the (possibly unsaved) draft schema so the timeline/preview reflect
  // edits live, without persisting on every change.
  timeline(schema: Schema): Promise<TimelineData> {
    return this.send("sundial/timeline", { schema });
  }

  preview(schema: Schema, hour: number, apply: boolean): Promise<PreviewResult> {
    return this.send("sundial/preview", { schema, hour, apply });
  }

  apply(entityId?: string): Promise<ConfigPayload> {
    return this.send("sundial/apply", entityId ? { entity_id: entityId } : {});
  }

  // Live diagnostics for the Status section; polled while a sheet is open.
  status(): Promise<StatusPayload> {
    return this.send("sundial/status");
  }

  // Hand a light back to the schedule (or take it away) from the Status
  // section. Resolves with the refreshed status.
  setManualControl(entityId: string, manual: boolean): Promise<StatusPayload> {
    return this.send("sundial/set_manual_control", {
      entity_id: entityId,
      manual,
    });
  }

  // Full-configuration backup: the raw store document (all schemas + settings).
  exportConfig(): Promise<unknown> {
    return this.send("sundial/export");
  }

  importConfig(data: unknown): Promise<ConfigPayload> {
    return this.send("sundial/import", { data: data as Record<string, unknown> });
  }

  private send<T>(type: string, payload: Record<string, unknown> = {}): Promise<T> {
    return this.hass.connection.sendMessagePromise<T>({ type, ...payload });
  }
}
