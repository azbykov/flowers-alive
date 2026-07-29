import type { FlowerType } from "@/domain/types";
import { buildBouquetPlan } from "@/lib/placeholder/bouquetPlan";
import { HEAD_COMPONENTS } from "./heads";

export interface BouquetIllustrationProps {
  flowerType: FlowerType;
  /** Stable id (e.g. the listing id) so the same listing always renders the same bouquet. */
  seed: string;
  /** Optional hint (e.g. "blue") biasing the palette toward a matching variant. */
  color?: string;
}

/**
 * Procedural bouquet placeholder, used when a listing has no real photo
 * (demo/seed data). Layout and color selection are pure data (`buildBouquetPlan`);
 * this component only turns that plan into SVG, handing each head's resolved
 * `color` down as a prop to the matching `heads/*` component.
 */
export function BouquetIllustration({ flowerType, seed, color }: BouquetIllustrationProps) {
  const plan = buildBouquetPlan(flowerType, seed, color);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect width={400} height={300} fill={plan.background} />
      <g>
        {plan.stems.map((s, i) => (
          <path
            key={i}
            d={`M ${s.baseX} 300 Q ${s.ctrlX} ${s.ctrlY} ${s.bindX} ${s.bindY}`}
            stroke={s.color}
            strokeWidth={5}
            fill="none"
            opacity={0.85}
            strokeLinecap="round"
          />
        ))}
      </g>
      <g>
        {plan.heads.map((h, i) => {
          const Head = HEAD_COMPONENTS[h.kind];
          return <Head key={i} cx={h.cx} cy={h.cy} r={h.r} color={h.color} center={h.center} />;
        })}
      </g>
    </svg>
  );
}
