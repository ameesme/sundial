import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type { SundialApi } from "../api";
import { baseStyles } from "../theme";
import type {
  LightOutcome,
  LightStatus,
  ManualReason,
  StatusPayload,
  StatusValues,
} from "../types";
import { formatDuration, kelvinToCss, rgbToHex } from "../utils";

const MANUAL_REASONS: Record<ManualReason, string> = {
  explicit_turn_on: "a turn_on with explicit values",
  diverged: "the light drifted past the override thresholds",
  turned_on_while_scheduled_off: "turned on while the schedule said off",
  service: "the set_manual_control service or this panel",
};

const OUTCOMES: Record<LightOutcome, string> = {
  applied: "applied",
  turned_off: "turned off (scheduled 0%)",
  skipped_disabled: "skipped — adaptation disabled",
  skipped_manual: "skipped — manual control",
  skipped_no_state: "skipped — entity not found",
  skipped_at_target: "skipped — already at target",
  skipped_light_off: "skipped — light is off",
};

// Relative wall-clock time ("12s ago", "in 4 min") from an ISO timestamp.
function relative(iso: string | null, now: number): string {
  if (!iso) return "—";
  const delta = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(delta);
  const amount = abs < 60 ? `${abs}s` : formatDuration(abs);
  if (abs < 5) return "just now";
  return delta < 0 ? `${amount} ago` : `in ${amount}`;
}

function clockTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "62% · 3400 K" with a colour chip, or "—" when we have nothing.
function values(v: StatusValues | null): TemplateResult | string {
  if (!v) return "—";
  const parts: string[] = [];
  if (v.brightness_pct !== null) parts.push(`${v.brightness_pct}%`);
  if (v.color_temp_kelvin !== null) parts.push(`${v.color_temp_kelvin} K`);
  if (v.rgb_color) parts.push(`rgb(${v.rgb_color.join(", ")})`);
  if (!parts.length) return "—";
  const swatch = v.rgb_color
    ? rgbToHex(v.rgb_color)
    : v.color_temp_kelvin !== null
      ? kelvinToCss(v.color_temp_kelvin)
      : null;
  return html`${swatch
    ? html`<i class="chip" style="background:${swatch}"></i>`
    : nothing}${parts.join(" · ")}`;
}

// Live diagnostics for one fixture (or the sun) at the bottom of the context
// sheet. Read-only apart from the "Return to automatic" escape hatch; the
// container polls and feeds it a fresh `status`.
@customElement("sundial-status-section")
export class StatusSection extends LitElement {
  static override styles = [
    baseStyles,
    css`
      /* The <details> carries .section's uppercase heading styling; only the
         summary should keep it, so undo it for the body (same trick as the
         details.section p rule in baseStyles). */
      .rows,
      .actions {
        font-weight: 400;
        text-transform: none;
        letter-spacing: normal;
      }
      /* Label left, value right — same rhythm as .field-head, but repeated
         for a whole list of read-only rows. */
      .rows {
        display: grid;
        gap: 6px;
        margin-top: 10px;
      }
      .row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        font-size: 0.82rem;
      }
      .row > span {
        color: var(--text-soft);
        flex: none;
      }
      .row > b {
        color: var(--accent-strong);
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        text-align: right;
        overflow-wrap: anywhere;
      }
      .badge {
        display: inline-block;
        padding: 1px 8px;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--accent-strong);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .badge.manual {
        background: var(--danger);
        color: var(--surface);
      }
      /* Small colour chip in front of a value. */
      .chip {
        display: inline-block;
        width: 9px;
        height: 9px;
        margin-right: 6px;
        border: 1px solid var(--border);
        border-radius: 50%;
        vertical-align: baseline;
      }
      .sub {
        margin: 8px 0 0;
        font-size: 0.78rem;
      }
    `,
  ];

  @property({ attribute: false }) status: StatusPayload | null = null;
  /** The fixture to describe; null renders the sun + system status. */
  @property({ attribute: false }) entityId: string | null = null;
  @property({ attribute: false }) api!: SundialApi;
  @property({ type: Boolean }) open = false;

  @state() private _busy = false;

  override render(): TemplateResult {
    return html`<details
      class="section"
      ?open=${this.open}
      @toggle=${this._onToggle}
    >
      <summary>Status</summary>
      ${this.status
        ? this.entityId
          ? this._renderLight(this.entityId)
          : this._renderSun()
        : html`<p class="muted sub">Loading…</p>`}
    </details>`;
  }

  private _onToggle = (e: Event): void => {
    const open = (e.target as HTMLDetailsElement).open;
    if (open === this.open) return;
    this.open = open;
    this.dispatchEvent(
      new CustomEvent("status-toggle", {
        detail: open,
        bubbles: true,
        composed: true,
      })
    );
  };

  private _row(label: string, value: TemplateResult | string): TemplateResult {
    return html`<div class="row"><span>${label}</span><b>${value}</b></div>`;
  }

