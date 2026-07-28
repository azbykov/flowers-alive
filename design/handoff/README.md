# Second Life Flowers — Product Design

> Give a received bouquet a second life. The fastest way to pass fresh flowers to someone nearby — a listing in under a minute, with AI doing the work.

This directory is the **single source of truth** for the product experience. The frontend is built from these documents and from the interactive prototype. Do not invent a new visual language; reuse what is defined here.

## What's here

| File | Purpose |
|---|---|
| `README.md` | This overview + how to use the design source |
| `design-principles.md` | The rules every decision is measured against |
| `information-architecture.md` | Screen inventory, hierarchy, and *why* the IA is shaped this way |
| `navigation.md` | Navigation model, tab bar rationale, routing map |
| `user-flows.md` | Every complete flow, step by step, with states |
| `design-system.md` | Tokens: color, type, spacing, radius, shadow, grid |
| `component-library.md` | Reusable components with anatomy, states, and props |
| `ai-experience.md` | How AI appears in the product (and where it must not) |

## The living prototype

The authoritative visual + interaction reference is the clickable prototype:

- **`Second Life Flowers.dc.html`** — the full mobile app: onboarding, auth, browse, search, listing details, the create-listing + AI flow, saved, messages, chat, profile, settings, and empty/error/loading/success states. Every screen is reachable from the index rail on the left.
- **`BouquetCard.dc.html`** — the reusable bouquet card used across Home, Search, and Saved.

Open the prototype and tap through it before implementing. Anything ambiguous in these docs is resolved by the prototype's behavior.

## Product in one paragraph

People receive bouquets they can't keep — they're travelling, moving, or already have flowers. Instead of binning them, they photograph the bouquet; **AI names the flowers, estimates freshness and remaining life, and runs a quality check**; the seller sets a price (AI never does); the listing goes live to people nearby. Buyers browse, save, message, and arrange pickup themselves. No payments, no delivery, no ratings — deliberately.

## Non-negotiables (from product brief)

- **Mobile-first.** Every screen works perfectly on a phone. Desktop is secondary.
- **One primary action per screen.**
- **Listing creation under a minute.** Reduce typing, prefer intelligent defaults.
- **AI removes work — never adds it.** It identifies, estimates, and checks. It **never** prices, negotiates, or decides what to charge.
- **Freshness is always an estimate with confidence** — never presented as certainty.
- **Privacy:** show neighborhood + approximate distance only. Never the exact address.
