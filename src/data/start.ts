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
    why: l('First, find a baseline that you can repeat. Then you can separate existing failures from failures that the next change causes.', 'Zuerst eine wiederholbare Baseline finden. Dann lassen sich bestehende Fehler von Fehlern trennen, die die nächste Änderung verursacht.'),
    practice: 'ci',
    exercise: l('Ask the agent to read the project instructions, the package and build files and the CI configuration. Let it list the existing check commands, what each command covers and how long it takes. Run the cheapest checks first. Record existing failures before you change code.', 'Den Agenten Projektanweisungen, Package- und Build-Dateien und CI-Konfiguration lesen lassen. Vorhandene Prüfbefehle mit Abdeckung und Laufzeit auflisten lassen. Die billigsten Prüfungen zuerst ausführen. Bestehende Fehler vor Codeänderungen festhalten.'),
    feedback: l('A list of commands with exit codes and a baseline for each command: pass, existing failure, or not run with a reason. A missing check is a gap. Decide on purpose which gap you close first.', 'Eine Befehlsliste mit Exit-Codes und einer Baseline pro Befehl: bestanden, bestehender Fehler oder mit Begründung nicht ausgeführt. Eine fehlende Prüfung ist eine Lücke. Bewusst entscheiden, welche Lücke zuerst geschlossen wird.'),
    done: l('A fresh checkout has documented check commands. You can name the first missing check that can catch a real bug in this project.', 'Ein frischer Checkout hat dokumentierte Prüfbefehle. Du kannst die erste fehlende Prüfung nennen, die einen echten Fehler in diesem Projekt finden kann.'),
    next: 'type-systems',
  },
  {
    id: 'compiler',
    label: l('Agents make type errors or forget edge cases', 'Agenten machen Typfehler oder vergessen Randfälle'),
    why: l('Start with compiler feedback. Let the agent run the compiler after each small change, while the relevant code is still in its context.', 'Mit Compiler-Feedback beginnen. Der Agent soll den Compiler nach jeder kleinen Änderung ausführen, solange der betroffene Code noch im Kontext ist.'),
    practice: 'type-systems',
    exercise: l('Try the four versions in the type-systems exercise. Then find an optional value or an unchecked lookup in your project. In a scratch branch, make one small unsafe change. Run the existing type checker. Give the diagnostic to the agent. Ask for a guard without casts or ignore comments.', 'Die vier Versionen in der Type-Systems-Übung ausprobieren. Danach im eigenen Projekt einen optionalen Wert oder einen ungeprüften Lookup suchen. In einem Scratch-Branch eine kleine unsichere Änderung machen. Den vorhandenen Type-Checker starten. Dem Agenten die Diagnostic geben. Einen Guard ohne Casts oder Ignore-Kommentare verlangen.'),
    feedback: l('First you get a file, a line and a type error. After the fix, the same command passes. A behaviour test still checks the business rule that the types cannot express.', 'Zuerst kommen Datei, Zeile und Typfehler. Nach der Korrektur besteht derselbe Befehl. Ein Verhaltenstest prüft weiter die Fachregel, die die Typen nicht ausdrücken können.'),
    done: l('The check rejects the unsafe version, accepts the guard and runs in CI. The fix does not change compiler settings, existing tests or the number of suppressions.', 'Die Prüfung lehnt die unsichere Version ab, akzeptiert den Guard und läuft in der CI. Die Korrektur ändert keine Compiler-Einstellungen, keine bestehenden Tests und nicht die Anzahl der Unterdrückungen.'),
    next: 'lint',
  },
  {
    id: 'behaviour',
    label: l('The agent builds the wrong behaviour', 'Der Agent implementiert das falsche Verhalten'),
    why: l('Start with an agreed example of success and of failure. The agent needs feedback about your requirement, not only about its own interpretation.', 'Mit einem vereinbarten Erfolgs- und Fehlerbeispiel beginnen. Der Agent braucht Feedback zur Anforderung, nicht nur zu seiner eigenen Interpretation.'),
    practice: 'tdd',
    exercise: l('Select one rule from your project, for example the petstore rule. Anna reserves Rex; then the petstore must reject Ben, and Rex stays reserved for Anna. Write or approve a focused test before the implementation. Confirm that the test fails for the expected reason. Then let the agent change only the production code.', 'Eine Regel aus dem eigenen Projekt wählen, zum Beispiel die Petstore-Regel. Anna reserviert Rex; danach muss der Petstore Ben ablehnen, und Rex bleibt für Anna reserviert. Vor der Implementierung einen gezielten Test schreiben oder freigeben. Bestätigen, dass der Test aus dem erwarteten Grund scheitert. Danach den Agenten nur den Produktionscode ändern lassen.'),
    feedback: l('A failed assertion shows the expected and the actual behaviour. The agent fixes that failure and runs the focused test again, then the full gate.', 'Eine gescheiterte Assertion zeigt erwartetes und tatsächliches Verhalten. Der Agent behebt diesen Fehler und startet den gezielten Test erneut, danach das gesamte Gate.'),
    done: l('The approved test fails on the old behaviour and passes with the fix. Nobody changes the existing tests or the approved test during the implementation.', 'Der freigegebene Test scheitert am alten Verhalten und besteht mit der Korrektur. Während der Implementierung ändert niemand die bestehenden Tests oder den freigegebenen Test.'),
    next: 'test-integrity',
  },
  {
    id: 'green',
    label: l('Tests pass, but bugs still reach users', 'Tests bestehen, aber Fehler erreichen Nutzer'),
    why: l('First check the quality of the feedback. Green tests help only if they fail when the relevant behaviour is wrong.', 'Zuerst die Qualität des Feedbacks prüfen. Grüne Tests helfen nur, wenn sie bei falschem relevantem Verhalten scheitern.'),
    practice: 'mutation-tests',
    exercise: l('Select one important rule that has a test. Try the mutation simulator. Then run a mutation tool on that small module. Examine one surviving mutant: is it equivalent, unreachable, or a gap in an assertion? For a real gap, add a test that comes from the requirement. Approve that test before the agent implements a fix.', 'Eine wichtige Regel mit vorhandenem Test wählen. Den Mutation-Simulator ausprobieren. Danach ein Mutation-Tool auf das kleine Modul anwenden. Einen überlebenden Mutanten prüfen: äquivalent, unerreichbar oder Lücke in einer Assertion? Für eine echte Lücke einen Test aus der Anforderung ergänzen. Diesen Test freigeben, bevor der Agent eine Korrektur implementiert.'),
    feedback: l('A report shows a changed behaviour that the tests did not reject. The new assertion kills that mutant and does not weaken other assertions.', 'Ein Bericht zeigt geändertes Verhalten, das die Tests nicht abgelehnt haben. Die neue Assertion tötet diesen Mutanten und schwächt keine anderen Assertions ab.'),
    done: l('You can explain one surviving mutant. A useful new test catches a real gap, or you document why no change is necessary. Agents cannot change the tests that judge them without notice.', 'Du kannst einen überlebenden Mutanten erklären. Ein sinnvoller neuer Test findet eine echte Lücke, oder du dokumentierst, warum keine Änderung nötig ist. Agenten können ihre Prüfgrundlage nicht unbemerkt ändern.'),
    next: 'property-based-tests',
  },
  {
    id: 'boundaries',
    label: l('Failures occur between services or under concurrency', 'Fehler entstehen zwischen Services oder bei Nebenläufigkeit'),
    why: l('Start at the boundary where the failure occurs. A unit test with a mock can remove exactly the behaviour that you must check.', 'An der Grenze beginnen, an der der Fehler entsteht. Ein Unit-Test mit Mock kann genau das Verhalten entfernen, das zu prüfen ist.'),
    practice: 'integration-tests',
    exercise: l('Select one database or service boundary. Reproduce the failure with the real dependency in an isolated test environment. For a double reservation, send two competing requests. Assert one success, one rejection and one stored owner. Give the failed result to the agent.', 'Eine Datenbank- oder Service-Grenze wählen. Den Fehler mit der echten Abhängigkeit in einer isolierten Testumgebung nachstellen. Für eine doppelte Reservierung zwei konkurrierende Requests senden. Einen Erfolg, eine Ablehnung und genau eine gespeicherte Person prüfen. Dem Agenten das gescheiterte Ergebnis geben.'),
    feedback: l('The failure shows the actual response and the stored state. If the order of events is hard to reproduce, model the competing steps in the formal-verification simulator.', 'Der Fehler zeigt die tatsächliche Antwort und den gespeicherten Zustand. Ist die Reihenfolge schwer reproduzierbar, die konkurrierenden Schritte im Formal-Verification-Simulator modellieren.'),
    done: l('The reproduction fails without the fix and passes with it, on isolated data that you can repeat. Record which orders of events and which dependency versions you tested.', 'Die Reproduktion scheitert ohne Korrektur und besteht mit ihr, auf isolierten, wiederholbaren Daten. Festhalten, welche Abläufe und welche Versionen der Abhängigkeiten geprüft wurden.'),
    next: 'formal-verification',
  },
  {
    id: 'production',
    label: l('Problems appear only after release', 'Probleme zeigen sich erst nach dem Release'),
    why: l('Start with a signal that users see and with a decision about the release. Checks before production cannot reproduce every workload or environment.', 'Mit einem für Nutzer sichtbaren Signal und einer Release-Entscheidung beginnen. Prüfungen vor der Produktion bilden nicht jeden Workload und jede Umgebung ab.'),
    practice: 'monitoring',
    exercise: l('Select a critical user journey. Define success, failure, a measurement window and the person who responds. In staging, cause one controlled failure. Confirm that the signal changes. Write the rollback condition before you try a small canary rollout.', 'Einen kritischen Nutzerablauf wählen. Erfolg, Fehler, Messfenster und verantwortliche Person festlegen. In Staging einen kontrollierten Fehler auslösen. Bestätigen, dass sich das Signal ändert. Vor einem kleinen Canary-Rollout die Rollback-Bedingung aufschreiben.'),
    feedback: l('A metric, a log or a trace shows the controlled failure and the release. In the staging drill, the alert reaches the person who must respond.', 'Eine Metrik, ein Log oder ein Trace zeigt den kontrollierten Fehler und das Release. In der Staging-Übung erreicht der Alert die vorgesehene Person.'),
    done: l('You tested the signal and the rollback condition in staging. You know who decides if a rollout continues. A production rollout follows your normal approval process.', 'Signal und Rollback-Bedingung sind in Staging geprüft. Es ist klar, wer über die Fortsetzung eines Rollouts entscheidet. Ein Produktions-Rollout folgt dem üblichen Freigabeprozess.'),
    next: 'canarying',
  },
];

