# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Home Assistant **custom integration** (`sundial`) for adaptive lighting,
plus a Lit/TypeScript **web-ui panel**. It adapts brightness and color
temperature of lights across the day. The config entry holds *only the list of
controlled light entity-ids*; everything else is configured in the panel and
persisted via Home Assistant's `Store` (`<config>/.storage/sundial`).

## Commands

```bash
# Python (run from repo root) — no Home Assistant install needed for these
ruff check .                              # lint
python -m pytest                          # all tests
python -m pytest tests/test_engine.py     # one file
python -m pytest tests/test_engine.py -k tanh   # one test / pattern

# Frontend (run from frontend/)
npm install
npm run build    # tsc --noEmit && vite build -> commits to ../custom_components/sundial/frontend/dist
npm run dev      # standalone dev harness on :5173 (no Home Assistant; see below)
npm run watch    # rebuild the bundle on every change
```

CI (`.github/workflows/ci.yml`) runs `ruff check .`, `python -m pytest`,
`npm run build`, and **fails if the committed bundle differs from a fresh
build**. Always run `npm run build` and commit the regenerated
`custom_components/sundial/frontend/dist/sundial-panel.js` whenever you touch
`frontend/src`.

## Architecture

### The Python/HA boundary (keep it intact)

The codebase is deliberately split so the lighting math is pure and unit-testable
without Home Assistant:

- `engine.py` and `models.py` have **no Home Assistant imports**. They are plain
  math + JSON-serialisable dataclasses. `tests/conftest.py` exposes `sundial`
  as a bare package when HA isn't installed, so tests import only
  `engine`/`models`/`const`. Do not add HA imports to these two modules.
- `coordinator.py` is the only HA-heavy module: it feeds HA data (states, astral
  sun events, timezone) into the engine and acts on the result (service calls,
  scheduling, override tracking). Keep HA-specific logic here.

Design value stated by the maintainer: **keep the Python comprehensible; no
premature optimization.** Prefer small, focused modules over cleverness.

### The data model (schemas contain lights)

```
StoreData
  settings: GlobalSettings        # instance-wide (interval, transition, autoreset, split delay…)
  active_schema_id: str           # exactly one schema drives the lights at a time
  schemas: {id: Schema}
    Schema
      sun: SunConfig              # the configurable "sun" = the timeline's top row
      lights: {entity_id: LightConfig}
        LightConfig
          min/max brightness + color temp   # per-light clamp range
          hours: 24 cells                    # each None (follow sun) or
                                             #   {brightness, color_temp, rgb_color?}
```

### The engine pipeline

`input source -> DriveSignal (normalized 0..1) -> values (brightness%, kelvin)`.

The sun produces a normalized `DriveSignal` (the same shape a real sensor could
later produce). For each light the engine builds **24 hourly anchors** — an
anchor is the light's explicit cell where set, otherwise the sun's value clamped
into the light's min/max range. The live value at any (fractional) hour is a
**cyclic interpolation** across those anchors. `rgb_color` on a cell overrides
color temperature for RGB-capable lights; `kelvin_to_rgb` lets RGB-only lights
follow the sun's warmth curve.

### Override / manual-control detection

Two cooperating mechanisms (don't remove one assuming the other covers it):

- `interceptor.py` listens on the event bus for explicit `light.turn_on` calls
  (brightness/color keys) and flags those lights manual. Bare turn-ons fall
  through to the coordinator's state listener, which adapts them.
- The coordinator tags its own service calls with a tracked `Context`; both the
  interceptor and override detection **ignore our own context**
  (`is_our_context`) — this is critical, an earlier bug where adaptation flagged
  itself made adaptation one-shot.
- Divergence beyond thresholds in `const.py` (`BRIGHTNESS_CHANGE`,
  `COLOR_TEMP_CHANGE`, `RGB_REDMEAN_CHANGE`) counts as a manual override.
  Optional `autoreset_control` hands control back after N seconds.

IKEA-style lights can send brightness and color as **separate** `turn_on` calls
(`separate_turn_on_commands`), with a guaranteed gap of at least
`MIN_SPLIT_DELAY` (0.35s) because some lights drop a too-soon second command.

### Web-ui

- `panel.py` registers the sidebar panel (serving the built bundle with a
  content-hash cache token) and a set of `sundial/*` **WebSocket commands**.
  The bundle is single-file (lit inlined) so HA needs no Node toolchain.
- `frontend/src/`: `sundial-panel.ts` is the thin shell; `api.ts` wraps the WS
  connection; the timeline editor lives in `components/`
  (`schema-editor.ts`, `timeline-grid.ts`, `sun-config.ts`, `settings-tab.ts`).
- **WS contract** flows three ways and must stay consistent: the commands in
  `panel.py`, the calls in `frontend/src/api.ts`, and the mock in
  `frontend/dev/mock-backend.ts`.

### Dev harness (`frontend/dev/`)

`npm run dev` serves `frontend/index.html` + `frontend/dev/`, mounting the real
`<sundial-panel>` against an in-memory mock backend with fake lights — no Home
Assistant. `frontend/dev/engine.ts` is a JavaScript **port of `engine.py`**; if
you change the lighting math in Python, mirror it there so the harness matches
production. The harness is dev-only: `vite build` bundles only `src/`, so
`dev/` and `index.html` never reach the shipped asset (it is in the tsconfig
`include` for type-checking but excluded from the lib build).

## Conventions

- Ruff: line-length 88, `force-sort-within-sections` isort, `known-first-party
  = sundial`. `frontend/` is excluded from ruff.
- Releasing: bump `version` in `manifest.json`, then tag `vX.Y.Z`. The release
  workflow asserts the tag matches the manifest version and that the committed
  bundle is current.
- Betas: use a `vX.Y.Zb1` tag (matching manifest version). Anything that isn't a
  plain `vX.Y.Z` is published with GitHub's **pre-release** flag, which is what
  HACS filters on — testers opt in per repository with HACS's "Pre-release"
  switch entity. Marking it is the workflow's job; the version string alone
  doesn't hide anything.
- Distributed via HACS as a custom repository; `single_config_entry` is true.
  HACS installs `custom_components/sundial/` from the tag tree — the
  `sundial.zip` release asset is for manual installs only (it would need
  `zip_release` + `filename` in `hacs.json` for HACS to use it).
