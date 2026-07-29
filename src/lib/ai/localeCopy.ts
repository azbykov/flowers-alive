import type { FlowerType } from "@/domain/types";

export type AiLocale = "ka" | "en" | "ru";

const FLOWER_NAMES: Record<AiLocale, Record<FlowerType, string>> = {
  en: {
    roses: "Roses",
    tulips: "Tulips",
    peonies: "Peonies",
    lilies: "Lilies",
    chrysanthemums: "Chrysanthemums",
    hydrangeas: "Hydrangeas",
    sunflowers: "Sunflowers",
    mixed: "Mixed bouquet",
    other: "Fresh bouquet",
  },
  ka: {
    roses: "ვარდები",
    tulips: "ტიტები",
    peonies: "პიონები",
    lilies: "შროშანები",
    chrysanthemums: "ქრიზანთემები",
    hydrangeas: "ჰორტენზიები",
    sunflowers: "მზესუმზირები",
    mixed: "შერეული თაიგული",
    other: "ახალი თაიგული",
  },
  ru: {
    roses: "Розы",
    tulips: "Тюльпаны",
    peonies: "Пионы",
    lilies: "Лилии",
    chrysanthemums: "Хризантемы",
    hydrangeas: "Гортензии",
    sunflowers: "Подсолнухи",
    mixed: "Смешанный букет",
    other: "Свежий букет",
  },
};

type Copy = {
  languageName: string;
  freshBouquet: string;
  mixedWith: (name: string) => string;
  colored: (colors: string, name: string) => string;
  countLooking: (count: number, name: string) => string;
  looking: string;
  pickupLine: string;
  blurry: string;
  dimLight: string;
  harshLight: string;
  cropped: string;
  damaged: string;
  and: string;
};

const COPY: Record<AiLocale, Copy> = {
  en: {
    languageName: "English",
    freshBouquet: "Fresh bouquet",
    mixedWith: (name) => `Mixed bouquet with ${name.toLowerCase()}`,
    colored: (colors, name) =>
      `${colors} ${name.toLowerCase()}`.replace(/^./, (c) => c.toUpperCase()),
    countLooking: (count, name) =>
      `${count} ${name.toLowerCase()} looking for a new home.`,
    looking: "A lovely bouquet looking for a new home.",
    pickupLine: "Pick it up nearby and enjoy it for days.",
    blurry: "The photo looks blurry — hold the phone steady and retake it.",
    dimLight: "Improve lighting — daylight near a window works best.",
    harshLight: "Avoid direct harsh light to keep colors natural.",
    cropped: "Step back so the whole bouquet fits in the frame.",
    damaged:
      "Some flowers appear damaged — mention it honestly in the description.",
    and: " and ",
  },
  ka: {
    languageName: "Georgian",
    freshBouquet: "ახალი თაიგული",
    mixedWith: (name) => `შერეული თაიგული · ${name}`,
    colored: (colors, name) => `${colors} ${name}`,
    countLooking: (count, name) =>
      `${count} ${name} ეძებს ახალ სახლს.`,
    looking: "ლამაზი თაიგული ეძებს ახალ სახლს.",
    pickupLine: "აიღეთ ახლოს და დატკბით რამდენიმე დღე.",
    blurry: "ფოტო ბუნდოვანია — დაიჭირეთ ტელეფონი მტკიცედ და გადაიღეთ თავიდან.",
    dimLight: "გააუმჯობესეთ განათება — ფანჯართან დღის შუქი საუკეთესოა.",
    harshLight: "მოერიდეთ მკვეთრ პირდაპირ შუქს, რომ ფერები ბუნებრივი დარჩეს.",
    cropped: "გადადგით უკან, რომ მთელი თაიგული ჩაეტიოს კადრში.",
    damaged:
      "ზოგი ყვავილი დაზიანებული ჩანს — პატიოსნად აღნიშნეთ ეს აღწერაში.",
    and: " და ",
  },
  ru: {
    languageName: "Russian",
    freshBouquet: "Свежий букет",
    mixedWith: (name) => `Смешанный букет с ${name.toLowerCase()}`,
    colored: (colors, name) =>
      `${colors} ${name.toLowerCase()}`.replace(/^./, (c) => c.toUpperCase()),
    countLooking: (count, name) =>
      `${count} ${name.toLowerCase()} ищут новый дом.`,
    looking: "Красивый букет ищет новый дом.",
    pickupLine: "Заберите рядом и наслаждайтесь несколько дней.",
    blurry: "Фото размыто — держите телефон устойчиво и переснимите.",
    dimLight: "Улучшите освещение — лучше всего дневной свет у окна.",
    harshLight: "Избегайте жёсткого прямого света, чтобы цвета остались естественными.",
    cropped: "Отойдите назад, чтобы весь букет поместился в кадр.",
    damaged:
      "Часть цветов выглядит повреждённой — честно укажите это в описании.",
    and: " и ",
  },
};

export function aiCopy(locale: string): Copy {
  return COPY[(locale as AiLocale) in COPY ? (locale as AiLocale) : "en"];
}

export function flowerLabel(type: FlowerType, locale: string): string {
  const map = FLOWER_NAMES[(locale as AiLocale) in FLOWER_NAMES ? (locale as AiLocale) : "en"];
  return map[type];
}

export function languageInstruction(locale: string): string {
  const name = aiCopy(locale).languageName;
  return `Write all human-readable observational phrases (flower "name", colorPalette words, petalCondition, leafCondition, stemCondition, visibleDamage) in ${name}. Keep machine enums (type codes, photo sharpness/lighting/framing) in English as specified by the schema.`;
}
