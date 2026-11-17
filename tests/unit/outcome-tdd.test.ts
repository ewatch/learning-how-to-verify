import { describe, expect, it } from 'vitest';
import { STUB, SOLUTION, REFACTORED, runTdd, advance, tddOutcome, tddReport, type TddState } from '../../src/sim/engine/tdd';

const step = (s: TddState, code: string) => { const res = runTdd(code, 'en'); const next = advance(s, code, res); return { next, o: tddOutcome(s, next, res), res }; };

describe('TDD outcome', () => {
  it('the stub is red because nothing is implemented', () => {
    const { o, res } = step({ phase: 'red' }, STUB);
    expect(o).toMatchObject({ status: 'fail', causeId: 'not-implemented', values: { passed: 0, failed: 4, total: 4 } });
    expect(tddReport(res)).toContain('Tests  4 failed (4)');
  });
  it('a partial implementation is red with the first failing test', () => {
    const partial = 'function reserve(pets, petId, person) { const p = pets.find((x) => x.id === petId); if (!p) return { ok: false, reason: "not-found" }; p.reservedBy = person; return { ok: true }; }';
    const { o } = step({ phase: 'red' }, partial);
    expect(o).toMatchObject({ status: 'fail', causeId: 'red', values: { passed: 2, first: { index: 2 } } });
  });
  it('red → green → refactor → done; the same code again is green-same', () => {
    const a = step({ phase: 'red' }, SOLUTION);
    expect(a.o).toMatchObject({ status: 'pass', causeId: 'green' });
    expect(step(a.next, SOLUTION).o.causeId).toBe('green-same');
    expect(step(a.next, REFACTORED).o).toMatchObject({ status: 'pass', causeId: 'done' });
  });
  it('breaking a green implementation is reported as broken, with the failing test', () => {
    const a = step({ phase: 'red' }, SOLUTION);
    const b = step(a.next, SOLUTION.replace('person.trim()', 'person'));
    expect(b.o).toMatchObject({ status: 'fail', causeId: 'broken', values: { failed: 1, first: { name: 'trims the name' } } });
    expect(tddReport(b.res)).toContain('FAIL  reserve.test.js > trims the name');
  });
});
