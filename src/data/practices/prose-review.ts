import type { Practice } from '../types';
import { ev, f, l, none, q } from './_h';

export const proseReview: Practice[] = [
  {
    id: 'agent-rules',
    domain: { parts: ['agent', 'domain'], what: l('The petstore AGENTS.md gives the command for the checks, the rules for modules and the unit for money values.', 'Die AGENTS.md des Petstores nennt den Prüfbefehl, die Modulregeln und Cent als Einheit für Geldbeträge.') },
    viz: { kind: 'process', mode: 'agent-rules' },
    name: l('Rules, skills & AGENTS.md', 'Regeln, Skills & AGENTS.md'),
    layer: 'prose',
    phases: ['pre'],
    fromOverview: false,
    core: true,
    oneLiner: l('A rules file gives people and coding agents the commands and rules for work in a repository.', 'Eine Datei wie AGENTS.md enthält Befehle und Regeln für Menschen und Coding-Agenten, die im Repository arbeiten.'),
    catches: l('Errors that people or coding agents can prevent when they obey the written rules.', 'Fehler, die Menschen oder Coding-Agenten durch Befolgen der Regeln vermeiden können.'),
    intro: l(
      'A coding agent can start a task with no information about the repository. AGENTS.md supplies the command for the checks and the primary project rules. The file depends on the coding agent to obey the rules.',
      'Ein Coding-Agent kann eine Aufgabe ohne Informationen zum Repository beginnen. AGENTS.md nennt die Befehle für die Checks und die wichtigsten Projektregeln. Der Coding-Agent muss die Regeln befolgen.',
    ),
    cost: 1,
    feedback: 'days',
    worth: [
      l('The file can give information that tools cannot check, such as design decisions and the structure of the repository.', 'Die Datei kann Informationen geben, die kein Tool prüfen kann, etwa Designentscheidungen und die Struktur des Repositorys.'),
      l('Short, specific rules are easier to use.', 'Kurze, konkrete Regeln lassen sich leichter anwenden.'),
      l('A coding agent can read the file at the start of each task. The file can give the conditions that make a task complete.', 'Ein Coding-Agent kann die Datei zu Beginn jeder Aufgabe lesen. Sie kann festlegen, wann eine Aufgabe fertig ist.'),
    ],
    limits: [
      l('Use a lint rule, type, test or hook for each written rule that a tool can check.', 'Nutze für jede schriftliche Regel, die ein Tool prüfen kann, eine Lint-Regel, einen Typ, einen Test oder einen Hook.'),
      l('Long rules files increase token use on each task. A longer file can increase costs without an increase in task success.', 'Lange Regeldateien erhöhen den Token-Verbrauch pro Aufgabe. Das kann Kosten erhöhen, ohne die Erfolgsquote zu verbessern.'),
    ],
    ai: l(
      'One study found that context files increased inference cost by more than 20%. The files did not increase task success. Keep AGENTS.md short. Use evals to measure the effect of changes.',
      'In einer Studie erhöhten Kontextdateien die Inference-Kosten um mehr als 20 %. Die Erfolgsquote stieg nicht. Halte AGENTS.md kurz. Miss die Wirkung von Änderungen mit Evals.',
    ),
    evidence: {
      general: none(),
      ai: ev('weak',
        f('gloaguen2026', 'The study compared generated and human-written context files across several agents and models. The files did not increase task success. In some cases, task success decreased slightly. Inference cost increased by more than 20%.', 'Die Studie verglich Kontextdateien für mehrere Coding-Agenten und Modelle. Generierte und manuell geschriebene Dateien erhöhten die Erfolgsquote nicht. In manchen Fällen sank sie leicht. Die Inference-Kosten stiegen um mehr als 20 %.'),
        f('lulla2026', 'The preprint reports results for 10 repositories. With AGENTS.md, median agent runtime decreased by 28.6%, and median output tokens decreased by 16.6%. Task completion was comparable.', 'In 10 Repositories senkte AGENTS.md die mittlere Laufzeit der Agenten um 28,6 % und die Ausgabetokens um 16,6 %, bei vergleichbarer Aufgabenerfüllung (Preprint).')),
    },
    variants: [{ name: l('Sandboxing (guardrail, not verification)', 'Sandboxing (Leitplanke, keine Verifikation)'), text: l('Run coding agents in containers or virtual machines. Limit network access, file access and access to credentials. These limits can decrease damage from incorrect actions or prompt injection. The agents can run tests within these limits.', 'Führe Coding-Agenten in Containern oder virtuellen Maschinen aus. Begrenze den Netzwerkzugriff, den Dateizugriff und den Zugriff auf Zugangsdaten. Diese Grenzen können die Folgen falscher Aktionen oder einer Prompt Injection verringern.') }],
    tools: { any: ['agents-md', 'spec-kit', 'promptfoo'] },
    snippets: [{ lang: 'any', file: 'AGENTS.md',
      enforcedBy: l('Not enforced by any tool: coding agents read `AGENTS.md` as prompt instructions. Enforcement comes only from the tools it points to (such as `npm run ci`, linters, type checkers and architecture tests).', 'Wird von keinem Tool erzwungen: Coding-Agenten lesen `AGENTS.md` als Prompt-Anweisung. Durchgesetzt werden nur die darin genannten Tools (wie `npm run ci`, Linter, Type Checker und Architecture Tests).'),
      code: `# Petstore

## Verify before you finish
- \`npm run ci\` must pass (lint, types, tests, build). Do not skip or edit tests in test/.
- Domain logic lives in src/domain and must not import from src/ui or server/.

## Things a tool cannot tell you
- Prices are integers in cents. Never use floats for money.
- A pet can be reserved by one person only; the server is the source of truth.`, focus: [{ line: 4, note: l('This line gives the command that the coding agent must run before it completes the task.', 'Diese Zeile nennt den Befehl, der „fertig“ beweist: das eine, was ein Agent vor dem Aufhören ausführen muss.') }, { line: 5, note: l('This line gives a rule for module imports. A lint rule for imports can enforce the same rule.', 'Eine Architekturregel, die ein Agent nicht erraten kann; idealerweise in einen Lint-Check für Importgrenzen verschieben.') }, { line: [8,9], note: l('The file gives rules that tools cannot check. Use automatic checks for the other rules.', 'Fakten, die kein Werkzeug prüfen kann, gehören hierher; alles, was ein Werkzeug erzwingen könnte, sollte stattdessen eine Prüfung sein.') }] }],
    steps: [
      l('Write a short AGENTS.md. Include the command for the checks, the project structure and three to five facts that tools cannot check.', 'Schreibe eine kurze AGENTS.md. Nenne den Prüfbefehl, die Projektstruktur und drei bis fünf Fakten, die ein Tool nicht prüfen kann.'),
      l('Examine each rule to see if a tool can check it. Move each rule that a tool can check into lint, types, tests or CI. Remove those rules from AGENTS.md.', 'Prüfe für jede Regel, ob ein Tool sie prüfen kann. Überführe diese Regeln in Lint, Typen, Tests oder CI. Entferne sie aus AGENTS.md.'),
      l('Run a small set of evals on typical tasks with the change. Run the same evals without the change. Compare the results.', 'Führe dieselben Evals mit und ohne Änderung aus. Vergleiche die Ergebnisse.'),
    ],
    done: l('AGENTS.md has approximately 50 lines or fewer. It gives the command for the checks. All its rules are for conditions that tools cannot check.', 'AGENTS.md hat höchstens ungefähr 50 Zeilen. Die Datei nennt den Prüfbefehl. Sie enthält Regeln, die ein Tool nicht prüfen kann.'),
    think: [
      q('AGENTS.md tells coding agents to use integers for money. How can you check this rule automatically?', 'Deine AGENTS.md sagt „für Geld immer Ganzzahlen verwenden“. Was ist ein billigerer, stärkerer Weg, das zu sagen?',
        'Use a type such as `type Cents = number & { __brand: "cents" }`. Where the type is insufficient, use a lint rule to prevent floating-point arithmetic on price fields. The automatic check applies to each change.',
        'Ein Typ (`type Cents = number & { __brand: "cents" }`) oder eine Lint-Regel, die Fließkomma-Arithmetik auf Preisfeldern verbietet. Dann wird es bei jeder Änderung erzwungen, für jeden Agenten und Menschen.'),
      q('Why are written rules below formal verification in the funnel?', 'Warum steht „Prosa“ so weit unten im Trichter, unter formaler Verifikation?',
        'Written rules depend on people and coding agents to obey them. Checks in the earlier layers run automatically or show that a property is true.',
        'Weil sie die unzuverlässigste Prüfung ist: billig zu schreiben, aber nur mit Wahrscheinlichkeit befolgt und nicht automatisch prüfbar. Alles darüber läuft oder beweist.'),
      q('After an incorrect pull request, you add 30 rules to AGENTS.md. What effect can these rules have on later tasks?', 'Vorhersage: Du ergänzt nach einem schlechten Pull Request 30 neue Regeln in der AGENTS.md. Was kann mit den nächsten Aufgaben passieren?',
        'A long file can make important rules difficult to find. Inference cost can increase without an increase in task success. Measure the effect with an eval. Use automatic checks for rules that a tool can check. Add a written rule only if the same problem occurs in two or more changes and a diff shows the problem.',
        'Wichtige Regeln gehen zwischen den anderen unter, die Kosten steigen, der Erfolg nicht unbedingt. Mit einer Eval messen; Regeln wo möglich durch Prüfungen ersetzen. Ein Problem, das die Prüfungen übersehen haben, nur dann zur Regel machen, wenn es in mindestens zwei Änderungen auftritt und im Diff sichtbar ist.'),
    ],
    related: ['evals', 'lint', 'test-integrity', 'architecture'],
  },
  {
    id: 'evals',
    domain: { parts: ['agent'], what: l('Twelve petstore tasks run before and after a change to AGENTS.md.', 'Zwölf Petstore-Aufgaben laufen vor und nach einer Änderung an AGENTS.md.') },
    viz: { kind: 'process', mode: 'evals' },
    name: l('Evals for your agent setup', 'Evals für das Agenten-Setup'),
    layer: 'prose',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('An evaluation (eval) runs a fixed set of tasks to measure the performance of a coding agent setup.', 'Ein Eval misst die Leistung eines Coding-Agenten mit einer festen Auswahl von Aufgaben.'),
    catches: l('changes to AGENTS.md, prompts or models that make results worse, and "improvements" that only feel better', 'Änderungen an Regeln, Prompts oder Modellen, nach denen der Coding-Agent weniger Aufgaben löst.'),
    intro: l(
      'New rules in AGENTS.md can change the results that a coding agent gives. An eval uses the same tasks with both versions of the file. Compare how many tasks each version completes.',
      'Neue Regeln in AGENTS.md können die Ergebnisse eines Coding-Agenten ändern. Ein Eval verwendet mit beiden Dateiversionen dieselben Aufgaben. Vergleiche, wie viele Aufgaben der Coding-Agent mit jeder Version löst.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('An eval gives measurements for changes to rules files or models.', 'Macht aus Meinungen über Regeldateien und Modelle Zahlen.'),
      l('A small set of past tasks can give a baseline.', 'Ein Dutzend echter Aufgaben aus der eigenen Historie ist ein brauchbarer Anfang.'),
      l('An eval can compare models and setups on work from your own project.', 'Erlaubt den Vergleich von Modellen und Setups auf deinen eigenen Aufgaben statt anhand öffentlicher Benchmark-Zahlen.'),
    ],
    limits: [
      l('A test result can overestimate how often a maintainer would accept the change.', 'Nur testbasierte Bewertung überschätzt die Qualität: Tests bestehen ist nicht dasselbe wie mergebar.'),
      l('Small eval sets can give variable results. Run the same set several times.', 'Kleine Eval-Sätze sind verrauscht; mehrfach laufen lassen.'),
    ],
    ai: l(
      'Use evals to compare coding agent setups. Grade the results with tests, comparisons with a reference fix, a rubric or a review of a sample.',
      'Vergleiche Agent-Setups mit Evals. Bewerte die Ergebnisse mit Tests, Referenzlösungen, einer Checkliste oder einem Review einer Stichprobe.',
    ),
    evidence: {
      general: none(),
      ai: ev('moderate',
        f('metr2026', 'Maintainers would merge only about half of 296 test-passing agent PRs; their verdicts ran about 24 points below the automated grader.', 'Maintainer würden nur etwa die Hälfte von 296 testbestehenden Agenten-PRs mergen; ihr Urteil lag etwa 24 Punkte unter dem automatischen Bewerter.'),
        f('patchdiff2026', 'Test-based evaluation overstated agent resolution rates by about 6.2 points because 29.6% of passing patches behaved differently from the reference.', 'Testbasierte Bewertung überschätzte die Lösungsquote der Agenten um etwa 6,2 Punkte, weil sich 29,6 % der bestehenden Patches anders verhielten als die Referenz.')),
    },
    variants: [
      { name: l('Evals for your checks', 'Evals für die eigenen Prüfungen'), text: l('Measure the checks as well as the coding agent. Compare reverted or rejected changes with accepted changes of similar size. Measure recall for the initial findings, verified findings and final results. Use separate data for tuning and testing.', 'Miss die Leistung der Checks. Vergleiche zurückgenommene oder abgelehnte Änderungen mit akzeptierten Änderungen ähnlicher Größe. Miss den Recall der ersten Findings, der geprüften Findings und der abschließenden Ergebnisse. Verwende getrennte Daten für Tuning und Tests.') },
    ],
    tools: { any: ['inspect-ai', 'promptfoo', 'swe-bench'] },
    snippets: [{ lang: "any", file: "agent-eval.md",
      description: l("Run the same set of tasks on clean checkouts with each setup. Use the same holdout checks. Record successes and failures.",
        "Führe dieselben Aufgaben mit jedem Setup auf einem frischen Checkout aus. Verwende dieselben Holdout-Tests. Erfasse bestandene und fehlgeschlagene Aufgaben."),
      code: `# Task: prevent a second reservation
Input: a checkout at a recorded commit, plus the requirement.
Expected: first reservation succeeds; second fails; first owner stays.

Holdout checks (outside the agent workspace):
- unknown pet is rejected
- competing requests leave one owner
- approved test files are unchanged

Record per run:
setup/model version, task commit, checks passed/total,
unauthorized test edits, elapsed time, tool calls, cost.
Repeat with the same budget; keep individual results.`, focus: [{ line: 3, note: l('A concrete expected outcome makes success checkable instead of arguable.', 'Ein konkretes erwartetes Ergebnis macht Erfolg prüfbar statt diskutierbar.') }, { line: [5,7], note: l('Holdout checks the agent cannot see stop it from fitting its work to the visible tests.', 'Holdout-Checks, die der Agent nicht sieht, verhindern, dass er seine Arbeit an die sichtbaren Tests anpasst.') }, { line: 8, note: l('Unchanged approved tests catch the cheapest trick: making the tests pass by editing them.', 'Unveränderte freigegebene Tests fangen den billigsten Trick ab: Tests durch Ändern bestehen lassen.') }, { line: [10,13], note: l('Record every run and repeat it, because a single run of a non-deterministic agent proves little.', 'Halte jeden Lauf fest und wiederhole ihn, denn ein einzelner Lauf eines nichtdeterministischen Agenten beweist wenig.') }] }],
    steps: [
      l('Select 10 to 20 closed issues from this repository. Use the merged fix for each issue as its reference solution.', 'Wähle 10 bis 20 geschlossene Issues aus dem Repository. Verwende für jedes Issue die gemergte Korrektur als Referenz.'),
      l('Start at the commit before the fix. Give the issue to the coding agent. Run the tests on its change. Compare its results with the reference fix on generated inputs.', 'Beginne beim Commit vor der Korrektur. Gib das Issue an den Coding-Agenten. Führe die Tests aus. Vergleiche seinen Patch mit der Referenz für erzeugte Eingaben.'),
      l('Run the eval at least three times with each version of the rules, prompts or model.', 'Führe die Evals mit jeder Version der Regeln, Prompts oder Modelle mindestens dreimal aus.'),
    ],
    done: l('The script reports the pass rate and differential agreement for the task set. Use the results to decide if you will keep a setup change.', 'Das Skript meldet den Anteil bestandener Aufgaben und die Übereinstimmung mit den Referenzlösungen. Verwende die Ergebnisse, um über die Änderung zu entscheiden.'),
    think: [
      q('Your new AGENTS.md "feels" much better in daily use. What could the eval show instead?', 'Deine neue AGENTS.md „fühlt sich“ im Alltag viel besser an. Was könnte die Eval stattdessen zeigen?', 'Same success rate at higher cost, or a drop on task types you do not do daily. Feelings track the last few tasks; evals track the distribution.', 'Gleiche Erfolgsquote bei höheren Kosten oder einen Rückgang bei Aufgabentypen, die man nicht täglich macht. Gefühle folgen den letzten Aufgaben; Evals der Verteilung.'),
      q('An agent is tuned until it scores well on your eval set. What is the risk?', 'Ein Agent wird so lange angepasst, bis er auf deinem Eval-Set gut abschneidet. Was ist das Risiko?',
        'Overfitting to those tasks: rules or prompts may contain their answers. Keep a holdout set of tasks you never tune on.',
        'Überanpassung an diese Aufgaben: Regeln oder Prompts können deren Lösungen enthalten. Ein Holdout-Set von Aufgaben behalten, auf das nie angepasst wird.'),
      q('Predict: you run your eval set once before and once after a change and see 11/15 vs. 12/15. Did the change help?', 'Vorhersage: Du führst dein Eval-Set einmal vor und einmal nach einer Änderung aus und siehst 11/15 gegen 12/15. Hat die Änderung geholfen?',
        'Not shown. One more solved task is within run-to-run noise; repeat each run several times and compare averages, and look at which tasks changed.',
        'Nicht belegt. Eine zusätzlich gelöste Aufgabe liegt im Rauschen zwischen Läufen; jeden Lauf mehrfach wiederholen, Mittelwerte vergleichen und ansehen, welche Aufgaben sich geändert haben.'),
    ],
    related: ['agent-rules', 'test-integrity', 'differential-testing', 'code-review'],
  },
  {
    id: 'code-review',
    domain: { parts: ['domain', 'reserve'], what: l('A person examines the coding agent\'s change for design problems, such as a second path to reserve a pet.', 'Eine Person prüft, ob der Coding-Agent einen zweiten Ablauf für dieselbe Reservierung ergänzt hat.') },
    viz: { kind: 'process', mode: 'code-review' },
    name: l('Code review', 'Code-Review'),
    layer: 'review',
    phases: ['pre'],
    fromOverview: false,
    core: true,
    oneLiner: l('In code review, another person examines a proposed change for correctness, clarity and safety before merge.', 'Im Code Review prüft eine zweite Person die Änderung vor dem Merge. Sie beurteilt, ob die Änderung korrekt, verständlich und sicher ist.'),
    catches: l('Changes that do not meet requirements, design problems, code that is difficult to read, and missing tests.', 'Falsche Anforderungen, Designfehler, schwer lesbarer Code und fehlende Tests.'),
    intro: l(
      'A coding agent adds a second path for reservations. The change passes the automatic checks. A reviewer can identify the duplicate reservation logic.',
      'Ein Coding-Agent fügt einen zweiten Ablauf für Reservierungen hinzu. Die Änderung besteht die automatischen Checks. Ein Code Review kann zeigen, dass der Code dieselbe Aufgabe an zwei Stellen löst.',
    ),
    cost: 3,
    feedback: 'hours',
    worth: [
      l('A reviewer can decide if the change meets the requirements of the project.', 'Ein Reviewer kann beurteilen, ob die Änderung die Anforderungen des Projekts erfüllt.'),
      l('Review comments help people learn about the code. Many comments show how to make the code easier to maintain.', 'Review-Kommentare helfen, den Code zu verstehen. Sie können Änderungen für bessere Wartbarkeit vorschlagen.'),
      l('A small change is easier to review fully than a large change.', 'Eine Person kann eine kleine Änderung leichter vollständig prüfen.'),
    ],
    limits: [
      l('Code review has the highest cost in the funnel. Use automatic checks first to decrease the work for the reviewer.', 'Ein Code Review kostet Zeit. Führe zuerst die automatischen Checks aus.'),
      l('A reviewer can miss an error outside the scope of the review. Checklists and diff coverage can help the reviewer find these errors.', 'Ein Reviewer kann Fehler außerhalb des Prüfumfangs übersehen. Eine Checkliste und Diff Coverage können helfen.'),
    ],
    ai: l(
      'In one study, developers with AI assistants wrote less secure code and had more confidence in its security. Require a separate reviewer. An AI review can give an initial set of findings. Reviewers accepted few of these findings in one study. A person makes the final decision.',
      'In einer Studie schrieben Entwickler mit KI-Assistent weniger sicheren Code. Sie hielten ihn häufiger für sicher. Verlange ein separates Review. Ein KI-Review kann erste Findings liefern. Eine Person entscheidet über die Übernahme.',
    ),
    evidence: {
      general: ev('strong',
        f('mcintosh2014', 'In Qt, VTK and ITK, components with low review coverage had up to two more defects after release. Components with low review participation had up to five more defects.', 'In Qt, VTK und ITK hatten Komponenten mit geringer Review-Abdeckung bis zu 2, mit geringer Beteiligung bis zu 5 zusätzliche Fehler nach dem Release.'),
        f('bacchelli2013', 'At Microsoft, reviewers gave defect detection as the primary reason for code review. Reviews mainly helped people share knowledge, learn about changes and find other solutions.', 'Bei Microsoft war Fehlerfinden die wichtigste Motivation, Reviews lieferten aber vor allem Wissenstransfer, Bewusstsein und alternative Lösungen.')),
      ai: ev('moderate',
        f('perry2023', 'Participants with an AI assistant wrote less secure code. They also had more confidence that their code was secure.', 'Teilnehmende mit KI-Assistent schrieben unsichereren Code und waren sich sicherer, dass er sicher sei.'),
        f('revmate2024', 'In a live study, reviewers accepted 8.1% of LLM review comments at Mozilla and 7.2% at Ubisoft. These results are from a preprint.', 'In einer Live-Studie übernahmen Reviewer nur 8,1 % (Mozilla) und 7,2 % (Ubisoft) der LLM-generierten Review-Kommentare (Preprint).'),
        f('siddiq2026', 'The preprint reports that security-related agent pull requests on GitHub had a median review time of 3.92 h versus 0.11 h. Reviewers also merged these pull requests less frequently.', 'Sicherheitsbezogene Agenten-PRs auf GitHub wurden viel langsamer reviewt (Median 3,92 h gegenüber 0,11 h) und seltener gemergt (Preprint).')),
    },
    variants: [
      { name: l('AI review / LLM-as-judge (first pass)', 'KI-Review / LLM-as-Judge (erster Durchgang)'), text: l('Give one model a written rubric for the initial review. Put the review criteria in REVIEW.md. A rubric can increase agreement between reviewers. Use earlier review findings and failures in each subsequent review. Group findings by severity and identify defects that were present before the change. A person makes the final decision.', 'Verwende ein Modell für das erste Review. Halte die Kriterien in REVIEW.md fest. Nutze frühere Findings für die nächste Review-Runde. Ordne die Findings nach Schweregrad. Markiere Probleme, die vor der Änderung bestanden. Eine Person trifft die abschließende Entscheidung.') },
      { name: l('Checklists selected by the diff', 'Checklisten, die der Diff auswählt'), text: l('Each item in the reliability checklist applies to a type of change, such as a migration or retry. Use only the items that apply to the diff.', 'Jeder Punkt der Checkliste gilt für eine Art von Änderung, etwa eine Migration oder einen Retry. Verwende nur Punkte, die auf den Diff zutreffen.') },
    ],
    tools: { any: ['reviewdog', 'danger', 'gerrit'] },
    snippets: [{ lang: "any", file: "reservation-review.md",
      enforcedBy: l('Read by a human reviewer (or an AI review bot for a first pass); branch protection on your Git host (or Gerrit) enforces required human approval before merge.', 'Wird von einer Person im Review (oder einem KI-Review-Bot im ersten Durchgang) gelesen; Branch Protection beim Git-Host (oder Gerrit) erzwingt die erforderliche Freigabe vor dem Merge.'),
      description: l("Give the diff and the checklist to the coding agent. Ask the coding agent for a file and line number for each finding. Ask a person to examine the findings.",
        "Gib dem Coding-Agenten die Checkliste und den Diff. Verlange zu jedem Finding die Datei und Zeile. Lass die Findings von einer Person prüfen."),
      code: `# Review the reservation change
- Trace user identity from session to stored owner.
- Find the atomic operation that prevents double reservation.
- Show a test that fails if the second owner overwrites the first.
- Inspect changes to tests, compiler settings and CI separately.
- Check failure paths: missing pet, conflict, timeout, retry.

For each finding: file:line, triggering input, expected/actual
behaviour, severity and suggested verification command.
List assumptions you could not verify. Do not invent findings.`, focus: [{ line: 3, note: l('Find the atomic operation. Separate read and write operations can let two requests reserve the same pet.', 'Suche den einen atomaren Schritt; Prüfen-dann-Schreiben ist, wo die Doppelreservierung sitzt.') }, { line: 5, note: l('Review changes to tests, compiler settings and CI separately. A weaker check can let an error pass.', 'Geänderte Tests, Compiler-Einstellungen und CI werden separat geprüft, denn ihre Abschwächung versteckt Bugs.') }, { line: [8,9], note: l('A finding gives the reviewer the location, the input and a command to reproduce the problem.', 'Ein Befund mit Ort, Eingabe und Prüfbefehl lässt sich umsetzen oder widerlegen.') }, { line: 10, note: l('Record each assumption that you could not verify. Include only findings that the available information supports.', 'Unbestätigte Annahmen zu nennen und keine Befunde zu erfinden hält das Review ehrlich.') }] }],
    steps: [
      l('Keep each change below approximately 400 changed lines where possible. Require one approval from a person.', 'Halte Änderungen nach Möglichkeit unter ungefähr 400 geänderten Zeilen. Verlange die Freigabe einer Person.'),
      l('Set CI to put lint findings, diff coverage and surviving mutants in the pull request.', 'Lass CI die Lint-Ergebnisse, die Diff Coverage und verbliebene Mutanten im Pull Request anzeigen.'),
      l('Use a short checklist for requirements, tests for new behavior, error handling and changes that affect security.', 'Verwende eine kurze Checkliste für Anforderungen, neue Tests, Fehlerbehandlung und sicherheitsrelevante Änderungen.'),
    ],
    done: l('Branch protection on your Git host requires one approval from a person on the main branch. Pull requests show the results of automatic checks. The pull request template contains the review checklist.', 'Branch Protection auf dem Git-Host verlangt die Freigabe einer Person auf dem Main Branch. Pull Requests zeigen die Ergebnisse der automatischen Checks. Die Vorlage für Pull Requests enthält die Checkliste.'),
    think: [
      q('A coding agent opens a pull request with 2,000 changed lines. All checks pass. What do you request before the review?', 'Ein Agent öffnet einen PR mit 2.000 Zeilen, alle Checks sind grün. Worum bittet man vor dem Review?',
        'Divide the change into small parts that a person can review separately. Give the purpose of each part. A large diff makes it difficult to examine the full change.',
        'Ihn in kleine, einzeln reviewbare Schritte zu teilen, jeweils mit benannter Absicht. 2.000 Zeilen kann niemand sinnvoll beurteilen, und der Trichter funktioniert nur, wenn diese Schicht wenig sieht.'),
      q('What changes in the review when a coding agent writes the code?', 'Was ändert sich, wenn der Autor ein Agent ist?',
        'A coding agent can produce many changes that look correct. Examine the purpose of the change and its tests first. Use automatic checks for errors that they can find.',
        'Der Code wirkt flüssig und plausibel, Fehler sind schwerer zu erkennen, und die Menge ist größer. Zuerst Absicht und Tests prüfen und Werkzeuge prüfen lassen, was sie können.'),
      q('A diff of 30 lines adds a new `if (pet.reserved)` check. What questions remain after you read the diff?', 'Vorhersage: Ein Reviewer sieht einen Diff von 30 Zeilen mit einer neuen Prüfung `if (pet.reserved)`. Was kann er allein aus dem Diff nicht erkennen?',
        'The diff may not show other paths that reserve pets. It may also be unclear if the operation is atomic. Ask for tests of the reservation invariant.',
        'Ob die anderen Codepfade, die Tiere reservieren, dieselbe Prüfung haben und ob sie atomar ist. Reviewer sehen geänderte Zeilen, keine fehlenden; Tests verlangen, die die Invariante zeigen.'),
    ],
    related: ['evals', 'coverage', 'mutation-tests', 'security-scanning'],
  },
  {
    id: 'penetration-tests',
    domain: { parts: ['api', 'own-only', 'person'], what: l('An attack through a weak API endpoint reserves all pets for one account.', 'Ein Penetration Test prüft, ob ein Konto mehr Tiere reservieren kann als vorgesehen.') },
    viz: { kind: 'process', mode: 'penetration-tests' },
    name: l('Penetration tests', 'Penetrationstests'),
    layer: 'review',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Security specialists examine a system under agreed rules. They use controlled tests to show the effect of security weaknesses.', 'Fachleute prüfen ein System nach vereinbarten Regeln. Ein Penetration Test zeigt, welche Folgen die gefundenen Schwachstellen haben können.'),
    catches: l('chained vulnerabilities, broken authorization, business-logic abuse (reserving all pets with one account)', 'Zusammenwirkende Schwachstellen, fehlende Autorisierung und unerwartete Nutzung einer Funktion.'),
    intro: l(
      'A scanner reports no problems in the petstore. A permission error still lets one account see another account\'s reservations. A penetration test can find this error.',
      'Der Scanner meldet keine Probleme. Ein Berechtigungsfehler lässt ein Konto trotzdem die Reservierungen eines anderen Kontos lesen. Ein Penetration Test kann diesen Fehler finden.',
    ),
    cost: 3,
    feedback: 'days',
    worth: [
      l('A penetration test can examine combinations of weaknesses that a scanner examines separately.', 'Ein Penetration Test kann die gemeinsame Wirkung mehrerer Schwachstellen prüfen.'),
      l('The test can measure the response to a simulated incident.', 'Der Test kann zeigen, wie das Team auf einen simulierten Incident reagiert.'),
      l('The report can show the effect of a weakness on the system.', 'Der Bericht beschreibt die Folgen der gefundenen Schwachstellen.'),
    ],
    limits: [l('Results apply to the version and scope of the test. They also depend on the tester\'s skill.', 'Das Ergebnis gilt für die Version und den Umfang der Prüfung. Es hängt auch vom Fachwissen der Prüfer ab.'), l('Add an automatic check for a confirmed finding where possible. The check can detect the defect if it occurs again.', 'Ergänze nach Möglichkeit einen automatischen Check für jeden bestätigten Fehler.')],
    ai: l('A scanner can give a tester initial findings. A specialist can examine their effect. Add a test for each confirmed finding when possible.', 'Scanner können erste Findings liefern. Fachleute prüfen deren Auswirkungen. Ergänze nach Möglichkeit einen Test für jeden bestätigten Fehler.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['zap', 'nuclei', 'sqlmap'] },
    snippets: [{ lang: "any", file: "zap-baseline.sh",
      description: l("Run this example only on a disposable local test application that you have permission to assess. The baseline scan reports passive findings. Use separate tests for reservation permission rules.",
        "Führe den Scan nur gegen eine freigegebene lokale Testanwendung aus. Der Baseline-Scan meldet passive Findings. Prüfe die Autorisierung bei Reservierungen mit separaten Tests."),
      code: `# Docker Desktop: the host app listens on port 3000.
# Review the scan scope before running it.
docker run --rm -t ghcr.io/zaproxy/zaproxy:stable   zap-baseline.py -t http://host.docker.internal:3000
# Exit code 1: FAIL finding; 2: WARN finding; 3: other failure.
# Triage the report. Do not turn every warning into an ignore.`, focus: [{ line: 2, note: l('A scan against the wrong target is unauthorised or useless: confirm the scope first.', 'Ein Scan gegen das falsche Ziel ist unerlaubt oder nutzlos: Kläre zuerst den Geltungsbereich.') }, { line: 3, note: l('The baseline scan is passive and safe against a local copy, so it is a first look, not a full test.', 'Der Baseline-Scan ist passiv und gegen eine lokale Kopie sicher, also ein erster Blick, kein vollständiger Test.') }, { line: 4, note: l('The exit codes let CI tell failure, warning and tool error apart.', 'Die Exit-Codes lassen die CI Fehler, Warnung und Tool-Fehler unterscheiden.') }, { line: 5, note: l('Triage each finding; ignoring every warning bulk-hides the real ones.', 'Bewerte jeden Befund einzeln; alle Warnungen zu ignorieren versteckt die echten.') }] }],
    steps: [
      l('Record the scope and rules of engagement. Run the agreed tests in staging.', 'Halte Umfang und Regeln der Prüfung schriftlich fest. Führe die vereinbarten Tests in Staging aus.'), l('Before you correct a defect, write a regression test or scanner rule that detects it.', 'Schreibe vor der Korrektur einen Regression Test oder eine Scan-Regel für jeden bestätigten Fehler.'),
      l('Test again after the corrections. Run the regression checks for the corrected defects.', 'Wiederhole die Prüfung nach der Korrektur. Führe die neuen Regression Tests aus.'),
    ],
    done: l('Each high-severity finding has a correction. An automatic check can detect each defect if it occurs again.', 'Alle Findings mit hohem Schweregrad sind behoben. Für jeden Fehler gibt es einen automatischen Check, der ihn bei einer späteren Änderung erkennt.'),
    think: [
      q('Why is a pen test report with zero findings not proof of security?', 'Warum ist ein Pentest-Bericht ohne Funde kein Sicherheitsbeweis?', 'It shows what these testers found in this time with this scope. Absence of evidence is not evidence of absence, the same as with any test.', 'Er zeigt, was diese Tester in dieser Zeit mit diesem Umfang fanden. Fehlen von Belegen ist kein Beleg für Fehlen, wie bei jedem Test.'),
      q('How often is a pen test enough, and what fills the gaps between tests?', 'Wie oft genügt ein Pen Test, und was füllt die Lücken zwischen den Tests?',
        'It is a snapshot, so repeat it after big changes or yearly. In between, scanners, threat modeling and security regression tests keep the known issues from returning.',
        'Er ist eine Momentaufnahme, also nach großen Änderungen oder jährlich wiederholen. Dazwischen halten Scanner, Threat Modeling und Security-Regressionstests bekannte Probleme fern.'),
      q('Predict: a pen test finds that any user can read other people\'s reservations by changing the id in the URL. A fix is merged. What should come with it?', 'Vorhersage: Ein Pen Test findet, dass jeder Nutzer fremde Reservierungen durch Ändern der ID in der URL lesen kann. Ein Fix wird gemergt. Was sollte mitkommen?',
        'An automated authorization test that logs in as user A and requests user B\'s reservation, expecting a refusal. Without it the next refactoring can bring the hole back.',
        'Ein automatisierter Autorisierungstest, der sich als Nutzer A anmeldet, die Reservierung von Nutzer B abruft und eine Ablehnung erwartet. Ohne ihn kann das nächste Refactoring die Lücke zurückbringen.'),
    ],
    related: ['threat-modeling', 'security-scanning', 'dynamic-exploration'],
  },
  {
    id: 'usability-tests',
    domain: { parts: ['ui', 'reserve'], what: l('Five people try to reserve a pet with the reservation form.', 'Fünf Personen versuchen, mit dem Reservierungsformular ein Tier zu reservieren.') },
    viz: { kind: 'process', mode: 'usability-tests' },
    name: l('Usability tests', 'Usability-Tests'),
    layer: 'review',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('In a usability test, people do typical tasks. An observer records where each person has difficulty.', 'Bei einem Usability Test erledigen Personen typische Aufgaben. Halte fest, bei welchen Schritten sie Schwierigkeiten haben.'),
    catches: l('confusing flows, misleading labels, steps users cannot find, features nobody understands', 'Unklare Abläufe, missverständliche Labels und Funktionen, die Nutzer schwer finden oder bedienen können.'),
    intro: l(
      'The reservation page passes its automatic checks. Some visitors cannot find the button because its label says “Hold.” A usability test can show where visitors stop.',
      'Die Reservierungsseite besteht die automatischen Checks. Manche Nutzer finden den Button mit der Aufschrift „Vormerken“ nicht. Ein Usability Test zeigt, an welcher Stelle sie nicht weiterkommen.',
    ),
    cost: 2,
    feedback: 'days',
    worth: [
      l('A small group of participants can find important usability problems.', 'Eine kleine Gruppe kann wichtige Usability-Probleme finden.'), l('An early test on a prototype can identify problems when changes cost less.', 'Ein früher Test mit einem Prototyp kann Probleme zeigen, solange Änderungen weniger kosten.'),
      l('A participant can misread a label even when the automatic tests pass.', 'Ein Teilnehmer kann ein Label falsch verstehen, obwohl die automatischen Checks bestehen.'),
    ],
    limits: [
      l('A usability test can show where people have difficulty. Use A/B tests or real user monitoring to measure how often a problem occurs.', 'Ein Usability Test zeigt, welche Schritte schwierig sind. Miss die Häufigkeit eines Problems mit A/B-Tests oder Real User Monitoring.'),
      l('Include participants with different skills and assistive technology. A small group can miss problems that affect other users.', 'Beziehe Personen mit unterschiedlichen Fähigkeiten und Hilfstechnologien ein. Eine kleine Gruppe kann Probleme anderer Nutzer übersehen.'),
    ],
    ai: l('Automatic checks can pass on an interface that people find difficult to use. Observe five people as they try to reserve a pet.', 'Eine UI kann alle automatischen Checks bestehen und für Nutzer schwer zu bedienen sein. Beobachte fünf Personen beim Reservieren eines Tiers.'),
    evidence: { general: ev('moderate', f('nielsen1993', 'Problems found follow a diminishing-returns curve; under the model about 5 users find about 85% of problems (the rule is debated).', 'Gefundene Probleme folgen einer Kurve abnehmenden Ertrags; nach dem Modell finden etwa 5 Nutzer etwa 85 % der Probleme (die Regel ist umstritten).')), ai: none() },
    tools: {},
    snippets: [{ lang: "any", file: "reservation-usability.md",
      description: l("Use this script with one participant. Observe their actions without help. A coding agent can summarize observations after you remove personal data.",
        "Verwende das Skript mit einer Testperson. Beobachte ihre Aktionen ohne Hilfestellung. Ein Coding-Agent kann Beobachtungen nach Entfernung personenbezogener Daten zusammenfassen."),
      code: `# Task (read aloud)
You want to adopt Rex. Find out whether Rex is available,
reserve him, and explain how you know the reservation worked.

# Observer notes (do not read aloud)
Record: first action, hesitations, errors, completion, quotes.
Do not tell the participant which button to click.
Then ask: "What would you expect if someone else reserved Rex?"

# Feed back to the team
Observation -> affected step -> proposed change -> next session.
Separate observed behaviour from your interpretation.`, focus: [{ line: [2,3], note: l('The task states a goal, not clicks, so you see whether people find the way themselves.', 'Die Aufgabe nennt ein Ziel, keine Klicks, sodass du siehst, ob Menschen den Weg selbst finden.') }, { line: 7, note: l('Do not help: a hint hides exactly the confusion you came to observe.', 'Hilf nicht: Ein Hinweis verdeckt genau die Verwirrung, die du beobachten willst.') }, { line: 8, note: l('This probes whether the participant understands the conflict case, not just the happy path.', 'Das prüft, ob die Person den Konfliktfall versteht, nicht nur den Normalfall.') }, { line: 12, note: l('Keep what you saw apart from what you think it means, or the team argues about opinions.', 'Trenne, was du gesehen hast, von dem, was du darin vermutest, sonst streitet das Team über Meinungen.') }] }],
    steps: [l('Write three typical tasks. For example, ask the participant to reserve a dog under 3 years old for next weekend.', 'Schreibe drei typische Aufgaben für den Usability Test.'), l('Observe five participants. Ask them to describe what they think while they do the tasks. Record where they hesitate. Let them try without help.', 'Beobachte fünf Personen bei den Aufgaben. Bitte sie, ihre Gedanken zu beschreiben. Notiere, wo sie zögern. Lass sie die Aufgaben ohne Hilfe ausführen.'), l('Correct the three most important problems. Run the test again.', 'Korrigiere die drei wichtigsten Probleme. Wiederhole den Test.')],
    done: l('You have records of five sessions. Each of the most important problems has a correction or a ticket.', 'Fünf Sitzungen sind dokumentiert. Für jedes der wichtigsten Probleme gibt es eine Korrektur oder ein Ticket.'),
    think: [
      q('Why not just ask users what they want?', 'Warum nicht einfach Nutzer fragen, was sie wollen?', 'People are bad at predicting their own behaviour and good at showing it. Watch what they do, not what they say.', 'Menschen sagen ihr eigenes Verhalten schlecht vorher, zeigen es aber gut. Beobachten, was sie tun, nicht was sie sagen.'),
      q('What changes when an agent builds the interface?', 'Was ändert sich, wenn ein Agent die Oberfläche baut?',
        'The agent optimises for a described behaviour, not for how people read and hesitate. Usability tests become the check on the part no automated test sees.',
        'Der Agent optimiert auf ein beschriebenes Verhalten, nicht darauf, wie Menschen lesen und zögern. Usability-Tests werden zur Prüfung des Teils, den kein automatisierter Test sieht.'),
      q('Predict: four of five participants click "Adopt" when the task is to "reserve for a visit". What does that tell you?', 'Vorhersage: Vier von fünf Teilnehmenden klicken auf „Adoptieren“, obwohl die Aufgabe „für einen Besuch reservieren“ lautet. Was sagt dir das?',
        'The labels or flow are unclear. It is a design problem, not a user problem, and a good fix is to change the text and test again.',
        'Die Beschriftungen oder der Ablauf sind unklar. Es ist ein Designproblem, kein Nutzerproblem; eine gute Lösung ist, den Text zu ändern und erneut zu testen.'),
    ],
    related: ['ui-ux-tests', 'ab-tests', 'real-user-monitoring'],
  },
  {
    id: 'oncall-experience',
    domain: { parts: ['monitoring', 'never-twice'], what: l('A double reservation in production becomes a lint rule.', 'Die Rufbereitschaft nutzt eine Doppelreservierung in Produktion, um einen früheren Check zu entwickeln.') },
    viz: { kind: 'process', mode: 'oncall-experience' },
    name: l('On-call experience', 'On-Call-Erfahrung'),
    layer: 'review',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('On-call work shows how a service fails in production. The team can use incident findings to change the design, tests and alerts.', 'On-Call-Arbeit zeigt, wie ein Service in Produktion ausfällt. Das Team nutzt diese Informationen für Änderungen an Design, Tests und Alerts.'),
    catches: l('noisy alerts, missing runbooks, recurring incidents, failure modes nobody designed for', 'Alerts ohne Aktion, fehlende Runbooks, wiederkehrende Incidents und Fehler ohne vorhandenen Check.'),
    intro: l(
      'An alert wakes the on-call person at 3 a.m. The alert gives no details about the failure. Use incident findings to make a check that can detect the problem earlier.',
      'Um 3 Uhr weckt ein Alert die Person in Rufbereitschaft. Der Alert nennt den Fehler nicht. Nutze die Erkenntnisse aus dem Incident für einen Check, der den Fehler früher erkennt.',
    ),
    cost: 3,
    feedback: 'days',
    worth: [
      l('A postmortem can identify a design change, test or alert that would detect an incident earlier.', 'Ein Postmortem kann Änderungen an Design, Tests oder Alerts vorschlagen.'), l('On-call work gives developers direct information about how their code operates in production.', 'On-Call-Arbeit zeigt Entwicklern, wie ihr Code in Produktion arbeitet.'),
      l('Incident records show which alerts lead to an action.', 'Incident-Berichte zeigen, welche Alerts eine Aktion auslösen.'),
    ],
    limits: [
      l('Many alerts and interruptions to sleep can cause fatigue. Record both.', 'Viele Alerts und Schlafunterbrechungen können zu Ermüdung führen. Erfasse beide.'),
      l('Allocate time for the changes that the postmortem proposes.', 'Plane Zeit für die Maßnahmen aus dem Postmortem ein.'),
    ],
    ai: l('A reviewer must be able to diagnose a service after a coding agent changes it. After each incident, add a check that can detect the problem earlier.', 'Prüfe im Code Review, ob die Rufbereitschaft einen Fehler nach der Änderung untersuchen kann. Ergänze nach einem Incident einen Check, der das Problem früher erkennt.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['alertmanager', 'grafana'] },
    snippets: [{ lang: "any", file: "reservation-runbook.md",
      description: l("Use the runbook in a staging exercise. Replace the placeholders with your own dashboards, owners and commands. The responder follows the team's incident procedure. A coding agent can collect data for the responder.",
        "Verwende das Runbook in einer Staging-Übung. Ersetze die Platzhalter durch die Dashboards, Zuständigkeiten und Befehle deines Projekts. Ein Coding-Agent kann Belege sammeln. Die zuständige Person folgt dem Incident-Prozess."),
      code: `# Alert: reservation failures above the agreed SLO
Owner / escalation: <team and contact path>
Dashboard: <reservation success rate, latency, release version>

1. Confirm impact and affected release; note the start time.
2. Separate expected 409 conflicts from 5xx failures.
3. Check database pool saturation and recent deployment changes.
4. If the rollback condition is met, follow <rollback procedure>.
5. Verify recovery with user-visible signals, not just healthy pods.

After recovery: timeline, contributing conditions, one regression
check, one alert/runbook improvement and an owner for each.`, focus: [{ line: 2, note: l('Every alert needs an owner and an escalation path, or nobody acts at 3 a.m.', 'Jeder Alarm braucht einen Verantwortlichen und einen Eskalationsweg, sonst handelt nachts um drei niemand.') }, { line: 6, note: l('Expected 409 conflicts are not outages; mixing them with 5xx sends responders after noise.', 'Erwartete 409-Konflikte sind keine Ausfälle; sie mit 5xx zu mischen schickt Einsatzkräfte dem Rauschen nach.') }, { line: 8, note: l('The rollback condition is decided in advance, so nobody debates it during the incident.', 'Die Rollback-Bedingung steht vorab fest, sodass im Vorfall niemand darüber diskutiert.') }, { line: 9, note: l('Healthy pods are not proof; success is what users can do again.', 'Gesunde Pods sind kein Beweis; Erfolg ist, was Nutzer wieder tun können.') }] }],
    steps: [l('Write a postmortem within one week of each incident. Describe what happened without assigning blame.', 'Schreibe innerhalb einer Woche nach jedem Incident ein Postmortem. Beschreibe den Ablauf ohne Schuldzuweisung.'), l('Add at least one check that can detect the problem earlier. Examples include a test, lint rule, alert or contract.', 'Ergänze mindestens einen Check, der das Problem früher erkennt. Verwende zum Beispiel einen Test, eine Lint-Regel, einen Alert oder einen Contract.'), l('Review alerts each month. Remove alerts that do not lead to an action.', 'Prüfe die Alerts monatlich. Entferne Alerts, auf die keine Aktion folgt.')],
    done: l('Each incident has a postmortem that records at least one new check to detect the problem earlier.', 'Jeder Incident hat ein Postmortem. Das Postmortem dokumentiert mindestens einen neuen Check zur früheren Fehlererkennung.'),
    think: [
      q('Why is "add a check higher in the funnel" the most important postmortem action?', 'Warum ist „eine Prüfung weiter oben im Trichter ergänzen“ die wichtigste Postmortem-Maßnahme?', 'Because it makes the same bug cheap to catch next time. Fixing the bug fixes one bug; the check fixes the class.', 'Weil derselbe Fehler beim nächsten Mal billig gefangen wird. Den Fehler beheben behebt einen Fehler; die Prüfung behebt die Klasse.'),
      q('What changes when an agent makes a change that causes the incident?', 'Was ändert sich, wenn die Änderung, die den Vorfall auslöst, von einem Agenten stammt?',
        'The postmortem should ask which check should have stopped it and why the agent was allowed to pass it. Blame the process, not the tool, and add the check.',
        'Das Postmortem sollte fragen, welche Prüfung es hätte stoppen müssen und warum der Agent sie passieren durfte. Den Prozess hinterfragen, nicht das Werkzeug, und die Prüfung ergänzen.'),
      q('Predict: a postmortem ends with "be more careful". What happens at the next incident?', 'Vorhersage: Ein Postmortem endet mit „künftig sorgfältiger sein“. Was passiert beim nächsten Vorfall?',
        'The same thing, because no check changed. A good action item is something a machine enforces: a test, a lint rule, an alert or a gate.',
        'Dasselbe, weil sich keine Prüfung geändert hat. Eine gute Maßnahme ist etwas, das eine Maschine erzwingt: ein Test, eine Lint-Regel, ein Alarm oder ein Gate.'),
    ],
    related: ['monitoring', 'chaos-testing', 'exception-tracking'],
  },
];
