import { tokenize } from '../engine/jsrun';
import { toneOf, type ReaderTone } from '../engine/outcome';
import './sim.css';

export type Lang = 'en' | 'de';

type Attrs = Record<string, string | number | boolean | EventListener | undefined>;
/** Tiny element helper: h('button', { class: 'btn', onclick: fn }, 'Run') */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...kids: (Node | string | null | undefined | false)[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
    else if (k === 'html') el.innerHTML = String(v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const KW = new Set(['function', 'return', 'if', 'else', 'for', 'while', 'let', 'const', 'var', 'new', 'throw', 'true', 'false', 'null', 'undefined', 'of', 'in', 'test', 'expect']);

/** Syntax-highlight a JS snippet into HTML (read-only views). */
export function highlightJs(src: string): string {
  let out = '';
  let toks;
  try { toks = tokenize(src); } catch { return esc(src); }
  toks.forEach((t, i) => {
    const v = esc(t.v);
    if (t.type === 'com') out += `<span class="tk-com">${v}</span>`;
    else if (t.type === 'str') out += `<span class="tk-str">${v}</span>`;
    else if (t.type === 'num') out += `<span class="tk-num">${v}</span>`;
    else if (t.type === 'id') {
      const next = toks.slice(i + 1).find((x) => x.type !== 'ws');
      out += KW.has(t.v) ? `<span class="tk-kw">${v}</span>` : next?.v === '(' ? `<span class="tk-fn">${v}</span>` : v;
    } else out += v;
  });
  return out;
}

export interface LineMark { line: number; cls: string }
/** Read-only code view with line numbers and optional per-line classes. */
export function codeView(src: string, marks: LineMark[] = [], replace?: { line: number; code: string }, label = document.documentElement.lang === 'de' ? 'Code (nur lesen)' : 'Code (read-only)'): HTMLElement {
  const lines = src.split('\n');
  const wrap = h('div', { class: 'sim-code', role: 'region', 'aria-label': label, tabindex: 0 });
  lines.forEach((l, i) => {
    const cls = marks.filter((m) => m.line === i).map((m) => m.cls).join(' ');
    if (replace && replace.line === i) {
      wrap.append(h('div', { class: `ln minus ${cls}` }, h('span', { class: 'no' }, '−'), h('span', { class: 'tx', html: highlightJs(l) })));
      wrap.append(h('div', { class: 'ln plus' }, h('span', { class: 'no' }, '+'), h('span', { class: 'tx', html: highlightJs(replace.code.split('\n')[i] ?? '') })));
    } else {
      wrap.append(h('div', { class: `ln ${cls}` }, h('span', { class: 'no' }, String(i + 1)), h('span', { class: 'tx', html: highlightJs(l) || ' ' })));
    }
  });
  return wrap;
}

/** Editable code: a CodeMirror 6 editor, loaded on demand. Falls back to a textarea. */
export async function codeEditor(parent: HTMLElement, doc: string, onChange: (s: string) => void, label: string): Promise<{ get: () => string; set: (s: string) => void; destroy: () => void }> {
  try {
    const [{ EditorView, basicSetup }, { javascript }, { HighlightStyle, syntaxHighlighting }, { tags }] = await Promise.all([
      import('codemirror'), import('@codemirror/lang-javascript'), import('@codemirror/language'), import('@lezer/highlight'),
    ]);
    // the same --syn-* colors as the static code views (sim.css); CodeMirror's default style is light-only
    const siteHighlight = HighlightStyle.define([
      { tag: [tags.keyword, tags.controlKeyword, tags.operatorKeyword, tags.definitionKeyword, tags.moduleKeyword], color: 'var(--syn-kw)', fontWeight: '600' },
      { tag: [tags.string, tags.special(tags.string), tags.regexp], color: 'var(--syn-str)' },
      { tag: [tags.number, tags.bool, tags.null, tags.atom], color: 'var(--syn-num)' },
      { tag: [tags.function(tags.variableName), tags.function(tags.propertyName), tags.typeName, tags.className], color: 'var(--syn-fn)' },
      { tag: [tags.comment, tags.lineComment, tags.blockComment], color: 'var(--syn-com)', fontStyle: 'italic' },
      { tag: tags.invalid, color: 'var(--bad)' },
    ]);
    const view = new EditorView({
      doc,
      parent,
      extensions: [
        basicSetup,
        javascript(),
        syntaxHighlighting(siteHighlight),
        EditorView.updateListener.of((u) => { if (u.docChanged) onChange(u.state.doc.toString()); }),
        EditorView.contentAttributes.of({ 'aria-label': label }),
        EditorView.theme({ '&': { fontSize: '13px' }, '.cm-scroller': { fontFamily: 'var(--font-mono)' } }),
      ],
    });
    return {
      get: () => view.state.doc.toString(),
      set: (s) => view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: s } }),
      destroy: () => view.destroy(),
    };
  } catch {
    const ta = h('textarea', { class: 'sim-textarea', 'aria-label': label, spellcheck: 'false' });
    ta.value = doc;
    ta.addEventListener('input', () => onChange(ta.value));
    parent.append(ta);
    return { get: () => ta.value, set: (s) => { ta.value = s; }, destroy: () => ta.remove() };
  }
}

