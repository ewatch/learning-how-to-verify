import { EXERCISE_DE } from '../../data/exercise-copy';
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
      'bugs-missed': (v: V) => `${v.caught} of ${v.total} bugs caught. ${v.total - v.caught} still pass your examples`,
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
      'bugs-missed': (v: V) => `${v.caught} von ${v.total} Bugs gefangen. ${v.total - v.caught} bestehen deine Beispiele noch`,
      'all-caught': (v: V) => `Alle Bugs gefangen. ${v.caught} von ${v.total}, mit ${v.examples} Beispielen`,
    },
    why: {
      'no-examples': () => ['Ohne Beispiele besteht jede Implementierung.'],
      'wrong-example': (v: V) => [`Beispiel ${v.wrong!.index} erwartet ${fee(v.wrong!.expected, 'de')} für ${v.wrong!.species === 'dog' ? 'einen Hund' : 'eine Katze'} im Alter ${v.wrong!.age}. Die korrekte Implementierung liefert ${fee(v.wrong!.correct, 'de')}, wie die Anforderung sagt.`, 'Eine falsche Erwartung lässt korrekten Code scheitern.'],
      'bugs-missed': (v: V) => [`Implementierung ${v.missed!.no} liefert für alle deine Beispiele dieselben Ergebnisse wie die korrekte. Deine Beispiele nutzen ${v.species.map((s) => SP.de[s]).join(' und ')}, Alter ${v.ages.join(', ')}.`, 'Der Bug ändert das Ergebnis nur für Eingaben, die deine Beispiele nicht nutzen.'],
      'all-caught': (v: V) => [`Jede Implementierung mit Bug scheitert an mindestens einem deiner ${v.examples} Beispiele, und die korrekte besteht alle.`, `Das zeigt: Deine Beispiele fangen diese ${v.total} bekannten Bugs. Andere Bugs können trotzdem bestehen. Mutation Tests messen das.`],
    },
    use: {
      'no-examples': 'Der Agent bekommt keine Tests und darum kein Signal.',
      'wrong-example': 'Der Agent bekommt einen roten Lauf für korrekten Code. Er ändert vielleicht korrekten Code, bis er zum falschen Test passt. Vergleiche die Erwartung zuerst mit der Anforderung.',
      'bugs-missed': 'Der Agent bekommt einen grünen Lauf für Code mit Bug. Er hat kein Signal, hört auf, und der Bug wird ausgeliefert.',
      'all-caught': (label: string) => `Schreibt der Agent diesen Bug (${label.replace(/^Bug: /, '')}), bekommt er Eingabe, erwarteten und tatsächlichen Wert. Er kann die Bedingung sofort korrigieren.`,
    },
    next: {
      'no-examples': () => 'Klicke auf **+ Beispiel hinzufügen**.',
      'wrong-example': (v: V) => v.wrong!.correct === 'throws' ? `Kreuze bei Beispiel ${v.wrong!.index} **Fehler** an.` : `Ändere den erwarteten Wert von Beispiel ${v.wrong!.index} auf ${v.wrong!.correct}.`,
      'bugs-missed': (v: V) => `Ergänze ein Beispiel für ${v.missed!.witness.species === 'dog' ? 'einen Hund' : 'eine Katze'} im Alter ${v.missed!.witness.age}. Nimm den erwarteten Wert aus der Anforderung.`,
      'all-caught': () => 'Entferne ein Beispiel und sieh nach, welcher Bug nicht mehr gefangen wird.',
    },
  },
};

/** Map the engine outcome to panel text. */
export function unitView(o: UnitOutcome, lang: Lang): ResultView {
  const r = R[lang];
  const c = o.causeId;
  const firstBug = IMPLS.find((i) => i.buggy)!;
  // the Vitest output runs against one implementation: name it, so "FAIL" in a success state reads right
  const against = c === 'wrong-example' ? BUG_LABEL.correct[lang]
    : c === 'bugs-missed' ? `${lang === 'en' ? 'Implementation' : 'Implementierung'} ${o.values.missed!.no}`
    : c === 'all-caught' ? BUG_LABEL[firstBug.id][lang] : undefined;
  return {
    status: o.status,
    tone: o.tone,
    verdict: r.verdict[c](o.values),
    why: r.why[c](o.values),
    agent: { tool: 'Vitest', output: o.values.report, use: c === 'all-caught' ? r.use['all-caught'](BUG_LABEL[firstBug.id][lang]) : r.use[c], against },
    next: r.next[c](o.values),
  };
}

