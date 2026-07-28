# Component Library

Reusable components with anatomy, states, and props. Prefer composition; avoid duplicated markup. The prototype implements the highest-frequency component (`BouquetCard`) as a standalone reusable DC — replicate that separation in code.

Legend: **Primary** = filled amber, one per screen · **Secondary** = outline · **Ghost** = transparent · **Text/link** = amber text.

---

## Buttons
| Variant | Style | Use |
|---|---|---|
| Primary | bg `#d98324`, white, 700, radius 16, height 52–56 | The one action per screen |
| Secondary | white, 1px `#e4ddd1` border, ink text | Alternative action |
| Ghost | transparent, muted text | Skip, Cancel, tertiary |
| Text/link | amber text, 700 | Inline (toggle auth mode, Reset) |
| Icon | 40–44px square/round, hairline border | Back, share, header actions |
| FAB (Sell) | 56px, radius 20, amber, `primary` shadow, elevated −8px | Center of tab bar only |
| Disabled | bg `#e8cfa8`, `not-allowed` | Primary before validation passes |

States: default, pressed (darker), disabled. Full-width primaries at bottom of flows.

## BouquetCard  *(reusable DC — `BouquetCard.dc.html`)*
The core marketplace unit. Used in Home (single column), Search & Saved (2-col).

**Anatomy:** 4:3 photo → freshness pill (top-left: color dot + `NN%` in mono) + favorite heart (top-right) · below: title (serif) + price (right), then meta row (neighborhood · distance · remaining-in-freshness-color).

**Props:** `title, price, neighborhood, distance, freshness, freshColor, remaining, photoBg, faved, notFaved, onOpen, onFav`.

**States:** default, faved (filled `#c2557a` heart), pressed (whole card → opens listing). Responsive: fills its column, so the same component serves feed and grid.

## FreshnessCard
The signature AI component (listing details). **Anatomy:** header (spark icon + "AI freshness estimate") · big mono `NN%` + "fresh" · progress bar in freshness color · "Lasts about {range}" · "Confidence NN%" (mono) · "Why this estimate" panel with check-bullets · honesty disclaimer ("Estimate, not a guarantee…"). A compact variant (score + bar + remaining) appears in the create flow.

## Confidence indicator
Always paired with any AI output. Two forms: inline mono `confidence NN%`, and per-item bars (recognized flowers). Never show an AI value without it.

## QualityCheck card
Green-tinted card. Label badge (Excellent/Good/Average/Poor) + bullet list mixing ✓ (green, positive) and → (amber, suggestion). Constructive, never punitive.

## Cards (generic)
White, radius 16–20, 1px `#ece5da` border, 16px padding, `sm`/`md` shadow. Section cards may have a hairline-divided header with an overline label.

## Forms
- **Text input:** height 52, radius 14, 1px `#e4ddd1`, white, 15px; label 13/600 above; optional "· AI suggested" / "· optional" hint.
- **Price input:** taller (64), leading `$`, 28px bold value; border turns `success` green when valid; helper reaffirms "AI never sets it."
- **Textarea:** radius 14, 3 rows, no resize.
- **Choice chips:** pill; selected = `primary-tint` bg + `primary-tint-border` + `#c0561f` text; unselected = white + border + ink-2.
- **Segmented chips (area/distance/freshness):** equal-width, same selected treatment.

## Chips / Tags
- **Filter/quick chips:** pill, selectable (see forms).
- **Flower tags:** static `#f3ede4` bg, ink-2, 600 — read-only descriptors.

## Badges & pills
- **Freshness pill:** on photos — color dot + mono %.
- **Quality badge:** solid `success` bg, white.
- **Unread dot:** 8–9px, amber (nav/threads) or `danger` (header bell).

## Bottom sheets
Full-width, top corners radius 24, drag handle (40×5 `#e4ddd1`), scrim `rgba(28,24,21,0.4)`, `slfrise` entry. Dismiss via scrim tap, back, or the sheet's own primary. Used for Sort and Filters. Sheet content taps `stopPropagation` so inner clicks don't dismiss.

## Dialogs
Reserved for destructive confirms (e.g. delete listing). Centered card, radius 20, title + body + [Cancel ghost][Confirm]. Destructive confirm uses `danger`.

## Navigation
- **Bottom tab bar:** 5 slots, blurred cream, hairline top border, line icons 24px + 10.5px labels, active amber / inactive faint, elevated center FAB. See `navigation.md`.
- **Top bars:** contextual — large serif title (destinations) or back chevron + title (detail/flow). Progress bar + `n/3` counter in the create flow.

## Avatars
Circle, solid brand-tinted bg, white initial in serif. Sizes: 40 (chat/listing), 44 (listing seller), 80 (profile).

## State components
- **Loading — skeleton:** neutral `#f0eae0` blocks at card/text shapes; used while feeds/details load. AI analyzing uses the dedicated checklist + spinner screen.
- **Empty:** soft circular icon + serif line + one supporting line + one primary CTA. (Saved empty state.)
- **Error:** `danger-tint` circle + icon + serif line + guidance + recover CTA (retake) + escape hatch (manual entry). Never a dead end.
- **Success:** `success` circle + animated check (`slfpop`) + reassurance + next action.

## Progress
- **Freshness/confidence bar:** 6–8px track `#f0eae0`, fill in freshness/success color.
- **Flow progress bar:** 5px track, amber fill at 33/66/100% + mono `n/3`.

## Map (approximate)
Rounded rectangle, soft botanical fill, a single approximate marker + "{neighborhood} · approx. area" label. Never a precise pin. Privacy-first.
