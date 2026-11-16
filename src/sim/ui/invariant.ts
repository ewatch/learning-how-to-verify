import { h, highlight, rich, pill, sleep, reducedMotion, type Lang } from './kit';
import { OBLIGATIONS, VARIANTS, checkState, linesFor, spaceFor, states, type Arr, type Failure, type FailureCode, type ObligationKey, type State, type Variant } from '../engine/invariant';

const KWS = new Set(['method', 'returns', 'requires', 'ensures', 'invariant', 'decreases', 'var', 'while', 'if', 'forall', 'exists', 'array', 'int']);
const T = {
  en: {
    intro: 'A loop cannot be run for "all iterations", so a verifier like Dafny asks for a loop invariant: a statement that holds before and after every iteration. That gives four proof obligations. After the loop the verifier knows only the invariant, not what actually happened. This demo checks each obligation exhaustively over small arrays; real Dafny proves it symbolically with Z3.',
    pick: 'Variant (changed lines are wavy-underlined)', verify: '▶ Verify', checks: (n: string) => `checks every obligation over up to ${n} states`,
    open: 'open', running: 'checking …', proven: '✓ proven', failed: '✗ failed', relevant: 'relevant states', allOk: 'all ✓', cex: 'Counterexample:',
    removed: '(line with `invariant forall …` removed)', term: 'Dafny-style output',
    note: 'Honest note: this is a finite check (arrays of length 1–4 with values −2…2). Dafny does not test; it proves the obligations for all arrays.',
    errors: (n: number) => `${n} error${n === 1 ? '' : 's'}`,
  },
  de: {
    intro: 'Eine Schleife lässt sich nicht für „alle Durchläufe“ ausführen. Deshalb verlangt ein Verifizierer wie Dafny eine Schleifeninvariante: eine Aussage, die vor und nach jedem Durchlauf gilt. Daraus entstehen vier Beweisverpflichtungen. Nach der Schleife kennt der Verifizierer nur die Invariante, nicht den tatsächlichen Ablauf. Die Demo prüft jede Verpflichtung erschöpfend über kleine Arrays; echtes Dafny beweist sie symbolisch mit Z3.',
    pick: 'Variante (geänderte Zeilen sind wellig unterstrichen)', verify: '▶ Verifizieren', checks: (n: string) => `prüft jede Verpflichtung für bis zu ${n} Zustände`,
    open: 'offen', running: 'prüft …', proven: '✓ bewiesen', failed: '✗ fehlgeschlagen', relevant: 'relevante Zustände', allOk: 'alle ✓', cex: 'Gegenbeispiel:',
    removed: '(Zeile mit `invariant forall …` entfernt)', term: 'Ausgabe im Dafny-Stil',
    note: 'Ehrlicher Hinweis: Das ist eine endliche Prüfung (Arrays der Länge 1–4 mit Werten −2…2). Dafny testet nicht, sondern beweist die Verpflichtungen für alle Arrays.',
    errors: (n: number) => `${n} error${n === 1 ? '' : 's'}`,
  },
};
/** Messages as Dafny prints them (English, as in the real tool). */
const DAFNY: Record<FailureCode, string> = {
  'init-inv': 'This loop invariant might not hold on entry.',
  oob: 'index out of range',
  'keep-inv': 'This loop invariant might not be maintained by the loop.',
  'exit-post': 'A postcondition might not hold on this return path.',
  'term-neg': 'decreases expression might be negative',
  'term-nodec': 'decreases expression might not decrease',
};
const fmtA = (a: Arr) => `a = [${a.join(', ')}]`;
const fmtS = (a: Arr, i?: number, m?: number) => fmtA(a) + (i !== undefined ? `, i = ${i}` : '') + (m !== undefined ? `, m = ${m}` : '');

