# AI Experience

AI is a core feature — but a **quiet, honest helper**. Its whole job is to remove work from the seller. It must never feel like a gimmick, never overwhelm, and never cross into pricing.

## Where AI appears

| Surface | What AI does | How it shows up |
|---|---|---|
| Create → Analyzing | Detect bouquet, identify flowers, estimate freshness, check photo quality | Loading screen: spinner + animated checklist |
| Create → AI results | Present findings for **confirmation** | Three cards: Recognized flowers, Freshness, Quality check |
| Create → Details | Prefill title & flowers | Editable fields marked "· AI suggested" |
| Listing details | Explain freshness to buyers | FreshnessCard with score, remaining life, confidence, "why" bullets |
| Create → Preview | Listing completeness | "Listing quality: {label}" banner |

## The five rules

1. **AI removes work, never adds it.** The output is something to *skim and confirm*, not fields to fill. Default action after AI is "Looks right — continue."
2. **Always show confidence.** Every estimate carries a confidence value (mono `NN%` or per-item bars). No bare claims.
3. **Never certainty.** Freshness is framed as an estimate with an explicit disclaimer: "Estimate, not a guarantee. Always check flowers in person at pickup." Ranges ("5–6 days"), not exact promises.
4. **AI never prices.** No estimate, no suggestion, no range, no nudge. The price field states it plainly: "You decide the price. AI never suggests it." This is a product principle, visible in the UI.
5. **AI never blocks.** Low confidence or a bad photo produces guidance, not a wall — the error state offers "Retake photo" *and* "Enter details manually." A seller can always publish.

## The freshness engine (as presented)
Every bouquet surfaces four things, always together:
- **Freshness score** — 0–100%, colored by the freshness scale.
- **Remaining freshness** — a range in days.
- **Confidence** — how sure the estimate is.
- **Explanation** — short, concrete bullets ("Petals firm and vivid", "No visible browning", "Stems freshly cut").

## Quality check (as presented)
Before publishing, AI grades **photo quality + bouquet condition + listing completeness** into one label — **Excellent / Good / Average / Poor** — with constructive, mixed bullets (✓ positives, → suggestions like "A close-up of the buds would help buyers"). Tone is encouraging; it coaches a better listing, it doesn't gate.

## Recognition
Flowers are listed with a per-flower confidence bar; anything can be renamed. The AI proposes; the human owns the final text.

## Tone of AI copy
Warm, plain, first-person-product. "Here's what AI found" · "Looks right — continue" · "We couldn't read that photo." Never technical, never salesy, never anthropomorphized into a mascot — AI is present as *labeled, honest assistance*, not a character.

## Cost & restraint (product/eng note)
Run AI only where it adds real value (once per listing, on the uploaded photos). Cache the analysis with the listing; don't re-run on edits unless photos change. This keeps the experience fast and costs low — consistent with "prefer inexpensive operations."
