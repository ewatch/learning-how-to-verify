import { EXERCISE_DE } from '../../data/exercise-copy';
import { h, highlight, rich, sleep, reducedMotion, devMark, type Lang } from './kit';
import { PRESETS, ParseError, analyse, checkAt, exec, ev, makeSearch, envAt, show, type Analysis, type Env, type Expr, type Preset, type Seg, type WpStep } from '../engine/wp';

const KWS = new Set(['if', 'else', 'true', 'false']);
const T = {
  en: {
    intro: 'A verifier works backwards from postcondition Q through each line to compute the weakest precondition wp, then checks that P implies wp. Here a finite mini solver stands in for Z3.',
    example: 'Example', pre: 'Precondition P (requires)', post: 'Postcondition Q (ensures)',
    play: '▶ Animate proof', step: '→ One step', reset: '↺ Reset', edit: '✎ Edit program', apply: 'Apply', syntax: 'Syntax: `v := expr;` and `if cond { … } else { … }`. Operators: + − * / % == != < <= > >= && || ! ==>',
    legend: 'Dashed lines are the computed assertions at each program point. The highlighted part is the expression substituted last.',
    log: 'Proof log', solver: 'Mini solver',
    start: 'Start: postcondition Q at the end of the program', startD: 'We work from bottom to top.',
    assign: (v: string) => `Assignment ${v} := …`, ifPost: 'if: Q must hold at the end of both branches', ifPostD: 'The postcondition is copied into both branches.',
    ifSplit: 'Case split (if)', ifSplitD: 'wp(if c {S₁} else {S₂}, Q) = (c ⇒ wp(S₁, Q)) ∧ (¬c ⇒ wp(S₂, Q))', vc: 'Verification condition', vcD: 'To show:',
    searchFor: 'Looks for an assignment with P true and wp false (a counterexample) over', values: 'assignments', checking: 'checking',
    constOk: '✓ The condition is constantly true: proven.', constBad: '✗ The condition is constantly false.',
    cex: 'Counterexample:', cexTail: 'P is true there but wp(C, Q) is false, so the program does not meet the specification.', probe: 'Check by real execution:', nothing: '(nothing)', qIs: 'Q is',
    ok: '✓ No counterexample in the search range. A real SMT solver (e.g. Z3) would show that P ∧ ¬wp is unsatisfiable symbolically, for all integers. This demo only searched a small finite range.',
    note: 'Honest note: the demo only checks a small finite range of integers. Real verifiers such as Dafny use an SMT solver (Z3) that proves the condition symbolically for all inputs.',
    errLabel: 'Error', requires: 'requires', ensures: 'ensures', replaceEvery: 'Replace every', by: 'by', divZero: 'Division by 0',
    program: 'Program',
  },
  de: {
    intro: EXERCISE_DE.wp.intro,
    example: 'Beispiel', pre: 'Vorbedingung P (requires)', post: 'Nachbedingung Q (ensures)',
    play: '▶ Beweis animieren', step: '→ Ein Schritt', reset: '↺ Zurücksetzen', edit: '✎ Programm bearbeiten', apply: 'Übernehmen', syntax: 'Syntax: `v := ausdruck;` und `if bedingung { … } else { … }`. Operatoren: + − * / % == != < <= > >= && || ! ==>',
    legend: 'Die gestrichelten Zeilen sind die berechneten Zusicherungen an jeder Programmstelle. Markiert ist der zuletzt eingesetzte Ausdruck.',
    log: 'Beweisprotokoll', solver: 'Mini-Solver',
    start: 'Start: Nachbedingung Q ans Programmende', startD: 'Wir rechnen von unten nach oben.',
    assign: (v: string) => `Zuweisung ${v} := …`, ifPost: 'if: Q muss am Ende beider Zweige gelten', ifPostD: 'Die Nachbedingung wird in beide Zweige hineinkopiert.',
    ifSplit: 'Fallunterscheidung (if)', ifSplitD: 'wp(if c {S₁} else {S₂}, Q) = (c ⇒ wp(S₁, Q)) ∧ (¬c ⇒ wp(S₂, Q))', vc: 'Verifikationsbedingung', vcD: 'Zu zeigen:',
    searchFor: 'Sucht eine Belegung mit P wahr und wp falsch (Gegenbeispiel) über', values: 'Belegungen', checking: 'prüfe',
    constOk: '✓ Die Bedingung ist konstant wahr: bewiesen.', constBad: '✗ Die Bedingung ist konstant falsch.',
    cex: 'Gegenbeispiel:', cexTail: 'P ist dort wahr, wp(C, Q) aber falsch. Das Programm erfüllt die Spezifikation also nicht.', probe: 'Probe durch echte Ausführung:', nothing: '(nichts)', qIs: 'Q ist',
    ok: '✓ Kein Gegenbeispiel im Suchbereich. Ein echter SMT-Solver (z. B. Z3) zeigt, dass P ∧ ¬wp symbolisch unerfüllbar ist, für alle ganzen Zahlen. Diese Demo hat nur einen kleinen endlichen Bereich durchsucht.',
    note: EXERCISE_DE.wp.note,
    errLabel: 'Fehler', requires: 'requires', ensures: 'ensures', replaceEvery: 'Ersetze jedes', by: 'durch', divZero: 'Division durch 0',
    program: 'Programm',
  },
};

