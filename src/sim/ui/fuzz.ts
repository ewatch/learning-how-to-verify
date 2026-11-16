import { h, codeView, type Lang } from './kit';
import { createFuzzer, step, PARSER_SOURCE, TOTAL_BRANCHES, type FuzzState } from '../engine/fuzz';

const T = {
  en: {
    intro: 'Two fuzzers attack the petstore\'s search parser, which reads queries such as flat -category:fish price<50. Both start from the same one example and mutate it randomly. The blind one never learns; the coverage-guided one keeps every input that reached new code and mutates those further. Somewhere deep inside the parser is a crash.',
    start: 'Start both fuzzers', stop: 'Stop', reset: 'Reset', dict: 'Use a dictionary of keywords', blind: 'Blind', guided: 'Coverage-guided',
    its: 'inputs tried', branches: 'branches covered', corpus: 'corpus size', newInputs: 'Inputs that found new code', crash: 'Crash found', minimal: 'minimised to', after: (n: number) => `after ${n.toLocaleString('en')} inputs`,
    noCrash: 'No crash yet.', parser: 'Show the parser', chart: 'Branches covered over time',
    lesson: 'The blind fuzzer almost never gets past "p", "pr", "pri"…: hitting "price<" by chance is like rolling the right 6 characters at once. The guided fuzzer keeps each small step that reached new code, so it walks in one character at a time.',
  },
  de: {
    intro: 'Zwei Fuzzer greifen den Suchparser des Petstores an, der Anfragen wie flat -category:fish price<50 liest. Beide starten mit demselben einen Beispiel und mutieren es zufällig. Der blinde lernt nie; der coverage-gelenkte behält jede Eingabe, die neuen Code erreichte, und mutiert diese weiter. Tief im Parser steckt ein Absturz.',
    start: 'Beide Fuzzer starten', stop: 'Stopp', reset: 'Zurücksetzen', dict: 'Wörterbuch mit Schlüsselwörtern nutzen', blind: 'Blind', guided: 'Coverage-gelenkt',
    its: 'Eingaben probiert', branches: 'Zweige abgedeckt', corpus: 'Korpusgröße', newInputs: 'Eingaben, die neuen Code fanden', crash: 'Absturz gefunden', minimal: 'minimiert zu', after: (n: number) => `nach ${n.toLocaleString('de')} Eingaben`,
    noCrash: 'Noch kein Absturz.', parser: 'Parser zeigen', chart: 'Abgedeckte Zweige über die Zeit',
    lesson: 'Der blinde Fuzzer kommt fast nie über „p“, „pr“, „pri“ … hinaus: „price<“ zufällig zu treffen ist, als würfle man 6 richtige Zeichen auf einmal. Der gelenkte Fuzzer behält jeden kleinen Schritt, der neuen Code erreichte, und arbeitet sich Zeichen für Zeichen hinein.',
  },
};

