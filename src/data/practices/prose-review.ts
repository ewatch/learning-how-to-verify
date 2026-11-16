import type { Practice } from '../types';
import { ev, f, l, none, q } from './_h';

export const proseReview: Practice[] = [
  {
    id: 'agent-rules',
    name: l('Rules, skills & AGENTS.md', 'Regeln, Skills & AGENTS.md'),
    layer: 'prose',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('Written instructions that tell humans and coding agents how to work in this repository: commands, conventions, what not to do.', 'Schriftliche Anweisungen, die Menschen und Coding-Agenten sagen, wie in diesem Repository gearbeitet wird: Befehle, Konventionen, was man nicht tut.'),
    catches: l('nothing by itself; it prevents mistakes only if read and followed', 'von sich aus nichts; es verhindert Fehler nur, wenn es gelesen und befolgt wird'),
    cost: 1,
    feedback: 'days',
    worth: [
      l('The right place for what no tool can check: intent, trade-offs, where things live, which command proves "done".', 'Der richtige Ort für das, was kein Werkzeug prüfen kann: Absicht, Abwägungen, wo was liegt, welcher Befehl „fertig“ beweist.'),
      l('Short and specific beats long and general.', 'Kurz und konkret schlägt lang und allgemein.'),
      l('A short file read at the start of every task is the cheapest place to state the verify command.', 'Eine kurze Datei, die zu Beginn jeder Aufgabe gelesen wird, ist der günstigste Ort für den Verify-Befehl.'),
    ],
    limits: [
      l('Nothing enforces it. Every rule that can be a lint rule, type or test should become one.', 'Nichts erzwingt sie. Jede Regel, die eine Lint-Regel, ein Typ oder ein Test sein kann, sollte eine werden.'),
      l('Long rules files cost tokens on every task and can make agents explore more without succeeding more.', 'Lange Regeldateien kosten bei jeder Aufgabe Tokens und können Agenten mehr erkunden lassen, ohne dass sie öfter Erfolg haben.'),
    ],
    ai: l(
      'This layer has the weakest evidence in the funnel. The best study so far found no gain in task success from context files and higher cost. Treat AGENTS.md as something to evaluate, not to assume helpful: keep it minimal and measure changes with evals.',
      'Diese Schicht hat die schwächste Evidenz im Trichter. Die bisher beste Studie fand durch Kontextdateien keinen Gewinn bei der Erfolgsquote und höhere Kosten. AGENTS.md als etwas behandeln, das man evaluiert, nicht als selbstverständlich hilfreich: minimal halten und Änderungen mit Evals messen.',
    ),
    evidence: {
      general: none(),
      ai: ev('weak',
        f('gloaguen2026', 'Across several agents and models, context files (generated or hand-written) did not raise task success, sometimes lowered it slightly, and raised inference cost by more than 20%.', 'Über mehrere Agenten und Modelle hinweg erhöhten Kontextdateien (generiert oder handgeschrieben) die Erfolgsquote nicht, senkten sie teils leicht und erhöhten die Kosten um über 20 %.'),
        f('lulla2026', 'On 10 repositories, AGENTS.md cut median agent runtime by 28.6% and output tokens by 16.6%, with comparable task completion (preprint).', 'In 10 Repositories senkte AGENTS.md die mittlere Laufzeit der Agenten um 28,6 % und die Ausgabetokens um 16,6 %, bei vergleichbarer Aufgabenerfüllung (Preprint).')),
    },
    variants: [{ name: l('Sandboxing (guardrail, not verification)', 'Sandboxing (Leitplanke, keine Verifikation)'), text: l('Run agents in containers or VMs with limited network, credentials and file access. It does not find bugs; it limits the damage of wrong or prompt-injected actions, and makes running tests safe.', 'Agenten in Containern oder VMs mit begrenztem Netz-, Zugangsdaten- und Dateizugriff laufen lassen. Das findet keine Fehler; es begrenzt den Schaden falscher oder per Prompt Injection ausgelöster Aktionen und macht das Ausführen von Tests sicher.') }],
    tools: { any: ['agents-md', 'spec-kit', 'promptfoo'] },
    snippets: [{ lang: 'any', file: 'AGENTS.md', code: `# Petstore

## Verify before you finish
- \`npm run ci\` must pass (lint, types, tests, build). Do not skip or edit tests in test/.
- Domain logic lives in src/domain and must not import from src/ui or server/.

## Things a tool cannot tell you
- Prices are integers in cents. Never use floats for money.
- A pet can be reserved by one person only; the server is the source of truth.`, focus: [{ line: 4, note: l('This line names the command that proves "done", the one thing an agent must run before it stops.', 'Diese Zeile nennt den Befehl, der „fertig“ beweist: das eine, was ein Agent vor dem Aufhören ausführen muss.') }, { line: 5, note: l('An architecture rule an agent cannot guess; ideally move it into an import-boundary lint check.', 'Eine Architekturregel, die ein Agent nicht erraten kann; idealerweise in einen Lint-Check für Importgrenzen verschieben.') }, { line: [8,9], note: l('Facts no tool can check belong here; everything a tool could enforce should be a check instead.', 'Fakten, die kein Werkzeug prüfen kann, gehören hierher; alles, was ein Werkzeug erzwingen könnte, sollte stattdessen eine Prüfung sein.') }] }],
    steps: [
      l('Write a minimal AGENTS.md: the verify command, where things live, and 3–5 facts a tool cannot check.', 'Eine minimale AGENTS.md schreiben: den Prüfbefehl, wo was liegt, und 3–5 Fakten, die kein Werkzeug prüfen kann.'),
      l('For every rule, ask whether it could be a lint rule, type, architecture test or CI check; if yes, move it there and delete it from the file.', 'Für jede Regel fragen, ob sie eine Lint-Regel, ein Typ, ein Architekturtest oder ein CI-Check sein könnte; wenn ja, dorthin verschieben und aus der Datei löschen.'),
      l('Measure: run a small eval set of typical tasks with and without the change.', 'Messen: einen kleinen Eval-Satz typischer Aufgaben mit und ohne die Änderung laufen lassen.'),
    ],
    done: l('AGENTS.md is under ~50 lines, names the verify command, and contains no rule that a tool already enforces.', 'AGENTS.md hat unter ~50 Zeilen, nennt den Prüfbefehl und enthält keine Regel, die schon ein Werkzeug erzwingt.'),
    think: [
      q('Your AGENTS.md says "always use integers for money". What is a cheaper, stronger way to say that?', 'Deine AGENTS.md sagt „für Geld immer Ganzzahlen verwenden“. Was ist ein billigerer, stärkerer Weg, das zu sagen?',
        'A type (`type Cents = number & { __brand: "cents" }`) or a lint rule that forbids arithmetic on price fields with floats. Then it is enforced on every change, for every agent and human.',
        'Ein Typ (`type Cents = number & { __brand: "cents" }`) oder eine Lint-Regel, die Fließkomma-Arithmetik auf Preisfeldern verbietet. Dann wird es bei jeder Änderung erzwungen, für jeden Agenten und Menschen.'),
      q('Why is "prose" placed so low in the funnel, below formal verification?', 'Warum steht „Prosa“ so weit unten im Trichter, unter formaler Verifikation?',
        'Because it is the least reliable check: cheap to write, but only probabilistically followed and impossible to verify automatically. Everything above it either runs or proves.',
        'Weil sie die unzuverlässigste Prüfung ist: billig zu schreiben, aber nur mit Wahrscheinlichkeit befolgt und nicht automatisch prüfbar. Alles darüber läuft oder beweist.'),
      q('Predict: you add 30 new rules to AGENTS.md after one bad pull request. What may happen to the next tasks?', 'Vorhersage: Du ergänzt nach einem schlechten Pull Request 30 neue Regeln in der AGENTS.md. Was kann mit den nächsten Aufgaben passieren?',
        'Important rules get lost among the others, cost rises and success may not. Measure with an eval; replace rules by checks wherever possible.',
        'Wichtige Regeln gehen zwischen den anderen unter, die Kosten steigen, der Erfolg nicht unbedingt. Mit einer Eval messen; Regeln wo möglich durch Prüfungen ersetzen.'),
    ],
    related: ['evals', 'lint', 'test-integrity', 'architecture'],
  },
  {
    id: 'evals',
    name: l('Evals for your agent setup', 'Evals für das Agenten-Setup'),
    layer: 'prose',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('A repeatable set of representative tasks that measures how well your agent setup (model, prompts, rules, tools) actually performs.', 'Ein wiederholbarer Satz repräsentativer Aufgaben, der misst, wie gut das eigene Agenten-Setup (Modell, Prompts, Regeln, Werkzeuge) tatsächlich arbeitet.'),
    catches: l('changes to AGENTS.md, prompts or models that make results worse, and "improvements" that only feel better', 'Änderungen an AGENTS.md, Prompts oder Modellen, die Ergebnisse verschlechtern, und „Verbesserungen“, die sich nur besser anfühlen'),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('Turns opinions about rules files and models into numbers.', 'Macht aus Meinungen über Regeldateien und Modelle Zahlen.'),
      l('A dozen real tasks from your own history is a useful start.', 'Ein Dutzend echter Aufgaben aus der eigenen Historie ist ein brauchbarer Anfang.'),
      l('Lets you compare models and setups on your own tasks instead of public benchmark numbers.', 'Erlaubt den Vergleich von Modellen und Setups auf deinen eigenen Aufgaben statt anhand öffentlicher Benchmark-Zahlen.'),
    ],
    limits: [
      l('Test-only grading overstates quality: passing tests is not the same as mergeable.', 'Nur testbasierte Bewertung überschätzt die Qualität: Tests bestehen ist nicht dasselbe wie mergebar.'),
      l('Small eval sets are noisy; run several times.', 'Kleine Eval-Sätze sind verrauscht; mehrfach laufen lassen.'),
    ],
    ai: l(
      'You verify code with tests; you verify the agent setup with evals. Grade with more than tests: differential checks against a reference fix, a rubric, or a human sample.',
      'Code verifiziert man mit Tests, das Agenten-Setup mit Evals. Mit mehr als Tests bewerten: Differenzprüfungen gegen eine Referenzlösung, eine Rubrik oder eine menschliche Stichprobe.',
    ),
    evidence: {
      general: none(),
      ai: ev('moderate',
        f('metr2026', 'Maintainers would merge only about half of 296 test-passing agent PRs; their verdicts ran about 24 points below the automated grader.', 'Maintainer würden nur etwa die Hälfte von 296 testbestehenden Agenten-PRs mergen; ihr Urteil lag etwa 24 Punkte unter dem automatischen Bewerter.'),
        f('patchdiff2026', 'Test-based evaluation overstated agent resolution rates by about 6.2 points because 29.6% of passing patches behaved differently from the reference.', 'Testbasierte Bewertung überschätzte die Lösungsquote der Agenten um etwa 6,2 Punkte, weil sich 29,6 % der bestehenden Patches anders verhielten als die Referenz.')),
    },
    tools: { any: ['inspect-ai', 'promptfoo', 'swe-bench'] },
    snippets: [{ lang: "any", file: "agent-eval.md",
      description: l("Run a small, fixed task set on clean checkouts before changing your agent setup. Compare the same tasks and held-out checks; log failures as well as successes. This is a protocol, not an automated scorer.",
        "Vor einer Änderung des Agenten-Setups einen kleinen festen Aufgabensatz auf sauberen Checkouts ausführen. Dieselben Aufgaben und Holdout-Prüfungen vergleichen; Fehler ebenso wie Erfolge protokollieren. Dies ist ein Protokoll, kein automatischer Scorer."),
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
Repeat with the same budget; keep individual results.`, focus: [{ line: 3, note: l('A concrete expected outcome makes success checkable instead of arguable.', 'Ein konkretes erwartetes Ergebnis macht Erfolg prüfbar statt diskutierbar.') }, { line: [5,8], note: l('Holdout checks the agent cannot see stop it from fitting its work to the visible tests.', 'Holdout-Checks, die der Agent nicht sieht, verhindern, dass er seine Arbeit an die sichtbaren Tests anpasst.') }, { line: 8, note: l('Unchanged approved tests catch the cheapest trick: making the tests pass by editing them.', 'Unveränderte freigegebene Tests fangen den billigsten Trick ab: Tests durch Ändern bestehen lassen.') }, { line: [10,13], note: l('Record every run and repeat it, because a single run of a non-deterministic agent proves little.', 'Halte jeden Lauf fest und wiederhole ihn, denn ein einzelner Lauf eines nichtdeterministischen Agenten beweist wenig.') }] }],
    steps: [
      l('Collect 10–20 closed issues from this repo with their merged fixes as reference solutions.', '10–20 geschlossene Issues dieses Repos mit ihren gemergten Lösungen als Referenz sammeln.'),
      l('Script a run: reset to the parent commit, give the agent the issue, run tests, and compare its patch with the reference on generated inputs.', 'Einen Lauf skripten: auf den Eltern-Commit zurücksetzen, dem Agenten das Issue geben, Tests ausführen und seinen Patch auf erzeugten Eingaben mit der Referenz vergleichen.'),
      l('Run before and after every change to rules files, prompts or model, at least 3 times each.', 'Vor und nach jeder Änderung an Regeldateien, Prompts oder Modell ausführen, jeweils mindestens 3-mal.'),
    ],
    done: l('An eval script exists that reports pass rate and differential agreement over the task set, and is used to accept or reject setup changes.', 'Ein Eval-Skript existiert, das Bestehensquote und differenzielle Übereinstimmung über den Aufgabensatz meldet, und es entscheidet über Setup-Änderungen.'),
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
    name: l('Code review', 'Code-Review'),
    layer: 'review',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('Another person reads the change before it is merged and decides whether it is right, clear and safe.', 'Eine andere Person liest die Änderung vor dem Merge und entscheidet, ob sie richtig, verständlich und sicher ist.'),
    catches: l('wrong intent, design problems, unclear code, missing tests, and things no machine was told to check', 'falsche Absicht, Designprobleme, unklaren Code, fehlende Tests und alles, was keiner Maschine zu prüfen aufgetragen wurde'),
    cost: 3,
    feedback: 'hours',
    worth: [
      l('Judges what tools cannot: is this the right change?', 'Beurteilt, was Werkzeuge nicht können: Ist das die richtige Änderung?'),
      l('Spreads knowledge; most review comments are about maintainability, not defects.', 'Verbreitet Wissen; die meisten Review-Kommentare betreffen Wartbarkeit, nicht Fehler.'),
      l('Small changes get better reviews than large ones.', 'Kleine Änderungen bekommen bessere Reviews als große.'),
    ],
    limits: [
      l('The most expensive and least scalable check; it should only see what the layers above could not catch.', 'Die teuerste und am schlechtesten skalierende Prüfung; sie sollte nur sehen, was die Schichten darüber nicht fangen konnten.'),
      l('Reviewers miss what they are not looking for; checklists and diff coverage help.', 'Reviewer übersehen, wonach sie nicht suchen; Checklisten und Diff-Abdeckung helfen.'),
    ],
    ai: l(
      'People using AI assistants wrote less secure code and were more confident in it, so do not let the author, human or agent, be the only reviewer. AI review is a useful first pass, but few of its comments get accepted; a human makes the call.',
      'Menschen mit KI-Assistenten schrieben unsichereren Code und waren sich dabei sicherer; deshalb darf der Autor, Mensch oder Agent, nicht der einzige Reviewer sein. KI-Review ist ein nützlicher erster Durchgang, aber wenige seiner Kommentare werden übernommen; die Entscheidung trifft ein Mensch.',
    ),
    evidence: {
      general: ev('strong',
        f('mcintosh2014', 'In Qt, VTK and ITK, components with low review coverage had up to 2 and with low participation up to 5 additional post-release defects.', 'In Qt, VTK und ITK hatten Komponenten mit geringer Review-Abdeckung bis zu 2, mit geringer Beteiligung bis zu 5 zusätzliche Fehler nach dem Release.'),
        f('bacchelli2013', 'At Microsoft, finding defects was the top motivation, but reviews mainly delivered knowledge transfer, awareness and alternative solutions.', 'Bei Microsoft war Fehlerfinden die wichtigste Motivation, Reviews lieferten aber vor allem Wissenstransfer, Bewusstsein und alternative Lösungen.')),
      ai: ev('moderate',
        f('perry2023', 'Participants with an AI assistant wrote less secure code and were more confident that it was secure.', 'Teilnehmende mit KI-Assistent schrieben unsichereren Code und waren sich sicherer, dass er sicher sei.'),
        f('revmate2024', 'In a live study, reviewers accepted only 8.1% (Mozilla) and 7.2% (Ubisoft) of LLM-generated review comments (preprint).', 'In einer Live-Studie übernahmen Reviewer nur 8,1 % (Mozilla) und 7,2 % (Ubisoft) der LLM-generierten Review-Kommentare (Preprint).'),
        f('siddiq2026', 'Security-related agent PRs on GitHub were reviewed far more slowly (median 3.92 h vs. 0.11 h) and merged less often (preprint).', 'Sicherheitsbezogene Agenten-PRs auf GitHub wurden viel langsamer reviewt (Median 3,92 h gegenüber 0,11 h) und seltener gemergt (Preprint).')),
    },
    variants: [{ name: l('AI review / LLM-as-judge (first pass)', 'KI-Review / LLM-as-Judge (erster Durchgang)'), text: l('Let a model comment first against a written rubric; a human decides. Rubrics raise agreement a lot.', 'Ein Modell zuerst anhand einer schriftlichen Rubrik kommentieren lassen; ein Mensch entscheidet. Rubriken erhöhen die Übereinstimmung deutlich.') }],
    tools: { any: ['reviewdog', 'danger', 'gerrit'] },
    snippets: [{ lang: "any", file: "reservation-review.md",
      description: l("Give the agent this checklist and the diff, then have a human examine the findings. Require file/line evidence for each claim; a checklist is a review aid rather than proof.",
        "Dem Agenten diese Checkliste und den Diff geben, danach die Funde durch einen Menschen prüfen lassen. Für jede Aussage Datei und Zeile verlangen; eine Checkliste unterstützt das Review, ist aber kein Beweis."),
      code: `# Review the reservation change
- Trace user identity from session to stored owner.
- Find the atomic operation that prevents double reservation.
- Show a test that fails if the second owner overwrites the first.
- Inspect changes to tests, compiler settings and CI separately.
- Check failure paths: missing pet, conflict, timeout, retry.

For each finding: file:line, triggering input, expected/actual
behaviour, severity and suggested verification command.
List assumptions you could not verify. Do not invent findings.`, focus: [{ line: 4, note: l('Look for the one atomic step; check-then-write is where the double reservation lives.', 'Suche den einen atomaren Schritt; Prüfen-dann-Schreiben ist, wo die Doppelreservierung sitzt.') }, { line: 6, note: l('Changed tests, compiler settings and CI are reviewed on their own, since weakening them hides bugs.', 'Geänderte Tests, Compiler-Einstellungen und CI werden separat geprüft, denn ihre Abschwächung versteckt Bugs.') }, { line: [8,9], note: l('A finding with location, input and a command to check it can be acted on or refuted.', 'Ein Befund mit Ort, Eingabe und Prüfbefehl lässt sich umsetzen oder widerlegen.') }, { line: 10, note: l('Stating unverified assumptions and not inventing findings keeps the review honest.', 'Unbestätigte Annahmen zu nennen und keine Befunde zu erfinden hält das Review ehrlich.') }] }],
    steps: [
      l('Keep changes small (aim for under ~400 changed lines) and require one human approval.', 'Änderungen klein halten (Ziel unter ~400 geänderten Zeilen) und eine menschliche Freigabe verlangen.'),
      l('Post tool findings (lint, coverage of the diff, mutation survivors) into the PR automatically, so reviewers see them.', 'Werkzeugfunde (Lint, Diff-Abdeckung, überlebende Mutanten) automatisch in den PR posten, damit Reviewer sie sehen.'),
      l('Use a short review checklist: intent, tests for new behaviour, error handling, security-sensitive changes.', 'Eine kurze Review-Checkliste nutzen: Absicht, Tests für neues Verhalten, Fehlerbehandlung, sicherheitsrelevante Änderungen.'),
    ],
    done: l('Main branch requires one human approval; PRs show automated findings; the checklist is in the PR template.', 'Der Hauptbranch verlangt eine menschliche Freigabe; PRs zeigen automatische Funde; die Checkliste steht in der PR-Vorlage.'),
    think: [
      q('An agent opens a 2,000-line PR and all checks are green. What do you ask for before reviewing?', 'Ein Agent öffnet einen PR mit 2.000 Zeilen, alle Checks sind grün. Worum bittet man vor dem Review?',
        'Split it into small, independently reviewable steps, with the intent of each stated. A reviewer cannot meaningfully judge 2,000 lines, and the funnel only works if this layer sees little.',
        'Ihn in kleine, einzeln reviewbare Schritte zu teilen, jeweils mit benannter Absicht. 2.000 Zeilen kann niemand sinnvoll beurteilen, und der Trichter funktioniert nur, wenn diese Schicht wenig sieht.'),
      q('What changes when the author is an agent?', 'Was ändert sich, wenn der Autor ein Agent ist?',
        'The code is fluent and plausible, so mistakes are harder to spot, and the volume is higher. Review intent and tests first, and let tools check what they can.',
        'Der Code wirkt flüssig und plausibel, Fehler sind schwerer zu erkennen, und die Menge ist größer. Zuerst Absicht und Tests prüfen und Werkzeuge prüfen lassen, was sie können.'),
      q('Predict: a reviewer sees a diff of 30 lines with a new `if (pet.reserved)` check. What can they not tell from the diff alone?', 'Vorhersage: Ein Reviewer sieht einen Diff von 30 Zeilen mit einer neuen Prüfung `if (pet.reserved)`. Was kann er allein aus dem Diff nicht erkennen?',
        'Whether the other code paths that reserve pets have the same check, and whether it is atomic. Reviewers see changed lines, not missing ones; ask for tests that show the invariant.',
        'Ob die anderen Codepfade, die Tiere reservieren, dieselbe Prüfung haben und ob sie atomar ist. Reviewer sehen geänderte Zeilen, keine fehlenden; Tests verlangen, die die Invariante zeigen.'),
    ],
    related: ['evals', 'coverage', 'mutation-tests', 'security-scanning'],
  },
  {
    id: 'penetration-tests',
    name: l('Penetration tests', 'Penetrationstests'),
    layer: 'review',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Security experts attack your system the way a real attacker would, and report what they got into.', 'Sicherheitsexperten greifen das System an wie ein echter Angreifer und berichten, wo sie hineinkamen.'),
    catches: l('chained vulnerabilities, broken authorization, business-logic abuse (reserving all pets with one account)', 'verkettete Schwachstellen, kaputte Autorisierung, Missbrauch der Geschäftslogik (alle Tiere mit einem Konto reservieren)'),
    cost: 3,
    feedback: 'days',
    worth: [
      l('Finds what scanners cannot: combinations and abuse of intended features.', 'Findet, was Scanner nicht finden: Kombinationen und Missbrauch gewollter Funktionen.'),
      l('Tests people and process too, such as how fast you notice an intrusion.', 'Prüft auch Menschen und Prozesse, etwa wie schnell ein Einbruch bemerkt wird.'),
      l('Gives a realistic view of what an attacker can reach by chaining several small weaknesses.', 'Gibt ein realistisches Bild davon, was ein Angreifer durch das Verketten mehrerer kleiner Schwächen erreicht.'),
    ],
    limits: [l('A snapshot in time, expensive, and only as good as the testers.', 'Eine Momentaufnahme, teuer und nur so gut wie die Tester.'), l('Turn every finding into an automated check, or it comes back.', 'Jeden Fund in eine automatische Prüfung überführen, sonst kommt er wieder.')],
    ai: l('Agents can run scanner-driven reconnaissance quickly, but creative abuse still needs humans. Whatever the testers find should become a test that the next agent change has to pass.', 'Agenten können scannergestützte Aufklärung schnell erledigen, kreativer Missbrauch braucht aber noch Menschen. Was die Tester finden, sollte ein Test werden, den die nächste Agentenänderung bestehen muss.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['zap', 'nuclei', 'sqlmap'] },
    snippets: [{ lang: "any", file: "zap-baseline.sh",
      description: l("With Docker installed, run this only against a disposable local test app you are authorized to assess. The baseline spider reports passive findings; it does not prove the reservation authorization logic is secure.",
        "Mit installiertem Docker nur gegen eine freigegebene, entbehrliche lokale Test-App ausführen. Der Baseline-Spider meldet passive Funde; er belegt keine sichere Autorisierung der Reservierungslogik."),
      code: `# Docker Desktop: the host app listens on port 3000.
# Review the scan scope before running it.
docker run --rm -t ghcr.io/zaproxy/zaproxy:stable   zap-baseline.py -t http://host.docker.internal:3000
# Exit code 1: FAIL finding; 2: WARN finding; 3: other failure.
# Triage the report. Do not turn every warning into an ignore.`, focus: [{ line: 2, note: l('A scan against the wrong target is unauthorised or useless: confirm the scope first.', 'Ein Scan gegen das falsche Ziel ist unerlaubt oder nutzlos: Kläre zuerst den Geltungsbereich.') }, { line: 3, note: l('The baseline scan is passive and safe against a local copy, so it is a first look, not a full test.', 'Der Baseline-Scan ist passiv und gegen eine lokale Kopie sicher, also ein erster Blick, kein vollständiger Test.') }, { line: 4, note: l('The exit codes let CI tell failure, warning and tool error apart.', 'Die Exit-Codes lassen die CI Fehler, Warnung und Tool-Fehler unterscheiden.') }, { line: 5, note: l('Triage each finding; ignoring every warning bulk-hides the real ones.', 'Bewerte jeden Befund einzeln; alle Warnungen zu ignorieren versteckt die echten.') }] }],
    steps: [
      l('Define scope and rules of engagement in writing; test against staging.', 'Umfang und Spielregeln schriftlich festlegen; gegen Staging testen.'), l('For each finding, write a regression test or scanner rule before fixing.', 'Für jeden Fund vor der Behebung einen Regressionstest oder eine Scannerregel schreiben.'),
      l('Retest after the fixes, and re-run the new regression checks to confirm each finding is closed.', 'Nach den Korrekturen erneut testen und die neuen Regressionsprüfungen ausführen, um zu bestätigen, dass jeder Fund geschlossen ist.'),
    ],
    done: l('All high findings are fixed, and each has an automated check that would catch it again.', 'Alle hohen Funde sind behoben, und jeder hat eine automatische Prüfung, die ihn wieder fangen würde.'),
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
    name: l('Usability tests', 'Usability-Tests'),
    layer: 'review',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Watch a few real people try to complete real tasks with your product, and note where they struggle.', 'Wenigen echten Menschen zusehen, wie sie echte Aufgaben mit dem Produkt erledigen, und notieren, wo sie hängen.'),
    catches: l('confusing flows, misleading labels, steps users cannot find, features nobody understands', 'verwirrende Abläufe, irreführende Beschriftungen, Schritte, die Nutzer nicht finden, Funktionen, die niemand versteht'),
    cost: 2,
    feedback: 'days',
    worth: [
      l('A handful of participants finds most of the big problems.', 'Eine Handvoll Teilnehmender findet die meisten großen Probleme.'), l('Cheap if done early, on prototypes.', 'Billig, wenn früh an Prototypen gemacht.'),
      l('Finds problems that automated checks cannot, because nothing is technically broken, such as a label users misread.', 'Findet Probleme, die automatisierte Prüfungen nicht sehen, weil technisch nichts kaputt ist, etwa eine Beschriftung, die Nutzer falsch verstehen.'),
    ],
    limits: [
      l('Qualitative; it tells you what is hard, not how often it matters (use A/B tests and RUM for that).', 'Qualitativ; sagt, was schwer ist, nicht wie oft es zählt (dafür A/B-Tests und RUM).'),
      l('A few participants do not represent everyone; include people with different skills and assistive technology.', 'Wenige Teilnehmende repräsentieren nicht alle; Menschen mit unterschiedlichen Fähigkeiten und Hilfstechnologien einbeziehen.'),
    ],
    ai: l('Agents build UIs that pass every automated check and still confuse people. Five people trying to reserve a pet will show you in an afternoon.', 'Agenten bauen Oberflächen, die jede automatische Prüfung bestehen und Menschen trotzdem verwirren. Fünf Menschen, die versuchen, ein Tier zu reservieren, zeigen das an einem Nachmittag.'),
    evidence: { general: ev('moderate', f('nielsen1993', 'Problems found follow a diminishing-returns curve; under the model about 5 users find about 85% of problems (the rule is debated).', 'Gefundene Probleme folgen einer Kurve abnehmenden Ertrags; nach dem Modell finden etwa 5 Nutzer etwa 85 % der Probleme (die Regel ist umstritten).')), ai: none() },
    tools: {},
    snippets: [{ lang: "any", file: "reservation-usability.md",
      description: l("Use this session script with a participant. Observe their actions without coaching; an agent can summarise anonymised observations, but cannot replace the participant.",
        "Dieses Sitzungsskript mit einer Testperson nutzen. Ihre Handlungen ohne Hilfestellung beobachten; ein Agent kann anonymisierte Beobachtungen zusammenfassen, die Testperson aber nicht ersetzen."),
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
    steps: [l('Write 3 realistic tasks ("reserve a dog under 3 years for next weekend").', '3 realistische Aufgaben schreiben („reserviere einen Hund unter 3 Jahren für nächstes Wochenende“).'), l('Watch 5 people do them, thinking aloud, without helping; note every hesitation.', '5 Personen dabei zusehen, laut denkend, ohne zu helfen; jedes Zögern notieren.'), l('Fix the top 3 problems and test again.', 'Die 3 größten Probleme beheben und erneut testen.')],
    done: l('Five sessions are documented, and the top problems have fixes or tickets.', 'Fünf Sitzungen sind dokumentiert, und die größten Probleme haben Korrekturen oder Tickets.'),
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
    name: l('On-call experience', 'On-Call-Erfahrung'),
    layer: 'review',
    phases: ['post'],
    fromOverview: true,
    oneLiner: l('The people who get paged learn how the system really fails, and feed that back into design, tests and alerts.', 'Die Menschen, die alarmiert werden, lernen, wie das System wirklich ausfällt, und führen das in Design, Tests und Alarme zurück.'),
    catches: l('noisy alerts, missing runbooks, recurring incidents, failure modes nobody designed for', 'laute Alarme, fehlende Runbooks, wiederkehrende Vorfälle, Fehlerarten, für die niemand entworfen hat'),
    cost: 3,
    feedback: 'days',
    worth: [
      l('Blameless postmortems turn each incident into concrete improvements upstream in the funnel.', 'Schuldfreie Postmortems machen aus jedem Vorfall konkrete Verbesserungen weiter oben im Trichter.'), l('Developers on call write more operable code.', 'Entwickler in Rufbereitschaft schreiben betreibbareren Code.'),
      l('Shows which alerts are useful: those that the person on call acts on, and not the ones they silence.', 'Zeigt, welche Alarme nützlich sind: die, auf die die Person in Bereitschaft reagiert, und nicht die, die sie stummschaltet.'),
    ],
    limits: [
      l('Burnout is real; track alert volume and sleep interruptions.', 'Burnout ist real; Alarmmenge und Schlafunterbrechungen erfassen.'),
      l('Without time to act on the findings, postmortems become paperwork; protect time for the follow-up work.', 'Ohne Zeit, die Erkenntnisse umzusetzen, werden Postmortems zu Papierkram; Zeit für die Folgearbeit einplanen.'),
    ],
    ai: l('If agents write more of the code, the humans on call understand less of it. Make "how would I debug this at 3 a.m.?" part of review, and give every incident a follow-up check upstream.', 'Wenn Agenten mehr Code schreiben, verstehen die Menschen in Rufbereitschaft weniger davon. „Wie debugge ich das um 3 Uhr nachts?“ ins Review aufnehmen und jedem Vorfall eine Folgeprüfung weiter oben geben.'),
    evidence: { general: none(), ai: none() },
    tools: { any: ['alertmanager', 'grafana'] },
    snippets: [{ lang: "any", file: "reservation-runbook.md",
      description: l("Rehearse this runbook during a staging drill. Replace placeholders with actual dashboards, owners and commands. An agent may gather evidence; the responder follows the team’s incident process.",
        "Dieses Runbook in einer Staging-Übung durchspielen. Platzhalter durch echte Dashboards, Verantwortliche und Befehle ersetzen. Ein Agent kann Belege sammeln; die zuständige Person folgt dem Incident-Prozess des Teams."),
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
    steps: [l('After every incident, write a blameless postmortem within a week.', 'Nach jedem Vorfall binnen einer Woche ein schuldfreies Postmortem schreiben.'), l('For each, add at least one check higher in the funnel (test, lint rule, alert, contract) that would have caught it earlier.', 'Für jeden mindestens eine Prüfung weiter oben im Trichter ergänzen (Test, Lint-Regel, Alarm, Vertrag), die ihn früher gefangen hätte.'), l('Review alert noise monthly and delete alerts nobody acts on.', 'Monatlich das Alarmrauschen prüfen und Alarme löschen, auf die niemand reagiert.')],
    done: l('Every incident has a postmortem with at least one upstream check added.', 'Jeder Vorfall hat ein Postmortem mit mindestens einer ergänzten Prüfung weiter oben.'),
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
