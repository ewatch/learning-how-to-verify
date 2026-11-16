import { h, codeView, pill, type Lang } from './kit';
import { IMPLS, SPEC, BUG_LABEL, evaluate, toVitest, type Case, type Species } from '../engine/unitsim';

const T = {
  en: {
    intro: 'Six implementations of the adoption fee. One is correct, five contain a plausible bug. Write examples (input → expected output) until your examples pass on the correct one and catch every bug. Start: the two examples below catch nothing.',
    spec: 'The requirement', examples: 'Your examples', species: 'Species', age: 'Age (years)', expected: 'Expected (cents)', throws: 'error', add: 'Add example', run: 'Run examples', remove: 'Remove',
    impls: 'Implementations', caught: (n: number, t: number) => `${n} of ${t} bugs caught`, wrong: 'This example fails on the correct implementation, so the expectation is wrong. Check the requirement.',
    allCaught: 'All bugs caught. Notice which examples did it: the boundaries (8, 1, 0), the error case (-1), and the second species. Typical first examples (3 and 10) catch none of them.',
    show: 'show code', code: 'As a Vitest file', dog: 'dog', cat: 'cat', passOnCorrect: 'passes', fails: 'fails', caughtBy: 'caught', notCaught: 'not caught',
  },
  de: {
    intro: 'Sechs Implementierungen der Adoptionsgebühr. Eine ist korrekt, fünf enthalten einen plausiblen Fehler. Schreibe Beispiele (Eingabe → erwartete Ausgabe), bis sie auf der korrekten bestehen und jeden Fehler fangen. Start: Die zwei Beispiele unten fangen nichts.',
    spec: 'Die Anforderung', examples: 'Deine Beispiele', species: 'Tierart', age: 'Alter (Jahre)', expected: 'Erwartet (Cent)', throws: 'Fehler', add: 'Beispiel hinzufügen', run: 'Beispiele ausführen', remove: 'Entfernen',
    impls: 'Implementierungen', caught: (n: number, t: number) => `${n} von ${t} Fehlern gefangen`, wrong: 'Dieses Beispiel scheitert an der korrekten Implementierung; die Erwartung ist also falsch. Anforderung prüfen.',
    allCaught: 'Alle Fehler gefangen. Achte darauf, welche Beispiele es waren: die Grenzen (8, 1, 0), der Fehlerfall (-1) und die zweite Tierart. Typische erste Beispiele (3 und 10) fangen keinen davon.',
    show: 'Code zeigen', code: 'Als Vitest-Datei', dog: 'Hund', cat: 'Katze', passOnCorrect: 'besteht', fails: 'scheitert', caughtBy: 'gefangen', notCaught: 'nicht gefangen',
  },
};

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  let cases: Case[] = [{ species: 'dog', age: 3, expect: 12000 }, { species: 'dog', age: 10, expect: 6000 }];
  const tbody = h('tbody');
  const implList = h('div', { class: 'grid', style: 'gap:8px' });
  const status = h('div', { class: 'sim-callout', hidden: true });
  const counter = h('b');
  const vitest = h('pre', { tabindex: 0, class: 'sim-code', style: 'padding:8px 12px; white-space:pre' });

  const addBtn = h('button', { class: 'btn ghost', type: 'button', onclick: () => { cases.push({ species: 'dog', age: 8, expect: 6000 }); render(); } }, `+ ${t.add}`);

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, t.intro),
    h('div', { class: 'sim-cols' },
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.spec), h('ul', { style: 'margin:0' }, ...SPEC[lang].map((s) => h('li', {}, s)))),
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.examples, counter),
        h('table', { class: 'sim-table' }, h('thead', {}, h('tr', {}, h('th', {}, t.species), h('th', {}, t.age), h('th', {}, t.expected), h('th', {}, h('span', { class: 'visually-hidden' }, t.remove)))), tbody),
        h('div', { class: 'sim-row', style: 'margin-top:8px' }, addBtn)),
    ),
    status,
    h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.impls), implList),
    h('details', { class: 'disclose' }, h('summary', {}, t.code), h('div', { class: 'body' }, vitest)),
  ));

  function row(c: Case, i: number, wrong: boolean) {
    const sp = h('select', { 'aria-label': t.species, onchange: (e: Event) => { c.species = (e.target as HTMLSelectElement).value as Species; render(); } },
      h('option', { value: 'dog', selected: c.species === 'dog' }, t.dog), h('option', { value: 'cat', selected: c.species === 'cat' }, t.cat));
    const age = h('input', { type: 'number', step: '1', value: c.age, 'aria-label': t.age, onchange: (e: Event) => { c.age = Number((e.target as HTMLInputElement).value); render(); } });
    const throws = c.expect === 'throws';
    const exp = h('input', { type: 'number', step: '100', value: throws ? '' : c.expect, disabled: throws, 'aria-label': t.expected, onchange: (e: Event) => { c.expect = Number((e.target as HTMLInputElement).value); render(); } });
    const thr = h('label', { class: 'inline small' }, h('input', { type: 'checkbox', checked: throws, onchange: (e: Event) => { c.expect = (e.target as HTMLInputElement).checked ? 'throws' : 0; render(); } }), t.throws);
    const tr = h('tr', { class: wrong ? 'cur' : '' },
      h('td', {}, sp), h('td', {}, age), h('td', {}, h('div', { class: 'sim-row', style: 'gap:6px' }, exp, thr), wrong ? h('div', { class: 'sim-hint', style: 'color:var(--bad)' }, t.wrong) : ''),
      h('td', {}, h('button', { class: 'btn ghost sm', type: 'button', 'aria-label': `${t.remove} ${i + 1}`, onclick: () => { cases.splice(i, 1); render(); } }, '×')));
    return tr;
  }

  function render() {
    const r = evaluate(cases);
    tbody.replaceChildren(...cases.map((c, i) => row(c, i, r.wrongCases[i])));
    counter.textContent = t.caught(r.caught.length, r.total);
    implList.replaceChildren(...r.rows.map(({ impl, results }) => {
      const isCaught = r.caught.includes(impl.id);
      const badge = impl.buggy ? (isCaught ? pill('ok', `✓ ${t.caughtBy}`) : pill('bad', `✗ ${t.notCaught}`)) : (results.every((x) => x.outcome === 'pass') ? pill('ok', `✓ ${t.passOnCorrect}`) : pill('bad', `✗ ${t.fails}`));
      const cells = h('span', { class: 'sim-row', style: 'gap:3px' }, ...results.map((x, i) => h('span', { class: `sim-pill ${x.outcome === 'pass' ? 'idle' : 'bad'}`, title: `#${i + 1}: ${x.got}` }, String(i + 1))));
      const label = impl.buggy ? (isCaught ? BUG_LABEL[impl.id][lang] : `${lang === 'en' ? 'Implementation' : 'Implementierung'} ${IMPLS.indexOf(impl)}`) : BUG_LABEL.correct[lang];
      return h('details', { class: 'disclose' },
        h('summary', {}, h('span', { style: 'flex:1' }, label), cells, badge),
        h('div', { class: 'body' }, codeView(impl.code)));
    }));
    const all = r.caught.length === r.total && !r.wrongCases.some(Boolean);
    status.hidden = !all;
    status.className = 'sim-callout ok';
    status.textContent = t.allCaught;
    vitest.textContent = toVitest(cases);
  }
  render();
}
