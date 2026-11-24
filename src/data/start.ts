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
    why: l('Record a baseline. It helps you identify which failures already exist and which failures a change introduces.', 'Erfasse eine Baseline. Sie zeigt, welche Fehler bereits vor der Änderung auftreten.'),
    practice: 'ci',
    exercise: l('Ask the coding agent to read the repository documentation, build files and CI configuration. Record each check command and its runtime. Run the fastest checks first.', 'Lass den Coding-Agenten die Projektdokumentation, Build-Dateien und CI-Konfiguration lesen. Erfasse die Prüfbefehle und ihre Laufzeit. Führe die schnellsten Checks zuerst aus.'),
    feedback: l('Commands with exit codes and status (pass, existing failure, or skipped with reason).', 'Die Liste nennt die Befehle, ihre Exit-Codes und den Status. Sie nennt auch den Grund für jeden übersprungenen Check.'),
    done: l('The record gives the check commands for a clean checkout. It also names the most important missing check.', 'Die Liste enthält die Prüfbefehle für einen frischen Checkout. Sie nennt auch den wichtigsten fehlenden Check.'),
    next: 'type-systems',
  },
  {
    id: 'compiler',
    label: l('Agents make type errors or forget edge cases', 'Agenten machen Typfehler oder vergessen Randfälle'),
    why: l('Run the type checker after each small change. Give the coding agent the result while it works on that change.', 'Führe den Type Check nach jeder kleinen Änderung aus. Gib das Ergebnis an den Coding-Agenten, solange er an der Änderung arbeitet.'),
    practice: 'type-systems',
    exercise: l('Try the four revisions in the exercise. Add an unsafe lookup on a temporary branch. Run the type checker. Ask for a guard that uses no casts.', 'Prüfe die vier Versionen in der Übung. Füge einen unsicheren Lookup auf einem temporären Branch hinzu. Führe den Type Check aus. Verlange einen Guard ohne Casts.'),
    feedback: l('The diagnostic gives a file, line and type error. After the correction, the type check passes. A test still checks the business rule.', 'Die Diagnostic nennt Datei, Zeile und Type Error. Nach der Korrektur besteht der Type Check. Ein Test prüft weiterhin die fachliche Regel.'),
    done: l('The check rejects the unsafe code, accepts the guard and runs in CI with zero new suppressions.', 'Der Type Check meldet den unsicheren Zugriff. Mit dem Guard besteht der Check in CI. Die Änderung enthält keine neuen Unterdrückungen.'),
    next: 'lint',
  },
  {
    id: 'behaviour',
    label: l('The agent builds the wrong behaviour', 'Der Agent implementiert das falsche Verhalten'),
    why: l('Give the coding agent one approved example of success and one approved example of failure.', 'Gib dem Coding-Agenten ein freigegebenes Beispiel für Erfolg und eines für einen Fehler.'),
    practice: 'tdd',
    exercise: l('Select one rule, such as one active reservation per pet. Approve a failing test for the rule. Let the coding agent change only production code.', 'Wähle eine Regel, etwa höchstens eine aktive Reservierung pro Tier. Gib einen fehlschlagenden Test frei. Lass den Coding-Agenten nur Produktionscode ändern.'),
    feedback: l('The assertion gives the expected and actual results. After the correction, the focused test and the full set of required checks pass.', 'Die Assertion zeigt den erwarteten und den tatsächlichen Wert. Nach der Korrektur bestehen der gezielte Test und alle erforderlichen Checks.'),
    done: l('The approved test fails before the fix, passes after, and no existing or approved tests were edited.', 'Der freigegebene Test schlägt vor der Korrektur fehl. Danach besteht er. Die bestehenden und freigegebenen Tests bleiben unverändert.'),
    next: 'test-integrity',
  },
  {
    id: 'green',
    label: l('Tests pass, but bugs still reach users', 'Tests bestehen, aber Fehler erreichen Nutzer'),
    why: l('Use mutation testing to see whether the tests detect changes in required behavior.', 'Prüfe mit Mutation Testing, ob die Tests Änderungen am erwarteten Verhalten erkennen.'),
    practice: 'mutation-tests',
    exercise: l('Open the mutation simulator. Run a mutation tool on one critical module. Examine a surviving mutant. Add a test if the mutant shows that a requirement has no test.', 'Öffne den Simulator für Mutation Testing. Führe danach Mutation Testing für ein wichtiges Modul aus. Untersuche einen verbliebenen Mutant. Ergänze einen Test für eine ungetestete Anforderung.'),
    feedback: l('A mutant survives the initial tests. The new assertion detects it. The existing tests keep their assertions.', 'Ein Mutant bleibt im ersten Lauf übrig. Die neue Assertion erkennt ihn. Die bestehenden Assertions bleiben unverändert.'),
    done: l('One surviving mutant is explained and either caught by a new test or documented as equivalent.', 'Ein neuer Test erkennt den Mutant oder die Dokumentation erklärt sein gleiches Verhalten.'),
    next: 'property-based-tests',
  },
  {
    id: 'boundaries',
    label: l('Failures occur between services or under concurrency', 'Fehler entstehen zwischen Services oder bei Nebenläufigkeit'),
    why: l('Use the real database or service for this check. A mock can hide a failure at the interface.', 'Prüfe den Request mit der echten Datenbank oder dem echten Service. Ein Mock kann einen Fehler an der Schnittstelle verdecken.'),
    practice: 'integration-tests',
    exercise: l('Reproduce the failure in an isolated environment with the real dependency. For example, send two concurrent reservation requests. Give the result to the coding agent.', 'Reproduziere den Fehler in einer isolierten Umgebung mit der echten Abhängigkeit. Sende zum Beispiel zwei gleichzeitige Reservierungsrequests. Gib das Ergebnis an den Coding-Agenten.'),
    feedback: l('Actual response and stored state. For hard-to-reproduce timings, model the steps in the formal-verification simulator.', 'Der Test zeigt die Antwort und den gespeicherten Zustand. Modelliere schwer reproduzierbare Reihenfolgen im Simulator für Formal Verification.'),
    done: l('The test fails without the fix and passes with it on isolated, repeatable data.', 'Der Test verwendet isolierte Daten. Er schlägt vor der Korrektur fehl und besteht danach.'),
    next: 'formal-verification',
  },
  {
    id: 'production',
    label: l('Problems appear only after release', 'Probleme zeigen sich erst nach dem Release'),
    why: l('Add a metric for a result that users can observe. Set a rollback condition for that metric.', 'Ergänze einen Messwert für ein Ergebnis, das Nutzer beobachten können. Lege eine Rollback-Bedingung fest.'),
    practice: 'monitoring',
    exercise: l('Select a critical user task. Specify a failure metric and its owner. Cause one controlled failure in staging. Write the rollback rule before the canary release.', 'Wähle einen kritischen Nutzerablauf. Lege eine Fehlermetrik und einen Verantwortlichen fest. Löse einen kontrollierten Fehler in Staging aus. Schreibe die Rollback-Regel vor dem Canary Release auf.'),
    feedback: l('A metric, log or trace flags the staging failure and alerts the responsible person.', 'Der Messwert, das Log oder der Trace zeigt den Fehler in Staging. Die zuständige Person erhält einen Alert.'),
    done: l('Signal and rollback rule are verified in staging, and rollout ownership is clear.', 'Der Messwert und die Rollback-Regel sind in Staging geprüft. Für den Rollout ist eine Person zuständig.'),
    next: 'canarying',
  },
];

