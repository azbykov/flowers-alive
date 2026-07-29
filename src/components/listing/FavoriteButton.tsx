"use client";

import { useTranslations } from "next-intl";
import { toggleFavorite, useFavorite } from "@/lib/client/favorites";

export function FavoriteButton({
  listingId,
  size = "md",
}: {
  listingId: string;
  size?: "md" | "lg";
}) {
  const t = useTranslations("Card");
  const saved = useFavorite(listingId);

  const dim = size === "lg" ? "h-12 w-12 text-2xl" : "h-9 w-9 text-lg";
  return (
    <button
      type="button"
      aria-label={saved ? t("removeFavorite") : t("saveFavorite")}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(listingId);
      }}
      className={`flex ${dim} items-center justify-center rounded-full bg-card/90 shadow-[0_1px_3px_rgb(34_48_42/0.12)] transition-transform active:scale-90`}
    >
      <span className={saved ? "text-like" : "text-faint"} aria-hidden>
        {saved ? "♥" : "♡"}
      </span>
    </button>
  );
}
