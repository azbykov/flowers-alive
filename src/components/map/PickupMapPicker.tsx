"use client";

import { useEffect, useMemo } from "react";
import { Marker, useMap } from "@vis.gl/react-google-maps";
import type { Coordinates } from "@/domain/types";
import { pickupPinIcon } from "./icons";
import { MapShell } from "./MapShell";

function Recenter({ position }: { position: Coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.panTo(position);
  }, [map, position.lat, position.lng]);
  return null;
}

export function PickupMapPicker({
  coordinates,
  onChange,
}: {
  coordinates: Coordinates;
  onChange: (coords: Coordinates) => void;
}) {
  const position = useMemo(
    () => ({ lat: coordinates.lat, lng: coordinates.lng }),
    [coordinates.lat, coordinates.lng],
  );

  return (
    <MapShell
      center={position}
      zoom={15}
      className="mt-3 h-[220px] w-full lg:h-[260px]"
    >
      <Recenter position={position} />
      <Marker
        position={position}
        draggable
        onDragEnd={(e) => {
          const lat = e.latLng?.lat();
          const lng = e.latLng?.lng();
          if (lat == null || lng == null) return;
          onChange({ lat, lng });
        }}
        icon={pickupPinIcon()}
      />
    </MapShell>
  );
}
