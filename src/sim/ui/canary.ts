import { EXERCISE_DE } from '../../data/exercise-copy';
import { h, segmented, sleep, reducedMotion, rng, roleTag, resultPanel, type Lang, type ResultView, type TagKind } from './kit';
import { STAGES, runStage, canaryOutcome, canaryReport, type Bug, type StageResult, type CanaryOutcome } from '../engine/canary';

type CV = CanaryOutcome['values'];
const BUG_TAG: Record<Bug, TagKind> = { none: 'correct', errors: 'bug', silent: 'bug' };
const p1 = (x: number | undefined, lang: Lang) => `${(x ?? 0).toFixed(1).replace('.', lang === 'de' ? ',' : '.')}${lang === 'de' ? ' %' : '%'}`;
const n = (x: number, lang: Lang) => x.toLocaleString(lang);
const R = {
  en: {
    verdict: {
      'rollback-errors': (v: CV) => `Rolled back automatically at ${v.weight}%. The error rate of v2 crossed its limit`,
      'rollback-business': (v: CV) => `Rolled back automatically at ${v.weight}%. The wrong-price rate of v2 crossed its limit`,
      'false-alarm': (v: CV) => `Rolled back automatically at ${v.weight}%, but not because of a bug in v2`,
      promoted: () => 'Promoted to 100%. Every analysis step passed',
      'silent-missed': () => 'Promoted to 100%, but v2 has a silent bug',
      missed: () => 'Promoted to 100%, but v2 has a bug',
    } as Record<CanaryOutcome['causeId'], (v: CV) => string>,
    why: {
      'rollback-errors': (v: CV, l: Lang) => [`At ${v.weight}%, ${v.v2Hits} of ${v.v2Req} requests to v2 failed. That is an error rate of ${p1(v.v2Rate, l)}. The limit is ${p1(v.limit, l)}: v1 had ${p1(v.v1Rate, l)}, plus 1 point.`, `The rollout stopped at step ${v.stage} of ${STAGES.length}. ${n(v.affected, l)} requests hit the bug, not all users.`],
      'rollback-business': (v: CV, l: Lang) => [`At ${v.weight}%, ${v.v2Hits} of ${v.v2Req} reservations on v2 had a wrong price. That is ${p1(v.v2Rate, l)}. The limit is ${p1(v.limit, l)}: v1 had ${p1(v.v1Rate, l)}, plus 1 point.`, `All of these requests returned status 200. Only the business metric shows the bug. ${n(v.affected, l)} requests hit it before the rollback.`],
      'false-alarm': (v: CV, l: Lang) => [`At ${v.weight}%, only ${v.v2Req} requests reached v2. ${v.v2Hits} of them failed by chance: ${p1(v.v2Rate, l)}, above the limit of ${p1(v.limit, l)}.`, 'With few requests, one or two errors change the rate a lot. Real analyses set a minimum number of requests or measure more than once.'],
      promoted: (v: CV, l: Lang) => [`v2 has no bug. Its error rate stayed below the limit at each step: ${v.stages.filter((s) => s.weight < 100).map((s) => `${s.weight}%: ${p1(s.v2Err, l)}`).join(', ')}.`, 'Each step compares v2 with v1 in the same time window.'],
      'silent-missed': (v: CV, l: Lang) => [`v2 returned a wrong price on ${n(v.wrong, l)} of ${n(v.v2Total, l)} requests. Each of them had status 200, so the error rate of v2 stayed near the rate of v1.`, 'The analysis did not measure prices. A canary only finds what it measures.'],
      missed: () => ['v2 has a bug, but no step crossed the limit. This is chance: with few requests per step, the rates vary.'],
    } as Record<CanaryOutcome['causeId'], (v: CV, l: Lang) => string[]>,
    use: {
      'rollback-errors': 'The agent gets the step, the metric, the measured rate and the limit. It can reproduce the failing requests against v2 and fix the crash before the next rollout.',
      'rollback-business': 'The agent gets the wrong-price rate, although every request was a success. It can compare v2 prices with v1 prices and find the wrong calculation.',
      'false-alarm': 'The agent gets a failed step for a version without this bug. It must look at the request count before it changes code.',
      promoted: 'The agent gets a promoted rollout. Promoted means "no watched metric crossed its limit", not "no bug".',
      'silent-missed': 'The agent gets a promoted rollout and no signal. It cannot fix a bug that no metric shows.',
      missed: 'The agent gets a promoted rollout. The bug ships, because no step crossed the limit.',
    } as Record<CanaryOutcome['causeId'], string>,
    next: {
      'rollback-errors': 'Select **a silent bug** and start the rollout again.',
      'rollback-business': 'Select **no bug** and start the rollout again.',
      'false-alarm': 'Start the rollout again. Each run sends new random traffic.',
      promoted: 'Select **a crash bug** and start the rollout again.',
      'silent-missed': 'Switch on the business metric and start the rollout again.',
      missed: 'Start the rollout again. Each run sends new random traffic.',
    } as Record<CanaryOutcome['causeId'], string>,
  },
  de: {
    verdict: {
      'rollback-errors': (v: CV) => `Bei ${v.weight} % automatisch zurückgerollt. Die Fehlerrate von v2 hat ihre Grenze überschritten`,
      'rollback-business': (v: CV) => `Bei ${v.weight} % automatisch zurückgerollt. Die Falschpreis-Rate von v2 hat ihre Grenze überschritten`,
      'false-alarm': (v: CV) => `Bei ${v.weight} % automatisch zurückgerollt, aber nicht wegen eines Fehlers in v2`,
      promoted: () => 'Auf 100 % ausgerollt. Jeder Analyseschritt hat bestanden',
      'silent-missed': () => 'Auf 100 % ausgerollt, aber v2 hat einen stillen Fehler',
      missed: () => 'Auf 100 % ausgerollt, aber v2 hat einen Fehler',
    } as Record<CanaryOutcome['causeId'], (v: CV) => string>,
    why: {
      'rollback-errors': (v: CV, l: Lang) => [`Bei ${v.weight} % sind ${v.v2Hits} von ${v.v2Req} Anfragen an v2 gescheitert. Das ist eine Fehlerrate von ${p1(v.v2Rate, l)}. Die Grenze ist ${p1(v.limit, l)}: v1 hatte ${p1(v.v1Rate, l)}, plus 1 Punkt.`, `Der Rollout stoppte bei Schritt ${v.stage} von ${STAGES.length}. ${n(v.affected, l)} Anfragen trafen den Fehler, nicht alle Nutzer.`],
      'rollback-business': (v: CV, l: Lang) => [`Bei ${v.weight} % hatten ${v.v2Hits} von ${v.v2Req} Reservierungen auf v2 einen falschen Preis. Das sind ${p1(v.v2Rate, l)}. Die Grenze ist ${p1(v.limit, l)}: v1 hatte ${p1(v.v1Rate, l)}, plus 1 Punkt.`, `Alle diese Anfragen lieferten Status 200. Nur die Geschäftsmetrik zeigt den Fehler. ${n(v.affected, l)} Anfragen trafen ihn vor dem Rollback.`],
      'false-alarm': (v: CV, l: Lang) => [`Bei ${v.weight} % erreichten nur ${v.v2Req} Anfragen v2. ${v.v2Hits} davon scheiterten zufällig: ${p1(v.v2Rate, l)}, über der Grenze von ${p1(v.limit, l)}.`, 'Bei wenigen Anfragen ändern ein oder zwei Fehler die Rate stark. Echte Analysen setzen eine Mindestzahl an Anfragen oder messen mehrmals.'],
      promoted: (v: CV, l: Lang) => [`v2 hat keinen Fehler. Die Fehlerrate blieb in jedem Schritt unter der Grenze: ${v.stages.filter((s) => s.weight < 100).map((s) => `${s.weight} %: ${p1(s.v2Err, l)}`).join(', ')}.`, 'Jeder Schritt vergleicht v2 mit v1 im selben Zeitfenster.'],
      'silent-missed': (v: CV, l: Lang) => [`v2 lieferte bei ${n(v.wrong, l)} von ${n(v.v2Total, l)} Anfragen einen falschen Preis. Jede davon hatte Status 200, darum blieb die Fehlerrate von v2 nahe bei der von v1.`, 'Die Analyse hat keine Preise gemessen. Ein Canary findet nur, was er misst.'],
      missed: () => ['v2 hat einen Fehler, aber kein Schritt hat die Grenze überschritten. Das ist Zufall: Bei wenigen Anfragen pro Schritt schwanken die Raten.'],
    } as Record<CanaryOutcome['causeId'], (v: CV, l: Lang) => string[]>,
    use: {
      'rollback-errors': 'Der Agent bekommt den Schritt, die Metrik, die gemessene Rate und die Grenze. Er kann die scheiternden Anfragen gegen v2 reproduzieren und den Absturz vor dem nächsten Rollout beheben.',
      'rollback-business': 'Der Agent bekommt die Falschpreis-Rate, obwohl jede Anfrage erfolgreich war. Er kann die Preise von v2 mit denen von v1 vergleichen und die falsche Berechnung finden.',
      'false-alarm': 'Der Agent bekommt einen gescheiterten Schritt für eine Version ohne diesen Fehler. Er muss die Zahl der Anfragen prüfen, bevor er Code ändert.',
      promoted: 'Der Agent bekommt einen erfolgreichen Rollout. Erfolgreich heißt „keine beobachtete Metrik hat ihre Grenze überschritten“, nicht „kein Fehler“.',
      'silent-missed': 'Der Agent bekommt einen erfolgreichen Rollout und kein Signal. Er kann keinen Fehler beheben, den keine Metrik zeigt.',
      missed: 'Der Agent bekommt einen erfolgreichen Rollout. Der Fehler wird ausgeliefert, weil kein Schritt die Grenze überschritten hat.',
    } as Record<CanaryOutcome['causeId'], string>,
    next: {
      'rollback-errors': 'Wähle bei „Version 2 hat …“ **einen stillen Fehler** und starte den Rollout erneut.',
      'rollback-business': 'Wähle bei „Version 2 hat …“ **keinen Fehler** und starte den Rollout erneut.',
      'false-alarm': 'Starte den Rollout erneut. Jeder Lauf schickt neuen zufälligen Verkehr.',
      promoted: 'Wähle bei „Version 2 hat …“ **einen Absturzfehler** und starte den Rollout erneut.',
      'silent-missed': 'Schalte die Geschäftsmetrik ein und starte den Rollout erneut.',
      missed: 'Starte den Rollout erneut. Jeder Lauf schickt neuen zufälligen Verkehr.',
    } as Record<CanaryOutcome['causeId'], string>,
  },
};

