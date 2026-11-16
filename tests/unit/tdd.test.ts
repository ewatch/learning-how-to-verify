import { describe, expect, it } from 'vitest';
import { REFACTORED, SOLUTION, STUB, TITLES, advance, allGreen, runTdd } from '../../src/sim/engine/tdd';

describe('tdd engine', () => {
  it('has one title per approved test in both languages', () => {
    const n = runTdd(STUB, 'en').length;
    expect(n).toBe(4);
    expect(TITLES.de).toHaveLength(n);
  });
  it('stub is fully red', () => {
    expect(runTdd(STUB, 'en').every((r) => !r.ok)).toBe(true);
  });
  it('solution and refactored version are green', () => {
    expect(allGreen(runTdd(SOLUTION, 'en'))).toBe(true);
    expect(allGreen(runTdd(REFACTORED, 'en'))).toBe(true);
  });
  it('a double-reserving implementation is caught by the never-twice test', () => {
    const r = runTdd(SOLUTION.replace("pet.reservedBy === null", 'true'), 'en');
    expect(r[2].ok).toBe(false);
  });
  it('syntax errors are red, not exceptions', () => {
    expect(runTdd('function (', 'de').every((r) => !r.ok)).toBe(true);
  });
  it('advances red -> green -> done only with a changed, green version', () => {
    let s = advance({ phase: 'red' }, STUB, runTdd(STUB, 'en'));
    expect(s.phase).toBe('red');
    s = advance(s, SOLUTION, runTdd(SOLUTION, 'en'));
    expect(s.phase).toBe('green');
    s = advance(s, SOLUTION, runTdd(SOLUTION, 'en'));
    expect(s.phase).toBe('green');
    s = advance(s, STUB, runTdd(STUB, 'en'));
    expect(s.phase).toBe('green');
    s = advance(s, REFACTORED, runTdd(REFACTORED, 'en'));
    expect(s.phase).toBe('done');
  });
});
