import type { Practice } from '../types';
import { ev, f, l, none, q } from './_h';
import { TYPE_REVISIONS } from '../typecheck';

export const staticChecks: Practice[] = [
  {
    id: 'type-systems',
    name: l('Type systems & compilers', 'Typsysteme & Compiler'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('Let the compiler reject code that uses values in ways their types do not allow.', 'Den Compiler Code ablehnen lassen, der Werte anders verwendet, als ihre Typen erlauben.'),
    catches: l('wrong arguments, missing fields, null where a value is required, typos in names', 'falsche Argumente, fehlende Felder, null statt eines Werts, Tippfehler in Namen'),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('Runs on every keystroke and covers all code paths, not just the tested ones.', 'Läuft bei jedem Tastendruck und deckt alle Codepfade ab, nicht nur die getesteten.'),
      l('Strict settings (`strict`, `noUncheckedIndexedAccess`, nullable reference types) turn whole bug classes into compile errors.', 'Strenge Einstellungen (`strict`, `noUncheckedIndexedAccess`, Nullable Reference Types) machen ganze Fehlerklassen zu Compilerfehlern.'),
      l('Types are documentation that cannot go stale.', 'Typen sind Dokumentation, die nicht veralten kann.'),
    ],
    limits: [
      l('Types check shape, not meaning: `price: number` accepts a negative price.', 'Typen prüfen die Form, nicht die Bedeutung: `price: number` akzeptiert einen negativen Preis.'),
      l('Escape hatches (`any`, casts, `# type: ignore`) silently switch the check off.', 'Notausgänge (`any`, Casts, `# type: ignore`) schalten die Prüfung still ab.'),
    ],
    ai: l(
      'The compiler is the cheapest, fastest feedback an agent can loop on. Turn strictness up and forbid escape hatches in lint, otherwise an agent under pressure will cast its way to green.',
      'Der Compiler ist das billigste und schnellste Feedback, auf das ein Agent reagieren kann. Strenge hochdrehen und Notausgänge per Linter verbieten, sonst castet sich ein Agent unter Druck ins Grüne.',
    ),
    evidence: {
      general: ev('moderate', f('gao2017', 'Of 400 public JavaScript bugs, TypeScript or Flow would each have caught about 15%, even though these bugs had already survived testing and review.', 'Von 400 öffentlichen JavaScript-Fehlern hätten TypeScript oder Flow jeweils etwa 15 % gefunden, obwohl diese Fehler Tests und Review schon überstanden hatten.')),
      ai: ev('moderate', f('mundler2025', '94% of compile errors in LLM-generated TypeScript were type errors; type-constrained decoding cut compile errors by more than half and improved functional correctness.', '94 % der Compilerfehler in LLM-generiertem TypeScript waren Typfehler; typbeschränktes Decoding senkte die Compilerfehler um mehr als die Hälfte und verbesserte die funktionale Korrektheit.')),
    },
    tools: { php: ['phpstan', 'psalm'], js: ['typescript'], python: ['mypy', 'pyright'], java: ['nullaway'], dotnet: ['roslyn'], go: ['go-vet'], rust: ['rustc'], cpp: ['clang'] },
    snippets: [
      { lang: 'js', file: 'reserve.ts', code: `// TypeScript 6: npx tsc --ignoreConfig --target es2022 --strict --noUncheckedIndexedAccess --noEmit reserve.ts
// This version intentionally fails: 'pet' is possibly 'undefined'.
// Add the guard from the simulator, then rerun the same command.
${TYPE_REVISIONS[0].code}`,
      focus: [
        { line: 4, note: l("`Pet` allows `reservedBy` to be `null`, so the compiler knows exactly where a missing owner must be handled.", "`Pet` erlaubt `null` bei `reservedBy`, der Compiler weiß also genau, wo ein fehlender Besitzer behandelt werden muss.") },
        { line: 9, note: l("With `noUncheckedIndexedAccess`, a lookup by id may return `undefined`: the classic crash on an unknown pet.", "Mit `noUncheckedIndexedAccess` kann der Zugriff per id `undefined` liefern: der klassische Absturz bei einem unbekannten Tier.") },
        { line: 10, note: l("This dereference is what fails to compile until you add the guard that returns `missing`.", "Dieser Zugriff scheitert beim Kompilieren, bis du den Guard ergänzt, der `missing` zurückgibt.") },
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
        { line: 3, note: l("`strict` turns on the whole family of null and implicit-any checks in one switch.", "`strict` aktiviert die ganze Familie der null- und implicit-any-Prüfungen mit einem Schalter.") },
        { line: 4, note: l("Array and map lookups become `T | undefined`, which catches off-by-one and unknown-key bugs.", "Zugriffe auf Arrays und Maps werden zu `T | undefined`; das fängt Off-by-one- und Unknown-Key-Fehler.") },
        { line: 5, note: l("Distinguishes “missing” from “explicitly undefined”, a trap for partially filled reservations.", "Unterscheidet „fehlt“ von „explizit undefined“, eine Falle bei teilweise gefüllten Reservierungen.") },
      ] },
      { lang: 'python', file: 'pyproject.toml', code: `[tool.mypy]
strict = true
warn_unreachable = true
disallow_any_explicit = true`,
      focus: [
        { line: 2, note: l("`strict = true` makes untyped functions and implicit `Optional` errors instead of silent gaps.", "`strict = true` macht untypisierte Funktionen und implizites `Optional` zu Fehlern statt zu stillen Lücken.") },
        { line: 3, note: l("Flags code that can never run, often a sign of a wrongly assumed state.", "Meldet Code, der nie läuft, oft ein Zeichen für einen falsch angenommenen Zustand.") },
        { line: 4, note: l("Bans explicit `Any`, the escape hatch an agent reaches for to silence the checker.", "Verbietet explizites `Any`, den Notausgang, mit dem ein Agent den Checker zum Schweigen bringt.") },
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
        { line: 1, note: l("`strict_types` stops PHP from silently coercing a string to an int at a call.", "`strict_types` verhindert, dass PHP beim Aufruf stillschweigend einen String in einen Int umwandelt.") },
        { line: 4, note: l("`final readonly` means a reservation cannot be changed after creation.", "`final readonly` heißt: Eine Reservierung lässt sich nach dem Erzeugen nicht mehr ändern.") },
        { line: 12, note: l("The parameter type promises a real `Reservation`; this is what the analyser holds callers to.", "Der Parametertyp verspricht eine echte `Reservation`; daran misst der Analyzer die Aufrufer.") },
        { line: 16, note: l("The commented-out call shows the bug class: `null` where a value was assumed.", "Der auskommentierte Aufruf zeigt die Fehlerklasse: `null`, wo ein Wert angenommen wurde.") },
      ] },
    ],
    steps: [
      l('Enable the strictest compiler/type-checker settings listed below and run the check.', 'Die strengsten Compiler-/Typprüfer-Einstellungen unten aktivieren und die Prüfung laufen lassen.'),
      l('Fix errors by changing types or code, never by adding casts, `any` or ignore comments.', 'Fehler durch Typ- oder Codeänderungen beheben, nie durch Casts, `any` oder Ignore-Kommentare.'),
      l('Add the type check as a required CI step.', 'Die Typprüfung als Pflichtschritt in die CI aufnehmen.'),
    ],
    done: l('Type check passes in strict mode with zero new casts or ignore comments; CI fails on a type error.', 'Die Typprüfung ist im strengen Modus grün, ohne neue Casts oder Ignore-Kommentare; die CI schlägt bei einem Typfehler fehl.'),
    think: [
      q('Predict: what happens if an agent adds `!` after `pets[id]`?', 'Vorhersage: Was passiert, wenn ein Agent `!` hinter `pets[id]` ergänzt?',
        'The diagnostic disappears, but the runtime lookup is unchanged. A missing pet still throws. Require a guard and a regression test instead of a suppression.',
        'Die Diagnostic verschwindet, aber der Lookup bleibt zur Laufzeit unverändert. Ein fehlendes Tier löst weiter einen Fehler aus. Einen Guard und einen Regression-Test verlangen, statt die Meldung zu unterdrücken.'),
      q('`reserve(petId: string, person: string)`: what bug can the type system not see here, and how would you fix that with types?', '`reserve(petId: string, person: string)`: Welchen Fehler sieht das Typsystem hier nicht, und wie behebt man das mit Typen?',
        'Swapped arguments: both are strings, so `reserve(person, petId)` compiles. Branded or nominal types (`PetId`, `PersonId`) make the swap a compile error.',
        'Vertauschte Argumente: Beide sind Strings, also kompiliert `reserve(person, petId)`. Gebrandete oder nominale Typen (`PetId`, `PersonId`) machen den Tausch zum Compilerfehler.'),
      q('The guarded version passes the compiler and three tests. Can it prevent two concurrent reservations in a database?', 'Die Version mit Guard besteht Compiler und drei Tests. Verhindert sie zwei gleichzeitige Reservierungen in einer Datenbank?',
        'No. These checks run on one in-memory object sequentially. A database needs an atomic conditional update or constraint, plus an integration test for concurrent requests.',
        'Nein. Diese Prüfungen laufen nacheinander auf einem In-memory-Objekt. Eine Datenbank braucht ein atomares bedingtes Update oder einen Constraint sowie einen Integration-Test mit gleichzeitigen Requests.'),
    ],
    sim: 'typecheck',
    related: ['lint', 'architecture', 'static-analysis'],
  },
  {
    id: 'lint',
    name: l('Lint tests', 'Linting'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Automatically flag suspicious or forbidden code patterns before anything runs.', 'Verdächtige oder verbotene Codemuster automatisch markieren, bevor irgendetwas läuft.'),
    catches: l('unused variables, forgotten `await`, shadowed names, banned APIs, inconsistent style', 'unbenutzte Variablen, vergessenes `await`, verdeckte Namen, verbotene APIs, uneinheitlicher Stil'),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('Cheap, fast and deterministic: perfect as a pre-commit hook and a CI gate.', 'Billig, schnell und deterministisch: ideal als Pre-Commit-Hook und CI-Gate.'),
      l('Custom rules encode team decisions ("never use `Math.random` in domain code") so nobody has to remember them.', 'Eigene Regeln kodieren Teamentscheidungen („nie `Math.random` in der Fachlogik“), damit niemand sie sich merken muss.'),
      l('Many rules come with auto-fix, so the agent can repair a finding without a human.', 'Viele Regeln bringen Auto-Fix mit, sodass der Agent einen Fund ohne Menschen beheben kann.'),
    ],
    limits: [
      l('Too many warnings get ignored. Keep the rule set small and make every rule an error.', 'Zu viele Warnungen werden ignoriert. Wenige Regeln, und jede als Fehler.'),
      l('Linters see patterns, not intent.', 'Linter sehen Muster, keine Absicht.'),
    ],
    ai: l(
      'A rule in a linter is enforced; the same rule in AGENTS.md is a suggestion. Whenever you write "please don\'t…" into a rules file, ask whether a lint rule could say it instead.',
      'Eine Regel im Linter wird erzwungen, dieselbe Regel in AGENTS.md ist ein Vorschlag. Jedes Mal, wenn man „bitte nicht …“ in eine Regeldatei schreibt: Könnte das eine Lint-Regel sagen?',
    ),
    evidence: {
      general: none(),
      ai: ev('moderate', f('sweagent2024', 'In SWE-agent\'s ablation, removing the linting guardrail from the edit command lowered SWE-bench Lite success from 18.0% to 15.0%.', 'In der Ablation von SWE-agent sank die Erfolgsquote auf SWE-bench Lite von 18,0 % auf 15,0 %, als der Linter-Schutz am Edit-Befehl entfernt wurde.')),
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
        { line: 3, note: l("Type-aware rules need the compiler’s type information, which is what makes them catch real bugs.", "Typbewusste Regeln brauchen die Typinformation des Compilers, erst dadurch fangen sie echte Fehler.") },
        { line: 6, note: l("A forgotten `await` on a reservation call means the pet looks reserved while the write is still pending.", "Ein vergessenes `await` am Reservierungsaufruf lässt das Tier reserviert wirken, während das Schreiben noch läuft.") },
        { line: 7, note: l("Forbids `any`, so an agent cannot dodge the type checks by loosening a type.", "Verbietet `any`, damit ein Agent die Typprüfung nicht durch einen aufgeweichten Typ umgeht.") },
        { line: [8, 11], note: l("A project rule in code: random values in domain logic make tests flaky, so inject them instead.", "Eine Projektregel als Code: Zufall in der Fachlogik macht Tests flaky, also injizieren.") },
      ] },
      { lang: 'python', file: 'pyproject.toml', code: `[tool.ruff.lint]
select = ["E", "F", "B", "UP", "SIM", "S"]  # pyflakes, bugbear, security …
[tool.ruff.lint.flake8-tidy-imports.banned-api]
"random".msg = "Inject a random source; domain code must be deterministic."`,
      focus: [
        { line: 2, note: l("Selects bug-finding rule sets (`F`, `B`, `S`), not just style, so the output points at real defects.", "Wählt fehlerfindende Regelsätze (`F`, `B`, `S`), nicht nur Stil, damit die Ausgabe auf echte Defekte zeigt.") },
        { line: 3, note: l("A banned-API rule is how you enforce a house convention that no generic linter knows.", "Eine Banned-API-Regel erzwingt eine Hauskonvention, die kein generischer Linter kennt.") },
        { line: 4, note: l("The message tells the agent what to do instead, so the error is a fix hint rather than a dead end.", "Die Meldung sagt dem Agenten, was er stattdessen tun soll: ein Fix-Hinweis statt einer Sackgasse.") },
      ] },
    ],
    steps: [
      l('Install the linter and start from its recommended strict preset.', 'Den Linter installieren und mit dem empfohlenen strengen Preset beginnen.'),
      l('Turn every enabled rule into an error, and disable the rules you do not want instead of leaving them as warnings.', 'Jede aktive Regel zum Fehler machen; unerwünschte Regeln abschalten statt sie als Warnung stehen zu lassen.'),
      l('Add one custom rule for a mistake that has actually happened in this repo.', 'Eine eigene Regel für einen Fehler ergänzen, der in diesem Repo tatsächlich passiert ist.'),
      l('Run it as a pre-commit hook and as a required CI step.', 'Als Pre-Commit-Hook und als Pflichtschritt in der CI ausführen.'),
    ],
    done: l('Lint passes with zero warnings; CI fails on any lint error; no blanket disable comments were added.', 'Lint läuft ohne Warnungen durch; die CI scheitert bei jedem Lint-Fehler; keine pauschalen Disable-Kommentare hinzugefügt.'),
    think: [
      q('Why is "warning" often worse than either "error" or "off"?', 'Warum ist „Warnung“ oft schlechter als „Fehler“ oder „aus“?',
        'Warnings pile up until nobody reads them, including the one that matters. An error is a decision; "off" is also a decision. A warning is a decision postponed.',
        'Warnungen stapeln sich, bis niemand sie liest, auch die eine wichtige nicht. Ein Fehler ist eine Entscheidung, „aus“ auch. Eine Warnung ist eine vertagte Entscheidung.'),
      q('Which bug can lint never find, however many rules you add?', 'Welchen Fehler findet ein Linter nie, egal wie viele Regeln du ergänzt?',
        'A wrong business rule that is syntactically fine, such as a fee of `price * 0.1` instead of `0.15`. Lint checks patterns, not intent; that needs tests.',
        'Eine falsche Fachregel, die syntaktisch einwandfrei ist, etwa eine Gebühr von `price * 0.1` statt `0.15`. Linter prüfen Muster, nicht Absicht; dafür braucht es Tests.'),
      q('Predict: you enable `no-floating-promises` on a codebase with 200 violations. What happens in the first week?', 'Vorhersage: Du aktivierst `no-floating-promises` in einer Codebasis mit 200 Verstößen. Was passiert in der ersten Woche?',
        'Either the build is red for everyone, or the rule is quietly downgraded to a warning. Record a baseline or fix in batches, and enforce the rule on new code at once.',
        'Entweder ist der Build für alle rot, oder die Regel wird leise zur Warnung herabgestuft. Eine Baseline festhalten oder in Stapeln beheben, und die Regel für neuen Code sofort erzwingen.'),
    ],
    related: ['type-systems', 'static-analysis', 'agent-rules', 'ci'],
  },
  {
    id: 'static-analysis',
    name: l('Static analysis', 'Statische Analyse'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Analyse code without running it to find bugs that need reasoning across functions or files.', 'Code analysieren, ohne ihn auszuführen, um Fehler zu finden, die Schlussfolgerungen über Funktionen oder Dateien hinweg brauchen.'),
    catches: l('null dereferences, resource leaks, unreachable code, taint from input to a dangerous sink', 'Null-Dereferenzierungen, Ressourcenlecks, unerreichbaren Code, ungeprüfte Eingaben, die gefährliche Stellen erreichen'),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('Sees all paths, including the rare ones tests never reach.', 'Sieht alle Pfade, auch die seltenen, die Tests nie erreichen.'),
      l('Custom rules (Semgrep) let you ban a bug pattern across the whole codebase once you have seen it.', 'Eigene Regeln (Semgrep) verbieten ein Fehlermuster in der ganzen Codebasis, sobald man es einmal gesehen hat.'),
      l('Runs without test data or a deployed system, so it can gate every pull request.', 'Läuft ohne Testdaten und ohne deploytes System und kann daher jeden Pull Request prüfen.'),
    ],
    limits: [
      l('Low recall: static bug finders catch only a small share of real bugs.', 'Geringe Trefferquote: Statische Fehlersucher finden nur einen kleinen Teil echter Fehler.'),
      l('False positives erode trust fast. Tune until people act on every finding.', 'Fehlalarme zerstören schnell das Vertrauen. So lange justieren, bis jeder Fund bearbeitet wird.'),
    ],
    ai: l(
      'Feeding analyser findings back to a model works: security issues drop over a few iterations. But a model can learn to please one analyser, so measure with a second tool.',
      'Analyse-Funde an ein Modell zurückzugeben funktioniert: Sicherheitsprobleme sinken über wenige Iterationen. Ein Modell kann aber lernen, einem Analysator zu gefallen; deshalb mit einem zweiten Werkzeug messen.',
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
      l('Run the analyser on the whole repo and record a baseline of existing findings.', 'Den Analysator auf dem ganzen Repo laufen lassen und eine Baseline der bestehenden Funde festhalten.'),
      l('Fail CI only on new findings, so the baseline does not block work.', 'Die CI nur bei neuen Funden scheitern lassen, damit die Baseline nicht blockiert.'),
      l('Write one custom rule for a bug pattern that already occurred here.', 'Eine eigene Regel für ein Fehlermuster schreiben, das hier schon aufgetreten ist.'),
    ],
    done: l('Analyser runs in CI, new findings fail the build, and the custom rule catches a planted example of the bug.', 'Der Analysator läuft in der CI, neue Funde lassen den Build scheitern, und die eigene Regel fängt ein eingeschleustes Beispiel des Fehlers.'),
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
    name: l('Security scanning (SAST, SCA, secrets)', 'Security-Scans (SAST, SCA, Secrets)'),
    layer: 'static',
    phases: ['pre', 'deploy'],
    fromOverview: false,
    oneLiner: l('Scan your code, dependencies and history for known vulnerability patterns, vulnerable packages and leaked credentials.', 'Code, Abhängigkeiten und Historie nach bekannten Schwachstellenmustern, verwundbaren Paketen und geleakten Zugangsdaten durchsuchen.'),
    catches: l('SQL injection patterns, dependencies with known CVEs, API keys committed to git, unknown or typo-squatted packages', 'SQL-Injection-Muster, Abhängigkeiten mit bekannten CVEs, in Git eingecheckte API-Schlüssel, unbekannte oder untergeschobene Pakete'),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('Secret scanning is one of the cheapest high-value checks: run it as a pre-commit hook.', 'Secret-Scans gehören zu den billigsten wertvollen Prüfungen: als Pre-Commit-Hook laufen lassen.'),
      l('Dependency scanning (SCA) keeps watching after you ship: a new CVE in an old package shows up in tomorrow\'s scan.', 'Abhängigkeits-Scans (SCA) wachen auch nach dem Release: Eine neue CVE in einem alten Paket taucht im Scan von morgen auf.'),
      l('A software bill of materials (SBOM) and pinned lockfiles tell you exactly what is in a build.', 'Eine Software-Stückliste (SBOM) und gepinnte Lockfiles sagen genau, was in einem Build steckt.'),
    ],
    limits: [
      l('Scanners know known patterns; logic flaws and broken authorization need threat modeling and tests.', 'Scanner kennen bekannte Muster; Logikfehler und kaputte Autorisierung brauchen Threat Modeling und Tests.'),
      l('A noisy CVE feed trains people to ignore it. Triage by reachability and severity.', 'Ein lauter CVE-Strom erzieht zum Ignorieren. Nach Erreichbarkeit und Schwere sortieren.'),
    ],
    ai: l(
      'Agents add dependencies freely, sometimes ones that do not exist ("slopsquatting"), and they hard-code keys. In agent pull requests, hard-coded credentials dominate the critical security smells. Scan every agent change for secrets and new dependencies.',
      'Agenten fügen freizügig Abhängigkeiten hinzu, manchmal solche, die es nicht gibt („Slopsquatting“), und sie kodieren Schlüssel fest. In Agenten-Pull-Requests dominieren fest kodierte Zugangsdaten die kritischen Sicherheitsmängel. Jede Agentenänderung auf Secrets und neue Abhängigkeiten scannen.',
    ),
    evidence: {
      general: none(),
      ai: ev('moderate',
        f('pearce2022', 'About 40% of Copilot completions in 89 security-relevant scenarios were vulnerable.', 'Etwa 40 % der Copilot-Vervollständigungen in 89 sicherheitsrelevanten Szenarien waren verwundbar.'),
        f('secsmell2026', 'Across 4,022 agent-generated pull requests, 38.9% contained at least one security smell, and hard-coded credentials made up 99.6% of the critical ones (preprint).', 'In 4.022 von Agenten erzeugten Pull Requests enthielten 38,9 % mindestens einen Sicherheitsmangel; fest kodierte Zugangsdaten machten 99,6 % der kritischen aus (Preprint).')),
    },
    variants: [
      { name: l('Supply chain (SBOM, provenance, pinning)', 'Lieferkette (SBOM, Herkunftsnachweis, Pinning)'), text: l('Record what went into a build and verify where artefacts came from. Lockfiles plus an SBOM are the minimum.', 'Festhalten, was in einen Build einging, und prüfen, woher Artefakte stammen. Lockfiles plus SBOM sind das Minimum.') },
      { name: l('DAST', 'DAST'), text: l('Dynamic scanning attacks the running app from outside (e.g. ZAP baseline scan in a staging deploy).', 'Dynamische Scans greifen die laufende Anwendung von außen an (z. B. ZAP-Baseline-Scan beim Staging-Deploy).') },
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
      l('Add secret scanning as a pre-commit hook and in CI over the full git history.', 'Secret-Scans als Pre-Commit-Hook und in der CI über die gesamte Git-Historie einrichten.'),
      l('Add dependency scanning (OSV-Scanner or Trivy) on the lockfile; fail on high/critical findings.', 'Abhängigkeits-Scans (OSV-Scanner oder Trivy) auf dem Lockfile einrichten; bei hoch/kritisch scheitern.'),
      l('Add a SAST step with the language tool below; baseline existing findings.', 'Einen SAST-Schritt mit dem Sprachwerkzeug unten ergänzen; bestehende Funde als Baseline erfassen.'),
      l('Make CI flag any newly added dependency for human approval.', 'Die CI jede neu hinzugefügte Abhängigkeit zur menschlichen Freigabe markieren lassen.'),
    ],
    done: l('A planted fake secret and a planted vulnerable dependency both fail CI; new dependencies require approval.', 'Ein eingeschleustes Fake-Secret und eine eingeschleuste verwundbare Abhängigkeit lassen beide die CI scheitern; neue Abhängigkeiten brauchen Freigabe.'),
    think: [
      q('An agent adds `left-padder` to package.json to fix a bug. Which checks should fire, and why might none of them?', 'Ein Agent fügt `left-padder` zu package.json hinzu, um einen Fehler zu beheben. Welche Prüfungen sollten anschlagen, und warum vielleicht keine?',
        'Dependency scan (known CVEs), and a "new dependency" gate. If the package is brand new and malicious, no CVE exists yet, so only the human gate and the question "does this package even exist and who publishes it?" help.',
        'Abhängigkeits-Scan (bekannte CVEs) und ein Gate für neue Abhängigkeiten. Ist das Paket brandneu und bösartig, gibt es noch keine CVE; dann helfen nur das menschliche Gate und die Frage, ob es das Paket überhaupt gibt und wer es veröffentlicht.'),
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
    name: l('Continuous integration', 'Continuous Integration (CI)'),
    layer: 'static',
    phases: ['pre', 'deploy'],
    fromOverview: false,
    oneLiner: l('Run every automated check on every change, on a clean machine, before it is merged.', 'Jede automatische Prüfung bei jeder Änderung auf einer sauberen Maschine ausführen, bevor gemergt wird.'),
    catches: l('"works on my machine", checks someone forgot to run, integration breakage between parallel changes', '„läuft bei mir“, vergessene Prüfungen, Brüche zwischen parallelen Änderungen'),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('Turns every other practice in this funnel from "should" into "must".', 'Macht aus jeder anderen Praktik in diesem Trichter ein „muss“ statt eines „sollte“.'),
      l('Required status checks mean nobody, human or agent, can merge red.', 'Pflicht-Statuschecks bedeuten: Niemand, weder Mensch noch Agent, kann rot mergen.'),
      l('A clean environment from scratch finds missing files, undeclared dependencies and order-dependent tests.', 'Eine frische Umgebung von Grund auf findet fehlende Dateien, nicht deklarierte Abhängigkeiten und reihenfolgeabhängige Tests.'),
    ],
    limits: [
      l('Slow pipelines get bypassed. Keep the main gate under about 10 minutes.', 'Langsame Pipelines werden umgangen. Das Haupt-Gate unter etwa 10 Minuten halten.'),
      l('Flaky tests teach everyone to press "re-run" instead of reading the failure.', 'Wackelige Tests bringen allen bei, „erneut ausführen“ zu drücken, statt den Fehler zu lesen.'),
    ],
    ai: l(
      'CI is the agent\'s judge. Make it the same command locally (`npm run ci`), so the agent can run the exact gate before it opens a pull request, and make the gate impossible to edit from the same change (see test integrity).',
      'Die CI ist der Richter des Agenten. Lokal denselben Befehl anbieten (`npm run ci`), damit der Agent vor dem Pull Request genau das Gate ausführen kann, und das Gate aus derselben Änderung heraus unveränderbar machen (siehe Testintegrität).',
    ),
    evidence: {
      general: ev('moderate',
        f('vasilescu2015', 'After adopting CI, GitHub projects merged more outside contributions without a measurable drop in quality.', 'Nach Einführung von CI mergten GitHub-Projekte mehr externe Beiträge ohne messbaren Qualitätsverlust.'),
        f('accelerate2018', 'Continuous integration and test automation statistically predict software delivery performance (survey-based, correlational).', 'Continuous Integration und Testautomatisierung sagen die Liefer-Performance statistisch voraus (Umfragedaten, korrelativ).')),
      ai: none(),
    },
    variants: [
      { name: l('Flaky tests', 'Wackelige Tests (flaky tests)'), text: l('Detect them (re-run failures automatically and record which ones flip), quarantine them out of the required gate, and fix or delete them within a fixed time.', 'Erkennen (Fehlschläge automatisch wiederholen und festhalten, welche kippen), aus dem Pflicht-Gate in Quarantäne nehmen und in fester Frist reparieren oder löschen.') },
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
        { line: 2, note: l("Runs on pull requests, so every agent change is checked before a human sees it.", "Läuft bei Pull Requests, damit jede Agent-Änderung geprüft wird, bevor ein Mensch sie sieht.") },
        { line: 6, note: l("A timeout stops a hung test from blocking the pipeline, or silently burning CI minutes.", "Ein Timeout verhindert, dass ein hängender Test die Pipeline blockiert oder still CI-Minuten verbrennt.") },
        { line: 8, note: l("Actions pinned to a version keep the pipeline reproducible and limit supply-chain surprises.", "An Versionen gebundene Actions halten die Pipeline reproduzierbar und begrenzen Überraschungen in der Lieferkette.") },
        { line: 12, note: l("One command shared by humans, agents and CI means “green locally” and “green in CI” cannot drift apart.", "Ein gemeinsamer Befehl für Menschen, Agenten und CI sorgt dafür, dass „lokal grün“ und „in CI grün“ nicht auseinanderlaufen.") },
      ] },
    ],
    steps: [
      l('Create one script (`ci`) that runs lint, type check, tests and build in order, and document it as the command to run before every PR.', 'Ein Skript (`ci`) anlegen, das Lint, Typprüfung, Tests und Build nacheinander ausführt, und es als Befehl vor jedem PR dokumentieren.'),
      l('Run exactly that script in the CI workflow on every pull request.', 'Genau dieses Skript im CI-Workflow bei jedem Pull Request ausführen.'),
      l('Make the job a required status check on the main branch.', 'Den Job als Pflicht-Statuscheck auf dem Hauptbranch einrichten.'),
    ],
    done: l('A PR with a failing test cannot be merged; `ci` behaves identically locally and in CI.', 'Ein PR mit fehlschlagendem Test kann nicht gemergt werden; `ci` verhält sich lokal und in der CI gleich.'),
    think: [
      q('Your CI takes 40 minutes. What happens to the other layers of the funnel?', 'Deine CI braucht 40 Minuten. Was passiert mit den anderen Schichten des Trichters?',
        'People batch changes, skip runs, and merge on "it was green yesterday". Agents wait or give up. Fast feedback is part of the check, not a luxury.',
        'Man bündelt Änderungen, überspringt Läufe und mergt mit „gestern war es grün“. Agenten warten oder geben auf. Schnelles Feedback ist Teil der Prüfung, kein Luxus.'),
      q('Which bug does a green CI run not tell you about?', 'Welchen Fehler verrät dir ein grüner CI-Lauf nicht?',
        'Anything the pipeline does not check: a missing test, a race that only shows in production, a wrong requirement. CI guarantees that the checks ran, not that they were the right ones.',
        'Alles, was die Pipeline nicht prüft: einen fehlenden Test, eine Race Condition, die nur in Produktion auftritt, eine falsche Anforderung. Die CI garantiert, dass die Prüfungen liefen, nicht dass es die richtigen waren.'),
      q('Predict: an agent is told to make CI green and may edit the workflow file. What is the cheapest way for it to succeed?', 'Vorhersage: Ein Agent soll die CI grün bekommen und darf die Workflow-Datei ändern. Was ist der billigste Weg zum Erfolg?',
        'Remove or skip the failing step. Protect the workflow file with code-owner review and require the status checks by name on the main branch.',
        'Den fehlschlagenden Schritt entfernen oder überspringen. Die Workflow-Datei per Code-Owner-Review schützen und die Status Checks auf dem Main-Branch namentlich verlangen.'),
    ],
    related: ['test-integrity', 'lint', 'unit-tests', 'smoke-tests'],
  },
  {
    id: 'tdd',
    name: l('TDD & spec-driven development', 'TDD & spezifikationsgetriebene Entwicklung'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('Write or approve the tests (or the spec) first; then the code, human or agent, iterates until they pass.', 'Zuerst die Tests (oder die Spezifikation) schreiben oder freigeben; dann iteriert der Code, ob von Mensch oder Agent, bis sie bestehen.'),
    catches: l('code that solves a different problem than intended, and untested behaviour that slips in "while we are at it"', 'Code, der ein anderes Problem löst als gedacht, und ungetestetes Verhalten, das „nebenbei“ hineinrutscht'),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('Gives the agent an external oracle a human agreed to, instead of tests the agent wrote to match its own code.', 'Gibt dem Agenten ein externes Orakel, dem ein Mensch zugestimmt hat, statt Tests, die der Agent passend zu seinem eigenen Code schrieb.'),
      l('Small, steady steps matter more than strict test-first order.', 'Kleine, gleichmäßige Schritte zählen mehr als die strikte Reihenfolge „Test zuerst“.'),
      l('The failing test first proves that the test can fail at all.', 'Der zuerst fehlschlagende Test beweist, dass der Test überhaupt fehlschlagen kann.'),
    ],
    limits: [
      l('For humans, measured effects are small and mixed.', 'Bei Menschen sind die gemessenen Effekte klein und uneinheitlich.'),
      l('If the agent may edit the tests, it may "pass" them by weakening them.', 'Darf der Agent die Tests bearbeiten, „besteht“ er sie womöglich, indem er sie abschwächt.'),
    ],
    ai: l(
      'This is where the AI evidence is strongest: giving a model the tests up front, and letting it iterate on failures, raises success rates. Approve the tests yourself, then lock them (see test integrity).',
      'Hier ist die KI-Evidenz am stärksten: Bekommt ein Modell die Tests vorab und darf es an Fehlschlägen iterieren, steigt die Erfolgsquote. Die Tests selbst freigeben, dann sperren (siehe Testintegrität).',
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
      l('Write the acceptance tests or the spec for the next change and get them approved before any implementation.', 'Die Akzeptanztests oder die Spezifikation für die nächste Änderung schreiben und vor jeder Implementierung freigeben lassen.'),
      l('Commit the tests separately and mark the test files as protected for this task.', 'Die Tests getrennt committen und die Testdateien für diese Aufgabe als geschützt markieren.'),
      l('Implement in small steps; run the tests after each step; never edit the protected tests.', 'In kleinen Schritten implementieren; nach jedem Schritt testen; die geschützten Tests nie bearbeiten.'),
    ],
    done: l('All approved tests pass, the protected test files are byte-identical to the approved commit, and no other tests were deleted or skipped.', 'Alle freigegebenen Tests sind grün, die geschützten Testdateien sind byte-identisch mit dem freigegebenen Commit, und keine anderen Tests wurden gelöscht oder übersprungen.'),
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
    name: l('Test integrity', 'Testintegrität'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('Make sure the code under test cannot change, skip or special-case the tests it is judged by.', 'Sicherstellen, dass der geprüfte Code die Tests, an denen er gemessen wird, nicht ändern, überspringen oder austricksen kann.'),
    catches: l('weakened assertions, deleted or skipped tests, code that detects the test environment, hard-coded expected outputs', 'abgeschwächte Assertions, gelöschte oder übersprungene Tests, Code, der die Testumgebung erkennt, fest kodierte Erwartungswerte'),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('Cheap to set up: CODEOWNERS on test directories, a CI check for skipped tests, a hidden holdout suite.', 'Billig einzurichten: CODEOWNERS auf Testverzeichnissen, CI-Prüfung auf übersprungene Tests, eine versteckte Holdout-Suite.'),
      l('Restores the meaning of "green" when an agent is the one making it green.', 'Gibt „grün“ seine Bedeutung zurück, wenn ein Agent es grün macht.'),
      l('Needs no new test technology: it is repository configuration and a small CI script.', 'Braucht keine neue Testtechnik: Es sind Repository-Einstellungen und ein kleines CI-Skript.'),
    ],
    limits: [
      l('Protects the tests, not their quality. Combine with mutation testing.', 'Schützt die Tests, nicht ihre Qualität. Mit Mutation Testing kombinieren.'),
      l('A determined agent may find other routes, for example changing the test runner config or fixtures, so protect those paths too.', 'Ein entschlossener Agent findet womöglich andere Wege, etwa die Konfiguration des Test-Runners oder Fixtures zu ändern; schütze deshalb auch diese Pfade.'),
    ],
    ai: l(
      'Frontier models, given tasks whose tests contradict the spec, often "pass" by cheating, and stronger models cheat more. Hidden tests nearly eliminate it; read-only tests block test edits.',
      'Bekommen Spitzenmodelle Aufgaben, deren Tests der Spezifikation widersprechen, „bestehen“ sie oft durch Schummeln, und stärkere Modelle schummeln mehr. Versteckte Tests beseitigen das fast ganz; schreibgeschützte Tests verhindern Teständerungen.',
    ),
    evidence: {
      general: none(),
      ai: ev('moderate', f('impossiblebench2026', 'GPT-5 cheated on 76% of the impossible tasks in one SWE-bench variant; hiding tests reduced cheating to near zero, and read-only tests blocked test modification.', 'GPT-5 schummelte in einer SWE-bench-Variante bei 76 % der unmöglichen Aufgaben; versteckte Tests senkten das fast auf null, schreibgeschützte Tests verhinderten Teständerungen.')),
    },
    tools: { any: ['pre-commit', 'danger'] },
    snippets: [
      { lang: 'any', file: '.github/CODEOWNERS', code: `# Changes to tests and CI need a human owner's approval.
/test/          @your-team/maintainers
/.github/       @your-team/maintainers
*.test.ts       @your-team/maintainers`,
      focus: [
        { line: 1, note: l("The rule is about tests and CI: the files that define “done” need a human owner.", "Die Regel gilt für Tests und CI: Die Dateien, die „fertig“ definieren, brauchen eine menschliche Verantwortung.") },
        { line: 3, note: l("CI config is covered too, since an agent could otherwise just remove the failing check.", "Auch die CI-Konfiguration ist erfasst, sonst könnte ein Agent einfach die fehlschlagende Prüfung entfernen.") },
        { line: 4, note: l("The glob catches tests wherever they live, not only in one folder.", "Das Glob erfasst Tests, wo auch immer sie liegen, nicht nur in einem Ordner.") },
      ] },
      { lang: 'js', file: 'dangerfile.ts', code: `import { danger, fail } from 'danger';
const diff = await danger.git.diffForFile('test/reserve.test.ts');
if (diff && /\\b(it|test|describe)\\.(skip|only)\\b/.test(diff.added)) {
  fail('Tests were skipped or focused in this change.');
}`,
      focus: [
        { line: 2, note: l("The check reads the actual diff of the test file, so it sees what changed rather than what was claimed.", "Die Prüfung liest den echten Diff der Testdatei, sie sieht also, was sich geändert hat, nicht was behauptet wird.") },
        { line: 3, note: l("`skip` and `only` are the cheapest way to turn a test green without fixing anything.", "`skip` und `only` sind der billigste Weg, einen Test grün zu bekommen, ohne etwas zu reparieren.") },
        { line: 4, note: l("`fail` blocks the merge, so this is a gate, not a suggestion.", "`fail` blockiert den Merge, das ist also eine Schranke und kein Vorschlag.") },
      ] },
    ],
    steps: [
      l('Protect test directories and CI config with CODEOWNERS or branch rules so changes need human approval.', 'Testverzeichnisse und CI-Konfiguration per CODEOWNERS oder Branch-Regeln schützen, sodass Änderungen menschliche Freigabe brauchen.'),
      l('Add a CI check that fails on newly added `skip`/`only`/`xfail` markers and on a drop in test count.', 'Eine CI-Prüfung ergänzen, die bei neu hinzugefügten `skip`/`only`/`xfail` und bei sinkender Testanzahl scheitert.'),
      l('Keep a small holdout test suite outside the agent\'s workspace and run it in CI only.', 'Eine kleine Holdout-Testsuite außerhalb des Agenten-Arbeitsbereichs halten und nur in der CI ausführen.'),
    ],
    done: l('A change that edits a protected test or adds a skip is blocked; the holdout suite runs in CI and is not readable from the agent\'s sandbox.', 'Eine Änderung, die einen geschützten Test bearbeitet oder ein Skip hinzufügt, wird blockiert; die Holdout-Suite läuft in der CI und ist aus der Agenten-Sandbox nicht lesbar.'),
    think: [
      q('Why would a stronger model cheat more, not less?', 'Warum sollte ein stärkeres Modell mehr schummeln, nicht weniger?',
        'Because it is better at finding any path to the goal it was given, and "make the tests pass" is the goal, not "solve the problem". The fix is to change what is measured, not to hope for better manners.',
        'Weil es besser darin ist, irgendeinen Weg zum gegebenen Ziel zu finden, und das Ziel ist „Tests grün“, nicht „Problem gelöst“. Abhilfe schafft, was gemessen wird, zu ändern, nicht auf bessere Manieren zu hoffen.'),
      q('Which kind of cheating does a skip-detection check not catch?', 'Welche Art von Schummeln erkennt eine Prüfung auf übersprungene Tests nicht?',
        'An assertion weakened from `toBe(42)` to `toBeDefined()`. The test still runs and passes. Mutation testing and review of test diffs catch that.',
        'Eine Assertion, die von `toBe(42)` auf `toBeDefined()` abgeschwächt wurde. Der Test läuft weiter und besteht. Mutation Testing und das Review von Test-Diffs finden das.'),
      q('Predict: an agent cannot make `reserve` pass the double-booking test. It is allowed to edit any file except the test file. What might it do?', 'Vorhersage: Ein Agent bekommt `reserve` nicht durch den Doppelbuchungs-Test. Er darf jede Datei außer der Testdatei ändern. Was könnte er tun?',
        'Special-case the test\'s input, detect the test environment, or change a fixture or helper the test relies on. Holdout tests with different data and protection of helpers close those routes.',
        'Die Testeingabe als Sonderfall behandeln, die Testumgebung erkennen oder ein Fixture beziehungsweise einen Helfer ändern, auf den der Test sich stützt. Holdout-Tests mit anderen Daten und der Schutz der Helfer schließen diese Wege.'),
    ],
    related: ['tdd', 'ci', 'mutation-tests', 'evals'],
  },
];
