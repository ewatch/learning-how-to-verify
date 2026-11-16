import { h, codeView, codeEditor, pill, type Lang } from './kit';
import { STUB, SOLUTION, REFACTORED, TESTS, TITLES, runTdd, allGreen, advance, type TddState } from '../engine/tdd';
import type { TestResult } from '../engine/jsrun';
import './tdd.css';

const T = {
  en: {
    intro: 'The tests are approved and locked. Make all four go green by writing `reserve`, then clean it up without breaking them.',
    steps: ['Red', 'Green', 'Refactor'], tests: 'Approved tests', locked: 'locked', change: 'Change tests',
    gate: 'Blocked by the gate. If the agent (or you) could edit the tests to make them pass, a green run would prove nothing. Tests stay fixed; only the implementation changes.',
    impl: 'Your implementation', run: 'Run tests', solution: 'Show a solution', clean: 'Use cleaner version', label: 'reserve implementation',
    red: 'Red: nothing implemented yet, all tests fail. Write `reserve` below.',
    green: 'Green. Now refactor: make the code cleaner and run again. The tests must stay green.',
    broke: 'The tests are red again. Fix it, or restore the cleaner version.',
    done: 'Done: red, green, refactor. Fixed tests let you change the code safely, because they tell you at once if you break something.',
  },
  de: {
    intro: 'Die Tests sind freigegeben und gesperrt. Schreibe `reserve`, bis alle vier grün sind, und räume den Code dann auf, ohne sie zu brechen.',
    steps: ['Red', 'Green', 'Refactor'], tests: 'Freigegebene Tests', locked: 'gesperrt', change: 'Tests ändern',
    gate: 'Vom Gate blockiert. Könnte der Agent (oder du) die Tests anpassen, bis sie bestehen, würde ein grüner Lauf nichts beweisen. Die Tests bleiben fest; nur die Implementierung ändert sich.',
    impl: 'Deine Implementierung', run: 'Tests ausführen', solution: 'Lösung zeigen', clean: 'Sauberere Version nutzen', label: 'reserve-Implementierung',
    red: 'Red: noch nichts implementiert, alle Tests scheitern. Schreibe unten `reserve`.',
    green: 'Green. Jetzt Refactor: Mach den Code sauberer und führe erneut aus. Die Tests müssen grün bleiben.',
    broke: 'Die Tests sind wieder rot. Behebe es oder stelle die sauberere Version her.',
    done: 'Geschafft: Red, Green, Refactor. Feste Tests erlauben dir, den Code sicher zu ändern, denn sie melden sofort, wenn du etwas brichst.',
  },
};

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  let state: TddState = { phase: 'red' };
  let code = STUB;
  let broke = false;

  const steps = h('ol', { class: 'tdd-steps', 'aria-label': 'Red, Green, Refactor' });
  const list = h('ul', { class: 'tdd-results', 'aria-live': 'polite' });
  const status = h('div', { class: 'sim-callout', role: 'status' });
  const gateNote = h('div', { class: 'sim-callout bad', role: 'status', hidden: true }, t.gate);
  const editHost = h('div', { class: 'tdd-edit' });
  const cleanBtn = h('button', { class: 'btn ghost', type: 'button', hidden: true, onclick: () => { ed?.set(REFACTORED); code = REFACTORED; run(); } }, t.clean);
  let ed: Awaited<ReturnType<typeof codeEditor>> | undefined;

  function paint(res: TestResult[]) {
    const stepCls = ['', '', ''];
    stepCls[0] = 'red';
    if (state.phase !== 'red') stepCls[1] = 'green';
    if (state.phase === 'done') stepCls[2] = 'green';
    const cur = state.phase === 'red' ? (allGreen(res) ? 1 : 0) : state.phase === 'green' ? 2 : 3;
    steps.replaceChildren(...t.steps.map((s, i) => h('li', { class: `${stepCls[i]} ${i === cur ? 'cur' : ''}`, 'aria-current': i === cur ? 'step' : undefined }, `${i + 1}. ${s}${stepCls[i] === 'green' || (i === 0 && state.phase !== 'red') ? ' ✓' : ''}`)));
    list.replaceChildren(...res.map((r, i) => h('li', {}, pill(r.ok ? 'ok' : 'bad', r.ok ? '✓' : '✗'), ' ', TITLES[lang][i], !r.ok && r.msg ? h('span', { class: 'msg' }, r.msg) : null)));
    status.className = `sim-callout ${state.phase === 'done' ? 'ok' : broke ? 'bad' : ''}`;
    status.textContent = state.phase === 'done' ? t.done : broke ? t.broke : state.phase === 'green' ? t.green : t.red;
    cleanBtn.hidden = state.phase !== 'green';
  }

  function run() {
    code = ed ? ed.get() : code;
    const res = runTdd(code, lang);
    broke = state.phase !== 'red' && !allGreen(res);
    state = advance(state, code, res);
    paint(res);
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
          h('button', { class: 'btn ghost', type: 'button', onclick: () => { ed?.set(SOLUTION); code = SOLUTION; run(); } }, t.solution)))),
    status));
  paint(runTdd(STUB, lang));
  codeEditor(editHost, STUB, (s) => { code = s; }, t.label).then((e) => { ed = e; });
}
