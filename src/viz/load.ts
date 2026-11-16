import * as D from './load/data';
import { SPECS, T, type Lang } from './load/spec';
import './frame.css';
import './load.css';

const W = 420, H = 300, L = 46, R = 12, TOP = 16, B = 56;
const PW = W - L - R, PH = H - TOP - B;
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const f = (n: number) => n.toFixed(1);

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
function toggle(label: string, checked: boolean, on: (v: boolean) => void): HTMLLabelElement {
  const l = el('label', 'vz-ctl'); const i = el('input'); i.type = 'checkbox'; i.checked = checked;
  i.addEventListener('change', () => on(i.checked)); l.append(i, el('span', undefined, label)); return l;
}
function slider(label: string, min: number, max: number, step: number, val: number, on: (v: number) => void, fmt: (v: number) => string): HTMLElement {
  const l = el('label', 'vz-ctl'); const i = el('input'); i.type = 'range';
  i.min = String(min); i.max = String(max); i.step = String(step); i.value = String(val);
  const out = el('output', undefined, fmt(val));
  i.addEventListener('input', () => { out.textContent = fmt(+i.value); on(+i.value); });
  l.append(el('span', undefined, label), i, out); return l;
}
const axisLabel = (x: number, y: number, s: string, anchor = 'middle', extra = '') => `<text x="${x}" y="${y}" text-anchor="${anchor}" ${extra}>${s}</text>`;
const frame = () => `<line class="ax" x1="${L}" y1="${TOP + PH}" x2="${L + PW}" y2="${TOP + PH}"/><line class="ax" x1="${L}" y1="${TOP}" x2="${L}" y2="${TOP + PH}"/>`;
const path = (pts: [number, number][], cls: string, extra = '') => `<path class="${cls}" pathLength="1" d="${pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`).join(' ')}" ${extra}/>`;