const MAX_IT = 60000;

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  let seed = 1 + Math.floor(Math.random() * 1000);
  let useDict = false;
  let running = false;
  let A: FuzzState, B: FuzzState;
  const startBtn = h('button', { class: 'btn', type: 'button' }, t.start);
  const resetBtn = h('button', { class: 'btn ghost', type: 'button' }, t.reset);
  const dict = h('label', { class: 'inline' }, h('input', { type: 'checkbox', onchange: (e: Event) => { useDict = (e.target as HTMLInputElement).checked; reset(); } }), t.dict);
  const chart = h('div');
  const lesson = h('div', { class: 'sim-callout', hidden: true }, t.lesson);

  const panel = (title: string) => {
    const stats = h('div', { class: 'sim-row small' });
    const crash = h('div', { class: 'small muted' }, t.noCrash);
    const list = h('ul', { tabindex: 0, class: 'sim-log', style: 'max-height:160px' });
    const el = h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, title), stats, crash, h('div', { class: 'small muted', style: 'margin-top:6px' }, t.newInputs), list);
    return { el, stats, crash, list };
  };
  const pb = panel(t.blind), pg = panel(t.guided);

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, t.intro),
    h('details', { class: 'disclose' }, h('summary', {}, t.parser), h('div', { class: 'body' }, codeView(PARSER_SOURCE))),
    h('div', { class: 'sim-row' }, startBtn, resetBtn, dict),
    h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.chart), chart),
    h('div', { class: 'sim-cols' }, pb.el, pg.el),
    lesson,
  ));

  function drawChart() {
    const W = 600, H = 150, P = 28;
    const x = (it: number) => P + ((W - P - 6) * it) / MAX_IT;
    const y = (c: number) => H - 18 - ((H - 30) * c) / TOTAL_BRANCHES;
    const line = (s: FuzzState) => s.history.map((p, i) => `${i ? 'L' : 'M'}${x(p.it).toFixed(1)} ${y(p.cov).toFixed(1)}`).join(' ');
    const mark = (s: FuzzState, c: string) => s.crash ? `<circle cx="${x(s.crash.at)}" cy="${y(s.seen.size)}" r="5" fill="${c}"/><text x="${x(s.crash.at) + 8}" y="${y(s.seen.size) + 4}">💥</text>` : '';
    chart.innerHTML = `<svg class="sim-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t.chart}">
      <line x1="${P}" y1="${y(TOTAL_BRANCHES)}" x2="${W - 6}" y2="${y(TOTAL_BRANCHES)}" stroke="var(--rule)" stroke-dasharray="3 3"/>
      <text x="2" y="${y(TOTAL_BRANCHES) + 4}">${TOTAL_BRANCHES}</text><text x="8" y="${y(0) + 4}">0</text>
      <text x="${W - 6}" y="${H - 2}" text-anchor="end">${MAX_IT.toLocaleString(lang)}</text>
      <path d="${line(A)}" fill="none" stroke="var(--ink-3)" stroke-width="2"/>
      <path d="${line(B)}" fill="none" stroke="var(--l-static)" stroke-width="2.5"/>
      ${mark(A, 'var(--ink-3)')}${mark(B, 'var(--bad)')}
      <text x="${W - 10}" y="${y(A.seen.size) + 14}" text-anchor="end">${t.blind}</text>
      <text x="${W - 10}" y="${y(B.seen.size) - 6}" text-anchor="end" style="fill:var(--l-static)">${t.guided}</text>
    </svg>`;
  }

  function renderPanel(p: ReturnType<typeof panel>, s: FuzzState) {
    p.stats.replaceChildren(
      h('span', {}, h('b', {}, s.iterations.toLocaleString(lang)), ` ${t.its}`), ' · ',
      h('span', {}, h('b', {}, String(s.seen.size)), `/${TOTAL_BRANCHES} ${t.branches}`), ' · ',
      h('span', {}, h('b', {}, String(s.corpus.length)), ` ${t.corpus}`));
    if (s.crash) {
      p.crash.className = 'sim-callout bad';
      p.crash.replaceChildren(h('p', {}, h('strong', {}, `💥 ${t.crash} `), t.after(s.crash.at)), h('p', {}, h('code', {}, JSON.stringify(s.crash.input)), ` → ${t.minimal} `, h('code', {}, JSON.stringify(s.crash.minimal))), h('p', { class: 'small' }, s.crash.error));
    }
    p.list.replaceChildren(...s.corpus.slice(-12).map((c) => h('li', { class: 'new' }, JSON.stringify(c))));
  }

  function reset() {
    running = false; startBtn.textContent = t.start;
    seed = 1 + Math.floor(Math.random() * 1000);
    A = createFuzzer('blind', seed, useDict); B = createFuzzer('guided', seed, useDict);
    pb.crash.className = 'small muted'; pb.crash.textContent = t.noCrash;
    pg.crash.className = 'small muted'; pg.crash.textContent = t.noCrash;
    lesson.hidden = true;
    renderPanel(pb, A); renderPanel(pg, B); drawChart();
  }

  function tick() {
    if (!running) return;
    if (!A.crash && A.iterations < MAX_IT) step(A, 400);
    if (!B.crash && B.iterations < MAX_IT) step(B, 400);
    renderPanel(pb, A); renderPanel(pg, B); drawChart();
    const done = (A.crash || A.iterations >= MAX_IT) && (B.crash || B.iterations >= MAX_IT);
    if (done || (B.crash && A.iterations >= Math.min(MAX_IT, B.crash.at * 3))) { running = false; startBtn.textContent = t.start; lesson.hidden = false; return; }
    requestAnimationFrame(tick);
  }

  startBtn.addEventListener('click', () => {
    if (running) { running = false; startBtn.textContent = t.start; return; }
    if (A.crash || B.crash || A.iterations >= MAX_IT) reset();
    running = true; startBtn.textContent = t.stop; requestAnimationFrame(tick);
  });
  resetBtn.addEventListener('click', reset);
  reset();
}
