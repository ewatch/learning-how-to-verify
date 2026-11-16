import { describe, expect, it } from 'vitest';
import { modelCheck } from '../../src/sim/engine/modelcheck';

describe('mini model checker', () => {
  it('finds the double booking for check-then-reserve with a 4-step trace (5 states, as TLC does)', () => {
    const r = modelCheck({ people: 2, atomic: false });
    expect(r.violation).not.toBeNull();
    expect(r.violation!.trace.map((s) => s.action)).toEqual(['check', 'check', 'reserve', 'reserve']);
  });
  it('matches TLC on the fixed model: 5 distinct states, no error', () => {
    const r = modelCheck({ people: 2, atomic: true });
    expect(r.violation).toBeNull();
    expect(r.distinct).toBe(5);
  });
  it('the atomic protocol stays safe with 3 and 4 people', () => {
    for (const people of [3, 4]) expect(modelCheck({ people, atomic: true }).violation).toBeNull();
  });
  it('the shortest counterexample is found first (breadth-first)', () => {
    expect(modelCheck({ people: 3, atomic: false }).violation!.trace).toHaveLength(4);
  });
});
