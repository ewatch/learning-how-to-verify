import { describe, expect, it } from 'vitest';
import { GATES, PATCHES, evaluate, judge, runSuite, HOLDOUT_TESTS, SRC_BUGGY, TEST_ORIG, unifiedDiff, type GateId, type PatchId } from '../../src/sim/engine/integrity';

const caughtBy = (id: PatchId): GateId[] => {
  const ev = evaluate(PATCHES.find((p) => p.id === id)!);
  return GATES.filter((g) => ev.gates[g].fired);
};

describe('test integrity gates', () => {
  it('the original code fails the visible test', () => {
    expect(runSuite(SRC_BUGGY, TEST_ORIG).every((r) => r.ok)).toBe(false);
  });
  it('the real fix passes every gate and all tests', () => {
    expect(caughtBy('a')).toEqual([]);
    const ev = evaluate(PATCHES[0]);
    expect(ev.visible.every((r) => r.ok)).toBe(true);
    expect(ev.holdout.every((r) => r.ok)).toBe(true);
  });
  it('each cheating patch is caught exactly by the expected gates', () => {
    expect(caughtBy('b')).toEqual(['protected', 'noskip', 'holdout']);
    expect(caughtBy('c')).toEqual(['protected', 'count', 'holdout']);
    expect(caughtBy('d')).toEqual(['holdout']);
    expect(caughtBy('e')).toEqual(['protected', 'holdout']);
  });
  it('every cheating patch makes the visible suite pass (or run nothing)', () => {
    for (const p of PATCHES) expect(evaluate(p).visible.every((r) => r.ok)).toBe(true);
  });
  it('holdout tests detect the special-casing patch', () => {
    const ev = evaluate(PATCHES.find((p) => p.id === 'd')!);
    expect(ev.visible.every((r) => r.ok)).toBe(true);
    expect(ev.gates.holdout.failing!.length).toBeGreaterThan(0);
    expect(runSuite(SRC_BUGGY, HOLDOUT_TESTS).some((r) => !r.ok)).toBe(true);
  });
  it('only the holdout gate catches patch d', () => {
    for (const g of GATES.filter((x) => x !== 'holdout')) expect(evaluate(PATCHES[3]).gates[g].fired).toBe(false);
  });
  it('judging: only selections with holdout solve it', () => {
    expect(judge([]).solved).toBe(false);
    expect(judge(['protected', 'noskip', 'count']).cheatsMerged).toEqual(['d']);
    expect(judge(['holdout']).solved).toBe(true);
    expect(judge(['protected', 'noskip', 'count', 'holdout']).solved).toBe(true);
  });
  it('unified diff marks changed lines', () => {
    const d = unifiedDiff('x.js', 'a\nb\nc', 'a\nB\nc');
    expect(d.filter((l) => l.kind === 'del').map((l) => l.text)).toEqual(['b']);
    expect(d.filter((l) => l.kind === 'add').map((l) => l.text)).toEqual(['B']);
  });
});
