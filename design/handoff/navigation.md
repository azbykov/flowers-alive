# Navigation

## Model: bottom tab bar + focused flow

Mobile-first, thumb-reachable. Five slots in the bottom bar:

```
[ Home ]  [ Search ]  ( ＋ Sell )  [ Saved ]  [ Profile ]
```

- **Home, Search, Saved, Profile** are persistent destinations. Tapping one resets that tab to its root and clears its back stack.
- **Sell (center)** is an elevated amber button — visually the hero action. It opens the create flow as a focused stack **without** the tab bar, so nothing competes with the task. Back/close returns to where the user was.
- Active tab = amber icon + label; inactive = warm grey. Icons are simple line glyphs at 24px, labels 10.5px.

The bar uses a translucent blurred cream background with a hairline top border, and respects the home-indicator safe area (84px tall total).

## Where the tab bar shows

| Shows tab bar | Hides tab bar |
|---|---|
| Home, Search, Saved, Profile | Splash, Onboarding, Auth |
| | Listing details, Chat |
| | Entire Sell flow (photos → success) |
| | Settings |

Rule: **destinations** keep the bar; **focused tasks and detail views** hide it and give a back affordance instead.

## Back & history
- Detail/flow screens show a top-left back chevron in a 40px rounded square (or a ghost chevron over imagery on Listing details).
- A history stack powers back. Switching tabs clears history (each tab is a fresh root). Sheets (sort/filter) are dismissed by back, scrim tap, or their own action — they never push history.

## Entry & exit points
- **Messages** is reached from the Home header icon (unread dot) and from Profile → it is *not* in the tab bar (see IA rationale).
- **Listing details** is reached from any bouquet card (Home, Search, Saved) and from Messages/Chat context.
- **Sell** is reached only from the center button — a single, unmistakable entry.
- **Sign out** returns to Splash and clears history.

## Routing map (for engineering)

```
/                         → splash (unauth) | home (auth)
/onboarding               → onboarding
/auth                     → auth (mode: register | login)
/home                     → home feed
/search                   → search (query, sort, filters in state)
/listing/:id              → listing details
/saved                    → saved grid
/sell                     → create flow, internal step:
      step 1 photos
      step 2 analyzing  (auto-advances)
      step 3 ai-results
      step 4 details
      step 5 preview
      step 6 success
/messages                 → thread list
/chat/:listingId          → conversation
/profile                  → profile
/settings                 → settings
```

State the prototype models with a single `screen` value + `history` stack + a `tab` for bar highlighting; a production app maps these 1:1 to routes above.
