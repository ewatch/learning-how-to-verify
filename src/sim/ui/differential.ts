import { h, codeView, segmented, roleTag, resultPanel, type Lang, type ResultView } from './kit';
import { OLD, NEW, compare, differentialOutcome, differentialReport, type Diff, type DiffOutcome } from '../engine/differential';

type DV = DiffOutcome['values'];
const nf = (x: number, l: Lang) => x.toLocaleString(l);
const dec = (s: string | undefined, l: Lang) => (l === 'de' ? (s ?? '').replace('.', ',') : s ?? '');
const withV = (v: DV, l: Lang) => (v.minimal!.voucher ? `${l === 'en' ? 'with' : 'mit'} \`${v.minimal!.voucher}\`` : l === 'en' ? 'without a voucher' : 'ohne Gutschein');
const R = {
  en: {
    name: (v: DV) => `Refactor ${NEW.findIndex((n) => n.id === v.version) + 1}`,
    verdict: {
      equivalent: (v: DV, l: Lang) => `No unexplained differences: ${nf(v.agree, l)} of ${nf(v.runs, l)} inputs agree`,
      'intended-only': (v: DV, l: Lang) => `${nf(v.diffs, l)} of ${nf(v.runs, l)} inputs differ, all with lower-case voucher codes`,
      diff: (v: DV, l: Lang) => `${nf(v.diffs, l)} of ${nf(v.runs, l)} inputs differ from the old version`,
    },
    why: {
      rounding: (v: DV, l: Lang) => [`${R.en.name(v)} rounds the price to the nearest cent. The old code rounds the discount down, so it keeps the higher price.`, `For ${v.minimal!.cents} cents ${withV(v, 'en')} the exact price is ${dec(v.exact, l)}: the old code gives ${v.minimal!.old}, the new one ${v.minimal!.neu}.`],
      float: (v: DV, l: Lang) => [`${R.en.name(v)} computes in euros with floating point. For ${v.minimal!.cents} cents ${withV(v, 'en')}, \`${v.minimal!.cents / 100} * ${v.factor}\` is \`${v.raw}\`, not ${dec(v.exact, l)}. \`Math.ceil\` makes ${v.minimal!.neu} from it, the old code gives ${v.minimal!.old}.`, 'Never compute money in floating point.'],
      other: (v: DV) => [`For ${v.minimal!.cents} cents ${withV(v, 'en')} the old code gives ${v.minimal!.old}, the new one ${v.minimal!.neu}.`],
      equivalent: (v: DV, l: Lang) => [`The new version gives the same price as the old one on every tried input.${v.allow ? ' Lower-case codes are not reported, because you accepted that change.' : ''}`, `This is ${nf(v.runs, l)} random inputs (prices up to 199.99 €), not proof for all inputs.`],
      'intended-only': (v: DV) => [`All differences use a lower-case code such as \`${v.minimal!.voucher}\`. The old code ignores it, the new one gives the discount. This is the intended change.`, 'Without an allow-list for intended changes, the check reports them as failures.'],
    },
    use: {
      rounding: 'The agent gets the smallest input where old and new differ. It can restore the old rounding, or ask if the change is wanted.',
      float: 'The agent gets the smallest input where old and new differ. It can go back to integer cents.',
      other: 'The agent gets the smallest input where old and new differ. It can compare both versions on this input.',
      pass: 'The agent gets a green run. It can merge the refactoring with more confidence. Random inputs are not proof.',
      warn: 'The agent gets a failure for a wanted change. Without an allow-list it may undo the new feature.',
    },
    next: { fail: 'Select **Refactor 3** (tag: correct) and compare again.', pass: 'Untick **Accept intended change** and compare again.', warn: 'Tick **Accept intended change**.' },
  },
  de: {
    name: (v: DV) => `Refactor ${NEW.findIndex((n) => n.id === v.version) + 1}`,
    verdict: {
      equivalent: (v: DV, l: Lang) => `Keine unerklärten Unterschiede: ${nf(v.agree, l)} von ${nf(v.runs, l)} Eingaben stimmen überein`,
      'intended-only': (v: DV, l: Lang) => `${nf(v.diffs, l)} von ${nf(v.runs, l)} Eingaben weichen ab, alle mit Gutscheincodes in Kleinbuchstaben`,
      diff: (v: DV, l: Lang) => `${nf(v.diffs, l)} von ${nf(v.runs, l)} Eingaben weichen von der alten Version ab`,
    },
    why: {
      rounding: (v: DV, l: Lang) => [`${R.de.name(v)} rundet den Preis auf den nächsten Cent. Der alte Code rundet den Rabatt ab und behält so den höheren Preis.`, `Für ${v.minimal!.cents} Cent ${withV(v, 'de')} ist der exakte Preis ${dec(v.exact, l)}: Der alte Code liefert ${v.minimal!.old}, der neue ${v.minimal!.neu}.`],
      float: (v: DV, l: Lang) => [`${R.de.name(v)} rechnet in Euro mit Gleitkomma. Für ${v.minimal!.cents} Cent ${withV(v, 'de')} ergibt \`${v.minimal!.cents / 100} * ${v.factor}\` den Wert \`${v.raw}\`, nicht ${dec(v.exact, l)}. \`Math.ceil\` macht daraus ${v.minimal!.neu}, der alte Code liefert ${v.minimal!.old}.`, 'Geld nie in Gleitkomma rechnen.'],
      other: (v: DV) => [`Für ${v.minimal!.cents} Cent ${withV(v, 'de')} liefert der alte Code ${v.minimal!.old}, der neue ${v.minimal!.neu}.`],
      equivalent: (v: DV, l: Lang) => [`Die neue Version liefert auf jeder probierten Eingabe denselben Preis wie die alte.${v.allow ? ' Codes in Kleinbuchstaben werden nicht gemeldet, weil du diese Änderung akzeptiert hast.' : ''}`, `Das sind ${nf(v.runs, l)} zufällige Eingaben (Preise bis 199,99 €), kein Beweis für alle Eingaben.`],
      'intended-only': (v: DV) => [`Alle Unterschiede nutzen einen Code in Kleinbuchstaben wie \`${v.minimal!.voucher}\`. Der alte Code ignoriert ihn, der neue gibt den Rabatt. Das ist die gewollte Änderung.`, 'Ohne Allow-List für gewollte Änderungen meldet die Prüfung sie als Fehlschläge.'],
    },
    use: {
      rounding: 'Der Agent bekommt die kleinste Eingabe, bei der alt und neu abweichen. Er kann die alte Rundung wiederherstellen oder fragen, ob die Änderung gewollt ist.',
      float: 'Der Agent bekommt die kleinste Eingabe, bei der alt und neu abweichen. Er kann zu ganzzahligen Cent zurückkehren.',
      other: 'Der Agent bekommt die kleinste Eingabe, bei der alt und neu abweichen. Er kann beide Versionen mit dieser Eingabe vergleichen.',
      pass: 'Der Agent bekommt einen grünen Lauf. Er kann das Refactoring mit mehr Sicherheit mergen. Zufällige Eingaben sind kein Beweis.',
      warn: 'Der Agent bekommt einen Fehlschlag für eine gewollte Änderung. Ohne Allow-List macht er das neue Feature vielleicht rückgängig.',
    },
    next: { fail: '**Refactor 3** (Tag: korrekt) wählen und erneut vergleichen.', pass: '**Gewollte Änderung akzeptieren** abwählen und erneut vergleichen.', warn: '**Gewollte Änderung akzeptieren** ankreuzen.' },
  },
};

