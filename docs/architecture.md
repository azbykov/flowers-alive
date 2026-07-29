# Architecture

## Layers

```
src/
  domain/        Pure business logic. No IO, no framework imports. Fully unit-tested.
  lib/
    db/          Repository interface + Supabase implementation.
    ai/          AI pipeline modules + providers (OpenAI / AI Gateway, mock).
    auth.ts      getSessionSellerId from Supabase session cookie.
    geocode/     Nominatim reverse-geocode (server, /api/geocode).
    supabase/    Browser + server SSR clients; session refresh helper.
    client/      Browser stores: profile, favorites, geolocation, seller GPS, Storage.
    config.ts    Env detection for Supabase and AI providers.
  proxy.ts       Next.js 16 Proxy — refreshes the Supabase auth cookie.
  app/
    api/         Route handlers — thin: validate (zod) → auth → domain/repo → respond.
    sign-in/     Magic-link email form.
    auth/callback  Exchanges OTP code for a session cookie.
    (screens)    Client components fetching the API (distance ranking needs
                 browser geolocation, so reads happen client-side).
  components/
    ui/          Design-system primitives (Button, Chip, Field, EmptyState, …).
    listing/     Product components (BouquetCard, FreshnessCard, PhotoUpload, …).
    TopNav/BottomNav  Responsive shell (see UI shell below).
```

Dependency direction: `app → components → domain` and `app/api → lib → domain`.
`domain` imports nothing from the outer layers.

## Design source of truth

`design/Product design system guidelines/` — warm neutrals, amber primary
(`#d98324`), fonts Newsreader (titles) / Hanken Grotesk (UI) / Space Mono
(AI & data readouts), 4-tier freshness color scale (≥85 / 65 / 45 boundaries).
Tokens live in `src/app/globals.css`; legacy names (`stem`, `petal`, `line`)
are kept as semantic aliases — `stem` **is** the primary action color.
The `*.dc.html` files are HTML prototypes (mobile + desktop); recreate their
visual output, don't copy their internals. `design/design-system.md` and
`design/screens.md` describe the first (superseded) iteration.

## UI shell

- **Mobile (<lg)**: bottom tab bar (Browse / Sell / Saved / Profile), single
  column, max-width 640px. Sell flow hides the tab bar to stay focused.
- **Desktop (≥lg)**: sticky top nav (logo, nav pills, search, "Sell flowers",
  avatar / Sign in), content max-width 1240px. Browse/Saved render a 4-column
  card grid; listing detail is two-column with a sticky photo pane; the sell
  flow is a centered 560px column with a progress bar.

## Modes

The app requires Supabase for data, auth, and storage (`NEXT_PUBLIC_SUPABASE_*`).
Local development: `supabase start` + `supabase db reset` loads seed listings
from `supabase/seed.sql`. CI builds compile without Supabase env (no runtime DB).

Vision AI: `AI_GATEWAY_API_KEY` (preferred) or `OPENAI_API_KEY` → real analysis;
without keys → deterministic mock provider (same UI, not listing seed).

## Identity & auth

| Context | Identity | Mutating APIs |
| --- | --- | --- |
| Signed in | Supabase Auth (Google or magic link); session cookie via `@supabase/ssr` | `getSessionSellerId` reads the cookie; 401 if absent |
| Unsigned | No session | Read-only browse; publish requires sign-in |

Flow:

1. `/sign-in` → `signInWithOtp({ email })`
2. Email magic link → `/auth/callback?code=…` → `exchangeCodeForSession`
3. `src/proxy.ts` refreshes the session cookie on every matched request
4. Route Handlers call `getSessionSellerId`; `getRepo()` builds a
   **request-scoped** Supabase client so RLS sees `auth.uid()`
5. Profile display name / contact live in `profiles` (upserted on publish /
   save); UI uses `useAuthProfile()`

Publish is gated behind a session in production; photo + AI steps stay open
so the one-minute listing promise isn't blocked by sign-in friction mid-flow.

