/**
 * "Catch the bugs": one correct implementation of the adoption fee and several
 * plausible buggy ones. A good set of examples passes on the correct one and
 * fails on every buggy one.
 */
import { vitestReport, type Outcome as SimOutcome, type ReportTest } from './outcome';

export type Species = 'dog' | 'cat';
export interface Case { species: Species; age: number; expect: number | 'throws' }
export interface Impl { id: string; buggy: boolean; code: string; fn: (species: Species, age: number) => number }

const make = (id: string, buggy: boolean, code: string): Impl => ({
  id, buggy, code,
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  fn: new Function(`"use strict"; ${code}; return adoptionFee;`)() as Impl['fn'],
});

export const SPEC = {
  en: ['A dog costs 12000 cents (120.00 €), a cat 8000 cents (80.00 €).', 'Seniors (8 years or older) pay half.', 'Pets younger than 1 year add 2000 cents (20.00 €) for vaccinations.', 'An age that is negative or not a whole number is rejected with an error.'],
  de: ['Ein Hund kostet 12000 Cent (120,00 €), eine Katze 8000 Cent (80,00 €).', 'Senioren (ab 8 Jahren) zahlen die Hälfte.', 'Tiere unter 1 Jahr kosten 2000 Cent (20,00 €) mehr für Impfungen.', 'Ein negatives oder nicht ganzzahliges Alter wird mit einem Fehler abgelehnt.'],
};

const correct = `function adoptionFee(species, ageYears) {
  if (!Number.isInteger(ageYears) || ageYears < 0) throw new Error("invalid age");
  let fee = species === "cat" ? 8000 : 12000;
  if (ageYears >= 8) fee = fee / 2;
  if (ageYears < 1) fee = fee + 2000;
  return fee;
}`;

export const IMPLS: Impl[] = [
  make('correct', false, correct),
  make('senior-boundary', true, correct.replace('ageYears >= 8', 'ageYears > 8')),
  make('puppy-boundary', true, correct.replace('ageYears < 1)', 'ageYears <= 1)')),
  make('no-vaccination', true, correct.replace('  if (ageYears < 1) fee = fee + 2000;\n', '')),
  make('accepts-negative', true, correct.replace(' || ageYears < 0', '')),
  make('ignores-species', true, correct.replace('species === "cat" ? 8000 : 12000', '12000')),
];

export const BUG_LABEL: Record<string, { en: string; de: string }> = {
  correct: { en: 'Correct implementation', de: 'Korrekte Implementierung' },
  'senior-boundary': { en: 'Bug: seniors from 9, not 8', de: 'Fehler: Senioren erst ab 9 statt 8' },
  'puppy-boundary': { en: 'Bug: 1-year-olds also pay vaccinations', de: 'Fehler: Auch 1-Jährige zahlen Impfungen' },
  'no-vaccination': { en: 'Bug: vaccination fee forgotten', de: 'Fehler: Impfgebühr vergessen' },
  'accepts-negative': { en: 'Bug: negative ages accepted', de: 'Fehler: negatives Alter akzeptiert' },
  'ignores-species': { en: 'Bug: cats priced like dogs', de: 'Fehler: Katzen kosten wie Hunde' },
};

export type Outcome = 'pass' | 'fail';
export function check(impl: Impl, c: Case): { outcome: Outcome; got: string } {
  let got: number | 'throws';
  try { got = impl.fn(c.species, c.age); } catch { got = 'throws'; }
  const ok = c.expect === 'throws' ? got === 'throws' : got === c.expect;
  return { outcome: ok ? 'pass' : 'fail', got: got === 'throws' ? 'throws' : String(got) };
}

export function evaluate(cases: Case[]) {
  const rows = IMPLS.map((impl) => ({ impl, results: cases.map((c) => check(impl, c)) }));
  const correctRow = rows.find((r) => !r.impl.buggy)!;
  const wrongCases = cases.map((_, i) => correctRow.results[i].outcome === 'fail');
  const caught = rows.filter((r) => r.impl.buggy && r.results.some((x, i) => !wrongCases[i] && x.outcome === 'fail')).map((r) => r.impl.id);
  return { rows, wrongCases, caught, total: IMPLS.filter((i) => i.buggy).length };
}

