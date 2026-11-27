import type { Practice } from '../types';
import { ev, f, l, none, q } from './_h';

export const codebase: Practice[] = [
  {
    id: 'architecture',
    domain: { parts: ['domain', 'ui', 'db'], what: l('An architecture test stops imports from the domain code into the UI.', 'Ein Architecture Test meldet verbotene Imports zwischen Domain Code, UI und Datenbankcode.') },
    viz: { kind: 'process', mode: 'architecture' },
    name: l('API design & architecture', 'API-Design & Architektur'),
    layer: 'codebase',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l(
      'Module boundaries specify which parts of the code can use each interface. An automatic check can report a dependency that breaks a boundary.',
      'Modulgrenzen legen fest, welcher Code eine Schnittstelle verwenden darf. Ein Architecture Test meldet Abhängigkeiten, die eine Grenze verletzen.',
    ),
    catches: l('whole bug classes, before they exist: invalid states, misuse of an API, hidden coupling', 'Ungültige Zustände, falsche API-Aufrufe und unbeabsichtigte Abhängigkeiten zwischen Modulen.'),
    intro: l(
      'A coding agent adds a database import to the user interface. Later changes copy the import. An architecture test can prevent this dependency.',
      'Ein Coding-Agent importiert Datenbankcode in die UI. Weitere Änderungen übernehmen diesen Import. Ein Architecture Test kann die unerlaubte Abhängigkeit melden.',
    ),
    cost: 2,
    feedback: 'days',
    worth: [
      l('Types can prevent some invalid states. For example, a `Reservation` can require both a pet and a person.', 'Typen können ungültige Zustände ausschließen. Eine `Reservation` kann zum Beispiel ein Tier und eine Person verlangen.'),
      l('Small interfaces limit the amount of code that a coding agent must read. They can also limit the scope of a change.', 'Kleine Schnittstellen begrenzen den Code, den ein Coding-Agent lesen muss. Sie können auch den Umfang einer Änderung begrenzen.'),
      l('CI can check import rules automatically.', 'CI kann Regeln für Imports automatisch prüfen.'),
    ],
    limits: [
      l('A defect that the design prevents does not appear in the defect count. This makes the effect difficult to measure.', 'Ein verhinderter Fehler erscheint in keiner Fehlerstatistik. Deshalb lässt sich die Wirkung schwer messen.'),
      l('A person must review rules that the automatic checks do not cover.', 'Eine Person prüft die Regeln, die automatische Checks nicht abdecken.'),
    ],
    ai: l(
      'Coding agents can repeat dependencies that they find in existing code. Use architecture tests to make CI fail when a change breaks a module boundary.',
      'Coding-Agenten können Abhängigkeiten aus vorhandenem Code übernehmen. Führe Architecture Tests in CI aus. Lass den Build fehlschlagen, wenn eine Änderung eine Modulgrenze verletzt.',
    ),
    evidence: {
      general: ev('moderate', f('tornhill2022', 'The study examined 39 proprietary codebases. Files with low scores on the vendor\'s code health measure had approximately 15 times as many defects. Their issues took approximately 124% longer to resolve. These results are correlations.', 'In 39 proprietären Codebasen hatten Dateien mit niedriger „Code Health“ etwa 15× mehr Fehler, und Tickets dazu brauchten etwa 124 % länger (Herstellermetrik, korrelativ).')),
      ai: ev('weak', f('mundler2025', 'Indirect: giving a model machine-checkable interface information (types) during generation cut compile errors by more than half.', 'Indirekt: Bekommt ein Modell bei der Generierung maschinell prüfbare Schnittstelleninformation (Typen), sinken die Compilerfehler um mehr als die Hälfte.')),
    },
    tools: {
      php: ['deptrac', 'phpstan'],
      js: ['dependency-cruiser', 'typescript'],
      python: ['import-linter'],
      java: ['archunit'],
      dotnet: ['archunitnet'],
      go: ['go-arch-lint'],
      any: ['ast-grep'],
    },
    snippets: [
      {
        lang: 'js',
        file: 'reservation.ts',
        enforcedBy: l(
          'TypeScript compiler (`tsc --noEmit`) enforces the union type; an architecture test tool (such as dependency-cruiser, Import Linter, Deptrac or ArchUnit) enforces module import rules in CI.',
          'Der TypeScript-Compiler (`tsc --noEmit`) erzwingt den Union-Typ; ein Architecture-Test-Tool (wie dependency-cruiser, Import Linter, Deptrac oder ArchUnit) erzwingt Importgrenzen in CI.',
        ),
        code: `// Invalid states are unrepresentable: a pet is either free or reserved by exactly one person.
type PetStatus =
  | { kind: 'available' }
  | { kind: 'reserved'; by: PersonId; since: Date }
  | { kind: 'adopted'; by: PersonId };

// The only way to reserve. No caller can set "reservedBy" directly.
export function reserve(pet: Pet, person: PersonId, now: Date): Result<Pet, 'taken'> {
  if (pet.status.kind !== 'available') return err('taken');
  return ok({ ...pet, status: { kind: 'reserved', by: person, since: now } });
}`,
      focus: [
        { line: 2, note: l("The union allows exactly one owner per state, so “reserved without a person” cannot even be typed.", "Die Union erlaubt pro Zustand genau einen Besitzer, „reserviert ohne Person“ lässt sich gar nicht erst schreiben.") },
        { line: 4, note: l("`reserved` carries `by` and `since`; the data lives inside the state, so the two cannot disagree.", "`reserved` trägt `by` und `since`; die Daten stecken im Zustand, beide können sich nicht widersprechen.") },
        { line: [8, 10], note: l("One entry point decides: anything not `available` is `taken`, so a double reservation is rejected here.", "Ein einziger Einstieg entscheidet: Alles außer `available` ist `taken`, eine Doppelreservierung scheitert hier.") },
      ],
      },
    ],
    steps: [
      l('Identify two or three important module boundaries. For example, the domain module must not import the user interface or HTTP code.', 'Bestimme zwei oder drei wichtige Modulgrenzen. Der Domain Code darf zum Beispiel keinen UI- oder HTTP-Code importieren.'),
      l('Write an architecture test for these boundaries. Run the test in CI.', 'Schreibe einen Architecture Test für diese Grenzen. Führe den Test in CI aus.'),
      l('Identify an invalid state that the current type permits. Use a type that cannot represent that state.', 'Suche einen ungültigen Zustand, den der aktuelle Typ zulässt. Verwende einen Typ, der diesen Zustand ausschließt.'),
    ],
    done: l('The architecture test passes on the current code. It fails when you add a prohibited import.', 'Der Architecture Test besteht mit dem aktuellen Code. Er schlägt fehl, wenn du einen verbotenen Import hinzufügst.'),
    think: [
      q('Why is `status: "reserved"` plus an optional `reservedBy` field worse than a union type?', 'Warum ist `status: "reserved"` mit einem optionalen Feld `reservedBy` schlechter als ein Union-Typ?',
        'Because the two fields can disagree: reserved without a person, or a person on an available pet. Every reader has to check both. The union makes the disagreement impossible to write.',
        'Weil die beiden Felder sich widersprechen können: reserviert ohne Person oder eine Person an einem freien Tier. Jeder Leser muss beides prüfen. Der Union-Typ macht den Widerspruch unschreibbar.'),
      q('Which check is cheaper: a reviewer noticing a bad import, or a test that forbids it?', 'Was ist billiger: ein Reviewer, der einen schlechten Import bemerkt, oder ein Test, der ihn verbietet?',
        'The test. It runs on every change, never gets tired and also catches the agent at 3 a.m. That is the whole idea of the funnel.',
        'Der Test. Er läuft bei jeder Änderung, wird nie müde und erwischt auch den Agenten um 3 Uhr nachts. Das ist die ganze Idee des Trichters.'),
      q('Predict: an agent adds a quick import from the HTTP layer into the domain module to reuse a helper. Which check stops it, and what happens if there is none?', 'Vorhersage: Ein Agent importiert zur Wiederverwendung eines Helfers kurzerhand die HTTP-Schicht ins Domänenmodul. Welche Prüfung stoppt das, und was passiert ohne sie?',
        'An architecture test can make the build fail on a prohibited import. Without that test, the code can compile and its tests can pass. The new dependency can make the domain code difficult to reuse or test without HTTP.',
        'Ein Architecture Test lässt den Build bei einem verbotenen Import fehlschlagen. Ohne diesen Check können Build und Tests bestehen. Die Abhängigkeit kann es später erschweren, den Domain Code ohne HTTP zu testen.'),
    ],
    related: ['type-systems', 'refactoring', 'lint', 'contracts'],
  },
  {
    id: 'refactoring',
    domain: { parts: ['domain', 'reserve'], what: l('Characterization tests pin the results while the reservation code changes.', 'Characterization Tests halten die Ergebnisse fest, während sich der Reservierungscode ändert.') },
    viz: { kind: 'process', mode: 'refactoring' },
    name: l('Refactoring', 'Refactoring'),
    layer: 'codebase',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('Refactoring changes the structure of code in small steps. The behavior stays the same.', 'Refactoring ändert die Struktur von Code in kleinen Schritten. Das Verhalten bleibt gleich.'),
    catches: l('design decay that makes future bugs likely: duplication, tangled responsibilities, unclear names', 'Duplikate, unklare Zuständigkeiten und Namen, die die Aufgabe des Codes nicht erkennen lassen.'),
    intro: l(
      'Each new feature adds code to the reservation module. Over time, changes become more difficult. Refactoring divides that work into small changes that you can test separately.',
      'Jede neue Funktion vergrößert das Reservierungsmodul. Änderungen werden dadurch schwieriger. Teile das Refactoring in kleine Änderungen auf. Prüfe jede Änderung einzeln.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('A simpler structure can make the code easier to test and review.', 'Eine einfachere Struktur kann Änderungen leichter prüfbar machen.'),
      l('Tools can perform common changes such as rename and extract operations automatically.', 'Tools können Rename- und Extract-Operationen automatisch ausführen.'),
      l('Snapshot or characterization tests can detect changes in behavior during a refactoring.', 'Snapshot Tests und Characterization Tests können Verhaltensänderungen beim Refactoring erkennen.'),
    ],
    limits: [
      l('Without tests, a change in behavior can go undetected.', 'Ohne Tests kann sich das Verhalten unbemerkt ändern.'),
      l('A large refactoring is difficult to review in one change.', 'Ein großes Refactoring lässt sich in einem einzigen Code Review schwer prüfen.'),
    ],
    ai: l(
      'Record the required behavior with characterization or differential tests. Then ask the coding agent to refactor in small commits that a person can review separately.',
      'Halte das erwartete Verhalten mit Characterization Tests oder Differential Tests fest. Lass den Coding-Agenten danach kleine Commits erstellen. Prüfe jeden Commit einzeln.',
    ),
    evidence: {
      general: ev('moderate', f('tornhill2022', 'Low code health correlated with about 15× more defects; refactoring is the usual way to raise it (correlational).', 'Niedrige Code Health ging mit etwa 15× mehr Fehlern einher; Refactoring ist der übliche Weg, sie zu heben (korrelativ).')),
      ai: none(),
    },
    tools: {
      php: ['rector'],
      js: ['jscodeshift', 'typescript'],
      python: ['libcst'],
      java: ['openrewrite'],
      any: ['ast-grep', 'comby'],
    },
    snippets: [{ lang: "js", file: "reservation-label.test.ts",
      description: l("Run the example with Vitest. Compare the results on the permitted inputs. Change the refactoring to use a truthiness check. The empty owner case then shows a difference.",
        "Führe das Beispiel mit Vitest aus. Vergleiche die Ergebnisse für zulässige Eingaben. Verwende beim Refactoring einen Truthiness Check. Der Fall mit leerem Namen zeigt dann eine Abweichung."),
      code: `import { expect, test } from 'vitest';
function before(owner: string | null) {
  if (owner === null) return 'available';
  return \`reserved for \${owner}\`;
}
const after = (owner: string | null) =>
  owner === null ? 'available' : \`reserved for \${owner}\`;
test.each([null, '', 'anna'])('preserves label for %s', (owner) => {
  expect(after(owner)).toBe(before(owner));
});`,
      focus: [
        { line: 2, note: l("The old version: the contract to preserve is that `null` means available.", "Die alte Version: Der Vertrag, den du erhalten musst, ist `null` bedeutet verfügbar.") },
        { line: 7, note: l("The refactor keeps the strict `=== null` check; a truthiness check would treat `''` as available.", "Das Refactoring behält den strengen `=== null`-Vergleich; eine Truthiness-Prüfung würde `''` als verfügbar werten.") },
        { line: [8, 10], note: l("The empty string is the edge case that exposes a silent behaviour change between old and new.", "Der leere String ist der Randfall, der eine stille Verhaltensänderung zwischen alt und neu aufdeckt.") },
      ] }],
    steps: [
      l('Before you change the code, write characterization tests for its current behavior.', 'Schreibe vor der Änderung Characterization Tests für das aktuelle Verhalten.'),
      l('Refactor in small commits. Make sure that all tests pass after each commit.', 'Führe das Refactoring in kleinen Commits durch. Prüfe nach jedem Commit, dass alle Tests bestehen.'),
      l('When possible, use an automated rename, extract operation or codemod.', 'Verwende nach Möglichkeit automatische Rename- oder Extract-Operationen oder einen Codemod.'),
    ],
    done: l('All tests, including the characterization tests, pass. Each commit contains one change that a person can review separately.', 'Alle Tests bestehen. Dazu gehören die Characterization Tests. Jeder Commit enthält eine Änderung, die sich einzeln prüfen lässt.'),
    think: [
      q('An agent "refactored" a function and all tests still pass. What would make you trust that more?', 'Ein Agent hat eine Funktion „refaktoriert“, alle Tests sind grün. Was würde dein Vertrauen erhöhen?',
        'Evidence the tests actually cover that function (mutation score), or a differential test that runs old and new on many generated inputs and compares results.',
        'Belege, dass die Tests diese Funktion wirklich abdecken (Mutation Score), oder ein Differenztest, der alt und neu auf vielen generierten Eingaben vergleicht.'),
      q('Predict: an agent extracts the adoption-fee calculation into a new function and, on the way, changes `Math.round` to `Math.floor`. Which of your current checks notice?', 'Vorhersage: Ein Agent lagert die Berechnung der Adoptionsgebühr in eine neue Funktion aus und ersetzt dabei `Math.round` durch `Math.floor`. Welche deiner Prüfungen bemerken das?',
        'Only tests with an input that rounds differently, for example a fee of 12.5. Type checks and lint stay green. A characterization test or a differential test on generated amounts finds it.',
        'Nur Tests mit einer Eingabe, die anders rundet, etwa eine Gebühr von 12,5. Typprüfung und Linter bleiben grün. Ein Characterization Test oder ein Differential Test mit generierten Beträgen findet es.'),
      q('When is a refactoring the wrong move, even if the code is ugly?', 'Wann ist ein Refactoring die falsche Entscheidung, selbst wenn der Code hässlich ist?',
        'When there are no tests around it and no time to add them, or when the code is about to be deleted. Then the risk of an unnoticed behaviour change is larger than the benefit.',
        'Wenn es keine Tests drumherum gibt und keine Zeit, sie zu ergänzen, oder wenn der Code ohnehin bald gelöscht wird. Dann ist das Risiko einer unbemerkten Verhaltensänderung größer als der Nutzen.'),
    ],
    related: ['snapshot-tests', 'differential-testing', 'architecture', 'mutation-tests'],
  },
  {
    id: 'threat-modeling',
    domain: { parts: ['server-price', 'own-only'], what: l('STRIDE checks the data flow from browser to API, database and payment.', 'STRIDE prüft den Datenfluss vom Browser zu API, Datenbank und Payment.') },
    viz: { kind: 'process', mode: 'threat-modeling' },
    name: l('Threat modeling', 'Threat Modeling (Bedrohungsmodellierung)'),
    layer: 'codebase',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('A threat model shows possible attacks and the controls that can prevent them. Make the model before you implement the design.', 'Ein Threat Model beschreibt mögliche Angriffe und Schutzmaßnahmen. Erstelle das Modell vor der Implementierung.'),
    catches: l('design-level security flaws: missing authorization, trust in client input, data flowing where it should not', 'Fehlende Autorisierung, ungeprüfte Client-Eingaben und Datenflüsse zu nicht vorgesehenen Empfängern.'),
    intro: l(
      'Checkout accepts a price from the browser. A user can submit an incorrect price. Threat modeling can identify this risk before implementation.',
      'Der Checkout übernimmt einen Preis aus dem Browser. Ein Nutzer kann deshalb einen falschen Preis senden. Threat Modeling kann dieses Risiko vor der Implementierung zeigen.',
    ),
    cost: 2,
    feedback: 'days',
    worth: [
      l('A threat model can show a design defect before a scanner can examine the code.', 'Ein Threat Model kann einen Designfehler vor der Implementierung zeigen.'),
      l('A threat model gives specific conditions that tests can check. For example, the server must calculate the price.', 'Ein Threat Model liefert Bedingungen für Tests. Der Server muss zum Beispiel den Preis selbst berechnen.'),
      l('You can start with a drawing of one feature and its data flow.', 'Beginne mit einer Zeichnung der Funktion und ihres Datenflusses.'),
    ],
    limits: [
      l('Results depend on what the participants identify. There is little empirical evidence about the effect.', 'Das Ergebnis hängt davon ab, welche Risiken die Beteiligten erkennen. Zur Wirkung gibt es wenig empirische Evidenz.'),
      l('The model can become incorrect as the system changes. Keep it with the code and update it after design changes.', 'Änderungen am System können das Threat Model ungültig machen. Aktualisiere das Modell nach Änderungen am Design.'),
    ],
    ai: l(
      'A coding agent can draft a STRIDE table. A person must decide which risks to accept. Add tests for the controls that you select.',
      'Ein Coding-Agent kann eine STRIDE-Tabelle entwerfen. Eine Person entscheidet, welche Risiken sie akzeptiert. Schreibe Tests für die gewählten Schutzmaßnahmen.',
    ),
    evidence: { general: none(), ai: none() },
    tools: { python: ['pytm'], any: ['threat-dragon', 'threagile'] },
    snippets: [{ lang: "any", file: "reservation-threats.md",
      enforcedBy: l(
        'No tool enforces this Markdown table; people review it and enforce each control with automated tests or CI checks.',
        'Kein Tool erzwingt diese Markdown-Tabelle; Menschen prüfen sie und setzen jede Schutzmaßnahme mit automatisierten Tests oder CI-Checks durch.',
      ),
      description: l("Use this worksheet before implementation. Ask the coding agent to follow each data path. Ask it for a test for each control. Check authorization and atomicity with tests.",
        "Verwende das Arbeitsblatt vor der Implementierung. Lass den Coding-Agenten jeden Datenpfad verfolgen. Verlange einen Test pro Schutzmaßnahme. Prüfe Autorisierung und Atomarität mit Tests."),
      code: `# Asset: one trustworthy reservation per pet
# Boundary: untrusted client -> API -> database

| Threat | Control | Check |
|---|---|---|
| Ben submits Anna's user ID | derive identity from verified session | reject forged identity |
| Two clients reserve Rex at once | atomic conditional update | one success, one conflict |
| Client supplies a negative fee | compute fee on server | ignore submitted fee |

Owner: name the reviewer before implementation.
Open question: can an admin override a reservation, and who audits it?`,
      focus: [
        { line: 2, note: l("The asset to protect comes first; every threat below is measured against it.", "Zuerst steht, was geschützt wird; jede Bedrohung unten misst sich daran.") },
        { line: 6, note: l("Identity comes from the verified session, never from a field the client can forge.", "Die Identität kommt aus der verifizierten Session, nie aus einem Feld, das der Client fälschen kann.") },
        { line: 7, note: l("The double-reservation threat gets an atomic conditional update, which a concurrency test can then verify.", "Die Doppelreservierung bekommt ein atomares bedingtes Update, das ein Concurrency-Test dann prüfen kann.") },
        { line: 10, note: l("Without a named owner nobody turns these rows into tests, and the model goes stale.", "Ohne benannte Person macht niemand aus diesen Zeilen Tests, und das Modell veraltet.") },
      ] }],
    steps: [
      l('Draw the data flow for one feature, such as a pet reservation. Include actors, processes, data stores and trust boundaries.', 'Zeichne den Datenfluss für eine Funktion, etwa die Reservierung. Zeige Akteure, Prozesse, Datenspeicher und Trust Boundaries.'),
      l('Use STRIDE to examine each element for applicable threats.', 'Prüfe jedes Element mit STRIDE auf mögliche Bedrohungen.'),
      l('Write a test or a CI check for each control that you select. Link the check from the threat model.', 'Schreibe für jede gewählte Schutzmaßnahme einen Test oder CI-Check. Verlinke den Check im Threat Model.'),
    ],
    done: l('The repository contains a threat model. Each required control has a link to its test.', 'Das Repository enthält ein Threat Model. Jede erforderliche Schutzmaßnahme hat einen Link zum zugehörigen Test.'),
    think: [
      q('The petstore client sends the price of an order. What is the threat, and which check catches it?', 'Der Petstore-Client schickt den Preis einer Bestellung mit. Was ist die Bedrohung, und welche Prüfung fängt sie?',
        'Tampering: anyone can send a lower price. The mitigation is that the server recomputes the price; an API test that sends a manipulated price and expects rejection makes it permanent.',
        'Tampering: Jeder kann einen niedrigeren Preis schicken. Die Gegenmaßnahme ist, dass der Server neu rechnet; ein API-Test, der einen manipulierten Preis schickt und Ablehnung erwartet, macht das dauerhaft.'),
      q('Predict: the petstore adds a voucher field to checkout. What new threat appears before a single line of code exists?', 'Vorhersage: Der Petstore bekommt ein Gutschein-Feld im Checkout. Welche neue Bedrohung entsteht, bevor es eine einzige Codezeile gibt?',
        'Tampering and abuse: vouchers can be guessed, reused or stacked. Walking through STRIDE for the new data flow surfaces the rules to enforce on the server: single use, expiry and a limit on discount.',
        'Manipulation und Missbrauch: Gutscheine lassen sich raten, mehrfach einlösen oder stapeln. Der STRIDE-Durchgang durch den neuen Datenfluss zeigt die serverseitigen Regeln: Einmaligkeit, Ablauf und eine Obergrenze für den Rabatt.'),
      q('What changes when an agent writes the feature?', 'Was ändert sich, wenn ein Agent das Feature schreibt?',
        'The model becomes the spec the agent works from, so unwritten assumptions are built in silently. Give the agent the threat model and turn each mitigation into a test it cannot weaken.',
        'Das Modell wird zur Vorlage, mit der der Agent arbeitet; unausgesprochene Annahmen werden sonst stillschweigend eingebaut. Gib dem Agenten das Threat Model und mach jede Gegenmaßnahme zu einem Test, den er nicht abschwächen kann.'),
    ],
    related: ['security-scanning', 'penetration-tests', 'architecture'],
  },
];
