import { h, codeView, rich, segmented, type Lang, type LineMark } from './kit';
import { run, INPUT_IDS, ALLOCATE_SRC, CLAUSE_LINE, SCENARIOS, type InputId, type Clause, type RunResult, type Anomaly } from '../engine/dbc';
import './dbc.css';

const T = {
  en: {
    intro: 'Pick an input and flip the contracts. Where does the failure show up?',
    input: 'Input', contracts: 'Contracts on',
    inputs: { normal: 'Normal cart', negDiscount: 'Negative discount', tooBig: 'Discount above total', empty: 'Empty cart', negWeight: 'Negative price' } as Record<InputId, string>,
    steps: ['checkout(cart)', 'allocate(discount, weights)', 'renderInvoice(shares)'],
    okOut: ['total $%', 'shares computed', 'invoice printed'],
    skipped: 'not reached', silently: 'looks fine, but is already wrong', checks: 'precondition fails',
    anomaly: (a: Anomaly, r: RunResult) => ({
      negativeTotal: `Invoice total is ${fmt(r.invoice?.total)}: we pay the customer.`,
      surcharge: `Invoice total ${fmt(r.invoice?.total)} is above the subtotal ${fmt(r.invoice?.subtotal)}: the "discount" is a surcharge.`,
      negativeLine: 'One invoice line has a negative discount.',
      nan: 'Invoice shows NaN per item.',
    } as Record<string, string>)[a ?? ''] ?? '',
    clause: {
      weightsNonEmpty: 'weights is empty: there is nothing to split the discount over.',
      amountNonNeg: 'discount is negative.',
      weightsNonNeg: 'a weight (item price) is negative.',
      amountLeTotal: 'discount is larger than the cart total.',
      sumShares: 'shares do not add up to the discount.', sharesNonNeg: 'a share is negative.',
    } as Record<Clause, string>,
    offHead: 'Contracts off: the bug surfaces in step 3, far from its cause in step 2.',
    onHead: (c: string) => `Contracts on: stops in step 2, at the cause. ${c}`,
    code: 'allocate with its contracts', notChecked: 'Contracts are off: these lines are not checked.',
    hint: 'Now flip the toggle to compare.',
    lesson: 'Contracts move the error to its cause: allocate refuses bad input at once instead of letting the invoice be wrong three steps later.',
    fine: 'Valid input: both modes agree, the contracts cost nothing.',
  },
  de: {
    intro: 'Wähle eine Eingabe und schalte die Contracts um. Wo taucht der Fehler auf?',
    input: 'Eingabe', contracts: 'Contracts an',
    inputs: { normal: 'Normaler Warenkorb', negDiscount: 'Negativer Rabatt', tooBig: 'Rabatt über Summe', empty: 'Leerer Warenkorb', negWeight: 'Negativer Preis' } as Record<InputId, string>,
    steps: ['checkout(cart)', 'allocate(discount, weights)', 'renderInvoice(shares)'],
    okOut: ['Summe $%', 'Anteile berechnet', 'Rechnung gedruckt'],
    skipped: 'nicht erreicht', silently: 'sieht gut aus, ist aber schon falsch', checks: 'Precondition verletzt',
    anomaly: (a: Anomaly, r: RunResult) => ({
      negativeTotal: `Rechnungssumme ist ${fmt(r.invoice?.total)}: Wir zahlen dem Kunden Geld.`,
      surcharge: `Rechnungssumme ${fmt(r.invoice?.total)} liegt über der Zwischensumme ${fmt(r.invoice?.subtotal)}: Der „Rabatt“ ist ein Aufschlag.`,
      negativeLine: 'Eine Rechnungszeile hat einen negativen Rabatt.',
      nan: 'Die Rechnung zeigt NaN pro Artikel.',
    } as Record<string, string>)[a ?? ''] ?? '',
    clause: {
      weightsNonEmpty: 'weights ist leer: Es gibt nichts, worauf der Rabatt verteilt werden kann.',
      amountNonNeg: 'der Rabatt ist negativ.',
      weightsNonNeg: 'ein Gewicht (Artikelpreis) ist negativ.',
      amountLeTotal: 'der Rabatt ist größer als die Warenkorbsumme.',
      sumShares: 'die Anteile ergeben nicht den Rabatt.', sharesNonNeg: 'ein Anteil ist negativ.',
    } as Record<Clause, string>,
    offHead: 'Contracts aus: Der Fehler zeigt sich erst in Schritt 3, weit weg von der Ursache in Schritt 2.',
    onHead: (c: string) => `Contracts an: Stopp in Schritt 2, direkt an der Ursache. ${c}`,
    code: 'allocate mit seinen Contracts', notChecked: 'Contracts sind aus: Diese Zeilen werden nicht geprüft.',
    hint: 'Schalte jetzt um und vergleiche.',
    lesson: 'Contracts verschieben den Fehler an seine Ursache: allocate weist schlechte Eingaben sofort ab, statt dass die Rechnung drei Schritte später falsch ist.',
    fine: 'Gültige Eingabe: Beide Modi stimmen überein, die Contracts kosten nichts.',
  },
};

