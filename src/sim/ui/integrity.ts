import { EXERCISE_DE } from '../../data/exercise-copy';
import { h, codeRows, pill, esc, highlightJs, devMark, type Lang, type CodeRow } from './kit';
import { GATES, PATCHES, evaluate, judge, decide, type GateId, type PatchId } from '../engine/integrity';
import './integrity.css';

const T = {
  en: {
    intro: 'An agent proposes five patches to make a failing test green. Toggle gates one by one to see which cheats each catches — and which only hidden tests catch.',
    gatesLabel: 'Gates', patchCol: 'Patch', verdict: 'Result',
    gate: {
      protected: ['Protected test paths', 'CODEOWNERS: tests/ needs a human'],
      noskip: ['No new skip / only', 'CI greps the diff for .skip and .only'],
      count: ['Assertion count must not drop', 'Counts toBe / toEqual / toThrow lines'],
      holdout: ['Hidden holdout tests', 'Other pets and people, run only in CI'],
    } as Record<GateId, [string, string]>,
    patch: { a: 'Fix the check in src', b: 'Skip the test', c: 'Weaken the assertion', d: 'Special-case the test data', e: 'Change the expected value' } as Record<PatchId, string>,
    blocks: 'blocks', passes: 'passes', off: 'off',
    merged: 'Merged', blocked: 'Blocked',
    cheatMerged: 'cheat merged', fixBlocked: 'real fix blocked', ok: 'as intended',
    selected: 'Selected patch', visible: 'Visible tests', hidden: 'Hidden tests', ran: (p: number, n: number) => (n === 0 ? '0 tests ran' : `${p}/${n} pass`),
    failing: 'Hidden tests failing',
    score: (b: number, n: number) => `Cheats blocked: ${b}/${n}`, fixOk: 'Real fix merges', fixNo: 'Real fix is blocked',
    hintD: 'Patch d still merges. No gate reads the code for special cases. Only tests the agent never saw can catch it.',
    hintOther: (ids: string) => `Still merging: ${ids}.`,
    win: 'All cheats blocked, real fix merged.',
    lesson: 'Only the holdout tests catch d, because the agent cannot special-case data it never saw. They also block the others, but only say "something fails"; the cheap gates say exactly what was done to the tests, which makes the review fast.',
    cheap: 'The other gates are cheap and fail faster with a clearer reason.',
    minimal: 'One gate is enough.', reset: 'Reset',
    cheatBadge: 'cheat', realBadge: 'real fix',
  },
  de: {
    intro: EXERCISE_DE.integrity.intro,
    gatesLabel: 'Gates', patchCol: 'Patch', verdict: 'Ergebnis',
    gate: {
      protected: ['Geschützte Testpfade', 'CODEOWNERS: tests/ braucht einen Menschen'],
      noskip: ['Kein neues skip / only', 'CI sucht im Diff nach .skip und .only'],
      count: ['Assertion-Anzahl darf nicht sinken', 'Zählt toBe- / toEqual- / toThrow-Zeilen'],
      holdout: ['Versteckte Holdout-Tests', 'Andere Tiere und Personen, nur in CI'],
    } as Record<GateId, [string, string]>,
    patch: { a: 'Prüfung in src korrigieren', b: 'Test überspringen', c: 'Assertion abschwächen', d: 'Testdaten sonderbehandeln', e: 'Erwartungswert ändern' } as Record<PatchId, string>,
    blocks: 'blockt', passes: 'lässt durch', off: 'aus',
    merged: 'Gemergt', blocked: 'Geblockt',
    cheatMerged: 'Schummelei gemergt', fixBlocked: 'echter Fix geblockt', ok: 'wie gewünscht',
    selected: 'Gewählter Patch', visible: 'Sichtbare Tests', hidden: 'Versteckte Tests', ran: (p: number, n: number) => (n === 0 ? '0 Tests gelaufen' : `${p}/${n} bestehen`),
    failing: 'Fehlschlagende versteckte Tests',
    score: (b: number, n: number) => `Schummeleien geblockt: ${b}/${n}`, fixOk: 'Echter Fix wird gemergt', fixNo: 'Echter Fix wird geblockt',
    hintD: 'Patch d wird weiter gemergt. Kein Gate liest den Code auf Sonderfälle. Nur Tests, die der Agent nie gesehen hat, erwischen ihn.',
    hintOther: (ids: string) => `Wird noch gemergt: ${ids}.`,
    win: 'Alle Schummeleien geblockt, echter Fix gemergt.',
    lesson: 'Nur die Holdout-Tests erwischen d, denn der Agent kann keine Daten sonderbehandeln, die er nie gesehen hat. Die anderen blocken sie auch, sagen aber nur „etwas schlägt fehl“; die billigen Gates sagen genau, was mit den Tests gemacht wurde, und machen das Review schnell.',
    cheap: 'Die anderen Gates sind billig und scheitern schneller mit klarerem Grund.',
    minimal: 'Ein Gate reicht.', reset: 'Zurücksetzen',
    cheatBadge: 'Schummelei', realBadge: 'echter Fix',
  },
};

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  const evals = PATCHES.map(evaluate);
  const enabled = new Set<GateId>();
  let sel: PatchId = 'd';

  const gatesBox = h('fieldset', { class: 'ig-gates' }, h('legend', { class: 'small muted' }, t.gatesLabel));
  for (const g of GATES) {
    gatesBox.append(h('label', { class: 'ig-gate' },
      h('input', { type: 'checkbox', onchange: (e: Event) => { if ((e.target as HTMLInputElement).checked) enabled.add(g); else enabled.delete(g); render(); } }),
      h('div', {}, h('b', {}, t.gate[g][0]), h('span', {}, t.gate[g][1]))));
  }
  const matrix = h('div', { class: 'ig-scroll' });
  const detail = h('div', { class: 'sim-card' });
  const status = h('div', { 'aria-live': 'polite' });

  root.append(h('div', { class: 'sim' }, h('p', { class: 'sim-intro', ...devMark('shorter sim intro') }, t.intro), gatesBox, matrix, status, detail));

  function render() {
    const j = judge(enabled, evals);
    // matrix
    const head = h('tr', {}, h('th', {}, t.patchCol), ...GATES.map((g) => h('th', { class: 'c' }, t.gate[g][0])), h('th', {}, t.verdict));
    const body = PATCHES.map((p, i) => {
      const d = decide(evals[i], enabled);
      const good = p.cheating ? !d.merged : d.merged;
      const note = good ? t.ok : p.cheating ? t.cheatMerged : t.fixBlocked;
      return h('tr', { class: p.id === sel ? 'cur' : '' },
        h('td', {}, h('button', { class: 'ig-pick', type: 'button', 'aria-pressed': String(p.id === sel), onclick: () => { sel = p.id; render(); } }, `${p.id}) ${t.patch[p.id]}`), ' ', pill(p.cheating ? 'warn' : 'idle', p.cheating ? t.cheatBadge : t.realBadge)),
        ...GATES.map((g) => h('td', { class: 'c' }, !enabled.has(g) ? pill('idle', t.off) : evals[i].gates[g].fired ? pill('bad', `✕ ${t.blocks}`) : pill('ok', `✓ ${t.passes}`))),
        h('td', {}, pill(good ? 'ok' : 'bad', `${d.merged ? t.merged : t.blocked}`), ' ', h('span', { class: 'small muted' }, note)));
    });
    matrix.replaceChildren(h('table', { class: 'sim-table ig-matrix' }, h('thead', {}, head), h('tbody', {}, ...body)));
    for (const th of matrix.querySelectorAll('th.c')) (th as HTMLElement).style.textAlign = 'center';

    // status
    const nCheats = PATCHES.filter((p) => p.cheating).length;
    const blocked = nCheats - j.cheatsMerged.length;
    const parts: Node[] = [h('div', { class: 'sim-row' }, pill(j.cheatsMerged.length ? 'warn' : 'ok', t.score(blocked, nCheats)), pill(j.fixMerged ? 'ok' : 'bad', j.fixMerged ? t.fixOk : t.fixNo))];
    if (j.solved) {
      parts.push(h('div', { class: 'sim-callout ok' }, h('p', {}, h('strong', {}, t.win)), h('p', {}, t.lesson), h('p', {}, enabled.size === 1 ? t.minimal : t.cheap)));
    } else if (j.cheatsMerged.length === 1 && j.cheatsMerged[0] === 'd') {
      parts.push(h('div', { class: 'sim-callout' }, t.hintD));
    } else if (j.cheatsMerged.length) {
      parts.push(h('p', { class: 'sim-hint' }, t.hintOther(j.cheatsMerged.join(', '))));
    }
    status.replaceChildren(h('div', { class: 'grid', style: 'gap:8px' }, ...parts));

    // detail
    const idx = PATCHES.findIndex((p) => p.id === sel);
    const ev = evals[idx];
    const rows: CodeRow[] = ev.diff.map((l, li) => {
      const fired = GATES.filter((g) => enabled.has(g) && ev.gates[g].lines.includes(li));
      const badges = fired.map((g) => h('span', { class: 'ig-badge' }, t.gate[g][0]));
      const cls = (l.kind === 'del' ? 'minus' : l.kind === 'add' ? 'plus' : l.kind === 'hdr' ? 'spec' : '') + (fired.length ? ' err' : '');
      const code = l.kind === 'hdr' || l.kind === 'sep' ? esc(l.text) : highlightJs(l.text) || ' ';
      return { no: l.kind === 'del' ? '−' : l.kind === 'add' ? '+' : '', cls, node: h('span', {}, h('span', { html: code }), ...badges) };
    });
    const vOk = ev.visible.filter((r) => r.ok).length;
    const hOk = ev.holdout.filter((r) => r.ok).length;
    const failing = ev.gates.holdout.failing ?? [];
    detail.replaceChildren(
      h('div', { class: 'sim-card-title' }, `${t.selected}: ${sel}) ${t.patch[sel]}`),
      codeRows(rows, 'diff'),
      h('div', { class: 'ig-tests' },
        h('span', {}, `${t.visible}: `, pill(ev.visible.every((r) => r.ok) ? 'ok' : 'bad', t.ran(vOk, ev.visible.length))),
        h('span', {}, `${t.hidden}: `, pill(hOk === ev.holdout.length ? 'ok' : 'bad', t.ran(hOk, ev.holdout.length)))),
      ...(failing.length ? [h('p', { class: 'ig-note' }, `${t.failing}: `, ...failing.flatMap((n, k) => [k ? ', ' : '', h('code', {}, n.replace('holdout: ', ''))]))] : []),
    );
  }
  render();
}
