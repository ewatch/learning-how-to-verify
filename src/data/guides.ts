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
      'Write a TLA+ specification for a pet reservation. Use TLC to find a double reservation in five states. Correct the design and check all execution orders in the model. The guide takes approximately 30 minutes.',
      'Schreibe eine TLA+-Spezifikation für eine Reservierung. Finde mit TLC eine Doppelreservierung in fünf Zuständen. Korrigiere den Entwurf. Prüfe alle Ausführungsreihenfolgen im Modell. Die Anleitung dauert etwa 30 Minuten.',
    ),
    install: [
      { os: l('VS Code (all systems)', 'VS Code (alle Systeme)'), cmd: 'code --install-extension tlaplus.vscode-ide' },
      { os: l('Command line (needs Java 11+)', 'Kommandozeile (benötigt Java 11+)'), cmd: 'curl -LO https://github.com/tlaplus/tlaplus/releases/download/v1.7.4/tla2tools.jar' },
    ],
    installNote: l(
      'The VS Code extension includes TLC. Select “TLA+: Check model with TLC” in the command palette. For the command line, install Java and get the JAR file.',
      'Die VS-Code-Erweiterung enthält TLC. Wähle „TLA+: Check model with TLC“. Installiere für die CLI Java. Lade die JAR-Datei herunter.',
    ),
    steps: [
      {
        title: l('Specify the reservation design', 'Entwurf der Reservierung'),
        text: l(
          'The specification gives the variables, initial state (`Init`) and permitted steps (`Next`). Each person checks if Rex is available. The person then reserves Rex in a separate step. `OnlyOneOwner` must hold in every state.',
          'Die Spezifikation nennt die Variablen, den Startzustand (`Init`) und die zulässigen Schritte (`Next`). Jede Person prüft, ob Rex verfügbar ist. Sie reserviert Rex danach in einem eigenen Schritt. `OnlyOneOwner` muss in jedem Zustand gelten.',
        ),
        code: { file: 'Adopt.tla', body: adoptTla },
      },
      {
        title: l('Set the check in the TLC configuration', 'TLC konfigurieren'),
        text: l('The configuration selects `Spec`. It also names the invariant that TLC must check in every reachable state.', 'Die Konfiguration wählt `Spec` aus. Sie nennt auch das Invariant, das TLC in jedem erreichbaren Zustand prüft.'),
        code: { file: 'Adopt.cfg', body: adoptCfg },
      },
      {
        title: l('Run TLC', 'TLC ausführen'),
        text: l(
          'TLC examines the possible step orders. It finds a trace with five states. Anna and Ben each check availability before either reserves Rex. Read the trace from top to bottom. Each state gives the variable values after a step.',
          'TLC prüft die möglichen Reihenfolgen. Der Trace enthält fünf Zustände. Anna und Ben prüfen beide zuerst, ob Rex verfügbar ist. Danach reservieren beide Rex. Lies den Trace von oben nach unten. Jeder Zustand zeigt die Variablen nach einem Schritt.',
        ),
        output: { cmd: 'java -XX:+UseParallelGC -cp tla2tools.jar tlc2.TLC -config Adopt.cfg Adopt.tla', body: adoptOut },
      },
      {
        title: l('Fix the design', 'Den Entwurf korrigieren'),
        text: l(
          'Make the availability check and reservation one atomic step. Save the model as `AdoptFixed.tla`. Copy `Adopt.cfg` to `AdoptFixed.cfg`. TLC now checks all five reachable states with zero errors.',
          'Fasse die Prüfung und die Reservierung in einem atomaren Schritt zusammen. Speichere das Modell als `AdoptFixed.tla`. Kopiere `Adopt.cfg` nach `AdoptFixed.cfg`. TLC prüft nun alle fünf erreichbaren Zustände ohne Fehler.',
        ),
        code: { file: 'AdoptFixed.tla', body: adoptFixedTla },
        output: { cmd: 'java -XX:+UseParallelGC -cp tla2tools.jar tlc2.TLC -config AdoptFixed.cfg AdoptFixed.tla', body: adoptFixedOut },
      },
      {
        title: l('Confirm that the check detects an error', 'Fehlererkennung prüfen'),
        text: l(
          'Change `IF reservedBy = {} THEN {p} ELSE reservedBy` to `reservedBy \\cup {p}`. Run TLC again. TLC must report a violation of `OnlyOneOwner`.',
          'Ändere `IF reservedBy = {} THEN {p} ELSE reservedBy` zu `reservedBy \\cup {p}`. Führe TLC erneut aus. TLC muss eine Verletzung von `OnlyOneOwner` melden.',
        ),
      },
    ],
    mistakes: [
      l('If TLC reports an error on `<=` or `+`, make sure that the specification includes `EXTENDS Naturals`.', 'Wenn TLC einen Fehler bei `<=` oder `+` meldet, prüfe, ob die Spezifikation `EXTENDS Naturals` enthält.'),
      l('If TLC reports a deadlock when both processes finish, add a `Finished` step that leaves the state unchanged. If termination is expected, you can also use `-deadlock`.', 'Wenn TLC am Ende einen Deadlock meldet, ergänze einen Schritt `Finished` ohne Zustandsänderung. Wenn das Ende erwartet ist, kannst du auch `-deadlock` verwenden.'),
      l('Use `UNCHANGED` for variables that a step does not change. Without it, TLC can report an error or allow unspecified values.', 'Verwende `UNCHANGED` für Variablen, die ein Schritt nicht ändert. Ohne diese Angabe kann TLC einen Fehler melden oder nicht festgelegte Werte zulassen.'),
      l('Start with two people and one pet. A small model limits the number of states that TLC must examine.', 'Beginne mit zwei Personen und einem Tier. Ein kleines Modell begrenzt die Zahl der Zustände, die TLC prüft.'),
      l('Add tests in the production code for the invariant that TLC checks in the model.', 'Schreibe Tests im Produktionscode für das Invariant, das TLC im Modell prüft.'),
    ],
    next: [
      { label: 'Learn TLA+ (Hillel Wayne)', url: 'https://learntla.com' },
      { label: 'The TLA+ Video Course (Leslie Lamport)', url: 'https://lamport.azurewebsites.net/video/videos.html' },
      { label: 'TLA+ Examples repository', url: 'https://github.com/tlaplus/Examples' },
    ],
    agent: [
      l('Install Java 11 or later and get `tla2tools.jar`. Add a `verify:tla` script that runs TLC for each model in `spec/` with its configuration file.', 'Installiere Java 11 oder neuer. Lade `tla2tools.jar` herunter. Ergänze das Skript `verify:tla`. Führe darin TLC für jedes Modell in `spec/` mit seiner Konfiguration aus.'),
      l('Select one concurrent operation where a race condition would have a large effect. Describe the operation in three to five sentences. List its invariants in plain words. Wait for approval of the invariants.', 'Wähle einen nebenläufigen Ablauf, bei dem eine Race Condition große Folgen hätte. Beschreibe den Ablauf in drei bis fünf Sätzen. Liste die Invariants auf. Warte auf meine Freigabe.'),
      l('Write the specification with two actors and the minimum data for the operation. Run TLC.', 'Schreibe die Spezifikation mit zwei Akteuren und möglichst wenigen Daten. Führe TLC aus.'),
      l('Add a defect to the model. Show the TLC counterexample. Remove the defect.', 'Ergänze einen bekannten Fehler. Zeige das Gegenbeispiel von TLC. Entferne den Fehler.'),
      l('TLC passes on the corrected model and gives a counterexample for the known defect. The script runs in CI. Report the number of distinct states.', 'TLC akzeptiert das korrigierte Modell. Für den bekannten Fehler liefert TLC ein Gegenbeispiel. Das Skript läuft in CI. Melde die Zahl der unterschiedlichen Zustände.'),
    ],
    versions,
  },
  {
    id: 'dafny',
    tool: 'dafny',
    practice: 'formal-verification',
    title: l('Get started with Dafny', 'Einstieg in Dafny'),
    outcome: l(
      'Prove that the adoption fee meets its contract for each permitted input. Use Dafny to find an incorrect age boundary. Then add a loop invariant. The guide takes approximately 30 minutes.',
      'Beweise, dass die Gebühr für jede zulässige Eingabe den Contract erfüllt. Finde mit Dafny eine falsche Altersgrenze. Ergänze ein Loop Invariant. Die Anleitung dauert etwa 30 Minuten.',
    ),
    install: [
      { os: l('VS Code (all systems)', 'VS Code (alle Systeme)'), cmd: 'code --install-extension dafny-lang.ide-vscode' },
      { os: l('.NET tool (needs .NET 8 SDK)', '.NET-Tool (benötigt .NET 8 SDK)'), cmd: 'dotnet tool install --global dafny' },
      { os: l('macOS (Homebrew)', 'macOS (Homebrew)'), cmd: 'brew install dafny' },
    ],
    installNote: l(
      'The VS Code extension downloads Dafny and checks proofs as you edit. Red underlines show failed proofs. On the command line, run `dafny verify File.dfy`.',
      'Die VS-Code-Erweiterung lädt Dafny herunter. Sie prüft Beweise bei der Eingabe. Rote Unterstreichungen zeigen fehlgeschlagene Beweise. Führe in der CLI `dafny verify Datei.dfy` aus.',
    ),
    steps: [
      {
        title: l('Write the contract first', 'Contract schreiben'),
        text: l(
          'Each `ensures` clause gives a condition that the function must satisfy on return. Review these conditions. Dafny checks that the function meets them.',
          'Jede `ensures`-Klausel nennt eine Bedingung für den Rückgabewert. Prüfe diese Bedingungen. Dafny prüft, ob die Funktion sie erfüllt.',
        ),
        code: { file: 'Fee.dfy', body: feeDfy },
        output: { cmd: 'dafny verify Fee.dfy', body: feeOut },
      },
      {
        title: l('Confirm that Dafny detects an error', 'Fehlererkennung prüfen'),
        text: l(
          'Change `>=` to `>`. A test with age 10 still passes. Dafny checks the contract for all permitted ages and reports the violation at age 8.',
          'Ändere `>=` zu `>`. Der Test mit Alter 10 besteht weiterhin. Dafny prüft den Contract für alle zulässigen Alterswerte. Dafny meldet die Abweichung bei Alter 8.',
        ),
        output: { cmd: 'dafny verify FeeBroken.dfy', body: feeBrokenOut },
      },
      {
        title: l('Examine the loop without its invariant', 'Schleife ohne Loop Invariant prüfen'),
        text: l(
          'Dafny checks an arbitrary loop iteration. Remove `invariant total == Sum(fees[..i])`. Run the verifier. Dafny cannot prove the postcondition.',
          'Dafny prüft eine beliebige Iteration. Entferne `invariant total == Sum(fees[..i])`. Führe Dafny aus. Dafny kann die Postcondition nicht beweisen.',
        ),
        output: { cmd: 'dafny verify TotalNoInvariant.dfy', body: totalNoInvOut },
      },
      {
        title: l('Add the invariant', 'Loop Invariant ergänzen'),
        text: l(
          'The invariant states that `total == Sum(fees[..i])` before and after each iteration. At the loop exit, `i == |fees|`. The two `assert` lines give the solver facts about the slices.',
          'Vor und nach jeder Iteration gilt `total == Sum(fees[..i])`. Am Ende der Schleife gilt `i == |fees|`. Die beiden `assert`-Zeilen liefern dem Solver Informationen über die Slices.',
        ),
        code: { file: 'Total.dfy', body: totalDfy },
        output: { cmd: 'dafny verify Total.dfy', body: totalOut },
      },
    ],
    mistakes: [
      l('If Dafny cannot prove a statement, it can need an invariant, an `assert` or a lemma. Examine the statement before you change the contract.', 'Wenn Dafny eine Aussage nicht beweisen kann, fehlt möglicherweise ein Invariant, ein `assert` oder ein Lemma. Prüfe die Aussage, bevor du den Contract änderst.'),
      l('The contract `ensures fee <= base` permits `fee := 0`. Examine what incorrect results your contract permits.', 'Der Contract `ensures fee <= base` erlaubt `fee := 0`. Prüfe, welche falschen Ergebnisse dein Contract zulässt.'),
      l('Include `0 <= i <= |fees|` in the invariant. Dafny uses these bounds to prove that `fees[i]` is in range inside the loop.', 'Ergänze `0 <= i <= |fees|` im Loop Invariant. Dafny verwendet die Grenzen, um den Zugriff auf `fees[i]` in der Schleife zu prüfen.'),
      l('Compile the Dafny method for use in the project or compare its results with production code in a differential test.', 'Kompiliere die Dafny-Methode für den Einsatz im Projekt oder vergleiche ihre Ergebnisse mit dem Produktionscode in einem Differential Test.'),
    ],
    next: [
      { label: 'Dafny Getting Started guide', url: 'https://dafny.org/latest/OnlineTutorial/guide' },
      { label: 'Program Proofs (K. Rustan M. Leino, MIT Press)', url: 'https://mitpress.mit.edu/9780262546232/program-proofs/' },
      { label: 'Dafny reference manual', url: 'https://dafny.org/latest/DafnyRef/DafnyRef' },
    ],
    agent: [
      l('Install Dafny with the VS Code extension or `dotnet tool install --global dafny`. Add a `verify:dafny` script that runs `dafny verify` for each file in `verification/`.', 'Installiere Dafny über die VS-Code-Erweiterung oder mit `dotnet tool install --global dafny`. Ergänze `verify:dafny`. Führe darin `dafny verify` für jede Datei in `verification/` aus.'),
      l('Select one pure function with clear rules. Write its contract with `requires` and `ensures`. Wait for approval before implementation.', 'Wähle eine reine Funktion mit klaren Regeln. Schreibe den Contract mit `requires` und `ensures`. Warte vor der Implementierung auf meine Freigabe.'),
      l('Implement the function in Dafny. Correct the verifier errors. Add loop invariants where necessary. Keep the approved contract.', 'Implementiere die Funktion in Dafny. Korrigiere die gemeldeten Fehler. Ergänze bei Bedarf Loop Invariants. Lass den freigegebenen Contract unverändert.'),
      l('Translate the Dafny code to the project language with `dafny translate` or write a differential test against the existing implementation.', 'Übersetze die Implementierung mit `dafny translate` oder vergleiche sie mit der bestehenden Implementierung in einem Differential Test.'),
      l('The approved contract has no changes. `dafny verify` reports zero errors on the correct code. It rejects a version with a known defect. The differential test passes at least 1,000 runs.', 'Der freigegebene Contract bleibt unverändert. `dafny verify` meldet null Fehler für den korrekten Code. Eine Version mit bekanntem Fehler besteht die Prüfung nicht. Der Differential Test besteht mindestens 1.000 Läufe.'),
    ],
    versions,
  },
];

export const GUIDE_BY_ID = new Map(GUIDES.map((g) => [g.id, g]));
