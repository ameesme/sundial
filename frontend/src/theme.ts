import { css } from "lit";

// Design tokens live on the root panel's :host. CSS custom properties inherit
// across shadow-DOM boundaries, so child components pick them up automatically.
export const tokenStyles = css`
  :host {
    --bg: #fbf3e9;
    --surface: #fffaf2;
    --surface-alt: #f9f0e4;
    --border: #dec4a1;
    --text: #3d2c1e;
    --text-soft: #836a52;
    --accent: #c8743a;
    --accent-strong: #a8521f;
    /* Between --accent and --accent-soft: bright enough to read as a fill,
       light enough to sit alongside the Kelvin-tinted timeline cells. */
    --accent-light: #eda874;
    --accent-soft: #f0dcc3;
    --danger: #9c3b2e;
    /* Text drawn on top of an --accent fill. */
    --on-accent: #fff8ef;
    --radius: 12px;
    --shadow: 0 2px 10px rgba(120, 80, 40, 0.12);
    color-scheme: light;

    background: var(--bg);
    color: var(--text);
    /* Home Assistant's own typography (Roboto), themable via its token. */
    font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
  }

  /* Dark theme — the same warm palette rotated, not a neutral grey one, so
     the panel still reads as Sundial. Set by <sundial-panel> from Home
     Assistant's own dark mode, falling back to the OS preference.
     --accent-strong inverts its relationship to --accent: it is the emphasis
     colour for text, so on a dark ground it has to be the lighter of the two.
     --accent-soft likewise flips from a pale tint to a dark one, since its
     job is to be a quiet background behind accent text. */
  :host([dark]) {
    --bg: #17120e;
    --surface: #211a15;
    --surface-alt: #2a211a;
    --border: #45362a;
    --text: #f3e8db;
    --text-soft: #ab947e;
    --accent: #d9834a;
    --accent-strong: #f0a86c;
    --accent-light: #eda874;
    --accent-soft: #3a2b20;
    --danger: #e2705a;
    --on-accent: #1b1410;
    --shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
    color-scheme: dark;
  }
`;

