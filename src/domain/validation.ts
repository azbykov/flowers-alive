import { z } from "zod";
import { FLOWER_TYPES, PICKUP_METHODS } from "./types";

export const createListingSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(80),
  description: z.string().trim().max(600).default(""),
  priceCents: z
    .number()
    .int()
    .min(0, "Price cannot be negative")
    .max(100_000_00, "Price is unrealistically high"),
  currency: z.string().length(3).default("EUR"),
  flowerTypes: z.array(z.enum(FLOWER_TYPES)).min(1).max(5),
  photos: z
    .array(z.string().min(1))
    .min(1, "Add at least one photo")
    .max(4),
  neighborhood: z.string().trim().min(2).max(60),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  pickupMethods: z.array(z.enum(PICKUP_METHODS)).min(1),
  sellerName: z.string().trim().min(1).max(60),
  sellerContact: z.string().trim().min(3).max(120),
  freshness: z
    .object({
      score: z.number().int().min(0).max(100),
      remainingDaysMin: z.number().int().min(0).max(30),
      remainingDaysMax: z.number().int().min(0).max(30),
      confidence: z.number().int().min(0).max(100),
      signals: z.array(z.string().max(120)).max(8),
    })
    .nullable(),
  analysis: z
    .object({
      flowers: z
        .array(
          z.object({
            type: z.enum(FLOWER_TYPES),
            name: z.string().max(60),
            count: z.number().int().min(1).max(200).optional(),
          }),
        )
        .max(8),
      colorPalette: z.array(z.string().max(30)).max(6),
      damageNotes: z.array(z.string().max(120)).max(8),
      suggestedTitle: z.string().max(80),
      suggestedDescription: z.string().max(600),
      photoQuality: z.enum(["excellent", "good", "average", "poor"]),
      listingQuality: z.enum(["excellent", "good", "average", "poor"]),
      suggestions: z.array(z.string().max(160)).max(8),
    })
    .nullable(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

export const analyzeRequestSchema = z.object({
  // Data URLs; size is enforced separately before parsing.
  images: z.array(z.string().startsWith("data:image/")).min(1).max(4),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
