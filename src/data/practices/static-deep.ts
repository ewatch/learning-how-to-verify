import type { Practice } from '../types';
import { ev, f, l, none, q } from './_h';

export const staticDeep: Practice[] = [
  {
    id: 'property-based-tests',
    domain: { parts: ['checkout', 'discount-sum'], what: l('For each generated cart, the total of the discount shares must equal the discount.', 'Für jeden erzeugten Warenkorb muss die Summe der Rabattanteile dem Rabatt entsprechen.') },
    name: l('Property-based tests', 'Property-Based Testing'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    core: true,
    oneLiner: l('A property gives a rule for all inputs. A tool generates hundreds of inputs and tries to make each input that fails smaller.', 'Eine Property legt eine Regel für alle zulässigen Eingaben fest. Das Tool prüft die Regel mit vielen erzeugten Eingaben. Bei einem Fehler sucht das Tool nach einer kleineren Eingabe, die denselben Fehler zeigt.'),
    catches: l('Cases without a test example, such as empty lists, zero values, rounding effects, unusual input orders and interleavings.', 'Randfälle ohne eigenen Test. Beispiele sind leere Listen, Nullwerte, Rundungsfehler und ungewöhnliche Reihenfolgen von Eingaben oder nebenläufigen Operationen.'),
    intro: l(
      'Example tests check only the carts that someone wrote down. If each discount share is rounded on its own, another cart can lose a cent. A property gives the rule for all carts. The tool generates carts until one breaks it.',
      'Beispieltests prüfen nur die Warenkörbe, die jemand aufgeschrieben hat. Wird jeder Rabattanteil einzeln gerundet, kann bei einem anderen Warenkorb ein Cent fehlen. Eine Property beschreibt die Regel für alle Warenkörbe. Das Tool erzeugt Warenkörbe, bis einer die Regel verletzt.',
    ),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('A single property can cover many examples. It can also find errors in cases that have no explicit test.', 'Eine Property prüft dieselbe Regel mit vielen Eingaben. So kann der Test Fehler in Fällen finden, für die es keinen eigenen Test gibt.'),
      l('Shrinking gives a smaller counterexample that is easier to examine.', 'Shrinking sucht nach einem kleineren Gegenbeispiel. Das kleinere Gegenbeispiel zeigt denselben Fehler und lässt sich leichter untersuchen.'),
      l('Common properties include round trips, invariants, idempotency and model equivalence. For a round trip, `parse(print(x)) = x`. For idempotency, `f(f(x)) = f(x)`.', 'Typische Properties sind Round-Trips, Invariants und Idempotenz. Bei einem Round-Trip gilt `parse(print(x)) = x`. Bei Idempotenz gilt `f(f(x)) = f(x)`. Eine Property kann das Ergebnis auch mit einem Modell vergleichen.'),
    ],
    limits: [
      l('A useful property requires a rule for the behavior. Complex inputs can require additional work to write a generator.', 'Eine Property braucht eine klare Regel für das erwartete Verhalten. Ein Generator für komplexe Eingaben kann mehr Aufwand erfordern.'),
      l('A run checks a few hundred random inputs (fast-check: 100 by default, the simulator: 200). It can miss a rare error. A passing run does not prove the property.', 'Ein Testlauf prüft einige hundert zufällige Eingaben (fast-check: standardmäßig 100, der Simulator: 200). Er kann einen seltenen Fehler übersehen. Ein bestandener Testlauf gilt nur für die geprüften Eingaben.'),
    ],
    ai: l(
      'Give the rule that the code must obey. The tool generates inputs instead of using only the examples from the coding agent. A small counterexample gives the coding agent a specific failure to examine.',
      'Gib dem Coding-Agenten die Regel für das erwartete Verhalten. Das Tool erzeugt eigene Eingaben. Untersuche mit dem Coding-Agenten ein kleines Gegenbeispiel, wenn der Test fehlschlägt.',
    ),
    evidence: {
      general: ev('weak',
        f('goldstein2024', 'A qualitative study interviewed 30 engineers at Jane Street. They found property-based testing useful for complex code. They reported difficulty with writing generators and deciding how well the tests work.', 'Eine qualitative Studie befragte 30 Entwickler bei Jane Street. Die Befragten fanden Property-Based Testing bei komplexem Code nützlich. Sie nannten zwei Schwierigkeiten. Es war schwer, Generatoren zu schreiben und die Wirksamkeit der Tests zu beurteilen.'),
        f('brooker2025', 'An experience report describes how AWS uses property-based testing in systems such as ShardStore for S3.', 'Ein Erfahrungsbericht beschreibt den Einsatz von Property-Based Testing bei AWS. Ein Beispiel ist ShardStore für S3.')),
      ai: ev('weak', f('he2025pbt', 'The preprint reports a relative increase of 23–37% in pass@1 compared with feedback from test-driven development. The property-based feedback included counterexamples from shrinking.', 'Der Preprint vergleicht zwei Arten von Feedback. Mit Property-Based Testing lag pass@1 relativ um 23–37 % höher als mit Feedback aus Test-Driven Development. Das Feedback aus Property-Based Testing enthielt Gegenbeispiele aus dem Shrinking.')),
    },
    variants: [
      { name: l('Metamorphic testing', 'Metamorphic Testing'), text: l('Compare results for related inputs when you do not have an oracle. For example, `price < 50` must return no more pets than `price < 100`.', 'Vergleiche die Ergebnisse für verwandte Eingaben, wenn kein Test Oracle verfügbar ist. Beispiel: `price < 50` darf höchstens so viele Tiere liefern wie `price < 100`.') },
      { name: l('Model-based / stateful testing', 'Model-Based Testing und Stateful Testing'), text: l('Generate random sequences of operations. After each operation, compare the system with a simple model.', 'Erzeuge zufällige Folgen von Operationen. Vergleiche das System nach jeder Operation mit einem einfachen Modell.') },
    ],
    tools: { php: ['eris'], js: ['fast-check'], python: ['hypothesis'], java: ['jqwik'], dotnet: ['fscheck'], go: ['rapid'], rust: ['proptest'], cpp: ['rapidcheck'] },
    sim: 'pbt',
    snippets: [
      { lang: 'js', file: 'allocate.property.test.ts', code: `import fc from 'fast-check';
import { allocate } from './allocate';

// A cart discount is split across the pets in the cart.
test('shares always add up exactly to the discount, and none exceeds its weight', () => {
  fc.assert(fc.property(
    fc.array(fc.nat(10_000), { minLength: 1 }),
    fc.nat(),
    (weights, raw) => {
      const total = weights.reduce((a, b) => a + b, 0);
      const amount = total === 0 ? 0 : raw % (total + 1);
      const shares = allocate(amount, weights);
      expect(shares.reduce((a, b) => a + b, 0)).toBe(total === 0 ? 0 : amount);
      shares.forEach((s, i) => expect(s).toBeLessThanOrEqual(weights[i]));
    },
  ));
});`, focus: [{ line: [6,8], note: l('The generators supply many inputs. They can supply edge cases that are absent from the written examples.', 'Die Generatoren erzeugen viele Eingaben. Dazu können Randfälle gehören, die in den geschriebenen Tests fehlen.') }, { line: 11, note: l('Generate valid inputs directly. A filter can discard inputs and decrease the number of cases that run.', 'Erzeuge gültige Eingaben direkt. Ein Filter kann Eingaben verwerfen und dadurch die Anzahl der geprüften Fälle senken.') }, { line: 13, note: l('The total of the shares must equal the discount. Rounding must not change that total.', 'Die Summe der Anteile muss dem Rabatt entsprechen. Rundung darf diese Summe nicht ändern.') }, { line: 14, note: l('The second invariant prevents a share from exceeding its weight.', 'Jeder Anteil darf höchstens so groß sein wie sein Gewicht.') }] },
      { lang: 'python', file: 'test_allocate.py', code: `from hypothesis import given, strategies as st
from allocate import allocate

@given(st.lists(st.integers(0, 10_000), min_size=1), st.integers(min_value=0))
def test_shares_add_up(weights, raw):
    total = sum(weights)
    amount = 0 if total == 0 else raw % (total + 1)
    shares = allocate(amount, weights)
    assert sum(shares) == (0 if total == 0 else amount)
    assert all(s <= w for s, w in zip(shares, weights))`, focus: [{ line: 4, note: l('The strategies specify the inputs. When a case fails, the tool tries to find a smaller input that also fails.', 'Die Strategies legen fest, welche Eingaben der Test verwendet. Bei einem Fehler sucht das Tool nach einer kleineren Eingabe, die denselben Fehler zeigt.') }, { line: 7, note: l('Use the generated value to calculate a valid amount. The test can then use each generated input.', 'Berechne aus dem erzeugten Wert einen gültigen Betrag. So kann der Test jede erzeugte Eingabe verwenden.') }, { line: 9, note: l('The total of the shares must equal the amount for all weights in the input space.', 'Die Summe der Anteile muss für alle erzeugten Gewichte dem Betrag entsprechen.') }, { line: 10, note: l('The test examines the bound for each generated case.', 'Der Test prüft die Obergrenze für jeden erzeugten Fall.') }] },
      { lang: 'php', file: 'AllocateTest.php', code: `<?php declare(strict_types=1);
// composer require --dev phpunit/phpunit giorgiosironi/eris
use Eris\\Generators;
use Eris\\TestTrait;
use PHPUnit\\Framework\\TestCase;

final class AllocateTest extends TestCase
{
    use TestTrait;

    public function testSharesAddUp(): void
    {
        $this->forAll(
            Generators::choose(0, 10000),
            Generators::choose(0, 10000),
            Generators::choose(0, 20000),
        )->then(function (int $a, int $b, int $raw): void {
            $total = $a + $b;
            $amount = $total === 0 ? 0 : $raw % ($total + 1);
            $shares = allocate($amount, [$a, $b]);
            self::assertCount(2, $shares);
            self::assertSame($amount, array_sum($shares));
            foreach ($shares as $i => $share) {
                self::assertGreaterThanOrEqual(0, $share);
                self::assertLessThanOrEqual([$a, $b][$i], $share);
            }
        });
    }
}`, focus: [{ line: [13,16], note: l('The generators specify the ranges. The third range is wider so the modulo operation can produce each permitted amount.', 'Die Generatoren legen die Wertebereiche fest. Der dritte Bereich ist größer. Damit kann die Modulo-Operation jeden zulässigen Betrag erzeugen.') }, { line: 22, note: l('`assertSame` requires an exact result. The total of the shares must equal the amount.', '`assertSame` prüft den Wert exakt. Die Summe der Anteile muss dem Betrag entsprechen.') }, { line: [24,25], note: l('Each share must be zero or greater. It must also be less than or equal to its weight.', 'Jeder Anteil muss mindestens null sein. Er darf höchstens so groß sein wie sein Gewicht.') }] },
    ],
    steps: [
      l('Select a function with clear rules, such as a parser or a calculation.', 'Wähle eine Funktion mit klaren Regeln, zum Beispiel einen Parser oder eine Berechnung.'),
      l('Write two or three properties. Use an invariant, a round trip or a comparison with a simple reference implementation.', 'Schreibe zwei oder drei Properties. Verwende ein Invariant, einen Round-Trip oder einen Vergleich mit einer einfachen Referenzimplementierung.'),
      l('Run at least 1,000 cases locally. If a case fails, add the counterexample from shrinking as a regression test.', 'Führe den Test lokal mit mindestens 1.000 Fällen aus. Wenn ein Fall fehlschlägt, füge das Gegenbeispiel aus dem Shrinking als Regression Test hinzu.'),
      l('Record the random seed in the CI output so you can reproduce failures.', 'Gib den Seed in der CI-Ausgabe aus. Verwende diesen Seed, um einen Fehler zu reproduzieren.'),
    ],
    done: l('Two or more properties pass with at least 1,000 generated cases. Each counterexample has a regression test.', 'Mindestens zwei Properties bestehen den Test mit jeweils mindestens 1.000 erzeugten Fällen. Für jedes gefundene Gegenbeispiel gibt es einen Regression Test.'),
    think: [
      q('Why is it insufficient to require only that the output of a sorting function is in order?', 'Für eine Sortierfunktion gilt die Property „Die Ausgabe ist sortiert“. Welche fehlerhafte Ausgabe kann diese Property erfüllen?',
        'A function that always returns `[]` satisfies the property. Add a property that requires the output to be a permutation of the input.',
        'Eine Funktion, die immer `[]` zurückgibt, erfüllt die Property. Ergänze eine Property, die eine Permutation der Eingabe verlangt.'),
      q('The tool reports a failure with a list of 47 numbers. Shrinking gives `[1, 1]` and an amount of 1. Which input do you examine first?', 'Das Tool meldet einen Fehler mit einer Liste aus 47 Zahlen. Shrinking liefert `[1, 1]` mit dem Betrag 1. Welche Eingabe untersuchst du zuerst?',
        'Examine the smaller input. It still fails. The two equal weights and the odd amount show a possible rounding error.',
        'Untersuche die kleinere Eingabe. Sie zeigt denselben Fehler. Zwei gleiche Gewichte und ein ungerader Betrag weisen auf einen möglichen Rundungsfehler hin.'),
      q('A property requires the total of the shares to equal the amount. It fails with an amount of 1 and two shares. What is a possible cause?', 'Eine Property verlangt, dass die Summe der Anteile dem Betrag entspricht. Der Test schlägt bei `amount = 1` und zwei Anteilen fehl. Was kann die Ursache sein?',
        'Rounding can change both shares of 0.5 to 0 or both to 1. The total is then 0 or 2. Add a rule for the remainder, such as giving it to the first share.',
        'Die Rundung kann beide Anteile von 0,5 auf 0 oder beide auf 1 setzen. Die Summe ist dann 0 oder 2. Lege eine Regel für den Rest fest. Beispiel: Weise den Rest dem ersten Anteil zu.'),
    ],
    related: ['fuzz-tests', 'unit-tests', 'differential-testing', 'formal-verification'],
  },
  {
    id: 'fuzz-tests',
    domain: { parts: ['search'], what: l('A fuzzer sends strange queries to the search parser `parseSearch`.', 'Ein Fuzzer sendet erzeugte Eingaben an den Suchparser `parseSearch`.') },
    name: l('Fuzz tests', 'Fuzzing'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('A fuzzer supplies many generated inputs to a program. It records failures and the inputs that cause them.', 'Ein Fuzzer erzeugt viele Eingaben für ein Programm. Er meldet Fehler zusammen mit der Eingabe, die den Fehler auslöst.'),
    catches: l('crashes, hangs, memory errors and unhandled exceptions on untrusted input: parsers, decoders, protocol handlers', 'Abstürze, blockierte Abläufe, Speicherfehler und unbehandelte Exceptions bei unerwarteten Eingaben.'),
    intro: l(
      'The petstore reads search filters from the URL. A character in an unexpected encoding can cause the parser to fail. A fuzzer can find unusual inputs that cause failures.',
      'Der Petstore liest Suchfilter aus der URL. Ein Zeichen mit einer unerwarteten Kodierung kann den Parser zum Absturz bringen. Ein Fuzzer kann solche Eingaben finden.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('Coverage guidance keeps inputs that reach additional code. Later inputs can explore more of those paths.', 'Coverage-guided Fuzzing behält Eingaben, die zusätzlichen Code ausführen. Spätere Eingaben können weitere Pfade prüfen.'),
      l('Fuzzing can find many security defects. OSS-Fuzz has found tens of thousands.', 'Fuzzing kann viele Schwachstellen finden. OSS-Fuzz hat Zehntausende gefunden.'),
      l('A crash gives a failure result without an expected output for each input.', 'Ein Absturz liefert ein Fehlerergebnis ohne einen Erwartungswert pro Eingabe.'),
    ],
    limits: [
      l('Add assertions or compare implementations to detect incorrect results that do not cause a crash.', 'Ergänze Assertions oder vergleiche Implementierungen. So findest du falsche Ergebnisse ohne Absturz.'),
      l('Fuzzing can require minutes or days of CPU time. Run it continuously if resources permit.', 'Fuzzing kann Minuten oder Tage Rechenzeit brauchen. Führe es fortlaufend aus, wenn genügend Ressourcen verfügbar sind.'),
    ],
    ai: l(
      'Coding agents can write fuzz harnesses. A report from Google describes generated harnesses that found new vulnerabilities in projects that already used fuzzing. Use sanitizers to detect memory errors during fuzzing.',
      'Coding-Agenten können Fuzz Harnesses schreiben. Ein Bericht von Google beschreibt generierte Harnesses, die neue Schwachstellen fanden. Die Projekte verwendeten bereits Fuzzing. Aktiviere Sanitizer für Speicherfehler.',
    ),
    evidence: {
      general: ev('strong',
        f('ding2021', '23,907 bugs in 316 projects found by OSS-Fuzz; they are found quickly and fixed quickly.', '23.907 von OSS-Fuzz gefundene Fehler in 316 Projekten; sie werden schnell gefunden und schnell behoben.'),
        f('klees2018', 'All 32 fuzzing papers reviewed had evaluation flaws: fuzzing works, but claims that one fuzzer beats another need care.', 'Alle 32 untersuchten Fuzzing-Papers hatten Mängel in der Evaluation: Fuzzing wirkt, aber Aussagen, ein Fuzzer schlage einen anderen, brauchen Vorsicht.')),
      ai: ev('moderate',
        f('googlefuzz2024', 'LLM-written fuzz targets found 26 new vulnerabilities, including one in OpenSSL, and added coverage in 272 projects.', 'LLM-geschriebene Fuzz-Targets fanden 26 neue Schwachstellen, darunter eine in OpenSSL, und erhöhten die Abdeckung in 272 Projekten.'),
        f('fuzz4all2024', 'An LLM-based fuzzer for six input languages beat language-specific fuzzers on coverage and found 98 bugs, 64 confirmed as new.', 'Ein LLM-basierter Fuzzer für sechs Eingabesprachen schlug sprachspezifische Fuzzer bei der Abdeckung und fand 98 Fehler, 64 davon als neu bestätigt.')),
    },
    tools: { php: ['php-fuzzer'], js: ['jazzer-js'], python: ['atheris'], java: ['jazzer'], dotnet: ['sharpfuzz'], go: ['go-fuzz'], rust: ['cargo-fuzz'], cpp: ['libfuzzer', 'aflplusplus'], any: ['oss-fuzz', 'restler', 'schemathesis'] },
    sim: 'fuzz',
    snippets: [
      { lang: 'js', file: 'search.fuzz.js', code: `// npx jazzer search.fuzz.js
const { parseSearch, printSearch, SearchSyntaxError } = require('./search');

module.exports.fuzz = (data) => {
  const query = data.toString('utf8');
  try {
    const ast = parseSearch(query);       // e.g. "flat -category:fish price<50"
    const again = parseSearch(printSearch(ast));
    if (JSON.stringify(again) !== JSON.stringify(ast)) throw new Error('round-trip changed the query');
  } catch (e) {
    if (e instanceof SearchSyntaxError) return; // expected rejection
    throw e;                                    // anything else is a finding
  }
};`, focus: [{ line: 4, note: l('The fuzzer, not you, chooses the hostile inputs: this function receives arbitrary bytes.', 'Der Fuzzer, nicht du, wählt die feindlichen Eingaben: Diese Funktion bekommt beliebige Bytes.') }, { line: [8,9], note: l('Round-trip is the oracle: no expected output needed, only that print then parse gives the same query back.', 'Der Round-Trip ist das Orakel: Keine erwartete Ausgabe nötig, nur dass print und parse dieselbe Query zurückliefern.') }, { line: 11, note: l('A clean syntax error is the parser doing its job, not a bug.', 'Ein sauberer Syntaxfehler ist der Parser bei seiner Arbeit, kein Bug.') }, { line: 12, note: l('Anything else, such as a crash or a hang, is a finding. This rethrow turns it into a report.', 'Alles andere, etwa ein Absturz, ist ein Fund. Dieses Weiterwerfen macht daraus einen Bericht.') }] },
      { lang: 'go', file: 'search_test.go', code: `func FuzzParseSearch(f *testing.F) {
    f.Add("flat -category:fish price<50")
    f.Fuzz(func(t *testing.T, q string) {
        ast, err := ParseSearch(q)
        if err != nil { return }
        if _, err := ParseSearch(ast.String()); err != nil {
            t.Fatalf("round-trip failed for %q: %v", q, err)
        }
    })
}
// go test -fuzz=FuzzParseSearch`, focus: [{ line: 2, note: l('Seeds give the fuzzer a realistic starting point to mutate instead of random noise.', 'Seeds geben dem Fuzzer einen realistischen Startpunkt zum Mutieren statt reinem Rauschen.') }, { line: 5, note: l('Rejecting bad input is fine; only crashes and wrong behaviour count as failures.', 'Schlechte Eingaben abzulehnen ist in Ordnung; nur Abstürze und falsches Verhalten zählen als Fehler.') }, { line: [6,8], note: l('The oracle: whatever the parser accepts must survive printing and parsing again.', 'Das Orakel: Was der Parser akzeptiert, muss Ausgeben und erneutes Parsen überstehen.') }] },
    ],
    steps: [
      l('Select code that handles untrusted input, such as a parser or decoder.', 'Wähle Code, der nicht vertrauenswürdige Eingaben verarbeitet, etwa einen Parser oder Decoder.'),
      l('Write a harness that passes bytes to the parser. Treat unexpected failures as findings. Add a round-trip assertion if possible.', 'Schreibe einen Fuzz Harness, der Bytes an den Code übergibt. Erfasse unerwartete Fehler als Findings. Ergänze nach Möglichkeit eine Round-Trip-Assertion.'),
      l('Add typical inputs to the corpus. Add a dictionary of keywords.', 'Lege typische Eingaben im Corpus ab. Ergänze ein Wörterbuch mit Schlüsselwörtern.'),
      l('Run the fuzzer locally for at least 10 minutes. Then run it continuously in CI or OSS-Fuzz. Add a regression test for each crash.', 'Führe den Fuzzer lokal mindestens 10 Minuten aus. Führe ihn danach fortlaufend in CI oder OSS-Fuzz aus. Ergänze für jeden Absturz einen Regression Test.'),
    ],
    done: l('The harness runs for at least 10 minutes. Each finding has a correction and a regression test. The repository contains the input corpus.', 'Der Fuzz Harness läuft mindestens 10 Minuten. Jeder Fund hat eine Korrektur und einen Regression Test. Das Repository enthält den Corpus.'),
    think: [
      q('Blind random bytes rarely get past the first `if` of a parser. What does coverage guidance change?', 'Blinde Zufallsbytes kommen selten über das erste `if` eines Parsers hinaus. Was ändert die Coverage-Lenkung?',
        'The fuzzer keeps any input that reached new code and mutates it further. Step by step it builds inputs that pass each check, as if it were learning the format.',
        'Der Fuzzer behält jede Eingabe, die neuen Code erreichte, und mutiert sie weiter. Schritt für Schritt baut er Eingaben, die jede Prüfung passieren, als lerne er das Format.'),
      q('Fuzzing vs. property-based testing: what is the main difference?', 'Fuzzing vs. Property-Based Testing: Was ist der Hauptunterschied?',
        'PBT generates structured values from a generator you write and checks a rule, in seconds. Fuzzing mutates raw bytes guided by coverage, for hours, mostly looking for crashes. They meet in the middle (structure-aware fuzzing).',
        'PBT erzeugt strukturierte Werte aus einem selbst geschriebenen Generator und prüft eine Regel, in Sekunden. Fuzzing mutiert rohe Bytes, gelenkt von Coverage, über Stunden, meist auf der Suche nach Abstürzen. In der Mitte treffen sie sich (strukturbewusstes Fuzzing).'),
      q('Predict: you fuzz the search-query parser for a day and find nothing. What can you conclude?', 'Vorhersage: Du fuzzt den Parser der Suchanfrage einen Tag lang und findest nichts. Was kannst du daraus schließen?',
        'Only that these inputs, with this harness and this corpus, did not crash it. Check the coverage report to see whether the fuzzer reached the interesting branches.',
        'Nur dass diese Eingaben mit diesem Harness und diesem Corpus ihn nicht zum Absturz brachten. Im Coverage-Report prüfen, ob der Fuzzer die interessanten Zweige erreicht hat.'),
    ],
    related: ['property-based-tests', 'sanitizers', 'security-scanning', 'dynamic-exploration'],
  },
  {
    id: 'mutation-tests',
    domain: { parts: ['fee', 'fee-rules', 'reserve'], what: l('Changes to `adoptionFee` and `reserve` show which errors the tests can find.', 'Änderungen an `adoptionFee` und `reserve` zeigen, welche Fehler die Tests erkennen.') },
    name: l('Mutation tests', 'Mutation Testing'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    core: true,
    oneLiner: l('Mutation testing makes small changes to the code. Each change makes a mutant. A test suite detects a mutant when at least one test fails because of the change.', 'Mutation Testing ändert Code gezielt. Jede Änderung ergibt einen Mutant. Die Tests erkennen einen Mutant, wenn mindestens ein Test wegen der Änderung fehlschlägt.'),
    catches: l('Missing boundary cases, weak assertions and side effects that the tests do not examine.', 'Fehlende Grenzfälle, schwache Assertions und Side Effects ohne Test.'),
    intro: l(
      'A coding agent writes 40 tests. All tests pass. Change `>=` to `>` in the senior discount. The tests still pass. Mutation testing reports changes that make no test fail.',
      'Ein Coding-Agent schreibt 40 Tests. Alle Tests bestehen. Ändere `>=` beim Rabatt für ältere Tiere in `>`. Die Tests bestehen weiterhin. Mutation Testing meldet Änderungen, die keinen Test fehlschlagen lassen.',
    ),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('A mutation score shows whether tests detect changes to behavior. Coverage shows which code the tests run.', 'Der Mutation Score zeigt, ob Tests Änderungen am Verhalten erkennen. Coverage zeigt, welcher Code lief.'),
      l('A surviving mutant shows a change that no test detects. If the mutant changes behavior, it can show where a test is missing.', 'Ein verbliebener Mutant zeigt eine Änderung, die kein Test erkennt. Bei geändertem Verhalten kann ein Test fehlen.'),
      l('Incremental mode can limit mutation testing to changed code. This can decrease the CI time.', 'Inkrementelles Mutation Testing kann sich auf geänderten Code beschränken. Das verkürzt den CI-Lauf.'),
    ],
    limits: [
      l('Mutation testing can be slow on a large codebase. Run it on changed code or critical modules.', 'Mutation Testing kann in einer großen Codebasis lange dauern. Prüfe geänderten Code oder wichtige Module.'),
      l('An equivalent mutant has the same behavior as the original code. No test can detect a difference. A person must identify these mutants.', 'Ein äquivalenter Mutant verhält sich wie der Originalcode. Eine Person muss dieses gleiche Verhalten feststellen.'),
    ],
    ai: l(
      'Mutation testing can show which changes the coding agent\'s tests do not detect. Meta uses mutants to guide LLM test generation. It keeps tests that detect the mutants.',
      'Mutation Testing zeigt Änderungen, die Tests des Coding-Agenten nicht erkennen. Meta nutzt Mutanten, um Tests mit LLMs zu erzeugen. Meta behält Tests, die diese Mutanten erkennen.',
    ),
    evidence: {
      general: ev('strong',
        f('just2014', 'The study examined 357 real faults. Mutant detection correlated with fault detection independently of coverage. The study found a relation between common mutants and 73% of the real faults.', 'Die Studie untersuchte 357 reale Fehler. Die Erkennung von Mutanten korrelierte unabhängig von der Coverage mit der Fehlererkennung. 73 % der realen Fehler waren mit üblichen Mutanten gekoppelt.'),
        f('papadakis2018', 'The researchers found a weaker correlation when they accounted for the number of tests. Suites with higher mutation scores still found more faults than random suites of the same size.', 'Kontrolliert man die Suitegröße, ist die Korrelation schwächer, aber Suiten mit höherem Mutation Score finden weiterhin mehr echte Fehler als zufällige Suiten gleicher Größe.'),
        f('petrovic2021', 'The Google study included approximately 15 million mutants. Developers who saw the mutants wrote more tests over time. The tests also improved in quality.', 'Bei Google (etwa 15 Mio. Mutanten) schrieben Entwickler, die Mutanten sahen, mit der Zeit mehr und bessere Tests.')),
      ai: ev('moderate', f('foster2025', 'Meta\'s ACH generated mutants and LLM tests for 10,795 Kotlin classes. Engineers accepted 73% of the resulting tests.', 'Metas ACH erzeugte Mutanten und LLM-Tests für 10.795 Kotlin-Klassen; Entwickler übernahmen 73 % der entstandenen Tests.')),
    },
    variants: [{ name: l('Agent-generated tests', 'Von Agenten erzeugte Tests'), text: l('Use a coding agent to write tests. Keep only tests that compile, pass and detect at least one surviving mutant.', 'Lass den Coding-Agenten Tests schreiben. Behalte nur Tests, die kompilieren, bestehen und mindestens einen verbliebenen Mutant erkennen.') }],
    tools: { php: ['infection'], js: ['stryker-js'], python: ['mutmut', 'cosmic-ray'], java: ['pitest'], dotnet: ['stryker-net'], go: ['gremlins'], rust: ['cargo-mutants'], cpp: ['mull'] },
    sim: 'mutation',
    snippets: [
      { lang: 'js', file: 'stryker.config.json',
        enforcedBy: l('StrykerJS (`npx stryker run`) mutates the listed files, runs Vitest on each mutant and fails CI if the score drops below `thresholds.break`.', 'StrykerJS (`npx stryker run`) mutiert die angegebenen Dateien, führt Vitest je Mutant aus und lässt CI unterhalb von `thresholds.break` fehlschlagen.'),
        code: `{
  "testRunner": "vitest",
  "mutate": ["src/domain/**/*.ts"],
  "thresholds": { "high": 90, "low": 75, "break": 70 },
  "incremental": true
}`, focus: [{ line: 3, note: l('Limit mutation testing to the domain code. Code outside the domain does not contain the business rules under test.', 'Nur den Domain-Code mutieren; alles zu mutieren verschwendet Zeit an Code ohne Geschäftsregeln.') }, { line: 4, note: l('The build fails if the mutation score is below the threshold.', 'Die Schwelle break lässt den Build fehlschlagen, wenn zu viele Mutanten überleben, die Tests also zu schwach sind.') }, { line: 5, note: l('Incremental mode uses earlier results again. This can decrease the time for later runs.', 'Incremental nutzt frühere Ergebnisse wieder, damit Wiederholungen schnell genug für jede Änderung bleiben.') }] },
      { lang: 'python', file: 'pyproject.toml',
        enforcedBy: l('mutmut (`mutmut run`) reads `[tool.mutmut]` and runs your pytest suite against each generated mutant.', 'mutmut (`mutmut run`) liest `[tool.mutmut]` und führt die pytest-Suite gegen jeden erzeugten Mutant aus.'),
        code: `[tool.mutmut]
paths_to_mutate = ["src/domain/"]
tests_dir = ["tests/"]
# run:   mutmut run && mutmut results`, focus: [{ line: 2, note: l('Limit mutation testing to code that contains the rules, such as the reservation logic.', 'Mutation auf den Code mit den Regeln beschränken, etwa die Reservierungslogik.') }, { line: 3, note: l('The tool runs the tests with each mutant. A mutant survives if all the tests still pass.', 'Die Mutanten laufen gegen diese Tests; ein Überlebender heißt, kein Test hat die Änderung bemerkt.') }, { line: 4, note: l('Examine the surviving mutants as well as the score. A surviving mutant can show which behavior needs a stronger assertion.', 'Lies die überlebenden Mutanten, nicht nur den Score: Jeder nennt ein Verhalten, das kein Test festlegt.') }] },
    ],
    steps: [
      l('Run the mutation tool on the domain logic. Record the score. Record the surviving mutants.', 'Führe das Mutation Testing für den Domain Code aus. Erfasse den Mutation Score. Erfasse die verbliebenen Mutanten.'),
      l('Add or strengthen a test for each surviving mutant that changes behavior. Give a reason for each equivalent mutant.', 'Schreibe oder verstärke einen Test für jeden verbliebenen Mutant mit geändertem Verhalten. Begründe, warum die anderen Mutanten äquivalent sind.'),
      l('Change production code only if a mutant shows a real defect.', 'Ändere Produktionscode nur, wenn ein Mutant einen Fehler im Code zeigt.'),
      l('Add incremental mutation testing to CI. Set a threshold below which the build fails.', 'Füge inkrementelles Mutation Testing zu CI hinzu. Lege fest, unter welchem Mutation Score der Build fehlschlägt.'),
    ],
    done: l('The module has a mutation score of at least 80%. Each remaining mutant has an explanation of equivalence. CI fails if the score is below the threshold.', 'Der Mutation Score liegt bei mindestens 80 %. Für jeden verbliebenen Mutant gibt es eine Begründung für gleiches Verhalten. CI schlägt unterhalb der Grenze fehl.'),
    think: [
      q('The tests reach 100% line coverage. Four of 12 mutants survive. How can these two results occur?', 'Deine Tests erreichen 100 % Zeilenabdeckung, trotzdem überleben 4 von 12 Mutanten. Wie passt das zusammen?',
        'Line coverage shows which lines ran. A mutant survives if the tests do not detect the change in behavior. A change from `>=` to `>` can survive if no test uses the boundary value.',
        'Coverage sagt nur, dass die Zeile lief. Ein Mutant überlebt, wenn kein Test merkt, dass sich die Zeile anders verhält, z. B. `>=` zu `>`, wenn kein Test genau den Grenzwert nutzt.'),
      q('A mutant changes `i < arr.length` to `i <= arr.length` and survives. Does the test suite need an additional test?', 'Ein Mutant ändert `i < arr.length` zu `i <= arr.length` und überlebt. Ist die Testsuite schwach?',
        'The additional iteration can read `undefined` without a change in observable behavior. If the behavior stays the same, the mutant is equivalent. Examine the code to decide.',
        'Vielleicht nicht. In JavaScript liest der zusätzliche Durchlauf womöglich `undefined` und ändert nichts; dann ist der Mutant äquivalent, und kein Test kann ihn töten. Ein Mensch muss entscheiden.'),
      q('A coding agent writes both the code and its tests. What can the mutation score show that line coverage cannot?', 'Vorhersage: Du führst Mutation Testing auf einem Modul aus, bei dem ein Agent Code und Tests geschrieben hat. Welchen Score erwartest du, und warum?',
        'The mutation score can be lower than line coverage. A test can run a line without checking its result or its boundary cases. Examine the surviving mutants to find where to add exact assertions.',
        'Oft niedriger, als die Zeilenabdeckung vermuten lässt: Vom Agenten geschriebene Tests wiederholen gern das Verhalten des Codes und lassen Grenzen aus. Die überlebenden Mutanten zeigen, wo exakte Assertions fehlen.'),
    ],
    related: ['coverage', 'unit-tests', 'test-integrity', 'property-based-tests'],
  },
  {
    id: 'coverage',
    domain: { parts: ['tests', 'fee', 'cancel'], what: l('Coverage shows which lines of the fee code the tests run, and an untested `cancel`.', 'Coverage zeigt ausgeführte Zeilen der Gebührenberechnung und fehlende Testläufe für `cancel`.') },
    viz: { kind: 'pipeline', mode: 'coverage' },
    name: l('Coverage tests', 'Coverage (Testabdeckung)'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Coverage measures which lines and branches run during tests. It can show code that no test runs.', 'Coverage misst, welche Zeilen und Zweige bei einem Testlauf ausgeführt werden. Der Bericht zeigt auch Code, den kein Test ausführt.'),
    catches: l('completely untested code: forgotten error branches, dead features', 'Code, den kein Test ausführt, etwa ein Zweig für Fehler oder eine ungenutzte Funktion.'),
    intro: l(
      'All tests pass, but no test calls the function that cancels a reservation. Coverage can show that the function never ran. Coverage alone cannot show whether a test examines a result.',
      'Alle Tests bestehen. Kein Test ruft die Funktion zum Stornieren auf. Coverage zeigt, dass die Funktion im Testlauf nicht lief. Für die Prüfung des Ergebnisses brauchst du eine Assertion.',
    ),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('Coverage can show code that no test ran.', 'Coverage zeigt, welche Teile des Codes kein Test ausführt.'), l('Coverage for changed lines helps a reviewer find changes without tests.', 'Diff Coverage zeigt einem Reviewer geänderten Code ohne Testlauf.'),
      l('A coverage report can run on each pull request.', 'CI kann den Coverage-Bericht für jeden Pull Request erzeugen.'),
    ],
    limits: [l('A test can run a line without an assertion that checks its result.', 'Ein Test kann eine Zeile ausführen, ohne ihr Ergebnis mit einer Assertion zu prüfen.'), l('A coverage target can increase the number of executed lines without stronger assertions.', 'Eine Coverage-Vorgabe kann mehr ausgeführte Zeilen ergeben, ohne die Assertions zu verbessern.')],
    ai: l('A coding agent can reach a coverage target with weak assertions. Use coverage to find code that no test runs. Use mutation testing to examine the assertions.', 'Ein Coding-Agent kann eine Coverage-Vorgabe mit schwachen Assertions erreichen. Finde mit Coverage Code, den kein Test ausführt. Prüfe die Assertions mit Mutation Testing.'),
    evidence: {
      general: ev('moderate',
        f('inozemtseva2014', 'Across 31,000 test suites for five Java systems, coverage correlated only low to moderately with effectiveness once suite size was controlled.', 'Über 31.000 Testsuiten für fünf Java-Systeme korrelierte die Abdeckung nur schwach bis mäßig mit der Wirksamkeit, sobald die Suitegröße kontrolliert wurde.'),
        f('ivankovic2019', 'At Google coverage is widely adopted and developers find it useful in code review (adoption and perception data).', 'Bei Google ist Coverage weit verbreitet, und Entwickler finden sie im Code-Review nützlich (Nutzungs- und Wahrnehmungsdaten).')),
      ai: ev('moderate', f('foster2025', 'At Meta, 277 of 571 useful LLM-generated tests would have been discarded if line coverage had been the acceptance criterion.', 'Bei Meta wären 277 von 571 nützlichen LLM-generierten Tests verworfen worden, wäre Zeilenabdeckung das Abnahmekriterium gewesen.')),
    },
    tools: { php: ['php-code-coverage', 'phpunit'], js: ['c8', 'vitest'], python: ['coveragepy'], java: ['jacoco'], dotnet: ['coverlet'], go: ['go-cover'], rust: ['cargo-llvm-cov'], cpp: ['lcov'] },
    snippets: [{ lang: "js", file: "vitest.config.ts",
      enforcedBy: l('Vitest with `@vitest/coverage-v8` (`npx vitest run --coverage`) measures coverage and fails CI if it drops below `thresholds`.', 'Vitest mit `@vitest/coverage-v8` (`npx vitest run --coverage`) misst die Abdeckung und lässt CI unterhalb von `thresholds` fehlschlagen.'),
      description: l("Install matching versions of Vitest and `@vitest/coverage-v8`. Run `npx vitest run --coverage`. A branch without coverage can make the check fail. Use mutation testing to examine assertion quality.",
        "Installiere passende Versionen von Vitest und `@vitest/coverage-v8`. Führe `npx vitest run --coverage` aus. Ein Branch ohne Coverage kann den Lauf fehlschlagen lassen. Prüfe die Assertions mit Mutation Testing."),
      code: `import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/reserve.ts'],
      reporter: ['text', 'html'],
      thresholds: { statements: 90, branches: 90 },
    },
  },
});`, focus: [{ line: 6, note: l('Measure only the code you care about; including everything dilutes the number.', 'Nur den relevanten Code messen; alles einzubeziehen verwässert die Zahl.') }, { line: 7, note: l('The report lists the uncovered lines: use it to find untested paths, not to chase a percentage.', 'Der Report listet die ungedeckten Zeilen: Nutze ihn, um ungetestete Pfade zu finden, nicht um einer Prozentzahl nachzujagen.') }, { line: 8, note: l('The threshold fails the run when too little code executes. It shows what ran, not what was checked.', 'Die Schwelle lässt den Lauf scheitern, wenn zu wenig Code läuft. Sie zeigt, was lief, nicht was geprüft wurde.') }] }],
    steps: [l('Enable branch coverage. Generate a coverage report.', 'Aktiviere Branch Coverage. Erzeuge einen Bericht.'), l('Identify domain branches that no test runs. Add a test or remove the code for each branch.', 'Ermittle Zweige im Domain Code, die kein Test ausführt. Ergänze für jeden Zweig einen Test oder entferne den Code.'), l('Show coverage for changed lines in pull requests. Use the report without a repository-wide threshold.', 'Zeige die Coverage der geänderten Zeilen im Pull Request. Verwende dafür keinen Grenzwert für das ganze Repository.')],
    done: l('Each branch in the domain code either has a test or is removed. Pull requests show coverage for changed lines.', 'Jeder Zweig im Domain Code hat einen Test oder wurde entfernt. Pull Requests zeigen die Coverage für geänderte Zeilen.'),
    think: [
      q('Why is "coverage went down" a more useful signal than "coverage is 85%"?', 'Warum ist „Abdeckung ist gesunken“ ein nützlicheres Signal als „Abdeckung ist 85 %“?', 'A drop points at specific new code without tests. A global number hides where the gaps are and invites gaming.', 'Ein Rückgang zeigt auf konkreten neuen Code ohne Tests. Eine globale Zahl verbirgt, wo die Lücken sind, und lädt zum Schönen ein.'),
      q('100% branch coverage is reached. Which bug can still be there?', '100 % Branch Coverage sind erreicht. Welcher Fehler kann trotzdem noch drinstecken?',
        'A missing branch: the code that was never written, such as no handling for an already reserved pet. Coverage only measures the code that exists.',
        'Ein fehlender Zweig: Code, der nie geschrieben wurde, etwa keine Behandlung für ein bereits reserviertes Tier. Coverage misst nur den Code, der existiert.'),
      q('Predict: an agent is told "coverage must stay above 90%". What is the fastest way to comply?', 'Vorhersage: Ein Agent soll „die Abdeckung muss über 90 % bleiben“ einhalten. Was ist der schnellste Weg?',
        'Add tests that call code without asserting anything useful, or move code out of the measured paths. A coverage target alone gets gamed; pair it with mutation testing.',
        'Tests ergänzen, die Code aufrufen, ohne etwas Sinnvolles zu prüfen, oder Code aus den gemessenen Pfaden verschieben. Ein Abdeckungsziel allein wird ausgetrickst; kombiniere es mit Mutation Testing.'),
    ],
    related: ['mutation-tests', 'unit-tests', 'code-review'],
    sim: 'mutation',
  },
  {
    id: 'differential-testing',
    domain: { parts: ['voucher'], what: l('Old and new voucher pricing get the same random inputs.', 'Der Test führt beide Versionen der Gutscheinberechnung mit denselben erzeugten Eingaben aus.') },
    name: l('Differential testing', 'Differential Testing'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('Differential testing runs two implementations with the same inputs. The test reports differences between their results.', 'Differential Testing führt zwei Implementierungen mit denselben Eingaben aus. Der Test meldet Unterschiede zwischen den Ergebnissen.'),
    catches: l('behaviour changes in a refactoring or rewrite, disagreement with a reference implementation or standard', 'Verhaltensänderungen bei Refactoring oder Rewrite sowie Abweichungen von einer Referenz.'),
    intro: l(
      'A coding agent rewrites the fee calculation. Existing tests cover some combinations of species and age. Run both implementations with the same inputs. Compare their results.',
      'Ein Coding-Agent schreibt die Gebührenberechnung neu. Die Tests prüfen nur einige Kombinationen aus Tierart und Alter. Führe beide Versionen mit denselben Eingaben aus. Vergleiche die Ergebnisse.',
    ),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('A second implementation gives a result for comparison. You do not have to write the expected value for each input.', 'Eine zweite Implementierung liefert Vergleichswerte. Du brauchst keinen Erwartungswert für jede Eingabe.'),
      l('Use generated inputs or samples of production traffic for the comparison.', 'Verwende erzeugte Eingaben oder Stichproben aus Produktion für den Vergleich.'),
      l('A differential test can compare a verified Dafny model with production TypeScript.', 'Ein Differential Test kann ein verifiziertes Dafny-Modell mit Produktionscode in TypeScript vergleichen.'),
    ],
    limits: [
      l('Both implementations can give the same incorrect result.', 'Beide Implementierungen können dasselbe falsche Ergebnis liefern.'),
      l('Remove differences that are not relevant, such as timestamps. Record the reason for each expected difference.', 'Entferne Unterschiede ohne Bedeutung, etwa Zeitstempel. Begründe jede erwartete Abweichung.'),
    ],
    ai: l('Keep the old implementation when a coding agent rewrites a module. Run both versions on the same inputs. Give the differences to the coding agent.', 'Behalte die alte Version, wenn ein Coding-Agent ein Modul neu schreibt. Führe beide Versionen mit denselben Eingaben aus. Gib die Abweichungen an den Coding-Agenten.'),
    evidence: {
      general: ev('strong', f('csmith2011', 'Differential testing found more than 325 previously unknown defects in GCC and LLVM. Only the verified middle-end of CompCert produced no wrong-code defects in the study.', 'Differential Testing von C-Compilern fand über 325 unbekannte Fehler in GCC und LLVM; die verifizierte Mittelschicht von CompCert war der einzige Teil ohne Fehlübersetzungen.')),
      ai: ev('moderate', f('patchdiff2026', 'Differential patch testing showed that 29.6% of agent patches that pass the tests behave differently from the reference fix.', 'Differenzielles Patch-Testing zeigte, dass sich 29,6 % der Agenten-Patches, die die Tests bestehen, anders verhalten als die Referenzlösung.')),
    },
    tools: { php: ['eris', 'phpunit'], js: ['fast-check'], python: ['hypothesis'], java: ['jqwik'], go: ['rapid'], rust: ['proptest'], any: ['diffy'] },
    sim: 'differential',
    snippets: [{ lang: 'js', file: 'price.differential.test.ts', code: `import fc from 'fast-check';
import { priceCartOld } from './legacy/price';
import { priceCart } from './price';

test('new pricing agrees with the old one on every cart', () => {
  fc.assert(fc.property(arbitraryCart(), arbitraryVoucher(), (cart, voucher) => {
    expect(priceCart(cart, voucher)).toEqual(priceCartOld(cart, voucher));
  }), { numRuns: 5_000 });
});`, focus: [{ line: [2,3], note: l('Both implementations stay in the codebase during the refactor; the old one is your oracle.', 'Beide Implementierungen bleiben während des Refactorings im Code; die alte ist dein Orakel.') }, { line: 6, note: l('The generators decide how nasty the inputs are: include odd carts and unknown vouchers.', 'Die Generatoren bestimmen, wie fies die Eingaben sind: Nimm ungewöhnliche Warenkörbe und unbekannte Gutscheine auf.') }, { line: 7, note: l('Any input where old and new differ is a behaviour change you must explain or fix.', 'Jede Eingabe, bei der alt und neu abweichen, ist eine Verhaltensänderung, die du erklären oder beheben musst.') }, { line: 8, note: l('More runs widen the search; 5,000 is a budget, not a proof.', 'Mehr Läufe weiten die Suche aus; 5.000 sind ein Budget, kein Beweis.') }] },
      { lang: 'php', file: 'PriceComparisonTest.php', code: `<?php declare(strict_types=1);
use Eris\\Generators;
use Eris\\TestTrait;
use PHPUnit\\Framework\\TestCase;

final class PriceComparisonTest extends TestCase
{
    use TestTrait;

    public function testRefactorKeepsPrices(): void
    {
        $this->forAll(Generators::choose(0, 100000))
            ->then(function (int $cents): void {
                foreach (['', 'ADOPT10', 'adopt10'] as $voucher) {
                    self::assertSame(
                        oldPrice($cents, $voucher),
                        newPrice($cents, $voucher),
                    );
                }
            });
    }
}`, focus: [{ line: 12, note: l('Generated prices cover far more cents than hand-picked examples, including rounding edges.', 'Generierte Preise decken weit mehr Cent-Beträge ab als handverlesene Beispiele, auch Rundungsränder.') }, { line: 14, note: l('Voucher variants include a lowercase spelling: exactly the kind of case a refactor silently changes.', 'Gutschein-Varianten enthalten eine Kleinschreibung: genau der Fall, den ein Refactoring unbemerkt ändert.') }, { line: [16,17], note: l('Old and new must agree exactly; a difference is a regression or a deliberate change to document.', 'Alt und neu müssen exakt übereinstimmen; eine Abweichung ist eine Regression oder eine bewusste, zu dokumentierende Änderung.') }] },
    ],
    steps: [l('Keep the old implementation or a simple reference available to the test.', 'Halte die alte Implementierung oder eine einfache Referenz für den Test verfügbar.'), l('Write a property for generated inputs. Both implementations must give the same result or both must reject the input.', 'Schreibe eine Property für erzeugte Eingaben. Beide Versionen müssen dasselbe Ergebnis liefern oder beide müssen die Eingabe ablehnen.'), l('Record each permitted difference. Exclude only those differences from the comparison.', 'Erfasse jede zulässige Abweichung. Schließe nur diese Abweichungen vom Vergleich aus.')],
    done: l('The differential property passes at least 5,000 runs. The record gives a reason for each intentional difference.', 'Die Property für den Vergleich besteht mindestens 5.000 Läufe. Jeder beabsichtigte Unterschied ist mit Begründung dokumentiert.'),
    think: [
      q('Old and new pricing agree on 5,000 random carts. What could they still both get wrong?', 'Alte und neue Preisberechnung stimmen bei 5.000 Zufallswarenkörben überein. Was könnten beide trotzdem falsch machen?', 'Anything they share: the same wrong rounding rule, the same misunderstanding of a voucher. Agreement is evidence of equivalence, not of correctness.', 'Alles, was sie teilen: dieselbe falsche Rundungsregel, dasselbe Missverständnis eines Gutscheins. Übereinstimmung belegt Gleichwertigkeit, nicht Korrektheit.'),
      q('When can you not use differential testing?', 'Wann kannst du Differential Testing nicht einsetzen?',
        'When there is no second implementation or reference, for example a brand-new feature. Then you need an independent oracle: a spec, properties or hand-written expected values.',
        'Wenn es keine zweite Implementierung oder Referenz gibt, etwa bei einem ganz neuen Feature. Dann braucht es ein unabhängiges Orakel: eine Spezifikation, Properties oder von Hand geschriebene Erwartungswerte.'),
      q('Predict: you compare old and new search on random queries and they differ in the order of ties. Is that a bug?', 'Vorhersage: Du vergleichst alte und neue Suche mit zufälligen Anfragen, und sie unterscheiden sich in der Reihenfolge bei Gleichstand. Ist das ein Fehler?',
        'If the specification permits different orders for ties, sort the results before you compare them. You can also specify a tie-breaker.',
        'Nicht unbedingt. Legt die Spezifikation die Reihenfolge bei Gleichstand nicht fest, vergleicht man sortierte Ergebnisse oder ergänzt einen expliziten Tie-Breaker, statt den Unterschied als Fehler zu werten.'),
    ],
    related: ['tap-compare', 'shadowing', 'property-based-tests', 'refactoring'],
  },
  {
    id: 'benchmark-tests',
    domain: { parts: ['search'], what: l('A benchmark measures the pet search with 10 to 100,000 pets.', 'Ein Benchmark misst die Tiersuche mit 10 bis 100.000 Tieren.') },
    viz: { kind: 'load', mode: 'benchmark-tests' },
    name: l('Benchmark tests', 'Benchmarks'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('A benchmark measures how fast a small part of the code runs. Use the same conditions to compare it with a baseline.', 'Ein Benchmark misst die Laufzeit eines kleinen Codeabschnitts. Vergleiche den Messwert unter denselben Bedingungen mit einer Baseline.'),
    catches: l('performance regressions in hot code: an accidental O(n²), an allocation in a loop', 'Performance-Regressionen wie quadratische Laufzeit oder unnötige Allokationen in einer Schleife.'),
    intro: l(
      'A coding agent changes the search to compare each pet with every other pet. Tests with 50 pets pass. A benchmark can show how the change affects search time.',
      'Ein Coding-Agent ändert die Suche. Die Suche vergleicht jetzt jedes Tier mit jedem anderen Tier. Die Tests mit 50 Tieren bestehen. Ein Benchmark zeigt die Auswirkung auf die Laufzeit.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('A benchmark can detect a slower function before a load test runs.', 'Ein Benchmark kann eine langsamere Funktion vor dem Load Test erkennen.'), l('Benchmark tools can control warm-up and calculate statistics.', 'Benchmark-Tools können das Warm-up steuern und statistische Werte berechnen.'),
      l('Compare benchmark results between commits to identify when a regression started.', 'Vergleiche die Messwerte pro Commit. So kannst du den Beginn einer Regression ermitteln.'),
    ],
    limits: [
      l('Measurements on a shared CI machine can vary. Compare the relative change under the same conditions.', 'Messwerte auf gemeinsam genutzten CI-Systemen können schwanken. Vergleiche relative Änderungen unter gleichen Bedingungen.'),
      l('A benchmark of one function does not measure the behavior of the full system under load.', 'Ein Benchmark für eine einzelne Funktion misst das Verhalten des Gesamtsystems unter Last nicht.'),
    ],
    ai: l('A change can pass functional tests and still increase runtime. Set a benchmark threshold so the coding agent can check for a performance regression.', 'Eine Änderung kann alle Functional Tests bestehen und die Laufzeit erhöhen. Setze einen Grenzwert für den Benchmark. Der Coding-Agent kann damit eine Performance-Regression erkennen.'),
    evidence: { general: ev('weak', f('jin2012', 'A study of 109 real performance bugs showed recurring patterns; rules extracted from 25 fixes found 332 previously unknown performance problems.', 'Eine Studie über 109 echte Performancefehler zeigte wiederkehrende Muster; aus 25 Korrekturen abgeleitete Regeln fanden 332 unbekannte Performanceprobleme.')), ai: none() },
    tools: { php: ['phpbench'], js: ['tinybench', 'vitest'], python: ['pytest-benchmark'], java: ['jmh'], dotnet: ['benchmarkdotnet'], go: ['go-bench'], rust: ['criterion'], cpp: ['google-benchmark'], any: ['hyperfine'] },
    snippets: [{ lang: "js", file: "reserve.bench.mjs",
      description: l("Install tinybench. Run `node reserve.bench.mjs`. Compare the same workload before and after a change. The benchmark measures lookup time in existing collections. It does not include index construction or database latency.",
        "Installiere tinybench. Führe `node reserve.bench.mjs` aus. Vergleiche denselben Workload vor und nach der Änderung. Der Benchmark misst Lookups in vorhandenen Collections. Indexaufbau und Datenbanklatenz bleiben außerhalb der Messung."),
      code: `import { Bench } from 'tinybench';
const bench = new Bench({ time: 100 });
const ids = Array.from({ length: 10_000 }, (_, i) => \`pet-\${i}\`);
bench.add('look up the last pet with an array', () => {
  if (!ids.includes('pet-9999')) throw new Error('missing pet');
});
const index = new Set(ids);
bench.add('look up the last pet with a set', () => {
  if (!index.has('pet-9999')) throw new Error('missing pet');
});
await bench.run();
console.table(bench.table());`, focus: [{ line: 3, note: l('Realistic data size matters: array and set only differ noticeably at scale.', 'Eine realistische Datenmenge zählt: Array und Set unterscheiden sich erst bei großer Menge spürbar.') }, { line: 5, note: l('The throw ensures the lookup really works, so you never time a broken or optimised-away operation.', 'Das throw stellt sicher, dass die Suche wirklich funktioniert, sodass du keine kaputte oder wegoptimierte Operation misst.') }, { line: 7, note: l('The index is built outside the timed function, so only the lookup is compared.', 'Der Index wird außerhalb der gemessenen Funktion gebaut, sodass nur die Suche verglichen wird.') }, { line: 12, note: l('Compare the table across runs and machines; a single number says little.', 'Vergleiche die Tabelle über Läufe und Rechner hinweg; eine einzelne Zahl sagt wenig.') }] }],
    steps: [
      l('Select two or three functions that use the most runtime. Use representative input sizes in the benchmarks. Include a large input.', 'Wähle zwei oder drei Funktionen mit hoher Laufzeit. Verwende repräsentative Eingabegrößen. Nimm eine große Eingabe auf.'), l('Record a baseline. Set the permitted percentage increase in runtime. Make the benchmark fail above this limit on the same machine.', 'Erfasse eine Baseline. Lege fest, um wie viel Prozent die Laufzeit steigen darf. Lass den Benchmark oberhalb dieser Grenze fehlschlagen.'),
      l('Use the same machine type and runtime version. Repeat each measurement before you compare the results.', 'Verwende denselben Maschinentyp und dieselbe Runtime-Version. Wiederhole jede Messung vor dem Vergleich.'),
    ],
    done: l('You can reproduce the benchmark results. The benchmark reports a performance regression when the search uses the test implementation with quadratic time.', 'Die Messwerte sind reproduzierbar. Der Benchmark meldet eine Regression, wenn der Testcode eine quadratische Laufzeit verursacht.'),
    think: [
      q('Your search benchmark uses 10 pets. Why might it miss the regression that hurts production?', 'Dein Such-Benchmark nutzt 10 Tiere. Warum übersieht er womöglich die Regression, die in Produktion weh tut?', 'At n = 10, O(n) and O(n²) look the same. Benchmark at production sizes, or at several sizes to see the growth curve.', 'Bei n = 10 sehen O(n) und O(n²) gleich aus. In Produktionsgrößen messen, oder in mehreren Größen, um die Wachstumskurve zu sehen.'),
      q('Which performance problem will a function-level benchmark never show?', 'Welches Performanceproblem zeigt ein Benchmark auf Funktionsebene nie?',
        'Problems between components: an N+1 query pattern, a slow network hop, lock contention under parallel requests. Those need performance or load tests of the whole system.',
        'Probleme zwischen Komponenten: ein N+1-Query-Muster, ein langsamer Netzwerksprung, Lock-Konflikte bei parallelen Requests. Dafür braucht es Performance- oder Lasttests des Gesamtsystems.'),
      q('Predict: an agent "optimises" the pet search and the benchmark gets 3x faster. What else should you check?', 'Vorhersage: Ein Agent „optimiert“ die Tiersuche, und der Benchmark wird dreimal schneller. Was solltest du außerdem prüfen?',
        'That the results are still the same: it may have dropped a filter or cached a stale answer. Run the correctness tests, or a differential test against the old version.',
        'Dass die Ergebnisse noch dieselben sind: Es kann einen Filter weggelassen oder eine veraltete Antwort gecacht haben. Die Korrektheitstests oder einen Differential Test gegen die alte Version ausführen.'),
    ],
    related: ['performance-tests', 'load-tests', 'profiling'],
  },
  {
    id: 'performance-tests',
    domain: { parts: ['api', 'search'], what: l('The test measures the p95 latency of the pet list with realistic data.', 'Der Test misst die p95-Latenz der Tierliste mit realistischen Daten.') },
    viz: { kind: 'load', mode: 'performance-tests' },
    name: l('Performance tests', 'Performancetests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('A performance test measures system speed and resource use under a specified workload. Compare the measurements with the targets.', 'Ein Performance Test misst Laufzeit und Ressourcenverbrauch unter einer definierten Last. Vergleiche die Messwerte mit den Zielwerten.'),
    catches: l('slow endpoints, N+1 queries, memory growth, missing indexes', 'Langsame Endpoints, N+1-Abfragen, steigender Speicherverbrauch und fehlende Indizes.'),
    intro: l(
      'The pet list loads quickly with 20 pets. With 50,000 pets, a page takes three seconds to load. A performance test uses realistic data and checks a target such as p95 latency below 200 ms.',
      'Mit 20 Tieren lädt die Liste schnell. Mit 50.000 Tieren dauert ein Seitenaufruf drei Sekunden. Ein Performance Test verwendet realistische Daten und prüft einen Zielwert, etwa p95 unter 200 ms.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('A performance test compares measurements with a target, such as p95 latency below 200 ms.', 'Ein Performance Test vergleicht Messwerte mit einem Zielwert, etwa p95 unter 200 ms.'), l('A test at production scale can show problems that occur only with large data sets.', 'Ein Test mit Daten in Produktionsgröße kann Fehler zeigen, die erst bei großen Datenmengen auftreten.'),
      l('A threshold makes the test fail when a change increases runtime beyond the limit.', 'Eine Grenze lässt den Test fehlschlagen, wenn die Laufzeit zu stark steigt.'),
    ],
    limits: [
      l('Use data and an environment similar to production.', 'Verwende Daten und eine Umgebung, die der Produktion ähneln.'),
      l('A small test database can hide the effect of a missing index.', 'Eine kleine Testdatenbank kann die Auswirkung eines fehlenden Index verdecken.'),
    ],
    ai: l('Give the coding agent a numeric target and a command to run the test. For example, require p95 latency below 200 ms in the k6 script.', 'Gib dem Coding-Agenten einen Zielwert und einen Prüfbefehl. Lege zum Beispiel im k6-Skript eine p95-Latenz unter 200 ms fest.'),
    evidence: { general: ev('weak', f('jin2012', 'Performance bugs follow recurring patterns that can be checked for automatically (bug study, not an effect study of performance testing).', 'Performancefehler folgen wiederkehrenden Mustern, die sich automatisch prüfen lassen (Fehlerstudie, keine Wirkungsstudie zu Performancetests).')), ai: none() },
    tools: { any: ['k6', 'locust', 'gatling', 'hyperfine'] },
    snippets: [{ lang: "any", file: "latency.js",
      description: l("Run `k6 run -e BASE_URL=http://localhost:3000 latency.js` against your test deployment. Add a delay above 500 ms. The test must report that the p95 result exceeds the limit. Set the endpoint and budget for your service.",
        "Führe `k6 run -e BASE_URL=http://localhost:3000 latency.js` gegen das Test-Deployment aus. Füge mehr als 500 ms Latenz hinzu. Der p95-Wert muss den Grenzwert überschreiten. Lege den Endpoint und den Grenzwert für deinen Service fest."),
      code: `import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  vus: 1, duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};
export default function () {
  http.get(\`\${__ENV.BASE_URL}/pets/rex\`);
  sleep(1);
}`, focus: [{ line: 4, note: l('One virtual user for 30 seconds: this measures a latency baseline, not capacity.', 'Ein virtueller Nutzer für 30 Sekunden: Das misst eine Latenz-Basislinie, keine Kapazität.') }, { line: 6, note: l('The p95 threshold makes a slow change fail CI instead of being noticed by users.', 'Die p95-Schwelle lässt eine langsame Änderung in der CI scheitern, statt dass Nutzer sie bemerken.') }, { line: 7, note: l('Fast but failing is not fast: errors are a threshold too.', 'Schnell, aber fehlerhaft ist nicht schnell: Auch Fehler sind eine Schwelle.') }] }],
    steps: [
      l('Set targets for latency, error rate and throughput for the critical endpoints.', 'Lege Grenzwerte für Latenz, Fehlerrate und Durchsatz der kritischen Endpoints fest.'), l('Write a script for the workload. Run it in an environment similar to production. Set limits that make the run fail.', 'Schreibe ein Skript für die Last. Führe es in einer produktionsähnlichen Umgebung aus. Lege Grenzwerte fest, bei denen der Test fehlschlägt.'),
      l('Prepare the environment with anonymized data at production scale. Record the result for each release.', 'Verwende anonymisierte Daten in Produktionsgröße. Halte das Ergebnis für jedes Release fest.'),
    ],
    done: l('The performance script has specified thresholds. The script fails when a result does not meet a target.', 'Das Skript enthält feste Grenzwerte. Der Performance Test schlägt fehl, wenn ein Messwert seinen Grenzwert verletzt.'),
    think: [
      q('Why measure p95 or p99 instead of the average?', 'Warum p95 oder p99 statt des Durchschnitts messen?', 'The average hides the slow requests, and real users notice the slow ones. With many requests per page, almost every user hits the tail.', 'Der Durchschnitt versteckt die langsamen Anfragen, und echte Nutzer merken die langsamen. Bei vielen Anfragen pro Seite trifft fast jeder Nutzer das Ende der Verteilung.'),
      q('Which bug does a passing performance test not exclude?', 'Welchen Fehler schließt ein bestandener Performance-Test nicht aus?',
        'A fast wrong answer, or a race that appears only with real concurrency patterns. Speed targets do not check correctness.',
        'Eine schnelle falsche Antwort oder eine Race Condition, die nur bei echten Nebenläufigkeitsmustern auftritt. Geschwindigkeitsziele prüfen keine Korrektheit.'),
      q('Predict: an agent replaces a loop of 20 database calls with one call per pet, inside the listing endpoint. What happens with 500 pets?', 'Vorhersage: Ein Agent ersetzt in der Listenansicht eine Schleife mit 20 Datenbankaufrufen durch einen Aufruf pro Tier. Was passiert bei 500 Tieren?',
        '501 queries per request instead of a handful (N+1). With 20 test pets it looks fine; only data of production size and a latency threshold show it.',
        '501 Queries pro Request statt weniger (N+1). Mit 20 Testtieren sieht es gut aus; erst produktionsgroße Daten und ein Latenz-Schwellwert zeigen es.'),
    ],
    related: ['benchmark-tests', 'load-tests', 'soak-tests', 'profiling'],
  },
  {
    id: 'load-tests',
    domain: { parts: ['api', 'db', 'never-twice'], what: l('Many users reserve at once: latency, errors and no pet reserved twice.', 'Der Load Test misst Latenz und Fehler bei gleichzeitigen Reservierungen und prüft auf Doppelreservierungen.') },
    viz: { kind: 'load', mode: 'load-tests' },
    name: l('Load tests', 'Lasttests'),
    layer: 'static',
    phases: ['deploy'],
    fromOverview: true,
    oneLiner: l('A load test sends a specified traffic volume to a deployed system. It shows how the system behaves as traffic increases.', 'Ein Load Test sendet eine festgelegte Menge an Requests an ein bereitgestelltes System. Der Test zeigt das Verhalten bei steigender Last.'),
    catches: l('capacity limits, connection-pool exhaustion, lock contention, autoscaling that reacts too late', 'Kapazitätsgrenzen, erschöpfte Connection Pools, Lock-Konflikte und verspätetes Autoscaling.'),
    intro: l(
      'On adoption day, 1,000 people open the petstore at the same time. The site slows down, and two people reserve the same pet. A load test can show these problems before the event.',
      'Am Adoptionstag öffnen 1.000 Personen gleichzeitig den Petstore. Die Seite wird langsam. Zwei Personen reservieren dasselbe Tier. Ein Load Test kann diese Probleme vor dem Termin zeigen.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('A load test measures how much more traffic the system can accept before a limit is reached.', 'Ein Load Test misst, wie viel Traffic das System bis zum Grenzwert verarbeiten kann.'), l('A concurrency defect can occur only when several requests overlap.', 'Ein Nebenläufigkeitsfehler kann erst auftreten, wenn mehrere Requests gleichzeitig laufen.'),
      l('The test can show which resource reaches its limit first, such as connections, CPU or locks.', 'Der Test zeigt, welche Ressource zuerst ihre Grenze erreicht. Beispiele sind Verbindungen, CPU und Locks.'),
    ],
    limits: [
      l('Synthetic and production traffic can differ. Use shadowing or canary releases to examine live traffic.', 'Synthetischer Traffic kann vom Produktions-Traffic abweichen. Verwende Shadow Deployments oder Canary Releases für echte Requests.'),
      l('A load test needs an environment and data that represent production.', 'Ein Load Test braucht Daten und eine Umgebung, die der Produktion ähneln.'),
    ],
    ai: l('A coding agent can leave a connection pool open. A load test in the deployment pipeline can show the effect under sustained traffic.', 'Ein Coding-Agent kann einen Connection Pool offen lassen. Ein Load Test in der Deploy-Pipeline kann die Auswirkung unter Last zeigen.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['k6', 'locust', 'gatling', 'vegeta'] },
    snippets: [{ lang: 'js', file: 'reserve-load.js', code: `// k6 run reserve-load.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [{ duration: '2m', target: 200 }, { duration: '5m', target: 200 }],
  thresholds: { http_req_duration: ['p(95)<300'], http_req_failed: ['rate<0.01'] },
};

export default function () {
  const res = http.post(
    \`\${__ENV.BASE_URL}/api/reservations\`,
    JSON.stringify({ petId: 'rex', person: \`u\${__VU}\` }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(res, { 'reserved or taken, never 5xx': (r) => r.status === 201 || r.status === 409 });
}`, focus: [{ line: 6, note: l('Ramp up, then hold: the plateau is where queues, pools and locks show their limits.', 'Hochfahren und halten: Auf dem Plateau zeigen Warteschlangen, Pools und Locks ihre Grenzen.') }, { line: 7, note: l('These thresholds define "done": under load, p95 stays below 300 ms and almost nothing fails.', 'Diese Schwellen definieren „fertig“: Unter Last bleibt p95 unter 300 ms und fast nichts schlägt fehl.') }, { line: 13, note: l('All users compete for the same pet: that contention is what a double reservation needs.', 'Alle Nutzer konkurrieren um dasselbe Tier: Genau diese Konkurrenz braucht eine Doppelreservierung.') }, { line: 16, note: l('Both 201 and 409 are correct answers; a 5xx under contention is the bug.', '201 und 409 sind beide richtige Antworten; ein 5xx unter Konkurrenz ist der Fehler.') }] }],
    steps: [l('Write a script for the main user task. Use representative data and delays between actions.', 'Schreibe ein Skript für den wichtigsten Nutzerablauf. Verwende typische Daten und Pausen zwischen den Aktionen.'), l('Increase the traffic in staging to twice the expected peak. Set limits for latency and errors.', 'Erhöhe den Traffic in Staging bis auf das Doppelte der erwarteten Spitze. Lege Grenzwerte für Latenz und Fehler fest.'), l('After the run, check the data invariants. For example, each pet must have at most one active reservation.', 'Prüfe nach dem Lauf die Invariants. Jedes Tier darf zum Beispiel höchstens eine aktive Reservierung haben.')],
    done: l('At twice the expected peak load, the results meet the thresholds. After the run, the reservation invariant still holds.', 'Der Load Test hält bei doppelter Spitzenlast alle Grenzwerte ein. Nach dem Lauf hat jedes Tier höchstens eine aktive Reservierung.'),
    think: [
      q('200 users all reserve Rex at once. Your API returns 201 to two of them. Which earlier layer should have caught this?', '200 Nutzer reservieren gleichzeitig Rex. Die API antwortet zweien mit 201. Welche frühere Schicht hätte das fangen sollen?', 'An integration test with two concurrent requests, or a TLA+ model of the protocol. Load testing found it, but late and expensively.', 'Ein Integrationstest mit zwei gleichzeitigen Anfragen oder ein TLA+-Modell des Protokolls. Der Lasttest hat es gefunden, aber spät und teuer.'),
      q('When is a load test the wrong place to look for a bug?', 'Wann ist ein Lasttest der falsche Ort, um einen Fehler zu suchen?',
        'When the bug does not depend on load, such as a wrong discount. It is slow and expensive; a unit or property test finds it in seconds.',
        'Wenn der Fehler nicht von Last abhängt, etwa ein falscher Rabatt. Der Lasttest ist langsam und teuer; ein Unit- oder Property-Test findet ihn in Sekunden.'),
      q('Predict: the load test uses the same pet for every virtual user. What does it show about double booking?', 'Vorhersage: Der Lasttest nutzt für jeden virtuellen Nutzer dasselbe Tier. Was zeigt er über Doppelbuchungen?',
        'It provokes them on purpose, which is useful for the invariant check. But it says little about normal traffic, where users pick different pets; run both scenarios.',
        'Er provoziert sie absichtlich, was für die Invariantenprüfung nützlich ist. Über normalen Verkehr sagt er wenig, bei dem Nutzer verschiedene Tiere wählen; beide Szenarien fahren.'),
    ],
    related: ['performance-tests', 'soak-tests', 'formal-verification', 'integration-tests'],
  },
  {
    id: 'soak-tests',
    domain: { parts: ['api', 'reserve'], what: l('The test watches memory for 24 hours while people reserve pets.', 'Der Soak Test misst den Speicherverbrauch während 24 Stunden mit Reservierungen.') },
    viz: { kind: 'load', mode: 'soak-tests' },
    name: l('Soak tests', 'Dauerlasttests (Soak)'),
    layer: 'static',
    phases: ['deploy'],
    fromOverview: true,
    oneLiner: l('A soak test runs a steady load for hours or days. It can find problems that become visible over time.', 'Ein Soak Test hält die Last über Stunden oder Tage konstant. Der Test kann Fehler zeigen, die erst nach längerer Zeit auftreten.'),
    catches: l('memory leaks, growing queues, disk filling up, connection leaks, slow degradation', 'Speicher- und Connection Leaks, wachsende Queues, voller Speicherplatz und steigende Latenz.'),
    intro: l(
      'The petstore operates for two days and fails on the third day. Each reservation leaves an object in memory. A soak test shows how memory use increases over time.',
      'Der Petstore läuft zwei Tage und fällt am dritten Tag aus. Jede Reservierung lässt ein Objekt im Speicher zurück. Ein Soak Test zeigt den Anstieg des Speicherverbrauchs.',
    ),
    cost: 3,
    feedback: 'days',
    worth: [
      l('A long test can show a leak that a five-minute load test does not detect.', 'Ein Soak Test kann ein Leck zeigen, das ein Load Test von fünf Minuten nicht erkennt.'),
      l('A soak test can show problems with token expiration, log rotation, scheduled jobs and cache eviction.', 'Der Test kann Fehler bei Token-Ablauf, Log Rotation, geplanten Jobs und Cache Eviction zeigen.'),
      l('The test can show an increase in memory use, file handles or database connections over days.', 'Der Test kann zeigen, wie Speicherverbrauch, offene File Handles oder Verbindungen über Tage zunehmen.'),
    ],
    limits: [
      l('A soak test takes hours or days. Run it before major releases.', 'Ein Soak Test dauert Stunden oder Tage. Führe ihn vor wichtigen Releases aus.'),
      l('A deployment during the test can affect the results. Keep the environment stable for the test period.', 'Ein Deploy während des Tests kann die Messwerte verändern. Halte die Umgebung für die Testdauer stabil.'),
    ],
    ai: l('A short check can miss a memory leak. Use a soak test or production monitoring to measure memory use over time.', 'Ein kurzer Test kann ein Speicherleck übersehen. Miss den Speicherverbrauch mit einem Soak Test oder mit Monitoring in Produktion.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['k6', 'locust', 'gatling', 'prometheus'] },
    snippets: [{ lang: "any", file: "soak.js",
      description: l("Run `k6 run -e BASE_URL=http://localhost:3000 soak.js` in an isolated environment. Measure memory use, open connections and latency for two hours. Use memory measurements from the service to examine a possible leak.",
        "Führe `k6 run -e BASE_URL=http://localhost:3000 soak.js` in einer isolierten Umgebung aus. Miss Speicherverbrauch, offene Verbindungen und Latenz zwei Stunden lang. Untersuche mögliche Speicherlecks anhand der Messwerte des Service."),
      code: `import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  scenarios: { steady: {
    executor: 'constant-vus', vus: 5, duration: '2h',
  } },
  thresholds: { http_req_failed: ['rate<0.01'] },
};
export default function () {
  http.get(\`\${__ENV.BASE_URL}/pets/rex\`);
  sleep(1);
}`, focus: [{ line: 4, note: l('Constant VUs keep the load flat, so any trend in the metrics comes from the system, not the test.', 'Konstante VUs halten die Last gleich, sodass jeder Trend in den Metriken vom System kommt, nicht vom Test.') }, { line: 5, note: l('Two hours at modest load: leaks and slow degradation only show up with time, not volume.', 'Zwei Stunden bei mäßiger Last: Lecks und schleichende Verschlechterung zeigen sich erst mit der Zeit, nicht durch Menge.') }, { line: 7, note: l('The error threshold must hold at hour two as well as minute one.', 'Die Fehlerschwelle muss in Stunde zwei genauso halten wie in Minute eins.') }] }],
    steps: [
      l('Run the load script at approximately 60% of peak for 12 to 24 hours.', 'Führe den Load Test 12 bis 24 Stunden lang mit ungefähr 60 % der Spitzenlast aus.'), l('Record memory use, open connections, queue length and latency. Fail the test if a metric continues to increase.', 'Erfasse Speicherverbrauch, offene Verbindungen, Länge der Queue und Latenz. Lass den Test bei einem stetigen Anstieg fehlschlagen.'),
      l('Compare the measurements at the start and end of the run. Use a heap snapshot or profile to find the cause of each trend.', 'Vergleiche die Messwerte zu Beginn und am Ende. Untersuche Abweichungen mit einem Heap Snapshot oder Profil.'),
    ],
    done: l('Resource measurements stay constant during the test, or the report gives a cause for each trend.', 'Die Messwerte für Ressourcen bleiben konstant. Für jede Abweichung nennt der Bericht die Ursache.'),
    think: [
      q('Memory grows 1 MB per hour. Why does that matter if the server has 8 GB?', 'Der Speicher wächst 1 MB pro Stunde. Warum ist das wichtig, wenn der Server 8 GB hat?', 'It does not, for a year. But a leak per request grows with traffic: 1 MB/hour at low load can be 1 GB/hour at peak.', 'Ein Jahr lang nicht. Aber ein Leck pro Anfrage wächst mit dem Verkehr: 1 MB/Stunde bei wenig Last kann 1 GB/Stunde zur Spitze sein.'),
      q('What changes when an agent adds a cache or a queue?', 'Was ändert sich, wenn ein Agent einen Cache oder eine Queue ergänzt?',
        'These are exactly the places where unbounded growth hides. A soak test after such a change checks size limits and eviction, which functional tests never exercise.',
        'Genau dort versteckt sich unbegrenztes Wachstum. Ein Soak Test nach einer solchen Änderung prüft Größenlimits und Verdrängung, was funktionale Tests nie ausführen.'),
      q('Predict: a handler keeps every reservation in an in-memory list "for the audit log". What does the soak test show after 12 hours?', 'Vorhersage: Ein Handler hält jede Reservierung „fürs Audit-Log“ in einer In-memory-Liste. Was zeigt der Soak Test nach 12 Stunden?',
        'Memory rising in a straight line, and later garbage collection pauses and rising latency. A 5-minute load test would show nothing.',
        'Speicher, der linear steigt, und später Garbage-Collection-Pausen und steigende Latenz. Ein 5-Minuten-Lasttest würde nichts zeigen.'),
    ],
    related: ['load-tests', 'monitoring', 'profiling'],
  },
  {
    id: 'config-tests',
    domain: { parts: ['config', 'rollout'], what: l('A policy checks the Kubernetes manifest, for example `replicas: 0`.', 'Eine Policy prüft Werte im Kubernetes-Manifest wie `replicas: 0`.') },
    viz: { kind: 'pipeline', mode: 'config-tests' },
    name: l('Config tests', 'Konfigurationstests'),
    layer: 'static',
    phases: ['deploy'],
    fromOverview: true,
    oneLiner: l('A configuration test checks configuration against a schema or policy before the configuration goes into use.', 'Ein Configuration Test prüft Einstellungen vor dem Einsatz. Er vergleicht sie mit einem Schema oder einer Policy.'),
    catches: l('typos in keys, wrong types, missing limits, open security groups, a timeout of 0', 'Falsche Schlüssel oder Typen, fehlende Limits, offene Security Groups und ungültige Timeouts.'),
    intro: l(
      'A coding agent sets `replicas: 0` in a Kubernetes manifest. The manifest is valid YAML. The deployment succeeds, but no petstore server runs. A policy check can reject the value before deployment.',
      'Ein Coding-Agent setzt `replicas: 0` in einem Kubernetes-Manifest. Das YAML ist gültig. Der Deploy gelingt. Anschließend läuft kein Petstore-Server. Ein Policy Check kann den Wert vor dem Deploy ablehnen.',
    ),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('Configuration errors can cause outages. A config test can find some of these errors before deployment.', 'Konfigurationsfehler können Ausfälle verursachen. Configuration Tests können einige dieser Fehler vor dem Deploy erkennen.'), l('A schema or policy check can run quickly.', 'Ein Schema Check oder Policy Check kann schnell laufen.'),
      l('The same checks apply to configuration from people and coding agents.', 'Dieselben Checks gelten für Konfigurationen von Menschen und Coding-Agenten.'),
    ],
    limits: [
      l('A configuration can pass a schema check and still cause a failure. Test it with the application.', 'Eine Konfiguration kann das Schema erfüllen und einen Fehler verursachen. Teste die Einstellungen mit der Anwendung.'),
      l('Update policies when project requirements change.', 'Aktualisiere Policies, wenn sich Anforderungen ändern.'),
    ],
    ai: l('Apply schema checks and policy checks to configuration changes from coding agents. Test changed settings in the service. Use a security scan to find exposed credentials.', 'Führe Schema Checks und Policy Checks für Konfigurationsänderungen aus. Teste die geänderten Einstellungen mit dem Service. Suche mit Security Scanning nach Secrets.'),
    evidence: {
      general: ev('moderate', f('sun2020ctest', 'Connecting configuration values to existing tests ("ctests") caught real failure-inducing configuration changes before deployment.', 'Konfigurationswerte mit bestehenden Tests zu verbinden („ctests“) fing echte fehlerauslösende Konfigurationsänderungen vor dem Deployment.')),
      ai: none(),
    },
    tools: { any: ['conftest', 'kubeconform', 'checkov', 'cue'] },
    snippets: [{ lang: 'any', file: 'policy/deployment.rego',
      enforcedBy: l('Conftest (Open Policy Agent / Rego) evaluates this file via `conftest test k8s/*.yaml` and fails CI when a `deny` rule matches; Kubernetes admission controllers can enforce similar policies at deploy time.', 'Conftest (Open Policy Agent / Rego) wertet diese Datei über `conftest test k8s/*.yaml` aus und lässt CI bei einem Treffer einer `deny`-Regel fehlschlagen; Kubernetes Admission Controller können ähnliche Policies beim Deploy erzwingen.'),
      code: `package main

deny contains msg if {
  input.kind == "Deployment"
  some c in input.spec.template.spec.containers
  not c.resources.limits.memory
  msg := sprintf("container %s has no memory limit", [c.name])
}
# conftest test k8s/*.yaml`, focus: [{ line: 3, note: l('A deny rule turns a policy into a failing check, so a bad manifest cannot merge.', 'Eine deny-Regel macht aus einer Richtlinie eine fehlschlagende Prüfung, sodass ein schlechtes Manifest nicht gemergt wird.') }, { line: 6, note: l('Fires when the limit is missing: the unsafe default that otherwise lets one container eat the node.', 'Greift, wenn das Limit fehlt: der unsichere Default, mit dem sonst ein Container den ganzen Node auffrisst.') }, { line: 7, note: l('The message names the container and the problem, so the fix is obvious from the CI log.', 'Die Meldung nennt Container und Problem, sodass der Fix aus dem CI-Log offensichtlich ist.') }, { line: 9, note: l('Run this in CI against the files you actually deploy.', 'Führe das in der CI gegen die Dateien aus, die du tatsächlich ausrollst.') }] }],
    steps: [l('Validate each configuration file against a schema in CI.', 'Prüfe jede Konfigurationsdatei in CI gegen ein Schema.'), l('Add three to five policies for problems that occurred before. Examples include memory limits, storage access and timeouts.', 'Schreibe drei bis fünf Policies für bekannte Probleme. Beispiele sind Speicherlimits, Zugriffsregeln für Buckets und Timeouts.'), l('Start the application with the configuration during a test. Make the test fail if the configuration has an unknown key.', 'Starte die Anwendung im Test mit der Konfiguration. Lass den Test bei einem unbekannten Schlüssel fehlschlagen.')],
    done: l('CI checks configuration changes against the schema and policy. An unknown key or a missing limit makes the build fail.', 'CI prüft jede Änderung gegen Schema und Policy. Ein unbekannter Schlüssel oder ein fehlendes Limit lässt den Build fehlschlagen.'),
    think: [
      q('Why are configuration changes so often the cause of outages?', 'Warum sind Konfigurationsänderungen so oft die Ursache von Ausfällen?', 'They take effect everywhere at once, skip the tests that code goes through, and feel "small". A one-character change can disable every check.', 'Sie wirken überall gleichzeitig, umgehen die Tests, die Code durchläuft, und fühlen sich „klein“ an. Eine Änderung um ein Zeichen kann jede Prüfung abschalten.'),
      q('Which configuration problem does schema validation not find?', 'Welches Konfigurationsproblem findet die Schema-Validierung nicht?',
        'A valid but wrong value: a database URL pointing at production from staging, or a timeout that fits the schema yet is far too long. Those need policy checks and environment-specific tests.',
        'Einen gültigen, aber falschen Wert: eine Datenbank-URL, die vom Staging auf Produktion zeigt, oder ein Timeout, der zum Schema passt, aber viel zu lang ist. Dafür braucht es Policy-Prüfungen und umgebungsspezifische Tests.'),
      q('Predict: a typo in a config key (`maxReservationn`) is silently ignored by the app. What happens?', 'Vorhersage: Ein Tippfehler in einem Config-Schlüssel (`maxReservationn`) wird von der App stillschweigend ignoriert. Was passiert?',
        'The default value applies and nobody notices. Reject unknown keys at startup and validate against a schema in CI.',
        'Der Standardwert gilt, und niemand bemerkt es. Unbekannte Schlüssel beim Start ablehnen und in der CI gegen ein Schema validieren.'),
    ],
    related: ['feature-flags', 'security-scanning', 'canarying'],
  },
];
