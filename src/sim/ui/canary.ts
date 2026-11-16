import { h, segmented, sleep, reducedMotion, rng, type Lang } from './kit';
import { STAGES, runStage, affected, type Bug, type StageResult } from '../engine/canary';

const T = {
  en: {
    intro: 'Version 2 of the reservation service is rolled out in steps: 5%, 25%, 50%, 100% of traffic. After each step an automated analysis compares v2 with v1 and either continues or rolls back. Choose what is wrong with v2 and whether the analysis watches a business metric.',
    bug: 'Version 2 has…', bugs: { none: 'no bug', errors: 'a crash bug (8% errors)', silent: 'a silent bug (wrong price, status 200)' },
    biz: 'Analysis also watches a business metric: share of reservations with the correct price',
    start: 'Start rollout', users: 'users', stage: 'Stage', err: 'errors', wrong: 'wrong price', decision: 'Decision',
    promote: 'continue', rollback: 'roll back', reasons: { errors: 'v2 error rate above v1 + 1%', business: 'v2 wrong-price rate above v1 + 1%' },
    resultOk: 'Promoted to 100%.', resultRollback: (w: number) => `Rolled back automatically at ${w}%.`,
    affected: (n: number) => `${n.toLocaleString('en')} requests hit the bug before the rollout ended.`,
    notMeasured: 'not measured',
    silentMiss: 'The silent bug reached everyone: every request returned status 200, so the error-rate check saw nothing wrong. A canary is only as good as what it measures.',
  },
  de: {
    intro: 'Version 2 des Reservierungsdienstes wird stufenweise ausgerollt: 5 %, 25 %, 50 %, 100 % des Verkehrs. Nach jeder Stufe vergleicht eine automatische Analyse v2 mit v1 und macht weiter oder rollt zurück. Wähle, was an v2 falsch ist, und ob die Analyse eine Geschäftsmetrik beobachtet.',
    bug: 'Version 2 hat …', bugs: { none: 'keinen Fehler', errors: 'einen Absturzfehler (8 % Fehler)', silent: 'einen stillen Fehler (falscher Preis, Status 200)' },
    biz: 'Analyse beobachtet auch eine Geschäftsmetrik: Anteil der Reservierungen mit korrektem Preis',
    start: 'Rollout starten', users: 'Nutzer', stage: 'Stufe', err: 'Fehler', wrong: 'falscher Preis', decision: 'Entscheidung',
    promote: 'weiter', rollback: 'zurückrollen', reasons: { errors: 'Fehlerrate v2 über v1 + 1 %', business: 'Falschpreis-Rate v2 über v1 + 1 %' },
    resultOk: 'Auf 100 % ausgerollt.', resultRollback: (w: number) => `Bei ${w} % automatisch zurückgerollt.`,
    affected: (n: number) => `${n.toLocaleString('de')} Anfragen trafen den Fehler, bevor der Rollout endete.`,
    notMeasured: 'nicht gemessen',
    silentMiss: 'Der stille Fehler erreichte alle: Jede Anfrage lieferte Status 200, also sah die Fehlerraten-Prüfung nichts. Ein Canary ist nur so gut wie das, was er misst.',
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
  const tbody = h('tbody');
  const result = h('div', { class: 'sim-callout', hidden: true });
  const startBtn = h('button', { class: 'btn', type: 'button', onclick: () => start() }, t.start);

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, t.intro),
    h('div', { class: 'sim-row' }, h('span', { class: 'small muted' }, t.bug), segmented(t.bug, (['none', 'errors', 'silent'] as Bug[]).map((b) => ({ value: b, label: t.bugs[b] })), S.bug, (v) => { S.bug = v; reset(); })),
    h('label', { class: 'inline' }, h('input', { type: 'checkbox', onchange: (e: Event) => { S.biz = (e.target as HTMLInputElement).checked; reset(); } }), t.biz),
    h('div', { class: 'sim-row' }, startBtn),
    h('div', { class: 'sim-card' }, svg),
    h('table', { class: 'sim-table' }, h('thead', {}, h('tr', {}, h('th', {}, t.stage), h('th', {}, 'v1'), h('th', {}, 'v2'), h('th', {}, t.decision))), tbody),
    result,
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

  function reset() { S.run++; cancelAnimationFrame(anim); dots = []; weight = 0; tbody.replaceChildren(); result.hidden = true; frame(); startBtn.disabled = false; }

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
    const last = stages.at(-1)!;
    const rolled = last.decision === 'rollback';
    result.hidden = false;
    result.className = `sim-callout ${rolled ? 'ok' : S.bug === 'none' ? 'ok' : 'bad'}`;
    result.replaceChildren(h('p', {}, h('strong', {}, rolled ? t.resultRollback(last.weight) : t.resultOk)), S.bug !== 'none' ? h('p', {}, t.affected(affected(stages))) : '', !rolled && S.bug === 'silent' ? h('p', {}, t.silentMiss) : '');
    startBtn.disabled = false;
  }
  frame();
}
