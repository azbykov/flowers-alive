# User Flows

Every complete flow, step by step. Each step notes the **single primary action** and the states involved. Flows map directly to screens in `Second Life Flowers.dc.html`.

---

## 1. Authentication

**Register (default)**
1. Splash → primary "Get started".
2. Onboarding (3 slides) → "Next" ×2 → "Create account".
3. Auth (register): Name, Email, Password + Apple option → primary "Create account".
4. Land on Home.

**Login**
- Splash → "I already have an account", or Auth screen → "Log in" toggle → primary "Log in" → Home.

*Notes:* Skip is available in onboarding. Auth is a single screen that toggles register/login; no separate screens. Social auth (Apple) is offered as the lowest-friction path.

---

## 2. Onboarding
Three slides, each: kicker + serif headline + one line of body + soft botanical visual. Progress dots (active dot widens). Primary advances; "Skip" jumps to Auth. Purpose: teach the *promise* (receive → AI does the work → pass it on), not features.

---

## 3. Create listing + AI (the core flow — target < 60s)

1. **Add photos** — grid of photo slots (cover + add). Tips card (daylight, fill frame). Primary: **Analyze with AI**.
2. **AI analyzing** *(loading state)* — spinner over a bouquet thumbnail; checklist animates: detecting → identifying → estimating → quality. Auto-advances (~2.4s) — no user action. On failure → **AI error state**.
3. **AI results** — three cards:
   - *Recognized flowers* with per-flower confidence bars.
   - *Freshness* score + remaining life + confidence.
   - *Quality check* label (Excellent/Good/Average/Poor) + constructive suggestions.
   Primary: **Looks right — continue**.
4. **Details & price** — Title prefilled (editable), **Price** (the one manual input, emphasized, validates > 0), Pickup area (chips, nearest preselected), optional Note. Privacy note under location. Primary: **Preview listing** (disabled until price set).
5. **Preview** — the listing exactly as buyers see it + a "Listing quality" confirmation banner. Primary: **Publish**.
6. **Published** *(success state)* — check animation, reassurance, "View my listing" / "Back to home".

*Key decisions:* AI output is presented for **confirmation, not correction** — the user skims and taps continue. Price is deliberately the only required manual field. Publish is free; pickup is arranged with the buyer.

---

## 4. Browse (Home)
Header ("Nearby · Riverside" / "Fresh today") + messages icon (unread dot) → search bar (bridges to Search) → quick chips → single-column feed of large bouquet cards (sorted by distance). Tap a card → Listing details. Tap heart → save (optimistic toggle).

## 5. Search
Search field + filter button → 2-col grid. Result count + sort control. **Sort** opens a bottom sheet (Distance/Freshness/Newest/Price). **Filters** opens a bottom sheet (flower type, max distance, min freshness) → "Show N bouquets".

## 6. Open listing → Contact seller
Listing details: photo gallery (dots), title/price, flower tags, **AI freshness card** (score, bar, remaining, confidence, "why" bullets, honesty disclaimer), seller note, seller row, approximate-area map, sticky bottom bar (share + **Contact {seller}**). Contact → Chat.

## 7. Messaging
Messages: thread list (photo, name, listing, last message, time, unread dot). Chat: header (seller + listing context), message bubbles, **quick-reply chips** ("Still available?", "When can I pick up?", "Where exactly?"), input bar. Quick replies reduce typing for the most common questions.

## 8. Close listing (mark as sold)
From the seller's own listing (via Profile → My listings), a "Mark as given" action removes it from browse and files it under history. (No payment/settlement — the transfer happens in person.)

## 9. Favorites (Saved)
Heart on any card toggles saved. Saved tab shows a 2-col grid, or an **empty state** ("Nothing saved yet" + Browse bouquets CTA) when none.

## 10. Profile & Settings
Profile: avatar, name, location, stats (Listed / Given / Saved), menu (My listings, Saved, Settings, Help & safety), Sign out. Settings: grouped rows (Account, Preferences with toggles, Privacy including "Hide exact location").

---

## State coverage
- **Loading:** AI analyzing screen (checklist + spinner). Cards elsewhere use skeleton placeholders (see component library).
- **Success:** Published screen (animated check).
- **Empty:** Saved with nothing saved.
- **Error:** "We couldn't read that photo" — retake or enter manually. AI failure never blocks listing creation.
