import type { Practice } from '../types';
import { ev, f, l, none, q } from './_h';

export const codebase: Practice[] = [
  {
    id: 'architecture',
    viz: { kind: 'process', mode: 'architecture' },
    name: l('API design & architecture', 'API-Design & Architektur'),
    layer: 'codebase',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l(
      'Shape modules and interfaces so that wrong use is hard to write and easy to spot.',
      'Module und Schnittstellen so gestalten, dass falsche Nutzung schwer zu schreiben und leicht zu erkennen ist.',
    ),
    catches: l('whole bug classes, before they exist: invalid states, misuse of an API, hidden coupling', 'ganze Fehlerklassen, bevor es sie gibt: ungültige Zustände, falsche API-Nutzung, versteckte Kopplung'),
    intro: l(
      'An agent adds a reservation feature and imports the database code directly into the UI. Nothing stops it, so the next agent copies the shortcut. Clear modules and checked boundaries keep each change in its place.',
      'Ein Agent baut eine Reservierungsfunktion und importiert den Datenbankcode direkt in die UI. Nichts verhindert das, also kopiert der nächste Agent die Abkürzung. Klare Module und geprüfte Grenzen halten jede Änderung an ihrem Platz.',
    ),
    cost: 2,
    feedback: 'days',
    worth: [
      l('Make invalid states unrepresentable: a `Reservation` type that cannot exist without a pet and a person removes a class of checks.', 'Ungültige Zustände nicht darstellbar machen: Ein Typ `Reservation`, der ohne Tier und Person nicht existieren kann, erspart eine ganze Klasse von Prüfungen.'),
      l('Narrow interfaces keep the area an agent has to understand small, so changes stay local.', 'Schmale Schnittstellen halten den Bereich klein, den ein Agent verstehen muss. Änderungen bleiben lokal.'),
      l('Architecture rules (who may import whom) can be checked by a machine in CI.', 'Architekturregeln (wer darf wen importieren) kann eine Maschine in der CI prüfen.'),
    ],
    limits: [
      l('Hard to measure; the benefit shows up as bugs that never happen.', 'Schwer messbar: Der Nutzen zeigt sich als Fehler, die nie entstehen.'),
      l('Good design is a judgement call. Only the rules you encode as checks are enforced.', 'Gutes Design ist eine Abwägung. Erzwungen werden nur die Regeln, die man als Prüfung kodiert.'),
    ],
    ai: l(
      'Agents copy the patterns they find. A codebase with one clear way to do things gets more of that way; a messy one gets more mess. Encode the important boundaries as architecture tests so the agent gets a red signal instead of a style comment.',
      'Agenten kopieren die Muster, die sie vorfinden. Eine Codebasis mit einem klaren Weg bekommt mehr davon, eine unordentliche mehr Unordnung. Wichtige Grenzen als Architekturtests kodieren, damit der Agent ein rotes Signal bekommt statt eines Stilkommentars.',
    ),
    evidence: {
      general: ev('moderate', f('tornhill2022', 'Across 39 proprietary codebases, files with low "code health" had about 15× more defects, and issues in them took about 124% longer to resolve (vendor metric, correlational).', 'In 39 proprietären Codebasen hatten Dateien mit niedriger „Code Health“ etwa 15× mehr Fehler, und Tickets dazu brauchten etwa 124 % länger (Herstellermetrik, korrelativ).')),
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
      l('Identify the 2–3 module boundaries that matter most (e.g. domain must not import UI or HTTP).', 'Die 2–3 wichtigsten Modulgrenzen benennen (z. B. Fachlogik darf weder UI noch HTTP importieren).'),
      l('Encode them as an architecture test with the tool below and run it in CI.', 'Sie mit dem Werkzeug unten als Architekturtest kodieren und in der CI laufen lassen.'),
      l('Find one place where an invalid state is possible and replace it with a type that cannot hold it.', 'Eine Stelle finden, an der ein ungültiger Zustand möglich ist, und sie durch einen Typ ersetzen, der ihn nicht darstellen kann.'),
    ],
    done: l('The architecture test fails when a forbidden import is added and passes on the current code.', 'Der Architekturtest schlägt fehl, sobald ein verbotener Import hinzukommt, und ist auf dem aktuellen Code grün.'),
    think: [
      q('Why is `status: "reserved"` plus an optional `reservedBy` field worse than a union type?', 'Warum ist `status: "reserved"` mit einem optionalen Feld `reservedBy` schlechter als ein Union-Typ?',
        'Because the two fields can disagree: reserved without a person, or a person on an available pet. Every reader has to check both. The union makes the disagreement impossible to write.',
        'Weil die beiden Felder sich widersprechen können: reserviert ohne Person oder eine Person an einem freien Tier. Jeder Leser muss beides prüfen. Der Union-Typ macht den Widerspruch unschreibbar.'),
      q('Which check is cheaper: a reviewer noticing a bad import, or a test that forbids it?', 'Was ist billiger: ein Reviewer, der einen schlechten Import bemerkt, oder ein Test, der ihn verbietet?',
        'The test. It runs on every change, never gets tired and also catches the agent at 3 a.m. That is the whole idea of the funnel.',
        'Der Test. Er läuft bei jeder Änderung, wird nie müde und erwischt auch den Agenten um 3 Uhr nachts. Das ist die ganze Idee des Trichters.'),
      q('Predict: an agent adds a quick import from the HTTP layer into the domain module to reuse a helper. Which check stops it, and what happens if there is none?', 'Vorhersage: Ein Agent importiert zur Wiederverwendung eines Helfers kurzerhand die HTTP-Schicht ins Domänenmodul. Welche Prüfung stoppt das, und was passiert ohne sie?',
        'An architecture test (a forbidden-import rule) fails the build. Without it the import compiles, tests stay green, and the coupling only shows up later when the domain code cannot be reused or tested without HTTP.',
        'Ein Architekturtest (Regel für verbotene Imports) lässt den Build scheitern. Ohne ihn kompiliert der Import, die Tests bleiben grün, und die Kopplung fällt erst später auf, wenn sich die Domäne nicht mehr ohne HTTP wiederverwenden oder testen lässt.'),
    ],
    related: ['type-systems', 'refactoring', 'lint', 'contracts'],
  },
  {
    id: 'refactoring',
    viz: { kind: 'process', mode: 'refactoring' },
    name: l('Refactoring', 'Refactoring'),
    layer: 'codebase',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('Change the structure of code in small safe steps, and keep its behaviour the same.', 'Die Struktur von Code ändern, ohne sein Verhalten zu ändern, in kleinen sicheren Schritten.'),
    catches: l('design decay that makes future bugs likely: duplication, tangled responsibilities, unclear names', 'Verfall des Designs, der künftige Fehler wahrscheinlich macht: Duplikate, verknotete Zuständigkeiten, unklare Namen'),
    intro: l(
      'The reservation code grows with each feature until nobody can change it safely. A rename in one place breaks three other places. Refactoring improves the structure in small steps, and tests confirm that the behaviour stays the same.',
      'Der Reservierungscode wächst mit jeder Funktion, bis niemand ihn sicher ändern kann. Eine Umbenennung an einer Stelle bricht drei andere Stellen. Refactoring verbessert die Struktur in kleinen Schritten, und Tests bestätigen, dass das Verhalten gleich bleibt.',
    ),
    cost: 2,
    feedback: 'hours',
    worth: [
      l('Keeps the codebase in a shape where the other layers of the funnel can work.', 'Hält die Codebasis in einer Form, in der die anderen Schichten des Trichters wirken können.'),
      l('Automated refactorings (rename, extract, codemods) are mechanical and safe; the tooling is mature.', 'Automatisierte Refactorings (Umbenennen, Extrahieren, Codemods) sind mechanisch und sicher; die Werkzeuge sind ausgereift.'),
      l('Pairs well with snapshot or characterization tests that prove behaviour did not change.', 'Passt gut zu Snapshot- oder Charakterisierungstests, die belegen, dass sich das Verhalten nicht geändert hat.'),
    ],
    limits: [
      l('Without tests, a "refactoring" is just a change. The safety comes from the checks around it.', 'Ohne Tests ist ein „Refactoring“ nur eine Änderung. Die Sicherheit kommt von den Prüfungen drumherum.'),
      l('Large refactorings in one step are hard to review, for humans and agents alike.', 'Große Refactorings in einem Schritt sind schwer zu reviewen, für Menschen wie Agenten.'),
    ],
    ai: l(
      'Agents are good at mechanical, wide refactorings, and bad at noticing that they changed behaviour on the way. Pin the behaviour first (characterization tests, differential tests old vs. new), then let the agent refactor in small commits.',
      'Agenten sind gut in mechanischen, breiten Refactorings und schlecht darin zu merken, dass sie dabei Verhalten geändert haben. Erst das Verhalten festhalten (Charakterisierungstests, Differenztests alt gegen neu), dann den Agenten in kleinen Commits refaktorieren lassen.',
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
      description: l("Run this self-contained Vitest example. Both versions must agree on the intended input domain. Change the refactor to use a truthiness check: the empty owner then reveals a behaviour change.",
        "Dieses eigenständige Vitest-Beispiel ausführen. Beide Versionen müssen im vorgesehenen Eingabebereich übereinstimmen. Im Refactoring auf Truthiness prüfen: Eine leere Person zeigt dann eine Verhaltensänderung."),
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
      l('Before changing anything, add characterization tests that record the current behaviour of the code you will touch.', 'Vor jeder Änderung Charakterisierungstests ergänzen, die das aktuelle Verhalten des betroffenen Codes festhalten.'),
      l('Refactor in small commits; each commit must keep all tests green.', 'In kleinen Commits refaktorieren; jeder Commit muss alle Tests grün lassen.'),
      l('Prefer automated refactorings (rename, extract, codemod) over hand edits.', 'Automatisierte Refactorings (Umbenennen, Extrahieren, Codemod) Handänderungen vorziehen.'),
    ],
    done: l('Behaviour is unchanged (all tests and characterization tests pass), and each commit is a single reviewable step.', 'Das Verhalten ist unverändert (alle Tests und Charakterisierungstests grün), und jeder Commit ist ein einzeln reviewbarer Schritt.'),
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
    viz: { kind: 'process', mode: 'threat-modeling' },
    name: l('Threat modeling', 'Threat Modeling (Bedrohungsmodellierung)'),
    layer: 'codebase',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Ask systematically what could go wrong, who could attack, and what you do about it, before you build.', 'Systematisch fragen, was schiefgehen kann, wer angreifen könnte und was man dagegen tut, bevor man baut.'),
    catches: l('design-level security flaws: missing authorization, trust in client input, data flowing where it should not', 'Sicherheitslücken im Entwurf: fehlende Autorisierung, Vertrauen in Client-Eingaben, Daten, die dorthin fließen, wo sie nicht hingehören'),
    intro: l(
      'The petstore checkout trusts the price from the browser. A user sets the price to 0 € and adopts a dog for free. Threat modeling asks what an attacker can do before you build, so you can plan a check for it.',
      'Der Checkout im Petstore vertraut dem Preis aus dem Browser. Ein Nutzer setzt ihn auf 0 € und adoptiert einen Hund gratis. Threat Modeling fragt vor dem Bau, was ein Angreifer tun kann, damit du eine Prüfung dafür planst.',
    ),
    cost: 2,
    feedback: 'days',
    worth: [
      l('Finds flaws no scanner can see, because they are in the design, not in a line of code.', 'Findet Fehler, die kein Scanner sieht, weil sie im Entwurf stecken, nicht in einer Codezeile.'),
      l('Turns vague worries into concrete checks: "the server must recompute the price" becomes a test.', 'Macht aus vagen Sorgen konkrete Prüfungen: „Der Server muss den Preis neu berechnen“ wird ein Test.'),
      l('Cheap to start: a whiteboard, one feature and an hour. It does not need a tool.', 'Günstig zu starten: ein Whiteboard, ein Feature und eine Stunde. Ein Werkzeug ist nicht nötig.'),
    ],
    limits: [
      l('Quality depends on the people in the room; there is little measured evidence of its effect.', 'Die Qualität hängt von den Beteiligten ab; gemessene Belege für die Wirkung gibt es kaum.'),
      l('A model goes stale when the system changes. Keep it next to the code.', 'Ein Modell veraltet, wenn sich das System ändert. Es neben dem Code ablegen.'),
    ],
    ai: l(
      'An agent can draft a STRIDE table from the code in minutes, which makes the exercise cheap. It cannot decide which risks your business accepts. Use it to generate candidates, then turn the accepted mitigations into tests.',
      'Ein Agent kann aus dem Code in Minuten eine STRIDE-Tabelle entwerfen; das macht die Übung billig. Welche Risiken das Unternehmen akzeptiert, kann er nicht entscheiden. Kandidaten generieren lassen, die akzeptierten Gegenmaßnahmen in Tests überführen.',
    ),
    evidence: { general: none(), ai: none() },
    tools: { python: ['pytm'], any: ['threat-dragon', 'threagile'] },
    snippets: [{ lang: "any", file: "reservation-threats.md",
      description: l("Use this review worksheet before implementation. Ask the agent to trace each path through your code and propose a test. A completed document alone cannot verify authorization or atomicity.",
        "Dieses Review-Arbeitsblatt vor der Implementierung verwenden. Den Agenten jeden Pfad im Code verfolgen und einen Test vorschlagen lassen. Ein ausgefülltes Dokument allein prüft weder Autorisierung noch Atomarität."),
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
      l('Draw the data flow of one feature (e.g. reserving a pet): actors, processes, data stores, trust boundaries.', 'Den Datenfluss einer Funktion zeichnen (z. B. Tier reservieren): Akteure, Prozesse, Datenspeicher, Vertrauensgrenzen.'),
      l('For each element, walk through STRIDE (spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege).', 'Für jedes Element STRIDE durchgehen (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).'),
      l('Write each accepted mitigation as a test or a CI check, and link it from the model.', 'Jede akzeptierte Gegenmaßnahme als Test oder CI-Prüfung schreiben und im Modell verlinken.'),
    ],
    done: l('A threat model file lives in the repo, and every mitigation marked "must" has a linked test.', 'Eine Modelldatei liegt im Repo, und jede als „muss“ markierte Gegenmaßnahme hat einen verlinkten Test.'),
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
