# Provisioning guide — first production launch

Code for Auth, Storage, RLS, and CI is in the repo. These steps create the
external accounts and wire them up. Do them in order.

## 1. Connect GitHub

```bash
cd /path/to/flowers-alive
git remote add origin git@github.com:<owner>/<repo>.git   # or HTTPS URL
git add -A
git commit -m "First release: auth, storage, RLS, CI"
git push -u origin main
```

After the first push, GitHub Actions runs `.github/workflows/ci.yml`
(lint · test · build). Optionally enable branch protection on `main` →
require the `checks` status to pass before merge.

## 2. Create a Supabase project

1. [supabase.com](https://supabase.com) → New project.
2. Open **SQL Editor** and run, in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_rls_hardening.sql`
   - `supabase/migrations/0003_storage_bucket.sql`
3. **Authentication → Providers**: enable Email. Turn on magic link /
   OTP (passwordless). Disable email confirmations that would block the
   magic-link flow if you see a separate “confirm signup” toggle that
   conflicts — for OTP-only, magic link is enough.
3b. **Google sign-in**:
   - [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
     → Create credentials → OAuth client ID → Web application.
   - Authorized redirect URI:
     `https://<project-ref>.supabase.co/auth/v1/callback`.
   - Copy the Client ID and Client secret into Supabase Dashboard →
     **Authentication → Providers → Google** → enable → paste both → Save.
   - Local testing: copy `supabase/.env.example` to `supabase/.env`, fill in
     the same Client ID/secret, then run `supabase start --env-file supabase/.env`
     (the redirect URI for local dev is `http://127.0.0.1:54321/auth/v1/callback`,
     already wired in `supabase/config.toml`).
4. **Authentication → URL configuration**:
   - Site URL: your Vercel production URL (e.g. `https://your-app.vercel.app`)
   - Redirect URLs: add
     - `https://your-app.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (local testing)
5. **Project Settings → API**: copy
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Do **not** put the service-role key in the app — RLS + user session
     are enough.

Bucket `listing-photos` is created by `0003_storage_bucket.sql` (public
read; authenticated write under `{userId}/…`).

## 3. Google Maps API key

1. [Google Cloud Console](https://console.cloud.google.com/) → create or pick a project.
2. **APIs & Services → Library** → enable **Maps JavaScript API**.
3. **Credentials → Create credentials → API key**.
4. Restrict the key:
   - Application restrictions: HTTP referrers — `http://localhost:3000/*`,
     `https://your-app.vercel.app/*` (and custom domain if any).
   - API restrictions: Maps JavaScript API only.
5. Copy → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (local `.env` + Vercel).

Billing must be enabled on the Google Cloud project (Maps has a monthly free
credit; still requires a billing account).

## 4. Vercel AI Gateway key

1. Vercel dashboard → **AI Gateway → API Keys** → Create.
2. Copy → `AI_GATEWAY_API_KEY`.
   (Optional local fallback: `OPENAI_API_KEY` — ignored when Gateway is set.)

## 5. Deploy on Vercel

1. [vercel.com/new](https://vercel.com/new) → Import the GitHub repo.
2. Framework: Next.js (auto-detected).
3. Environment variables (Production + Preview):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
   | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | from Google Cloud |
   | `AI_GATEWAY_API_KEY` | from AI Gateway |

4. Deploy. Vercel will redeploy on every push to `main` and create a
   preview URL per PR — no Actions deploy step needed.
5. After the first successful deploy, paste the production URL back into
   Supabase Auth URL settings (step 2.4) if you used a placeholder.
6. Optional: attach a custom domain in Vercel → Domains.

## 6. Smoke-test the happy path

1. Open production URL → **Sign in** → **Continue with Google** (or receive
   a magic link by email) → land signed in.
2. **Sell** → upload bouquet photos → AI analysis → set price → publish.
3. Confirm the listing appears on Browse with a Storage photo URL
   (not a multi-kilobyte data URL).
4. From another browser/incognito: open the listing → **Contact seller**.
5. As owner: **Mark sold**.
6. Browse → **Map** — markers load; listing detail shows approx. area circle.

## Local production-mode testing

```bash
cp .env.example .env.local
# fill NEXT_PUBLIC_SUPABASE_*, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, AI_GATEWAY_API_KEY
npm run dev
```

Leave Supabase vars empty only for CI build checks (no runtime DB). For local
development use `supabase start` and `npm run db:reset` (SQL seed + Storage
photos). To push seed JPEGs into a **cloud** project’s `listing-photos` bucket,
add to `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role from Dashboard → Settings → API>
```

Then:

```bash
npm run seed:storage:remote
```

Do not put `SUPABASE_SERVICE_ROLE_KEY` in Vercel client env — `.env` / CLI only.
