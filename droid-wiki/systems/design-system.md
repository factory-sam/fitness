# Design system

Active contributors: Sam

Vitruvian uses a dark theme with gold accent, built on Tailwind CSS 4 with custom `@theme` tokens defined in `globals.css`. The aesthetic is terminal-inspired — monospace data, box-drawing borders, and a muted palette with gold reserved for interactive elements.

## Color tokens

Defined in the `@theme` block of `globals.css`:

### Surfaces

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#0a0a0a` | Page background |
| `bg-card` | `#111111` | Card surfaces |
| `bg-elevated` | `#1a1a1a` | Elevated surfaces, hover states |
| `bg-input` | `#0f0f0f` | Form inputs |

### Borders

| Token | Hex | Usage |
|---|---|---|
| `border` | `#2a2a2a` | Default borders |
| `border-subtle` | `#1e1e1e` | Inner shadow borders (TUI effect) |

### Gold accent

| Token | Hex | Usage |
|---|---|---|
| `gold` | `#c9a84c` | Primary accent — interactive elements, active states |
| `gold-dim` | `#8b7335` | Table header borders, hover borders |
| `gold-bright` | `#e8c84a` | Hover state for gold elements |
| `gold-muted` | `#5a4d2a` | Active nav background, subtle gold tint |

### Text

| Token | Hex | Usage |
|---|---|---|
| `text` | `#e0ddd5` | Primary text |
| `text-secondary` | `#8a8580` | Supporting text, labels |
| `text-muted` | `#5a5650` | Placeholder text, status bar |

### Semantic

| Token | Hex | Usage |
|---|---|---|
| `success` | `#4a9e6e` | Positive states, low RPE |
| `warning` | `#c9a84c` | Caution states, mid RPE (same as gold) |
| `error` | `#c25454` | Error states, high RPE |
| `info` | `#5a8ec9` | Informational states |

## Typography

Three-font system:

| Font | Variable | Usage |
|---|---|---|
| Playfair Display (serif) | `--font-serif` | Headings: display, heading, subheading, section-heading |
| JetBrains Mono (mono) | `--font-mono` | Data, labels, nav, tables, status bar, captions |
| Inter (sans) | `--font-sans` | Body text |

### Type scale — Major Third (1.25 ratio)

| Level | Class | Size | Font |
|---|---|---|---|
| Display | `.type-display` | 1.953rem (31.25px) | Serif, 600 weight |
| Heading | `.type-heading` | 1.563rem (25px) | Serif, 400 weight |
| Subheading | `.type-subheading` | 1.25rem (20px) | Serif, 400 weight |
| Body | `.type-body` | 1rem (16px) | Sans |
| Secondary | `.type-secondary` | 0.875rem (14px) | Mono |
| Caption | `.type-caption` | 0.75rem (12px) | Mono |
| Micro | `.type-micro` | 0.6875rem (11px) | Mono |

Additional utility classes: `.type-label` (uppercase mono caption), `.type-data` (mono with tabular-nums).

## Component patterns

### `.card`

Base surface with `bg-card` background, 1px border, 8px radius, 1.25rem padding. No hover effect by default.

### `.card-interactive`

Extends `.card` with a border-color transition — border turns `gold-dim` on hover.

### `.data-table`

Tufte-inspired monospace table. Full width, collapsed borders, `tabular-nums`. Header row has a 2px `gold-dim` bottom border with uppercase micro-sized labels. Row hover highlights with `bg-elevated`. Used for session logs, PR tables, exercise history.

### `.status-bar`

Fixed bottom bar with `bg-elevated` background, mono micro text in `text-muted`. Flexbox with space-between layout. Terminal aesthetic.

### `.nav-link`

Monospace secondary-sized links. Default color `text-secondary`, hover transitions to `gold` with `bg-elevated` background. Active state uses `gold` text on `gold-muted` background.

### `.tui-border` / `.tui-border-gold`

Box-drawing aesthetic borders with an inset shadow creating a double-border effect. The gold variant uses `gold-dim` and `gold-muted`.

### `.metric-value` / `.metric-value-accent`

Large mono numbers (display scale, 1.953rem) with tabular-nums. The accent variant renders in `gold` instead of `text`.

## Heatmap gradient

Six-level gold gradient for activity heatmaps:

| Class | Hex | Level |
|---|---|---|
| `.gold-gradient-1` | `#1a1508` | Lowest |
| `.gold-gradient-2` | `#2d2410` | |
| `.gold-gradient-3` | `#4a3d1a` | |
| `.gold-gradient-4` | `#6b5a25` | |
| `.gold-gradient-5` | `#8b7335` | |
| `.gold-gradient-6` | `#c9a84c` | Highest |

## RPE color coding

Rate of perceived exertion uses semantic colors:

| Class | Color | Range |
|---|---|---|
| `.rpe-low` | `success` (#4a9e6e) | Easy effort |
| `.rpe-mid` | `gold` (#c9a84c) | Moderate effort |
| `.rpe-high` | `error` (#c25454) | Maximum effort |

## Accessibility

- **`prefers-reduced-motion`**: All animations and transitions are reduced to 0.01ms duration when the user prefers reduced motion.
- **Custom scrollbars**: Thin (6px) with border-colored thumb, gold-dim on hover.
- **Blinking cursor**: `.cursor-blink` provides a gold block cursor animation for active elements.

## Key source files

| File | Purpose |
|---|---|
| `src/app/globals.css` | All tokens, type scale, and component classes |
| `src/app/layout.tsx` | Font imports via Google Fonts |
