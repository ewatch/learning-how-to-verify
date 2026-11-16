// Weakest-precondition calculus for a tiny imperative language (assignments + if/else),
// plus a brute-force "mini solver" that looks for counterexamples in a small finite range.
// Pure logic, no DOM.
import type { Bi } from './i18n';

/* ---------- AST ---------- */
type Mark = { hl?: boolean };
export type BinOp = '==>' | '||' | '&&' | '==' | '!=' | '<' | '<=' | '>' | '>=' | '+' | '-' | '*' | '/' | '%';
export type Expr =
  | ({ t: 'num'; v: number } & Mark)
  | ({ t: 'bool'; v: boolean } & Mark)
  | ({ t: 'var'; n: string } & Mark)
  | ({ t: 'un'; op: '-' | '!'; e: Expr } & Mark)
  | ({ t: 'bin'; op: BinOp; l: Expr; r: Expr } & Mark);
export type Stmt =
  | { t: 'asg'; v: string; e: Expr; line: number }
  | { t: 'if'; c: Expr; th: Stmt[]; el: Stmt[] | null; line: number; elseLine?: number; endLine: number };
export type Value = number | boolean;
export type Env = Record<string, number>;

/* ---------- errors (codes + bilingual message) ---------- */
export class ParseError extends Error {
  constructor(public code: 'char' | 'expected' | 'unexpected', public line: number, public found: string, public expected: string | undefined, public msg: Bi) {
    super(msg.en);
  }
}
export class EvalError extends Error {
  constructor(public code: 'divZero' | 'unbound', public msg: Bi) { super(msg.en); }
}

/* ---------- lexer / parser ---------- */
interface Tok { k: string; v?: string | number; line: number }
const KW = new Set(['if', 'else', 'true', 'false']);
function lex(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0, line = 0;
  while (i < src.length) {
    const ch = src[i]!;
    if (ch === '\n') { line++; i++; continue; }
    if (/\s/.test(ch)) { i++; continue; }
    if (src.startsWith('//', i)) { while (i < src.length && src[i] !== '\n') i++; continue; }
    const rest = src.slice(i);
    let m: RegExpExecArray | null;
    if ((m = /^\d+/.exec(rest))) toks.push({ k: 'num', v: +m[0], line });
    else if ((m = /^[A-Za-z_]\w*/.exec(rest))) toks.push({ k: KW.has(m[0]) ? m[0] : 'id', v: m[0], line });
    else if ((m = /^(==>|:=|&&|\|\||==|!=|<=|>=|[-+*/%<>!(){};])/.exec(rest))) toks.push({ k: m[0], v: m[0], line });
    else throw new ParseError('char', line, ch, undefined, { en: `Unexpected character "${ch}" in line ${line + 1}`, de: `Unerwartetes Zeichen „${ch}“ in Zeile ${line + 1}` });
    i += m[0].length;
  }
  toks.push({ k: 'eof', line });
  return toks;
}

