"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type {
  BouquetAnalysis,
  Coordinates,
  FlowerType,
  FreshnessReport,
  PickupMethod,
  PublicListing,
} from "@/domain/types";
import { FLOWER_TYPES, PICKUP_METHODS } from "@/domain/types";
import { APP_CURRENCY } from "@/domain/currency";
import { formatPrice } from "@/domain/format";
import { remainingDaysLabel } from "@/domain/freshness";
import { getProfile, saveProfile, useAuthProfile } from "@/lib/client/profile";
import {
  getSellerCoordinates,
  resolveSellerNeighborhood,
} from "@/lib/client/sellerLocation";
import { removeListingPhotos, uploadListingPhotos } from "@/lib/client/storage";
import { config } from "@/lib/config";
import { freshColor } from "@/components/listing/freshness";
import { PhotoUpload, type PhotoItem } from "@/components/listing/PhotoUpload";
import { PickupMapPicker } from "@/components/map/lazy";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Field, TextArea, TextInput } from "@/components/ui/Field";

interface AiResult {
  analysis: BouquetAnalysis;
  freshness: FreshnessReport;
}

type Step = "photos" | "analyzing" | "ai" | "details" | "review" | "success";

const STEP_PCT: Record<Step, string> = {
  photos: "33%",
  analyzing: "33%",
  ai: "66%",
  details: "66%",
  review: "100%",
  success: "100%",
};

type LocationStatus = "idle" | "loading" | "ready" | "denied" | "error";