  private _renderLight(entityId: string): TemplateResult {
    const status = this.status as StatusPayload;
    const light: LightStatus | undefined = status.lights[entityId];
    if (!light) {
      return html`<p class="muted sub">
        This light isn't controlled by Sundial (add it in the integration's
        options).
      </p>`;
    }
    const now = new Date(status.now).getTime();
    const modes = light.supported_color_modes.join(", ") || "not reported";
    const capabilities = [
      light.supports.brightness ? "brightness" : null,
      light.supports.color_temp ? "color temp" : null,
      light.supports.rgb ? "rgb" : null,
    ].filter(Boolean);
    return html`
      <div class="rows">
        ${this._row(
          "Control",
          html`<span class="badge ${light.manual_control ? "manual" : ""}"
            >${light.manual_control ? "Manual" : "Automatic"}</span
          >`
        )}
        ${light.manual_control
          ? html`
              ${this._row(
                "Because of",
                light.manual_reason
                  ? MANUAL_REASONS[light.manual_reason]
                  : "unknown"
              )}
              ${this._row("Manual since", relative(light.manual_since, now))}
              ${light.auto_reset_at
                ? this._row(
                    "Back to automatic",
                    relative(light.auto_reset_at, now)
                  )
                : nothing}
            `
          : nothing}
        ${this._row("Entity state", light.state ?? "not found")}
        ${this._row("Target now", values(light.target))}
        ${this._row("Light reports", values(light.reported))}
        ${this._row("Color mode", light.reported.color_mode ?? "—")}
        ${this._row("Last applied", values(light.last_applied))}
        ${this._row(
          "Applied at",
          light.last_applied_at
            ? `${clockTime(light.last_applied_at)} · ${relative(light.last_applied_at, now)}`
            : "—"
        )}
        ${this._row(
          "Last evaluated",
          light.last_evaluated_at ? relative(light.last_evaluated_at, now) : "—"
        )}
        ${this._row(
          "Outcome",
          light.last_outcome ? OUTCOMES[light.last_outcome] : "—"
        )}
        ${light.settling
          ? this._row("Settling", "yes — override detection paused")
          : nothing}
        ${this._row("Can control", capabilities.join(", ") || "nothing")}
        ${this._row("Color modes", modes)}
        ${this._row(
          "Clamp range",
          `${light.config.min_brightness}–${light.config.max_brightness}% · ` +
            `${light.config.min_color_temp}–${light.config.max_color_temp} K`
        )}
        ${this._row(
          "Modes",
          `${light.config.limit_mode} · render ${light.config.render_mode}` +
            (light.config.separate_turn_on_commands ? " · split commands" : "")
        )}
        ${this._row("Last pass", relative(status.global.last_pass_at, now))}
        ${this._row("Next pass", relative(status.global.next_pass_at, now))}
      </div>
      ${light.manual_control
        ? html`<div class="actions">
            <button
              class="btn ghost small"
              ?disabled=${this._busy}
              @click=${() => this._returnToAutomatic(entityId)}
            >
              Return to automatic
            </button>
          </div>`
        : nothing}
    `;
  }

  private _renderSun(): TemplateResult {
    const status = this.status as StatusPayload;
    const { sun } = status;
    const g = status.global;
    const now = new Date(status.now).getTime();
    const hour = Math.floor(status.local_hour);
    const minute = Math.floor((status.local_hour - hour) * 60);
    const coords =
      sun.latitude !== null && sun.longitude !== null
        ? `${sun.latitude.toFixed(4)}, ${sun.longitude.toFixed(4)} (${sun.coordinates_source})`
        : "not set";
    return html`
      <div class="rows">
        ${this._row(
          "Adaptation",
          html`<span class="badge ${g.enabled ? "" : "manual"}"
            >${g.enabled ? "Enabled" : "Disabled"}</span
          >`
        )}
        ${this._row("Active schema", g.active_schema_name)}
        ${this._row(
          "Timeline position",
          `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} local`
        )}
        ${this._row("Sun", sun.is_day ? "day" : "night")}
        ${this._row("Position", sun.position.toFixed(3))}
        ${this._row(
          "Nearest sunrise",
          `${clockTime(sun.nearest_sunrise)} · ${sun.sunrise_source}`
        )}
        ${this._row(
          "Nearest sunset",
          `${clockTime(sun.nearest_sunset)} · ${sun.sunset_source}`
        )}
        ${this._row("Coordinates", coords)}
        ${this._row(
          "Drive signal",
          `brightness ${sun.drive.brightness.toFixed(3)} · warmth ${sun.drive.warmth.toFixed(3)}`
        )}
        ${this._row("Sun values now", values(sun.values))}
        ${this._row(
          "Last pass",
          `${relative(g.last_pass_at, now)}${g.pass_running ? " · running" : ""}`
        )}
        ${this._row("Next pass", relative(g.next_pass_at, now))}
        ${this._row(
          "Timing",
          `every ${formatDuration(g.interval)} · ${g.transition}s transition`
        )}
        ${this._row(
          "Take over control",
          g.take_over_control
            ? g.autoreset_control > 0
              ? `on · auto-reset after ${formatDuration(g.autoreset_control)}`
              : "on · no auto-reset"
            : "off"
        )}
        ${this._row(
          "Lights",
          `${g.light_count} controlled · ${g.manual_count} manual` +
            (g.unavailable_count ? ` · ${g.unavailable_count} unavailable` : "")
        )}
      </div>
    `;
  }

  private async _returnToAutomatic(entityId: string): Promise<void> {
    this._busy = true;
    try {
      const status = await this.api.setManualControl(entityId, false);
      this.dispatchEvent(
        new CustomEvent("status-changed", {
          detail: status,
          bubbles: true,
          composed: true,
        })
      );
    } finally {
      this._busy = false;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sundial-status-section": StatusSection;
  }
}
