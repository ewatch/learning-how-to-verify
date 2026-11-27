import { describe, expect, it } from 'vitest';
import { CHANGES, changedLines, snapshotOutcome, vitestSnapshotReport, vitestUpdatedReport, type Verdict } from '../../src/sim/engine/snapshot';

const ch = (id: string) => CHANGES.find((c) => c.id === id)!;
const right = (): Record<string, Verdict> => Object.fromEntries(CHANGES.map((c) => [c.id, c.intended ? 'approve' : 'reject']));

describe('changedLines', () => {
  it('splits a diff into removed and added lines', () => {
    expect(changedLines(ch('rounding'))).toEqual({
      removed: ['Voucher:  -12.10 €', 'Total:    108.85 €'],
      added: ['Voucher:  -12.09 €', 'Total:    108.86 €'],
    });
  });
  it('a pure addition removes nothing', () => {
    expect(changedLines(ch('footer'))).toEqual({ removed: [], added: ['', 'Thank you for adopting!'] });
  });
  it('a pure removal adds nothing', () => {
    expect(changedLines(ch('voucher'))).toEqual({ removed: ['Voucher:  -12.10 €'], added: [] });
  });
});

describe('snapshot outcome', () => {
  it('is null while a decision is open', () => {
    const d: Record<string, Verdict | undefined> = right();
    d.typo = undefined;
    expect(snapshotOutcome(d, false)).toBeNull();
    expect(snapshotOutcome({}, false)).toBeNull();
  });

  it('all-correct: every bug rejected, every wanted change approved; explains the first bug', () => {
    expect(snapshotOutcome(right(), false)).toEqual({
      status: 'pass',
      causeId: 'all-correct',
      values: {
        correct: 5, total: 5, approvedBugs: [], rejectedWanted: [], shipped: [],
        focus: { id: 'rounding', index: 2, ...changedLines(ch('rounding')) },
      },
    });
  });

  it('approved-bug: the approved bug ships and is the focus, even when a wanted change was also rejected', () => {
    const o = snapshotOutcome({ ...right(), voucher: 'approve', date: 'reject' }, false);
    expect(o).toEqual({
      status: 'fail',
      causeId: 'approved-bug',
      values: {
        correct: 3, total: 5, approvedBugs: ['voucher'], rejectedWanted: ['date'], shipped: ['voucher'],
        focus: { id: 'voucher', index: 3, ...changedLines(ch('voucher')) },
      },
    });
  });

  it('approved-bug lists every approved bug, focusing on the first', () => {
    const o = snapshotOutcome({ ...right(), rounding: 'approve', voucher: 'approve' }, false)!;
    expect(o.values.approvedBugs).toEqual(['rounding', 'voucher']);
    expect(o.values.shipped).toEqual(['rounding', 'voucher']);
    expect(o.values.focus?.id).toBe('rounding');
    expect(o.values.correct).toBe(3);
  });

  it('rejected-wanted: no bug ships, the first rejected wanted change is the focus', () => {
    expect(snapshotOutcome({ ...right(), date: 'reject', typo: 'reject' }, false)).toEqual({
      status: 'fail',
      causeId: 'rejected-wanted',
      values: {
        correct: 3, total: 5, approvedBugs: [], rejectedWanted: ['date', 'typo'], shipped: [],
        focus: { id: 'date', index: 1, ...changedLines(ch('date')) },
      },
    });
  });

  it('auto-updated: decided at once, whatever the decisions; every bug ships', () => {
    const expected = {
      status: 'warn',
      causeId: 'auto-updated',
      values: {
        correct: 0, total: 5, approvedBugs: [], rejectedWanted: [], shipped: ['rounding', 'voucher'],
        focus: { id: 'rounding', index: 2, ...changedLines(ch('rounding')) },
      },
    };
    expect(snapshotOutcome({}, true)).toEqual(expected);
    expect(snapshotOutcome(right(), true)).toEqual(expected);
  });

  it('without bugs there is no focus', () => {
    const wanted = CHANGES.filter((c) => c.intended);
    expect(snapshotOutcome({}, true, wanted)?.values).toMatchObject({ shipped: [], total: 3, focus: undefined });
    const all = Object.fromEntries(wanted.map((c) => [c.id, 'approve' as const]));
    expect(snapshotOutcome(all, false, wanted)).toMatchObject({ status: 'pass', causeId: 'all-correct', values: { correct: 3, total: 3, focus: undefined } });
  });
});

describe('Vitest reports', () => {
  it('a mismatch shows the failing test, the legend and the quoted diff', () => {
    expect(vitestSnapshotReport(ch('voucher'))).toBe([
      ' FAIL  invoice.test.ts > renderInvoice > matches the recorded invoice',
      'Error: Snapshot `renderInvoice > matches the recorded invoice 1` mismatched',
      '',
      '- Expected',
      '+ Received',
      '',
      '  "PETSTORE INVOICE',
      '  Pet:      Bella (dog)',
      '  Date:     2026-03-07',
      '  Fe:       120.95 €',
      '- Voucher:  -12.10 €',
      '  Total:    108.85 €"',
    ].join('\n'));
  });
  it('added lines get a plus sign', () => {
    const r = vitestSnapshotReport(ch('footer')).split('\n');
    expect(r.at(-1)).toBe('+ Thank you for adopting!"');
    expect(r.at(-2)).toBe('+ ');
  });
  it('after vitest -u every test passes and n snapshots are updated', () => {
    expect(vitestUpdatedReport(3)).toBe([
      '$ vitest run -u',
      ' ✓ invoice.test.ts (3 tests)',
      '',
      ' Snapshots  3 updated',
      ' Test Files  1 passed (1)',
      '      Tests  3 passed (3)',
    ].join('\n'));
  });
});
