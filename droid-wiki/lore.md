# Lore

Everything below happened on a single day: **April 11, 2026**. The entire application was built in roughly 8 hours with heavy AI pair programming.

---

## Era 1 — Foundation (morning)

The repository started as a fitness coach agent backed by SQLite. The first commits set up a 12-week training programme, an exercise library, aesthetic targets, baseline body measurements, and priority muscle groups.

The Next.js web app landed next (`8d40949`), bringing a dashboard, workout logger, body composition tracker, programme viewer, and exercise library — all wired to the SQLite database.

**Key commits:**
- `41152ad` Initial setup: fitness coach agent with 12-week programme
- `bd7997e` Evidence-based improvements (warm-up protocol, auto-regulation, tempo, volume audit)
- `1df0319` Aesthetic targets, baseline measurements, priority muscle groups
- `8d40949` Next.js web app with dashboard, workout logger, body comp, programme viewer, exercise library

---

## Era 2 — The Vitruvian Rebrand (midday)

The project was renamed from **FIT** to **Vitruvian**. The original hand-drawn stick-figure SVG was replaced with a public-domain Vitruvian Man illustration from OpenClipart, colorized gold via CSS filters.

Measurement overlays on the figure went through four iterations to get anatomical positioning right: initial placement, anatomy-aligned corrections, contrasting white lines with hover tooltips, and a final cleanup pass removing the bicep overlay.

**Key commits:**
- `cdc6357` Rebrand to Vitruvian, replace stick figure with detailed Vitruvian Man SVG
- `e22a075` Replace hand-drawn SVG with real Vitruvian Man (public domain), gold-colorized via CSS
- `e2a0d34` Fix measurement overlay positions to align with anatomy
- `16d3ae8` Contrasting white lines, hover tooltips, bidirectional table↔figure highlighting
- `3b79c7a` Shoulders/chest lowered, arm changed to horizontal mid-bicep line
- `efa1e8f` Remove bicep measurement overlay

---

## Era 3 — Feature expansion (afternoon)

Supplement tracking arrived as a substantial feature: 2 database tables, 6 API routes, and 3 UI sections (daily checklist, streaks, compliance heatmap with workout reminders). Dosage was later split into separate amount and units fields.

The dashboard was redesigned with a strength-to-weight ratio hero arc, today's actions panel, and an asymmetric grid layout. A type scale system based on the Major Third ratio (1.25) replaced all arbitrary font sizes.

**Key commits:**
- `311a5a6` Supplement tracking: daily checklist, streaks, compliance heatmap, workout reminders
- `ded13c8` Split dosage into separate amount (numeric) and units fields
- `4f92d8f` Dashboard redesign: S/W ratio hero arc, today actions, asymmetric grid
- `26272ce` Type scale system (Major Third ratio), replace arbitrary font sizes

---

## Era 4 — Hardening and infrastructure (evening)

UI hardening added confirmation dialogs, error handling, loading states, and overflow protection. Manual time entry was added for timer-based exercises like dead hangs.

The database was migrated from SQLite to Supabase Postgres. Authentication was added with row-level security policies on every table. `BEFORE INSERT` triggers auto-populate `user_id`.

Testing and tooling closed out the day: Vitest for unit tests, Prettier for formatting, husky pre-commit hooks, plus knip (dead code), jscpd (copy-paste detection), and ESLint rules for complexity, naming, file size, and technical debt.

**Key commits:**
- `b2cd83f` Confirmation dialogs, error handling, loading states, overflow protection
- `0349496` Manual time entry for timer-based exercises (dead hang, etc.)
- `c038d7a` Migrate to Supabase, add auth, UI polish pass
- `d12b04b` Vitest test suite, Prettier formatter, pre-commit hooks
- `24bbabf` Code quality tooling: knip, jscpd, ESLint complexity/naming/size/debt rules
