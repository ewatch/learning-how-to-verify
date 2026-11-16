import { tokenize } from '../engine/jsrun';
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
export function codeView(src: string, marks: LineMark[] = [], replace?: { line: number; code: string }): HTMLElement {
  const lines = src.split('\n');
  const wrap = h('div', { class: 'sim-code', role: 'region', 'aria-label': 'code', tabindex: 0 });
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
    const [{ EditorView, basicSetup }, { javascript }] = await Promise.all([import('codemirror'), import('@codemirror/lang-javascript')]);
    const view = new EditorView({
      doc,
      parent,
      extensions: [
        basicSetup,
        javascript(),
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

/** A segmented control (radio group) */
export function segmented<T extends string>(label: string, options: { value: T; label: string }[], value: T, onChange: (v: T) => void): HTMLElement {
  const name = `seg-${Math.random().toString(36).slice(2)}`;
  const g = h('fieldset', { class: 'sim-seg' }, h('legend', { class: 'visually-hidden' }, label));
  for (const o of options) {
    const id = `${name}-${o.value}`;
    const input = h('input', { type: 'radio', name, id, value: o.value, checked: o.value === value, onchange: () => onChange(o.value) });
    g.append(input, h('label', { for: id }, o.label));
  }
  return g;
}

export function card(title: string, ...kids: (Node | string)[]): HTMLElement {
  return h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, title), ...kids);
}
