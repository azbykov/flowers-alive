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

## 3. Vercel AI Gateway key

1. Vercel dashboard → **AI Gateway → API Keys** → Create.
2. Copy → `AI_GATEWAY_API_KEY`.
   (Optional local fallback: `OPENAI_API_KEY` — ignored when Gateway is set.)

## 4. Deploy on Vercel

1. [vercel.com/new](https://vercel.com/new) → Import the GitHub repo.
2. Framework: Next.js (auto-detected).
3. Environment variables (Production + Preview):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
   | `AI_GATEWAY_API_KEY` | from AI Gateway |

4. Deploy. Vercel will redeploy on every push to `main` and create a
   preview URL per PR — no Actions deploy step needed.
5. After the first successful deploy, paste the production URL back into
   Supabase Auth URL settings (step 2.4) if you used a placeholder.
6. Optional: attach a custom domain in Vercel → Domains.

## 5. Smoke-test the happy path

1. Open production URL → **Sign in** → **Continue with Google** (or receive
   a magic link by email) → land signed in.
2. **Sell** → upload bouquet photos → AI analysis → set price → publish.
3. Confirm the listing appears on Browse with a Storage photo URL
   (not a multi-kilobyte data URL).
4. From another browser/incognito: open the listing → **Contact seller**.
5. As owner: **Mark sold**.

## Local production-mode testing

```bash
cp .env.example .env.local
# fill NEXT_PUBLIC_SUPABASE_* and AI_GATEWAY_API_KEY
npm run dev
```

Leave Supabase vars empty only for CI build checks (no runtime DB). For local
development use `supabase start` and seed listings via `supabase db reset`.
