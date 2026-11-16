/**
 * A tiny, dependency-free test runner for small JavaScript snippets in the browser.
 * Code and tests run via `new Function` in strict mode; loops are guarded against
 * infinite iteration, and statement coverage can be recorded.
 * Ported and generalised from the formal-verification demos.
 */
export type Lang = 'en' | 'de';

export interface Token { type: 'ws' | 'com' | 'str' | 'num' | 'id' | 'p'; v: string; s: number; e: number }

const TOKEN_RE = /(\s+)|(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\d+(?:\.\d+)?)|([A-Za-z_$äöüÄÖÜß][\w$äöüÄÖÜß]*)|(===|!==|=>|<=|>=|==|!=|&&|\|\||\?\?|\+\+|--|\+=|-=|\*=|\/=|[-+*/%<>=!?:;,.(){}[\]&|^~])/y;

export function tokenize(src: string): Token[] {
  const toks: Token[] = [];
  let pos = 0;
  while (pos < src.length) {
    TOKEN_RE.lastIndex = pos;
    const m = TOKEN_RE.exec(src);
    if (!m) throw new SyntaxError(`Unexpected character: ${src[pos]}`);
    const type = m[1] ? 'ws' : m[2] ? 'com' : m[3] ? 'str' : m[4] ? 'num' : m[5] ? 'id' : 'p';
    toks.push({ type, v: m[0], s: pos, e: pos + m[0].length });
    pos += m[0].length;
  }
  return toks;
}

export const significant = (toks: Token[]) => toks.filter((t) => t.type !== 'ws' && t.type !== 'com');

/** index of the token closing the bracket opened at `i` */
export function matchClose(toks: Token[], i: number): number {
  const open = toks[i].v, close = open === '(' ? ')' : open === '{' ? '}' : ']';
  let d = 0;
  for (let k = i; k < toks.length; k++) {
    if (toks[k].v === open) d++;
    else if (toks[k].v === close && --d === 0) return k;
  }
  return -1;
}

/** Insert `__guard();` at the start of every loop body so infinite loops become timeouts. */
export function guardLoops(src: string): string {
  const sig = significant(tokenize(src));
  const ins: number[] = [];
  sig.forEach((t, k) => {
    if (t.type === 'id' && (t.v === 'for' || t.v === 'while') && sig[k + 1]?.v === '(') {
      const c = matchClose(sig, k + 1);
      if (c > 0 && sig[c + 1]?.v === '{') ins.push(sig[c + 1].e);
    }
  });
  let out = src;
  for (const p of ins.sort((a, b) => b - a)) out = out.slice(0, p) + ' __guard();' + out.slice(p);
  return out;
}

/** Statement coverage: prefix every statement-starting line with `__cov(line);`. */
export function instrumentCoverage(src: string): { code: string; lines: number[] } {
  const lines = src.split('\n');
  const cov: number[] = [];
  let prevEnd = '{';
  const out = lines.map((l, i) => {
    const tr = l.trim();
    if (!tr || tr.startsWith('//')) return l;
    const starts = /[;{}]$/.test(prevEnd) && !/^(}|\)|\]|\.|else\b|function\b|catch\b|finally\b|case\b|default\b)/.test(tr);
    prevEnd = tr;
    if (!starts) return l;
    cov.push(i);
    const ind = l.length - l.trimStart().length;
    return l.slice(0, ind) + `__cov(${i});` + l.slice(ind);
  });
  return { code: out.join('\n'), lines: cov };
}

export class AssertionError extends Error {}
export class TimeoutError extends Error {}

export const show = (v: unknown): string => {
  try {
    if (typeof v === 'string') return JSON.stringify(v);
    if (typeof v === 'function') return 'function';
    return JSON.stringify(v) ?? String(v);
  } catch { return String(v); }
};

export function deepEq(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ra = a as Record<string, unknown>, rb = b as Record<string, unknown>;
  const ka = Object.keys(ra).filter((k) => typeof ra[k] !== 'function');
  const kb = Object.keys(rb).filter((k) => typeof rb[k] !== 'function');
  return ka.length === kb.length && ka.every((k) => deepEq(ra[k], rb[k]));
}