/** Copy for the "Diagnose my project" page: the problem chooser and the feedback loop. */
export const DIAGNOSE_COPY = {
  title: l('Diagnose my project', 'Mein Projekt diagnostizieren'),
  description: l('Select a problem in your project. The page gives a first check, an exercise and a task for your coding agent.', 'Wähle ein Problem aus deinem Projekt. Die Seite zeigt einen Check, eine Übung und eine Aufgabe für deinen Coding-Agenten.'),
  intro: l('Select a symptom to find a check for your project.', 'Wähle ein Symptom. Die Seite zeigt einen passenden Check für dein Projekt.'),
  tour: l('New to verification?', 'Neu bei Verifikation?'),
  tourLink: l('Start with the guided tour', 'Mit dem geführten Einstieg beginnen'),
  /** e2e tests match this text in the Markdown twin: keep it */
  chooser: l('Where should I start?', 'Wo sollte ich anfangen?'),
  chooseHint: l('If several symptoms apply, record a baseline first.', 'Wenn mehrere Symptome zutreffen, erfasse zuerst eine Baseline.'),
  first: l('Your first check', 'Deine erste Prüfung'),
  exercise: l('Try it in your project', 'Im eigenen Projekt ausprobieren'),
  feedback: l('Feedback to expect', 'Erwartetes Feedback'),
  done: l('Done when', 'Fertig, wenn'),
  next: l('Next layer', 'Nächste Schicht'),
  open: l('Open the practice', 'Praktik öffnen'),
  copy: l('Copy task for your agent', 'Aufgabe für Agenten kopieren'),
  preview: l('Preview agent task', 'Agenten-Aufgabe ansehen'),
  loop: l('Use one feedback loop', 'Einen Feedback-Loop nutzen'),
  loopHint: l('Run the commands from your project. Use other checks for requirements that the first check does not cover.', 'Verwende die Befehle aus deinem Projekt. Prüfe weitere Anforderungen mit passenden Checks.'),
};

