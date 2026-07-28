import { hashSeed, mulberry32, shade } from "@/lib/placeholder/color";
import type { HeadProps } from "./types";

/** Closed tulip bulb — three overlapping petal panels forming a cup. */
export function CupHead({ cx, cy, r, color }: HeadProps) {
  const rng = mulberry32(hashSeed(`cup:${cx}:${cy}:${r}`));
  const w = r * 1.15;
  const h = r * 2.1;
  const top = cy - h * 0.55;
  const bottom = cy + h * 0.45;
  const lean = (rng() - 0.5) * w * 0.25;

  return (
    <g>
      <path
        d={`M ${cx} ${bottom} Q ${cx - w * 0.7 + lean} ${cy} ${cx - w * 0.12} ${top} Q ${cx} ${top - h * 0.06} ${cx + w * 0.12} ${top} Q ${cx + w * 0.7 + lean} ${cy} ${cx} ${bottom} Z`}
        fill={color}
      />
      <path
        d={`M ${cx} ${bottom} Q ${cx - w * 0.28} ${cy + h * 0.05} ${cx - w * 0.08} ${top + h * 0.15} L ${cx} ${top + h * 0.05} Z`}
        fill={shade(color, 0.3)}
        opacity={0.7}
      />
      <path
        d={`M ${cx} ${bottom} Q ${cx + w * 0.28} ${cy + h * 0.05} ${cx + w * 0.08} ${top + h * 0.15} L ${cx} ${top + h * 0.05} Z`}
        fill={shade(color, -0.22)}
        opacity={0.5}
      />
    </g>
  );
}
