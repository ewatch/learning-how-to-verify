import { h, codeView, segmented, sleep, reducedMotion, roleTag, resultPanel, type Lang, type ResultView } from './kit';
import { IMPLS, PROPERTIES, check, pbtOutcome, fastCheckReport, type Input, type PbtOutcome } from '../engine/pbt';

/** Reference example for the shared result panel: see the comment block in kit.ts. */

type V = PbtOutcome['values'];
const list = (xs: number[] = []) => `[${xs.join(', ')}]`;
const num = (x: number, lang: Lang) => (Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/0$/, '').replace('.', lang === 'de' ? ',' : '.'));
/** "2.5 → 3 and 0.5 → 1" (at most four shares) */
const rounding = (v: V, lang: Lang) => {
  const pairs = (v.exact ?? []).map((e, i) => `\`${num(e, lang)} → ${v.shares![i]}\``);
  const shown = pairs.length > 4 ? [...pairs.slice(0, 4), '…'] : pairs;
  return shown.join(', ');
};
const cents = (n: number, lang: Lang) => (lang === 'en' ? `${n} cent${n === 1 ? '' : 's'}` : `${n} Cent`);

const METHOD: Record<Lang, Record<string, string>> = {
  en: { round: '`Math.round` rounds each share on its own', floor: '`Math.floor` rounds each share down on its own', cumulative: 'This version rounds each share on its own' },
  de: { round: '`Math.round` rundet jeden Anteil einzeln', floor: '`Math.floor` rundet jeden Anteil einzeln ab', cumulative: 'Diese Version rundet jeden Anteil einzeln' },
};
const IMPL_LABEL: Record<Lang, Record<string, string>> = {
  en: { round: 'Math.round', floor: 'Math.floor', cumulative: 'Cumulative' },
  de: { round: 'Math.round', floor: 'Math.floor', cumulative: 'Kumulativ' },
};
const how = (v: V, lang: Lang) => METHOD[lang][v.method] ?? METHOD[lang].cumulative;

