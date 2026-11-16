import { significant, tokenize, matchClose, loadSuite, type Lang, type TestResult } from './jsrun';

export type MutantKind = 'rel-boundary' | 'rel-negate' | 'eq' | 'arith' | 'logic' | 'update' | 'num' | 'str' | 'bool' | 'if-true' | 'if-false' | 'ret' | 'del';

export interface Mutant { id: number; line: number; kind: MutantKind; desc: string; code: string }

const OPS: Record<string, [string, MutantKind][]> = {
  '>=': [['>', 'rel-boundary'], ['<', 'rel-negate']], '>': [['>=', 'rel-boundary'], ['<=', 'rel-negate']],
  '<=': [['<', 'rel-boundary'], ['>', 'rel-negate']], '<': [['<=', 'rel-boundary'], ['>=', 'rel-negate']],
  '===': [['!==', 'eq']], '!==': [['===', 'eq']],
  '+': [['-', 'arith']], '-': [['+', 'arith']], '*': [['/', 'arith']], '/': [['*', 'arith']], '%': [['*', 'arith']],
  '&&': [['||', 'logic']], '||': [['&&', 'logic']], '++': [['--', 'update']], '--': [['++', 'update']],
  '+=': [['-=', 'arith']], '-=': [['+=', 'arith']],
};

const lineOf = (src: string, pos: number) => src.slice(0, pos).split('\n').length - 1;
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/** Generate first-order mutants with the classic operators. Deterministic and de-duplicated. */
export function generateMutants(src: string): Mutant[] {
  const sig = significant(tokenize(src));
  const out: Omit<Mutant, 'id'>[] = [];
  const seen = new Set<string>();
  const add = (s: number, e: number, rep: string, kind: MutantKind, desc: string) => {
    const code = src.slice(0, s) + rep + src.slice(e);
    if (code === src || seen.has(code)) return;
    seen.add(code);
    out.push({ line: lineOf(src, s), kind, desc, code });
  };
  sig.forEach((t, k) => {
    if (t.type === 'p' && OPS[t.v]) {
      const prev = sig[k - 1];
      const unary = (t.v === '-' || t.v === '+') && (!prev || ['(', ',', '=', '[', 'return', '=>', ':', '?'].includes(prev.v) || OPS[prev.v]);
      if (!unary) for (const [rep, kind] of OPS[t.v]) add(t.s, t.e, rep, kind, `${t.v} → ${rep}`);
    }
    if (t.type === 'num') {
      const n = Number(t.v);
      const rep = Number.isInteger(n) && !t.v.includes('.') ? String(n + 1) : n === 1 ? '0' : '1';
      add(t.s, t.e, rep, 'num', `${t.v} → ${rep}`);
    }
    if (t.type === 'str' && t.v.length > 2) add(t.s, t.e, '""', 'str', `${clip(t.v, 22)} → ""`);
    if (t.type === 'id' && (t.v === 'true' || t.v === 'false')) add(t.s, t.e, t.v === 'true' ? 'false' : 'true', 'bool', `${t.v} → ${t.v === 'true' ? 'false' : 'true'}`);
    if (t.type === 'id' && t.v === 'if' && sig[k + 1]?.v === '(') {
      const close = matchClose(sig, k + 1);
      if (close < 0) return;
      const s = sig[k + 2].s, e = sig[close].s, cond = src.slice(s, e);
      add(s, e, 'true', 'if-true', `if (${clip(cond, 24)}) → if (true)`);
      add(s, e, 'false', 'if-false', `if (${clip(cond, 24)}) → if (false)`);
    }
    if (t.type === 'id' && t.v === 'return' && sig[k + 1] && sig[k + 1].v !== ';') {
      let j = k + 1, d = 0;
      while (j < sig.length && !(d === 0 && (sig[j].v === ';' || sig[j].v === '}'))) {
        if ('([{'.includes(sig[j].v)) d++;
        if (')]}'.includes(sig[j].v)) d--;
        j++;
      }
      const s = sig[k + 1].s, e = sig[j - 1].e, ex = src.slice(s, e);
      if (ex !== 'null') add(s, e, 'null', 'ret', `return ${clip(ex, 24)} → return null`);
    }
  });
  // delete statements: calls, assignments, throw
  let off = 0;
  for (const line of src.split('\n')) {
    const tr = line.trim();
    const isStmt = /^throw\b.*;$/.test(tr) || /^[\w$.[\]]+\s*\(.*\)\s*;$/.test(tr) ||
      (/^[\w$.[\]]+\s*(=|\+=|-=|\*=|\/=)\s*[^=].*;$/.test(tr) && !/^(let|const|var|return)\b/.test(tr));
    if (isStmt) {
      const s = off + line.indexOf(tr);
      add(s, s + tr.length, '/* removed */', 'del', `${clip(tr, 34)} → (removed)`);
    }
    off += line.length + 1;
  }
  return out.sort((a, b) => a.line - b.line).map((m, i) => ({ ...m, id: i + 1 }));
}

export type MutantStatus = 'killed' | 'timeout' | 'survived' | 'invalid';
export interface MutantResult { mutant: Mutant; status: MutantStatus; by?: string; msg?: string; results: TestResult[] }

/** Run the test suite against one mutant. A mutant is killed if any test fails. */
export function runMutant(m: Mutant, tests: string, lang: Lang, extra?: Record<string, unknown>): MutantResult {
  let suite;
  try { suite = loadSuite(m.code, tests, lang, undefined, extra); } catch (e) {
    return { mutant: m, status: 'invalid', msg: (e as Error).message, results: [] };
  }
  const results = suite.map((t) => t.run());
  const firstFail = results.find((r) => !r.ok);
  if (!firstFail) return { mutant: m, status: 'survived', results };
  return { mutant: m, status: firstFail.timeout ? 'timeout' : 'killed', by: firstFail.name, msg: firstFail.msg, results };
}

/** Mutation score in percent, excluding invalid mutants and those marked equivalent. */
export function mutationScore(results: MutantResult[], equivalent: Set<number> = new Set()): number | null {
  const counted = results.filter((r) => r.status !== 'invalid' && !(r.status === 'survived' && equivalent.has(r.mutant.id)));
  if (!counted.length) return null;
  const killed = counted.filter((r) => r.status === 'killed' || r.status === 'timeout').length;
  return (100 * killed) / counted.length;
}
