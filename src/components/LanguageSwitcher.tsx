"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type AppLocale } from "@/i18n/routing";

const LOCALE_LABELS: Record<AppLocale, string> = {
  ka: "ქარ",
  en: "EN",
  ru: "RU",
};

/** Compact language switcher — keeps the current path when changing locale. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("Nav");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <label className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        aria-label={t("language")}
        onChange={(e) => {
          router.replace(pathname, { locale: e.target.value as AppLocale });
        }}
        className="h-9 rounded-lg border border-line bg-card px-2 text-[13px] font-semibold text-ink outline-none hover:border-stem/40"
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
