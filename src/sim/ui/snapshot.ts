import { EXERCISE_DE } from '../../data/exercise-copy';
import { h, pill, codeRows, rich, type Lang } from './kit';
import { CHANGES, diffFor, diffAfterAutoUpdate, changed, score, type Verdict, type DiffLine } from '../engine/snapshot';
import './snapshot.css';

const T = {
  en: {
    intro: 'An agent changed `renderInvoice`. The snapshot test fails on each change. Approve the diff if the change is wanted, reject it if it is a bug.',
    auto: 'Agent updates snapshots automatically', code: 'Agent\'s code change', diff: 'Output vs. snapshot', approve: 'Approve', reject: 'Reject',
    right: 'Correct', wrong: 'Wrong', progress: (n: number, t: number) => `${n} of ${t} decided`, score: (n: number, t: number) => `${n} of ${t} correct`,
    pass: 'test green', fail: 'test red', updated: 'snapshot silently re-recorded, so the test passes',
    trap: 'All five tests are green, including the two bugs. The agent re-recorded the snapshot with the change that broke it, so nothing was left to compare.',
    lesson: 'A snapshot only says something changed. A human decides whether it is right, and the change that broke the test must never be the one that updates the snapshot.',
    reset: 'Start over', snapshotLabel: 'Snapshot (recorded)',
  },
  de: {
    intro: EXERCISE_DE.snapshot.intro,
    auto: 'Agent aktualisiert Snapshots automatisch', code: 'Code-Änderung des Agents', diff: 'Ausgabe vs. Snapshot', approve: 'Approve', reject: 'Reject',
    right: 'Richtig', wrong: 'Falsch', progress: (n: number, t: number) => `${n} von ${t} entschieden`, score: (n: number, t: number) => `${n} von ${t} richtig`,
    pass: 'Test grün', fail: 'Test rot', updated: 'Snapshot stillschweigend neu aufgezeichnet, der Test besteht',
    trap: 'Alle fünf Tests sind grün, auch die zwei Bugs. Der Agent hat den Snapshot mit der Änderung neu aufgezeichnet, die ihn gebrochen hat. Es gab nichts mehr zu vergleichen.',
    lesson: 'Ein Snapshot sagt nur, dass sich etwas geändert hat. Ein Mensch entscheidet, ob es stimmt, und die Änderung, die den Test gebrochen hat, darf den Snapshot nie selbst aktualisieren.',
    reset: 'Neu starten', snapshotLabel: 'Snapshot (aufgezeichnet)',
  },
};

function diffView(d: DiffLine[]) {
  return codeRows(d.map((l) => ({ no: l.op === 'add' ? '+' : l.op === 'del' ? '−' : '', html: l.text.replace(/&/g, '&amp;').replace(/</g, '&lt;') || ' ', cls: l.op === 'add' ? 'plus' : l.op === 'del' ? 'minus' : '' })), 'diff');
}

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  let auto = false;
  let decisions: Record<string, Verdict | undefined> = {};
  const list = h('div', { class: 'grid', style: 'gap:10px' });
  const progress = h('span', { class: 'small muted', 'aria-live': 'polite' });
  const outcome = h('div', { class: 'sim-callout', hidden: true, role: 'status' });
  const cb = h('input', { type: 'checkbox', id: `snap-auto-${Math.random().toString(36).slice(2)}`, onchange: (e: Event) => { auto = (e.target as HTMLInputElement).checked; render(); } });
  const reset = h('button', { class: 'btn ghost', type: 'button', onclick: () => { decisions = {}; render(); } }, t.reset);

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, ...rich(t.intro)),
    h('div', { class: 'sim-row', style: 'justify-content:space-between' },
      h('label', { class: 'inline snap-toggle', for: cb.id }, cb, t.auto), progress),
    list, outcome, h('div', { class: 'sim-row' }, reset)));

  function render() {
    const s = score(decisions);
    list.replaceChildren(...CHANGES.map((c, i) => {
      const d = decisions[c.id];
      const r = s.results[i];
      const diff = auto ? diffAfterAutoUpdate(c) : diffFor(c);
      const fb = !auto && d ? (r.correct ? pill('ok', `✓ ${t.right}`) : pill('bad', `✗ ${t.wrong}`)) : null;
      const status = auto ? pill('ok', `✓ ${t.pass}`) : pill(d ? 'idle' : 'bad', d ? t.fail : `✗ ${t.fail}`);
      const btn = (v: Verdict, label: string) => h('button', {
        class: `btn ${v === 'approve' ? '' : 'ghost'}`, type: 'button', 'aria-pressed': d === v ? 'true' : 'false',
        onclick: () => { decisions[c.id] = v; render(); },
      }, label);
      return h('div', { class: `snap-card ${!auto && d ? (r.correct ? 'ok' : 'bad') : ''}` },
        h('div', { class: 'snap-head' }, h('b', {}, `${i + 1}. ${c.title[lang]}`), h('span', { class: 'sim-row', style: 'gap:6px' }, fb, status)),
        h('div', { class: 'small muted' }, t.code),
        diffView([...c.before.split('\n').map((x) => ({ op: 'del' as const, text: x })), ...c.after.split('\n').map((x) => ({ op: 'add' as const, text: x }))]),
        h('div', { class: 'small muted' }, auto ? t.updated : `${t.diff} · ${t.snapshotLabel}`),
        auto && !changed(diff) ? diffView(diff.slice(0, 3)) : diffView(diff),
        auto ? null : h('div', { class: 'snap-actions' }, btn('approve', t.approve), btn('reject', t.reject)),
        !auto && d ? h('p', { class: 'snap-why' }, c.why[lang]) : null);
    }));
    progress.textContent = auto ? '' : t.progress(s.decided, s.total);
    outcome.hidden = !(auto || s.decided === s.total);
    outcome.className = `sim-callout ${auto ? 'bad' : s.correct === s.total ? 'ok' : ''}`;
    outcome.replaceChildren(
      ...(auto ? [h('p', {}, t.trap)] : [h('p', {}, h('b', {}, t.score(s.correct, s.total))), h('p', {}, t.lesson)]));
  }
  render();
}
