import type {
  BouquetAnalysis,
  FlowerType,
  FreshnessReport,
  IdentifiedFlower,
  QualityRating,
} from "@/domain/types";
import { FLOWER_TYPES } from "@/domain/types";
import { aiCopy, flowerLabel } from "./localeCopy";
import type { AiVisionProvider, AnalyzeResult, ImageObservation } from "./types";

/**
 * Independent single-responsibility modules over one shared observation.
 * Cost note: the provider makes ONE vision request per photo set; the modules
 * below are pure and free, so the pipeline stays cheap while each stage can
 * later move to its own model without touching callers.
 */

// -- Flower Identifier --------------------------------------------------------

function identifyFlowers(obs: ImageObservation): IdentifiedFlower[] {
  const known = new Set<string>(FLOWER_TYPES);
  return obs.flowersSeen.map((f) => ({
    type: (known.has(f.type) ? f.type : "other") as FlowerType,
    name: f.name,
    count: f.count,
  }));
}

// -- Bouquet Classifier -------------------------------------------------------

function classifyBouquet(flowers: IdentifiedFlower[]): FlowerType[] {
  const types = [...new Set(flowers.map((f) => f.type))];
  if (types.length === 0) return ["other"];
  if (types.length > 2) return ["mixed", ...types.slice(0, 3)];
  return types;
}

// -- Freshness Estimator ------------------------------------------------------

function estimateFreshness(obs: ImageObservation): FreshnessReport {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const signals = [
    ...obs.petalCondition,
    ...obs.leafCondition,
    ...obs.stemCondition,
  ].slice(0, 6);
  return {
    score: clamp(obs.freshness.score),
    remainingDaysMin: Math.max(0, Math.round(obs.freshness.remainingDaysMin)),
    remainingDaysMax: Math.max(
      Math.max(0, Math.round(obs.freshness.remainingDaysMin)),
      Math.round(obs.freshness.remainingDaysMax),
    ),
    confidence: clamp(obs.freshness.confidence),
    signals,
  };
}

// -- Photo Quality Checker ----------------------------------------------------

function checkPhotoQuality(
  obs: ImageObservation,
  locale: string,
): {
  rating: QualityRating;
  suggestions: string[];
} {
  const copy = aiCopy(locale);
  const suggestions: string[] = [];
  let score = 3;
  if (obs.photo.sharpness === "blurry") {
    score -= 2;
    suggestions.push(copy.blurry);
  } else if (obs.photo.sharpness === "acceptable") {
    score -= 1;
  }
  if (obs.photo.lighting === "dim") {
    score -= 1;
    suggestions.push(copy.dimLight);
  } else if (obs.photo.lighting === "harsh") {
    suggestions.push(copy.harshLight);
  }
  if (obs.photo.framing === "partially cropped") {
    score -= 1;
    suggestions.push(copy.cropped);
  }
  const rating: QualityRating =
    score >= 3 ? "excellent" : score === 2 ? "good" : score === 1 ? "average" : "poor";
  return { rating, suggestions };
}

// -- Listing Assistant --------------------------------------------------------

function composeListing(
  flowers: IdentifiedFlower[],
  types: FlowerType[],
  obs: ImageObservation,
  locale: string,
): { title: string; description: string } {
  const copy = aiCopy(locale);
  const primary = flowers[0];
  const label = primary
    ? primary.name || flowerLabel(primary.type, locale)
    : copy.freshBouquet;
  const colors = obs.colorPalette.slice(0, 2).join(copy.and);
  const title = types.includes("mixed")
    ? copy.mixedWith(label)
    : colors
      ? copy.colored(colors, label)
      : label;
  const parts = [
    primary?.count
      ? copy.countLooking(primary.count, label)
      : copy.looking,
    obs.petalCondition[0] ? `${capitalize(obs.petalCondition[0])}.` : "",
    copy.pickupLine,
  ].filter(Boolean);
  return { title: title.slice(0, 80), description: parts.join(" ") };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function overallListingQuality(
  photo: QualityRating,
  freshness: FreshnessReport,
  damage: string[],
): QualityRating {
  const order: QualityRating[] = ["poor", "average", "good", "excellent"];
  let idx = order.indexOf(photo);
  if (freshness.score < 60) idx = Math.min(idx, 1);
  if (damage.length > 0) idx = Math.max(0, idx - 1);
  return order[Math.max(0, idx)];
}

// -- Orchestrator ---------------------------------------------------------------

export async function analyzeBouquet(
  imagesBase64: string[],
  provider: AiVisionProvider,
  locale: string = "en",
): Promise<AnalyzeResult> {
  const observation = await provider.observe(imagesBase64, locale);

  const flowers = identifyFlowers(observation);
  const flowerTypes = classifyBouquet(flowers);
  const freshness = estimateFreshness(observation);
  const photoQuality = checkPhotoQuality(observation, locale);
  const { title, description } = composeListing(
    flowers,
    flowerTypes,
    observation,
    locale,
  );

  const suggestions = [...photoQuality.suggestions];
  if (observation.visibleDamage.length > 0) {
    suggestions.push(aiCopy(locale).damaged);
  }

  const analysis: BouquetAnalysis = {
    flowers,
    colorPalette: observation.colorPalette.slice(0, 6),
    damageNotes: observation.visibleDamage.slice(0, 8),
    suggestedTitle: title,
    suggestedDescription: description,
    photoQuality: photoQuality.rating,
    listingQuality: overallListingQuality(
      photoQuality.rating,
      freshness,
      observation.visibleDamage,
    ),
    suggestions,
  };

  return { analysis, freshness, provider: provider.name };
}
