import type { AiVisionProvider, ImageObservation } from "./types";

/**
 * Deterministic stand-in for the vision model in demo mode: derives a stable
 * pseudo-observation from the image bytes so the same photo always yields the
 * same analysis. Zero cost, zero network.
 */

const SAMPLE_FLOWERS: Record<
  string,
  ImageObservation["flowersSeen"][]
> = {
  en: [
    [{ type: "roses", name: "Roses", count: 11 }],
    [{ type: "tulips", name: "Tulips", count: 15 }],
    [{ type: "peonies", name: "Peonies", count: 7 }],
    [
      { type: "roses", name: "Roses", count: 5 },
      { type: "lilies", name: "Lilies", count: 3 },
      { type: "chrysanthemums", name: "Chrysanthemums", count: 4 },
    ],
    [{ type: "hydrangeas", name: "Hydrangeas", count: 3 }],
    [{ type: "sunflowers", name: "Sunflowers", count: 9 }],
  ],
  ka: [
    [{ type: "roses", name: "ვარდები", count: 11 }],
    [{ type: "tulips", name: "ტიტები", count: 15 }],
    [{ type: "peonies", name: "პიონები", count: 7 }],
    [
      { type: "roses", name: "ვარდები", count: 5 },
      { type: "lilies", name: "შროშანები", count: 3 },
      { type: "chrysanthemums", name: "ქრიზანთემები", count: 4 },
    ],
    [{ type: "hydrangeas", name: "ჰორტენზიები", count: 3 }],
    [{ type: "sunflowers", name: "მზესუმზირები", count: 9 }],
  ],
  ru: [
    [{ type: "roses", name: "Розы", count: 11 }],
    [{ type: "tulips", name: "Тюльпаны", count: 15 }],
    [{ type: "peonies", name: "Пионы", count: 7 }],
    [
      { type: "roses", name: "Розы", count: 5 },
      { type: "lilies", name: "Лилии", count: 3 },
      { type: "chrysanthemums", name: "Хризантемы", count: 4 },
    ],
    [{ type: "hydrangeas", name: "Гортензии", count: 3 }],
    [{ type: "sunflowers", name: "Подсолнухи", count: 9 }],
  ],
};

const PALETTES: Record<string, string[][]> = {
  en: [
    ["cream", "blush pink"],
    ["red", "deep green"],
    ["yellow", "orange"],
    ["white", "lavender"],
    ["pink", "white"],
  ],
  ka: [
    ["კრემისფერი", "ვარდისფერი"],
    ["წითელი", "მწვანე"],
    ["ყვითელი", "ნარინჯისფერი"],
    ["თეთრი", "იასამნისფერი"],
    ["ვარდისფერი", "თეთრი"],
  ],
  ru: [
    ["кремовый", "розовый"],
    ["красный", "зелёный"],
    ["жёлтый", "оранжевый"],
    ["белый", "лавандовый"],
    ["розовый", "белый"],
  ],
};

const CONDITIONS: Record<
  string,
  {
    petalFresh: string[];
    petalFaded: string[];
    leafFresh: string[];
    leafFaded: string[];
    stem: string[];
    damage: string;
  }
> = {
  en: {
    petalFresh: ["healthy petals", "no browning"],
    petalFaded: ["slight browning on outer petals"],
    leafFresh: ["green leaves"],
    leafFaded: ["a few yellowing leaves"],
    stem: ["stems appear fresh"],
    damage: "one bent stem",
  },
  ka: {
    petalFresh: ["ჯანსაღი ფურცლები", "გამოშრობა არ ჩანს"],
    petalFaded: ["გარე ფურცლებზე მსუბუქი გაშავება"],
    leafFresh: ["მწვანე ფოთლები"],
    leafFaded: ["რამდენიმე გაყვითლებული ფოთოლი"],
    stem: ["ღეროები ახალი ჩანს"],
    damage: "ერთი მოხრილი ღერო",
  },
  ru: {
    petalFresh: ["здоровые лепестки", "без побурения"],
    petalFaded: ["лёгкое побурение на внешних лепестках"],
    leafFresh: ["зелёные листья"],
    leafFaded: ["несколько желтеющих листьев"],
    stem: ["стебли выглядят свежими"],
    damage: "один погнутый стебель",
  },
};

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const mockVisionProvider: AiVisionProvider = {
  name: "mock",
  async observe(imagesBase64: string[], locale = "en"): Promise<ImageObservation> {
    const lang = locale in SAMPLE_FLOWERS ? locale : "en";
    // Sample the payload instead of hashing megabytes.
    const sample = imagesBase64
      .map((img) => img.slice(100, 400) + img.length)
      .join("|");
    const seed = hashString(sample);

    const flowers = SAMPLE_FLOWERS[lang][seed % SAMPLE_FLOWERS[lang].length];
    const palette = PALETTES[lang][(seed >> 3) % PALETTES[lang].length];
    const cond = CONDITIONS[lang];
    const score = 62 + (seed % 36); // 62–97
    const confidence = 70 + ((seed >> 5) % 25); // 70–94
    const daysMax = Math.max(1, Math.round((score / 100) * 7));
    const fresh = score >= 80;

    return {
      flowersSeen: flowers,
      colorPalette: palette,
      petalCondition: fresh ? cond.petalFresh : cond.petalFaded,
      leafCondition: fresh ? cond.leafFresh : cond.leafFaded,
      stemCondition: cond.stem,
      visibleDamage: seed % 7 === 0 ? [cond.damage] : [],
      photo: {
        sharpness: seed % 11 === 0 ? "acceptable" : "sharp",
        lighting: seed % 13 === 0 ? "dim" : "good",
        framing: "full bouquet visible",
      },
      freshness: {
        score,
        remainingDaysMin: Math.max(0, daysMax - 1),
        remainingDaysMax: daysMax,
        confidence,
      },
    };
  },
};
