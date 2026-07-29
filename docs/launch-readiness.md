# Launch Readiness

Status as of 2026-07-28. Inventory of what exists, what blocks a public launch,
and **where we store and deploy** everything.

Companion to [architecture.md](./architecture.md). Manual wiring steps:
[provisioning.md](./provisioning.md). Short checklist:
[production-roadmap.md](./production-roadmap.md).

---

## 1. Where we are today

| Area | State |
| --- | --- |
| Browse / search / filters / distance sort | Done |
| Sell flow (photos → AI → confirm → publish) | Done |
| Listing detail, contact reveal, mark-as-sold | Done |
| Favorites | Done (device-local; DB table ready) |
| Design system UI + responsive shell | Done |
| Domain logic + unit/integration tests (20) | Done |
| Demo mode (memory repo + mock AI) | Removed — use local Supabase + seed.sql |
| Supabase Auth (magic link) + session in API | **Code done** — needs live project |
| Postgres schema + full RLS | **Migrations ready** (`0001`–`0003`) |
| Photos → Supabase Storage | **Code done** — needs bucket |
| GitHub Actions CI (lint/test/build) | Done |
| Deployment | **Manual** — Vercel import pending |
| E2E tests | None |
| Real AI on live bouquet photos | Untested |

**Verdict:** P0 application code is in place. Remaining work is provisioning
Supabase + Vercel and a smoke test on real hardware (see provisioning.md).

---

## 2. Infrastructure

```
                    ┌─────────────────────────┐
   Users ──────────▶│  Vercel                 │
                    │  Next.js 16 (App Router)│
                    │  API routes + proxy.ts  │
                    │  AI Gateway ────────────┼──▶ OpenAI vision
                    └───────────┬─────────────┘     (openai/gpt-4o-mini)
                                │
                                ▼
                     ┌────────────────┐
                     │ Supabase       │
                     │ • Postgres+RLS │
                     │ • Auth (OTP)   │
                     │ • Storage      │
                     └────────────────┘
```

| Concern | Service |
| --- | --- |
| App + API | **Vercel** (native GitHub deploys) |
| DB / Auth / Photos | **Supabase** |
| AI | **Vercel AI Gateway** → OpenAI |
| CI checks | **GitHub Actions** (no deploy) |

### Env vars (production)

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=     # Maps JavaScript API
AI_GATEWAY_API_KEY=                 # preferred
OPENAI_API_KEY=                     # optional fallback
```

No service-role key in Vercel — Route Handlers use the user's session so RLS applies.
`SUPABASE_SERVICE_ROLE_KEY` is local/CLI only (seed storage uploads).

### What we deliberately do **not** deploy yet

- Rate limiting / Upstash
- Cloudflare Queues / Workers for AI
- In-app chat realtime
- Multi-region DB

---

## 3. Gap list

### P0 — code done; provision to launch

| # | Gap | Status |
| --- | --- | --- |
| 1 | Supabase Auth + session in API | Code done |
| 2 | Live Supabase + migrations `0001`–`0003` | Manual |
| 3 | Photos → Storage | Code done |
| 4 | Deploy to Vercel + env + domain | Manual |
| 5 | CI on PR | Done |

### P1 — first week after soft launch

Geography un-hardcode, moderation flag, listing expiry, Playwright e2e,
AI prompt calibration on real photos.

### P2 — polish

Favicon/OG, privacy policy, Plausible + Sentry, favorites → DB,
seller contact-reveal ping.

### Explicitly out of MVP

Payments, escrow, delivery, ratings, AI pricing, recommendations, premium,
buyer-side AI, in-app chat, rate limiting / Upstash.

---

## 4. Definition of “ready for public launch”

1. A stranger can sign in, publish a listing with real photos, and another
   stranger can find it nearby and reveal contact — without spoofing identity.
2. Photos live in Storage; DB has no multi-megabyte data URLs.
3. Production runs on a custom domain (or at least a stable Vercel URL) with HTTPS.
4. Soft launch to a small city/neighborhood cohort before broad marketing.

Until provisioning is finished, the app remains a **demo** locally — valuable
for walkthroughs, not for real phone numbers.