/** Copy for the "Getting Started" page: the guided tour. */
export const START_COPY = {
  title: l('Getting Started', 'Erste Schritte'),
  description: l('The tour has eight steps and takes 60–90 minutes. It uses a petstore example from the verification funnel to a canary rollout.', 'Die Tour hat acht Schritte und dauert 60 bis 90 Minuten. Das Petstore-Beispiel führt vom Trichter bis zu einem Canary Release.'),
  intro: l('Use this tour to learn how to check code from coding agents.', 'Prüfe Code von Coding-Agenten anhand eines Beispiels. Die Tour zeigt dir die Checks in acht Schritten.'),
  after: l('Afterwards you can', 'Danach kannst du'),
  outcomes: [
    l('find a low-cost check for an error,', 'einen Check mit geringem Aufwand für einen Fehler finden,'),
    l('give the coding agent the results of type checks, lint and tests,', 'dem Coding-Agenten Ergebnisse von Type Checks, Lint und Tests geben,'),
    l('find errors that passing tests do not detect,', 'Fehler finden, die bestandene Tests nicht melden,'),
    l('decide when a rollout must stop.', 'entscheiden, wann ein Rollout stoppen muss.'),
  ],
  timeLabel: l('Time', 'Zeit'),
  time: l('The tour takes 60–90 minutes. Each step takes 5–15 minutes. You can stop after any step.', 'Die Tour dauert 60 bis 90 Minuten. Jeder Schritt dauert 5 bis 15 Minuten. Du kannst nach jedem Schritt pausieren.'),
  begin: l('Begin with step 1', 'Mit Schritt 1 beginnen'),
  /** {n} = step number; set by the progress script */
  resume: l('Continue with step {n}', 'Weiter mit Schritt {n}'),
  allOpened: l('Do the tour again from step 1', 'Den Einstieg ab Schritt 1 wiederholen'),
  example: l('The running example', 'Das durchgehende Beispiel'),
  exampleText: l('Most exercises check the same reservation rule in the petstore.', 'Die meisten Übungen prüfen dieselbe Regel für Reservierungen.'),
  rule: l('A pet must never be reserved twice.', 'Ein Tier darf höchstens eine aktive Reservierung haben.'),
  reservedFor: l('reserved for Anna', 'für Anna reserviert'),
  rejected: l('rejected: already reserved', 'abgelehnt: bereits reserviert'),
  fee: l('Fee exercises: dog 120 €, cat 80 €.', 'Gebührenübungen: Hund 120 €, Katze 80 €.'),
  learn: l('The tour in eight steps', 'Der Einstieg in acht Schritten'),
  learnHint: l('Predict the result. Run the exercise. Compare the results. Use the check in your project.', 'Sage das Ergebnis voraus. Führe die Übung aus. Vergleiche das Ergebnis. Verwende den Check in deinem Projekt.'),
  sim: l('Try it', 'Ausprobieren'),
  opened: l('opened', 'geöffnet'),
  /** screen-reader state of a step in the list; set by the progress script */
  stateDone: l('done', 'erledigt'),
  stateOpened: l('opened, not done', 'geöffnet, nicht erledigt'),
  stateCurrent: l('next step', 'nächster Schritt'),
  /** {n}, {opened} and {total} are filled in by the progress script */
  progress: l('{n} of {total} steps done, {opened} opened. Stored only in this browser.', '{n} von {total} Schritten erledigt, {opened} geöffnet. Nur in diesem Browser gespeichert.'),
  finished: l('Tour finished ({total}/{total}). Use “What next” below for your own project.', 'Einstieg abgeschlossen ({total}/{total}). Für das eigene Projekt unten „Wie es weitergeht“ nutzen.'),
  petstore: l('See the whole petstore example', 'Das ganze Petstore-Beispiel ansehen'),
  reset: l('Reset progress', 'Fortschritt zurücksetzen'),
  whatNext: l('What next', 'Wie es weitergeht'),
  diagnose: l('Concrete problem in your project?', 'Konkretes Problem im eigenen Projekt?'),
  diagnoseHint: l('Select one of six symptoms. The diagnosis page gives you a check, an exercise and a task for your coding agent.', 'Wähle eines von sechs Symptomen. Die Seite zeigt einen Check, eine Übung und eine Aufgabe für deinen Coding-Agenten.'),
  guides: l('Ready to set up a tool?', 'Bereit, ein Werkzeug einzurichten?'),
  guidesHint: l('Follow a guide for TLA+ or Dafny. You can also find tools for your programming language.', 'Folge einer Anleitung für TLA+ oder Dafny. Du kannst auch Tools für deine Programmiersprache finden.'),
};

