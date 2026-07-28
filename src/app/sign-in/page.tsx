"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { config } from "@/lib/config";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

/**
 * Sign-in with Google (one tap) or a magic-link email — no passwords.
 * In demo mode (no Supabase) this page just explains that sign-in is skipped.
 */
function SignInForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(() =>
    searchParams.get("error") ? "That sign-in link expired or was already used — try again." : "",
  );

  function callbackUrl() {
    const redirect = new URL("/auth/callback", window.location.origin);
    redirect.searchParams.set("next", next);
    return redirect.toString();
  }

  async function onGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl() },
      });
      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
      // On success the browser navigates to Google — no need to reset loading.
    } catch {
      setError("Could not start Google sign-in — try again in a moment.");
      setGoogleLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: callbackUrl(),
        },
      });
      if (signInError) {
        setError(signInError.message);
      } else {
        setSent(true);
      }
    } catch {
      setError("Could not send the link — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  if (!config.hasSupabase) {
    return (
      <main className="mx-auto max-w-[480px] px-4 pb-16 pt-10">
        <h1 className="font-display text-[28px] font-medium">Sign in</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Demo mode has no accounts — your profile lives on this device. Sign-in
          appears once Supabase is configured.
        </p>
        <Link href="/profile" className="mt-6 inline-block">
          <Button>Go to profile</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[480px] px-4 pb-16 pt-10">
      <h1 className="font-display text-[28px] font-medium">Sign in</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
        Continue with Google, or we&apos;ll email you a magic link — no
        password to remember.
      </p>

      {!sent && error && (
        <p className="mt-6 rounded-xl bg-petal-tint px-4 py-3 text-[13px]">
          {error}
        </p>
      )}

      {sent ? (
        <div className="mt-8 rounded-2xl border border-[#dbead9] bg-[#f2f7ef] p-5">
          <div className="text-[15px] font-semibold text-[#3a4a38]">
            Check your email
          </div>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[#5a6a55]">
            We sent a sign-in link to <strong>{email}</strong>. Open it on this
            device to continue.
          </p>
        </div>
      ) : (
        <>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            loading={googleLoading}
            onClick={() => void onGoogleSignIn()}
            className="mt-6 !h-14 !rounded-2xl !text-base"
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-[12px] font-medium uppercase tracking-wide text-ink-soft">
              or with email
            </span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
            <Field label="Email">
              <TextInput
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="!h-14 !rounded-2xl !text-base"
            >
              Email me a link
            </Button>
          </form>
        </>
      )}
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-[480px] px-4 pb-16 pt-10">
          <p className="text-sm text-ink-soft">Loading…</p>
        </main>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
