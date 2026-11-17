import { describe, expect, it } from 'vitest';
import { lint, lintOutcome, ciOutcome, eslintReport, SNIPPET, SNIPPET_FIXED, PATCH_AFTER, RULE_IDS } from '../../src/sim/engine/lint';

describe('lint outcome', () => {
  it('the start snippet fails with four findings; the first one is the any on line 1', () => {
    const o = lintOutcome(SNIPPET);
    expect(o).toMatchObject({ status: 'fail', causeId: 'findings', values: { count: 4, rulesOn: 4, rulesTotal: 4, first: { rule: 'no-explicit-any', line: 1 } } });
  });
  it('rules switched off: no findings is a warning, and the count of the full rule set is kept', () => {
    const o = lintOutcome(SNIPPET, []);
    expect(o).toMatchObject({ status: 'warn', causeId: 'rules-off', values: { count: 4, rulesOn: 0 } });
    expect(o.values.rulesOff).toEqual(RULE_IDS);
  });
  it('deleting the code is not a fix', () => {
    expect(lintOutcome('')).toMatchObject({ status: 'warn', causeId: 'code-removed' });
  });
  it('the fixed snippet passes', () => {
    expect(lintOutcome(SNIPPET_FIXED)).toMatchObject({ status: 'pass', causeId: 'solved', values: { count: 0 } });
  });
  it('the ESLint report lists rule, position and a summary', () => {
    const out = eslintReport(lint(SNIPPET));
    expect(out).toContain('@typescript-eslint/no-explicit-any');
    expect(out).toContain("Expected '===' and instead saw '=='");
    expect(out).toMatch(/\n {2}8:3 +error/);
    expect(out).toContain('✖ 4 problems (4 errors, 0 warnings)');
    expect(eslintReport([])).toContain('exit code 0');
  });
  it('CI mode: the gate finds the missing await of the agent patch', () => {
    const o = ciOutcome();
    expect(o.status).toBe('pass');
    expect(o.values.finding).toMatchObject({ rule: 'no-floating-promise', token: 'repo.save', line: 4 });
    expect(PATCH_AFTER.split('\n')[3]).toContain('repo.save(pet);');
  });
});
