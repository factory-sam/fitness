# Body tracking

> Active contributors: Sam

## Purpose

The body tracking page (`/body`) displays body composition metrics and physical measurements over time. It is a Server Component that fetches historical and latest data, then renders stat cards, a Recharts chart, and an interactive Vitruvian Man measurement overlay.

## Key source files

| File | Role |
|---|---|
| `app/src/app/(app)/body/page.tsx` | Page — Server Component, fetches body comp and measurement data |
| `app/src/components/dashboard/body-comp-chart.tsx` | Recharts line chart (weight + body fat over time) |
| `app/src/components/body/measurement-display.tsx` | Measurement table + Vitruvian Man integration |
| `app/src/components/body/vitruvian-man.tsx` | SVG figure with clickable/hoverable measurement regions |

## How it works

### Data fetching

The page calls four queries from `lib/queries.ts`:

1. `getBodyCompHistory()` — all body composition entries (weight, BF%, VO₂ max)
2. `getMeasurements()` — all measurement entries (shoulders, chest, waist, hips, arm)
3. `getLatestBodyComp()` — most recent body comp entry
4. `getLatestMeasurements()` — most recent measurements entry

The S/W ratio is derived in the page: `latestMeasurements.shoulders / latestMeasurements.waist`.

### Current stats grid

Four metric cards in a 2×2 (mobile) or 4-column (desktop) grid:

| Card | Value | Note |
|---|---|---|
| Weight | `weight_lbs` | Unit: lbs |
| Body Fat | `body_fat_pct` | Target: 12–18% |
| S/W Ratio | computed | Target: 1.57, displayed in gold accent |
| VO₂ Max | `vo2_max` | — |

### Body composition chart

`BodyCompChart` (shared with [Dashboard](./dashboard.md)) uses Recharts `LineChart` with dual Y-axes:
- Left axis: weight (lbs) — gold line
- Right axis: body fat % — blue line

Data is reversed from the query order (newest-first → oldest-first for the chart). Measurement data is joined by date to include waist and arm values. When only one data point exists, it falls back to a static metric display.

### Vitruvian Man SVG

`VitruvianMan` renders the classic figure (loaded from `/vitruvian-man.svg`) with a gold CSS filter overlay. On top of the image, an SVG layer draws dashed measurement lines at four body regions:

- **Shoulders** (y: 31%)
- **Chest** (y: 38%)
- **Waist** (y: 50%)
- **Hips** (y: 57%)

Each region has a transparent clickable button positioned over the figure. Hovering or clicking a region:
- Brightens the measurement line to white
- Enlarges the endpoint circles
- Shows a label tooltip with the measurement value (e.g. `48"`)

### Measurement table

`MeasurementDisplay` wraps the Vitruvian Man and renders a `data-table` below it with columns: Measurement, Value, Date. Five body parts are listed (shoulders, chest, arm R, waist, hips) plus a computed S/W ratio row highlighted in gold.

The table rows are interactive — hovering a row highlights the corresponding region on the Vitruvian Man, and clicking a region on the figure highlights the table row. This bidirectional highlighting uses shared `hoveredRegion` / `selectedRegion` state.

## Cross-references

- The same body comp data feeds the [Dashboard](./dashboard.md) hero stats and metrics row.
- S/W ratio is the primary training goal, referenced across [Dashboard](./dashboard.md) and [Programme](./programme.md).
- `BodyCompChart` is defined under `components/dashboard/` but rendered on both the Dashboard and this page.