export const pill = (cls: 'ok' | 'bad' | 'warn' | 'idle', text: string) => h('span', { class: `sim-pill ${cls}` }, text);

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export { rng } from '../engine/rng';

/** A segmented control (radio group). An option may carry a role tag (see `roleTag`). */
export function segmented<T extends string>(label: string, options: { value: T; label: string; tag?: Node }[], value: T, onChange: (v: T) => void): HTMLElement {
  const name = `seg-${Math.random().toString(36).slice(2)}`;
  const g = h('fieldset', { class: 'sim-seg', 'aria-labelledby': `${name}-label` }, h('legend', { id: `${name}-label`, class: 'small muted' }, label));
  for (const o of options) {
    const id = `${name}-${o.value}`;
    const input = h('input', { type: 'radio', name, id, value: o.value, checked: o.value === value, onchange: () => onChange(o.value) });
    g.append(input, h('label', { for: id }, o.label, o.tag ? ' ' : null, o.tag));
  }
  return g;
}

/* ───────────────────────── Role tags and the result panel ─────────────────────────
 *
 * Shared pattern for every simulator. Reference implementation: `src/sim/ui/pbt.ts`
 * with `pbtOutcome` / `fastCheckReport` in `src/sim/engine/pbt.ts`.
 *
 * 1. ROLE TAGS (before the run). Every option that changes the outcome shows what it IS,
 *    not what will happen: `roleTag('bug', lang)`, `roleTag('correct', lang)`,
 *    `roleTag('weak', lang)` … Pass the tag as `tag` to `segmented(...)`, or append it to a
 *    button or card title. Kinds and texts: `TAGS` below. `tone` decides the outline colour;
 *    the text always says the role, so colour is never the only signal.
 *
 * 2. ENGINE OUTCOME (logic). The engine exports a pure function that returns
 *    `Outcome` from `src/sim/engine/outcome.ts`: `{ status, causeId, values }`.
 *    It decides the verdict, classifies the cause and returns the numbers behind it
 *    (e.g. the minimal counterexample). It also exports a formatter for the tool output
 *    the agent would see (e.g. `fastCheckReport`). Both have unit tests in `tests/unit/`.
 *
 * 3. RESULT PANEL (rendering). Create once, show after every run:
 *
 *      const panel = resultPanel(lang);          // panel.el goes into the simulator
 *      panel.show({
 *        status: o.status,                       // 'pass' | 'fail' | 'warn': the tool's verdict
 *        tone: o.tone,                           // optional learner tone (see ReaderTone) → colour and icon ✓ → ! ✗
 *        verdict: '✗-less verdict with counts',  // e.g. 'The property fails after 3 of 200 carts'
 *        why: ['One or two plain sentences.', …], // from causeId + values; `code`, **bold** allowed
 *        agent: { tool: 'fast-check', output: fastCheckReport(r), use: 'What the agent can do with it.' },
 *        next: 'One suggestion what to try.',
 *      });
 *      panel.clear();                            // hide when an option changes
 *
 *    All text comes from the simulator's own `T = { en, de }` table, keyed by `causeId`.
 *    The panel is a plain region with a heading (h3) and three sections
 *    (h4: Why / What the agent gets / Next). Only the verdict line is announced: a separate,
 *    visually hidden `role="status"` node next to the panel, updated when the verdict changes.
 *    `held: true` marks a pass that holds for the sample tried, not for all inputs (outline icon).
 *    `agent.against` names the implementation the tool output ran against. It has the classes `sim-callout ok|bad|warn`,
 *    so older selectors such as `.sim-callout.bad` keep working. The class follows the tone:
 *    red (`bad`) only for a learner mistake; a found bug or a counterexample is the goal, so `ok`.
 */

