import { h, sleep, reducedMotion } from '../../sim/ui/kit';
import * as D from './data';
import type { Lang, Mode } from './specs';

export interface View { initial: boolean; render(stage: HTMLElement, on: boolean, alive: () => boolean): void | Promise<void> }

const NS = 'http://www.w3.org/2000/svg';
type A = Record<string, string | number>;
function s<K extends keyof SVGElementTagNameMap>(tag: K, attrs: A = {}, ...kids: (Node | string)[]): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  e.append(...kids);
  return e;
}
const L = (lang: Lang, en: string, de: string) => (lang === 'en' ? en : de);
const style = (e: HTMLElement | SVGElement, k: string, v: string) => e.style.setProperty(k, v);
const fmt1 = (n: number) => n.toFixed(1);
const text = (x: number, y: number, t: string, cls = '', anchor = 'start') => s('text', { x, y, class: `ob-t ${cls}`, 'text-anchor': anchor }, t);

// ---------- tracing ----------
function tracing(): View {
  const full = D.traceTotal(D.traceSpans(false));
  return { initial: false, render(stage, batched) {
    const spans = D.traceSpans(batched);
    const total = D.traceTotal(spans);
    const rows = h('div', { class: 'ob-rows', role: 'list' });
    spans.forEach((sp, i) => {
      const bar = h('span', { class: `ob-bar${sp.hot ? ' hot' : ''}${sp.id === 'inv' ? ' ok' : ''}` });
      style(bar, 'left', `${(sp.start / full) * 100}%`); style(bar, 'width', `${(sp.dur / full) * 100}%`); style(bar, '--i', String(i));
      const label = h('span', { class: 'ob-lbl', style: `padding-left:${sp.depth * 8}px` }, sp.label);
      rows.append(h('div', { class: 'ob-row', role: 'listitem', 'aria-label': `${sp.label}, ${sp.dur} ms` }, label, h('span', { class: 'ob-track' }, bar)));
    });
    const n = D.inventoryCalls(spans);
    stage.append(
      h('div', { class: 'ob-stats' },
        h('span', { class: 'ob-stat' }, h('b', {}, `${total} ms`), ' total'),
        h('span', { class: `ob-stat${n > 1 ? ' bad' : ' good'}` }, h('b', {}, `${n}×`), ' inventory', n > 1 ? h('span', { class: 'ob-badge bad' }, 'N+1') : null)),
      rows);
  } };
}

// ---------- profiling ----------
function profiling(lang: Lang): View {
  return { initial: false, render(stage, v15) {
    const rel: D.Release = v15 ? '1.5' : '1.4';
    const frames = D.flameFrames(rel);
    const read = h('p', { class: 'ob-read', 'aria-live': 'polite' });
    const show = (f: D.Frame) => { read.textContent = `${f.name}: ${f.pct} % CPU${v15 && f.depth ? ` (${L(lang, 'was', 'vorher')} ${f.prev} %)` : ''}`; };
    const flame = h('div', { class: 'ob-flame', role: 'list' });
    frames.forEach((f, i) => {
      const d = D.frameDelta(f, rel);
      const cls = v15 && f.depth > 0 ? (d > 5 ? ' bad' : d < -3 ? ' good' : '') : '';
      const b = h('button', { type: 'button', class: `ob-frame${cls}`, role: 'listitem', 'aria-label': `${f.name}, ${f.pct} % CPU`, onmouseenter: () => show(f), onfocus: () => show(f), onclick: () => show(f) }, h('span', {}, f.name));
      style(b, 'left', `${f.x}%`); style(b, 'width', `${f.pct}%`); style(b, 'bottom', `${f.depth * 34}px`); style(b, '--i', String(i));
      flame.append(b);
    });
    const json = frames.find((f) => f.name === 'parse JSON')!;
    read.textContent = L(lang, `Hover a frame. parse JSON: ${json.pct} %`, `Frame wählen. parse JSON: ${json.pct} %`);
    stage.append(flame, read);
  } };
}

