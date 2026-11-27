import type { L } from './types';
import { l } from './practices/_h';

/**
 * The running petstore example as data: what the simulators, diagrams and code snippets of the site use.
 * One source for the petstore page, its Markdown twin and the "In the petstore" line on each practice page.
 */

export type PartKind = 'data' | 'operation' | 'rule' | 'system';
export type SystemId = 'agent' | 'tests' | 'config' | 'ui' | 'api' | 'domain' | 'db' | 'services' | 'rollout' | 'monitoring';
export type PartId =
  | 'pet' | 'person' | 'reservation' | 'invoice'
  | 'search' | 'reserve' | 'cancel' | 'adopt' | 'fee' | 'voucher' | 'checkout'
  | 'never-twice' | 'fee-rules' | 'valid-age' | 'discount-sum' | 'server-price' | 'own-only'
  | SystemId;

/** Where a system part sits: before the code runs, while it runs, and in production. */
export type Zone = 'build' | 'run' | 'prod';

export interface DomainPart {
  id: PartId;
  kind: PartKind;
  name: L;
  /** one line, at most 25 words */
  text: L;
  /** code signature, data shape or the rule as a formula */
  sig?: string;
  /** operations: the rules that apply to them */
  rules?: PartId[];
  /** system parts: the zone in the diagram */
  zone?: Zone;
}

