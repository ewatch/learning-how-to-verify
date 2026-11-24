import { EXERCISE_DE } from '../../data/exercise-copy';
import { h, pill, codeRows, type Lang } from './kit';
import { CHANGES, CONTRACT, BASE_RESPONSE, applyChanges, contractLine, jsonLines, violationPaths, verifyEach, verifyAll, type Verdict, type Violation } from '../engine/contract';
import './contract.css';

const T = {
  en: {
    intro: 'The reservation UI relies on four fields. An agent edits the provider. Switch changes on, then verify the contract.',
    contract: 'Consumer contract (what the UI uses)', response: 'Provider response', changes: 'Agent changes', verify: 'Verify contract',
    compatible: 'compatible', breaking: 'breaking', fails: 'fails', missing: 'field missing', type: 'wrong type', enum: 'value not allowed', range: 'out of range',
    stale: 'Changes edited. Verify again.', none: 'Switch on at least one change.',
    allOk: 'Every selected change is compatible.', someBad: 'Breaking changes found.',
    lesson: 'Additive changes are safe. Renames, type changes and enum changes break consumers that the agent never saw.',
  },
  de: {
    intro: EXERCISE_DE.contract.intro,
    contract: 'Consumer-Contract (was die UI nutzt)', response: 'Provider-Antwort', changes: 'Änderungen des Agents', verify: 'Contract verifizieren',
    compatible: 'kompatibel', breaking: 'Breaking', fails: 'scheitert', missing: 'Feld fehlt', type: 'falscher Typ', enum: 'Wert nicht erlaubt', range: 'außerhalb des Bereichs',
    stale: 'Änderungen angepasst. Erneut verifizieren.', none: 'Schalte mindestens eine Änderung ein.',
    allOk: 'Alle gewählten Änderungen sind kompatibel.', someBad: 'Breaking Changes gefunden.',
    lesson: 'Additive Änderungen sind sicher. Umbenennungen, Typ- und Enum-Änderungen brechen Consumer, die der Agent nie gesehen hat.',
  },
};

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  const on = new Set<string>();
  let verified: { ids: string[]; each: Verdict[]; all: Violation[] } | null = null;
  const uid = Math.random().toString(36).slice(2);

  const toggles = h('div', { class: 'ct-toggles' });
  const contractBox = h('div');
  const jsonBox = h('div');
  const results = h('div', { class: 'ct-res', 'aria-live': 'polite' });
  const lesson = h('div', { class: 'sim-callout', hidden: true, role: 'status' });
  const runBtn = h('button', { class: 'btn', type: 'button', onclick: () => {
    const ids = CHANGES.filter((c) => on.has(c.id)).map((c) => c.id);
    verified = { ids, each: verifyEach(ids), all: verifyAll(ids) };
    render();
  } }, t.verify);

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, t.intro),
    h('div', { class: 'sim-cols' },
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.changes), toggles, h('div', { class: 'sim-row', style: 'margin-top:10px' }, runBtn)),
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.contract), contractBox)),
    results,
    h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.response), jsonBox),
    lesson));

  const reasonText = (v: Violation) => `${t[v.reason]}${v.reason === 'missing' ? '' : `: ${JSON.stringify(v.got)}`}`;

  function render() {
    const ids = CHANGES.filter((c) => on.has(c.id)).map((c) => c.id);
    const stale = verified && verified.ids.join() !== ids.join();
    const shown = verified && !stale ? verified : null;
    const bad = shown ? shown.all : [];
    const failing = new Set(bad.map((v) => v.field));
    const paths = violationPaths(bad);

    toggles.replaceChildren(...CHANGES.map((c) => {
      const id = `ct-${uid}-${c.id}`;
      return h('label', { for: id }, h('input', { type: 'checkbox', id, checked: on.has(c.id), onchange: (e: Event) => { if ((e.target as HTMLInputElement).checked) on.add(c.id); else on.delete(c.id); render(); } }), c.title[lang]);
    }));
    contractBox.replaceChildren(codeRows(CONTRACT.map((f) => ({ html: `<span>${contractLine(f)}</span>`, cls: failing.has(f.name) ? 'err' : '' })), t.contract));
    jsonBox.replaceChildren(codeRows(jsonLines(applyChanges(ids, BASE_RESPONSE)).map((l) => ({ html: l.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/ /g, ' ') || ' ', cls: paths.has(l.path) ? 'err' : '' })), t.response));

    results.replaceChildren();
    lesson.hidden = true;
    if (stale) results.append(h('span', { class: 'small muted' }, t.stale));
    else if (shown) {
      if (!shown.ids.length) results.append(h('span', { class: 'small muted' }, t.none));
      for (const e of shown.each) {
        const c = CHANGES.find((x) => x.id === e.id)!;
        const lines = [...new Map(e.violations.map((v) => [v.field, v])).values()];
        results.append(h('div', {}, e.compatible ? pill('ok', `✓ ${t.compatible}`) : pill('bad', `✗ ${t.breaking}`), h('b', {}, c.title[lang]),
          ...lines.map((v) => h('span', {}, `${t.fails}: `, h('code', {}, contractLine(CONTRACT.find((f) => f.name === v.field)!)), ` (${reasonText(v)})`))));
      }
      if (shown.ids.length) {
        lesson.hidden = false;
        lesson.className = `sim-callout ${bad.length ? 'bad' : 'ok'}`;
        lesson.replaceChildren(h('p', {}, h('b', {}, bad.length ? t.someBad : t.allOk)), h('p', {}, t.lesson));
      }
    }
  }
  render();
}
