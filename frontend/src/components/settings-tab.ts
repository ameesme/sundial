import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import { errorMessage, type SundialApi } from "../api";
import {
  checkboxField,
  coordField,
  durationField,
  numberField,
  rangeField,
  sectionHeading,
} from "../form-fields";
import { baseStyles } from "../theme";
import type { ConfigPayload, GlobalSettings } from "../types";

// Receives the current config + api, and reports results upward via bubbling
// events so the panel owns state.
@customElement("sundial-settings-tab")
export class SettingsTab extends LitElement {
  static override styles = [
    baseStyles,
    css`
      .about {
        margin: 28px 0 2px;
        text-align: center;
        font-size: 0.72rem;
        color: var(--text-soft);
        opacity: 0.8;
      }
    `,
  ];

  @property({ attribute: false }) config!: ConfigPayload;
  @property({ attribute: false }) api!: SundialApi;

  @query("input[type=file]") private _fileInput!: HTMLInputElement;

  /** Run an API mutation and bubble the resulting config (or error) up. */
  private async run(promise: Promise<ConfigPayload>): Promise<void> {
    try {
      const config = await promise;
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: config,
          bubbles: true,
          composed: true,
        })
      );
    } catch (err) {
      this._error(err);
    }
  }

  private _error(err: unknown): void {
    this.dispatchEvent(
      new CustomEvent("panel-error", {
        detail: errorMessage(err),
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _export(): Promise<void> {
    try {
      const data = await this.api.exportConfig();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sundial-config.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      this._error(err);
    }
  }

  private async _onImportFile(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    try {
      const data: unknown = JSON.parse(await file.text());
      await this.run(this.api.importConfig(data));
    } catch (err) {
      this._error(err);
    }
  }

  override render(): TemplateResult {
    const s = this.config.settings;
    const save = (patch: Partial<GlobalSettings>) =>
      void this.run(this.api.updateSettings(patch));

    return html`
      ${sectionHeading("Adaptation")}
      <div class="grid">
        ${rangeField("Interval", s.interval, 10, 300, 5, " s", (v) =>
          save({ interval: v })
        )}
        ${rangeField("Transition", s.transition, 0, 300, 1, " s", (v) =>
          save({ transition: v })
        )}
        ${rangeField(
          "Turn-on transition",
          s.initial_transition,
          0,
          300,
          1,
          " s",
          (v) => save({ initial_transition: v })
        )}
      </div>
      ${sectionHeading(
        "Manual control",
        "When a light is changed by hand, Sundial pauses for it. " +
          "Auto-reset hands control back after this many seconds (0 = never)."
      )}
      <div class="actions">
        ${checkboxField(
          "Pause when controlled manually",
          s.take_over_control,
          (v) => save({ take_over_control: v })
        )}
      </div>
      <div class="grid">
        ${durationField(
          "Auto-reset override",
          s.autoreset_control,
          0,
          3600,
          (v) => save({ autoreset_control: v }),
          "Never"
        )}
      </div>
      ${sectionHeading(
        "Light commands",
        "Gap between the two turn-on calls for lights that get brightness " +
          "and colour sent separately (e.g. IKEA)."
      )}
      <div class="grid">
        ${numberField(
          "Split-command delay (ms)",
          s.send_split_delay,
          (v) => save({ send_split_delay: v })
        )}
      </div>
      ${sectionHeading(
        "Location",
        "Coordinates used to calculate sunrise and sunset. Leave blank to " +
          "use your home's location."
      )}
      <div class="pair">
        ${coordField(
          "Latitude",
          s.sun_latitude,
          this.config.home_latitude.toFixed(4),
          (v) => save({ sun_latitude: v })
        )}
        ${coordField(
          "Longitude",
          s.sun_longitude,
          this.config.home_longitude.toFixed(4),
          (v) => save({ sun_longitude: v })
        )}
      </div>
      ${sectionHeading(
        "Backup",
        "Download the full configuration — every schema plus these settings " +
          "— as a JSON file, or restore a previous export."
      )}
      <div class="pair">
        <button class="btn ghost" @click=${() => void this._export()}>
          Export
        </button>
        <button class="btn ghost" @click=${() => this._fileInput.click()}>
          Import
        </button>
      </div>
      <input
        type="file"
        accept=".json,application/json"
        hidden
        @change=${this._onImportFile}
      />
      <p class="about">Sundial · v${this.config.version}</p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sundial-settings-tab": SettingsTab;
  }
}
