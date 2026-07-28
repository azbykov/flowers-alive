"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { config } from "@/lib/config";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";

/**
 * Magic-link sign-in. One email field — no password.
 * In demo mode (no Supabase) this page just explains that sign-in is skipped.
 */
function SignInForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const redirect = new URL("/auth/callback", window.location.origin);
      redirect.searchParams.set("next", next);
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirect.toString(),
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
        We&apos;ll email you a magic link — no password to remember.
      </p>

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
        <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-xl bg-petal-tint px-4 py-3 text-[13px]">
              {error}
            </p>
          )}
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
