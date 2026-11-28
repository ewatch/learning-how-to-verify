/**
 * Minimal property-based testing for the discount-allocation example:
 * seeded generation, a property check, and greedy shrinking to a minimal counterexample.
 */
import { rng } from './rng';
import type { Outcome } from './outcome';

export interface Input { amount: number; weights: number[] }
export type Allocate = (amount: number, weights: number[]) => number[];

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** `breaks`: the properties this implementation violates on some carts (empty for the correct one). */
export const IMPLS: Record<string, { code: string; fn: Allocate; correct: boolean; breaks: string[] }> = {
  round: {
    code: `// Each share = its proportion, rounded
function allocate(amount, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => total === 0 ? 0 : Math.round(amount * w / total));
}`,
    fn: (amount, weights) => { const total = sum(weights); return weights.map((w) => (total === 0 ? 0 : Math.round((amount * w) / total))); },
    correct: false,
    breaks: ['sum'],
  },
  floor: {
    code: `// Each share = its proportion, rounded down
function allocate(amount, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => total === 0 ? 0 : Math.floor(amount * w / total));
}`,
    fn: (amount, weights) => { const total = sum(weights); return weights.map((w) => (total === 0 ? 0 : Math.floor((amount * w) / total))); },
    correct: false,
    breaks: ['sum'],
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
    correct: true,
    breaks: [],
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

/** Smaller integers, smallest first, then closer and closer to x (as fast-check shrinks integers). */
function towardZero(x: number): number[] {
  const out: number[] = [];
  for (let d = x; d >= 1; d = Math.floor(d / 2)) if (!out.includes(x - d)) out.push(x - d);
  if (x > 0 && !out.includes(x - 1)) out.push(x - 1);
  return out;
}

/** Smaller candidates, simplest first. All keep amount <= sum(weights). */
export function shrinkCandidates({ amount, weights }: Input): Input[] {
  const out: Input[] = [];
  const fix = (w: number[], a: number): Input => ({ weights: w, amount: Math.min(a, sum(w)) });
  if (weights.length > 1) for (let i = 0; i < weights.length; i++) out.push(fix(weights.filter((_, k) => k !== i), amount));
  for (const a of towardZero(amount)) out.push(fix(weights, a));
  for (let i = 0; i < weights.length; i++) {
    for (const v of towardZero(weights[i])) out.push(fix(weights.map((w, k) => (k === i ? v : w)), amount));
  }
  // last: halve all weights at once, so a ratio such as [12, 4] can become [3, 1]
  if (weights.some((w) => w > 1)) out.push(fix(weights.map((w) => Math.floor(w / 2)), amount));
  return out;
}

export interface RunResult {
  tried: { input: Input; out: number[]; ok: boolean }[];
  /** `path`: index of the failing run, then the index of the shrink candidate taken at each step (as in fast-check). */
  failure: null | { original: Input; steps: Input[]; minimal: Input; out: number[]; runs: number; path: number[] };
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
      const path = [i];
      let cur = input;
      for (let guard = 0; guard < 500; guard++) {
        const k = shrinkCandidates(cur).findIndex(fails);
        if (k < 0) break;
        cur = shrinkCandidates(cur)[k];
        steps.push(cur);
        path.push(k);
      }
      return { tried, failure: { original: input, steps, minimal: cur, out: allocate(cur.amount, cur.weights), runs: i + 1, path }, seed };
    }
  }
  return { tried, failure: null, seed };
}

/* ───── Outcome for the result panel (see src/sim/ui/kit.ts) ───── */

export type PbtCause =
  | 'lost-cents' | 'extra-cents' // sum property: shares add up to less / more than the discount
  | 'over-weight' | 'negative' | 'wrong-length' // the other properties (no shipped implementation breaks them)
  | 'holds' // the property held, and it is a property that this implementation must keep
  | 'holds-weak' // the property held, but the implementation has a bug this property does not look at
  | 'holds-missed'; // the implementation breaks this property, but no generated cart hit the bug (try another seed)

