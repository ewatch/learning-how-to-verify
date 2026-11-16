import { h, highlight, rich, sleep, reducedMotion, type Lang } from './kit';
import { LEAN_EXAMPLES, type LeanExample } from '../engine/lean';

const KWS = new Set(['def', 'theorem', 'example', 'by', 'with', 'if', 'then', 'else', 'fun', 'match', 'induction', 'simp', 'omega', 'unfold', 'split', 'rw', 'exact', 'intro', 'decide', 'Nat', 'List']);
const T = {
  en: {
    intro: 'Lean 4 is a programming language and a proof assistant. You state a claim as a theorem and prove it step by step with tactics; after each step the Infoview shows what is known (above ⊢) and what is still to show. When no goal is left, a small trusted kernel checks the whole proof.',
    example: 'Example', prev: '◀ Back', next: 'Next ▶', play: '▶ Play proof', reset: '↺ Reset', or: 'or click a line with a coloured number',
    infoview: 'Lean Infoview', idle: 'With "Next ▶" the cursor moves through the proof. Here Lean shows what it knows at that point and what is still to show.',
    goal: '1 goal', goals: (n: number) => `${n} goals`, noGoals: 'No goals', caseWord: 'case',
    note: 'Honest note: Lean itself does not run in the browser. The code is real Lean 4; the goal states are transcribed from what the Infoview shows (error messages slightly shortened). Try it all at live.lean-lang.org.',
  },
  de: {
    intro: 'Lean 4 ist Programmiersprache und Beweisassistent zugleich. Man formuliert eine Behauptung als theorem und beweist sie Schritt für Schritt mit Taktiken; nach jedem Schritt zeigt der Infoview, was bekannt ist (über ⊢) und was noch zu zeigen ist. Ist kein Ziel mehr offen, prüft ein kleiner, vertrauenswürdiger Kernel den ganzen Beweis.',
    example: 'Beispiel', prev: '◀ Zurück', next: 'Weiter ▶', play: '▶ Beweis abspielen', reset: '↺ Zurücksetzen', or: 'oder auf eine Zeile mit farbiger Nummer klicken',
    infoview: 'Lean Infoview', idle: 'Mit „Weiter ▶“ wandert der Cursor durch den Beweis. Hier erscheint dann, was Lean an dieser Stelle weiß und was noch zu zeigen ist.',
    goal: '1 goal', goals: (n: number) => `${n} goals`, noGoals: 'No goals', caseWord: 'case',
    note: 'Ehrlicher Hinweis: Lean selbst läuft hier nicht im Browser. Der Code ist echtes Lean 4, die Zielzustände entsprechen dem, was der Infoview anzeigt (Fehlermeldungen leicht gekürzt). Ausprobieren lässt sich alles unter live.lean-lang.org.',
  },
};

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  const S = { ex: LEAN_EXAMPLES[0]!, idx: -1, run: 0 };
  const desc = h('div', { class: 'sim-callout' });
  const file = h('div', { class: 'sim-card-title' });
  const code = h('div');
  const pos = h('div', { class: 'sim-card-title' }, t.infoview);
  const body = h('div', { class: 'sim-iv-body', 'aria-live': 'polite' });
  const note = h('div', { class: 'sim-callout', hidden: true });
  const prev = h('button', { class: 'btn ghost', type: 'button', onclick: () => { S.run++; go(Math.max(-1, S.idx - 1)); } }, t.prev);
  const next = h('button', { class: 'btn', type: 'button', onclick: () => { S.run++; go(Math.min(S.ex.steps.length - 1, S.idx + 1)); } }, t.next);
  const chips = h('div', { class: 'sim-row', role: 'group', 'aria-label': t.example });
  LEAN_EXAMPLES.forEach((e, i) => chips.append(h('button', { class: 'btn ghost sm', type: 'button', 'aria-pressed': i === 0, onclick: (ev: Event) => {
    S.ex = e;
    chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === ev.currentTarget)));
    load();
  } }, e.name[lang])));

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, t.intro),
    chips, desc,
    h('div', { class: 'sim-row' }, prev, next,
      h('button', { class: 'btn', type: 'button', onclick: () => play() }, t.play),
      h('button', { class: 'btn ghost', type: 'button', onclick: () => { S.run++; go(-1); } }, t.reset),
      h('span', { class: 'sim-hint' }, t.or)),
    h('div', { class: 'sim-cols' },
      h('div', { class: 'sim-card' }, file, code),
      h('div', {}, h('div', { class: 'sim-card sim-iv' }, pos, body), note)),
    h('p', { class: 'sim-hint' }, t.note),
  ));

  async function play() {
    const id = ++S.run;
    for (let i = 0; i < S.ex.steps.length; i++) {
      if (id !== S.run) return;
      go(i);
      await sleep(reducedMotion() ? 400 : 1900);
    }
  }

  function load() {
    S.run++;
    const e: LeanExample = S.ex;
    desc.replaceChildren(h('p', {}, ...rich(e.desc[lang])));
    file.textContent = e.file;
    go(-1);
  }

  function go(i: number) {
    S.idx = i;
    const e = S.ex, st = e.steps[i];
    const lines = e.lines[lang];
    const stepLines = new Set(e.steps.map((s) => s.line));
    const wrap = h('div', { class: 'sim-code', role: 'region', 'aria-label': e.file, tabindex: 0 });
    lines.forEach((l, n) => {
      const stepIdx = e.steps.findIndex((s) => s.line === n);
      const isStep = stepLines.has(n);
      const row = h('div', { class: `ln${isStep ? ' step' : ''}${st && st.line === n ? ' hl' : ''}${st?.err && st.line === n ? ' err' : ''}`, ...(isStep ? { role: 'button', tabindex: 0 } : {}) },
        h('span', { class: 'no' }, String(n + 1)), h('span', { class: 'tx', html: highlight(l, KWS, '--') }));
      if (isStep) {
        const jump = () => { S.run++; go(stepIdx); };
        row.addEventListener('click', jump);
        row.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); jump(); } });
      }
      wrap.append(row);
    });
    code.replaceChildren(wrap);
    prev.disabled = i < 0;
    next.disabled = i >= e.steps.length - 1;
    if (!st) {
      pos.textContent = t.infoview;
      body.replaceChildren(h('span', { class: 'sim-hint' }, t.idle));
      note.hidden = true;
      return;
    }
    pos.textContent = `▼ ${e.file}:${st.line + 1}:${lines[st.line]!.length}`;
    const kids: Node[] = [];
    if (st.msg !== undefined) kids.push(h('div', { class: 'sim-iv-msg' }, st.msg));
    if (st.goals) {
      if (!st.goals.length) kids.push(h('div', { class: 'sim-iv-msg done' }, t.noGoals));
      else {
        kids.push(h('div', { class: 'sim-hint' }, st.goals.length === 1 ? t.goal : t.goals(st.goals.length)));
        for (const g of st.goals) {
          kids.push(h('div', { class: 'sim-iv-goal' },
            g.c ? h('div', { class: 'sim-hint' }, `${t.caseWord} ${g.c}`) : null,
            ...g.hyps.map((x) => { const [n, ...r] = x.split(' : '); return h('div', {}, h('strong', {}, n), ` : ${r.join(' : ')}`); }),
            h('div', { class: 'sim-iv-tgt' }, `⊢ ${g.goal}`)));
        }
      }
    }
    if (st.err) kids.push(h('pre', { class: 'sim-iv-msg err' }, st.err));
    body.replaceChildren(...kids);
    note.hidden = false;
    note.className = `sim-callout${st.done ? ' ok' : st.fail ? ' bad' : ''}`;
    note.replaceChildren(h('p', {}, st.done ? '✓ ' : st.fail ? '✗ ' : '', ...rich(st.note[lang])), ...(st.done ? [h('p', {}, ...rich(st.done[lang]))] : st.fail ? [h('p', {}, ...rich(st.fail[lang]))] : []));
  }
  load();
}
