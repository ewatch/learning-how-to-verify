import { describe, expect, it } from 'vitest';
import { MODES, SPECS } from '../../src/viz/process/specs';
import { ALLOWED, archBuildFails, attention, attentionSplit, evalScores, followedShare, nielsen, violations, type Edge } from '../../src/viz/process/logic';

describe('process specs', () => {
  it('covers all nine modes with en+de caption and takeaway', () => {
    expect(MODES.sort()).toEqual(['agent-rules', 'architecture', 'code-review', 'evals', 'oncall-experience', 'penetration-tests', 'refactoring', 'threat-modeling', 'usability-tests']);
    for (const m of MODES) for (const l of ['en', 'de'] as const) {
      expect(SPECS[m]!.caption[l].length).toBeGreaterThan(10);
      expect(SPECS[m]!.takeaway[l].length).toBeGreaterThan(5);
    }
  });
});
describe('nielsen', () => {
  it('5 users find about 85%', () => { const v = nielsen(5, 0.31); expect(v).toBeGreaterThan(0.84); expect(v).toBeLessThan(0.85); });
  it('is monotone and at most 1', () => {
    for (let n = 1; n <= 15; n++) { expect(nielsen(n + 1)).toBeGreaterThan(nielsen(n)); expect(nielsen(n)).toBeLessThanOrEqual(1); }
  });
});
describe('architecture', () => {
  it('detects the forbidden edge', () => {
    const bad: Edge = ['domain', 'ui'];
    expect(violations([...ALLOWED, bad])).toEqual([bad]);
    expect(violations(ALLOWED)).toEqual([]);
    expect(archBuildFails([bad], true)).toBe(true);
    expect(archBuildFails([bad], false)).toBe(false);
  });
});
describe('evals', () => {
  it('test-only score is at least the combined score', () => {
    for (const v of ['before', 'after'] as const) {
      const a = evalScores(v, 'tests'), b = evalScores(v, 'combined');
      expect(a.mean).toBeGreaterThanOrEqual(b.mean);
      a.runs.forEach((r, i) => expect(r).toBeGreaterThanOrEqual(b.runs[i]!));
    }
    expect(evalScores('after', 'tests').mean).toBeGreaterThan(evalScores('before', 'tests').mean);
  });
});
describe('code review', () => {
  it('attention decreases with size; splitting keeps it up', () => {
    for (let l = 50; l < 2000; l += 50) expect(attention(l + 50)).toBeLessThan(attention(l));
    expect(attentionSplit(2000)).toBeGreaterThan(attention(2000));
  });
});
describe('agent rules', () => {
  it('lint enforcement beats prose', () => { expect(followedShare('static')).toBe(1); expect(followedShare('prose')).toBeLessThan(1); });
});
