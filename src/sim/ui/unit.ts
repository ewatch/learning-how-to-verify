import { h, codeView, pill, roleTag, resultPanel, type Lang, type ResultView } from './kit';
import { IMPLS, SPEC, BUG_LABEL, evaluate, toVitest, unitOutcome, type Case, type Species, type UnitOutcome } from '../engine/unitsim';

type V = UnitOutcome['values'];
const SP = { en: { dog: 'dog', cat: 'cat' }, de: { dog: 'Hund', cat: 'Katze' } };
const fee = (x: number | 'throws', lang: Lang) => (x === 'throws' ? (lang === 'en' ? 'an error' : 'einen Fehler') : String(x));

const R = {
  en: {
    verdict: {
      'no-examples': () => 'No examples: no bug can be caught',
      'wrong-example': (v: V) => `Example ${v.wrong!.index} is wrong: it fails on the correct implementation`,
      'bugs-missed': (v: V) => `${v.total - v.caught} of ${v.total} bugs not caught`,
      'all-caught': (v: V) => `All bugs caught. ${v.caught} of ${v.total}, with ${v.examples} examples`,
    },
    why: {
      'no-examples': () => ['Without examples, every implementation passes.'],
      'wrong-example': (v: V) => [`Example ${v.wrong!.index} expects ${fee(v.wrong!.expected, 'en')} for a ${SP.en[v.wrong!.species]} of age ${v.wrong!.age}. The correct implementation returns ${fee(v.wrong!.correct, 'en')}, as the requirement says.`, 'A wrong expectation makes correct code fail.'],
      'bugs-missed': (v: V) => [`Implementation ${v.missed!.no} returns the same results as the correct one for all your examples. Your examples use ${v.species.map((s) => SP.en[s]).join(' and ')}, ages ${v.ages.join(', ')}.`, 'The bug changes the result only for inputs that your examples do not use.'],
      'all-caught': (v: V) => [`Every buggy implementation fails at least one of your ${v.examples} examples, and the correct one passes all of them.`, `This shows that your examples catch these ${v.total} known bugs. Other bugs can still pass. Mutation tests measure this.`],
    },
    use: {
      'no-examples': 'The agent gets no tests, so it gets no signal.',
      'wrong-example': 'The agent gets a red run for correct code. It may change correct code to match the wrong test. Check the expectation against the requirement first.',
      'bugs-missed': 'The agent gets a green run for buggy code. It has no signal, so it stops, and the bug ships.',
      'all-caught': (label: string) => `If the agent writes this bug (${label.replace(/^Bug: /, '')}), it gets the input, the expected value and the actual value. It can fix the condition at once.`,
    },
    next: {
      'no-examples': () => 'Click **+ Add example**.',
      'wrong-example': (v: V) => v.wrong!.correct === 'throws' ? `Tick **error** for example ${v.wrong!.index}.` : `Change the expected value of example ${v.wrong!.index} to ${v.wrong!.correct}.`,
      'bugs-missed': (v: V) => `Add an example for a ${SP.en[v.missed!.witness.species]} of age ${v.missed!.witness.age}. Take the expected value from the requirement.`,
      'all-caught': () => 'Remove one example and see which bug is no longer caught.',
    },
  },
  de: {
    verdict: {
      'no-examples': () => 'Keine Beispiele: Kein Bug kann gefangen werden',
      'wrong-example': (v: V) => `Beispiel ${v.wrong!.index} ist falsch: Es scheitert an der korrekten Implementierung`,
      'bugs-missed': (v: V) => `${v.total - v.caught} von ${v.total} Bugs nicht gefangen`,
      'all-caught': (v: V) => `Alle Fehler gefangen. ${v.caught} von ${v.total}, mit ${v.examples} Beispielen`,
    },
    why: {
      'no-examples': () => ['Ohne Beispiele besteht jede Implementierung.'],
      'wrong-example': (v: V) => [`Beispiel ${v.wrong!.index} erwartet ${fee(v.wrong!.expected, 'de')} für ${v.wrong!.species === 'dog' ? 'einen Hund' : 'eine Katze'} im Alter ${v.wrong!.age}. Die korrekte Implementierung liefert ${fee(v.wrong!.correct, 'de')}, wie die Anforderung sagt.`, 'Eine falsche Erwartung lässt korrekten Code scheitern.'],
      'bugs-missed': (v: V) => [`Implementierung ${v.missed!.no} liefert für alle deine Beispiele dieselben Ergebnisse wie die korrekte. Deine Beispiele nutzen ${v.species.map((s) => SP.de[s]).join(' und ')}, Alter ${v.ages.join(', ')}.`, 'Der Bug ändert das Ergebnis nur für Eingaben, die deine Beispiele nicht nutzen.'],
      'all-caught': (v: V) => [`Jede fehlerhafte Implementierung scheitert an mindestens einem deiner ${v.examples} Beispiele, und die korrekte besteht alle.`, `Das zeigt: Deine Beispiele fangen diese ${v.total} bekannten Bugs. Andere Bugs können trotzdem bestehen. Mutation Tests messen das.`],
    },
    use: {
      'no-examples': 'Der Agent bekommt keine Tests und darum kein Signal.',
      'wrong-example': 'Der Agent bekommt einen roten Lauf für korrekten Code. Er ändert vielleicht korrekten Code, bis er zum falschen Test passt. Die Erwartung zuerst mit der Anforderung vergleichen.',
      'bugs-missed': 'Der Agent bekommt einen grünen Lauf für fehlerhaften Code. Er hat kein Signal, hört auf, und der Bug wird ausgeliefert.',
      'all-caught': (label: string) => `Schreibt der Agent diesen Bug (${label.replace(/^Fehler: /, '')}), bekommt er Eingabe, erwarteten und tatsächlichen Wert. Er kann die Bedingung sofort korrigieren.`,
    },
    next: {
      'no-examples': () => 'Auf **+ Beispiel hinzufügen** klicken.',
      'wrong-example': (v: V) => v.wrong!.correct === 'throws' ? `Bei Beispiel ${v.wrong!.index} **Fehler** ankreuzen.` : `Den erwarteten Wert von Beispiel ${v.wrong!.index} auf ${v.wrong!.correct} ändern.`,
      'bugs-missed': (v: V) => `Ein Beispiel für ${v.missed!.witness.species === 'dog' ? 'einen Hund' : 'eine Katze'} im Alter ${v.missed!.witness.age} ergänzen. Den erwarteten Wert aus der Anforderung nehmen.`,
      'all-caught': () => 'Ein Beispiel entfernen und sehen, welcher Bug nicht mehr gefangen wird.',
    },
  },
};