## AI pipeline

Independent modules, single responsibility each, orchestrated by
`analyzeBouquet()` in `src/lib/ai/pipeline.ts`:

```
photos → imageAnalyzer (provider) → flowerIdentifier → bouquetClassifier
       → freshnessEstimator → photoQualityChecker → listingAssistant
```

Cost control: the provider satisfies the whole pipeline with **one** vision
request per photo set (structured JSON), because the modules consume different
projections of the same observation. Analysis is cached per photo-set hash.
`/api/analyze` rejects payloads over 4 MB per image, max 4 images.

AI never estimates or suggests prices — enforced structurally: no price field
exists anywhere in the AI layer, and the sell flow's price input is manual.
Every AI output ships with a confidence value and an explanation
(`FreshnessCard` renders "Why this estimate" + a disclaimer).

## Photos & Storage

- Client resizes to ≤1600px JPEG (`PhotoUpload` keeps both a preview data URL
  and a `Blob`).
- Analysis still POSTs data URLs to `/api/analyze` (ephemeral — no Storage
  write if the user abandons).
- On publish (production): `uploadListingPhotos` writes to the
  `listing-photos` bucket under `{userId}/{uuid}.jpg`, then
  `POST /api/listings` receives **storage paths** only.
- `supabaseRepo` resolves paths to public URLs in `rowToListing`.
- Demo mode still stores data URLs in memory.

## Location privacy

Precise coordinates are stored internally (`locations.lat/lng`) and used only
server-side for distance ranking. API responses expose neighborhood + distance
rounded to 0.1 km (`toPublicListing` strips coordinates). Exact addresses are
never collected.

RLS on `locations` blocks direct anon reads of the table; coordinates are
only reachable via a join from a listing the requester is allowed to see
(active, or owned). See migration `0002_rls_hardening.sql`.

## Data flow

- **Browse**: client gets geolocation (fallback: demo city center) →
  `GET /api/listings?sort&filters&lat&lng` → server filters/sorts in domain
  code → cards.
- **Sell**: photos downscaled → analysis on change → confirm AI → details →
  preview → (Storage upload if production) → `POST /api/listings`.
  Steps: photos → analyzing → ai → details → review → success.
- **Favorites**: localStorage ids (still device-local in v1) +
  `GET /api/listings?ids=`.
- **Mark sold**: `PATCH /api/listings/:id` guarded by session (or demo header).

## Database

PostgreSQL via Supabase:

- `0001_init.sql` — profiles, locations, listings, bouquets, photos,
  bouquet_analyses, freshness_reports, favorites, chats/messages,
  listing_history; initial RLS on profiles/listings/favorites.
- `0002_rls_hardening.sql` — RLS on every remaining table + `locations.created_by`.
- `0003_storage_bucket.sql` — `listing-photos` bucket + storage policies.

RLS model: public read of **active** listings (and their nested rows);
owners manage their own. Chats/messages are locked to participants even
though the UI feature is not built yet.

## CI / deploy

- **GitHub Actions** (`.github/workflows/ci.yml`): on push/PR to `main` runs
  `lint` → `test` → `build` in demo mode (no secrets).
- **Vercel**: native GitHub integration deploys `main` (production) and PR
  previews. Env: Supabase URL/anon key + `AI_GATEWAY_API_KEY`.
- Provisioning steps: [docs/provisioning.md](./provisioning.md).

## Testing

- Unit: `src/domain/**/*.test.ts` (vitest) — search/ranking, freshness tiers,
  formatting.
- AI pipeline: `src/lib/ai/pipeline.test.ts` — clamping, classification,
  quality suggestions, "no price" guarantee.
- Integration: `src/app/api/listings/route.test.ts` — handlers against the
  in-memory repo (coordinate stripping, distance sort, validation).
- E2E: not yet — planned as Playwright over demo mode (roadmap).

`npm test` · `npm run lint` · `npm run build` must all pass before merging.
