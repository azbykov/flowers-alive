import { renderToStaticMarkup } from "react-dom/server";
import type { FlowerType } from "@/domain/types";
import { BouquetIllustration } from "@/components/placeholder/BouquetIllustration";

/** Renders `BouquetIllustration` to a standalone SVG markup string (for the placeholder route). */
export function renderBouquetSvg(flowerType: FlowerType, seed: string, colorHint?: string): string {
  return renderToStaticMarkup(<BouquetIllustration flowerType={flowerType} seed={seed} color={colorHint} />);
}
