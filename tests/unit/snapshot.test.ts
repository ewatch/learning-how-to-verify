import { describe, expect, it } from 'vitest';
import { CHANGES, SNAPSHOT, diffLines, diffFor, diffAfterAutoUpdate, changed, score, renderInvoice, ADOPTION } from '../../src/sim/engine/snapshot';

const ch = (id: string) => CHANGES.find((c) => c.id === id)!;

describe('diffLines', () => {
  it('marks same, added and removed lines', () => {
    expect(diffLines('a\nb\nc', 'a\nx\nc\nd')).toEqual([
      { op: 'same', text: 'a' }, { op: 'del', text: 'b' }, { op: 'add', text: 'x' }, { op: 'same', text: 'c' }, { op: 'add', text: 'd' },
    ]);
  });
  it('identical input has no changes', () => expect(changed(diffLines('a\nb', 'a\nb'))).toBe(false));
});

describe('snapshot changes', () => {
  it('snapshot has the voucher and a 108.85 total', () => {
    expect(SNAPSHOT).toContain('Voucher');
    expect(SNAPSHOT).toContain('108.85 €');
  });
  it('footer adds lines only', () => expect(diffFor(ch('footer')).every((l) => l.op !== 'del')).toBe(true));
  it('rounding bug changes the total by exactly one cent', () => {
    const d = diffFor(ch('rounding'));
    expect(d.filter((l) => l.op === 'del').map((l) => l.text.trim())).toEqual(['Voucher:  -12.10 €', 'Total:    108.85 €']);
    expect(d.filter((l) => l.op === 'add').map((l) => l.text.trim())).toEqual(['Voucher:  -12.09 €', 'Total:    108.86 €']);
  });
  it('voucher bug removes one line and keeps the total', () => {
    const d = diffFor(ch('voucher'));
    expect(d.filter((l) => l.op === 'del')).toHaveLength(1);
    expect(d.filter((l) => l.op === 'add')).toHaveLength(0);
    expect(renderInvoice(ADOPTION, { dateFmt: 'iso', footer: false, voucherRound: 'round', showVoucher: false, feeLabel: 'Fe' })).toContain('108.85');
  });
  it('every change produces a diff, and auto-update hides all of them', () => {
    for (const c of CHANGES) { expect(changed(diffFor(c))).toBe(true); expect(changed(diffAfterAutoUpdate(c))).toBe(false); }
  });
});

describe('score', () => {
  it('right decisions score all', () => {
    const d = Object.fromEntries(CHANGES.map((c) => [c.id, c.intended ? 'approve' : 'reject'] as const));
    expect(score(d).correct).toBe(5);
  });
  it('approving everything (the auto-update trap) gets the bugs wrong', () => {
    const d = Object.fromEntries(CHANGES.map((c) => [c.id, 'approve' as const]));
    const s = score(d);
    expect(s.correct).toBe(3);
    expect(s.results.filter((r) => !r.correct).map((r) => r.id)).toEqual(['rounding', 'voucher']);
  });
  it('undecided changes count as not decided', () => {
    const s = score({ footer: 'approve' });
    expect(s.decided).toBe(1);
    expect(s.correct).toBe(1);
  });
});
