/** Central env detection. Supabase env vars are required for data/auth/storage. */
const AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1";
const VISION_MODEL_DIRECT = "gpt-4o-mini";
const VISION_MODEL_GATEWAY = "openai/gpt-4o-mini";

export const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  aiGatewayApiKey: process.env.AI_GATEWAY_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  /** Optional Cloud Map ID for Advanced Markers; falls back to DEMO_MAP_ID. */
  googleMapsMapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "",

  get hasSupabase(): boolean {
    return Boolean(this.supabaseUrl && this.supabaseAnonKey);
  },
  get hasGoogleMaps(): boolean {
    return Boolean(this.googleMapsApiKey);
  },
  /** Prefer Vercel AI Gateway; fall back to a direct OpenAI key. */
  get hasAiGateway(): boolean {
    return Boolean(this.aiGatewayApiKey);
  },
  get hasOpenAI(): boolean {
    return this.hasAiGateway || Boolean(this.openaiApiKey);
  },
  /** Client settings for the vision provider (Gateway preferred). */
  get vision(): {
    apiKey: string;
    baseURL?: string;
    model: string;
    providerName: string;
  } {
    if (this.hasAiGateway) {
      return {
        apiKey: this.aiGatewayApiKey,
        baseURL: AI_GATEWAY_BASE_URL,
        model: VISION_MODEL_GATEWAY,
        providerName: "vercel-ai-gateway",
      };
    }
    return {
      apiKey: this.openaiApiKey,
      model: VISION_MODEL_DIRECT,
      providerName: "openai",
    };
  },
} as const;

/** Browse fallback when geolocation is denied — Tbilisi center. */
export const DEFAULT_CITY_CENTER = { lat: 41.7151, lng: 44.8271 };