function cexText(f: Failure, lang: Lang): string {
  const de = lang === 'de';
  switch (f.code) {
    case 'init-inv': return `${fmtA(f.a)} ⇒ ${de ? 'nach Initialisierung' : 'after initialisation'} i = ${f.after!.i}, m = ${f.after!.m}`;
    case 'oob': return `${fmtS(f.a, f.i, f.m)} (${de ? 'Index' : 'index'} ${f.index})`;
    case 'keep-inv': return `${de ? 'vorher' : 'before'} ${fmtS(f.a, f.i, f.m)} ✓ → ${de ? 'nachher' : 'after'} i = ${f.after!.i}, m = ${f.after!.m} ✗`;
    case 'exit-post': return `${fmtS(f.a, f.i, f.m)}: ${de ? 'Invariante ✓, Schleifenbedingung falsch, aber ensures ✗' : 'invariant ✓, loop condition false, but ensures ✗'} (${de ? 'Zeile' : 'line'} ${f.line + 1})`;
    case 'term-nodec': return `${fmtS(f.a, f.i, f.m)}: a.Length − i = ${f.d0} ${de ? 'vorher' : 'before'}, ${f.d1} ${de ? 'nachher' : 'after'}`;
    default: return fmtS(f.a, f.i, f.m);
  }
}

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  const S = { v: VARIANTS[0]!, run: 0 };
  const code = h('div');
  const desc = h('p', { class: 'sim-hint' });
  const obls = h('div', { class: 'sim-obls' });
  const term = h('pre', { class: 'sim-log', 'aria-label': t.term, tabindex: 0 });
  const runBtn = h('button', { class: 'btn', type: 'button', onclick: () => run() }, t.verify);
  const chips = h('div', { class: 'sim-row', role: 'group', 'aria-label': t.pick });
  VARIANTS.forEach((v, k) => chips.append(h('button', { class: 'btn ghost sm', type: 'button', 'aria-pressed': k === 0, onclick: (ev: Event) => {
    S.v = v;
    chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === ev.currentTarget)));
    render();
  } }, v.name[lang])));

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, t.intro),
    chips,
    h('div', { class: 'sim-cols' },
      h('div', {}, code, desc),
      h('div', {}, h('div', { class: 'sim-row' }, runBtn, h('span', { class: 'sim-hint' }, t.checks(states().length.toLocaleString(lang)))), obls)),
    h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.term), term),
    h('p', { class: 'sim-hint' }, t.note),
  ));

  function listing(v: Variant, hl: number[] = []) {
    const wrap = h('div', { class: 'sim-code', role: 'region', 'aria-label': 'Dafny', tabindex: 0 });
    v.lines.forEach((l, i) => wrap.append(h('div', { class: `ln${v.changed.includes(i) ? ' changed' : ''}${hl.includes(i) ? ' hl' : ''}` }, h('span', { class: 'no' }, String(i + 1)), h('span', { class: 'tx', html: highlight(l, KWS) }))));
    return wrap;
  }
  function render() {
    S.run++;
    runBtn.disabled = false;
    code.replaceChildren(listing(S.v));
    desc.replaceChildren(...rich(S.v.desc[lang]), ...(S.v.removedInvariant ? [' ', ...rich(t.removed)] : []));
    obls.replaceChildren(...OBLIGATIONS.map((o) => h('div', { class: 'sim-card', 'data-k': o.key },
      h('div', { class: 'sim-card-title' }, o.title[lang], pill('idle', t.open)),
      h('div', { class: 'sim-hint' }, o.what[lang]),
      h('div', { class: 'sim-meter' }, h('i')), h('div', { class: 'sim-hint st' }), h('div', { class: 'cex' }))));
    term.textContent = '$ dafny verify max.dfy';
  }

  async function run() {
    render();
    const id = S.run, v = S.v;
    const errors: { line: number; code: FailureCode }[] = [];
    runBtn.disabled = true;
    for (const o of OBLIGATIONS) {
      if (id !== S.run) return;
      const card = obls.querySelector<HTMLElement>(`[data-k="${o.key}"]`)!;
      const pillBox = card.querySelector('.sim-card-title')!;
      const setPill = (el: HTMLElement) => { pillBox.lastElementChild!.replaceWith(el); };
      const bar = card.querySelector<HTMLElement>('.sim-meter > i')!, st = card.querySelector('.st')!;
      code.replaceChildren(listing(v, linesFor(v, o.key)));
      setPill(pill('warn', t.running));
      const space = spaceFor(o.key as ObligationKey);
      const per = reducedMotion() ? space.length : Math.ceil(space.length / 40);
      let checked = 0, k = 0;
      let fail: Failure | null = null;
      while (k < space.length && !fail) {
        const end = Math.min(space.length, k + per);
        for (; k < end; k++) {
          const r = checkState(v, o.key, space[k] as Arr & State);
          if (r === undefined) continue;
          checked++;
          if (r) { fail = r; break; }
        }
        if (id !== S.run) return;
        bar.style.width = `${(100 * k) / space.length}%`;
        const s = space[Math.min(k, space.length - 1)]!;
        st.textContent = `${checked.toLocaleString(lang)} ${t.relevant} · ${o.key === 'init' ? fmtA(s as Arr) : fmtS(...(s as State))}`;
        if (per < space.length) await sleep(16);
      }
      if (id !== S.run) return;
      if (fail) {
        setPill(pill('bad', t.failed));
        card.querySelector('.cex')!.replaceChildren(h('strong', { style: 'color:var(--bad)' }, t.cex), ' ', h('code', {}, cexText(fail, lang)));
        errors.push({ line: fail.line, code: fail.code });
      } else {
        setPill(pill('ok', t.proven));
        st.textContent = `${checked.toLocaleString(lang)} ${t.relevant}, ${t.allOk}`;
      }
      if (!reducedMotion()) await sleep(250);
    }
    if (id !== S.run) return;
    code.replaceChildren(listing(v, errors.map((e) => e.line)));
    const lines = ['$ dafny verify max.dfy', ...errors.map((e) => `max.dfy(${e.line + 1}): Error: ${DAFNY[e.code]}`), '', `Dafny program verifier finished with ${OBLIGATIONS.length - errors.length} verified, ${t.errors(errors.length)}`];
    term.replaceChildren(...lines.map((l, i) => h('span', { class: l.includes('Error:') || (i === lines.length - 1 && errors.length) ? 'bad' : i === lines.length - 1 ? 'ok' : '' }, l + '\n')));
    runBtn.disabled = false;
  }
  render();
}
