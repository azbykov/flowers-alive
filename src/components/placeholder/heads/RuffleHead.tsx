import { hashSeed, mulberry32, shade } from "@/lib/placeholder/color";
import type { HeadProps } from "./types";

/** Overlapping ruffled bumps — reads as a full, layered peony bloom. */
export function RuffleHead({ cx, cy, r, color }: HeadProps) {
  const rng = mulberry32(hashSeed(`ruffle:${cx}:${cy}:${r}`));
  const bumps = 5 + Math.floor(rng() * 3);

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} />
      {Array.from({ length: bumps }, (_, i) => {
        const ang = (i / bumps) * Math.PI * 2 + rng() * 0.6;
        const dist = r * (0.42 + rng() * 0.2);
        const br = r * (0.4 + rng() * 0.22);
        const tone = rng() > 0.5 ? shade(color, 0.22) : shade(color, -0.16);
        return (
          <circle
            key={i}
            cx={cx + Math.cos(ang) * dist}
            cy={cy + Math.sin(ang) * dist}
            r={br}
            fill={tone}
            opacity={0.92}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.22} fill="#ffffff" opacity={0.4} />
    </g>
  );
}
