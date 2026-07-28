export interface HeadProps {
  cx: number;
  cy: number;
  r: number;
  /** Base color for this flower head — every shade/highlight is derived from it. */
  color: string;
  /** Accent color for center dots (petaled heads). Defaults to a darker shade of `color`. */
  center?: string;
}
