// Loop-invariant proof obligations (Dafny style) for Max(a), checked exhaustively over small arrays.
// This is a finite check, not a symbolic proof. Pure logic, no DOM.
import type { Bi } from './i18n';

export const BASE: string[] = [
  'method Max(a: array<int>) returns (m: int)',
  '  requires a.Length > 0',
  '  ensures forall k :: 0 <= k < a.Length ==> a[k] <= m',
  '  ensures exists k :: 0 <= k < a.Length && a[k] == m',
  '{',
  '  m := a[0];',
  '  var i := 1;',
  '  while i < a.Length',
  '    invariant 1 <= i <= a.Length',
  '    invariant forall k :: 0 <= k < i ==> a[k] <= m',
  '    invariant exists k :: 0 <= k < i && a[k] == m',
  '    decreases a.Length - i',
  '  {',
  '    if a[i] > m { m := a[i]; }',
  '    i := i + 1;',
  '  }',
  '}',
];

export type Arr = number[];
export type ObligationKey = 'init' | 'keep' | 'exit' | 'term';
export const OBLIGATION_KEYS: ObligationKey[] = ['init', 'keep', 'exit', 'term'];
export const OBLIGATIONS: { key: ObligationKey; title: Bi; what: Bi }[] = [
  { key: 'init', title: { en: '1 · Initialisation', de: '1 · Initialisierung' }, what: { en: 'requires ⇒ invariant holds on loop entry', de: 'requires ⇒ Invariante gilt beim Eintritt in die Schleife' } },
  { key: 'keep', title: { en: '2 · Preservation', de: '2 · Erhaltung' }, what: { en: 'invariant ∧ condition ⇒ invariant holds after the body', de: 'Invariante ∧ Bedingung ⇒ Invariante gilt nach dem Rumpf' } },
  { key: 'exit', title: { en: '3 · Exit', de: '3 · Abschluss' }, what: { en: 'invariant ∧ ¬condition ⇒ ensures', de: 'Invariante ∧ ¬Bedingung ⇒ ensures' } },
  { key: 'term', title: { en: '4 · Termination', de: '4 · Terminierung' }, what: { en: 'decreases expression ≥ 0 and shrinks on every iteration', de: 'decreases-Ausdruck ≥ 0 und wird in jedem Durchlauf kleiner' } },
];

class OutOfBounds extends Error { constructor(public index: number, public length: number) { super(`index ${index} out of bounds`); } }
const get = (a: Arr, i: number) => { if (i < 0 || i >= a.length) throw new OutOfBounds(i, a.length); return a[i]!; };

interface Inv { line: number; f: (a: Arr, i: number, m: number) => boolean }
const INV1: Inv = { line: 8, f: (a, i) => 1 <= i && i <= a.length };
const INV2: Inv = { line: 9, f: (a, i, m) => a.slice(0, Math.max(0, i)).every((x) => x <= m) };
const INV3: Inv = { line: 10, f: (a, i, m) => a.slice(0, Math.max(0, i)).some((x) => x === m) };
const POSTS = [{ line: 2, f: (a: Arr, m: number) => a.every((x) => x <= m) }, { line: 3, f: (a: Arr, m: number) => a.some((x) => x === m) }];

export interface Variant {
  id: string;
  name: Bi;
  /** Description; `code` and **bold** markup. */
  desc: Bi;
  lines: string[];
  /** changed line indices (shown wavy-underlined) */
  changed: number[];
  /** the invariant line was removed from the listing */
  removedInvariant?: boolean;
  /** maps base line numbers to this variant's line numbers */
  lineMap: (n: number) => number;
  /** obligations that must fail (empty = all four are proven) */
  expectFail: ObligationKey[];
  init: (a: Arr) => { m: number; i: number };
  guard: (a: Arr, i: number) => boolean;
  body: (a: Arr, i: number, m: number) => { i: number; m: number };
  invs: Inv[];
  dec: (a: Arr, i: number) => number;
}
const same = (n: number) => n;
const STD = {
  lineMap: same,
  init: (a: Arr) => ({ m: get(a, 0), i: 1 }),
  guard: (a: Arr, i: number) => i < a.length,
  body: (a: Arr, i: number, m: number) => ({ i: i + 1, m: get(a, i) > m ? get(a, i) : m }),
  invs: [INV1, INV2, INV3],
  dec: (a: Arr, i: number) => a.length - i,
};
const withLine = (n: number, text: string) => BASE.map((l, i) => (i === n ? text : l));

