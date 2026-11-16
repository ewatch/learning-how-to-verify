// The 'observe' diagram family: one compact animated visual per practice (see observe/views.ts).
import { h } from '../sim/ui/kit';
import { SPECS, isMode, type Lang } from './observe/specs';
import { VIEWS } from './observe/views';
import './observe.css';

export function mount(el: HTMLElement, lang: Lang, mode: string): void {
  if (!isMode(mode)) { el.textContent = `Unknown diagram: ${mode}`; return; }
  const spec = SPECS[mode][lang];
  const view = VIEWS[mode](lang);
  let on = view.initial;
  let token = 0;
  const stage = h('div', { class: 'ob-stage' });
  const plain = mode === 'monitoring';
  const sw = mode === 'exception-tracking' ? null
    : plain ? h('button', { type: 'button', class: 'ob-switch replay' }, spec.toggle)
    : h('button', { type: 'button', class: 'ob-switch', role: 'switch', 'aria-checked': String(on) }, h('i', { class: 'ob-knob', 'aria-hidden': 'true' }), spec.toggle);
  const run = () => {
    const my = ++token;
    stage.replaceChildren();
    void view.render(stage, on, () => my === token && el.isConnected);
  };
  sw?.addEventListener('click', () => {
    if (!plain) { on = !on; sw.setAttribute('aria-checked', String(on)); }
    run();
  });
  el.replaceChildren(h('div', { class: 'ob' }, sw ? h('div', { class: 'ob-top' }, sw) : null, stage, h('p', { class: 'ob-take' }, spec.takeaway)), h('figcaption', { class: 'ob-cap' }, spec.caption));
  run();
}
