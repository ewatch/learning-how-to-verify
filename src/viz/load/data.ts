// Pure, deterministic data for the 'load' diagram family. No DOM.

export const KNEE = 220;
export const TARGET_MS = 300;
export const EXPECTED_PEAK = 150;
export const OOM_MB = 2048;
export const SOAK_HOURS = 24;

/** p95 latency (ms) at a number of concurrent users: flat, then a knee at pool exhaustion. */
export function p95At(users: number): number {
  const u = Math.max(0, users);
  const base = 110 + u * 0.25;
  if (u <= KNEE) return base;
  const d = u - KNEE;
  return base + d * 6 + d * d * 0.12;
}
/** Error rate 0..1; zero until the knee. */
export function errorRateAt(users: number): number {
  if (users <= KNEE) return 0;
  return Math.min(0.6, (users - KNEE) / 300);
}
/** Duplicate reservations of Rex after the run. */
export function reservedTwice(users: number, uniqueConstraint: boolean): number {
  if (uniqueConstraint || users < 20) return 0;
  return 2;
}

/** Memory (MB) at hour h. Sawtooth from GC; with a leak it climbs until OOM. */
export function memoryAt(hours: number, leak: boolean, traffic10: boolean): number {
  const saw = 40 * ((hours / 0.4) % 1); // GC every 24 min
  const rate = leak ? 55 * (traffic10 ? 10 : 1) : 0;
  return Math.min(OOM_MB, 400 + saw + rate * hours);
}
export function oomHour(leak: boolean, traffic10: boolean): number | null {
  if (!leak) return null;
  return (OOM_MB - 400) / (55 * (traffic10 ? 10 : 1));
}
/** The short load-test window, in hours (5 minutes). */
export const WINDOW_H = 5 / 60;

/** Seeded PRNG (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 1,000 request latencies (ms) with a long tail; N+1 queries push a share of requests far out. */
export function latencies(nPlusOne: boolean, count = 1000, seed = 7): number[] {
  const r = rng(seed);
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const g = Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());
    let v = Math.exp(Math.log(80) + 0.35 * g); // log-normal around 80 ms
    const tail = r();
    if (tail < 0.06) v *= 2 + r() * 2; // slow cache misses
    if (nPlusOne && tail > 0.7) v += 60 + r() * 420; // one extra query per pet
    out.push(v);
  }
  return out.sort((a, b) => a - b);
}
export interface Stats { avg: number; p50: number; p95: number; p99: number }
export function stats(sorted: number[]): Stats {
  const q = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
  return { avg: sorted.reduce((s, x) => s + x, 0) / sorted.length, p50: q(0.5), p95: q(0.95), p99: q(0.99) };
}
export function histogram(sorted: number[], max: number, bins: number): number[] {
  const h = new Array<number>(bins).fill(0);
  for (const v of sorted) h[Math.min(bins - 1, Math.floor((v / max) * bins))]++;
  return h;
}
/** Chance a page with k requests hits at least one request slower than p95. */
export function pageHitsP95(k: number): number { return 1 - Math.pow(0.95, k); }

export const N_MIN = 10;
export const N_MAX = 100000;
export const BASELINE_FACTOR = 1.2;
/** Search over n pets in ms: O(n). */
export function linearMs(n: number): number { return 0.002 * n + 0.05; }
/** Agent's "dedupe then search": O(n²). */
export function quadraticMs(n: number): number { return linearMs(n) + 0.000002 * n * n; }
export function regressed(n: number): boolean { return quadraticMs(n) > linearMs(n) * BASELINE_FACTOR; }
