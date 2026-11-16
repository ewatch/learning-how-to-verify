// The 'observe' diagram family: one compact animated visual per practice (see observe/views.ts).
import { h } from '../sim/ui/kit';
import { SPECS, isMode, type Lang } from './observe/specs';
import { VIEWS } from './observe/views';
import './frame.css';
import './observe.css';

export function mount(el: HTMLElement, lang: Lang, mode: string): void {
  if (!isMode(mode)) { el.textContent = `Unknown diagram: ${mode}`; return; }
  const spec = SPECS[mode][lang];
  const view = VIEWS[mode](lang);
  let on = view.initial;
  let token = 0;
  const stage = h('div', { class: 'vz-stage ob-stage' });
  const plain = mode === 'monitoring';
  const toggle = h('input', { type: 'checkbox', checked: on });
  const sw = mode === 'exception-tracking' ? null
    : plain ? h('button', { type: 'button', class: 'btn ghost sm replay' }, spec.toggle)
    : h('label', { class: 'vz-ctl' }, toggle, h('span', {}, spec.toggle));
  const run = () => {
    const my = ++token;
    stage.replaceChildren();
    void view.render(stage, on, () => my === token && el.isConnected);
  };
  if (sw) (plain ? sw : toggle).addEventListener(plain ? 'click' : 'change', () => {
    if (!plain) on = toggle.checked;
    run();
  });
  el.classList.add('ob');
  el.replaceChildren(...(sw ? [h('div', { class: 'vz-controls' }, sw)] : []), stage, h('p', { class: 'vz-take' }, spec.takeaway), h('figcaption', { class: 'vz-cap' }, spec.caption));
  run();
}