export function toVitest(cases: Case[]): string {
  const lines = ["import { describe, expect, it } from 'vitest';", "import { adoptionFee } from './fee';", '', "describe('adoptionFee', () => {"];
  for (const c of cases) {
    lines.push(c.expect === 'throws'
      ? `  it('${c.species}, age ${c.age}: rejected', () => expect(() => adoptionFee('${c.species}', ${c.age})).toThrow());`
      : `  it('${c.species}, age ${c.age}: ${c.expect}', () => expect(adoptionFee('${c.species}', ${c.age})).toBe(${c.expect}));`);
  }
  lines.push('});');
  return lines.join('\n');
}

/* ───── Outcome for the result panel (see src/sim/ui/kit.ts) ───── */

export type UnitCause = 'no-examples' | 'wrong-example' | 'bugs-missed' | 'all-caught';
export interface Witness { species: Species; age: number; correct: number | 'throws'; buggy: number | 'throws' }
export interface UnitValues {
  caught: number;
  total: number;
  examples: number;
  /** wrong-example: 1-based number of the example, its input, expected and the correct result */
  wrong?: { index: number; species: Species; age: number; expected: number | 'throws'; correct: number | 'throws' };
  /** bugs-missed: number of the first missed implementation (as shown: "Implementation 2") and an input that exposes it */
  missed?: { id: string; no: number; witness: Witness };
  /** species and ages the examples use */
  species: Species[];
  ages: number[];
  /** the test run the agent would see (Vitest format) */
  report: string;
}
export type UnitOutcome = SimOutcome<UnitCause, UnitValues>;

const run = (impl: Impl, species: Species, age: number): number | 'throws' => { try { return impl.fn(species, age); } catch { return 'throws'; } };

/** Inputs tried, in this order, to find one that tells a buggy implementation from the correct one. */
const PROBES: [Species, number][] = [3, 10, 8, 1, 0, -1, 1.5, 7, 9, 2].flatMap((a) => [['dog', a], ['cat', a]] as [Species, number][]);

/** The first probe input on which `impl` differs from the correct implementation. */
export function witness(impl: Impl): Witness | null {
  const correct = IMPLS.find((i) => !i.buggy)!;
  for (const [species, age] of PROBES) {
    const c = run(correct, species, age), b = run(impl, species, age);
    if (c !== b) return { species, age, correct: c, buggy: b };
  }
  return null;
}

const testName = (c: Case) => (c.expect === 'throws' ? `${c.species}, age ${c.age}: rejected` : `${c.species}, age ${c.age}: ${c.expect}`);
function reportFor(impl: Impl, cases: Case[]): string {
  const tests: ReportTest[] = cases.map((c) => {
    const got = run(impl, c.species, c.age);
    const ok = c.expect === 'throws' ? got === 'throws' : got === c.expect;
    const msg = ok ? undefined : c.expect === 'throws'
      ? 'AssertionError: expected [Function] to throw an error'
      : got === 'throws' ? 'Error: invalid age' : `AssertionError: expected ${got} to be ${c.expect} // Object.is equality`;
    return { name: testName(c), ok, msg };
  });
  return vitestReport('fee.test.ts', tests, 'adoptionFee');
}

/** Verdict, cause and numbers for a set of examples. Pure. */
export function unitOutcome(cases: Case[]): UnitOutcome {
  const r = evaluate(cases);
  const base = { caught: r.caught.length, total: r.total, examples: cases.length, species: [...new Set(cases.map((c) => c.species))], ages: [...new Set(cases.map((c) => c.age))].sort((a, b) => a - b) };
  const correct = IMPLS.find((i) => !i.buggy)!;
  if (!cases.length) return { status: 'fail', causeId: 'no-examples', values: { ...base, report: vitestReport('fee.test.ts', []) } };
  const w = r.wrongCases.indexOf(true);
  if (w >= 0) {
    const c = cases[w];
    return { status: 'fail', causeId: 'wrong-example', values: { ...base, wrong: { index: w + 1, species: c.species, age: c.age, expected: c.expect, correct: run(correct, c.species, c.age) }, report: reportFor(correct, cases) } };
  }
  const missedImpl = IMPLS.find((i) => i.buggy && !r.caught.includes(i.id));
  if (missedImpl) {
    const wit = witness(missedImpl)!;
    return { status: 'fail', causeId: 'bugs-missed', values: { ...base, missed: { id: missedImpl.id, no: IMPLS.indexOf(missedImpl), witness: wit }, report: reportFor(missedImpl, cases) } };
  }
  // all caught: show what the agent sees when it writes the first bug
  const first = IMPLS.find((i) => i.buggy)!;
  return { status: 'pass', causeId: 'all-caught', values: { ...base, report: reportFor(first, cases) } };
}
