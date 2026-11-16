import type { L } from './specs';
import { SPECS } from './specs';

export interface Ctx {
  lang: L;
  t: (en: string, de: string) => string;
  phase: number;
  s: Record<string, any>;
  redraw: () => void;
  play: () => void;
}
export type Ctl =
  | { kind: 'button'; label: (c: Ctx) => string; on: (c: Ctx) => void; pressed?: (c: Ctx) => boolean }
  | { kind: 'range'; label: (c: Ctx) => string; min: number; max: number; step: number; get: (c: Ctx) => number; set: (c: Ctx, v: number) => void; out: (c: Ctx) => string };
export interface ModeDef {
  max: number;
  ms?: number;
  init?: (c: Ctx) => void;
  svg: (c: Ctx) => string;
  html?: (c: Ctx) => string;
  act?: (c: Ctx, key: string) => void;
  controls: Ctl[];
  /** accessible description of the SVG */
  label: (c: Ctx) => string;
}

const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

export function mountMode(root: HTMLElement, lang: L, mode: string, def: ModeDef): void {
  const spec = SPECS[mode]!;
  root.classList.add('pv');
  root.textContent = '';
  const ctx: Ctx = {
    lang, t: (en, de) => (lang === 'de' ? de : en), phase: 0, s: {}, redraw: () => draw(), play: () => play(),
  };
  def.init?.(ctx);
  const stage = el('div', 'vz-stage pv-stage');
  const detail = el('div', 'pv-detail');
  detail.setAttribute('aria-live', 'polite');
  const bar = el('div', 'vz-controls');
  const take = el('p', 'vz-take', spec.takeaway[lang]);
  const cap = el('figcaption', 'vz-cap', spec.caption[lang]);
  root.append(bar, stage, detail, take, cap);

  const syncs: (() => void)[] = [];
  for (const c of def.controls) {
    if (c.kind === 'button') {
      const b = el('button', 'btn ghost sm');
      b.type = 'button';
      b.addEventListener('click', () => { c.on(ctx); draw(); });
      syncs.push(() => { b.textContent = c.label(ctx); if (c.pressed) b.setAttribute('aria-pressed', String(c.pressed(ctx))); });
      bar.append(b);
    } else {
      const wrap = el('label', 'vz-ctl');
      const txt = el('span');
      const inp = el('input');
      inp.type = 'range';
      inp.min = String(c.min); inp.max = String(c.max); inp.step = String(c.step);
      const out = el('output');
      inp.addEventListener('input', () => { c.set(ctx, Number(inp.value)); draw(); });
      syncs.push(() => { txt.textContent = c.label(ctx); inp.value = String(c.get(ctx)); out.textContent = c.out(ctx); });
      wrap.append(txt, inp, out);
      bar.append(wrap);
    }
  }

  function draw() {
    const focused = (document.activeElement as HTMLElement | null)?.getAttribute?.('data-act');
    stage.innerHTML = `<svg viewBox="0 0 360 230" role="img" aria-label="${def.label(ctx).replace(/"/g, '&quot;')}" preserveAspectRatio="xMidYMid meet">${def.svg(ctx)}</svg>`;
    detail.innerHTML = def.html ? def.html(ctx) : '';
    syncs.forEach((f) => f());
    if (focused) (stage.querySelector(`[data-act="${focused}"]`) as HTMLElement | null)?.focus();
  }

  const fire = (t: EventTarget | null) => {
    const k = (t as Element | null)?.closest?.('[data-act]')?.getAttribute('data-act');
    if (k && def.act) { def.act(ctx, k); draw(); }
  };
  stage.addEventListener('click', (e) => fire(e.target));
  stage.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') { e.preventDefault(); fire(e.target); }
  });

  let timer: ReturnType<typeof setInterval> | undefined;
  function play() {
    if (timer) clearInterval(timer);
    if (reduced() || def.max === 0) { ctx.phase = def.max; draw(); return; }
    ctx.phase = 0;
    draw();
    timer = setInterval(() => {
      ctx.phase++;
      draw();
      if (ctx.phase >= def.max) { clearInterval(timer); timer = undefined; }
    }, def.ms ?? 700);
  }
  ctx.phase = def.max;
  draw();
  if (def.max > 0) play();
}

// ---- svg helpers ----
export const LAYERS = ['codebase', 'static', 'verification', 'prose', 'review'] as const;
export function layerName(i: number, lang: L): string {
  const n = { en: ['Codebase', 'Static', 'Verification', 'Prose', 'Review'], de: ['Codebase', 'Statisch', 'Verifikation', 'Prosa', 'Review'] };
  return n[lang][i]!;
}
export interface FunnelGeo { x: number; y: number; w: number; lh: number }
export const layerMid = (g: FunnelGeo, i: number) => ({ x: g.x + g.w / 2, y: g.y + i * g.lh + g.lh / 2 });
/** Inverted funnel: wide at the top (codebase), narrow at the bottom (review). */
export function funnel(g: FunnelGeo, lang: L, hot: number[] = [], labels = true, skip: number[] = []): string {
  const k = 0.14;
  return LAYERS.map((l, i) => {
    const y = g.y + i * g.lh;
    const a = g.w * (1 - i * k) / 2, b = g.w * (1 - (i + 1) * k) / 2, cx = g.x + g.w / 2;
    const pts = `${cx - a},${y} ${cx + a},${y} ${cx + b},${y + g.lh - 1} ${cx - b},${y + g.lh - 1}`;
    const op = hot.includes(i) ? 0.5 : 0.2;
    return `<polygon points="${pts}" fill="var(--l-${l})" fill-opacity="${op}" stroke="var(--l-${l})" stroke-width="${hot.includes(i) ? 2 : 1}"/>` +
      (labels && !skip.includes(i) ? `<text x="${cx}" y="${y + g.lh / 2 + 4}" text-anchor="middle" class="tb">${layerName(i, lang)}</text>` : '');
  }).join('');
}
export function lines(x: number, y: number, ls: string[], cls = 't', anchor = 'middle', dy = 14): string {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${ls.map((s, i) => `<tspan x="${x}" dy="${i ? dy : 0}">${s}</tspan>`).join('')}</text>`;
}
export const arrow = (x1: number, y1: number, x2: number, y2: number, cls = 'line') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" marker-end="url(#pv-ah)"/>`;
export const defs = `<defs><marker id="pv-ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="context-stroke"/></marker></defs>`;
export const flame = (x: number, y: number, s = 1) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -22 C6 -12 12 -8 12 2 C12 10 6 14 0 14 C-6 14 -12 10 -12 2 C-12 -4 -7 -6 -5 -12 C-2 -8 0 -14 0 -22 Z" fill="var(--bad)" class="pv-pop"/>`;