const M = {
  en: { exp: (e: string, a: string) => `expected ${e}, got ${a}`, def: 'expected a defined value, got undefined', truthy: (a: string) => `expected truthy, got ${a}`, noThrow: 'expected an exception, but none was thrown', msg: (m: string, w: string) => `error message ${m} does not contain ${w}`, timeout: 'Timeout: infinite loop?', lt: (a: string, e: string) => `expected ${a} to be less than or equal to ${e}` },
  de: { exp: (e: string, a: string) => `erwartet ${e}, erhalten ${a}`, def: 'erwartet: definiert, erhalten: undefined', truthy: (a: string) => `erwartet wahr, erhalten ${a}`, noThrow: 'erwartet: Exception, aber es wurde keine geworfen', msg: (m: string, w: string) => `Fehlermeldung ${m} enthält nicht ${w}`, timeout: 'Timeout: Endlosschleife?', lt: (a: string, e: string) => `erwartet ${a} ≤ ${e}` },
};

export function makeExpect(lang: Lang) {
  const m = M[lang];
  return (actual: unknown) => {
    const fail = (msg: string): never => { throw new AssertionError(msg); };
    return {
      toBe: (e: unknown) => { if (!Object.is(actual, e)) fail(m.exp(show(e), show(actual))); },
      toEqual: (e: unknown) => { if (!deepEq(actual, e)) fail(m.exp(show(e), show(actual))); },
      toBeDefined: () => { if (actual === undefined) fail(m.def); },
      toBeTruthy: () => { if (!actual) fail(m.truthy(show(actual))); },
      toBeLessThanOrEqual: (e: number) => { if (!((actual as number) <= e)) fail(m.lt(show(actual), show(e))); },
      toThrow: (msg?: string) => {
        try { (actual as () => unknown)(); } catch (err) {
          if (err instanceof TimeoutError) throw err;
          const em = String((err as Error).message);
          if (msg !== undefined && !em.includes(msg)) fail(m.msg(show(em), show(msg)));
          return;
        }
        fail(m.noThrow);
      },
    };
  };
}

export interface TestResult { name: string; ok: boolean; timeout?: boolean; msg?: string }
export interface LoadedTest { name: string; run: () => TestResult }

/** Load `code` plus `tests` (which call `test(name, fn)` and `expect`) and return runnable tests. */
export function loadSuite(code: string, tests: string, lang: Lang, cov: (line: number) => void = () => {}, extra: Record<string, unknown> = {}): LoadedTest[] {
  const reg: { name: string; f: () => void }[] = [];
  let steps = 0;
  const guard = () => { if (++steps > 20000) throw new TimeoutError(M[lang].timeout); };
  const names = Object.keys(extra);
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const fn = new Function('test', 'it', 'expect', '__guard', '__cov', ...names, `"use strict";\n${guardLoops(code)}\n;${tests}`);
  const reg1 = (name: string, f: () => void) => reg.push({ name, f });
  fn(reg1, reg1, makeExpect(lang), guard, cov, ...names.map((n) => extra[n]));
  return reg.map((t) => ({
    name: t.name,
    run: (): TestResult => {
      steps = 0;
      try { t.f(); return { name: t.name, ok: true }; } catch (e) {
        const err = e as Error;
        const known = e instanceof AssertionError || e instanceof TimeoutError;
        return { name: t.name, ok: false, timeout: e instanceof TimeoutError, msg: known ? err.message : `${err.name}: ${err.message}` };
      }
    },
  }));
}

/** Run all tests once on the original code, with statement coverage. */
export function runWithCoverage(code: string, tests: string, lang: Lang, extra?: Record<string, unknown>) {
  const inst = instrumentCoverage(code);
  const hit = new Set<number>();
  const suite = loadSuite(inst.code, tests, lang, (i) => hit.add(i), extra);
  const results = suite.map((t) => t.run());
  const covered = inst.lines.filter((l) => hit.has(l)).length;
  return { results, lines: inst.lines, hit, pct: inst.lines.length ? (100 * covered) / inst.lines.length : 100 };
}
