import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { IMPLS, PROPERTIES, check, shrinkCandidates } from '../../src/sim/engine/pbt';

const prop = (id: string) => PROPERTIES.find((p) => p.id === id)!;

describe('mini PBT engine', () => {
  it('finds the rounding bug and shrinks it to a tiny counterexample', () => {
    const r = check(IMPLS.round.fn, prop('sum'), 42);
    expect(r.failure).not.toBeNull();
    const m = r.failure!.minimal;
    expect(m.weights.length).toBeLessThanOrEqual(3);
    expect(m.amount).toBeLessThanOrEqual(3);
  });
  it('floor loses cents and is caught too', () => {
    expect(check(IMPLS.floor.fn, prop('sum'), 7).failure).not.toBeNull();
  });
  it('the cumulative implementation passes every property for many seeds', () => {
    for (const p of PROPERTIES) for (const seed of [1, 2, 3, 42, 99]) expect(check(IMPLS.cumulative.fn, p, seed).failure).toBeNull();
  });
  it('is reproducible from its seed', () => {
    expect(check(IMPLS.round.fn, prop('sum'), 5)).toEqual(check(IMPLS.round.fn, prop('sum'), 5));
  });
  it('shrink candidates stay valid (amount <= total) — checked with fast-check', () => {
    fc.assert(fc.property(fc.array(fc.nat(50), { minLength: 1, maxLength: 6 }), fc.nat(), (weights, raw) => {
      const total = weights.reduce((a, b) => a + b, 0);
      const input = { weights, amount: total ? raw % (total + 1) : 0 };
      for (const c of shrinkCandidates(input)) {
        expect(c.amount).toBeLessThanOrEqual(c.weights.reduce((a, b) => a + b, 0));
        expect(c.weights.length).toBeGreaterThan(0);
      }
    }));
  });
  it('the cumulative implementation agrees with the Dafny contract, checked by fast-check itself', () => {
    fc.assert(fc.property(fc.array(fc.nat(10_000), { minLength: 1 }), fc.nat(), (weights, raw) => {
      const total = weights.reduce((a, b) => a + b, 0);
      const amount = total === 0 ? 0 : raw % (total + 1);
      const s = IMPLS.cumulative.fn(amount, weights);
      expect(s.reduce((a, b) => a + b, 0)).toBe(total === 0 ? 0 : amount);
      s.forEach((x, i) => expect(x).toBeLessThanOrEqual(weights[i]));
    }));
  });
});
