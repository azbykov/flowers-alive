"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type { PublicListing } from "@/domain/types";
import { hasAnyContact } from "@/domain/contacts";
import { formatPrice, timeAgo } from "@/domain/format";
import { config } from "@/lib/config";
import { getFavoriteIds } from "@/lib/client/favorites";
import { useAuthProfile } from "@/lib/client/profile";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserAvatar } from "@/components/ui/UserAvatar";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const locale = useLocale();
  const router = useRouter();
  const { profile, loading, signedIn, signOut } = useAuthProfile();
  const [mine, setMine] = useState<PublicListing[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (!signedIn || profile.id === "server") return;
    void fetch(`/api/listings?sellerId=${profile.id}`)
      .then((res) => res.json())
      .then((data: { listings: PublicListing[] }) => setMine(data.listings));
  }, [signedIn, profile.id]);

  useEffect(() => {
    setSavedCount(getFavoriteIds().length);
    const onChange = () => setSavedCount(getFavoriteIds().length);
    window.addEventListener("slf:favorites-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("slf:favorites-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

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

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 pt-6 lg:max-w-[752px] lg:pt-11">
        <p className="text-sm text-ink-soft">{t("loading")}</p>
      </main>
    );
  }

  if (!config.hasSupabase) {
    return (
      <main className="mx-auto max-w-2xl px-4 pt-6 lg:max-w-[752px] lg:pt-11">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-2xl font-medium tracking-tight lg:text-[28px]">
            {t("title")}
          </h1>
          <LanguageSwitcher />
        </div>
        <p className="mt-2 text-[15px] text-ink-soft">{t("noSupabase")}</p>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="mx-auto max-w-2xl px-4 pt-6 lg:max-w-[752px] lg:pt-11">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-2xl font-medium tracking-tight lg:text-[28px]">
            {t("title")}
          </h1>
          <LanguageSwitcher />
        </div>
        <p className="mt-2 text-[15px] text-ink-soft">{t("signInPrompt")}</p>
        <Link href="/sign-in" className="mt-6 inline-block">
          <Button className="!h-12 !rounded-2xl">{t("signInEmail")}</Button>
        </Link>
      </main>
    );
  }

  const displayName = profile.displayName.trim() || t("unnamed");
  const listed = mine.filter((l) => l.status === "active").length;
  const given = mine.filter((l) => l.status === "sold").length;
  const contacts = {
    phone: profile.phone,
    telegram: profile.telegram,
    whatsapp: profile.whatsapp,
  };
  const contactFilled = hasAnyContact(contacts);

  const contactLines: string[] = [];
  if (profile.phone) contactLines.push(t("phoneValue", { value: profile.phone }));
  if (profile.telegram)
    contactLines.push(t("telegramValue", { value: `@${profile.telegram}` }));
  if (profile.whatsapp)
    contactLines.push(t("whatsappValue", { value: profile.whatsapp }));

  const menu = [
    { href: "/profile/edit" as const, label: t("editProfile"), icon: "✎" },
    { href: "/favorites" as const, label: t("menuSaved"), icon: "♥" },
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 pb-10 pt-6 lg:max-w-[752px] lg:pt-11">
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>

      <div className="mt-2 text-center">
        <UserAvatar
          name={displayName}
          src={profile.avatarUrl}
          size="xl"
          className="mx-auto"
        />
        <h1 className="mt-3 font-display text-[23px] font-medium tracking-tight text-ink">
          {displayName}
        </h1>
        {profile.email && (
          <p className="mt-1 text-[13px] text-ink-soft">{profile.email}</p>
        )}
      </div>

      <div className="mt-5 flex overflow-hidden rounded-2xl border border-line bg-card">
        {[
          { n: listed, label: t("statListed") },
          { n: given, label: t("statGiven") },
          { n: savedCount, label: t("statSaved") },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`flex-1 py-4 text-center ${i < 2 ? "border-r border-line" : ""}`}
          >
            <div className="font-mono text-[22px] font-bold text-ink">{stat.n}</div>
            <div className="mt-0.5 text-[12px] text-ink-soft">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-card">
        <div className="border-b border-line px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-semibold uppercase tracking-wide text-ink-soft">
              {t("contacts")}
            </span>
            <Link
              href="/profile/edit"
              className="text-[13px] font-semibold text-stem hover:underline"
            >
              {t("edit")}
            </Link>
          </div>
          {contactFilled ? (
            <ul className="mt-2 space-y-1 text-[15px] text-ink">
              {contactLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[14px] text-ink-soft">{t("contactsEmpty")}</p>
          )}
        </div>
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3.5 border-b border-line px-4 py-4 last:border-b-0 hover:bg-surface-tint/60"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-surface-tint text-base">
              {item.icon}
            </span>
            <span className="flex-1 text-[15px] font-semibold text-ink">
              {item.label}
            </span>
            <span className="text-lg text-ink-soft">›</span>
          </Link>
        ))}
      </div>

      <h2 className="mt-8 font-display text-[20px] font-medium">
        {t("myListings")}
      </h2>
      {mine.length === 0 ? (
        <EmptyState
          message={t("empty")}
          action={
            <Link href="/sell">
              <Button>{t("sellCta")}</Button>
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
                  {formatPrice(listing.priceCents, locale, listing.currency)} ·{" "}
                  {timeAgo(listing.createdAt, locale)}
                </p>
              </div>
              {listing.status === "active" ? (
                <button
                  type="button"
                  onClick={() => void markSold(listing.id)}
                  className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:border-stem/40"
                >
                  {t("markSold")}
                </button>
              ) : (
                <span className="shrink-0 rounded-full bg-stem-tint px-3 py-1.5 text-[13px] font-medium text-stem">
                  {t("sold")}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <Button
          fullWidth
          variant="secondary"
          className="!h-[52px] !rounded-[14px] !border-line !text-petal hover:!border-petal/40"
          onClick={() => void handleSignOut()}
        >
          {t("signOut")}
        </Button>
      </div>
    </main>
  );
}
