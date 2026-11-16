// Lean 4 tactic proofs as data: each step shows the goals/hypotheses the Infoview would display.
// Lean itself does not run here; the goal states are transcribed. Pure data, no DOM.
import type { Bi } from './i18n';

export interface Goal { /** case tag, e.g. "isTrue" */ c?: string; /** "name : type" */ hyps: string[]; goal: string }
export interface LeanStep {
  /** line index (0-based) the cursor sits on */
  line: number;
  /** output of `#eval` (no goals shown) */
  msg?: string;
  /** open goals after this line; [] means "No goals" */
  goals?: Goal[];
  /** error message shown by Lean */
  err?: string;
  /** explanation; `code` and **bold** markup */
  note: Bi;
  /** success message on the last step */
  done?: Bi;
  /** failure explanation on the last step */
  fail?: Bi;
}
export interface LeanExample {
  id: string;
  name: Bi;
  file: string;
  desc: Bi;
  lines: Bi<string[]>;
  steps: LeanStep[];
  /** the claim is false: the proof is expected to end in an error */
  fails?: boolean;
}

const G = (hyps: string[], goal: string, c?: string): Goal => ({ c, hyps, goal });
const DEF_DISCOUNT: Bi<string[]> = {
  en: ['def discount (price : Nat) : Nat :=', '  if price ≥ 100 then price - price / 10 else price'],
  de: ['def discount (price : Nat) : Nat :=', '  if price ≥ 100 then price - price / 10 else price'],
};
const IF_DISCOUNT = '(if price ≥ 100 then price - price / 10 else price)';
const both = (l: string[]): Bi<string[]> => ({ en: l, de: l });
const cat = (...parts: Bi<string[]>[]): Bi<string[]> => ({ en: parts.flatMap((p) => p.en), de: parts.flatMap((p) => p.de) });