class Parser {
  private t: Tok[];
  private p = 0;
  constructor(src: string) { this.t = lex(src); }
  private peek() { return this.t[this.p]!; }
  private next() { return this.t[this.p++]!; }
  eat(k: string): Tok {
    const t = this.next();
    if (t.k !== k) {
      const f = t.k === 'eof' ? 'end' : String(t.v);
      throw new ParseError('expected', t.line, f, k, { en: `Expected "${k}", found "${t.k === 'eof' ? 'end of input' : f}" (line ${t.line + 1})`, de: `Erwartet „${k}“, gefunden „${t.k === 'eof' ? 'Ende' : f}“ (Zeile ${t.line + 1})` });
    }
    return t;
  }
  expr(): Expr { return this.imp(); }
  private imp(): Expr { const l = this.or(); if (this.peek().k === '==>') { this.next(); return { t: 'bin', op: '==>', l, r: this.imp() }; } return l; }
  private or(): Expr { let l = this.and(); while (this.peek().k === '||') { this.next(); l = { t: 'bin', op: '||', l, r: this.and() }; } return l; }
  private and(): Expr { let l = this.cmp(); while (this.peek().k === '&&') { this.next(); l = { t: 'bin', op: '&&', l, r: this.cmp() }; } return l; }
  private cmp(): Expr {
    const l = this.add(); const k = this.peek().k;
    if (['==', '!=', '<', '<=', '>', '>='].includes(k)) { this.next(); return { t: 'bin', op: k as BinOp, l, r: this.add() }; }
    return l;
  }
  private add(): Expr { let l = this.mul(); while (['+', '-'].includes(this.peek().k)) { const op = this.next().k as BinOp; l = { t: 'bin', op, l, r: this.mul() }; } return l; }
  private mul(): Expr { let l = this.un(); while (['*', '/', '%'].includes(this.peek().k)) { const op = this.next().k as BinOp; l = { t: 'bin', op, l, r: this.un() }; } return l; }
  private un(): Expr { const k = this.peek().k; if (k === '-' || k === '!') { this.next(); return { t: 'un', op: k, e: this.un() }; } return this.prim(); }
  private prim(): Expr {
    const t = this.next();
    if (t.k === 'num') return { t: 'num', v: t.v as number };
    if (t.k === 'id') return { t: 'var', n: t.v as string };
    if (t.k === 'true' || t.k === 'false') return { t: 'bool', v: t.k === 'true' };
    if (t.k === '(') { const e = this.expr(); this.eat(')'); return e; }
    const f = t.k === 'eof' ? 'end' : String(t.v);
    throw new ParseError('unexpected', t.line, f, undefined, { en: `Unexpected "${t.k === 'eof' ? 'end of input' : f}" (line ${t.line + 1})`, de: `Unerwartet: „${t.k === 'eof' ? 'Ende' : f}“ (Zeile ${t.line + 1})` });
  }
  stmts(): Stmt[] { const out: Stmt[] = []; while (!['}', 'eof'].includes(this.peek().k)) out.push(this.stmt()); return out; }
  private stmt(): Stmt {
    const t = this.peek();
    if (t.k === 'if') {
      this.next();
      const c = this.expr(); this.eat('{'); const th = this.stmts(); const close = this.eat('}');
      const s: Stmt = { t: 'if', c, th, el: null, line: t.line, endLine: close.line };
      if (this.peek().k === 'else') { this.next(); this.eat('{'); s.elseLine = close.line; s.el = this.stmts(); s.endLine = this.eat('}').line; }
      return s;
    }
    const v = this.eat('id'); this.eat(':='); const e = this.expr(); this.eat(';');
    return { t: 'asg', v: v.v as string, e, line: v.line };
  }
}
export const parseExpr = (src: string): Expr => { const p = new Parser(src); const e = p.expr(); p.eat('eof'); return e; };
export const parseProg = (src: string): Stmt[] => { const p = new Parser(src); const s = p.stmts(); p.eat('eof'); return s; };

/* ---------- pretty printing ---------- */
export interface Seg { text: string; hl?: boolean; it?: boolean }
const PREC: Record<BinOp, number> = { '==>': 1, '||': 2, '&&': 3, '==': 4, '!=': 4, '<': 4, '<=': 4, '>': 4, '>=': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6 };
const SYM: Record<BinOp, string> = { '==>': '⇒', '||': '∨', '&&': '∧', '==': '=', '!=': '≠', '<=': '≤', '>=': '≥', '<': '<', '>': '>', '*': '·', '/': '/', '%': 'mod', '+': '+', '-': '−' };

/** Formula as segments; `hl` marks the most recently substituted sub-expression. */
export function show(e: Expr, min = 0): Seg[] {
  let segs: Seg[];
  let p: number;
  if (e.t === 'num') { segs = [{ text: String(e.v) }]; p = 9; }
  else if (e.t === 'var') { segs = [{ text: e.n, it: true }]; p = 9; }
  else if (e.t === 'bool') { segs = [{ text: e.v ? 'true' : 'false' }]; p = 9; }
  else if (e.t === 'un') { segs = [{ text: e.op === '-' ? '−' : '¬' }, ...show(e.e, 7)]; p = 7; }
  else {
    p = PREC[e.op];
    // operands of ⇒ are parenthesised as soon as they contain ∧/∨/⇒ (readability)
    const lmin = e.op === '==>' ? 4 : p === 4 ? p + 1 : p;
    const rmin = e.op === '==>' ? 4 : p + 1;
    segs = [...show(e.l, lmin), { text: ` ${SYM[e.op]} ` }, ...show(e.r, rmin)];
  }
  if (p < min) segs = [{ text: '(' }, ...segs, { text: ')' }];
  if (e.hl) segs = segs.map((s) => ({ ...s, hl: true }));
  return segs;
}
export const showText = (e: Expr) => show(e).map((s) => s.text).join('');

