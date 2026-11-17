import { describe, expect, it } from 'vitest';
import { checkRegression, regressionOutcome, regressionReport, START_TEST, SAMPLE_TEST } from '../../src/sim/engine/regression';

const outcome = (t: string) => regressionOutcome(t, checkRegression(t, 'en'));

describe('regression outcome', () => {
  it('the start test has no assertion', () => {
    expect(outcome(START_TEST)).toMatchObject({ status: 'fail', causeId: 'no-assertion' });
  });
  it('a test without the trailing-space id does not reproduce the bug', () => {
    const t = `test('t', () => { const r = {}; reserve(r, 'rex', 'Anna'); expect(reserve(r, 'rex', 'Ben')).toEqual({ ok: false, reason: 'taken' }); });`;
    expect(outcome(t)).toMatchObject({ status: 'fail', causeId: 'no-trailing-space' });
  });
  it('a trailing-space test that asserts the wrong thing does not reproduce it either', () => {
    const t = `test('t', () => { const r = {}; reserve(r, 'rex', 'Anna'); expect(reserve(r, 'mia ', 'Ben')).toEqual({ ok: true }); });`;
    expect(outcome(t)).toMatchObject({ status: 'fail', causeId: 'no-repro' });
  });
  it('a test that fails on the fix is reported with its message', () => {
    const t = `test('t', () => { expect(reserve({}, 'rex', 'Ben')).toEqual({ ok: false }); });`;
    const o = outcome(t);
    expect(o).toMatchObject({ status: 'fail', causeId: 'fix-fails' });
    expect(o.values.fixedMsg).toContain('expected');
  });
  it('the sample test is a good regression test; the report shows red on old and green on the fix', () => {
    const o = outcome(SAMPLE_TEST);
    expect(o).toMatchObject({ status: 'pass', causeId: 'good' });
    const out = regressionReport(SAMPLE_TEST, checkRegression(SAMPLE_TEST, 'en'));
    expect(out).toContain('FAIL  reserve.test.js > a pet id with a trailing space is still taken   [old code]');
    expect(out).toContain('deeply equal');
    expect(out).toContain('✓ reserve.test.js > a pet id with a trailing space is still taken   [fixed code]');
  });
  it('no test block', () => {
    expect(outcome('// nothing')).toMatchObject({ status: 'fail', causeId: 'no-test' });
  });
});