export const LEAN_EXAMPLES: LeanExample[] = [
  {
    id: 'never-dearer', name: { en: '🏷️ A discount never makes it dearer', de: '🏷️ Rabatt macht nie teurer' }, file: 'Discount.lean',
    desc: {
      en: 'From 100 € the pet shop gives 10 % off. Claim: the discounted price is at most the original price **for every price**. `Nat` (natural numbers) counts whole euros, division rounds down.',
      de: 'Ab 100 € gibt der Tiershop 10 % Rabatt. Behauptung: Der Preis mit Rabatt ist **für jeden Preis** höchstens so hoch wie der ursprüngliche. `Nat` (natürliche Zahlen) zählt ganze Euro, die Division rundet ab.',
    },
    lines: cat(DEF_DISCOUNT, both(['', '#eval discount 120   -- 108', '#eval discount 80    -- 80', '', 'theorem discount_le (price : Nat) : discount price ≤ price := by', '  unfold discount', '  split', '  · omega', '  · omega'])),
    steps: [
      { line: 3, msg: '108', note: { en: 'Lean is also a programming language: `#eval` runs the function. 120 − 12 = 108.', de: 'Lean ist auch eine Programmiersprache: `#eval` führt die Funktion aus. 120 − 12 = 108.' } },
      { line: 4, msg: '80', note: { en: 'Below 100 € there is no discount.', de: 'Unter 100 € gibt es keinen Rabatt.' } },
      { line: 6, goals: [G(['price : Nat'], 'discount price ≤ price')], note: { en: 'The claim becomes the **goal** (after `⊢`). Above the line is what we have: some price. So a proof holds for *every* price.', de: 'Die Behauptung wird zum **Ziel** (nach `⊢`). Über dem Strich steht, was wir haben: irgendeinen Preis. Ein Beweis gilt also für *jeden* Preis.' } },
      { line: 7, goals: [G(['price : Nat'], `${IF_DISCOUNT} ≤ price`)], note: { en: '`unfold` inserts the definition of `discount`.', de: '`unfold` setzt die Definition von `discount` ein.' } },
      {
        line: 8,
        goals: [G(['price : Nat', 'h✝ : price ≥ 100'], 'price - price / 10 ≤ price', 'isTrue'), G(['price : Nat', 'h✝ : ¬price ≥ 100'], 'price ≤ price', 'isFalse')],
        note: { en: '`split` does a case split on the `if` condition. Now **two goals** are open, each with the matching hypothesis.', de: '`split` macht eine Fallunterscheidung nach der `if`-Bedingung. Jetzt sind **zwei Ziele** offen, jedes mit der passenden Annahme.' },
      },
      { line: 9, goals: [G(['price : Nat', 'h✝ : ¬price ≥ 100'], 'price ≤ price', 'isFalse')], note: { en: '`omega` decides linear arithmetic over integers, including division by constants and the truncated subtraction of `Nat`. Case 1 is done.', de: '`omega` entscheidet lineare Arithmetik über ganzen Zahlen, auch mit Division durch Konstanten und der abgeschnittenen Subtraktion von `Nat`. Fall 1 ist erledigt.' } },
      {
        line: 10, goals: [],
        done: { en: 'Proof complete. The kernel has checked `discount_le`: for **every** one of the infinitely many prices, the discount never makes it dearer.', de: 'Beweis vollständig. Der Kernel hat `discount_le` geprüft: Für **jeden** der unendlich vielen Preise macht der Rabatt nicht teurer.' },
        note: { en: 'The second case is done as well.', de: 'Auch der zweite Fall ist erledigt.' },
      },
    ],
  },
  {
    id: 'saves-ten', name: { en: '💰 From 100 € you save ≥ 10 €', de: '💰 Ab 100 € spart man ≥ 10 €' }, file: 'Discount.lean',
    desc: {
      en: 'A statement with a **hypothesis**: if the price is at least 100 €, you save at least 10 €. The hypothesis `h` is available as an assumption.',
      de: 'Eine Aussage mit **Voraussetzung**: Wenn der Preis mindestens 100 € beträgt, spart man mindestens 10 €. Die Voraussetzung `h` steht als Annahme zur Verfügung.',
    },
    lines: cat(DEF_DISCOUNT, both(['', 'theorem discount_saves (price : Nat) (h : price ≥ 100) :', '    discount price + 10 ≤ price := by', '  unfold discount', '  rw [if_pos h]', '  omega'])),
    steps: [
      { line: 4, goals: [G(['price : Nat', 'h : price ≥ 100'], 'discount price + 10 ≤ price')], note: { en: 'This time there are two hypotheses: the price and the assumption `h`.', de: 'Diesmal gibt es zwei Annahmen: den Preis und die Voraussetzung `h`.' } },
      { line: 5, goals: [G(['price : Nat', 'h : price ≥ 100'], `${IF_DISCOUNT} + 10 ≤ price`)], note: { en: 'Insert the definition.', de: 'Definition einsetzen.' } },
      { line: 6, goals: [G(['price : Nat', 'h : price ≥ 100'], 'price - price / 10 + 10 ≤ price')], note: { en: '`rw [if_pos h]` uses `h` to rewrite the `if` to its `then` branch. No case split needed: we already know which case applies.', de: '`rw [if_pos h]` schreibt das `if` mit Hilfe von `h` auf den `then`-Zweig um. Eine Fallunterscheidung ist nicht nötig, denn wir wissen ja, welcher Fall vorliegt.' } },
      {
        line: 7, goals: [],
        done: { en: 'Proof complete: whoever spends at least 100 € is guaranteed to save at least 10 €.', de: 'Beweis vollständig: Wer mindestens 100 € ausgibt, spart garantiert mindestens 10 €.' },
        note: { en: '`omega` uses `h`: from price ≥ 100 it follows that price / 10 ≥ 10.', de: '`omega` nutzt `h`: Aus price ≥ 100 folgt price / 10 ≥ 10.' },
      },
    ],
  },
  {
    id: 'false-claim', name: { en: '❌ A false claim', de: '❌ Falsche Behauptung' }, file: 'Discount.lean', fails: true,
    desc: {
      en: 'What happens when the claim is **not true**? Here we claim that the discounted price is *always* lower. Lean cannot be talked into it: the proof fails exactly at the case where the claim is false.',
      de: 'Was passiert, wenn die Behauptung **nicht stimmt**? Hier wird behauptet, mit Rabatt sei es *immer* billiger. Lean lässt sich nicht überreden: Der Beweis scheitert genau an dem Fall, in dem die Aussage falsch ist.',
    },
    lines: {
      en: [...DEF_DISCOUNT.en, '', '-- Claim: with the discount it is always cheaper. True?', 'theorem discount_always_lower (price : Nat) :', '    discount price < price := by', '  unfold discount', '  split', '  · omega', '  · omega'],
      de: [...DEF_DISCOUNT.de, '', '-- Behauptung: Mit Rabatt ist es immer billiger. Stimmt das?', 'theorem discount_always_lower (price : Nat) :', '    discount price < price := by', '  unfold discount', '  split', '  · omega', '  · omega'],
    },
    steps: [
      { line: 5, goals: [G(['price : Nat'], 'discount price < price')], note: { en: 'The goal looks harmless.', de: 'Das Ziel sieht harmlos aus.' } },
      { line: 6, goals: [G(['price : Nat'], `${IF_DISCOUNT} < price`)], note: { en: 'Insert the definition.', de: 'Definition einsetzen.' } },
      {
        line: 7,
        goals: [G(['price : Nat', 'h✝ : price ≥ 100'], 'price - price / 10 < price', 'isTrue'), G(['price : Nat', 'h✝ : ¬price ≥ 100'], 'price < price', 'isFalse')],
        note: { en: 'The problem is already visible: in case `isFalse` we would need `price < price`. That is true for no number.', de: 'Schon hier sieht man das Problem: Im Fall `isFalse` soll `price < price` gelten. Das ist für keine Zahl wahr.' },
      },
      { line: 8, goals: [G(['price : Nat', 'h✝ : ¬price ≥ 100'], 'price < price', 'isFalse')], note: { en: 'Case 1 (from 100 €) holds: there it really is cheaper.', de: 'Fall 1 (ab 100 €) stimmt: Dort ist es wirklich billiger.' } },
      {
        line: 9, goals: [G(['price : Nat', 'h✝ : ¬price ≥ 100'], 'price < price', 'isFalse')],
        err: 'omega could not prove the goal:\na possible counterexample may satisfy the constraints\n  x ≤ 99\nwhere\n x := price',
        fail: {
          en: 'Lean rejects the theorem. `omega` even names the condition for a counterexample: every price below 100 €. Indeed `discount 80 = 80`. The fix is the hypothesis `h : price ≥ 100` as in the previous example.',
          de: 'Lean akzeptiert den Satz nicht. `omega` nennt sogar die Bedingung für ein Gegenbeispiel: jeder Preis unter 100 €. Tatsächlich ist `discount 80 = 80`. Die Lösung ist die Voraussetzung `h : price ≥ 100` wie im Beispiel davor.',
        },
        note: { en: 'The proof fails here.', de: 'Hier scheitert der Beweis.' },
      },
    ],
  },
  {
    id: 'baskets', name: { en: '🛒 Merging baskets', de: '🛒 Warenkörbe zusammenlegen' }, file: 'Basket.lean',
    desc: {
      en: 'A basket is a list of prices in cents. Claim: merging two baskets (`++`) gives the same total as adding the two totals, for **lists of any length**. That needs **induction**, which Lean supports directly.',
      de: 'Ein Warenkorb ist eine Liste von Preisen in Cent. Behauptung: Legt man zwei Warenkörbe zusammen (`++`), ist die Summe gleich der Summe der beiden Einzelsummen, und zwar für **Listen jeder Länge**. Dafür braucht man **Induktion**, die Lean direkt unterstützt.',
    },
    lines: {
      en: ['-- A basket is a list of prices (in cents)', 'def total : List Nat → Nat', '  | []      => 0', '  | p :: ps => p + total ps', '', '#eval total [499, 1299, 250]   -- 2048', '', '-- Merging two baskets does not change the grand total',
        'theorem total_append (a b : List Nat) :', '    total (a ++ b) = total a + total b := by', '  induction a with', '  | nil => simp [total]', '  | cons p ps ih => simp [total, ih, Nat.add_assoc]'],
      de: ['-- Ein Warenkorb ist eine Liste von Preisen (in Cent)', 'def total : List Nat → Nat', '  | []      => 0', '  | p :: ps => p + total ps', '', '#eval total [499, 1299, 250]   -- 2048', '', '-- Zwei Warenkörbe zusammenlegen ändert die Gesamtsumme nicht',
        'theorem total_append (a b : List Nat) :', '    total (a ++ b) = total a + total b := by', '  induction a with', '  | nil => simp [total]', '  | cons p ps ih => simp [total, ih, Nat.add_assoc]'],
    },
    steps: [
      { line: 5, msg: '2048', note: { en: 'The function is recursive: empty basket = 0, otherwise first price plus the total of the rest.', de: 'Die Funktion ist rekursiv: leerer Korb = 0, sonst erster Preis plus Summe vom Rest.' } },
      { line: 9, goals: [G(['a b : List Nat'], 'total (a ++ b) = total a + total b')], note: { en: 'To show for all lists `a` and `b`, so infinitely many cases.', de: 'Zu zeigen für alle Listen `a` und `b`, also unendlich viele Fälle.' } },
      {
        line: 10,
        goals: [G(['b : List Nat'], 'total ([] ++ b) = total [] + total b', 'nil'), G(['b : List Nat', 'p : Nat', 'ps : List Nat', 'ih : total (ps ++ b) = total ps + total b'], 'total (p :: ps ++ b) = total (p :: ps) + total b', 'cons')],
        note: { en: '`induction` creates two goals: the empty basket (`nil`) and a basket with first item `p` (`cons`). In the second case we may already use the claim for the shorter rest `ps`: the **induction hypothesis** `ih`.', de: '`induction` erzeugt zwei Ziele: den leeren Korb (`nil`) und einen Korb mit erstem Artikel `p` (`cons`). Im zweiten Fall darf man die Aussage für den kürzeren Rest `ps` schon benutzen: die **Induktionshypothese** `ih`.' },
      },
      {
        line: 11, goals: [G(['b : List Nat', 'p : Nat', 'ps : List Nat', 'ih : total (ps ++ b) = total ps + total b'], 'total (p :: ps ++ b) = total (p :: ps) + total b', 'cons')],
        note: { en: '`simp` simplifies with the definition of `total` and standard rules like `[] ++ b = b` and `0 + x = x`. The empty case is done.', de: '`simp` vereinfacht mit der Definition von `total` und Standardregeln wie `[] ++ b = b` und `0 + x = x`. Der leere Fall ist erledigt.' },
      },
      {
        line: 12, goals: [],
        done: { en: 'Proof complete: for baskets of **any size**, the total of the merged basket equals the sum of the partial totals.', de: 'Beweis vollständig: Für Warenkörbe **jeder Größe** ist die Summe des zusammengelegten Korbs gleich der Summe der Teilsummen.' },
        note: { en: 'With `ih` and the associativity law `Nat.add_assoc`, both sides are equal.', de: 'Mit `ih` und dem Assoziativgesetz `Nat.add_assoc` sind beide Seiten gleich.' },
      },
    ],
  },
];
