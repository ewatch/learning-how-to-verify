import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { IMPLS, evaluate, type Case } from '../../src/sim/engine/unitsim';

describe('unit-test puzzle', () => {
  it('every buggy implementation really differs from the correct one', () => {
    for (const impl of IMPLS.filter((i) => i.buggy)) expect(impl.code).not.toBe(IMPLS[0].code);
  });
  it('the starting examples catch none of the bugs (that is the puzzle)', () => {
    const start: Case[] = [{ species: 'dog', age: 3, expect: 12000 }, { species: 'dog', age: 10, expect: 6000 }];
    expect(evaluate(start).caught).toEqual([]);
  });
  it('a complete set of boundary examples catches every bug', () => {
    const full: Case[] = [
      { species: 'dog', age: 3, expect: 12000 }, { species: 'dog', age: 8, expect: 6000 },
      { species: 'dog', age: 1, expect: 12000 }, { species: 'dog', age: 0, expect: 14000 },
      { species: 'dog', age: -1, expect: 'throws' }, { species: 'cat', age: 3, expect: 8000 },
    ];
    const r = evaluate(full);
    expect(r.wrongCases.every((w) => !w)).toBe(true);
    expect(r.caught.length).toBe(r.total);
  });
  it('property: an example that the correct implementation fails never counts as catching a bug', () => {
    fc.assert(fc.property(fc.array(fc.record({ species: fc.constantFrom('dog' as const, 'cat' as const), age: fc.integer({ min: -2, max: 12 }), expect: fc.oneof(fc.integer({ min: 0, max: 20000 }), fc.constant('throws' as const)) }), { maxLength: 6 }), (cases) => {
      const r = evaluate(cases);
      const onlyWrong = cases.filter((_, i) => !r.wrongCases[i]).length === 0;
      if (onlyWrong) expect(r.caught).toEqual([]);
    }));
  });
});
