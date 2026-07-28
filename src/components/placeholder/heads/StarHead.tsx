import { hashSeed, mulberry32, shade } from "@/lib/placeholder/color";
import { petalPath } from "./petalPath";
import type { HeadProps } from "./types";

/** Six splayed, pointed petals with a speckled center — reads as an open lily. */
export function StarHead({ cx, cy, r, color, center }: HeadProps) {
  const rng = mulberry32(hashSeed(`star:${cx}:${cy}:${r}`));
  const petals = 6;
  const startAngle = rng() * 60;
  const centerColor = center ?? shade(color, -0.45);

  return (
    <g>
      {Array.from({ length: petals }, (_, i) => {
        const ang = startAngle + (i / petals) * 360 + (rng() - 0.5) * 8;
        return (
          <path
            key={i}
            d={petalPath(cx, cy, ang, r * 1.05, r * 0.3)}
            fill={i % 2 === 0 ? color : shade(color, 0.2)}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.16} fill={centerColor} />
      {Array.from({ length: 5 }, (_, i) => {
        const ang = rng() * Math.PI * 2;
        const dist = rng() * r * 0.5;
        return (
          <circle
            key={i}
            cx={cx + Math.cos(ang) * dist}
            cy={cy + Math.sin(ang) * dist}
            r={1.6}
            fill={centerColor}
            opacity={0.6}
          />
        );
      })}
    </g>
  );
}
