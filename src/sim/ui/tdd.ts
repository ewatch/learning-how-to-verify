import { EXERCISE_DE } from '../../data/exercise-copy';
import { h, codeView, codeEditor, pill, roleTag, resultPanel, type Lang, type ResultView } from './kit';
import { STUB, SOLUTION, REFACTORED, TESTS, TITLES, runTdd, allGreen, advance, tddOutcome, tddReport, type TddState, type TddOutcome } from '../engine/tdd';
import type { TestResult } from '../engine/jsrun';
import './tdd.css';

const T = {
  en: {
    intro: 'The tests are approved and locked. Make all four go green by writing `reserve`, then clean it up without breaking them.',
    steps: ['Red', 'Green', 'Refactor'], tests: 'Approved tests', locked: 'locked', change: 'Change tests',
    gate: 'Blocked by the gate. If the agent (or you) could edit the tests to make them pass, a green run would prove nothing. Tests stay fixed; only the implementation changes.',
    impl: 'Your implementation', run: 'Run tests', solution: 'Show a solution', clean: 'Use cleaner version', label: 'reserve implementation',
  },
  de: {
    intro: EXERCISE_DE.tdd.intro,
    steps: ['Red', 'Green', 'Refactor'], tests: 'Freigegebene Tests', locked: 'gesperrt', change: 'Tests ändern',
    gate: 'Vom Gate blockiert. Könnte der Agent (oder du) die Tests anpassen, bis sie bestehen, würde ein grüner Lauf nichts beweisen. Die Tests bleiben fest; nur die Implementierung ändert sich.',
    impl: 'Deine Implementierung', run: 'Tests ausführen', solution: 'Lösung zeigen', clean: 'Sauberere Version nutzen', label: 'reserve-Implementierung',
  },
};

type DV = TddOutcome['values'];
const R = {
  en: {
    verdict: {
      'not-implemented': (v: DV) => `Red: ${v.failed} of ${v.total} tests fail`,
      red: (v: DV) => `Red: ${v.failed} of ${v.total} tests fail`,
      broken: (v: DV) => `Red again: ${v.failed} of ${v.total} tests fail after your change`,
      green: (v: DV) => `Green: ${v.passed} of ${v.total} tests pass`,
      'green-same': (v: DV) => `Green: ${v.passed} of ${v.total} tests pass, but the code did not change`,
      done: (v: DV) => `Done: red, green, refactor. ${v.passed} of ${v.total} tests pass`,
    },
    why: {
      'not-implemented': () => ['`reserve` does not do anything yet, so all tests fail. Red is the expected start: the tests describe behaviour that does not exist yet.'],
      red: (v: DV, lang: Lang) => [`The test “${TITLES[lang][v.first!.index]}” fails: \`${v.first!.msg}\`.`, 'The tests are locked. Only the implementation can change.'],
      broken: (v: DV, lang: Lang) => [`Your change broke the test “${TITLES[lang][v.first!.index]}”: \`${v.first!.msg}\`.`, 'In the refactor step the behaviour must stay the same.'],
      green: () => ['The implementation now does what the four tests describe.', 'Green shows that these four cases work. It does not show that the code is clean or complete.'],
      'green-same': () => ['You ran the same code again. Refactor means: change the structure, keep the behaviour.'],
      done: () => ['The code changed after the first green run, and all tests still pass. The locked tests showed at once that the behaviour stayed the same.'],
    },
    use: {
      red: 'The agent gets the name of each failing test and the expected value. The tests are locked, so the only way to green is to change `reserve`.',
      broken: 'The agent gets the test that its refactoring broke. It can undo or fix that step at once.',
      green: 'The agent gets a green run. Because the tests are locked, green means that the agent changed the code, not the tests.',
    },
    next: {
      red: 'Write `reserve` in the editor, or click **Show a solution** (tag: correct).',
      broken: 'Fix the change, or click **Use cleaner version** (tag: correct).',
      green: 'Make the code cleaner, or click **Use cleaner version** (tag: correct). Then run the tests.',
      done: 'Click **Change tests** and read why the gate blocks it.',
    },
  },
  de: {
    verdict: {
      'not-implemented': (v: DV) => `Red: ${v.failed} von ${v.total} Tests scheitern`,
      red: (v: DV) => `Red: ${v.failed} von ${v.total} Tests scheitern`,
      broken: (v: DV) => `Wieder rot: ${v.failed} von ${v.total} Tests scheitern nach deiner Änderung`,
      green: (v: DV) => `Green: ${v.passed} von ${v.total} Tests bestehen`,
      'green-same': (v: DV) => `Green: ${v.passed} von ${v.total} Tests bestehen, aber der Code hat sich nicht geändert`,
      done: (v: DV) => `Geschafft: Red, Green, Refactor. ${v.passed} von ${v.total} Tests bestehen`,
    },
    why: {
      'not-implemented': () => ['`reserve` tut noch nichts, darum scheitern alle Tests. Red ist der erwartete Start: Die Tests beschreiben Verhalten, das es noch nicht gibt.'],
      red: (v: DV, lang: Lang) => [`Der Test „${TITLES[lang][v.first!.index]}“ scheitert: \`${v.first!.msg}\`.`, 'Die Tests sind gesperrt. Nur die Implementierung kann sich ändern.'],
      broken: (v: DV, lang: Lang) => [`Deine Änderung hat den Test „${TITLES[lang][v.first!.index]}“ gebrochen: \`${v.first!.msg}\`.`, 'Im Refactor-Schritt muss das Verhalten gleich bleiben.'],
      green: () => ['Die Implementierung tut jetzt, was die vier Tests beschreiben.', 'Green zeigt, dass diese vier Fälle funktionieren. Es zeigt nicht, dass der Code sauber oder vollständig ist.'],
      'green-same': () => ['Du hast denselben Code erneut ausgeführt. Refactor heißt: Struktur ändern, Verhalten behalten.'],
      done: () => ['Der Code hat sich nach dem ersten grünen Lauf geändert, und alle Tests bestehen weiter. Die gesperrten Tests zeigten sofort, dass das Verhalten gleich blieb.'],
    },
    use: {
      red: 'Der Agent bekommt den Namen jedes scheiternden Tests und den erwarteten Wert. Die Tests sind gesperrt, der einzige Weg zu Grün ist also, `reserve` zu ändern.',
      broken: 'Der Agent bekommt den Test, den sein Refactoring gebrochen hat. Er kann diesen Schritt sofort rückgängig machen oder korrigieren.',
      green: 'Der Agent bekommt einen grünen Lauf. Weil die Tests gesperrt sind, heißt Grün: Der Agent hat den Code geändert, nicht die Tests.',
    },
    next: {
      red: '`reserve` im Editor schreiben oder **Lösung zeigen** (Tag: korrekt) klicken.',
      broken: 'Die Änderung korrigieren oder **Sauberere Version nutzen** (Tag: korrekt) klicken.',
      green: 'Den Code sauberer machen oder **Sauberere Version nutzen** (Tag: korrekt) klicken. Dann die Tests ausführen.',
      done: '**Tests ändern** klicken und lesen, warum das Gate es blockiert.',
    },
  },
};

