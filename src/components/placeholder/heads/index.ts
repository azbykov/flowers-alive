import type { ComponentType } from "react";
import type { HeadKind } from "@/lib/placeholder/recipes";
import { SwirlHead } from "./SwirlHead";
import { CupHead } from "./CupHead";
import { RuffleHead } from "./RuffleHead";
import { ClusterHead } from "./ClusterHead";
import { StarHead } from "./StarHead";
import { ThreadHead } from "./ThreadHead";
import { SunHead } from "./SunHead";
import type { HeadProps } from "./types";

export type { HeadProps };
export { SwirlHead, CupHead, RuffleHead, ClusterHead, StarHead, ThreadHead, SunHead };

export const HEAD_COMPONENTS: Record<HeadKind, ComponentType<HeadProps>> = {
  swirl: SwirlHead,
  cup: CupHead,
  ruffle: RuffleHead,
  cluster: ClusterHead,
  star: StarHead,
  thread: ThreadHead,
  sun: SunHead,
};
