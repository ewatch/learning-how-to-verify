/** Regression exercise: one test must fail on the old code and pass on the fix. */
import { loadSuite, type Lang } from './jsrun';
import { vitestMessage, type Outcome } from './outcome';

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

/* ───── Outcome for the result panel (see src/sim/ui/kit.ts) ───── */

export type RegressionCause =
  | 'no-test' // no test(...) block
  | 'no-assertion' // the test runs but checks nothing (no expect), so it passes everywhere
  | 'no-trailing-space' // passes on the old code and never uses an id with a trailing space
  | 'no-repro' // passes on the old code for another reason
  | 'fix-fails' // fails on the fixed code
  | 'good';
export interface RegressionValues { tests: number; oldMsg?: string; fixedMsg?: string }
export type RegressionOutcome = Outcome<RegressionCause, RegressionValues>;

/** True if the code contains a string literal that ends with whitespace, such as 'rex '. */
const hasTrailingSpaceLiteral = (code: string) => [...code.matchAll(/'([^'\n]*)'|"([^"\n]*)"|`([^`]*)`/g)].some((m) => /\s$/.test(m[1] ?? m[2] ?? m[3] ?? ''));

/** Verdict and cause for a regression test. Pure. */
export function regressionOutcome(tests: string, r: RegressionResult): RegressionOutcome {
  const values: RegressionValues = { tests: r.fixed.count, oldMsg: r.old.msg, fixedMsg: r.fixed.msg };
  if (r.verdict === 'no-test') return { status: 'fail', causeId: 'no-test', values };
  if (r.verdict === 'good') return { status: 'pass', causeId: 'good', values };
  if (r.verdict === 'fix-fails') return { status: 'fail', causeId: 'fix-fails', values };
  if (!/\bexpect\s*\(/.test(tests)) return { status: 'fail', causeId: 'no-assertion', values };
  if (!hasTrailingSpaceLiteral(tests)) return { status: 'fail', causeId: 'no-trailing-space', values };
  return { status: 'fail', causeId: 'no-repro', values };
}

/** What the agent sees. Pass the result of `checkRegression(tests, 'en')`. */
export function regressionReport(tests: string, r: RegressionResult): string {
  const name = /test\(\s*(['"`])(.*?)\1/.exec(tests)?.[2] ?? 'regression test';
  const side = (label: string, s: Side) => s.failed
    ? ` FAIL  reserve.test.js > ${name}   [${label}]\n${vitestMessage(s.msg, true)}`
    : ` ✓ reserve.test.js > ${name}   [${label}]`;
  return [side('old code', r.old), side('fixed code', r.fixed)].join('\n');
}
