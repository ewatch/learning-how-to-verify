import type { Practice } from '../types';
import { ev, f, l, none, q } from './_h';

export const staticDeep: Practice[] = [
  {
    id: 'property-based-tests',
    name: l('Property-based tests', 'Property-Based Testing'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('State a rule that must hold for all inputs; the tool generates hundreds of inputs and shrinks any failure to the smallest example.', 'Eine Regel formulieren, die für alle Eingaben gelten muss; das Werkzeug erzeugt Hunderte Eingaben und schrumpft jeden Fehlschlag auf das kleinste Beispiel.'),
    catches: l('edge cases nobody wrote an example for: empty lists, zero, rounding, unusual orderings, interleavings', 'Randfälle, für die niemand ein Beispiel schrieb: leere Listen, Null, Rundung, ungewöhnliche Reihenfolgen, Verschränkungen'),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('One property replaces dozens of examples and finds the ones you did not think of.', 'Eine Eigenschaft ersetzt Dutzende Beispiele und findet die, an die man nicht dachte.'),
      l('Shrinking turns a random failure into a minimal, readable counterexample.', 'Shrinking macht aus einem zufälligen Fehlschlag ein minimales, lesbares Gegenbeispiel.'),
      l('Typical properties: round-trip (`parse(print(x)) = x`), invariants (sum of shares = total), model comparison (fast code = simple code).', 'Typische Eigenschaften: Round-Trip (`parse(print(x)) = x`), Invarianten (Summe der Anteile = Gesamt), Modellvergleich (schneller Code = einfacher Code).'),
    ],
    limits: [
      l('Finding good properties takes practice; writing generators for complex data takes effort.', 'Gute Eigenschaften zu finden braucht Übung; Generatoren für komplexe Daten kosten Aufwand.'),
      l('Random search, not proof: a rare bug may not be hit in 100 runs.', 'Zufallssuche, kein Beweis: Ein seltener Fehler wird in 100 Läufen vielleicht nicht getroffen.'),
    ],
    ai: l(
      'Properties solve the "agent wrote both code and expected values" problem: you do not need the right answer, only a rule the answer must obey. Shrunk counterexamples are excellent feedback for an agent.',
      'Eigenschaften lösen das Problem „der Agent schrieb Code und Erwartungswerte“: Man braucht nicht die richtige Antwort, nur eine Regel, der sie gehorchen muss. Geschrumpfte Gegenbeispiele sind ausgezeichnetes Feedback für einen Agenten.',
    ),
    evidence: {
      general: ev('weak',
        f('goldstein2024', 'Interviews with 30 engineers at Jane Street: PBT is valued for complex code; the hard parts are writing generators and judging how effective the tests are (qualitative).', 'Interviews mit 30 Entwicklern bei Jane Street: PBT wird bei komplexem Code geschätzt; schwierig sind Generatoren und die Einschätzung der Wirksamkeit (qualitativ).'),
        f('brooker2025', 'AWS uses property-based testing, for example in S3\'s ShardStore (experience report).', 'AWS setzt Property-Based Testing ein, zum Beispiel in S3s ShardStore (Erfahrungsbericht).')),
      ai: ev('weak', f('he2025pbt', 'Property-based feedback with shrunk counterexamples gave 23–37% relative pass@1 gains over TDD-style feedback (preprint).', 'Property-basiertes Feedback mit geschrumpften Gegenbeispielen brachte 23–37 % relative pass@1-Gewinne gegenüber TDD-artigem Feedback (Preprint).')),
    },
    variants: [
      { name: l('Metamorphic testing', 'Metamorphes Testen'), text: l('Properties that relate outputs of related inputs, e.g. "filtering by price < 50 never returns more pets than price < 100". Useful when there is no oracle.', 'Eigenschaften über Ausgaben verwandter Eingaben, z. B. „Filtern nach Preis < 50 liefert nie mehr Tiere als Preis < 100“. Nützlich ohne Orakel.') },
      { name: l('Model-based / stateful testing', 'Modellbasiertes / zustandsbehaftetes Testen'), text: l('Generate random sequences of operations and compare the system against a simple model after every step.', 'Zufällige Folgen von Operationen erzeugen und das System nach jedem Schritt mit einem einfachen Modell vergleichen.') },
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
});`, focus: [{ line: [6,8], note: l('The generators throw many random inputs at the code, including edge cases you would never write by hand.', 'Die Generatoren schicken viele Zufallseingaben an den Code, auch Randfälle, die du nie von Hand schreiben würdest.') }, { line: 11, note: l('Build valid inputs by construction; filtering them away would waste runs and hide what is actually tested.', 'Gültige Eingaben direkt konstruieren; Herausfiltern würde Läufe verschwenden und verschleiern, was wirklich getestet wird.') }, { line: 13, note: l('This is the property: the shares always add up exactly, so no cent is lost or invented by rounding.', 'Das ist die Eigenschaft: Die Anteile ergeben immer genau die Summe, kein Cent geht durch Rundung verloren oder entsteht neu.') }, { line: 14, note: l('A second invariant in the same test: no share may exceed its weight.', 'Eine zweite Invariante im selben Test: Kein Anteil darf sein Gewicht überschreiten.') }] },
      { lang: 'python', file: 'test_allocate.py', code: `from hypothesis import given, strategies as st
from allocate import allocate

@given(st.lists(st.integers(0, 10_000), min_size=1), st.integers(min_value=0))
def test_shares_add_up(weights, raw):
    total = sum(weights)
    amount = 0 if total == 0 else raw % (total + 1)
    shares = allocate(amount, weights)
    assert sum(shares) == (0 if total == 0 else amount)
    assert all(s <= w for s, w in zip(shares, weights))`, focus: [{ line: 4, note: l('The strategies define the input space; a failing input is shrunk to a minimal counterexample.', 'Die Strategies legen den Eingaberaum fest; eine fehlschlagende Eingabe wird auf ein minimales Gegenbeispiel verkleinert.') }, { line: 7, note: l('Derive a valid amount from the generated one instead of rejecting inputs, so no runs are wasted.', 'Leite einen gültigen Betrag aus dem generierten ab, statt Eingaben zu verwerfen, damit keine Läufe verschwendet werden.') }, { line: 9, note: l('The property itself: shares sum to the amount, whatever the weights are.', 'Die Eigenschaft selbst: Die Anteile ergeben den Betrag, egal wie die Gewichte aussehen.') }, { line: 10, note: l('The bound is checked on every generated case, not on three hand-picked ones.', 'Die Grenze wird bei jedem generierten Fall geprüft, nicht nur bei drei handverlesenen.') }] },
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
}`, focus: [{ line: [13,16], note: l('Generators define the input space; the third range is wider so the modulo can reach every amount.', 'Generatoren legen den Eingaberaum fest; der dritte Bereich ist breiter, damit das Modulo jeden Betrag erreichen kann.') }, { line: 22, note: l('assertSame compares exactly: the shares must add up to the amount, with no rounding drift.', 'assertSame vergleicht exakt: Die Anteile müssen den Betrag ergeben, ohne Rundungsdrift.') }, { line: [24,25], note: l('Bounds on every share: never negative, never above its weight. Violations point to an allocation bug.', 'Grenzen für jeden Anteil: nie negativ, nie über seinem Gewicht. Verstöße deuten auf einen Fehler in der Verteilung.') }] },
    ],
    steps: [
      l('Pick one function with clear rules (parser, calculation, data transformation).', 'Eine Funktion mit klaren Regeln wählen (Parser, Berechnung, Datentransformation).'),
      l('Write 2–3 properties: an invariant, a round-trip, or a comparison with a simple reference implementation.', '2–3 Eigenschaften schreiben: eine Invariante, einen Round-Trip oder einen Vergleich mit einer einfachen Referenzimplementierung.'),
      l('Run with at least 1,000 cases locally; on failure, add the shrunk counterexample as a regular regression test.', 'Lokal mit mindestens 1.000 Fällen laufen lassen; bei Fehlschlag das geschrumpfte Gegenbeispiel als normalen Regressionstest übernehmen.'),
      l('Fix the seed in CI output so failures are reproducible.', 'Den Seed in der CI-Ausgabe festhalten, damit Fehlschläge reproduzierbar sind.'),
    ],
    done: l('At least two properties pass with 1,000+ generated cases; each counterexample found has become a regression test.', 'Mindestens zwei Eigenschaften bestehen mit 1.000+ generierten Fällen; jedes gefundene Gegenbeispiel ist ein Regressionstest geworden.'),
    think: [
      q('For a sorting function, "the output is sorted" seems like the obvious property. Why is it not enough?', 'Für eine Sortierfunktion scheint „die Ausgabe ist sortiert“ die naheliegende Eigenschaft. Warum reicht sie nicht?',
        'A function that returns `[]` always satisfies it. You also need "the output is a permutation of the input". Good properties pin down the result from more than one side.',
        'Eine Funktion, die immer `[]` liefert, erfüllt sie. Man braucht auch „die Ausgabe ist eine Permutation der Eingabe“. Gute Eigenschaften legen das Ergebnis von mehr als einer Seite fest.'),
      q('The tool reports a failure with a list of 47 random numbers, then a shrunk example `[1, 1]` with amount 1. Which one do you debug, and why?', 'Das Werkzeug meldet einen Fehlschlag mit 47 Zufallszahlen und dann ein geschrumpftes Beispiel `[1, 1]` mit Betrag 1. Welches debuggt man, und warum?',
        'The shrunk one. It is the smallest input that still fails, so everything left in it is relevant: two equal weights and an odd amount point straight at a rounding bug.',
        'Das geschrumpfte. Es ist die kleinste Eingabe, die noch scheitert; alles darin ist relevant: zwei gleiche Gewichte und ein ungerader Betrag zeigen direkt auf einen Rundungsfehler.'),
      q('Predict: your property says "total of the shares equals the amount", and it fails on `amount = 1`, 2 shares. What is the likely cause?', 'Vorhersage: Deine Property besagt „die Summe der Anteile entspricht dem Betrag“ und schlägt bei `amount = 1` mit 2 Anteilen fehl. Was ist die wahrscheinliche Ursache?',
        'Rounding: each share of 0.5 is rounded to 0 or 1, so the sum is 0 or 2. The fix is a rule for the remainder, such as giving it to the first share.',
        'Rundung: Jeder Anteil von 0,5 wird auf 0 oder 1 gerundet, die Summe ist 0 oder 2. Die Lösung ist eine Regel für den Rest, etwa ihn dem ersten Anteil zuzuschlagen.'),
    ],
    related: ['fuzz-tests', 'unit-tests', 'differential-testing', 'formal-verification'],
  },
  {
    id: 'fuzz-tests',
    name: l('Fuzz tests', 'Fuzzing'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Feed a program huge numbers of generated, often malformed inputs, guided by coverage, and watch for crashes.', 'Ein Programm mit riesigen Mengen erzeugter, oft kaputter Eingaben füttern, von Coverage gelenkt, und auf Abstürze achten.'),
    catches: l('crashes, hangs, memory errors and unhandled exceptions on untrusted input: parsers, decoders, protocol handlers', 'Abstürze, Hänger, Speicherfehler und unbehandelte Ausnahmen bei nicht vertrauenswürdigen Eingaben: Parser, Decoder, Protokoll-Handler'),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('Coverage guidance lets the fuzzer "learn" the input format and reach deep code.', 'Coverage-Lenkung lässt den Fuzzer das Eingabeformat „lernen“ und tiefen Code erreichen.'),
      l('Finds security bugs at scale; OSS-Fuzz has found tens of thousands.', 'Findet Sicherheitsfehler in großem Maßstab; OSS-Fuzz hat Zehntausende gefunden.'),
      l('Needs no oracle beyond "must not crash", plus assertions you add.', 'Braucht kein Orakel außer „darf nicht abstürzen“, plus selbst ergänzte Assertions.'),
    ],
    limits: [
      l('Finds crashes, not wrong answers, unless you add assertions or compare implementations.', 'Findet Abstürze, keine falschen Antworten, außer man ergänzt Assertions oder vergleicht Implementierungen.'),
      l('Needs CPU time: minutes to days. Run it continuously, not just once.', 'Braucht Rechenzeit: Minuten bis Tage. Dauerhaft laufen lassen, nicht einmalig.'),
    ],
    ai: l(
      'LLMs are now good at writing fuzz harnesses, the tedious part. Google\'s AI-written harnesses found new vulnerabilities in well-fuzzed projects. Pair fuzzing with sanitizers so memory bugs actually crash.',
      'LLMs schreiben inzwischen gute Fuzz-Harnesses, den mühsamen Teil. Googles KI-geschriebene Harnesses fanden neue Schwachstellen in bereits gut gefuzzten Projekten. Fuzzing mit Sanitizern kombinieren, damit Speicherfehler auch wirklich abstürzen.',
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
      l('Pick the code that handles untrusted input (parser, decoder, request handler).', 'Den Code wählen, der nicht vertrauenswürdige Eingaben verarbeitet (Parser, Decoder, Request-Handler).'),
      l('Write a harness that feeds bytes in, treats expected rejections as fine and everything else as a finding; add a round-trip assertion if possible.', 'Eine Harness schreiben, die Bytes hineingibt, erwartete Ablehnungen als in Ordnung und alles andere als Fund behandelt; wenn möglich eine Round-Trip-Assertion ergänzen.'),
      l('Seed a corpus with real examples and add a dictionary of keywords.', 'Ein Korpus mit echten Beispielen anlegen und ein Wörterbuch mit Schlüsselwörtern ergänzen.'),
      l('Run for at least 10 minutes locally, then continuously in CI or OSS-Fuzz; turn every crash into a regression test.', 'Mindestens 10 Minuten lokal laufen lassen, dann dauerhaft in CI oder OSS-Fuzz; jeden Absturz in einen Regressionstest überführen.'),
    ],
    done: l('Harness runs for 10+ minutes without findings (or findings are fixed and have regression tests); corpus is committed.', 'Die Harness läuft 10+ Minuten ohne Fund (oder Funde sind behoben und haben Regressionstests); das Korpus ist committet.'),
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
    name: l('Mutation tests', 'Mutation Testing'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Test your tests: plant small bugs (mutants) in the code and check that at least one test fails for each.', 'Die Tests testen: Kleine Fehler (Mutanten) in den Code einbauen und prüfen, dass für jeden mindestens ein Test scheitert.'),
    catches: l('weak tests: missing boundary cases, assertions that check nothing, untested side effects', 'schwache Tests: fehlende Grenzfälle, Assertions, die nichts prüfen, ungetestete Seiteneffekte'),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('The best widely available measure of test quality; far better than coverage.', 'Das beste breit verfügbare Maß für Testqualität; weit besser als Coverage.'),
      l('Every surviving mutant points at a concrete missing test.', 'Jeder überlebende Mutant zeigt auf einen konkret fehlenden Test.'),
      l('Incremental mode (only changed code) makes it affordable in CI.', 'Inkrementeller Modus (nur geänderter Code) macht es in der CI bezahlbar.'),
    ],
    limits: [
      l('Slow on large codebases; run it on changed code or critical modules.', 'Langsam bei großen Codebasen; auf geändertem Code oder kritischen Modulen laufen lassen.'),
      l('Equivalent mutants (same behaviour as the original) cannot be killed and need a human to dismiss.', 'Äquivalente Mutanten (gleiches Verhalten wie das Original) sind nicht tötbar und müssen von einem Menschen aussortiert werden.'),
    ],
    ai: l(
      'The natural check on agent-written tests: if an agent\'s tests let mutants survive, they are decoration. Meta uses mutants to guide LLM test generation and keeps only tests that kill them.',
      'Die natürliche Prüfung für von Agenten geschriebene Tests: Lassen sie Mutanten überleben, sind sie Dekoration. Meta nutzt Mutanten, um LLM-Testgenerierung zu lenken, und behält nur Tests, die sie töten.',
    ),
    evidence: {
      general: ev('strong',
        f('just2014', 'On 357 real faults, mutant detection correlated with real-fault detection independently of coverage; 73% of real faults were coupled to common mutants.', 'Bei 357 echten Fehlern korrelierte das Erkennen von Mutanten mit dem Erkennen echter Fehler, unabhängig von der Abdeckung; 73 % der echten Fehler waren an gängige Mutanten gekoppelt.'),
        f('papadakis2018', 'Once suite size is controlled the correlation is weaker, but suites with higher mutation scores still find more real faults than random suites of the same size.', 'Kontrolliert man die Suitegröße, ist die Korrelation schwächer, aber Suiten mit höherem Mutation Score finden weiterhin mehr echte Fehler als zufällige Suiten gleicher Größe.'),
        f('petrovic2021', 'At Google (about 15M mutants), developers exposed to mutants wrote more and better tests over time.', 'Bei Google (etwa 15 Mio. Mutanten) schrieben Entwickler, die Mutanten sahen, mit der Zeit mehr und bessere Tests.')),
      ai: ev('moderate', f('foster2025', 'Meta\'s ACH generated mutants and LLM tests for 10,795 Kotlin classes; engineers accepted 73% of the resulting tests.', 'Metas ACH erzeugte Mutanten und LLM-Tests für 10.795 Kotlin-Klassen; Entwickler übernahmen 73 % der entstandenen Tests.')),
    },
    variants: [{ name: l('Agent-generated tests', 'Von Agenten erzeugte Tests'), text: l('Let an agent write tests, but keep only those that compile, pass, and kill at least one surviving mutant.', 'Einen Agenten Tests schreiben lassen, aber nur die behalten, die kompilieren, bestehen und mindestens einen überlebenden Mutanten töten.') }],
    tools: { php: ['infection'], js: ['stryker-js'], python: ['mutmut', 'cosmic-ray'], java: ['pitest'], dotnet: ['stryker-net'], go: ['gremlins'], rust: ['cargo-mutants'], cpp: ['mull'] },
    sim: 'mutation',
    snippets: [
      { lang: 'js', file: 'stryker.config.json', code: `{
  "testRunner": "vitest",
  "mutate": ["src/domain/**/*.ts"],
  "thresholds": { "high": 90, "low": 75, "break": 70 },
  "incremental": true
}`, focus: [{ line: 3, note: l('Only mutate the domain code; mutating everything wastes time on code that carries no business rules.', 'Nur den Domain-Code mutieren; alles zu mutieren verschwendet Zeit an Code ohne Geschäftsregeln.') }, { line: 4, note: l('The break threshold fails the build when too many mutants survive, meaning the tests are too weak.', 'Die Schwelle break lässt den Build fehlschlagen, wenn zu viele Mutanten überleben, die Tests also zu schwach sind.') }, { line: 5, note: l('Incremental reuses earlier results so reruns stay fast enough to run on every change.', 'Incremental nutzt frühere Ergebnisse wieder, damit Wiederholungen schnell genug für jede Änderung bleiben.') }] },
      { lang: 'python', file: 'pyproject.toml', code: `[tool.mutmut]
paths_to_mutate = ["src/domain/"]
tests_dir = ["tests/"]
# run:   mutmut run && mutmut results`, focus: [{ line: 2, note: l('Limit mutation to the code that holds the rules, such as reservation logic.', 'Mutation auf den Code mit den Regeln beschränken, etwa die Reservierungslogik.') }, { line: 3, note: l('The mutants are run against these tests; a survivor means no test noticed the change.', 'Die Mutanten laufen gegen diese Tests; ein Überlebender heißt, kein Test hat die Änderung bemerkt.') }, { line: 4, note: l('Read the surviving mutants, not just the score: each one names a behaviour no test pins down.', 'Lies die überlebenden Mutanten, nicht nur den Score: Jeder nennt ein Verhalten, das kein Test festlegt.') }] },
    ],
    steps: [
      l('Run the mutation tool on the domain logic only (not UI glue) and note the score and surviving mutants.', 'Das Mutationswerkzeug nur auf der Fachlogik ausführen (nicht auf UI-Klebecode) und Score sowie überlebende Mutanten notieren.'),
      l('For each surviving mutant, add or strengthen a test that kills it; mark genuinely equivalent mutants with a reason.', 'Für jeden überlebenden Mutanten einen Test ergänzen oder verschärfen, der ihn tötet; echte äquivalente Mutanten mit Begründung markieren.'),
      l('Do not change production code to kill mutants unless it reveals a real bug.', 'Produktionscode nicht ändern, um Mutanten zu töten, außer es zeigt einen echten Fehler.'),
      l('Add incremental mutation testing to CI with a break threshold.', 'Inkrementelles Mutation Testing mit Abbruchschwelle in die CI aufnehmen.'),
    ],
    done: l('Mutation score on the chosen module ≥ 80%, every remaining survivor is explained as equivalent, and CI breaks below the threshold.', 'Mutation Score im gewählten Modul ≥ 80 %, jeder verbleibende Überlebende ist als äquivalent begründet, und die CI bricht unterhalb der Schwelle ab.'),
    think: [
      q('Your tests reach 100% line coverage, yet 4 of 12 mutants survive. How can both be true?', 'Deine Tests erreichen 100 % Zeilenabdeckung, trotzdem überleben 4 von 12 Mutanten. Wie passt das zusammen?',
        'Coverage only says the line ran. A mutant survives if no test notices the line behaving differently, e.g. `>=` changed to `>` when no test uses the exact boundary value.',
        'Coverage sagt nur, dass die Zeile lief. Ein Mutant überlebt, wenn kein Test merkt, dass sich die Zeile anders verhält, z. B. `>=` zu `>`, wenn kein Test genau den Grenzwert nutzt.'),
      q('A mutant changes `i < arr.length` to `i <= arr.length` and survives. Is your test suite weak?', 'Ein Mutant ändert `i < arr.length` zu `i <= arr.length` und überlebt. Ist die Testsuite schwach?',
        'Maybe not. In JavaScript the extra iteration may read `undefined` and change nothing; then the mutant is equivalent and no test can kill it. A human has to decide.',
        'Vielleicht nicht. In JavaScript liest der zusätzliche Durchlauf womöglich `undefined` und ändert nichts; dann ist der Mutant äquivalent, und kein Test kann ihn töten. Ein Mensch muss entscheiden.'),
      q('Predict: you run mutation testing on a module where an agent wrote both code and tests. What score do you expect, and why?', 'Vorhersage: Du führst Mutation Testing auf einem Modul aus, bei dem ein Agent Code und Tests geschrieben hat. Welchen Score erwartest du, und warum?',
        'Often lower than the line coverage suggests: agent-written tests tend to repeat the code\'s behaviour and skip boundaries. The surviving mutants show where to add exact assertions.',
        'Oft niedriger, als die Zeilenabdeckung vermuten lässt: Vom Agenten geschriebene Tests wiederholen gern das Verhalten des Codes und lassen Grenzen aus. Die überlebenden Mutanten zeigen, wo exakte Assertions fehlen.'),
    ],
    related: ['coverage', 'unit-tests', 'test-integrity', 'property-based-tests'],
  },
  {
    id: 'coverage',
    viz: { kind: 'pipeline', mode: 'coverage' },
    name: l('Coverage tests', 'Coverage (Testabdeckung)'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Measure which lines and branches your tests execute, to find code no test touches.', 'Messen, welche Zeilen und Zweige die Tests ausführen, um Code zu finden, den kein Test berührt.'),
    catches: l('completely untested code: forgotten error branches, dead features', 'völlig ungetesteten Code: vergessene Fehlerzweige, tote Funktionen'),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('Uncovered code is certainly untested; that part of the signal is reliable.', 'Nicht abgedeckter Code ist sicher ungetestet; dieser Teil des Signals ist verlässlich.'), l('Coverage of the diff in code review helps reviewers ask the right question.', 'Abdeckung des Diffs im Code-Review hilft, die richtige Frage zu stellen.'),
      l('Cheap to produce on every run, so it can show gaps in the diff of every pull request.', 'Billig bei jedem Lauf zu erzeugen, sodass es Lücken im Diff jedes Pull Requests zeigen kann.'),
    ],
    limits: [l('Covered is not tested: a line can run without any assertion checking its result.', 'Abgedeckt heißt nicht getestet: Eine Zeile kann laufen, ohne dass eine Assertion ihr Ergebnis prüft.'), l('Coverage targets invite tests written to raise the number.', 'Abdeckungsziele laden zu Tests ein, die nur die Zahl heben.')],
    ai: l('An agent told to reach 90% coverage will reach 90% coverage, possibly with tests that assert nothing. Use coverage to find gaps, mutation score to judge quality.', 'Ein Agent mit dem Auftrag „90 % Abdeckung“ erreicht 90 % Abdeckung, womöglich mit Tests, die nichts prüfen. Abdeckung nutzen, um Lücken zu finden, Mutation Score, um Qualität zu beurteilen.'),
    evidence: {
      general: ev('moderate',
        f('inozemtseva2014', 'Across 31,000 test suites for five Java systems, coverage correlated only low to moderately with effectiveness once suite size was controlled.', 'Über 31.000 Testsuiten für fünf Java-Systeme korrelierte die Abdeckung nur schwach bis mäßig mit der Wirksamkeit, sobald die Suitegröße kontrolliert wurde.'),
        f('ivankovic2019', 'At Google coverage is widely adopted and developers find it useful in code review (adoption and perception data).', 'Bei Google ist Coverage weit verbreitet, und Entwickler finden sie im Code-Review nützlich (Nutzungs- und Wahrnehmungsdaten).')),
      ai: ev('moderate', f('foster2025', 'At Meta, 277 of 571 useful LLM-generated tests would have been discarded if line coverage had been the acceptance criterion.', 'Bei Meta wären 277 von 571 nützlichen LLM-generierten Tests verworfen worden, wäre Zeilenabdeckung das Abnahmekriterium gewesen.')),
    },
    tools: { php: ['php-code-coverage', 'phpunit'], js: ['c8', 'vitest'], python: ['coveragepy'], java: ['jacoco'], dotnet: ['coverlet'], go: ['go-cover'], rust: ['cargo-llvm-cov'], cpp: ['lcov'] },
    snippets: [{ lang: "js", file: "vitest.config.ts",
      description: l("Install matching versions of vitest and @vitest/coverage-v8. Run npx vitest run --coverage. An uncovered branch can fail the threshold; even full coverage does not prove the assertions are useful.",
        "Passende Versionen von vitest und @vitest/coverage-v8 installieren. npx vitest run --coverage starten. Ein ungeprüfter Branch kann die Schwelle unterschreiten; auch volle Coverage belegt keine sinnvollen Assertions."),
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
    steps: [l('Enable branch coverage (not just line coverage) and generate a report.', 'Zweigabdeckung (nicht nur Zeilenabdeckung) aktivieren und einen Bericht erzeugen.'), l('List uncovered branches in domain logic and decide for each: add a test or delete the code.', 'Nicht abgedeckte Zweige in der Fachlogik auflisten und für jeden entscheiden: Test ergänzen oder Code löschen.'), l('Show coverage of the changed lines in pull requests; do not enforce a global percentage.', 'Die Abdeckung der geänderten Zeilen in Pull Requests anzeigen; keinen globalen Prozentsatz erzwingen.')],
    done: l('Every uncovered branch in domain logic is either tested or removed; PRs show diff coverage.', 'Jeder nicht abgedeckte Zweig in der Fachlogik ist getestet oder entfernt; PRs zeigen die Diff-Abdeckung.'),
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
    name: l('Differential testing', 'Differential Testing'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('Run two implementations of the same thing on the same inputs and flag every difference.', 'Zwei Implementierungen derselben Sache mit denselben Eingaben laufen lassen und jeden Unterschied melden.'),
    catches: l('behaviour changes in a refactoring or rewrite, disagreement with a reference implementation or standard', 'Verhaltensänderungen bei Refactoring oder Neufassung, Abweichung von einer Referenzimplementierung oder einem Standard'),
    cost: 1,
    feedback: 'seconds',
    worth: [l('An oracle for free: you do not need to know the right answer, only that the two should agree.', 'Ein Orakel umsonst: Man muss die richtige Antwort nicht kennen, nur dass beide übereinstimmen sollen.'), l('Combines naturally with generated inputs (PBT, fuzzing).', 'Verbindet sich natürlich mit erzeugten Eingaben (PBT, Fuzzing).'), l('Bridges proofs and code: compare a verified Dafny model against the production TypeScript.', 'Überbrückt Beweis und Code: ein verifiziertes Dafny-Modell gegen das produktive TypeScript vergleichen.')],
    limits: [l('If both implementations share a bug, they agree on it.', 'Teilen beide Implementierungen einen Fehler, stimmen sie darin überein.'), l('Intended differences need an explicit allow-list.', 'Gewollte Unterschiede brauchen eine ausdrückliche Ausnahmeliste.')],
    ai: l('The best check for "rewrite this module" tasks: keep the old implementation, run both on thousands of inputs, and the agent gets a concrete counterexample for every behavioural change.', 'Die beste Prüfung für „schreib dieses Modul neu“: Die alte Implementierung behalten, beide auf Tausenden Eingaben laufen lassen, und der Agent bekommt für jede Verhaltensänderung ein konkretes Gegenbeispiel.'),
    evidence: {
      general: ev('strong', f('csmith2011', 'Differential testing of C compilers found more than 325 previously unknown bugs in GCC and LLVM; CompCert\'s verified middle-end was the only part where no wrong-code bugs were found.', 'Differential Testing von C-Compilern fand über 325 unbekannte Fehler in GCC und LLVM; die verifizierte Mittelschicht von CompCert war der einzige Teil ohne Fehlübersetzungen.')),
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
    steps: [l('Keep the old implementation (or a simple reference) importable next to the new one.', 'Die alte Implementierung (oder eine einfache Referenz) neben der neuen importierbar halten.'), l('Write one property: for generated inputs, both give the same result (or both reject).', 'Eine Eigenschaft schreiben: Für erzeugte Eingaben liefern beide dasselbe Ergebnis (oder lehnen beide ab).'), l('List intended differences explicitly and exclude only those.', 'Gewollte Unterschiede ausdrücklich auflisten und nur diese ausnehmen.')],
    done: l('The differential property passes 5,000+ runs; every intended difference is listed with a reason.', 'Die differenzielle Eigenschaft besteht 5.000+ Läufe; jeder gewollte Unterschied ist mit Begründung gelistet.'),
    think: [
      q('Old and new pricing agree on 5,000 random carts. What could they still both get wrong?', 'Alte und neue Preisberechnung stimmen bei 5.000 Zufallswarenkörben überein. Was könnten beide trotzdem falsch machen?', 'Anything they share: the same wrong rounding rule, the same misunderstanding of a voucher. Agreement is evidence of equivalence, not of correctness.', 'Alles, was sie teilen: dieselbe falsche Rundungsregel, dasselbe Missverständnis eines Gutscheins. Übereinstimmung belegt Gleichwertigkeit, nicht Korrektheit.'),
      q('When can you not use differential testing?', 'Wann kannst du Differential Testing nicht einsetzen?',
        'When there is no second implementation or reference, for example a brand-new feature. Then you need an independent oracle: a spec, properties or hand-written expected values.',
        'Wenn es keine zweite Implementierung oder Referenz gibt, etwa bei einem ganz neuen Feature. Dann braucht es ein unabhängiges Orakel: eine Spezifikation, Properties oder von Hand geschriebene Erwartungswerte.'),
      q('Predict: you compare old and new search on random queries and they differ in the order of ties. Is that a bug?', 'Vorhersage: Du vergleichst alte und neue Suche mit zufälligen Anfragen, und sie unterscheiden sich in der Reihenfolge bei Gleichstand. Ist das ein Fehler?',
        'Not necessarily. If the spec does not define tie order, compare sorted results or add an explicit tie-breaker to the spec, instead of treating the difference as a bug.',
        'Nicht unbedingt. Legt die Spezifikation die Reihenfolge bei Gleichstand nicht fest, vergleicht man sortierte Ergebnisse oder ergänzt einen expliziten Tie-Breaker, statt den Unterschied als Fehler zu werten.'),
    ],
    related: ['tap-compare', 'shadowing', 'property-based-tests', 'refactoring'],
  },
  {
    id: 'benchmark-tests',
    viz: { kind: 'load', mode: 'benchmark-tests' },
    name: l('Benchmark tests', 'Benchmarks'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Measure how fast a small piece of code runs, repeatably, and compare against a baseline.', 'Messen, wie schnell ein kleines Stück Code läuft, wiederholbar, und mit einer Baseline vergleichen.'),
    catches: l('performance regressions in hot code: an accidental O(n²), an allocation in a loop', 'Performance-Regressionen in heißem Code: ein versehentliches O(n²), eine Allokation in einer Schleife'),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('Catches slowdowns at the function level before they reach load tests.', 'Fängt Verlangsamungen auf Funktionsebene, bevor sie Lasttests erreichen.'), l('Benchmark harnesses handle warm-up and statistics for you.', 'Benchmark-Harnesses übernehmen Aufwärmen und Statistik.'),
      l('Results are comparable between commits, so a regression can be pinned to the change that caused it.', 'Ergebnisse sind zwischen Commits vergleichbar, sodass sich eine Regression der verursachenden Änderung zuordnen lässt.'),
    ],
    limits: [
      l('Noisy on shared CI machines; compare relative changes, not absolute numbers.', 'Auf geteilten CI-Maschinen verrauscht; relative Änderungen vergleichen, keine absoluten Zahlen.'),
      l('A benchmark measures one function in isolation; it says nothing about how the whole system behaves under load.', 'Ein Benchmark misst eine Funktion isoliert; über das Verhalten des ganzen Systems unter Last sagt er nichts.'),
    ],
    ai: l('Agents optimise for "tests pass", not for speed, and readily write quadratic loops. A benchmark with a regression threshold makes performance part of "done".', 'Agenten optimieren auf „Tests grün“, nicht auf Geschwindigkeit, und schreiben bereitwillig quadratische Schleifen. Ein Benchmark mit Regressionsschwelle macht Performance zum Teil von „fertig“.'),
    evidence: { general: ev('weak', f('jin2012', 'A study of 109 real performance bugs showed recurring patterns; rules extracted from 25 fixes found 332 previously unknown performance problems.', 'Eine Studie über 109 echte Performancefehler zeigte wiederkehrende Muster; aus 25 Korrekturen abgeleitete Regeln fanden 332 unbekannte Performanceprobleme.')), ai: none() },
    tools: { php: ['phpbench'], js: ['tinybench', 'vitest'], python: ['pytest-benchmark'], java: ['jmh'], dotnet: ['benchmarkdotnet'], go: ['go-bench'], rust: ['criterion'], cpp: ['google-benchmark'], any: ['hyperfine'] },
    snippets: [{ lang: "js", file: "reserve.bench.mjs",
      description: l("Install tinybench, then run node reserve.bench.mjs. Compare the same workload before and after a change. This benchmark measures lookups in existing collections; it excludes index construction and database latency.",
        "tinybench installieren, dann node reserve.bench.mjs starten. Denselben Workload vor und nach einer Änderung vergleichen. Dieser Benchmark misst Lookups in vorhandenen Collections; Indexaufbau und Datenbanklatenz sind nicht enthalten."),
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
      l('Write benchmarks for the 2–3 hottest functions with realistic input sizes, including a large one.', 'Benchmarks für die 2–3 heißesten Funktionen mit realistischen Eingabegrößen schreiben, darunter eine große.'), l('Store a baseline and fail when a change is more than X% slower on the same machine.', 'Eine Baseline speichern und scheitern, wenn eine Änderung auf derselben Maschine mehr als X % langsamer ist.'),
      l('Pin the environment (machine type, runtime version) and repeat each measurement several times before comparing.', 'Die Umgebung festlegen (Maschinentyp, Runtime-Version) und jede Messung mehrfach wiederholen, bevor verglichen wird.'),
    ],
    done: l('Benchmarks run reproducibly; a deliberately quadratic change is flagged as a regression.', 'Benchmarks laufen reproduzierbar; eine absichtlich quadratische Änderung wird als Regression gemeldet.'),
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
    viz: { kind: 'load', mode: 'performance-tests' },
    name: l('Performance tests', 'Performancetests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Check that the whole system meets its speed and resource goals (latency, throughput, memory) under a defined workload.', 'Prüfen, dass das ganze System unter einer definierten Last seine Ziele für Geschwindigkeit und Ressourcen erfüllt (Latenz, Durchsatz, Speicher).'),
    catches: l('slow endpoints, N+1 queries, memory growth, missing indexes', 'langsame Endpunkte, N+1-Abfragen, wachsender Speicher, fehlende Indizes'),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('Turns "it feels slow" into numbers with a target (e.g. p95 < 200 ms).', 'Macht aus „fühlt sich langsam an“ Zahlen mit Ziel (z. B. p95 < 200 ms).'), l('Catches problems that only appear with realistic data volumes.', 'Fängt Probleme, die erst bei realistischen Datenmengen auftreten.'),
      l('A threshold that fails the run keeps performance from degrading slowly, one harmless-looking change at a time.', 'Ein Schwellwert, der den Lauf scheitern lässt, verhindert, dass die Performance schleichend sinkt, eine harmlos wirkende Änderung nach der anderen.'),
    ],
    limits: [
      l('Needs a production-like environment and data to be meaningful.', 'Braucht eine produktionsähnliche Umgebung und Daten, um aussagekräftig zu sein.'),
      l('Results from a laptop or a tiny test database do not transfer; a missing index shows only at production data sizes.', 'Ergebnisse vom Laptop oder einer winzigen Testdatenbank übertragen sich nicht; ein fehlender Index zeigt sich erst bei produktionsnahen Datenmengen.'),
    ],
    ai: l('Give the agent the target as a number and the test as a command; "make it faster" is not checkable, "p95 below 200 ms in this k6 script" is.', 'Dem Agenten das Ziel als Zahl und den Test als Befehl geben; „mach es schneller“ ist nicht prüfbar, „p95 unter 200 ms in diesem k6-Skript“ schon.'),
    evidence: { general: ev('weak', f('jin2012', 'Performance bugs follow recurring patterns that can be checked for automatically (bug study, not an effect study of performance testing).', 'Performancefehler folgen wiederkehrenden Mustern, die sich automatisch prüfen lassen (Fehlerstudie, keine Wirkungsstudie zu Performancetests).')), ai: none() },
    tools: { any: ['k6', 'locust', 'gatling', 'hyperfine'] },
    snippets: [{ lang: "any", file: "latency.js",
      description: l("Run k6 run -e BASE_URL=http://localhost:3000 latency.js against your test deployment. Inject a delay above 500 ms: the p95 threshold should fail. The read-only endpoint and budget are examples to adapt.",
        "k6 run -e BASE_URL=http://localhost:3000 latency.js gegen das Test-Deployment starten. Eine Verzögerung über 500 ms einbauen: Die p95-Schwelle soll scheitern. Read-only-Endpoint und Budget sind anzupassende Beispiele."),
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
      l('Define targets for the critical endpoints (p95 latency, error rate, throughput).', 'Ziele für die kritischen Endpunkte festlegen (p95-Latenz, Fehlerrate, Durchsatz).'), l('Write a scripted workload and run it against a production-like environment with thresholds that fail the run.', 'Eine skriptbasierte Last schreiben und gegen eine produktionsähnliche Umgebung mit Schwellen laufen lassen, die den Lauf scheitern lassen.'),
      l('Seed the environment with production-sized, anonymised data and record the result for each release.', 'Die Umgebung mit produktionsgroßen, anonymisierten Daten füllen und das Ergebnis pro Release festhalten.'),
    ],
    done: l('The performance script runs with explicit thresholds and fails when a target is missed.', 'Das Performance-Skript läuft mit expliziten Schwellen und scheitert, wenn ein Ziel verfehlt wird.'),
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
    viz: { kind: 'load', mode: 'load-tests' },
    name: l('Load tests', 'Lasttests'),
    layer: 'static',
    phases: ['deploy'],
    fromOverview: true,
    oneLiner: l('Put realistic or peak traffic on the deployed system and see where it bends or breaks.', 'Realistischen oder Spitzenverkehr auf das deployte System geben und schauen, wo es nachgibt oder bricht.'),
    catches: l('capacity limits, connection-pool exhaustion, lock contention, autoscaling that reacts too late', 'Kapazitätsgrenzen, erschöpfte Verbindungspools, Sperrkonflikte, zu spät reagierendes Autoscaling'),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('Tells you how much headroom you have before the launch, not during it.', 'Sagt, wie viel Reserve man hat, vor dem Launch statt währenddessen.'), l('Concurrency bugs (double-booking!) often only appear under load.', 'Nebenläufigkeitsfehler (Doppelbuchung!) zeigen sich oft erst unter Last.'),
      l('Shows which resource runs out first (connections, CPU, locks), so you fix the real bottleneck.', 'Zeigt, welche Ressource zuerst ausgeht (Verbindungen, CPU, Locks), sodass du den echten Engpass behebst.'),
    ],
    limits: [
      l('Synthetic traffic differs from real traffic; combine with shadowing or canaries.', 'Synthetischer Verkehr unterscheidet sich vom echten; mit Shadowing oder Canaries kombinieren.'),
      l('Costs a realistic environment and test data; a shortcut environment gives misleading numbers.', 'Kostet eine realistische Umgebung und Testdaten; eine abgespeckte Umgebung liefert irreführende Zahlen.'),
    ],
    ai: l('Agents rarely consider load. A load test in the deploy pipeline is the safety net for the connection pool the agent forgot to close.', 'Agenten bedenken Last selten. Ein Lasttest in der Deploy-Pipeline ist das Netz für den Verbindungspool, den der Agent zu schließen vergaß.'),
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
    steps: [l('Script the main user journey with realistic think times and data.', 'Den Hauptablauf mit realistischen Pausen und Daten skripten.'), l('Ramp up to expected peak ×2 in a staging environment with thresholds for latency and errors.', 'In einer Staging-Umgebung auf erwartete Spitze ×2 hochfahren, mit Schwellen für Latenz und Fehler.'), l('After the run, check data invariants (no pet reserved twice).', 'Nach dem Lauf Dateninvarianten prüfen (kein Tier doppelt reserviert).')],
    done: l('The load test passes its thresholds at 2× expected peak, and the invariant check after the run is clean.', 'Der Lasttest erfüllt seine Schwellen bei 2× erwarteter Spitze, und die Invariantenprüfung danach ist sauber.'),
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
    viz: { kind: 'load', mode: 'soak-tests' },
    name: l('Soak tests', 'Dauerlasttests (Soak)'),
    layer: 'static',
    phases: ['deploy'],
    fromOverview: true,
    oneLiner: l('Run a steady, moderate load for hours or days to find problems that only build up over time.', 'Eine gleichmäßige, mittlere Last über Stunden oder Tage laufen lassen, um Probleme zu finden, die sich erst mit der Zeit aufbauen.'),
    catches: l('memory leaks, growing queues, disk filling up, connection leaks, slow degradation', 'Speicherlecks, wachsende Warteschlangen, volllaufende Platten, Verbindungslecks, schleichende Verschlechterung'),
    cost: 3,
    feedback: 'days',
    worth: [
      l('Finds the leak that a 5-minute load test cannot see.', 'Findet das Leck, das ein 5-Minuten-Lasttest nicht sehen kann.'),
      l('Reveals time-based problems: expiring tokens, log rotation, scheduled jobs, caches that never evict.', 'Deckt zeitabhängige Probleme auf: ablaufende Tokens, Log-Rotation, geplante Jobs, Caches, die nie verdrängen.'),
      l('Shows slow growth of memory, file handles and database connections that only matters after days.', 'Zeigt langsames Wachstum von Speicher, Datei-Handles und Datenbankverbindungen, das erst nach Tagen relevant wird.'),
    ],
    limits: [
      l('Expensive and slow; run before major releases, not on every change.', 'Teuer und langsam; vor großen Releases ausführen, nicht bei jeder Änderung.'),
      l('Needs a stable environment for hours; a deployment in the middle ruins the run.', 'Braucht stundenlang eine stabile Umgebung; ein Deployment mittendrin ruiniert den Lauf.'),
    ],
    ai: l('A leak introduced by an agent looks fine in every fast check. Soak tests (or production memory monitoring) are where it shows.', 'Ein von einem Agenten eingeführtes Leck sieht in jeder schnellen Prüfung gut aus. Erst Dauerlasttests (oder Speicher-Monitoring in Produktion) zeigen es.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['k6', 'locust', 'gatling', 'prometheus'] },
    snippets: [{ lang: "any", file: "soak.js",
      description: l("Run k6 run -e BASE_URL=http://localhost:3000 soak.js in an isolated environment. Track memory, connection counts and latency over the two hours; k6 alone does not detect a memory leak.",
        "k6 run -e BASE_URL=http://localhost:3000 soak.js in einer isolierten Umgebung starten. Speicher, Verbindungen und Latenz über die zwei Stunden verfolgen; k6 allein erkennt kein Speicherleck."),
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
      l('Run the load script at ~60% of peak for 12–24 hours.', 'Das Lastskript mit ~60 % der Spitze für 12–24 Stunden laufen lassen.'), l('Track memory, open connections, queue length and latency over time; fail on a steady upward trend.', 'Speicher, offene Verbindungen, Warteschlangenlänge und Latenz über die Zeit verfolgen; bei stetigem Anstieg scheitern.'),
      l('Compare the start and end of the run, then find the cause of any trend with a heap snapshot or profile.', 'Anfang und Ende des Laufs vergleichen und die Ursache jedes Trends mit einem Heap-Snapshot oder Profil suchen.'),
    ],
    done: l('Resource metrics stay flat over the soak period, or every trend is explained.', 'Die Ressourcenmetriken bleiben über die Laufzeit flach, oder jeder Trend ist erklärt.'),
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
    viz: { kind: 'pipeline', mode: 'config-tests' },
    name: l('Config tests', 'Konfigurationstests'),
    layer: 'static',
    phases: ['deploy'],
    fromOverview: true,
    oneLiner: l('Validate configuration (YAML, Kubernetes manifests, feature-flag settings, infrastructure code) before it is applied.', 'Konfiguration (YAML, Kubernetes-Manifeste, Feature-Flag-Einstellungen, Infrastrukturcode) prüfen, bevor sie angewendet wird.'),
    catches: l('typos in keys, wrong types, missing limits, open security groups, a timeout of 0', 'Tippfehler in Schlüsseln, falsche Typen, fehlende Limits, offene Security Groups, ein Timeout von 0'),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('Configuration changes cause a large share of outages and are often deployed with no tests at all.', 'Konfigurationsänderungen verursachen einen großen Teil der Ausfälle und werden oft ganz ohne Tests ausgerollt.'), l('Schema validation and policy checks (OPA) are cheap and fast.', 'Schemaprüfung und Policy-Checks (OPA) sind billig und schnell.'),
      l('The same checks protect against agent edits: a generated manifest is validated like a hand-written one.', 'Dieselben Prüfungen schützen vor Agenten-Änderungen: Ein generiertes Manifest wird wie ein handgeschriebenes validiert.'),
    ],
    limits: [
      l('A valid config can still be wrong for the situation; test it in context.', 'Eine gültige Konfiguration kann für die Lage trotzdem falsch sein; im Kontext testen.'),
      l('Policies need maintenance; unchecked ones drift from what the team really requires.', 'Policies brauchen Pflege; ungepflegte entfernen sich von dem, was das Team wirklich verlangt.'),
    ],
    ai: l('Treat agent changes to configuration as code changes: validate schemas, enforce policies and test changed settings in context. Check for secrets separately with security scanning.', 'Konfigurationsänderungen von Agenten wie Codeänderungen behandeln: Schemas validieren, Policies prüfen und geänderte Einstellungen im Kontext testen. Secrets separat mit Security Scanning prüfen.'),
    evidence: {
      general: ev('moderate', f('sun2020ctest', 'Connecting configuration values to existing tests ("ctests") caught real failure-inducing configuration changes before deployment.', 'Konfigurationswerte mit bestehenden Tests zu verbinden („ctests“) fing echte fehlerauslösende Konfigurationsänderungen vor dem Deployment.')),
      ai: none(),
    },
    tools: { any: ['conftest', 'kubeconform', 'checkov', 'cue'] },
    snippets: [{ lang: 'any', file: 'policy/deployment.rego', code: `package main

deny contains msg if {
  input.kind == "Deployment"
  some c in input.spec.template.spec.containers
  not c.resources.limits.memory
  msg := sprintf("container %s has no memory limit", [c.name])
}
# conftest test k8s/*.yaml`, focus: [{ line: 3, note: l('A deny rule turns a policy into a failing check, so a bad manifest cannot merge.', 'Eine deny-Regel macht aus einer Richtlinie eine fehlschlagende Prüfung, sodass ein schlechtes Manifest nicht gemergt wird.') }, { line: 6, note: l('Fires when the limit is missing: the unsafe default that otherwise lets one container eat the node.', 'Greift, wenn das Limit fehlt: der unsichere Default, mit dem sonst ein Container den ganzen Node auffrisst.') }, { line: 7, note: l('The message names the container and the problem, so the fix is obvious from the CI log.', 'Die Meldung nennt Container und Problem, sodass der Fix aus dem CI-Log offensichtlich ist.') }, { line: 9, note: l('Run this in CI against the files you actually deploy.', 'Führe das in der CI gegen die Dateien aus, die du tatsächlich ausrollst.') }] }],
    steps: [l('Validate every config file against a schema in CI.', 'Jede Konfigurationsdatei in der CI gegen ein Schema prüfen.'), l('Add 3–5 policies for rules that have bitten you (memory limits, no public buckets, sane timeouts).', '3–5 Policies für Regeln ergänzen, die schon wehgetan haben (Speicherlimits, keine öffentlichen Buckets, vernünftige Timeouts).'), l('Load the config in the app at startup in a test and fail on unknown keys.', 'Die Konfiguration in einem Test beim Start der App laden und bei unbekannten Schlüsseln scheitern.')],
    done: l('Config changes are schema- and policy-checked in CI; an unknown key or missing limit fails the build.', 'Konfigurationsänderungen werden in der CI gegen Schema und Policies geprüft; ein unbekannter Schlüssel oder fehlendes Limit lässt den Build scheitern.'),
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
