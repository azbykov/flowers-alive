# Second Life Flowers 🌷

Give flower bouquets a second life — the fastest way to pass fresh flowers to
someone nearby. Snap a photo, AI fills in the listing, set your price, publish.
Under a minute.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. **No configuration needed** — without env vars the
app runs in demo mode: seeded listings (Amsterdam), deterministic mock AI, and
a local device profile. Everything is clickable end to end, mobile and desktop.

## Production services

Copy `.env.example` to `.env.local` and fill in:

| Variable | Enables |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Postgres, Auth, Storage |
| `AI_GATEWAY_API_KEY` | Real vision via [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) (preferred) |
| `OPENAI_API_KEY` | Direct OpenAI fallback when Gateway is unset |

First-time production setup (create Supabase + Vercel, apply migrations):
[docs/provisioning.md](docs/provisioning.md).

Launch inventory and gaps: [docs/launch-readiness.md](docs/launch-readiness.md).
Short checklist: [docs/production-roadmap.md](docs/production-roadmap.md).

## What's inside

- **Browse** — search, filters (flower type, price, freshness, pickup), sort by
  distance / freshness / newest / price. Distance is a first-class ranking
  signal. 4-column grid + top nav on desktop, tab bar on mobile.
- **Sell** — guided flow: photos → AI analysis (animated checklist) → AI
  results you confirm → details → preview → publish. AI identifies flowers,
  estimates freshness (always with confidence and a "why" explanation), checks
  photo quality, and rates the listing. **AI never touches price.**
- **Auth** — magic-link email sign-in (production). Publish requires a session;
  photo + AI steps work before sign-in.
- **Listing detail** — two-column on desktop with a sticky photo pane; AI
  freshness card; contact reveal; mark-as-sold for owners.
- **Favorites & profile** — saved bouquets (device-local), my listings, sign out.
- **Privacy** — precise coordinates stay server-side under RLS; buyers see
  neighborhood + distance rounded to 0.1 km, never an address.

## Repo map

| Path | What |
| --- | --- |
| `design/Product design system guidelines/` | **Design source of truth**: tokens, docs, HTML prototypes |
| `docs/architecture.md` | Layers, auth, AI pipeline, Storage, RLS |
| `docs/provisioning.md` | Manual steps: Supabase + Vercel + GitHub |
| `docs/launch-readiness.md` | Inventory + infra decisions |
| `docs/production-roadmap.md` | Short checklist |
| `src/domain/` | Pure business logic (unit-tested) |
| `src/lib/ai/` | AI pipeline + Gateway/OpenAI/mock providers |
| `src/lib/db/` | Repository interface, memory + Supabase repos |
| `src/lib/supabase/` | SSR browser/server clients |
| `src/lib/auth.ts` | Session seller id (demo header vs Auth) |
| `src/proxy.ts` | Session cookie refresh (Next.js 16 Proxy) |
| `src/lib/client/` | Profile, favorites, geolocation, Storage upload |
| `src/app/api/` | Validated route handlers |
| `supabase/migrations/` | Schema, RLS hardening, Storage bucket |
| `.github/workflows/ci.yml` | lint · test · build on push/PR |

## Tests & CI

```bash
npm test        # domain units + AI pipeline + API integration
npm run lint
npm run build
```

All three must pass before merging. GitHub Actions runs the same suite on
every push and pull request to `main`.

## Deliberate MVP cuts

No payments, delivery, ratings, or buyer-side AI — per the product brief in
`CLAUDE.md`. In-app chat is designed (desktop prototype) and provisioned in
the schema but not built; MVP contact is direct phone/telegram reveal.
