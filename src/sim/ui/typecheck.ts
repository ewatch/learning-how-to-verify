import { h, codeView, segmented, type Lang } from './kit';
import { TYPE_REVISIONS, TYPECHECK_COPY as T, type TypeRevision } from '../../data/typecheck';
import type { TypecheckResult } from '../engine/typecheck';

export function mount(root: HTMLElement, lang: Lang) {
  let revision: TypeRevision = 'unchecked';
  let strict = true;
  let worker: Worker | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const code = h('div');
  const output = h('div', { 'aria-live': 'polite', 'aria-atomic': 'true', 'data-typecheck-output': '' });
  const run = h('button', { type: 'button', class: 'btn', onclick: check }, T.run[lang]);
  const current = () => TYPE_REVISIONS.find((r) => r.id === revision)!;

  function stop() {
    worker?.terminate();
    worker = undefined;
    clearTimeout(timer);
    run.disabled = false;
    run.textContent = T.run[lang];
  }
  function reset() {
    stop();
    code.replaceChildren(codeView(current().code));
    output.replaceChildren(h('p', { class: 'muted small' }, T.ready[lang]));
  }
  function fail() {
    stop();
    output.replaceChildren(h('p', { class: 'sim-callout bad' }, T.failed[lang]));
  }
  function render(result: TypecheckResult) {
    const blocked = result.diagnostics.length > 0;
    output.replaceChildren(h('p', { class: `sim-callout ${blocked ? 'bad' : 'ok'}` }, blocked ? T.blocked[lang] : T.passed[lang]));
    if (blocked) {
      const diagnostics = result.diagnostics.map((d) => `reserve.ts(${d.line},${d.column}): error TS${d.code}: ${d.message}`).join('\n');
      output.append(h('pre', { tabindex: 0 }, diagnostics));
    } else {
      output.append(h('ul', { class: 'sim-log' }, ...result.checks.map((c) =>
        h('li', { class: c.pass ? 'ok' : 'bad' }, `${c.pass ? 'PASS' : 'FAIL'} ${T.checks[c.id][lang]}\n  ${c.got}`))));
    }
    output.append(h('div', { class: 'sim-callout', style: 'margin-top:12px' }, h('strong', {}, T.next[lang]),
      h('p', {}, revision === 'unchecked' && !strict ? T.off[lang] : current().lesson[lang])));
  }
  function check() {
    stop();
    run.disabled = true;
    run.textContent = T.running[lang];
    output.replaceChildren(h('p', { class: 'muted small' }, T.running[lang]));
    try {
      worker = new Worker(new URL('../engine/typecheck.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (event: MessageEvent<{ result?: TypecheckResult; error?: boolean }>) => {
        if (!event.data.result) { fail(); return; }
        stop();
        render(event.data.result);
      };
      worker.onerror = fail;
      timer = setTimeout(fail, 20000);
      worker.postMessage({ revision, strict });
    } catch { fail(); }
  }
  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, T.intro[lang]),
    segmented(T.revision[lang], TYPE_REVISIONS.map((r) => ({ value: r.id, label: r.label[lang] })), revision, (value) => { revision = value; reset(); }),
    code,
    h('div', { class: 'sim-row' }, run,
      h('label', { class: 'inline' }, h('input', { type: 'checkbox', checked: true, onchange: (event: Event) => { strict = (event.target as HTMLInputElement).checked; reset(); } }), T.strict[lang])),
    output,
    h('p', { class: 'sim-hint' }, T.scope[lang]),
  ));
  window.addEventListener('pagehide', stop, { once: true });
  reset();
}
