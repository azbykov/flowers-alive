# Information Architecture

## Screen inventory

Grouped by the job the user is doing.

**Get started**
- Splash — value proposition + entry
- Onboarding — 3 slides (Receive → AI does the work → Pass it on)
- Auth — combined Sign up / Log in (toggle)

**Browse (buyer job)**
- Home — nearby bouquets, "Fresh today", quick chips
- Search — query + filters (bottom sheet) + sort (bottom sheet), 2-col grid
- Listing details — gallery, freshness card, seller, approximate map, contact
- Saved — favorited bouquets (2-col grid) + empty state

**Sell (seller job — the core flow)**
1. Add photos
2. AI analyzing (loading)
3. AI results (recognition + freshness + quality check)
4. Details & price (prefilled title, manual price, pickup area, optional note)
5. Preview
6. Published (success)

**Connect**
- Messages — thread list
- Chat — conversation + quick replies
- Profile — identity, stats, menu
- Settings — account, preferences, privacy

**System states**
- Loading (AI analyzing), Success (published), Empty (saved), Error (AI can't read photo). Loading/success are inline in flows; empty/error are demonstrated as their own reachable states in the prototype.

## Hierarchy

```
App
├── Onboarding stack (splash → onboarding → auth)   [pre-auth, no tab bar]
└── Main app  [tab bar]
    ├── Home ▸ Listing details ▸ Chat
    ├── Search ▸ Listing details ▸ Chat
    ├── Sell (modal-style flow, no tab bar)
    ├── Saved ▸ Listing details
    └── Profile ▸ Settings
                ▸ Messages ▸ Chat   (also reachable from Home header)
```

## Why the IA is shaped this way

**Two jobs, one app.** A user is sometimes a seller (I have flowers) and sometimes a buyer (I want flowers). We do **not** split these into modes or separate apps — the same person flips between them. The tab bar serves the buyer (Home, Search, Saved), the center action serves the seller (Sell), and Profile serves both.

**Sell is a center action, not a tab.** Selling is the product's reason to exist and the "magic" moment, so it gets the prominent elevated center button — but it's a *flow*, not a *destination*, so it opens as a focused modal-style stack without the tab bar. This keeps the flow distraction-free and reinforces "one primary action."

**Messages is not a tab.** With no ratings and no payments, messaging volume is low and always tied to a specific listing. Making it a 6th tab would over-weight it and crowd the bar. Instead it lives in the Home header (with an unread dot) and in Profile — discoverable when relevant, quiet otherwise. *Challenge considered:* if messaging becomes the primary retention driver post-MVP, promote it to a tab and move Saved into Profile.

**Saved over a full "Favorites" section.** Saving is lightweight (a heart on any card). It earns a tab because it's the buyer's shortlist they return to — but it stays a flat grid, not a folder system.

**Search is separate from Home.** Home is a curated, low-effort "what's fresh nearby" feed (browse intent). Search is deliberate, filter-driven finding (hunt intent). Collapsing them would compromise both; the Home search bar is a fast bridge into Search.

**Settings nests under Profile.** Low-frequency; doesn't deserve top-level space.

## Sorting & ranking (Search)
Primary sort options, in order offered: **Distance, Freshness, Newest, Price.** Distance is the default and a strong ranking signal — proximity is what makes same-day flower pickup viable. Freshness is the second signal because a bouquet's value decays daily.

## Location model
Users pick a **neighborhood** or **pickup point**. Precise coordinates are stored internally for distance math; the UI publicly shows only neighborhood + approximate distance ("Riverside · 1.2 km away"). The listing map shows an approximate area, never a pin on an address.
