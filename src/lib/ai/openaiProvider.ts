import OpenAI from "openai";
import { z } from "zod";
import { config } from "@/lib/config";
import type { AiVisionProvider, ImageObservation } from "./types";

/** Models often return a single phrase instead of a string[]; normalize both. */
const stringList = z.preprocess((value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    return trimmed
      .split(/[;\n]|,(?![^(]*\))/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return value;
}, z.array(z.string()));

const photoSchema = z.preprocess((value) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {
        sharpness: "acceptable",
        lighting: "good",
        framing: "full bouquet visible",
      };
    }
  }
  return value;
}, z.object({
  sharpness: z.enum(["sharp", "acceptable", "blurry"]),
  lighting: z.enum(["good", "dim", "harsh"]),
  framing: z.enum(["full bouquet visible", "partially cropped"]),
}));

const observationSchema = z.object({
  flowersSeen: z.array(
    z.object({
      type: z.string(),
      name: z.string(),
      count: z.number().int().positive().nullish(),
    }),
  ),
  colorPalette: stringList,
  petalCondition: stringList,
  leafCondition: stringList,
  stemCondition: stringList,
  visibleDamage: stringList,
  photo: photoSchema,
  freshness: z.object({
    score: z.number().min(0).max(100),
    remainingDaysMin: z.number().min(0),
    remainingDaysMax: z.number().min(0),
    confidence: z.number().min(0).max(100),
  }),
});

const SYSTEM_PROMPT = `You are a florist's assistant analyzing photos of a flower bouquet that someone wants to give away or sell for local pickup.

Look at the photos and report JSON matching the schema:
- flowersSeen: each flower variety with a lowercase "type" from this list when possible: roses, tulips, peonies, lilies, chrysanthemums, hydrangeas, sunflowers, other. Include a human "name" and stem "count" if countable (otherwise null).
- colorPalette: 1-4 dominant flower colors as short lowercase words (array of strings).
- petalCondition / leafCondition / stemCondition: arrays of short observational phrases ("healthy petals", "no browning", "green leaves").
- visibleDamage: array of clearly visible problems; empty array if none.
- photo: object with sharpness, lighting, framing enums.
- freshness: score 0-100 for current freshness, remainingDaysMin/Max estimate of days the bouquet will still look good in a vase, and confidence 0-100. Be conservative; never overstate certainty.

Never mention, estimate, or imply any price or monetary value.`;

/** JSON Schema for Gateway + OpenAI structured outputs (json_object is rejected by Gateway). */
const OBSERVATION_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "flowersSeen",
    "colorPalette",
    "petalCondition",
    "leafCondition",
    "stemCondition",
    "visibleDamage",
    "photo",
    "freshness",
  ],
  properties: {
    flowersSeen: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "name", "count"],
        properties: {
          type: { type: "string" },
          name: { type: "string" },
          count: { type: ["integer", "null"] },
        },
      },
    },
    colorPalette: { type: "array", items: { type: "string" } },
    petalCondition: { type: "array", items: { type: "string" } },
    leafCondition: { type: "array", items: { type: "string" } },
    stemCondition: { type: "array", items: { type: "string" } },
    visibleDamage: { type: "array", items: { type: "string" } },
    photo: {
      type: "object",
      additionalProperties: false,
      required: ["sharpness", "lighting", "framing"],
      properties: {
        sharpness: { type: "string", enum: ["sharp", "acceptable", "blurry"] },
        lighting: { type: "string", enum: ["good", "dim", "harsh"] },
        framing: {
          type: "string",
          enum: ["full bouquet visible", "partially cropped"],
        },
      },
    },
    freshness: {
      type: "object",
      additionalProperties: false,
      required: ["score", "remainingDaysMin", "remainingDaysMax", "confidence"],
      properties: {
        score: { type: "number" },
        remainingDaysMin: { type: "number" },
        remainingDaysMax: { type: "number" },
        confidence: { type: "number" },
      },
    },
  },
} as const;

/**
 * Vision provider via Vercel AI Gateway (preferred) or direct OpenAI.
 * Same Chat Completions shape either way — Gateway is a baseURL + key swap.
 */
export const openaiVisionProvider: AiVisionProvider = {
  get name() {
    return config.vision.providerName;
  },
  async observe(imagesBase64: string[]): Promise<ImageObservation> {
    const { apiKey, baseURL, model } = config.vision;
    const client = new OpenAI({ apiKey, baseURL });
    const response = await client.chat.completions.create({
      model,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "bouquet_observation",
          strict: true,
          schema: OBSERVATION_JSON_SCHEMA,
        },
      },
      max_tokens: 700,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: imagesBase64.map((url) => ({
            type: "image_url" as const,
            image_url: { url, detail: "low" as const },
          })),
        },
      ],
    });
    const raw = response.choices[0]?.message?.content ?? "{}";
    const parsed = observationSchema.parse(JSON.parse(raw));
    return {
      ...parsed,
      flowersSeen: parsed.flowersSeen.map((f) => ({
        type: f.type,
        name: f.name,
        ...(f.count != null ? { count: f.count } : {}),
      })),
    };
  },
};
