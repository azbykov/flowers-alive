"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/Spinner";

const loading = (
  <div className="flex h-[200px] items-center justify-center rounded-2xl border border-line bg-card text-stem">
    <Spinner size={24} />
  </div>
);

export const BrowseMap = dynamic(
  () => import("./BrowseMap").then((m) => m.BrowseMap),
  { ssr: false, loading: () => (
    <div className="flex h-[min(70vh,640px)] items-center justify-center rounded-2xl border border-line bg-card text-stem">
      <Spinner size={28} />
    </div>
  ) },
);

export const ApproximateMap = dynamic(
  () => import("./ApproximateMap").then((m) => m.ApproximateMap),
  { ssr: false, loading: () => loading },
);

export const PickupMapPicker = dynamic(
  () => import("./PickupMapPicker").then((m) => m.PickupMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="mt-3 flex h-[220px] items-center justify-center rounded-2xl border border-line bg-card text-stem lg:h-[260px]">
        <Spinner size={24} />
      </div>
    ),
  },
);