// ---------- logs & events ----------
function logsEvents(lang: Lang): View {
  return { initial: false, async render(stage, free, alive) {
    const evs = D.eventStream();
    const lines = free ? D.freeTextLines(evs) : evs.map(D.structuredLine);
    const log = h('div', { class: 'ob-log', role: 'log', tabindex: 0, 'aria-label': 'events' });
    const query = h('code', { class: 'ob-query' }, 'count(active reservations per pet) ≤ 1');
    const result = h('p', { class: 'ob-alert idle', role: 'status' }, L(lang, 'Query waiting', 'Abfrage wartet'));
    stage.append(log, query, result);
    const finish = () => {
      const q = D.queryLines(lines);
      const v = q.violations[0];
      if (v) {
        const [a, b] = v;
        evs.forEach((e, i) => { if (e === a || e === b) log.children[i]?.classList.add('viol'); });
        result.className = 'ob-alert bad';
        result.textContent = `${L(lang, 'Alert', 'Alarm')}: ${a.petId[0]!.toUpperCase()}${a.petId.slice(1)} ${L(lang, 'reserved twice', 'doppelt reserviert')} (${a.person} + ${b.person})`;
      } else {
        result.className = 'ob-alert warn';
        result.textContent = L(lang, `${q.parsed} of ${q.total} lines parsed: nothing found`, `${q.parsed} von ${q.total} Zeilen lesbar: nichts gefunden`);
      }
    };
    const fast = reducedMotion();
    for (let i = 0; i < lines.length; i++) {
      if (!alive()) return;
      log.append(h('div', { class: `ob-ev ${free ? 'free' : evs[i]!.type}` }, ...(free ? [lines[i]!] : [h('span', { class: 'ob-chip' }, evs[i]!.type), h('span', {}, evs[i]!.petId), h('span', { class: 'muted' }, evs[i]!.person)])));
      log.scrollTop = log.scrollHeight;
      if (!fast) await sleep(110);
    }
    if (alive()) finish();
  } };
}

// ---------- monitoring ----------
function monitoring(lang: Lang): View {
  const series = D.monitoringScenario();
  const names: Record<D.Signal, [string, string]> = {
    latency: ['latency', 'latency'], traffic: ['traffic', 'traffic'], errors: ['errors', 'errors'], saturation: ['saturation', 'saturation'], reservations: ['reservations/min', 'Reservierungen/min'],
  };
  return { initial: true, async render(stage, _on, alive) {
    const grid = h('div', { class: 'ob-spark-grid' });
    const cells = new Map<D.Signal, { path: SVGPathElement; state: HTMLElement; val: HTMLElement; cell: HTMLElement }>();
    for (const k of D.SIGNALS) {
      const vals = series[k];
      const max = Math.max(...vals) * 1.15, min = k === 'reservations' ? 0 : Math.min(...vals) * 0.7;
      const path = s('path', { class: 'ob-line', fill: 'none', 'stroke-width': 2 });
      path.dataset.max = String(max); path.dataset.min = String(min);
      const svg = s('svg', { viewBox: '0 0 150 40', class: 'ob-spark', role: 'img', 'aria-label': names[k][lang === 'en' ? 0 : 1] }, path);
      const state = h('span', { class: 'ob-dot' });
      const val = h('span', { class: 'ob-val' });
      const cell = h('div', { class: `ob-cell${k === 'reservations' ? ' biz' : ''}` }, h('div', { class: 'ob-cell-h' }, state, h('span', {}, names[k][lang === 'en' ? 0 : 1]), val), svg);
      grid.append(cell);
      cells.set(k, { path, state, val, cell });
    }
    const burnFill = h('span', { class: 'ob-burn-fill' });
    const burnNum = h('b', {}, '0×');
    const burn = h('div', { class: 'ob-burn' }, h('span', { class: 'ob-burn-l' }, L(lang, 'SLO burn rate', 'SLO-Burn-Rate'), ' ', burnNum), h('span', { class: 'ob-burn-bar' }, burnFill, h('i', { style: `left:${(D.BURN_ALERT / 50) * 100}%` })));
    const status = h('p', { class: 'ob-alert idle', role: 'status' }, L(lang, 'All quiet', 'Alles ruhig'));
    stage.append(grid, burn, status);
    const draw = (m: number) => {
      const al = D.alertsAt(series, m);
      for (const k of D.SIGNALS) {
        const c = cells.get(k)!;
        const vals = series[k].slice(0, m + 1);
        const mx = +c.path.dataset.max!, mn = +c.path.dataset.min!;
        c.path.setAttribute('d', vals.map((v, i) => `${i ? 'L' : 'M'}${(i / (D.MINUTES - 1)) * 148 + 1},${37 - ((v - mn) / (mx - mn)) * 34}`).join(''));
        c.val.textContent = k === 'errors' ? `${fmt1(vals.at(-1)!)} %` : k === 'latency' ? `${Math.round(vals.at(-1)!)} ms` : String(Math.round(vals.at(-1)!));
        const on = al.includes(k);
        c.cell.classList.toggle('alerting', on); c.state.className = `ob-dot${on ? ' bad' : ' ok'}`;
      }
      const br = D.burnRate(series, m);
      burnFill.style.width = `${Math.min(100, (br / 50) * 100)}%`; burnFill.classList.toggle('bad', br >= D.BURN_ALERT);
      burnNum.textContent = `${Math.round(br)}×`;
      if (al.length) { status.className = 'ob-alert bad'; status.textContent = `${L(lang, 'Alert', 'Alarm')}: ${names[al[0]!][lang === 'en' ? 0 : 1]} (${al.length === 1 ? L(lang, 'only this one', 'nur diese') : al.length})`; }
    };
    if (reducedMotion()) { draw(D.MINUTES - 1); return; }
    for (let m = 1; m < D.MINUTES; m++) { if (!alive()) return; draw(m); await sleep(70); }
  } };
}

