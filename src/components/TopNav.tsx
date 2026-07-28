"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthProfile } from "@/lib/client/profile";

const NAV_ITEMS = [
  { href: "/", label: "Browse" },
  { href: "/favorites", label: "Saved" },
  { href: "/profile", label: "Profile" },
];

/** Desktop shell (≥lg) from the desktop handoff; mobile keeps the bottom nav. */
export function TopNav() {
  const pathname = usePathname();
  const { profile, signedIn, loading } = useAuthProfile();
  const initial = profile.displayName.trim().charAt(0).toUpperCase() || "✿";

  return (
    <header className="sticky top-0 z-50 hidden border-b border-line bg-surface/90 backdrop-blur-xl lg:block">
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-7 px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-gradient-to-br from-stem to-stem-deep font-display text-[19px] font-medium text-white">
            S
          </span>
          <span className="font-display text-[19px] font-medium leading-none text-ink">
            Second Life
            <br />
            <span className="text-[12px] text-ink-soft">Flowers</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/listings")
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[11px] px-4 py-[9px] text-[14.5px] ${
                  active
                    ? "bg-stem-tint font-bold text-stem-deep"
                    : "font-semibold text-ink-2 hover:bg-surface-tint"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/"
          className="flex h-11 max-w-[360px] flex-1 items-center gap-2.5 rounded-xl border border-line bg-card px-3.5"
        >
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="var(--faint)" strokeWidth="1.7">
            <circle cx="8" cy="8" r="6" />
            <path d="M12.5 12.5L16 16" strokeLinecap="round" />
          </svg>
          <span className="whitespace-nowrap text-[14.5px] text-faint">
            Search bouquets nearby…
          </span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <Link
            href="/favorites"
            aria-label="Saved bouquets"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-card"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.7" strokeLinejoin="round">
              <path d="M12 20s-7-4.6-7-9.5A3.5 3.5 0 0112 7a3.5 3.5 0 017 3.5C19 15.4 12 20 12 20z" />
            </svg>
          </Link>
          <Link
            href="/sell"
            className="flex h-11 items-center gap-[7px] rounded-xl bg-stem px-[18px] text-[14.5px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(217,131,36,0.7)] hover:bg-stem-deep"
          >
            <svg width="18" height="18" viewBox="0 0 26 26" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
              <path d="M13 6v14M6 13h14" />
            </svg>
            Sell flowers
          </Link>
          {!loading && !signedIn ? (
            <Link
              href="/sign-in"
              className="flex h-11 items-center rounded-xl border border-line bg-card px-4 text-[14px] font-semibold text-ink hover:border-stem/40"
            >
              Sign in
            </Link>
          ) : (
            <Link
              href="/profile"
              aria-label="Profile"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-stem to-stem-deep font-display text-[17px] text-white"
            >
              {initial}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
