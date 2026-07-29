import type { Coordinates, PublicListing } from "@/domain/types";

export type MapCluster =
  | { kind: "point"; listing: PublicListing; position: Coordinates }
  | {
      kind: "cluster";
      id: string;
      listings: PublicListing[];
      position: Coordinates;
      count: number;
    };

/**
 * Grid clustering by zoom. High zoom → individual badges; low zoom → flower groups.
 */
export function clusterListings(
  listings: PublicListing[],
  zoom: number,
): MapCluster[] {
  if (listings.length === 0) return [];
  if (zoom >= 14.5) {
    return listings.map((listing) => ({
      kind: "point" as const,
      listing,
      position: listing.mapPoint,
    }));
  }

  const cellDeg = Math.max(0.003, 0.22 / 2 ** Math.max(0, zoom - 10));
  const cells = new Map<string, PublicListing[]>();

  for (const listing of listings) {
    const { lat, lng } = listing.mapPoint;
    const key = `${Math.floor(lat / cellDeg)}:${Math.floor(lng / cellDeg)}`;
    const bucket = cells.get(key);
    if (bucket) bucket.push(listing);
    else cells.set(key, [listing]);
  }

  const out: MapCluster[] = [];
  for (const [id, group] of cells) {
    if (group.length === 1) {
      out.push({
        kind: "point",
        listing: group[0],
        position: group[0].mapPoint,
      });
      continue;
    }
    const lat =
      group.reduce((sum, l) => sum + l.mapPoint.lat, 0) / group.length;
    const lng =
      group.reduce((sum, l) => sum + l.mapPoint.lng, 0) / group.length;
    out.push({
      kind: "cluster",
      id,
      listings: group,
      position: { lat, lng },
      count: group.length,
    });
  }
  return out;
}
