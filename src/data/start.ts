import type { L } from './types';
import { l } from './practices/_h';

export interface StartRoute {
  id: string;
  label: L;
  why: L;
  practice: string;
  exercise: L;
  feedback: L;
  done: L;
  next: string;
}

export const START_ROUTES: StartRoute[] = [
  {
    id: 'baseline',
    label: l('I do not know which checks this project has', 'Ich kenne die Prüfungen im Projekt noch nicht'),
    why: l('Start by finding a repeatable baseline. You need to distinguish existing failures from failures caused by the next change.', 'Zuerst eine wiederholbare Baseline finden. Bestehende Fehler müssen von Fehlern der nächsten Änderung unterscheidbar sein.'),
    practice: 'ci',
    exercise: l('Ask the agent to read the project instructions, package/build files and CI configuration. List the existing check commands, what each covers and how long it takes. Run the cheapest checks first and record any existing failures before editing code.', 'Den Agenten Projektanweisungen, Package-/Build-Dateien und CI-Konfiguration lesen lassen. Vorhandene Prüfbefehle mit Abdeckung und Laufzeit auflisten. Die billigsten Prüfungen zuerst ausführen und bestehende Fehler vor Codeänderungen festhalten.'),
    feedback: l('A command list with exit codes and a baseline: pass, existing failure, or not run with a reason. A missing check is a gap to choose deliberately.', 'Eine Befehlsliste mit Exit-Codes und Baseline: bestanden, bestehender Fehler oder mit Begründung nicht ausgeführt. Eine fehlende Prüfung ist eine gezielt zu schließende Lücke.'),
    done: l('A fresh checkout has documented verification commands. You can name the first missing check that would catch a real mistake in this project.', 'Ein frischer Checkout hat dokumentierte Prüfbefehle. Du kannst die erste fehlende Prüfung benennen, die einen echten Fehler in diesem Projekt finden würde.'),
    next: 'type-systems',
  },
  {
    id: 'compiler',
    label: l('Agents make type errors or forget edge cases', 'Agenten machen Typfehler oder vergessen Randfälle'),
    why: l('Start with compiler feedback. Make the agent run it after a small edit, while the relevant code is still in context.', 'Mit Compiler-Feedback beginnen. Der Agent soll es nach einer kleinen Änderung ausführen, solange der betroffene Code noch im Kontext ist.'),
    practice: 'type-systems',
    exercise: l('Try the four revisions in the type-systems exercise. Then find an optional value or unchecked lookup in your project. In a scratch branch, make one small unsafe change and run the existing type checker. Give the diagnostic to the agent and ask for a guard without casts or ignore comments.', 'Die vier Versionen in der Type-Systems-Übung ausprobieren. Danach im eigenen Projekt einen optionalen Wert oder ungeprüften Lookup suchen. In einem Scratch-Branch eine kleine unsichere Änderung machen und den vorhandenen Type-Checker starten. Dem Agenten die Diagnostic geben und einen Guard ohne Casts oder Ignore-Kommentare verlangen.'),
    feedback: l('First a file, line and type error; after the fix, the same command passes. A behaviour test still checks the business rule the types cannot express.', 'Zuerst Datei, Zeile und Typfehler; nach der Korrektur besteht derselbe Befehl. Ein Verhaltenstest prüft weiter die Fachregel, die die Typen nicht ausdrücken können.'),
    done: l('The check catches the unsafe version, accepts the guard and runs in CI. Compiler settings, existing tests and suppression counts are unchanged by the fix.', 'Die Prüfung erkennt die unsichere Version, akzeptiert den Guard und läuft in der CI. Compiler-Einstellungen, bestehende Tests und die Anzahl der Unterdrückungen bleiben durch die Korrektur unverändert.'),
    next: 'lint',
  },
  {
    id: 'behaviour',
    label: l('The agent builds the wrong behaviour', 'Der Agent implementiert das falsche Verhalten'),
    why: l('Start with an agreed example of success and failure. The agent needs feedback about your requirement, not just its own interpretation.', 'Mit einem vereinbarten Erfolgs- und Fehlerbeispiel beginnen. Der Agent braucht Feedback zur Anforderung, nicht nur zu seiner eigenen Interpretation.'),
    practice: 'tdd',
    exercise: l('Choose one rule from your project. For the petstore: Anna can reserve Rex; Ben must then be rejected and Anna must remain the owner. Write or approve a focused test before implementation. Confirm it fails for the intended reason, then ask the agent to change production code only.', 'Eine Regel aus dem eigenen Projekt wählen. Im Petstore: Anna kann Rex reservieren; Ben muss danach abgelehnt werden, und Anna muss reserviert bleiben. Vor der Implementierung einen gezielten Test schreiben oder freigeben. Den erwarteten Fehler bestätigen, dann den Agenten nur den Produktionscode ändern lassen.'),
    feedback: l('A failing assertion states expected versus actual behaviour. The agent fixes that failure and reruns the focused test, then the full gate.', 'Eine fehlschlagende Assertion zeigt erwartetes und tatsächliches Verhalten. Der Agent behebt diesen Fehler und startet den gezielten Test, danach das gesamte Gate.'),
    done: l('The approved test fails on the old behaviour and passes on the fix. Existing tests and the approved test remain unchanged during implementation.', 'Der freigegebene Test scheitert am alten Verhalten und besteht mit der Korrektur. Bestehende Tests und der freigegebene Test bleiben während der Implementierung unverändert.'),
    next: 'test-integrity',
  },
  {
    id: 'green',
    label: l('Tests pass, but bugs still reach users', 'Tests bestehen, aber Fehler erreichen Nutzer'),
    why: l('Start by checking the quality of the feedback. Green tests are useful only if they fail when the relevant behaviour is wrong.', 'Zuerst die Qualität des Feedbacks prüfen. Grüne Tests helfen nur, wenn sie bei falschem relevantem Verhalten scheitern.'),
    practice: 'mutation-tests',
    exercise: l('Choose one important rule with an existing test. Try the mutation simulator, then use a mutation tool on that small module. Inspect one surviving mutant: is it equivalent, unreachable, or a gap in an assertion? Add a requirement-based test for a real gap and approve it before asking the agent to implement a fix.', 'Eine wichtige Regel mit vorhandenem Test wählen. Den Mutation-Simulator ausprobieren, dann ein Mutation-Tool auf das kleine Modul anwenden. Einen überlebenden Mutanten prüfen: äquivalent, unerreichbar oder Lücke in einer Assertion? Für eine echte Lücke einen anforderungsbasierten Test ergänzen und vor der Implementierung durch den Agenten freigeben.'),
    feedback: l('A report identifies a changed behaviour that the tests did not reject. The new assertion should kill that mutant without weakening other assertions.', 'Ein Bericht zeigt geändertes Verhalten, das die Tests nicht abgelehnt haben. Die neue Assertion soll diesen Mutanten töten, ohne andere Assertions abzuschwächen.'),
    done: l('You can explain one surviving mutant. A meaningful new test catches a real gap, or you document why no change is needed. Agents cannot silently edit the tests judging them.', 'Du kannst einen überlebenden Mutanten erklären. Ein sinnvoller neuer Test erkennt eine echte Lücke, oder du dokumentierst, warum keine Änderung nötig ist. Agenten können ihre Prüfgrundlage nicht unbemerkt bearbeiten.'),
    next: 'property-based-tests',
  },
  {
    id: 'boundaries',
    label: l('Failures happen between services or under concurrency', 'Fehler entstehen zwischen Services oder bei Nebenläufigkeit'),
    why: l('Start at the boundary where the failure occurs. A unit test with a mock may remove the very behaviour you need to check.', 'An der Grenze beginnen, an der der Fehler entsteht. Ein Unit-Test mit Mock kann genau das zu prüfende Verhalten entfernen.'),
    practice: 'integration-tests',
    exercise: l('Choose one database or service boundary. Reproduce the failure with the real dependency in an isolated test environment. For double reservation, send two competing requests and assert one success, one rejection and one stored owner. Feed the failing result back to the agent.', 'Eine Datenbank- oder Service-Grenze wählen. Den Fehler mit der echten Abhängigkeit in einer isolierten Testumgebung nachstellen. Für doppelte Reservierung zwei konkurrierende Requests senden und einen Erfolg, eine Ablehnung und genau eine gespeicherte Person prüfen. Dem Agenten das fehlschlagende Ergebnis geben.'),
    feedback: l('The failure shows the actual response and persisted state. If the schedule is hard to reproduce, model the competing steps in the formal-verification simulator.', 'Der Fehler zeigt die tatsächliche Antwort und den gespeicherten Zustand. Ist der Ablauf schwer reproduzierbar, die konkurrierenden Schritte im Formal-Verification-Simulator modellieren.'),
    done: l('The reproduction fails without the fix and passes with it using isolated, repeatable data. Record which schedules and dependency versions were exercised.', 'Die Reproduktion scheitert ohne Korrektur und besteht mit ihr auf isolierten, wiederholbaren Daten. Geprüfte Abläufe und Versionen der Abhängigkeiten festhalten.'),
    next: 'formal-verification',
  },
  {
    id: 'production',
    label: l('Problems appear only after release', 'Probleme zeigen sich erst nach dem Release'),
    why: l('Start with a user-visible signal and a release decision. Pre-production checks cannot reproduce every workload or environment.', 'Mit einem für Nutzer sichtbaren Signal und einer Release-Entscheidung beginnen. Pre-production-Prüfungen bilden nicht jeden Workload und jede Umgebung ab.'),
    practice: 'monitoring',
    exercise: l('Pick a critical user journey. Define success, failure, a measurement window and the person who responds. In staging, inject one controlled failure and confirm the signal changes. Write the rollback condition before trying a small canary rollout.', 'Einen kritischen Nutzerablauf wählen. Erfolg, Fehler, Messfenster und verantwortliche Person festlegen. In Staging einen kontrollierten Fehler auslösen und die Signaländerung bestätigen. Vor einem kleinen Canary-Rollout die Rollback-Bedingung aufschreiben.'),
    feedback: l('A metric, log or trace shows the controlled failure and identifies the release. The alert reaches its intended responder in the staging drill.', 'Eine Metrik, ein Log oder Trace zeigt den kontrollierten Fehler und das Release. Der Alert erreicht in der Staging-Übung die vorgesehene Person.'),
    done: l('The signal and rollback condition were exercised in staging. You know who decides whether to continue a rollout; any production rollout follows your normal approval process.', 'Signal und Rollback-Bedingung wurden in Staging geprüft. Es ist klar, wer über die Fortsetzung eines Rollouts entscheidet; ein Produktions-Rollout folgt dem üblichen Freigabeprozess.'),
    next: 'canarying',
  },
];