const fmt = (c?: number) => (c === undefined || Number.isNaN(c) ? 'NaN' : `${c < 0 ? '−' : ''}${(Math.abs(c) / 100).toFixed(2)} €`);

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  let input: InputId = 'negDiscount';
  let contracts = false;
  const seen = new Set<string>();
  const pipe = h('div', { class: 'dbc-pipe', role: 'group', 'aria-label': 'pipeline' });
  const msg = h('div', { class: 'sim-callout', 'aria-live': 'polite' });
  const codeHost = h('div');
  const lesson = h('div', { class: 'sim-callout ok', hidden: true });
  const sel = h('div');
  const toggle = h('input', { type: 'checkbox', id: 'dbc-contracts', onchange: (e: Event) => { contracts = (e.target as HTMLInputElement).checked; render(); } });

  function buildSel() {
    sel.replaceChildren(segmented(t.input, INPUT_IDS.map((v) => ({ value: v, label: t.inputs[v] })), input, (v) => { input = v; render(); }));
  }
  buildSel();

  root.append(h('div', { class: 'sim', id: undefined },
    h('p', { class: 'sim-intro' }, t.intro),
    h('div', { class: 'sim-row' }, sel, h('label', { class: 'dbc-toggle', for: 'dbc-contracts' }, toggle, t.contracts)),
    pipe, msg, codeHost, lesson));

  function render() {
    const r = run(input, contracts);
    const sc = SCENARIOS.find((s) => s.id === input)!;
    const bad = r.cause !== null;
    if (bad) seen.add(contracts ? 'on' : 'off');
    const outs = [
      r.steps[0] === 'ok' ? `${t.okOut[0].replace('%', fmt(sc.prices.reduce((a, b) => a + b, 0)).slice(1))}` : '',
      r.steps[1] === 'bad' ? `✗ ${t.checks}` : r.steps[1] === 'skipped' ? t.skipped : r.steps[1] === 'tainted' ? `⚠ ${t.silently}` : t.okOut[1],
      r.steps[2] === 'bad' ? `✗ ${r.invoice ? `${fmt(r.invoice.total)}${r.anomaly === 'nan' ? ' / NaN' : ''}` : ''}` : r.steps[2] === 'skipped' ? t.skipped : t.okOut[2],
    ];
    pipe.replaceChildren();
    r.steps.forEach((s, i) => {
      if (i) pipe.append(h('div', { class: 'dbc-arrow', 'aria-hidden': 'true' }, '→'));
      pipe.append(h('div', { class: `dbc-box ${s}` }, h('code', {}, t.steps[i]), h('div', { class: 'out' }, `${s === 'bad' ? '' : s === 'ok' ? '✓ ' : ''}${outs[i]}`)));
    });
    pipe.setAttribute('aria-label', `${t.steps.join(' → ')}: ${r.steps.join(', ')}`);

    if (!bad) { msg.className = 'sim-callout ok'; msg.textContent = t.fine; }
    else if (contracts) { msg.className = 'sim-callout bad'; msg.replaceChildren(...rich(t.onHead(t.clause[r.cause!]))); }
    else { msg.className = 'sim-callout bad'; msg.replaceChildren(h('p', {}, t.offHead), h('p', {}, t.anomaly(r.anomaly, r))); }

    const marks: LineMark[] = contracts && r.cause ? [{ line: CLAUSE_LINE[r.cause], cls: 'err hl' }] : [];
    codeHost.className = contracts ? '' : 'dbc-off';
    codeHost.replaceChildren(h('div', { class: 'small muted' }, contracts ? t.code : `${t.code} (${t.notChecked})`), codeView(ALLOCATE_SRC, marks));
    lesson.hidden = !(seen.has('on') && seen.has('off'));
    lesson.textContent = t.lesson;
    if (lesson.hidden && bad) msg.append(h('p', { class: 'small' }, t.hint));
  }
  render();
}
