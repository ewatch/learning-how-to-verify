import { h, codeView, segmented, type Lang } from './kit';
import { OLD, NEW, compare, minimalDiff, type Diff } from '../engine/differential';

const T = {
  en: {
    intro: 'An agent was asked to "clean up" the voucher pricing. All existing example tests still pass. Run the old and the new version side by side on 2,000 random prices and voucher codes, and compare.',
    old: 'Old (reference)', neu: 'New', run: 'Compare on 2,000 inputs', allow: 'Accept intended change: lower-case voucher codes now work',
    versions: { round: 'Refactor 1', ceil: 'Refactor 2', integer: 'Refactor 3' },
    agree: (a: number, n: number) => `${a.toLocaleString('en')} of ${n.toLocaleString('en')} inputs agree`,
    diffs: 'Differences', minimal: 'Smallest differing price', none: 'No unexplained differences. The refactoring is equivalent on everything we tried, apart from the change you accepted.',
    intended: 'intended', cents: 'cents', voucher: 'voucher', empty: '(none)',
    lessonRound: 'Rounding changed: the old code effectively rounded up, the new one rounds to nearest.',
    lessonCeil: 'Floating point: 1.10 € × 90 is 99.00000000000001 in binary floating point, so Math.ceil makes it 100. Never compute money in floats.',
  },
  de: {
    intro: 'Ein Agent sollte die Gutschein-Preisberechnung „aufräumen“. Alle bestehenden Beispieltests sind weiter grün. Lass alte und neue Version nebeneinander auf 2.000 zufälligen Preisen und Gutscheincodes laufen und vergleiche.',
    old: 'Alt (Referenz)', neu: 'Neu', run: 'Auf 2.000 Eingaben vergleichen', allow: 'Gewollte Änderung akzeptieren: Gutscheincodes in Kleinbuchstaben funktionieren jetzt',
    versions: { round: 'Refactor 1', ceil: 'Refactor 2', integer: 'Refactor 3' },
    agree: (a: number, n: number) => `${a.toLocaleString('de')} von ${n.toLocaleString('de')} Eingaben stimmen überein`,
    diffs: 'Unterschiede', minimal: 'Kleinster abweichender Preis', none: 'Keine unerklärten Unterschiede. Das Refactoring ist auf allem, was wir probiert haben, gleichwertig, bis auf die akzeptierte Änderung.',
    intended: 'gewollt', cents: 'Cent', voucher: 'Gutschein', empty: '(keiner)',
    lessonRound: 'Die Rundung hat sich geändert: Der alte Code rundete faktisch auf, der neue rundet kaufmännisch.',
    lessonCeil: 'Gleitkomma: 1,10 € × 90 ergibt binär 99,00000000000001, und Math.ceil macht daraus 100. Geld nie in Gleitkomma rechnen.',
  },
};

export function mount(root: HTMLElement, lang: Lang) {
  const t = T[lang];
  const S = { v: 'round', allow: true, seed: 7 };
  const newCode = h('div');
  const out = h('div', { class: 'grid', style: 'gap:10px' });

  root.append(h('div', { class: 'sim' },
    h('p', { class: 'sim-intro' }, t.intro),
    h('div', { class: 'sim-row' }, segmented(t.neu, NEW.map((n) => ({ value: n.id, label: t.versions[n.id as keyof typeof t.versions] })), S.v, (v) => { S.v = v; render(); out.replaceChildren(); })),
    h('div', { class: 'sim-cols' },
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.old), codeView(OLD.code)),
      h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, t.neu), newCode)),
    h('div', { class: 'sim-row' },
      h('button', { class: 'btn', type: 'button', onclick: () => run() }, t.run),
      h('label', { class: 'inline' }, h('input', { type: 'checkbox', checked: true, onchange: (e: Event) => { S.allow = (e.target as HTMLInputElement).checked; run(); } }), t.allow)),
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
    if (!r.diffs.length) parts.push(h('div', { class: 'sim-callout ok' }, t.none));
    else {
      const unexplained = r.diffs.find((d) => !d.intended) ?? r.diffs[0];
      const m = minimalDiff(v.fn, unexplained);
      parts.push(h('div', { class: 'sim-callout bad' },
        h('p', {}, h('strong', {}, `${t.minimal}: `), h('code', {}, `price(${m.cents}, "${m.voucher}")`), ` → old ${m.old}, new ${m.neu}`),
        h('p', {}, S.v === 'round' ? t.lessonRound : S.v === 'ceil' ? t.lessonCeil : '')));
      parts.push(h('div', { class: 'sim-card' }, h('div', { class: 'sim-card-title' }, `${t.diffs} (${r.diffs.length})`),
        h('table', { class: 'sim-table' }, h('thead', {}, h('tr', {}, h('th', {}, t.cents), h('th', {}, t.voucher), h('th', {}, t.old), h('th', {}, t.neu), h('th', {}, h('span', { class: 'visually-hidden' }, t.intended)))), h('tbody', {}, ...r.diffs.slice(0, 8).map(row)))));
    }
    out.replaceChildren(...parts);
  }
  render();
}