/* ---------- substitution / evaluation ---------- */
export const clean = (e: Expr): Expr => {
  const c = { ...e } as Expr & { l?: Expr; r?: Expr; e?: Expr };
  delete c.hl;
  if (c.l) c.l = clean(c.l);
  if (c.r) c.r = clean(c.r);
  if (c.e) c.e = clean(c.e);
  return c;
};
export function subst(e: Expr, v: string, r: Expr): Expr {
  if (e.t === 'var') return e.n === v ? { ...clean(r), hl: true } : e;
  if (e.t === 'un') return { ...e, e: subst(e.e, v, r) };
  if (e.t === 'bin') return { ...e, l: subst(e.l, v, r), r: subst(e.r, v, r) };
  return e;
}
export function freeVars(e: Expr, s = new Set<string>()): Set<string> {
  if (e.t === 'var') s.add(e.n);
  else if (e.t === 'un') freeVars(e.e, s);
  else if (e.t === 'bin') { freeVars(e.l, s); freeVars(e.r, s); }
  return s;
}
const divZero = () => new EvalError('divZero', { en: 'Division by 0', de: 'Division durch 0' });
export function ev(e: Expr, env: Env): Value {
  switch (e.t) {
    case 'num': return e.v;
    case 'bool': return e.v;
    case 'var':
      if (!(e.n in env)) throw new EvalError('unbound', { en: `Variable ${e.n} has no value`, de: `Variable ${e.n} hat keinen Wert` });
      return env[e.n]!;
    case 'un': return e.op === '-' ? -(ev(e.e, env) as number) : !ev(e.e, env);
  }
  const a = ev(e.l, env);
  if (e.op === '&&') return a && ev(e.r, env);
  if (e.op === '||') return a || ev(e.r, env);
  if (e.op === '==>') return !a || ev(e.r, env);
  const b = ev(e.r, env);
  const x = a as number, y = b as number;
  switch (e.op) {
    case '+': return x + y;
    case '-': return x - y;
    case '*': return x * y;
    case '/': if (y === 0) throw divZero(); return Math.trunc(x / y);
    case '%': if (y === 0) throw divZero(); return x % y;
    case '==': return a === b;
    case '!=': return a !== b;
    case '<': return x < y;
    case '<=': return x <= y;
    case '>': return x > y;
    default: return x >= y;
  }
}
export interface TraceEntry { v: string; value: number }
/** Run the program (mutates env), recording every assignment. */
export function exec(stmts: Stmt[], env: Env, trace: TraceEntry[] = []): Env {
  for (const s of stmts) {
    if (s.t === 'asg') { env[s.v] = ev(s.e, env) as number; trace.push({ v: s.v, value: env[s.v]! }); }
    else exec(ev(s.c, env) ? s.th : s.el ?? [], env, trace);
  }
  return env;
}

/* ---------- weakest precondition ---------- */
export type StepKind = 'start' | 'assign' | 'ifPost' | 'ifSplit' | 'vc';
export interface WpStep {
  kind: StepKind;
  /** program lines to highlight */
  hl: number[];
  /** annotations revealed in this step; key = line index (annotation above that line) or 'end' */
  slots: Record<string, Expr>;
  /** assign: the variable and the replacement expression */
  v?: string;
  e?: Expr;
}
const NOT = (e: Expr): Expr => ({ t: 'un', op: '!', e });
const bin = (op: BinOp, l: Expr, r: Expr): Expr => ({ t: 'bin', op, l, r });

function wpSeq(stmts: Stmt[], Q: Expr, steps: WpStep[]): Expr {
  let cur = Q;
  for (let k = stmts.length - 1; k >= 0; k--) cur = wpStmt(stmts[k]!, cur, steps);
  return cur;
}
function wpStmt(s: Stmt, Q: Expr, steps: WpStep[]): Expr {
  if (s.t === 'asg') {
    const R = subst(clean(Q), s.v, s.e);
    steps.push({ kind: 'assign', hl: [s.line], slots: { [s.line]: R }, v: s.v, e: s.e });
    return R;
  }
  const endThen = s.el ? s.elseLine! : s.endLine;
  const slots: Record<string, Expr> = { [endThen]: clean(Q) };
  if (s.el) slots[s.endLine] = clean(Q);
  steps.push({ kind: 'ifPost', hl: [endThen, s.endLine], slots });
  const T = wpSeq(s.th, Q, steps);
  const E = s.el ? wpSeq(s.el, Q, steps) : Q;
  const R = bin('&&', bin('==>', s.c, clean(T)), bin('==>', NOT(s.c), clean(E)));
  steps.push({ kind: 'ifSplit', hl: [s.line], slots: { [s.line]: { ...R, hl: true } } });
  return R;
}