const T = {
  en: {
    intro: 'A cart discount (in cents) must be split across the pets in the cart, in proportion to their prices ("weights"). Pick an implementation and a property. The tool generates random carts, and when one fails it shrinks it to the smallest cart that still fails.',
    impl: 'Implementation', prop: 'Property', run: 'Generate 200 carts', seed: 'Seed', newSeed: 'New seed',
    props: { sum: 'Shares add up to the discount', bound: 'No share exceeds its weight', nonneg: 'No share is negative', length: 'One share per pet' },
    tried: 'Generated inputs', shrink: 'Shrinking', step: 'step', minimal: 'minimal',
    verdict: {
      fail: (v: V) => `The property fails on cart ${v.runs} of ${v.total}`,
      pass: (v: V) => `The property holds for ${v.total} of ${v.total} carts`,
      warn: (v: V) => `The property holds for ${v.total} of ${v.total} carts, but the code has a bug`,
    },
    why: {
      'lost-cents': (v: V, l: Lang) => [`${how(v, l)}: ${rounding(v, l)}. For amount ${v.amount} and weights ${list(v.weights)} the shares add up to ${v.sum}, not ${v.amount}.`, `${cents(v.diff!, l)} ${v.diff === 1 ? 'is' : 'are'} lost. Each share loses less than 1 cent, but the losses add up.`],
      'extra-cents': (v: V, l: Lang) => [`${how(v, l)}: ${rounding(v, l)}. For amount ${v.amount} and weights ${list(v.weights)} the shares add up to ${v.sum}, not ${v.amount}.`, `${cents(-v.diff!, l)} too many ${v.diff === -1 ? 'is' : 'are'} given out. Each rounding error is less than 1 cent, but the errors do not cancel out.`],
      'over-weight': (v: V) => [`For amount ${v.amount} and weights ${list(v.weights)}, share ${v.index! + 1} is ${v.shares![v.index!]}. Its weight is only ${v.weights![v.index!]}.`],
      negative: (v: V) => [`For amount ${v.amount} and weights ${list(v.weights)}, share ${v.index! + 1} is ${v.shares![v.index!]}. A share must not be negative.`],
      'wrong-length': (v: V) => [`For ${v.weights!.length} pets the function returns ${v.shares!.length} shares.`],
      holds: (v: V, _l: Lang, prop: string) => [prop === 'sum' && v.method === 'cumulative'
        ? 'This version rounds the running total, not each share. Each share is the difference of two rounded totals, so the shares always add up to the discount.'
        : 'No generated cart broke this property.',
      `This is random search, not proof: ${v.total} carts passed. Formal verification (Dafny) proves the same property for all carts.`],
      'holds-weak': (v: V) => [`\`${IMPL_LABEL.en[v.impl] ?? v.impl}\` keeps this property, but it ${v.method === 'floor' ? 'loses cents' : 'loses or adds cents'}. This property does not check the total, so it cannot see that bug.`, 'A property finds only the bugs that it describes.'],
      'holds-missed': (v: V) => [`This implementation can break the property, but none of the ${v.total} carts hit a failing case.`, 'Random search can miss a bug. A new seed generates other carts.'],
    } as Record<string, (v: V, l: Lang, prop: string) => string[]>,
    use: {
      fail: 'The agent gets the smallest failing cart and the seed. It can reproduce the failure in one run and fix the rounding without guessing.',
      pass: 'The agent gets a green run and no counterexample. Green means "no failure in 200 carts", not "correct for all carts".',
      warn: 'The agent gets a green run, so it stops. The bug ships, because the property gives no signal for it.',
    },
    next: {
      fail: 'Select **Cumulative** (tag: correct) and run again.',
      'holds-weak': 'Select the property **Shares add up to the discount** and run again.',
      'holds-missed': 'Click **New seed** and run again.',
      holdsSum: 'Select **Math.round** (tag: bug) and see the same property fail.',
      holdsOther: 'Select **Shares add up to the discount**. It is the property that the two bugs break.',
    },
  },
  de: {
    intro: 'Ein Warenkorb-Rabatt (in Cent) muss auf die Tiere im Warenkorb verteilt werden, im Verhältnis ihrer Preise („Gewichte“). Wähle eine Implementierung und eine Eigenschaft. Das Werkzeug erzeugt zufällige Warenkörbe, und wenn einer scheitert, schrumpft es ihn auf den kleinsten, der noch scheitert.',
    impl: 'Implementierung', prop: 'Eigenschaft', run: '200 Warenkörbe erzeugen', seed: 'Seed', newSeed: 'Neuer Seed',
    props: { sum: 'Anteile ergeben genau den Rabatt', bound: 'Kein Anteil übersteigt sein Gewicht', nonneg: 'Kein Anteil ist negativ', length: 'Ein Anteil pro Tier' },
    tried: 'Erzeugte Eingaben', shrink: 'Shrinking', step: 'Schritt', minimal: 'minimal',
    verdict: {
      fail: (v: V) => `Die Eigenschaft scheitert an Warenkorb ${v.runs} von ${v.total}`,
      pass: (v: V) => `Die Eigenschaft hält für ${v.total} von ${v.total} Warenkörben`,
      warn: (v: V) => `Die Eigenschaft hält für ${v.total} von ${v.total} Warenkörben, aber der Code hat einen Bug`,
    },
    why: {
      'lost-cents': (v: V, l: Lang) => [`${how(v, l)}: ${rounding(v, l)}. Für Betrag ${v.amount} und Gewichte ${list(v.weights)} ergeben die Anteile ${v.sum}, nicht ${v.amount}.`, `${cents(v.diff!, l)} ${v.diff === 1 ? 'geht' : 'gehen'} verloren. Jeder Anteil verliert weniger als 1 Cent, aber die Verluste summieren sich.`],
      'extra-cents': (v: V, l: Lang) => [`${how(v, l)}: ${rounding(v, l)}. Für Betrag ${v.amount} und Gewichte ${list(v.weights)} ergeben die Anteile ${v.sum}, nicht ${v.amount}.`, `${cents(-v.diff!, l)} zu viel ${v.diff === -1 ? 'wird' : 'werden'} verteilt. Jeder Rundungsfehler ist kleiner als 1 Cent, aber die Fehler heben sich nicht auf.`],
      'over-weight': (v: V) => [`Für Betrag ${v.amount} und Gewichte ${list(v.weights)} ist Anteil ${v.index! + 1} gleich ${v.shares![v.index!]}. Sein Gewicht ist nur ${v.weights![v.index!]}.`],
      negative: (v: V) => [`Für Betrag ${v.amount} und Gewichte ${list(v.weights)} ist Anteil ${v.index! + 1} gleich ${v.shares![v.index!]}. Ein Anteil darf nicht negativ sein.`],
      'wrong-length': (v: V) => [`Für ${v.weights!.length} Tiere liefert die Funktion ${v.shares!.length} Anteile.`],
      holds: (v: V, _l: Lang, prop: string) => [prop === 'sum' && v.method === 'cumulative'
        ? 'Diese Version rundet die laufende Summe, nicht jeden Anteil. Jeder Anteil ist die Differenz zweier gerundeter Summen, darum ergeben die Anteile immer genau den Rabatt.'
        : 'Kein erzeugter Warenkorb hat diese Eigenschaft verletzt.',
      `Das ist eine Zufallssuche, kein Beweis: ${v.total} Warenkörbe haben bestanden. Formale Verifikation (Dafny) beweist dieselbe Eigenschaft für alle Warenkörbe.`],
      'holds-weak': (v: V) => [`\`${IMPL_LABEL.de[v.impl] ?? v.impl}\` erfüllt diese Eigenschaft, ${v.method === 'floor' ? 'verliert aber Cent' : 'verliert aber Cent oder verteilt zu viele'}. Diese Eigenschaft prüft die Summe nicht und kann den Bug darum nicht sehen.`, 'Eine Eigenschaft findet nur die Bugs, die sie beschreibt.'],
      'holds-missed': (v: V) => [`Diese Implementierung kann die Eigenschaft verletzen, aber keiner der ${v.total} Warenkörbe hat einen solchen Fall getroffen.`, 'Eine Zufallssuche kann einen Bug verfehlen. Ein neuer Seed erzeugt andere Warenkörbe.'],
    } as Record<string, (v: V, l: Lang, prop: string) => string[]>,
    use: {
      fail: 'Der Agent bekommt den kleinsten scheiternden Warenkorb und den Seed. Er kann den Fehlschlag mit einem Lauf reproduzieren und die Rundung ohne Raten korrigieren.',
      pass: 'Der Agent bekommt einen grünen Lauf und kein Gegenbeispiel. Grün heißt „kein Fehlschlag in 200 Warenkörben“, nicht „korrekt für alle Warenkörbe“.',
      warn: 'Der Agent bekommt einen grünen Lauf und hört auf. Der Bug wird ausgeliefert, weil die Eigenschaft kein Signal für ihn gibt.',
    },
    next: {
      fail: '**Kumulativ** (Tag: korrekt) wählen und erneut ausführen.',
      'holds-weak': 'Die Eigenschaft **Anteile ergeben genau den Rabatt** wählen und erneut ausführen.',
      'holds-missed': '**Neuer Seed** klicken und erneut ausführen.',
      holdsSum: '**Math.round** (Tag: Bug) wählen und sehen, wie dieselbe Eigenschaft scheitert.',
      holdsOther: '**Anteile ergeben genau den Rabatt** wählen. Das ist die Eigenschaft, die beide Bugs verletzen.',
    },
  },
};