/** Copy for the "Diagnose my project" page: the problem chooser and the feedback loop. */
export const DIAGNOSE_COPY = {
  title: l('Diagnose my project', 'Mein Projekt diagnostizieren'),
  description: l('Select a problem that you see in your own project. You get a first check, a small exercise and a task for your coding agent.', 'Ein Problem aus dem eigenen Projekt wählen. Du bekommst eine erste Prüfung, eine kleine Übung und eine Aufgabe für deinen Coding-Agenten.'),
  intro: l('Use this page if you have a concrete problem in your own project. Have one real task ready. Select the closest problem below. Add the check that it suggests. Use the output of that check for your next change.', 'Diese Seite hilft, wenn du ein konkretes Problem im eigenen Projekt hast. Eine echte Aufgabe bereithalten. Unten das passende Problem wählen. Die vorgeschlagene Prüfung ergänzen. Ihre Ausgabe für die nächste Änderung nutzen.'),
  tour: l('If verification is new to you, start with the guided tour. It explains the basic ideas first.', 'Ist Verifikation neu für dich, zuerst den geführten Einstieg nutzen. Er erklärt die Grundideen.'),
  tourLink: l('Start here', 'Hier starten'),
  /** e2e tests match this text in the Markdown twin: keep it */
  chooser: l('Where should I start?', 'Wo sollte ich anfangen?'),
  chooseHint: l('Select the closest problem. If more than one problem applies, first make a baseline. Then fix the failure with the highest impact that you can reproduce.', 'Das passendste Problem wählen. Treffen mehrere zu, zuerst eine Baseline erstellen. Danach den reproduzierbaren Fehler mit der größten Wirkung angehen.'),
  first: l('Your first check', 'Deine erste Prüfung'),
  exercise: l('Try it in your project', 'Im eigenen Projekt ausprobieren'),
  feedback: l('Feedback to expect', 'Erwartetes Feedback'),
  done: l('Done when', 'Fertig, wenn'),
  next: l('Next layer', 'Nächste Schicht'),
  open: l('Open the practice', 'Praktik öffnen'),
  copy: l('Copy this task for your agent', 'Diese Aufgabe für den Agenten kopieren'),
  preview: l('Read the task before you copy it', 'Aufgabe vor dem Kopieren lesen'),
  loop: l('Use one feedback loop', 'Einen Feedback-Loop nutzen'),
  loopHint: l('Use the real commands of the project. If one check passes, go to the next check. A passed check does not prove that the whole change is correct.', 'Die echten Befehle des Projekts verwenden. Besteht eine Prüfung, zur nächsten Prüfung gehen. Eine bestandene Prüfung beweist nicht, dass die ganze Änderung korrekt ist.'),
};

