import type { L } from './types';

export interface Term {
  id: string; term: L; def: L; see?: string;
  /** extra spellings that should link to this entry (plurals, synonyms), per language */
  aliases?: { en: string[]; de: string[] };
  /** false: never auto-link in running text (too generic); the glossary page still lists it */
  autolink?: boolean;
}
const g = (id: string, ten: string, tde: string, en: string, de: string, see?: string): Term => ({ id, term: { en: ten, de: tde }, def: { en, de }, see });

const BASE: Term[] = [
  g('oracle', 'Oracle', 'Orakel', 'An oracle determines if a result is correct. An expected value, a rule, a second implementation or a person can be an oracle.', 'Ein Test Oracle bestimmt, ob ein Ergebnis korrekt ist. Das kann ein Erwartungswert, eine Regel, eine zweite Implementierung oder eine Person sein.', 'differential-testing'),
  g('invariant', 'Invariant', 'Invariante', 'An invariant is a condition that must be true in each reachable state. For example, a pet can have at most one active reservation.', 'Ein Invariant ist eine Bedingung, die in jedem erreichbaren Zustand gelten muss. Ein Tier darf zum Beispiel höchstens eine aktive Reservierung haben.', 'formal-verification'),
  g('property', 'Property', 'Eigenschaft (Property)', 'A property is a rule about all permitted inputs. A property-based test checks the rule on generated inputs.', 'Eine Property legt eine Regel für alle zulässigen Eingaben fest. Ein Property-Based Test prüft die Regel mit erzeugten Eingaben.', 'property-based-tests'),
  g('shrinking', 'Shrinking', 'Shrinking', 'Shrinking decreases the size of an input that causes a failure. It tries to find a smaller input that causes the same failure.', 'Shrinking sucht eine kleinere Eingabe, die denselben Fehler zeigt.', 'property-based-tests'),
  g('mutant', 'Mutant', 'Mutant', 'A mutant is a copy of code with a specified change. If a test fails because of that change, the test detects the mutant.', 'Ein Mutant ist eine Kopie des Codes mit einer gezielten Änderung. Die Tests erkennen den Mutant, wenn ein Test wegen der Änderung fehlschlägt.', 'mutation-tests'),
  g('equivalent-mutant', 'Equivalent mutant', 'Äquivalenter Mutant', 'An equivalent mutant has the same behavior as the original code. A test cannot distinguish them by their behavior.', 'Ein äquivalenter Mutant verhält sich wie der ursprüngliche Code. Tests können die beiden anhand ihres Verhaltens nicht unterscheiden.', 'mutation-tests'),
  g('mutation-score', 'Mutation score', 'Mutation Score', 'The mutation score is the proportion of mutants that the tests detect.', 'Der Mutation Score gibt den Anteil der Mutanten an, die die Tests erkennen.', 'mutation-tests'),
  g('coverage', 'Coverage', 'Abdeckung (Coverage)', 'Coverage measures the proportion of lines or branches that the tests run. It does not measure the quality of the assertions.', 'Coverage misst den Anteil der Zeilen oder Zweige, die die Tests ausführen. Sie misst die Qualität der Assertions nicht.', 'coverage'),
  g('corpus', 'Corpus', 'Korpus', 'A corpus is the input set that a fuzzer keeps for later runs. A coverage-guided fuzzer can retain inputs that run new code.', 'Ein Corpus enthält Eingaben für spätere Läufe des Fuzzers. Ein Coverage-gesteuerter Fuzzer kann Eingaben behalten, die weitere Codepfade ausführen.', 'fuzz-tests'),
  g('harness', 'Fuzz harness / target', 'Fuzz-Harness / Target', 'A fuzz harness passes the bytes from a fuzzer to the code under test.', 'Ein Fuzz Harness übergibt die Bytes des Fuzzers an den geprüften Code.', 'fuzz-tests'),
  g('precondition', 'Precondition / postcondition', 'Vor- / Nachbedingung', 'A precondition gives a requirement that must hold before a call. A postcondition gives a condition that must hold when the call returns.', 'Eine Precondition legt eine Bedingung vor einem Aufruf fest. Eine Postcondition legt eine Bedingung für die Rückkehr aus dem Aufruf fest.', 'contracts'),
  g('loop-invariant', 'Loop invariant', 'Schleifeninvariante', 'A loop invariant must hold before and after each loop iteration. A verifier can use it to prove conditions about the loop.', 'Ein Loop Invariant muss vor und nach jeder Iteration gelten. Ein Verifier kann damit Bedingungen für die Schleife beweisen.', 'formal-verification'),
  g('model-checking', 'Model checking', 'Model Checking', 'Model checking examines the reachable states of a model to check its properties.', 'Model Checking untersucht die erreichbaren Zustände eines Modells. Der Model Checker prüft darin festgelegte Properties.', 'formal-verification'),
  g('interleaving', 'Interleaving', 'Verschränkung (Interleaving)', 'An interleaving is one possible order for the steps of concurrent operations.', 'Ein Interleaving ist eine mögliche Reihenfolge der Schritte nebenläufiger Operationen.', 'formal-verification'),
  g('counterexample', 'Counterexample', 'Gegenbeispiel', 'A counterexample is an input or a sequence of states that violates a property.', 'Ein Gegenbeispiel ist eine Eingabe oder Zustandsfolge, die eine Property verletzt.', 'formal-verification'),
  g('smt', 'SMT solver', 'SMT-Solver', 'An SMT solver determines whether a logical formula has a solution in a theory such as arithmetic or arrays. Dafny and Kani use SMT solvers.', 'Ein SMT Solver prüft, ob eine logische Formel in einer Theorie wie Arithmetik oder Arrays erfüllbar ist. Dafny und Kani nutzen SMT Solver.', 'formal-verification'),
  g('flaky', 'Flaky test', 'Wackeliger Test (flaky)', 'A flaky test can pass or fail on the same code and configuration.', 'Ein Flaky Test kann mit unverändertem Code und unveränderter Konfiguration bestehen oder fehlschlagen.', 'ci'),
  g('pass-at-1', 'pass@1', 'pass@1', 'Share of benchmark problems that a model solves with its first answer.', 'pass@1 misst den Anteil der Benchmark-Aufgaben, die ein Modell mit seiner ersten Antwort löst.'),
  g('humaneval', 'HumanEval', 'HumanEval', 'A benchmark of hand-written Python programming problems with tests, used to compare code-generating models.', 'HumanEval ist ein Benchmark mit Python-Aufgaben und Tests. Er vergleicht Modelle, die Code erzeugen.'),
  g('tamper-evident', 'Tamper-evident', 'Manipulationssicher (tamper-evident)', 'A tamper-evident record shows evidence of later changes to its data. One method uses chained hashes.', 'Bei einem Tamper-Evident Log sind spätere Änderungen erkennbar. Eine Methode nutzt verkettete Hashes.'),
  g('least-privilege', 'Least privilege', 'Minimale Rechte (Least Privilege)', 'Least privilege limits a person or process to the permissions necessary for a task.', 'Least Privilege beschränkt die Rechte einer Person oder eines Prozesses auf die Rechte für die Aufgabe.'),
  g('blast-radius', 'Blast radius', 'Wirkungsradius', 'The blast radius is the set of users or systems that a failure can affect.', 'Der Blast Radius umfasst die Nutzer oder Systeme, die ein Ausfall betreffen kann.', 'canarying'),
  g('slo', 'SLO', 'SLO', 'A service level objective (SLO) sets a target for a metric that affects users. For example, 99.5% of reservations must complete in 1 s.', 'Ein Service Level Objective (SLO) legt einen Zielwert für eine Metrik fest. Zum Beispiel müssen 99,5 % der Reservierungen innerhalb einer Sekunde gelingen.', 'monitoring'),
  g('p95', 'p95 / p99', 'p95 / p99', 'The p95 is the 95th percentile of the measurements. The p99 is the 99th percentile.', 'p95 ist das 95. Perzentil der Messwerte. p99 ist das 99. Perzentil.', 'performance-tests'),
  g('sast', 'SAST / DAST / SCA', 'SAST / DAST / SCA', 'SAST examines source code for security weaknesses. DAST examines a running application. SCA examines software dependencies.', 'SAST prüft Quellcode auf Schwachstellen. DAST prüft eine laufende Anwendung. SCA prüft Softwareabhängigkeiten.', 'security-scanning'),
  g('sbom', 'SBOM', 'SBOM', 'Software bill of materials: a list of every component in a build.', 'Ein Software Bill of Materials (SBOM) listet die Komponenten eines Builds auf.', 'security-scanning'),
  g('assertion', 'Assertion', 'Assertion', 'An assertion checks that a condition is true. If the condition is false, the assertion reports a failure.', 'Eine Assertion prüft eine Bedingung. Wenn die Bedingung nicht gilt, meldet die Assertion einen Fehler.', 'unit-tests'),
  g('gherkin', 'Gherkin (BDD)', 'Gherkin (BDD)', 'Gherkin is a plain text format for examples of behavior. `Given` specifies the initial state. `When` specifies the action. `Then` specifies the expected result. Tools such as Cucumber can run the steps as tests.', 'Gherkin ist ein Textformat für Beispiele zum erwarteten Verhalten. Given nennt den Startzustand. When nennt die Aktion. Then nennt das erwartete Ergebnis. Tools wie Cucumber können die Schritte als Tests ausführen.', 'acceptance-tests'),
  g('fuzzing', 'Fuzzing', 'Fuzzing', 'Fuzzing supplies many generated inputs to a program. It can detect crashes, hangs and other failures.', 'Fuzzing übergibt viele erzeugte Eingaben an ein Programm. Es kann Abstürze, blockierte Abläufe und andere Fehler erkennen.', 'fuzz-tests'),
  g('regression', 'Regression', 'Regression', 'A regression is an error in previously correct behavior.', 'Eine Regression ist ein Fehler in einem Verhalten, das zuvor korrekt war.', 'regression-tests'),
  g('false-positive', 'False positive', 'Falsch-Positiv', 'A false positive reports a defect where none exists.', 'Ein False Positive meldet einen Fehler, der nicht vorliegt.', 'static-analysis'),
  g('staging', 'Staging environment', 'Staging-Umgebung', 'A staging environment has a configuration similar to production. It uses separate data and traffic for checks before release.', 'Eine Staging-Umgebung ist ähnlich wie Produktion konfiguriert. Sie verwendet für die Checks vor dem Release eigene Daten und eigenen Traffic.', 'smoke-tests'),
  g('latency', 'Latency', 'Latenz', 'Latency is the time between the start of a request and its response.', 'Die Latenz ist die Zeit zwischen dem Beginn eines Requests und der Antwort.', 'performance-tests'),
  g('side-effect', 'Side effect', 'Seiteneffekt', 'A side effect is a change that occurs outside the return value of a function. Examples include a database update or a message.', 'Ein Side Effect ist eine Änderung außerhalb des Rückgabewerts einer Funktion. Beispiele sind ein Schreibzugriff auf eine Datei oder eine Änderung in der Datenbank.', 'architecture'),
  g('edge-case', 'Edge case', 'Randfall', 'An edge case uses an input at or near a boundary. Examples include an empty list, zero and the maximum permitted value.', 'Ein Edge Case verwendet eine Eingabe an oder nahe einer Grenze. Beispiele sind eine leere Liste, null und der größte zulässige Wert.', 'property-based-tests'),
  g('race-condition', 'Race condition', 'Race Condition', 'A race condition occurs when the result depends on the order or timing of concurrent operations.', 'Bei einer Race Condition hängt das Ergebnis von der Reihenfolge oder vom Timing nebenläufiger Operationen ab.', 'sanitizers'),
  g('test-double', 'Mock / stub', 'Mock / Stub', 'A mock or stub replaces a real dependency in a test. The substitute supplies behavior that the test controls.', 'Ein Mock oder Stub ersetzt eine echte Abhängigkeit im Test. Der Test kontrolliert das Verhalten des Ersatzes.', 'unit-tests'),
  g('taint', 'Taint (tainted input)', 'Taint (verunreinigte Eingabe)', 'Tainted data can contain values that the program cannot trust. Validate or escape the data before it reaches a sensitive operation.', 'Tainted Input kann Werte enthalten, denen das Programm nicht vertrauen darf. Prüfe die Daten oder maskiere Sonderzeichen vor der Verarbeitung in einer sensiblen Operation.', 'static-analysis'),
  g('null-deref', 'Null dereference', 'Null-Dereferenzierung', 'A null dereference tries to read or use a missing object. It can cause a runtime error.', 'Bei einer Null Dereference greift der Code auf ein fehlendes Objekt zu. Der Zugriff kann einen Fehler zur Laufzeit auslösen.', 'type-systems'),
  g('escape-hatch', 'Escape hatch', 'Escape Hatch', 'An escape hatch lets code suppress a check. Examples include a type cast, `any` and `# type: ignore`.', 'Ein Escape Hatch kann eine Prüfung unterdrücken. Beispiele sind ein Cast, `any` und `# type: ignore`.', 'type-systems'),
  g('holdout', 'Holdout tests', 'Holdout-Tests', 'Holdout tests use cases that the coding agent cannot see while it writes the code.', 'Holdout-Tests verwenden Fälle, die der Coding-Agent beim Schreiben des Codes nicht sehen kann.', 'test-integrity'),
  g('coupling', 'Coupling', 'Kopplung', 'Coupling is the degree to which one module depends on another. High coupling can increase the number of modules that a change affects.', 'Coupling beschreibt, wie stark ein Modul von einem anderen abhängt. Starke Abhängigkeiten können den Umfang einer Änderung vergrößern.', 'architecture'),
  g('preprint', 'Preprint', 'Preprint', 'A preprint is a paper that the authors make available before or without peer review.', 'Ein Preprint ist ein Paper, das vor oder ohne Peer Review veröffentlicht wird.'),
  g('agent', 'Coding agent', 'Coding-Agent', 'A coding agent uses a language model to change code, run commands and respond to their results.', 'Ein Coding-Agent verwendet ein Sprachmodell, um Code zu ändern, Befehle auszuführen und auf die Ergebnisse zu reagieren.', 'agent-rules'),
  g('eval', 'Eval', 'Eval', 'An eval measures a model or coding agent setup on a fixed set of tasks with a defined grading method.', 'Ein Eval misst ein Modell oder ein Agent-Setup mit festen Aufgaben. Eine festgelegte Methode bewertet die Ergebnisse.', 'evals'),
  g('reward-hacking', 'Test gaming / reward hacking', 'Tests austricksen (Reward Hacking)', 'Reward hacking occurs when a system meets a measured goal without meeting the intended goal. For example, a coding agent can weaken a test to make it pass.', 'Bei Reward Hacking erreicht ein System den Messwert ohne das beabsichtigte Ziel. Ein Coding-Agent kann zum Beispiel eine Assertion abschwächen, damit der Test besteht.', 'test-integrity'),
];

