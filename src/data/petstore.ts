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
    text: l('Links one pet to one person until the adoption or the cancellation.', 'Verbindet ein Tier mit einer Person bis zur Adoption oder zur Stornierung.'),
    sig: 'pet.reservedBy: person | null' },
  { id: 'invoice', kind: 'data', name: l('Invoice', 'Rechnung'),
    text: l('The text that a person gets after the adoption: pet, date, fee, voucher and total.', 'Der Text, den eine Person nach der Adoption bekommt: Tier, Datum, Gebühr, Gutschein und Summe.'),
    sig: 'renderInvoice(adoption): string' },
  // operations
  { id: 'search', kind: 'operation', name: l('Search', 'Suche'),
    text: l('Finds pets with a query from the URL, for example `flat -category:fish price<50`.', 'Findet Tiere mit einer Suchanfrage aus der URL, zum Beispiel `flat -category:fish price<50`.'),
    sig: 'parseSearch(query) → filters' },
  { id: 'reserve', kind: 'operation', name: l('Reserve', 'Reservieren'),
    text: l('Reserves a pet for a person. The result is `ok`, or a rejection with the reason `taken` or `not-found`.', 'Reserviert ein Tier für eine Person. Das Ergebnis ist `ok` oder eine Ablehnung mit dem Grund `taken` oder `not-found`.'),
    sig: 'reserve(pets, petId, person) → { ok } | { ok: false, reason }', rules: ['never-twice', 'own-only'] },
  { id: 'cancel', kind: 'operation', name: l('Cancel', 'Stornieren'),
    text: l('Releases a reservation, so that the pet is available again.', 'Gibt eine Reservierung frei, damit das Tier wieder verfügbar ist.'),
    sig: 'cancel(petId)', rules: ['own-only'] },
  { id: 'adopt', kind: 'operation', name: l('Adopt', 'Adoptieren'),
    text: l('Completes a reservation: the person pays the fee, takes the pet home and gets an invoice.', 'Schließt eine Reservierung ab: Die Person zahlt die Gebühr, nimmt das Tier mit und bekommt eine Rechnung.'),
    rules: ['server-price'] },
  { id: 'fee', kind: 'operation', name: l('Adoption fee', 'Adoptionsgebühr'),
    text: l('Calculates the adoption fee in cents from the species and the age of the pet.', 'Berechnet die Adoptionsgebühr in Cent aus Art und Alter des Tiers.'),
    sig: 'adoptionFee(species, ageYears) → cents', rules: ['fee-rules', 'valid-age'] },
  { id: 'voucher', kind: 'operation', name: l('Voucher', 'Gutschein'),
    text: l('Reduces a price with a voucher code, for example `TIER10` for 10 % off.', 'Reduziert einen Preis mit einem Gutscheincode, zum Beispiel `TIER10` für 10 % Rabatt.'),
    sig: 'price(cents, voucher) → cents', rules: ['discount-sum'] },
  { id: 'checkout', kind: 'operation', name: l('Checkout', 'Checkout'),
    text: l('Adds the fees of all pets in a cart and splits one discount over them in whole cents.', 'Addiert die Gebühren aller Tiere im Warenkorb und verteilt einen Rabatt in ganzen Cent auf sie.'),
    sig: 'allocate(discount, fees) → shares', rules: ['discount-sum', 'server-price'] },
  // rules
  { id: 'never-twice', kind: 'rule', name: l('Never reserved twice', 'Nie doppelt reserviert'),
    text: l('A pet must never be reserved twice.', 'Ein Tier darf nie doppelt reserviert werden.'),
    sig: 'count(active reservations per pet) ≤ 1' },
  { id: 'fee-rules', kind: 'rule', name: l('Fee rules', 'Gebührenregeln'),
    text: l('A dog costs 120 €, a cat 80 €. From 8 years, the fee is half. Under 1 year, add 20 € for vaccinations.', 'Ein Hund kostet 120 €, eine Katze 80 €. Ab 8 Jahren gilt die halbe Gebühr. Unter 1 Jahr kommen 20 € für Impfungen dazu.'),
    sig: 'dog 12000 · cat 8000 · age ≥ 8: ÷ 2 · age < 1: + 2000' },
  { id: 'valid-age', kind: 'rule', name: l('Valid age', 'Gültiges Alter'),
    text: l('The age must be a whole number, 0 or more. The fee function rejects all other values.', 'Das Alter muss eine ganze Zahl ab 0 sein. Die Gebührenfunktion lehnt alle anderen Werte ab.'),
    sig: 'Number.isInteger(ageYears) && ageYears ≥ 0' },
  { id: 'discount-sum', kind: 'rule', name: l('Discounts add up', 'Rabatte gehen auf'),
    text: l('A discount never makes a price higher. The shares of a split discount add up to the discount, and no share is negative.', 'Ein Rabatt macht einen Preis nie höher. Die Anteile eines verteilten Rabatts ergeben genau den Rabatt, und kein Anteil ist negativ.'),
    sig: 'sum(shares) = discount ∧ every share ≥ 0' },
  { id: 'server-price', kind: 'rule', name: l('Price from the server', 'Preis vom Server'),
    text: l('The server calculates every price. It never uses a price that the browser sends.', 'Der Server berechnet jeden Preis. Er verwendet nie einen Preis, den der Browser sendet.') },
  { id: 'own-only', kind: 'rule', name: l('Own reservations only', 'Nur eigene Reservierungen'),
    text: l('A person can see and change only their own reservations.', 'Eine Person kann nur ihre eigenen Reservierungen sehen und ändern.') },
  // system
  { id: 'agent', kind: 'system', zone: 'build', name: l('Agent setup', 'Agent-Setup'),
    text: l('How coding agents work on the petstore: AGENTS.md, the tasks for evals and an own identity with limited rights.', 'Wie Coding-Agenten am Petstore arbeiten: AGENTS.md, die Aufgaben für Evals und eine eigene Identität mit begrenzten Rechten.') },
  { id: 'tests', kind: 'system', zone: 'build', name: l('Tests and CI', 'Tests und CI'),
    text: l('The test suite and the CI pipeline. CI runs lint, types, tests and the build before each merge.', 'Die Testsuite und die CI-Pipeline. Die CI führt vor jedem Merge Lint, Typen, Tests und Build aus.') },
  { id: 'config', kind: 'system', zone: 'build', name: l('Config and packages', 'Config und Pakete'),
    text: l('Environment variables, secrets, the Kubernetes manifest and the packages in `package.json`.', 'Umgebungsvariablen, Secrets, das Kubernetes-Manifest und die Pakete in `package.json`.') },
  { id: 'ui', kind: 'system', zone: 'run', name: l('Browser UI', 'Browser-UI'),
    text: l('The pages in the browser: the pet list, the reservation form with the "Reserve" button and the adoption page.', 'Die Seiten im Browser: die Tierliste, das Reservierungsformular mit dem Button „Reserve“ und die Adoptionsseite.') },
  { id: 'api', kind: 'system', zone: 'run', name: l('REST API', 'REST-API'),
    text: l('The HTTP interface for the web app and the mobile app: list pets, get a pet, reserve, cancel and pay.', 'Die HTTP-Schnittstelle für Web-App und Mobile-App: Tiere auflisten, ein Tier lesen, reservieren, stornieren und bezahlen.'),
    sig: 'GET /api/pets · GET /api/pets/{id} · POST /reserve · cancel · pay' },
  { id: 'domain', kind: 'system', zone: 'run', name: l('Domain code', 'Domain-Code'),
    text: l('The module with the business logic: data, operations and rules. It must not import code from the UI or the database.', 'Das Modul mit der Fachlogik: Daten, Operationen und Regeln. Es darf keinen Code aus UI oder Datenbank importieren.'),
    sig: 'src/domain: reserve.ts, fee.ts, allocate.ts, search.ts' },
  { id: 'db', kind: 'system', zone: 'run', name: l('Database', 'Datenbank'),
    text: l('Stores pets and reservations. A unique constraint on the pet lets the database reject a second reservation.', 'Speichert Tiere und Reservierungen. Ein Unique Constraint auf dem Tier lässt die Datenbank eine zweite Reservierung ablehnen.') },
  { id: 'services', kind: 'system', zone: 'run', name: l('Payment and mail', 'Payment und Mail'),
    text: l('External services: the payment provider charges the fee, and the mailer sends the confirmation.', 'Externe Dienste: Der Zahlungsanbieter bucht die Gebühr ab, und der Mailer sendet die Bestätigung.') },
  { id: 'rollout', kind: 'system', zone: 'prod', name: l('Deploy and rollout', 'Deploy und Rollout'),
    text: l('How a new version (v2) reaches users next to the old one (v1): deploy, smoke test, feature flag, canary and traffic split.', 'Wie eine neue Version (v2) neben der alten (v1) zu den Nutzern kommt: Deploy, Smoke Test, Feature Flag, Canary und Traffic-Aufteilung.') },
  { id: 'monitoring', kind: 'system', zone: 'prod', name: l('Monitoring', 'Monitoring'),
    text: l('What production reports: metrics such as completed reservations, events, logs, traces, errors and the audit log.', 'Was Production meldet: Metriken wie abgeschlossene Reservierungen, Events, Logs, Traces, Fehler und das Audit-Log.') },
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
  description: l('The running example of this site: operations, rules, data and system parts, the expected behaviour as Gherkin scenarios and the practices that check each part.', 'Das durchgehende Beispiel dieser Seite: Operationen, Regeln, Daten und Systemteile, das erwartete Verhalten als Gherkin-Szenarien und die Praktiken, die jeden Teil prüfen.'),
  intro: l('All exercises and diagrams on this site use one petstore. People reserve pets there and adopt them for a fee.', 'Alle Übungen und Diagramme dieser Seite nutzen einen Petstore. Dort reservieren Menschen Tiere und adoptieren sie gegen eine Gebühr.'),
  howTo: l('Select a part in the picture or in the list. Its card shows the expected behaviour and the practices that check the part.', 'Einen Teil im Bild oder in der Liste wählen. Seine Karte zeigt das erwartete Verhalten und die Praktiken, die den Teil prüfen.'),
  howToLabel: l('How to use this page', 'So nutzt du diese Seite'),
  indexTitle: l('Find a part', 'Einen Teil finden'),
  /** section headings: they say what follows */
  kindHeading: {
    operation: l('Operations: what the petstore does', 'Operationen: was der Petstore tut'),
    rule: l('Rules: what must always be true', 'Regeln: was immer gelten muss'),
    data: l('Data: what the petstore stores', 'Daten: was der Petstore speichert'),
    system: l('System parts: where the code is built, runs and is checked', 'Systemteile: wo der Code gebaut wird, läuft und geprüft wird'),
  } as Record<PartKind, L>,
  gherkinTitle: l('How to read the scenarios', 'So liest du die Szenarien'),
  gherkinText: l('Each operation and each rule shows its expected behaviour as scenarios in Gherkin. `Given` is the start state, `When` is the action, `Then` is the expected result.', 'Jede Operation und jede Regel zeigt ihr erwartetes Verhalten als Szenarien in Gherkin. `Angenommen` (Given) ist der Startzustand, `Wenn` (When) die Aktion, `Dann` (Then) das erwartete Ergebnis.'),
  gherkinRun: l('A BDD tool such as Cucumber runs the scenarios as acceptance tests. You write the step code that connects each step to the petstore.', 'Ein BDD-Tool wie Cucumber führt die Szenarien als Akzeptanztests aus. Den Step-Code, der jeden Schritt mit dem Petstore verbindet, schreibst du selbst.'),
  gherkinGlossary: l('Gherkin in the glossary', 'Gherkin im Glossar'),
  checkedBy: l('Checked by {n} practices', 'Von {n} Praktiken geprüft'),
  checkedByOne: l('Checked by 1 practice', 'Von 1 Praktik geprüft'),
  /** Markdown twin */
  scenarios: l('Scenarios', 'Szenarien'),
  story: l('Anna reserves Rex. Then Ben tries to reserve Rex, and the petstore must reject him.', 'Anna reserviert Rex. Danach will Ben Rex reservieren, und der Petstore muss ihn ablehnen.'),
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
  mapHint: l('The numbers show how many practices check each part.', 'Die Zahlen zeigen, wie viele Praktiken einen Teil prüfen.'),
  count: l('Number of practices that check this part', 'Anzahl der Praktiken, die diesen Teil prüfen'),
  rulesLabel: l('Rules', 'Regeln'),
  usedBy: l('Practices that check this part', 'Praktiken, die diesen Teil prüfen'),
  usedByNone: l('No practice names this part alone. The operations that use it show the practices.', 'Keine Praktik nennt nur diesen Teil. Die Operationen, die ihn nutzen, zeigen die Praktiken.'),
  partsTitle: l('All parts', 'Alle Teile'),
  /** label of the line on each practice page */
  inPetstore: l('In the petstore', 'Im Petstore'),
  /** link text from the practice page and the home page */
  open: l('The petstore example', 'Das Petstore-Beispiel'),
  homeWay: l('Data, operations, rules and system parts of the running example, and the practices that check each part.', 'Daten, Operationen, Regeln und Systemteile des durchgehenden Beispiels und die Praktiken, die jeden Teil prüfen.'),
};
