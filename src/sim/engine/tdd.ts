/** TDD exercise: approved, locked tests for reserve(); the learner writes the implementation. */
import { loadSuite, type Lang, type TestResult } from './jsrun';
import { vitestReport, vitestMessage, type Outcome } from './outcome';

export const STUB = `function reserve(pets, petId, person) {
  // TODO: make the approved tests pass
}`;

/** A deliberately clumsy but correct first implementation (the "green" step). */
export const SOLUTION = `function reserve(pets, petId, person) {
  let pet = null;
  for (const p of pets) {
    if (p.id === petId) pet = p;
  }
  if (pet !== null) {
    if (pet.reservedBy === null) {
      pet.reservedBy = person.trim();
      return { ok: true };
    } else {
      return { ok: false, reason: 'taken' };
    }
  } else {
    return { ok: false, reason: 'not-found' };
  }
}`;

/** Same behaviour, cleaner: the "refactor" step. */
export const REFACTORED = `function reserve(pets, petId, person) {
  const pet = pets.find((p) => p.id === petId);
  if (!pet) return { ok: false, reason: 'not-found' };
  if (pet.reservedBy !== null) return { ok: false, reason: 'taken' };
  pet.reservedBy = person.trim();
  return { ok: true };
}`;

/** The approved tests. Read-only for the learner. */
export const TESTS = `const shop = () => [{ id: 'rex', reservedBy: null }, { id: 'mia', reservedBy: null }];

test('reserves an available pet', () => {
  const pets = shop();
  expect(reserve(pets, 'rex', 'Anna')).toEqual({ ok: true });
  expect(pets[0].reservedBy).toBe('Anna');
});

test('unknown pet: not-found', () => {
  expect(reserve(shop(), 'ghost', 'Anna')).toEqual({ ok: false, reason: 'not-found' });
});

test('never twice: a reserved pet is taken', () => {
  const pets = shop();
  reserve(pets, 'rex', 'Anna');
  expect(reserve(pets, 'rex', 'Ben')).toEqual({ ok: false, reason: 'taken' });
  expect(pets[0].reservedBy).toBe('Anna');
});

test('trims the name', () => {
  const pets = shop();
  reserve(pets, 'mia', '  Anna ');
  expect(pets[1].reservedBy).toBe('Anna');
});`;

export const TITLES: Record<Lang, string[]> = {
  en: ['reserves an available pet', 'unknown pet: not-found', 'never twice: a reserved pet is taken', 'trims the name'],
  de: ['reserviert ein freies Tier', 'unbekanntes Tier: not-found', 'nie doppelt: ein reserviertes Tier ist taken', 'kürzt Leerraum im Namen'],
};

export function runTdd(code: string, lang: Lang): TestResult[] {
  try {
    const suite = loadSuite(code, TESTS, lang);
    return suite.map((t) => t.run());
  } catch (e) {
    const msg = `${(e as Error).name}: ${(e as Error).message}`;
    return TITLES.en.map((name) => ({ name, ok: false, msg }));
  }
}

export const allGreen = (r: TestResult[]) => r.length > 0 && r.every((x) => x.ok);

export interface TddState { phase: 'red' | 'green' | 'done'; greenCode?: string }

/** Pure step logic: red until all tests pass; then green; then done once a still-green, changed version is run. */
export function advance(s: TddState, code: string, results: TestResult[]): TddState {
  if (!allGreen(results)) return s;
  if (s.phase === 'red') return { phase: 'green', greenCode: code };
  if (s.phase === 'green' && code.trim() !== (s.greenCode ?? '').trim()) return { phase: 'done', greenCode: s.greenCode };
  return s;
}

/* ───── Outcome for the result panel (see src/sim/ui/kit.ts) ───── */

export type TddCause =
  | 'not-implemented' // red at the start: every test fails because reserve returns nothing
  | 'red' // red: some tests still fail
  | 'broken' // was green, a change made tests fail again (refactor broke behaviour)
  | 'green' // first green: all tests pass, next step is refactor
  | 'green-same' // green, but the code did not change since the first green run
  | 'done'; // green after a real change: red, green, refactor completed
export interface TddValues { passed: number; failed: number; total: number; first?: { index: number; name: string; msg: string } }
export type TddOutcome = Outcome<TddCause, TddValues>;

/** Verdict and cause after one run: `before` is the state before the run, `after` the state after `advance`. Pure. */
export function tddOutcome(before: TddState, after: TddState, results: TestResult[]): TddOutcome {
  const failedIdx = results.findIndex((r) => !r.ok);
  const values: TddValues = { passed: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length, total: results.length };
  if (failedIdx >= 0) {
    values.first = { index: failedIdx, name: TITLES.en[failedIdx] ?? results[failedIdx].name, msg: results[failedIdx].msg ?? '' };
    if (before.phase !== 'red') return { status: 'fail', causeId: 'broken', values };
    // nothing passes and nothing crashed: the behaviour is simply not there yet (the stub)
    const nothing = values.passed === 0 && !results.some((r) => /^\w*Error: /.test(r.msg ?? ''));
    return { status: 'fail', causeId: nothing ? 'not-implemented' : 'red', values };
  }
  if (after.phase === 'done') return { status: 'pass', causeId: 'done', values };
  if (before.phase === 'green') return { status: 'pass', causeId: 'green-same', values };
  return { status: 'pass', causeId: 'green', values };
}

/** The run as Vitest prints it. Pass results from `runTdd(code, 'en')`. */
export function tddReport(results: TestResult[]): string {
  return vitestReport('reserve.test.js', results.map((r, i) => ({ name: TITLES.en[i] ?? r.name, ok: r.ok, msg: r.ok ? undefined : vitestMessage(r.msg, true) })));
}