// ---------- exception tracking ----------
function exceptionTracking(lang: Lang): View {
  const colors = ['--l-static', '--l-verification', '--l-prose', '--bad'];
  return { initial: false, render(stage, _on) {
    const bars = h('div', { class: 'ob-stack' });
    const max = Math.max(...D.RELEASES.map((r) => D.EX_GROUPS.reduce((a, g) => a + (g.counts[r] ?? 0), 0)));
    for (const rel of D.RELEASES) {
      const track = h('div', { class: 'ob-stack-track' });
      D.EX_GROUPS.forEach((g, i) => {
        const n = g.counts[rel] ?? 0;
        if (!n) return;
        const seg = h('span', { class: `ob-seg${g.fp === 'e05a' ? ' new' : ''}`, title: `${g.title} ${n}` });
        style(seg, 'width', `${(n / max) * 100}%`); style(seg, 'background', `var(${colors[i]})`); style(seg, '--i', String(rel === '1.4.2' ? i + 4 : i));
        track.append(seg);
      });
      bars.append(h('div', { class: 'ob-stack-row' }, h('span', { class: 'ob-lbl' }, rel), track));
    }
    const trace = h('pre', { class: 'ob-trace', 'aria-live': 'polite' }, L(lang, 'Select a group to see its stack.', 'Gruppe wählen, um den Stack zu sehen.'));
    const list = h('div', { class: 'ob-groups', role: 'group', 'aria-label': 'groups' });
    D.EX_GROUPS.forEach((g, i) => {
      const isNew = D.newGroups('1.4.1', '1.4.2').includes(g.fp);
      const b = h('button', { type: 'button', class: `ob-group${isNew ? ' new' : ''}`, 'aria-pressed': 'false', onclick: () => {
        list.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        trace.textContent = g.trace.join('\n');
      } }, h('i', { class: 'ob-sw', style: `background:var(${colors[i]})` }), h('span', {}, `${g.title} · ${g.where}`), isNew ? h('span', { class: 'ob-badge bad' }, L(lang, 'new', 'neu')) : null);
      list.append(b);
    });
    const alert = h('p', { class: 'ob-alert bad', role: 'status' }, L(lang, 'Alert: new group in 1.4.2', 'Alarm: neue Gruppe in 1.4.2'));
    stage.append(bars, alert, list, trace);
  } };
}

