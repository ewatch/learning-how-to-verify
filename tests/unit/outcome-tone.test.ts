import { describe, expect, it } from 'vitest';
import { toneOf } from '../../src/sim/engine/outcome';
import { unitOutcome, type Case } from '../../src/sim/engine/unitsim';
import { IMPLS, PROPERTIES, check, pbtOutcome } from '../../src/sim/engine/pbt';

const START: Case[] = [{ species: 'dog', age: 3, expect: 12000 }, { species: 'dog', age: 10, expect: 6000 }];
const FULL: Case[] = [...START, { species: 'dog', age: 8, expect: 6000 }, { species: 'dog', age: 1, expect: 12000 }, { species: 'dog', age: 0, expect: 14000 }, { species: 'dog', age: -1, expect: 'throws' }, { species: 'cat', age: 3, expect: 8000 }];

describe('learner tone', () => {
  it('falls back to the status when an outcome has no tone', () => {
    expect(toneOf({ status: 'pass' })).toBe('ok');
    expect(toneOf({ status: 'warn' })).toBe('warn');
    expect(toneOf({ status: 'fail' })).toBe('bad');
    expect(toneOf({ status: 'fail', tone: 'progress' })).toBe('progress');
  });

  it('unit tests: missed bugs are progress, not a mistake, also after the first catch', () => {
    expect(toneOf(unitOutcome([]))).toBe('progress');
    expect(toneOf(unitOutcome(START))).toBe('progress');
    const one = unitOutcome([...START, { species: 'dog', age: 8, expect: 6000 }]);
    expect(one.values.caught).toBeGreaterThan(0);
    expect(toneOf(one)).toBe('progress');
  });

  it('unit tests: only a wrong expectation is red; all caught is ok', () => {
    expect(toneOf(unitOutcome([{ species: 'dog', age: 3, expect: 10000 }]))).toBe('bad');
    expect(toneOf(unitOutcome(FULL))).toBe('ok');
  });

  it('property-based tests: a found counterexample is the goal, a weak property is a warning', () => {
    const run = (impl: string, prop: string) => pbtOutcome(impl, prop, check(IMPLS[impl]!.fn, PROPERTIES.find((p) => p.id === prop)!, 42));
    const found = run('round', 'sum');
    expect(found.status).toBe('fail');
    expect(toneOf(found)).toBe('ok');
    expect(toneOf(run('cumulative', 'sum'))).toBe('ok');
    expect(toneOf(run('floor', 'bound'))).toBe('warn');
  });
});
