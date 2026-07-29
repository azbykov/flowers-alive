"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PublicListing } from "@/domain/types";
import { formatPrice, timeAgo } from "@/domain/format";
import { config } from "@/lib/config";
import {
  saveProfile,
  useAuthProfile,
} from "@/lib/client/profile";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProfilePage() {
  const { profile, loading, signedIn, signOut } = useAuthProfile();
  const [nameEdit, setNameEdit] = useState<string | null>(null);
  const [contactEdit, setContactEdit] = useState<string | null>(null);
  const displayName = nameEdit ?? profile.displayName;
  const contact = contactEdit ?? profile.contact;
  const [saved, setSaved] = useState(false);
  const [mine, setMine] = useState<PublicListing[]>([]);

  useEffect(() => {
    if (!signedIn || profile.id === "server") return;
    void fetch(`/api/listings?sellerId=${profile.id}`)
      .then((res) => res.json())
      .then((data: { listings: PublicListing[] }) => setMine(data.listings));
  }, [signedIn, profile.id]);

  async function markSold(id: string) {
    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "markSold" }),
    });
    if (res.ok) {
      const data = (await res.json()) as { listing: PublicListing };
      setMine((prev) => prev.map((l) => (l.id === id ? data.listing : l)));
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 pt-6 lg:max-w-[752px] lg:pt-11">
        <p className="text-sm text-ink-soft">Loading profile…</p>
      </main>
    );
  }

  if (!config.hasSupabase) {
    return (
      <main className="mx-auto max-w-2xl px-4 pt-6 lg:max-w-[752px] lg:pt-11">
        <h1 className="font-display text-2xl font-medium tracking-tight lg:text-[28px]">
          Profile
        </h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          Configure Supabase in <code className="text-[13px]">.env</code> to use
          profiles and listings.
        </p>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="mx-auto max-w-2xl px-4 pt-6 lg:max-w-[752px] lg:pt-11">
        <h1 className="font-display text-2xl font-medium tracking-tight lg:text-[28px]">
          Profile
        </h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          Sign in to manage your listings and contact details.
        </p>
        <Link href="/sign-in" className="mt-6 inline-block">
          <Button className="!h-12 !rounded-2xl">Sign in with email</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pt-6 lg:max-w-[752px] lg:pt-11">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight lg:text-[28px]">
            Profile
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            Used to prefill your listings. Synced to your account.
          </p>
        </div>
        {signedIn && (
          <button
            type="button"
            onClick={() => void signOut()}
            className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:border-stem/40"
          >
            Sign out
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        <Field label="Name">
          <TextInput
            value={displayName}
            onChange={(e) => setNameEdit(e.target.value)}
            placeholder="How buyers see you"
          />
        </Field>
        <Field label="Contact (phone or @telegram)">
          <TextInput
            value={contact}
            onChange={(e) => setContactEdit(e.target.value)}
            placeholder="Shared only when a buyer taps Contact"
          />
        </Field>
        <Button
          variant="secondary"
          onClick={() => {
            saveProfile({ displayName, contact });
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
          }}
        >
          {saved ? "Saved ✓" : "Save profile"}
        </Button>
      </div>

      <h2 className="mt-8 font-display text-[20px] font-medium">My listings</h2>
      {mine.length === 0 ? (
        <EmptyState
          message="Nothing here yet — sell your first bouquet in under a minute."
          action={
            <Link href="/sell">
              <Button>Sell a bouquet</Button>
            </Link>
          }
        />
      ) : (
        <ul className="mt-3 space-y-2">
          {mine.map((listing) => (
            <li
              key={listing.id}
              className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-[0_1px_3px_rgb(34_48_42/0.06)]"
            >
              {listing.photos[0] && (
                // eslint-disable-next-line @next/next/no-img-element -- data URLs / storage URLs
                <img
                  src={listing.photos[0].src}
                  alt=""
                  className="h-14 w-14 rounded-xl object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/listings/${listing.id}`}
                  className="block truncate text-[15px] font-medium"
                >
                  {listing.title}
                </Link>
                <p className="text-[13px] text-ink-soft">
                  {formatPrice(listing.priceCents, listing.currency)} ·{" "}
                  {timeAgo(listing.createdAt)}
                </p>
              </div>
              {listing.status === "active" ? (
                <button
                  onClick={() => void markSold(listing.id)}
                  className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:border-stem/40"
                >
                  Mark sold
                </button>
              ) : (
                <span className="shrink-0 rounded-full bg-stem-tint px-3 py-1.5 text-[13px] font-medium text-stem">
                  Sold
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