const segNodes = (segs: Seg[]): (Node | string)[] =>
  segs.map((s) => {
    let n: Node | string = s.text;
    if (s.it) n = h('i', {}, s.text);
    return s.hl ? h('mark', {}, n) : n;
  });
const formula = (e: Expr, braces = false) => h('span', { class: 'sim-formula' }, braces ? '{ ' : '', ...segNodes(show(e)), braces ? ' }' : '');
const envText = (env: Env, vars: string[]) => vars.map((v) => `${v} = ${env[v]}`).join(', ');

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  const S = { src: '', a: null as Analysis | null, idx: 0, playing: false, run: 0 };
  let slotEls: Record<string, HTMLElement> = {};
  let lineEls: HTMLElement[] = [];

  const sel = h('select', { id: `wp-ex-${Math.random().toString(36).slice(2)}`, onchange: () => load(PRESETS[Number(sel.value)]!) });
  PRESETS.forEach((p, i) => sel.append(h('option', { value: i }, p.name[lang])));
  const preIn = h('input', { type: 'text', 'aria-label': t.pre, spellcheck: 'false', onchange: () => prepare() });
  const postIn = h('input', { type: 'text', 'aria-label': t.post, spellcheck: 'false', onchange: () => prepare() });
  const hint = h('p', { class: 'sim-hint' });
  const code = h('div');
  const srcArea = h('textarea', { class: 'sim-textarea', 'aria-label': t.program, spellcheck: 'false', rows: 7 });
  const editBox = h('div', { hidden: true }, srcArea, h('div', { class: 'sim-row' }, h('button', { class: 'btn', type: 'button', onclick: () => { S.src = srcArea.value; editBox.hidden = true; code.hidden = false; prepare(); } }, t.apply)), h('p', { class: 'sim-hint' }, ...rich(t.syntax)));
  const steps = h('ol', { class: 'sim-steps', 'aria-live': 'polite' });
  const solver = h('div');
  const playBtn = h('button', { class: 'btn', type: 'button', onclick: () => play() }, t.play);
  const stepBtn = h('button', { class: 'btn ghost', type: 'button', onclick: () => { S.playing = false; advance(); } }, t.step);

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro', ...devMark('shorter sim intro') }, t.intro),
    h('div', { class: 'sim-row' },
      h('label', { class: 'inline' }, t.example, sel),
      h('label', { class: 'inline' }, t.pre, preIn),
      h('label', { class: 'inline' }, t.post, postIn)),
    h('div', { class: 'sim-row' }, playBtn, stepBtn,
      h('button', { class: 'btn ghost', type: 'button', onclick: () => prepare() }, t.reset),
      h('button', { class: 'btn ghost', type: 'button', onclick: () => { editBox.hidden = !editBox.hidden; code.hidden = !editBox.hidden; srcArea.value = S.src; } }, t.edit)),
    hint,
    h('div', { class: 'sim-cols' },
      h('div', {}, code, editBox, h('p', { class: 'sim-hint' }, t.legend)),
      h('div', {}, h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.log), steps), h('div', { style: 'margin-top:10px' }, solver))),
    h('p', { class: 'sim-hint' }, t.note),
  ));

  function load(p: Preset) {
    S.src = p.prog; preIn.value = p.pre; postIn.value = p.post;
    hint.replaceChildren(...rich(p.hint[lang]));
    prepare();
  }

  function prepare() {
    S.run++; S.playing = false; S.idx = 0;
    steps.replaceChildren(); solver.replaceChildren(); slotEls = {}; lineEls = [];
    try { S.a = analyse(S.src, preIn.value, postIn.value); }
    catch (e) {
      S.a = null;
      if (!(e instanceof ParseError)) throw e;
      code.replaceChildren(h('div', { class: 'sim-callout bad', role: 'alert' }, `${t.errLabel}: ${e.msg[lang]}`));
      return;
    }
    const wrap = h('div', { class: 'sim-code', role: 'region', 'aria-label': t.program, tabindex: 0 });
    wrap.append(h('div', { class: 'ln spec' }, h('span', { class: 'no' }), h('span', { class: 'tx' }, h('span', { class: 'tk-kw' }, t.requires), ' ', ...segNodes(show(S.a.P)))));
    S.src.split('\n').forEach((l, i) => {
      const anno = h('div', { class: 'ln anno', hidden: true }, h('span', { class: 'no' }), h('span', { class: 'tx' }));
      slotEls[String(i)] = anno;
      const line = h('div', { class: 'ln' }, h('span', { class: 'no' }, String(i + 1)), h('span', { class: 'tx', html: highlight(l, KWS) }));
      lineEls[i] = line;
      wrap.append(anno, line);
    });
    const end = h('div', { class: 'ln anno', hidden: true }, h('span', { class: 'no' }), h('span', { class: 'tx' }));
    slotEls.end = end;
    wrap.append(end, h('div', { class: 'ln spec' }, h('span', { class: 'no' }), h('span', { class: 'tx' }, h('span', { class: 'tk-kw' }, t.ensures), ' ', ...segNodes(show(S.a.Q)))));
    code.replaceChildren(wrap);
  }

  function stepText(st: WpStep): { title: string; detail: (Node | string)[] } {
    const a = S.a!;
    switch (st.kind) {
      case 'start': return { title: t.start, detail: [t.startD] };
      case 'assign': return { title: t.assign(st.v!), detail: [`wp(${st.v} := E, Q) = Q[${st.v} ↦ E]. ${t.replaceEvery} ${st.v} ${t.by} `, formula(st.e!), '.'] };
      case 'ifPost': return { title: t.ifPost, detail: [t.ifPostD] };
      case 'ifSplit': return { title: t.ifSplit, detail: [t.ifSplitD] };
      default: return { title: t.vc, detail: [`${t.vcD} `, formula(a.VC)] };
    }
  }

  function advance(): boolean {
    const a = S.a;
    if (!a || S.idx >= a.steps.length) return false;
    const st = a.steps[S.idx++]!;
    Object.values(slotEls).forEach((el) => el.classList.add('old'));
    lineEls.forEach((el, i) => el.classList.toggle('hl', st.hl.includes(i)));
    for (const [slot, f] of Object.entries(st.slots)) {
      const el = slotEls[slot];
      if (!el) continue;
      el.classList.remove('old');
      el.hidden = false;
      el.querySelector('.tx')!.replaceChildren(formula(f, true));
    }
    steps.querySelectorAll('li').forEach((li) => li.classList.remove('cur'));
    const { title, detail } = stepText(st);
    const li = h('li', { class: 'cur' }, h('strong', {}, title), h('div', { class: 'sim-hint' }, ...detail));
    steps.append(li);
    li.scrollIntoView?.({ block: 'nearest' });
    if (st.kind === 'vc') void solve();
    return true;
  }

  async function play() {
    if (!S.a) return;
    if (S.idx >= S.a.steps.length) prepare();
    const id = S.run;
    S.playing = true;
    while (S.playing && id === S.run && advance()) await sleep(reducedMotion() ? 0 : 1100);
  }

  async function solve() {
    const a = S.a!;
    const id = S.run;
    const search = makeSearch(a.VC);
    const { vars, total, range } = search;
    if (!vars.length) {
      const ok = ev(a.VC, {});
      solver.replaceChildren(h('div', { class: `sim-callout ${ok ? 'ok' : 'bad'}` }, ok ? t.constOk : t.constBad));
      return;
    }
    const meter = h('i');
    const ticker = h('div', { class: 'sim-hint', 'aria-hidden': 'true' }, '…');
    const res = h('div', { 'aria-live': 'polite' });
    solver.replaceChildren(h('div', { class: 'sim-card' },
      h('div', { class: 'sim-card-title' }, t.solver),
      h('p', { class: 'sim-hint' }, `${t.searchFor} ${vars.join(', ')} ∈ [−${range}, ${range}] (${total.toLocaleString(lang)} ${t.values})`),
      h('div', { class: 'sim-meter' }, meter), ticker, res));
    const per = reducedMotion() ? total : Math.max(1, Math.ceil(total / 45));
    let k = 0;
    let cex = null as ReturnType<typeof checkAt>;
    while (k < total && !cex) {
      const end = Math.min(total, k + per);
      for (; k < end; k++) { cex = checkAt(a.VC, search, k); if (cex) break; }
      if (id !== S.run) return;
      meter.style.width = `${(100 * k) / total}%`;
      ticker.textContent = `${t.checking} ${envText(cex ? cex.env : envAt(search, Math.min(k, total - 1)), vars)}`;
      if (per < total) await sleep(16);
    }
    if (!cex) { res.replaceChildren(h('div', { class: 'sim-callout ok' }, t.ok)); return; }
    const kids: (Node | string)[] = [h('strong', {}, `✗ ${t.cex}`), ` ${envText(cex.env, vars)}`];
    if (cex.error) kids.push(` (${cex.error[lang]})`);
    kids.push(h('br'), t.cexTail);
    try {
      const trace: { v: string; value: number }[] = [];
      const env = { ...cex.env };
      exec(a.stmts, env, trace);
      const q = ev(a.Q, env);
      kids.push(h('br'), `${t.probe} ${trace.map((x) => `${x.v} = ${x.value}`).join(' → ') || t.nothing} ⇒ ${t.qIs} `, h('strong', {}, String(q)), '.');
    } catch (e) { kids.push(h('br'), e instanceof Error && 'msg' in e ? (e as unknown as { msg: Record<Lang, string> }).msg[lang] : String(e)); }
    res.replaceChildren(h('div', { class: 'sim-callout bad' }, ...kids));
  }

  load(PRESETS[0]!);
}