export const VARIANTS: Variant[] = [
  { id: 'correct', name: { en: '✓ Correct', de: '✓ Korrekt' }, desc: { en: 'The original version. All four obligations hold, so the method is proven.', de: 'Die Originalversion. Alle vier Verpflichtungen gelten, also ist die Methode bewiesen.' }, lines: BASE, changed: [], expectFail: [], ...STD },
  {
    id: 'offbyone', name: { en: 'Off-by-one in the loop', de: 'Off-by-one in der Schleife' },
    desc: { en: '`while i < a.Length - 1`: the last element is never looked at. The error shows up in the **Exit** obligation.', de: '`while i < a.Length - 1`: Das letzte Element wird nie betrachtet. Der Fehler zeigt sich bei der Verpflichtung **Abschluss**.' },
    lines: withLine(7, '  while i < a.Length - 1'), changed: [7], expectFail: ['exit'], ...STD, guard: (a, i) => i < a.length - 1,
  },
  {
    id: 'init', name: { en: 'Wrong initialisation', de: 'Falsche Initialisierung' },
    desc: { en: '`m := 0` instead of `m := a[0]`. This fails for arrays that contain only negative or only positive numbers. The **Initialisation** obligation breaks.', de: '`m := 0` statt `m := a[0]`. Das schlägt bei Arrays fehl, die nur negative oder nur positive Zahlen enthalten. Die Verpflichtung **Initialisierung** bricht.' },
    lines: withLine(5, '  m := 0;'), changed: [5], expectFail: ['init'], ...STD, init: () => ({ m: 0, i: 1 }),
  },
  {
    id: 'compare', name: { en: 'Wrong comparison', de: 'Falscher Vergleich' },
    desc: { en: '`a[i] < m` instead of `>`. The body destroys the invariant, so **Preservation** fails.', de: '`a[i] < m` statt `>`. Der Rumpf zerstört die Invariante, die Verpflichtung **Erhaltung** schlägt fehl.' },
    lines: withLine(13, '    if a[i] < m { m := a[i]; }'), changed: [13], expectFail: ['keep'], ...STD,
    body: (a, i, m) => ({ i: i + 1, m: get(a, i) < m ? get(a, i) : m }),
  },
  {
    id: 'noincr', name: { en: 'Forgotten increment', de: 'Inkrement vergessen' },
    desc: { en: '`i := i + 1` is missing. The loop **does not terminate** (obligation 4). Also `m` can be replaced by `a[i]` although `i` does not advance, which breaks the `exists` invariant, so **Preservation** fails as well.', de: '`i := i + 1` fehlt. Die Schleife **terminiert nicht** (Verpflichtung 4). Außerdem kann `m` durch `a[i]` ersetzt werden, obwohl `i` nicht weiterläuft. Dadurch bricht auch die `exists`-Invariante, also schlägt auch **Erhaltung** fehl.' },
    lines: withLine(14, '    // i := i + 1;   (forgotten!)'), changed: [14], expectFail: ['keep', 'term'], ...STD,
    body: (a, i, m) => ({ i, m: get(a, i) > m ? get(a, i) : m }),
  },
  {
    id: 'weak', name: { en: 'Invariant too weak', de: 'Invariante zu schwach' },
    desc: { en: 'The **code is correct**, but the `forall` invariant is missing. After the loop the verifier does not know that `m` is the maximum, so the method is **not provable** (Exit fails). This is where the real work of verification lies.', de: 'Der **Code ist korrekt**, aber die `forall`-Invariante fehlt. Nach der Schleife weiß der Verifizierer nicht, dass `m` das Maximum ist, deshalb ist die Methode **nicht beweisbar** (Abschluss schlägt fehl). Genau hier steckt die eigentliche Arbeit bei der Verifikation.' },
    lines: BASE.filter((_, i) => i !== 9), changed: [], removedInvariant: true, expectFail: ['exit'], ...STD,
    invs: [INV1, INV3], lineMap: (n) => (n > 9 ? n - 1 : n),
  },
  {
    id: 'geq', name: { en: '≥ instead of >', de: '≥ statt >' },
    desc: { en: '`a[i] >= m`: this changes the behaviour for equal values but is still correct. The proof succeeds.', de: '`a[i] >= m`: Das ändert das Verhalten bei gleichen Werten, ist aber weiterhin korrekt. Der Beweis gelingt.' },
    lines: withLine(13, '    if a[i] >= m { m := a[i]; }'), changed: [13], expectFail: [], ...STD,
    body: (a, i, m) => ({ i: i + 1, m: get(a, i) >= m ? get(a, i) : m }),
  },
];