export type TagKind = 'bug' | 'correct' | 'weak' | 'strong' | 'gate' | 'nogate' | 'blind' | 'guided'
  | 'breaking' | 'compatible' | 'valid' | 'invalid' | 'cheat' | 'fix' | 'true' | 'false' | 'unprovable';

export const TAGS: Record<TagKind, { en: string; de: string; tone: 'neg' | 'pos' }> = {
  bug: { en: 'bug', de: 'Bug', tone: 'neg' },
  correct: { en: 'correct', de: 'korrekt', tone: 'pos' },
  weak: { en: 'weak tests', de: 'schwache Tests', tone: 'neg' },
  strong: { en: 'strong tests', de: 'starke Tests', tone: 'pos' },
  gate: { en: 'gate', de: 'Gate', tone: 'pos' },
  nogate: { en: 'no gate', de: 'kein Gate', tone: 'neg' },
  blind: { en: 'no feedback', de: 'ohne Feedback', tone: 'neg' },
  guided: { en: 'coverage feedback', de: 'Coverage-Feedback', tone: 'pos' },
  breaking: { en: 'breaking', de: 'Breaking', tone: 'neg' },
  compatible: { en: 'compatible', de: 'kompatibel', tone: 'pos' },
  valid: { en: 'valid input', de: 'gültige Eingabe', tone: 'pos' },
  invalid: { en: 'invalid input', de: 'ungültige Eingabe', tone: 'neg' },
  cheat: { en: 'cheat', de: 'Schummelei', tone: 'neg' },
  fix: { en: 'real fix', de: 'echter Fix', tone: 'pos' },
  true: { en: 'true claim', de: 'wahre Aussage', tone: 'pos' },
  false: { en: 'false claim', de: 'falsche Aussage', tone: 'neg' },
  unprovable: { en: 'correct, not provable', de: 'korrekt, nicht beweisbar', tone: 'neg' },
};

/** A small tag that names the role of an option: "bug", "correct", "weak tests" … */
export function roleTag(kind: TagKind, lang: Lang): HTMLElement {
  return h('span', { class: `sim-tag ${TAGS[kind].tone}`, 'data-tag': kind }, TAGS[kind][lang]);
}

export interface ResultView {
  status: 'pass' | 'fail' | 'warn';
  /** The learner's tone; defaults from `status` (pass → ok, warn → warn, fail → bad). */
  tone?: ReaderTone;
  /** Verdict with counts, without icon: "The property fails after 3 of 200 carts". */
  verdict: string;
  /** One or two sentences (array = separate paragraphs). Supports `code`, **bold**, *italic*. */
  why: string | string[];
  /** The feedback the real tool gives an agent in a coding loop; `against` names the code it ran on. */
  agent?: { tool: string; output: string; use: string; against?: string };
  /** A pass that holds for the inputs tried, not a proof: drawn with an outline icon instead of a filled one. */
  held?: boolean;
  /** One suggestion what to try next. */
  next?: string;
}

const RESULT_COPY = {
  en: { why: 'Why', agent: 'What the agent gets', next: 'Next', example: (tool: string) => `Example of the ${tool} output format`, against: 'Run against', out: 'Tool output' },
  de: { why: 'Warum', agent: 'Was der Agent bekommt', next: 'Als Nächstes', example: (tool: string) => `Beispiel für das Ausgabeformat von ${tool}`, against: 'Lauf gegen', out: 'Tool-Ausgabe' },
};
const ICON: Record<ReaderTone, string> = { ok: '✓', progress: '→', warn: '!', bad: '✗' };