export const PARTS: DomainPart[] = [
  // data
  { id: 'pet', kind: 'data', name: l('Pet', 'Tier'),
    text: l('An animal in the shop, for example Rex or Bella. It has a species, an age, a price and a status.', 'Ein Tier im Shop, zum Beispiel Rex oder Bella. Es hat eine Art, ein Alter, einen Preis und einen Status.'),
    sig: "{ id, name, species: 'dog' | 'cat', ageYears, priceCents, status: 'available' | 'reserved' | 'adopted' }" },
  { id: 'person', kind: 'data', name: l('Person', 'Person'),
    text: l('A person who reserves and adopts a pet, for example Anna or Ben.', 'Eine Person, die ein Tier reserviert und adoptiert, zum Beispiel Anna oder Ben.') },
  { id: 'reservation', kind: 'data', name: l('Reservation', 'Reservierung'),
    text: l('A reservation connects one person to one pet until adoption or cancellation.', 'Eine Reservierung verknüpft eine Person mit einem Tier. Diese Zuordnung gilt bis zur Adoption oder Stornierung.'),
    sig: 'pet.reservedBy: person | null' },
  { id: 'invoice', kind: 'data', name: l('Invoice', 'Rechnung'),
    text: l('The invoice gives the pet, date, fee, voucher and total.', 'Die Rechnung nennt das Tier, das Datum, die Gebühr, den Gutschein und die Summe.'),
    sig: 'renderInvoice(adoption): string' },
  // operations
  { id: 'search', kind: 'operation', name: l('Search', 'Suche'),
    text: l('The search operation finds pets that match a query from the URL.', 'Die Suche findet Tiere, die zu einer Anfrage aus der URL passen.'),
    sig: 'parseSearch(query) → filters' },
  { id: 'reserve', kind: 'operation', name: l('Reserve', 'Reservieren'),
    text: l('The operation tries to reserve a pet for one person. It returns `ok` on success. A rejection gives `taken` or `not-found` as the reason.', 'Die Operation versucht, ein Tier für eine Person zu reservieren. Bei Erfolg liefert sie `ok`. Bei Ablehnung nennt sie `taken` oder `not-found`.'),
    sig: 'reserve(pets, petId, person) → { ok } | { ok: false, reason }', rules: ['never-twice', 'own-only'] },
  { id: 'cancel', kind: 'operation', name: l('Cancel', 'Stornieren'),
    text: l('Cancellation removes a reservation. The pet becomes available again.', 'Die Stornierung beendet die Reservierung. Das Tier ist danach wieder verfügbar.'),
    sig: 'cancel(petId)', rules: ['own-only'] },
  { id: 'adopt', kind: 'operation', name: l('Adopt', 'Adoptieren'),
    text: l('The person pays the fee and receives an invoice. The petstore marks the pet as adopted.', 'Die Person zahlt die Gebühr und erhält eine Rechnung. Der Petstore markiert das Tier als adoptiert.'),
    rules: ['server-price'] },
  { id: 'fee', kind: 'operation', name: l('Adoption fee', 'Adoptionsgebühr'),
    text: l('Calculates the adoption fee in cents from the species and the age of the pet.', 'Berechnet die Adoptionsgebühr in Cent aus Art und Alter des Tiers.'),
    sig: 'adoptionFee(species, ageYears) → cents', rules: ['fee-rules', 'valid-age'] },
  { id: 'voucher', kind: 'operation', name: l('Voucher', 'Gutschein'),
    text: l('A voucher decreases the price. For example, `TIER10` decreases it by 10%.', 'Ein Gutschein senkt den Preis. `TIER10` senkt den Preis zum Beispiel um 10 %.'),
    sig: 'price(cents, voucher) → cents', rules: ['discount-sum'] },
  { id: 'checkout', kind: 'operation', name: l('Checkout', 'Checkout'),
    text: l('Checkout adds the fees for the pets in a cart. It divides the discount among the pets in whole cents.', 'Der Checkout addiert die Gebühren für alle Tiere im Warenkorb. Er verteilt den Rabatt in ganzen Cent.'),
    sig: 'allocate(discount, fees) → shares', rules: ['discount-sum', 'server-price'] },
  // rules
  { id: 'never-twice', kind: 'rule', name: l('Never reserved twice', 'Nie doppelt reserviert'),
    text: l('A pet can have at most one active reservation.', 'Ein Tier darf höchstens eine aktive Reservierung haben.'),
    sig: 'count(active reservations per pet) ≤ 1' },
  { id: 'fee-rules', kind: 'rule', name: l('Fee rules', 'Gebührenregeln'),
    text: l('Dogs cost €120. Cats cost €80. Pets aged 8 years or more cost half. Add €20 for vaccinations for pets under 1 year.', 'Hunde kosten 120 €. Katzen kosten 80 €. Ab 8 Jahren gilt der halbe Preis. Unter 1 Jahr kommen 20 € für Impfungen hinzu.'),
    sig: 'dog 12000 · cat 8000 · age ≥ 8: ÷ 2 · age < 1: + 2000' },
  { id: 'valid-age', kind: 'rule', name: l('Valid age', 'Gültiges Alter'),
    text: l('The age must be a whole number, 0 or more. The fee function rejects all other values.', 'Das Alter muss eine ganze Zahl ab 0 sein. Die Gebührenfunktion lehnt alle anderen Werte ab.'),
    sig: 'Number.isInteger(ageYears) && ageYears ≥ 0' },
  { id: 'discount-sum', kind: 'rule', name: l('Discounts add up', 'Rabatte gehen auf'),
    text: l('A discount cannot increase a price. The discount shares must total the full discount. Each share must be zero or greater.', 'Ein Rabatt darf den Preis nicht erhöhen. Die Summe der Anteile muss dem Rabatt entsprechen. Jeder Anteil muss mindestens null sein.'),
    sig: 'sum(shares) = discount ∧ every share ≥ 0' },
  { id: 'server-price', kind: 'rule', name: l('Price from the server', 'Preis vom Server'),
    text: l('The server calculates every price. It never uses a price that the browser sends.', 'Der Server berechnet jeden Preis. Er verwendet nie einen Preis, den der Browser sendet.') },
  { id: 'own-only', kind: 'rule', name: l('Own reservations only', 'Nur eigene Reservierungen'),
    text: l('A person can see and change only their own reservations.', 'Eine Person kann nur ihre eigenen Reservierungen sehen und ändern.') },
  // system
  { id: 'agent', kind: 'system', zone: 'build', name: l('Agent setup', 'Agent-Setup'),
    text: l('Coding agents read AGENTS.md as instructions (not enforced by a tool). Evals measure the setup. Each coding agent has an identity with limited permissions.', 'Coding-Agenten lesen AGENTS.md als Anweisung (kein Tool erzwingt die Datei). Evals prüfen das Setup. Jeder Coding-Agent hat eine Identität mit begrenzten Rechten.') },
  { id: 'tests', kind: 'system', zone: 'build', name: l('Tests and CI', 'Tests und CI'),
    text: l('The test suite and the CI pipeline. CI runs lint, types, tests and the build before each merge.', 'Die Testsuite und die CI-Pipeline. Die CI führt vor jedem Merge Lint, Typen, Tests und Build aus.') },
  { id: 'config', kind: 'system', zone: 'build', name: l('Config and packages', 'Config und Pakete'),
    text: l('Environment variables, secrets, the Kubernetes manifest and the packages in `package.json`.', 'Umgebungsvariablen, Secrets, das Kubernetes-Manifest und die Pakete in `package.json`.') },
  { id: 'ui', kind: 'system', zone: 'run', name: l('Browser UI', 'Browser-UI'),
    text: l('The pages in the browser: the pet list, the reservation form with the "Reserve" button and the adoption page.', 'Die Seiten im Browser: die Tierliste, das Reservierungsformular mit dem Button „Reserve“ und die Adoptionsseite.') },
  { id: 'api', kind: 'system', zone: 'run', name: l('REST API', 'REST-API'),
    text: l('The web app and mobile app use this HTTP interface. It supplies pet data and accepts requests to reserve, cancel or pay.', 'Die Web-App und die Mobile-App nutzen diese HTTP-Schnittstelle. Die API liefert Tierdaten und nimmt Requests für Reservierung, Stornierung und Zahlung an.'),
    sig: 'GET /api/pets · GET /api/pets/{id} · POST /reserve · cancel · pay' },
  { id: 'domain', kind: 'system', zone: 'run', name: l('Domain code', 'Domain-Code'),
    text: l('The module with the business logic: data, operations and rules. An architecture test in CI forbids imports from the UI or the database.', 'Das Modul mit der Fachlogik: Daten, Operationen und Regeln. Ein Architecture Test in CI verbietet Imports aus UI oder Datenbank.'),
    sig: 'src/domain: reserve.ts, fee.ts, allocate.ts, search.ts' },
  { id: 'db', kind: 'system', zone: 'run', name: l('Database', 'Datenbank'),
    text: l('The database stores pets and reservations. A unique constraint prevents more than one active reservation for the same pet.', 'Die Datenbank speichert Tiere und Reservierungen. Ein Unique Constraint verhindert mehrere aktive Reservierungen für dasselbe Tier.') },
  { id: 'services', kind: 'system', zone: 'run', name: l('Payment and mail', 'Payment und Mail'),
    text: l('External services: the payment provider charges the fee, and the mailer sends the confirmation.', 'Der Payment Provider belastet die Gebühr. Der Mailer sendet eine Bestätigung.') },
  { id: 'rollout', kind: 'system', zone: 'prod', name: l('Deploy and rollout', 'Deploy und Rollout'),
    text: l('The rollout controls how much traffic reaches v2 while v1 still operates. Smoke tests, feature flags and canary releases can control the change.', 'Der Rollout steuert, wie viel Traffic v2 erhält, während v1 weiter läuft. Smoke Tests, Feature Flags und Canary Releases unterstützen die Umstellung.') },
  { id: 'monitoring', kind: 'system', zone: 'prod', name: l('Monitoring', 'Monitoring'),
    text: l('Production monitoring collects metrics, events, logs, traces and errors. One metric counts completed reservations.', 'Monitoring erfasst Metriken, Events, Logs, Traces und Fehler. Eine Metrik zählt abgeschlossene Reservierungen.') },
];

