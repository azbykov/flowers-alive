"use client";

import type { ReactNode } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import type { Coordinates } from "@/domain/types";
import { config } from "@/lib/config";

/** Google demo Map ID — enables Advanced Markers without a Cloud Map Style. */
const DEFAULT_MAP_ID = "DEMO_MAP_ID";

export function MapShell({
  center,
  zoom = 13,
  className = "",
  children,
  scrollWheelZoom = true,
  mapKey,
  onCameraChanged,
}: {
  center: Coordinates;
  zoom?: number;
  className?: string;
  children?: ReactNode;
  scrollWheelZoom?: boolean;
  mapKey?: string;
  onCameraChanged?: (zoom: number) => void;
}) {
  if (!config.hasGoogleMaps) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-line bg-surface-tint px-4 text-center text-[13px] text-ink-soft ${className}`}
      >
        Add <code className="mx-1 font-data text-[12px]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
        to enable maps.
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-line bg-card ${className}`}
    >
      <APIProvider apiKey={config.googleMapsApiKey} libraries={["marker"]}>
        <Map
          key={mapKey}
          mapId={config.googleMapsMapId || DEFAULT_MAP_ID}
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling={scrollWheelZoom ? "greedy" : "cooperative"}
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          className="h-full w-full"
          style={{ width: "100%", height: "100%" }}
          reuseMaps
          onZoomChanged={(ev) => {
            const z = ev.detail.zoom;
            if (typeof z === "number") onCameraChanged?.(z);
          }}
          onCameraChanged={(ev) => {
            const z = ev.detail.zoom;
            if (typeof z === "number") onCameraChanged?.(z);
          }}
        >
          {children}
        </Map>
      </APIProvider>
    </div>
  );
}