/** The shared result panel. See the comment block above. */
export function resultPanel(lang: Lang): { el: HTMLElement; show: (v: ResultView) => void; clear: () => void } {
  const c = RESULT_COPY[lang];
  const id = `res-${Math.random().toString(36).slice(2)}`;
  const el = h('div', { class: 'sim-result sim-callout', role: 'region', 'aria-labelledby': id, hidden: true });
  // only the verdict is announced, not the whole panel with its tool output; inserted next to the
  // panel on first use, and filled a tick later so screen readers see the region before its text
  const live = h('div', { class: 'visually-hidden', role: 'status' });
  const announce = (text: string) => {
    if (!live.isConnected) el.after(live);
    if (live.textContent === text) return;
    setTimeout(() => { live.textContent = text; }, 50);
  };
  const section = (title: string, ...kids: (Node | string)[]) => h('div', { class: 'sim-result-sec' }, h('h4', {}, title), ...kids);
  return {
    el,
    show(v) {
      const tone = toneOf(v);
      const kids: Node[] = [h('h3', { id, class: 'sim-result-verdict' }, h('span', { class: 'sim-result-icon', 'aria-hidden': 'true' }, ICON[tone]), h('span', {}, ...rich(v.verdict)))];
      kids.push(section(c.why, ...(Array.isArray(v.why) ? v.why : [v.why]).map((p) => h('p', {}, ...rich(p)))));
      if (v.agent) {
        kids.push(section(c.agent,
          h('p', { class: 'sim-result-src' }, c.example(v.agent.tool), v.agent.against ? h('span', { class: 'sim-result-against' }, `${c.against}: `, h('b', {}, v.agent.against)) : null),
          h('pre', { class: 'sim-result-out', tabindex: 0, 'aria-label': `${c.out}: ${v.agent.tool}` }, v.agent.output),
          h('p', {}, ...rich(v.agent.use))));
      }
      if (v.next) kids.push(section(c.next, h('p', {}, ...rich(v.next))));
      el.className = `sim-result sim-callout ${tone}${v.held ? ' held' : ''}`;
      el.setAttribute('data-status', v.status);
      el.setAttribute('data-tone', tone);
      el.replaceChildren(...kids);
      el.hidden = false;
      announce(v.verdict.replace(/\*\*|`/g, ''));
    },
    clear() { el.hidden = true; el.replaceChildren(); el.removeAttribute('data-status'); el.removeAttribute('data-tone'); },
  };
}

export function card(title: string, ...kids: (Node | string)[]): HTMLElement {
  return h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, title), ...kids);
}

/** Generic keyword/number/comment highlighter for non-JS listings (Dafny, Lean, wp pseudo-code). Returns HTML. */
export function highlight(src: string, kws: Set<string>, comment = '//'): string {
  const ci = src.indexOf(comment);
  const code = ci >= 0 ? src.slice(0, ci) : src;
  let out = '';
  for (const m of code.matchAll(/(\b\d+\b)|([A-Za-z_][\w.']*)|([\s\S])/g)) {
    if (m[1]) out += `<span class="tk-num">${m[1]}</span>`;
    else if (m[2]) out += kws.has(m[2]) || m[2] === '#eval' ? `<span class="tk-kw">${m[2]}</span>` : esc(m[2]);
    else out += esc(m[3]!);
  }
  if (ci >= 0) out += `<span class="tk-com">${esc(src.slice(ci))}</span>`;
  return out || ' ';
}

export interface CodeRow { no?: string | number; html?: string; node?: Node; cls?: string; attrs?: Attrs }
/** Read-only listing built from prepared rows (line number gutter + html or node content). */
export function codeRows(rows: CodeRow[], label = 'code'): HTMLElement {
  const wrap = h('div', { class: 'sim-code', role: 'region', 'aria-label': label, tabindex: 0 });
  for (const r of rows) {
    const tx = h('span', { class: 'tx', html: r.node ? undefined : r.html ?? ' ' }, r.node);
    wrap.append(h('div', { class: `ln ${r.cls ?? ''}`, ...r.attrs }, h('span', { class: 'no' }, r.no === undefined ? '' : String(r.no)), tx));
  }
  return wrap;
}

/** Minimal inline markup for bilingual strings: `code`, **bold**, *italic*. Never uses innerHTML. */
export function rich(text: string): (Node | string)[] {
  const out: (Node | string)[] = [];
  for (const part of text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/)) {
    if (!part) continue;
    if (part.startsWith('`')) out.push(h('code', {}, part.slice(1, -1)));
    else if (part.startsWith('**')) out.push(h('strong', {}, part.slice(2, -2)));
    else if (part.startsWith('*') && part.length > 2) out.push(h('em', {}, part.slice(1, -1)));
    else out.push(part);
  }
  return out;
}