// ---------- real user monitoring ----------
function rum(lang: Lang): View {
  return { initial: true, render(stage, phones) {
    const W = 360, H = 150, x0 = 8, pw = W - 16, base = 118;
    const lab = D.labSamples(), real = D.realSamples(phones ? D.MIX_ALL : D.MIX_DESKTOP);
    const hl = D.histogram(lab), hr = D.histogram(real);
    const top = Math.max(...hl, ...hr);
    const bw = pw / hl.length;
    const X = (sec: number) => x0 + (sec / D.RUM_MAX) * pw;
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'ob-chart', role: 'img', 'aria-label': L(lang, 'Load time distributions', 'Ladezeit-Verteilungen') });
    hr.forEach((v, i) => { const hh = (v / top) * 90; const r = s('rect', { x: x0 + i * bw + 0.5, y: base - hh, width: bw - 1, height: hh, class: 'ob-hist real' }); r.style.setProperty('--i', String(i)); svg.append(r); });
    svg.append(s('path', { class: 'ob-lab', fill: 'none', 'stroke-width': 2, d: hl.map((v, i) => `${i ? 'L' : 'M'}${x0 + (i + 0.5) * bw},${base - (v / top) * 90}`).join('') }));
    svg.append(s('line', { x1: x0, x2: x0 + pw, y1: base, y2: base, class: 'ob-axis' }));
    for (const t of [0, 2, 4, 6, 8]) svg.append(text(X(t), base + 14, `${t} s`, 'muted', t === 0 ? 'start' : t === 8 ? 'end' : 'middle'));
    svg.append(s('line', { x1: X(D.LCP_BUDGET), x2: X(D.LCP_BUDGET), y1: 8, y2: base, class: 'ob-budget' }), text(X(D.LCP_BUDGET) + 4, 14, '2.5 s', 'bad'));
    const pl = D.percentile(lab, 75), pr = D.percentile(real, 75);
    svg.append(s('line', { x1: X(pl), x2: X(pl), y1: 30, y2: base, class: 'ob-p75 lab' }), s('line', { x1: X(pr), x2: X(pr), y1: 30, y2: base, class: `ob-p75 real${pr > D.LCP_BUDGET ? ' over' : ''}` }));
    const leg = h('div', { class: 'ob-legend' },
      h('span', {}, h('i', { class: 'ob-sw lab' }), `lab p75 ${fmt1(pl)} s`),
      h('span', {}, h('i', { class: 'ob-sw real' }), `${L(lang, 'real users', 'echte Nutzer')} p75 `, h('b', { class: pr > D.LCP_BUDGET ? 'bad-t' : 'ok-t' }, `${fmt1(pr)} s`)));
    stage.append(svg, leg);
  } };
}

// ---------- auditing ----------
const icon = (kind: D.AuditEvent['kind']) => {
  const g = kind === 'human'
    ? [s('circle', { cx: 8, cy: 5, r: 3 }), s('path', { d: 'M2 14c0-4 3-5 6-5s6 1 6 5z' })]
    : kind === 'agent'
      ? [s('rect', { x: 3, y: 5, width: 10, height: 8, rx: 2 }), s('path', { d: 'M8 5V2', fill: 'none', 'stroke-width': 1.5 }), s('circle', { cx: 8, cy: 2, r: 1.2 })]
      : [s('circle', { cx: 8, cy: 8, r: 6, fill: 'none', 'stroke-width': 1.5 }), s('path', { d: 'M6 6.5a2 2 0 1 1 3 1.7c-.7.4-1 .8-1 1.5', fill: 'none', 'stroke-width': 1.3 })];
  return s('svg', { viewBox: '0 0 16 16', class: `ob-icon ${kind}`, 'aria-hidden': 'true' }, ...g);
};
function auditing(lang: Lang): View {
  return { initial: false, render(stage, shared) {
    const evs = D.auditEvents(shared);
    const flags = D.auditFlags(evs);
    const list = h('ol', { class: 'ob-audit' });
    evs.forEach((e, i) => {
      const li = h('li', { class: `ob-aud${e.action === 'delete' ? ' key' : ''}${flags.includes(e) ? ' flagged' : ''}` }, h('span', { class: 'muted ob-time' }, e.time), icon(e.kind), h('b', {}, e.actor), h('span', {}, e.count > 1 ? `${e.action} ×${e.count}` : e.action), flags.includes(e) ? h('span', { class: 'ob-badge bad' }, L(lang, 'flagged', 'markiert')) : null);
      style(li, '--i', String(i)); list.append(li);
    });
    const q = h('code', { class: 'ob-query' }, 'agent actions ∉ {read, update, reserve}');
    const res = flags.length
      ? h('p', { class: 'ob-alert bad', role: 'status' }, `${L(lang, 'Alert', 'Alarm')}: ${flags[0]!.actor} ${L(lang, 'deleted', 'löschte')} ${flags[0]!.count} pets`)
      : h('p', { class: 'ob-alert warn', role: 'status' }, L(lang, '40 pets deleted: by whom? Unknown.', '40 Pets gelöscht: von wem? Unbekannt.'));
    stage.append(list, q, res);
  } };
}