export function tddView(o: TddOutcome, report: string, lang: Lang): ResultView {
  const r = R[lang], v = o.values, c = o.causeId;
  const group = c === 'broken' ? 'broken' : o.status === 'fail' ? 'red' : 'green';
  return { status: o.status, verdict: r.verdict[c](v), why: r.why[c](v, lang), agent: { tool: 'Vitest', output: report, use: r.use[group] }, next: c === 'done' ? r.next.done : r.next[group] };
}

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  let state: TddState = { phase: 'red' };
  let code = STUB;

  const steps = h('ol', { class: 'tdd-steps', 'aria-label': 'Red, Green, Refactor' });
  const list = h('ul', { class: 'tdd-results', 'aria-live': 'polite' });
  const panel = resultPanel(lang);
  const gateNote = h('div', { class: 'sim-callout bad', role: 'status', hidden: true }, t.gate);
  const editHost = h('div', { class: 'tdd-edit' });
  const cleanBtn = h('button', { class: 'btn ghost', type: 'button', hidden: true, onclick: () => { ed?.set(REFACTORED); code = REFACTORED; run(); } }, t.clean, ' ', roleTag('correct', lang));
  let ed: Awaited<ReturnType<typeof codeEditor>> | undefined;

  function paint(res: TestResult[], before: TddState) {
    const stepCls = ['', '', ''];
    stepCls[0] = 'red';
    if (state.phase !== 'red') stepCls[1] = 'green';
    if (state.phase === 'done') stepCls[2] = 'green';
    const cur = state.phase === 'red' ? (allGreen(res) ? 1 : 0) : state.phase === 'green' ? 2 : 3;
    steps.replaceChildren(...t.steps.map((s, i) => h('li', { class: `${stepCls[i]} ${i === cur ? 'cur' : ''}`, 'aria-current': i === cur ? 'step' : undefined }, `${i + 1}. ${s}${stepCls[i] === 'green' || (i === 0 && state.phase !== 'red') ? ' ✓' : ''}`)));
    list.replaceChildren(...res.map((r, i) => h('li', {}, pill(r.ok ? 'ok' : 'bad', r.ok ? '✓' : '✗'), ' ', TITLES[lang][i], !r.ok && r.msg ? h('span', { class: 'msg' }, r.msg) : null)));
    panel.show(tddView(tddOutcome(before, state, res), tddReport(runTdd(code, 'en')), lang));
    cleanBtn.hidden = state.phase !== 'green';
  }

  function run() {
    code = ed ? ed.get() : code;
    const res = runTdd(code, lang);
    const before = state;
    state = advance(state, code, res);
    paint(res, before);
  }

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, ...t.intro.split('`').map((p, i) => (i % 2 ? h('code', {}, p) : p))),
    steps,
    h('div', { class: 'sim-cols' },
      h('div', { class: 'sim-card' },
        h('div', { class: 'sim-card-title' }, t.tests, h('span', { class: 'tdd-lock' }, `🔒 ${t.locked}`)),
        codeView(TESTS),
        h('div', { class: 'sim-row', style: 'margin-top:8px' }, h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { gateNote.hidden = false; } }, t.change)),
        gateNote,
        list),
      h('div', { class: 'sim-card' },
        h('div', { class: 'sim-card-title' }, t.impl),
        editHost,
        h('div', { class: 'sim-row', style: 'margin-top:8px' },
          h('button', { class: 'btn', type: 'button', onclick: run }, t.run),
          cleanBtn,
          h('button', { class: 'btn ghost', type: 'button', onclick: () => { ed?.set(SOLUTION); code = SOLUTION; run(); } }, t.solution, ' ', roleTag('correct', lang))))),
    panel.el));
  paint(runTdd(STUB, lang), state);
  codeEditor(editHost, STUB, (s) => { code = s; }, t.label).then((e) => { ed = e; });
}