const T = {
  en: {
    intro: 'Six implementations of the adoption fee. One is correct, five contain a plausible bug. Write examples (input → expected output) until your examples pass on the correct one and catch every bug. Start: the two examples below catch nothing.',
    spec: 'The requirement', examples: 'Your examples', species: 'Species', age: 'Age (years)', expected: 'Expected (cents)', throws: 'error', add: 'Add example', remove: 'Remove',
    impls: 'Implementations', caught: (n: number, t: number) => `${n} of ${t} bugs caught`, wrong: 'This example fails on the correct implementation, so the expectation is wrong. Check the requirement.',
    code: 'As a Vitest file', dog: 'dog', cat: 'cat', passOnCorrect: 'passes', fails: 'fails', caughtBy: 'caught', notCaught: 'not caught yet',
    legend: 'Each number is one of your examples.', legendFails: 'fails on this implementation', legendCaught: 'One failing example catches the bug.',
    cell: { pass: 'passes', fail: 'fails', void: 'wrong expectation, not counted' }, example: 'Example', got: 'returns',
  },
  de: {
    intro: EXERCISE_DE.unit.intro,
    spec: 'Die Anforderung', examples: 'Deine Beispiele', species: 'Tierart', age: 'Alter (Jahre)', expected: 'Erwartet (Cent)', throws: 'Fehler', add: 'Beispiel hinzufügen', remove: 'Entfernen',
    impls: 'Implementierungen', caught: (n: number, t: number) => `${n} von ${t} Bugs gefangen`, wrong: 'Dieses Beispiel scheitert an der korrekten Implementierung; die Erwartung ist also falsch. Prüfe die Anforderung.',
    code: 'Als Vitest-Datei', dog: 'Hund', cat: 'Katze', passOnCorrect: 'besteht', fails: 'scheitert', caughtBy: 'gefangen', notCaught: 'noch nicht gefangen',
    legend: 'Jede Zahl ist eines deiner Beispiele.', legendFails: 'scheitert an dieser Implementierung', legendCaught: 'Ein scheiterndes Beispiel fängt den Bug.',
    cell: { pass: 'besteht', fail: 'scheitert', void: 'falsche Erwartung, zählt nicht' }, example: 'Beispiel', got: 'liefert',
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
    // a plain section, not a card: its rows are bordered disclosures already
    h('div', { class: 'sim-sec' }, h('div', { class: 'sim-card-title' }, t.impls),
      h('p', { class: 'sim-hint sim-legend' }, t.legend, ' ', h('span', { class: 'sim-pill hit', 'aria-hidden': 'true' }, h('span', { class: 'x' }, '✗'), '2'), ' ', `= ${t.legendFails}. ${t.legendCaught}`),
      implList),
    h('details', { class: 'disclose' }, h('summary', {}, t.code), h('div', { class: 'body' }, vitest)),
  ));

  // Rows are created once per example and patched in place: rebuilding them on every change
  // would drop keyboard focus to <body> each time a value is committed.
  type Row = { tr: HTMLTableRowElement; sp: HTMLSelectElement; age: HTMLInputElement; exp: HTMLInputElement; chk: HTMLInputElement; hint: HTMLElement; rm: HTMLButtonElement };
  const rows = new Map<Case, Row>();

  function makeRow(c: Case): Row {
    const sp = h('select', { 'aria-label': t.species, onchange: () => { c.species = sp.value as Species; render(); } },
      h('option', { value: 'dog' }, t.dog), h('option', { value: 'cat' }, t.cat));
    const age = h('input', { type: 'number', step: '1', 'aria-label': t.age, onchange: () => { c.age = Number(age.value); render(); } });
    const exp = h('input', { type: 'number', step: '100', 'aria-label': t.expected, onchange: () => { c.expect = Number(exp.value); render(); } });
    const chk = h('input', { type: 'checkbox', onchange: () => { c.expect = chk.checked ? 'throws' : 0; render(); } });
    const hint = h('div', { class: 'sim-hint', style: 'color:var(--bad)', hidden: true }, t.wrong);
    const rm = h('button', { class: 'btn ghost sm', type: 'button', onclick: () => remove(c) }, '×');
    const tr = h('tr', {},
      h('td', {}, sp), h('td', {}, age), h('td', {}, h('div', { class: 'sim-row', style: 'gap:6px' }, exp, h('label', { class: 'inline small' }, chk, t.throws)), hint),
      h('td', {}, rm));
    return { tr, sp, age, exp, chk, hint, rm };
  }

  // Assigning a value only when it differs keeps the caret where it is in the field being edited.
  const set = (el: HTMLInputElement | HTMLSelectElement, v: string) => { if (el.value !== v) el.value = v; };

  function syncRow(row: Row, c: Case, i: number, wrong: boolean) {
    const throws = c.expect === 'throws';
    set(row.sp, c.species);
    set(row.age, String(c.age));
    set(row.exp, throws ? '' : String(c.expect));
    row.exp.disabled = throws;
    row.chk.checked = throws;
    row.tr.classList.toggle('cur', wrong);
    row.hint.hidden = !wrong;
    row.rm.setAttribute('aria-label', `${t.remove} ${i + 1}`);
  }

  // After a removal, focus goes to the remove button of the row that moved up, or to "Add example".
  function remove(c: Case) {
    const i = cases.indexOf(c);
    cases.splice(i, 1);
    rows.get(c)?.tr.remove();
    rows.delete(c);
    render();
    const next = cases[i];
    (next ? rows.get(next)!.rm : addBtn).focus();
  }

  function render() {
    const r = evaluate(cases);
    // examples are only appended or removed, never reordered, so new rows go at the end
    cases.forEach((c, i) => {
      let row = rows.get(c);
      if (!row) { row = makeRow(c); rows.set(c, row); tbody.append(row.tr); }
      syncRow(row, c, i, r.wrongCases[i]);
    });
    counter.textContent = t.caught(r.caught.length, r.total);
    implList.replaceChildren(...r.rows.map(({ impl, results }) => {
      const isCaught = r.caught.includes(impl.id);
      // green = good for the learner: a failing example on a buggy implementation catches the bug;
      // red only where the learner made a mistake (an example that fails on the correct implementation)
      const badge = impl.buggy ? (isCaught ? pill('ok', `✓ ${t.caughtBy}`) : pill('idle', t.notCaught)) : (results.every((x) => x.outcome === 'pass') ? pill('ok', `✓ ${t.passOnCorrect}`) : pill('bad', `✗ ${t.fails}`));
      // a failing example is neutral ✗ (the runner's meaning); green stays on the row's "caught" pill,
      // red only on the correct implementation (a learner mistake); a wrong example counts for nothing
      const cell = (fails: boolean, i: number) => (r.wrongCases[i] && impl.buggy ? 'void' : !fails ? 'pass' : impl.buggy ? 'fail' : 'bad') as 'pass' | 'fail' | 'bad' | 'void';
      const CLS = { pass: 'idle', fail: 'hit', bad: 'bad', void: 'void' } as const;
      const cells = h('span', { class: 'sim-row sim-cells', style: 'gap:3px' }, ...results.map((x, i) => {
        const k = cell(x.outcome !== 'pass', i);
        const sr = `${t.example} ${i + 1}: ${t.cell[k === 'bad' ? 'fail' : k]}${k === 'void' ? '' : ` (${t.got} ${x.got})`}`;
        return h('span', { class: `sim-pill ${CLS[k]}`, title: sr },
          k === 'fail' || k === 'bad' ? h('span', { class: 'x', 'aria-hidden': 'true' }, '✗') : null,
          h('span', { 'aria-hidden': 'true' }, String(i + 1)), h('span', { class: 'visually-hidden' }, sr));
      }));
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
