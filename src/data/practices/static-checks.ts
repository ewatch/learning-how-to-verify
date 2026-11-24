import type { Practice } from '../types';
import { ev, f, l, none, q } from './_h';
import { TYPE_REVISIONS } from '../typecheck';

export const staticChecks: Practice[] = [
  {
    id: 'type-systems',
    domain: { parts: ['reserve', 'reservation'], what: l('The compiler shows where `reserve()` must handle a missing pet or a null value in `reservedBy`.', 'Der Compiler zeigt, wo `reserve()` ein fehlendes Tier oder null in `reservedBy` behandeln muss.') },
    name: l('Type systems & compilers', 'Typsysteme & Compiler'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: false,
    core: true,
    oneLiner: l('A type checker reports code that uses a value in a way that its type does not permit.', 'Ein Type Checker meldet Code, der einen Wert anders verwendet, als sein Typ erlaubt.'),
    catches: l('Incorrect arguments, missing fields, a null value where a non-null value is necessary, and incorrect names.', 'Falsche Argumenttypen, fehlende Felder, null an einer unzulässigen Stelle und falsche Namen.'),
    intro: l(
      'A coding agent reads `pet.reservedBy.name` before anyone reserves the pet. The code fails when a user opens an unreserved pet. With strict settings, the type checker reports the error before the code runs.',
      'Ein Coding-Agent liest `pet.reservedBy.name`, bevor jemand das Tier reserviert. Der Code schlägt bei einem nicht reservierten Tier fehl. Ein Type Checker im Strict Mode meldet den Fehler vor der Ausführung.',
    ),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('An editor can run the type checker after each change. The type checker examines paths that the tests do not run.', 'Ein Editor kann den Type Check nach jeder Änderung ausführen. Der Type Checker prüft auch Pfade, die kein Test ausführt.'),
      l('Settings such as `strict`, `noUncheckedIndexedAccess` and nullable reference types can make more type errors visible before runtime.', 'Einstellungen wie `strict` und `noUncheckedIndexedAccess` können Type Errors vor der Ausführung zeigen.'),
      l('Types describe the values that code accepts. The compiler checks these descriptions against the code.', 'Typen beschreiben zulässige Werte. Der Compiler prüft, ob der Code diese Typen korrekt verwendet.'),
    ],
    limits: [
      l('A type can give the form of a value without giving all the rules for it. For example, `price: number` permits a negative price.', 'Ein Typ kann die Form eines Werts festlegen. `price: number` lässt zum Beispiel auch negative Preise zu.'),
      l('A cast, `any` or a `# type: ignore` comment can prevent the type checker from reporting an error.', 'Ein Cast, `any` oder ein Kommentar wie `# type: ignore` kann eine Fehlermeldung unterdrücken.'),
    ],
    ai: l(
      'A coding agent can get fast feedback from the compiler. Enable strict settings. Use lint rules to prevent casts and other type-check suppressions where possible.',
      'Der Compiler liefert dem Coding-Agenten schnell Feedback. Aktiviere den Strict Mode. Verwende nach Möglichkeit Lint-Regeln gegen Casts und andere Unterdrückungen von Type Errors.',
    ),
    evidence: {
      general: ev('moderate', f('gao2017', 'The study examined 400 public JavaScript defects. TypeScript and Flow would each have found approximately 15% of these defects. The defects had already passed through tests and review.', 'Von 400 öffentlichen JavaScript-Fehlern hätten TypeScript oder Flow jeweils etwa 15 % gefunden, obwohl diese Fehler Tests und Review schon überstanden hatten.')),
      ai: ev('moderate', f('mundler2025', 'Type errors made up 94% of compile errors in the TypeScript code that the LLM generated. Type-constrained decoding decreased compile errors by more than half and increased functional correctness.', '94 % der Compilerfehler in LLM-generiertem TypeScript waren Typfehler; typbeschränktes Decoding senkte die Compilerfehler um mehr als die Hälfte und verbesserte die funktionale Korrektheit.')),
    },
    tools: { php: ['phpstan', 'psalm'], js: ['typescript'], python: ['mypy', 'pyright'], java: ['nullaway'], dotnet: ['roslyn'], go: ['go-vet'], rust: ['rustc'], cpp: ['clang'] },
    snippets: [
      { lang: 'js', file: 'reserve.ts', code: `// TypeScript 6: npx tsc --ignoreConfig --target es2022 --strict --noUncheckedIndexedAccess --noEmit reserve.ts
// This version intentionally fails: 'pet' is possibly 'undefined'.
// Add the guard from the simulator, then rerun the same command.
${TYPE_REVISIONS[0].code}`,
      focus: [
        { line: 4, note: l("`Pet` permits a null value in `reservedBy`. The compiler can show where the code must handle the null value.", "`Pet` erlaubt `null` bei `reservedBy`, der Compiler weiß also genau, wo ein fehlender Besitzer behandelt werden muss.") },
        { line: 9, note: l("With `noUncheckedIndexedAccess`, a lookup by ID can return `undefined` if the pet is absent.", "Mit `noUncheckedIndexedAccess` kann der Zugriff per id `undefined` liefern: der klassische Absturz bei einem unbekannten Tier.") },
        { line: 10, note: l("This access causes a compile error until a guard returns `missing` when the pet is absent.", "Dieser Zugriff scheitert beim Kompilieren, bis du den Guard ergänzt, der `missing` zurückgibt.") },
      ] },
      { lang: 'js', file: 'tsconfig.json', code: `{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true
  }
}`,
      focus: [
        { line: 3, note: l("`strict` enables the strict checks, including checks for null values and implicit `any`.", "`strict` aktiviert die ganze Familie der null- und implicit-any-Prüfungen mit einem Schalter.") },
        { line: 4, note: l("An indexed lookup can have the type `T | undefined`. Code that uses the result must handle an index or key that is absent.", "Zugriffe auf Arrays und Maps werden zu `T | undefined`; das fängt Off-by-one- und Unknown-Key-Fehler.") },
        { line: 5, note: l("This setting makes a distinction between an omitted property and a property with an explicit `undefined` value.", "Unterscheidet „fehlt“ von „explizit undefined“, eine Falle bei teilweise gefüllten Reservierungen.") },
      ] },
      { lang: 'python', file: 'pyproject.toml', code: `[tool.mypy]
strict = true
warn_unreachable = true
disallow_any_explicit = true`,
      focus: [
        { line: 2, note: l("`strict = true` makes mypy report untyped functions and implicit optional types.", "`strict = true` macht untypisierte Funktionen und implizites `Optional` zu Fehlern statt zu stillen Lücken.") },
        { line: 3, note: l("The type checker reports code that cannot run. This can show an incorrect assumption about the program state.", "Meldet Code, der nie läuft, oft ein Zeichen für einen falsch angenommenen Zustand.") },
        { line: 4, note: l("This rule prohibits explicit `Any`.", "Verbietet explizites `Any`, den Notausgang, mit dem ein Agent den Checker zum Schweigen bringt.") },
      ] },
      { lang: 'php', file: 'Reservation.php', code: `<?php declare(strict_types=1);
// composer require --dev phpstan/phpstan
// vendor/bin/phpstan analyse --level=max src
final readonly class Reservation
{
    public function __construct(
        public string $petId,
        public string $person,
    ) {}
}

function owner(Reservation $reservation): string
{
    return $reservation->person;
}
// owner(null); // PHPStan reports: Reservation expected, null given.`,
      focus: [
        { line: 1, note: l("With `strict_types`, PHP rejects a string argument if the parameter requires an integer.", "`strict_types` verhindert, dass PHP beim Aufruf stillschweigend einen String in einen Int umwandelt.") },
        { line: 4, note: l("`final readonly` prevents changes to reservation properties after initialization.", "`final readonly` heißt: Eine Reservierung lässt sich nach dem Erzeugen nicht mehr ändern.") },
        { line: 12, note: l("The analyzer checks that the caller supplies a value of type `Reservation`.", "Der Parametertyp verspricht eine echte `Reservation`; daran misst der Analyzer die Aufrufer.") },
        { line: 16, note: l("The commented-out call shows a null value where the parameter requires a reservation.", "Der auskommentierte Aufruf zeigt die Fehlerklasse: `null`, wo ein Wert angenommen wurde.") },
      ] },
    ],
    steps: [
      l('Enable strict settings for your compiler or type checker. Run the type check.', 'Aktiviere den Strict Mode für Compiler oder Type Checker. Führe den Type Check aus.'),
      l('Correct type errors in the types or in the code. Do not add casts, `any` or ignore comments to suppress the errors.', 'Korrigiere die Typen oder den Code. Unterdrücke die Fehler nicht mit Casts, `any` oder Ignore-Kommentaren.'),
      l('Make the type check a required CI step.', 'Mache den Type Check zu einem erforderlichen CI-Schritt.'),
    ],
    done: l('The type check passes in strict mode. The change adds no casts or ignore comments. A type error makes CI fail.', 'Der Type Check besteht im Strict Mode. Die Änderung fügt keine Casts oder Ignore-Kommentare hinzu. Ein Type Error lässt CI fehlschlagen.'),
    think: [
      q('What happens if a coding agent adds `!` after `pets[id]`?', 'Vorhersage: Was passiert, wenn ein Agent `!` hinter `pets[id]` ergänzt?',
        'The type checker stops reporting the error. The lookup can still return `undefined` at runtime. Add a guard and a regression test.',
        'Die Diagnostic verschwindet, aber der Lookup bleibt zur Laufzeit unverändert. Ein fehlendes Tier löst weiter einen Fehler aus. Einen Guard und einen Regression-Test verlangen, statt die Meldung zu unterdrücken.'),
      q('Both parameters of `reserve(petId: string, person: string)` have type `string`. Which incorrect call can compile?', '`reserve(petId: string, person: string)`: Welchen Fehler sieht das Typsystem hier nicht, und wie behebt man das mit Typen?',
        '`reserve(person, petId)` can compile because both arguments are strings. Branded or nominal types such as `PetId` and `PersonId` can make this call a compile error.',
        'Vertauschte Argumente: Beide sind Strings, also kompiliert `reserve(person, petId)`. Gebrandete oder nominale Typen (`PetId`, `PersonId`) machen den Tausch zum Compilerfehler.'),
      q('The code with the guard passes the type check and three tests. Does it prevent two concurrent reservations in a database?', 'Die Version mit Guard besteht Compiler und drei Tests. Verhindert sie zwei gleichzeitige Reservierungen in einer Datenbank?',
        'These tests run sequentially on one object in memory. Use an atomic conditional update or a database constraint. Add an integration test with concurrent requests.',
        'Nein. Diese Prüfungen laufen nacheinander auf einem In-memory-Objekt. Eine Datenbank braucht ein atomares bedingtes Update oder einen Constraint sowie einen Integration-Test mit gleichzeitigen Requests.'),
    ],
    sim: 'typecheck',
    related: ['lint', 'architecture', 'static-analysis'],
  },
  {
    id: 'lint',
    domain: { parts: ['domain', 'reserve'], what: l('Four lint rules examine domain code for errors such as a reservation save without `await`.', 'Vier Lint-Regeln prüfen den Domain Code. Eine Regel meldet einen Speicheraufruf ohne `await`.') },
    sim: 'lint',
    name: l('Lint tests', 'Linting'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    core: true,
    oneLiner: l('A linter reports code patterns that its rules prohibit before the code runs.', 'Ein Linter meldet Codemuster, die seine Regeln verbieten. Der Linter führt den geprüften Code dabei nicht aus.'),
    catches: l('Unused variables, calls without a necessary `await`, shadowed names, prohibited APIs and inconsistent style.', 'Unbenutzte Variablen, fehlendes `await`, verdeckte Namen, verbotene APIs und Abweichungen von Stilregeln.'),
    intro: l(
      'AGENTS.md prohibits `Math.random` in the domain code. A coding agent can still use it in a long task. A lint rule reports the same error each time the linter runs.',
      'AGENTS.md verbietet `Math.random` im Domain Code. Ein Coding-Agent kann die Funktion trotzdem verwenden. Eine Lint-Regel meldet den Verstoß bei jedem Lauf.',
    ),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('Lint is fast and gives the same result for the same code and rules. It can run in a pre-commit hook and in CI.', 'Lint liefert für denselben Code und dieselben Regeln dasselbe Ergebnis. Lint kann im Pre-Commit Hook und in CI laufen.'),
      l('A custom lint rule can enforce a project rule. For example, the rule can prohibit `Math.random` in the domain code.', 'Eine eigene Lint-Regel kann eine Projektregel prüfen. Sie kann zum Beispiel `Math.random` im Domain Code verbieten.'),
      l('Many rules have automatic fixes. A coding agent can use these fixes without help from a person.', 'Viele Regeln bieten einen Auto-Fix. Ein Coding-Agent kann diesen Fix ausführen.'),
    ],
    limits: [
      l('People can ignore warnings when there are too many. Keep the rule set small. Configure each rule in the set as an error.', 'Zu viele Warnungen können dazu führen, dass Nutzer wichtige Warnungen übersehen. Verwende wenige Regeln. Stelle jede verwendete Regel auf Fehler.'),
      l('Linters examine patterns in code. A linter cannot decide if the code meets an unwritten requirement.', 'Linter prüfen Muster im Code. Anforderungen ohne passende Regel bleiben offen.'),
    ],
    ai: l(
      'A linter can enforce a rule on each change. A rule in AGENTS.md depends on the coding agent to obey it. For each written rule, examine if a lint rule can enforce it.',
      'Ein Linter kann eine Regel für jede Änderung prüfen. Eine Regel in AGENTS.md wirkt nur, wenn der Coding-Agent sie befolgt. Prüfe für jede Textregel, ob Lint sie prüfen kann.',
    ),
    evidence: {
      general: none(),
      ai: ev('moderate', f('sweagent2024', 'When the researchers removed the lint check from the SWE-agent edit command, success on SWE-bench Lite decreased from 18.0% to 15.0%.', 'In der Ablation von SWE-agent sank die Erfolgsquote auf SWE-bench Lite von 18,0 % auf 15,0 %, als der Linter-Schutz am Edit-Befehl entfernt wurde.')),
    },
    tools: { php: ['phpcs', 'php-cs-fixer'], js: ['eslint', 'typescript-eslint', 'biome'], python: ['ruff'], java: ['checkstyle', 'detekt'], dotnet: ['roslyn-analyzers'], go: ['golangci-lint'], rust: ['clippy'], cpp: ['clang-tidy'], any: ['pre-commit'] },
    snippets: [
      { lang: 'js', file: 'eslint.config.js', code: `import tseslint from 'typescript-eslint';

export default tseslint.config(...tseslint.configs.strictTypeChecked, {
  languageOptions: { parserOptions: { projectService: true } },
  rules: {
    '@typescript-eslint/no-floating-promises': 'error', // forgotten await
    '@typescript-eslint/no-explicit-any': 'error',      // no escape hatch
    'no-restricted-syntax': ['error', {
      selector: "MemberExpression[object.name='Math'][property.name='random']",
      message: 'Inject a random source; domain code must be deterministic.',
    }],
  },
});`,
      focus: [
        { line: 3, note: l("Type-aware lint rules use the compiler's type information to find errors.", "Typbewusste Regeln brauchen die Typinformation des Compilers, erst dadurch fangen sie echte Fehler.") },
        { line: 6, note: l("Without `await`, the interface can show a pet as reserved while the save operation is still in progress.", "Ein vergessenes `await` am Reservierungsaufruf lässt das Tier reserviert wirken, während das Schreiben noch läuft.") },
        { line: 7, note: l("The rule prohibits `any`. It prevents a coding agent from using `any` to suppress type errors.", "Verbietet `any`, damit ein Agent die Typprüfung nicht durch einen aufgeweichten Typ umgeht.") },
        { line: [8, 11], note: l("Random values in domain code can make test results inconsistent. Supply the random value as an input.", "Eine Projektregel als Code: Zufall in der Fachlogik macht Tests flaky, also injizieren.") },
      ] },
      { lang: 'python', file: 'pyproject.toml', code: `[tool.ruff.lint]
select = ["E", "F", "B", "UP", "SIM", "S"]  # pyflakes, bugbear, security …
[tool.ruff.lint.flake8-tidy-imports.banned-api]
"random".msg = "Inject a random source; domain code must be deterministic."`,
      focus: [
        { line: 2, note: l("The rule sets `F`, `B` and `S` report patterns that can cause errors.", "Wählt fehlerfindende Regelsätze (`F`, `B`, `S`), nicht nur Stil, damit die Ausgabe auf echte Defekte zeigt.") },
        { line: 3, note: l("A prohibited-API rule can enforce a project convention that the default lint rules do not cover.", "Eine Banned-API-Regel erzwingt eine Hauskonvention, die kein generischer Linter kennt.") },
        { line: 4, note: l("The message gives the coding agent an alternative to the prohibited API.", "Die Meldung sagt dem Agenten, was er stattdessen tun soll: ein Fix-Hinweis statt einer Sackgasse.") },
      ] },
    ],
    steps: [
      l('Install the linter. Select its recommended strict preset.', 'Installiere den Linter. Wähle das empfohlene Strict Preset.'),
      l('Set each enabled rule to report an error. Disable rules that you do not use.', 'Stelle jede aktive Regel auf Fehler. Deaktiviere Regeln, die du nicht verwendest.'),
      l('Add one custom rule for an error that occurred in this repository.', 'Füge eine eigene Regel für einen Fehler hinzu, der in diesem Repository auftrat.'),
      l('Run lint in a pre-commit hook. Make lint a required CI step.', 'Führe Lint in einem Pre-Commit Hook aus. Mache Lint zu einem erforderlichen CI-Schritt.'),
    ],
    done: l('Lint passes with zero warnings. A lint error makes CI fail. The change adds no comments that disable all lint rules.', 'Lint meldet keine Warnungen. Ein Lint-Fehler lässt CI fehlschlagen. Die Änderung enthält keine Kommentare, die alle Lint-Regeln deaktivieren.'),
    think: [
      q('Why can warnings be less useful than errors or disabled rules?', 'Warum ist „Warnung“ oft schlechter als „Fehler“ oder „aus“?',
        'When the linter reports many warnings, people can ignore important warnings. An error stops the check. A disabled rule produces no output.',
        'Warnungen stapeln sich, bis niemand sie liest, auch die eine wichtige nicht. Ein Fehler ist eine Entscheidung, „aus“ auch. Eine Warnung ist eine vertagte Entscheidung.'),
      q('The code has a valid syntax but uses the wrong rate for a fee. Can a general lint rule find this error?', 'Welchen Fehler findet ein Linter nie, egal wie viele Regeln du ergänzt?',
        'A linter can accept `price * 0.1` when the correct formula is `price * 0.15`. A test can compare the result with the required fee.',
        'Eine falsche Fachregel, die syntaktisch einwandfrei ist, etwa eine Gebühr von `price * 0.1` statt `0.15`. Linter prüfen Muster, nicht Absicht; dafür braucht es Tests.'),
      q('You enable `no-floating-promises` in a codebase with 200 violations. How can you apply the rule to new changes?', 'Vorhersage: Du aktivierst `no-floating-promises` in einer Codebasis mit 200 Verstößen. Was passiert in der ersten Woche?',
        'Record the existing violations as a baseline or correct them in groups. Enforce the rule on all new code.',
        'Entweder ist der Build für alle rot, oder die Regel wird leise zur Warnung herabgestuft. Eine Baseline festhalten oder in Stapeln beheben, und die Regel für neuen Code sofort erzwingen.'),
    ],
    related: ['type-systems', 'static-analysis', 'agent-rules', 'ci'],
  },
  {
    id: 'static-analysis',
    domain: { parts: ['checkout', 'server-price', 'api'], what: l('A Semgrep rule follows the price from the request and stops code that trusts it.', 'Eine Semgrep-Regel prüft, ob Code einen Preis aus dem Request ohne Prüfung verwendet.') },
    viz: { kind: 'pipeline', mode: 'static-analysis' },
    name: l('Static analysis', 'Statische Analyse'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Static analysis examines code before it runs. It can follow data across functions and files.', 'Static Analysis untersucht Code vor der Ausführung. Sie kann Daten über mehrere Funktionen und Dateien verfolgen.'),
    catches: l('null dereferences, resource leaks, unreachable code, taint from input to a dangerous sink', 'Null Dereferences, Resource Leaks, unerreichbarer Code und ungeprüfte Eingaben in sensiblen Operationen.'),
    intro: l(
      'A request value passes through four functions before it reaches a database query. Each function can look correct on its own. Static analysis can show the full data path.',
      'Ein Wert aus einem Request erreicht nach vier Funktionsaufrufen eine SQL-Abfrage. Jede Funktion kann für sich korrekt aussehen. Static Analysis kann den vollständigen Datenpfad zeigen.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('Static analysis can examine paths that the tests do not run.', 'Static Analysis kann Pfade prüfen, die kein Test ausführt.'),
      l('A custom Semgrep rule can find a defect pattern in multiple parts of the code.', 'Eine eigene Semgrep-Regel kann ein Fehlermuster im gesamten Repository finden.'),
      l('Static analysis runs without a deployed system or test data. It can run on each pull request.', 'Static Analysis braucht keine Testdaten und keinen laufenden Service. Sie kann für jeden Pull Request laufen.'),
    ],
    limits: [
      l('An analyzer can report only a subset of the defects in a program.', 'Ein Analyzer meldet nur einen Teil der tatsächlichen Fehler.'),
      l('False positives can cause people to ignore results. Adjust the rules when they give repeated false positives.', 'Wiederholte False Positives können dazu führen, dass Nutzer Findings ignorieren. Passe die Regeln an.'),
    ],
    ai: l(
      'Give the analyzer findings to the coding agent. Use a second tool to check for errors that the first analyzer does not report.',
      'Gib die Findings des Analyzers an den Coding-Agenten. Verwende ein zweites Tool für Fehler, die der erste Analyzer nicht meldet.',
    ),
    evidence: {
      general: ev('moderate',
        f('habib2018', 'Three widely used Java bug finders together detected only about 4.5% of 594 real bugs from Defects4J.', 'Drei verbreitete Java-Fehlersucher fanden zusammen nur etwa 4,5 % von 594 echten Fehlern aus Defects4J.'),
        f('sadowski2018tools', 'At Google, analysers were only used when built into the workflow (compiler, code review) and kept to a low effective false-positive rate.', 'Bei Google wurden Analysatoren nur genutzt, wenn sie im Arbeitsablauf (Compiler, Code-Review) steckten und kaum Fehlalarme lieferten.')),
      ai: ev('moderate', f('blyth2025', 'Feeding Bandit/Pylint findings back to GPT-4o cut outputs with security issues from over 40% to 13% within 10 iterations (preprint).', 'Bandit-/Pylint-Funde an GPT-4o zurückzugeben senkte den Anteil von Ausgaben mit Sicherheitsproblemen in 10 Iterationen von über 40 % auf 13 % (Preprint).')),
    },
    tools: { php: ['phpstan', 'psalm'], java: ['error-prone', 'spotbugs', 'infer'], go: ['staticcheck'], cpp: ['clang-analyzer', 'cppcheck', 'infer'], any: ['semgrep'] },
    snippets: [
      { lang: 'any', file: '.semgrep/no-client-price.yml', code: `rules:
  - id: trust-client-price
    message: The server must recompute the price; never trust req.body.price.
    severity: ERROR
    languages: [typescript, javascript]
    pattern: $ORDER.priceCents = $REQ.body.priceCents`,
      focus: [
        { line: 2, note: l("The rule has a stable id, so a suppression is explicit and reviewable.", "Die Regel hat eine stabile id, damit ist eine Unterdrückung explizit und reviewbar.") },
        { line: 3, note: l("The message states the invariant and the fix; this is what the developer or agent reads on failure.", "Die Meldung nennt Invariante und Lösung; das liest die Entwicklerin oder der Agent beim Fehlschlag.") },
        { line: 4, note: l("`ERROR` makes it block the build instead of becoming a warning nobody reads.", "`ERROR` lässt den Build scheitern, statt zur Warnung zu werden, die niemand liest.") },
        { line: 6, note: l("The pattern matches the dangerous shape (client price assigned to the order) whatever the variable names.", "Das Pattern trifft die gefährliche Form (Client-Preis an die Bestellung zugewiesen), egal wie die Variablen heißen.") },
      ] },
    ],
    steps: [
      l('Run the analyzer on the full repository. Record the existing findings as a baseline.', 'Führe den Analyzer für das vollständige Repository aus. Erfasse vorhandene Findings als Baseline.'),
      l('Configure CI to fail only on new findings.', 'Konfiguriere CI so, dass nur neue Findings den Build fehlschlagen lassen.'),
      l('Write one custom rule for a defect that occurred in this project.', 'Schreibe eine eigene Regel für ein Fehlermuster aus diesem Projekt.'),
    ],
    done: l('The analyzer runs in CI. New findings make the build fail. The custom rule detects the defect in a controlled test example.', 'Der Analyzer läuft in CI. Neue Findings lassen den Build fehlschlagen. Die projektspezifische Regel erkennt den Fehler in einem Testbeispiel.'),
    think: [
      q('Static analysis finds only a few percent of real bugs. Why use it at all?', 'Statische Analyse findet nur wenige Prozent echter Fehler. Warum überhaupt?',
        'Because what it finds, it finds on every commit, for free, before review. It is one cheap layer of the funnel, not the whole funnel.',
        'Weil sie das, was sie findet, bei jedem Commit kostenlos vor dem Review findet. Sie ist eine billige Schicht des Trichters, nicht der ganze Trichter.'),
      q('Which bug would static analysis miss in the reservation code?', 'Welchen Fehler würde statische Analyse im Reservierungscode übersehen?',
        'The double reservation: both code paths are valid, and the problem only exists in the timing of two requests. Races and wrong business rules need tests, model checking or database constraints.',
        'Die doppelte Reservierung: Beide Codepfade sind gültig, das Problem steckt nur im zeitlichen Zusammenspiel zweier Requests. Race Conditions und falsche Fachregeln brauchen Tests, Model Checking oder Datenbank-Constraints.'),
      q('Predict: a taint analyser finds user input reaching a SQL string in the pet search. The agent wraps the input in a custom `sanitize()`. What does the analyser report next?', 'Vorhersage: Ein Taint-Analysator findet, dass Nutzereingaben in der Tiersuche in einen SQL-String gelangen. Der Agent packt die Eingabe in eine eigene `sanitize()`. Was meldet der Analysator danach?',
        'Probably still the finding, because the tool does not know `sanitize()` is safe. The agent may then add a suppression. The right fix is a parameterised query, which the analyser recognises.',
        'Vermutlich weiterhin den Fund, weil das Werkzeug nicht weiß, dass `sanitize()` sicher ist. Der Agent ergänzt dann womöglich eine Unterdrückung. Die richtige Lösung ist eine parametrisierte Query, die der Analysator erkennt.'),
    ],
    related: ['lint', 'security-scanning', 'type-systems', 'formal-verification'],
  },
  {
    id: 'security-scanning',
    domain: { parts: ['config'], what: l('Six scanners check an agent\'s pull request for secrets and bad packages.', 'Sechs Scanner prüfen den Pull Request eines Coding-Agenten auf Secrets und problematische Abhängigkeiten.') },
    sim: 'secrets',
    name: l('Security scanning (SAST, SCA, secrets)', 'Security-Scans (SAST, SCA, Secrets)'),
    layer: 'static',
    phases: ['pre', 'deploy'],
    fromOverview: false,
    oneLiner: l('Security scanners examine source code, dependencies and repository history for known risks. They can also find exposed credentials.', 'Security-Scanner prüfen Code, Abhängigkeiten und die Historie auf bekannte Risiken. Sie können auch offengelegte Zugangsdaten finden.'),
    catches: l('SQL injection patterns, dependencies with known CVEs, API keys committed to git, unknown or typo-squatted packages', 'Bekannte SQL-Injection-Muster, bekannte Schwachstellen in Abhängigkeiten, gespeicherte API-Keys und unbekannte Pakete.'),
    intro: l(
      'A coding agent commits an API key and adds a package that does not exist. Automatic checks can report these problems before merge.',
      'Ein Coding-Agent committet einen API-Key und fügt ein Paket hinzu, das nicht existiert. Automatische Checks können diese Probleme vor dem Merge melden.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('A scan for credentials can run quickly in a pre-commit hook.', 'Ein Scan für Secrets kann schnell im Pre-Commit Hook laufen.'),
      l('Software composition analysis (SCA) can report a new vulnerability in a dependency already in use.', 'Software Composition Analysis (SCA) kann eine neue Schwachstelle in einer bereits verwendeten Abhängigkeit melden.'),
      l('A software bill of materials (SBOM) and a lockfile record the components and versions in a build.', 'Ein Software Bill of Materials (SBOM) und ein Lockfile dokumentieren Komponenten und Versionen eines Builds.'),
    ],
    limits: [
      l('Scanners detect known patterns. Use threat modeling and tests for defects in business logic or authorization.', 'Scanner erkennen bekannte Muster. Verwende Threat Modeling und Tests für Fehler in Fachlogik oder Autorisierung.'),
      l('Review scanner findings by severity and by whether the program can reach the vulnerable code.', 'Ordne Findings nach Schweregrad. Prüfe auch, ob der Code die verwundbare Stelle erreichen kann.'),
    ],
    ai: l(
      'Coding agents can add credentials or name packages that do not exist. Scan each change for credentials and examine new dependencies.',
      'Coding-Agenten können Zugangsdaten in den Code aufnehmen oder nicht vorhandene Pakete nennen. Scanne jede Änderung auf Secrets. Prüfe neue Abhängigkeiten.',
    ),
    evidence: {
      general: none(),
      ai: ev('moderate',
        f('pearce2022', 'About 40% of Copilot completions in 89 security-relevant scenarios were vulnerable.', 'Etwa 40 % der Copilot-Vervollständigungen in 89 sicherheitsrelevanten Szenarien waren verwundbar.'),
        f('secsmell2026', 'Across 4,022 agent-generated pull requests, 38.9% contained at least one security smell, and hard-coded credentials made up 99.6% of the critical ones (preprint).', 'In 4.022 von Agenten erzeugten Pull Requests enthielten 38,9 % mindestens einen Sicherheitsmangel; fest kodierte Zugangsdaten machten 99,6 % der kritischen aus (Preprint).')),
    },
    variants: [
      { name: l('Supply chain (SBOM, provenance, pinning)', 'Lieferkette (SBOM, Herkunftsnachweis, Pinning)'), text: l('Record each component in the build. Check where each artifact came from. Start with lockfiles and a software bill of materials.', 'Erfasse jede Komponente des Builds. Prüfe die Herkunft der Artefakte. Beginne mit den Lockfiles und einem Software Bill of Materials.') },
      { name: l('DAST', 'DAST'), text: l('Dynamic scanning examines a running application. For example, run a baseline scan on a staging deployment.', 'Dynamic Scanning prüft eine laufende Anwendung. Führe zum Beispiel einen Baseline-Scan auf einem Staging-Deployment aus.') },
    ],
    tools: { php: ['composer', 'psalm'], python: ['bandit'], go: ['gosec', 'govulncheck'], rust: ['cargo-audit'], any: ['gitleaks', 'osv-scanner', 'trivy', 'semgrep', 'syft', 'zap'] },
    snippets: [
      { lang: 'any', file: '.pre-commit-config.yaml', code: `repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.24.2
    hooks:
      - id: gitleaks`,
      focus: [
        { line: 3, note: l("A pinned `rev` keeps the scanner reproducible; a floating version could change results overnight.", "Eine festgenagelte `rev` hält den Scanner reproduzierbar; eine schwebende Version könnte über Nacht die Ergebnisse ändern.") },
        { line: 5, note: l("Running as a pre-commit hook stops a leaked key before it enters git history, where removal is painful.", "Als Pre-commit-Hook stoppt der Scan einen geleakten Schlüssel, bevor er in der Git-History landet, wo das Entfernen mühsam ist.") },
      ] },
    ],
    steps: [
      l('Add a scan for secrets to the pre-commit hook. Configure CI to scan the full Git history.', 'Füge im Pre-Commit Hook einen Scan für Secrets hinzu. Konfiguriere CI für einen Scan der gesamten Git-Historie.'),
      l('Scan the dependency lockfile with OSV-Scanner or Trivy. Make CI fail on high or critical findings.', 'Prüfe das Lockfile mit OSV-Scanner oder Trivy. Lass CI bei Findings mit hohem oder kritischem Schweregrad fehlschlagen.'),
      l('Add a static application security test (SAST) to CI. Record existing findings as a baseline.', 'Füge in CI einen SAST-Schritt hinzu. Erfasse die vorhandenen Findings als Baseline.'),
      l('Require a person to approve each new dependency that CI reports.', 'Verlange für jede neue Abhängigkeit die Freigabe einer Person.'),
    ],
    done: l('A test credential and a test dependency with a known vulnerability both make CI fail. New dependencies require approval.', 'Ein Test-Secret und eine Testabhängigkeit mit bekannter Schwachstelle lassen CI fehlschlagen. Neue Abhängigkeiten erfordern eine Freigabe.'),
    think: [
      q('An agent adds `left-padder` to package.json to fix a bug. Which checks should fire, and why might none of them?', 'Ein Agent fügt `left-padder` zu package.json hinzu, um einen Fehler zu beheben. Welche Prüfungen sollten anschlagen, und warum vielleicht keine?',
        'Scan dependencies for known vulnerabilities. Require approval for each new dependency. A package may have a vulnerability that the scanner does not know about. Verify that the package exists and identify its publisher.',
        'Prüfe Abhängigkeiten auf bekannte Schwachstellen. Verlange eine Freigabe für jedes neue Paket. Ein Scanner kennt möglicherweise noch keine Schwachstelle dieses Pakets. Prüfe, ob es das Paket gibt und wer es veröffentlicht.'),
      q('Which kind of vulnerability will all three scanners (secrets, SCA, SAST) miss in the petstore?', 'Welche Art von Schwachstelle übersehen alle drei Scanner (Secrets, SCA, SAST) im Petstore?',
        'Broken authorization, for example any logged-in user cancelling another person\'s reservation by changing an id. That is an intended-behaviour flaw; it needs threat modeling and an API test.',
        'Fehlende Autorisierung, etwa wenn jeder angemeldete Nutzer die Reservierung einer anderen Person durch Ändern einer ID stornieren kann. Das ist ein Fehler im beabsichtigten Verhalten; dafür braucht es Threat Modeling und einen API-Test.'),
      q('Predict: a secret scanner runs only on the latest commit. A key was committed last month and removed in the next commit. What does the scan report?', 'Vorhersage: Ein Secret-Scanner prüft nur den neuesten Commit. Ein Schlüssel wurde letzten Monat committet und im nächsten Commit entfernt. Was meldet der Scan?',
        'Nothing, but the key is still in the git history and must be treated as leaked. Scan the full history and rotate the key.',
        'Nichts, aber der Schlüssel steckt weiter in der Git-Historie und gilt als kompromittiert. Die ganze Historie scannen und den Schlüssel rotieren.'),
    ],
    related: ['static-analysis', 'threat-modeling', 'penetration-tests', 'ci'],
  },
  {
    id: 'ci',
    domain: { parts: ['tests'], what: l('Before merge, CI runs lint, type checks, tests and the build for each petstore commit.', 'Vor dem Merge führt CI für jeden Commit Lint, Type Checks, Tests und Build aus.') },
    viz: { kind: 'pipeline', mode: 'ci' },
    name: l('Continuous integration', 'Continuous Integration (CI)'),
    layer: 'static',
    phases: ['pre', 'deploy'],
    fromOverview: false,
    core: true,
    oneLiner: l('Continuous integration (CI) runs the required automatic checks in a clean environment before a change can merge.', 'Continuous Integration (CI) führt vorgeschriebene Checks in einer frischen Umgebung aus. Alle Checks müssen vor dem Merge bestehen.'),
    catches: l('Checks that people skip, failures that occur only in a clean environment, and conflicts between changes.', 'Ausgelassene Checks, Fehler in einer frischen Umgebung und Konflikte zwischen Änderungen.'),
    intro: l(
      'A coding agent runs one test file locally and reports success. CI requires all checks to pass in a clean environment before merge.',
      'Ein Coding-Agent führt lokal eine Testdatei aus und meldet Erfolg. Für den Merge müssen alle CI-Checks in einer frischen Umgebung bestehen.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('CI makes it possible to require the earlier automatic checks before merge.', 'CI kann automatische Checks vor dem Merge vorschreiben.'),
      l('Required status checks prevent a merge when a check fails.', 'Erforderliche Status Checks verhindern den Merge, wenn ein Check fehlschlägt.'),
      l('A build in a clean environment can show missing files, undeclared dependencies and tests that depend on run order.', 'Ein Build in einer frischen Umgebung kann fehlende Dateien, fehlende Abhängigkeiten und reihenfolgeabhängige Tests zeigen.'),
      l('The CI record shows which checks ran for each commit. It also shows which commits have no results.', 'Der CI-Bericht zeigt die Checks pro Commit. Er zeigt auch, für welche Commits Ergebnisse fehlen.'),
    ],
    limits: [
      l('Slow CI can cause people and coding agents to skip checks. Keep the required checks below approximately 10 minutes.', 'Langsame CI kann dazu führen, dass Nutzer Checks überspringen. Halte erforderliche Checks bei ungefähr 10 Minuten oder weniger.'),
      l('Flaky tests can cause people to run a check again without an examination of the failure.', 'Flaky Tests können Nutzer dazu verleiten, einen Lauf ohne Fehleranalyse zu wiederholen.'),
    ],
    ai: l(
      'Give coding agents the command that CI uses, for example `npm run ci`. Require the command before each pull request. Protect the CI configuration from unapproved changes.',
      'Gib dem Coding-Agenten den Befehl aus CI, etwa `npm run ci`. Verlange den Befehl vor jedem Pull Request. Schütze die CI-Konfiguration vor Änderungen ohne Freigabe.',
    ),
    evidence: {
      general: ev('moderate',
        f('vasilescu2015', 'GitHub projects merged more contributions from outside the project after they started using CI. The study found no measurable decrease in quality.', 'Nach Einführung von CI mergten GitHub-Projekte mehr externe Beiträge ohne messbaren Qualitätsverlust.'),
        f('accelerate2018', 'The survey found a statistical relation between software delivery performance and the use of CI and test automation.', 'Continuous Integration und Testautomatisierung sagen die Liefer-Performance statistisch voraus (Umfragedaten, korrelativ).')),
      ai: none(),
    },
    variants: [
      { name: l('Flaky tests', 'Flaky Tests'), text: l('Run failed tests again automatically to identify tests with inconsistent results. Record the tests that give different results. Remove confirmed flaky tests from the required checks temporarily. Set a time limit to correct or remove each test. Tell coding agents to avoid skips, added delays and repeated runs until a pass. If the coding agent cannot find the cause, remove the test and record the reason.', 'Wiederhole fehlgeschlagene Tests automatisch, um Flaky Tests zu finden. Erfasse Tests mit wechselnden Ergebnissen. Entferne bestätigte Flaky Tests vorübergehend aus den erforderlichen Checks. Lege eine Frist zur Korrektur oder Entfernung fest. Verlange vom Coding-Agenten, dass er Tests weder überspringt noch künstliche Wartezeiten einfügt. Er darf Tests nicht bis zu einem zufälligen Erfolg wiederholen. Dokumentiere die Ursache oder die Entscheidung zur Entfernung.') },
      { name: l('New gates: off → observe → enforce', 'Neue Gates: off → observe → enforce'), text: l('First run the new check in observe mode. Record what the check would block. Examine the false positives. Then enable enforcement.', 'Starte den neuen Check im Modus observe. Erfasse, was der Check blockieren würde. Prüfe False Positives. Aktiviere danach den Modus enforce.') },
    ],
    tools: { any: ['act', 'woodpecker', 'jenkins', 'pre-commit'] },
    snippets: [
      { lang: 'any', file: '.github/workflows/ci.yml', code: `name: ci
on: [pull_request, push]
jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run ci   # the same command developers and agents run locally`,
      focus: [
        { line: 2, note: l("On each pull request, this workflow runs the checks before merge.", "Läuft bei Pull Requests, damit jede Agent-Änderung geprüft wird, bevor ein Mensch sie sieht.") },
        { line: 6, note: l("A timeout stops a test that does not finish from using more CI time.", "Ein Timeout verhindert, dass ein hängender Test die Pipeline blockiert oder still CI-Minuten verbrennt.") },
        { line: 8, note: l("Version pins keep the versions of the actions constant between runs. They also limit unexpected changes to dependencies.", "An Versionen gebundene Actions halten die Pipeline reproduzierbar und begrenzen Überraschungen in der Lieferkette.") },
        { line: 12, note: l("People, coding agents and CI use the same command. Each run uses the same sequence of checks.", "Ein gemeinsamer Befehl für Menschen, Agenten und CI sorgt dafür, dass „lokal grün“ und „in CI grün“ nicht auseinanderlaufen.") },
      ] },
    ],
    steps: [
      l('Create one script named `ci` to run lint, type checks, tests and the build in order. Give this command in the pull request instructions.', 'Erstelle das Skript `ci`. Führe darin Lint, Type Checks, Tests und Build nacheinander aus. Dokumentiere das Skript in der Anleitung für Pull Requests.'),
      l('Run the same script in CI on each pull request.', 'Führe dasselbe Skript bei jedem Pull Request in CI aus.'),
      l('Make the CI job a required status check on the main branch.', 'Mache den CI-Job zu einem erforderlichen Status Check auf dem Main Branch.'),
    ],
    done: l('A failing test blocks the merge. The `ci` script runs the same checks locally and in CI.', 'Ein fehlgeschlagener Test blockiert den Merge. Das Skript `ci` führt lokal und in CI dieselben Checks aus.'),
    think: [
      q('The required CI checks take 40 minutes. How can this change when people run the checks?', 'Deine CI braucht 40 Minuten. Was passiert mit den anderen Schichten des Trichters?',
        'People can group changes, skip a run or use results from an earlier commit. Coding agents can wait or stop work. Keep CI fast so it can give feedback for each change.',
        'Man bündelt Änderungen, überspringt Läufe und mergt mit „gestern war es grün“. Agenten warten oder geben auf. Schnelles Feedback ist Teil der Prüfung, kein Luxus.'),
      q('Which errors can remain after CI passes?', 'Welchen Fehler verrät dir ein grüner CI-Lauf nicht?',
        'CI can show only the errors that its checks can find. A missing test, a production race condition or an incorrect requirement can still cause an error.',
        'Alles, was die Pipeline nicht prüft: einen fehlenden Test, eine Race Condition, die nur in Produktion auftritt, eine falsche Anforderung. Die CI garantiert, dass die Prüfungen liefen, nicht dass es die richtigen waren.'),
      q('A coding agent can edit the workflow. How can it make CI pass without a correction to the code?', 'Vorhersage: Ein Agent soll die CI grün bekommen und darf die Workflow-Datei ändern. Was ist der billigste Weg zum Erfolg?',
        'The coding agent can remove the failing step. Protect the workflow with code-owner review. Require the status checks by name on the main branch.',
        'Den fehlschlagenden Schritt entfernen oder überspringen. Die Workflow-Datei per Code-Owner-Review schützen und die Status Checks auf dem Main-Branch namentlich verlangen.'),
    ],
    related: ['test-integrity', 'lint', 'unit-tests', 'smoke-tests'],
  },
  {
    id: 'tdd',
    domain: { parts: ['reserve', 'never-twice'], what: l('Four approved tests for `reserve()` exist before the code.', 'Vier freigegebene Tests für `reserve()` legen vor der Implementierung das Verhalten fest.') },
    sim: 'tdd',
    name: l('TDD & spec-driven development', 'TDD & spezifikationsgetriebene Entwicklung'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('Test-driven development (TDD) starts with a test for a requirement. Then you change the code until the test passes.', 'Test-Driven Development (TDD) beginnt mit einem Test für eine Anforderung. Ändere danach den Code, bis der Test besteht.'),
    catches: l('code that solves a different problem than intended, and untested behaviour that slips in "while we are at it"', 'Code, der von einer freigegebenen Anforderung abweicht oder zusätzliches Verhalten ohne Test einführt.'),
    intro: l(
      'A coding agent writes the reservation code and its tests at the same time. The tests can repeat the existing behavior. In TDD, an approved test gives the required behavior before implementation.',
      'Ein Coding-Agent schreibt den Reservierungscode und die Tests gleichzeitig. Die Tests können das Verhalten des Codes wiederholen. Bei TDD gibt ein freigegebener Test das erwartete Verhalten vor der Implementierung vor.',
    ),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('An approved test gives the coding agent an external rule for the result.', 'Ein freigegebener Test gibt dem Coding-Agenten eine unabhängige Regel für das erwartete Ergebnis.'),
      l('Small steps give frequent feedback. A strict order is less important than checks that run after each step.', 'Kleine Schritte geben regelmäßig Feedback. Führe nach jedem Schritt die Checks aus.'),
      l('A test that fails before the correction shows that it can detect a defect.', 'Ein fehlschlagender Test vor der Korrektur zeigt, dass der Test einen Fehler erkennen kann.'),
    ],
    limits: [
      l('Studies of developers report small and mixed effects.', 'Studien mit Entwicklern zeigen geringe und unterschiedliche Effekte.'),
      l('A coding agent with permission to edit the tests can weaken an assertion to make a test pass.', 'Ein Coding-Agent mit Schreibzugriff auf Tests kann eine Assertion abschwächen, damit ein Test besteht.'),
    ],
    ai: l(
      'Studies found that coding agents complete more tasks when they receive test results during implementation. Approve the tests before implementation. Protect the approved tests from changes.',
      'Studien zeigen, dass Testfeedback während der Implementierung bei Coding-Agenten die Erfolgsquote erhöhen kann. Gib die Tests vor der Implementierung frei. Schütze die freigegebenen Tests vor Änderungen.',
    ),
    evidence: {
      general: ev('moderate',
        f('rafique2013', 'A meta-analysis of 27 studies found a small positive effect on quality and little to no effect on productivity.', 'Eine Metaanalyse von 27 Studien fand einen kleinen positiven Effekt auf die Qualität und kaum Effekt auf die Produktivität.'),
        f('fucci2017', 'Whether tests came first or last had no important effect; working in small, uniform steps did.', 'Ob Tests zuerst oder zuletzt kamen, war unwichtig; wichtig waren kleine, gleichmäßige Schritte.')),
      ai: ev('moderate',
        f('mathews2024', 'Giving GPT-4 and Llama 3 the tests together with the problem statement raised success on MBPP and HumanEval.', 'Bekamen GPT-4 und Llama 3 die Tests zusammen mit der Aufgabenstellung, stieg der Erfolg auf MBPP und HumanEval.'),
        f('reflexion2023', 'Iterating on unit-test feedback raised HumanEval pass@1 to 91%.', 'Iteration auf Unit-Test-Feedback hob pass@1 auf HumanEval auf 91 %.')),
    },
    tools: { php: ['phpunit', 'pest'], js: ['vitest'], python: ['pytest'], java: ['junit'], dotnet: ['xunit'], go: ['go-test'], rust: ['cargo-test'], cpp: ['googletest'], any: ['spec-kit'] },
    snippets: [
      { lang: 'js', file: 'reserve.test.ts', code: `// Written and approved by a human BEFORE the agent implements reserve().
describe('reserve', () => {
  it('reserves an available pet', () => {
    const pets = store([{ id: 'rex' }]);
    expect(reserve(pets, 'rex', 'anna')).toEqual({ ok: true });
  });
  it('never reserves the same pet twice', () => {
    const pets = store([{ id: 'rex' }]);
    reserve(pets, 'rex', 'anna');
    expect(reserve(pets, 'rex', 'ben')).toEqual({ ok: false, reason: 'taken' });
  });
});`,
      focus: [
        { line: 1, note: l("The test is written and approved before the implementation, so it cannot be bent to fit the code.", "Der Test entsteht und wird freigegeben vor der Implementierung, er lässt sich also nicht dem Code anpassen.") },
        { line: [3, 6], note: l("The happy path pins what a successful reservation returns.", "Der Happy Path legt fest, was eine erfolgreiche Reservierung zurückgibt.") },
        { line: [7, 11], note: l("The invariant itself: a second reservation must fail with `taken`, the case an agent most easily gets wrong.", "Die Invariante selbst: Die zweite Reservierung muss mit `taken` scheitern, der Fall, den ein Agent am leichtesten falsch löst.") },
      ] },
      { lang: 'php', file: 'ReservationTest.php', code: `<?php declare(strict_types=1);
// Write this test first. Implement PetStore only after seeing it fail.
use PHPUnit\\Framework\\TestCase;

final class ReservationTest extends TestCase
{
    public function testPetCannotBeReservedTwice(): void
    {
        $store = new PetStore(['rex']);
        $store->reserve('rex', 'anna');
        $this->expectException(PetAlreadyReserved::class);
        $store->reserve('rex', 'ben');
    }
}`,
      focus: [
        { line: 2, note: l("The instruction to see the test fail first proves the test can fail at all.", "Die Anweisung, den Test zuerst scheitern zu sehen, beweist, dass er überhaupt scheitern kann.") },
        { line: 10, note: l("The first reservation is the setup; the test only means something if it succeeds.", "Die erste Reservierung ist das Setup; der Test taugt nur, wenn sie gelingt.") },
        { line: [11, 12], note: l("The second reservation must raise, so the “never twice” rule is checked, not assumed.", "Die zweite Reservierung muss eine Exception werfen, damit die Regel „nie zweimal“ geprüft statt angenommen wird.") },
      ] },
    ],
    steps: [
      l('Write the acceptance tests or specification for the change. Get approval before implementation.', 'Schreibe Acceptance Tests oder eine Spezifikation für die Änderung. Hole die Freigabe vor der Implementierung ein.'),
      l('Commit the tests separately. Protect those files for this task.', 'Committe die Tests getrennt. Schütze die Dateien für diese Aufgabe.'),
      l('Implement the code in small steps. Run the tests after each step. Keep the protected test files intact.', 'Implementiere die Änderung in kleinen Schritten. Führe die Tests nach jedem Schritt aus. Lass die geschützten Dateien unverändert.'),
    ],
    done: l('All approved tests pass. The protected test files match the approved commit byte for byte. Every other test still exists and runs.', 'Alle freigegebenen Tests bestehen. Die geschützten Dateien stimmen Byte für Byte mit dem freigegebenen Commit überein. Alle anderen Tests sind vorhanden und laufen.'),
    think: [
      q('An agent writes the code and then the tests for it. Why is that weaker than the other way round?', 'Ein Agent schreibt den Code und danach die Tests dazu. Warum ist das schwächer als umgekehrt?',
        'The tests then describe what the code does, not what it should do. A misunderstanding of the task ends up in both, and they agree with each other perfectly.',
        'Die Tests beschreiben dann, was der Code tut, nicht was er tun soll. Ein Missverständnis der Aufgabe landet in beidem, und beide stimmen perfekt überein.'),
      q('When would you not write the tests first?', 'Wann würdest du die Tests nicht zuerst schreiben?',
        'When you are exploring and do not know the shape of the solution yet, such as a spike or a prototype. Write the tests once the behaviour is clear, and keep them out of the agent\'s reach.',
        'Wenn du noch erkundest und die Form der Lösung nicht kennst, etwa bei einem Spike oder Prototyp. Schreib die Tests, sobald das Verhalten klar ist, und halte sie außerhalb der Reichweite des Agenten.'),
      q('Predict: an agent is given a failing test for "a pet must never be reserved twice" that calls `reserve` twice in sequence. What implementation passes, and is it correct?', 'Vorhersage: Ein Agent bekommt einen fehlschlagenden Test für „ein Tier darf nie zweimal reserviert werden“, der `reserve` zweimal nacheinander aufruft. Welche Implementierung besteht ihn, und ist sie korrekt?',
        'A check-then-write on an in-memory flag passes. It is correct for sequential calls but not for two concurrent requests, which the test never exercises. Add a concurrent test.',
        'Ein Check-then-write auf einem In-memory-Flag besteht. Das ist für sequentielle Aufrufe korrekt, aber nicht für zwei gleichzeitige Requests, die der Test nie ausführt. Einen Test mit Nebenläufigkeit ergänzen.'),
    ],
    related: ['test-integrity', 'unit-tests', 'acceptance-tests', 'agent-rules'],
  },
  {
    id: 'test-integrity',
    domain: { parts: ['tests', 'reserve', 'never-twice'], what: l('Four automatic checks examine five changes that a coding agent proposes after a reservation test fails.', 'Vier Checks prüfen fünf Änderungsvorschläge für einen fehlschlagenden Reservierungstest.') },
    sim: 'integrity',
    name: l('Test integrity', 'Testintegrität'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: false,
    core: true,
    oneLiner: l('Test integrity protects tests and their configuration from changes that hide errors in the code under test.', 'Test Integrity schützt Tests und ihre Konfiguration vor Änderungen, die Fehler im geprüften Code verdecken.'),
    catches: l('Weaker assertions, deleted or skipped tests, test environment detection and hard-coded expected results.', 'Schwächere Assertions, ausgelassene Tests, Erkennung der Testumgebung und fest codierte Ergebnisse.'),
    intro: l(
      'A coding agent can make a failing test pass with a weaker assertion. It can also skip the test. Test integrity checks can block these changes.',
      'Ein Coding-Agent kann einen fehlschlagenden Test mit einer schwächeren Assertion zum Bestehen bringen. Er kann den Test auch überspringen. Test Integrity kann solche Änderungen blockieren.',
    ),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('Basic protection uses CODEOWNERS for test directories, a CI check for skips and a hidden holdout suite.', 'Eine einfache Einrichtung schützt Testordner mit CODEOWNERS. CI prüft Skip-Marker und führt Holdout-Tests aus.'),
      l('These checks help keep test results valid when a coding agent changes the code.', 'Diese Checks können verhindern, dass Änderungen am Test ein falsches Ergebnis verdecken.'),
      l('Repository rules and a small CI script are sufficient for basic protection.', 'Für den Einstieg reichen Regeln im Repository und ein kleines CI-Skript.'),
    ],
    limits: [
      l('Test integrity protects the tests from changes. Use mutation testing to find weak tests.', 'Test Integrity schützt Tests vor Änderungen. Prüfe schwache Tests mit Mutation Testing.'),
      l('Protect the test runner configuration, fixtures and review rules. Read `REVIEW.md` from the base branch.', 'Schütze auch die Runner-Konfiguration, Fixtures und Review-Regeln. Lies `REVIEW.md` aus dem Base Branch.'),
    ],
    ai: l(
      'When tests and the specification disagree, a model can make the tests pass without meeting the specification. Stronger models did this more frequently in one study. Hidden tests decreased this behavior to almost zero. Protect the checks that evaluate each change.',
      'Wenn Tests und Spezifikation voneinander abweichen, kann ein Modell die Tests ohne korrekte Lösung bestehen. Stärkere Modelle taten das in einer Studie häufiger. Versteckte Tests senkten dieses Verhalten fast auf null. Schütze die Checks für jede Änderung.',
    ),
    evidence: {
      general: none(),
      ai: ev('moderate', f('impossiblebench2026', 'GPT-5 made the checks pass without solving the problem on 76% of impossible tasks in one SWE-bench variant. Hidden tests decreased this behavior to almost zero. Read-only tests prevented changes to the tests.', 'GPT-5 schummelte in einer SWE-bench-Variante bei 76 % der unmöglichen Aufgaben; versteckte Tests senkten das fast auf null, schreibgeschützte Tests verhinderten Teständerungen.')),
    },
    tools: { any: ['pre-commit', 'danger'] },
    snippets: [
      { lang: 'any', file: '.github/CODEOWNERS', code: `# Changes to tests and CI need a human owner's approval.
/test/          @your-team/maintainers
/.github/       @your-team/maintainers
*.test.ts       @your-team/maintainers`,
      focus: [
        { line: 1, note: l("The CODEOWNERS entry gives people responsibility for changes to the tests and CI.", "Die Regel gilt für Tests und CI: Die Dateien, die „fertig“ definieren, brauchen eine menschliche Verantwortung.") },
        { line: 3, note: l("The entry also protects the CI configuration. A change to that file could remove a failing check.", "Auch die CI-Konfiguration ist erfasst, sonst könnte ein Agent einfach die fehlschlagende Prüfung entfernen.") },
        { line: 4, note: l("The glob matches test files in different directories.", "Das Glob erfasst Tests, wo auch immer sie liegen, nicht nur in einem Ordner.") },
      ] },
      { lang: 'js', file: 'dangerfile.ts', code: `import { danger, fail } from 'danger';
const diff = await danger.git.diffForFile('test/reserve.test.ts');
if (diff && /\\b(it|test|describe)\\.(skip|only)\\b/.test(diff.added)) {
  fail('Tests were skipped or focused in this change.');
}`,
      focus: [
        { line: 2, note: l("The check examines the changed lines in the test file.", "Die Prüfung liest den echten Diff der Testdatei, sie sieht also, was sich geändert hat, nicht was behauptet wird.") },
        { line: 3, note: l("`skip` can exclude a test. `only` can exclude all tests outside the selected set.", "`skip` und `only` sind der billigste Weg, einen Test grün zu bekommen, ohne etwas zu reparieren.") },
        { line: 4, note: l("`fail` makes the status check fail and prevents a merge.", "`fail` blockiert den Merge, das ist also eine Schranke und kein Vorschlag.") },
      ] },
    ],
    steps: [
      l('Use CODEOWNERS or branch rules to require approval for changes to test directories and the CI configuration.', 'Verlange mit CODEOWNERS oder Branch-Regeln eine Freigabe für Änderungen an Tests und CI-Konfiguration.'),
      l('Add a CI check for new `skip`, `only` or `xfail` markers. Make CI fail if the test count decreases.', 'Prüfe in CI auf neue Marker wie `skip`, `only` und `xfail`. Lass CI bei weniger Tests fehlschlagen.'),
      l('Keep a small holdout suite outside the coding agent\'s workspace. Run that suite only in CI.', 'Lege die Holdout-Tests außerhalb des Arbeitsbereichs des Coding-Agenten ab. Führe sie nur in CI aus.'),
    ],
    done: l('Changes to protected tests require approval. A new skip marker blocks the merge. The holdout suite runs in CI and stays outside the coding agent\'s workspace.', 'Änderungen an geschützten Tests brauchen eine Freigabe. Ein neuer Skip-Marker blockiert den Merge. Die Holdout-Tests laufen in CI außerhalb des Arbeitsbereichs des Coding-Agenten.'),
    think: [
      q('Why can a stronger model bypass a test more frequently?', 'Warum sollte ein stärkeres Modell mehr schummeln, nicht weniger?',
        'A stronger model can find more ways to satisfy the given objective. If the objective is a passing test, the model can meet it without a correct solution. Change what the checks measure.',
        'Weil es besser darin ist, irgendeinen Weg zum gegebenen Ziel zu finden, und das Ziel ist „Tests grün“, nicht „Problem gelöst“. Abhilfe schafft, was gemessen wird, zu ändern, nicht auf bessere Manieren zu hoffen.'),
      q('Which changes can a check for skip markers fail to find?', 'Welche Art von Schummeln erkennt eine Prüfung auf übersprungene Tests nicht?',
        'A change from `toBe(42)` to `toBeDefined()` weakens the assertion. The test still runs and can pass. Mutation testing and review of test changes can find this problem.',
        'Eine Assertion, die von `toBe(42)` auf `toBeDefined()` abgeschwächt wurde. Der Test läuft weiter und besteht. Mutation Testing und das Review von Test-Diffs finden das.'),
      q('The coding agent cannot edit a failing double-booking test for `reserve`. Which other changes can make the test pass without a correction?', 'Vorhersage: Ein Agent bekommt `reserve` nicht durch den Doppelbuchungs-Test. Er darf jede Datei außer der Testdatei ändern. Was könnte er tun?',
        'The coding agent can change a fixture or helper that the test uses. It can also add special behavior for the test input or environment. Protect the fixtures and helpers. Use holdout tests with different data.',
        'Die Testeingabe als Sonderfall behandeln, die Testumgebung erkennen oder ein Fixture beziehungsweise einen Helfer ändern, auf den der Test sich stützt. Holdout-Tests mit anderen Daten und der Schutz der Helfer schließen diese Wege.'),
    ],
    related: ['tdd', 'ci', 'mutation-tests', 'evals'],
  },
];
