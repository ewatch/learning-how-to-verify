import type { L } from './types';
import adoptTla from '../../guides-src/tla/Adopt.tla?raw';
import adoptCfg from '../../guides-src/tla/Adopt.cfg?raw';
import adoptOut from '../../guides-src/tla/Adopt.out?raw';
import adoptFixedTla from '../../guides-src/tla/AdoptFixed.tla?raw';
import adoptFixedOut from '../../guides-src/tla/AdoptFixed.out?raw';
import feeDfy from '../../guides-src/dafny/Fee.dfy?raw';
import feeOut from '../../guides-src/dafny/Fee.out?raw';
import feeBrokenOut from '../../guides-src/dafny/FeeBroken.out?raw';
import totalDfy from '../../guides-src/dafny/Total.dfy?raw';
import totalOut from '../../guides-src/dafny/Total.out?raw';
import totalNoInvOut from '../../guides-src/dafny/TotalNoInvariant.out?raw';
import versions from '../../guides-src/versions.txt?raw';

const l = (en: string, de: string): L => ({ en, de });

export interface GuideStep {
  title: L;
  text: L;
  code?: { file: string; body: string };
  output?: { cmd: string; body: string; note?: L };
}

export interface Guide {
  id: string;
  tool: string;
  practice: string;
  title: L;
  outcome: L;
  install: { os: L; cmd: string }[];
  installNote: L;
  steps: GuideStep[];
  mistakes: L[];
  next: { label: string; url: string }[];
  agent: L[];
  versions: string;
}