/** Map the engine outcome to panel text. */
export function canaryView(o: CanaryOutcome, report: string, lang: Lang): ResultView {
  const r = R[lang], c = o.causeId;
  return { status: o.status, verdict: r.verdict[c](o.values), why: r.why[c](o.values, lang), agent: { tool: lang === 'en' ? 'canary analysis (neutral format)' : 'Canary-Analyse (neutrales Format)', output: report, use: r.use[c] }, next: r.next[c] };
}

const T = {
  en: {
    intro: 'v2 rolls out at 5%, 25%, 50%, and 100% traffic; automated checks compare v2 to v1 after each stage. Pick a bug in v2 and whether a business metric is checked.',
    bug: 'Version 2 has…', bugs: { none: 'no bug', errors: 'a crash bug (8% errors)', silent: 'a silent bug (wrong price, status 200)' },
    biz: 'Analysis also watches a business metric: share of reservations with the correct price',
    start: 'Start rollout', users: 'users', stage: 'Stage', err: 'errors', wrong: 'wrong price', decision: 'Decision',
    promote: 'continue', rollback: 'roll back', reasons: { errors: 'v2 error rate above v1 + 1%', business: 'v2 wrong-price rate above v1 + 1%' },
    notMeasured: 'not measured',
    chart: 'Traffic diagram: requests go from users to v1 or v2; the share for v2 grows with each stage. Requests that hit the bug are coloured. The table below lists each stage.',
  },
  de: {
    intro: EXERCISE_DE.canary.intro,
    bug: 'Version 2 hat …', bugs: { none: 'keinen Fehler', errors: 'einen Absturzfehler (8 % Fehler)', silent: 'einen stillen Fehler (falscher Preis, Status 200)' },
    biz: 'Analyse beobachtet auch eine Geschäftsmetrik: Anteil der Reservierungen mit korrektem Preis',
    start: 'Rollout starten', users: 'Nutzer', stage: 'Stufe', err: 'Fehler', wrong: 'falscher Preis', decision: 'Entscheidung',
    promote: 'weiter', rollback: 'zurückrollen', reasons: { errors: 'Fehlerrate v2 über v1 + 1 %', business: 'Falschpreis-Rate v2 über v1 + 1 %' },
    notMeasured: 'nicht gemessen',
    chart: 'Verkehrsdiagramm: Anfragen gehen von den Nutzern an v1 oder v2; der Anteil für v2 wächst mit jeder Stufe. Anfragen, die den Fehler treffen, sind farbig. Die Tabelle darunter listet jede Stufe.',
  },
};

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  const S = { bug: 'errors' as Bug, biz: false, run: 0 };
  const W = 640, H = 170;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'sim-chart');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', t.chart);
  const tbody = h('tbody');
  const panel = resultPanel(lang);
  const startBtn = h('button', { class: 'btn', type: 'button', onclick: () => start() }, t.start);

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, t.intro),
    h('div', { class: 'sim-row' }, segmented(t.bug, (['none', 'errors', 'silent'] as Bug[]).map((b) => ({ value: b, label: t.bugs[b], tag: roleTag(BUG_TAG[b], lang) })), S.bug, (v) => { S.bug = v; reset(); })),
    h('label', { class: 'inline' }, h('input', { type: 'checkbox', onchange: (e: Event) => { S.biz = (e.target as HTMLInputElement).checked; reset(); } }), t.biz, ' ', roleTag('gate', lang)),
    h('div', { class: 'sim-row' }, startBtn),
    h('div', { class: 'sim-card' }, svg),
    h('table', { class: 'sim-table' }, h('thead', {}, h('tr', {}, h('th', {}, t.stage), h('th', {}, 'v1'), h('th', {}, 'v2'), h('th', {}, t.decision))), tbody),
    panel.el,
  ));

  type Dot = { x: number; lane: 1 | 2; bad: boolean; el: SVGCircleElement };
  let dots: Dot[] = [];
  let weight = 0;
  const laneY = (l: 1 | 2) => (l === 1 ? 52 : 122);

  function frame(svgW = W) {
    svg.innerHTML = `
      <rect x="4" y="66" width="70" height="40" rx="6" fill="var(--paper-2)" stroke="var(--rule-strong)"/><text x="39" y="90" text-anchor="middle">${t.users}</text>
      <rect x="${svgW - 130}" y="28" width="120" height="48" rx="6" fill="color-mix(in srgb, var(--l-static) 14%, var(--card))" stroke="var(--l-static)"/>
      <text x="${svgW - 70}" y="56" text-anchor="middle" style="fill:var(--ink);font-weight:700">v1 · ${100 - weight}%</text>
      <rect x="${svgW - 130}" y="98" width="120" height="48" rx="6" fill="color-mix(in srgb, var(--l-verification) 16%, var(--card))" stroke="var(--l-verification)"/>
      <text x="${svgW - 70}" y="126" text-anchor="middle" style="fill:var(--ink);font-weight:700">v2 · ${weight}%</text>`;
    for (const d of dots) svg.append(d.el);
  }

  function spawn(r: () => number) {
    const lane: 1 | 2 = r() * 100 < weight ? 2 : 1;
    const bad = lane === 2 && S.bug !== 'none' && r() < (S.bug === 'errors' ? 0.08 : 0.3);
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    el.setAttribute('r', '4');
    el.setAttribute('fill', bad ? (S.bug === 'errors' ? 'var(--bad)' : 'var(--warn)') : 'var(--ink-3)');
    dots.push({ x: 74, lane, bad, el });
  }

  let anim = 0;
  function animate(r: () => number) {
    cancelAnimationFrame(anim);
    const loop = () => {
      if (Math.random() < 0.6) spawn(r);
      for (const d of dots) {
        d.x += 4;
        const tx = W - 140, y0 = 86, y1 = laneY(d.lane);
        const p = Math.min(1, (d.x - 74) / (tx - 74));
        d.el.setAttribute('cx', String(d.x));
        d.el.setAttribute('cy', String(y0 + (y1 - y0) * Math.min(1, p * 1.6)));
      }
      dots = dots.filter((d) => { if (d.x > W - 140) { d.el.remove(); return false; } return true; });
      anim = requestAnimationFrame(loop);
    };
    anim = requestAnimationFrame(loop);
  }

  function row(s: StageResult) {
    const pct = (n: number, d: number) => (d ? `${((100 * n) / d).toFixed(1)}%` : '–');
    const cell = (c: StageResult['v1']) => h('td', {}, `${t.err} ${pct(c.err, c.req)}`, h('br'), h('span', { class: 'muted small' }, S.biz ? `${t.wrong} ${pct(c.wrong, c.req)}` : `${t.wrong}: ${t.notMeasured}`));
    return h('tr', { class: s.decision === 'rollback' ? 'cur' : '' }, h('td', {}, `${s.weight}%`), cell(s.v1), cell(s.v2),
      h('td', {}, s.decision === 'rollback' ? h('span', { class: 'sim-pill bad' }, `↩ ${t.rollback}`) : h('span', { class: 'sim-pill ok' }, `→ ${t.promote}`), s.reason ? h('div', { class: 'sim-hint' }, t.reasons[s.reason]) : ''));
  }

  function reset() { S.run++; cancelAnimationFrame(anim); dots = []; weight = 0; tbody.replaceChildren(); panel.clear(); frame(); startBtn.disabled = false; }

  async function start() {
    reset();
    const id = S.run;
    startBtn.disabled = true;
    const r = rng(1000 + S.run);
    const stages: StageResult[] = [];
    if (!reducedMotion()) animate(rng(S.run));
    for (const w of STAGES) {
      weight = w; frame();
      if (!reducedMotion()) await sleep(1400);
      if (id !== S.run) return;
      const s = runStage(w, { bug: S.bug, businessMetric: S.biz, seed: 0 }, r);
      stages.push(s);
      tbody.append(row(s));
      if (s.decision === 'rollback') { weight = 0; frame(); break; }
    }
    if (!reducedMotion()) await sleep(900);
    cancelAnimationFrame(anim); dots = []; frame();
    const opts = { bug: S.bug, businessMetric: S.biz };
    panel.show(canaryView(canaryOutcome(opts, stages), canaryReport(opts, stages), lang));
    startBtn.disabled = false;
  }
  frame();
}
