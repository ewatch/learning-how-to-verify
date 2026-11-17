import { describe, expect, it } from 'vitest';
import { IMPLS, PROPERTIES, check, pbtOutcome, fastCheckReport } from '../../src/sim/engine/pbt';

const prop = (id: string) => PROPERTIES.find((p) => p.id === id)!;
const run = (impl: string, p: string, seed = 42) => { const r = check(IMPLS[impl].fn, prop(p), seed); return { r, o: pbtOutcome(impl, p, r) }; };
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe('PBT outcome', () => {
  it('Math.floor loses cents: the numbers come from the minimal counterexample', () => {
    for (const seed of [1, 2, 3, 42]) {
      const { r, o } = run('floor', 'sum', seed);
      expect(o.status).toBe('fail');
      expect(o.causeId).toBe('lost-cents');
      const v = o.values;
      expect(v.amount).toBe(r.failure!.minimal.amount);
      expect(v.weights).toEqual(r.failure!.minimal.weights);
      expect(v.shares).toEqual(IMPLS.floor.fn(v.amount!, v.weights!));
      expect(v.sum).toBe(sum(v.shares!));
      expect(v.diff).toBe(v.amount! - v.sum!);
      expect(v.diff).toBeGreaterThan(0);
      expect(v.runs).toBe(r.failure!.runs);
    }
  });
  it('Math.round can give out a cent too many, and the exact shares explain the rounding', () => {
    const { o } = run('round', 'sum', 42);
    expect(o.causeId).toBe('extra-cents');
    const v = o.values;
    expect(v.diff).toBeLessThan(0);
    const total = sum(v.weights!);
    expect(v.exact).toEqual(v.weights!.map((w) => (v.amount! * w) / total));
    expect(v.exact!.map(Math.round)).toEqual(v.shares);
  });
  it('the correct version holds; a bug that the property does not describe is a warning', () => {
    for (const p of PROPERTIES) expect(run('cumulative', p.id).o).toMatchObject({ status: 'pass', causeId: 'holds' });
    for (const impl of ['round', 'floor']) for (const p of ['bound', 'nonneg', 'length']) expect(run(impl, p).o).toMatchObject({ status: 'warn', causeId: 'holds-weak' });
  });
  it('a buggy version that the random search misses is reported as missed, not as correct', () => {
    const r = { tried: [], failure: null, seed: 1 };
    expect(pbtOutcome('round', 'sum', r)).toMatchObject({ status: 'warn', causeId: 'holds-missed' });
  });
  it('classifies the other properties when they fail', () => {
    const fake = (out: number[]) => ({ tried: [], seed: 1, failure: { original: { amount: 3, weights: [1, 2] }, steps: [{ amount: 3, weights: [1, 2] }], minimal: { amount: 3, weights: [1, 2] }, out, runs: 1, path: [0] } });
    expect(pbtOutcome('round', 'bound', fake([3, 0]))).toMatchObject({ causeId: 'over-weight', values: { index: 0 } });
    expect(pbtOutcome('round', 'nonneg', fake([4, -1]))).toMatchObject({ causeId: 'negative', values: { index: 1 } });
    expect(pbtOutcome('round', 'length', fake([3]))).toMatchObject({ causeId: 'wrong-length' });
  });
  it('the fast-check report carries seed, shrink path and the minimal counterexample', () => {
    const { r } = run('floor', 'sum', 42);
    const out = fastCheckReport('sum', r);
    const f = r.failure!;
    expect(out).toContain(`Property failed after ${f.runs} tests`);
    expect(out).toContain(`seed: 42, path: "${f.path.join(':')}"`);
    expect(f.path.length).toBe(f.steps.length);
    expect(out).toContain(`Counterexample: [${f.minimal.amount},[${f.minimal.weights.join(',')}]]`);
    expect(out).toContain(`expected ${sum(f.out)} to be ${f.minimal.amount}`);
    expect(fastCheckReport('sum', check(IMPLS.cumulative.fn, prop('sum'), 42))).toContain('1 passed');
  });
  it('the shrink path replays to the minimal counterexample', async () => {
    const { shrinkCandidates } = await import('../../src/sim/engine/pbt');
    const { r } = run('round', 'sum', 42);
    let cur = r.failure!.original;
    for (const k of r.failure!.path.slice(1)) cur = shrinkCandidates(cur)[k];
    expect(cur).toEqual(r.failure!.minimal);
  });
});