// ---------- A/B tests ----------
function abTests(lang: Lang): View {
  const series = D.abSeries();
  return { initial: false, async render(stage, peek, alive) {
    const W = 360, H = 170, xl = 34, xr = 352, yt = 10, yb = 140;
    const X = (d: number) => xl + ((d - 1) / (D.AB_DAYS - 1)) * (xr - xl);
    const lo = 0.05, hi = 0.15;
    const Y = (r: number) => yb - ((Math.min(hi, Math.max(lo, r)) - lo) / (hi - lo)) * (yb - yt);
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'ob-chart', role: 'img', 'aria-label': 'A/B conversion' });
    svg.append(s('line', { x1: xl, x2: xr, y1: yb, y2: yb, class: 'ob-axis' }));
    for (const v of [0.05, 0.1, 0.15]) svg.append(text(xl - 4, Y(v) + 4, `${Math.round(v * 100)} %`, 'muted', 'end'));
    for (const d of [1, 7, 14, 21, 28]) svg.append(text(X(d), yb + 15, `${d}`, 'muted', 'middle'));
    svg.append(s('line', { x1: X(D.AB_PLANNED_DAY), x2: X(D.AB_PLANNED_DAY), y1: yt, y2: yb, class: 'ob-budget' }), text(X(D.AB_PLANNED_DAY), yt + 10, L(lang, 'planned n', 'geplantes n'), 'bad', 'middle'));
    const band = (key: 'A' | 'B') => s('path', { class: `ob-band ${key}` });
    const bA = band('A'), bB = band('B');
    const lA = s('path', { class: 'ob-ln A', fill: 'none', 'stroke-width': 2 }), lB = s('path', { class: 'ob-ln B', fill: 'none', 'stroke-width': 2 });
    const mark = s('g', { class: 'ob-mark' });
    svg.append(bA, bB, lA, lB, mark);
    const verdict = h('p', { class: 'ob-alert idle', role: 'status' }, '');
    const legend = h('div', { class: 'ob-legend' }, h('span', {}, h('i', { class: 'ob-sw A' }), 'A'), h('span', {}, h('i', { class: 'ob-sw B' }), 'B'), h('span', { class: 'muted' }, L(lang, '95 % interval', '95 %-Intervall')));
    stage.append(svg, legend, verdict);
    const stop = peek ? D.peekStopDay(series) : null;
    const draw = (upTo: number) => {
      const pts = series.slice(0, upTo);
      const line = (k: 'rA' | 'rB') => pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.day)},${Y(p[k])}`).join('');
      const bandPath = (r: 'rA' | 'rB', c: 'ciA' | 'ciB') => pts.length ? pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.day)},${Y(p[r] + p[c])}`).join('') + [...pts].reverse().map((p) => `L${X(p.day)},${Y(p[r] - p[c])}`).join('') + 'Z' : '';
      lA.setAttribute('d', line('rA')); lB.setAttribute('d', line('rB'));
      bA.setAttribute('d', bandPath('rA', 'ciA')); bB.setAttribute('d', bandPath('rB', 'ciB'));
    };
    const settle = () => {
      mark.replaceChildren();
      if (stop) {
        const p = series[stop - 1]!;
        mark.append(s('circle', { cx: X(stop), cy: Y(p.rB), r: 5, class: 'ob-pt bad' }), text(X(stop) + 8, Y(p.rB) - 8, L(lang, 'B "wins"', 'B „gewinnt“'), 'bad'));
        verdict.className = 'ob-alert bad';
        verdict.textContent = L(lang, `Day ${stop}: stopped, B "wins". False positive.`, `Tag ${stop}: gestoppt, B „gewinnt“. Falsch positiv.`);
      } else {
        const p = series[D.AB_PLANNED_DAY - 1]!;
        verdict.className = D.isSignificant(p) ? 'ob-alert bad' : 'ob-alert ok';
        verdict.textContent = L(lang, `Day ${D.AB_PLANNED_DAY}: no significant difference.`, `Tag ${D.AB_PLANNED_DAY}: kein signifikanter Unterschied.`);
      }
    };
    if (reducedMotion()) { draw(D.AB_DAYS); settle(); return; }
    for (let d = 1; d <= D.AB_DAYS; d++) { if (!alive()) return; draw(d); await sleep(80); }
    settle();
  } };
}

export const VIEWS: Record<Mode, (lang: Lang) => View> = {
  tracing: () => tracing(), profiling, 'logs-events': logsEvents, monitoring, 'exception-tracking': exceptionTracking, 'real-user-monitoring': rum, auditing, 'ab-tests': abTests,
};