/** Copy for the "Diagnose my project" page: the problem chooser and the feedback loop. */
export const DIAGNOSE_COPY = {
  title: l('Diagnose my project', 'Mein Projekt diagnostizieren'),
  description: l('Pick the problem you recognise in your own project and get a first check, a small exercise and a task to copy for your coding agent.', 'Das Problem im eigenen Projekt wählen und eine erste Prüfung, eine kleine Übung und eine Aufgabe für den Coding-Agenten erhalten.'),
  intro: l('Bring one real task from your project. Choose the problem you recognise, add one useful check, and let its output guide the next edit.', 'Eine echte Aufgabe aus deinem Projekt mitbringen. Ein bekanntes Problem wählen, eine nützliche Prüfung ergänzen und deren Ausgabe für die nächste Änderung nutzen.'),
  tour: l('New to verification? The guided tour introduces the ideas first.', 'Neu beim Thema Verifikation? Der geführte Einstieg erklärt zuerst die Grundlagen.'),
  tourLink: l('Start here', 'Hier starten'),
  chooser: l('Where should I start?', 'Wo sollte ich anfangen?'),
  chooseHint: l('Choose the closest match. If several apply, first establish a baseline, then address the highest-impact failure you can reproduce.', 'Die passendste Beschreibung wählen. Treffen mehrere zu, zuerst eine Baseline erstellen und danach den folgenreichsten reproduzierbaren Fehler angehen.'),
  first: l('Your first check', 'Deine erste Prüfung'),
  exercise: l('Try it in your project', 'Im eigenen Projekt ausprobieren'),
  feedback: l('Feedback to look for', 'Darauf im Feedback achten'),
  done: l('Done when', 'Fertig, wenn'),
  next: l('Next layer', 'Nächste Schicht'),
  open: l('Open the practice', 'Praktik öffnen'),
  copy: l('Copy this task for your agent', 'Diese Aufgabe für den Agenten kopieren'),
  preview: l('Read the task before copying', 'Aufgabe vor dem Kopieren lesen'),
  loop: l('Use one feedback loop', 'Einen Feedback-Loop nutzen'),
  loopHint: l('Use the project’s actual commands. Passing one check earns the next check; it does not prove the whole change correct.', 'Die tatsächlichen Projektbefehle verwenden. Eine bestandene Prüfung führt zur nächsten; sie beweist nicht die Korrektheit der gesamten Änderung.'),
};

