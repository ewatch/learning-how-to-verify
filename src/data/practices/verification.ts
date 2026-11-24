import type { Practice } from '../types';
import { ev, f, l, none, q } from './_h';

export const verification: Practice[] = [
  {
    id: 'formal-verification',
    domain: { parts: ['reserve', 'never-twice', 'discount-sum'], what: l('A model checker tries every order of two reservations; proofs cover discounts.', 'Ein Model Checker prüft Ausführungsreihenfolgen für Reservierungen und ein Beweis prüft die Rabattregel.') },
    name: l('Formal verification', 'Formale Verifikation'),
    layer: 'verification',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Formal verification checks a mathematical property of code or a model. The result applies to the inputs and execution orders that the model permits.', 'Formal Verification prüft eine mathematische Property von Code oder einem Modell. Das Ergebnis gilt für die zulässigen Eingaben und Ausführungsreihenfolgen.'),
    catches: l('design bugs in protocols and concurrency (double-booking in 7 steps), and logic bugs no test happened to hit', 'Fehler im Modell oder Code, etwa eine Doppelreservierung in einer seltenen Ausführungsreihenfolge.'),
    intro: l(
      'Two users select “Reserve” at the same time. The defect occurs only in one execution order. A model checker can examine each order that the model permits.',
      'Zwei Nutzer wählen gleichzeitig „Reservieren“. Der Fehler tritt nur bei einer bestimmten Reihenfolge auf. Ein Model Checker kann alle Reihenfolgen im Modell prüfen.',
    ),
    cost: 3,
    feedback: 'hours',
    worth: [
      l('Model checkers such as TLA+ and P can examine all reachable states of a finite model. This can reveal rare execution orders.', 'Model Checker wie TLA+ TLC und P können alle erreichbaren Zustände eines endlichen Modells prüfen. Dabei können seltene Ausführungsreihenfolgen sichtbar werden.'),
      l('A program verifier can prove that the code meets its contract for each input that the contract permits.', 'Ein Program Verifier kann zeigen, dass Code den Contract für jede zulässige Eingabe erfüllt.'),
      l('Writing a specification can expose a design error before you run the verifier.', 'Beim Schreiben der Spezifikation können Designfehler sichtbar werden.'),
    ],
    limits: [
      l('A proof applies only to the properties in the specification. Review the properties for errors and missing conditions.', 'Ein Beweis gilt für die Properties in der Spezifikation. Prüfe, ob Bedingungen fehlen oder falsch sind.'),
      l('Use code generation or differential tests to connect a verified model with production code.', 'Verbinde ein verifiziertes Modell mit dem Produktionscode. Verwende dazu Code Generation oder Differential Tests.'),
      l('Formal verification requires time to learn and apply. Start with a property where a failure has a large effect.', 'Formal Verification braucht Zeit. Beginne mit einer Property, bei deren Verletzung ein großer Schaden entsteht.'),
    ],
    ai: l(
      'A verifier checks the properties in the specification. A coding agent can write proof code. Review the specification to make sure that the properties are correct.',
      'Ein Verifier prüft die Properties der Spezifikation. Ein Coding-Agent kann Beweiscode schreiben. Prüfe die Spezifikation, damit die Properties das erwartete Verhalten erfassen.',
    ),
    evidence: {
      general: ev('strong',
        f('newcombe2015', 'AWS applied TLA+ to 10 large systems, including DynamoDB and S3, and found subtle design bugs that testing and other techniques had missed.', 'AWS setzte TLA+ in 10 großen Systemen ein, darunter DynamoDB und S3, und fand subtile Entwurfsfehler, die Tests und andere Verfahren übersehen hatten.'),
        f('brooker2025', 'AWS has since expanded to P, runtime checking of logs against specs, property-based testing and fault injection (experience report).', 'AWS hat seither auf P, Laufzeitprüfung von Logs gegen Spezifikationen, Property-Based Testing und Fehlerinjektion ausgeweitet (Erfahrungsbericht).'),
        f('csmith2011', 'Differential testing found no wrong-code bugs in CompCert\'s formally verified middle-end, while finding 325+ in GCC and LLVM.', 'Differential Testing fand keine Fehlübersetzungen in der formal verifizierten Mittelschicht von CompCert, aber über 325 in GCC und LLVM.')),
      ai: ev('moderate',
        f('dafnybench2025', 'On 782 Dafny programs, the best model wrote the required annotations for 68%; verifier error feedback helps.', 'Bei 782 Dafny-Programmen schrieb das beste Modell für 68 % die nötigen Annotationen; Fehlermeldungen des Verifizierers helfen.'),
        f('autoverus2025', 'AutoVerus proved more than 90% of 150 Verus-Bench tasks for Rust code.', 'AutoVerus bewies über 90 % von 150 Verus-Bench-Aufgaben für Rust-Code.'),
        f('clover2024', 'Consistency checks across code, docstring and Dafny annotations accepted up to 87% of correct programs and rejected all adversarial wrong ones.', 'Konsistenzprüfungen zwischen Code, Docstring und Dafny-Annotationen akzeptierten bis zu 87 % der korrekten Programme und wiesen alle absichtlich falschen ab.')),
    },
    variants: [
      { name: l('Model checking (TLA+, P, Alloy)', 'Model Checking (TLA+, P, Alloy)'), text: l('Describe the system as states and steps. The checker examines all reachable states of the model.', 'Beschreibe das System mit Zuständen und Schritten. Der Model Checker prüft alle erreichbaren Zustände des Modells.') },
      { name: l('Program verification (Dafny, Verus, Lean)', 'Programmverifikation (Dafny, Verus, Lean)'), text: l('Add preconditions, postconditions and loop invariants to the code. Use an SMT solver or proof assistant to check them.', 'Ergänze Preconditions, Postconditions und Loop Invariants im Code. Prüfe sie mit einem SMT Solver oder Proof Assistant.') },
      { name: l('Symbolic execution & bounded model checking (KLEE, CBMC, Kani)', 'Symbolische Ausführung & Bounded Model Checking (KLEE, CBMC, Kani)'), text: l('A bounded model checker examines program paths up to a specified limit. AWS uses this type of check in CI.', 'Bounded Model Checking untersucht Programmpfade bis zu einer festgelegten Grenze. AWS verwendet solche Checks in CI.') },
    ],
    tools: { python: ['crosshair'], java: ['openjml'], rust: ['kani', 'verus', 'prusti'], cpp: ['cbmc', 'frama-c', 'klee'], any: ['tlaplus', 'dafny', 'lean', 'z3', 'p-lang', 'rocq'] },
    sim: 'formal',
    guides: ['tla', 'dafny'],
    snippets: [
      { lang: 'any', file: 'Reservation.tla (excerpt)', code: `\\* Two buyers, two pets. The client checks, then orders: two separate steps.
ClientCheck(b) == /\\ pc[b] = "shopping"
                  /\\ pc' = [pc EXCEPT ![b] = IF Free(Current(b)) THEN "ordering" ELSE "rollback"]
                  /\\ UNCHANGED <<position, held, owners>>

\\* Invariant: no pet ever belongs to two buyers.
NoDoubleSale == \\A p \\in Pets: Cardinality(owners[p]) <= 1
\\* TLC finds a 7-step counterexample when the server does not re-check.`, focus: [{ line: [2,3], note: l('Check and order are two separate steps: the gap between them is where a second buyer slips in.', 'Prüfen und Bestellen sind zwei getrennte Schritte: In der Lücke dazwischen schlüpft ein zweiter Käufer durch.') }, { line: 7, note: l('The invariant states what must never happen; the model checker tries to break it.', 'Die Invariante nennt, was nie passieren darf; der Model Checker versucht, sie zu brechen.') }, { line: 8, note: l('The counterexample is a concrete step sequence you can turn into a test.', 'Das Gegenbeispiel ist eine konkrete Schrittfolge, die du in einen Test verwandeln kannst.') }] },
      { lang: 'any', file: 'Allocate.dfy (contract)', code: `method Allocate(amount: nat, weights: seq<nat>) returns (shares: seq<nat>)
  requires amount <= Sum(weights)
  ensures |shares| == |weights|
  ensures Sum(weights) > 0 ==> Sum(shares) == amount
  ensures forall i :: 0 <= i < |shares| ==> shares[i] <= weights[i]`, focus: [{ line: 2, note: l('The precondition is the caller\'s obligation; the proof assumes it and nothing more.', 'Die Vorbedingung ist die Pflicht des Aufrufers; der Beweis nimmt sie an und nichts darüber hinaus.') }, { line: 4, note: l('The key guarantee: the shares sum to the amount for every valid input, not just tested ones.', 'Die zentrale Garantie: Die Anteile ergeben den Betrag für jede gültige Eingabe, nicht nur für getestete.') }, { line: 5, note: l('Every share stays within its weight; the verifier must prove it for all indices.', 'Jeder Anteil bleibt innerhalb seines Gewichts; der Verifier muss das für alle Indizes beweisen.') }] },
    ],
    steps: [
      l('Select the protocol or algorithm where a defect causes the largest problem. Use TLA+ or P for concurrency. Use Dafny, Verus or Kani for algorithms.', 'Wähle das Protokoll oder den Algorithmus mit den größten Fehlerfolgen. Verwende etwa TLA+ für Nebenläufigkeit oder Dafny für einen Algorithmus.'),
      l('Write the required property in plain words. Express it as an invariant or postcondition. Ask a person to review it.', 'Beschreibe die Property zuerst in Worten. Formuliere sie als Invariant oder Postcondition. Lass eine Person die Property prüfen.'),
      l('Write the model or annotate the code. Run the checker. Correct the problems that the checker reports.', 'Schreibe das Modell oder annotiere den Code. Führe den Checker aus. Korrigiere die gemeldeten Probleme.'),
      l('Add a known defect to the model or code. Make sure that the checker gives a counterexample.', 'Füge einen bekannten Fehler hinzu. Prüfe, dass der Checker ein Gegenbeispiel liefert.'),
      l('Generate code from the verified version or compare it with production code in a differential test.', 'Erzeuge Code aus der verifizierten Version oder vergleiche sie mit dem Produktionscode in einem Differential Test.'),
    ],
    done: l('The checker passes on the correct version. It finds a counterexample on a version with a known defect. A differential test compares the model with production code.', 'Der Checker akzeptiert die korrekte Version. Bei einem bekannten Fehler liefert er ein Gegenbeispiel. Ein Differential Test vergleicht das Modell mit dem Produktionscode.'),
    think: [
      q('TLC checked your reservation model with 2 buyers and 2 pets and found no bug. What does that prove about 1,000 buyers?', 'TLC hat dein Reservierungsmodell mit 2 Käufern und 2 Tieren geprüft und keinen Fehler gefunden. Was beweist das für 1.000 Käufer?',
        'Strictly, nothing. In practice, most protocol bugs show up with very small instances ("small scope hypothesis"), which is why small exhaustive checks are so effective.',
        'Streng genommen nichts. In der Praxis zeigen sich die meisten Protokollfehler schon bei sehr kleinen Instanzen („Small Scope Hypothesis“); deshalb sind kleine vollständige Prüfungen so wirksam.'),
      q('Dafny proves your `Allocate` method correct. A customer still gets the wrong discount. How?', 'Dafny beweist deine Methode `Allocate` als korrekt. Ein Kunde bekommt trotzdem den falschen Rabatt. Wie?',
        'The proof covers the Dafny method. Production might run a hand-written TypeScript copy, call it with the wrong weights, or the spec might not say what the business means. Proofs move the question to the spec and its connection to the code.',
        'Der Beweis deckt die Dafny-Methode ab. In Produktion läuft vielleicht eine handgeschriebene TypeScript-Kopie, sie wird mit falschen Gewichten aufgerufen, oder die Spezifikation sagt nicht, was das Geschäft meint. Beweise verlagern die Frage auf die Spezifikation und ihre Verbindung zum Code.'),
      q('Why is a spec that the checker passes instantly suspicious?', 'Warum ist eine Spezifikation verdächtig, die der Checker sofort besteht?',
        'It may be vacuous: an invariant like `TRUE`, or a precondition that no input satisfies. Always confirm the checker fails on a broken version.',
        'Sie könnte leer sein: eine Invariante wie `TRUE` oder eine Vorbedingung, die keine Eingabe erfüllt. Immer bestätigen, dass der Checker auf einer kaputten Fassung scheitert.'),
    ],
    related: ['contracts', 'property-based-tests', 'differential-testing', 'type-systems'],
  },
  {
    id: 'contracts',
    domain: { parts: ['checkout', 'discount-sum', 'invoice'], what: l('Pre- and postconditions guard the discount split between checkout and invoice.', 'Preconditions und Postconditions prüfen die Rabattverteilung zwischen Checkout und Rechnung.') },
    sim: 'dbc',
    name: l('Design by contract & assertions', 'Design by Contract & Assertions'),
    layer: 'verification',
    phases: ['pre', 'post'],
    fromOverview: false,
    oneLiner: l('A contract states what must be true before or after an operation. It can also state an invariant. Runtime checks or proofs can verify these conditions.', 'Ein Contract nennt Bedingungen vor und nach einer Operation. Er kann auch ein Invariant festlegen. Runtime Checks oder Beweise prüfen diese Bedingungen.'),
    catches: l('broken assumptions close to where they break: a negative price, a reservation without a pet, an empty cart at checkout', 'Verletzte Bedingungen wie ein negativer Preis, eine Reservierung ohne Tier oder ein leerer Warenkorb.'),
    intro: l(
      'An invoice has an incorrect value. The error starts three modules earlier. A runtime contract can detect the first operation that gives an incorrect result.',
      'Eine Rechnung enthält einen falschen Wert. Der Wert entsteht drei Module früher. Ein Runtime Contract kann die erste Operation melden, die den falschen Wert erzeugt.',
    ),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('A contract violation can identify the first operation that gives an incorrect result.', 'Ein verletzter Contract kann die erste Operation mit einem falschen Ergebnis zeigen.'),
      l('A runtime contract checks its conditions when a test or request runs the operation.', 'Ein Runtime Contract prüft seine Bedingungen, wenn ein Test oder Request die Operation ausführt.'),
      l('A formal verifier can also prove properties that you first express as runtime contracts.', 'Ein Verifier kann Bedingungen beweisen, die du zuerst als Runtime Contracts formulierst.'),
    ],
    limits: [
      l('A runtime check can increase execution time.', 'Runtime Checks können die Laufzeit erhöhen.'),
      l('A runtime contract examines only the inputs and paths that run. Use generated inputs to exercise more cases.', 'Runtime Contracts prüfen nur die ausgeführten Pfade. Verwende erzeugte Eingaben für weitere Fälle.'),
    ],
    ai: l('Runtime contracts give a coding agent specific results when a fuzz test finds a violation. Review the contracts because they specify the required behavior.', 'Runtime Contracts geben dem Coding-Agenten konkrete Ergebnisse, wenn ein Fuzz Test einen Verstoß findet. Prüfe die Contracts. Sie legen das erwartete Verhalten fest.'),
    evidence: {
      general: ev('moderate', f('kudrjavets2006', 'In two Microsoft components, higher assertion density correlated with significantly lower fault density (correlational).', 'In zwei Microsoft-Komponenten ging höhere Assertion-Dichte mit deutlich geringerer Fehlerdichte einher (korrelativ).')),
      ai: ev('weak', f('clover2024', 'Indirect: requires/ensures contracts served as the spec that LLM-generated code had to satisfy, and consistency checks rejected all adversarial wrong programs.', 'Indirekt: requires/ensures-Verträge dienten als Spezifikation für LLM-generierten Code, und Konsistenzprüfungen wiesen alle absichtlich falschen Programme ab.')),
    },
    variants: [{ name: l('Runtime verification', 'Laufzeitverifikation'), text: l('Compare production logs or traces with a specification. For example, AWS checks log records against P specifications.', 'Vergleiche Produktionslogs oder Traces mit einer Spezifikation. AWS prüft zum Beispiel Log-Einträge mit P-Spezifikationen.') }],
    tools: { php: ['webmozart-assert'], js: ['zod'], python: ['icontract', 'deal', 'crosshair'], java: ['openjml'], rust: ['kani', 'prusti'], cpp: ['gsl'], any: ['dafny'] },
    snippets: [
      { lang: 'js', file: 'allocate.ts', code: `import assert from 'node:assert/strict';

export function allocate(amount: number, weights: number[]): number[] {
  const total = weights.reduce((a, b) => a + b, 0);
  assert(Number.isInteger(amount) && amount >= 0 && amount <= total, 'pre: 0 <= amount <= total');
  const shares = /* ... */ computeShares(amount, weights, total);
  assert(shares.reduce((a, b) => a + b, 0) === (total ? amount : 0), 'post: shares sum to amount');
  assert(shares.every((s, i) => s <= weights[i]), 'post: no share exceeds its weight');
  return shares;
}`, focus: [{ line: 5, note: l('The precondition rejects bad calls at the boundary instead of producing silent wrong shares.', 'Die Vorbedingung weist schlechte Aufrufe an der Grenze ab, statt still falsche Anteile zu liefern.') }, { line: 7, note: l('The postcondition checks the result against the spec; a bug in computeShares fails here.', 'Die Nachbedingung prüft das Ergebnis gegen die Spezifikation; ein Bug in computeShares scheitert hier.') }, { line: 8, note: l('A second postcondition: no share exceeds its weight.', 'Eine zweite Nachbedingung: Kein Anteil überschreitet sein Gewicht.') }] },
      { lang: 'python', file: 'allocate.py', code: `import icontract

@icontract.require(lambda amount, weights: 0 <= amount <= sum(weights))
@icontract.ensure(lambda amount, weights, result: sum(result) == (amount if sum(weights) else 0))
@icontract.ensure(lambda weights, result: all(s <= w for s, w in zip(result, weights)))
def allocate(amount: int, weights: list[int]) -> list[int]:
    ...`, focus: [{ line: 3, note: l('The require decorator documents and enforces what callers must provide.', 'Der require-Decorator dokumentiert und erzwingt, was Aufrufer liefern müssen.') }, { line: 4, note: l('The ensure checks the sum on every call, including those from tests and fuzzers.', 'Das ensure prüft die Summe bei jedem Aufruf, auch aus Tests und Fuzzern.') }, { line: 5, note: l('The contract lives next to the signature, so a changed function cannot drift from its rule unnoticed.', 'Der Vertrag steht neben der Signatur, sodass eine geänderte Funktion nicht unbemerkt von ihrer Regel abdriftet.') }] },
      { lang: 'php', file: 'allocate.php', code: `<?php declare(strict_types=1);
// composer require webmozart/assert
use Webmozart\\Assert\\Assert;

/** @param list<int> $weights @return list<int> */
function allocate(int $amount, array $weights): array
{
    Assert::isList($weights);
    Assert::allInteger($weights);
    Assert::allGreaterThanEq($weights, 0);
    $total = array_sum($weights);
    Assert::range($amount, 0, $total);
    $shares = computeShares($amount, $weights, $total);
    Assert::count($shares, count($weights));
    Assert::allInteger($shares);
    Assert::allGreaterThanEq($shares, 0);
    Assert::same(array_sum($shares), $amount);
    foreach ($shares as $i => $share) {
        Assert::lessThanEq($share, $weights[$i]);
    }
    return $shares;
}
// Unlike PHP's built-in assert(), these checks remain active in production.`, focus: [{ line: [8,12], note: l('Preconditions: validate shape and range before any computation, so errors point at the caller.', 'Vorbedingungen: Form und Bereich prüfen, bevor gerechnet wird, damit Fehler auf den Aufrufer zeigen.') }, { line: [14,17], note: l('Postconditions check the result for count, type, sign and total.', 'Nachbedingungen prüfen das Ergebnis auf Anzahl, Typ, Vorzeichen und Summe.') }, { line: [18,20], note: l('The per-share bound is the rule that catches an allocation that over-charges one pet.', 'Die Grenze je Anteil ist die Regel, die eine Verteilung erwischt, die ein Tier zu stark belastet.') }, { line: 23, note: l('Unlike assert(), these stay active in production, so check cost matters.', 'Anders als assert() bleiben diese in Produktion aktiv, daher zählt der Aufwand der Prüfung.') }] },
    ],
    steps: [l('Write the preconditions and postconditions for two or three core functions in plain words.', 'Beschreibe die Preconditions und Postconditions für zwei oder drei zentrale Funktionen in Worten.'), l('Add assertions or contract decorators for these conditions. Run them in tests and in staging.', 'Füge Assertions oder Contract Decorators für diese Bedingungen hinzu. Führe sie in Tests und in Staging aus.'), l('Run property-based tests or fuzz tests to exercise the contracts.', 'Führe Property-Based Tests oder Fuzzing aus, um die Contracts zu prüfen.')],
    done: l('The code contains the contracts, and the documentation gives their meaning. A test run with generated inputs produces no contract violations.', 'Der Code enthält Contracts. Die Dokumentation erklärt ihre Bedingungen. Ein Testlauf mit erzeugten Eingaben meldet keine Verletzung.'),
    think: [
      q('Should contract checks stay on in production?', 'Sollen Vertragsprüfungen in Produktion aktiv bleiben?', 'Cheap ones, yes: failing fast with a clear message beats silently corrupting data. Expensive ones (sum over a large list) can be sampled or limited to staging.', 'Billige ja: Schnell und klar zu scheitern ist besser als still Daten zu verderben. Teure (Summe über eine große Liste) kann man stichprobenartig oder nur in Staging prüfen.'),
      q('Predict: you add the postcondition "the pet is reserved afterwards" to `reserve`. An agent returns early on an error without throwing. What happens?', 'Vorhersage: Du ergänzt `reserve` um die Nachbedingung „das Tier ist danach reserviert“. Ein Agent kehrt bei einem Fehler früh zurück, ohne eine Exception zu werfen. Was passiert?',
        'The postcondition fails at that exit, so the silent failure becomes a loud one. This is the point: contracts turn "returns quietly" into a checked claim.',
        'Die Nachbedingung schlägt an diesem Ausgang fehl, aus dem stillen Fehler wird ein lauter. Genau das ist der Zweck: Contracts machen aus „kehrt still zurück“ eine geprüfte Aussage.'),
      q('Which bug does a contract miss if it is written after the code by the agent that wrote the code?', 'Welchen Fehler übersieht ein Contract, wenn ihn derselbe Agent nach dem Code schreibt?',
        'A misunderstanding of the requirement: the contract repeats what the code does. A human should write or review the contract; it is the spec.',
        'Ein Missverständnis der Anforderung: Der Contract wiederholt, was der Code tut. Ein Mensch sollte den Contract schreiben oder prüfen; er ist die Spezifikation.'),
    ],
    related: ['formal-verification', 'property-based-tests', 'fuzz-tests', 'type-systems'],
  },
  {
    id: 'sanitizers',
    domain: { parts: ['tests'], what: l('A second CI lane runs the same tests with AddressSanitizer on native code.', 'Ein zusätzlicher CI-Job führt dieselben Tests mit AddressSanitizer für nativen Code aus.') },
    viz: { kind: 'pipeline', mode: 'sanitizers' },
    name: l('Sanitizers', 'Sanitizer'),
    layer: 'verification',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('A sanitizer adds checks that run with the program. These checks can detect memory errors, undefined behavior or data races during execution.', 'Ein Sanitizer ergänzt Checks zur Laufzeit. Er kann Speicherfehler, Undefined Behavior und Data Races erkennen.'),
    catches: l('buffer overflows, use-after-free, integer overflow, uninitialised reads, data races', 'Buffer Overflows, Use-after-free, Integer Overflows, Zugriffe auf nicht initialisierten Speicher und Data Races.'),
    intro: l(
      'A C function reads one byte beyond the end of a buffer. The tests can pass if the read has no visible effect. A sanitizer can report the location of the read.',
      'Eine C-Funktion liest ein Byte nach dem Ende eines Buffers. Der Test kann bestehen, wenn der Zugriff keine sichtbare Folge hat. Ein Sanitizer meldet die Stelle des Zugriffs.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('A sanitizer can detect memory corruption with no visible effect on the program output.', 'Ein Sanitizer kann Speicherfehler erkennen, die das sichtbare Ergebnis noch nicht verändert haben.'), l('Compiler options can enable a sanitizer for the existing test suite.', 'Compiler-Optionen können Sanitizer für vorhandene Tests aktivieren.'),
      l('A sanitizer report can give a stack trace at the operation that caused the error.', 'Der Stack Trace kann die Operation zeigen, die den Fehler verursacht.'),
    ],
    limits: [l('A sanitizer checks only the paths that run. Fuzzing can exercise more paths.', 'Der Sanitizer prüft nur ausgeführte Pfade. Fuzzing kann weitere Pfade ausführen.'), l('A sanitizer can slow the program by approximately a factor of two. Use it in test builds.', 'Ein Sanitizer kann die Laufzeit ungefähr verdoppeln. Verwende ihn in Test Builds.')],
    ai: l('C and C++ code from coding agents can contain memory errors. Run the tests with AddressSanitizer and UndefinedBehaviorSanitizer to detect these errors.', 'C- und C++-Code von Coding-Agenten kann Speicherfehler enthalten. Führe die Tests mit AddressSanitizer und UndefinedBehaviorSanitizer aus.'),
    evidence: {
      general: ev('strong',
        f('asan2012', 'AddressSanitizer detects out-of-bounds accesses and use-after-free with about 73% slowdown and found over 300 previously unknown bugs in Chromium.', 'AddressSanitizer erkennt Zugriffe außerhalb der Grenzen und Use-after-free bei etwa 73 % Verlangsamung und fand über 300 unbekannte Fehler in Chromium.'),
        f('ding2021', 'OSS-Fuzz relies on sanitizers to detect most of the bugs it reports.', 'OSS-Fuzz stützt sich auf Sanitizer, um die meisten gemeldeten Fehler zu erkennen.')),
      ai: ev('weak', f('googlefuzz2024', 'Indirect: the vulnerabilities found by LLM-written fuzz targets were detected through sanitizers.', 'Indirekt: Die Schwachstellen, die LLM-geschriebene Fuzz-Targets fanden, wurden über Sanitizer erkannt.')),
    },
    tools: { go: ['go-race'], rust: ['miri', 'loom', 'sanitizers'], cpp: ['sanitizers', 'valgrind'] },
    snippets: [{ lang: 'cpp', file: 'CMakeLists.txt', code: `# Test build with AddressSanitizer + UndefinedBehaviorSanitizer
add_compile_options(-fsanitize=address,undefined -fno-omit-frame-pointer -g)
add_link_options(-fsanitize=address,undefined)
# Separate build for data races:  -fsanitize=thread`, focus: [{ line: 2, note: l('AddressSanitizer and UBSan catch memory errors and undefined behaviour that tests pass silently.', 'AddressSanitizer und UBSan finden Speicherfehler und undefiniertes Verhalten, die Tests still durchlassen.') }, { line: 3, note: l('Link with the same flags, or the sanitizer runtime is missing and the instrumented build fails.', 'Mit denselben Flags linken, sonst fehlt die Sanitizer-Runtime und der instrumentierte Build scheitert.') }, { line: 4, note: l('Race detection needs its own build; it cannot be combined with the address sanitizer.', 'Race-Erkennung braucht einen eigenen Build; sie lässt sich nicht mit dem Address Sanitizer kombinieren.') }] }, { lang: 'go', file: 'Makefile', code: `test-race:
\tgo test -race ./...`, focus: [{ line: 1, note: l('A dedicated CI target means race checks run on every change, not when someone remembers.', 'Ein eigenes CI-Target heißt: Race-Checks laufen bei jeder Änderung, nicht wenn jemand daran denkt.') }, { line: 2, note: l('The race detector only sees executed paths, so concurrent tests are what make it useful.', 'Der Race Detector sieht nur ausgeführte Pfade, daher machen nebenläufige Tests ihn erst nützlich.') }] }],
    steps: [l('Add a CI job for the full test suite. Use ASan and UBSan for C or C++. Use the race detector for Go or Miri for Rust.', 'Füge einen CI-Job für alle Tests hinzu. Verwende ASan und UBSan für C oder C++. Verwende den Race Detector für Go oder Miri für Rust.'), l('Enable sanitizers when you run the fuzz targets.', 'Aktiviere die Sanitizer für die Fuzz Targets.'), l('Make the test fail if a sanitizer reports an error.', 'Lass den Test fehlschlagen, wenn ein Sanitizer einen Fehler meldet.')],
    done: l('The sanitizer job passes on the current code. The job fails if a test reads beyond the end of a buffer.', 'Der Sanitizer-Job besteht für den aktuellen Code. Er schlägt bei einem Test mit einem Zugriff außerhalb des Buffers fehl.'),
    think: [
      q('A test passes without ASan and crashes with it. Was the test wrong before?', 'Ein Test besteht ohne ASan und stürzt mit ASan ab. War der Test vorher falsch?', 'No, the code was wrong all along. Without the sanitizer, the out-of-bounds write happened to hit harmless memory. In production it might not.', 'Nein, der Code war die ganze Zeit falsch. Ohne Sanitizer traf das Schreiben außerhalb der Grenzen zufällig harmlosen Speicher. In Produktion vielleicht nicht.'),
      q('Predict: an agent writes C++ for a pet-name parser with a fixed 32-byte buffer. A 40-character name passes all tests. What does ASan report on a test with such a name?', 'Vorhersage: Ein Agent schreibt C++ für einen Parser von Tiernamen mit festem 32-Byte-Puffer. Ein Name mit 40 Zeichen besteht alle Tests. Was meldet ASan bei einem Test mit so einem Namen?',
        'A stack- or heap-buffer-overflow with the exact line. Without the sanitizer, the overflow may silently corrupt neighbouring memory and the test stays green.',
        'Einen Stack- oder Heap-Buffer-Overflow mit der genauen Zeile. Ohne Sanitizer beschädigt der Überlauf womöglich still benachbarten Speicher, und der Test bleibt grün.'),
      q('When are sanitizers not useful?', 'Wann sind Sanitizer nicht nützlich?',
        'In memory-safe languages for ordinary logic bugs, or when the code never runs under test. They find memory errors and undefined behaviour, not wrong results.',
        'In speichersicheren Sprachen bei gewöhnlichen Logikfehlern oder wenn der Code im Test nie läuft. Sie finden Speicherfehler und undefiniertes Verhalten, keine falschen Ergebnisse.'),
    ],
    related: ['fuzz-tests', 'unit-tests', 'static-analysis'],
  },
  {
    id: 'tap-compare',
    domain: { parts: ['rollout', 'api'], what: l('Copies of real requests go to the old and the new version; a diff compares them.', 'Tap Compare sendet Kopien echter Requests an beide Versionen und vergleicht die Antworten.') },
    viz: { kind: 'traffic', mode: 'tap-compare' },
    name: l('Tap compare', 'Tap Compare'),
    layer: 'verification',
    phases: ['deploy'],
    fromOverview: true,
    oneLiner: l('Tap compare sends copies of requests to two versions of a service. It records differences between their responses.', 'Tap Compare sendet Kopien von Requests an zwei Versionen eines Service. Der Vergleich meldet Unterschiede zwischen den Antworten.'),
    catches: l('behaviour differences that only real traffic triggers: odd inputs, rare paths, data no test fixture has', 'Unterschiede bei seltenen Eingaben oder Codepfaden, die in den Testdaten fehlen.'),
    intro: l(
      'A coding agent rewrites the search service. The tests use a fixed set of queries. Copies of real requests can show differences that the test queries do not show.',
      'Ein Coding-Agent schreibt die Suche neu. Die Tests verwenden eine feste Menge von Anfragen. Kopien echter Requests können Abweichungen zeigen, die in diesen Tests fehlen.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('Live requests give inputs for a differential test.', 'Live-Requests liefern Eingaben für einen Differential Test.'), l('Compare two old instances to identify fields that normally differ, such as timestamps and IDs.', 'Vergleiche zwei alte Instanzen. So findest du Felder, die normalerweise abweichen, etwa Zeitstempel oder IDs.'),
      l('A sample of production requests can include rare combinations that the test fixtures omit.', 'Stichproben aus Produktion können Kombinationen enthalten, die in Fixtures fehlen.'),
    ],
    limits: [
      l('Prevent the comparison version from performing external write operations.', 'Unterbinde externe Schreibzugriffe der Vergleichsversion.'),
      l('Remove personal data from comparison reports. Limit access to the reports.', 'Entferne personenbezogene Daten aus den Berichten. Begrenze den Zugriff.'),
    ],
    ai: l('Use samples of real requests to compare a large rewrite with the current version. The comparison can find differences before the new version serves users.', 'Vergleiche einen umfangreichen Rewrite mit der aktuellen Version. Verwende eine Stichprobe echter Requests. Der Vergleich kann Abweichungen vor dem Release finden.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['diffy', 'envoy'] },
    snippets: [{ lang: "js", file: "compare-responses.test.ts",
      description: l("Run this Vitest example to compare two response bodies. The comparison ignores an identified volatile field. Use captured responses from read-only requests. Keep the reserved owner in the comparison.",
        "Führe das Vitest-Beispiel aus, um zwei Response Bodies zu vergleichen. Der Vergleich ignoriert ein Feld, dessen Wert sich erwartungsgemäß ändert. Verwende aufgezeichnete Antworten auf lesende Requests. Behalte die reservierende Person im Vergleich."),
      code: `import { expect, test } from 'vitest';
type Reply = { petId: string; owner: string; requestId: string };
const normalise = ({ requestId: _ignored, ...body }: Reply) => body;
test('candidate preserves the reservation owner', () => {
  const reference = { petId: 'rex', owner: 'anna', requestId: 'old-1' };
  const candidate = { petId: 'rex', owner: 'anna', requestId: 'new-2' };
  expect(normalise(candidate)).toEqual(normalise(reference));
  // Change candidate.owner to 'ben': this comparison must fail.
});`, focus: [{ line: 3, note: l('Normalise away fields that legitimately differ, such as request IDs; compare only what must match.', 'Felder entfernen, die legitim abweichen, etwa Request-IDs; nur vergleichen, was übereinstimmen muss.') }, { line: 7, note: l('The comparison itself: same owner for the same pet in the old and the new system.', 'Der Vergleich selbst: derselbe Besitzer für dasselbe Tier im alten und im neuen System.') }, { line: 8, note: l('Prove the check can fail: change the owner and watch it go red.', 'Beweise, dass die Prüfung fehlschlagen kann: Ändere den Besitzer und sieh zu, wie sie rot wird.') }] }],
    steps: [l('Send copies of a sample of read-only requests to the old and new versions.', 'Sende Kopien einer Stichprobe lesender Requests an beide Versionen.'), l('Compare the responses field by field. Compare two old instances to measure differences that also occur without the change.', 'Vergleiche die Antworten Feld für Feld. Vergleiche auch zwei alte Instanzen, um normale Abweichungen zu ermitteln.'), l('Examine each unexplained difference before you increase traffic to the new version.', 'Untersuche jede unerklärte Abweichung, bevor du den Traffic verlagerst.')],
    done: l('The comparison uses one day of sampled requests. The report gives a reason for each difference between the two versions.', 'Der Vergleich nutzt Stichproben aus einem Tag. Zu jeder Abweichung zwischen den Versionen gibt es eine Erklärung.'),
    think: [
      q('Why compare two instances of the old version with each other too?', 'Warum auch zwei Instanzen der alten Version miteinander vergleichen?', 'To learn which differences are noise (timestamps, random IDs, ordering). Whatever differs between two old instances is not a bug in the new one.', 'Um zu lernen, welche Unterschiede Rauschen sind (Zeitstempel, Zufalls-IDs, Reihenfolge). Was sich zwischen zwei alten Instanzen unterscheidet, ist kein Fehler der neuen.'),
      q('Predict: the new search returns the same pets in a different order for 3% of real queries. What does the comparison show, and what do you do?', 'Vorhersage: Die neue Suche liefert für 3 % der echten Anfragen dieselben Tiere in anderer Reihenfolge. Was zeigt der Vergleich, und was tust du?',
        'A concentrated group of differences you can inspect. Decide whether the order is part of the contract; if yes it is a bug, if not, add it to the ignore rules.',
        'Eine gebündelte Gruppe von Unterschieden, die du untersuchen kannst. Entscheide, ob die Reihenfolge zum Vertrag gehört; wenn ja, ist es ein Fehler, wenn nicht, kommt sie in die Ignore-Regeln.'),
      q('Why can you not tap-compare a request that reserves a pet?', 'Warum kannst du eine Anfrage, die ein Tier reserviert, nicht per Tap Compare vergleichen?',
        'Both versions would perform the write and one of them would see the pet as already taken. Only read-only requests, or ones sent to isolated copies of the data, can be compared.',
        'Beide Versionen würden schreiben, und eine sähe das Tier als bereits vergeben. Nur lesende Anfragen oder solche gegen isolierte Datenkopien lassen sich vergleichen.'),
    ],
    related: ['differential-testing', 'shadowing', 'teeing', 'canarying'],
  },
  {
    id: 'shadowing',
    domain: { parts: ['rollout', 'reserve'], what: l('A new reservation service gets copies of real requests; users get the old answers.', 'Die neue Version erhält Kopien echter Requests, während die bisherige Version den Nutzern antwortet.') },
    viz: { kind: 'traffic', mode: 'shadowing' },
    name: l('Shadowing', 'Shadowing (Schattenbetrieb)'),
    layer: 'verification',
    phases: ['deploy'],
    fromOverview: true,
    oneLiner: l('A shadow deployment sends copies of live requests to a new version. Users continue to receive responses from the live version.', 'Ein Shadow Deployment sendet Kopien von Live-Requests an die neue Version. Nutzer erhalten weiter Antworten von der bisherigen Version.'),
    catches: l('crashes, latency, resource use and errors of the new version under real load, with zero user impact', 'Abstürze, hohe Latenz und hoher Ressourcenverbrauch der neuen Version unter Produktionslast.'),
    intro: l(
      'The reservation service moves to a new database. The tests pass, but performance under live traffic is unknown. A shadow deployment can measure the new version with copies of live traffic.',
      'Der Reservierungsservice wechselt die Datenbank. Die Tests bestehen. Das Verhalten bei Produktionslast ist offen. Ein Shadow Deployment kann die neue Version mit Kopien der Live-Requests messen.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('A shadow deployment can measure a new version with live traffic. Users receive results from the current version.', 'Ein Shadow Deployment nutzt echte Requests. Nutzer erhalten die Antwort der bisherigen Version.'), l('Use a shadow deployment to examine a new database, service or region before migration.', 'Prüfe eine neue Datenbank, einen neuen Service oder eine neue Region vor der Migration.'),
      l('A shadow deployment can show how the new version responds to unusual data and request volumes.', 'Ein Shadow Deployment zeigt das Verhalten bei ungewöhnlichen Eingaben und realer Last.'),
    ],
    limits: [l('Prevent the shadow deployment from sending mail, charging payments or changing production data.', 'Verhindere, dass das Shadow Deployment Mails sendet, Zahlungen auslöst oder Produktionsdaten ändert.'), l('The shadow version needs additional infrastructure while it runs.', 'Das Shadow Deployment braucht zusätzliche Infrastruktur für die Laufzeit.')],
    ai: l('Run the shadow version for a specified period. Give its error logs and latency measurements to the coding agent.', 'Lass das Shadow Deployment für eine festgelegte Zeit laufen. Gib dem Coding-Agenten die Error Logs und die Latenzmesswerte.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['envoy', 'istio'] },
    snippets: [{ lang: "any", file: "mirror-route.yaml",
      description: l("Add this fragment to an Envoy configuration with primary and shadow clusters. Mirror only read-only GET requests. Examine the shadow logs. The proxy discards the shadow responses. Prevent writes and notifications from the shadow.",
        "Füge das Fragment in eine Envoy-Konfiguration mit Primary Cluster und Shadow Cluster ein. Spiegele nur lesende GET-Requests. Prüfe die Shadow Logs. Der Proxy verwirft die Antworten des Shadow Deployment. Unterbinde Schreibzugriffe und Benachrichtigungen."),
      code: `match:
  prefix: /pets/
  headers:
    - name: ':method'
      string_match: { exact: GET }
route:
  cluster: primary
  request_mirror_policies:
    - cluster: shadow
      runtime_fraction:
        default_value: { numerator: 10, denominator: HUNDRED }`, focus: [{ line: 5, note: l('Only GET is mirrored: shadow traffic must never cause side effects such as a reservation.', 'Nur GET wird gespiegelt: Schatten-Traffic darf nie Nebenwirkungen wie eine Reservierung auslösen.') }, { line: [8,9], note: l('The mirror sends a copy to the shadow cluster; users only see the primary answer.', 'Der Mirror schickt eine Kopie an den Shadow-Cluster; Nutzer sehen nur die Antwort des Primary.') }, { line: [10,11], note: l('A small fraction limits load on the shadow while still giving real traffic to compare.', 'Ein kleiner Anteil begrenzt die Last auf dem Shadow und liefert trotzdem echten Traffic zum Vergleichen.') }] }],
    steps: [l('Configure the proxy to send copies of a percentage of requests to the shadow deployment.', 'Konfiguriere den Proxy so, dass er Kopien eines Teils der Requests an das Shadow Deployment sendet.'), l('Use test substitutes for external operations that would cause side effects.', 'Ersetze externe Aktionen mit Side Effects durch Testersatz.'), l('Compare the shadow error rate, latency and resource use with the production measurements.', 'Vergleiche Fehlerrate, Latenz und Ressourcenverbrauch mit den Messwerten aus Produktion.')],
    done: l('The shadow version runs for the specified time. Its error rate and latency stay within the limits. It causes no external side effects.', 'Die Shadow-Version läuft für die vereinbarte Zeit. Fehlerrate und Latenz bleiben innerhalb der Grenzwerte. Es gibt keine externen Side Effects.'),
    think: [
      q('Shadowing vs. tap compare: what is the difference?', 'Shadowing vs. Tap Compare: Was ist der Unterschied?', 'Shadowing watches how the new version behaves (errors, latency). Tap compare additionally checks what it answers, response by response, against the old version.', 'Shadowing beobachtet, wie sich die neue Version verhält (Fehler, Latenz). Tap Compare prüft zusätzlich, was sie antwortet, Antwort für Antwort gegen die alte Version.'),
      q('Predict: the shadow version of the reservation service is not stubbed and writes to the real database. What happens?', 'Vorhersage: Die Shadow-Version des Reservierungsdienstes ist nicht abgesichert und schreibt in die echte Datenbank. Was passiert?',
        'Every request is applied twice, so pets are reserved twice or conflict with each other. Point the shadow at its own copy of the data and stub emails and payments.',
        'Jede Anfrage wird doppelt ausgeführt, Tiere werden doppelt reserviert oder kollidieren. Den Shadow auf eine eigene Datenkopie zeigen lassen und E-Mails sowie Zahlungen stubben.'),
      q('The shadow shows no errors for a week. Which bug can it still hide?', 'Der Shadow zeigt eine Woche lang keine Fehler. Welcher Fehler kann sich trotzdem verstecken?',
        'A wrong but well-formed answer, since responses are discarded. Without comparing them (tap compare) or a business-level check, a wrong price looks like success.',
        'Eine falsche, aber wohlgeformte Antwort, da die Antworten verworfen werden. Ohne Vergleich (Tap Compare) oder fachliche Prüfung sieht ein falscher Preis wie ein Erfolg aus.'),
    ],
    related: ['tap-compare', 'teeing', 'canarying'],
  },
  {
    id: 'canarying',
    domain: { parts: ['rollout', 'monitoring'], what: l('The petstore increases traffic from 5% to 100% if the new version passes the error-rate checks.', 'Die neue Version erhält bei bestandenen Checks schrittweise 5 bis 100 % des Traffic.') },
    name: l('Canarying', 'Canary-Releases'),
    layer: 'verification',
    phases: ['release'],
    fromOverview: true,
    core: true,
    oneLiner: l('In a canary release, a new version receives a small percentage of traffic first. If its health metrics fail the checks, the rollout system restores the previous version.', 'Bei einem Canary Release erhält die neue Version zuerst einen kleinen Anteil der Requests. Wenn die Messwerte die Grenzwerte verletzen, startet das System einen Rollback.'),
    catches: l('Failures that occur only with production users, data or traffic levels. The limited rollout decreases the number of affected users.', 'Fehler unter Produktionsbedingungen, die zunächst nur einen Teil der Nutzer betreffen.'),
    intro: l(
      'A new release passes all checks but fails for customers with a rare payment method. A canary limits the initial release to a small group. The rollout stops if the error rate exceeds the limit.',
      'Ein Release besteht alle Checks. Bei Kunden mit einer seltenen Zahlungsart tritt ein Fehler auf. Ein Canary begrenzt das Release zuerst auf eine kleine Gruppe. Der Rollout stoppt, wenn die Fehlerrate den Grenzwert überschreitet.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('A limited rollout decreases the number of users that a defect can affect.', 'Ein begrenzter Rollout verringert die Zahl der Nutzer, die ein Fehler betreffen kann.'), l('Automatic comparison with baseline metrics can cause a rollback without manual action.', 'Der automatische Vergleich mit der Baseline kann einen Rollback auslösen.'),
      l('The canary operates in production with real users. A separate test environment is not necessary for this check.', 'Der Canary verwendet echte Requests in Produktion. Für diesen Check ist keine separate Umgebung nötig.'),
    ],
    limits: [l('A canary can find only failures that affect its health metrics.', 'Ein Canary kann nur Fehler erkennen, die seine Metriken verändern.'), l('Some failures can occur after the canary period. Examples include memory leaks and data corruption.', 'Manche Fehler werden erst später sichtbar. Beispiele sind Speicherlecks und Datenkorruption.')],
    ai: l('A canary can find failures before the new version receives all traffic. Use automatic analysis and rollback. Manual dashboard review for every release can delay the response to a failure.', 'Ein Canary kann Fehler finden, bevor die neue Version alle Requests erhält. Verwende eine automatische Analyse und einen automatischen Rollback. Manuelles Dashboard-Review kann die Reaktion auf einen Fehler verzögern.'),
    evidence: { general: ev('moderate', f('gandalf2020', 'Gandalf analyzed Azure deployments in production for more than 18 months. It automatically stopped rollouts that failed its checks.', 'Gandalf, Azures Analysedienst für sichere Deployments, lief über 18 Monate in Produktion und stoppte fehlerhafte Rollouts automatisch.')), ai: none() },
    tools: { any: ['argo-rollouts', 'flagger', 'istio', 'prometheus'] },
    sim: 'canary',
    snippets: [{ lang: 'any', file: 'rollout.yaml (Argo Rollouts)', code: `strategy:
  canary:
    steps:
      - setWeight: 5
      - analysis: { templates: [{ templateName: error-rate }] }
      - setWeight: 25
      - pause: { duration: 10m }
      - setWeight: 100
# error-rate: fail if 5xx rate of canary > baseline + 1%  →  automatic rollback`, focus: [{ line: 4, note: l('At the first step, the canary receives 5% of traffic.', 'Mit 5 % starten: Ein schlechter Release erreicht wenige Nutzer, bevor etwas bewertet wird.') }, { line: 5, note: l('The system increases the traffic share only after the canary passes the analysis.', 'Der Canary geht nur weiter, wenn die Analyse besteht. Diese Zeile ist das Sicherheitsnetz.') }, { line: 7, note: l('The pause gives slow failures, such as memory leaks, time to become visible before full rollout.', 'Eine Pause gibt langsamen Fehlern, etwa Lecks, Zeit aufzutreten, bevor der volle Rollout kommt.') }, { line: 9, note: l('The example sets a limit of one percentage point above the baseline error rate. If the canary error rate exceeds the limit, the system starts a rollback.', 'Die Rollback-Regel ist explizit: Canary um 1 % schlechter als die Baseline bedeutet automatischen Rollback.') }] }],
    steps: [l('Select two or three health metrics to compare with the baseline. Examples include error rate, p95 latency and reservations per minute.', 'Wähle zwei oder drei Messwerte für den Vergleich mit der Baseline. Beispiele sind Fehlerrate, p95-Latenz und Reservierungen pro Minute.'), l('Configure the rollout to increase the canary share from 5% to 25% to 100%. Run automatic analysis between steps.', 'Konfiguriere den Rollout mit 5 %, 25 % und 100 % Traffic. Führe zwischen den Stufen eine automatische Analyse aus.'), l('Deploy a version with a known failure to staging. Make sure that the system starts a rollback.', 'Deploye in Staging eine Version mit einem bekannten Fehler. Prüfe, dass das System einen Rollback startet.')],
    done: l('The system automatically restores the previous version at the first step when the new version has the known failure.', 'Der Rollout erkennt den bekannten Fehler auf der ersten Stufe. Das System stellt die vorherige Version automatisch wieder her.'),
    think: [
      q('The canary and the baseline have the same error rate. Which failures can still occur?', 'Der Canary zeigt dieselbe Fehlerrate wie die Baseline. Warum könnte er trotzdem kaputt sein?', 'An incorrect price or a duplicate reservation can occur with HTTP status 200. Include a business metric that can show these failures.', 'Fehler sind nicht das einzige Versagen. Er könnte mit Status 200 falsche Preise liefern oder still doppelt buchen. Deshalb gehört eine Geschäftsmetrik in die Analyse.'),
      q('The canary receives 5% of traffic. A defect affects customers with a voucher, who make up 1% of users. What can the analysis show?', 'Vorhersage: Der Canary bekommt 5 % des Verkehrs, und der Fehler betrifft nur Kunden mit Gutschein, 1 % der Nutzer. Was sieht die Analyse?',
        'If traffic is random, approximately 0.05% of all requests are both in the canary and affected. The effect can be difficult to see in aggregate metrics. Add a metric for voucher requests or send voucher traffic to the canary explicitly.',
        'Fast kein Signal: Etwa 0,05 % der Requests sind betroffen, weit im Rauschen. Eine Metrik für diesen Pfad ergänzen oder Gutschein-Nutzer gezielt auf den Canary leiten.'),
      q('What changes when a coding agent can start a release?', 'Was ändert sich, wenn ein Agent Releases auslösen kann?',
        'Coding agents can start releases more frequently. People can have less time to review each release. Require automatic analysis and rollback. Let the automatic check determine when the release can receive 100% of traffic.',
        'Releases werden häufiger und weniger geprüft, daher zählen automatische Analyse und Rollback mehr. Die Entscheidung über die Ausweitung auf 100 % bleibt beim automatischen Gate, nicht beim Agenten.'),
    ],
    related: ['feature-flags', 'traffic-shaping', 'monitoring', 'smoke-tests'],
  },
  {
    id: 'traffic-shaping',
    domain: { parts: ['rollout', 'api'], what: l('A proxy splits traffic between v1 and v2 and limits a slow version.', 'Ein Proxy verteilt Requests auf v1 und v2 und begrenzt die Rate für die neue Version.') },
    viz: { kind: 'traffic', mode: 'traffic-shaping' },
    name: l('Traffic shaping', 'Traffic Shaping (Verkehrssteuerung)'),
    layer: 'verification',
    phases: ['release'],
    fromOverview: true,
    oneLiner: l('Traffic shaping controls the destination, rate and volume of requests. You can use it to limit traffic to a new version.', 'Traffic Shaping legt Ziel, Rate und Menge von Requests fest. So lässt sich der Traffic zu einer neuen Version begrenzen.'),
    catches: l('overload of a new version, a bad version reaching everyone at once, retries that snowball', 'Überlastung einer neuen Version und zu viele Retries, die andere Services belasten.'),
    intro: l(
      'A new version repeats each failed request three times. These retries can overload the database under full traffic. Traffic shaping limits the requests that reach the version.',
      'Die neue Version wiederholt jeden fehlgeschlagenen Request dreimal. Bei voller Last können die Retries die Datenbank überlasten. Traffic Shaping begrenzt die Requests an diese Version.',
    ),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('Weighted routing, rate limits and circuit breakers let you control traffic during a rollout.', 'Weighted Routing, Rate Limits und Circuit Breakers helfen, den Traffic beim Rollout zu steuern.'), l('A request header can send internal users to a new version for early testing.', 'Ein Request-Header kann interne Nutzer zur neuen Version leiten.'),
      l('A rate limit can protect a dependency when a new version sends many retries.', 'Ein Rate Limit kann eine Abhängigkeit vor vielen Retries schützen.'),
    ],
    limits: [
      l('Traffic shaping requires a proxy or service mesh that the team must configure.', 'Das Team muss einen Proxy oder Service Mesh konfigurieren.'),
      l('An incorrect weight can send all traffic to a faulty version.', 'Ein falsches Gewicht kann alle Requests an eine fehlerhafte Version leiten.'),
    ],
    ai: l('Use a routing rule to send requests from internal users to the new version in the same environment.', 'Verwende eine Routing-Regel, um Requests von internen Nutzern in derselben Umgebung an die neue Version zu senden.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['envoy', 'istio', 'argo-rollouts', 'flagger'] },
    snippets: [{ lang: "any", file: "weighted-route.yaml",
      description: l("This Envoy route sends approximately 5% of matching requests to the candidate. Users receive responses from that version. Use the existing cluster definitions. Test the route in staging. Use a separate check for error rates and rollback.",
        "Diese Envoy-Route sendet ungefähr 5 % der passenden Requests an die neue Version. Nutzer erhalten deren Antworten. Verwende die vorhandenen Cluster. Teste die Route in Staging. Richte Fehleranalyse und Rollback separat ein."),
      code: `match: { prefix: /pets/ }
route:
  weighted_clusters:
    clusters:
      - name: stable
        weight: 95
      - name: candidate
        weight: 5
# Before increasing candidate weight:
# compare errors/latency and exercise the rollback procedure.`, focus: [{ line: [5,6], note: l('The stable version keeps almost all traffic, so most users never meet the candidate.', 'Die stabile Version behält fast den ganzen Traffic, sodass die meisten Nutzer den Kandidaten nie sehen.') }, { line: 8, note: l('The weight is the blast radius: raise it only after the numbers look good.', 'Das Gewicht ist der Wirkungsradius: Erhöhe es erst, wenn die Zahlen gut aussehen.') }, { line: 10, note: l('Exercise the rollback before you need it; an untested rollback is a hope, not a plan.', 'Probiere den Rollback aus, bevor du ihn brauchst; ein ungetesteter Rollback ist Hoffnung, kein Plan.') }] }],
    steps: [l('Use a proxy that supports weighted routing and routing by request header.', 'Verwende einen Proxy mit Weighted Routing und Routing nach Request-Header.'), l('Use a request header to send internal users to the new version. Then shift a small percentage of public traffic.', 'Leite interne Nutzer über einen Header zur neuen Version. Verteile danach einen kleinen Anteil des öffentlichen Traffic auf diese Version.'), l('Set rate limits and circuit breakers for the new version.', 'Setze Rate Limits und Circuit Breakers für die neue Version.')],
    done: l('Each release has a configurable traffic split. A request header can route internal users to the new version.', 'Jedes Release hat eine einstellbare Traffic-Verteilung. Ein Request-Header leitet interne Nutzer zur neuen Version.'),
    think: [
      q('Why can retries make an outage worse?', 'Warum können Wiederholungsversuche einen Ausfall verschlimmern?', 'A struggling service gets more requests exactly when it can handle fewer. Retry budgets and circuit breakers shed load instead of multiplying it.', 'Ein angeschlagener Dienst bekommt mehr Anfragen genau dann, wenn er weniger verkraftet. Retry-Budgets und Circuit Breaker werfen Last ab, statt sie zu vervielfachen.'),
      q('Predict: a circuit breaker opens when the pet-service is slow. What do users of the search see, and what should the code do?', 'Vorhersage: Ein Circuit Breaker öffnet, wenn der Tierdienst langsam ist. Was sehen Nutzer der Suche, und was sollte der Code tun?',
        'Without a fallback, errors immediately instead of waiting. A good fallback returns cached results or a clear "try again" message. Test the open state.',
        'Ohne Fallback sofort Fehler statt Warten. Ein guter Fallback liefert zwischengespeicherte Ergebnisse oder eine klare Meldung „später erneut versuchen“. Den offenen Zustand testen.'),
      q('When is traffic shaping more than you need?', 'Wann ist Traffic Shaping mehr, als du brauchst?',
        'For a small service with one instance and few users: a simple deploy with a quick rollback is enough. The proxy and mesh add their own failure modes.',
        'Bei einem kleinen Dienst mit einer Instanz und wenigen Nutzern: Ein einfaches Deployment mit schnellem Rollback genügt. Proxy und Mesh bringen eigene Fehlerarten mit.'),
    ],
    related: ['canarying', 'feature-flags', 'chaos-testing'],
  },
  {
    id: 'feature-flags',
    domain: { parts: ['rollout', 'reserve'], what: l('The flag `reservation-v2` turns the new reservation flow on and off.', 'Das Flag `reservation-v2` schaltet den neuen Reservierungsablauf ein und aus.') },
    name: l('Feature flagging', 'Feature Flags'),
    layer: 'verification',
    phases: ['release'],
    fromOverview: true,
    oneLiner: l('A feature flag controls whether selected users can use code that is already in production. You can disable the feature while the service runs.', 'Ein Feature Flag legt fest, wer eine bereitgestellte Funktion verwenden kann. Die Funktion lässt sich bei laufendem Service deaktivieren.'),
    catches: l('bad features in production, with a kill switch that is faster than a rollback', 'Funktionen mit Fehlern in Produktion, die sich mit einem Feature Flag abschalten lassen.'),
    intro: l(
      'A checkout change charges customers with vouchers twice. A feature flag can disable the new checkout. The rest of the release can continue to operate.',
      'Nach einer Checkout-Änderung zahlen Kunden mit Gutschein zweimal. Das Feature Flag deaktiviert den neuen Checkout. Die anderen Teile des Release laufen weiter.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('A flag lets you deploy a feature before users can use it.', 'Mit einem Feature Flag kannst du Code bereitstellen, bevor Nutzer die Funktion verwenden.'), l('A flag can enable a feature for staff, then for a small percentage of users, then for everyone.', 'Aktiviere die Funktion zuerst für Mitarbeitende. Erweitere den Anteil danach schrittweise.'),
      l('Staff can test a feature with production data before customers use it.', 'Mitarbeitende können die Funktion vor der Freigabe mit Produktionsdaten prüfen.'),
    ],
    limits: [l('Each active flag adds possible combinations for tests. Remove a flag when it is no longer necessary.', 'Jedes aktive Flag fügt mögliche Kombinationen für Tests hinzu. Entferne es, wenn du es nicht mehr brauchst.'), l('Check flag settings as you check other configuration changes.', 'Prüfe Änderungen an Flags wie andere Konfigurationsänderungen.')],
    ai: l('Use a feature flag for a change that you may need to disable in production. The flag can disable the feature without a new deployment.', 'Verwende ein Feature Flag für eine Änderung, die du in Produktion deaktivieren können musst. Das Flag deaktiviert die Funktion ohne neuen Deploy.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['openfeature', 'unleash', 'flagsmith', 'growthbook'] },
    sim: 'flags',
    snippets: [{ lang: 'js', file: 'reserve.ts', code: `import { OpenFeature } from '@openfeature/server-sdk';
const flags = OpenFeature.getClient();

export async function reserve(petId: PetId, person: PersonId) {
  const useNewFlow = await flags.getBooleanValue('reservation-v2', false, { targetingKey: person });
  return useNewFlow ? reserveV2(petId, person) : reserveV1(petId, person);
}`, focus: [{ line: 5, note: l('The default false is the fallback if the flag service fails; targetingKey keeps each person on one flow.', 'Der Default false ist der Fallback, wenn der Flag-Dienst ausfällt; targetingKey hält jede Person im selben Ablauf.') }, { line: 6, note: l('Both flows stay deployed, so switching the flag off is the rollback, with no redeploy.', 'Beide Abläufe bleiben deployt, sodass das Abschalten des Flags der Rollback ist, ohne Redeploy.') }] }],
    steps: [l('Use OpenFeature as the interface to the flag service.', 'Verwende OpenFeature als Schnittstelle zum Feature-Flag-Service.'), l('Add a feature flag with the default state off. Test both states.', 'Füge ein Feature Flag hinzu. Setze den Standardzustand auf aus. Teste beide Zustände.'), l('Give each flag an owner and an expiration date. Make CI fail if a flag expires.', 'Weise jedem Flag einen Verantwortlichen und ein Ablaufdatum zu. Lass CI fehlschlagen, wenn ein Flag abläuft.')],
    done: l('You can disable the feature in production in less than one minute. Tests cover both flag states. The flag has an expiration date.', 'Die Funktion lässt sich in Produktion in weniger als einer Minute deaktivieren. Tests prüfen beide Zustände. Das Flag hat ein Ablaufdatum.'),
    think: [
      q('You have 10 boolean flags. How many combinations could your code run in?', 'Du hast 10 boolesche Flags. In wie vielen Kombinationen könnte dein Code laufen?', '2¹⁰ = 1,024. Nobody tests them all, which is why flags need to be short-lived and independent.', '2¹⁰ = 1.024. Niemand testet alle; deshalb müssen Flags kurzlebig und unabhängig sein.'),
      q('Predict: a flag for the new voucher pricing is on for 10% of users. What must be true for the totals in your reports to stay meaningful?', 'Vorhersage: Ein Flag für die neue Gutschein-Preisberechnung ist für 10 % der Nutzer aktiv. Was muss gelten, damit die Summen in deinen Reports aussagekräftig bleiben?',
        'Every order records which variant priced it, and the assignment is stable per user. Otherwise one customer sees two prices and you cannot compare the groups.',
        'Jede Bestellung hält fest, welche Variante sie berechnet hat, und die Zuweisung ist pro Nutzer stabil. Sonst sieht ein Kunde zwei Preise, und die Gruppen lassen sich nicht vergleichen.'),
      q('An agent adds a flag and never removes it. What is the cost over a year?', 'Ein Agent ergänzt ein Flag und entfernt es nie. Was kostet das über ein Jahr?',
        'Dead branches, untested combinations and code nobody dares to delete. An expiry date that fails CI, and a task to remove the flag, keeps the count low.',
        'Tote Zweige, ungetestete Kombinationen und Code, den sich niemand zu löschen traut. Ein Ablaufdatum, das die CI scheitern lässt, und eine Aufgabe zum Entfernen des Flags halten die Zahl niedrig.'),
    ],
    related: ['canarying', 'ab-tests', 'config-tests', 'traffic-shaping'],
  },
  {
    id: 'monitoring',
    domain: { parts: ['monitoring', 'reserve'], what: l('Four golden signals and the count of completed reservations raise alerts.', 'Vier Golden Signals und die Zahl abgeschlossener Reservierungen lösen Alerts aus.') },
    viz: { kind: 'observe', mode: 'monitoring' },
    name: l('Monitoring', 'Monitoring'),
    layer: 'verification',
    phases: ['release', 'post'],
    fromOverview: true,
    oneLiner: l('Monitoring records the health metrics of a live service. An alert tells a person when a metric exceeds a limit.', 'Monitoring erfasst Messwerte eines laufenden Service. Ein Alert meldet, wenn ein Messwert einen Grenzwert verletzt.'),
    catches: l('outages, slowdowns, error spikes, saturation, and broken business flows (no reservations for 10 minutes)', 'Ausfälle, hohe Latenz, hohe Fehlerrate, hohe Auslastung und Fehler in Nutzerabläufen.'),
    intro: l(
      'For one hour, no reservation succeeds. The servers continue to run and the logs show no error. Monitoring can alert the on-call person when the number of successful reservations decreases.',
      'Eine Stunde lang gelingt keine Reservierung. Die Server laufen. Die Logs enthalten keinen Fehler. Monitoring kann die Rufbereitschaft informieren, wenn die Zahl erfolgreicher Reservierungen sinkt.',
    ),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('The four golden signals are latency, traffic, errors and saturation. One business metric can add information about user tasks.', 'Die Golden Signals sind Latenz, Traffic, Fehler und Auslastung. Eine Geschäftsmetrik kann zeigen, ob Nutzer einen Ablauf abschließen.'), l('Configure alerts for failures that affect users.', 'Konfiguriere Alerts für Fehler, die Nutzer betreffen.'),
      l('An alert based on an SLO can show how fast the service uses its error budget.', 'Ein SLO-Alert kann zeigen, wie schnell ein Service sein Error Budget verbraucht.'),
    ],
    limits: [
      l('Too many alerts can cause a person to miss an important alert.', 'Zu viele Alerts können dazu führen, dass die Rufbereitschaft einen wichtigen Alert übersieht.'),
      l('Metrics can identify a failure. Use logs and traces to examine its cause.', 'Eine Metrik kann einen Fehler anzeigen. Untersuche seine Ursache mit Logs und Traces.'),
    ],
    ai: l('Use production incidents to identify checks that are absent. Add a test, lint rule or contract to detect each problem earlier where possible.', 'Nutze Produktionsfehler, um fehlende Checks zu finden. Ergänze nach Möglichkeit einen Test, eine Lint-Regel oder einen Contract.'),
    evidence: {
      general: ev('moderate', f('accelerate2018', 'Monitoring and observability are among the capabilities that predict delivery performance (survey-based, correlational).', 'Monitoring und Observability gehören zu den Fähigkeiten, die Liefer-Performance vorhersagen (Umfragedaten, korrelativ).')),
      ai: ev('weak', f('dora2024', 'Indirect evidence: DORA associated higher AI adoption with lower delivery stability (survey-based correlation). It did not measure whether monitoring improves the reliability of agent-written code.', 'Indirekte Evidenz: DORA fand einen Zusammenhang zwischen höherer KI-Nutzung und geringerer Lieferstabilität (Korrelation aus Umfragedaten). Ob Monitoring die Zuverlässigkeit von Agenten-Code verbessert, wurde nicht gemessen.')),
    },
    tools: { any: ['prometheus', 'grafana', 'alertmanager', 'opentelemetry'] },
    snippets: [{ lang: "any", file: "reservation-alerts.yml",
      description: l("Record `reservation_requests_total` with outcome labels. Load the rule group into Prometheus. Cause a controlled failure in staging. The alert becomes pending, then fires after five minutes. Set a threshold and a responder for your service.",
        "Erfasse `reservation_requests_total` mit Outcome-Labels. Lade die Rule Group in Prometheus. Löse einen kontrollierten Fehler in Staging aus. Der Alert zeigt zuerst pending. Nach fünf Minuten zeigt er firing. Lege den Grenzwert und die Zuständigkeit für deinen Service fest."),
      code: `groups:
  - name: reservations
    rules:
      - alert: ReservationErrors
        expr: |
          sum(rate(reservation_requests_total{outcome="error"}[5m]))
          / clamp_min(sum(rate(reservation_requests_total[5m])), 0.001)
          > 0.05
        for: 5m
        labels: { severity: page }
        annotations:
          summary: "Reservation error ratio exceeds 5%"
# Count expected 'taken' conflicts separately from server errors.`, focus: [{ line: [6,7], note: l('Dividing by clamp_min avoids a divide-by-zero, so a quiet system does not trigger false alerts.', 'Die Division durch clamp_min vermeidet eine Division durch null, sodass ein ruhiges System keine Fehlalarme auslöst.') }, { line: 8, note: l('The threshold defines what counts as broken: above 5% errors is the line to page someone.', 'Die Schwelle definiert, was als kaputt gilt: Über 5 % Fehler ist die Grenze, jemanden zu alarmieren.') }, { line: 9, note: l('The for clause ignores short spikes, trading a little speed for far fewer false pages.', 'Die for-Klausel ignoriert kurze Spitzen und tauscht etwas Geschwindigkeit gegen weit weniger Fehlalarme.') }, { line: 13, note: l('Expected conflicts are not errors: count them separately or normal use will page you.', 'Erwartete Konflikte sind keine Fehler: Zähle sie getrennt, sonst alarmiert dich normale Nutzung.') }] }],
    steps: [l('Record the four golden signals and one business metric for the main service.', 'Erfasse die vier Golden Signals und eine Geschäftsmetrik für den Hauptservice.'), l('Set a service level objective. For example, require 99.5% of reservations to succeed in 1 s. Configure an alert for error budget burn rate.', 'Lege ein Service Level Objective fest. Beispiel: 99,5 % der Reservierungen gelingen in 1 s. Konfiguriere einen Burn-Rate-Alert.'), l('Include a runbook link in each alert.', 'Füge jedem Alert einen Link zum Runbook hinzu.')],
    done: l('The dashboard shows the golden signals and the business metric. A simulated error increase causes an SLO alert with a link to a runbook.', 'Das Dashboard zeigt die Golden Signals und die Geschäftsmetrik. Ein simulierter Anstieg der Fehlerrate löst einen SLO-Alert aus. Der Alert verlinkt auf ein Runbook.'),
    think: [
      q('Why alert on "reservations per minute dropped to zero" if you already alert on errors?', 'Warum auf „Reservierungen pro Minute auf null gefallen“ alarmieren, wenn man schon auf Fehler alarmiert?', 'Because a broken button produces no errors, just no traffic. Business metrics catch the failures that look like silence.', 'Weil ein kaputter Button keine Fehler erzeugt, nur keinen Verkehr. Geschäftsmetriken fangen die Ausfälle, die wie Stille aussehen.'),
      q('Predict: a release double-books 1 in 500 pets, and the API still returns 201 for every request. Which dashboard turns red?', 'Vorhersage: Ein Release bucht 1 von 500 Tieren doppelt, und die API liefert weiter für jeden Request 201. Welches Dashboard wird rot?',
        'None of the golden signals. Only a business invariant metric (reservations per pet, a count of duplicates) or a logs query sees it, so define one.',
        'Keines der Golden Signals. Nur eine fachliche Invariantenmetrik (Reservierungen pro Tier, Anzahl Duplikate) oder eine Log-Abfrage sieht es; also definiere eine.'),
      q('What changes when agents ship more changes per day?', 'Was ändert sich, wenn Agenten mehr Änderungen pro Tag ausliefern?',
        'Alerts must be tied to releases, so the cause is easy to find, and thresholds need to be stricter on symptoms. More change means more chances for an unnoticed regression.',
        'Alarme müssen mit Releases verknüpft sein, damit die Ursache leicht zu finden ist, und Schwellwerte auf Symptome strenger. Mehr Änderungen bedeuten mehr Gelegenheiten für eine unbemerkte Regression.'),
    ],
    related: ['logs-events', 'tracing', 'exception-tracking', 'oncall-experience', 'real-user-monitoring'],
  },
  {
    id: 'exception-tracking',
    domain: { parts: ['monitoring', 'reserve'], what: l('Errors from the reservation code are grouped by fingerprint and release.', 'Der Tracker gruppiert Fehler im Reservierungscode nach Fingerprint und Release.') },
    viz: { kind: 'observe', mode: 'exception-tracking' },
    name: l('Exception tracking', 'Exception Tracking'),
    layer: 'verification',
    phases: ['release'],
    fromOverview: true,
    oneLiner: l('Exception tracking records unhandled errors from production. It groups them by release and includes stack traces and relevant details.', 'Exception Tracking erfasst unbehandelte Fehler in Produktion. Es gruppiert die Fehler nach Release und zeigt Stack Traces mit Kontext.'),
    catches: l('new crash types introduced by a release, errors in rare paths, client-side exceptions', 'Neue Exceptions nach einem Release, Fehler in seltenen Pfaden und Client-Fehler.'),
    intro: l(
      'After a release, the reservation page fails for users with a long name. Exception tracking groups these errors under the new release. The group includes a stack trace.',
      'Nach einem Release schlägt die Reservierung bei langen Namen fehl. Exception Tracking ordnet die Fehler dem neuen Release zu. Die Fehlergruppe enthält einen Stack Trace.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('A new issue after release can identify an error that did not occur in earlier versions.', 'Eine neue Fehlergruppe nach einem Release kann einen Fehler in der neuen Version zeigen.'), l('A stack trace and a record of preceding actions can help you reproduce an error.', 'Ein Stack Trace und Breadcrumbs können helfen, einen Fehler zu reproduzieren.'),
      l('Grouping gives one issue for a set of similar error events.', 'Der Tracker fasst ähnliche Fehler in einer Gruppe zusammen.'),
    ],
    limits: [l('Exception tracking can miss incorrect results that cause no exception.', 'Falsche Ergebnisse ohne Exception können unentdeckt bleiben.'), l('Remove personal data from error reports before you send them.', 'Entferne personenbezogene Daten vor dem Senden des Berichts.')],
    ai: l('Give the stack trace and relevant request details to the coding agent. Ask for a test that reproduces the error.', 'Gib den Stack Trace und die relevanten Request-Daten an den Coding-Agenten. Verlange einen Test, der den Fehler reproduziert.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['glitchtip', 'opentelemetry'] },
    snippets: [{ lang: "js", file: "reservation-errors.ts",
      description: l("Configure the OpenTelemetry SDK and exporter. Use this helper around the operation. Trigger a controlled exception in staging. Examine the stack trace and release metadata. Let the normal error handler process the exception.",
        "Konfiguriere das OpenTelemetry-SDK und den Exporter. Verwende den Helper für die Operation. Löse in Staging eine Exception aus. Prüfe den Stack Trace und die Release-Metadaten. Übergib die Exception weiterhin an den Error Handler."),
      code: `import { trace, SpanStatusCode } from '@opentelemetry/api';
const tracer = trace.getTracer('petstore');
export async function tracked<T>(operation: () => Promise<T>): Promise<T> {
  return tracer.startActiveSpan('reserve', async (span) => {
    try { return await operation(); }
    catch (error) {
      if (error instanceof Error) span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally { span.end(); }
  });
}`, focus: [{ line: [7,8], note: l('Record the exception and mark the span as an error, so the failure is searchable with its context.', 'Die Exception erfassen und den Span als Fehler markieren, damit der Fehler samt Kontext auffindbar ist.') }, { line: 9, note: l('Rethrow: tracking must observe the failure without changing what the caller sees.', 'Weiterwerfen: Das Tracking muss den Fehler beobachten, ohne zu ändern, was der Aufrufer sieht.') }, { line: 10, note: l('The span always ends, even on failure; otherwise broken requests vanish from the trace.', 'Der Span endet immer, auch bei Fehlern; sonst verschwinden kaputte Requests aus dem Trace.') }] }],
    steps: [
      l('Install the error tracker SDK in the server and client. Tag each report with the release version.', 'Installiere das Error-Tracker-SDK in Server und Client. Ergänze jeden Bericht um die Release-Version.'), l('Remove personal data from reports. Configure an alert for each new issue type after release.', 'Entferne personenbezogene Daten aus den Berichten. Konfiguriere einen Alert für neue Fehlergruppen nach einem Release.'),
      l('Mark a test issue as resolved. Trigger the same error with a later release tag. Make sure that the tracker reopens the issue.', 'Markiere einen Testfehler als erledigt. Löse denselben Fehler mit einem neueren Release-Tag aus. Prüfe, dass der Tracker den Fehler wieder öffnet.'),
    ],
    done: l('The tracker groups the test exception and shows its stack trace and release tag. The report contains no personal data.', 'Der Tracker zeigt die Gruppe für den Testfehler. Die Gruppe enthält Stack Trace und Release-Tag. Der Bericht enthält keine personenbezogenen Daten.'),
    think: [
      q('The tracker shows 10,000 events of one error and 3 events of another. Which do you look at first?', 'Der Tracker zeigt 10.000 Ereignisse eines Fehlers und 3 eines anderen. Welchen schaut man zuerst an?', 'Not necessarily the big one. Check which is new in this release and which affects a critical flow; 3 failed payments may matter more than 10,000 harmless warnings.', 'Nicht unbedingt den großen. Prüfen, welcher in diesem Release neu ist und welcher einen kritischen Ablauf trifft; 3 gescheiterte Zahlungen können wichtiger sein als 10.000 harmlose Warnungen.'),
      q('Predict: an agent wraps the reservation code in `try { ... } catch (e) { return null }`. What does the tracker show?', 'Vorhersage: Ein Agent hüllt den Reservierungscode in `try { ... } catch (e) { return null }`. Was zeigt der Tracker?',
        'Nothing: the error is swallowed before it reaches the tracker, and users see failed reservations with no trace. Forbid empty catch blocks in lint and report caught errors on purpose.',
        'Nichts: Der Fehler wird verschluckt, bevor er den Tracker erreicht, und Nutzer sehen fehlgeschlagene Reservierungen ohne Spur. Leere Catch-Blöcke per Linter verbieten und abgefangene Fehler gezielt melden.'),
      q('Which kind of production bug does exception tracking never show?', 'Welche Art von Produktionsfehler zeigt Exception Tracking nie?',
        'Anything that does not throw: a wrong discount, a missed notification, a slow page. Those need business metrics, logs and checks on results.',
        'Alles, was keine Exception wirft: einen falschen Rabatt, eine ausgebliebene Benachrichtigung, eine langsame Seite. Dafür braucht es Business-Metriken, Logs und Prüfungen der Ergebnisse.'),
    ],
    related: ['monitoring', 'logs-events', 'regression-tests'],
  },
  {
    id: 'teeing',
    domain: { parts: ['rollout', 'search'], what: l('Real requests without personal data are recorded and replayed on a test system.', 'Ein Replay spielt aufgezeichnete Requests ohne personenbezogene Daten auf einem Testsystem ab.') },
    viz: { kind: 'traffic', mode: 'teeing' },
    name: l('Teeing', 'Teeing'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('A tee sends a copy of live traffic or events to a second consumer for tests, replay or analysis.', 'Ein Tee sendet Kopien von Live-Requests oder Events an einen zweiten Consumer. Die Kopien dienen für Tests, Replay oder Analyse.'),
    catches: l('problems in new consumers (a new search index, an analytics pipeline) using real data, without risk to the main path', 'Fehler in einem zweiten Consumer, etwa einem Suchindex oder einer Analyse-Pipeline.'),
    intro: l(
      'A team builds a new search index. Test data gives an incomplete picture of live searches. A tee sends data to the new index while the current shop continues to operate.',
      'Das Team baut einen neuen Suchindex. Testdaten decken nur einen Teil der Suchanfragen ab. Ein Tee liefert Kopien an den neuen Index. Die bisherige Suche läuft weiter.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('Recorded production traffic can supply test inputs for replay.', 'Ein Replay kann aufgezeichnete Produktionsrequests als Eingaben verwenden.'),
      l('A copy of a request gives input for a later test without a change to the live response.', 'Eine Kopie liefert Daten für spätere Tests. Die Antwort im Live-Pfad bleibt gleich.'),
      l('Reuse the same recorded requests in regression tests.', 'Verwende dieselbe Stichprobe in Regression Tests.'),
    ],
    limits: [
      l('Remove personal data from copies. Set a limit on how long you keep the copies.', 'Entferne personenbezogene Daten aus den Kopien. Begrenze die Aufbewahrungsdauer.'),
      l('Send the copy asynchronously. Discard copies if the tee cannot keep up with the live requests.', 'Sende die Kopien asynchron. Verwirf Kopien, wenn der Tee den Traffic nicht verarbeiten kann.'),
    ],
    ai: l('Use a replay sample as a regression test for a coding agent\'s change. Requests from production can cover cases that written fixtures omit.', 'Verwende eine Replay-Stichprobe für Regression Tests. Produktionsrequests können Fälle enthalten, die in geschriebenen Fixtures fehlen.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['envoy', 'vector'] },
    snippets: [{ lang: "any", file: "vector.toml",
      description: l("Run `vector --config vector.toml`. Send one synthetic JSON line to standard input. Compare the two output files. Check retention and failures in each output separately.",
        "Führe `vector --config vector.toml` aus. Gib eine synthetische JSON-Zeile über stdin ein. Vergleiche die Ausgabedateien. Prüfe Aufbewahrung und Fehler pro Ausgabe separat."),
      code: `[sources.events]
type = "stdin"
decoding.codec = "json"

[sinks.primary]
type = "file"
inputs = ["events"]
path = "/tmp/petstore-primary.jsonl"
encoding.codec = "json"

[sinks.audit_copy]
type = "file"
inputs = ["events"]
path = "/tmp/petstore-copy.jsonl"
encoding.codec = "json"
# Input: {"event":"reserved","petId":"rex"}`, focus: [{ line: 7, note: l('Both sinks read the same events, so the primary output is the reference for the copy.', 'Beide Sinks lesen dieselben Events, sodass die Primary-Ausgabe die Referenz für die Kopie ist.') }, { line: 13, note: l('The second sink gets an identical stream; here you can try a change without touching production data.', 'Der zweite Sink bekommt einen identischen Strom; hier kannst du eine Änderung ausprobieren, ohne Produktivdaten anzufassen.') }, { line: 16, note: l('A known input makes the comparison of both files meaningful.', 'Eine bekannte Eingabe macht den Vergleich beider Dateien aussagekräftig.') }] }],
    steps: [
      l('Remove personal data from a sample of requests or events. Send a copy of the sample to durable storage.', 'Entferne personenbezogene Daten aus einer Stichprobe von Requests oder Events. Speichere eine Kopie der Stichprobe dauerhaft.'), l('Before release, replay the sample against a test deployment.', 'Spiele die Stichprobe vor dem Release gegen ein Test-Deployment ab.'),
      l('Measure latency and errors with the tee enabled. Make sure that it has no effect on the live path. Set a retention limit for the copies.', 'Miss Latenz und Fehler mit aktivem Tee. Prüfe, dass der Live-Pfad unverändert bleibt. Lege eine Aufbewahrungsfrist für die Kopien fest.'),
    ],
    done: l('Pre-release checks use a replayable traffic sample with personal data removed.', 'Die Checks vor dem Release spielen eine Stichprobe erneut ab. Die Stichprobe enthält keine personenbezogenen Daten.'),
    think: [
      q('How does teeing differ from shadowing?', 'Wie unterscheidet sich Teeing von Shadowing?', 'Shadowing runs a new version on the copy right now. Teeing is the general split; the copy can go anywhere: a shadow, a recorder for later replay, an analysis job.', 'Shadowing betreibt jetzt eine neue Version auf der Kopie. Teeing ist die allgemeine Abzweigung; die Kopie kann überallhin: zu einem Schatten, einem Rekorder für späteres Abspielen, einem Analysejob.'),
      q('Predict: you tee 1% of live requests into a file and replay them next month. Which requests fail for reasons unrelated to your change?', 'Vorhersage: Du leitest 1 % der Live-Requests in eine Datei und spielst sie nächsten Monat ab. Welche Requests scheitern aus Gründen, die nichts mit deiner Änderung zu tun haben?',
        'Ones that reference data that no longer exists (a pet that was adopted), expired tokens or time-dependent state. Replay needs matching test data and a frozen clock.',
        'Solche, die auf nicht mehr vorhandene Daten verweisen (ein adoptiertes Tier), abgelaufene Tokens oder zeitabhängigen Zustand. Der Replay braucht passende Testdaten und eine eingefrorene Uhr.'),
      q('Which risk is specific to teeing and not to a normal test?', 'Welches Risiko gibt es speziell beim Teeing und nicht bei einem normalen Test?',
        'You copy real user data into a second place. It needs the same protection as the original, or must be anonymised before it is stored.',
        'Du kopierst echte Nutzerdaten an einen zweiten Ort. Er braucht denselben Schutz wie das Original, oder die Daten müssen vor dem Speichern anonymisiert werden.'),
    ],
    related: ['shadowing', 'tap-compare', 'logs-events'],
  },
  {
    id: 'profiling',
    domain: { parts: ['monitoring', 'reserve'], what: l('A flame graph shows where the reservation endpoint spends CPU time.', 'Ein Flame Graph zeigt, wo der Reservierungs-Endpoint CPU-Zeit verbraucht.') },
    viz: { kind: 'observe', mode: 'profiling' },
    name: l('Profiling', 'Profiling'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('A profiler shows which parts of a running program use CPU time or memory.', 'Ein Profiler zeigt, welche Teile eines laufenden Programms CPU-Zeit oder Speicher beanspruchen.'),
    catches: l('hot spots, unexpected allocations, lock contention, the one slow function that matters', 'Code mit hohem CPU-Verbrauch, unerwartete Allokationen und Lock-Konflikte.'),
    intro: l(
      'The petstore uses twice as much CPU after a release. A profiler can show where it uses that time. For example, one JSON function can account for 40% of CPU time.',
      'Nach einem Release braucht der Petstore doppelt so viel CPU-Zeit. Ein Profiler zeigt, welche Funktionen die Zeit beanspruchen. Eine JSON-Funktion kann beispielsweise 40 % der CPU-Zeit benötigen.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('A flame graph shows which code uses runtime resources.', 'Ein Flame Graph zeigt, welche Codeabschnitte Ressourcen verwenden.'), l('Compare profiles by release to find an increase in CPU or memory use.', 'Vergleiche Profile pro Release. So kannst du einen Anstieg von CPU-Zeit oder Speicherverbrauch erkennen.'),
      l('A low-overhead sampling profiler can operate continuously in production.', 'Ein Sampling Profiler mit geringem Overhead kann fortlaufend in Produktion laufen.'),
    ],
    limits: [
      l('A profile measures resource use. Use tests to examine whether the result is correct.', 'Ein Profil misst Ressourcenverbrauch. Ein Test kann prüfen, ob das Ergebnis korrekt ist.'),
      l('Measurements from one run can vary. Compare several profiles to identify repeatable differences.', 'Messwerte können von Lauf zu Lauf schwanken. Vergleiche mehrere Profile auf wiederholbare Unterschiede.'),
    ],
    ai: l('Give the coding agent a flame graph and a measurement. For example, show that one function uses 40% of CPU time.', 'Gib dem Coding-Agenten einen Flame Graph und einen Messwert. Zeige zum Beispiel, dass eine Funktion 40 % der CPU-Zeit benötigt.'),
    evidence: { general: ev('weak', f('gwp2010', 'Google runs always-on, fleet-wide sampling profiling (descriptive, no effect measurement).', 'Google betreibt dauerhaftes, flottenweites Stichproben-Profiling (beschreibend, keine Wirkungsmessung).')), ai: none() },
    tools: { js: ['clinic'], python: ['py-spy'], java: ['async-profiler'], dotnet: ['dotnet-trace'], go: ['pprof'], rust: ['samply'], cpp: ['pprof', 'samply'], any: ['pyroscope', 'parca'] },
    snippets: [{ lang: "python", file: "profile.sh",
      description: l("Install py-spy. Profile the local Python service while you replay the slow request. Open the SVG and find the stack that uses the most time. Check local process permissions first. Use test inputs without personal data.",
        "Installiere py-spy. Wiederhole den langsamen Request und erfasse ein Profil des lokalen Python-Service. Öffne das SVG. Suche den Stack mit der höchsten Laufzeit. Prüfe vorher deine lokalen Prozessrechte. Verwende keine personenbezogenen Daten."),
      code: `# Replace 12345 with the PID of your local test service.
py-spy record --pid 12345 --duration 30 --output reservation.svg
# During those 30 seconds, exercise the reservation endpoint.
# After a targeted change, profile the same workload again.`, focus: [{ line: 2, note: l('Sample a running process for a fixed time; no code change or restart is needed.', 'Einen laufenden Prozess für feste Zeit samplen; weder Codeänderung noch Neustart sind nötig.') }, { line: 3, note: l('Profile while real work runs; an idle service shows nothing useful.', 'Profiliere, während echte Arbeit läuft; ein untätiger Dienst zeigt nichts Brauchbares.') }, { line: 4, note: l('Profile the same workload again after the change; otherwise you cannot tell whether it helped.', 'Profiliere nach der Änderung dieselbe Last erneut; sonst weißt du nicht, ob sie geholfen hat.') }] }],
    steps: [
      l('Profile the slowest endpoint with a representative load. Generate a flame graph.', 'Führe Profiling für den langsamsten Endpoint unter typischer Last aus. Erzeuge einen Flame Graph.'), l('Change the part of the code that uses the most time. Run the benchmark again.', 'Ändere den Codeabschnitt mit der höchsten Laufzeit. Führe den Benchmark erneut aus.'),
      l('Save the profiles from before and after the change. Use them to compare future releases.', 'Speichere die Profile vor und nach der Änderung. Nutze sie zum Vergleich späterer Releases.'),
    ],
    done: l('Flame graphs and benchmark results show performance before and after the change. The tests pass.', 'Flame Graphs und Benchmarks zeigen die Messwerte vor und nach der Änderung. Alle Tests bestehen.'),
    think: [
      q('Why profile in production rather than on a laptop?', 'Warum in Produktion profilen statt auf dem Laptop?', 'Real data sizes, real traffic mix and real hardware create different hot spots. The laptop profile often optimises the wrong thing.', 'Echte Datenmengen, echter Verkehrsmix und echte Hardware erzeugen andere Hotspots. Das Laptop-Profil optimiert oft das Falsche.'),
      q('Predict: you optimise the function at the top of the flame graph and make it 5x faster. The endpoint gets 3% faster. Why?', 'Vorhersage: Du optimierst die Funktion ganz oben im Flame Graph und machst sie fünfmal schneller. Der Endpunkt wird 3 % schneller. Warum?',
        'The function took only a small share of the total time; a wide box in the graph matters, a tall one does not. Measure again after each change to see the real gain.',
        'Die Funktion brauchte nur einen kleinen Teil der Gesamtzeit; entscheidend ist ein breiter Kasten im Graphen, kein hoher. Nach jeder Änderung erneut messen, um den echten Gewinn zu sehen.'),
      q('An agent says it made the code faster. What evidence do you ask for?', 'Ein Agent sagt, er habe den Code schneller gemacht. Welchen Nachweis verlangst du?',
        'A before/after measurement on the same input with the same method, and passing tests. Without a measurement the claim is a guess, and a faster version may be wrong.',
        'Eine Messung vorher/nachher mit derselben Eingabe und Methode sowie bestandene Tests. Ohne Messung ist die Aussage eine Vermutung, und eine schnellere Version kann falsch sein.'),
    ],
    related: ['benchmark-tests', 'performance-tests', 'tracing'],
  },
  {
    id: 'logs-events',
    domain: { parts: ['monitoring', 'reservation', 'never-twice'], what: l('A query on structured events finds a pet with two active reservations.', 'Eine Abfrage über strukturierte Events findet zwei aktive Reservierungen für dasselbe Tier.') },
    viz: { kind: 'observe', mode: 'logs-events' },
    name: l('Logs & events', 'Logs & Events'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('Structured events give a record of what the service did. Queries can use this record to examine an earlier incident.', 'Strukturierte Events protokollieren Aktionen eines Service. Eine Abfrage dieser Events kann einen früheren Incident untersuchen.'),
    catches: l('the "why" behind an incident, rare failure sequences, invariant violations visible only in history', 'Seltene Fehlerfolgen und Verstöße gegen Invariants, die sich in aufgezeichneten Events zeigen.'),
    intro: l(
      'A customer reports two reservations for the same pet. Structured events can record the request ID and pet ID. A query can show the order of actions for that pet.',
      'Eine Kundin meldet zwei Reservierungen für dasselbe Tier. Strukturierte Events erfassen Request-ID und Tier-ID. Eine Abfrage zeigt die Reihenfolge der Aktionen für dieses Tier.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('A query can use fields such as request ID, pet ID and outcome in a structured event.', 'Eine Abfrage kann Felder wie Request-ID, Tier-ID und Ergebnis in strukturierten Events verwenden.'), l('Use queries on logs to check invariants. For example, each pet must have at most one active reservation.', 'Prüfe Invariants mit Abfragen. Ein Tier darf zum Beispiel höchstens eine aktive Reservierung haben.'),
      l('IDs in events can show the order of operations during a failure.', 'IDs in Events können die Reihenfolge der Operationen bei einem Fehler zeigen.'),
    ],
    limits: [l('Log volume and cost can increase quickly. Sample debug logs and retain important business events.', 'Log-Volumen und Kosten können schnell steigen. Verwende für Debug Logs Stichproben. Bewahre wichtige Geschäftsereignisse auf.'), l('Remove personal data that the log does not need.', 'Entferne personenbezogene Daten, die das Log nicht braucht.')],
    ai: l('Give the coding agent the result of a query on structured events. A query can show when a production invariant fails.', 'Gib dem Coding-Agenten das Ergebnis einer Abfrage über strukturierte Events. Die Abfrage kann zeigen, wann ein Invariant in Produktion verletzt wurde.'),
    evidence: { general: ev('weak', f('brooker2025', 'AWS checks production logs against formal P specifications (PObserve), an experience report of runtime verification on logs.', 'AWS prüft Produktionslogs gegen formale P-Spezifikationen (PObserve), ein Erfahrungsbericht über Laufzeitverifikation auf Logs.')), ai: none() },
    tools: { any: ['opentelemetry', 'loki', 'vector'] },
    snippets: [{ lang: "js", file: "reservation-log.mjs",
      description: l("Run `node reservation-log.mjs`. Examine the structured output. Adapt the event to your logger and collector. Include a correlation ID. Omit session tokens and personal data. Set up a query and a retention policy.",
        "Führe `node reservation-log.mjs` aus. Prüfe die strukturierte Ausgabe. Passe das Event an Logger und Collector an. Ergänze eine Correlation-ID. Lass Session Tokens und personenbezogene Daten weg. Lege eine Abfrage und eine Aufbewahrungsfrist fest."),
      code: `function logReservation(petId, outcome, correlationId) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: 'reservation_attempt', petId, outcome, correlationId,
  }));
}
logReservation('rex', 'taken', 'local-example-1');
// Query by correlationId to follow a failed request across services.
// Do not log credentials, raw request bodies or adopter names.`, focus: [{ line: 4, note: l('Structured fields can be queried; a free-text message cannot be filtered reliably.', 'Strukturierte Felder lassen sich abfragen; eine Freitextmeldung lässt sich nicht verlässlich filtern.') }, { line: 4, note: l('The correlationId ties one request together across services.', 'Die correlationId verbindet eine Anfrage über Dienste hinweg.') }, { line: 8, note: l('Query by this ID to follow one failed request end to end.', 'Frage mit dieser ID ab, um eine fehlgeschlagene Anfrage von Anfang bis Ende zu verfolgen.') }, { line: 9, note: l('Logs outlive the request: never write credentials, raw bodies or personal names into them.', 'Logs überdauern die Anfrage: Schreibe nie Zugangsdaten, rohe Bodies oder Personennamen hinein.') }] }],
    steps: [l('Add a request ID to each structured log entry.', 'Ergänze jeden strukturierten Log-Eintrag um eine Request-ID.'), l('Generate a business event for each important change of state, such as reservation, cancellation or adoption.', 'Erzeuge ein Event für jede wichtige Zustandsänderung, etwa Reservierung, Stornierung oder Adoption.'), l('Schedule a query that checks the invariant on the recorded events. Configure an alert for a violation.', 'Plane eine Abfrage, die das Invariant anhand der Events prüft. Konfiguriere einen Alert für Verstöße.')],
    done: l('Structured logs contain request IDs. A scheduled query checks the invariant. A test violation causes an alert.', 'Strukturierte Logs enthalten Request-IDs. Eine geplante Abfrage prüft das Invariant. Ein simulierter Verstoß löst einen Alert aus.'),
    think: [
      q('Logs, metrics and traces: when do you need logs specifically?', 'Logs, Metriken und Traces: Wann braucht man gerade Logs?', 'When you need the details of individual events: which pet, which person, which outcome. Metrics tell you that something is wrong; logs tell you what happened.', 'Wenn man die Einzelheiten einzelner Ereignisse braucht: welches Tier, welche Person, welches Ergebnis. Metriken sagen, dass etwas falsch ist; Logs sagen, was passiert ist.'),
      q('Predict: a log line says `Reservation failed` and nothing else. What can you do with it at 3 a.m.?', 'Vorhersage: Eine Logzeile lautet `Reservation failed` und sonst nichts. Was kannst du damit um 3 Uhr nachts anfangen?',
        'Very little: no pet, no person, no reason, no request to follow. Log the outcome with ids and the reason as structured fields.',
        'Sehr wenig: kein Tier, keine Person, kein Grund, kein Request, dem man folgen könnte. Das Ergebnis mit IDs und dem Grund als strukturierte Felder loggen.'),
      q('Which logging mistake turns a convenient log into a legal problem?', 'Welcher Logging-Fehler macht aus einem praktischen Log ein rechtliches Problem?',
        'Writing personal data (names, emails, tokens) into free-text lines that are kept for months and read widely. Log ids, redact, and limit retention and access.',
        'Personenbezogene Daten (Namen, E-Mails, Tokens) in Freitextzeilen zu schreiben, die monatelang aufbewahrt und breit gelesen werden. IDs loggen, schwärzen und Aufbewahrung sowie Zugriff begrenzen.'),
    ],
    related: ['monitoring', 'tracing', 'auditing', 'contracts'],
  },
  {
    id: 'chaos-testing',
    domain: { parts: ['services', 'reserve'], what: l('Payment becomes slow on purpose: do reservations still succeed?', 'Der Test verzögert den Payment-Service und prüft, ob Reservierungen weiter gelingen.') },
    viz: { kind: 'traffic', mode: 'chaos-testing' },
    name: l('Chaos testing', 'Chaos Engineering'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('A chaos test introduces a controlled failure. The test checks whether the service continues to operate as expected.', 'Ein Chaos Test löst einen kontrollierten Fehler aus. Der Test prüft, ob der Service danach wie erwartet arbeitet.'),
    catches: l('missing timeouts, retries without backoff, single points of failure, fallbacks that were never tested', 'Fehlende Timeouts, Retries ohne Backoff, Single Points of Failure und ungetestete Fallbacks.'),
    intro: l(
      'The payment service takes two seconds longer to respond. Reservation requests wait for payment, and all available threads can become blocked. A chaos test can show whether a timeout or fallback works.',
      'Der Payment-Service antwortet zwei Sekunden später. Reservierungen warten auf die Zahlung. Dabei können alle Threads blockieren. Ein Chaos Test zeigt, ob Timeout oder Fallback greifen.',
    ),
    cost: 3,
    feedback: 'hours',
    worth: [
      l('A controlled experiment shows how the service responds to a failure.', 'Ein kontrolliertes Experiment zeigt, wie der Service auf einen Fehler reagiert.'), l('Start with one dependency and a small delay in staging.', 'Beginne in Staging mit einer kleinen Verzögerung bei einer Abhängigkeit.'),
      l('A controlled failure can show a missing timeout or an incorrect retry policy.', 'Ein kontrollierter Fehler kann ein fehlendes Timeout oder eine falsche Retry-Konfiguration zeigen.'),
    ],
    limits: [l('Use monitoring to measure the effect of the failure.', 'Miss die Auswirkung des Fehlers mit Monitoring.'), l('In production, limit the number of affected requests and make the experiment easy to stop.', 'Begrenze in Produktion die betroffenen Requests. Stelle sicher, dass du das Experiment stoppen kannst.')],
    ai: l('Add a delay of 2 s to the payment service in a controlled test. The result can show whether the reservation service has a timeout.', 'Verzögere den Payment-Service in einem kontrollierten Test um 2 s. Das Ergebnis kann zeigen, ob der Reservierungsservice ein Timeout verwendet.'),
    evidence: { general: ev('weak', f('basiri2016', 'Netflix\'s experience report describes chaos engineering as experiments on production to build confidence in resilience.', 'Netflix\' Erfahrungsbericht beschreibt Chaos Engineering als Experimente in Produktion, um Vertrauen in die Resilienz aufzubauen.'), f('brooker2025', 'AWS ran 733 fault-injection experiments before Prime Day 2024 (experience report).', 'AWS führte vor dem Prime Day 2024 733 Fehlerinjektions-Experimente durch (Erfahrungsbericht).')), ai: none() },
    tools: { any: ['chaos-mesh', 'litmus', 'toxiproxy', 'chaostoolkit'] },
    snippets: [{ lang: "any", file: "database-latency.sh",
      description: l("Start Toxiproxy locally. Route the disposable application through the proxy to its test database. Add 500 ms of latency. Examine timeouts and retry limits. Remove the delay after the test.",
        "Starte Toxiproxy lokal. Leite die Testanwendung über den Proxy zur Testdatenbank. Füge 500 ms Latenz hinzu. Prüfe Timeouts und Retry-Grenzen. Entferne die Verzögerung nach dem Test."),
      code: `# Proxy port 15432 -> local test PostgreSQL port 5432.
toxiproxy-cli create -l 127.0.0.1:15432 -u 127.0.0.1:5432 petstore-db
# App DB URL must use port 15432 for the experiment to have an effect.
toxiproxy-cli toxic add -t latency -a latency=500 petstore-db
# Exercise reserve: bounded timeout, no duplicate reservation on retry.
toxiproxy-cli toxic remove -n latency_downstream petstore-db`, focus: [{ line: 3, note: l('If the app does not use the proxy port, the experiment does nothing and still looks green.', 'Nutzt die App den Proxy-Port nicht, bewirkt das Experiment nichts und sieht trotzdem grün aus.') }, { line: 4, note: l('The toxic injects a half second of latency: a slow database, not a dead one.', 'Der Toxic fügt eine halbe Sekunde Latenz hinzu: eine langsame Datenbank, keine tote.') }, { line: 5, note: l('State the hypothesis first: timeouts stay bounded and a retry must not reserve twice.', 'Formuliere zuerst die Hypothese: Timeouts bleiben begrenzt und ein Retry darf nicht doppelt reservieren.') }, { line: 6, note: l('Always remove the fault afterwards and check the system recovers.', 'Entferne den Fehler danach immer und prüfe, dass sich das System erholt.') }] }],
    steps: [l('Write the expected result before the experiment. For example, reservations succeed and show payment pending when the payment service adds 2 s of latency.', 'Schreibe das erwartete Ergebnis vor dem Experiment auf. Beispiel: Bei 2 s zusätzlicher Latenz gelingt die Reservierung und zeigt „Zahlung ausstehend“.'), l('Run the failure experiment in staging with Toxiproxy or Chaos Mesh. Set a time limit.', 'Führe das Experiment mit Toxiproxy oder Chaos Mesh in Staging aus. Lege ein Zeitlimit fest.'), l('Compare the actual result with the expected result. Correct the behavior that did not meet the expectation.', 'Vergleiche das tatsächliche Ergebnis mit der Erwartung. Korrigiere das Verhalten, das von der Erwartung abweicht.')],
    done: l('The record for at least one experiment includes the hypothesis, result and a correction that follows from the result.', 'Für mindestens ein Experiment sind Hypothese, Ergebnis und die daraus folgende Korrektur dokumentiert.'),
    think: [
      q('Why start with a hypothesis instead of just breaking things?', 'Warum mit einer Hypothese beginnen, statt einfach Dinge kaputt zu machen?', 'Without one you cannot tell success from failure. The hypothesis is the expected behaviour; the experiment is the test.', 'Ohne sie kann man Erfolg nicht von Misserfolg unterscheiden. Die Hypothese ist das erwartete Verhalten; das Experiment ist der Test.'),
      q('Predict: you kill one of three reservation service instances during a load test. What should users notice, and what might they see instead?', 'Vorhersage: Du beendest während eines Lasttests eine von drei Instanzen des Reservierungsdienstes. Was sollten Nutzer merken, und was sehen sie womöglich stattdessen?',
        'Ideally a few retried requests. Without proper timeouts and health checks, requests to the dead instance hang or fail until the load balancer notices.',
        'Idealerweise einige wiederholte Requests. Ohne passende Timeouts und Health Checks hängen Requests an die tote Instanz oder scheitern, bis der Load Balancer es bemerkt.'),
      q('When would you not run chaos experiments yet?', 'Wann würdest du noch keine Chaos-Experimente durchführen?',
        'When you cannot observe the system (no metrics or alerts) or when known weaknesses are still open. Fix the known problems first; the experiment should discover unknown ones.',
        'Wenn du das System nicht beobachten kannst (keine Metriken oder Alarme) oder bekannte Schwächen noch offen sind. Erst die bekannten Probleme beheben; das Experiment soll unbekannte finden.'),
    ],
    related: ['monitoring', 'traffic-shaping', 'oncall-experience', 'load-tests'],
  },
  {
    id: 'ab-tests',
    domain: { parts: ['ui', 'adopt'], what: l('Two versions of the adoption page; the test counts adoptions for each.', 'Ein A/B-Test zählt Adoptionen für zwei Versionen der Adoptionsseite.') },
    viz: { kind: 'observe', mode: 'ab-tests' },
    name: l('A/B tests', 'A/B-Tests'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('An A/B test assigns users to two versions at random. It compares the result for a specified metric.', 'Ein A/B-Test weist Nutzer zufällig einer von zwei Varianten zu. Der Test vergleicht den Messwert für das festgelegte Ziel.'),
    catches: l('features that work technically but do not help, or hurt a metric that matters', 'Funktionen, die das Ziel verfehlen oder einen wichtigen Messwert verschlechtern.'),
    intro: l(
      'A coding agent builds two versions of the adoption page. Both versions operate correctly. An A/B test assigns users to the two pages at random and counts adoptions for each page.',
      'Ein Coding-Agent baut zwei Versionen der Adoptionsseite. Beide Versionen funktionieren. Ein A/B-Test teilt die Nutzer zufällig auf. Der Test zählt die Adoptionen pro Version.',
    ),
    cost: 2,
    feedback: 'days',
    worth: [
      l('Random assignment helps balance differences between groups.', 'Die zufällige Zuteilung hilft, Unterschiede zwischen den Gruppen auszugleichen.'), l('A guardrail metric can show that a change improves one result and damages another.', 'Eine Guardrail-Metrik kann zeigen, dass eine Variante ein Ergebnis verbessert und ein anderes verschlechtert.'),
      l('A comparison of measured results can help the team select a variant.', 'Die Messwerte können dem Team bei der Wahl einer Variante helfen.'),
    ],
    limits: [
      l('A test needs enough traffic to reach its sample size. Repeated early checks can increase the false positive rate.', 'Der Test braucht genügend Traffic für die Stichprobe. Wiederholte vorzeitige Auswertungen können die Rate der False Positives erhöhen.'),
      l('A test measures the chosen metrics. A variant can affect a metric that the test does not record.', 'Der Test misst die gewählten Metriken. Eine Variante kann auch Metriken beeinflussen, die der Test nicht erfasst.'),
    ],
    ai: l('A coding agent can produce variants quickly. Use an A/B test to measure which variant better meets the goal.', 'Ein Coding-Agent kann Varianten schnell erstellen. Verwende einen A/B-Test, um zu messen, welche Variante das Ziel besser erfüllt.'),
    evidence: { general: ev('strong', f('kohavi2013', 'Bing ran more than 200 experiments at the same time on a typical day. Many ideas changed primary metrics by approximately 1%. Predictions often differed from results. Experiments identified many negative changes before release.', 'Bing führte an einem typischen Tag mehr als 200 Experimente gleichzeitig aus. Viele Ideen änderten wichtige Metriken um ungefähr 1 %. Vorhersagen wichen oft vom Ergebnis ab. Tests zeigten viele negative Änderungen vor dem Release.')), ai: none() },
    tools: { any: ['growthbook', 'unleash', 'openfeature'] },
    snippets: [{ lang: "js", file: "experiment-assignment.test.ts",
      description: l("Install Vitest and `@growthbook/growthbook`. Run the local SDK example. A participant must keep the same variant across page changes. The example must exclude a participant without an ID. Specify the metrics, guardrails and stopping rule for your experiment.",
        "Installiere Vitest und `@growthbook/growthbook`. Führe das lokale SDK-Beispiel aus. Ein Teilnehmer muss beim Seitenwechsel dieselbe Variante behalten. Ohne ID nimmt er nicht teil. Lege Metriken, Guardrails und eine Stoppregel fest."),
      code: `import { expect, test } from 'vitest';
import { GrowthBook } from '@growthbook/growthbook';
const experiment = {
  key: 'reservation-copy-v1', variations: ['control', 'candidate'],
  weights: [0.5, 0.5], hashAttribute: 'id', hashVersion: 2,
};
function assign(id: string, page: string) {
  const sdk = new GrowthBook({ attributes: { id, page } });
  try { return sdk.run(experiment); }
  finally { sdk.destroy(); }
}
test('page changes do not reassign a participant', () => {
  const first = assign('synthetic-user-1', 'pet-detail');
  expect(first.inExperiment).toBe(true);
  expect(first.hashAttribute).toBe('id');
  for (const page of ['checkout', 'confirmation', 'pet-list']) {
    const next = assign('synthetic-user-1', page);
    expect(next.inExperiment).toBe(true);
    expect(next.variationId).toBe(first.variationId);
  }
});
test('a missing participant ID is excluded', () => {
  expect(assign('', 'pet-detail').inExperiment).toBe(false);
});`, focus: [{ line: 5, note: l('A stable hash of the ID with fixed weights keeps each participant in one variation.', 'Ein stabiler Hash der ID mit festen Gewichten hält jeden Teilnehmer in einer Variante.') }, { line: 19, note: l('The same person must see the same variant on every page, or results mix and mean nothing.', 'Dieselbe Person muss auf jeder Seite dieselbe Variante sehen, sonst vermischen sich die Ergebnisse und bedeuten nichts.') }, { line: 23, note: l('Missing IDs are excluded instead of assigned randomly, which would pollute the data.', 'Fehlende IDs werden ausgeschlossen statt zufällig zugewiesen, was die Daten verfälschen würde.') }] }],
    steps: [
      l('Before the experiment starts, record the hypothesis, primary metric, guardrail metrics and sample size.', 'Halte Hypothese, Hauptmetrik, Guardrail-Metriken und Stichprobengröße vor dem Start fest.'), l('Assign each user to a group at random. Keep each user in that group. Run the experiment until it reaches the planned sample size.', 'Weise jeden Nutzer zufällig einer Gruppe zu. Behalte die Zuordnung bei. Führe den Test bis zur geplanten Stichprobengröße aus.'),
      l('Before the experiment, specify the success criterion. Before you examine the result, make sure that the group sizes match the planned split.', 'Lege vor dem Experiment das Erfolgskriterium fest. Prüfe vor der Auswertung, dass die Gruppen der geplanten Verteilung entsprechen.'),
    ],
    done: l('The experiment records the metric and sample size before it starts. The result determines the decision.', 'Das Experiment nennt die Metrik und Stichprobengröße vor dem Start. Das Ergebnis bestimmt die Entscheidung.'),
    think: [
      q('After two days variant B is 8% better. Why not stop and ship it?', 'Nach zwei Tagen ist Variante B 8 % besser. Warum nicht aufhören und ausliefern?', 'Early results swing wildly; stopping when the numbers look good guarantees false positives. Decide the sample size up front and stick to it.', 'Frühe Ergebnisse schwanken stark; aufzuhören, wenn die Zahlen gut aussehen, garantiert Fehlalarme. Die Stichprobengröße vorab festlegen und einhalten.'),
      q('Predict: you test a new adoption-fee display on 100 visitors per variant and see 12 vs. 15 adoptions. What can you conclude?', 'Vorhersage: Du testest eine neue Anzeige der Adoptionsgebühr mit 100 Besuchern pro Variante und siehst 12 gegen 15 Adoptionen. Was kannst du schließen?',
        'Nothing reliable. The difference is well within random variation; you need a sample size from a power calculation, decided before the test.',
        'Nichts Verlässliches. Der Unterschied liegt weit im Zufallsrauschen; du brauchst eine Stichprobengröße aus einer Power-Berechnung, vor dem Test festgelegt.'),
      q('Which question can an A/B test not answer?', 'Welche Frage kann ein A/B-Test nicht beantworten?',
        'Why users behave that way, and whether the code is correct. It compares outcomes; usability tests explain behaviour, and the earlier layers check correctness.',
        'Warum sich Nutzer so verhalten und ob der Code korrekt ist. Er vergleicht Ergebnisse; Usability-Tests erklären Verhalten, und die früheren Schichten prüfen die Korrektheit.'),
    ],
    related: ['feature-flags', 'real-user-monitoring', 'usability-tests'],
  },
  {
    id: 'tracing',
    domain: { parts: ['monitoring', 'api', 'reserve'], what: l('A trace of one reservation request shows 12 calls to the inventory service.', 'Der Trace eines Reservierungsrequests zeigt zwölf Aufrufe des Inventory-Service.') },
    viz: { kind: 'observe', mode: 'tracing' },
    name: l('Tracing', 'Tracing'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('A trace records the services that handle one request. It shows the duration of each operation.', 'Ein Trace zeichnet auf, welche Services einen Request bearbeiten. Er zeigt die Dauer jeder Operation.'),
    catches: l('where latency comes from in a distributed system, unexpected calls, fan-out, retries hidden inside services', 'Hohe Latenz, unerwartete Aufrufe, Fan-out und wiederholte Aufrufe zwischen Services.'),
    intro: l(
      'The pet page takes two seconds to load. The request passes through five services. A trace shows that one service calls another service 12 times.',
      'Die Tierseite lädt zwei Sekunden. Der Request läuft durch fünf Services. Ein Trace zeigt, dass ein Service einen anderen zwölfmal aufruft.',
    ),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('A trace can show which operation is slow and how often it occurs in a request.', 'Ein Trace zeigt, welche Operation langsam ist und wie oft sie pro Request läuft.'), l('OpenTelemetry gives a vendor-neutral standard for trace data.', 'OpenTelemetry gibt einen herstellerneutralen Standard für Traces vor.'),
      l('A trace can show retries and multiple downstream calls across services.', 'Ein Trace kann Retries und mehrere nachgelagerte Aufrufe über Services hinweg zeigen.'),
    ],
    limits: [
      l('Pass trace context through each service and queue. An interruption in context can split the trace.', 'Gib den Trace Context über jeden Service und jede Queue weiter. Fehlt er, kann der Trace unvollständig sein.'),
      l('A trace gives timing and call order. A separate check must compare the result with the requirement.', 'Ein Trace zeigt Zeit und Aufrufreihenfolge. Prüfe das fachliche Ergebnis separat.'),
    ],
    ai: l('A trace can show repeated service calls that a coding agent added. Give the trace to the coding agent to examine.', 'Ein Trace kann wiederholte Service-Aufrufe zeigen, die ein Coding-Agent ergänzt hat. Gib den Trace an den Coding-Agenten zur Prüfung.'),
    evidence: { general: ev('weak', f('dapper2010', 'Describes Google\'s production tracing system, built on sampling and instrumentation of a few common libraries (descriptive, no effect measurement).', 'Beschreibt Googles produktives Tracing-System, das auf Stichproben und der Instrumentierung weniger gemeinsamer Bibliotheken beruht (beschreibend, keine Wirkungsmessung).')), ai: none() },
    tools: { any: ['opentelemetry', 'jaeger'] },
    snippets: [{ lang: "js", file: "reservation-trace.ts",
      description: l("Configure an OpenTelemetry SDK and exporter. Call the helper around the reservation operation. Examine the trace for the reservation span and the downstream database span.",
        "Konfiguriere ein OpenTelemetry-SDK und einen Exporter. Rufe den Helper für die Reservierung auf. Prüfe, ob der Trace einen Span für die Reservierung und einen Span für die Datenbank enthält."),
      code: `import { trace } from '@opentelemetry/api';
const tracer = trace.getTracer('petstore');
export async function traceReservation<T>(save: () => Promise<T>) {
  return tracer.startActiveSpan('reserve', async (span) => {
    span.setAttribute('pet.id', 'rex'); // synthetic example
    try { return await save(); }
    finally { span.end(); }
  });
}
// Enable database instrumentation and context propagation in SDK setup.
// Never put credentials or adopter names into span attributes.`, focus: [{ line: 4, note: l('Spans wrap an operation, so a slow or failing step shows up in the request trace.', 'Spans umschließen eine Operation, sodass ein langsamer oder fehlschlagender Schritt im Trace sichtbar wird.') }, { line: 5, note: l('Attributes make traces searchable by what matters, such as the pet.', 'Attribute machen Traces nach dem Wesentlichen durchsuchbar, etwa dem Tier.') }, { line: 7, note: l('The span ends in finally, so failed calls still appear with their duration.', 'Der Span endet in finally, sodass auch fehlgeschlagene Aufrufe mit ihrer Dauer erscheinen.') }, { line: 11, note: l('Attributes travel to the tracing backend: keep secrets and personal data out.', 'Attribute wandern ins Tracing-Backend: Halte Geheimnisse und personenbezogene Daten fern.') }] }],
    steps: [
      l('Enable OpenTelemetry automatic instrumentation for each service. Export traces to a tracing backend.', 'Aktiviere die automatische OpenTelemetry-Instrumentierung für jeden Service. Exportiere Traces an ein Tracing-Backend.'), l('Pass trace context through HTTP and queues. Add spans for the domain operations.', 'Gib den Trace Context über HTTP und Queues weiter. Ergänze Spans für Domain-Operationen.'),
      l('Include trace IDs in logs and error reports. Use the ID to find the trace for an error.', 'Ergänze Trace-IDs in Logs und Fehlerberichten. Verwende die ID, um den Trace zu einem Fehler zu finden.'),
    ],
    done: l('A single trace follows one reservation request through all services. The trace includes a span for the domain operation.', 'Ein Trace enthält alle Services, die einen Reservierungsrequest bearbeiten. Er enthält auch einen Span für die Domain-Operation.'),
    think: [
      q('Why sample traces instead of recording all of them?', 'Warum Traces stichprobenartig statt vollständig aufzeichnen?', 'Cost and overhead. A small sample shows the typical patterns; tail-based sampling keeps the slow and failed ones that matter most.', 'Kosten und Overhead. Eine kleine Stichprobe zeigt die typischen Muster; Tail-based Sampling behält die langsamen und gescheiterten, auf die es ankommt.'),
      q('Predict: a request passes through a queue, and the consumer starts a new trace. What does the trace of the reservation show?', 'Vorhersage: Ein Request läuft durch eine Queue, und der Consumer startet einen neuen Trace. Was zeigt der Trace der Reservierung?',
        'It ends at the queue; the rest is a separate, unrelated trace. Put the trace context into the message so the consumer continues the same trace.',
        'Er endet an der Queue; der Rest ist ein getrennter, nicht verbundener Trace. Den Trace-Kontext in die Nachricht legen, damit der Consumer denselben Trace fortsetzt.'),
      q('Which problem does tracing help with less than a metric?', 'Bei welchem Problem hilft Tracing weniger als eine Metrik?',
        'Noticing that something is wrong at all, across all requests. A trace explains one request; an alert on a metric tells you when to look.',
        'Bei der Erkenntnis, dass überhaupt etwas falsch ist, über alle Requests hinweg. Ein Trace erklärt einen Request; ein Alarm auf eine Metrik sagt, wann man hinsehen muss.'),
    ],
    related: ['monitoring', 'logs-events', 'profiling'],
  },
  {
    id: 'dynamic-exploration',
    domain: { parts: ['api', 'cancel', 'reserve'], what: l('A bot tries API sequences such as reserve, cancel, reserve until one fails.', 'Das Tool probiert Folgen von API-Requests, etwa Reservieren, Stornieren und erneutes Reservieren.') },
    viz: { kind: 'traffic', mode: 'dynamic-exploration' },
    name: l('Dynamic exploration', 'Dynamische Exploration'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('A dynamic exploration tool tries actions on a running system. It can examine user interface actions, API requests and sequences of states.', 'Ein Tool für Dynamic Exploration prüft Aktionen am laufenden System. Es kann UI-Aktionen, API-Requests und Zustandsfolgen ausführen.'),
    catches: l('500 errors on unusual request sequences, broken pages reachable only via odd paths, unhandled states', 'HTTP-500-Fehler bei ungewöhnlichen Request-Folgen, fehlerhafte Seiten und unbehandelte Zustände.'),
    intro: l(
      'The API fails if someone tries to cancel a reservation that does not exist. The written tests do not use this sequence. A dynamic exploration tool can find it.',
      'Die API schlägt beim Stornieren einer nicht vorhandenen Reservierung fehl. Die geschriebenen Tests prüfen diese Folge nicht. Dynamic Exploration kann sie finden.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('An exploration tool can generate requests and sequences from an OpenAPI specification.', 'Ein Tool für Dynamic Exploration kann Requests und Folgen aus einer OpenAPI-Spezifikation erzeugen.'),
      l('Exploration can find a failure in a sequence that has no written test.', 'Die Exploration kann einen Fehler in einer Folge finden, für die es keinen geschriebenen Test gibt.'),
      l('An exploration tool can start from a running service and a description such as an OpenAPI specification.', 'Das Tool braucht einen laufenden Service und eine Beschreibung, zum Beispiel eine OpenAPI-Spezifikation.'),
    ],
    limits: [
      l('Run the tool in staging or give it read-only access. Some operations can create data.', 'Führe das Tool in Staging aus oder gib ihm nur Leserechte. Schreibende Operationen können Daten erzeugen.'),
      l('To detect incorrect business results, the tool needs an oracle. Without an oracle, it can still show crashes and schema violations.', 'Für falsche fachliche Ergebnisse braucht das Tool ein Test Oracle. Ohne ein Test Oracle kann es Abstürze und Schemaverletzungen melden.'),
    ],
    ai: l('A coding agent can explore an interface and report unexpected results. Reproduce each result in a test before you use it to judge the change.', 'Ein Coding-Agent kann eine UI prüfen und unerwartete Ergebnisse melden. Reproduziere jedes Ergebnis in einem Test, bevor du damit die Änderung bewertest.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['schemathesis', 'restler', 'zap'] },
    snippets: [{ lang: "any", file: "explore-api.sh",
      description: l("Use a disposable local API with test data and its OpenAPI schema. Run Schemathesis against that API. Examine counterexamples for crashes or schema violations. The requests can change the test data.",
        "Verwende eine lokale Test-API mit Testdaten und ihrem OpenAPI-Schema. Führe Schemathesis gegen diese API aus. Prüfe Gegenbeispiele für Abstürze oder Schemaverletzungen. Die Requests können Testdaten ändern."),
      code: `schemathesis run http://localhost:3000/openapi.json   --url http://localhost:3000
# Save the minimal failing request from the report.
# Replay it as a regression test; ask the agent to fix the cause.
# Schema conformance alone cannot prove "never reserve twice".`, focus: [{ line: 1, note: l('Generate cases from the schema: no hand-written examples needed.', 'Fälle aus dem Schema erzeugen: keine handgeschriebenen Beispiele nötig.') }, { line: [2,3], note: l('Keep the minimal failing request and replay it as a regression test, so the bug stays fixed.', 'Behalte die minimale fehlschlagende Anfrage und spiele sie als Regressionstest ab, damit der Bug behoben bleibt.') }, { line: 4, note: l('Passing means the API follows its schema, not that the business rule holds.', 'Bestehen heißt, die API hält ihr Schema ein, nicht dass die Geschäftsregel gilt.') }] }],
    steps: [
      l('Configure an OpenAPI exploration tool for a staging deployment.', 'Konfiguriere ein OpenAPI-Tool für Dynamic Exploration in Staging.'), l('Examine each HTTP 5xx response and schema violation. Add a regression test for each confirmed defect.', 'Untersuche jede HTTP-5xx-Antwort und jede Schemaverletzung. Ergänze für bestätigte Fehler einen Regression Test.'),
      l('Give the tool test credentials with limited permissions. Remove the test data after the run.', 'Gib dem Tool Testzugangsdaten mit begrenzten Rechten. Entferne die Testdaten nach dem Lauf.'),
    ],
    done: l('The tool explores the staging service. The report gives a reason for each HTTP 5xx response.', 'Die Exploration läuft in Staging. Zu jeder HTTP-5xx-Antwort gibt es eine Erklärung.'),
    think: [
      q('How is dynamic exploration different from fuzzing?', 'Wie unterscheidet sich dynamische Exploration vom Fuzzing?', 'Fuzzing hammers one entry point with mutated bytes. Exploration walks a running system\'s surface (pages, endpoints, sequences) to reach places nobody thought to test.', 'Fuzzing bearbeitet einen Einstiegspunkt mit mutierten Bytes. Exploration durchläuft die Oberfläche eines laufenden Systems (Seiten, Endpunkte, Folgen), um Stellen zu erreichen, an die niemand beim Testen dachte.'),
      q('Predict: you point an API explorer at staging and it calls `DELETE /pets/{id}` with valid ids. What happens to your test data?', 'Vorhersage: Du richtest einen API-Explorer auf Staging, und er ruft `DELETE /pets/{id}` mit gültigen IDs auf. Was passiert mit deinen Testdaten?',
        'They are deleted, and later requests fail on missing data. Reset the data before each run, or exclude destructive endpoints, and never run it against production.',
        'Sie werden gelöscht, und spätere Requests scheitern an fehlenden Daten. Die Daten vor jedem Lauf zurücksetzen oder destruktive Endpunkte ausschließen und es nie gegen Produktion laufen lassen.'),
      q('The explorer finds no 5xx errors. What can still be wrong?', 'Der Explorer findet keine 5xx-Fehler. Was kann trotzdem falsch sein?',
        'Responses can be well-formed but wrong, such as a wrong price or a pet reserved twice with a 200. It checks that the system survives, not that it is right.',
        'Antworten können wohlgeformt, aber falsch sein, etwa ein falscher Preis oder ein doppelt reserviertes Tier mit 200. Er prüft, dass das System durchhält, nicht dass es stimmt.'),
    ],
    related: ['fuzz-tests', 'penetration-tests', 'contract-tests'],
  },
  {
    id: 'real-user-monitoring',
    domain: { parts: ['ui', 'monitoring'], what: l('Load times of the pet pages are measured on the devices of real users.', 'Real User Monitoring misst die Ladezeiten der Tierseiten auf Nutzergeräten.') },
    viz: { kind: 'observe', mode: 'real-user-monitoring' },
    name: l('Real user monitoring', 'Real User Monitoring (RUM)'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('Real user monitoring (RUM) measures load times, interaction delays and client errors on users\' devices.', 'Real User Monitoring (RUM) erfasst Ladezeiten, Verzögerungen bei Interaktionen und Client-Fehler auf den Geräten der Nutzer.'),
    catches: l('slowness on real devices and networks, errors in specific browsers, layout shifts', 'Hohe Ladezeiten auf Nutzergeräten, Browser-Fehler und unerwartete Layoutänderungen.'),
    intro: l(
      'A coding agent tests the pet gallery on a fast computer. On an older phone, the same page takes eight seconds to load. Real user monitoring shows results by device and browser.',
      'Ein Coding-Agent testet die Galerie auf einem schnellen Computer. Auf einem älteren Handy dauert derselbe Aufruf acht Sekunden. RUM zeigt die Messwerte pro Gerät und Browser.',
    ),
    cost: 1,
    feedback: 'hours',
    worth: [
      l('Real user monitoring can show a delay on a device that looks normal in server metrics.', 'Real User Monitoring kann Verzögerungen auf einem Gerät zeigen, die in Servermetriken nicht sichtbar sind.'), l('Core Web Vitals give standard measures of loading, interaction and layout changes.', 'Core Web Vitals messen Ladezeit, Reaktionszeit und Layout-Stabilität.'),
      l('Group results by device, browser and network to find problems that affect a particular group.', 'Gruppiere die Ergebnisse nach Gerät, Browser und Netzwerk. So kannst du Probleme für einzelne Gruppen erkennen.'),
    ],
    limits: [
      l('Get consent where necessary. Collect aggregate measurements and protect personal data.', 'Hole bei Bedarf eine Einwilligung ein. Erfasse aggregierte Messwerte und schütze personenbezogene Daten.'),
      l('Real user monitoring shows where users experience delays. Use traces and profiles to determine the cause.', 'Real User Monitoring zeigt, wo Nutzer Verzögerungen erleben. Untersuche die Ursache mit Tracing und Profiling.'),
    ],
    ai: l('A coding agent can use a fast device for its browser tests. Use real user monitoring to measure the same pages on users\' devices.', 'Ein Coding-Agent kann Browser-Tests auf einem schnellen Gerät ausführen. Miss mit Real User Monitoring, wie die Seiten auf den Geräten der Nutzer laden.'),
    evidence: { general: none(), ai: none() },
    tools: { js: ['web-vitals', 'boomerang'], any: ['opentelemetry'] },
    snippets: [{ lang: "js", file: "web-vitals.ts",
      description: l("Install web-vitals. Configure a metrics receiver on the same origin. Use the browser network panel to examine the payload. Group results by release and page.",
        "Installiere web-vitals. Konfiguriere einen Empfänger für Metriken unter derselben Origin. Prüfe den Payload im Network Panel. Gruppiere Ergebnisse nach Release und Seite."),
      code: `import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';
function report({ name, value, id }: Metric) {
  navigator.sendBeacon('/metrics/web-vitals',
    new Blob([JSON.stringify({
      name, value, id, page: 'pet-detail', release: 'local-example',
    })],
      { type: 'application/json' }));
}
onCLS(report);
onINP(report);
onLCP(report);
// Replace local-example with your build's release identifier.
// Receiver: validate, sample and aggregate; do not store raw user IDs.`, focus: [{ line: 3, note: l('sendBeacon survives the user leaving the page, so you do not lose the last measurements.', 'sendBeacon überlebt das Verlassen der Seite, sodass die letzten Messungen nicht verloren gehen.') }, { line: 5, note: l('The release field lets you tie a regression to the deployment that caused it.', 'Das Feld release lässt dich eine Regression dem Deployment zuordnen, das sie verursacht hat.') }, { line: [9,11], note: l('These three vitals measure what users feel: layout shift, responsiveness and load time.', 'Diese drei Vitals messen, was Nutzer spüren: Layoutverschiebung, Reaktionsfähigkeit und Ladezeit.') }, { line: 13, note: l('Aggregate on the server and store no raw user IDs: monitoring is not tracking.', 'Aggregiere auf dem Server und speichere keine rohen Nutzer-IDs: Monitoring ist kein Tracking.') }] }],
    steps: [
      l('With consent, record Core Web Vitals and client errors. Tag the measurements with the release.', 'Erfasse Core Web Vitals und Client-Fehler mit Einwilligung. Kennzeichne die Messwerte mit dem Release.'), l('Set performance limits. For example, set LCP below 2.5 s at p75. Configure an alert for measurements outside these limits.', 'Lege Performance-Grenzwerte fest, etwa LCP unter 2,5 s bei p75. Konfiguriere einen Alert für Verstöße.'),
      l('Include the release and page in the measurement tags. Use these tags to identify which changes affect the metric.', 'Kennzeichne die Messwerte mit Release und Seite. Nutze diese Angaben, um Änderungen der Metrik zuzuordnen.'),
    ],
    done: l('The dashboard shows web vitals for each release. A result outside the performance budget causes an alert.', 'Das Dashboard zeigt die Web Vitals pro Release. Ein Wert außerhalb des Performance-Budgets löst einen Alert aus.'),
    think: [
      q('Your lab test says the page loads in 0.8 s. RUM says p75 is 3.4 s. Who is right?', 'Dein Labortest sagt, die Seite lädt in 0,8 s. RUM sagt p75 ist 3,4 s. Wer hat recht?', 'Both, about different things. The lab measures your setup; RUM measures your users. Users are the ones who matter.', 'Beide, über verschiedene Dinge. Das Labor misst den eigenen Aufbau; RUM misst die Nutzer. Auf die Nutzer kommt es an.'),
      q('Predict: an agent adds a large image to the pet detail page. Server metrics stay the same. Which RUM metric moves?', 'Vorhersage: Ein Agent fügt der Tierdetailseite ein großes Bild hinzu. Die Servermetriken bleiben gleich. Welche RUM-Metrik bewegt sich?',
        'Largest Contentful Paint gets worse, mostly on slow connections. Server-side checks cannot see it, which is why a client-side budget is needed.',
        'Der Largest Contentful Paint verschlechtert sich, vor allem bei langsamen Verbindungen. Serverseitige Prüfungen sehen das nicht, deshalb braucht es ein Budget auf der Clientseite.'),
      q('When is RUM the wrong tool?', 'Wann ist RUM das falsche Werkzeug?',
        'Before release, or for a page with very few visitors: there is no data to look at. Use synthetic and lab tests there, and RUM for what real users do.',
        'Vor dem Release oder bei einer Seite mit sehr wenigen Besuchern: Es gibt keine Daten. Dort Synthetic- und Labortests nutzen und RUM für das, was echte Nutzer erleben.'),
    ],
    related: ['monitoring', 'ui-ux-tests', 'ab-tests'],
  },
  {
    id: 'auditing',
    domain: { parts: ['agent', 'monitoring'], what: l('An audit log records each agent action, for example deleted reservations.', 'Ein Audit Log erfasst Aktionen eines Coding-Agenten wie das Löschen von Reservierungen.') },
    viz: { kind: 'observe', mode: 'auditing' },
    name: l('Auditing', 'Auditing'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('An audit log records who did an action and when. A tamper-evident log can show if someone changes the record.', 'Ein Audit Log erfasst den Urheber und den Zeitpunkt einer Aktion. Es kann spätere Änderungen an den Einträgen erkennbar machen.'),
    catches: l('unauthorised access, privilege misuse, changes without approval, actions by automated agents outside their scope', 'Unbefugte Zugriffe, Aktionen außerhalb erlaubter Rechte und Änderungen ohne Freigabe.'),
    intro: l(
      'A coding agent with administrative access deletes 200 reservations. An audit log records the identity for each deletion. Use the record to identify which reservations to restore.',
      'Ein Coding-Agent mit Admin-Rechten löscht 200 Reservierungen. Das Audit Log erfasst die Identität für jeden Löschvorgang. Nutze die Einträge, um die betroffenen Reservierungen zu ermitteln.',
    ),
    cost: 2,
    feedback: 'days',
    worth: [
      l('An audit log can identify who made a change. Some compliance rules require this record.', 'Ein Audit Log zeigt, wer eine Änderung ausgeführt hat. Manche Compliance-Regeln verlangen diese Aufzeichnung.'),
      l('A separate identity lets you find the actions of each coding agent. Use the record to plan a correction.', 'Eine eigene Identität erlaubt die Zuordnung von Aktionen zu einem Coding-Agenten. Nutze die Einträge, um Korrekturen zu planen.'),
      l('An append-only log can supply evidence if the actor cannot edit its records.', 'Ein Append-only Log kann Belege liefern, wenn der Urheber seine Einträge nicht ändern kann.'),
    ],
    limits: [
      l('Schedule queries that report actions a person must review.', 'Plane Abfragen für Aktionen, die eine Person prüfen muss.'),
      l('An audit log records actions after they occur. Use least privilege to prevent unauthorized actions.', 'Audit Logging erfasst Aktionen nach ihrer Ausführung. Begrenze Rechte mit Least Privilege.'),
    ],
    ai: l('Give each coding agent a separate identity. Use the audit log to examine whether its actions stay within the permitted scope.', 'Gib jedem Coding-Agenten eine eigene Identität. Prüfe im Audit Log, ob seine Aktionen im zulässigen Umfang liegen.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['falco', 'osquery', 'opentelemetry'] },
    snippets: [{ lang: "any", file: "audit-trail.sql",
      description: l("Run the example in a disposable PostgreSQL database. A duplicate event ID must make the insert fail. In production, write the change and event in one transaction. Restrict changes to the log. Check retention separately.",
        "Führe das Beispiel in einer temporären PostgreSQL-Datenbank aus. Eine doppelte Event-ID muss den Insert fehlschlagen lassen. Schreibe in Produktion Änderung und Event in einer Transaktion. Begrenze Schreibrechte auf das Log. Prüfe die Aufbewahrung separat."),
      code: `CREATE TABLE reservation_audit (
  event_id text PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_id text NOT NULL,
  pet_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('reserved', 'cancelled'))
);
INSERT INTO reservation_audit (event_id, actor_id, pet_id, action)
VALUES ('evt-1', 'synthetic-actor', 'rex', 'reserved');
SELECT event_id, actor_id, action
FROM reservation_audit WHERE pet_id = 'rex' ORDER BY occurred_at;
-- A table alone is not tamper-proof or a compliance guarantee.`, focus: [{ line: 2, note: l('A unique event ID makes retries idempotent: the same event cannot be written twice.', 'Eine eindeutige Event-ID macht Wiederholungen idempotent: Dasselbe Ereignis kann nicht doppelt geschrieben werden.') }, { line: 4, note: l('Every entry names who acted; without that, an audit trail answers nothing.', 'Jeder Eintrag nennt, wer gehandelt hat; ohne das beantwortet ein Audit-Trail nichts.') }, { line: 6, note: l('The CHECK limits actions to known values, so a typo cannot create a meaningless record.', 'Das CHECK beschränkt Aktionen auf bekannte Werte, sodass ein Tippfehler keinen sinnlosen Eintrag erzeugt.') }, { line: 12, note: l('A table is not tamper-proof: protect writes, retention and access separately.', 'Eine Tabelle ist nicht manipulationssicher: Schütze Schreibrechte, Aufbewahrung und Zugriff separat.') }] }],
    steps: [l('Use append-only storage to record privileged actions. Include the actor identity, time and target for each action.', 'Protokolliere privilegierte Aktionen in einem Append-only Log. Erfasse die Identität, den Zeitpunkt und das Ziel jeder Aktion.'), l('Give each coding agent a separate identity and only the permissions that its task requires.', 'Gib jedem Coding-Agenten eine eigene Identität. Gib ihm nur die Rechte, die er für die Aufgabe braucht.'), l('Schedule queries that report unexpected actions. Review the results each week.', 'Plane Abfragen für unerwartete Aktionen. Prüfe die Ergebnisse jede Woche.')],
    done: l('Each privileged action has an audit entry with the coding agent\'s distinct identity. A scheduled query reports a test action outside the permitted scope.', 'Jede privilegierte Aktion hat einen Audit-Eintrag mit eigener Identität des Coding-Agenten. Eine geplante Abfrage meldet eine Testaktion außerhalb des erlaubten Umfangs.'),
    think: [
      q('Why should an agent not use your personal credentials?', 'Warum sollte ein Agent nicht deine persönlichen Zugangsdaten nutzen?', 'Then the audit log cannot tell you from the agent, and the agent has all your permissions. Separate identity means attributable actions and a smaller blast radius.', 'Dann kann das Audit-Log dich nicht vom Agenten unterscheiden, und der Agent hat alle deine Rechte. Eine eigene Identität heißt zuordenbare Aktionen und kleinerer Wirkungsradius.'),
      q('Predict: an agent runs with a shared admin token and deletes 40 pets by mistake. What does the audit log show?', 'Vorhersage: Ein Agent läuft mit einem gemeinsamen Admin-Token und löscht versehentlich 40 Tiere. Was zeigt das Audit-Log?',
        'Only that "admin" deleted them; you cannot tell who or what. A separate identity per agent and a narrow scope would have limited and attributed it.',
        'Nur dass „admin“ sie gelöscht hat; wer oder was, bleibt offen. Eine eigene Identität pro Agent und ein enger Zugriffsbereich hätten den Schaden begrenzt und zugeordnet.'),
      q('Which problem does auditing not solve, however complete the log?', 'Welches Problem löst Auditing nicht, egal wie vollständig das Log ist?',
        'Preventing the damage: it tells you afterwards. Nobody reading the log in time, or an agent allowed to do too much, makes it a record of a failure rather than a safeguard.',
        'Den Schaden zu verhindern: Es berichtet erst danach. Liest niemand das Log rechtzeitig oder darf ein Agent zu viel, wird es zur Aufzeichnung eines Versagens statt zu einer Sicherung.'),
    ],
    related: ['logs-events', 'agent-rules', 'security-scanning'],
  },
];