/** Map the engine outcome to panel text. */
export function unitView(o: UnitOutcome, lang: Lang): ResultView {
  const r = R[lang];
  const c = o.causeId;
  const firstBug = IMPLS.find((i) => i.buggy)!;
  return {
    status: o.status,
    verdict: r.verdict[c](o.values),
    why: r.why[c](o.values),
    agent: { tool: 'Vitest', output: o.values.report, use: c === 'all-caught' ? r.use['all-caught'](BUG_LABEL[firstBug.id][lang]) : r.use[c] },
    next: r.next[c](o.values),
  };
}

const T = {
  en: {
    intro: 'Six implementations of the adoption fee. One is correct, five contain a plausible bug. Write examples (input → expected output) until your examples pass on the correct one and catch every bug. Start: the two examples below catch nothing.',
    spec: 'The requirement', examples: 'Your examples', species: 'Species', age: 'Age (years)', expected: 'Expected (cents)', throws: 'error', add: 'Add example', remove: 'Remove',
    impls: 'Implementations', caught: (n: number, t: number) => `${n} of ${t} bugs caught`, wrong: 'This example fails on the correct implementation, so the expectation is wrong. Check the requirement.',
    code: 'As a Vitest file', dog: 'dog', cat: 'cat', passOnCorrect: 'passes', fails: 'fails', caughtBy: 'caught', notCaught: 'not caught',
  },
  de: {
    intro: 'Sechs Implementierungen der Adoptionsgebühr. Eine ist korrekt, fünf enthalten einen plausiblen Fehler. Schreibe Beispiele (Eingabe → erwartete Ausgabe), bis sie auf der korrekten bestehen und jeden Fehler fangen. Start: Die zwei Beispiele unten fangen nichts.',
    spec: 'Die Anforderung', examples: 'Deine Beispiele', species: 'Tierart', age: 'Alter (Jahre)', expected: 'Erwartet (Cent)', throws: 'Fehler', add: 'Beispiel hinzufügen', remove: 'Entfernen',
    impls: 'Implementierungen', caught: (n: number, t: number) => `${n} von ${t} Fehlern gefangen`, wrong: 'Dieses Beispiel scheitert an der korrekten Implementierung; die Erwartung ist also falsch. Anforderung prüfen.',
    code: 'Als Vitest-Datei', dog: 'Hund', cat: 'Katze', passOnCorrect: 'besteht', fails: 'scheitert', caughtBy: 'gefangen', notCaught: 'nicht gefangen',
  },
};

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  let cases: Case[] = [{ species: 'dog', age: 3, expect: 12000 }, { species: 'dog', age: 10, expect: 6000 }];
  const tbody = h('tbody');
  const implList = h('div', { class: 'grid', style: 'gap:8px' });
  const panel = resultPanel(lang);
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
    panel.el,
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
      return h('details', { class: 'disclose sim-impl' },
        h('summary', {}, h('span', { class: 'sim-impl-name' }, label, ' ', roleTag(impl.buggy ? 'bug' : 'correct', lang)), h('span', { class: 'sim-impl-res' }, cells, badge)),
        h('div', { class: 'body' }, codeView(impl.code)));
    }));
    panel.show(unitView(unitOutcome(cases), lang));
    vitest.textContent = toVitest(cases);
  }
  render();
}
