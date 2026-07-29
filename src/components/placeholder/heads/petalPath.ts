/** SVG path `d` for a lens-shaped petal pointing from `(cx,cy)` at `angleDeg`. */
export function petalPath(cx: number, cy: number, angleDeg: number, len: number, width: number): string {
  const rad = (angleDeg * Math.PI) / 180;
  const dirX = Math.cos(rad);
  const dirY = Math.sin(rad);
  const baseX = cx - dirX * len * 0.12;
  const baseY = cy - dirY * len * 0.12;
  const tipX = cx + dirX * len;
  const tipY = cy + dirY * len;
  const nx = -dirY * width;
  const ny = dirX * width;
  return `M ${baseX} ${baseY} Q ${cx + nx} ${cy + ny} ${tipX} ${tipY} Q ${cx - nx} ${cy - ny} ${baseX} ${baseY} Z`;
}
