/** Regression exercise: one test must fail on the old code and pass on the fix. */
import { loadSuite, type Lang } from './jsrun';

export const OLD_CODE = `function reserve(reservations, petId, person) {
  const id = petId;
  if (reservations[id]) return { ok: false, reason: 'taken' };
  reservations[id] = person;
  return { ok: true };
}`;

export const FIXED_CODE = `function reserve(reservations, petId, person) {
  const id = petId.trim();
  if (reservations[id]) return { ok: false, reason: 'taken' };
  reservations[id] = person;
  return { ok: true };
}`;

/** 0-based index of the one differing line */
export const CHANGED_LINE = 1;

export const START_TEST = `test('Ben cannot reserve Rex after Anna', () => {
  // write the test that reproduces the bug report
});`;

export const SAMPLE_TEST = `test('a pet id with a trailing space is still taken', () => {
  const reservations = {};
  reserve(reservations, 'rex', 'Anna');
  expect(reserve(reservations, 'rex ', 'Ben')).toEqual({ ok: false, reason: 'taken' });
});`;

export interface Side { failed: boolean; count: number; msg?: string }
export type Verdict = 'good' | 'no-repro' | 'fix-fails' | 'no-test';
export interface RegressionResult { old: Side; fixed: Side; verdict: Verdict }

function runSide(code: string, tests: string, lang: Lang): Side {
  try {
    const rs = loadSuite(code, tests, lang).map((t) => t.run());
    const bad = rs.find((r) => !r.ok);
    return { failed: !!bad, count: rs.length, msg: bad?.msg };
  } catch (e) {
    return { failed: true, count: 0, msg: `${(e as Error).name}: ${(e as Error).message}` };
  }
}

export function checkRegression(tests: string, lang: Lang, oldCode = OLD_CODE, fixedCode = FIXED_CODE): RegressionResult {
  const old = runSide(oldCode, tests, lang);
  const fixed = runSide(fixedCode, tests, lang);
  const verdict: Verdict = fixed.count === 0 && !fixed.failed ? 'no-test'
    : fixed.failed ? 'fix-fails'
    : old.failed ? 'good' : 'no-repro';
  return { old, fixed, verdict };
}