export interface Analysis { stmts: Stmt[]; P: Expr; Q: Expr; W: Expr; VC: Expr; steps: WpStep[] }
/** Parse program + spec and compute the backward proof steps. Throws ParseError. */
export function analyse(src: string, pre: string, post: string): Analysis {
  const stmts = parseProg(src);
  const P = parseExpr(pre);
  const Q = parseExpr(post);
  const steps: WpStep[] = [{ kind: 'start', hl: [], slots: { end: Q } }];
  const W = wpSeq(stmts, Q, steps);
  const VC = bin('==>', P, clean(W));
  steps.push({ kind: 'vc', hl: [], slots: {} });
  return { stmts, P, Q, W, VC, steps };
}

/* ---------- mini solver ---------- */
export interface Search { vars: string[]; range: number; span: number; total: number }
const rangeFor = (n: number) => [200, 40, 12, 6, 3][Math.min(n, 5) - 1] ?? 3;
export function makeSearch(vc: Expr): Search {
  const vars = [...freeVars(vc)].sort();
  const range = rangeFor(vars.length);
  const span = 2 * range + 1;
  return { vars, range, span, total: span ** vars.length };
}
export function envAt(s: Search, k: number): Env {
  const env: Env = {};
  let r = k;
  for (const v of s.vars) { env[v] = (r % s.span) - s.range; r = Math.floor(r / s.span); }
  return env;
}
export interface Counterexample { env: Env; error?: Bi & { code: EvalError['code'] } }
/** Check one assignment; returns a counterexample if the verification condition fails (or throws). */
export function checkAt(vc: Expr, s: Search, k: number): Counterexample | null {
  const env = envAt(s, k);
  try { return ev(vc, env) ? null : { env }; }
  catch (e) { if (e instanceof EvalError) return { env, error: { ...e.msg, code: e.code } }; throw e; }
}
export interface SolveResult { search: Search; counterexample: Counterexample | null; constant?: boolean }
/** Synchronous exhaustive search over the small finite range. */
export function solve(vc: Expr): SolveResult {
  const search = makeSearch(vc);
  if (!search.vars.length) return { search, counterexample: ev(vc, {}) ? null : { env: {} }, constant: true };
  for (let k = 0; k < search.total; k++) {
    const c = checkAt(vc, search, k);
    if (c) return { search, counterexample: c };
  }
  return { search, counterexample: null };
}

/* ---------- presets ---------- */
export interface Preset {
  id: string;
  name: Bi;
  prog: string;
  pre: string;
  post: string;
  hint: Bi;
  /** The change the hint suggests; applying it must produce a counterexample. */
  bug: { prog?: string; pre?: string; post?: string };
}
export const PRESETS: Preset[] = [
  {
    id: 'chain', name: { en: 'Assignment sequence', de: 'Zuweisungsfolge' },
    prog: 'y := x + 1;\nz := y * 2;', pre: 'x >= 0', post: 'z > 0',
    hint: { en: 'Hint: set P to `x >= -1`. The solver then finds a counterexample.', de: 'Tipp: Setze P auf `x >= -1`. Der Solver findet dann ein Gegenbeispiel.' },
    bug: { pre: 'x >= -1' },
  },
  {
    id: 'abs', name: { en: 'Absolute value with if/else', de: 'Betrag mit if/else' },
    prog: 'if x < 0 {\n  y := -x;\n} else {\n  y := x;\n}', pre: 'true', post: 'y >= 0 && (y == x || y == -x)',
    hint: { en: 'Hint: change `y := -x;` to `y := x;` (edit program).', de: 'Tipp: Ändere im Programm `y := -x;` zu `y := x;` (Programm bearbeiten).' },
    bug: { prog: 'if x < 0 {\n  y := x;\n} else {\n  y := x;\n}' },
  },
  {
    id: 'swap', name: { en: 'Swap variables', de: 'Variablen tauschen' },
    prog: 't := x;\nx := y;\ny := t;', pre: 'x == a && y == b', post: 'x == b && y == a',
    hint: { en: 'Hint: introduce the classic bug `x := y; y := x;` without `t` (edit program).', de: 'Tipp: Baue den klassischen Fehler `x := y; y := x;` ohne `t` ein (Programm bearbeiten).' },
    bug: { prog: 'x := y;\ny := x;' },
  },
  {
    id: 'discount', name: { en: 'Pet-shop discount (integer)', de: 'Rabatt im Tiershop (ganzzahlig)' },
    prog: 'if amount >= 100 {\n  price := amount - amount / 10;\n} else {\n  price := amount;\n}', pre: 'amount >= 0', post: '0 <= price && price <= amount',
    hint: { en: 'Hint: set P to `true`. What happens for negative amounts?', de: 'Tipp: Setze P auf `true`. Was passiert bei negativen Beträgen?' },
    bug: { pre: 'true' },
  },
];
