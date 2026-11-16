import { describe, expect, it } from 'vitest';
import { INPUT_IDS, run, split, ALLOCATE_SRC, CLAUSE_LINE, type InputId, type Clause } from '../../src/sim/engine/dbc';

const bad: Record<Exclude<InputId, 'normal'>, { clause: Clause; anomaly: string }> = {
  negDiscount: { clause: 'amountNonNeg', anomaly: 'surcharge' },
  tooBig: { clause: 'amountLeTotal', anomaly: 'negativeTotal' },
  empty: { clause: 'weightsNonEmpty', anomaly: 'nan' },
  negWeight: { clause: 'weightsNonNeg', anomaly: 'negativeLine' },
};

describe('dbc pipeline', () => {
  it('normal input passes with and without contracts', () => {
    for (const c of [true, false]) {
      const r = run('normal', c);
      expect(r.failingStep).toBeNull();
      expect(r.steps).toEqual(['ok', 'ok', 'ok']);
      expect(r.invoice!.total).toBe(5400);
    }
  });
  for (const id of Object.keys(bad) as (keyof typeof bad)[]) {
    it(`${id}: contracts on fails at allocate with the right clause`, () => {
      const r = run(id, true);
      expect(r.failingStep).toBe(1);
      expect(r.steps).toEqual(['ok', 'bad', 'skipped']);
      expect(r.cause).toBe(bad[id].clause);
      expect(ALLOCATE_SRC.split('\n')[CLAUSE_LINE[bad[id].clause]]).toContain('assert');
    });
    it(`${id}: contracts off surfaces at the invoice`, () => {
      const r = run(id, false);
      expect(r.failingStep).toBe(2);
      expect(r.steps).toEqual(['ok', 'tainted', 'bad']);
      expect(r.anomaly).toBe(bad[id].anomaly);
      expect(r.cause).toBe(bad[id].clause);
    });
  }
  it('covers all inputs and split keeps the sum', () => {
    expect(INPUT_IDS).toHaveLength(5);
    expect(split(100, [1, 1, 1]).reduce((a, b) => a + b, 0)).toBe(100);
  });
});