export const PART_BY_ID = new Map<PartId, DomainPart>(PARTS.map((p) => [p.id, p]));

/** The system part that holds a part: data, operations and rules live in the domain code. */
export const systemOf = (id: PartId): SystemId => {
  const p = PART_BY_ID.get(id)!;
  return p.kind === 'system' ? (p.id as SystemId) : 'domain';
};

/** Page order: what the petstore does and what must hold come first. */
export const KIND_ORDER: PartKind[] = ['operation', 'rule', 'data', 'system'];
export const ZONE_ORDER: Zone[] = ['build', 'run', 'prod'];

/** Anchor on the petstore page. */
export const partAnchor = (id: PartId) => `part-${id}`;

export const PETSTORE_COPY = {
  title: l('The petstore example', 'Das Petstore-Beispiel'),
  description: l('The petstore example shows the operations, data and rules that the checks use. It gives Gherkin scenarios for the required behavior.', 'Das Petstore-Beispiel zeigt die Operationen, Daten und Regeln der Übungen. Gherkin-Szenarien beschreiben das erwartete Verhalten.'),
  intro: l('People reserve pets and adopt them for a fee. The exercises on this site use these operations to show what each check does.', 'Personen reservieren Tiere und adoptieren sie gegen eine Gebühr. Die Übungen zeigen anhand dieser Abläufe, was jeder Check prüft.'),
  howTo: l('Select a system part to open its scenarios and checks.', 'Wähle einen Systemteil. Die Karte zeigt seine Szenarien und Checks.'),
  howToLabel: l('How to use this page', 'So nutzt du diese Seite'),
  indexTitle: l('Find a part', 'Einen Teil finden'),
  /** section headings: they say what follows */
  kindHeading: {
    operation: l('Operations: what the petstore does', 'Operationen: was der Petstore tut'),
    rule: l('Rules: what must always be true', 'Regeln: was immer gelten muss'),
    data: l('Data: what the petstore stores', 'Daten: was der Petstore speichert'),
    system: l('System parts: where the code is built, runs and is checked', 'Systemteile: wo der Code gebaut wird, läuft und geprüft wird'),
  } as Record<PartKind, L>,
  gherkinTitle: l('Gherkin scenarios', 'Gherkin-Szenarien'),
  gherkinText: l('Gherkin scenarios give examples for operations and rules. `Given` specifies the initial state. `When` specifies the action. `Then` specifies the expected result. A tool such as Cucumber can run the scenario.', 'Gherkin-Szenarien geben Beispiele für Operationen und Regeln. `Angenommen` nennt den Startzustand. `Wenn` nennt die Aktion. `Dann` nennt das erwartete Ergebnis. Cucumber kann das Szenario ausführen.'),
  gherkinRun: l('Open a card to read its `.feature` file. You can copy the file from the card.', 'Öffne eine Karte, um ihre `.feature`-Datei zu lesen. Du kannst die Datei aus der Karte kopieren.'),
  gherkinGlossary: l('Gherkin in the glossary', 'Gherkin im Glossar'),
  checkedBy: l('Checked by {n} practices', 'Von {n} Praktiken geprüft'),
  checkedByOne: l('Checked by 1 practice', 'Von 1 Praktik geprüft'),
  /** Markdown twin */
  scenarios: l('Scenarios', 'Szenarien'),
  story: l('Anna reserves Rex. Ben then tries to reserve Rex. The petstore must reject Ben\'s request.', 'Anna reserviert Rex. Ben versucht danach, Rex zu reservieren. Der Petstore muss Bens Request ablehnen.'),
  mapLabel: l('Map of the petstore: build, the running system and production', 'Übersicht des Petstores: Bauen, laufendes System und Production'),
  zone: {
    build: l('Before the code runs', 'Bevor der Code läuft'),
    run: l('The running petstore', 'Der laufende Petstore'),
    prod: l('In production', 'In Production'),
  } as Record<Zone, L>,
  kind: {
    data: l('Data', 'Daten'),
    operation: l('Operations', 'Operationen'),
    rule: l('Rules', 'Regeln'),
    system: l('System parts', 'Systemteile'),
  } as Record<PartKind, L>,
  kindOne: {
    data: l('Data', 'Daten'),
    operation: l('Operation', 'Operation'),
    rule: l('Rule', 'Regel'),
    system: l('System part', 'Systemteil'),
  } as Record<PartKind, L>,
  mapHint: l('Select a part to open its card. The number shows how many checks use that part.', 'Wähle einen Teil, um seine Karte zu öffnen. Die Zahl zeigt, wie viele Checks den Teil prüfen.'),
  count: l('Number of practices that check this part', 'Anzahl der Praktiken, die diesen Teil prüfen'),
  rulesLabel: l('Rules', 'Regeln'),
  usedBy: l('Practices that check this part', 'Praktiken, die diesen Teil prüfen'),
  usedByNone: l('The checks for the operations also examine this part.', 'Die Checks für die Operationen prüfen auch diesen Teil.'),
  partsTitle: l('All parts', 'Alle Teile'),
  /** label of the line on each practice page */
  inPetstore: l('In the petstore', 'Im Petstore'),
  /** link text from the practice page and the home page */
  open: l('The petstore example', 'Das Petstore-Beispiel'),
  homeWay: l('The petstore shows how to find duplicate reservations and incorrect fees.', 'Der Petstore zeigt zwei Beispiele. Prüfe, dass jedes Tier höchstens eine aktive Reservierung hat. Prüfe auch die Adoptionsgebühr.'),
};
