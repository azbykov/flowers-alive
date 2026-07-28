import OpenAI from "openai";
import { z } from "zod";
import { config } from "@/lib/config";
import type { AiVisionProvider, ImageObservation } from "./types";

const observationSchema = z.object({
  flowersSeen: z.array(
    z.object({
      type: z.string(),
      name: z.string(),
      count: z.number().int().positive().optional(),
    }),
  ),
  colorPalette: z.array(z.string()),
  petalCondition: z.array(z.string()),
  leafCondition: z.array(z.string()),
  stemCondition: z.array(z.string()),
  visibleDamage: z.array(z.string()),
  photo: z.object({
    sharpness: z.enum(["sharp", "acceptable", "blurry"]),
    lighting: z.enum(["good", "dim", "harsh"]),
    framing: z.enum(["full bouquet visible", "partially cropped"]),
  }),
  freshness: z.object({
    score: z.number().min(0).max(100),
    remainingDaysMin: z.number().min(0),
    remainingDaysMax: z.number().min(0),
    confidence: z.number().min(0).max(100),
  }),
});

const SYSTEM_PROMPT = `You are a florist's assistant analyzing photos of a flower bouquet that someone wants to give away or sell for local pickup.

Look at the photos and report, as strict JSON matching the provided schema:
- flowersSeen: each flower variety with a lowercase "type" from this list when possible: roses, tulips, peonies, lilies, chrysanthemums, hydrangeas, sunflowers, other. Include a human "name" and stem "count" if countable.
- colorPalette: 1-4 dominant flower colors as short lowercase words.
- petalCondition / leafCondition / stemCondition: short observational phrases ("healthy petals", "no browning", "green leaves").
- visibleDamage: only clearly visible problems; empty array if none.
- photo: honest assessment of sharpness, lighting, framing.
- freshness: score 0-100 for current freshness, remainingDaysMin/Max estimate of days the bouquet will still look good in a vase, and confidence 0-100. Be conservative; never overstate certainty.

Never mention, estimate, or imply any price or monetary value.`;

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
      response_format: { type: "json_object" },
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
    return observationSchema.parse(JSON.parse(raw));
  },
};
