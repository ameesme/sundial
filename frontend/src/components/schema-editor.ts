import {
  LitElement,
  html,
  css,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type { SundialApi } from "../api";
import {
  checkboxField,
  minMaxField,
  rangeField,
  sectionHeading,
  selectField,
} from "../form-fields";
import {
  bulbIcon,
  checkCircleIcon,
  cogIcon,
  eyeIcon,
  pencilIcon,
  plusIcon,
  trashIcon,
} from "../icons";
import { baseStyles } from "../theme";
import type {
  ConfigPayload,
  HourCell,
  LightConfig,
  LightInfo,
  Schema,
  StatusPayload,
  SunConfig,
  TimelineData,
} from "../types";
import {
  KELVIN_MAX,
  KELVIN_MIN,
  currentHour,
  defaultLightConfig,
  hasColor,
  hexToRgb,
  kelvinGradientCss,
  rgbToHex,
} from "../utils";
import type { CellRef } from "./timeline-grid";
import "./timeline-grid";
import "./row-preview";
import "./sun-config";
import "./settings-tab";
import "./status-section";

type Selection =
  | { kind: "cell"; ref: CellRef }
  | { kind: "light"; entityId: string }
  | { kind: "sun" }
  | { kind: "settings" }
  | null;

// Matches the CSS breakpoint used across the panel's media queries.
const MOBILE_QUERY = "(max-width: 960px)";

// Edits one schema: an inline editable name, the 24-hour timeline on the left,
// and a right-hand side panel that shows the editor for whatever is selected
// (the sun, a light, or an hour cell) plus the global settings. On small
// screens the side panel is replaced by a bottom drawer (a native <dialog>)
// and the header collapses to a single sticky row of icon buttons.
@customElement("sundial-schema-editor")
export class SchemaEditor extends LitElement {
  static override styles = [
    baseStyles,
    css`
      .head {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 14px;
      }
      .name {
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--text);
        min-width: 0;
        flex: 0 1 auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .icon-btn.rename {
        width: 30px;
        height: 30px;
      }
      .icon-btn.rename svg {
        width: 16px;
        height: 16px;
      }
      .switcher {
        position: relative;
        display: inline-flex;
        align-items: center;
        color: var(--text-soft);
      }
      .switcher .chev {
        width: 18px;
        height: 18px;
        pointer-events: none;
      }
      .switcher select {
        position: absolute;
        inset: 0;
        width: 100%;
        opacity: 0;
        cursor: pointer;
      }
      .grow {
        flex: 1;
      }
      input[type="color"] {
        width: 52px;
        height: 34px;
        padding: 2px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface);
        cursor: pointer;
      }
      .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        flex: none;
        padding: 0;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        color: var(--accent-strong);
        cursor: pointer;
      }
      .icon-btn svg {
        width: 20px;
        height: 20px;
      }
      .icon-btn.active {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff8ef;
      }
      .icon-btn.danger {
        color: var(--danger);
      }
      /* Borderless: visually separate from the schema actions. */
      .icon-btn.plain {
        border-color: transparent;
        background: transparent;
      }
      .icon-btn:disabled {
        opacity: 0.45;
        cursor: default;
      }
      /* Disabled because it's already applied — state, not a dead control. */
      .icon-btn.active:disabled {
        opacity: 0.9;
      }
      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 16px;
        align-items: stretch;
      }
      /* Let both columns shrink below their content so the timeline scrolls
         internally instead of overflowing the viewport. */
      .main,
      .side {
        min-width: 0;
      }
      /* The side holds global settings flat by default; when something is
         selected it becomes a temporary editing card. */
      .side {
        position: relative;
        align-self: stretch;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .side.editing {
        background: var(--surface);
        border: 1px solid var(--accent);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: 18px;
      }
      .side h2 {
        margin: 0 0 4px;
        font-size: 1.05rem;
        font-weight: 650;
        padding-right: 28px;
      }
      /* Empty-selection state, centred across the card's full height. */
      .side-placeholder {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        color: var(--text-soft);
        text-align: center;
        font-size: 0.9rem;
      }
      .side-placeholder svg {
        width: 34px;
        height: 34px;
        opacity: 0.5;
      }
      .close {
        position: absolute;
        top: 12px;
        right: 12px;
        border: none;
        background: transparent;
        color: var(--text-soft);
        font-size: 1.1rem;
        line-height: 1;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
      }
      .close:hover {
        color: var(--accent-strong);
        background: var(--accent-soft);
      }
      .close:focus-visible {
        outline: 2px solid var(--accent);
      }

      /* "Following the sun" state of the hour-cell editor. */
      .sun-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 18px 0 4px;
        text-align: center;
        color: var(--text-soft);
        font-size: 0.9rem;
      }
      .sun-indicator .sun-emoji {
        font-size: 1.8rem;
      }
      .center-cta {
        display: flex;
        justify-content: center;
        margin-top: 14px;
      }

      sundial-row-preview {
        margin-bottom: 14px;
      }
      /* The strip provides the top spacing; the first heading after it
         shouldn't add its own. */
      sundial-row-preview + .section {
        margin-top: 0;
      }

      /* --- bottom drawer (native <dialog>, small screens only) ----------- */
      dialog.drawer {
        position: fixed;
        /* Pin to the bottom only — a top of 0 would stretch the box to the
           full viewport regardless of height: auto. */
        inset: auto 0 0 0;
        margin: 0;
        width: 100%;
        max-width: 100%;
        /* Size to the content; the body scrolls once this cap binds. */
        height: auto;
        max-height: calc(100vh - 40px);
        max-height: calc(100dvh - 40px);
        border: none;
        border-radius: 16px 16px 0 0;
        padding: 0;
        background: var(--surface);
        color: var(--text);
        box-shadow: 0 -8px 30px rgba(120, 80, 40, 0.3);
      }
      /* Class-driven transitions: the dialog opens off-screen, .shown slides
         it in; removing .shown slides it back out (and fades the backdrop)
         before _closeDrawer actually closes it. */
      dialog.drawer[open] {
        display: flex;
        flex-direction: column;
        transform: translateY(100%);
        transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1);
      }
      dialog.drawer[open].shown {
        transform: translateY(0);
      }
      dialog.drawer::backdrop {
        background: rgba(61, 44, 30, 0.4);
        opacity: 0;
        transition: opacity 240ms ease-out;
      }
      dialog.drawer[open].shown::backdrop {
        opacity: 1;
      }
      .drawer-head {
        flex: none;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 10px 10px 16px;
        border-bottom: 1px solid var(--surface-alt);
      }
      .drawer-titles {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .drawer-titles h2 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 650;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .drawer-titles .area {
        font-size: 0.75rem;
        color: var(--text-soft);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .drawer-head .close {
        position: static;
        flex: none;
        width: 44px;
        height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
      }
      .drawer-body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        overscroll-behavior: contain;
        padding: 18px 16px calc(18px + env(safe-area-inset-bottom, 0px));
      }
      /* Extra breathing room between stacked fields in the drawer. */
      .drawer-body .field,
      .drawer-body label.field {
        margin-bottom: 16px;
      }

      @media (max-width: 960px) {
        :host {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
        }
        /* Fixed-height single-row sticky bar on a soft surface. */
        .head {
          flex: none;
          position: sticky;
          top: 0;
          z-index: 20;
          background: var(--surface);
          box-shadow: var(--shadow);
          flex-wrap: nowrap;
          gap: 6px;
          /* Matches the Home Assistant app header height. */
          height: 56px;
          margin: 0 0 8px;
          padding: 0 12px;
        }
        .name {
          font-size: 1.05rem;
        }
        .layout {
          flex: 1;
          min-height: 0;
          grid-template-columns: minmax(0, 1fr);
          grid-template-rows: minmax(0, 1fr);
          gap: 0;
        }
        .main {
          min-height: 0;
        }
      }
    `,
  ];

  @property({ attribute: false }) schema!: Schema;
  @property({ attribute: false }) config!: ConfigPayload;
  @property({ attribute: false }) api!: SundialApi;
  @property({ type: Boolean }) preview = false;

  @state() private _draft!: Schema;
  @state() private _timeline?: TimelineData;
  @state() private _sel: Selection = null;
  @state() private _previewHour = currentHour();
  @state() private _isMobile = false;
  @state() private _status: StatusPayload | null = null;
  // Whether the Status section is expanded — kept on the editor so it stays
  // open while stepping between lights.
  @state() private _statusOpen = false;

  private _previewTimer?: number;
  private _saveTimer?: number;
  private _timelineTimer?: number;
  private _statusTimer?: number;
  private _mql?: MediaQueryList;
  private readonly _onMqChange = (e: MediaQueryListEvent): void => {
    this._isMobile = e.matches;
  };

  private get _active(): boolean {
    return this.schema.id === this.config.active_schema_id;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._mql = window.matchMedia(MOBILE_QUERY);
    this._isMobile = this._mql.matches;
    this._mql.addEventListener("change", this._onMqChange);
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("schema")) {
      if (this._draft?.id !== this.schema.id) {
        this._flushSave();
        this._draft = structuredClone(this.schema);
        this._sel = null;
        void this._loadTimeline();
      } else if (
        this._saveTimer === undefined &&
        JSON.stringify(this.schema) !== JSON.stringify(this._draft)
      ) {
        // Same schema id but different content, with no local edit pending:
        // the stored schema changed underneath us (e.g. a config import) —
        // adopt it rather than clobbering it with the stale draft.
        this._draft = structuredClone(this.schema);
        void this._loadTimeline();
      }
    }
    // React to the preview toggle (driven from the header or the timeline).
    if (changed.has("preview") && changed.get("preview") !== undefined) {
      if (this.preview) {
        this._sendPreview();
      } else {
        // Back to reality: real values on the lights, playhead at now.
        this._previewHour = currentHour();
        void this.api.apply();
      }
    }
  }

  override disconnectedCallback(): void {
    this._flushSave();
    window.clearTimeout(this._previewTimer);
    window.clearTimeout(this._timelineTimer);
    this._stopStatusPolling();
    this._mql?.removeEventListener("change", this._onMqChange);
    super.disconnectedCallback();
  }

  // The drawer is rendered only while something is selected on mobile; open
  // it as a modal (backdrop, Esc, focus trap for free) right after render.
  // The forced reflow between showModal and .shown makes the off-screen
  // start state stick, so the class change transitions instead of snapping.
  protected override updated(): void {
    const drawer = this.renderRoot.querySelector<HTMLDialogElement>("dialog.drawer");
    if (drawer && !drawer.open) {
      drawer.showModal();
      drawer.getBoundingClientRect();
      drawer.classList.add("shown");
    }
  }

  // --- live status ---------------------------------------------------------

  // Polled for as long as the editor is mounted: the Status section needs it
  // while a sheet is open, and the timeline's per-row on/off + auto/manual
  // tags need it all the time.
  protected override firstUpdated(): void {
    void this._loadStatus();
    this._statusTimer = window.setInterval(() => void this._loadStatus(), 2000);
  }

  private _stopStatusPolling(): void {
    if (this._statusTimer !== undefined) {
      window.clearInterval(this._statusTimer);
      this._statusTimer = undefined;
    }
  }

  private async _loadStatus(): Promise<void> {
    try {
      this._status = await this.api.status();
    } catch {
      // A dropped connection shouldn't spam; the next tick tries again.
    }
  }

  private _renderStatus(entityId: string | null): TemplateResult {
    return html`<sundial-status-section
      .status=${this._status}
      .entityId=${entityId}
      .api=${this.api}
      .open=${this._statusOpen}
      @status-toggle=${(e: CustomEvent<boolean>) =>
        (this._statusOpen = e.detail)}
      @status-changed=${(e: CustomEvent<StatusPayload>) =>
        (this._status = e.detail)}
    ></sundial-status-section>`;
  }

  // Render/preview the *draft* (unsaved) schema so edits are visible live.
  private async _loadTimeline(): Promise<void> {
    try {
      this._timeline = await this.api.timeline(this._draft);
    } catch {
      this._timeline = undefined;
    }
  }

  // Called after every edit: fast visual refresh + live preview, with a
  // slower debounce for the actual save.
  private _afterEdit(): void {
    this._scheduleSave();
    this._scheduleTimeline();
    if (this.preview) this._sendPreview();
  }

  private _scheduleTimeline(): void {
    window.clearTimeout(this._timelineTimer);
    this._timelineTimer = window.setTimeout(() => void this._loadTimeline(), 120);
  }

  // --- persistence ---------------------------------------------------------

  private _scheduleSave(): void {
    window.clearTimeout(this._saveTimer);
    this._saveTimer = window.setTimeout(() => {
      this._saveTimer = undefined;
      void this._saveAndRefresh();
    }, 400);
  }

  private _flushSave(): void {
    if (this._saveTimer !== undefined) {
      window.clearTimeout(this._saveTimer);
      this._saveTimer = undefined;
      void this._saveAndRefresh();
    }
  }

  private async _saveAndRefresh(): Promise<void> {
    try {
      const config = await this.api.saveSchema(this._draft);
      this._emit("config-changed", config);
    } catch (err) {
      this._emit("panel-error", String(err));
    }
  }

  private _lightCfg(entityId: string): LightConfig {
    const existing = this._draft.lights[entityId];
    if (existing) return existing;
    // Unconfigured light: default the colour-temperature bounds to what the
    // bulb actually supports.
    const cfg = defaultLightConfig();
    const range = this._bulbCtRange(entityId);
    if (range) {
      cfg.min_color_temp = range[0];
      cfg.max_color_temp = range[1];
    }
    return cfg;
  }

  /** The bulb's supported colour-temperature range, normalised to the
   *  editor's 50 K slider grid and bounds; null when unknown/RGB-only. */
  private _bulbCtRange(entityId: string): [number, number] | null {
    const light = this.config.lights.find((l) => l.entity_id === entityId);
    if (
      light?.min_color_temp_kelvin == null ||
      light?.max_color_temp_kelvin == null
    ) {
      return null;
    }
    const snap = (v: number) =>
      Math.min(KELVIN_MAX, Math.max(KELVIN_MIN, Math.round(v / 50) * 50));
    return [snap(light.min_color_temp_kelvin), snap(light.max_color_temp_kelvin)];
  }

  private _patchSchema(patch: Partial<Schema>): void {
    this._draft = { ...this._draft, ...patch };
    this._afterEdit();
  }

  private _patchLight(entityId: string, patch: Partial<LightConfig>): void {
    const next = { ...this._lightCfg(entityId), ...patch };
    this._draft = {
      ...this._draft,
      lights: { ...this._draft.lights, [entityId]: next },
    };
    this._afterEdit();
  }

  private _setCell(ref: CellRef, cell: HourCell): void {
    const cfg = this._lightCfg(ref.entityId);
    const hours = [...cfg.hours];
    hours[ref.hour] = cell;
    this._patchLight(ref.entityId, { hours });
  }

  // --- render --------------------------------------------------------------

  override render(): TemplateResult {
    return html`
      <div class="head">
        <div class="switcher" title="Switch schema">
          <svg class="chev" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M8 10l4-4 4 4M8 14l4 4 4-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <select
            @change=${(e: Event) =>
              this._emit("schema-select", (e.target as HTMLSelectElement).value)}
          >
            ${Object.values(this.config.schemas).map(
              (s) => html`<option
                value=${s.id}
                ?selected=${s.id === this.schema.id}
              >
                ${s.name}${s.id === this.config.active_schema_id
                  ? " (active)"
                  : ""}
              </option>`
            )}
          </select>
        </div>
        <span class="name">${this._draft.name}</span>
        <button
          class="icon-btn plain rename"
          title="Rename schema"
          @click=${this._rename}
        >
          ${pencilIcon}
        </button>
        ${this._isMobile ? nothing : this._renderSchemaActions()}
        <span class="grow"></span>
        ${this._renderActions()}
      </div>

      <div class="layout">
        <div class="main">
          <sundial-timeline-grid
            .lights=${this.config.lights}
            .timeline=${this._timeline}
            .status=${this._status}
            .selected=${this._sel?.kind === "cell" ? this._sel.ref : null}
            .selectedRow=${this._selectedRow}
            .previewHour=${this._previewHour}
            .previewActive=${this.preview}
            .scrollLocked=${this._isMobile && this._sel !== null}
            @select-cell=${(e: CustomEvent<CellRef>) => this._onSelectCell(e.detail)}
            @select-light=${(e: CustomEvent<string>) =>
              (this._sel = { kind: "light", entityId: e.detail })}
            @select-sun=${() => (this._sel = { kind: "sun" })}
            @scrub=${(e: CustomEvent<number>) => this._onScrub(e.detail)}
          ></sundial-timeline-grid>
        </div>

        ${this._isMobile ? nothing : this._renderSide()}
      </div>

      ${this._isMobile && this._sel ? this._renderDrawer() : nothing}
    `;
  }

  // A fixed set of controls in a fixed order — unavailable ones are disabled
  // rather than hidden, so nothing shifts around.
  private _renderActions(): TemplateResult {
    const deletable = this._draft.id !== "default";
    if (!this._isMobile) {
      return html`
        <button
          class="btn ${this.preview ? "" : "ghost"}"
          @click=${() => this._emit("preview-toggle", !this.preview)}
        >
          ${eyeIcon} Preview
        </button>
        <button
          class="btn ghost"
          ?disabled=${this._active}
          title=${this._active ? "This schema is active" : "Apply this schema"}
          @click=${this._setActive}
        >
          ${checkCircleIcon} ${this._active ? "Active" : "Apply"}
        </button>
        <button
          class="btn plain"
          title="Global settings"
          @click=${() => (this._sel = { kind: "settings" })}
        >
          ${cogIcon} Settings
        </button>
      `;
    }
    return html`
      <button
        class="icon-btn"
        title="New schema"
        @click=${() => this._emit("schema-new", null)}
      >
        ${plusIcon}
      </button>
      <button
        class="icon-btn danger"
        ?disabled=${!deletable}
        title=${deletable
          ? "Delete schema"
          : "The default schema cannot be deleted"}
        @click=${this._delete}
      >
        ${trashIcon}
      </button>
      <button
        class="icon-btn ${this.preview ? "active" : ""}"
        title="Preview on lights"
        @click=${() => this._emit("preview-toggle", !this.preview)}
      >
        ${eyeIcon}
      </button>
      <button
        class="icon-btn ${this._active ? "active" : ""}"
        ?disabled=${this._active}
        title=${this._active ? "This schema is active" : "Apply this schema"}
        @click=${this._setActive}
      >
        ${checkCircleIcon}
      </button>
      <button
        class="icon-btn plain"
        title="Global settings"
        @click=${() => (this._sel = { kind: "settings" })}
      >
        ${cogIcon}
      </button>
    `;
  }

  // Desktop: schema-scoped actions sit next to the title; the rest of the
  // controls stay on the right.
  private _renderSchemaActions(): TemplateResult {
    const deletable = this._draft.id !== "default";
    return html`
      <button class="btn ghost" @click=${() => this._emit("schema-new", null)}>
        ${plusIcon} New
      </button>
      <button
        class="btn danger"
        ?disabled=${!deletable}
        title=${deletable
          ? "Delete schema"
          : "The default schema cannot be deleted"}
        @click=${this._delete}
      >
        ${trashIcon} Delete
      </button>
    `;
  }

  private _renderSide(): TemplateResult {
    if (!this._sel) {
      // Nothing selected: a quiet placeholder (settings live behind the
      // gear button).
      return html`<div class="side">
        <div class="side-placeholder">
          ${bulbIcon}
          <span>Select a light to configure it</span>
        </div>
      </div>`;
    }
    const subtitle = this._contextSubtitle();
    return html`<div class="side editing">
      <button class="close" title="Close" @click=${() => (this._sel = null)}>
        ✕
      </button>
      <h2>${this._contextTitle()}</h2>
      ${subtitle ? html`<p class="subtitle">${subtitle}</p>` : nothing}
      ${this._renderContextBody()}
    </div>`;
  }

  private _renderDrawer(): TemplateResult {
    const subtitle = this._contextSubtitle();
    return html`<dialog
      class="drawer"
      @close=${() => (this._sel = null)}
      @cancel=${this._onDrawerCancel}
      @click=${this._onDrawerClick}
    >
      <div class="drawer-head">
        <div class="drawer-titles">
          <h2>${this._contextTitle()}</h2>
          ${subtitle ? html`<span class="area">${subtitle}</span>` : nothing}
        </div>
        <button class="close" title="Close" @click=${this._closeDrawer}>✕</button>
      </div>
      <div class="drawer-body">${this._renderContextBody()}</div>
    </dialog>`;
  }

  // Slide the sheet out (and fade the backdrop) before actually closing.
  private _closeDrawer = (): void => {
    const dlg = this.renderRoot.querySelector<HTMLDialogElement>("dialog.drawer");
    if (!dlg || !dlg.open || !dlg.classList.contains("shown")) return;
    const finish = (): void => {
      window.clearTimeout(fallback);
      dlg.removeEventListener("transitionend", onEnd);
      if (dlg.open) dlg.close();
    };
    const onEnd = (e: TransitionEvent): void => {
      if (e.target === dlg && e.propertyName === "transform") finish();
    };
    dlg.addEventListener("transitionend", onEnd);
    dlg.classList.remove("shown");
    // Safety net in case the transition never fires (reduced motion etc.).
    const fallback = window.setTimeout(finish, 400);
  };

  // Esc: intercept the native instant close and run the slide-out instead.
  private _onDrawerCancel = (e: Event): void => {
    e.preventDefault();
    this._closeDrawer();
  };

  // A click on the backdrop lands on the <dialog> element itself.
  private _onDrawerClick = (e: MouseEvent): void => {
    if (e.target instanceof HTMLDialogElement) this._closeDrawer();
  };

  private get _selectedRow(): string | null {
    const sel = this._sel;
    if (sel?.kind === "sun") return "sun";
    if (sel?.kind === "light") return sel.entityId;
    if (sel?.kind === "cell") return sel.ref.entityId;
    return null;
  }

  private _lightInfo(entityId: string): LightInfo | undefined {
    return this.config.lights.find((l) => l.entity_id === entityId);
  }

  private _lightName(entityId: string): string {
    return this._lightInfo(entityId)?.name ?? entityId;
  }

  private _contextTitle(): string {
    const sel = this._sel;
    if (sel?.kind === "sun") return "☀️ Sun";
    if (sel?.kind === "light") return this._lightName(sel.entityId);
    if (sel?.kind === "cell") {
      const hour = String(sel.ref.hour).padStart(2, "0");
      return `${this._lightName(sel.ref.entityId)} · ${hour}:00`;
    }
    return "Global settings";
  }

  /** The room (area) of the selected light, for the header subtitle. */
  private _contextSubtitle(): string | null {
    const sel = this._sel;
    const entityId =
      sel?.kind === "light"
        ? sel.entityId
        : sel?.kind === "cell"
          ? sel.ref.entityId
          : null;
    if (!entityId) return null;
    return (
      this.config.lights.find((l) => l.entity_id === entityId)?.area_name ??
      null
    );
  }

  private _renderContextBody(): TemplateResult {
    const sel = this._sel;
    if (sel?.kind === "sun") {
      return html`
        ${this._renderRowPreview(this._timeline?.sun)}
        <sundial-sun-config
          .sun=${this._draft.sun}
          @sun-changed=${(e: CustomEvent<SunConfig>) =>
            this._patchSchema({ sun: e.detail })}
        ></sundial-sun-config>
        ${this._renderStatus(null)}
      `;
    }
    if (sel?.kind === "light") {
      return html`
        ${this._renderRowPreview(this._timeline?.lights[sel.entityId], sel.entityId)}
        ${this._renderLightEditor(sel.entityId)} ${this._renderStatus(sel.entityId)}
      `;
    }
    // No status on an hour cell: it describes the light as a whole, which is
    // the light sheet's job, not this one hour's.
    if (sel?.kind === "cell") return this._renderCellEditor(sel.ref);
    return html`<sundial-settings-tab
      .config=${this.config}
      .api=${this.api}
    ></sundial-settings-tab>`;
  }

  // The edited row's 24 cells, mirrored live above the editor.
  private _renderRowPreview(
    cells: { brightness: number; color_temp: number }[] | undefined,
    entityId?: string
  ): TemplateResult | typeof nothing {
    if (!cells?.length) return nothing;
    // No entityId means the sun's row, which always has colour.
    const colorless = entityId !== undefined && !hasColor(this._lightInfo(entityId));
    return html`<sundial-row-preview
      .cells=${cells}
      ?colorless=${colorless}
    ></sundial-row-preview>`;
  }

  private _renderCellEditor(ref: CellRef): TemplateResult {
    const light = this.config.lights.find((l) => l.entity_id === ref.entityId);
    const explicit = this._lightCfg(ref.entityId).hours[ref.hour];
    const effective = this._timeline?.lights[ref.entityId]?.[ref.hour];
    const brightness = explicit?.brightness ?? effective?.brightness ?? 50;
    const colorTemp = explicit?.color_temp ?? effective?.color_temp ?? 3000;
    const rgb = explicit?.rgb_color ?? null;
    const setCell = (patch: Partial<NonNullable<HourCell>>) =>
      this._setCell(ref, {
        brightness,
        color_temp: colorTemp,
        rgb_color: rgb,
        ...patch,
      });
    if (!explicit) {
      // Following the sun: just say so — the value controls appear only
      // once the user explicitly overrides this hour.
      return html`
        <div class="sun-indicator">
          <span class="sun-emoji">☀️</span>
          Following the sun
        </div>
        <div class="center-cta">
          <button class="btn" @click=${() => setCell({})}>Override</button>
        </div>
      `;
    }
    return html`
      ${rangeField("Brightness", brightness, 0, 100, 1, "%", (v) =>
        setCell({ brightness: v })
      )}
      ${brightness <= 0
        ? html`<p class="warn">
            At 0% this light turns off at this hour, and Sundial won't turn it
            back on automatically.
          </p>`
        : nothing}
      ${hasColor(light)
        ? rangeField(
            "Color temp",
            colorTemp,
            KELVIN_MIN,
            KELVIN_MAX,
            50,
            "K",
            (v) => setCell({ color_temp: v }),
            kelvinGradientCss(KELVIN_MIN, KELVIN_MAX)
          )
        : nothing}
      ${light?.supports_rgb
        ? html`<label class="toggle">
              <input
                type="checkbox"
                .checked=${rgb !== null}
                @change=${(e: Event) =>
                  setCell({
                    rgb_color: (e.target as HTMLInputElement).checked
                      ? rgb ?? [255, 255, 255]
                      : null,
                  })}
              />
              RGB colour (overrides temp)
            </label>
            ${rgb !== null
              ? html`<input
                  type="color"
                  .value=${rgbToHex(rgb)}
                  @input=${(e: Event) =>
                    setCell({
                      rgb_color: hexToRgb((e.target as HTMLInputElement).value),
                    })}
                />`
              : nothing}`
        : nothing}
      <div class="center-cta">
        <button class="btn ghost" @click=${() => this._setCell(ref, null)}>
          Use sun
        </button>
      </div>
    `;
  }

  /** A one-tap reset when the configured range deviates from the bulb's. */
  private _renderBulbRangeReset(
    entityId: string,
    cfg: LightConfig
  ): TemplateResult | typeof nothing {
    const range = this._bulbCtRange(entityId);
    if (
      !range ||
      (cfg.min_color_temp === range[0] && cfg.max_color_temp === range[1])
    ) {
      return nothing;
    }
    return html`<div class="actions">
      <button
        class="btn ghost small"
        title="Set the bounds to ${range[0]}–${range[1]} K"
        @click=${() =>
          this._patchLight(entityId, {
            min_color_temp: range[0],
            max_color_temp: range[1],
          })}
      >
        Use reported range
      </button>
    </div>`;
  }

  /** Colour-rendering choice, only for lights supporting both CT and RGB. */
  private _renderRenderModeSelect(
    entityId: string,
    cfg: LightConfig
  ): TemplateResult | typeof nothing {
    const light = this.config.lights.find((l) => l.entity_id === entityId);
    if (!light?.supports_rgb || light.min_color_temp_kelvin == null) {
      return nothing;
    }
    return selectField(
      "Rendering",
      cfg.render_mode,
      [
        { value: "auto", label: "Color temperature" },
        { value: "rgb", label: "RGB" },
      ],
      (v) => this._patchLight(entityId, { render_mode: v as "auto" | "rgb" })
    );
  }

  private _renderLightEditor(entityId: string): TemplateResult {
    const cfg = this._lightCfg(entityId);
    return html`
      ${sectionHeading("Brightness")}
      ${minMaxField(
        "Range",
        "%",
        cfg.min_brightness,
        cfg.max_brightness,
        0,
        100,
        1,
        (lo, hi) =>
          this._patchLight(entityId, { min_brightness: lo, max_brightness: hi })
      )}
      ${cfg.min_brightness <= 0
        ? html`<p class="warn">
            At 0% this light can turn off during the day, and Sundial won't
            turn it back on automatically.
          </p>`
        : nothing}
      ${hasColor(this._lightInfo(entityId))
        ? html`${sectionHeading("Color temperature")}
          ${minMaxField(
            "Range",
            " K",
            cfg.min_color_temp,
            cfg.max_color_temp,
            KELVIN_MIN,
            KELVIN_MAX,
            50,
            (lo, hi) =>
              this._patchLight(entityId, {
                min_color_temp: lo,
                max_color_temp: hi,
              }),
            kelvinGradientCss(KELVIN_MIN, KELVIN_MAX)
          )}
          ${this._renderBulbRangeReset(entityId, cfg)}`
        : nothing}
      ${sectionHeading(
        "Behaviour",
        "Cap keeps the light tracking the sun, clamped into its range; Scale " +
          "sweeps the whole range across the day. Sending brightness and " +
          "colour separately helps lights that drop combined commands " +
          "(e.g. IKEA)."
      )}
      ${selectField(
        "Limits",
        cfg.limit_mode,
        [
          { value: "cap", label: "Cap (clamp to range)" },
          { value: "scale", label: "Scale (map onto range)" },
        ],
        (v) =>
          this._patchLight(entityId, { limit_mode: v as "cap" | "scale" })
      )}
      ${this._renderRenderModeSelect(entityId, cfg)}
      <div class="actions">
        ${checkboxField(
          "Send brightness and colour separately",
          cfg.separate_turn_on_commands,
          (v) => this._patchLight(entityId, { separate_turn_on_commands: v })
        )}
      </div>
    `;
  }

  // --- actions -------------------------------------------------------------

  private _setActive = (): void => {
    void this.api
      .setActiveSchema(this._draft.id)
      .then((config) => this._emit("config-changed", config))
      .catch((err) => this._emit("panel-error", String(err)));
  };

  private _rename = (): void => {
    const name = window.prompt("Schema name", this._draft.name);
    if (name === null) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed === this._draft.name) return;
    this._patchSchema({ name: trimmed });
  };

  private _delete = (): void => {
    const name = this._draft.name || this._draft.id;
    if (!window.confirm(`Delete schema "${name}"? This cannot be undone.`)) {
      return;
    }
    this._emit("schema-delete", this._draft.id);
  };

  private _onScrub(hour: number): void {
    this._previewHour = hour;
    if (this.preview) this._sendPreview();
  }

  // Selecting an hour cell opens its editor; the playhead only follows the
  // selection while preview mode is on.
  private _onSelectCell(ref: CellRef): void {
    this._sel = { kind: "cell", ref };
    if (this.preview) {
      this._previewHour = ref.hour;
      this._sendPreview();
    }
  }

  private _sendPreview(): void {
    window.clearTimeout(this._previewTimer);
    this._previewTimer = window.setTimeout(() => {
      void this.api.preview(this._draft, this._previewHour, true);
    }, 150);
  }

  private _emit(type: string, detail: unknown): void {
    this.dispatchEvent(
      new CustomEvent(type, { detail, bubbles: true, composed: true })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sundial-schema-editor": SchemaEditor;
  }
}
