import { shade } from "@/lib/placeholder/color";
import type { HeadProps } from "./types";

/** Layered concentric rings — reads as a rose bud viewed from above. */
export function SwirlHead({ cx, cy, r, color, center }: HeadProps) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} />
      <circle cx={cx} cy={cy} r={r * 0.68} fill={shade(color, 0.32)} />
      <circle cx={cx} cy={cy} r={r * 0.38} fill={shade(color, -0.2)} />
      <circle cx={cx} cy={cy} r={r * 0.16} fill={center ?? shade(color, -0.45)} />
    </g>
  );
}
