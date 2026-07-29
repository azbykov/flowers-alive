import { describe, expect, it } from "vitest";
import { toApproximateMapPoint } from "./geo";

describe("toApproximateMapPoint", () => {
  it("snaps to a ~0.001° grid", () => {
    const point = toApproximateMapPoint({ lat: 52.37391, lng: 4.88094 });
    expect(point.lat).toBeCloseTo(52.374, 5);
    expect(point.lng).toBeCloseTo(4.881, 5);
  });

  it("is stable for the same input", () => {
    const a = { lat: 52.3547123, lng: 4.8921456 };
    expect(toApproximateMapPoint(a)).toEqual(toApproximateMapPoint(a));
  });

  it("differs from a non-grid exact coordinate", () => {
    const exact = { lat: 52.37391, lng: 4.88094 };
    const approx = toApproximateMapPoint(exact);
    expect(approx.lat === exact.lat && approx.lng === exact.lng).toBe(false);
  });
});
