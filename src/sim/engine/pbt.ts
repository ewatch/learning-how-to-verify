/**
 * Minimal property-based testing for the discount-allocation example:
 * seeded generation, a property check, and greedy shrinking to a minimal counterexample.
 */
import { rng } from './rng';

export interface Input { amount: number; weights: number[] }
export type Allocate = (amount: number, weights: number[]) => number[];

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export const IMPLS: Record<string, { code: string; fn: Allocate }> = {
  round: {
    code: `// Each share = its proportion, rounded
function allocate(amount, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => total === 0 ? 0 : Math.round(amount * w / total));
}`,
    fn: (amount, weights) => { const total = sum(weights); return weights.map((w) => (total === 0 ? 0 : Math.round((amount * w) / total))); },
  },
  floor: {
    code: `// Each share = its proportion, rounded down
function allocate(amount, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => total === 0 ? 0 : Math.floor(amount * w / total));
}`,
    fn: (amount, weights) => { const total = sum(weights); return weights.map((w) => (total === 0 ? 0 : Math.floor((amount * w) / total))); },
  },
  cumulative: {
    code: `// Round the running total, then take differences (as in Allocate.dfy)
function allocate(amount, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total === 0) return weights.map(() => 0);
  let cumulative = 0, reached = 0;
  return weights.map((w) => {
    cumulative += w;
    const next = Math.floor(amount * cumulative / total);
    const share = next - reached;
    reached = next;
    return share;
  });
}`,
    fn: (amount, weights) => {
      const total = sum(weights);
      if (total === 0) return weights.map(() => 0);
      let cumulative = 0, reached = 0;
      return weights.map((w) => { cumulative += w; const next = Math.floor((amount * cumulative) / total); const share = next - reached; reached = next; return share; });
    },
  },
};

export interface Property { id: string; check: (input: Input, out: number[]) => boolean }
export const PROPERTIES: Property[] = [
  { id: 'sum', check: ({ amount, weights }, out) => sum(out) === (sum(weights) === 0 ? 0 : amount) },
  { id: 'bound', check: ({ weights }, out) => out.every((s, i) => s <= weights[i]) },
  { id: 'nonneg', check: (_, out) => out.every((s) => s >= 0) },
  { id: 'length', check: ({ weights }, out) => out.length === weights.length },
];

export function generate(r: () => number, size: number): Input {
  const n = 1 + Math.floor(r() * Math.min(6, 1 + size / 10));
  const max = 1 + Math.floor(size * 2);
  const weights = Array.from({ length: n }, () => Math.floor(r() * max));
  const total = sum(weights);
  const amount = Math.floor(r() * (total + 1));
  return { amount, weights };
}

/** Smaller candidates, simplest first. All keep amount <= sum(weights). */
export function shrinkCandidates({ amount, weights }: Input): Input[] {
  const out: Input[] = [];
  const fix = (w: number[], a: number): Input => ({ weights: w, amount: Math.min(a, sum(w)) });
  if (weights.length > 1) for (let i = 0; i < weights.length; i++) out.push(fix(weights.filter((_, k) => k !== i), amount));
  if (amount > 0) out.push(fix(weights, Math.floor(amount / 2)), fix(weights, amount - 1));
  for (let i = 0; i < weights.length; i++) {
    if (weights[i] > 0) {
      out.push(fix(weights.map((w, k) => (k === i ? Math.floor(w / 2) : w)), amount));
      out.push(fix(weights.map((w, k) => (k === i ? w - 1 : w)), amount));
    }
  }
  return out;
}

export interface RunResult {
  tried: { input: Input; out: number[]; ok: boolean }[];
  failure: null | { original: Input; steps: Input[]; minimal: Input; out: number[]; runs: number };
  seed: number;
}

export function check(allocate: Allocate, prop: Property, seed: number, runs = 200): RunResult {
  const r = rng(seed);
  const tried: RunResult['tried'] = [];
  const fails = (inp: Input) => { const out = allocate(inp.amount, inp.weights); return !prop.check(inp, out); };
  for (let i = 0; i < runs; i++) {
    const input = generate(r, i);
    const out = allocate(input.amount, input.weights);
    const ok = prop.check(input, out);
    tried.push({ input, out, ok });
    if (!ok) {
      const steps: Input[] = [input];
      let cur = input;
      for (let guard = 0; guard < 500; guard++) {
        const next = shrinkCandidates(cur).find(fails);
        if (!next) break;
        cur = next;
        steps.push(cur);
      }
      return { tried, failure: { original: input, steps, minimal: cur, out: allocate(cur.amount, cur.weights), runs: i + 1 }, seed };
    }
  }
  return { tried, failure: null, seed };
}
