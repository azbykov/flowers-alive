/** Small deterministic PRNG + color helpers shared by the placeholder layout and head components. */

export function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function round(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Lightens (positive) or darkens (negative) a hex color by `amount` (-1..1). */
export function shade(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const channel = (shift: number) => {
    const c = (num >> shift) & 0xff;
    const target = amount >= 0 ? 255 : 0;
    return Math.round(c + (target - c) * Math.abs(amount));
  };
  const r = channel(16);
  const g = channel(8);
  const b = channel(0);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
