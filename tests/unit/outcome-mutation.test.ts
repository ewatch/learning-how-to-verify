import { describe, expect, it } from 'vitest';
import { generateMutants, runMutant, mutationOutcome, strykerReport, strykerMutator, type MutationRun } from '../../src/sim/engine/mutate';
import { EXAMPLES } from '../../src/sim/ui/mutation';

const fakeRepo = () => ({ saved: [] as unknown[], save(x: unknown) { this.saved.push(x); } });
const fakeMailer = () => ({ sent: [] as unknown[], send(to: string, text: string) { this.sent.push({ to, text }); } });
const EXTRA = { fakeRepo, fakeMailer };
const runAll = (code: string, tests: string): MutationRun => ({ results: generateMutants(code).map((m) => runMutant(m, tests, 'en', EXTRA)), marked: new Set(), knownEquivalent: new Set(), coverage: 100, tests: 2 });

describe('mutation outcome', () => {
  const fee = EXAMPLES[0];
  it('weak fee tests: survivors, and the first survivor is the boundary mutant on line 2', () => {
    const run = runAll(fee.code, fee.tests);
    const o = mutationOutcome(run);
    expect(o.status).toBe('fail');
    expect(o.causeId).toBe('survivors');
    expect(o.values.first).toMatchObject({ line: 2, kind: 'rel-boundary', desc: '>= → >' });
    expect(o.values.survived).toBe(run.results.filter((r) => r.status === 'survived').length);
    expect(o.values.score).toBeLessThan(100);
  });
  it('the Stryker report shows the file, line, column and the changed line', () => {
    const out = strykerReport(fee.code, runAll(fee.code, fee.tests), 'src/fee.js');
    expect(out).toContain('[Survived] EqualityOperator');
    expect(out).toContain('src/fee.js:2:16');
    expect(out).toContain('-   if (ageYears >= 8) {');
    expect(out).toContain('+   if (ageYears > 8) {');
    expect(out).toMatch(/Mutation score: \d+\.\d\d %/);
  });
  it('better tests kill every mutant', () => {
    const o = mutationOutcome(runAll(fee.code, fee.better!));
    expect(o).toMatchObject({ status: 'pass', causeId: 'all-killed', values: { survived: 0, score: 100 } });
  });
  it('survivors that are all known equivalent give a warning; marking them gives a pass', () => {
    const ex = EXAMPLES[2];
    const run = runAll(ex.code, ex.tests);
    const surv = run.results.filter((r) => r.status === 'survived').map((r) => r.mutant.id);
    expect(surv.length).toBe(2);
    expect(mutationOutcome({ ...run, knownEquivalent: new Set(surv) })).toMatchObject({ status: 'warn', causeId: 'equivalent-left' });
    expect(mutationOutcome({ ...run, marked: new Set(surv) })).toMatchObject({ status: 'pass', causeId: 'all-killed', values: { equivalent: 2 } });
  });
  it('a failing suite or no tests stops the run', () => {
    const base: MutationRun = { results: [], marked: new Set(), knownEquivalent: new Set(), coverage: 0, tests: 0 };
    expect(mutationOutcome({ ...base, error: { kind: 'no-tests' } })).toMatchObject({ status: 'fail', causeId: 'no-tests' });
    expect(mutationOutcome({ ...base, error: { kind: 'tests-fail', name: 't', msg: 'm' } })).toMatchObject({ status: 'fail', causeId: 'tests-fail', values: { failing: { name: 't', msg: 'm' } } });
  });
  it('names only real StrykerJS mutators; other kinds get a neutral label', () => {
    expect(strykerMutator({ kind: 'rel-boundary', desc: '>= → >' })).toBe('EqualityOperator');
    expect(strykerMutator({ kind: 'arith', desc: '+ → -' })).toBe('ArithmeticOperator');
    expect(strykerMutator({ kind: 'arith', desc: '+= → -=' })).toBe('AssignmentOperator');
    expect(strykerMutator({ kind: 'if-false', desc: 'if (x) → if (false)' })).toBe('ConditionalExpression');
    expect(strykerMutator({ kind: 'num', desc: '8 → 9' })).toBe('(numeric change, not a StrykerJS mutator)');
    expect(strykerMutator({ kind: 'ret', desc: 'return x → return null' })).toContain('not a StrykerJS mutator');
    expect(strykerMutator({ kind: 'del', desc: 'x() → (removed)' })).toContain('not a StrykerJS mutator');
    const run = runAll(fee.code, fee.tests);
    expect(strykerReport(fee.code, run, 'src/fee.js', 99)).not.toMatch(/NumericLiteral|ReturnValue/);
  });
});