export interface PbtValues {
  impl: string;
  /** 'round' | 'floor' | 'cumulative' – the rounding method of the implementation */
  method: string;
  runs: number;
  /** number of generated carts (200) */
  total: number;
  seed: number;
  /** minimal counterexample and the shares the implementation returned for it */
  amount?: number;
  weights?: number[];
  shares?: number[];
  /** the exact (unrounded) share of each pet: amount * weight / total */
  exact?: number[];
  sum?: number;
  /** cents missing (positive) or too many (negative) */
  diff?: number;
  /** index of the first share that breaks the property */
  index?: number;
  shrinks?: number;
}
export type PbtOutcome = Outcome<PbtCause, PbtValues>;

/** Verdict, cause and numbers of one PBT run. Pure. */
export function pbtOutcome(implId: string, propId: string, r: RunResult, total = 200): PbtOutcome {
  const base: PbtValues = { impl: implId, method: implId, runs: r.failure ? r.failure.runs : r.tried.length, total, seed: r.seed };
  if (!r.failure) {
    const impl = IMPLS[implId];
    const causeId: PbtCause = !impl || impl.correct ? 'holds' : impl.breaks.includes(propId) ? 'holds-missed' : 'holds-weak';
    return { status: causeId === 'holds' ? 'pass' : 'warn', tone: causeId === 'holds' ? 'ok' : 'warn', causeId, values: base };
  }
  const { minimal: m, out } = r.failure;
  const t = sum(m.weights);
  const exact = m.weights.map((w) => (t === 0 ? 0 : (m.amount * w) / t));
  const values: PbtValues = { ...base, amount: m.amount, weights: m.weights, shares: out, exact, sum: sum(out), shrinks: r.failure.steps.length - 1 };
  if (propId === 'sum') {
    const diff = m.amount - sum(out);
    return { status: 'fail', tone: 'ok', causeId: diff > 0 ? 'lost-cents' : 'extra-cents', values: { ...values, diff } };
  }
  if (propId === 'bound') return { status: 'fail', tone: 'ok', causeId: 'over-weight', values: { ...values, index: out.findIndex((s, i) => s > m.weights[i]) } };
  if (propId === 'nonneg') return { status: 'fail', tone: 'ok', causeId: 'negative', values: { ...values, index: out.findIndex((s) => s < 0) } };
  return { status: 'fail', tone: 'ok', causeId: 'wrong-length', values };
}

const ASSERT: Record<string, (i: Input, out: number[]) => string> = {
  sum: (i, out) => `expected ${sum(out)} to be ${i.amount}`,
  bound: () => 'expected false to be true',
  nonneg: () => 'expected false to be true',
  length: (i, out) => `expected ${out.length} to be ${i.weights.length}`,
};

/** Test names as they would appear in the agent's test file. */
const TEST_NAME: Record<string, string> = { sum: 'shares add up to the discount', bound: 'no share exceeds its weight', nonneg: 'no share is negative', length: 'one share per pet' };

/** The failure report in the format fast-check prints (fc.assert inside a Vitest test). */
export function fastCheckReport(propId: string, r: RunResult): string {
  if (!r.failure) {
    return ` ✓ allocate.property.test.ts (1 test)\n   ✓ allocate > ${TEST_NAME[propId] ?? propId} (${r.tried.length} runs)\n\n Test Files  1 passed (1)\n      Tests  1 passed (1)`;
  }
  const f = r.failure;
  return [
    ` FAIL  allocate.property.test.ts > allocate > ${TEST_NAME[propId] ?? propId}`,
    `Error: Property failed after ${f.runs} tests`,
    `{ seed: ${r.seed}, path: "${f.path.join(':')}", endOnFailure: true }`,
    `Counterexample: [${f.minimal.amount},[${f.minimal.weights.join(',')}]]`,
    `Shrunk ${f.steps.length - 1} time(s)`,
    `Got AssertionError: ${(ASSERT[propId] ?? ASSERT.bound)(f.minimal, f.out)}`,
  ].join('\n');
}