export function mount(el0: HTMLElement, lang: Lang, mode: string) {
  const spec = SPECS[mode];
  if (!spec) { el0.textContent = mode; return; }
  const t = T[lang];
  const nf = (n: number, d = 0) => n.toLocaleString(lang, { maximumFractionDigits: d });
  const chart = el('div', 'vz-stage ld-chart');
  const controls = el('div', 'vz-controls');
  const live = el('p', 'vz-live'); live.setAttribute('aria-live', 'polite');
  let animate = !reduced();
  const paint = (inner: string, label: string) => {
    chart.innerHTML = `<svg class="ld-svg${animate ? ' anim' : ''}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${inner}</svg>`;
    animate = false;
  };
  const cap = el('figcaption', 'vz-cap', spec.caption[lang]);
  const take = el('p', 'vz-take', spec.takeaway[lang]);
  el0.replaceChildren(controls, chart, live, take, cap);

  if (mode === 'load-tests') {
    let users = 300, check = false, unique = false;
    const x = (u: number) => L + (u / 400) * PW, YMAX = 1500;
    const y = (ms: number) => TOP + PH - (Math.min(ms, YMAX) / YMAX) * PH;
    const pts = (to: number) => { const a: [number, number][] = []; for (let u = 0; u <= to; u += 4) a.push([x(u), y(D.p95At(u))]); a.push([x(to), y(D.p95At(to))]); return a; };
    const draw = () => {
      const er = D.errorRateAt(users), ms = D.p95At(users);
      const band = er > 0 ? `<rect class="band" x="${x(D.KNEE)}" y="${TOP + PH - 14}" width="${f(x(users) - x(D.KNEE))}" height="14" style="opacity:${f(0.3 + er)}"/>${axisLabel(x(D.KNEE) + 4, TOP + PH - 18, `${t.errors} ${nf(er * 100)} %`, 'start', 'class="bad"')}` : '';
      paint(`${frame()}
        <line class="ref" x1="${L}" x2="${L + PW}" y1="${y(D.TARGET_MS)}" y2="${y(D.TARGET_MS)}"/>${axisLabel(L + 4, y(D.TARGET_MS) - 5, `${t.target} 300 ms`, 'start')}
        <line class="ref" x1="${x(D.EXPECTED_PEAK * 2)}" x2="${x(D.EXPECTED_PEAK * 2)}" y1="${TOP}" y2="${TOP + PH}"/>${axisLabel(x(300) - 4, TOP + 12, t.peak, 'end')}
        ${path(pts(400), 'ghost')}${path(pts(users), ms > D.TARGET_MS ? 'line bad-l' : 'line')}
        <circle class="dot" cx="${x(users)}" cy="${y(ms)}" r="5"/>${band}
        ${D.KNEE <= users ? axisLabel(x(D.KNEE) - 4, y(D.p95At(D.KNEE)) - 10, t.knee, 'end') : ''}
        ${axisLabel(L + PW / 2, H - 6, t.users)}${axisLabel(16, TOP + PH / 2, t.p95, 'middle', `transform="rotate(-90 16 ${TOP + PH / 2})"`)}
        ${axisLabel(L, H - 34, '0', 'middle')}${axisLabel(x(200), H - 34, '200')}${axisLabel(x(400), H - 34, '400', 'end')}`, `${t.p95}: ${nf(ms)} ${t.ms}`);
      live.textContent = `${nf(users)} ${t.users} · ${t.p95} ${nf(ms)} ${t.ms}` + (check ? ` · ${t.twice}: ${D.reservedTwice(users, unique)}` : '');
      live.className = 'vz-live' + (check && D.reservedTwice(users, unique) ? ' bad' : '');
    };
    controls.append(slider(t.users, 0, 400, 5, users, (v) => { users = v; draw(); }, (v) => nf(v)),
      toggle(t.check, check, (v) => { check = v; draw(); }), toggle(t.unique, unique, (v) => { unique = v; draw(); }));
    draw();
  }

  if (mode === 'soak-tests') {
    let leak = true, t10 = false;
    const HMAX = 36; // axis reaches past the 30 h at which the leak runs out of memory
    const x = (h: number) => L + (h / HMAX) * PW, YMAX = 2200;
    const y = (mb: number) => TOP + PH - (mb / YMAX) * PH;
    const draw = () => {
      const oh = D.oomHour(leak, t10), end = oh ?? HMAX, pts: [number, number][] = [];
      for (let h = 0; h <= end; h += 0.04) pts.push([x(h), y(D.memoryAt(h, leak, t10))]);
      pts.push([x(end), y(D.memoryAt(end, leak, t10))]);
      paint(`${frame()}
        <rect class="win" x="${L}" y="${TOP}" width="${Math.max(6, x(D.WINDOW_H) - L)}" height="${PH}"/>${axisLabel(L + 12, TOP + 14, t.fine, 'start')}
        <line class="ref bad-l" x1="${L}" x2="${L + PW}" y1="${y(D.OOM_MB)}" y2="${y(D.OOM_MB)}"/>${axisLabel(L + PW, y(D.OOM_MB) + 16, t.oom, 'end', 'class="bad"')}
        ${path(pts, leak ? 'line bad-l' : 'line ok-l')}
        ${oh !== null ? `<circle class="dot bad-d" cx="${x(oh)}" cy="${y(D.OOM_MB)}" r="5"/>${axisLabel(x(oh) - 8, y(D.OOM_MB) + 16, `${nf(oh, 1)} h`, 'end')}` : axisLabel(L + PW, y(D.memoryAt(12, false, false)) - 12, t.gc, 'end')}
        ${axisLabel(L + PW / 2, H - 6, t.hours)}${axisLabel(16, TOP + PH / 2, t.memory, 'middle', `transform="rotate(-90 16 ${TOP + PH / 2})"`)}
        ${axisLabel(L, H - 34, '0')}${axisLabel(x(12), H - 34, '12')}${axisLabel(x(24), H - 34, '24')}${axisLabel(x(36), H - 34, '36', 'end')}`, t.memory);
      live.textContent = oh !== null ? `${t.oom}: ${nf(oh, 1)} ${t.hours}` : `${nf(D.memoryAt(24, false, false))} ${t.mb} · ${t.hours}: 24`;
      live.className = 'vz-live' + (oh !== null ? ' bad' : '');
    };
    controls.append(toggle(t.leak, leak, (v) => { leak = v; draw(); }), toggle(t.traffic, t10, (v) => { t10 = v; draw(); }));
    draw();
  }

  if (mode === 'performance-tests') {
    let n1 = false;
    const MAX = 800, BINS = 40;
    const draw = () => {
      const s = D.latencies(n1), st = D.stats(s), h = D.histogram(s, MAX, BINS), top = Math.max(...D.histogram(D.latencies(false), MAX, BINS)) * 1.1;
      const x = (ms: number) => L + (Math.min(ms, MAX) / MAX) * PW, bw = PW / BINS;
      const bars = h.map((c, i) => `<rect class="bar" x="${f(L + i * bw + 0.5)}" y="${f(TOP + PH - (c / top) * PH)}" width="${f(bw - 1)}" height="${f((c / top) * PH)}"/>`).join('');
      const marks: [string, number, string][] = [[t.avg, st.avg, ''], [t.p50, st.p50, ''], [t.p95, st.p95, 'warn-l'], [t.p99, st.p99, 'bad-l']];
      const ml = marks.map(([n, v, c], i) => `<line class="mk ${c}" x1="${x(v)}" x2="${x(v)}" y1="${TOP + 20 + i * 18 - 12}" y2="${TOP + PH}"/>${axisLabel(x(v) + 4, TOP + 20 + i * 18, `${n} ${nf(v)}`, 'start')}`).join('');
      paint(`${frame()}${bars}${ml}
        ${axisLabel(L + PW / 2, H - 6, `${t.time} (${t.ms})`)}${axisLabel(16, TOP + PH / 2, t.count, 'middle', `transform="rotate(-90 16 ${TOP + PH / 2})"`)}
        ${axisLabel(L, H - 34, '0')}${axisLabel(x(400), H - 34, '400')}${axisLabel(x(800), H - 34, '800+', 'end')}`, `${t.p95} ${nf(st.p95)} ${t.ms}`);
      live.textContent = `${t.note} ${t.pageHit(nf(D.pageHitsP95(20) * 100) + ' %')}`;
    };
    controls.append(toggle(t.nplus, n1, (v) => { n1 = v; draw(); }));
    draw();
  }

  if (mode === 'benchmark-tests') {
    let e = 5;
    const lx = (n: number) => L + ((Math.log10(n) - 1) / 4) * PW;
    const YLO = -2, YHI = 4;
    const y = (ms: number) => TOP + PH - ((Math.log10(Math.max(ms, 1e-2)) - YLO) / (YHI - YLO)) * PH;
    const curve = (fn: (n: number) => number, to: number, pick?: (n: number) => boolean) => {
      const a: [number, number][] = [];
      for (let k = 1; k <= to + 1e-9; k += 0.05) { const n = 10 ** k; if (!pick || pick(n)) a.push([lx(n), y(fn(n))]); }
      return a;
    };
    const draw = () => {
      const n = Math.round(10 ** e), lin = D.linearMs(n), q = D.quadraticMs(n), bad = D.regressed(n);
      const okPts = curve(D.quadraticMs, e, (m) => !D.regressed(m)), badPts = curve(D.quadraticMs, e, (m) => D.regressed(m));
      const ticks = [10, 100, 1000, 10000, 100000];
      paint(`${frame()}
        ${path(curve((m) => D.linearMs(m) * D.BASELINE_FACTOR, 5), 'ref-p')}${axisLabel(L + 6, y(D.linearMs(10) * 1.2) - 46, t.thresh, 'start')}
        ${path(curve(D.linearMs, e), 'line l-lin')}${okPts.length > 1 ? path(okPts, 'line l-quad') : ''}${badPts.length > 1 ? path(badPts, 'line bad-l') : ''}
        <circle class="dot" cx="${lx(n)}" cy="${y(lin)}" r="5"/><circle class="dot ${bad ? 'bad-d' : ''}" cx="${lx(n)}" cy="${y(q)}" r="${bad ? 6 : 3.5}"/>
        ${n < 100 ? axisLabel(lx(n) + 10, y(q) - 12, t.same, 'start') : ''}
        ${axisLabel(L + PW - 4, y(D.linearMs(1e5)) + 30, t.linear, 'end')}${axisLabel(L + PW - 4, Math.max(TOP + 12, y(D.quadraticMs(1e5)) - 8), t.quad, 'end', 'class="q"')}
        ${axisLabel(L + PW / 2, H - 6, t.n)}${axisLabel(16, TOP + PH / 2, t.time, 'middle', `transform="rotate(-90 16 ${TOP + PH / 2})"`)}
        ${ticks.filter((_, i) => i % 2 === 0).map((v) => axisLabel(lx(v), H - 34, nf(v), v === 100000 ? 'end' : 'middle')).join('')}`, `${t.time}: ${nf(q, 2)} ${t.ms}`);
      live.textContent = `n = ${nf(n)} · ${t.linear} ${nf(lin, 2)} ${t.ms} · ${t.quad} ${nf(q, 2)} ${t.ms}` + (bad ? ` · ${t.fail}` : '');
      live.className = 'vz-live' + (bad ? ' bad' : '');
    };
    controls.append(slider('n', 1, 5, 0.05, e, (v) => { e = v; draw(); }, (v) => nf(Math.round(10 ** v))));
    draw();
  }
}
