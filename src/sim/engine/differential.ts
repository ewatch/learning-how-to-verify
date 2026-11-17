/** Differential testing: the old voucher pricing against three "refactored" versions. */
import { rng } from './rng';
import type { Outcome } from './outcome';

export type PriceFn = (cents: number, voucher: string) => number;
/** `kind`: how the version computes the price ('float' = euros in floating point, 'nearest' = rounds to nearest, 'integer' = integer cents). */
export interface Version { id: string; code: string; fn: PriceFn; kind?: 'nearest' | 'float' | 'integer' }

export const OLD: Version = {
  id: 'old',
  code: `// legacy: integer arithmetic on cents
function price(cents, voucher) {
  if (voucher === "TIER10") return cents - Math.floor(cents / 10);
  return cents;
}`,
  fn: (c, v) => (v === 'TIER10' ? c - Math.floor(c / 10) : c),
};

export const NEW: Version[] = [
  { id: 'round', kind: 'nearest', code: `// refactor 1: percentages, case-insensitive codes
function price(cents, voucher) {
  const pct = voucher.toUpperCase() === "TIER10" ? 10 : 0;
  return Math.round(cents * (1 - pct / 100));
}`, fn: (c, v) => Math.round(c * (1 - (v.toUpperCase() === 'TIER10' ? 10 : 0) / 100)) },
  { id: 'ceil', kind: 'float', code: `// refactor 2: work in euros, round up like the old code
function price(cents, voucher) {
  const pct = voucher.toUpperCase() === "TIER10" ? 10 : 0;
  const euros = cents / 100;
  return Math.ceil(euros * (100 - pct));
}`, fn: (c, v) => Math.ceil((c / 100) * (100 - (v.toUpperCase() === 'TIER10' ? 10 : 0))) },
  { id: 'integer', kind: 'integer', code: `// refactor 3: back to integer arithmetic
function price(cents, voucher) {
  const pct = voucher.toUpperCase() === "TIER10" ? 10 : 0;
  return cents - Math.floor(cents * pct / 100);
}`, fn: (c, v) => c - Math.floor((c * (v.toUpperCase() === 'TIER10' ? 10 : 0)) / 100) },
];

export const VOUCHERS = ['', 'TIER10', 'tier10', 'XMAS'];

export interface Diff { cents: number; voucher: string; old: number; neu: number; intended: boolean }

/** lower-case voucher codes are an intended change of the refactoring */
export const isIntended = (voucher: string) => voucher !== voucher.toUpperCase() && voucher.toUpperCase() === 'TIER10';

export function compare(neu: PriceFn, seed: number, runs: number, allowIntended: boolean) {
  const r = rng(seed);
  const diffs: Diff[] = [];
  let agree = 0;
  for (let i = 0; i < runs; i++) {
    const cents = Math.floor(r() * 20000);
    const voucher = VOUCHERS[Math.floor(r() * VOUCHERS.length)];
    const o = OLD.fn(cents, voucher), n = neu(cents, voucher);
    if (o === n) { agree++; continue; }
    const intended = isIntended(voucher);
    if (intended && allowIntended) { agree++; continue; }
    diffs.push({ cents, voucher, old: o, neu: n, intended });
  }
  return { agree, diffs };
}

/** smallest cents value with the same voucher that still differs */
export function minimalDiff(neu: PriceFn, d: Diff): Diff {
  for (let c = 0; c <= d.cents; c++) {
    const o = OLD.fn(c, d.voucher), n = neu(c, d.voucher);
    if (o !== n) return { ...d, cents: c, old: o, neu: n };
  }
  return d;
}

/* ───── Outcome for the result panel (see src/sim/ui/kit.ts) ───── */

export type DiffCause = 'equivalent' | 'intended-only' | 'rounding' | 'float' | 'other';
export interface DiffValues {
  version: string;
  runs: number;
  agree: number;
  diffs: number;
  intended: number;
  allow: boolean;
  /** smallest differing price for the first unexplained difference */
  minimal?: Diff;
  /** the exact value before rounding in the new version, as JavaScript prints it (e.g. "99.00000000000001") */
  raw?: string;
  /** the factor the float version multiplies the euros with (100 - percent) */
  factor?: number;
  /** the exact price as a decimal (cents * (100 - pct) / 100), for comparison */
  exact?: string;
}
export type DiffOutcome = Outcome<DiffCause, DiffValues>;

const pctOf = (voucher: string) => (voucher.toUpperCase() === 'TIER10' ? 10 : 0);

/** Verdict, cause and numbers of one comparison. Pure. */
export function differentialOutcome(versionId: string, seed: number, runs: number, allowIntended: boolean): DiffOutcome {
  const v = NEW.find((n) => n.id === versionId)!;
  const r = compare(v.fn, seed, runs, allowIntended);
  const values: DiffValues = { version: versionId, runs, agree: r.agree, diffs: r.diffs.length, intended: r.diffs.filter((d) => d.intended).length, allow: allowIntended };
  if (!r.diffs.length) return { status: 'pass', causeId: 'equivalent', values };
  const unexplained = r.diffs.find((d) => !d.intended);
  if (!unexplained) return { status: 'warn', causeId: 'intended-only', values: { ...values, minimal: minimalDiff(v.fn, r.diffs[0]) } };
  const m = minimalDiff(v.fn, unexplained);
  const pct = pctOf(m.voucher);
  const exact = String((m.cents * (100 - pct)) / 100);
  if (v.kind === 'float') return { status: 'fail', causeId: 'float', values: { ...values, minimal: m, raw: String((m.cents / 100) * (100 - pct)), factor: 100 - pct, exact } };
  if (v.kind === 'nearest') return { status: 'fail', causeId: 'rounding', values: { ...values, minimal: m, exact } };
  return { status: 'fail', causeId: 'other', values: { ...values, minimal: m, exact } };
}

/** A differential property test failure (fast-check in Vitest), as an agent sees it. */
export function differentialReport(o: DiffOutcome): string {
  const v = o.values;
  if (!v.minimal) return ` ✓ price.diff.test.ts (1 test)\n   ✓ new price() equals old price() (${v.runs} runs)\n\n Test Files  1 passed (1)\n      Tests  1 passed (1)`;
  const m = v.minimal;
  return [
    ' FAIL  price.diff.test.ts > new price() equals old price()',
    'Error: Property failed',
    `Counterexample: [${m.cents},${JSON.stringify(m.voucher)}]`,
    `Got AssertionError: expected ${m.neu} to be ${m.old}`,
    '',
    `  old price(${m.cents}, ${JSON.stringify(m.voucher)}) = ${m.old}`,
    `  new price(${m.cents}, ${JSON.stringify(m.voucher)}) = ${m.neu}`,
  ].join('\n');
}