export default function SellPage() {
  const t = useTranslations("Sell");
  const tFlowers = useTranslations("Flowers");
  const tPickup = useTranslations("Pickup");
  const tQuality = useTranslations("Quality");
  const locale = useLocale();
  const router = useRouter();
  const { profile: authProfile, signedIn, loading: authLoading } = useAuthProfile();
  const [step, setStep] = useState<Step>("photos");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [ai, setAi] = useState<AiResult | null>(null);
  const [aiError, setAiError] = useState(false);
  const aiPromise = useRef<Promise<AiResult | null> | null>(null);
  const analyzedFor = useRef("");
  const [tick, setTick] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [locationError, setLocationError] = useState("");
  const [flowerTypes, setFlowerTypes] = useState<FlowerType[]>(["other"]);
  const [pickup, setPickup] = useState<PickupMethod[]>(["meet"]);
  const [sellerName, setSellerName] = useState("");
  const [sellerContact, setSellerContact] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [published, setPublished] = useState<PublicListing | null>(null);
  const prefilled = useRef(false);
  const geocodeDebounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  const analyzeSteps = [
    t("stepDetect"),
    t("stepIdentify"),
    t("stepFreshness"),
    t("stepQuality"),
  ];

  const stepLabel: Record<Step, string> = {
    photos: "1/3",
    analyzing: "1/3",
    ai: "2/3",
    details: "2/3",
    review: "3/3",
    success: t("stepDone"),
  };

  useEffect(() => {
    // Hydration-safe prefill from profile — must run after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSellerName(authProfile.displayName || getProfile().displayName);
    setSellerContact(authProfile.contact || getProfile().contact);
  }, [authProfile.displayName, authProfile.contact]);

  // Analysis starts as soon as photos change — the analyzing screen usually
  // just catches up with a request that is already in flight.
  useEffect(() => {
    if (photos.length === 0) {
      prefilled.current = false;
      return;
    }
    const key = photos.map((p) => p.preview.length).join(",");
    if (analyzedFor.current === key) return;
    analyzedFor.current = key;
    prefilled.current = false;
    setAiError(false);
    aiPromise.current = fetch("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        images: photos.map((p) => p.preview),
        locale,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return (await res.json()) as AiResult;
      })
      .catch(() => {
        setAiError(true);
        return null;
      });
  }, [photos, locale]);

  // Analyzing screen: advance the checklist, then move on when the result lands.
  useEffect(() => {
    if (step !== "analyzing") return;
    const interval = setInterval(
      () => setTick((t) => Math.min(t + 1, analyzeSteps.length - 1)),
      600,
    );
    const started = Date.now();
    void (aiPromise.current ?? Promise.resolve(null)).then((result) => {
      const wait = Math.max(0, 1500 - (Date.now() - started));
      setTimeout(() => {
        if (result) {
          setAi(result);
          setFlowerTypes([...new Set(result.analysis.flowers.map((f) => f.type))]);
          if (!prefilled.current) {
            prefilled.current = true;
            setTitle(result.analysis.suggestedTitle);
            setDescription(result.analysis.suggestedDescription);
          }
          setStep("ai");
        } else {
          goToDetails();
        }
      }, wait);
    });
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mirror original: only re-run on step
  }, [step]);

  async function requestLocation() {
    setLocationStatus("loading");
    setLocationError("");
    try {
      const coords = await getSellerCoordinates();
      setCoordinates(coords);
      const area = await resolveSellerNeighborhood(coords);
      setNeighborhood(area);
      setLocationStatus("ready");
    } catch (err) {
      setLocationStatus("denied");
      setLocationError(
        err instanceof Error ? err.message : "Could not detect your location.",
      );
    }
  }

  function onPickupPinChange(coords: Coordinates) {
    setCoordinates(coords);
    clearTimeout(geocodeDebounce.current);
    geocodeDebounce.current = setTimeout(() => {
      void resolveSellerNeighborhood(coords)
        .then((area) => setNeighborhood(area))
        .catch(() => {
          /* keep editable label; pin position is what matters for distance */
        });
    }, 400);
  }

  function goToDetails() {
    setStep("details");
    if (!coordinates) void requestLocation();
  }

  function retryAnalyze() {
    analyzedFor.current = "";
    setAiError(false);
    setAi(null);
    setTick(0);
    setPhotos((prev) => [...prev]);
    setStep("analyzing");
  }

  function goBack() {
    if (step === "ai") setStep("photos");
    else if (step === "details") setStep(ai ? "ai" : "photos");
    else if (step === "review") setStep("details");
  }

  async function publish() {
    if (!config.hasSupabase) {
      setPublishError(t("errConfigure"));
      return;
    }
    if (!signedIn) {
      router.push("/sign-in?next=/sell");
      return;
    }
    if (!coordinates) {
      setPublishError(t("errLocation"));
      setStep("details");
      return;
    }
    setPublishing(true);
    setPublishError("");
    saveProfile({ displayName: sellerName, contact: sellerContact });

    let uploadedPaths: string[] = [];
    try {
      const userId = authProfile.id;
      if (!userId || userId === "server") {
        throw new Error(t("errSignIn"));
      }
      uploadedPaths = await uploadListingPhotos(
        photos.map((p) => p.blob),
        userId,
      );

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priceCents: Math.round(Number(price || "0") * 100),
          currency: APP_CURRENCY,
          flowerTypes,
          photos: uploadedPaths,
          neighborhood,
          coordinates,
          pickupMethods: pickup,
          sellerName,
          sellerContact,
          freshness: ai?.freshness ?? null,
          analysis: ai?.analysis ?? null,
        }),
      });
      if (!res.ok) {
        await removeListingPhotos(uploadedPaths);
        uploadedPaths = [];
        const data = (await res.json().catch(() => null)) as {
          issues?: { message: string }[];
          error?: string;
        } | null;
        if (res.status === 401) {
          router.push("/sign-in?next=/sell");
          return;
        }
        setPublishError(
          data?.issues?.[0]?.message ?? data?.error ?? t("errPublish"),
        );
        setStep("details");
        return;
      }
      const data = (await res.json()) as { listing: PublicListing };
      setPublished(data.listing);
      setStep("success");
    } catch (err) {
      if (uploadedPaths.length > 0) {
        await removeListingPhotos(uploadedPaths);
      }
      setPublishError(
        err instanceof Error ? err.message : t("errRetry"),
      );
      setStep("details");
    } finally {
      setPublishing(false);
    }
  }

  const detailsValid =
    title.trim().length >= 3 &&
    Number(price) > 0 &&
    sellerName.trim().length > 0 &&
    sellerContact.trim().length >= 3 &&
    neighborhood.trim().length >= 2 &&
    coordinates !== null &&
    flowerTypes.length > 0;
  const color = ai ? freshColor(ai.freshness.score) : "var(--fresh-very)";

  return (
    <main className="mx-auto max-w-[608px] px-4 pb-16 pt-6 lg:pt-9">
      {!config.hasSupabase && (
        <div className="mb-6 rounded-2xl border border-line bg-surface-tint p-4 text-[14px] text-ink-2">
          {t("noSupabase")}
        </div>
      )}
      {/* Progress header */}
      {step !== "success" && (
        <div className="mb-6 flex items-center gap-4">
          {step === "photos" || step === "analyzing" ? (
            <Link
              href="/"
              aria-label={t("cancel")}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-line bg-card text-lg text-ink"
            >
              ×
            </Link>
          ) : (
            <button
              onClick={goBack}
              aria-label={t("back")}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-line bg-card text-lg text-ink"
            >
              ‹
            </button>
          )}
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-track">
            <div
              className="h-full bg-stem transition-[width] duration-300"
              style={{ width: STEP_PCT[step] }}
            />
          </div>
          <span className="font-data text-[13px] text-ink-soft">
            {stepLabel[step]}
          </span>
        </div>
      )}

      {step === "photos" && (
        <section>
          <h1 className="font-display text-[30px] font-medium leading-tight">
            {t("photosTitle")}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            {t("photosSubtitle")}
          </p>
          <div className="mt-6">
            <PhotoUpload photos={photos} onChange={setPhotos} />
          </div>
          <div className="mt-[18px] flex items-start gap-2.5 rounded-[14px] bg-surface-tint px-4 py-3.5">
            <span aria-hidden>💡</span>
            <span className="text-[13.5px] leading-normal text-ink-2">
              {t("photosTip")}
            </span>
          </div>
          <Button
            fullWidth
            className="mt-6 !h-14 !rounded-2xl !text-base"
            disabled={photos.length === 0}
            onClick={() => {
              setTick(0);
              setStep("analyzing");
            }}
          >
            {t("analyze")}
          </Button>
        </section>
      )}

      {step === "analyzing" && (
        <section className="flex flex-col items-center py-10 text-center">
          <div className="relative h-[120px] w-[120px]">
            <div className="absolute inset-0 overflow-hidden rounded-full bg-surface-tint">
              {photos[0] && (
                // eslint-disable-next-line @next/next/no-img-element -- data URLs
                <img
                  src={photos[0].preview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="absolute -inset-2 animate-spin rounded-full border-[3px] border-track border-t-stem" />
          </div>
          <h1 className="mt-7 font-display text-[26px] font-medium">
            {t("analyzingTitle")}
          </h1>
          <div className="mt-5 flex flex-col items-start gap-3">
            {analyzeSteps.map((label, i) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 text-[14.5px] ${
                  i < tick ? "text-ink-2" : i === tick ? "font-medium text-ink" : "text-faint"
                }`}
              >
                <span
                  className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[11px] text-white ${
                    i < tick ? "bg-fresh-high" : i === tick ? "bg-stem" : "bg-line"
                  }`}
                >
                  {i < tick ? "✓" : ""}
                </span>
                {label}
              </div>
            ))}
          </div>
        </section>
      )}

      {step === "ai" && ai && (
        <section>
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              ✨
            </span>
            <h1 className="font-display text-[28px] font-medium">
              {t("aiTitle")}
            </h1>
          </div>

          <div className="mt-5 rounded-[18px] border border-line bg-card p-[18px]">
            <div className="mb-3.5 text-[12px] font-bold uppercase tracking-[0.5px] text-muted">
              {t("recognized")}
            </div>
            {ai.analysis.flowers.map((f) => (
              <div key={f.name || f.type} className="mb-3 flex items-center gap-3">
                <span className="h-[38px] w-[38px] overflow-hidden rounded-[10px] bg-surface-tint">
                  {photos[0] && (
                    // eslint-disable-next-line @next/next/no-img-element -- data URLs
                    <img
                      src={photos[0].preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>
                <span className="flex-1 text-[15px] font-semibold">
                  {f.name || tFlowers(f.type)}
                </span>
                {f.count && (
                  <span className="font-data text-[12px] font-bold text-fresh-high">
                    ×{f.count}
                  </span>
                )}
              </div>
            ))}
            <div className="text-[12px] text-faint">
              {t("overallConfidence", { pct: ai.freshness.confidence })}
            </div>
          </div>

          <div className="mt-3.5 rounded-[18px] border border-[#dbead9] bg-[#f2f7ef] p-[18px]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-[0.5px] text-fresh-high">
                {t("freshnessQuality")}
              </span>
              <span className="rounded-full bg-fresh-high px-2.5 py-1 text-[12px] font-bold text-white">
                {tQuality(ai.analysis.listingQuality)}
              </span>
            </div>
            <div className="flex items-center gap-[18px]">
              <div className="font-data text-[34px] font-bold leading-none" style={{ color }}>
                {ai.freshness.score}%
              </div>
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-[#e2ecdd]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${ai.freshness.score}%`, background: color }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[13px]">
                  <span className="text-[#5a6a55]">{t("lastsAbout")}</span>
                  <span className="font-bold text-[#3a4a38]">
                    {remainingDaysLabel(ai.freshness, locale)}
                  </span>
                </div>
              </div>
            </div>
            {(ai.analysis.suggestions.length > 0 ||
              ai.analysis.damageNotes.length > 0) && (
              <div className="mt-3 space-y-1.5 border-t border-[#dbead9] pt-3">
                {ai.analysis.damageNotes.map((note) => (
                  <div key={note} className="flex gap-2 text-[13px] text-ink-2">
                    <span className="text-stem" aria-hidden>
                      →
                    </span>
                    {note}
                  </div>
                ))}
                {ai.analysis.suggestions.map((s) => (
                  <div key={s} className="flex gap-2 text-[13px] text-ink-2">
                    <span className="text-stem" aria-hidden>
                      →
                    </span>
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            fullWidth
            className="mt-5 !h-14 !rounded-2xl !text-base"
            onClick={() => goToDetails()}
          >
            {t("looksRight")}
          </Button>
        </section>
      )}

      {step === "details" && (
        <section className="space-y-4">
          <div>
            <h1 className="font-display text-[28px] font-medium">
              {t("detailsTitle")}
            </h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              {ai
                ? t("detailsPrefill")
                : aiError
                  ? t("detailsAiFail")
                  : t("detailsManual")}
            </p>
          </div>
          {publishError && (
            <p className="rounded-xl bg-petal-tint px-4 py-3 text-[13px]">
              {publishError}
            </p>
          )}
          {(aiError || !ai) && (
            <div>
              <span className="mb-1.5 block text-[13px] font-medium">
                {t("flowerType")}
              </span>
              <div className="flex flex-wrap gap-2">
                {FLOWER_TYPES.map((type) => (
                  <Chip
                    key={type}
                    label={tFlowers(type)}
                    selected={flowerTypes.includes(type)}
                    onClick={() =>
                      setFlowerTypes((prev) =>
                        prev.includes(type)
                          ? prev.length > 1
                            ? prev.filter((ft) => ft !== type)
                            : prev
                          : [...prev, type],
                      )
                    }
                  />
                ))}
              </div>
              {aiError && (
                <button
                  type="button"
                  onClick={retryAnalyze}
                  className="mt-3 text-[13px] font-semibold text-stem hover:text-stem-deep"
                >
                  {t("retryAi")}
                </button>
              )}
            </div>
          )}
          <Field label={ai ? t("titleAi") : t("title")}>
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder={t("titlePlaceholder")}
            />
          </Field>
          <Field label={ai ? t("descriptionAi") : t("description")}>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={600}
            />
          </Field>
          <div>
            <span className="mb-1.5 block text-[13px] font-medium">
              {t("yourPrice")}
            </span>
            <div
              className={`flex h-[66px] items-center gap-1.5 rounded-[14px] border bg-card px-[18px] ${
                Number(price) > 0 ? "border-fresh-high" : "border-line"
              }`}
            >
              <span className="text-[26px] font-bold text-ink-soft">₾</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9.,]/g, ""))}
                inputMode="decimal"
                placeholder="0"
                className="w-full bg-transparent text-[28px] font-bold text-ink outline-none placeholder:text-faint"
              />
            </div>
            <p className="mt-1.5 text-xs text-faint">{t("priceHint")}</p>
          </div>
          <div>
            <Field label={t("pickupArea")}>
              <TextInput
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder={
                  locationStatus === "loading"
                    ? t("detectingArea")
                    : t("neighborhoodPlaceholder")
                }
                disabled={locationStatus === "loading"}
              />
            </Field>
            {locationStatus === "loading" && (
              <p className="mt-1.5 text-xs text-ink-soft">{t("usingLocation")}</p>
            )}
            {(locationStatus === "denied" || locationStatus === "error") && (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-petal">
                  {locationError || t("locationRequired")}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setCoordinates(null);
                    void requestLocation();
                  }}
                >
                  {t("allowLocation")}
                </Button>
              </div>
            )}
            {locationStatus === "ready" && coordinates && (
              <>
                <PickupMapPicker
                  coordinates={coordinates}
                  onChange={onPickupPinChange}
                />
                <p className="mt-1.5 text-xs text-faint">{t("pinHint")}</p>
              </>
            )}
            {locationStatus === "ready" && !coordinates && (
              <p className="mt-1.5 text-xs text-faint">{t("areaHint")}</p>
            )}
          </div>
          <div>
            <span className="mb-1.5 block text-[13px] font-medium">
              {t("pickup")}
            </span>
            <div className="flex flex-wrap gap-2">
              {PICKUP_METHODS.map((method) => (
                <Chip
                  key={method}
                  label={tPickup(method)}
                  selected={pickup.includes(method)}
                  onClick={() =>
                    setPickup((prev) =>
                      prev.includes(method)
                        ? prev.length > 1
                          ? prev.filter((m) => m !== method)
                          : prev
                        : [...prev, method],
                    )
                  }
                />
              ))}
            </div>
          </div>
          <Field label={t("yourName")}>
            <TextInput
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder={t("namePlaceholder")}
            />
          </Field>
          <Field label={t("contact")}>
            <TextInput
              value={sellerContact}
              onChange={(e) => setSellerContact(e.target.value)}
              placeholder={t("contactPlaceholder")}
            />
          </Field>
          <Button
            fullWidth
            className="!mt-6 !h-14 !rounded-2xl !text-base"
            disabled={!detailsValid}
            onClick={() => setStep("review")}
          >
            {t("previewListing")}
          </Button>
        </section>
      )}

      {step === "review" && (
        <section>
          <h1 className="font-display text-[26px] font-medium">
            {t("reviewTitle")}
          </h1>

          <div className="mt-[18px] max-w-[320px] overflow-hidden rounded-[20px] border border-line bg-card">
            <div className="relative aspect-[4/3] bg-surface-tint">
              {photos[0] && (
                // eslint-disable-next-line @next/next/no-img-element -- data URLs
                <img
                  src={photos[0].preview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
              {ai && (
                <div className="absolute left-2.5 top-2.5 flex items-center gap-[5px] rounded-full bg-white/[.92] px-[9px] py-[5px]">
                  <span className="h-[7px] w-[7px] rounded-full" style={{ background: color }} />
                  <span className="font-data text-[11px] font-bold" style={{ color }}>
                    {ai.freshness.score}%
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-display text-[19px]">{title}</span>
                <span className="whitespace-nowrap text-[17px] font-bold">
                  {formatPrice(
                    Math.round(Number(price) * 100),
                    locale,
                    APP_CURRENCY,
                  )}
                </span>
              </div>
              <div className="mt-1 text-[13px] text-ink-soft">
                {neighborhood}
                {ai &&
                  ` · ${t("lasts", { days: remainingDaysLabel(ai.freshness, locale) })}`}
              </div>
            </div>
          </div>

          {ai && (
            <div className="mt-[18px] flex items-center gap-2.5 rounded-2xl border border-[#dbead9] bg-[#f2f7ef] p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-fresh-high text-[15px] text-white">
                ✓
              </span>
              <div>
                <div className="text-sm font-bold text-[#3a4a38]">
                  {t("listingQuality", {
                    quality: tQuality(ai.analysis.listingQuality),
                  })}
                </div>
                <div className="text-[12.5px] text-[#5a6a55]">{t("buyersSee")}</div>
              </div>
            </div>
          )}

          {config.hasSupabase && !authLoading && !signedIn && (
            <div className="mt-[18px] rounded-2xl border border-line bg-surface-tint p-4 text-left">
              <p className="text-[14px] text-ink-2">{t("needSignIn")}</p>
              <Link href="/sign-in?next=/sell" className="mt-3 inline-block">
                <Button variant="secondary">{t("signIn")}</Button>
              </Link>
            </div>
          )}

          <Button
            fullWidth
            className="mt-6 !h-14 !rounded-2xl !text-base"
            loading={publishing}
            disabled={!config.hasSupabase || !signedIn}
            onClick={() => void publish()}
          >
            {t("publish")}
          </Button>
        </section>
      )}

      {step === "success" && published && (
        <section className="flex flex-col items-center py-10 text-center">
          <div className="flex h-24 w-24 animate-[slfpop_.5s_ease-out] items-center justify-center rounded-full bg-fresh-high">
            <svg width="46" height="46" viewBox="0 0 46 46" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 24l7 7 14-15" />
            </svg>
          </div>
          <h1 className="mt-6 font-display text-[30px] font-medium">
            {t("liveTitle")}
          </h1>
          <p className="mt-2.5 max-w-[340px] text-[15px] leading-relaxed text-ink-soft">
            {t("liveSubtitle")}
          </p>
          <div className="mt-8 flex w-full max-w-[320px] flex-col gap-3">
            <Link href={`/listings/${published.id}`}>
              <Button fullWidth className="!h-14 !rounded-2xl !text-base">
                {t("viewListing")}
              </Button>
            </Link>
            <Link href="/">
              <Button fullWidth variant="ghost">
                {t("backToBrowse")}
              </Button>
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
