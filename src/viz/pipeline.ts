import { h, segmented, sleep, reducedMotion } from '../sim/ui/kit';
import './frame.css';
import './pipeline.css';
import { SPECS, GATES, OPTIONAL_GATES, BUG_LABEL, isMode, type Lang, type Commit, type GateId, type Mode } from './pipeline/spec';

export { catchingGate } from './pipeline/spec';

const NS = 'http://www.w3.org/2000/svg';
const COLORS = ['--l-static', '--l-verification', '--l-prose', '--l-review', '--l-codebase'];
const UI = {
  en: { play: 'Play', replay: 'Replay', fast: '5 min pipeline', slow: '40 min pipeline', speed: 'Pipeline speed', merge: 'Merge', blocked: 'Blocked: required check is red.', ready: 'Merge allowed: all checks green.', waiting: 'queued, batched', covered: 'diff coverage', need: 'needs 80%', notRun: 'not run', ran: 'runs', unchecked: 'covered ≠ checked', mergeNote: 'merged', pass: 'passes' },
  de: { play: 'Abspielen', replay: 'Nochmal', fast: '5 Min. Pipeline', slow: '40 Min. Pipeline', speed: 'Pipeline-Tempo', merge: 'Merge', blocked: 'Blockiert: Required Check ist rot.', ready: 'Merge erlaubt: alle Checks grün.', waiting: 'wartet, gebündelt', covered: 'Diff-Coverage', need: 'braucht 80 %', notRun: 'nicht ausgeführt', ran: 'läuft', unchecked: 'abgedeckt ≠ geprüft', mergeNote: 'gemerged', pass: 'grün' },
};

function s(tag: string, attrs: Record<string, string | number> = {}, text?: string): SVGElement {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (text !== undefined) e.textContent = text;
  return e;
}