export function differentialView(o: DiffOutcome, lang: Lang): ResultView {
  const r = R[lang], v = o.values, c = o.causeId;
  const verdict = c === 'equivalent' || c === 'intended-only' ? r.verdict[c](v, lang) : r.verdict.diff(v, lang);
  return { status: o.status, verdict, why: r.why[c](v, lang), agent: { tool: 'fast-check', output: differentialReport(o), use: o.status === 'fail' ? r.use[c as 'rounding' | 'float' | 'other'] : r.use[o.status] }, next: r.next[o.status] };
}

const T = {
  en: {
    intro: 'An agent was asked to "clean up" the voucher pricing. All existing example tests still pass. Run the old and the new version side by side on 2,000 random prices and voucher codes, and compare.',
    old: 'Old (reference)', neu: 'New', run: 'Compare on 2,000 inputs', allow: 'Accept intended change: lower-case voucher codes now work',
    versions: { round: 'Refactor 1', ceil: 'Refactor 2', integer: 'Refactor 3' },
    agree: (a: number, n: number) => `${a.toLocaleString('en')} of ${n.toLocaleString('en')} inputs agree`,
    diffs: 'Differences', minimal: 'Smallest differing price',
    intended: 'intended', cents: 'cents', voucher: 'voucher', empty: '(none)',
  },
  de: {
    intro: 'Ein Agent sollte die Gutschein-Preisberechnung „aufräumen“. Alle bestehenden Beispieltests sind weiter grün. Lass alte und neue Version nebeneinander auf 2.000 zufälligen Preisen und Gutscheincodes laufen und vergleiche.',
    old: 'Alt (Referenz)', neu: 'Neu', run: 'Auf 2.000 Eingaben vergleichen', allow: 'Gewollte Änderung akzeptieren: Gutscheincodes in Kleinbuchstaben funktionieren jetzt',
    versions: { round: 'Refactor 1', ceil: 'Refactor 2', integer: 'Refactor 3' },
    agree: (a: number, n: number) => `${a.toLocaleString('de')} von ${n.toLocaleString('de')} Eingaben stimmen überein`,
    diffs: 'Unterschiede', minimal: 'Kleinster abweichender Preis',
    intended: 'gewollt', cents: 'Cent', voucher: 'Gutschein', empty: '(keiner)',
  },
};

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  const S = { v: 'round', allow: true, seed: 7 };
  const newCode = h('div');
  const out = h('div', { class: 'grid', style: 'gap:10px' });
  const panel = resultPanel(lang);

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, t.intro),
    h('div', { class: 'sim-row' }, segmented(t.neu, NEW.map((n) => ({ value: n.id, label: t.versions[n.id as keyof typeof t.versions], tag: roleTag(n.kind === 'integer' ? 'correct' : 'bug', lang) })), S.v, (v) => { S.v = v; render(); out.replaceChildren(); panel.clear(); })),
    h('div', { class: 'sim-cols' },
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.old), codeView(OLD.code)),
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.neu), newCode)),
    h('div', { class: 'sim-row' },
      h('button', { class: 'btn', type: 'button', onclick: () => run() }, t.run),
      h('label', { class: 'inline' }, h('input', { type: 'checkbox', checked: true, onchange: (e: Event) => { S.allow = (e.target as HTMLInputElement).checked; run(); } }), t.allow)),
    panel.el,
    out,
  ));

  function render() { newCode.replaceChildren(codeView(NEW.find((n) => n.id === S.v)!.code)); }

  function run() {
    S.seed++;
    const v = NEW.find((n) => n.id === S.v)!;
    const n = 2000;
    const r = compare(v.fn, S.seed, n, S.allow);
    const row = (d: Diff) => h('tr', {}, h('td', {}, String(d.cents)), h('td', {}, h('code', {}, d.voucher || t.empty)), h('td', {}, String(d.old)), h('td', { style: 'color:var(--bad);font-weight:700' }, String(d.neu)), h('td', {}, d.intended ? h('span', { class: 'sim-pill idle' }, t.intended) : ''));
    const meter = h('div', { class: 'sim-meter', style: '--c:var(--ok)' }, h('i', { style: `width:${(100 * r.agree) / n}%` }));
    const parts: Node[] = [h('div', { class: 'sim-metric' }, h('span', {}, t.agree(r.agree, n)), meter)];
    panel.show(differentialView(differentialOutcome(S.v, S.seed, n, S.allow), lang));
    if (r.diffs.length) {
      parts.push(h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, `${t.diffs} (${r.diffs.length})`),
        h('div', { style: 'overflow-x:auto', tabindex: 0, role: 'region', 'aria-label': t.diffs }, h('table', { class: 'sim-table' }, h('thead', {}, h('tr', {}, h('th', {}, t.cents), h('th', {}, t.voucher), h('th', {}, t.old), h('th', {}, t.neu), h('th', {}, h('span', { class: 'visually-hidden' }, t.intended)))), h('tbody', {}, ...r.diffs.slice(0, 8).map(row))))));
    }
    out.replaceChildren(...parts);
  }
  render();
}