export const START_LOOP: { title: L; text: L }[] = [
  { title: l('1. Agree on the rule', '1. Regel festlegen'), text: l('Approve one example of success and one example of failure before the coding agent writes code.', 'Gib ein Beispiel für Erfolg und eines für einen Fehler frei. Gib danach die Aufgabe an den Coding-Agenten.') },
  { title: l('2. Run the first checks', '2. Erste Checks ausführen'), text: l('Run the compiler and linter. Then run the focused test. Record each command, exit code and output.', 'Führe Compiler und Linter aus. Führe dann den gezielten Test aus. Erfasse jeden Befehl, seinen Exit-Code und seine Ausgabe.') },
  { title: l('3. Give the failure to the coding agent', '3. Fehler an den Coding-Agenten geben'), text: l('Give the coding agent the requirement, diagnostic and file. Ask for a small correction that leaves the approved tests intact.', 'Gib dem Coding-Agenten die Anforderung, die Diagnostic und die Datei. Verlange eine kleine Korrektur. Lass freigegebene Tests unverändert.') },
  { title: l('4. Run the checks again', '4. Checks erneut ausführen'), text: l('Run the failed check again. Then run all required checks. Review the diff. If the checks still fail after three attempts, assign the task to a person.', 'Führe den fehlgeschlagenen Check erneut aus. Führe danach alle erforderlichen Checks aus. Prüfe den Diff. Übergib die Aufgabe nach drei fehlgeschlagenen Versuchen an eine Person.') },
];

export interface TourStep {
  /** stable id, used to remember progress */
  id: string;
  /** a practice id, or a page path with its own title */
  practice?: string;
  path?: string;
  title?: L;
  exercise: L;
  /** tour bar: what to do on this page, one or two instructions */
  task: L;
  /** tour bar: the observable result that ends the step */
  doneWhen: L;
  /** tour bar: id of the section that "Go to the exercise" scrolls to */
  target: string;
}

