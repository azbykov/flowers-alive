# Design System

Tokens are the contract between design and code. Values below are exactly what the prototype uses. In a Tailwind/Next stack, map these to `theme.extend` / CSS custom properties.

## Color

### Neutrals (warm-toned)
| Token | Hex | Use |
|---|---|---|
| `bg` | `#fdfbf7` | App background (warm cream) |
| `bg-canvas` | `#ece3d4` | Behind the phone / desktop canvas |
| `surface` | `#ffffff` | Cards, sheets, inputs |
| `surface-tint` | `#faf6ef` | Subtle info panels inside cards |
| `ink` | `#2a241e` | Primary text (warm near-black) |
| `ink-2` | `#4a443c` | Secondary text / labels |
| `muted` | `#8b8177` | Tertiary text |
| `faint` | `#b0a89e` | Placeholder / disabled text |
| `hairline` | `#f3ede4` | Inner dividers |
| `border` | `#ece5da` / `#e4ddd1` | Card border / input border |

### Brand & semantic
| Token | Hex | Use |
|---|---|---|
| `primary` | `#d98324` | The single action color (amber) |
| `primary-press` | `#c0561f` / `#be6e14` | Pressed / hover / on-dark text |
| `primary-tint` | `#fbeede` | Selected chips, soft primary bg |
| `primary-tint-border` | `#f0d3a8` | Border of selected chips |
| `success` | `#3f7d52` | Freshness high, quality good, confirmations |
| `success-tint` | `#f2f7ef` / `#eef1e5` | Quality/success card bg |
| `danger` | `#c0492f` | Errors, destructive, wilting |
| `danger-tint` | `#fbe8e3` | Error surfaces |
| `like` | `#c2557a` | Filled favorite heart |

### Freshness scale (functional)
Freshness maps a 0–100 score to a color so it reads at a glance:
| Score | Color | Label feel |
|---|---|---|
| ≥ 85 | `#3f7d52` (green) | Very fresh |
| 65–84 | `#6d9a4f` (leaf) | Fresh |
| 45–64 | `#d98324` (amber) | Fading |
| < 45 | `#c0492f` (red) | Wilting |

## Typography

Three families, each with one job:
- **Newsreader** (serif) — headlines, titles, prices-as-display. Weights 400/500. Warm, editorial.
- **Hanken Grotesk** (humanist sans) — all UI, body, labels, buttons. Weights 400/500/600/700.
- **Space Mono** (mono) — AI/data readouts only (percentages, confidence, step counters, stat numbers). Weights 400/700. Signals "measured value."

### Scale (px)
| Role | Family | Size / weight / line |
|---|---|---|
| Display | Newsreader | 44 / 500 / 1.02 (splash) |
| H1 | Newsreader | 26–32 / 500 / 1.1 |
| H2 | Newsreader | 19–23 / 500 / 1.12 |
| Body | Hanken | 14.5–15 / 400 / 1.5 |
| Label | Hanken | 13 / 600 |
| Overline | Hanken | 11–12 / 700 / uppercase / +0.5–1px tracking |
| Caption | Hanken | 12–12.5 / 400–600 |
| Data XL | Space Mono | 32–34 / 700 (freshness %) |
| Data | Space Mono | 11–12 / 700 (confidence, counters) |

Minimum body size on mobile: 12.5px. Tap targets ≥ 44px.

## Spacing
4px base scale: **4, 8, 12, 16, 20, 24, 32, 40, 48, 64**. Screen horizontal padding: **20px**. Card inner padding: **16px**. Gap between feed cards: **22px**; grid gap: **14–16px**.

## Radius
| Token | px | Use |
|---|---|---|
| `sm` | 8–10 | chips inner, small tags |
| `md` | 12–14 | buttons, inputs, small tiles |
| `lg` | 16–18 | cards, photo tiles |
| `xl` | 20–24 | large cards, bottom sheets (top only) |
| `full` | 999 | pills, avatars, toggles, FAB icon container |
| phone | 46 | device frame |

## Shadow (warm-tinted, restrained)
| Token | Value |
|---|---|
| `sm` | `0 1px 2px rgba(42,36,30,0.06)` |
| `md` | `0 8px 30px rgba(42,36,30,0.06)` |
| `primary` | `0 8px 20px -4px rgba(217,131,36,0.6)` (Sell FAB only) |
| `phone` | `0 40px 90px -20px rgba(42,36,30,0.4)` |

Shadows are used sparingly — most separation comes from the hairline border + cream/white contrast.

## Grid & layout
- **Design width: 390px** (iPhone). Everything is fluid within it.
- Feed: single column (scannable, premium). Search & Saved: 2-column grid.
- Bottom sheets: full-width, top corners `xl`, drag handle, `slfrise` entry animation, scrim `rgba(28,24,21,0.4)`.
- Status bar 52px; bottom tab bar 84px (incl. safe area).

## Motion
Minimal and communicative only:
- `slfspin` — AI analyzing spinner (0.9s linear).
- `slfrise` — bottom sheet enter (0.25s ease-out).
- `slfpop` — success check (0.5s).
- Pressable feedback via color, not scale, except the success moment.
No decorative or ambient animation.

## Imagery
Product photography is central; in mockups it is represented by soft layered-circle "bloom" placeholders in botanical hues (built only from basic radial shapes). In production these are replaced by real uploaded photos at 4:3 (cards) and 1:1 (listing hero, onboarding). Never ship the placeholder gradients as final art.