export function mount(el: HTMLElement, lang: Lang, modeId: string) {
  const mode: Mode = isMode(modeId) ? modeId : 'ci';
  const spec = SPECS[mode];
  const t = UI[lang];
  const gates = spec.gates;
  const nLanes = spec.commits.length;
  const st = { run: 0, slow: false, vertical: false, done: false };
  const vertical = () => holder.clientWidth > 0 && holder.clientWidth < 560;

  const holder = h('div', { class: 'vz-stage' });
  const extra = h('div', { class: 'pl-extra' });
  const take = h('p', { class: 'vz-take', hidden: true, 'aria-live': 'polite' });
  const playBtn = h('button', { class: 'btn ghost sm pl-play', type: 'button', onclick: () => void play() }, t.play);
  const controls = h('div', { class: 'vz-controls' }, playBtn);
  if (mode === 'ci') {
    controls.append(segmented(t.speed, [{ value: 'fast', label: t.fast }, { value: 'slow', label: t.slow }], 'fast', (v) => { st.slow = v === 'slow'; void play(); }));
  }
  const cap = h('figcaption', { class: 'vz-cap' }, spec.caption[lang]);
  el.replaceChildren(controls, holder, extra, take, cap);

  // ---- geometry ------------------------------------------------------
  function geometry(vert: boolean) {
    const nG = gates.length;
    if (!vert) {
      const W = 720, x0 = 118, step = 75, y0 = 66, lh = 40;
      return { W, H: y0 + nLanes * lh + 6, gx: (gi: number) => x0 + gi * step + 33, ly: (li: number) => y0 + li * lh + 14, startX: 96, gw: 66 };
    }
    const W = 360, y0 = 30, rh = 42;
    return { W, H: y0 + nG * rh + 28, gy: (gi: number) => y0 + gi * rh + 21, lx: (li: number) => 138 + li * 36, rh };
  }

  type Dot = { c: Commit; g: SVGGElement; li: number; stop: number; label: SVGElement };
  let dots: Dot[] = [];
  let pos: (gi: number, li: number) => [number, number] = () => [0, 0];
  let markLayer: SVGElement;
  let stopLabel: (d: Dot) => [number, number, string];

  function build() {
    st.vertical = vertical();
    const vert = st.vertical;
    const G = geometry(vert) as any;
    const svg = s('svg', { viewBox: `0 0 ${G.W} ${G.H}`, class: 'pl-chart', role: 'img', 'aria-label': spec.caption[lang] }) as SVGSVGElement;
    markLayer = s('g');
    const gl = s('g');
    gates.forEach((gid, gi) => {
      const opt = OPTIONAL_GATES.includes(gid) && spec.focus !== gid;
      const cls = `pl-gate${gid === spec.focus ? ' focus' : ''}${opt ? ' opt' : ''}`;
      const g = s('g', { class: cls });
      const name = GATES[gid].name[lang];
      const time = GATES[gid].time;
      if (!vert) {
        const cx = G.gx(gi);
        g.append(s('rect', { x: cx - G.gw / 2, y: 4, width: G.gw, height: G.H - 8, rx: 6 }));
        g.append(s('text', { x: cx, y: 22, 'text-anchor': 'middle', class: 'pl-name' }, name));
        if (time) g.append(s('text', { x: cx, y: 40, 'text-anchor': 'middle', class: 'pl-time' }, time));
      } else {
        const cy = G.gy(gi);
        g.append(s('rect', { x: 0, y: cy - G.rh / 2 + 2, width: G.W, height: G.rh - 4, rx: 6 }));
        g.append(s('text', { x: 8, y: cy - 2, class: 'pl-name' }, name));
        if (time) g.append(s('text', { x: 8, y: cy + 13, class: 'pl-time' }, time));
      }
      gl.append(g);
    });
    svg.append(gl);
    pos = (gi, li) => (vert ? [G.lx(li), gi < 0 ? G.gy(0) - 30 : G.gy(gi)] : [gi < 0 ? G.startX : G.gx(gi), G.ly(li)]);
    // lane lines + labels
    spec.commits.forEach((c, li) => {
      const [x1, y1] = pos(-1, li), [x2, y2] = pos(gates.length - 1, li);
      svg.append(s('line', { x1, y1, x2, y2, class: 'pl-lane' }));
      if (!vert) svg.append(s('text', { x: 2, y: y1 + 4, class: 'pl-lane-label' }, (c.label ?? BUG_LABEL[c.bug])[lang]));
    });
    svg.append(markLayer);
    stopLabel = (d) => {
      const gi = gates.indexOf(d.stop === -1 ? 'merge' : (d.c.expect as GateId));
      const [x, y] = pos(gi, d.li);
      const txt = (d.c.note ?? (d.c.bug === 'clean' ? undefined : BUG_LABEL[d.c.bug]))?.[lang] ?? '';
      // vertical: commits that stop at the same gate stack their labels instead of overprinting each other
      const same = spec.commits.filter((o) => o.expect === d.c.expect && (o.note ?? (o.bug === 'clean' ? undefined : BUG_LABEL[o.bug])));
      const k = same.indexOf(d.c);
      return vert ? [G.W - 8, y + 4 + (k - (same.length - 1) / 2) * 14, txt] : [Math.min(Math.max(x, 66), G.W - 66), y - 15, txt];
    };
    dots = spec.commits.map((c, li) => {
      const bug = c.bug !== 'clean';
      const col = bug ? COLORS[li % COLORS.length] : '--ok';
      const g = s('g', { class: 'pl-dot', style: `--dot:var(${col})` }) as SVGGElement;
      g.append(s('circle', { r: 9 }));
      g.append(s('text', { 'text-anchor': 'middle', y: 4, class: 'pl-dot-i' }, bug ? '!' : '✓'));
      const [x, y] = pos(-1, li);
      g.style.transform = `translate(${x}px, ${y}px)`;
      svg.append(g);
      return { c, g, li, stop: gates.indexOf(c.expect), label: g };
    });
    holder.replaceChildren(svg);
  }

  // ---- extras ---------------------------------------------------------
  const mergeBtn = h('button', { class: 'btn sm pl-merge', type: 'button', 'aria-disabled': 'true', onclick: () => { if (mergeBtn.getAttribute('aria-disabled') === 'true') { mergeMsg.textContent = t.blocked; mergeBtn.classList.remove('shake'); void mergeBtn.offsetWidth; mergeBtn.classList.add('shake'); } } }, t.merge);
  const mergeMsg = h('span', { class: 'pl-merge-msg', role: 'status' });
  function buildExtra() {
    extra.replaceChildren();
    if (mode === 'ci') extra.append(h('div', { class: 'pl-row' }, mergeBtn, mergeMsg));
    if (mode === 'coverage') {
      extra.append(
        h('div', { class: 'pl-cov' },
          h('div', { class: 'pl-cov-head' }, h('span', {}, t.covered), h('strong', { class: 'pl-cov-pct' }, '40%'), h('span', { class: 'muted' }, t.need)),
          h('div', { class: 'pl-bar', role: 'img', 'aria-label': `${t.covered} 40%` }, h('i', { class: 'pl-bar-fill' }), h('b', { class: 'pl-bar-min' })),
          h('ol', { class: 'pl-lines' },
            ...[['if (!pet.reserved) {', 1], ['  pet.reserved = true', 1], ['} else if (pet.holdExpired) {', 0], ['  release(pet)', 0], ['  throw new Error("taken")', 0]].map(([code, ran]) =>
              h('li', { class: ran ? 'ran' : 'miss' }, h('code', {}, String(code)), h('span', {}, ran ? t.ran : t.notRun))),
          ),
          h('p', { class: 'pl-note' }, t.unchecked)));
    }
  }

  // ---- animation ------------------------------------------------------
  const move = (d: Dot, gi: number) => { const [x, y] = pos(gi, d.li); d.g.style.transform = `translate(${x}px, ${y}px)`; };
  function mark(d: Dot, ok: boolean, hidden = false) {
    const [x, y, txt] = stopLabel(d);
    const gi = gates.indexOf(d.c.expect as GateId);
    const [px, py] = pos(gi, d.li);
    const g = s('g', { class: `pl-mark ${ok ? 'ok' : hidden ? 'warn' : 'bad'}` });
    if (!ok) { g.append(s('path', { d: `M${px - 6} ${py - 6}l12 12M${px + 6} ${py - 6}l-12 12`, class: 'pl-x' })); }
    else g.append(s('circle', { cx: px, cy: py, r: 14, class: 'pl-ring' }));
    if (txt) g.append(s('text', { x, y, 'text-anchor': st.vertical ? 'end' : 'middle', class: 'pl-stop' }, txt));
    markLayer.append(g);
    if (!ok) d.g.classList.add('stopped');
  }
  const queued = (d: Dot) => st.slow && mode === 'ci' && d.li > 0;
  const reaches = (d: Dot) => d.c.expect === 'merge';
  function finish(final: boolean) {
    dots.forEach((d) => {
      if (queued(d)) {
        const [x, y] = pos(-1, d.li);
        // vertical: one shared label (all queued commits sit on the same row)
        if (!st.vertical || d.li === 1) markLayer.append(s('text', { x: st.vertical ? 10 : x - 4, y: y + (st.vertical ? 10 : 28), class: 'pl-stop', 'text-anchor': 'start' }, t.waiting));
        return;
      }
      mark(d, reaches(d), reaches(d) && d.c.bug !== 'clean');
      move(d, gates.indexOf(d.c.expect as GateId));
    });
    const anyRed = dots.some((d) => !queued(d) && !reaches(d));
    if (mode === 'ci') {
      mergeBtn.setAttribute('aria-disabled', anyRed ? 'true' : 'false');
      mergeMsg.textContent = anyRed ? t.blocked : t.ready;
    }
    if (mode === 'coverage') extra.classList.add('show');
    take.textContent = (st.slow && spec.takeawaySlow ? spec.takeawaySlow : spec.takeaway)[lang];
    take.hidden = false;
    st.done = true;
    void final;
  }

  async function play() {
    const run = ++st.run;
    build(); buildExtra();
    take.hidden = true; st.done = false;
    mergeMsg.textContent = ''; mergeBtn.setAttribute('aria-disabled', 'true');
    extra.classList.remove('show');
    playBtn.textContent = t.replay;
    if (reducedMotion()) { finish(true); return; }
    await sleep(60);
    await Promise.all(dots.map(async (d) => {
      if (queued(d)) return;
      await sleep(d.li * 420);
      const last = gates.indexOf(d.c.expect as GateId);
      for (let gi = 0; gi <= last; gi++) {
        if (run !== st.run) return;
        move(d, gi);
        await sleep(gi === 0 ? 500 : 380);
      }
    }));
    if (run !== st.run) return;
    finish(false);
  }

  // final state immediately; animate when the user presses play (or on mount when motion allowed)
  build(); buildExtra();
  playBtn.textContent = t.play;
  if (reducedMotion()) finish(true); else void play();

  let lastVert = st.vertical;
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => { if (vertical() !== lastVert) { lastVert = vertical(); st.run++; build(); finish(true); } }).observe(el);
  }
}
