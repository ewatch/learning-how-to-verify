import { describe, expect, it } from 'vitest';
import { generateMutants, runMutant } from '../../src/sim/engine/mutate';
import { instrumentCoverage, makeExpect, deepEq, show, matchClose, significant, tokenize, runWithCoverage, loadSuite } from '../../src/sim/engine/jsrun';
import { IMPLS, evaluate, toVitest, check } from '../../src/sim/engine/unitsim';

const descs = (src: string) => generateMutants(src).map((m) => `${m.line}:${m.kind}:${m.desc}`);

describe('mutation operators produce exactly the expected mutants', () => {
  it('relational operators: boundary and negation', () => {
    expect(descs('a >= b;')).toEqual(['0:rel-boundary:>= → >', '0:rel-negate:>= → <']);
    expect(descs('a > b;')).toEqual(['0:rel-boundary:> → >=', '0:rel-negate:> → <=']);
    expect(descs('a <= b;')).toEqual(['0:rel-boundary:<= → <', '0:rel-negate:<= → >']);
    expect(descs('a < b;')).toEqual(['0:rel-boundary:< → <=', '0:rel-negate:< → >=']);
  });
  it('equality, logic, update and compound assignment', () => {
    expect(descs('a === b;')).toEqual(['0:eq:=== → !==']);
    expect(descs('a !== b;')).toEqual(['0:eq:!== → ===']);
    expect(descs('a && b;')).toEqual(['0:logic:&& → ||']);
    expect(descs('a || b;')).toEqual(['0:logic:|| → &&']);
    expect(descs('i++;')).toEqual(['0:update:++ → --']);
    expect(descs('i--;')).toEqual(['0:update:-- → ++']);
    expect(generateMutants('x += y;').map((m) => m.desc)).toContain('+= → -=');
    expect(generateMutants('x -= y;').map((m) => m.desc)).toContain('-= → +=');
  });
  it('arithmetic, but not unary signs', () => {
    expect(descs('a + b;')).toEqual(['0:arith:+ → -']);
    expect(descs('a - b;')).toEqual(['0:arith:- → +']);
    expect(descs('a * b;')).toEqual(['0:arith:* → /']);
    expect(descs('a / b;')).toEqual(['0:arith:/ → *']);
    expect(descs('a % b;')).toEqual(['0:arith:% → *']);
    expect(generateMutants('return -a;').filter((m) => m.kind === 'arith')).toEqual([]);
    expect(generateMutants('f(-a, +b);').filter((m) => m.kind === 'arith')).toEqual([]);
    expect(generateMutants('x = -1;').filter((m) => m.kind === 'arith')).toEqual([]);
  });
  it('numbers, strings and booleans', () => {
    expect(generateMutants('f(7);').map((m) => m.desc)).toContain('7 → 8');
    expect(generateMutants('f(0.5);').map((m) => m.desc)).toContain('0.5 → 1');
    expect(generateMutants('f(1.0);').map((m) => m.desc)).toContain('1.0 → 0');
    expect(generateMutants('f("ab");').map((m) => m.code)).toContain('f("");');
    expect(generateMutants('f("");').filter((m) => m.kind === 'str')).toEqual([]);
    expect(generateMutants('f(true);').map((m) => m.code)).toContain('f(false);');
    expect(generateMutants('f(false);').map((m) => m.code)).toContain('f(true);');
  });
  it('if conditions, returns and statement deletion', () => {
    const ms = generateMutants('if (ok) {\n  g();\n}');
    expect(ms.map((m) => m.code)).toEqual(expect.arrayContaining(['if (true) {\n  g();\n}', 'if (false) {\n  g();\n}', 'if (ok) {\n  /* removed */\n}']));
    expect(generateMutants('return a + b;').map((m) => m.code)).toContain('return null;');
    expect(generateMutants('return null;').filter((m) => m.kind === 'ret')).toEqual([]);
    expect(generateMutants('return;').filter((m) => m.kind === 'ret')).toEqual([]);
    expect(generateMutants('return f(a, [b]);').map((m) => m.code)).toContain('return null;');
    expect(generateMutants('throw new Error("x");').map((m) => m.code)).toContain('/* removed */');
    expect(generateMutants('a.b = c;').map((m) => m.code)).toContain('/* removed */');
    expect(generateMutants('let a = c;').filter((m) => m.kind === 'del')).toEqual([]);
    expect(generateMutants('x == y;').filter((m) => m.kind === 'del')).toEqual([]);
  });
  it('mutants are sorted by line and record the right line', () => {
    const ms = generateMutants('a + b;\nc - d;');
    expect(ms.map((m) => m.line)).toEqual([0, 1]);
  });
  it('long descriptions are clipped', () => {
    const long = 'f("' + 'x'.repeat(40) + '");';
    const d = generateMutants(long).find((m) => m.kind === 'str')!.desc;
    expect(d.length).toBeLessThan(30);
    expect(d).toContain('…');
  });
  it('runMutant classifies invalid, killed and survived', () => {
    const tests = 'test("t", () => expect(f(2)).toBe(3));';
    const [plus] = generateMutants('function f(a) { return a + 1; }').filter((m) => m.kind === 'arith');
    const r = runMutant(plus, tests, 'en');
    expect(r.status).toBe('killed');
    expect(r.by).toBe('t');
    expect(r.msg).toBe('expected 3, got 1');
    expect(runMutant({ ...plus, code: 'function f( {' }, tests, 'en').status).toBe('invalid');
    expect(runMutant({ ...plus, code: 'function f(a) { return a + 1; }' }, tests, 'en').status).toBe('survived');
  });
});

