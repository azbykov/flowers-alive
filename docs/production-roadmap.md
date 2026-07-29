# Production Roadmap

Status as of 2026-07-28. Short checklist only. For inventory, infrastructure
decisions (Vercel / Supabase / Storage), cost, and definition of
“ready”, see [launch-readiness.md](./launch-readiness.md).
Manual account wiring: [provisioning.md](./provisioning.md).

## Blockers — code done, awaiting provision + deploy

1. ~~**Supabase Auth.**~~ Code landed: magic-link `/sign-in`,
   `/auth/callback`, `src/proxy.ts`, `getSessionSellerId`. Needs a live
   Supabase project (see provisioning).
2. ~~**Schema + RLS.**~~ Migrations `0001`–`0003` ready (incl. full RLS
   hardening + Storage bucket). Apply them to a live project.
3. ~~**Photos in Supabase Storage.**~~ Client upload at publish time;
   DB stores object paths. Needs the bucket from `0003`.
4. **Deployment.** Connect GitHub → import to Vercel → set env vars →
   first deploy. Steps in [provisioning.md](./provisioning.md).
5. ~~**CI.**~~ `.github/workflows/ci.yml` runs lint/test/build on push/PR.

## First week after launch

6. **Real AI Gateway key + prompt calibration** on live bouquet photos; the
   prompt (`src/lib/ai/openaiProvider.ts`) is untested against real data.
7. **Playwright e2e** for the critical path: sell → browse → contact → sold.
8. **Un-hardcode geography.** ~~Neighborhoods are 8 Amsterdam constants in
   `src/app/sell/page.tsx`.~~ Done: GPS + Nominatim reverse-geocode via
   `/api/geocode`; seller can edit the area label.
9. **Content moderation.** The vision request already sees every photo — add
   a "not flowers / unsafe" flag to the response schema and block publishing.
10. **Listing expiry.** Flowers live for days; auto-transition to `expired`
    (enum exists) via Supabase cron or read-time check.

## Nice to have

11. Favicon, OG/meta tags, 404/error pages, privacy policy, analytics
    (Plausible), Sentry.
12. Seller notification when a buyer reveals their contact.
13. Favorites synced to the `favorites` table (still localStorage in v1).
14. In-app chat — tables provisioned, two-pane desktop design exists in
    `design/Product design system guidelines/Second Life Flowers - Desktop.dc.html`
    (the one screen deliberately skipped in the current build).

## Non-goals (per CLAUDE.md, do not build unless asked)

Payments, escrow, delivery, ratings, AI pricing, recommendations, premium.
Rate limiting / Upstash — out for MVP; revisit if AI abuse becomes real.
Cloudflare Workers/Queues stay out until there is an async workload
(e.g. queued AI analysis at scale) — Next API routes cover everything today.
