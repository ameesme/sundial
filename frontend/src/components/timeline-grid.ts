import { LitElement, html, css, nothing, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { cogFilledIcon } from "../icons";
import { baseStyles, cellStyles } from "../theme";
import type {
  LightInfo,
  StatusPayload,
  TimelineCell,
  TimelineData,
} from "../types";
import { HOURS, cellColor, currentHour, hasColor, hourLabel } from "../utils";

export interface CellRef {
  entityId: string;
  hour: number;
}

type GridCell = TimelineCell | { brightness: number; color_temp: number };

// The 24-hour grid: an hour header, a distinct sun row, and one clickable
// row per light, grouped by area. Desktop shows an in-grid scrub row and a
// label column; small screens stack each name above its full-width cells,
// scroll internally, and show a scrub bar only while previewing. Emits
// `select-cell`, `select-light`, `select-sun`, and `scrub`.
@customElement("sundial-timeline-grid")
export class TimelineGrid extends LitElement {
  static override styles = [
    baseStyles,
    cellStyles,
    css`
      :host {
        display: block;
        height: 100%;
      }
      .card {
        box-sizing: border-box;
        height: 100%;
        margin-bottom: 0;
        display: flex;
        flex-direction: column;
      }
      .scroll {
        flex: 1;
        min-height: 0;
        max-width: 100%;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding-bottom: 6px;
      }
      .rows {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .gridrow {
        display: grid;
        /* Wide enough that the state tags don't eat into the light name. */
        grid-template-columns: 230px 1fr;
        gap: 1px;
        align-items: center;
      }
      /* Air between charts of the same room (desktop stacks them tightly). */
      @media (min-width: 961px) {
        .lightrow + .lightrow {
          margin-top: 6px;
        }
      }
      /* Thin light playhead at the currently shown time. */
      .cells .playhead {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--accent);
        opacity: 0.55;
        z-index: 4;
        pointer-events: none;
      }
      .hours {
        display: grid;
        grid-template-columns: repeat(24, 1fr);
        gap: 1px;
      }
      /* Above the rows' playheads (z-index 4) so scrolling content always
         passes underneath the hour numbers. */
      .headrow {
        position: sticky;
        top: 0;
        z-index: 6;
        background: var(--surface);
      }
      .label {
        z-index: 3;
        align-self: stretch;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--text);
        white-space: nowrap;
        overflow: hidden;
        padding-right: 4px;
      }
      .label .text-col {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .label .lname {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .label svg {
        width: 12px;
        height: 12px;
        flex: none;
        opacity: 0.4;
      }
      /* Live state beside the name — the same pill the Status sheet uses for
         Automatic/Manual. line-height 1.5 with 1px vertical padding keeps it
         inside the row's existing line box, so it can't change a row's
         height. */
      .tag {
        flex: none;
        /* No vertical padding: the pill has to stay shorter than the name's
           own line box, or it grows the row (it is its own line on mobile). */
        padding: 0 8px;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--accent-strong);
        font-size: 0.62rem;
        font-weight: 700;
        line-height: 1.5;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .tag.manual {
        background: var(--danger);
        color: var(--surface);
      }
      /* Off/unavailable: the light isn't being driven, so keep it quiet. */
      .tag.idle {
        background: transparent;
        color: var(--text-soft);
        box-shadow: inset 0 0 0 1px var(--border);
      }
      .label.clickable:hover svg {
        opacity: 0.9;
      }
      .label.clickable {
        cursor: pointer;
      }
      .sunrow .label {
        color: var(--accent-strong);
      }
      .gridrow.rowselected .label {
        color: var(--accent-strong);
      }
      /* Matches the form section headings (.section in baseStyles). */
      .label.section-label {
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--text);
        padding-top: 8px;
      }
      .hourhead {
        font-size: 0.7rem;
        text-align: center;
        color: var(--text-soft);
      }
      .hourhead.now {
        color: var(--accent-strong);
        font-weight: 700;
      }
      .scrubrow .track {
        grid-column: 2 / -1;
        display: flex;
        align-items: center;
      }
      .scrubrow input[type="range"] {
        width: 100%;
      }
      .clock {
        font-variant-numeric: tabular-nums;
        font-weight: 700;
        color: var(--accent-strong);
      }
      .now-btn {
        background: none;
        border: none;
        padding: 0;
        margin-left: auto;
        font-size: 0.7rem;
        color: var(--text-soft);
        cursor: pointer;
        text-transform: lowercase;
      }
      .now-btn:hover {
        color: var(--accent-strong);
      }
      .cell {
        height: 42px;
        cursor: pointer;
      }
      @media (max-width: 960px) {
        .cell {
          height: 52px;
        }
      }
      .cell.readonly {
        cursor: default;
      }
      .cell.selected {
        border: 2px var(--accent-strong) solid;
      }
      .legend {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        padding-top: 10px;
        font-size: 0.75rem;
        color: var(--text-soft);
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 2px;
      }
      .legend-dot.overridden {
        background: var(--border);
      }
      .legend-dot.selected {
        border: 2px var(--accent-strong) solid;
      }
      /* Preview-only scrub bar above the grid on small screens. */
      .scrub-bar {
        display: none;
      }
      @media (max-width: 960px) {
        :host {
          min-height: 0;
        }
        /* Edge to edge: the grid fits the width (no horizontal scrolling). */
        .card {
          padding: 0;
        }
        .scrub-bar {
          display: block;
          padding: 10px 14px 6px;
          flex: none;
        }
        .scrubrow {
          display: none;
        }
        .scroll {
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          /* The content scrolls clear of the iOS home indicator. */
          padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
        }
        /* The scrollview is edge to edge (indicator at the screen edge);
           the content re-applies the gutter. */
        .rows {
          padding: 0 12px;
        }
        .scroll.locked {
          overflow: hidden;
          touch-action: none;
        }
        /* Stacked rows: the name spans the full width and the 24 cells sit
           underneath, edge to edge. minmax(0, 1fr) so the cells can shrink
           below the hour digits' width. */
        .gridrow {
          grid-template-columns: minmax(0, 1fr);
          margin-bottom: 6px;
        }
        .cells,
        .hours {
          grid-template-columns: repeat(24, minmax(0, 1fr));
        }
        .gridrow .label {
          font-size: 0.8rem;
          padding: 4px 0 2px;
          margin-bottom: 3px;
        }
        .gridrow .label.section-label {
          padding-top: 10px;
        }
        /* Keep the room heading tight to the first light under it. */
        .section-row {
          margin-bottom: 0;
        }
        .section-row .label {
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .headrow .label {
          display: none;
        }
        .headrow {
          margin-bottom: 0;
          padding-bottom: 4px;
          background: var(--bg);
        }
        .hourhead {
          font-size: 0.55rem;
          overflow: hidden;
        }
        /* Scrolls with the content as its last item. */
        .legend {
          padding: 6px 12px 0;
        }
      }
    `,
  ];

  @property({ attribute: false }) lights: LightInfo[] = [];
  @property({ attribute: false }) timeline?: TimelineData;
  @property({ attribute: false }) status: StatusPayload | null = null;
  @property({ attribute: false }) selected: CellRef | null = null;
  // "sun" or an entity_id — the row to highlight as selected.
  @property({ attribute: false }) selectedRow: string | null = null;
  @property({ type: Number }) previewHour = 12;
  // True while a modal drawer is open: freezes the internal scroll so touch
  // scrolling can't chain through to the timeline behind the sheet.
  @property({ type: Boolean }) scrollLocked = false;
  // True while preview mode is on: shows the mobile scrub bar.
  @property({ type: Boolean }) previewActive = false;

  override render(): TemplateResult {
    if (!this.timeline) {
      return html`<div class="card"><div class="empty">Loading timeline…</div></div>`;
    }
    const nowHour = Math.floor(this.previewHour) % 24;
    return html`<div class="card">
      ${this.previewActive ? this._scrubBar() : nothing}
      <div class="scroll ${this.scrollLocked ? "locked" : ""}">
        <div class="rows">
          ${this._scrubRow()}
          ${this._headerRow(nowHour)}
          ${this._sunRow()}
          ${this._lightGroups().map(
            (group) => html`
              <div class="gridrow section-row">
                <div class="label section-label">${group.area}</div>
              </div>
              ${group.lights.map((light) => this._lightRow(light))}
            `
          )}
        </div>
        <div class="legend">
          <span class="legend-item"><span class="legend-dot overridden"></span>Overridden</span>
          <span class="legend-item"><span class="legend-dot selected"></span>Selected</span>
        </div>
      </div>
    </div>`;
  }

  private get _clockLabel(): string {
    const h = Math.floor(this.previewHour);
    const m = Math.round((this.previewHour - h) * 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // Both scrubbers work in minutes with 5-minute steps.
  private get _minutes(): number {
    return Math.round((this.previewHour * 60) / 5) * 5;
  }

  private _slider(): TemplateResult {
    return html`<input
      type="range"
      min="0"
      max="1435"
      step="5"
      .value=${String(this._minutes)}
      @input=${(e: Event) =>
        this._emit("scrub", Number((e.target as HTMLInputElement).value) / 60)}
    />`;
  }

  // Desktop: part of the grid, so the track lines up with the hour columns.
  private _scrubRow(): TemplateResult {
    return html`<div class="gridrow scrubrow">
      <div class="label">
        <span class="clock">${this._clockLabel}</span>
        <button class="now-btn" @click=${this._jumpToNow} title="Jump to now">now</button>
      </div>
      <div class="track">${this._slider()}</div>
    </div>`;
  }

  // Mobile-only, shown while previewing: a full-width custom slider in the
  // min–max component's styling — whole hours, no readout (the playhead in
  // the charts shows the position).
  private _scrubBar(): TemplateResult {
    const minutes = this._minutes;
    return html`<div class="scrub-bar">
      <div class="minmax">
        <div class="minmax-track">
          <div
            class="minmax-fill"
            style="left:0;width:${(minutes / 1435) * 100}%"
          ></div>
        </div>
        <input
          type="range"
          min="0"
          max="1435"
          step="5"
          .value=${String(minutes)}
          @input=${(e: Event) =>
            this._emit("scrub", Number((e.target as HTMLInputElement).value) / 60)}
        />
      </div>
    </div>`;
  }

  private _jumpToNow(): void {
    this._emit("scrub", currentHour());
  }

  private _headerRow(nowHour: number): TemplateResult {
    return html`<div class="gridrow headrow">
      <div class="label"></div>
      <div class="hours">
        ${HOURS.map(
          (h) => html`<div class="hourhead ${h === nowHour ? "now" : ""}">
            ${hourLabel(h)}
          </div>`
        )}
      </div>
    </div>`;
  }

  /** Row-level playhead line at the currently shown time. */
  private _playhead(): TemplateResult {
    const pos = ((this.previewHour % 24) / 24) * 100;
    return html`<div class="playhead" style="left:${pos}%"></div>`;
  }

  private _sunRow(): TemplateResult {
    const row = this.timeline!.sun;
    const selected = this.selectedRow === "sun" ? "rowselected" : "";
    return html`<div class="gridrow sunrow ${selected}">
      <div
        class="label clickable"
        title="Edit the sun"
        @click=${() => this._emit("select-sun", null)}
      >
        <span class="text-col">
          <span class="lname">☀️ Sun</span>
        </span>
        ${cogFilledIcon}
      </div>
      <div class="cells">
        ${HOURS.map((h) => this._cell(row[h], "readonly", false, false))}
        ${this._playhead()}
      </div>
    </div>`;
  }

  // Consecutive lights that share an area render under one area heading (the
  // backend sorts by area already); unassigned lights group under "Other".
  private _lightGroups(): { area: string; lights: LightInfo[] }[] {
    const groups: { area: string; lights: LightInfo[] }[] = [];
    for (const light of this.lights) {
      const area = light.area_name ?? "Other";
      const last = groups[groups.length - 1];
      if (last && last.area === area) last.lights.push(light);
      else groups.push({ area, lights: [light] });
    }
    if (groups.length === 1 && groups[0].area === "Other") {
      groups[0].area = "Lights";
    }
    return groups;
  }

  private _lightRow(light: LightInfo): TemplateResult {
    const row = this.timeline!.lights[light.entity_id] ?? [];
    const selected = this.selectedRow === light.entity_id ? "rowselected" : "";
    return html`<div class="gridrow lightrow ${selected}">
      <div
        class="label clickable"
        title="Edit light range"
        @click=${() => this._emit("select-light", light.entity_id)}
      >
        <span class="text-col">
          <span class="lname">${light.name}</span>
        </span>
        ${this._statusTag(light.entity_id)} ${cogFilledIcon}
      </div>
      <div class="cells">
        ${HOURS.map((h) => {
          const cell = row[h];
          const selected =
            this.selected?.entityId === light.entity_id &&
            this.selected?.hour === h;
          return this._cell(
            cell,
            "",
            Boolean(cell?.explicit),
            selected,
            () => this._emit("select-cell", { entityId: light.entity_id, hour: h }),
            !hasColor(light)
          );
        })}
        ${this._playhead()}
      </div>
    </div>`;
  }

  // One pill beside the name. A light that's off or unavailable isn't being
  // driven, so its control mode says nothing useful — show the power state
  // instead. An on light is the reverse: "on" is evident from the row, the
  // mode isn't. Absent while the first status poll is in flight.
  private _statusTag(entityId: string): TemplateResult | typeof nothing {
    const light = this.status?.lights[entityId];
    if (!light) return nothing;
    if (light.state !== "on") {
      const off = light.state === "off";
      return html`<span class="tag idle">${off ? "Off" : "Unavailable"}</span>`;
    }
    return light.manual_control
      ? html`<span class="tag manual">Manual</span>`
      : html`<span class="tag">Auto</span>`;
  }

  private _cell(
    cell: GridCell | undefined,
    extra: string,
    explicit: boolean,
    selected: boolean,
    onClick?: () => void,
    // Brightness-only light: paint every hour the same, so the row doesn't
    // imply a warmth curve the bulb can't produce.
    colorless = false
  ): TemplateResult {
    const brightness = cell ? cell.brightness : 0;
    const color = cell ? cellColor(cell, colorless) : "transparent";
    const classes = [
      "cell",
      extra,
      explicit ? "explicit" : "",
      selected ? "selected" : "",
    ].join(" ");
    return html`<div
      class=${classes}
      @click=${onClick}
      title=${cell ? `${cell.brightness}% · ${cell.color_temp} K` : ""}
    >
      <div class="fill" style="height:${brightness}%;background:${color}"></div>
    </div>`;
  }

  private _emit(type: string, detail: unknown): void {
    this.dispatchEvent(
      new CustomEvent(type, { detail, bubbles: true, composed: true })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sundial-timeline-grid": TimelineGrid;
  }
}