const fmt = (i: Input) => `amount=${i.amount}  weights=[${i.weights.join(', ')}]`;

/** Map the engine outcome to panel text. Pure apart from reading the copy table. */
export function pbtView(o: PbtOutcome, propId: string, report: string, lang: Lang): ResultView {
  const t = T[lang];
  const next = o.status === 'fail' ? t.next.fail
    : o.causeId === 'holds-weak' ? t.next['holds-weak']
    : o.causeId === 'holds-missed' ? t.next['holds-missed']
    : propId === 'sum' ? t.next.holdsSum : t.next.holdsOther;
  return {
    status: o.status,
    verdict: t.verdict[o.status](o.values),
    why: t.why[o.causeId](o.values, lang, propId),
    agent: { tool: 'fast-check', output: report, use: t.use[o.status] },
    next,
  };
}

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
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
    h('div', { class: 'sim-row' }, runBtn, h('label', { class: 'inline' }, t.seed, seedInput), h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { S.seed = Math.floor(Math.random() * 1e6); seedInput.value = String(S.seed); clear(); } }, t.newSeed)),
    panel.el,
    h('div', { class: 'sim-cols' },
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.tried), log),
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.shrink), shrinkLog)),
  ));

  function renderCode() { codeBox.replaceChildren(codeView(IMPLS[S.impl].code)); }
  function clear() { S.run++; runBtn.disabled = false; log.replaceChildren(); shrinkLog.replaceChildren(); panel.clear(); }

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
      shrinkLog.append(h('li', { class: 'bad min' }, `✗ ${t.minimal}: ${fmt(m)} → [${r.failure.out.join(', ')}]`));
      shrinkLog.scrollTop = shrinkLog.scrollHeight;
    }
    panel.show(pbtView(pbtOutcome(S.impl, S.prop, r), S.prop, fastCheckReport(S.prop, r), lang));
    runBtn.disabled = false;
  }
  renderCode();
}
