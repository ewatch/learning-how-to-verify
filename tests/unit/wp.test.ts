import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { PRESETS, ParseError, analyse, ev, exec, parseExpr, showText, solve, makeSearch, envAt } from '../../src/sim/engine/wp';

const run = (prog: string, pre: string, post: string) => solve(analyse(prog, pre, post).VC);

describe('wp calculus', () => {
  it('substitutes backwards through assignments', () => {
    const a = analyse('y := x + 1;\nz := y * 2;', 'x >= 0', 'z > 0');
    expect(showText(a.W)).toBe('(x + 1) · 2 > 0');
    expect(a.steps.map((s) => s.kind)).toEqual(['start', 'assign', 'assign', 'vc']);
  });
  it('builds a case split for if/else', () => {
    const a = analyse(PRESETS[1]!.prog, 'true', PRESETS[1]!.post);
    expect(a.steps.map((s) => s.kind)).toContain('ifSplit');
    expect(showText(a.W)).toContain('¬');
  });
  it('reports bilingual parse errors with codes', () => {
    try { analyse('x := ;', 'true', 'y >= -100'); expect.unreachable(); }
    catch (e) { expect(e).toBeInstanceOf(ParseError); expect((e as ParseError).msg.de).toMatch(/Zeile 1/); expect((e as ParseError).msg.en).toMatch(/line 1/); }
    expect(() => parseExpr('a $ b')).toThrow(ParseError);
  });

  describe('presets', () => {
    for (const p of PRESETS) {
      it(`${p.id}: correct version has no counterexample`, () => {
        const r = run(p.prog, p.pre, p.post);
        expect(r.counterexample).toBeNull();
      });
      it(`${p.id}: the documented bug produces a counterexample`, () => {
        const r = run(p.bug.prog ?? p.prog, p.bug.pre ?? p.pre, p.bug.post ?? p.post);
        expect(r.counterexample).not.toBeNull();
        // a counterexample must satisfy P and really violate Q when executed (or divide by zero)
        const a = analyse(p.bug.prog ?? p.prog, p.bug.pre ?? p.pre, p.bug.post ?? p.post);
        const env = { ...r.counterexample!.env };
        expect(ev(a.P, env)).toBe(true);
        exec(a.stmts, env);
        expect(ev(a.Q, env)).toBe(false);
      });
      it(`${p.id}: hints are bilingual`, () => {
        expect(p.hint.en.length).toBeGreaterThan(0);
        expect(p.hint.de.length).toBeGreaterThan(0);
      });
    }
  });

  it('wp is sound: wp(C,Q) holds on env iff Q holds after running C (property)', () => {
    for (const p of PRESETS) {
      const a = analyse(p.prog, p.pre, p.post);
      const vars = makeSearch(a.W).vars;
      const s = makeSearch(a.W);
      fc.assert(fc.property(fc.integer({ min: 0, max: Math.max(0, s.total - 1) }), (k) => {
        const env = envAt(s, k);
        for (const v of vars) expect(typeof env[v]).toBe('number');
        const after = exec(a.stmts, { ...env });
        expect(ev(a.W, env)).toBe(ev(a.Q, after));
      }), { numRuns: 200 });
    }
  });
  it('division by zero counts as a counterexample', () => {
    const r = run('y := 10 / x;', 'true', 'y >= -100');
    expect(r.counterexample?.env).toEqual({ x: 0 });
    expect(r.counterexample?.error?.code).toBe('divZero');
  });
});
