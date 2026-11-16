import { h, codeView, segmented, sleep, reducedMotion, type Lang } from './kit';
import { IMPLS, PROPERTIES, check, type Input } from '../engine/pbt';

const T = {
  en: {
    intro: 'A cart discount (in cents) must be split across the pets in the cart, in proportion to their prices ("weights"). Pick an implementation and a property. The tool generates random carts, and when one fails it shrinks it to the smallest cart that still fails.',
    impl: 'Implementation', prop: 'Property', run: 'Generate 200 carts', seed: 'Seed', newSeed: 'New seed',
    impls: { round: 'Math.round', floor: 'Math.floor', cumulative: 'Cumulative (correct)' },
    props: { sum: 'Shares add up to the discount', bound: 'No share exceeds its weight', nonneg: 'No share is negative', length: 'One share per pet' },
    tried: 'Generated inputs', shrink: 'Shrinking', passed: (n: number) => `✓ Property held for all ${n} generated carts.`,
    failed: (n: number) => `✗ Failed after ${n} carts.`, minimal: 'Minimal counterexample', step: 'step',
    explainFail: 'Read the minimal example: everything left in it is necessary for the failure.',
    explainPass: 'Passing 200 random carts is evidence, not proof. Formal verification (Dafny) proves the same property for all carts; see that page.',
  },
  de: {
    intro: 'Ein Warenkorb-Rabatt (in Cent) muss auf die Tiere im Warenkorb verteilt werden, im Verhältnis ihrer Preise („Gewichte“). Wähle eine Implementierung und eine Eigenschaft. Das Werkzeug erzeugt zufällige Warenkörbe, und wenn einer scheitert, schrumpft es ihn auf den kleinsten, der noch scheitert.',
    impl: 'Implementierung', prop: 'Eigenschaft', run: '200 Warenkörbe erzeugen', seed: 'Seed', newSeed: 'Neuer Seed',
    impls: { round: 'Math.round', floor: 'Math.floor', cumulative: 'Kumulativ (korrekt)' },
    props: { sum: 'Anteile ergeben genau den Rabatt', bound: 'Kein Anteil übersteigt sein Gewicht', nonneg: 'Kein Anteil ist negativ', length: 'Ein Anteil pro Tier' },
    tried: 'Erzeugte Eingaben', shrink: 'Shrinking', passed: (n: number) => `✓ Eigenschaft hielt für alle ${n} erzeugten Warenkörbe.`,
    failed: (n: number) => `✗ Gescheitert nach ${n} Warenkörben.`, minimal: 'Minimales Gegenbeispiel', step: 'Schritt',
    explainFail: 'Lies das minimale Beispiel: Alles, was darin übrig ist, ist für den Fehlschlag nötig.',
    explainPass: '200 zufällige Warenkörbe zu bestehen ist ein Beleg, kein Beweis. Formale Verifikation (Dafny) beweist dieselbe Eigenschaft für alle Warenkörbe; siehe dort.',
  },
};

const fmt = (i: Input) => `amount=${i.amount}  weights=[${i.weights.join(', ')}]`;

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  const S = { impl: 'round' as keyof typeof IMPLS, prop: 'sum', seed: 42, run: 0 };
  const codeBox = h('div');
  const log = h('ul', { tabindex: 0, class: 'sim-log', 'aria-live': 'polite' });
  const shrinkLog = h('ul', { tabindex: 0, class: 'sim-log' });
  const result = h('div', { class: 'sim-callout', hidden: true });
  const seedInput = h('input', { type: 'number', value: S.seed, 'aria-label': t.seed, onchange: (e: Event) => { S.seed = Number((e.target as HTMLInputElement).value) || 1; } });
  const runBtn = h('button', { class: 'btn', type: 'button', onclick: () => run() }, t.run);

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, t.intro),
    h('div', { class: 'sim-row' }, h('span', { class: 'small muted' }, t.impl), segmented(t.impl, (Object.keys(IMPLS) as (keyof typeof IMPLS)[]).map((k) => ({ value: k, label: t.impls[k as keyof typeof t.impls] })), S.impl, (v) => { S.impl = v; renderCode(); clear(); })),
    h('div', { class: 'sim-row' }, h('span', { class: 'small muted' }, t.prop), segmented(t.prop, PROPERTIES.map((p) => ({ value: p.id, label: t.props[p.id as keyof typeof t.props] })), S.prop, (v) => { S.prop = v; clear(); })),
    codeBox,
    h('div', { class: 'sim-row' }, runBtn, h('label', { class: 'inline' }, t.seed, seedInput), h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { S.seed = Math.floor(Math.random() * 1e6); seedInput.value = String(S.seed); } }, t.newSeed)),
    result,
    h('div', { class: 'sim-cols' },
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.tried), log),
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.shrink), shrinkLog)),
  ));

  function renderCode() { codeBox.replaceChildren(codeView(IMPLS[S.impl].code)); }
  function clear() { S.run++; log.replaceChildren(); shrinkLog.replaceChildren(); result.hidden = true; }

  async function run() {
    clear();
    const id = S.run;
    runBtn.disabled = true;
    const prop = PROPERTIES.find((p) => p.id === S.prop)!;
    const r = check(IMPLS[S.impl].fn, prop, S.seed);
    const fast = reducedMotion();
    const show = r.tried.slice(-40);
    for (const [i, x] of show.entries()) {
      if (id !== S.run) return;
      log.append(h('li', { class: x.ok ? '' : 'bad' }, `${x.ok ? '✓' : '✗'} ${fmt(x.input)} → [${x.out.join(', ')}]`));
      log.scrollTop = log.scrollHeight;
      if (!fast && i % 2 === 0) await sleep(25);
    }
    if (r.failure) {
      for (const [i, s] of r.failure.steps.entries()) {
        if (id !== S.run) return;
        shrinkLog.append(h('li', { class: i === r.failure.steps.length - 1 ? 'bad' : '' }, `${t.step} ${i}: ${fmt(s)}`));
        shrinkLog.scrollTop = shrinkLog.scrollHeight;
        if (!fast) await sleep(140);
      }
      const m = r.failure.minimal;
      result.className = 'sim-callout bad';
      result.replaceChildren(h('p', {}, h('strong', {}, t.failed(r.failure.runs))), h('p', {}, `${t.minimal}: `, h('code', {}, `allocate(${m.amount}, [${m.weights.join(', ')}])`), ' → ', h('code', {}, `[${r.failure.out.join(', ')}]`)), h('p', {}, t.explainFail));
    } else {
      result.className = 'sim-callout ok';
      result.replaceChildren(h('p', {}, h('strong', {}, t.passed(r.tried.length))), h('p', {}, t.explainPass));
    }
    result.hidden = false;
    runBtn.disabled = false;
  }
  renderCode();
}