// Reusable element/class rules. Each component includes this so the shared
// classes (.card, .btn, fields, …) apply inside its own shadow root.
export const baseStyles = css`
  * {
    box-sizing: border-box;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 18px;
    margin-bottom: 16px;
  }

  .grow {
    flex: 1;
    min-width: 0;
  }

  .muted {
    color: var(--text-soft);
    font-size: 0.85rem;
  }

  /* Sub-heading shown directly under an editor's title (e.g. a light's area). */
  .subtitle {
    margin: -6px 0 10px;
    color: var(--text-soft);
    font-size: 0.82rem;
  }

  /* Inline caution note inside an editor. */
  .warn {
    margin: 10px 0 0;
    padding: 8px 10px;
    font-size: 0.8rem;
    line-height: 1.35;
    color: var(--danger);
    background: var(--accent-soft);
    border-left: 3px solid var(--danger);
    border-radius: 6px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-soft);
  }

  /* iOS-style single-line field: label left, control right. */
  label.field.inline {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  label.field.inline select {
    width: auto;
    flex: 0 1 auto;
  }

  /* Small uppercase section heading; as a <details> it reveals its info text.
     Darker than the field labels so the hierarchy reads: tight to its fields,
     generous space above. */
  .section {
    margin: 28px 0 6px;
    color: var(--text);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .section:first-child {
    margin-top: 0;
  }
  details.section summary {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    list-style: none;
  }
  details.section summary::-webkit-details-marker {
    display: none;
  }
  details.section summary svg {
    width: 14px;
    height: 14px;
    flex: none;
    opacity: 0.6;
  }
  details.section[open] summary svg {
    opacity: 1;
    color: var(--accent-strong);
  }
  details.section p {
    margin: 8px 0 0;
    font-weight: 400;
    text-transform: none;
    letter-spacing: normal;
    line-height: 1.4;
  }

  /* Two-part values (e.g. sunrise + sunset) on one row. minmax(0, 1fr) so
     wide intrinsic inputs (type=time) can't stretch their column. */
  .pair {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .pair + .pair {
    margin-top: 14px;
  }
  .pair > button.btn {
    width: 100%;
  }

  /* Indication strip above a slider (e.g. the Kelvin spectrum). */
  .temp-gradient {
    height: 8px;
    border-radius: 4px;
    border: 1px solid var(--border);
  }

  /* Parsed value shown underneath duration sliders. */
  .duration-preview {
    margin-top: -4px;
    text-align: right;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--accent-strong);
    font-variant-numeric: tabular-nums;
  }

  /* Dual-thumb min–max slider: two overlapped native ranges, thumbs only. */
  .minmax {
    position: relative;
    height: 24px;
  }
  .minmax-track {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 4px;
    transform: translateY(-50%);
    border-radius: 2px;
    background: var(--accent-soft);
  }
  .minmax-fill {
    position: absolute;
    top: 0;
    bottom: 0;
    border-radius: 2px;
    background: var(--accent);
  }
  .minmax input[type="range"] {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 24px;
    margin: 0;
    background: transparent;
    -webkit-appearance: none;
    appearance: none;
    pointer-events: none;
  }
  .minmax input[type="range"]::-webkit-slider-runnable-track {
    background: transparent;
    border: none;
  }
  .minmax input[type="range"]::-moz-range-track {
    background: transparent;
    border: none;
  }
  .minmax input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    pointer-events: auto;
    width: 18px;
    height: 18px;
    /* 18px + 2×2px border = 22px outer on a 24px-high input. */
    margin-top: 1px;
    border-radius: 50%;
    background: var(--accent);
    border: 2px solid var(--surface);
    box-shadow: 0 1px 3px rgba(120, 80, 40, 0.4);
    cursor: pointer;
  }
  .minmax input[type="range"]::-moz-range-thumb {
    pointer-events: auto;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    border: 2px solid var(--surface);
    cursor: pointer;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 14px;
  }

  @media (max-width: 960px) {
    /* More breathing room in the drawer forms. */
    .grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
    }
    .section {
      margin: 34px 0 8px;
    }
    /* Flatten cards on mobile so they don't add a second horizontal padding
       inside the panel's own padding. */
    .card {
      padding-left: 0;
      padding-right: 0;
      border: none;
      border-radius: 0;
      box-shadow: none;
      background: transparent;
    }
  }

  input[type="text"],
  input[type="number"],
  input[type="time"],
  select {
    font: inherit;
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 10px;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  input:focus,
  select:focus {
    outline: 2px solid var(--accent);
    border-color: var(--accent);
  }

  input[type="range"] {
    width: 100%;
    accent-color: var(--accent);
    padding: 0;
    border: none;
    background: transparent;
  }

  .field-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }

  .field-head b {
    color: var(--accent-strong);
    font-variant-numeric: tabular-nums;
  }

  /* iOS-style row: label on the left, switch pinned to the right edge. */
  .toggle {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 10px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-soft);
    cursor: pointer;
  }

  /* Custom switch in the panel's palette instead of the system checkbox. */
  .toggle input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    flex: none;
    width: 40px;
    height: 24px;
    margin: 0;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--accent-soft);
    cursor: pointer;
    transition: background 150ms ease, border-color 150ms ease;
  }
  .toggle input[type="checkbox"]::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--surface);
    box-shadow: 0 1px 3px rgba(120, 80, 40, 0.4);
    transition: transform 150ms ease;
  }
  .toggle input[type="checkbox"]:checked {
    background: var(--accent);
    border-color: var(--accent);
  }
  .toggle input[type="checkbox"]:checked::before {
    transform: translateX(16px);
  }
  .toggle input[type="checkbox"]:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  button.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    border-radius: 8px;
    padding: 8px 14px;
    border: 1px solid var(--accent);
    background: var(--accent);
    color: var(--on-accent);
  }

  button.btn svg {
    width: 16px;
    height: 16px;
    flex: none;
  }

  button.btn.ghost {
    background: transparent;
    color: var(--accent-strong);
  }

  /* Danger differs by content colour only — the border stays like its
     neighbours' so the button doesn't shout while idle. */
  button.btn.danger {
    background: transparent;
    color: var(--danger);
  }

  /* Compact variant for secondary corrective actions. */
  button.btn.small {
    padding: 4px 10px;
    font-size: 0.78rem;
  }

  /* Borderless variant for controls that aren't schema actions (settings). */
  button.btn.plain {
    border-color: transparent;
    background: transparent;
    color: var(--accent-strong);
    padding-left: 10px;
    padding-right: 10px;
  }

  button.btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 12px;
  }

  .actions:not(:last-child) {
    margin-bottom: 14px;
  }

  .empty {
    text-align: center;
    color: var(--text-soft);
    padding: 28px;
  }
`;

// The 24-cell brightness chart, shared by the timeline rows and the row
// preview strip: dim reference lines at 100% and the baseline, an override
// marker, and a fill that paints above both lines so 1px values stay visible.
// Cell height is left to the host — the two differ.
export const cellStyles = css`
  .cells {
    position: relative;
    display: grid;
    grid-template-columns: repeat(24, minmax(0, 1fr));
    gap: 1px;
  }
  .cells::before,
  .cells::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--border);
    opacity: 0.5;
    z-index: 2;
    pointer-events: none;
  }
  .cells::before {
    top: 0;
  }
  .cells::after {
    bottom: 0;
  }
  .cell {
    position: relative;
    overflow: hidden;
  }
  .cell.explicit {
    background: var(--border);
  }
  .cell .fill {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
  }
`;