describe('test runner details', () => {
  const expect_ = makeExpect('en');
  const fails = (fn: () => void) => { try { fn(); return null; } catch (e) { return (e as Error).message; } };
  it('matchers and their messages', () => {
    expect(fails(() => expect_(1).toBe(2))).toBe('expected 2, got 1');
    expect(fails(() => expect_({ a: 1 }).toEqual({ a: 2 }))).toBe('expected {"a":2}, got {"a":1}');
    expect(fails(() => expect_(undefined).toBeDefined())).toBe('expected a defined value, got undefined');
    expect(fails(() => expect_(0).toBeTruthy())).toBe('expected truthy, got 0');
    expect(fails(() => expect_(3).toBeLessThanOrEqual(2))).toBe('expected 3 to be less than or equal to 2');
    expect(fails(() => expect_(() => 1).toThrow())).toBe('expected an exception, but none was thrown');
    expect(fails(() => expect_(() => { throw new Error('boom'); }).toThrow('bam'))).toBe('error message "boom" does not contain "bam"');
    expect(fails(() => expect_(() => { throw new Error('boom'); }).toThrow('oo'))).toBeNull();
    expect(fails(() => expect_(2).toBeLessThanOrEqual(2))).toBeNull();
    expect(makeExpect('de')(1).toBe).toBeTypeOf('function');
    expect(fails(() => makeExpect('de')(1).toBe(2))).toBe('erwartet 2, erhalten 1');
  });
  it('deepEq ignores functions and distinguishes arrays from objects', () => {
    expect(deepEq({ a: 1, f() {} }, { a: 1 })).toBe(true);
    expect(deepEq([1], { 0: 1 })).toBe(false);
    expect(deepEq([1, [2]], [1, [2]])).toBe(true);
    expect(deepEq({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEq(null, {})).toBe(false);
    expect(deepEq(NaN, NaN)).toBe(true);
  });
  it('show formats values', () => {
    expect(show('a')).toBe('"a"');
    expect(show(() => 1)).toBe('function');
    expect(show(undefined)).toBe('undefined');
    const cyclic: Record<string, unknown> = {}; cyclic.self = cyclic;
    expect(show(cyclic)).toBe('[object Object]');
  });
  it('coverage instrumentation marks statement lines only', () => {
    const src = 'function f(a) {\n  if (a) {\n    return 1;\n  } else {\n    return 2;\n  }\n}';
    const { lines } = instrumentCoverage(src);
    expect(lines).toEqual([1, 2, 4]); // the function header itself is not a statement
    const c = runWithCoverage(src, 'test("t", () => expect(f(true)).toBe(1));', 'en');
    expect(c.pct).toBeCloseTo(200 / 3);
    expect([...c.hit].sort()).toEqual([1, 2]);
    expect(runWithCoverage('', '', 'en').pct).toBe(100);
  });
  it('brackets and tokens', () => {
    const sig = significant(tokenize('f(a, (b), [c]) { x }'));
    expect(sig[matchClose(sig, 1)].v).toBe(')');
    expect(matchClose(significant(tokenize('f(a')), 1)).toBe(-1);
    expect(() => tokenize('a # b')).toThrow(SyntaxError);
    expect(tokenize('// c\n"s" 1.5 x ===').map((t) => t.type)).toEqual(['com', 'ws', 'str', 'ws', 'num', 'ws', 'id', 'ws', 'p']);
  });
  it('runtime errors are reported with their name', () => {
    const r = loadSuite('function f() { return null.x; }', 'test("t", () => f());', 'en')[0].run();
    expect(r.ok).toBe(false);
    expect(r.msg).toMatch(/^TypeError: /);
  });
});

describe('unit puzzle details', () => {
  it('check reports pass/fail and the actual value', () => {
    expect(check(IMPLS[0], { species: 'cat', age: 8, expect: 4000 })).toEqual({ outcome: 'pass', got: '4000' });
    expect(check(IMPLS[0], { species: 'dog', age: -1, expect: 'throws' })).toEqual({ outcome: 'pass', got: 'throws' });
    expect(check(IMPLS[0], { species: 'dog', age: 1.5, expect: 'throws' }).outcome).toBe('pass');
    expect(check(IMPLS[0], { species: 'dog', age: 3, expect: 1 })).toEqual({ outcome: 'fail', got: '12000' });
    expect(check(IMPLS[0], { species: 'dog', age: 3, expect: 'throws' })).toEqual({ outcome: 'fail', got: '12000' });
  });
  it('each bug is caught by exactly the example that targets it', () => {
    const cases = {
      'senior-boundary': { species: 'dog' as const, age: 8, expect: 6000 },
      'puppy-boundary': { species: 'dog' as const, age: 1, expect: 12000 },
      'no-vaccination': { species: 'dog' as const, age: 0, expect: 14000 },
      'accepts-negative': { species: 'dog' as const, age: -1, expect: 'throws' as const },
      'ignores-species': { species: 'cat' as const, age: 3, expect: 8000 },
    };
    for (const [bug, c] of Object.entries(cases)) expect(evaluate([c]).caught).toContain(bug);
    expect(evaluate([]).total).toBe(5);
  });
  it('generates a Vitest file', () => {
    const out = toVitest([{ species: 'dog', age: 8, expect: 6000 }, { species: 'cat', age: -1, expect: 'throws' }]);
    expect(out).toContain("it('dog, age 8: 6000', () => expect(adoptionFee('dog', 8)).toBe(6000));");
    expect(out).toContain("it('cat, age -1: rejected', () => expect(() => adoptionFee('cat', -1)).toThrow());");
    expect(out.startsWith("import { describe, expect, it } from 'vitest';")).toBe(true);
    expect(out.trimEnd().endsWith('});')).toBe(true);
  });
});