/** Copy for the "Start here" page: the guided tour. */
export const START_COPY = {
  title: l('Start here', 'Hier starten'),
  description: l('A guided tour in eight steps, from the funnel to a canary rollout, with one petstore example. It takes about 60–90 minutes.', 'Ein geführter Einstieg in acht Schritten, vom Trichter bis zum Canary-Rollout, an einem Petstore-Beispiel. Er dauert etwa 60–90 Minuten.'),
  intro: l('This guided tour is for developers who let coding agents write code and want to know if the code works. Use it if verification is new to you. You need no background in testing theory.', 'Dieser geführte Einstieg ist für Entwickler, die Code von Coding-Agenten schreiben lassen und wissen wollen, ob er funktioniert. Er passt, wenn Verifikation neu für dich ist. Vorwissen in Testtheorie ist nicht nötig.'),
  after: l('Afterwards you can', 'Danach kannst du'),
  outcomes: [
    l('select the cheapest check for a given bug,', 'die billigste Prüfung für einen bestimmten Fehler wählen,'),
    l('give a coding agent compiler, lint and test feedback that it can use,', 'einem Coding-Agenten Compiler-, Lint- und Testfeedback geben, mit dem er arbeiten kann,'),
    l('see if green tests really reject wrong behaviour,', 'beurteilen, ob grüne Tests falsches Verhalten wirklich ablehnen,'),
    l('decide when a rollout must stop.', 'entscheiden, wann ein Rollout stoppen muss.'),
  ],
  timeLabel: l('Time', 'Zeit'),
  time: l('The tour takes about 60–90 minutes. Each step takes 5–15 minutes and is complete in itself. You can stop after each step.', 'Der Einstieg dauert etwa 60–90 Minuten. Jeder Schritt dauert 5–15 Minuten und ist in sich abgeschlossen. Du kannst nach jedem Schritt aufhören.'),
  begin: l('Begin with step 1', 'Mit Schritt 1 beginnen'),
  /** {n} = step number; set by the progress script */
  resume: l('Continue with step {n}', 'Weiter mit Schritt {n}'),
  allOpened: l('Do the tour again from step 1', 'Den Einstieg ab Schritt 1 wiederholen'),
  example: l('The running example', 'Das durchgehende Beispiel'),
  exampleText: l('The examples use a petstore where people reserve pets for adoption. Most exercises check one rule:', 'Die Beispiele nutzen einen Petstore, in dem Menschen Tiere zur Adoption reservieren. Die meisten Übungen prüfen eine Regel:'),
  rule: l('A pet must never be reserved twice.', 'Ein Tier darf nie doppelt reserviert werden.'),
  reservedFor: l('reserved for Anna', 'für Anna reserviert'),
  rejected: l('rejected: already reserved', 'abgelehnt: bereits reserviert'),
  fee: l('Other exercises use the adoption fee: a dog costs 120 €, a cat costs 80 €.', 'Andere Übungen nutzen die Adoptionsgebühr: Ein Hund kostet 120 €, eine Katze 80 €.'),
  learn: l('The tour in eight steps', 'Der Einstieg in acht Schritten'),
  learnHint: l('Each step has four parts: predict a result, run a check, explain the result, and use one idea in your own project.', 'Jeder Schritt hat vier Teile: ein Ergebnis vorhersagen, eine Prüfung starten, das Ergebnis erklären und eine Idee im eigenen Projekt nutzen.'),
  sim: l('Simulator in the browser', 'Simulator im Browser'),
  opened: l('opened', 'geöffnet'),
  /** {n} and {total} are filled in by the progress script */
  progress: l('{n} of {total} steps opened. Only this browser stores the progress.', '{n} von {total} Schritten geöffnet. Nur dieser Browser speichert den Fortschritt.'),
  reset: l('Reset progress', 'Fortschritt zurücksetzen'),
  whatNext: l('What next', 'Wie es weitergeht'),
  diagnose: l('Do you have a concrete problem in your own project?', 'Hast du ein konkretes Problem im eigenen Projekt?'),
  diagnoseHint: l('Select the closest of six common problems. You get a first check, an exercise for your project and a task for your agent.', 'Aus sechs häufigen Problemen das passende wählen. Du bekommst eine erste Prüfung, eine Übung für dein Projekt und eine Aufgabe für deinen Agenten.'),
  guides: l('Do you want to set up a tool?', 'Willst du ein Werkzeug einrichten?'),
  guidesHint: l('The TLA+ and Dafny guides show the installation, recorded output and a failure on purpose. To find tools for your language, use My stack.', 'Die Anleitungen zu TLA+ und Dafny zeigen Installation, aufgezeichnete Ausgabe und einen absichtlichen Fehler. Werkzeuge für deine Sprache stehen unter Mein Stack.'),
};

