import type { PbtOutcome } from '../sim/engine/pbt';
import type { Locale as Lang } from './types';

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
export const IMPL_LABEL: Record<Lang, Record<string, string>> = {
  en: { round: 'Math.round', floor: 'Math.floor', cumulative: 'Cumulative' },
  de: { round: 'Math.round', floor: 'Math.floor', cumulative: 'Kumulativ' },
};
const how = (v: V, lang: Lang) => METHOD[lang][v.method] ?? METHOD[lang].cumulative;

export const PBT_COPY = {
  en: {
    intro: 'Split a cart discount (in cents) proportionally across pet prices ("weights"). Pick an implementation and property; random carts are generated and any failing case is shrunk to a minimal counterexample.',
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
    intro: 'Der Simulator verteilt einen Rabatt in Cent auf die Tiere im Warenkorb. Die Tierpreise bestimmen die Gewichte. Wähle eine Implementierung. Wähle eine Property. Erzeuge zufällige Warenkörbe. Wenn ein Fall fehlschlägt, sucht das Tool mit Shrinking nach einem kleineren Gegenbeispiel.',
    impl: 'Implementierung', prop: 'Property', run: '200 Warenkörbe erzeugen', seed: 'Seed', newSeed: 'Neuer Seed',
    props: { sum: 'Anteile ergeben genau den Rabatt', bound: 'Kein Anteil übersteigt sein Gewicht', nonneg: 'Kein Anteil ist negativ', length: 'Ein Anteil pro Tier' },
    tried: 'Erzeugte Eingaben', shrink: 'Shrinking', step: 'Schritt', minimal: 'minimal',
    verdict: {
      fail: (v: V) => `Die Property gilt für Warenkorb ${v.runs} von ${v.total} nicht.`,
      pass: (v: V) => `Die Property gilt für alle ${v.total} geprüften Warenkörbe.`,
      warn: (v: V) => `Die Property gilt für alle ${v.total} geprüften Warenkörbe. Die Implementierung enthält einen Fehler.`,
    },
    why: {
      'lost-cents': (v: V, l: Lang) => [
        `${how(v, l)}: ${rounding(v, l)}. Der Rabatt beträgt ${v.amount} Cent. Die Summe der Anteile beträgt ${v.sum} Cent.`,
        `Es fehlen ${cents(v.diff!, l)}. Die Rundung verringert jeden Anteil um weniger als 1 Cent. Die Differenzen addieren sich.`,
      ],
      'extra-cents': (v: V, l: Lang) => [
        `${how(v, l)}: ${rounding(v, l)}. Der Rabatt beträgt ${v.amount} Cent. Die Summe der Anteile beträgt ${v.sum} Cent.`,
        `Die Summe ist um ${cents(-v.diff!, l)} zu hoch. Jeder Rundungsfehler beträgt weniger als 1 Cent. Die Rundungsfehler heben sich nicht auf.`,
      ],
      'over-weight': (v: V) => [`Bei Rabatt ${v.amount} und Gewichten ${list(v.weights)} beträgt Anteil ${v.index! + 1} genau ${v.shares![v.index!]}. Dieser Anteil überschreitet sein Gewicht von ${v.weights![v.index!]}.`],
      negative: (v: V) => [`Bei Rabatt ${v.amount} und Gewichten ${list(v.weights)} beträgt Anteil ${v.index! + 1} genau ${v.shares![v.index!]}. Jeder Anteil muss mindestens null sein.`],
      'wrong-length': (v: V) => [`Die Funktion gibt für ${v.weights!.length} Tiere ${v.shares!.length} Anteile zurück. Die Anzahl der Anteile muss der Anzahl der Tiere entsprechen.`],
      holds: (v: V, _l: Lang, prop: string) => [prop === 'sum' && v.method === 'cumulative'
        ? 'Diese Implementierung rundet die laufende Summe. Jeder Anteil ist die Differenz zweier gerundeter Summen. So entspricht die Summe der Anteile dem Rabatt.'
        : 'Alle geprüften Warenkörbe erfüllen die Property.',
      `Das Ergebnis gilt für die ${v.total} geprüften Warenkörbe. Mit Dafny lässt sich eine Property für alle zulässigen Eingaben beweisen.`],
      'holds-weak': (v: V) => [
        `Die Implementierung \`${IMPL_LABEL.de[v.impl] ?? v.impl}\` erfüllt diese Property. Sie ${v.method === 'floor' ? 'verteilt zu wenige Cent' : 'kann zu viele oder zu wenige Cent verteilen'}.`,
        'Diese Property prüft die Summe der Anteile nicht.',
      ],
      'holds-missed': (v: V) => [`Die Implementierung kann die Property verletzen. Der Test mit ${v.total} Warenkörben hat diesen Fehler nicht gefunden.`, 'Ein neuer Seed erzeugt andere Warenkörbe.'],
    } as Record<string, (v: V, l: Lang, prop: string) => string[]>,
    use: {
      fail: 'Gib dem Coding-Agenten das Gegenbeispiel und den Seed. Der Coding-Agent kann den Fehler damit reproduzieren.',
      pass: 'Gib dem Coding-Agenten das Ergebnis des Testlaufs. Das Ergebnis gilt für die geprüften Warenkörbe.',
      warn: 'Der Test besteht. Gib dem Coding-Agenten eine Property, die den Fehler erkennt.',
    },
    next: {
      fail: 'Wähle **Kumulativ**. Starte den Test erneut.',
      'holds-weak': 'Wähle **Anteile ergeben genau den Rabatt**. Starte den Test erneut.',
      'holds-missed': 'Wähle **Neuer Seed**. Starte den Test erneut.',
      holdsSum: 'Wähle **Math.round**. Starte den Test erneut.',
      holdsOther: 'Wähle **Anteile ergeben genau den Rabatt**. Diese Property kann beide Rundungsfehler erkennen.',
    },
  },
};
