# Design Principles

These are the rules every screen, component, and interaction is measured against. When two solutions compete, the one that better satisfies these principles wins.

## The six words
**Simple. Fast. Friendly. Modern. Premium. Human.**

Flowers are fleeting and personal. The product should feel like a warm, well-made object — not a busy classified-ads marketplace.

## 1. Every click has a reason
No decorative navigation, no screens that exist only to be passed through. If a step doesn't move the user toward giving or getting flowers, cut it.

## 2. Reduce friction relentlessly
- **Reduce typing** — AI prefills the title, flowers, freshness. The only thing the seller *must* type is the price.
- **Reduce decisions** — smart defaults everywhere (nearest pickup area preselected, sensible sort by distance).
- **Reduce steps** — the create flow is 3 input steps (photos → AI review → price) + a preview. Target: under 60 seconds.

## 3. One primary action per screen
Each screen has exactly one obvious next move, rendered as the single filled amber button. Everything else is secondary (outline, ghost, or text). Never two amber buttons competing.

## 4. Intelligent defaults over empty fields
The listing arrives 80% complete from AI. Sellers *edit* rather than *enter*. The price field is the one deliberate, manual decision — highlighted as such.

## 5. AI is a quiet, honest helper
- AI **removes** work; it never demands attention.
- Every AI estimate shows **confidence** and is framed as an estimate, not a fact.
- AI **never** touches price. That line is sacred and is stated in the UI ("You decide the price. AI never suggests it.").
- When AI can't help (bad photo), it fails gracefully and offers a manual path — it never blocks.

## 6. Premium through restraint, not decoration
- Generous whitespace, one serif for warmth (headlines), one humanist sans for clarity (UI), one mono for data (AI readouts).
- **Two background tones max**: warm cream (app) and white (surfaces). Amber is the single action color.
- No gradients-as-decoration, no drop-shadow soup, no emoji as UI, no unnecessary animation. Motion appears only where it communicates (loading, success, sheet entry).

## 7. Honest, human copy
Short, warm, first-person from the product's voice. "Got a bouquet you can't keep?" not "List an item." Never salesy, never robotic.

## 8. Trust and safety by default
Approximate location only. Pickup is arranged between people. Help & safety is one tap from the profile. We never expose exact addresses or precise coordinates.

## What we deliberately avoid
Clutter · unnecessary pages · long forms · AI pricing · seller ratings · in-app payments · delivery · gamification · aggressive gradients · icon/stat "slop" that adds no information.