/** Copy for the "Start here" page: the guided tour. */
export const START_COPY = {
  title: l('Start here', 'Hier starten'),
  description: l('A guided tour in eight steps, from the funnel to a canary rollout, on one shared petstore example. About 60–90 minutes.', 'Ein geführter Einstieg in acht Schritten, vom Trichter bis zum Canary-Rollout, an einem durchgehenden Petstore-Beispiel. Etwa 60–90 Minuten.'),
  intro: l('For developers who let coding agents write code and want to know whether it works. No background in testing theory needed.', 'Für Entwickler, die Code von Coding-Agenten schreiben lassen und wissen wollen, ob er funktioniert. Vorwissen in Testtheorie ist nicht nötig.'),
  after: l('Afterwards you can', 'Danach kannst du'),
  outcomes: [
    l('pick the cheapest check that would have caught a given bug,', 'die billigste Prüfung wählen, die einen bestimmten Fehler gefunden hätte,'),
    l('give a coding agent compiler, lint and test feedback it can act on,', 'einem Coding-Agenten Compiler-, Lint- und Testfeedback geben, mit dem er arbeiten kann,'),
    l('tell whether green tests actually reject wrong behaviour,', 'beurteilen, ob grüne Tests falsches Verhalten wirklich ablehnen,'),
    l('decide when a rollout should stop.', 'entscheiden, wann ein Rollout gestoppt werden sollte.'),
  ],
  timeLabel: l('Time', 'Zeit'),
  time: l('About 60–90 minutes in total. Each step takes 5–15 minutes and stands on its own, so you can stop after any step.', 'Insgesamt etwa 60–90 Minuten. Jeder Schritt dauert 5–15 Minuten und steht für sich; du kannst nach jedem Schritt aufhören.'),
  begin: l('Begin with step 1', 'Mit Schritt 1 beginnen'),
  /** {n} = step number; set by the progress script */
  resume: l('Continue with step {n}', 'Weiter mit Schritt {n}'),
  allOpened: l('Review the tour from step 1', 'Den Einstieg ab Schritt 1 wiederholen'),
  example: l('The running example', 'Das durchgehende Beispiel'),
  exampleText: l('A petstore where people reserve pets for adoption. Most exercises check one rule:', 'Ein Petstore, in dem Menschen Tiere zur Adoption reservieren. Die meisten Übungen prüfen eine Regel:'),
  rule: l('A pet must never be reserved twice.', 'Ein Tier darf nie doppelt reserviert werden.'),
  reservedFor: l('reserved for Anna', 'für Anna reserviert'),
  rejected: l('rejected: already reserved', 'abgelehnt: bereits reserviert'),
  fee: l('Some exercises also use the adoption fee: a dog costs 120 €, a cat 80 €.', 'Einige Übungen nutzen auch die Adoptionsgebühr: Ein Hund kostet 120 €, eine Katze 80 €.'),
  learn: l('The tour in eight steps', 'Der Einstieg in acht Schritten'),
  learnHint: l('In each step: predict an outcome, run a check, explain the result, then transfer one idea to your project.', 'In jedem Schritt: ein Ergebnis vorhersagen, eine Prüfung starten, das Ergebnis erklären und danach eine Idee ins eigene Projekt übertragen.'),
  sim: l('Simulator in the browser', 'Simulator im Browser'),
  opened: l('opened', 'geöffnet'),
  /** {n} and {total} are filled in by the progress script */
  progress: l('{n} of {total} steps opened. Saved in this browser only.', '{n} von {total} Schritten geöffnet. Nur in diesem Browser gespeichert.'),
  reset: l('Reset progress', 'Fortschritt zurücksetzen'),
  whatNext: l('What next', 'Wie es weitergeht'),
  diagnose: l('Have a concrete problem in your own project?', 'Ein konkretes Problem im eigenen Projekt?'),
  diagnoseHint: l('Pick the closest of six common problems. You get a first check, an exercise for your project and a task to copy for your agent.', 'Aus sechs häufigen Problemen das passende wählen. Du erhältst eine erste Prüfung, eine Übung für dein Projekt und eine Aufgabe für deinen Agenten.'),
  guides: l('Ready for a tool setup?', 'Bereit für ein Tool-Setup?'),
  guidesHint: l('The TLA+ and Dafny guides include installation, recorded output and a deliberate failure. Use My stack to find tools for your language.', 'Die TLA+- und Dafny-Guides enthalten Installation, aufgezeichnete Ausgabe und einen gezielten Fehler. Unter Mein Stack findest du Tools für deine Sprache.'),
};

