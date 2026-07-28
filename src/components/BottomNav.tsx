"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Browse", icon: "🌸" },
  { href: "/sell", label: "Sell", icon: "＋" },
  { href: "/favorites", label: "Saved", icon: "♥" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/sell")) return null; // sell flow stays focused

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex h-16 max-w-2xl items-stretch justify-around">
        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/" || pathname.startsWith("/listings")
              : pathname.startsWith(item.href);
          const isSell = item.href === "/sell";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                active ? "text-stem" : "text-ink-soft"
              }`}
            >
              <span
                className={
                  isSell
                    ? "flex h-8 w-8 items-center justify-center rounded-full bg-stem text-base text-white"
                    : "text-lg"
                }
                aria-hidden
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
