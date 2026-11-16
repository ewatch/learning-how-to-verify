import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { lint, SNIPPET, SNIPPET_FIXED, isSolved, PATCH_AFTER, PATCH_BEFORE, RULE_IDS, type RuleId } from '../../src/sim/engine/lint';

const rules = (src: string, r?: RuleId) => lint(src).filter((f) => !r || f.rule === r).map((f) => f.rule);

describe('no-floating-promise', () => {
  it('flags bare calls', () => {
    expect(rules('repo.save(pet);')).toEqual(['no-floating-promise']);
    expect(rules('if (x) {\n  mailer.send(a, b);\n}')).toEqual(['no-floating-promise']);
    expect(rules('this.repo.save(p);')).toEqual(['no-floating-promise']);
  });
  it('accepts await, return, assignment, void, then/catch', () => {
    for (const s of ['await repo.save(p);', 'return repo.save(p);', 'const r = repo.save(p);', 'void repo.save(p);', 'repo.save(p).catch(log);', 'x = () => repo.save(p);', 'other.save(p);', 'await Promise.all([repo.save(p)]);'])
      expect(rules(s, 'no-floating-promise'), s).toEqual([]);
  });
  it('reports line and column', () => {
    const f = lint('a;\n  repo.save(x);')[0];
    expect([f.line, f.col]).toEqual([2, 3]);
  });
});
describe('eqeqeq', () => {
  it('flags == and !=, not === / !==', () => {
    expect(rules('a == b; c != d;')).toEqual(['eqeqeq', 'eqeqeq']);
    expect(rules('a === b; c !== d;')).toEqual([]);
  });
});
describe('no-math-random-in-domain', () => {
  it('flags calls but not comments or strings', () => {
    expect(rules('const x = Math.random();')).toEqual(['no-math-random-in-domain']);
    expect(rules('// Math.random()\nconst s = "Math.random()";')).toEqual([]);
    expect(rules('Math.floor(1)')).toEqual([]);
  });
});
describe('no-explicit-any', () => {
  it('flags type positions only', () => {
    expect(rules('function f(x: any) {}')).toEqual(['no-explicit-any']);
    expect(rules('const y = z as any;')).toEqual(['no-explicit-any']);
    expect(rules('function f(x: string) {} // any')).toEqual([]);
    expect(rules('const s = ": any";')).toEqual([]);
  });
});
describe('snippet and toggles', () => {
  it('has four findings, fixed version none', () => {
    expect(lint(SNIPPET).map((f) => f.rule).sort()).toEqual([...RULE_IDS].sort());
    expect(lint(SNIPPET_FIXED)).toEqual([]);
    expect(isSolved(SNIPPET_FIXED)).toBe(true);
    expect(isSolved(SNIPPET)).toBe(false);
    expect(isSolved('')).toBe(false);
  });
  it('respects enabled rules', () => {
    expect(lint(SNIPPET, ['eqeqeq'])).toHaveLength(1);
  });
  it('agent patch is only caught by the lint rule', () => {
    expect(lint(PATCH_BEFORE)).toEqual([]);
    expect(rules(PATCH_AFTER)).toEqual(['no-floating-promise']);
  });
  it('never crashes on arbitrary strings', () => {
    fc.assert(fc.property(fc.string({ maxLength: 200 }), (s) => { lint(s); }));
    const frag = fc.constantFrom('repo', '.', 'save', '(', ')', ';', 'await', '==', 'any', ':', 'Math', 'random', '"', "'", '`', '/*', '//', '\n', '{', '}', '@', '#');
    fc.assert(fc.property(fc.array(frag, { maxLength: 40 }), (a) => { for (const f of lint(a.join(' '))) expect(f.line).toBeGreaterThan(0); }));
  });
});