export const START_LOOP: { title: L; text: L }[] = [
  { title: l('1. Agree on the rule', '1. Regel festlegen'), text: l('Describe one observable success and one failure. Approve the expected behaviour before the agent implements it.', 'Einen beobachtbaren Erfolg und einen Fehler beschreiben. Das erwartete Verhalten vor der Implementierung durch den Agenten freigeben.') },
  { title: l('2. Run the cheapest relevant check', '2. Billigste passende Prüfung starten'), text: l('After a small edit: compiler and lint first, then the focused behaviour check. Capture the command, exit code and relevant output.', 'Nach einer kleinen Änderung: zuerst Compiler und Lint, dann die gezielte Verhaltensprüfung. Befehl, Exit-Code und relevante Ausgabe festhalten.') },
  { title: l('3. Return the failure to the agent', '3. Fehler an den Agenten zurückgeben'), text: l('Include the requirement, diagnostic or counterexample, and affected file. Ask for the smallest fix; keep approved tests and check settings fixed.', 'Anforderung, Diagnostic oder Gegenbeispiel und betroffene Datei mitgeben. Die kleinste Korrektur verlangen; freigegebene Tests und Prüfeinstellungen beibehalten.') },
  { title: l('4. Rerun, then widen the check', '4. Wiederholen, dann breiter prüfen'), text: l('Rerun the exact failed command. When it passes, run the project’s full gate and review the diff. Report what the checks still cannot establish. If the same failure repeats, reduce it and revisit the assumption.', 'Genau den fehlgeschlagenen Befehl wiederholen. Besteht er, das vollständige Projekt-Gate ausführen und den Diff prüfen. Festhalten, was die Prüfungen weiter nicht belegen. Wiederholt sich derselbe Fehler, ihn reduzieren und die Annahme prüfen.') },
];

