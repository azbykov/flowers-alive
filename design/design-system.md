# Second Life Flowers — Design System

> **Superseded.** The current source of truth is
> `design/Product design system guidelines/` (warm neutrals, amber primary,
> Newsreader/Hanken Grotesk/Space Mono) — see its `design/design-system.md`
> and the `*.dc.html` prototypes (mobile + desktop). This file is kept for
> the history of the first iteration; where the two disagree, the handoff wins.

Single source of truth for the visual language. Every screen must be built from
these tokens and components. Mobile-first: design at 390px, scale up gracefully.

## Brand feel

Fresh, warm, effortless. A flower stall on a sunny morning, not a marketplace
dashboard. Generous whitespace, soft rounded shapes, one clear action per screen.

## Color tokens

| Token          | Value     | Usage                                    |
| -------------- | --------- | ---------------------------------------- |
| `--surface`    | `#FAF7F2` | App background (warm off-white)          |
| `--card`       | `#FFFFFF` | Cards, sheets, inputs                    |
| `--ink`        | `#22302A` | Primary text (deep botanical green-black)|
| `--ink-soft`   | `#66736C` | Secondary text                           |
| `--stem`       | `#2E7D52` | Primary actions, links, active nav       |
| `--stem-deep`  | `#215E3D` | Primary hover/pressed                    |
| `--stem-tint`  | `#E7F2EB` | Primary tinted backgrounds, chips        |
| `--petal`      | `#E4567B` | Accent: favorites, price highlights      |
| `--petal-tint` | `#FCE9EF` | Accent tinted backgrounds                |
| `--line`       | `#E8E3DA` | Borders, dividers                        |
| `--fresh-high` | `#2E7D52` | Freshness ≥ 80                           |
| `--fresh-mid`  | `#C98A1B` | Freshness 60–79                          |
| `--fresh-low`  | `#C64F2E` | Freshness < 60                           |

No dark mode in MVP. Never introduce new colors ad hoc.

## Typography

- Font: Geist Sans (system fallback). No second typeface.
- Page title: 24px / semibold / tracking-tight
- Section title: 17px / semibold
- Body: 15px / regular / `--ink`
- Secondary: 13px / regular / `--ink-soft`
- Price: 20px / bold / `--ink`
- Badge / chip: 12px / medium

## Spacing & shape

- Base unit 4px. Screen padding 16px. Card padding 16px. Section gap 24px.
- Radius: cards & photos 16px, buttons & inputs 12px, chips & badges full.
- Shadows: cards `0 1px 3px rgb(34 48 42 / 0.06)`. Nothing heavier.
- Max content width 640px, centered. Browse/favorites widen to 1024px on
  desktop (≥1024px) with a 4-column card grid (3 columns on tablets); listing
  detail, sell and profile stay at 640px. Bottom nav fixed, 64px tall,
  content gets 80px bottom padding.

## Components

- **Button**: primary (stem bg, white text), secondary (card bg, line border),
  ghost (transparent), danger-quiet (petal text). Height 48px (44px min touch).
  Full-width on mobile for primary screen actions. Loading state = spinner + label.
- **ListingCard**: photo (4:3, rounded 16), freshness badge overlaid top-left,
  favorite heart top-right, below: title (1 line), price + distance row,
  neighborhood + posted-ago in secondary text.
- **FreshnessBadge**: pill, colored by freshness tier, "94% fresh".
- **FreshnessCard** (detail screen): score, remaining days range, confidence,
  bulleted explanation. Always shows confidence — never present as certainty.
- **Chip**: filter toggles. Selected = stem-tint bg + stem text.
- **Input / Textarea / Select**: card bg, line border, 12px radius, 15px text,
  visible focus ring in stem color. Labels above, 13px medium.
- **EmptyState**: centered flower emoji/illustration, one-line message,
  optional primary action.
- **BottomNav**: 4 items — Browse, Sell (center, emphasized), Favorites, Profile.
- **Stepper** (sell flow): 3 dots with labels, current in stem.

## Interaction rules

- One primary action per screen, rendered as the single primary button.
- Optimistic UI for favorites and mark-as-sold.
- AI states: analyzing = calm inline progress ("Looking at your bouquet…"),
  never a blocking full-screen spinner; results slide in as editable defaults.
- All AI estimates show confidence. Wording is suggestive ("looks like"),
  never absolute.
- Forms: prefill everything possible, typing is a last resort.

## Voice

Short, friendly, concrete. "Give your bouquet a second life", "Ready for pickup
in Jordaan". No marketplace jargon, no exclamation marks in system text.
