import { LitElement, html, css, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { SundialApi } from "./api";
import { baseStyles, tokenStyles } from "./theme";
import type { ConfigPayload, HomeAssistant } from "./types";
import { defaultSchema } from "./utils";

import "./components/schema-editor";

// Dev hot-reload: custom elements can't be re-defined, so reload the page on
// any module update. `import.meta.hot` is replaced with `undefined` in the
// production build, so this whole block is dead-code-eliminated.
if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}

// The panel owns the API + config state and the currently-edited schema. The
// schema selector lives in the header; the schema editor renders the timeline
// plus a right-hand side panel. Children report changes via bubbling
// `config-changed` / `panel-error` events.
@customElement("sundial-panel")
export class SundialPanel extends LitElement {
  static override styles = [
    tokenStyles,
    baseStyles,
    css`
      .wrap {
        width: 100%;
        padding: 18px 20px 64px;
        overflow-x: clip;
      }
      .error {
        border-color: var(--danger);
        color: var(--danger);
      }
      @media (max-width: 960px) {
        /* Pin the whole panel to the viewport on small screens: with the
           host fixed, no drag anywhere can scroll the page — the timeline
           scrolls internally and that's it. The explicit height matters:
           inside Home Assistant an ancestor with transform/contain can
           become the fixed-position containing block, and inset alone would
           then size the panel to that (possibly short) ancestor instead of
           the screen. */
        :host {
          position: fixed;
          inset: 0;
          height: 100vh;
          height: 100dvh;
          min-height: 0;
          overflow: hidden;
          overscroll-behavior: none;
        }
        /* Edge to edge: the timeline's scroll indicator should sit at the
           screen edge, so the gutter lives on the inner content instead. */
        .wrap {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
          overscroll-behavior: none;
        }
        .wrap > .card {
          flex: none;
          margin: 8px 12px 0;
        }
        sundial-schema-editor {
          flex: 1 1 auto;
          min-height: 0;
        }
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) narrow = false;

  @state() private _config?: ConfigPayload;
  @state() private _error?: string;
  @state() private _selectedId?: string;
  @state() private _preview = false;

  private _api?: SundialApi;
  private _loaded = false;
  private _mqDark?: MediaQueryList;
  private readonly _onSchemeChange = (): void => this._syncTheme();

  override connectedCallback(): void {
    super.connectedCallback();
    this._mqDark = window.matchMedia("(prefers-color-scheme: dark)");
    this._mqDark.addEventListener("change", this._onSchemeChange);
    this._syncTheme();
  }

  override disconnectedCallback(): void {
    this._mqDark?.removeEventListener("change", this._onSchemeChange);
    super.disconnectedCallback();
  }

  // Home Assistant's own dark mode wins; the OS preference is the fallback
  // for the dev harness (and for a hass that doesn't report themes yet).
  // The attribute lands on this host, where the tokens live, so every child
  // picks the palette up through custom-property inheritance.
  private _syncTheme(): void {
    const dark = this.hass?.themes?.darkMode ?? this._mqDark?.matches ?? false;
    this.toggleAttribute("dark", dark);
  }

  protected override updated(): void {
    this._syncTheme();
    if (!this.hass) return;
    if (!this._api) {
      this._api = new SundialApi(this.hass);
    } else {
      this._api.setHass(this.hass);
    }
    if (!this._loaded) {
      this._loaded = true;
      void this._run(this._api!.getConfig());
    }
  }

  private get _currentId(): string {
    const config = this._config!;
    if (this._selectedId && config.schemas[this._selectedId]) {
      return this._selectedId;
    }
    return config.active_schema_id;
  }

  private _onConfigChanged(e: CustomEvent<ConfigPayload>): void {
    this._config = e.detail;
    this._error = undefined;
  }

  private _onError(e: CustomEvent<string>): void {
    this._error = e.detail;
  }

  override render(): TemplateResult {
    if (!this._config) {
      return html`<div class="wrap">
        <div class="empty">${this._error ?? "Loading…"}</div>
      </div>`;
    }
    const config = this._config;
    const currentId = this._currentId;
    const schema = config.schemas[currentId];
    return html`<div
      class="wrap"
      @config-changed=${this._onConfigChanged}
      @panel-error=${this._onError}
      @preview-toggle=${(e: CustomEvent<boolean>) => (this._preview = e.detail)}
      @schema-select=${(e: CustomEvent<string>) => (this._selectedId = e.detail)}
      @schema-new=${() => void this._new()}
    >
      ${this._error
        ? html`<div class="card error">${this._error}</div>`
        : nothing}

      ${schema
        ? html`<sundial-schema-editor
            .schema=${schema}
            .config=${config}
            .api=${this._api!}
            .preview=${this._preview}
            @schema-delete=${this._onDelete}
          ></sundial-schema-editor>`
        : nothing}
    </div>`;
  }

  private async _new(): Promise<void> {
    const id = `schema_${Date.now().toString(36)}`;
    this._selectedId = id;
    await this._run(this._api!.saveSchema(defaultSchema(id, "New schema")));
  }

  private async _onDelete(e: CustomEvent<string>): Promise<void> {
    // Fall back to whatever is active once the refreshed config arrives.
    this._selectedId = undefined;
    await this._run(this._api!.deleteSchema(e.detail));
  }

  private async _run(promise: Promise<ConfigPayload>): Promise<void> {
    try {
      this._config = await promise;
      this._error = undefined;
    } catch (err) {
      this._error = String(err);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sundial-panel": SundialPanel;
  }
}