export interface TourStep {
  /** stable id, used to remember progress */
  id: string;
  /** a practice id, or a page path with its own title */
  practice?: string;
  path?: string;
  title?: L;
  exercise: L;
}

export const START_TOUR: TourStep[] = [
  { id: 'funnel', path: '', title: l('The funnel', 'Der Trichter'), exercise: l('Choose a recent bug. Which cheap check could have caught it earlier?', 'Einen aktuellen Fehler wählen. Welche billige Prüfung hätte ihn früher finden können?') },
  { id: 'why-layers', path: 'why-layers/', title: l('Why one layer is not enough', 'Warum eine Schicht nicht reicht'), exercise: l('Name one claim your green test suite does not establish.', 'Eine Aussage benennen, die deine grüne Testsuite nicht belegt.') },
  { id: 'type-systems', practice: 'type-systems', exercise: l('Predict all four compiler revisions; compare a guard with a non-null assertion.', 'Alle vier Compiler-Versionen vorhersagen; Guard und Non-null Assertion vergleichen.') },
  { id: 'lint', practice: 'lint', exercise: l('Turn one recurring mistake into a rule. Plant the mistake and confirm the linter rejects it.', 'Einen wiederkehrenden Fehler als Regel formulieren. Den Fehler einschleusen und die Ablehnung durch den Linter bestätigen.') },
  { id: 'unit-tests', practice: 'unit-tests', exercise: l('Build test cases in the simulator that reject every buggy implementation without rejecting the correct one.', 'Im Simulator Testfälle bauen, die alle fehlerhaften Implementierungen ablehnen und die korrekte akzeptieren.') },
  { id: 'mutation-tests', practice: 'mutation-tests', exercise: l('Run the weak tests, inspect a survivor and strengthen one assertion. Predict whether it will now fail.', 'Schwache Tests starten, einen überlebenden Mutanten ansehen und eine Assertion verbessern. Vorhersagen, ob sie nun scheitert.') },
  { id: 'property-based-tests', practice: 'property-based-tests', exercise: l('Find a counterexample and inspect the shrink. Write one invariant for your own domain.', 'Ein Gegenbeispiel finden und den Shrink ansehen. Eine Invariante für die eigene Domäne schreiben.') },
  { id: 'canarying', practice: 'canarying', exercise: l('Choose a rollout threshold. Observe the signal and decide when to roll back.', 'Eine Rollout-Schwelle wählen. Das Signal beobachten und entscheiden, wann ein Rollback nötig ist.') },
];

