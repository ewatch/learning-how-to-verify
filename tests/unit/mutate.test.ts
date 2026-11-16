import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { generateMutants, runMutant, mutationScore } from '../../src/sim/engine/mutate';
import { runWithCoverage, guardLoops, loadSuite, tokenize } from '../../src/sim/engine/jsrun';
import { EXAMPLES } from '../../src/sim/ui/mutation';

const fakeRepo = () => ({ saved: [] as unknown[], save(x: unknown) { this.saved.push(x); } });
const fakeMailer = () => ({ sent: [] as unknown[], send(to: string, text: string) { this.sent.push({ to, text }); } });
const EXTRA = { fakeRepo, fakeMailer };
const runAll = (code: string, tests: string) => generateMutants(code).map((m) => runMutant(m, tests, 'en', EXTRA));

describe('mutation examples behave as the page explains', () => {
  for (const ex of [EXAMPLES[0], EXAMPLES[2]]) {
    it(`${ex.name.en}: tests pass on the original with full line coverage`, () => {
      const c = runWithCoverage(ex.code, ex.tests, 'en', EXTRA);
      expect(c.results.every((r) => r.ok)).toBe(true);
      expect(c.pct).toBe(100);
    });
  }
  it('fee: weak tests let the boundary mutant survive, better tests kill everything', () => {
    const [fee] = EXAMPLES;
    const weak = runAll(fee.code, fee.tests);
    expect(weak.some((r) => r.status === 'survived' && r.mutant.desc === '>= → >')).toBe(true);
    expect(mutationScore(runAll(fee.code, fee.better!))).toBe(100);
  });
  it('reserve: weak test passes on the original but misses the error branch', () => {
    const c = runWithCoverage(EXAMPLES[1].code, EXAMPLES[1].tests, 'en', EXTRA);
    expect(c.results.every((r) => r.ok)).toBe(true);
    expect(c.pct).toBeLessThan(100);
  });
  it('reserve: weak test lets side-effect deletions survive, better tests kill everything', () => {
    const ex = EXAMPLES[1];
    const weak = runAll(ex.code, ex.tests);
    expect(weak.filter((r) => r.status === 'survived' && r.mutant.kind === 'del').length).toBeGreaterThanOrEqual(2);
    expect(mutationScore(runAll(ex.code, ex.better!))).toBe(100);
  });
  it('oldest: exactly the two listed equivalent mutants survive, and i-- times out', () => {
    const ex = EXAMPLES[2];
    const res = runAll(ex.code, ex.tests);
    const surv = res.filter((r) => r.status === 'survived').map((r) => `${r.mutant.line + 1}:${r.mutant.desc.replace(/\s/g, '')}`);
    expect(surv.sort()).toEqual(Object.keys(ex.equivalent!).sort());
    expect(res.some((r) => r.status === 'timeout')).toBe(true);
    const eq = new Set(res.filter((r) => r.status === 'survived').map((r) => r.mutant.id));
    expect(mutationScore(res, eq)).toBe(100);
  });
});

describe('engine properties', () => {
  it('every mutant differs from the original and ids are 1..n', () => {
    for (const ex of EXAMPLES) {
      const ms = generateMutants(ex.code);
      expect(ms.length).toBeGreaterThan(3);
      ms.forEach((m, i) => { expect(m.code).not.toBe(ex.code); expect(m.id).toBe(i + 1); });
      expect(new Set(ms.map((m) => m.code)).size).toBe(ms.length);
    }
  });
  it('tokenize round-trips any printable string it accepts', () => {
    fc.assert(fc.property(fc.string({ unit: fc.constantFrom(...'abc xyz 0123 (){}[];,.+-*/<>=!&|"\'\n'.split('')) }), (s) => {
      let toks;
      try { toks = tokenize(s); } catch { return true; }
      return toks.map((t) => t.v).join('') === s;
    }));
  });
  it('guardLoops turns an infinite loop into a timeout failure', () => {
    const suite = loadSuite('function f(){ while (true) { } }', 'test("t", () => f());', 'en');
    const r = suite[0].run();
    expect(r.ok).toBe(false);
    expect(r.timeout).toBe(true);
    expect(guardLoops('for (;;) { x(); }')).toContain('__guard()');
  });
  it('mutationScore ignores invalid and equivalent mutants', () => {
    const m = (id: number, status: 'killed' | 'survived' | 'invalid') => ({ mutant: { id, line: 0, kind: 'num' as const, desc: '', code: '' }, status, results: [] });
    expect(mutationScore([m(1, 'killed'), m(2, 'survived'), m(3, 'invalid')])).toBe(50);
    expect(mutationScore([m(1, 'killed'), m(2, 'survived')], new Set([2]))).toBe(100);
    expect(mutationScore([m(3, 'invalid')])).toBeNull();
  });
});
