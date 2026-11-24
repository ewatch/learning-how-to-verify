import { EXERCISE_DE } from '../../data/exercise-copy';
import { h, codeRows, pill, esc, highlightJs, type Lang, type CodeRow } from './kit';
import { PR, SCANNERS, ISSUES, analyse, type IssueId, type ScannerId } from '../engine/secrets';
import './secrets.css';

const T = {
  en: {
    intro: 'An agent opened this PR. Switch scanners on and watch which problems get marked; leave nothing slipping through.',
    scanners: 'Scanners',
    sc: {
      patterns: ['Secret patterns', 'known key formats, e.g. AKIA…'],
      entropy: ['Entropy check', 'random-looking strings'],
      envfiles: ['.env files', 'committed env files'],
      newdep: ['New-dependency gate', 'a human approves each new package'],
      typosquat: ['Typosquat check', 'name within edit distance 2 of a popular package'],
      vuln: ['Known-vulnerability check', 'versions with a known CVE'],
    } as Record<ScannerId, [string, string]>,
    issue: {
      apikey: 'Hard-coded API key', aws: 'AWS access key id', envfile: 'Committed .env file',
      typosquat: 'New package left-padd (typosquat of left-pad)', cve: 'lodash 4.17.15 has a known CVE',
    } as Record<IssueId, string>,
    summary: (c: number, n: number) => `${c} of ${n} problems caught`,
    slips: 'Slips through', caught: 'caught by',
    noCve: 'Brand new, so no CVE exists yet.',
    sample: 'Sample data: all keys and packages are fake; the advisory list is a tiny built-in sample, not a live feed.',
    win: 'Everything caught.',
    lesson: 'Each scanner is cheap and catches one class of problem. A brand-new malicious package has no CVE yet, so only the new-dependency gate and the typosquat check can help there.',
    hint: 'The vulnerability check alone cannot see left-padd: nothing is known about it yet.',
  },
  de: {
    intro: EXERCISE_DE.secrets.intro,
    scanners: 'Scanner',
    sc: {
      patterns: ['Secret-Muster', 'bekannte Schlüsselformate, z. B. AKIA…'],
      entropy: ['Entropie-Check', 'zufällig aussehende Strings'],
      envfiles: ['.env-Dateien', 'eingecheckte env-Dateien'],
      newdep: ['Gate für neue Abhängigkeiten', 'ein Mensch gibt jedes neue Paket frei'],
      typosquat: ['Typosquat-Check', 'Name mit Edit-Distanz ≤ 2 zu einem beliebten Paket'],
      vuln: ['Check auf bekannte Schwachstellen', 'Versionen mit bekannter CVE'],
    } as Record<ScannerId, [string, string]>,
    issue: {
      apikey: 'Fest kodierter API-Key', aws: 'AWS Access Key ID', envfile: 'Eingecheckte .env-Datei',
      typosquat: 'Neues Paket left-padd (Typosquat von left-pad)', cve: 'lodash 4.17.15 hat eine bekannte CVE',
    } as Record<IssueId, string>,
    summary: (c: number, n: number) => `${c} von ${n} Problemen gefunden`,
    slips: 'Rutscht durch', caught: 'gefunden von',
    noCve: 'Brandneu, also gibt es noch keine CVE.',
    sample: 'Beispieldaten: Alle Schlüssel und Pakete sind erfunden; die Advisory-Liste ist ein winziges eingebautes Beispiel, kein Live-Feed.',
    win: 'Alles gefunden.',
    lesson: 'Jeder Scanner ist billig und findet eine Problemklasse. Ein brandneues bösartiges Paket hat noch keine CVE, deshalb helfen dort nur das Gate für neue Abhängigkeiten und der Typosquat-Check.',
    hint: EXERCISE_DE.secrets.hint,
  },
};

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  const enabled = new Set<ScannerId>();

  const box = h('fieldset', { class: 'sc-scanners' }, h('legend', { class: 'small muted' }, t.scanners));
  for (const s of SCANNERS) {
    box.append(h('label', { class: 'sc-scanner' },
      h('input', { type: 'checkbox', onchange: (e: Event) => { if ((e.target as HTMLInputElement).checked) enabled.add(s); else enabled.delete(s); render(); } }),
      h('div', {}, h('b', {}, t.sc[s][0]), h('span', {}, t.sc[s][1]))));
  }
  const files = h('div', { class: 'grid', style: 'gap:10px' });
  const summary = h('div', { 'aria-live': 'polite', class: 'grid', style: 'gap:8px' });
  root.append(h('div', { class: 'sim' }, h('p', { class: 'sim-intro' }, t.intro), box, files, summary, h('p', { class: 'sc-note' }, t.sample)));

  function render() {
    const a = analyse(PR, enabled);
    files.replaceChildren(...PR.map((f, fi) => {
      const rows: CodeRow[] = f.lines.map((l, li) => {
        const hits = a.findings.filter((x) => x.file === fi && x.line === li);
        const badges = hits.map((x) => h('span', { class: 'sc-badge' }, t.sc[x.scanner][0]));
        return { no: l.kind === 'add' ? '+' : '', cls: (l.kind === 'add' ? 'plus' : '') + (hits.length ? ' err' : ''), node: h('span', {}, h('span', { html: highlightJs(l.text) || esc(' ') }), ...badges) };
      });
      return h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, f.path), codeRows(rows, f.path));
    }));

    const caught = a.issues.length - a.slipping.length;
    const list = h('ul', { class: 'sc-issues' }, ...a.issues.map((i) => h('li', {},
      i.caughtBy.length ? pill('ok', `✓ ${t.caught} ${i.caughtBy.map((s) => t.sc[s][0]).join(', ')}`) : pill('bad', `✕ ${t.slips}`),
      h('span', {}, t.issue[i.id]),
      i.id === 'typosquat' && !i.caughtBy.includes('typosquat') ? h('span', { class: 'sc-note' }, t.noCve) : null)));
    const out: Node[] = [h('div', { class: 'sim-row' }, pill(a.solved ? 'ok' : 'warn', t.summary(caught, ISSUES.length))), list];
    if (a.solved) out.push(h('div', { class: 'sim-callout ok' }, h('p', {}, h('strong', {}, t.win)), h('p', {}, t.lesson)));
    else if (enabled.has('vuln') && a.slipping.includes('typosquat') && !enabled.has('newdep') && !enabled.has('typosquat')) out.push(h('div', { class: 'sim-callout' }, t.hint));
    summary.replaceChildren(...out);
  }
  render();
}
