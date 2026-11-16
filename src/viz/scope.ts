import { h, segmented, sleep, reducedMotion } from '../sim/ui/kit';
import { BOXES, COMPARE, COMPARE_LABELS, COMPARE_SPECS, UI, compareKeyFor, specFor, type CompareKey, type Lang, type ScopeSpec } from './scope/data';
import './scope.css';

const NS = 'http://www.w3.org/2000/svg';
const W = 390, BX = 64, BW = 190, BH = 44, STEP = 68, TOP = 18, RAIL = 36, RX = 262;
const boxY = (i: number) => TOP + i * STEP;
const cy = (i: number) => boxY(i) + BH / 2;

function s<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, text?: string): SVGElementTagNameMap[K] {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  if (text !== undefined) el.textContent = text;
  return el;
}

export function mount(el: HTMLElement, lang: Lang, mode: string) {
  let spec: ScopeSpec = specFor(mode);
  let run = 0;
  const L = (x: { en: string; de: string }) => x[lang];
  const H = 5 * STEP - (STEP - BH) + TOP * 2;

  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'scope-svg', role: 'img', 'aria-hidden': 'true', focusable: 'false' });
  const caption = h('figcaption', { class: 'scope-cap' });
  const takeaway = h('p', { class: 'scope-take', 'aria-live': 'polite' });
  const btn = h('button', { class: 'btn scope-play', type: 'button', onclick: () => void play() }, L(UI.play));
  const key = compareKeyFor(mode);
  const seg = segmented<CompareKey>(
    L(UI.compare),
    COMPARE.map((c) => ({ value: c, label: L(COMPARE_LABELS[c]) })),
    key ?? ('' as CompareKey),
    (v) => { spec = COMPARE_SPECS[v]; draw(); void play(); },
  );
  seg.classList.add('scope-seg');
  el.replaceChildren(h('div', { class: 'scope' }, h('div', { class: 'scope-bar' }, seg, btn), svg, takeaway), caption);
  // figcaption belongs inside the figure; mount target is the <figure>
  let dot: SVGElement, marks: Record<string, SVGElement> = {};

  function draw() {
    run++;
    svg.replaceChildren();
    marks = {};
    caption.textContent = L(spec.caption);
    takeaway.textContent = '';
    takeaway.classList.remove('on');
    svg.append(s('line', { x1: RAIL, y1: cy(0), x2: RAIL, y2: cy(4), class: 'rail' }));
    BOXES.forEach((b, i) => {
      const st = spec.boxes[i];
      const g = s('g', { class: `box ${st}`, 'data-box': b.id });
      g.append(s('rect', { x: BX, y: boxY(i), width: BW, height: BH, rx: 8 }));
      g.append(s('text', { x: BX + 12, y: boxY(i) + 27, class: 'bl' }, L(b.label)));
      if (st === 'fake' || st === 'real') {
        g.append(s('text', { x: BX + BW - 10, y: boxY(i) + 27, class: `tag ${st}`, 'text-anchor': 'end' }, L(st === 'fake' ? UI.fake : UI.real)));
      }
      svg.append(g);
      svg.append(s('circle', { cx: RAIL, cy: cy(i), r: 4, class: 'stop' }));
      marks[`b${i}`] = g;
    });
    if (spec.frame) svg.append(s('rect', { x: BX - 5, y: boxY(0) - 5, width: BW + 10, height: BH + 10, rx: 11, class: 'frame' }));
    for (const n of spec.notes ?? []) {
      const t = s('text', { x: RX, y: cy(n.box) + 4, class: 'note' }, L(n.label));
      marks[`n${n.box}`] = t;
      svg.append(t);
    }
    const c = spec.catch;
    const by = c.span ? (cy(c.span[0]) + cy(c.span[1])) / 2 : cy(c.box);
    const bolt = s('g', { class: 'bolt' });
    bolt.append(s('text', { x: RX, y: by + 5, class: 'bolt-ico' }, '⚡'), s('text', { x: RX + 20, y: by + 5, class: 'bolt-lbl' }, L(c.label)));
    if (c.span) bolt.append(s('path', { d: `M${BX + BW + 4} ${cy(c.span[0])} h6 V${cy(c.span[1])} h-6`, class: 'brace' }));
    svg.append(bolt);
    marks.bolt = bolt;
    dot = s('circle', { cx: RAIL, cy: cy(spec.path[0]), r: spec.ping ? 5 : 8, class: `dot${spec.ping ? ' ping' : ''}` });
    svg.append(dot);
    const first = spec.path[0];
    dot.style.transform = `translateY(0px)`;
    dot.dataset.base = String(cy(first));
    const cap = s('title', {}, L(spec.caption));
    svg.prepend(cap);
  }

  function setDot(i: number) { dot.style.transform = `translateY(${cy(i) - cy(spec.path[0])}px)`; }
  const touch = (i: number) => { marks[`b${i}`]?.classList.add('hit'); marks[`n${i}`]?.classList.add('on'); };

  function final() {
    for (const i of spec.path) touch(i);
    setDot(spec.path[spec.path.length - 1]);
    marks.bolt.classList.add('on');
    takeaway.textContent = L(spec.takeaway);
    takeaway.classList.add('on');
  }

  async function play() {
    draw();
    if (reducedMotion()) { final(); btn.textContent = L(UI.replay); return; }
    const me = run;
    btn.disabled = true;
    svg.classList.add('moving');
    for (const i of spec.path) {
      if (me !== run) return;
      setDot(i);
      await sleep(420);
      if (me !== run) return;
      touch(i);
      await sleep(180);
    }
    if (me !== run) return;
    marks.bolt.classList.add('on');
    await sleep(500);
    if (me !== run) return;
    takeaway.textContent = L(spec.takeaway);
    takeaway.classList.add('on');
    svg.classList.remove('moving');
    btn.disabled = false;
    btn.textContent = L(UI.replay);
  }

  draw();
  void play();
}
