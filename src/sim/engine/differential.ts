/** Differential testing: the old voucher pricing against three "refactored" versions. */
import { rng } from './rng';

export type PriceFn = (cents: number, voucher: string) => number;
export interface Version { id: string; code: string; fn: PriceFn }

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
  { id: 'round', code: `// refactor 1: percentages, case-insensitive codes
function price(cents, voucher) {
  const pct = voucher.toUpperCase() === "TIER10" ? 10 : 0;
  return Math.round(cents * (1 - pct / 100));
}`, fn: (c, v) => Math.round(c * (1 - (v.toUpperCase() === 'TIER10' ? 10 : 0) / 100)) },
  { id: 'ceil', code: `// refactor 2: work in euros, round up like the old code
function price(cents, voucher) {
  const pct = voucher.toUpperCase() === "TIER10" ? 10 : 0;
  const euros = cents / 100;
  return Math.ceil(euros * (100 - pct));
}`, fn: (c, v) => Math.ceil((c / 100) * (100 - (v.toUpperCase() === 'TIER10' ? 10 : 0))) },
  { id: 'integer', code: `// refactor 3: back to integer arithmetic
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