/* ---------- state spaces ---------- */
export type State = [Arr, number, number];
let arraysCache: Arr[] | undefined;
let statesCache: State[] | undefined;
/** All arrays of length 1..4 over {-2..2}. */
export function arrays(): Arr[] {
  if (arraysCache) return arraysCache;
  const out: Arr[] = [];
  const vals = [-2, -1, 0, 1, 2];
  const rec = (cur: Arr, n: number) => {
    if (cur.length === n) { out.push(cur.slice()); return; }
    for (const v of vals) { cur.push(v); rec(cur, n); cur.pop(); }
  };
  for (let n = 1; n <= 4; n++) rec([], n);
  return (arraysCache = out);
}
/** All (a, i, m) loop states. */
export function states(): State[] {
  if (statesCache) return statesCache;
  const out: State[] = [];
  for (const a of arrays()) for (let i = -1; i <= a.length + 1; i++) for (let m = -3; m <= 3; m++) out.push([a, i, m]);
  return (statesCache = out);
}
export const spaceFor = (key: ObligationKey): (Arr | State)[] => (key === 'init' ? arrays() : states());

/* ---------- checking ---------- */
export type FailureCode = 'init-inv' | 'oob' | 'keep-inv' | 'exit-post' | 'term-neg' | 'term-nodec';
export interface Failure {
  code: FailureCode;
  /** line in this variant's listing */
  line: number;
  a: Arr;
  i?: number;
  m?: number;
  /** state after init / after the body */
  after?: { i: number; m: number };
  /** decreases values before/after (term-nodec) */
  d0?: number;
  d1?: number;
  /** out-of-bounds index */
  index?: number;
}

/**
 * Check one obligation on one state.
 * Returns undefined when the state is irrelevant (precondition of the obligation not met),
 * null when it passes, or a failure.
 */
export function checkState(v: Variant, key: ObligationKey, s: Arr | State): Failure | null | undefined {
  const ln = v.lineMap;
  const invBroken = (a: Arr, i: number, m: number) => v.invs.find((x) => !x.f(a, i, m));
  if (key === 'init') {
    const a = s as Arr;
    let st;
    try { st = v.init(a); } catch (e) { if (e instanceof OutOfBounds) return { code: 'oob', line: ln(5), a, index: e.index }; throw e; }
    const bad = invBroken(a, st.i, st.m);
    return bad ? { code: 'init-inv', line: ln(bad.line), a, after: st } : null;
  }
  const [a, i, m] = s as State;
  if (invBroken(a, i, m)) return undefined;
  const g = v.guard(a, i);
  if (key === 'exit') {
    if (g) return undefined;
    const bad = POSTS.find((p) => !p.f(a, m));
    return bad ? { code: 'exit-post', line: ln(bad.line), a, i, m } : null;
  }
  if (!g) return undefined;
  let r;
  try { r = v.body(a, i, m); } catch (e) { if (e instanceof OutOfBounds) return { code: 'oob', line: ln(13), a, i, m, index: e.index }; throw e; }
  if (key === 'keep') {
    const bad = invBroken(a, r.i, r.m);
    return bad ? { code: 'keep-inv', line: ln(bad.line), a, i, m, after: r } : null;
  }
  const d0 = v.dec(a, i), d1 = v.dec(a, r.i);
  if (d0 < 0) return { code: 'term-neg', line: ln(11), a, i, m, d0 };
  if (!(d1 < d0)) return { code: 'term-nodec', line: ln(11), a, i, m, d0, d1 };
  return null;
}

export interface ObligationResult { key: ObligationKey; checked: number; failure: Failure | null }
/** Run one obligation over its whole state space; stops at the first failure. */
export function runObligation(v: Variant, key: ObligationKey): ObligationResult {
  let checked = 0;
  for (const s of spaceFor(key)) {
    const r = checkState(v, key, s);
    if (r === undefined) continue;
    checked++;
    if (r) return { key, checked, failure: r };
  }
  return { key, checked, failure: null };
}
export const verify = (v: Variant): ObligationResult[] => OBLIGATION_KEYS.map((k) => runObligation(v, k));

/** Listing lines (this variant's numbering) worth highlighting while an obligation is checked. */
export function linesFor(v: Variant, key: ObligationKey): number[] {
  const base: Record<ObligationKey, number[]> = { init: [5, 6, 8, 9, 10], keep: [8, 9, 10, 12, 13, 14, 15], exit: [2, 3, 7, 8, 9, 10], term: [11, 13, 14] };
  return [...new Set(base[key].map(v.lineMap))];
}