export const START_TOUR: TourStep[] = [
  { id: 'funnel', path: '', title: l('The funnel', 'Der Trichter'), target: 'funnel',
    exercise: l('Select a recent error. Find the first layer in the funnel that can detect it.', 'Wähle einen aktuellen Fehler. Finde die erste Schicht im Trichter, die ihn erkennen kann.'),
    task: l('Select each layer in the funnel. Read its list of checks. Select a recent error from your work.', 'Wähle jede Schicht im Trichter aus. Lies ihre Checks. Wähle dann einen Fehler aus deinem Projekt.'),
    doneWhen: l('You can name the highest layer that can catch your bug.', 'Du kannst die erste Schicht nennen, die den Fehler erkennen kann.') },
  { id: 'why-layers', path: 'why-layers/', title: l('Why one layer is not enough', 'Warum eine Schicht nicht reicht'), target: 'finding-1',
    exercise: l('Name one condition that a passing test does not prove.', 'Nenne eine Bedingung, die ein bestandener Test offenlässt.'),
    task: l('Read the six findings. For each finding, read “Which layer catches it”.', 'Lies die sechs Befunde. Lies zu jedem Befund „Welche Schicht es fängt“.'),
    doneWhen: l('You can name one claim that your green tests do not prove.', 'Du kannst eine Bedingung nennen, die bestandene Tests offenlassen.') },
  { id: 'type-systems', practice: 'type-systems', target: 'try',
    exercise: l('Predict the compiler result across four revisions and compare a guard with `!`.', 'Sage das Ergebnis für vier Versionen voraus. Vergleiche den Guard mit `!`.'),
    task: l('Select each of the four agent revisions and predict the result. Then click “Check this change” and compare.', 'Wähle jede der vier Versionen aus. Sage das Ergebnis voraus. Wähle „Änderung prüfen“. Vergleiche die Ergebnisse.'),
    doneWhen: l('You can tell why revisions 3 and 4 pass the type check and fail the behavior check.', 'Du kannst erklären, warum die Versionen 3 und 4 den Type Check bestehen und der Verhaltenstest fehlschlägt.') },
  { id: 'lint', practice: 'lint', target: 'try',
    exercise: l('Fix every lint finding and compare a prose rule with an enforced CI rule.', 'Korrigiere alle Lint-Funde. Vergleiche eine Textregel mit einer Lint-Regel, die CI prüft.'),
    task: l('Fix every finding in the editor, with all rules on. Then select “Rule as prose vs lint” and click “Open the pull request”.', 'Aktiviere alle Regeln. Korrigiere jeden Fund im Editor. Wähle „Regel als Text vs. Lint“. Wähle „Pull Request öffnen“.'),
    doneWhen: l('The editor shows “All findings fixed.” and you saw which pull request CI blocks.', 'Der Editor zeigt „Alle Funde behoben.“ Du kannst den Pull Request nennen, den CI blockiert.') },
  { id: 'unit-tests', practice: 'unit-tests', target: 'try',
    exercise: l('Add examples until every buggy implementation fails and the correct one passes.', 'Ergänze Beispiele. Sie müssen alle Fehler erkennen und mit der korrekten Implementierung bestehen.'),
    task: l('Click “+ Add example” and change the values until every buggy implementation shows “caught”. Each example must pass on the correct implementation.', 'Wähle „+ Beispiel hinzufügen“. Passe die Werte an. Wiederhole den Schritt, bis jede fehlerhafte Version „gefangen“ zeigt. Prüfe jedes Beispiel mit der korrekten Version.'),
    doneWhen: l('The simulator shows “All bugs caught.”', 'Der Simulator zeigt „Alle Fehler gefangen.“') },
  { id: 'mutation-tests', practice: 'mutation-tests', target: 'try',
    exercise: l('Examine one surviving mutant. Add an assertion that detects it.', 'Untersuche einen verbliebenen Mutant. Ergänze eine Assertion, die ihn erkennt.'),
    task: l('Click “Run mutation testing” and click one mutant that “survived”. Then click “Load better tests” and run it again.', 'Wähle „Mutation Testing starten“. Wähle einen Mutant mit „überlebt“. Wähle „Bessere Tests laden“. Starte Mutation Testing erneut.'),
    doneWhen: l('The summary says “Every non-equivalent mutant was killed.”', 'Die Zusammenfassung zeigt „Jeder nicht äquivalente Mutant wurde getötet.“') },
  { id: 'property-based-tests', practice: 'property-based-tests', target: 'try',
    exercise: l('Generate random carts. Examine the smallest counterexample. Check the corrected implementation.', 'Erzeuge zufällige Warenkörbe. Untersuche das Gegenbeispiel. Prüfe die korrigierte Implementierung.'),
    task: l('Click “Generate 200 carts” and read the minimal counterexample. Then select “Cumulative” (tag “correct”) and generate again.', 'Wähle „200 Warenkörbe erzeugen“. Lies das Gegenbeispiel nach dem Shrinking. Wähle „Kumulativ“. Starte den Test erneut.'),
    doneWhen: l('You saw a minimal counterexample, and the property held for “Cumulative”.', 'Der erste Lauf zeigt ein Gegenbeispiel. Mit „Kumulativ“ erfüllen alle geprüften Warenkörbe die Property.') },
  { id: 'canarying', practice: 'canarying', target: 'try',
    exercise: l('Find an error that the technical metrics do not show. Use a business metric to detect the error.', 'Finde einen Fehler, den die technischen Metriken nicht zeigen. Verwende eine Geschäftsmetrik, um ihn zu erkennen.'),
    task: l('Select the silent bug and click “Start rollout”. Then switch on the business metric and start the rollout again.', 'Wähle den stillen Fehler. Wähle „Rollout starten“. Aktiviere danach die Geschäftsmetrik. Starte den Rollout erneut.'),
    doneWhen: l('The rollout with the business metric ends with “Rolled back automatically”.', 'Der Rollout mit Geschäftsmetrik endet mit „automatisch zurückgerollt“.') },
];

