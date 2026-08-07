import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { cellStyles } from "../theme";
import type { RgbColor } from "../types";
import { cellColor } from "../utils";

export interface PreviewCell {
  brightness: number;
  color_temp: number;
  rgb_color?: RgbColor | null;
  explicit?: boolean;
}

// A non-interactive 24-hour strip mirroring a timeline row, rendered above
// the sun/light editors as a live preview of the edits.
@customElement("sundial-row-preview")
export class RowPreview extends LitElement {
  static override styles = [
    cellStyles,
    css`
      :host {
        display: block;
      }
      .cells {
        height: 42px;
        overflow: hidden;
      }
    `,
  ];

  @property({ attribute: false }) cells: PreviewCell[] = [];
  /** Brightness-only light: colour would imply a warmth curve it can't do. */
  @property({ type: Boolean }) colorless = false;

  override render(): TemplateResult {
    return html`<div class="cells">
      ${this.cells.map(
        (cell) => html`<div class="cell ${cell.explicit ? "explicit" : ""}">
          <div
            class="fill"
            style="height:${cell.brightness}%;background:${cellColor(
              cell,
              this.colorless
            )}"
          ></div>
        </div>`
      )}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sundial-row-preview": RowPreview;
  }
}
