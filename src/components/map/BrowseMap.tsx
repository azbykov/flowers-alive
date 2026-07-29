"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  useMap,
} from "@vis.gl/react-google-maps";
import type { Coordinates, PublicListing } from "@/domain/types";
import { DEFAULT_CITY_CENTER } from "@/lib/config";
import { clusterListings } from "./cluster";
import {
  FlowerClusterBadge,
  ListingMapCard,
  PriceBadge,
} from "./MapMarkers";
import { MapShell } from "./MapShell";

function FitBounds({
  points,
  fallback,
}: {
  points: Coordinates[];
  fallback: Coordinates;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (points.length === 0) {
      map.setCenter(fallback);
      map.setZoom(12);
      return;
    }
    if (points.length === 1) {
      map.setCenter(points[0]);
      map.setZoom(14);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    for (const p of points) bounds.extend(p);
    map.fitBounds(bounds, 48);
  }, [map, points, fallback]);

  return null;
}

function MapClickClear({ onClear }: { onClear: () => void }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener("click", () => onClear());
    return () => listener.remove();
  }, [map, onClear]);
  return null;
}

function ZoomToMembers({ members }: { members: PublicListing[] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !members?.length) return;
    if (members.length === 1) {
      map.setCenter(members[0].mapPoint);
      map.setZoom(Math.max(map.getZoom() ?? 13, 15));
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    for (const l of members) bounds.extend(l.mapPoint);
    map.fitBounds(bounds, 64);
  }, [map, members]);
  return null;
}

export function BrowseMap({
  listings,
  center,
}: {
  listings: PublicListing[];
  center: Coordinates | null;
}) {
  const router = useRouter();
  const fallback = center ?? DEFAULT_CITY_CENTER;
  const [zoom, setZoom] = useState(13);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoomMembers, setZoomMembers] = useState<PublicListing[] | null>(null);

  const points = useMemo(() => listings.map((l) => l.mapPoint), [listings]);
  const clusters = useMemo(
    () => clusterListings(listings, zoom),
    [listings, zoom],
  );
  const selected = useMemo(
    () => listings.find((l) => l.id === selectedId) ?? null,
    [listings, selectedId],
  );

  const clearSelection = useCallback(() => setSelectedId(null), []);

  return (
    <div className="relative">
      <MapShell
        center={fallback}
        zoom={13}
        className="h-[min(70vh,640px)] w-full"
        onCameraChanged={setZoom}
      >
        <FitBounds points={points} fallback={fallback} />
        <MapClickClear onClear={clearSelection} />
        <ZoomToMembers members={zoomMembers} />

        {clusters.map((item) => {
          if (item.kind === "cluster") {
            return (
              <AdvancedMarker
                key={`c-${item.id}`}
                position={item.position}
                anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
                zIndex={10}
                onClick={() => {
                  setSelectedId(null);
                  setZoomMembers([...item.listings]);
                }}
              >
                <FlowerClusterBadge count={item.count} />
              </AdvancedMarker>
            );
          }

          const { listing, position } = item;
          if (listing.id === selectedId) return null;

          return (
            <AdvancedMarker
              key={listing.id}
              position={position}
              anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}
              zIndex={20}
              onClick={() => setSelectedId(listing.id)}
            >
              <PriceBadge listing={listing} />
            </AdvancedMarker>
          );
        })}

        {selected && (
          <AdvancedMarker
            key={`card-${selected.id}`}
            position={selected.mapPoint}
            anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}
            zIndex={100}
            onClick={() => router.push(`/listings/${selected.id}`)}
          >
            <div className="relative mb-1.5">
              <ListingMapCard listing={selected} />
            </div>
          </AdvancedMarker>
        )}
      </MapShell>

      <div className="pointer-events-none absolute bottom-3 left-3 z-10">
        <div className="rounded-full border border-line bg-white/95 px-3.5 py-2 text-[12.5px] font-semibold text-ink shadow-[0_4px_14px_rgba(42,36,30,0.12)] backdrop-blur">
          {listings.length} bouquet{listings.length === 1 ? "" : "s"} nearby
        </div>
      </div>
    </div>
  );
}
