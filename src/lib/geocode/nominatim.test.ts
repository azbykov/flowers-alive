import { describe, expect, it } from "vitest";
import { neighborhoodFromAddress } from "./nominatim";

describe("neighborhoodFromAddress", () => {
  it("prefers suburb over city", () => {
    expect(
      neighborhoodFromAddress({ suburb: "Jordaan", city: "Amsterdam" }),
    ).toBe("Jordaan");
  });

  it("falls back to city when no district fields", () => {
    expect(neighborhoodFromAddress({ city: "Berlin" })).toBe("Berlin");
  });

  it("returns Nearby when address is empty", () => {
    expect(neighborhoodFromAddress(undefined)).toBe("Nearby");
  });
});
