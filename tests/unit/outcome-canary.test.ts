import { describe, expect, it } from 'vitest';
import { simulate, canaryOutcome, canaryReport, type StageResult, type Bug } from '../../src/sim/engine/canary';

const run = (bug: Bug, businessMetric: boolean, seed = 7) => { const stages = simulate({ bug, businessMetric, seed }); return { stages, o: canaryOutcome({ bug, businessMetric }, stages) }; };
const stage = (weight: number, v1: [number, number, number], v2: [number, number, number], decision: StageResult['decision'] = 'promote', reason: StageResult['reason'] = null): StageResult => ({
  weight, decision, reason, v1: { req: v1[0], err: v1[1], wrong: v1[2] }, v2: { req: v2[0], err: v2[1], wrong: v2[2] },
});

describe('canary outcome', () => {
  it('a crash bug is rolled back; the numbers are those of the deciding stage', () => {
    for (const seed of [1, 2, 3, 7]) {
      const { stages, o } = run('errors', false, seed);
      expect(o).toMatchObject({ status: 'fail', causeId: 'rollback-errors', values: { metric: 'errors' } });
      const last = stages.at(-1)!;
      expect(o.values.weight).toBe(last.weight);
      expect(o.values.v2Req).toBe(last.v2.req);
      expect(o.values.v2Hits).toBe(last.v2.err);
      expect(o.values.v2Rate).toBeCloseTo((100 * last.v2.err) / last.v2.req);
      expect(o.values.limit).toBeCloseTo((100 * last.v1.err) / last.v1.req + 1);
      expect(o.values.v2Rate!).toBeGreaterThan(o.values.limit!);
    }
  });
  it('the silent bug ships without the business metric and is rolled back with it', () => {
    const off = run('silent', false);
    expect(off.o).toMatchObject({ status: 'warn', causeId: 'silent-missed', values: { weight: 100 } });
    expect(off.o.values.wrong).toBeGreaterThan(0);
    expect(off.o.values.wrong).toBe(off.stages.reduce((a, s) => a + s.v2.wrong, 0));
    const on = run('silent', true);
    expect(on.o).toMatchObject({ status: 'fail', causeId: 'rollback-business', values: { metric: 'business', weight: 5 } });
    expect(on.o.values.v2Hits).toBe(on.stages[0].v2.wrong);
  });
  it('no bug is promoted; a rollback without a matching bug is a false alarm', () => {
    expect(canaryOutcome({ bug: 'none', businessMetric: false }, [stage(5, [1900, 8, 0], [100, 0, 0]), stage(100, [0, 0, 0], [2000, 8, 0])])).toMatchObject({ status: 'pass', causeId: 'promoted' });
    const noise = [stage(5, [1900, 7, 0], [100, 2, 0], 'rollback', 'errors')];
    expect(canaryOutcome({ bug: 'none', businessMetric: false }, noise)).toMatchObject({ status: 'warn', causeId: 'false-alarm', values: { v2Hits: 2, v2Req: 100 } });
    expect(canaryOutcome({ bug: 'silent', businessMetric: true }, noise)).toMatchObject({ causeId: 'false-alarm' });
    expect(canaryOutcome({ bug: 'errors', businessMetric: false }, [stage(100, [0, 0, 0], [2000, 170, 0])])).toMatchObject({ status: 'warn', causeId: 'missed' });
  });
  it('the analysis log names each step, the metric, the limit and the result', () => {
    const { stages } = run('silent', true);
    const out = canaryReport({ bug: 'silent', businessMetric: true }, stages);
    expect(out).toContain('step 1  weight 5%');
    expect(out).toMatch(/wrong-price .* FAILED/);
    expect(out).toContain('result: ABORTED at 5%');
    const ok = canaryReport({ bug: 'none', businessMetric: false }, run('none', false).stages);
    expect(ok).not.toContain('wrong-price');
  });
});
