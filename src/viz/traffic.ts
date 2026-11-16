// 'traffic' diagram family: animated request flows (modes = practice ids). Lazy-mounted by VizMount.astro.
import { h, reducedMotion } from '../sim/ui/kit';
import { MODES, type Mode } from './traffic/logic';
import { SPECS, L, type Lang } from './traffic/text';
import { SCENES, type Scene } from './traffic/scenes';
import { s, Stage } from './traffic/stage';
import './traffic.css';

export { MODES, SPECS };

const isMode = (m: string): m is Mode => (MODES as readonly string[]).includes(m);

const HEIGHTS: Record<Mode, number> = { 'traffic-shaping': 240, shadowing: 262, 'tap-compare': 262, teeing: 240, 'chaos-testing': 200, 'dynamic-exploration': 262 };

export function mount(el: HTMLElement, lang: Lang, mode: string) {
  el.replaceChildren();
  if (!isMode(mode)) { el.textContent = `${lang === 'en' ? 'Unknown diagram' : 'Unbekanntes Diagramm'}: ${mode}`; return; }
  const spec = SPECS[mode];
  const t = (k: string) => L[lang][k] ?? k;

  const svg = s('svg', { viewBox: `0 0 360 ${HEIGHTS[mode]}`, class: 'tv-svg', role: 'img', 'aria-label': spec.caption[lang] });
  const bg = s('g', {});
  const stage = new Stage();
  svg.append(bg, stage.layer);
  const panel = h('div', { class: 'tv-panel' });
  const controls = h('div', { class: 'tv-controls' });
  const live = h('p', { class: 'tv-live', role: 'status', 'aria-live': 'polite' });

  const scene: Scene = SCENES[mode]!({ bg, stage, panel, controls, t, lang, status: (m) => { live.textContent = m; } });

  const reduced = reducedMotion();
  let playing = !reduced, visible = false, raf = 0, last = 0;
  const playBtn = h('button', { type: 'button', class: 'btn sm ghost', 'aria-pressed': String(!playing) }, '');
  const syncBtn = () => { playBtn.textContent = playing ? t('pause') : t('play'); playBtn.setAttribute('aria-pressed', String(!playing)); };
  const tick = (now: number) => {
    raf = 0;
    if (!playing || !visible || document.hidden) { last = 0; return; }
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    scene.step(dt);
    raf = requestAnimationFrame(tick);
  };
  const schedule = () => { if (!raf && playing && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(tick); } };
  const unschedule = () => { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; };

  /** Static end state for prefers-reduced-motion: fast-forward without animating. */
  const settleStatic = () => {
    scene.reset();
    const n = Math.round(scene.settle / 0.05);
    for (let i = 0; i < n; i++) scene.step(0.05);
    const extra = scene.finish?.() ?? 0;
    for (let i = 0; i < Math.round(extra / 0.05); i++) scene.step(0.05);
  };
  const restart = () => {
    if (reduced && !playing) { settleStatic(); return; }
    scene.reset(); playing = true; syncBtn(); schedule();
  };
  playBtn.addEventListener('click', () => { playing = !playing; syncBtn(); if (playing) schedule(); else unschedule(); });
  const restartBtn = h('button', { type: 'button', class: 'btn sm ghost', onclick: restart }, t('restart'));
  controls.prepend(playBtn, restartBtn);
  syncBtn();

  el.append(h('div', { class: 'tv' },
    spec.hypothesis ? h('p', { class: 'tv-hyp' }, spec.hypothesis[lang]) : null,
    svg, panel, controls, live,
    h('p', { class: 'tv-take' }, spec.takeaway[lang]),
  ), h('figcaption', { class: 'tv-cap' }, spec.caption[lang]));

  if (reduced) settleStatic(); else scene.reset();
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible) schedule(); else unschedule();
  });
  io.observe(el);
  document.addEventListener('visibilitychange', () => { if (document.hidden) unschedule(); else schedule(); });
}
