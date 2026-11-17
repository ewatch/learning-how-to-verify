/**
 * A toy coverage-guided fuzzer and a blind fuzzer, both attacking the petstore's
 * search parser. The parser compares keywords character by character, and each
 * matched character is a new branch, so coverage guidance can "learn" its way in.
 */
import { rng } from './rng';
import type { Outcome } from './outcome';

export class SearchSyntaxError extends Error {}

/** The parser as shown to the reader. */
export const PARSER_SOURCE = `// Parses queries like:  flat -category:fish price<50
function parseSearch(query) {
  const filters = [];
  for (const raw of query.split(" ")) {
    if (raw === "") continue;
    const neg = raw.startsWith("-");
    const tok = neg ? raw.slice(1) : raw;
    if (tok.startsWith("category:")) {
      filters.push({ neg, field: "category", value: tok.slice(9) });
    } else if (tok.startsWith("price")) {
      const op = tok[5];
      if (op !== "<" && op !== ">") throw new SearchSyntaxError("bad operator");
      let rest = tok.slice(6);
      if (rest.includes("%")) rest = decodeURIComponent(rest); // BUG: "%" alone throws URIError
      const n = Number(rest);
      if (!Number.isFinite(n)) throw new SearchSyntaxError("bad number");
      filters.push({ neg, field: "price", op, value: n });
    } else {
      filters.push({ neg, field: "text", value: tok });
    }
  }
  return filters;
}`;

/** Same logic, instrumented: every branch and every matched keyword character reports a hit. */
export function parseSearch(query: string, hit: (id: string) => void) {
  const filters: unknown[] = [];
  const prefix = (tok: string, kw: string, tag: string) => {
    for (let i = 0; i < kw.length; i++) { if (tok[i] !== kw[i]) return false; hit(`${tag}${i}`); }
    return true;
  };
  for (const raw of query.split(' ')) {
    if (raw === '') { hit('empty'); continue; }
    const neg = raw.startsWith('-');
    hit(neg ? 'neg' : 'pos');
    const tok = neg ? raw.slice(1) : raw;
    if (prefix(tok, 'category:', 'c')) { hit('cat'); filters.push({ neg, field: 'category', value: tok.slice(9) }); }
    else if (prefix(tok, 'price', 'p')) {
      const op = tok[5];
      if (op !== '<' && op !== '>') { hit('badop'); throw new SearchSyntaxError('bad operator'); }
      hit(op === '<' ? 'lt' : 'gt');
      let rest = tok.slice(6);
      if (rest.includes('%')) { hit('pct'); rest = decodeURIComponent(rest); }
      const n = Number(rest);
      if (!Number.isFinite(n)) { hit('badnum'); throw new SearchSyntaxError('bad number'); }
      hit('num');
      filters.push({ neg, field: 'price', op, value: n });
    } else { hit('text'); filters.push({ neg, field: 'text', value: tok }); }
  }
  return filters;
}

export const TOTAL_BRANCHES = 9 + 5 + ['empty', 'neg', 'pos', 'cat', 'badop', 'lt', 'gt', 'pct', 'badnum', 'num', 'text'].length;

export type Exec = { cov: Set<string>; crash: Error | null };
export function execute(input: string): Exec {
  const cov = new Set<string>();
  try { parseSearch(input, (id) => cov.add(id)); return { cov, crash: null }; } catch (e) {
    return { cov, crash: e instanceof SearchSyntaxError ? null : (e as Error) };
  }
}

const PRINTABLE = ' abcdefghijklmnopqrstuvwxyz0123456789-:<>%.ABCXYZ!"#&()*+,/;=?@[]^_{}|~';
export const DICTIONARY = ['price', 'category:', '<', '>', '%', '-'];

export interface FuzzState {
  mode: 'guided' | 'blind';
  useDict: boolean;
  r: () => number;
  corpus: string[];
  seen: Set<string>;
  iterations: number;
  history: { it: number; cov: number }[];
  crash: null | { input: string; error: string; at: number; minimal: string };
}

export function createFuzzer(mode: 'guided' | 'blind', seed: number, useDict = false, seeds = ['flat -category:fish']): FuzzState {
  const st: FuzzState = { mode, useDict, r: rng(seed), corpus: [...seeds], seen: new Set(), iterations: 0, history: [], crash: null };
  for (const s of seeds) execute(s).cov.forEach((c) => st.seen.add(c));
  st.history.push({ it: 0, cov: st.seen.size });
  return st;
}

