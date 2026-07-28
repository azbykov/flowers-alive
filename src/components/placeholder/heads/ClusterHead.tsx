import { hashSeed, mulberry32, shade } from "@/lib/placeholder/color";
import type { HeadProps } from "./types";

/** Dense ball of small florets — reads as a hydrangea head or a loose accent cluster. */
export function ClusterHead({ cx, cy, r, color }: HeadProps) {
  const rng = mulberry32(hashSeed(`cluster:${cx}:${cy}:${r}`));
  const florets = 9 + Math.floor(rng() * 5);

  return (
    <g>
      {Array.from({ length: florets }, (_, i) => {
        const ang = rng() * Math.PI * 2;
        const dist = rng() * r * 0.58;
        const fr = r * (0.3 + rng() * 0.16);
        const fx = cx + Math.cos(ang) * dist;
        const fy = cy + Math.sin(ang) * dist;
        const tone = shade(color, (rng() - 0.5) * 0.4);
        return (
          <g key={i}>
            <circle cx={fx} cy={fy} r={fr} fill={tone} />
            <circle cx={fx - fr * 0.28} cy={fy - fr * 0.28} r={fr * 0.32} fill="#ffffff" opacity={0.3} />
          </g>
        );
      })}
    </g>
  );
}
