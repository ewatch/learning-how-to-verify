/**
 * "Catch the bugs": one correct implementation of the adoption fee and several
 * plausible buggy ones. A good set of examples passes on the correct one and
 * fails on every buggy one.
 */
export type Species = 'dog' | 'cat';
export interface Case { species: Species; age: number; expect: number | 'throws' }
export interface Impl { id: string; buggy: boolean; code: string; fn: (species: Species, age: number) => number }

const make = (id: string, buggy: boolean, code: string): Impl => ({
  id, buggy, code,
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  fn: new Function(`"use strict"; ${code}; return adoptionFee;`)() as Impl['fn'],
});

export const SPEC = {
  en: ['A dog costs 120.00 €, a cat 80.00 € (amounts in cents).', 'Seniors (8 years or older) pay half.', 'Pets younger than 1 year add 20.00 € for vaccinations.', 'An age that is negative or not a whole number is rejected with an error.'],
  de: ['Ein Hund kostet 120,00 €, eine Katze 80,00 € (Beträge in Cent).', 'Senioren (ab 8 Jahren) zahlen die Hälfte.', 'Tiere unter 1 Jahr kosten 20,00 € mehr für Impfungen.', 'Ein negatives oder nicht ganzzahliges Alter wird mit einem Fehler abgelehnt.'],
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
