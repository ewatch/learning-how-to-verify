import { describe, expect, it } from 'vitest';
import { CHANGED_LINE, FIXED_CODE, OLD_CODE, SAMPLE_TEST, START_TEST, checkRegression } from '../../src/sim/engine/regression';

describe('regression engine', () => {
  it('old and fixed differ in exactly one line', () => {
    const a = OLD_CODE.split('\n'), b = FIXED_CODE.split('\n');
    const diff = a.map((l, i) => (l !== b[i] ? i : -1)).filter((i) => i >= 0);
    expect(diff).toEqual([CHANGED_LINE]);
  });
  it('sample test fails on old, passes on fix', () => {
    const r = checkRegression(SAMPLE_TEST, 'en');
    expect(r.old.failed).toBe(true);
    expect(r.fixed.failed).toBe(false);
    expect(r.verdict).toBe('good');
  });
  it('a test that does not reproduce the bug passes both', () => {
    const t = `test('same id twice', () => { const r = {}; reserve(r, 'rex', 'Anna'); expect(reserve(r, 'rex', 'Ben').reason).toBe('taken'); });`;
    const r = checkRegression(t, 'de');
    expect(r.old.failed).toBe(false);
    expect(r.verdict).toBe('no-repro');
  });
  it('a wrong test fails on the fix', () => {
    const t = `test('wrong', () => { const r = {}; reserve(r, 'rex', 'Anna'); expect(reserve(r, 'rex ', 'Ben').ok).toBe(true); });`;
    expect(checkRegression(t, 'en').verdict).toBe('fix-fails');
  });
  it('the empty starting test does not reproduce; syntax errors and no tests are not good', () => {
    expect(checkRegression(START_TEST, 'en').verdict).toBe('no-repro');
    expect(checkRegression('test(', 'en').verdict).toBe('fix-fails');
    expect(checkRegression('', 'en').verdict).toBe('no-test');
  });
});
