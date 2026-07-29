import { hashSeed, mulberry32, shade } from "@/lib/placeholder/color";
import { petalPath } from "./petalPath";
import type { HeadProps } from "./types";

/** Wide radiating petals around a dark speckled disc — reads as a sunflower. */
export function SunHead({ cx, cy, r, color, center }: HeadProps) {
  const rng = mulberry32(hashSeed(`sun:${cx}:${cy}:${r}`));
  const petals = 12 + Math.floor(rng() * 4);
  const startAngle = rng() * 30;
  const centerColor = center ?? shade(color, -0.7);

  return (
    <g>
      {Array.from({ length: petals }, (_, i) => {
        const ang = startAngle + (i / petals) * 360;
        return (
          <path
            key={i}
            d={petalPath(cx, cy, ang, r * 1.25, r * 0.34)}
            fill={i % 2 === 0 ? color : shade(color, 0.22)}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.5} fill={centerColor} />
      {Array.from({ length: 10 }, (_, i) => {
        const ang = rng() * Math.PI * 2;
        const dist = rng() * r * 0.42;
        return (
          <circle
            key={i}
            cx={cx + Math.cos(ang) * dist}
            cy={cy + Math.sin(ang) * dist}
            r={1.4}
            fill="#000000"
            opacity={0.25}
          />
        );
      })}
    </g>
  );
}
