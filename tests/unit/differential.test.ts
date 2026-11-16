import { describe, expect, it } from 'vitest';
import { NEW, OLD, compare, minimalDiff } from '../../src/sim/engine/differential';

const v = (id: string) => NEW.find((x) => x.id === id)!;
describe('differential example', () => {
  it('refactor 1 (round) differs on real prices', () => {
    const r = compare(v('round').fn, 1, 2000, true);
    expect(r.diffs.length).toBeGreaterThan(0);
    const m = minimalDiff(v('round').fn, r.diffs[0]);
    expect(m.cents).toBeLessThan(100);
  });
  it('refactor 2 (ceil) still differs because of floating point', () => {
    expect(compare(v('ceil').fn, 1, 2000, true).diffs.length).toBeGreaterThan(0);
    expect(v('ceil').fn(110, 'TIER10')).toBe(100);
    expect(OLD.fn(110, 'TIER10')).toBe(99);
  });
  it('refactor 3 (integer) only differs in the intended lower-case vouchers', () => {
    expect(compare(v('integer').fn, 1, 5000, true).diffs).toEqual([]);
    const strict = compare(v('integer').fn, 1, 5000, false).diffs;
    expect(strict.length).toBeGreaterThan(0);
    expect(strict.every((d) => d.intended)).toBe(true);
  });
});