export const GUIDES: Guide[] = [
  {
    id: 'tla',
    tool: 'tlaplus',
    practice: 'formal-verification',
    title: l('Get started with TLA+', 'Einstieg in TLA+'),
    outcome: l(
      'In about 30 minutes you will have written a 25-line TLA+ spec of "two people reserve the same pet", watched the TLC model checker find the double-booking in 5 steps, fixed the design, and seen TLC confirm the fix for every possible interleaving.',
      'In etwa 30 Minuten hast du eine TLA+-Spezifikation mit 25 Zeilen für „zwei Personen reservieren dasselbe Tier“ geschrieben, zugesehen, wie der Model Checker TLC die Doppelbuchung in 5 Schritten findet, den Entwurf korrigiert und gesehen, wie TLC die Korrektur für jede mögliche Verschränkung bestätigt.',
    ),
    install: [
      { os: l('VS Code (all systems)', 'VS Code (alle Systeme)'), cmd: 'code --install-extension tlaplus.vscode-ide' },
      { os: l('Command line (needs Java 11+)', 'Kommandozeile (benötigt Java 11+)'), cmd: 'curl -LO https://github.com/tlaplus/tlaplus/releases/download/v1.7.4/tla2tools.jar' },
    ],
    installNote: l(
      'The VS Code extension bundles TLC; use "TLA+: Check model with TLC" from the command palette. On the command line you only need Java and one jar file.',
      'Die VS-Code-Erweiterung bringt TLC mit; „TLA+: Check model with TLC“ in der Befehlspalette nutzen. Auf der Kommandozeile braucht man nur Java und eine Jar-Datei.',
    ),
    steps: [
      {
        title: l('Describe the design, not the code', 'Den Entwurf beschreiben, nicht den Code'),
        text: l(
          'A TLA+ spec has variables, an initial state (`Init`) and the steps the system may take (`Next`). Here each person first checks whether Rex is free and later reserves, in a separate step, just like an app that does `GET` then `POST`. `OnlyOneOwner` is the rule that must always hold.',
          'Eine TLA+-Spezifikation hat Variablen, einen Anfangszustand (`Init`) und die Schritte, die das System machen darf (`Next`). Hier prüft jede Person zuerst, ob Rex frei ist, und reserviert später in einem eigenen Schritt, genau wie eine App, die erst `GET` und dann `POST` macht. `OnlyOneOwner` ist die Regel, die immer gelten muss.',
        ),
        code: { file: 'Adopt.tla', body: adoptTla },
      },
      {
        title: l('Tell TLC what to check', 'TLC sagen, was es prüfen soll'),
        text: l('The config file names the behaviour (`Spec`) and the invariant to check in every reachable state.', 'Die Konfigurationsdatei nennt das Verhalten (`Spec`) und die Invariante, die in jedem erreichbaren Zustand geprüft wird.'),
        code: { file: 'Adopt.cfg', body: adoptCfg },
      },
      {
        title: l('Run it and read the counterexample', 'Ausführen und das Gegenbeispiel lesen'),
        text: l(
          'TLC explores every possible order of steps. It finds a 5-state trace: Anna checks (free), Ben checks (still free), Anna reserves, Ben reserves. Read it top to bottom like a story; each state shows the variables after one step.',
          'TLC erkundet jede mögliche Reihenfolge der Schritte. Es findet eine Spur mit 5 Zuständen: Anna prüft (frei), Ben prüft (noch frei), Anna reserviert, Ben reserviert. Von oben nach unten wie eine Geschichte lesen; jeder Zustand zeigt die Variablen nach einem Schritt.',
        ),
        output: { cmd: 'java -XX:+UseParallelGC -cp tla2tools.jar tlc2.TLC -config Adopt.cfg Adopt.tla', body: adoptOut },
      },
      {
        title: l('Fix the design', 'Den Entwurf korrigieren'),
        text: l(
          'The bug is that check and reserve are two steps. Make them one atomic step, which in the real system means the server checks and reserves in one transaction (or a unique constraint). TLC now checks all 5 reachable states and finds nothing. Save the fixed spec as `AdoptFixed.tla` and copy `Adopt.cfg` to `AdoptFixed.cfg` (the configuration is the same).',
          'Der Fehler: Prüfen und Reservieren sind zwei Schritte. Daraus einen atomaren Schritt machen; im echten System heißt das, der Server prüft und reserviert in einer Transaktion (oder per Unique-Constraint). TLC prüft jetzt alle 5 erreichbaren Zustände und findet nichts. Die korrigierte Spezifikation als `AdoptFixed.tla` speichern und `Adopt.cfg` nach `AdoptFixed.cfg` kopieren (die Konfiguration ist dieselbe).',
        ),
        code: { file: 'AdoptFixed.tla', body: adoptFixedTla },
        output: { cmd: 'java -XX:+UseParallelGC -cp tla2tools.jar tlc2.TLC -config AdoptFixed.cfg AdoptFixed.tla', body: adoptFixedOut },
      },
      {
        title: l('Break it on purpose', 'Absichtlich kaputt machen'),
        text: l(
          'A passing check is only meaningful if it can fail. Change `IF reservedBy = {} THEN {p} ELSE reservedBy` to `reservedBy \\cup {p}` and run again: TLC must report `OnlyOneOwner` as violated. If it does not, your invariant is not checking what you think.',
          'Eine bestandene Prüfung bedeutet nur etwas, wenn sie scheitern kann. `IF reservedBy = {} THEN {p} ELSE reservedBy` zu `reservedBy \\cup {p}` ändern und erneut ausführen: TLC muss `OnlyOneOwner` als verletzt melden. Tut es das nicht, prüft die Invariante nicht, was man denkt.',
        ),
      },
    ],
    mistakes: [
      l('Forgetting `EXTENDS Naturals`: TLC then reports "Could not find declaration or definition of symbol \'<=\'". Operators like `<=` and `+` come from the standard module.', '`EXTENDS Naturals` vergessen: TLC meldet dann „Could not find declaration or definition of symbol \'<=\'“. Operatoren wie `<=` und `+` kommen aus dem Standardmodul.'),
      l('A "deadlock" error when all processes are done: add a `Finished` step that leaves the state unchanged, or run TLC with `-deadlock` if termination is expected.', 'Ein „Deadlock“-Fehler, wenn alle Prozesse fertig sind: einen Schritt `Finished` ergänzen, der den Zustand unverändert lässt, oder TLC mit `-deadlock` starten, wenn das Ende erwartet ist.'),
      l('Forgetting `UNCHANGED` for variables a step does not touch: TLC then lets them take any value, or reports an error.', '`UNCHANGED` für Variablen vergessen, die ein Schritt nicht berührt: TLC lässt sie dann jeden Wert annehmen oder meldet einen Fehler.'),
      l('Modelling too much: start with 2 people and 1 pet. Most design bugs appear in tiny instances; big ones explode the state space.', 'Zu viel modellieren: mit 2 Personen und 1 Tier anfangen. Die meisten Entwurfsfehler zeigen sich schon in winzigen Instanzen; große sprengen den Zustandsraum.'),
      l('Treating "no error found" as proof about the code. It is a statement about the model; connect it to code with tests that check the same invariant.', '„No error found“ als Beweis über den Code lesen. Es ist eine Aussage über das Modell; mit Tests, die dieselbe Invariante prüfen, an den Code anbinden.'),
    ],
    next: [
      { label: 'Learn TLA+ (Hillel Wayne)', url: 'https://learntla.com' },
      { label: 'The TLA+ Video Course (Leslie Lamport)', url: 'https://lamport.azurewebsites.net/video/videos.html' },
      { label: 'TLA+ Examples repository', url: 'https://github.com/tlaplus/Examples' },
    ],
    agent: [
      l('Install the TLA+ tools (tla2tools.jar, Java 11+) and add a script `verify:tla` that runs TLC on every `.tla` file in `spec/` with its `.cfg`.', 'Die TLA+-Werkzeuge installieren (tla2tools.jar, Java 11+) und ein Skript `verify:tla` anlegen, das TLC auf jede `.tla`-Datei in `spec/` mit ihrer `.cfg` ausführt.'),
      l('Pick the one concurrent flow in this repo where a race would be most expensive; describe it in 3–5 sentences and list the invariants in plain words. Stop and ask me to confirm them.', 'Den einen nebenläufigen Ablauf in diesem Repo wählen, bei dem eine Race Condition am teuersten wäre; ihn in 3–5 Sätzen beschreiben und die Invarianten in Worten auflisten. Anhalten und mich bestätigen lassen.'),
      l('Write the spec with 2 actors and the smallest data that shows the flow; run TLC.', 'Die Spezifikation mit 2 Akteuren und den kleinstmöglichen Daten schreiben; TLC ausführen.'),
      l('Prove the check is not vacuous: introduce a deliberate bug and show TLC\'s counterexample, then revert.', 'Zeigen, dass die Prüfung nicht leer ist: einen absichtlichen Fehler einbauen, das Gegenbeispiel von TLC zeigen, dann zurücknehmen.'),
      l('Done when: TLC passes on the spec, fails with a counterexample on the deliberate bug, and the script runs in CI. Report the number of distinct states checked.', 'Fertig, wenn: TLC auf der Spezifikation besteht, beim absichtlichen Fehler mit Gegenbeispiel scheitert und das Skript in der CI läuft. Die Anzahl geprüfter Zustände melden.'),
    ],
    versions,
  },
  {
    id: 'dafny',
    tool: 'dafny',
    practice: 'formal-verification',
    title: l('Get started with Dafny', 'Einstieg in Dafny'),
    outcome: l(
      'In about 30 minutes you will have proved that an adoption-fee function meets its contract for every input, watched Dafny reject a version with an off-by-one boundary, and written your first loop invariant.',
      'In etwa 30 Minuten hast du bewiesen, dass eine Gebührenfunktion ihren Vertrag für jede Eingabe erfüllt, zugesehen, wie Dafny eine Fassung mit falscher Grenze ablehnt, und deine erste Schleifeninvariante geschrieben.',
    ),
    install: [
      { os: l('VS Code (all systems)', 'VS Code (alle Systeme)'), cmd: 'code --install-extension dafny-lang.ide-vscode' },
      { os: l('.NET tool (needs .NET 8 SDK)', '.NET-Tool (benötigt .NET 8 SDK)'), cmd: 'dotnet tool install --global dafny' },
      { os: l('macOS (Homebrew)', 'macOS (Homebrew)'), cmd: 'brew install dafny' },
    ],
    installNote: l(
      'The VS Code extension downloads Dafny on first use and verifies as you type: red squiggles are failed proofs. On the command line run `dafny verify File.dfy`.',
      'Die VS-Code-Erweiterung lädt Dafny beim ersten Start und verifiziert beim Tippen: rote Wellenlinien sind gescheiterte Beweise. Auf der Kommandozeile `dafny verify Datei.dfy` ausführen.',
    ),
    steps: [
      {
        title: l('Write the contract first', 'Zuerst den Vertrag schreiben'),
        text: l(
          '`ensures` clauses are postconditions: what must be true when the method returns, for every input. This is the spec a human reviews. The body is the implementation Dafny has to prove against it.',
          '`ensures`-Klauseln sind Nachbedingungen: was bei Rückkehr der Methode für jede Eingabe gelten muss. Das ist die Spezifikation, die ein Mensch reviewt. Der Rumpf ist die Implementierung, die Dafny dagegen beweisen muss.',
        ),
        code: { file: 'Fee.dfy', body: feeDfy },
        output: { cmd: 'dafny verify Fee.dfy', body: feeOut },
      },
      {
        title: l('Break it on purpose', 'Absichtlich kaputt machen'),
        text: l(
          'Change `>=` to `>`. A test with age 10 would still pass. Dafny instead considers every age and finds that at exactly 8 the first postcondition fails. It points at the return path and at the clause that could not be proved.',
          '`>=` zu `>` ändern. Ein Test mit Alter 10 bestünde weiterhin. Dafny betrachtet dagegen jedes Alter und findet, dass bei genau 8 die erste Nachbedingung scheitert. Es zeigt auf den Rückgabepfad und auf die Klausel, die nicht bewiesen werden konnte.',
        ),
        output: { cmd: 'dafny verify FeeBroken.dfy', body: feeBrokenOut },
      },
      {
        title: l('Loops need invariants', 'Schleifen brauchen Invarianten'),
        text: l(
          'Dafny does not run the loop; it reasons about one arbitrary iteration. Without help it cannot connect the loop to the postcondition. Remove the line `invariant total == Sum(fees[..i])` and Dafny reports the postcondition as unprovable:',
          'Dafny führt die Schleife nicht aus; es argumentiert über eine beliebige Iteration. Ohne Hilfe kann es die Schleife nicht mit der Nachbedingung verbinden. Die Zeile `invariant total == Sum(fees[..i])` entfernen, und Dafny meldet die Nachbedingung als unbeweisbar:',
        ),
        output: { cmd: 'dafny verify TotalNoInvariant.dfy', body: totalNoInvOut },
      },
      {
        title: l('Add the invariant', 'Die Invariante ergänzen'),
        text: l(
          'The invariant says what is true before and after every iteration: `total` is the sum of the first `i` fees. When the loop ends, `i == |fees|`, so the invariant becomes the postcondition. The two `assert` lines are hints that help the solver with sequence slicing.',
          'Die Invariante sagt, was vor und nach jeder Iteration gilt: `total` ist die Summe der ersten `i` Gebühren. Endet die Schleife, ist `i == |fees|`, und die Invariante wird zur Nachbedingung. Die beiden `assert`-Zeilen sind Hinweise, die dem Solver beim Zerlegen der Sequenz helfen.',
        ),
        code: { file: 'Total.dfy', body: totalDfy },
        output: { cmd: 'dafny verify Total.dfy', body: totalOut },
      },
    ],
    mistakes: [
      l('Reading "could not be proved" as "is false". It can also mean Dafny needs a hint: an invariant, an `assert`, or a lemma.', '„Could not be proved“ als „ist falsch“ lesen. Es kann auch heißen, dass Dafny einen Hinweis braucht: eine Invariante, ein `assert` oder ein Lemma.'),
      l('Writing a contract that is too weak: `ensures fee <= base` alone is satisfied by `fee := 0`. Ask "what wrong implementation would still pass?"', 'Einen zu schwachen Vertrag schreiben: `ensures fee <= base` allein erfüllt auch `fee := 0`. Fragen: „Welche falsche Implementierung bestünde trotzdem?“'),
      l('Forgetting `0 <= i <= |fees|` in the invariant: without the bound, Dafny cannot show that `fees[i]` is in range.', '`0 <= i <= |fees|` in der Invariante vergessen: Ohne die Grenze kann Dafny nicht zeigen, dass `fees[i]` im Bereich liegt.'),
      l('Expecting the proof to cover your production code. It covers the Dafny method; compile it to your language or differential-test the two.', 'Erwarten, dass der Beweis den Produktionscode abdeckt. Er deckt die Dafny-Methode ab; sie in die eigene Sprache übersetzen oder beide per Differenztest vergleichen.'),
    ],
    next: [
      { label: 'Dafny Getting Started guide', url: 'https://dafny.org/latest/OnlineTutorial/guide' },
      { label: 'Program Proofs (K. Rustan M. Leino, MIT Press)', url: 'https://mitpress.mit.edu/9780262546232/program-proofs/' },
      { label: 'Dafny reference manual', url: 'https://dafny.org/latest/DafnyRef/DafnyRef' },
    ],
    agent: [
      l('Install Dafny (VS Code extension or `dotnet tool install --global dafny`) and add a script `verify:dafny` that runs `dafny verify` on every file in `verification/`.', 'Dafny installieren (VS-Code-Erweiterung oder `dotnet tool install --global dafny`) und ein Skript `verify:dafny` anlegen, das `dafny verify` auf jede Datei in `verification/` ausführt.'),
      l('Pick one pure function with clear rules (pricing, allocation, validation). Write its contract as `requires`/`ensures` and show it to me before implementing. Stop and wait for confirmation.', 'Eine reine Funktion mit klaren Regeln wählen (Preis, Verteilung, Validierung). Ihren Vertrag als `requires`/`ensures` schreiben und mir vor der Implementierung zeigen. Anhalten und auf Bestätigung warten.'),
      l('Implement it in Dafny and iterate on verifier errors; add loop invariants instead of weakening the contract.', 'In Dafny implementieren und an den Verifizierer-Fehlern iterieren; Schleifeninvarianten ergänzen, statt den Vertrag abzuschwächen.'),
      l('Compile it to the project language (`dafny translate`) or write a differential property test comparing it with the existing implementation.', 'In die Projektsprache übersetzen (`dafny translate`) oder einen differenziellen Property-Test schreiben, der sie mit der bestehenden Implementierung vergleicht.'),
      l('Done when: `dafny verify` reports 0 errors, the contract was approved unchanged, a deliberately broken version fails verification, and the differential test passes 1,000+ runs.', 'Fertig, wenn: `dafny verify` 0 Fehler meldet, der Vertrag unverändert freigegeben wurde, eine absichtlich kaputte Fassung die Verifikation nicht besteht und der Differenztest 1.000+ Läufe besteht.'),
    ],
    versions,
  },
];

export const GUIDE_BY_ID = new Map(GUIDES.map((g) => [g.id, g]));
