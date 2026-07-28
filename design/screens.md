# Second Life Flowers — Screens

> **Superseded.** Current screen designs live in
> `design/Product design system guidelines/` (`Second Life Flowers.dc.html`
> for mobile, `Second Life Flowers - Desktop.dc.html` for desktop). Kept for
> the history of the first iteration; where the two disagree, the handoff wins.

All screens are mobile-first, max-width 640px centered, bottom nav visible
except inside the sell flow (which uses a back header to stay focused).

## 1. Browse (`/`) — primary action: open a listing

- Header: app name + neighborhood indicator.
- Search input (debounced, filters by title/flowers).
- Horizontal filter row: sort select (Distance / Freshness / Newest / Price) +
  chips for flower type, max price, min freshness, pickup method.
- Responsive grid of ListingCards: 2 columns ≥ 400px, 1 column below.
- Sold listings are excluded. Distance shown approximately ("~1.2 km").
- Empty state: "No bouquets nearby yet — be the first to share one" + Sell CTA.

## 2. Listing detail (`/listings/[id]`) — primary action: contact seller

- Photo gallery: swipeable, dots indicator, 4:3.
- Title, price (large), neighborhood + approximate distance, posted-ago.
- FreshnessCard: score, remaining days, confidence, explanation bullets.
- Flower type chips, pickup method chips, description.
- Sticky bottom bar: "Contact seller" primary button (opens contact info),
  heart toggle beside it.
- Owner view instead shows "Mark as sold" and no contact bar.
- Never show exact address or coordinates — neighborhood only.

## 3. Sell (`/sell`) — the < 1 minute flow, primary action per step

Three steps, one screen each, stepper on top. No bottom nav.

- **Step 1 — Photos**: big photo drop/capture area, up to 4 photos.
  As soon as the first photo lands, AI analysis starts in the background.
  Primary: "Continue".
- **Step 2 — Details (AI-prefilled)**: while analysis runs show calm inline
  progress. Then: editable title + description (AI suggested), detected flower
  chips, FreshnessCard preview, photo-quality feedback with constructive
  suggestions ("Improve lighting"). Listing quality label:
  Excellent / Good / Average / Poor. Primary: "Continue".
- **Step 3 — Price & pickup**: price input (manual — AI never suggests price),
  neighborhood select, pickup method chips, contact field (prefilled from
  profile). Primary: "Publish listing".
- Success screen: check mark, "Your bouquet is live", buttons to view listing
  or back to browse.

## 4. Favorites (`/favorites`)

- Grid of saved ListingCards. Sold ones stay visible with a "Sold" overlay.
- Empty state: "Tap the heart on a bouquet to save it here."

## 5. Profile (`/profile`)

- Name + contact (phone/telegram) — used to prefill listings.
- "My listings" list with status and "Mark as sold" quick action.
- Sign in / register (Supabase auth when configured; demo profile otherwise).
