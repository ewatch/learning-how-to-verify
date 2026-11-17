import type { Practice } from '../types';
import { ev, f, l, none, q } from './_h';

export const verification: Practice[] = [
  {
    id: 'formal-verification',
    name: l('Formal verification', 'Formale Verifikation'),
    layer: 'verification',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Prove mathematically that code or a design has a property for all inputs and interleavings, not only tested ones.', 'Mathematisch beweisen, dass Code oder ein Entwurf eine Eigenschaft für jede Eingabe und jede Verschränkung erfüllt, nicht nur für die getesteten.'),
    catches: l('design bugs in protocols and concurrency (double-booking in 7 steps), and logic bugs no test happened to hit', 'Entwurfsfehler in Protokollen und Nebenläufigkeit (Doppelbuchung in 7 Schritten) und Logikfehler, die kein Test zufällig traf'),
    intro: l(
      'Two people press "Reserve" for the same pet at the same moment. The bug needs one exact order of steps, so tests almost never hit it. Formal verification checks every possible order and shows the one that breaks the rule.',
      'Zwei Personen drücken im selben Moment „Reservieren“ für dasselbe Tier. Der Fehler braucht genau eine Reihenfolge der Schritte, also treffen Tests ihn fast nie. Formale Verifikation prüft jede mögliche Reihenfolge und zeigt die, die die Regel bricht.',
    ),
    cost: 3,
    feedback: 'hours',
    worth: [
      l('Model checking (TLA+, P) explores every interleaving of a small model exhaustively; it finds race conditions tests almost never hit.', 'Model Checking (TLA+, P) durchsucht jede Verschränkung eines kleinen Modells vollständig; es findet Race Conditions, die Tests fast nie treffen.'),
      l('Program verifiers (Dafny, Verus, Kani) prove that code meets its contract for all inputs.', 'Programmverifizierer (Dafny, Verus, Kani) beweisen, dass Code seinen Vertrag für alle Eingaben erfüllt.'),
      l('Writing the spec alone often reveals the bug, before any tool runs.', 'Schon das Schreiben der Spezifikation deckt oft den Fehler auf, bevor ein Werkzeug läuft.'),
    ],
    limits: [
      l('A proof is only as good as the spec: prove the wrong property and you are confidently wrong.', 'Ein Beweis ist nur so gut wie die Spezifikation: Wer die falsche Eigenschaft beweist, irrt mit Gewissheit.'),
      l('Proves the model or the verified program, not your production code, unless you connect them (code generation, differential tests).', 'Beweist das Modell oder das verifizierte Programm, nicht den Produktionscode, außer man verbindet beide (Codegenerierung, Differenztests).'),
      l('Learning curve and effort are real; use it where bugs are expensive.', 'Lernkurve und Aufwand sind real; dort einsetzen, wo Fehler teuer sind.'),
    ],
    ai: l(
      'A verifier is a perfect judge for an agent: it cannot be argued with, and its error messages say exactly what is missing. LLMs now write a large share of Dafny and Verus proofs on benchmarks. The human job shifts to reviewing the spec, which is short.',
      'Ein Verifizierer ist ein perfekter Richter für einen Agenten: Mit ihm lässt sich nicht diskutieren, und seine Fehlermeldungen sagen genau, was fehlt. LLMs schreiben auf Benchmarks inzwischen einen großen Teil der Dafny- und Verus-Beweise. Die menschliche Aufgabe verschiebt sich zum Review der Spezifikation, und die ist kurz.',
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
      { name: l('Model checking (TLA+, P, Alloy)', 'Model Checking (TLA+, P, Alloy)'), text: l('Describe the design as states and steps; the checker explores all reachable states of a small instance.', 'Den Entwurf als Zustände und Schritte beschreiben; der Checker durchsucht alle erreichbaren Zustände einer kleinen Instanz.') },
      { name: l('Program verification (Dafny, Verus, Lean)', 'Programmverifikation (Dafny, Verus, Lean)'), text: l('Annotate code with pre-/postconditions and loop invariants; an SMT solver or proof assistant checks them.', 'Code mit Vor-/Nachbedingungen und Schleifeninvarianten annotieren; ein SMT-Solver oder Beweisassistent prüft sie.') },
      { name: l('Symbolic execution & bounded model checking (KLEE, CBMC, Kani)', 'Symbolische Ausführung & Bounded Model Checking (KLEE, CBMC, Kani)'), text: l('Push-button: explore program paths symbolically up to a bound. Much less proof effort, used in CI at AWS.', 'Auf Knopfdruck: Programmpfade symbolisch bis zu einer Grenze erkunden. Viel weniger Beweisaufwand, bei AWS in der CI im Einsatz.') },
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
      l('Choose the one piece where a bug is most expensive: a concurrent protocol (→ TLA+/P) or a core algorithm (→ Dafny/Verus/Kani).', 'Das eine Stück wählen, wo ein Fehler am teuersten ist: ein nebenläufiges Protokoll (→ TLA+/P) oder ein Kernalgorithmus (→ Dafny/Verus/Kani).'),
      l('Write the property first in plain words, then as an invariant or postcondition, and have a human review it.', 'Die Eigenschaft zuerst in Worten, dann als Invariante oder Nachbedingung schreiben und von einem Menschen reviewen lassen.'),
      l('Model or annotate the code and run the checker; iterate on its error messages until it passes.', 'Den Code modellieren oder annotieren und den Checker ausführen; anhand seiner Fehlermeldungen iterieren, bis er besteht.'),
      l('Check the spec is not vacuous: break the design on purpose and confirm the checker finds a counterexample.', 'Prüfen, dass die Spezifikation nicht leer ist: den Entwurf absichtlich brechen und bestätigen, dass der Checker ein Gegenbeispiel findet.'),
      l('Connect proof and code: generate code from the verified version, or differential-test it against the production code.', 'Beweis und Code verbinden: Code aus der verifizierten Fassung erzeugen oder sie per Differenztest gegen den Produktionscode prüfen.'),
    ],
    done: l('The checker passes on the correct version, finds a counterexample on a deliberately broken version, and a differential test links the verified model to production code.', 'Der Checker besteht auf der korrekten Fassung, findet ein Gegenbeispiel auf einer absichtlich kaputten, und ein Differenztest verbindet das verifizierte Modell mit dem Produktionscode.'),
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
    sim: 'dbc',
    name: l('Design by contract & assertions', 'Design by Contract & Assertions'),
    layer: 'verification',
    phases: ['pre', 'post'],
    fromOverview: false,
    oneLiner: l('Write pre- and postconditions and invariants into the code, and check them at runtime (or prove them).', 'Vor- und Nachbedingungen sowie Invarianten in den Code schreiben und zur Laufzeit prüfen (oder beweisen).'),
    catches: l('broken assumptions close to where they break: a negative price, a reservation without a pet, an empty cart at checkout', 'gebrochene Annahmen nahe der Stelle, wo sie brechen: negativer Preis, Reservierung ohne Tier, leerer Warenkorb an der Kasse'),
    intro: l(
      'A wrong value appears on an invoice, but it became wrong three modules earlier. A contract checks at each step what must be true and stops the program at the first wrong value.',
      'Ein falscher Wert steht auf einer Rechnung, aber er wurde drei Module früher falsch. Ein Contract prüft an jeder Stelle, was gelten muss, und stoppt das Programm beim ersten falschen Wert.',
    ),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('Fails loudly at the cause, not three modules later at the symptom.', 'Scheitert laut an der Ursache, nicht drei Module später am Symptom.'),
      l('Every test, fuzz run and production request becomes a check of the contract.', 'Jeder Test, jeder Fuzz-Lauf und jede Produktionsanfrage wird zur Prüfung des Vertrags.'),
      l('Contracts are the same thing a formal verifier proves; they are a gentle first step.', 'Verträge sind dasselbe, was ein formaler Verifizierer beweist; sie sind ein sanfter erster Schritt.'),
    ],
    limits: [
      l('Runtime checks cost a little performance and only check executions that happen.', 'Laufzeitprüfungen kosten etwas Performance und prüfen nur Ausführungen, die stattfinden.'),
      l('Contracts only check the executions that actually happen, so they need good test inputs (property tests, fuzzing) to be exercised.', 'Contracts prüfen nur die Ausführungen, die tatsächlich stattfinden, und brauchen daher gute Testeingaben (Property-Tests, Fuzzing), um ausgelöst zu werden.'),
    ],
    ai: l('Contracts turn the spec into executable checks that the agent\'s code must respect, and a contract violation in a fuzz run is precise feedback. Ask the agent to add contracts, but review them: they are spec.', 'Verträge machen die Spezifikation zu ausführbaren Prüfungen, die der Code des Agenten respektieren muss, und eine Vertragsverletzung in einem Fuzz-Lauf ist präzises Feedback. Den Agenten Verträge ergänzen lassen, aber reviewen: Sie sind Spezifikation.'),
    evidence: {
      general: ev('moderate', f('kudrjavets2006', 'In two Microsoft components, higher assertion density correlated with significantly lower fault density (correlational).', 'In zwei Microsoft-Komponenten ging höhere Assertion-Dichte mit deutlich geringerer Fehlerdichte einher (korrelativ).')),
      ai: ev('weak', f('clover2024', 'Indirect: requires/ensures contracts served as the spec that LLM-generated code had to satisfy, and consistency checks rejected all adversarial wrong programs.', 'Indirekt: requires/ensures-Verträge dienten als Spezifikation für LLM-generierten Code, und Konsistenzprüfungen wiesen alle absichtlich falschen Programme ab.')),
    },
    variants: [{ name: l('Runtime verification', 'Laufzeitverifikation'), text: l('Check production logs or traces against a formal spec (e.g. AWS checks logs against P specifications).', 'Produktionslogs oder Traces gegen eine formale Spezifikation prüfen (z. B. prüft AWS Logs gegen P-Spezifikationen).') }],
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
    steps: [l('For 2–3 core functions, write the pre- and postconditions in plain words.', 'Für 2–3 Kernfunktionen die Vor- und Nachbedingungen in Worten aufschreiben.'), l('Encode them as assertions or contract decorators that run in tests and staging.', 'Sie als Assertions oder Vertragsdekoratoren kodieren, die in Tests und Staging laufen.'), l('Run property-based tests or fuzzing against the functions so the contracts get exercised.', 'Property-Based Tests oder Fuzzing gegen die Funktionen laufen lassen, damit die Verträge geprüft werden.')],
    done: l('Contracts are in place, documented in words, and a generated-input test run triggers no contract violation.', 'Verträge sind vorhanden und in Worten dokumentiert, und ein Testlauf mit erzeugten Eingaben löst keine Vertragsverletzung aus.'),
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
    viz: { kind: 'pipeline', mode: 'sanitizers' },
    name: l('Sanitizers', 'Sanitizer'),
    layer: 'verification',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('Compile with extra runtime checks that detect memory errors, undefined behaviour and data races the moment they happen.', 'Mit zusätzlichen Laufzeitprüfungen kompilieren, die Speicherfehler, undefiniertes Verhalten und Data Races in dem Moment erkennen, in dem sie passieren.'),
    catches: l('buffer overflows, use-after-free, integer overflow, uninitialised reads, data races', 'Pufferüberläufe, Use-after-free, Ganzzahlüberlauf, Lesen nicht initialisierten Speichers, Data Races'),
    intro: l(
      'An agent writes a C function that reads one byte past the end of a buffer. The tests pass, because the extra byte does no visible harm today. A sanitizer stops the program at the exact line, so the test shows the bug.',
      'Ein Agent schreibt eine C-Funktion, die ein Byte hinter dem Ende eines Buffers liest. Die Tests bestehen, weil das zusätzliche Byte heute keinen sichtbaren Schaden macht. Ein Sanitizer stoppt das Programm genau an dieser Zeile, und der Test zeigt den Fehler.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('Makes silent memory corruption crash loudly, so tests and fuzzers can see it.', 'Lässt stille Speicherbeschädigung laut abstürzen, damit Tests und Fuzzer sie sehen.'), l('Just a compiler flag on your existing test suite.', 'Nur ein Compilerflag auf der bestehenden Testsuite.'),
      l('Finds bugs at the moment of the error, with a stack trace, instead of far away when the corrupted data is used.', 'Findet Fehler im Moment ihres Auftretens mit Stack Trace, statt weit entfernt, wenn die beschädigten Daten verwendet werden.'),
    ],
    limits: [l('Only checks code paths that run; combine with fuzzing for reach.', 'Prüft nur Codepfade, die laufen; für Reichweite mit Fuzzing kombinieren.'), l('Roughly 2× slowdown; use in test builds, not production.', 'Etwa 2× langsamer; in Testbuilds nutzen, nicht in Produktion.')],
    ai: l('LLMs produce memory-unsafe C and C++ at notable rates. Running the agent\'s tests under ASan and UBSan is the cheapest way to see those bugs.', 'LLMs erzeugen in nennenswertem Umfang speicherunsicheres C und C++. Die Tests des Agenten unter ASan und UBSan laufen zu lassen ist der billigste Weg, diese Fehler zu sehen.'),
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
    steps: [l('Add a CI job that builds and runs the full test suite with ASan + UBSan (or -race in Go, Miri in Rust).', 'Einen CI-Job ergänzen, der die ganze Testsuite mit ASan + UBSan (bzw. -race in Go, Miri in Rust) baut und ausführt.'), l('Run fuzz targets with sanitizers enabled.', 'Fuzz-Targets mit aktivierten Sanitizern laufen lassen.'), l('Treat every sanitizer report as a failing test.', 'Jeden Sanitizer-Bericht wie einen fehlschlagenden Test behandeln.')],
    done: l('The sanitizer CI job is green and fails on a planted out-of-bounds read.', 'Der Sanitizer-CI-Job ist grün und scheitert bei einem eingeschleusten Lesen außerhalb der Grenzen.'),
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
    viz: { kind: 'traffic', mode: 'tap-compare' },
    name: l('Tap compare', 'Tap Compare'),
    layer: 'verification',
    phases: ['deploy'],
    fromOverview: true,
    oneLiner: l('Send copies of real requests to the old and the new version and compare the responses.', 'Kopien echter Anfragen an die alte und die neue Version schicken und die Antworten vergleichen.'),
    catches: l('behaviour differences that only real traffic triggers: odd inputs, rare paths, data no test fixture has', 'Verhaltensunterschiede, die nur echter Verkehr auslöst: seltsame Eingaben, seltene Pfade, Daten, die keine Test-Fixture hat'),
    intro: l(
      'An agent rewrites the search service. Your test inputs pass, but real users search with typos, emoji and strange filters. Tap compare uses real requests as test input, so you find the differences before a user sees one.',
      'Ein Agent schreibt den Suchservice neu. Deine Testeingaben bestehen, aber echte Nutzer suchen mit Tippfehlern, Emoji und seltsamen Filtern. Tap Compare nutzt echte Anfragen als Testeingabe, damit du die Unterschiede findest, bevor ein Nutzer einen sieht.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('Differential testing with production as the input generator.', 'Differential Testing mit der Produktion als Eingabegenerator.'), l('Noise filtering (timestamps, IDs) compares two old instances to learn what "normal difference" looks like.', 'Rauschfilterung (Zeitstempel, IDs) vergleicht zwei alte Instanzen, um „normale Unterschiede“ zu lernen.'),
      l('Needs no hand-written test inputs: real users produce rare combinations no fixture contains.', 'Braucht keine handgeschriebenen Testeingaben: Echte Nutzer erzeugen seltene Kombinationen, die in keinem Fixture stehen.'),
    ],
    limits: [
      l('Write requests need care: the new version must not cause real side effects.', 'Schreibende Anfragen brauchen Vorsicht: Die neue Version darf keine echten Seiteneffekte auslösen.'),
      l('Comparing responses can expose personal data to whoever reads the diffs; restrict access and redact.', 'Der Vergleich von Antworten kann personenbezogene Daten gegenüber den Lesern der Diffs offenlegen; Zugriff beschränken und schwärzen.'),
    ],
    ai: l('For a large agent-written rewrite, tap compare on real traffic finds what thousands of generated inputs miss, before any user sees the new version.', 'Bei einer großen, von einem Agenten geschriebenen Neufassung findet Tap Compare auf echtem Verkehr, was Tausende erzeugte Eingaben übersehen, bevor ein Nutzer die neue Version sieht.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['diffy', 'envoy'] },
    snippets: [{ lang: "js", file: "compare-responses.test.ts",
      description: l("This runnable Vitest fixture compares two response bodies after removing a known volatile field. Replace the fixtures with captured read-only responses. Do not normalise the reserved owner away.",
        "Dieses ausführbare Vitest-Fixture vergleicht zwei Antwort-Bodies nach Entfernen eines bekannten volatilen Felds. Fixtures durch aufgezeichnete Read-only-Antworten ersetzen. Die reservierte Person nicht wegnormalisieren."),
      code: `import { expect, test } from 'vitest';
type Reply = { petId: string; owner: string; requestId: string };
const normalise = ({ requestId: _ignored, ...body }: Reply) => body;
test('candidate preserves the reservation owner', () => {
  const reference = { petId: 'rex', owner: 'anna', requestId: 'old-1' };
  const candidate = { petId: 'rex', owner: 'anna', requestId: 'new-2' };
  expect(normalise(candidate)).toEqual(normalise(reference));
  // Change candidate.owner to 'ben': this comparison must fail.
});`, focus: [{ line: 3, note: l('Normalise away fields that legitimately differ, such as request IDs; compare only what must match.', 'Felder entfernen, die legitim abweichen, etwa Request-IDs; nur vergleichen, was übereinstimmen muss.') }, { line: 7, note: l('The comparison itself: same owner for the same pet in the old and the new system.', 'Der Vergleich selbst: derselbe Besitzer für dasselbe Tier im alten und im neuen System.') }, { line: 8, note: l('Prove the check can fail: change the owner and watch it go red.', 'Beweise, dass die Prüfung fehlschlagen kann: Ändere den Besitzer und sieh zu, wie sie rot wird.') }] }],
    steps: [l('Mirror a sample of read-only requests to old and new versions.', 'Eine Stichprobe lesender Anfragen an alte und neue Version spiegeln.'), l('Compare responses field by field; learn noise by comparing two old instances.', 'Antworten Feld für Feld vergleichen; Rauschen lernen, indem man zwei alte Instanzen vergleicht.'), l('Investigate every non-noise difference before shifting traffic.', 'Jeden Unterschied außer Rauschen untersuchen, bevor Verkehr verlagert wird.')],
    done: l('A day of sampled traffic shows no unexplained differences between old and new.', 'Ein Tag Stichprobenverkehr zeigt keine unerklärten Unterschiede zwischen alt und neu.'),
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
    viz: { kind: 'traffic', mode: 'shadowing' },
    name: l('Shadowing', 'Shadowing (Schattenbetrieb)'),
    layer: 'verification',
    phases: ['deploy'],
    fromOverview: true,
    oneLiner: l('Run the new version alongside production on a copy of live traffic; its responses are discarded, its behaviour is observed.', 'Die neue Version neben der Produktion auf einer Kopie des Live-Verkehrs betreiben; ihre Antworten werden verworfen, ihr Verhalten beobachtet.'),
    catches: l('crashes, latency, resource use and errors of the new version under real load, with zero user impact', 'Abstürze, Latenz, Ressourcenverbrauch und Fehler der neuen Version unter echter Last, ohne Auswirkung auf Nutzer'),
    intro: l(
      'You move the reservation service to a new database. The tests pass, but nobody knows how the new version behaves with the real number of requests. Shadowing lets the new version process real traffic in parallel, while users still get the old answers.',
      'Du ziehst den Reservierungsservice auf eine neue Datenbank um. Die Tests bestehen, aber niemand weiß, wie sich die neue Version bei der echten Zahl an Anfragen verhält. Shadowing lässt die neue Version echten Verkehr parallel verarbeiten, während Nutzer weiter die alten Antworten bekommen.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('Real traffic, real volume, no user risk.', 'Echter Verkehr, echtes Volumen, kein Risiko für Nutzer.'), l('Good for migrations: new database, new service, new region.', 'Gut für Migrationen: neue Datenbank, neuer Dienst, neue Region.'),
      l('Shows how the new version handles real data volume and odd inputs before any user depends on it.', 'Zeigt, wie die neue Version mit echten Datenmengen und ungewöhnlichen Eingaben umgeht, bevor ein Nutzer von ihr abhängt.'),
    ],
    limits: [l('Side effects (emails, payments, writes) must be stubbed in the shadow.', 'Seiteneffekte (E-Mails, Zahlungen, Schreibzugriffe) müssen im Schatten abgeklemmt werden.'), l('Doubles the infrastructure cost while it runs.', 'Verdoppelt die Infrastrukturkosten, solange er läuft.')],
    ai: l('A safe stage for agent-written services: let the shadow run for a day, and give the agent its error logs and latency graphs as feedback.', 'Eine sichere Bühne für von Agenten geschriebene Dienste: den Schatten einen Tag laufen lassen und dem Agenten seine Fehlerlogs und Latenzkurven als Feedback geben.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['envoy', 'istio'] },
    snippets: [{ lang: "any", file: "mirror-route.yaml",
      description: l("Merge this route fragment into an existing Envoy route configuration with primary and shadow clusters. Mirror only read-only GET requests here. Observe shadow logs; its response is discarded and must never trigger real writes or notifications.",
        "Dieses Route-Fragment in eine vorhandene Envoy-Konfiguration mit Primary- und Shadow-Cluster einfügen. Hier nur Read-only-GET-Requests spiegeln. Shadow-Logs beobachten; die Antwort wird verworfen und darf keine echten Schreibvorgänge oder Benachrichtigungen auslösen."),
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
    steps: [l('Configure the proxy to mirror a percentage of traffic to the shadow deployment.', 'Den Proxy so konfigurieren, dass er einen Prozentsatz des Verkehrs an das Schatten-Deployment spiegelt.'), l('Stub all external side effects in the shadow.', 'Alle externen Seiteneffekte im Schatten abklemmen.'), l('Compare error rate, latency and resource use with production.', 'Fehlerrate, Latenz und Ressourcenverbrauch mit der Produktion vergleichen.')],
    done: l('The shadow ran on mirrored traffic for a defined period with error rate and latency within agreed bounds, and no external side effects.', 'Der Schatten lief eine festgelegte Zeit auf gespiegeltem Verkehr, mit Fehlerrate und Latenz in vereinbarten Grenzen und ohne externe Seiteneffekte.'),
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
    name: l('Canarying', 'Canary-Releases'),
    layer: 'verification',
    phases: ['release'],
    fromOverview: true,
    core: true,
    oneLiner: l('Release to a few users first; if the new version is less healthy than the old one, roll back automatically.', 'Zuerst an einen kleinen Teil der Nutzer ausliefern; ist die neue Version weniger gesund als die alte, automatisch zurückrollen.'),
    catches: l('bugs that only real users, real data and real scale trigger, with limited blast radius', 'Fehler, die nur echte Nutzer, echte Daten und echte Größe auslösen, bei begrenztem Schaden'),
    intro: l(
      'A new release passes every check but fails for customers with a rare payment method. If all users get it at once, all those customers are affected. A canary limits the damage to a small group and stops the release when errors increase.',
      'Ein neues Release besteht jede Prüfung, scheitert aber bei Kunden mit einer seltenen Zahlungsart. Bekommen alle Nutzer es gleichzeitig, trifft es alle diese Kunden. Ein Canary begrenzt den Schaden auf eine kleine Gruppe und stoppt das Release, wenn die Fehlerrate steigt.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('Limits the damage of any bug that got through all earlier layers.', 'Begrenzt den Schaden jedes Fehlers, der alle früheren Schichten passiert hat.'), l('Automated analysis (canary vs. baseline metrics) makes rollback a non-event.', 'Automatische Analyse (Canary- gegen Baseline-Metriken) macht ein Zurückrollen zur Routine.'),
      l('Needs no extra test environment: production itself, with real users, is the test bed.', 'Braucht keine zusätzliche Testumgebung: Produktion selbst, mit echten Nutzern, ist das Testbett.'),
    ],
    limits: [l('Needs good metrics; a canary is only as good as what you measure.', 'Braucht gute Metriken; ein Canary ist nur so gut wie das, was man misst.'), l('Slow bugs (leaks, data corruption) may not show during the canary window.', 'Langsame Fehler (Lecks, Datenkorruption) zeigen sich im Canary-Fenster womöglich nicht.')],
    ai: l('When more code ships with less human review, a canary is the last automated layer before everyone is affected. Make the analysis automatic; nobody watches dashboards for every agent PR.', 'Wenn mehr Code mit weniger menschlichem Review ausgeliefert wird, ist der Canary die letzte automatische Schicht, bevor alle betroffen sind. Die Analyse automatisieren; niemand beobachtet für jeden Agenten-PR Dashboards.'),
    evidence: { general: ev('moderate', f('gandalf2020', 'Gandalf, Azure\'s safe-deployment analytics, ran in production for 18+ months and automatically stopped bad rollouts.', 'Gandalf, Azures Analysedienst für sichere Deployments, lief über 18 Monate in Produktion und stoppte fehlerhafte Rollouts automatisch.')), ai: none() },
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
# error-rate: fail if 5xx rate of canary > baseline + 1%  →  automatic rollback`, focus: [{ line: 4, note: l('Start at 5%: a bad release reaches few users before anything is judged.', 'Mit 5 % starten: Ein schlechter Release erreicht wenige Nutzer, bevor etwas bewertet wird.') }, { line: 5, note: l('The canary only moves on if the analysis passes. This line is the safety net.', 'Der Canary geht nur weiter, wenn die Analyse besteht. Diese Zeile ist das Sicherheitsnetz.') }, { line: 7, note: l('A pause gives slow failures, such as leaks, time to appear before the full rollout.', 'Eine Pause gibt langsamen Fehlern, etwa Lecks, Zeit aufzutreten, bevor der volle Rollout kommt.') }, { line: 9, note: l('The rollback rule is explicit: canary worse than baseline by 1% means automatic rollback.', 'Die Rollback-Regel ist explizit: Canary um 1 % schlechter als die Baseline bedeutet automatischen Rollback.') }] }],
    steps: [l('Define 2–3 health metrics that compare canary to baseline (error rate, p95 latency, a business metric like reservations per minute).', '2–3 Gesundheitsmetriken festlegen, die Canary und Baseline vergleichen (Fehlerrate, p95-Latenz, eine Geschäftsmetrik wie Reservierungen pro Minute).'), l('Configure a stepped rollout (5% → 25% → 100%) with automated analysis between steps.', 'Einen gestuften Rollout (5 % → 25 % → 100 %) mit automatischer Analyse zwischen den Stufen konfigurieren.'), l('Test the rollback by deploying a deliberately broken version to staging.', 'Das Zurückrollen testen, indem man eine absichtlich kaputte Version in Staging deployt.')],
    done: l('A deliberately broken release is rolled back automatically at the first step without manual action.', 'Ein absichtlich kaputtes Release wird auf der ersten Stufe ohne manuellen Eingriff automatisch zurückgerollt.'),
    think: [
      q('The canary shows the same error rate as the baseline. Why might it still be broken?', 'Der Canary zeigt dieselbe Fehlerrate wie die Baseline. Warum könnte er trotzdem kaputt sein?', 'Errors are not the only failure. It might return wrong prices with status 200, or double-book silently. That is why a business metric belongs in the analysis.', 'Fehler sind nicht das einzige Versagen. Er könnte mit Status 200 falsche Preise liefern oder still doppelt buchen. Deshalb gehört eine Geschäftsmetrik in die Analyse.'),
      q('Predict: the canary gets 5% of traffic and the bug only affects customers with a voucher, 1% of users. What does the analysis see?', 'Vorhersage: Der Canary bekommt 5 % des Verkehrs, und der Fehler betrifft nur Kunden mit Gutschein, 1 % der Nutzer. Was sieht die Analyse?',
        'Almost no signal: about 0.05% of requests are affected, well within noise. Add a metric for that path or route voucher users to the canary on purpose.',
        'Fast kein Signal: Etwa 0,05 % der Requests sind betroffen, weit im Rauschen. Eine Metrik für diesen Pfad ergänzen oder Gutschein-Nutzer gezielt auf den Canary leiten.'),
      q('What changes when an agent can trigger releases?', 'Was ändert sich, wenn ein Agent Releases auslösen kann?',
        'Releases get more frequent and less reviewed, so automatic analysis and rollback matter more. Keep promotion decisions to 100% with the automated gate, not with the agent.',
        'Releases werden häufiger und weniger geprüft, daher zählen automatische Analyse und Rollback mehr. Die Entscheidung über die Ausweitung auf 100 % bleibt beim automatischen Gate, nicht beim Agenten.'),
    ],
    related: ['feature-flags', 'traffic-shaping', 'monitoring', 'smoke-tests'],
  },
  {
    id: 'traffic-shaping',
    viz: { kind: 'traffic', mode: 'traffic-shaping' },
    name: l('Traffic shaping', 'Traffic Shaping (Verkehrssteuerung)'),
    layer: 'verification',
    phases: ['release'],
    fromOverview: true,
    oneLiner: l('Control which requests reach which version, how fast, and how many, to release gradually and protect the system.', 'Steuern, welche Anfragen welche Version erreichen, wie schnell und wie viele, um schrittweise auszuliefern und das System zu schützen.'),
    catches: l('overload of a new version, a bad version reaching everyone at once, retries that snowball', 'Überlastung einer neuen Version, eine schlechte Version, die alle gleichzeitig erreicht, sich aufschaukelnde Wiederholungen'),
    intro: l(
      'A new version of the reservation service has a bug: it repeats every failed request three times. With full traffic, these repeats overload the database. Traffic shaping limits the traffic for each version, so one bug cannot stop the whole system.',
      'Eine neue Version des Reservierungsservice hat einen Fehler: Sie wiederholt jede gescheiterte Anfrage dreimal. Bei vollem Verkehr überlasten diese Wiederholungen die Datenbank. Traffic Shaping begrenzt den Verkehr pro Version, damit ein Fehler nicht das ganze System stoppt.',
    ),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('Weighted routing, rate limits and circuit breakers are the mechanics behind canaries and safe rollouts.', 'Gewichtetes Routing, Rate Limits und Circuit Breaker sind die Mechanik hinter Canaries und sicheren Rollouts.'), l('Route by header to test the new version as an internal user first.', 'Per Header routen, um die neue Version zuerst als interner Nutzer zu testen.'),
      l('Rate limits protect a dependency from a retry storm from the new version, whatever its bug.', 'Rate Limits schützen eine Abhängigkeit vor einem Retry-Sturm der neuen Version, egal welcher Fehler dahintersteckt.'),
    ],
    limits: [
      l('Adds infrastructure complexity (proxy or service mesh).', 'Bringt Infrastrukturkomplexität mit (Proxy oder Service Mesh).'),
      l('Every rule is itself configuration that can be wrong; a misrouted weight can send all traffic to a broken version.', 'Jede Regel ist selbst Konfiguration und kann falsch sein; ein falsch gesetztes Gewicht kann den gesamten Verkehr auf eine kaputte Version schicken.'),
    ],
    ai: l('Lets you expose agent-built changes to internal users first, by routing rule, without a separate environment.', 'Erlaubt, von Agenten gebaute Änderungen per Routingregel zuerst internen Nutzern zu zeigen, ohne eigene Umgebung.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['envoy', 'istio', 'argo-rollouts', 'flagger'] },
    snippets: [{ lang: "any", file: "weighted-route.yaml",
      description: l("This Envoy route fragment sends about 5% of matching requests to the candidate; unlike shadowing, its replies reach users. Use existing cluster definitions and test in staging. Weights do not measure errors or roll back automatically.",
        "Dieses Envoy-Route-Fragment sendet etwa 5 % der passenden Requests an den Kandidaten; anders als beim Shadowing erreichen dessen Antworten Nutzer. Vorhandene Cluster-Definitionen nutzen und in Staging testen. Gewichte messen keine Fehler und lösen keinen automatischen Rollback aus."),
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
    steps: [l('Put a proxy in front of the service that supports weighted and header-based routing.', 'Einen Proxy vor den Dienst setzen, der gewichtetes und headerbasiertes Routing kann.'), l('Route internal users to the new version by header, then shift a small percentage of public traffic.', 'Interne Nutzer per Header zur neuen Version leiten, dann einen kleinen Prozentsatz öffentlichen Verkehrs verlagern.'), l('Add rate limits and circuit breakers for the new version.', 'Rate Limits und Circuit Breaker für die neue Version ergänzen.')],
    done: l('Traffic split is configurable per release; internal users can reach the new version by header.', 'Die Verkehrsaufteilung ist pro Release konfigurierbar; interne Nutzer erreichen die neue Version per Header.'),
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
    name: l('Feature flagging', 'Feature Flags'),
    layer: 'verification',
    phases: ['release'],
    fromOverview: true,
    oneLiner: l('Ship code switched off, then turn it on for chosen users at runtime, and off again instantly if it misbehaves.', 'Code ausgeschaltet ausliefern, ihn dann zur Laufzeit für ausgewählte Nutzer einschalten und sofort wieder aus, wenn er sich danebenbenimmt.'),
    catches: l('bad features in production, with a kill switch that is faster than a rollback', 'schlechte Funktionen in Produktion, mit einem Notschalter, der schneller ist als ein Zurückrollen'),
    intro: l(
      'The new checkout reaches production on Friday. On Saturday it charges customers with a voucher twice. A feature flag switches the new checkout off at once, without a rollback of the whole release.',
      'Der neue Checkout geht am Freitag in Produktion. Am Samstag belastet er Kunden mit Gutschein doppelt. Ein Feature Flag schaltet den neuen Checkout sofort ab, ohne Rollback des ganzen Releases.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('Separates deploy (code is there) from release (users see it).', 'Trennt Deploy (Code ist da) von Release (Nutzer sehen ihn).'), l('Targeted rollout: staff first, then 1%, then everyone.', 'Gezielter Rollout: erst Mitarbeitende, dann 1 %, dann alle.'),
      l('Lets you test in production on staff first, so real data meets the new code before customers do.', 'Erlaubt Tests in Produktion zuerst mit Mitarbeitenden, sodass echte Daten auf den neuen Code treffen, bevor es Kunden tun.'),
    ],
    limits: [l('Old flags become technical debt and multiply the combinations to test. Remove them on a schedule.', 'Alte Flags werden zu technischen Schulden und vervielfachen die zu testenden Kombinationen. Nach Plan entfernen.'), l('A flag change is a config change: it needs the same care.', 'Eine Flag-Änderung ist eine Konfigurationsänderung: Sie braucht dieselbe Sorgfalt.')],
    ai: l('Put each agent-built feature behind a flag by default. If something slips through every earlier layer, the kill switch is one click, not a revert-and-redeploy.', 'Jede von einem Agenten gebaute Funktion standardmäßig hinter ein Flag stellen. Rutscht etwas durch alle früheren Schichten, ist der Notschalter ein Klick, kein Revert mit Redeploy.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['openfeature', 'unleash', 'flagsmith', 'growthbook'] },
    sim: 'flags',
    snippets: [{ lang: 'js', file: 'reserve.ts', code: `import { OpenFeature } from '@openfeature/server-sdk';
const flags = OpenFeature.getClient();

export async function reserve(petId: PetId, person: PersonId) {
  const useNewFlow = await flags.getBooleanValue('reservation-v2', false, { targetingKey: person });
  return useNewFlow ? reserveV2(petId, person) : reserveV1(petId, person);
}`, focus: [{ line: 5, note: l('The default false is the fallback if the flag service fails; targetingKey keeps each person on one flow.', 'Der Default false ist der Fallback, wenn der Flag-Dienst ausfällt; targetingKey hält jede Person im selben Ablauf.') }, { line: 6, note: l('Both flows stay deployed, so switching the flag off is the rollback, with no redeploy.', 'Beide Abläufe bleiben deployt, sodass das Abschalten des Flags der Rollback ist, ohne Redeploy.') }] }],
    steps: [l('Introduce a flag service behind a vendor-neutral API (OpenFeature).', 'Einen Flag-Dienst hinter einer herstellerneutralen API (OpenFeature) einführen.'), l('Wrap the new feature in a flag that defaults to off; test both paths.', 'Die neue Funktion in ein standardmäßig ausgeschaltetes Flag packen; beide Pfade testen.'), l('Give every flag an owner and an expiry date; fail CI on expired flags.', 'Jedem Flag einen Verantwortlichen und ein Ablaufdatum geben; die CI bei abgelaufenen Flags scheitern lassen.')],
    done: l('The feature can be switched off in production within a minute; both flag states are tested; the flag has an expiry date.', 'Die Funktion lässt sich in Produktion binnen einer Minute abschalten; beide Flag-Zustände sind getestet; das Flag hat ein Ablaufdatum.'),
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
    viz: { kind: 'observe', mode: 'monitoring' },
    name: l('Monitoring', 'Monitoring'),
    layer: 'verification',
    phases: ['release', 'post'],
    fromOverview: true,
    oneLiner: l('Continuously measure the health of the live system, and alert a person when it leaves its normal range.', 'Die Gesundheit des laufenden Systems fortlaufend messen und einen Menschen alarmieren, wenn sie ihren Normalbereich verlässt.'),
    catches: l('outages, slowdowns, error spikes, saturation, and broken business flows (no reservations for 10 minutes)', 'Ausfälle, Verlangsamungen, Fehlerspitzen, Auslastung und kaputte Geschäftsabläufe (10 Minuten keine Reservierung)'),
    intro: l(
      'On Sunday night no reservation succeeds for one hour, and nobody notices until Monday. All servers ran, and the logs showed no error. Monitoring measures signals such as completed reservations and alerts a person when they drop.',
      'Am Sonntagabend gelingt eine Stunde lang keine Reservierung, und bis Montag bemerkt es niemand. Alle Server liefen, und die Logs zeigten keinen Fehler. Monitoring misst Signale wie abgeschlossene Reservierungen und alarmiert eine Person, wenn sie fallen.',
    ),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('The four golden signals (latency, traffic, errors, saturation) plus one business metric cover most needs.', 'Die vier goldenen Signale (Latenz, Verkehr, Fehler, Auslastung) plus eine Geschäftsmetrik decken das meiste ab.'), l('Alert on symptoms users feel (SLOs), not on every cause.', 'Auf Symptome alarmieren, die Nutzer spüren (SLOs), nicht auf jede Ursache.'),
      l('Alerts based on an SLO tell you how much of the error budget is left, which helps to decide between shipping and fixing.', 'Alarme auf Basis eines SLO zeigen, wie viel Error Budget noch übrig ist, und helfen bei der Entscheidung zwischen Ausliefern und Beheben.'),
    ],
    limits: [
      l('Alert fatigue: too many alerts and the important one is missed.', 'Alarmmüdigkeit: Bei zu vielen Alarmen geht der wichtige unter.'),
      l('Metrics show that something is wrong, not why; you need logs and traces for the cause.', 'Metriken zeigen, dass etwas falsch ist, nicht warum; für die Ursache braucht man Logs und Traces.'),
    ],
    ai: l('Monitoring is where you find out that a check earlier in the funnel was missing. Feed incidents back: each one should produce a test, a lint rule or a contract.', 'Im Monitoring merkt man, dass eine Prüfung weiter oben im Trichter fehlte. Vorfälle zurückführen: Jeder sollte einen Test, eine Lint-Regel oder einen Vertrag hervorbringen.'),
    evidence: {
      general: ev('moderate', f('accelerate2018', 'Monitoring and observability are among the capabilities that predict delivery performance (survey-based, correlational).', 'Monitoring und Observability gehören zu den Fähigkeiten, die Liefer-Performance vorhersagen (Umfragedaten, korrelativ).')),
      ai: ev('weak', f('dora2024', 'Indirect evidence: DORA associated higher AI adoption with lower delivery stability (survey-based correlation). It did not measure whether monitoring improves the reliability of agent-written code.', 'Indirekte Evidenz: DORA fand einen Zusammenhang zwischen höherer KI-Nutzung und geringerer Lieferstabilität (Korrelation aus Umfragedaten). Ob Monitoring die Zuverlässigkeit von Agenten-Code verbessert, wurde nicht gemessen.')),
    },
    tools: { any: ['prometheus', 'grafana', 'alertmanager', 'opentelemetry'] },
    snippets: [{ lang: "any", file: "reservation-alerts.yml",
      description: l("Load this rule group in Prometheus after instrumenting reservation_requests_total with outcome labels. A synthetic staging failure should make the alert pending, then firing after five minutes. The 5% threshold is illustrative; route it to a real responder.",
        "Diese Rule Group in Prometheus laden, nachdem reservation_requests_total mit Outcome-Labels instrumentiert wurde. Ein synthetischer Staging-Fehler soll den Alert erst pending und nach fünf Minuten firing machen. Die 5-%-Schwelle ist ein Beispiel; an eine zuständige Person routen."),
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
    steps: [l('Instrument the four golden signals and one business metric for the main service.', 'Die vier goldenen Signale und eine Geschäftsmetrik für den Hauptdienst instrumentieren.'), l('Define an SLO (e.g. 99.5% of reservations succeed within 1 s) and alert on burn rate.', 'Ein SLO definieren (z. B. 99,5 % der Reservierungen gelingen binnen 1 s) und auf die Burn Rate alarmieren.'), l('Link every alert to a runbook.', 'Jeden Alarm mit einem Runbook verknüpfen.')],
    done: l('Dashboards show golden signals and the business metric; an SLO alert fires on a simulated error spike and links to a runbook.', 'Dashboards zeigen die goldenen Signale und die Geschäftsmetrik; ein SLO-Alarm löst bei einer simulierten Fehlerspitze aus und verweist auf ein Runbook.'),
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
    viz: { kind: 'observe', mode: 'exception-tracking' },
    name: l('Exception tracking', 'Exception Tracking'),
    layer: 'verification',
    phases: ['release'],
    fromOverview: true,
    oneLiner: l('Collect, group and count unhandled errors from production, with stack traces and context, per release.', 'Unbehandelte Fehler aus der Produktion sammeln, gruppieren und zählen, mit Stacktraces und Kontext, pro Release.'),
    catches: l('new crash types introduced by a release, errors in rare paths, client-side exceptions', 'neue Absturzarten durch ein Release, Fehler in seltenen Pfaden, clientseitige Ausnahmen'),
    intro: l(
      'After a release, the reservation page throws an error for users with a long name. Each user sees the error once and leaves. Exception tracking groups these errors by release and shows you the new problem with its stack trace.',
      'Nach einem Release wirft die Reservierungsseite bei Nutzern mit langem Namen einen Fehler. Jeder Nutzer sieht den Fehler einmal und geht. Exception Tracking gruppiert diese Fehler pro Release und zeigt dir das neue Problem mit Stack Trace.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('"New issue in release 1.4.2" is one of the fastest signals that something broke.', '„Neues Problem in Release 1.4.2“ ist eines der schnellsten Signale, dass etwas kaputt ist.'), l('Stack trace plus breadcrumbs make reproduction much easier.', 'Stacktrace plus Breadcrumbs machen das Reproduzieren viel leichter.'),
      l('Grouping by stack trace turns thousands of events into a short list of distinct problems.', 'Das Gruppieren nach Stack Trace macht aus tausenden Ereignissen eine kurze Liste unterschiedlicher Probleme.'),
    ],
    limits: [l('Only sees errors that throw; silent wrong results need other checks.', 'Sieht nur Fehler, die werfen; still falsche Ergebnisse brauchen andere Prüfungen.'), l('Scrub personal data before sending.', 'Personenbezogene Daten vor dem Senden entfernen.')],
    ai: l('A stack trace with context is the perfect bug report for an agent: hand it over together with "write a failing test first".', 'Ein Stacktrace mit Kontext ist der perfekte Fehlerbericht für einen Agenten: zusammen mit „schreib zuerst einen fehlschlagenden Test“ übergeben.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['glitchtip', 'opentelemetry'] },
    snippets: [{ lang: "js", file: "reservation-errors.ts",
      description: l("After configuring the OpenTelemetry SDK and exporter, wrap the real operation with this helper. Trigger a controlled staging exception and check its stack and release metadata. Handle errors normally; recording an exception must not swallow it.",
        "Nach Einrichtung von OpenTelemetry-SDK und Exporter die echte Operation mit diesem Helper umschließen. Eine kontrollierte Staging-Exception auslösen und Stack sowie Release-Metadaten prüfen. Fehler normal behandeln; die Aufzeichnung darf sie nicht verschlucken."),
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
      l('Install an error tracker SDK in server and client, tagged with the release version.', 'Ein Error-Tracker-SDK in Server und Client einbauen, mit Release-Version getaggt.'), l('Scrub personal data; alert on new issue types after a release.', 'Personenbezogene Daten entfernen; auf neue Problemarten nach einem Release alarmieren.'),
      l('Mark a test error as resolved in the tracker and check that it reopens when it occurs again in a later release.', 'Einen Testfehler im Tracker als erledigt markieren und prüfen, dass er in einem späteren Release wieder geöffnet wird, wenn er erneut auftritt.'),
    ],
    done: l('A thrown test error appears grouped, with stack trace and release tag, without personal data.', 'Ein geworfener Testfehler erscheint gruppiert, mit Stacktrace und Release-Tag, ohne personenbezogene Daten.'),
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
    viz: { kind: 'traffic', mode: 'teeing' },
    name: l('Teeing', 'Teeing'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('Copy live traffic or data to a second consumer for tests, replay or analysis, like a T-piece in a pipe.', 'Eine Kopie von Live-Verkehr oder -Daten an einen zweiten Empfänger abzweigen, wie ein T-Stück im Rohr, für Tests, Wiederabspielen oder Analyse.'),
    catches: l('problems in new consumers (a new search index, an analytics pipeline) using real data, without risk to the main path', 'Probleme in neuen Empfängern (neuer Suchindex, Analyse-Pipeline) mit echten Daten, ohne Risiko für den Hauptpfad'),
    intro: l(
      'You build a new search index for pets. Test data does not show how real users search. With a tee, the new index gets a copy of the real data, and the shop works as before.',
      'Du baust einen neuen Suchindex für Tiere. Testdaten zeigen nicht, wie echte Nutzer suchen. Mit einem Tee bekommt der neue Index eine Kopie der echten Daten, und der Shop arbeitet wie bisher.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('Recorded production traffic becomes a realistic test corpus for replay.', 'Aufgezeichneter Produktionsverkehr wird zu einem realistischen Testkorpus zum Wiederabspielen.'),
      l('Gives you realistic input for a later check without touching the live request path.', 'Liefert realistische Eingaben für eine spätere Prüfung, ohne den Live-Pfad zu berühren.'),
      l('A recorded corpus can be replayed again and again, so a fixed set of real cases becomes a regression suite.', 'Ein aufgezeichneter Corpus lässt sich beliebig oft abspielen, sodass eine feste Menge echter Fälle zur Regressionssuite wird.'),
    ],
    limits: [
      l('Copies of production data are personal data: anonymise and limit retention.', 'Kopien von Produktionsdaten sind personenbezogene Daten: anonymisieren und Aufbewahrung begrenzen.'),
      l('A tee that is slow or fails must never block the main path; send it asynchronously and drop data under pressure.', 'Ein Tee, der langsam ist oder ausfällt, darf den Hauptpfad nie blockieren; asynchron senden und unter Last Daten verwerfen.'),
    ],
    ai: l('Replayed real traffic is a strong regression suite for an agent\'s change, much more varied than hand-written fixtures.', 'Wiederabgespielter echter Verkehr ist eine starke Regressionssuite für die Änderung eines Agenten, viel vielfältiger als handgeschriebene Fixtures.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['envoy', 'vector'] },
    snippets: [{ lang: "any", file: "vector.toml",
      description: l("This standalone local Vector example copies one synthetic event into two files. Run vector --config vector.toml and submit one JSON line on stdin, then compare the files. Independent sink failures and retention still need operational checks.",
        "Dieses eigenständige lokale Vector-Beispiel kopiert ein synthetisches Event in zwei Dateien. vector --config vector.toml starten, eine JSON-Zeile auf stdin eingeben und die Dateien vergleichen. Unabhängige Sink-Fehler und Aufbewahrung brauchen weitere Betriebsprüfungen."),
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
      l('Tee a sample of requests or events to durable storage with personal data removed.', 'Eine Stichprobe von Anfragen oder Ereignissen, ohne personenbezogene Daten, in einen dauerhaften Speicher abzweigen.'), l('Replay the sample against a test deployment before releases.', 'Die Stichprobe vor Releases gegen ein Test-Deployment abspielen.'),
      l('Check that the tee does not change latency or errors of the live path, and set a retention limit for the stored copies.', 'Prüfen, dass der Tee Latenz und Fehler des Live-Pfads nicht verändert, und eine Aufbewahrungsgrenze für die gespeicherten Kopien setzen.'),
    ],
    done: l('A replayable, anonymised traffic sample exists and is used in pre-release checks.', 'Eine abspielbare, anonymisierte Verkehrsstichprobe existiert und wird in Prüfungen vor dem Release genutzt.'),
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
    viz: { kind: 'observe', mode: 'profiling' },
    name: l('Profiling', 'Profiling'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('Measure where a running program actually spends its time and memory, ideally continuously in production.', 'Messen, wo ein laufendes Programm tatsächlich Zeit und Speicher verbraucht, idealerweise fortlaufend in Produktion.'),
    catches: l('hot spots, unexpected allocations, lock contention, the one slow function that matters', 'Hotspots, unerwartete Allokationen, Sperrkonflikte, die eine langsame Funktion, auf die es ankommt'),
    intro: l(
      'After a release, the petstore uses twice as much CPU, and the agent guesses which code is slow. Each guess costs a deploy. A profiler shows where the time really goes, for example 40% in one JSON function.',
      'Nach einem Release braucht der Petstore doppelt so viel CPU, und der Agent rät, welcher Code langsam ist. Jeder Versuch kostet einen Deploy. Ein Profiler zeigt, wohin die Zeit wirklich geht, zum Beispiel 40 % in eine JSON-Funktion.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('Replaces guessing about performance with flame graphs.', 'Ersetzt Raten über Performance durch Flame Graphs.'), l('Continuous profiling compares releases: "this version spends 30% more CPU in JSON parsing".', 'Kontinuierliches Profiling vergleicht Releases: „Diese Version verbringt 30 % mehr CPU mit JSON-Parsing.“'),
      l('Low overhead sampling profilers can run in production all the time, so a regression shows up the day it ships.', 'Sampling-Profiler mit geringem Overhead können dauerhaft in Produktion laufen, sodass eine Regression am Tag des Releases sichtbar wird.'),
    ],
    limits: [
      l('Shows where time goes, not whether the result is correct.', 'Zeigt, wohin die Zeit geht, nicht ob das Ergebnis stimmt.'),
      l('Profiles of a single run are noisy; compare several and trust only large, repeatable differences.', 'Profile eines einzelnen Laufs sind verrauscht; mehrere vergleichen und nur großen, wiederholbaren Unterschieden trauen.'),
    ],
    ai: l('A flame graph is concrete input for an agent asked to optimise: "this function is 40% of CPU" beats "make it faster".', 'Ein Flame Graph ist konkreter Input für einen Agenten mit Optimierungsauftrag: „diese Funktion ist 40 % der CPU“ schlägt „mach es schneller“.'),
    evidence: { general: ev('weak', f('gwp2010', 'Google runs always-on, fleet-wide sampling profiling (descriptive, no effect measurement).', 'Google betreibt dauerhaftes, flottenweites Stichproben-Profiling (beschreibend, keine Wirkungsmessung).')), ai: none() },
    tools: { js: ['clinic'], python: ['py-spy'], java: ['async-profiler'], dotnet: ['dotnet-trace'], go: ['pprof'], rust: ['samply'], cpp: ['pprof', 'samply'], any: ['pyroscope', 'parca'] },
    snippets: [{ lang: "python", file: "profile.sh",
      description: l("With py-spy installed, profile your local Python service while replaying the slow request. Open the SVG and find the hottest stack before changing code. Attaching may require local process permissions; avoid collecting real user data.",
        "Mit installiertem py-spy den lokalen Python-Service beim Wiederholen des langsamen Requests profilieren. Das SVG öffnen und den häufigsten Stack vor Codeänderungen finden. Das Anhängen kann lokale Prozessrechte erfordern; keine echten Nutzerdaten sammeln."),
      code: `# Replace 12345 with the PID of your local test service.
py-spy record --pid 12345 --duration 30 --output reservation.svg
# During those 30 seconds, exercise the reservation endpoint.
# After a targeted change, profile the same workload again.`, focus: [{ line: 2, note: l('Sample a running process for a fixed time; no code change or restart is needed.', 'Einen laufenden Prozess für feste Zeit samplen; weder Codeänderung noch Neustart sind nötig.') }, { line: 3, note: l('Profile while real work runs; an idle service shows nothing useful.', 'Profiliere, während echte Arbeit läuft; ein untätiger Dienst zeigt nichts Brauchbares.') }, { line: 4, note: l('Profile the same workload again after the change; otherwise you cannot tell whether it helped.', 'Profiliere nach der Änderung dieselbe Last erneut; sonst weißt du nicht, ob sie geholfen hat.') }] }],
    steps: [
      l('Profile the slowest endpoint under realistic load and produce a flame graph.', 'Den langsamsten Endpunkt unter realistischer Last profilen und einen Flame Graph erzeugen.'), l('Optimise only the top hot spot, then measure again with a benchmark.', 'Nur den größten Hotspot optimieren, dann mit einem Benchmark erneut messen.'),
      l('Keep the profile of the release before and after as an artifact, so later regressions can be compared with it.', 'Das Profil vor und nach dem Release als Artefakt aufbewahren, damit spätere Regressionen damit verglichen werden können.'),
    ],
    done: l('A before/after flame graph and benchmark show the improvement; tests still pass.', 'Ein Vorher-nachher-Flame-Graph und ein Benchmark zeigen die Verbesserung; die Tests sind weiter grün.'),
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
    viz: { kind: 'observe', mode: 'logs-events' },
    name: l('Logs & events', 'Logs & Events'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('Record what the system did as structured events, so you can ask questions about production after the fact.', 'Aufzeichnen, was das System getan hat, als strukturierte Ereignisse, damit man im Nachhinein Fragen über die Produktion stellen kann.'),
    catches: l('the "why" behind an incident, rare failure sequences, invariant violations visible only in history', 'das „Warum“ hinter einem Vorfall, seltene Fehlerfolgen, Invariantenverletzungen, die nur in der Historie sichtbar sind'),
    intro: l(
      'A customer reports that a pet was reserved twice last Tuesday. Without a record, you cannot reconstruct what happened. Structured events with a request id and a pet id let you query the exact order of actions afterwards.',
      'Eine Kundin meldet, dass letzten Dienstag ein Tier doppelt reserviert wurde. Ohne Aufzeichnung kannst du den Ablauf nicht rekonstruieren. Strukturierte Events mit Request-ID und Tier-ID lassen dich die genaue Reihenfolge später abfragen.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('Structured events (JSON with request id, pet id, outcome) can be queried; free text cannot.', 'Strukturierte Ereignisse (JSON mit Request-ID, Tier-ID, Ergebnis) lassen sich abfragen; Freitext nicht.'), l('Logs can be checked against invariants: "no pet has two active reservations".', 'Logs lassen sich gegen Invarianten prüfen: „kein Tier hat zwei aktive Reservierungen“.'),
      l('Events with ids let you reconstruct the sequence of a rare failure, such as two reservations of one pet.', 'Ereignisse mit IDs erlauben es, die Abfolge eines seltenen Fehlers zu rekonstruieren, etwa zweier Reservierungen desselben Tieres.'),
    ],
    limits: [l('Volume and cost grow fast; sample debug logs, keep business events.', 'Menge und Kosten wachsen schnell; Debug-Logs stichprobenartig, Geschäftsereignisse vollständig.'), l('Personal data in logs is a privacy liability.', 'Personenbezogene Daten in Logs sind ein Datenschutzrisiko.')],
    ai: l('Structured logs are readable for agents: give it a query result, not a screenshot. Checking logs against invariants is runtime verification that catches bugs every test missed.', 'Strukturierte Logs sind für Agenten lesbar: ihm ein Abfrageergebnis geben, keinen Screenshot. Logs gegen Invarianten zu prüfen ist Laufzeitverifikation, die Fehler fängt, die jeder Test übersah.'),
    evidence: { general: ev('weak', f('brooker2025', 'AWS checks production logs against formal P specifications (PObserve), an experience report of runtime verification on logs.', 'AWS prüft Produktionslogs gegen formale P-Spezifikationen (PObserve), ein Erfahrungsbericht über Laufzeitverifikation auf Logs.')), ai: none() },
    tools: { any: ['opentelemetry', 'loki', 'vector'] },
    snippets: [{ lang: "js", file: "reservation-log.mjs",
      description: l("Run node reservation-log.mjs. Inspect the structured output, then adapt the event to your logger and collector. Use a correlation ID; omit session tokens and personal data. A log needs a query and retention policy to become useful feedback.",
        "node reservation-log.mjs starten. Die strukturierte Ausgabe prüfen und das Event an Logger und Collector anpassen. Eine Correlation-ID verwenden; Session-Tokens und personenbezogene Daten weglassen. Erst mit Abfrage und Aufbewahrungsregel wird ein Log zu brauchbarem Feedback."),
      code: `function logReservation(petId, outcome, correlationId) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: 'reservation_attempt', petId, outcome, correlationId,
  }));
}
logReservation('rex', 'taken', 'local-example-1');
// Query by correlationId to follow a failed request across services.
// Do not log credentials, raw request bodies or adopter names.`, focus: [{ line: 4, note: l('Structured fields can be queried; a free-text message cannot be filtered reliably.', 'Strukturierte Felder lassen sich abfragen; eine Freitextmeldung lässt sich nicht verlässlich filtern.') }, { line: 4, note: l('The correlationId ties one request together across services.', 'Die correlationId verbindet eine Anfrage über Dienste hinweg.') }, { line: 8, note: l('Query by this ID to follow one failed request end to end.', 'Frage mit dieser ID ab, um eine fehlgeschlagene Anfrage von Anfang bis Ende zu verfolgen.') }, { line: 9, note: l('Logs outlive the request: never write credentials, raw bodies or personal names into them.', 'Logs überdauern die Anfrage: Schreibe nie Zugangsdaten, rohe Bodies oder Personennamen hinein.') }] }],
    steps: [l('Switch to structured logging with a request id on every line.', 'Auf strukturiertes Logging mit Request-ID in jeder Zeile umstellen.'), l('Emit one business event per important state change (reserved, released, adopted).', 'Pro wichtiger Zustandsänderung ein Geschäftsereignis ausgeben (reserviert, freigegeben, adoptiert).'), l('Run a scheduled query that checks an invariant over the events and alerts on violations.', 'Eine regelmäßige Abfrage ausführen, die eine Invariante über die Ereignisse prüft und bei Verletzung alarmiert.')],
    done: l('Logs are structured with request ids; an invariant query runs on a schedule and alerts on a planted violation.', 'Logs sind strukturiert mit Request-IDs; eine Invariantenabfrage läuft regelmäßig und alarmiert bei einer eingeschleusten Verletzung.'),
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
    viz: { kind: 'traffic', mode: 'chaos-testing' },
    name: l('Chaos testing', 'Chaos Engineering'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('Inject failures on purpose (kill instances, add latency, cut networks), and check that the system degrades as you expect.', 'Absichtlich Fehler einspeisen (Instanzen beenden, Latenz hinzufügen, Netze trennen) und prüfen, dass das System so ausfällt wie erwartet.'),
    catches: l('missing timeouts, retries without backoff, single points of failure, fallbacks that were never tested', 'fehlende Timeouts, Wiederholungen ohne Backoff, Single Points of Failure, nie getestete Fallbacks'),
    intro: l(
      'The payment service becomes slow for two seconds. The reservation service waits without a timeout, and soon all its threads are blocked. Chaos testing adds such a delay on purpose and shows whether your fallback really works.',
      'Der Payment-Service antwortet zwei Sekunden lang langsam. Der Reservierungsservice wartet ohne Timeout, und bald sind alle seine Threads blockiert. Chaos Engineering erzeugt eine solche Verzögerung absichtlich und zeigt, ob dein Fallback wirklich funktioniert.',
    ),
    cost: 3,
    feedback: 'hours',
    worth: [
      l('Turns resilience from a belief into an observed fact.', 'Macht Resilienz von einer Überzeugung zu einer beobachteten Tatsache.'), l('Start small: inject latency into one dependency in staging.', 'Klein anfangen: Latenz in eine Abhängigkeit in Staging einspeisen.'),
      l('Finds the gap between the failure handling you wrote and the one you actually have, such as a retry without backoff.', 'Findet die Lücke zwischen der Fehlerbehandlung, die du geschrieben hast, und der, die du tatsächlich hast, etwa einen Retry ohne Backoff.'),
    ],
    limits: [l('Needs good monitoring first, or you cannot tell what happened.', 'Braucht zuerst gutes Monitoring, sonst sieht man nicht, was passiert ist.'), l('In production, always with a stop button and a small blast radius.', 'In Produktion immer mit Stoppknopf und kleinem Wirkungsradius.')],
    ai: l('Agents write the happy path. A chaos experiment that adds 2 s latency to the payment service shows in minutes whether the agent added a timeout.', 'Agenten schreiben den Glücksfall. Ein Chaos-Experiment, das dem Zahlungsdienst 2 s Latenz hinzufügt, zeigt in Minuten, ob der Agent einen Timeout eingebaut hat.'),
    evidence: { general: ev('weak', f('basiri2016', 'Netflix\'s experience report describes chaos engineering as experiments on production to build confidence in resilience.', 'Netflix\' Erfahrungsbericht beschreibt Chaos Engineering als Experimente in Produktion, um Vertrauen in die Resilienz aufzubauen.'), f('brooker2025', 'AWS ran 733 fault-injection experiments before Prime Day 2024 (experience report).', 'AWS führte vor dem Prime Day 2024 733 Fehlerinjektions-Experimente durch (Erfahrungsbericht).')), ai: none() },
    tools: { any: ['chaos-mesh', 'litmus', 'toxiproxy', 'chaostoolkit'] },
    snippets: [{ lang: "any", file: "database-latency.sh",
      description: l("With Toxiproxy running locally, first route the disposable app through this proxy to its test database. Add 500 ms latency, check timeouts and retry bounds, then remove the toxic. This example changes only that local proxy.",
        "Bei lokal laufendem Toxiproxy die entbehrliche App zuerst über diesen Proxy zur Testdatenbank routen. 500 ms Latenz ergänzen, Timeouts und Retry-Grenzen prüfen, dann den Toxic entfernen. Dieses Beispiel ändert nur den lokalen Proxy."),
      code: `# Proxy port 15432 -> local test PostgreSQL port 5432.
toxiproxy-cli create -l 127.0.0.1:15432 -u 127.0.0.1:5432 petstore-db
# App DB URL must use port 15432 for the experiment to have an effect.
toxiproxy-cli toxic add -t latency -a latency=500 petstore-db
# Exercise reserve: bounded timeout, no duplicate reservation on retry.
toxiproxy-cli toxic remove -n latency_downstream petstore-db`, focus: [{ line: 3, note: l('If the app does not use the proxy port, the experiment does nothing and still looks green.', 'Nutzt die App den Proxy-Port nicht, bewirkt das Experiment nichts und sieht trotzdem grün aus.') }, { line: 4, note: l('The toxic injects a half second of latency: a slow database, not a dead one.', 'Der Toxic fügt eine halbe Sekunde Latenz hinzu: eine langsame Datenbank, keine tote.') }, { line: 5, note: l('State the hypothesis first: timeouts stay bounded and a retry must not reserve twice.', 'Formuliere zuerst die Hypothese: Timeouts bleiben begrenzt und ein Retry darf nicht doppelt reservieren.') }, { line: 6, note: l('Always remove the fault afterwards and check the system recovers.', 'Entferne den Fehler danach immer und prüfe, dass sich das System erholt.') }] }],
    steps: [l('Write a hypothesis: "If the payment service is 2 s slow, reservations still succeed and show \'payment pending\'".', 'Eine Hypothese schreiben: „Ist der Zahlungsdienst 2 s langsam, gelingen Reservierungen trotzdem und zeigen ‚Zahlung ausstehend‘.“'), l('Inject the fault in staging with Toxiproxy or Chaos Mesh, with a time limit.', 'Den Fehler in Staging mit Toxiproxy oder Chaos Mesh einspeisen, mit Zeitlimit.'), l('Compare what happened with the hypothesis and fix what differed.', 'Das Geschehene mit der Hypothese vergleichen und reparieren, was abwich.')],
    done: l('At least one experiment ran with a written hypothesis, result and follow-up fix.', 'Mindestens ein Experiment lief mit schriftlicher Hypothese, Ergebnis und Folgekorrektur.'),
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
    viz: { kind: 'observe', mode: 'ab-tests' },
    name: l('A/B tests', 'A/B-Tests'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('Show two variants to randomly split groups of real users and measure which one achieves the goal better.', 'Zwei Varianten zufällig aufgeteilten Gruppen echter Nutzer zeigen und messen, welche das Ziel besser erreicht.'),
    catches: l('features that work technically but do not help, or hurt a metric that matters', 'Funktionen, die technisch funktionieren, aber nicht helfen oder einer wichtigen Metrik schaden'),
    intro: l(
      'An agent builds two versions of the adoption page in one hour. Both versions work, and the team argues about which one is better. An A/B test shows each version to a random half of the users and counts the adoptions for each.',
      'Ein Agent baut in einer Stunde zwei Versionen der Adoptionsseite. Beide Versionen funktionieren, und das Team streitet, welche besser ist. Ein A/B-Test zeigt jede Version einer zufälligen Hälfte der Nutzer und zählt die Adoptionen pro Version.',
    ),
    cost: 2,
    feedback: 'days',
    worth: [
      l('The gold standard for measuring an effect: randomisation removes most confounders.', 'Der Goldstandard, um eine Wirkung zu messen: Randomisierung beseitigt die meisten Störfaktoren.'), l('Guardrail metrics catch a variant that improves clicks but breaks something else.', 'Guardrail-Metriken fangen eine Variante, die Klicks verbessert, aber etwas anderes zerbricht.'),
      l('Decides with data instead of opinion, which also settles arguments about agent-generated variants.', 'Entscheidet mit Daten statt Meinung, was auch Streit über von Agenten erzeugte Varianten klärt.'),
    ],
    limits: [
      l('Needs traffic and patience for statistical power; peeking at results early inflates false positives.', 'Braucht Verkehr und Geduld für statistische Aussagekraft; vorzeitiges Hineinschauen erhöht Fehlalarme.'),
      l('Only measures what you chose to measure; a variant can win on one metric and hurt another that you did not track.', 'Misst nur, was du ausgewählt hast; eine Variante kann bei einer Metrik gewinnen und eine andere, die du nicht erfasst, verschlechtern.'),
    ],
    ai: l('When agents make building variants cheap, the bottleneck moves to deciding which is better. A/B tests are how you decide with evidence instead of opinion.', 'Wenn Agenten das Bauen von Varianten billig machen, verschiebt sich der Engpass zur Entscheidung, welche besser ist. A/B-Tests entscheiden mit Belegen statt Meinungen.'),
    evidence: { general: ev('strong', f('kohavi2013', 'Bing ran over 200 concurrent experiments on a typical day; many ideas moved key metrics by only about 1% and were poorly predicted in advance, and experiments caught many negative features before they shipped.', 'Bing führte an einem typischen Tag über 200 Experimente gleichzeitig durch; viele Ideen bewegten Kennzahlen nur um etwa 1 % und waren schlecht vorhersagbar, und Experimente fingen viele schädliche Funktionen vor dem Launch.')), ai: none() },
    tools: { any: ['growthbook', 'unleash', 'openfeature'] },
    snippets: [{ lang: "js", file: "experiment-assignment.test.ts",
      description: l("Install vitest and @growthbook/growthbook, then run this local SDK example. The same participant must keep their variant across page changes; a missing identity must not enter the experiment. No service or credentials are needed. Define metrics, guardrails and a stopping rule separately.",
        "vitest und @growthbook/growthbook installieren, dann dieses lokale SDK-Beispiel ausführen. Dieselbe Person muss bei Seitenwechseln ihre Variante behalten; ohne Identität darf sie nicht am Experiment teilnehmen. Kein Service und keine Zugangsdaten nötig. Metriken, Guardrails und Stoppregel getrennt festlegen."),
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
      l('Write the hypothesis, the primary metric, guardrail metrics and the sample size before starting.', 'Vor dem Start Hypothese, Hauptmetrik, Guardrail-Metriken und Stichprobengröße festlegen.'), l('Randomise by user, not by request; run until the planned sample size is reached.', 'Nach Nutzer randomisieren, nicht nach Anfrage; laufen lassen, bis die geplante Stichprobengröße erreicht ist.'),
      l('Check that the groups are balanced (about the expected split) before reading the result, and decide in advance what counts as a win.', 'Prüfen, dass die Gruppen ausgewogen sind (etwa das erwartete Verhältnis), bevor das Ergebnis gelesen wird, und vorab festlegen, was als Gewinn gilt.'),
    ],
    done: l('The experiment has a pre-registered metric and sample size, and the decision follows the result.', 'Das Experiment hat eine vorab festgelegte Metrik und Stichprobengröße, und die Entscheidung folgt dem Ergebnis.'),
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
    viz: { kind: 'observe', mode: 'tracing' },
    name: l('Tracing', 'Tracing'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('Follow one request across all the services that it touches, with the duration of every step.', 'Eine Anfrage über alle Dienste verfolgen, die sie berührt, mit Zeitmessung für jeden Schritt.'),
    catches: l('where latency comes from in a distributed system, unexpected calls, fan-out, retries hidden inside services', 'woher die Latenz in einem verteilten System kommt, unerwartete Aufrufe, Fan-out, in Diensten versteckte Wiederholungen'),
    intro: l(
      'The pet page needs two seconds, and each request goes through five services. Each service log looks normal. A trace shows the full path of one request and makes visible that one service calls another service 12 times.',
      'Die Tierseite braucht zwei Sekunden, und jede Anfrage läuft durch fünf Services. Jedes Service-Log sieht normal aus. Ein Trace zeigt den ganzen Weg einer Anfrage und macht sichtbar, dass ein Service einen anderen 12-mal aufruft.',
    ),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('Turns "the page is slow" into "the inventory call is slow, and it is called 12 times".', 'Macht aus „die Seite ist langsam“ ein „der Inventaraufruf ist langsam und wird 12-mal aufgerufen“.'), l('OpenTelemetry is the vendor-neutral standard.', 'OpenTelemetry ist der herstellerneutrale Standard.'),
      l('Shows retries and fan-out that no single service log shows, such as one search calling inventory 12 times.', 'Zeigt Retries und Fan-out, die kein einzelnes Service-Log zeigt, etwa eine Suche, die den Bestand zwölfmal aufruft.'),
    ],
    limits: [
      l('Needs propagation of trace context through every service and queue.', 'Braucht die Weitergabe des Trace-Kontexts durch jeden Dienst und jede Queue.'),
      l('Traces show where time goes and what called what, not whether the answer was right.', 'Traces zeigen, wo Zeit vergeht und wer wen aufgerufen hat, nicht ob die Antwort richtig war.'),
    ],
    ai: l('A trace shows an agent-introduced N+1 call pattern at a glance, and a trace export is a good artefact to hand back to the agent.', 'Ein Trace zeigt ein von einem Agenten eingeführtes N+1-Aufrufmuster auf einen Blick, und ein Trace-Export ist ein gutes Artefakt, um es dem Agenten zurückzugeben.'),
    evidence: { general: ev('weak', f('dapper2010', 'Describes Google\'s production tracing system, built on sampling and instrumentation of a few common libraries (descriptive, no effect measurement).', 'Beschreibt Googles produktives Tracing-System, das auf Stichproben und der Instrumentierung weniger gemeinsamer Bibliotheken beruht (beschreibend, keine Wirkungsmessung).')), ai: none() },
    tools: { any: ['opentelemetry', 'jaeger'] },
    snippets: [{ lang: "js", file: "reservation-trace.ts",
      description: l("After configuring an OpenTelemetry SDK/exporter, call this wrapper around the real operation. Confirm a trace contains the reserve span and downstream database span. Without SDK setup this API is a no-op.",
        "Nach Einrichtung eines OpenTelemetry-SDKs/Exporters diesen Wrapper um die echte Operation aufrufen. Prüfen, ob ein Trace den Reserve-Span und nachgelagerten Datenbank-Span enthält. Ohne SDK-Setup bleibt diese API ohne Wirkung."),
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
      l('Add OpenTelemetry auto-instrumentation to each service and export to a tracing backend.', 'OpenTelemetry-Autoinstrumentierung in jeden Dienst einbauen und an ein Tracing-Backend exportieren.'), l('Propagate trace context through HTTP and queues; add custom spans around domain operations.', 'Trace-Kontext durch HTTP und Queues weiterreichen; eigene Spans um Fachoperationen legen.'),
      l('Link trace ids to logs and error reports, so you can jump from an error to its trace.', 'Trace-IDs mit Logs und Fehlerberichten verknüpfen, damit man vom Fehler zum Trace springen kann.'),
    ],
    done: l('One reservation request shows as a single trace across all services, with a span for the domain operation.', 'Eine Reservierungsanfrage erscheint als ein Trace über alle Dienste, mit einem Span für die Fachoperation.'),
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
    viz: { kind: 'traffic', mode: 'dynamic-exploration' },
    name: l('Dynamic exploration', 'Dynamische Exploration'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('Explore a running system automatically (crawl the UI, walk the API, try state sequences) to find untested behaviour.', 'Ein laufendes System automatisch erkunden (UI crawlen, API durchgehen, Zustandsfolgen ausprobieren), um ungetestetes Verhalten zu finden.'),
    catches: l('500 errors on unusual request sequences, broken pages reachable only via odd paths, unhandled states', '500-Fehler bei ungewöhnlichen Anfragefolgen, kaputte Seiten, die nur über seltsame Pfade erreichbar sind, unbehandelte Zustände'),
    intro: l(
      'Nobody wrote a test that releases a pet that was never reserved. The API fails on this request. A tool for dynamic exploration tries many sequences of requests on the running system, also the ones that nobody planned.',
      'Niemand hat einen Test geschrieben, der ein nie reserviertes Tier freigibt. Die API scheitert an dieser Anfrage. Ein Werkzeug für dynamische Exploration probiert viele Abfolgen von Anfragen am laufenden System, auch die, die niemand geplant hat.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('API fuzzers derive requests from the OpenAPI spec and explore sequences automatically.', 'API-Fuzzer leiten Anfragen aus der OpenAPI-Spezifikation ab und erkunden Folgen automatisch.'),
      l('Finds crashes on unusual request sequences, such as releasing a pet that was never reserved, which scripted tests rarely contain.', 'Findet Abstürze bei ungewöhnlichen Abfolgen von Requests, etwa der Freigabe eines nie reservierten Tieres, die geskriptete Tests selten enthalten.'),
      l('Needs only a running system and a description of it (OpenAPI spec, start URL), so it works on code nobody has tests for.', 'Braucht nur ein laufendes System und eine Beschreibung davon (OpenAPI-Spezifikation, Start-URL), funktioniert also auch bei Code ohne Tests.'),
    ],
    limits: [
      l('Run against staging or with read-only access; exploration can create data.', 'Gegen Staging oder mit Lesezugriff ausführen; Exploration kann Daten erzeugen.'),
      l('Without an oracle it mostly finds crashes and schema violations, not wrong business results.', 'Ohne Orakel findet es hauptsächlich Abstürze und Schemaverstöße, keine falschen fachlichen Ergebnisse.'),
    ],
    ai: l('Agents can now explore apps the way a curious tester would, clicking and reporting oddities. Treat their findings as leads to turn into tests, not as verdicts.', 'Agenten können Apps inzwischen erkunden wie ein neugieriger Tester, klicken und Auffälligkeiten melden. Ihre Funde als Hinweise behandeln, die man in Tests überführt, nicht als Urteile.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['schemathesis', 'restler', 'zap'] },
    snippets: [{ lang: "any", file: "explore-api.sh",
      description: l("With Schemathesis installed, run against a disposable local API and its real OpenAPI schema. It generates requests and reports counterexamples for crashes or schema violations. Operations may mutate data; use synthetic fixtures.",
        "Mit installiertem Schemathesis gegen eine entbehrliche lokale API und deren echtes OpenAPI-Schema ausführen. Es erzeugt Requests und meldet Gegenbeispiele für Abstürze oder Schema-Verletzungen. Operationen können Daten ändern; synthetische Fixtures verwenden."),
      code: `schemathesis run http://localhost:3000/openapi.json   --url http://localhost:3000
# Save the minimal failing request from the report.
# Replay it as a regression test; ask the agent to fix the cause.
# Schema conformance alone cannot prove "never reserve twice".`, focus: [{ line: 1, note: l('Generate cases from the schema: no hand-written examples needed.', 'Fälle aus dem Schema erzeugen: keine handgeschriebenen Beispiele nötig.') }, { line: [2,3], note: l('Keep the minimal failing request and replay it as a regression test, so the bug stays fixed.', 'Behalte die minimale fehlschlagende Anfrage und spiele sie als Regressionstest ab, damit der Bug behoben bleibt.') }, { line: 4, note: l('Passing means the API follows its schema, not that the business rule holds.', 'Bestehen heißt, die API hält ihr Schema ein, nicht dass die Geschäftsregel gilt.') }] }],
    steps: [
      l('Point an OpenAPI-based explorer at a staging deployment.', 'Einen OpenAPI-basierten Explorer auf ein Staging-Deployment richten.'), l('Triage every 5xx and schema violation; turn real bugs into regression tests.', 'Jeden 5xx-Fehler und jede Schemaverletzung sichten; echte Fehler in Regressionstests überführen.'),
      l('Give the explorer test credentials with limited rights and clean up the data it created afterwards.', 'Dem Explorer Testzugangsdaten mit eingeschränkten Rechten geben und die von ihm erzeugten Daten danach aufräumen.'),
    ],
    done: l('The explorer runs against staging with no unexplained 5xx responses.', 'Der Explorer läuft gegen Staging ohne unerklärte 5xx-Antworten.'),
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
    viz: { kind: 'observe', mode: 'real-user-monitoring' },
    name: l('Real user monitoring', 'Real User Monitoring (RUM)'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('Measure what real users experience in their browsers and apps: load times, interaction delays, client errors.', 'Messen, was echte Nutzer in ihren Browsern und Apps erleben: Ladezeiten, Verzögerungen bei Interaktionen, Clientfehler.'),
    catches: l('slowness on real devices and networks, errors in specific browsers, layout shifts', 'Langsamkeit auf echten Geräten und Netzen, Fehler in bestimmten Browsern, Layoutsprünge'),
    intro: l(
      'The agent tested the new pet gallery in a fast browser on a fast machine. On an old phone in a train, the page needs eight seconds. RUM shows such numbers for each device and browser, so you see who has the problem.',
      'Der Agent hat die neue Tiergalerie in einem schnellen Browser auf einer schnellen Maschine getestet. Auf einem alten Handy im Zug braucht die Seite acht Sekunden. RUM zeigt solche Werte pro Gerät und Browser, damit du siehst, wer das Problem hat.',
    ),
    cost: 1,
    feedback: 'hours',
    worth: [
      l('Server metrics cannot see a slow phone on a train; RUM can.', 'Servermetriken sehen kein langsames Handy im Zug; RUM schon.'), l('Core Web Vitals give a standard set of metrics.', 'Core Web Vitals liefern einen Standardsatz an Metriken.'),
      l('Segments by device, browser and network, so a problem that hits only older phones becomes visible.', 'Segmentiert nach Gerät, Browser und Netz, sodass ein Problem, das nur ältere Handys trifft, sichtbar wird.'),
    ],
    limits: [
      l('Needs consent and care with personal data; collect aggregates.', 'Braucht Einwilligung und Sorgfalt mit personenbezogenen Daten; Aggregate sammeln.'),
      l('Shows symptoms, not causes; you still need traces and profiling to find out why a page is slow.', 'Zeigt Symptome, nicht Ursachen; um herauszufinden, warum eine Seite langsam ist, braucht man weiter Traces und Profiling.'),
    ],
    ai: l('Agents test in a fast headless browser on a fast machine. RUM is where you learn how their UI changes feel on a cheap phone.', 'Agenten testen in einem schnellen Headless-Browser auf einer schnellen Maschine. Mit RUM erfährt man, wie sich ihre UI-Änderungen auf einem billigen Handy anfühlen.'),
    evidence: { general: none(), ai: none() },
    tools: { js: ['web-vitals', 'boomerang'], any: ['opentelemetry'] },
    snippets: [{ lang: "js", file: "web-vitals.ts",
      description: l("Bundle this browser module with web-vitals installed and a same-origin metrics receiver. Verify the payload in the browser network panel. Segment by release and page; these measurements do not explain the underlying cause.",
        "Dieses Browser-Modul mit installiertem web-vitals und einem Same-origin-Metrikempfänger bündeln. Den Payload im Network-Panel prüfen. Nach Release und Seite segmentieren; die Messwerte erklären nicht die Ursache."),
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
      l('Collect Core Web Vitals and client errors, tagged by release, with consent.', 'Core Web Vitals und Clientfehler mit Einwilligung sammeln, nach Release getaggt.'), l('Set budgets (e.g. LCP < 2.5 s at p75) and alert on regressions after a release.', 'Budgets setzen (z. B. LCP < 2,5 s bei p75) und nach einem Release auf Verschlechterungen alarmieren.'),
      l('Tag the data by release and by page, so you can tell which change made a metric worse.', 'Die Daten nach Release und Seite taggen, damit erkennbar ist, welche Änderung eine Metrik verschlechtert hat.'),
    ],
    done: l('Web vitals per release are visible, and a budget breach alerts.', 'Web Vitals pro Release sind sichtbar, und eine Budgetüberschreitung alarmiert.'),
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
    viz: { kind: 'observe', mode: 'auditing' },
    name: l('Auditing', 'Auditing'),
    layer: 'verification',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('Keep a tamper-evident record of who did what and when, and review it regularly for actions that must not occur.', 'Ein manipulationssicheres Protokoll führen, wer was wann getan hat, und es regelmäßig auf unerlaubte Aktionen prüfen.'),
    catches: l('unauthorised access, privilege misuse, changes without approval, actions by automated agents outside their scope', 'unbefugten Zugriff, Missbrauch von Rechten, Änderungen ohne Freigabe, Aktionen automatischer Agenten außerhalb ihres Rahmens'),
    intro: l(
      'An agent with admin rights deletes 200 old reservations. A week later, a customer asks where her reservation is. An audit log lists each action of the agent under its own identity, so you can find the change and undo it.',
      'Ein Agent mit Admin-Rechten löscht 200 alte Reservierungen. Eine Woche später fragt eine Kundin, wo ihre Reservierung ist. Ein Audit-Log listet jede Aktion des Agenten unter seiner eigenen Identität, damit du die Änderung findest und rückgängig machst.',
    ),
    cost: 2,
    feedback: 'days',
    worth: [
      l('Required for compliance, and the only way to answer "who changed this?" after the fact.', 'Für Compliance nötig und der einzige Weg, „wer hat das geändert?“ im Nachhinein zu beantworten.'),
      l('Makes agent actions attributable: with a separate identity, every change an agent made can be listed and undone.', 'Macht Agenten-Aktionen zuordenbar: Mit eigener Identität lässt sich jede Änderung eines Agenten auflisten und rückgängig machen.'),
      l('A log that the actor cannot edit is evidence in an incident or a dispute.', 'Ein Log, das der Handelnde nicht ändern kann, ist ein Beleg bei einem Vorfall oder Streit.'),
    ],
    limits: [
      l('An audit log nobody reads protects nobody; automate the review queries.', 'Ein Audit-Log, das niemand liest, schützt niemanden; die Prüfabfragen automatisieren.'),
      l('Records what happened, after the fact; it does not stop an action. Pair it with least-privilege access.', 'Hält fest, was passiert ist, nachträglich; es verhindert keine Aktion. Mit minimalen Rechten kombinieren.'),
    ],
    ai: l('When agents act with real credentials, the audit log is how you verify they stayed within their permissions. Give each agent its own identity so its actions are attributable.', 'Wenn Agenten mit echten Zugangsdaten handeln, prüft man über das Audit-Log, ob sie in ihren Rechten blieben. Jedem Agenten eine eigene Identität geben, damit seine Aktionen zuordenbar sind.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['falco', 'osquery', 'opentelemetry'] },
    snippets: [{ lang: "any", file: "audit-trail.sql",
      description: l("Run this PostgreSQL sketch in a disposable database. A duplicate event ID must fail. In a real service, write the domain change and event in one transaction, restrict UPDATE/DELETE privileges and verify retention independently.",
        "Diese PostgreSQL-Skizze in einer entbehrlichen Datenbank ausführen. Eine doppelte Event-ID muss scheitern. Im echten Service Fachänderung und Event in einer Transaktion schreiben, UPDATE-/DELETE-Rechte beschränken und Aufbewahrung unabhängig prüfen."),
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
    steps: [l('Log every privileged action with actor identity (human or agent), time and target to append-only storage.', 'Jede privilegierte Aktion mit Identität des Handelnden (Mensch oder Agent), Zeit und Ziel in einen Nur-Anhängen-Speicher protokollieren.'), l('Give agents their own identities and least-privilege credentials.', 'Agenten eigene Identitäten und minimale Zugangsrechte geben.'), l('Schedule queries that flag unexpected actions and review them weekly.', 'Abfragen einplanen, die unerwartete Aktionen markieren, und sie wöchentlich durchsehen.')],
    done: l('Privileged actions are logged with a distinct identity per agent, and a scheduled query flags a planted out-of-scope action.', 'Privilegierte Aktionen werden mit eigener Identität pro Agent protokolliert, und eine geplante Abfrage markiert eine eingeschleuste Aktion außerhalb des Rahmens.'),
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
