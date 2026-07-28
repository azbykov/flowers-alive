import { hashSeed, mulberry32, shade } from "@/lib/placeholder/color";
import { petalPath } from "./petalPath";
import type { HeadProps } from "./types";

/** Many thin radiating petals — reads as a spiky chrysanthemum pompom. */
export function ThreadHead({ cx, cy, r, color }: HeadProps) {
  const rng = mulberry32(hashSeed(`thread:${cx}:${cy}:${r}`));
  const petals = 18 + Math.floor(rng() * 8);
  const startAngle = rng() * 20;

  return (
    <g>
      {Array.from({ length: petals }, (_, i) => {
        const ang = startAngle + (i / petals) * 360;
        const len = r * (0.85 + rng() * 0.3);
        return (
          <path
            key={i}
            d={petalPath(cx, cy, ang, len, r * 0.09)}
            fill={i % 3 === 0 ? shade(color, -0.18) : color}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.14} fill={shade(color, -0.35)} />
    </g>
  );
}
