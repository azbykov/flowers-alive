"use client";

import { Circle } from "@vis.gl/react-google-maps";
import type { Coordinates } from "@/domain/types";
import { APPROXIMATE_AREA_RADIUS_M } from "@/domain/geo";
import { MapShell } from "./MapShell";

export function ApproximateMap({
  mapPoint,
  neighborhood,
}: {
  mapPoint: Coordinates;
  neighborhood: string;
}) {
  return (
    <div>
      <MapShell
        center={mapPoint}
        zoom={14}
        scrollWheelZoom={false}
        className="h-[200px] w-full lg:h-[240px]"
      >
        <Circle
          center={mapPoint}
          radius={APPROXIMATE_AREA_RADIUS_M}
          strokeColor="#d98324"
          strokeOpacity={1}
          strokeWeight={2}
          fillColor="#d98324"
          fillOpacity={0.18}
          clickable={false}
        />
      </MapShell>
      <p className="mt-2 text-[13px] text-ink-soft">
        {neighborhood} · approx. area
      </p>
    </div>
  );
}
