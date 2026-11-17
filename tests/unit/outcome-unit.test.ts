import { describe, expect, it } from 'vitest';
import { IMPLS, unitOutcome, witness, type Case } from '../../src/sim/engine/unitsim';

const START: Case[] = [{ species: 'dog', age: 3, expect: 12000 }, { species: 'dog', age: 10, expect: 6000 }];
const FULL: Case[] = [...START, { species: 'dog', age: 8, expect: 6000 }, { species: 'dog', age: 1, expect: 12000 }, { species: 'dog', age: 0, expect: 14000 }, { species: 'dog', age: -1, expect: 'throws' }, { species: 'cat', age: 3, expect: 8000 }];

describe('unit-test exercise outcome', () => {
  it('the start examples catch no bug; the first missed bug comes with an input that exposes it', () => {
    const o = unitOutcome(START);
    expect(o).toMatchObject({ status: 'fail', causeId: 'bugs-missed', values: { caught: 0, total: 5, examples: 2, species: ['dog'], ages: [3, 10] } });
    const m = o.values.missed!;
    expect(m.no).toBe(1);
    expect(m.witness).toEqual({ species: 'dog', age: 8, correct: 6000, buggy: 12000 });
    expect(o.values.report).toContain('Tests  2 passed (2)');
  });
  it('every buggy implementation has a witness input, and the correct one has none', () => {
    for (const impl of IMPLS) expect(witness(impl) === null).toBe(!impl.buggy);
  });
  it('an expectation that fails on the correct implementation is reported first, with the correct value', () => {
    const o = unitOutcome([{ species: 'dog', age: 3, expect: 10000 }, ...FULL.slice(1)]);
    expect(o).toMatchObject({ status: 'fail', causeId: 'wrong-example', values: { wrong: { index: 1, species: 'dog', age: 3, expected: 10000, correct: 12000 } } });
    expect(o.values.report).toContain('expected 12000 to be 10000');
  });
  it('all bugs caught: pass, and the report shows the failure the agent gets for the first bug', () => {
    const o = unitOutcome(FULL);
    expect(o).toMatchObject({ status: 'pass', causeId: 'all-caught', values: { caught: 5, total: 5, examples: 7 } });
    expect(o.values.report).toContain('FAIL  fee.test.ts > adoptionFee > dog, age 8: 6000');
    expect(o.values.report).toContain('expected 12000 to be 6000');
  });
  it('no examples is a failure', () => {
    expect(unitOutcome([])).toMatchObject({ status: 'fail', causeId: 'no-examples' });
  });
});