/** Page path of a tour step after /{lang}/, e.g. "practices/lint/" ("" is the home page). */
export const tourStepPath = (step: TourStep): string => (step.practice ? `practices/${step.practice}/` : step.path!);

/** Copy for the tour bar that follows the reader across the tour pages. */
export const TOUR_BAR = {
  label: l('Getting Started tour', 'Erste Schritte: geführter Einstieg'),
  name: l('Getting Started', 'Erste Schritte'),
  /** {n} and {total} are filled in by the tour script */
  stepOf: l('Step {n} of {total}', 'Schritt {n} von {total}'),
  steps: l('All steps', 'Alle Schritte'),
  doneWhen: l('Done when:', 'Fertig, wenn:'),
  go: l('Go to the exercise', 'Zur Übung'),
  next: l('Done, next step', 'Erledigt, nächster Schritt'),
  nextShort: l('Done, next', 'Erledigt, weiter'),
  finish: l('Done, finish the tour', 'Erledigt, Einstieg abschließen'),
  finishShort: l('Done, finish', 'Erledigt, abschließen'),
  overview: l('Back to overview', 'Zur Übersicht'),
  collapse: l('Hide the task', 'Aufgabe ausblenden'),
  expand: l('Show the task', 'Aufgabe zeigen'),
  exit: l('Exit the tour. Your progress stays.', 'Einstieg beenden. Der Fortschritt bleibt.'),
  done: l('done', 'erledigt'),
  opened: l('opened, not done', 'geöffnet, nicht erledigt'),
  current: l('this page', 'diese Seite'),
  open: l('open', 'offen'),
  /** {n} is filled in by the tour script */
  marked: l('Step {n} is done.', 'Schritt {n} ist erledigt.'),
  exited: l('Tour closed. Your progress stays on the Getting Started page.', 'Einstieg geschlossen. Der Fortschritt bleibt auf der Seite Erste Schritte.'),
};

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
