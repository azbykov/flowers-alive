"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { hasAnyContact, normalizeTelegram } from "@/domain/contacts";
import { profileContactsSchema } from "@/domain/validation";
import { config } from "@/lib/config";
import { saveProfile, useAuthProfile } from "@/lib/client/profile";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";

export default function ProfileEditPage() {
  const t = useTranslations("Profile");
  const router = useRouter();
  const { profile, loading, signedIn } = useAuthProfile();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!config.hasSupabase || !signedIn) {
      router.replace("/sign-in?next=/profile/edit");
      return;
    }
    setDisplayName(profile.displayName);
    setPhone(profile.phone);
    setTelegram(profile.telegram ? `@${profile.telegram}` : "");
    setWhatsapp(profile.whatsapp);
    setHydrated(true);
  }, [
    loading,
    signedIn,
    profile.displayName,
    profile.phone,
    profile.telegram,
    profile.whatsapp,
    router,
  ]);

  async function onSave() {
    setError("");
    const parsed = profileContactsSchema.safeParse({
      displayName,
      phone,
      telegram: normalizeTelegram(telegram),
      whatsapp,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t("saveError"));
      return;
    }
    if (
      !hasAnyContact({
        phone: parsed.data.phone,
        telegram: parsed.data.telegram,
        whatsapp: parsed.data.whatsapp,
      })
    ) {
      setError(t("needContact"));
      return;
    }
    setSaving(true);
    saveProfile({
      displayName: parsed.data.displayName,
      phone: parsed.data.phone,
      telegram: parsed.data.telegram,
      whatsapp: parsed.data.whatsapp,
    });
    setSaved(true);
    setSaving(false);
    setTimeout(() => router.push("/profile"), 600);
  }

  if (loading || !hydrated) {
    return (
      <main className="mx-auto max-w-2xl px-4 pt-6 lg:max-w-[752px] lg:pt-11">
        <p className="text-sm text-ink-soft">{t("loading")}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-10 pt-6 lg:max-w-[752px] lg:pt-11">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card text-lg text-ink"
          aria-label={t("back")}
        >
          ‹
        </Link>
        <h1 className="font-display text-[22px] font-medium text-ink">
          {t("editTitle")}
        </h1>
      </div>

      <p className="mt-3 text-[14px] text-ink-soft">{t("editSubtitle")}</p>

      <div className="mt-5 space-y-4">
        <Field label={t("name")}>
          <TextInput
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t("namePlaceholder")}
          />
        </Field>
        <Field label={t("phone")}>
          <TextInput
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("phonePlaceholder")}
            autoComplete="tel"
          />
        </Field>
        <Field label={t("telegram")}>
          <TextInput
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
            placeholder={t("telegramPlaceholder")}
            autoComplete="username"
          />
        </Field>
        <Field label={t("whatsapp")}>
          <TextInput
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder={t("whatsappPlaceholder")}
          />
        </Field>
        <p className="text-[13px] text-ink-soft">{t("contactHint")}</p>
        {error && <p className="text-[14px] text-petal">{error}</p>}
        <Button
          fullWidth
          className="!h-12 !rounded-2xl"
          loading={saving}
          onClick={() => void onSave()}
        >
          {saved ? t("saved") : t("save")}
        </Button>
      </div>
    </main>
  );
}
