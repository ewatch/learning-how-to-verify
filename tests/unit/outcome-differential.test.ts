import { describe, expect, it } from 'vitest';
import { NEW, OLD, differentialOutcome, differentialReport } from '../../src/sim/engine/differential';

const fn = (id: string) => NEW.find((n) => n.id === id)!.fn;

describe('differential outcome', () => {
  it('refactor 1 rounds to nearest: the minimal price differs, and the numbers match both versions', () => {
    const o = differentialOutcome('round', 8, 2000, true);
    expect(o).toMatchObject({ status: 'fail', causeId: 'rounding' });
    const m = o.values.minimal!;
    expect(OLD.fn(m.cents, m.voucher)).toBe(m.old);
    expect(fn('round')(m.cents, m.voucher)).toBe(m.neu);
    expect(m.old).not.toBe(m.neu);
  });
  it('refactor 2 computes in floats: the raw float value explains the Math.ceil result', () => {
    const o = differentialOutcome('ceil', 8, 2000, true);
    expect(o.causeId).toBe('float');
    const v = o.values;
    expect(Number(v.raw)).not.toBe(Number(v.exact));
    expect(Math.ceil(Number(v.raw))).toBe(v.minimal!.neu);
    expect(String((v.minimal!.cents / 100) * v.factor!)).toBe(v.raw);
  });
  it('refactor 3 is equivalent with the intended change accepted, and only differs on lower-case codes without it', () => {
    expect(differentialOutcome('integer', 8, 2000, true)).toMatchObject({ status: 'pass', causeId: 'equivalent', values: { agree: 2000, diffs: 0 } });
    const o = differentialOutcome('integer', 8, 2000, false);
    expect(o).toMatchObject({ status: 'warn', causeId: 'intended-only' });
    expect(o.values.intended).toBe(o.values.diffs);
    expect(o.values.minimal!.voucher).toBe('tier10');
  });
  it('the report shows the counterexample and both results', () => {
    const o = differentialOutcome('ceil', 8, 2000, true);
    const m = o.values.minimal!;
    const out = differentialReport(o);
    expect(out).toContain(`Counterexample: [${m.cents},"${m.voucher}"]`);
    expect(out).toContain(`expected ${m.neu} to be ${m.old}`);
    expect(differentialReport(differentialOutcome('integer', 8, 2000, true))).toContain('1 passed');
  });
});
