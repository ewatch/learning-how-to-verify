import { IMPL_LABEL, PBT_COPY } from '../../data/pbt-copy';
import { h, codeView, segmented, sleep, reducedMotion, roleTag, resultPanel, type Lang, type ResultView } from './kit';
import { IMPLS, PROPERTIES, check, pbtOutcome, fastCheckReport, type Input, type PbtOutcome } from '../engine/pbt';

/** Reference example for the shared result panel: see the comment block in kit.ts. */

// arrays join with a no-break space: a narrow log wraps between the parts of a line, not inside a cart
const arr = (xs: number[]) => `[${xs.join(',\u00a0')}]`;
const fmt = (i: Input) => `amount=${i.amount}  weights=${arr(i.weights)}`;

/** Map the engine outcome to panel text. Pure apart from reading the copy table. */
export function pbtView(o: PbtOutcome, propId: string, report: string, lang: Lang): ResultView {
  const t = PBT_COPY[lang];
  const next = o.status === 'fail' ? t.next.fail
    : o.causeId === 'holds-weak' ? t.next['holds-weak']
    : o.causeId === 'holds-missed' ? t.next['holds-missed']
    : propId === 'sum' ? t.next.holdsSum : t.next.holdsOther;
  return {
    status: o.status,
    tone: o.tone,
    verdict: t.verdict[o.status](o.values),
    why: t.why[o.causeId](o.values, lang, propId),
    agent: { tool: 'fast-check', output: report, use: t.use[o.status] },
    next,
    // green on correct code means "no counterexample in this sample", not proof
    held: o.status === 'pass',
  };
}

export function mount(root: HTMLElement, lang: Lang) {
  const t = PBT_COPY[lang];
  const S = { impl: 'round' as keyof typeof IMPLS, prop: 'sum', seed: 42, run: 0 };
  const codeBox = h('div');
  const log = h('ul', { tabindex: 0, class: 'sim-log', 'aria-label': t.tried });
  const shrinkLog = h('ul', { tabindex: 0, class: 'sim-log', 'aria-label': t.shrink });
  const panel = resultPanel(lang);
  const seedInput = h('input', { type: 'number', value: S.seed, 'aria-label': t.seed, onchange: (e: Event) => { S.seed = Number((e.target as HTMLInputElement).value) || 1; clear(); } });
  const runBtn = h('button', { class: 'btn', type: 'button', onclick: () => run() }, t.run);
  const implOptions = (Object.keys(IMPLS) as (keyof typeof IMPLS)[]).map((k) => ({ value: k, label: IMPL_LABEL[lang][k], tag: roleTag(IMPLS[k].correct ? 'correct' : 'bug', lang) }));

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, t.intro),
    h('div', { class: 'sim-row' }, segmented(t.impl, implOptions, S.impl, (v) => { S.impl = v; renderCode(); clear(); })),
    h('div', { class: 'sim-row' }, segmented(t.prop, PROPERTIES.map((p) => ({ value: p.id, label: t.props[p.id as keyof typeof t.props] })), S.prop, (v) => { S.prop = v; clear(); })),
    codeBox,
    // seed and "New seed" wrap as one group, so the button never sits alone on a row
    h('div', { class: 'sim-row' }, runBtn, h('span', { class: 'sim-row', style: 'gap:8px' }, h('label', { class: 'inline' }, t.seed, seedInput), h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { S.seed = Math.floor(Math.random() * 1e6); seedInput.value = String(S.seed); clear(); } }, t.newSeed))),
    h('div', { class: 'sim-cols' },
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.tried), log),
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.shrink), shrinkLog)),
    // the verdict concludes the logs: below them, so showing or hiding it never moves what is being watched
    panel.el,
  ));

  function renderCode() { codeBox.replaceChildren(codeView(IMPLS[S.impl].code)); }
  // a rerun empties both logs before refilling them: hold their height until the run ends,
  // so stacked log cards (phones) do not collapse and jump back
  const hold = (on: boolean) => { for (const l of [log, shrinkLog]) l.style.minHeight = on ? `${l.offsetHeight}px` : ''; };
  function clear(keepHeight = false) { S.run++; runBtn.disabled = false; hold(keepHeight); log.replaceChildren(); shrinkLog.replaceChildren(); panel.clear(); }

  async function run() {
    clear(true);
    const id = S.run;
    runBtn.disabled = true;
    const prop = PROPERTIES.find((p) => p.id === S.prop)!;
    const r = check(IMPLS[S.impl].fn, prop, S.seed);
    const fast = reducedMotion();
    const show = r.tried.slice(-40);
    for (const [i, x] of show.entries()) {
      if (id !== S.run) return;
      log.append(h('li', { class: x.ok ? '' : 'bad' }, `${x.ok ? '✓' : '✗'} ${fmt(x.input)} → ${arr(x.out)}`));
      log.scrollTop = log.scrollHeight;
      if (!fast && i % 2 === 0) await sleep(25);
    }
    if (id !== S.run) return;
    if (r.failure) {
      const steps = r.failure.steps;
      const delay = fast ? 0 : Math.min(140, 1400 / steps.length);
      for (const [i, s] of steps.entries()) {
        if (id !== S.run) return;
        shrinkLog.append(h('li', {}, `${t.step} ${i}: ${fmt(s)}`));
        shrinkLog.scrollTop = shrinkLog.scrollHeight;
        if (delay) await sleep(delay);
      }
      if (id !== S.run) return;
      const m = r.failure.minimal;
      shrinkLog.append(h('li', { class: 'bad min' }, `✗ ${t.minimal}: ${fmt(m)} → ${arr(r.failure.out)}`));
      shrinkLog.scrollTop = shrinkLog.scrollHeight;
    } else shrinkLog.append(h('li', { class: 'empty' }, t.noShrink));
    hold(false);
    panel.show(pbtView(pbtOutcome(S.impl, S.prop, r), S.prop, fastCheckReport(S.prop, r), lang));
    runBtn.disabled = false;
  }
  renderCode();
}
