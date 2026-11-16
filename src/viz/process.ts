import './frame.css';
import './process.css';
import { mountMode } from './process/frame';
import { MODE_DEFS } from './process/modes';

export function mount(el: HTMLElement, lang: 'en' | 'de', mode: string) {
  const def = MODE_DEFS[mode];
  if (!def) { el.textContent = `${lang === 'en' ? 'Unknown diagram' : 'Unbekanntes Diagramm'} (${mode})`; return; }
  mountMode(el, lang, mode, def);
}