type Extra = { en?: string[]; de?: string[]; autolink?: boolean };
const EXTRA: Record<string, Extra> = {
  oracle: { en: ['oracle', 'oracles', 'test oracle'], de: ['Orakel', 'Test-Orakel', 'Test Oracle'] },
  invariant: { en: ['invariants'], de: ['Invarianten', 'Invariant', 'Invariants'] },
  property: { autolink: false },
  mutant: { en: ['mutants', 'killed mutants'], de: ['Mutanten'] },
  'equivalent-mutant': { en: ['equivalent mutants'], de: ['äquivalente Mutanten', 'äquivalenten Mutanten'] },
  'mutation-score': { en: ['mutation scores'], de: [] },
  coverage: { en: ['code coverage', 'test coverage'], de: ['Coverage', 'Code Coverage', 'Testabdeckung'] },
  corpus: { de: ['Corpus'] },
  harness: { en: ['fuzz harness', 'fuzz harnesses', 'harness', 'fuzz target', 'fuzz targets'], de: ['Fuzz-Harness', 'Harness', 'Fuzz-Target', 'Fuzz-Targets'] },
  precondition: { en: ['preconditions', 'postcondition', 'postconditions'], de: ['Vorbedingung', 'Vorbedingungen', 'Nachbedingung', 'Nachbedingungen', 'Precondition', 'Preconditions', 'Postcondition', 'Postconditions'] },
  'loop-invariant': { en: ['loop invariants'], de: ['Schleifeninvarianten', 'Loop Invariant', 'Loop Invariants'] },
  'model-checking': { en: ['model checker', 'model checkers'], de: ['Model Checker'] },
  interleaving: { en: ['interleavings'], de: ['Verschränkung', 'Verschränkungen', 'Interleavings'] },
  counterexample: { en: ['counterexamples', 'counter-example'], de: ['Gegenbeispiele', 'Gegenbeispielen'] },
  smt: { en: ['SMT solver', 'SMT solvers', 'SMT'], de: ['SMT-Solver', 'SMT'] },
  flaky: { en: ['flaky test', 'flaky tests', 'flaky', 'flakiness'], de: ['wackeliger Test', 'wackelige Tests', 'flaky Test', 'flaky Tests', 'flaky'] },
  'blast-radius': { de: ['Blast Radius'] },
  'tamper-evident': { en: [], de: ['tamper-evident', 'manipulationssicher'] },
  'least-privilege': { en: ['least-privilege'], de: ['Least Privilege', 'Minimale Rechte'] },
  slo: { en: ['SLOs'], de: ['SLOs'] },
  p95: { en: ['p95', 'p99', 'p95/p99', 'p95 / p99'], de: ['p95', 'p99', 'p95/p99', 'p95 / p99'] },
  sast: { en: ['SAST', 'DAST', 'SCA'], de: ['SAST', 'DAST', 'SCA'] },
  sbom: { en: ['SBOMs'], de: ['SBOMs'] },
  preprint: { en: ['preprints'], de: ['Preprints'] },
  agent: { en: ['coding agent', 'coding agents', 'AI agent', 'AI agents', 'agents'], de: ['Coding-Agent', 'Coding-Agenten', 'Coding-Agents', 'KI-Agent', 'KI-Agenten', 'Agenten'] },
  taint: { en: ['taint', 'tainted input', 'tainted data'], de: ['Taint', 'Taint-Analyse', 'Tainted Input'] },
  'null-deref': { en: ['null dereference', 'null dereferences', 'null pointer', 'null pointers'], de: ['Null-Dereferenzierung', 'Null-Dereferenzierungen', 'Null-Pointer', 'Null Dereference', 'Null Dereferences'] },
  'escape-hatch': { en: ['escape hatch', 'escape hatches'], de: ['Escape Hatch', 'Escape Hatches', 'Notausgang', 'Notausgänge', 'Notausgängen'] },
  holdout: { en: ['holdout tests', 'hidden holdout suite', 'holdout suite'], de: ['Holdout-Tests', 'Holdout-Suite'] },
  coupling: { en: ['hidden coupling'], de: ['Kopplung', 'versteckte Kopplung'] },
  assertion: { en: ['assertions'], de: ['Assertions'] },
  gherkin: { en: ['Gherkin', 'BDD', 'behaviour-driven development', 'behavior-driven development'], de: ['Gherkin', 'BDD', 'Behaviour-Driven Development'] },
  fuzzing: { en: ['fuzzer', 'fuzzers'], de: ['Fuzzer'] },
  regression: { en: ['regressions'], de: ['Regressionen'] },
  'false-positive': { en: ['false positives'], de: ['Falsch-Positive', 'Falsch-Positiven', 'Fehlalarm', 'Fehlalarme', 'Fehlalarmen', 'False Positives', 'False Positive'] },
  staging: { en: ['staging', 'staging environments'], de: ['Staging', 'Staging-Umgebungen'] },
  latency: { en: ['latencies'], de: ['Latenzen'] },
  'side-effect': { en: ['side effects'], de: ['Seiteneffekte', 'Seiteneffekten', 'Side Effect', 'Side Effects'] },
  'edge-case': { en: ['edge cases'], de: ['Randfälle', 'Randfällen', 'Edge Cases', 'Edge Case'] },
  'race-condition': { en: ['race conditions', 'data race', 'data races'], de: ['Race Conditions', 'Data Race', 'Data Races'] },
  'test-double': { en: ['mock', 'mocks', 'stub', 'stubs', 'test double', 'test doubles'], de: ['Mocks', 'Stub', 'Stubs', 'Test Double', 'Test Doubles'] },
  eval: { en: ['evals'], de: ['Evals'] },
  'reward-hacking': { en: ['reward hacking', 'test gaming'], de: ['Reward Hacking'] },
};

export const GLOSSARY: Term[] = BASE.map((t) => {
  const x = EXTRA[t.id];
  if (!x) return t;
  return { ...t, aliases: { en: x.en ?? [], de: x.de ?? [] }, ...(x.autolink === false ? { autolink: false } : {}) };
});