export const START_LOOP: { title: L; text: L }[] = [
  { title: l('1. Agree on the rule', '1. Regel festlegen'), text: l('Describe one success and one failure that you can observe. Approve the expected behaviour before the agent implements it.', 'Einen beobachtbaren Erfolg und einen Fehler beschreiben. Das erwartete Verhalten freigeben, bevor der Agent es implementiert.') },
  { title: l('2. Run the cheapest relevant check', '2. Billigste passende Prüfung starten'), text: l('After a small change, run the compiler and the linter first. Then run the focused behaviour check. Write down the command, the exit code and the relevant output.', 'Nach einer kleinen Änderung zuerst Compiler und Linter ausführen. Danach die gezielte Verhaltensprüfung starten. Befehl, Exit-Code und relevante Ausgabe festhalten.') },
  { title: l('3. Give the failure to the agent', '3. Fehler an den Agenten geben'), text: l('Give the agent the requirement, the diagnostic or counterexample, and the affected file. Ask for the smallest fix. Do not let the agent change approved tests or check settings.', 'Dem Agenten Anforderung, Diagnostic oder Gegenbeispiel und betroffene Datei geben. Die kleinste Korrektur verlangen. Freigegebene Tests und Prüfeinstellungen nicht ändern lassen.') },
  { title: l('4. Run it again, then check more', '4. Wiederholen, dann breiter prüfen'), text: l('Run the exact failed command again. If it passes, run the full gate of the project. Then review the diff. Report what the checks cannot show. If the same failure occurs again, make it smaller and check your assumption.', 'Genau den gescheiterten Befehl wiederholen. Besteht er, das vollständige Gate des Projekts ausführen. Danach den Diff prüfen. Festhalten, was die Prüfungen nicht zeigen können. Tritt derselbe Fehler wieder auf, ihn verkleinern und die Annahme prüfen.') },
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
  { id: 'funnel', path: '', title: l('The funnel', 'Der Trichter'), exercise: l('Select a recent bug. Which cheap check can catch it earlier?', 'Einen aktuellen Fehler wählen. Welche billige Prüfung kann ihn früher finden?') },
  { id: 'why-layers', path: 'why-layers/', title: l('Why one layer is not enough', 'Warum eine Schicht nicht reicht'), exercise: l('Name one claim that your green tests do not prove.', 'Eine Aussage nennen, die deine grünen Tests nicht beweisen.') },
  { id: 'type-systems', practice: 'type-systems', exercise: l('Predict the compiler result for all four versions. Compare a guard with a non-null assertion.', 'Das Compiler-Ergebnis für alle vier Versionen vorhersagen. Guard und Non-null Assertion vergleichen.') },
  { id: 'lint', practice: 'lint', exercise: l('Write one rule for a mistake that occurs again and again. Add the mistake on purpose. Confirm that the linter rejects it.', 'Eine Regel für einen wiederkehrenden Fehler schreiben. Den Fehler absichtlich einbauen. Bestätigen, dass der Linter ihn ablehnt.') },
  { id: 'unit-tests', practice: 'unit-tests', exercise: l('In the simulator, write test cases that reject each buggy implementation and accept the correct one.', 'Im Simulator Testfälle schreiben, die jede fehlerhafte Implementierung ablehnen und die korrekte akzeptieren.') },
  { id: 'mutation-tests', practice: 'mutation-tests', exercise: l('Run the weak tests. Examine one surviving mutant. Make one assertion stronger. Predict if the test fails now.', 'Die schwachen Tests starten. Einen überlebenden Mutanten prüfen. Eine Assertion verstärken. Vorhersagen, ob der Test jetzt scheitert.') },
  { id: 'property-based-tests', practice: 'property-based-tests', exercise: l('Find a counterexample. Examine the shrunk result. Write one invariant for your own domain.', 'Ein Gegenbeispiel finden. Das geschrumpfte Ergebnis prüfen. Eine Invariante für die eigene Domäne schreiben.') },
  { id: 'canarying', practice: 'canarying', exercise: l('Select a rollout threshold. Watch the signal. Decide when to roll back.', 'Eine Rollout-Schwelle wählen. Das Signal beobachten. Entscheiden, wann ein Rollback nötig ist.') },
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