export function startAgentPrompt(route: StartRoute, locale: 'en' | 'de'): string {
  const en = locale === 'en';
  return [
    en ? `Task: ${route.label.en}` : `Aufgabe: ${route.label.de}`,
    '',
    en ? 'Read repository instructions and existing build/test/CI commands first. Identify the stack; use its existing tools. Record the baseline and existing failures before changing code.' : 'Zuerst Repository-Anweisungen und vorhandene Build-/Test-/CI-Befehle lesen. Stack ermitteln und vorhandene Tools verwenden. Baseline und bestehende Fehler vor Codeänderungen festhalten.',
    '', route.exercise[locale], '',
    en ? `Expected feedback: ${route.feedback.en}` : `Erwartetes Feedback: ${route.feedback.de}`,
    '',
    en ? 'Work on one small change. After each edit, run the cheapest relevant check and use its diagnostic or counterexample for the next fix. Rerun the exact failing command, then the full project gate. If the same failure repeats, minimise it and revisit your hypothesis.' : 'An einer kleinen Änderung arbeiten. Nach jeder Änderung die billigste passende Prüfung starten und Diagnostic oder Gegenbeispiel für die nächste Korrektur nutzen. Genau den fehlgeschlagenen Befehl wiederholen, danach das gesamte Projekt-Gate. Wiederholt sich derselbe Fehler, ihn minimieren und die Hypothese prüfen.',
    '',
    en ? 'Do not weaken, skip or delete existing tests. Do not alter approved tests during implementation, disable checks, add casts/ignore comments to hide failures, or run experiments against production. Report any needed tool installation or access before proceeding with that part.' : 'Bestehende Tests nicht abschwächen, überspringen oder löschen. Freigegebene Tests während der Implementierung nicht ändern, Prüfungen nicht abschalten, Fehler nicht mit Casts/Ignore-Kommentaren verbergen und Experimente nicht gegen Produktion ausführen. Nötige Tool-Installationen oder Zugriffe vor diesem Teil melden.',
    '',
    en ? `Done when: ${route.done.en}` : `Fertig, wenn: ${route.done.de}`,
    '',
    en ? 'Report changed files, exact commands with exit codes and relevant output, the failure before the fix, the result after it, and remaining limits. Do not claim a check ran if it did not.' : 'Geänderte Dateien, genaue Befehle mit Exit-Codes und relevanter Ausgabe, den Fehler vor der Korrektur, das Ergebnis danach und verbleibende Grenzen berichten. Nicht behaupten, eine Prüfung sei gelaufen, wenn sie nicht lief.',
  ].join('\n');
}
