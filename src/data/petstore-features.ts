import type { L } from './types';
import type { PartId } from './petstore';

/**
 * The behaviour of the petstore as Gherkin features: one feature per operation and per rule.
 * The scenarios state what the simulators, code samples and guides of this site do
 * (fee: `src/sim/engine/unitsim.ts`, reserve: `tdd.ts`, voucher: `differential.ts`, split: `pbt.ts`, search: `fuzz.ts`).
 * English uses the English Gherkin keywords; German starts with `# language: de` and uses the German keywords.
 * `tests/unit/petstore-features.test.ts` checks the fee tables and amounts against the engine functions.
 */

/** Parts that have a feature: every operation and every rule. */
export type FeaturePartId =
  | 'search' | 'reserve' | 'cancel' | 'adopt' | 'fee' | 'voucher' | 'checkout'
  | 'never-twice' | 'fee-rules' | 'valid-age' | 'discount-sum' | 'server-price' | 'own-only';

export interface PetstoreFeature {
  /** file name in the code block header */
  file: string;
  /** the full feature text */
  text: L;
}

const f = (file: string, en: string, de: string): PetstoreFeature => ({ file, text: { en, de } });

export const FEATURES: Record<FeaturePartId, PetstoreFeature> = {
  // ---------- operations ----------
  search: f('search.feature', `Feature: Search
  parseSearch(query) changes a query from the URL into filters.

  Scenario: Text, an excluded category and a price limit
    When a person searches for "flat -category:fish price<50"
    Then the search looks for the text "flat"
    And the search excludes the category "fish"
    And the search keeps only prices below 50

  Scenario: A wrong price operator
    When a person searches for "price=50"
    Then the search rejects the query with a syntax error

  Scenario: A broken query does not crash the search
    When a person searches for "price<%"
    Then the search rejects the query with a syntax error`,
  `# language: de
Funktionalität: Suche
  parseSearch(query) macht aus einer Suchanfrage aus der URL Filter.

  Szenario: Text, eine ausgeschlossene Kategorie und eine Preisgrenze
    Wenn eine Person nach "flat -category:fish price<50" sucht
    Dann sucht die Suche nach dem Text "flat"
    Und die Suche schließt die Kategorie "fish" aus
    Und die Suche behält nur Preise unter 50

  Szenario: Ein falscher Preisoperator
    Wenn eine Person nach "price=50" sucht
    Dann lehnt die Suche die Anfrage mit einem Syntaxfehler ab

  Szenario: Eine kaputte Anfrage bringt die Suche nicht zum Absturz
    Wenn eine Person nach "price<%" sucht
    Dann lehnt die Suche die Anfrage mit einem Syntaxfehler ab`),

  reserve: f('reserve.feature', `Feature: Reserve a pet
  reserve(pets, petId, person) reserves a pet for a person.

  Scenario: Reserve an available pet
    Given Rex is available
    When Anna reserves Rex
    Then the result is ok
    And Rex is reserved for Anna

  Scenario: Reserve a pet that does not exist
    Given there is no pet with the id "ghost"
    When Anna reserves "ghost"
    Then the shop rejects the reservation with the reason "not-found"

  Scenario: Reserve in the name of another person
    Given Ben is logged in
    When Ben sends a reservation for Rex in the name of Anna
    Then the shop rejects the request
    And Rex is still available`,
  `# language: de
Funktionalität: Ein Tier reservieren
  reserve(pets, petId, person) reserviert ein Tier für eine Person.

  Szenario: Ein verfügbares Tier reservieren
    Angenommen Rex ist verfügbar
    Wenn Anna Rex reserviert
    Dann ist das Ergebnis ok
    Und Rex ist für Anna reserviert

  Szenario: Ein Tier reservieren, das es nicht gibt
    Angenommen es gibt kein Tier mit der ID "ghost"
    Wenn Anna "ghost" reserviert
    Dann lehnt der Shop die Reservierung mit dem Grund "not-found" ab

  Szenario: Im Namen einer anderen Person reservieren
    Angenommen Ben ist angemeldet
    Wenn Ben eine Reservierung für Rex im Namen von Anna sendet
    Dann lehnt der Shop die Anfrage ab
    Und Rex ist weiter verfügbar`),

  cancel: f('cancel.feature', `Feature: Cancel a reservation
  cancel(petId) releases a reservation.

  Scenario: Cancel a reservation
    Given Anna has reserved Rex
    When Anna cancels the reservation for Rex
    Then Rex is available again

  Scenario: Reserve again after a cancellation
    Given Anna has reserved Rex
    And Anna has cancelled the reservation for Rex
    When Ben reserves Rex
    Then the result is ok
    And Rex is reserved for Ben`,
  `# language: de
Funktionalität: Eine Reservierung stornieren
  cancel(petId) gibt eine Reservierung frei.

  Szenario: Eine Reservierung stornieren
    Angenommen Anna hat Rex reserviert
    Wenn Anna die Reservierung für Rex storniert
    Dann ist Rex wieder verfügbar

  Szenario: Nach einer Stornierung wieder reservieren
    Angenommen Anna hat Rex reserviert
    Und Anna hat die Reservierung für Rex storniert
    Wenn Ben Rex reserviert
    Dann ist das Ergebnis ok
    Und Rex ist für Ben reserviert`),

  adopt: f('adopt.feature', `Feature: Adopt a pet
  An adoption completes a reservation.

  Scenario: Anna adopts the pet that she reserved
    Given Rex is a dog of 3 years
    And Anna has reserved Rex
    When Anna adopts Rex
    Then the payment provider charges 12000 cents
    And Rex is adopted
    And Anna gets an invoice`,
  `# language: de
Funktionalität: Ein Tier adoptieren
  Eine Adoption schließt eine Reservierung ab.

  Szenario: Anna adoptiert das Tier, das sie reserviert hat
    Angenommen Rex ist ein Hund mit 3 Jahren
    Und Anna hat Rex reserviert
    Wenn Anna Rex adoptiert
    Dann bucht der Zahlungsanbieter 12000 Cent ab
    Und Rex ist adoptiert
    Und Anna bekommt eine Rechnung`),

  fee: f('fee.feature', `Feature: Adoption fee
  adoptionFee(species, ageYears) returns the fee in cents.
  The rules "Fee rules" and "Valid age" give all cases.

  Scenario: The fee for a dog of 3 years
    Given a dog of 3 years
    When the shop calculates the adoption fee
    Then the fee is 12000 cents`,
  `# language: de
Funktionalität: Adoptionsgebühr
  adoptionFee(species, ageYears) gibt die Gebühr in Cent zurück.
  Die Regeln "Gebührenregeln" und "Gültiges Alter" nennen alle Fälle.

  Szenario: Die Gebühr für einen Hund mit 3 Jahren
    Angenommen ein Hund mit 3 Jahren
    Wenn der Shop die Adoptionsgebühr berechnet
    Dann ist die Gebühr 12000 Cent`),

  voucher: f('voucher.feature', `Feature: Voucher
  price(cents, voucher) reduces a price with a voucher code.

  Scenario: TIER10 gives 10 % off
    Given a price of 12000 cents
    When Anna uses the voucher "TIER10"
    Then the price is 10800 cents

  Scenario: An unknown code does not change the price
    Given a price of 12000 cents
    When Anna uses the voucher "XMAS"
    Then the price is 12000 cents`,
  `# language: de
Funktionalität: Gutschein
  price(cents, voucher) reduziert einen Preis mit einem Gutscheincode.

  Szenario: TIER10 gibt 10 % Rabatt
    Angenommen ein Preis von 12000 Cent
    Wenn Anna den Gutschein "TIER10" nutzt
    Dann ist der Preis 10800 Cent

  Szenario: Ein unbekannter Code ändert den Preis nicht
    Angenommen ein Preis von 12000 Cent
    Wenn Anna den Gutschein "XMAS" nutzt
    Dann ist der Preis 12000 Cent`),

  checkout: f('checkout.feature', `Feature: Checkout
  allocate(discount, fees) splits one discount over the pets in a cart.

  Scenario: Two pets and one discount
    Given a cart with the fees 12000 and 8000 cents
    When Anna checks out with a discount of 1000 cents
    Then the discount shares are 600 and 400 cents
    And Anna pays 19000 cents`,
  `# language: de
Funktionalität: Checkout
  allocate(discount, fees) verteilt einen Rabatt auf die Tiere im Warenkorb.

  Szenario: Zwei Tiere und ein Rabatt
    Angenommen ein Warenkorb mit den Gebühren 12000 und 8000 Cent
    Wenn Anna mit einem Rabatt von 1000 Cent bezahlt
    Dann sind die Rabattanteile 600 und 400 Cent
    Und Anna zahlt 19000 Cent`),

  // ---------- rules ----------
  'never-twice': f('never-twice.feature', `Feature: Never reserved twice
  A pet must never be reserved twice.

  Scenario: A second person cannot reserve a reserved pet
    Given Anna has reserved Rex
    When Ben tries to reserve Rex
    Then the shop rejects the reservation with the reason "taken"
    And Rex is still reserved for Anna

  Scenario: Two reservations at the same time
    Given Rex is available
    When Anna and Ben reserve Rex at the same time
    Then exactly one reservation is ok
    And Rex is reserved for exactly one person`,
  `# language: de
Funktionalität: Nie doppelt reserviert
  Ein Tier darf nie doppelt reserviert werden.

  Szenario: Eine zweite Person kann ein reserviertes Tier nicht reservieren
    Angenommen Anna hat Rex reserviert
    Wenn Ben versucht, Rex zu reservieren
    Dann lehnt der Shop die Reservierung mit dem Grund "taken" ab
    Und Rex ist weiter für Anna reserviert

  Szenario: Zwei Reservierungen im selben Moment
    Angenommen Rex ist verfügbar
    Wenn Anna und Ben Rex im selben Moment reservieren
    Dann ist genau eine Reservierung ok
    Und Rex ist für genau eine Person reserviert`),

  'fee-rules': f('fee-rules.feature', `Feature: Fee rules
  A dog costs 12000 cents, a cat 8000 cents.
  From 8 years, the fee is half. Under 1 year, add 2000 cents for vaccinations.

  Scenario Outline: The fee for a <species> of <age> years
    Given a <species> of <age> years
    When the shop calculates the adoption fee
    Then the fee is <fee> cents

    Examples:
      | species | age | fee   |
      | dog     | 3   | 12000 |
      | cat     | 3   | 8000  |
      | dog     | 7   | 12000 |
      | dog     | 8   | 6000  |
      | cat     | 10  | 4000  |
      | dog     | 1   | 12000 |
      | dog     | 0   | 14000 |
      | cat     | 0   | 10000 |`,
  `# language: de
Funktionalität: Gebührenregeln
  Ein Hund kostet 12000 Cent, eine Katze 8000 Cent.
  Ab 8 Jahren gilt die halbe Gebühr. Unter 1 Jahr kommen 2000 Cent für Impfungen dazu.

  Szenariogrundriss: Gebühr: <art> mit <alter> Jahren
    Angenommen <art> mit <alter> Jahren
    Wenn der Shop die Adoptionsgebühr berechnet
    Dann ist die Gebühr <gebühr> Cent

    Beispiele:
      | art        | alter | gebühr |
      | ein Hund   | 3     | 12000  |
      | eine Katze | 3     | 8000   |
      | ein Hund   | 7     | 12000  |
      | ein Hund   | 8     | 6000   |
      | eine Katze | 10    | 4000   |
      | ein Hund   | 1     | 12000  |
      | ein Hund   | 0     | 14000  |
      | eine Katze | 0     | 10000  |`),

  'valid-age': f('valid-age.feature', `Feature: Valid age
  The age must be a whole number, 0 or more.

  Scenario Outline: The fee function rejects the age <age>
    Given a dog of <age> years
    When the shop calculates the adoption fee
    Then the shop rejects the age with an error

    Examples:
      | age |
      | -1  |
      | 2.5 |

  Scenario: A pet of 0 years has a valid age
    Given a cat of 0 years
    When the shop calculates the adoption fee
    Then the fee is 10000 cents`,
  `# language: de
Funktionalität: Gültiges Alter
  Das Alter muss eine ganze Zahl ab 0 sein.

  Szenariogrundriss: Die Gebührenfunktion lehnt das Alter <alter> ab
    Angenommen ein Hund mit <alter> Jahren
    Wenn der Shop die Adoptionsgebühr berechnet
    Dann lehnt der Shop das Alter mit einem Fehler ab

    Beispiele:
      | alter |
      | -1    |
      | 2.5   |

  Szenario: Ein Tier mit 0 Jahren hat ein gültiges Alter
    Angenommen eine Katze mit 0 Jahren
    Wenn der Shop die Adoptionsgebühr berechnet
    Dann ist die Gebühr 10000 Cent`),

  'discount-sum': f('discount-sum.feature', `Feature: Discounts add up
  A discount never makes a price higher.
  The shares of a split discount add up to the discount.

  Scenario: A voucher on a very small price
    Given a price of 1 cent
    When Anna uses the voucher "TIER10"
    Then the price is 1 cent

  Scenario: Split a discount over three pets
    Given a cart with the fees 12000, 8000 and 8000 cents
    When the shop splits a discount of 1000 cents
    Then the discount shares are 428, 286 and 286 cents
    And the shares add up to 1000 cents
    And no share is negative`,
  `# language: de
Funktionalität: Rabatte gehen auf
  Ein Rabatt macht einen Preis nie höher.
  Die Anteile eines verteilten Rabatts ergeben genau den Rabatt.

  Szenario: Ein Gutschein auf einen sehr kleinen Preis
    Angenommen ein Preis von 1 Cent
    Wenn Anna den Gutschein "TIER10" nutzt
    Dann ist der Preis 1 Cent

  Szenario: Einen Rabatt auf drei Tiere verteilen
    Angenommen ein Warenkorb mit den Gebühren 12000, 8000 und 8000 Cent
    Wenn der Shop einen Rabatt von 1000 Cent verteilt
    Dann sind die Rabattanteile 428, 286 und 286 Cent
    Und die Anteile ergeben zusammen 1000 Cent
    Und kein Anteil ist negativ`),

  'server-price': f('server-price.feature', `Feature: Price from the server
  The server calculates every price.

  Scenario: The browser sends its own price
    Given Rex is a dog of 3 years
    And Anna has reserved Rex
    When the browser sends an adoption of Rex with the price 100 cents
    Then the server ignores the price from the browser
    And the payment provider charges 12000 cents`,
  `# language: de
Funktionalität: Preis vom Server
  Der Server berechnet jeden Preis.

  Szenario: Der Browser sendet einen eigenen Preis
    Angenommen Rex ist ein Hund mit 3 Jahren
    Und Anna hat Rex reserviert
    Wenn der Browser eine Adoption von Rex mit dem Preis 100 Cent sendet
    Dann ignoriert der Server den Preis aus dem Browser
    Und der Zahlungsanbieter bucht 12000 Cent ab`),

  'own-only': f('own-only.feature', `Feature: Own reservations only
  A person can see and change only their own reservations.

  Scenario: Cancel the reservation of another person
    Given Anna has reserved Rex
    When Ben tries to cancel the reservation for Rex
    Then the shop rejects the request
    And Rex is still reserved for Anna

  Scenario: See only the own reservations
    Given Anna has reserved Rex
    And Ben has reserved Mia
    When Ben opens his reservations
    Then Ben sees Mia
    But Ben does not see Rex`,
  `# language: de
Funktionalität: Nur eigene Reservierungen
  Eine Person kann nur ihre eigenen Reservierungen sehen und ändern.

  Szenario: Die Reservierung einer anderen Person stornieren
    Angenommen Anna hat Rex reserviert
    Wenn Ben versucht, die Reservierung für Rex zu stornieren
    Dann lehnt der Shop die Anfrage ab
    Und Rex ist weiter für Anna reserviert

  Szenario: Nur die eigenen Reservierungen sehen
    Angenommen Anna hat Rex reserviert
    Und Ben hat Mia reserviert
    Wenn Ben seine Reservierungen öffnet
    Dann sieht Ben Mia
    Aber Ben sieht Rex nicht`),
};

export const FEATURE_PARTS = Object.keys(FEATURES) as FeaturePartId[];

/** The feature of a part, if the part has one. */
export const featureOf = (id: PartId): PetstoreFeature | undefined => (FEATURES as Partial<Record<PartId, PetstoreFeature>>)[id];
