import { describe, expect, it } from 'vitest';
import { VARIANTS, arrays, runObligation, verify, linesFor, type ObligationKey } from '../../src/sim/engine/invariant';

const failing = (id: string) => verify(VARIANTS.find((v) => v.id === id)!).filter((r) => r.failure).map((r) => r.key).sort();

describe('loop invariant obligations', () => {
  it('has a state space of arrays of length 1..4', () => {
    expect(arrays()).toHaveLength(5 + 25 + 125 + 625);
  });
  it('correct version and ">= instead of >" pass all four obligations', () => {
    expect(failing('correct')).toEqual([]);
    expect(failing('geq')).toEqual([]);
  });
  it('every variant fails exactly the obligations its description names', () => {
    for (const v of VARIANTS) expect(failing(v.id), v.id).toEqual([...v.expectFail].sort());
  });
  it('documents the specific failures', () => {
    expect(failing('offbyone')).toEqual(['exit']);
    expect(failing('init')).toEqual(['init']);
    expect(failing('compare')).toEqual(['keep']);
    expect(failing('noincr')).toEqual(['keep', 'term']);
    expect(failing('weak')).toEqual(['exit']);
  });
  it('failures carry a counterexample and a valid line', () => {
    for (const v of VARIANTS) for (const r of verify(v)) if (r.failure) {
      expect(r.failure.a.length).toBeGreaterThan(0);
      expect(r.failure.line).toBeGreaterThanOrEqual(0);
      expect(r.failure.line).toBeLessThan(v.lines.length);
    }
  });
  it('the forgotten increment fails termination because decreases does not shrink', () => {
    const r = runObligation(VARIANTS.find((v) => v.id === 'noincr')!, 'term' as ObligationKey);
    expect(r.failure?.code).toBe('term-nodec');
  });
  it('highlight lines stay inside the listing and descriptions are bilingual', () => {
    for (const v of VARIANTS) {
      expect(v.desc.en && v.desc.de && v.name.en && v.name.de).toBeTruthy();
      for (const k of ['init', 'keep', 'exit', 'term'] as const) for (const l of linesFor(v, k)) expect(l).toBeLessThan(v.lines.length);
    }
  });
});