function mutate(st: FuzzState, input: string): string {
  const r = st.r;
  let s = input;
  const n = 1 + Math.floor(r() * 3);
  for (let k = 0; k < n; k++) {
    const pos = Math.floor(r() * (s.length + 1));
    const op = r();
    const ch = PRINTABLE[Math.floor(r() * PRINTABLE.length)];
    if (st.useDict && op < 0.15) { const w = DICTIONARY[Math.floor(r() * DICTIONARY.length)]; s = s.slice(0, pos) + w + s.slice(pos); }
    else if (op < 0.45) s = s.slice(0, pos) + ch + s.slice(pos);
    else if (op < 0.7 && s.length) s = s.slice(0, pos) + s.slice(pos + 1);
    else if (s.length) s = s.slice(0, pos) + ch + s.slice(pos + 1);
    else s = ch;
  }
  return s.slice(0, 40);
}

/** Remove characters while the input still crashes. */
export function minimize(input: string): string {
  let cur = input;
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < cur.length; i++) {
      const cand = cur.slice(0, i) + cur.slice(i + 1);
      if (execute(cand).crash) { cur = cand; changed = true; break; }
    }
  }
  return cur;
}

/** Run `n` iterations; returns true if a crash was found. */
export function step(st: FuzzState, n: number): boolean {
  for (let i = 0; i < n && !st.crash; i++) {
    st.iterations++;
    const base = st.mode === 'guided' ? st.corpus[Math.floor(st.r() * st.corpus.length)] : st.corpus[0];
    const input = mutate(st, base);
    const ex = execute(input);
    if (ex.crash) { st.crash = { input, error: `${ex.crash.name}: ${ex.crash.message}`, at: st.iterations, minimal: minimize(input) }; }
    let fresh = false;
    ex.cov.forEach((c) => { if (!st.seen.has(c)) { st.seen.add(c); fresh = true; } });
    if (fresh && st.mode === 'guided') st.corpus.push(input);
  }
  st.history.push({ it: st.iterations, cov: st.seen.size });
  return Boolean(st.crash);
}

/* ───── Outcome for the result panel (see src/sim/ui/kit.ts) ───── */

export type FuzzCause = 'guided-only' | 'blind-only' | 'both' | 'none';
export interface FuzzSide { iterations: number; branches: number; corpus: number; crashAt: number | null }
export interface FuzzValues {
  total: number;
  blind: FuzzSide;
  guided: FuzzSide;
  dictionary: boolean;
  /** the first crash found (guided first, as it is the one the tool would report) */
  crash?: { by: 'guided' | 'blind'; input: string; minimal: string; error: string; errorName: string; at: number };
  /** line in PARSER_SOURCE (1-based) that throws */
  line: number;
}
export type FuzzOutcome = Outcome<FuzzCause, FuzzValues>;

/** Line of the bug in the parser as shown (1-based). */
export const BUG_LINE = PARSER_SOURCE.split('\n').findIndex((l) => l.includes('decodeURIComponent')) + 1;

const side = (s: FuzzState): FuzzSide => ({ iterations: s.iterations, branches: s.seen.size, corpus: s.corpus.length, crashAt: s.crash?.at ?? null });

/** Verdict, cause and numbers after both fuzzers stopped. Pure. */
export function fuzzOutcome(blind: FuzzState, guided: FuzzState): FuzzOutcome {
  const values: FuzzValues = { total: TOTAL_BRANCHES, blind: side(blind), guided: side(guided), dictionary: guided.useDict, line: BUG_LINE };
  const src = guided.crash ? { by: 'guided' as const, c: guided.crash } : blind.crash ? { by: 'blind' as const, c: blind.crash } : null;
  // the shown parser has a known bug, so "no crash" is a warning, not a pass
  if (!src) return { status: 'warn', causeId: 'none', values };
  const crash = { by: src.by, input: src.c.input, minimal: src.c.minimal, error: src.c.error, errorName: src.c.error.split(':')[0], at: src.c.at };
  const causeId: FuzzCause = guided.crash && blind.crash ? 'both' : guided.crash ? 'guided-only' : 'blind-only';
  return { status: 'fail', causeId, values: { ...values, crash } };
}

/** A crash report in the format of Jazzer.js (libFuzzer based). */
export function jazzerReport(o: FuzzOutcome): string {
  const c = o.values.crash;
  if (!c) return `#${o.values.guided.iterations}\tDONE   cov: ${o.values.guided.branches} corp: ${o.values.guided.corpus}\nDone ${o.values.guided.iterations} runs: no crash found`;
  const msg = c.error.slice(c.errorName.length + 2);
  return [
    `==fuzz== Uncaught Exception: ${c.errorName}: ${msg}`,
    `    at decodeURIComponent (<anonymous>)`,
    `    at parseSearch (search.js:${o.values.line})`,
    `MS: crash after ${c.at} runs`,
    `Crashing input: ${JSON.stringify(c.input)}`,
    `Minimized input: ${JSON.stringify(c.minimal)}`,
    `Test unit written to ./crash-${hash(c.minimal)}`,
  ].join('\n');
}

/** Small stable hex id for the crash file name (FNV-1a). */
function hash(s: string): string {
  let x = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 0x01000193) >>> 0; }
  return x.toString(16).padStart(8, '0');
}
