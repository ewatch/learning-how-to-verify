import type { Practice } from '../types';
import { ev, f, l, none, q } from './_h';

const RUNNERS = { php: ['phpunit', 'pest'], js: ['vitest', 'jest', 'node-test'], python: ['pytest'], java: ['junit', 'kotest'], dotnet: ['xunit', 'nunit'], go: ['go-test'], rust: ['cargo-test'], cpp: ['googletest', 'catch2'] };

export const staticTests: Practice[] = [
  {
    id: 'unit-tests',
    name: l('Unit tests', 'Unit-Tests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Check one small piece of code in isolation with concrete inputs and expected outputs.', 'Ein kleines Stück Code isoliert mit konkreten Eingaben und erwarteten Ausgaben prüfen.'),
    catches: l('wrong logic in a function: off-by-one, wrong branch, mishandled error case', 'falsche Logik in einer Funktion: um eins daneben, falscher Zweig, schlecht behandelter Fehlerfall'),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('Fast and precise: a failing unit test points at one function.', 'Schnell und präzise: Ein fehlschlagender Unit-Test zeigt auf eine Funktion.'),
      l('Testing error-handling paths pays off most; many severe production failures start there.', 'Fehlerbehandlungspfade zu testen lohnt am meisten; viele schwere Produktionsausfälle beginnen dort.'),
      l('Examples double as documentation of intended behaviour.', 'Beispiele sind zugleich Dokumentation des gewollten Verhaltens.'),
    ],
    limits: [
      l('Only checks the examples you thought of. Use property-based tests for the ones you did not.', 'Prüft nur die Beispiele, an die man gedacht hat. Für die anderen: Property-Based Tests.'),
      l('Green unit tests say nothing about whether the units work together.', 'Grüne Unit-Tests sagen nichts darüber, ob die Einheiten zusammenspielen.'),
    ],
    ai: l(
      'Tests are the strongest feedback signal for agents, by a wide margin. But a test the agent wrote to match its own code proves little; check test quality with mutation testing.',
      'Tests sind mit großem Abstand das stärkste Feedback für Agenten. Ein Test, den der Agent passend zu seinem Code schrieb, beweist aber wenig; die Testqualität mit Mutation Testing prüfen.',
    ),
    evidence: {
      general: ev('strong', f('yuan2014', '92% of catastrophic failures in five distributed systems came from wrong handling of non-fatal errors; 58% could have been caught by simple tests of the error-handling code.', '92 % der katastrophalen Ausfälle in fünf verteilten Systemen kamen von falscher Behandlung nicht fataler Fehler; 58 % wären mit einfachen Tests der Fehlerbehandlung aufgefallen.')),
      ai: ev('strong',
        f('reflexion2023', 'Iterating on unit-test feedback raised HumanEval pass@1 to 91%.', 'Iteration auf Unit-Test-Feedback hob pass@1 auf HumanEval auf 91 %.'),
        f('codet2023', 'Ranking candidate programs by agreement with generated tests raised HumanEval pass@1 by 18.8 points.', 'Kandidatenprogramme nach Übereinstimmung mit generierten Tests zu ranken hob pass@1 auf HumanEval um 18,8 Punkte.'),
        f('swebench2024', 'SWE-bench, the main benchmark for coding agents, uses tests as the oracle for 2,294 real GitHub issues.', 'SWE-bench, der wichtigste Benchmark für Coding-Agenten, nutzt Tests als Orakel für 2.294 echte GitHub-Issues.')),
    },
    tools: RUNNERS,
    sim: 'unit',
    snippets: [
      { lang: 'js', file: 'fee.test.ts', code: `import { describe, expect, it } from 'vitest';
import { adoptionFee } from './fee';

describe('adoptionFee', () => {
  it('charges the base fee', () => expect(adoptionFee({ species: 'dog', ageYears: 3 })).toBe(12000));
  it('halves the fee for senior pets (8+ years)', () => expect(adoptionFee({ species: 'dog', ageYears: 8 })).toBe(6000));
  it('rejects a negative age', () => expect(() => adoptionFee({ species: 'dog', ageYears: -1 })).toThrow());
});`,
      focus: [
        { line: 5, note: l("The base case anchors the tests: a named expected value (12000) instead of recomputing the formula.", "Der Basisfall verankert die Tests: ein konkreter Erwartungswert (12000) statt die Formel nachzurechnen.") },
        { line: 6, note: l("Age 8 is exactly the boundary; off-by-one errors in `>` versus `>=` hide here.", "Alter 8 ist genau die Grenze; Off-by-one-Fehler bei `>` gegen `>=` verstecken sich hier.") },
        { line: 7, note: l("The test says what must not work; invalid input should fail loudly, not produce a price.", "Der Test sagt, was nicht funktionieren darf; ungültige Eingabe soll laut scheitern, nicht einen Preis liefern.") },
      ] },
      { lang: 'python', file: 'test_fee.py', code: `import pytest
from fee import adoption_fee

def test_base_fee():
    assert adoption_fee(species="dog", age_years=3) == 12000

def test_senior_pets_pay_half():
    assert adoption_fee(species="dog", age_years=8) == 6000

def test_negative_age_is_rejected():
    with pytest.raises(ValueError):
        adoption_fee(species="dog", age_years=-1)`,
      focus: [
        { line: 5, note: l("The expected value is a literal, so a bug in the formula cannot also hide in the test.", "Der Erwartungswert ist ein Literal, ein Fehler in der Formel kann sich also nicht im Test mitverstecken.") },
        { line: 8, note: l("The senior rule starts at 8, so this test pins the discount, not just any number.", "Die Senior-Regel beginnt bei 8, dieser Test hält also genau den Rabatt fest, nicht irgendeine Zahl.") },
        { line: [11, 12], note: l("`pytest.raises` makes the rejection part of the contract and fails if no error comes.", "`pytest.raises` macht die Ablehnung zum Teil des Vertrags und scheitert, wenn kein Fehler kommt.") },
      ] },
      { lang: 'php', file: 'FeeTest.php', code: `<?php declare(strict_types=1);
// composer require --dev phpunit/phpunit
// vendor/bin/phpunit tests/FeeTest.php --bootstrap vendor/autoload.php
use PHPUnit\\Framework\\TestCase;

final class FeeTest extends TestCase
{
    public function testSeniorBoundary(): void
    {
        self::assertSame(12000, adoptionFee('dog', 7));
        self::assertSame(6000, adoptionFee('dog', 8));
    }

    public function testNegativeAgeIsRejected(): void
    {
        $this->expectException(InvalidArgumentException::class);
        adoptionFee('dog', -1);
    }
}`,
      focus: [
        { line: 1, note: l("`strict_types` stops PHP from coercing a string age into an int, so the boundary test sees real types.", "`strict_types` verhindert, dass PHP ein Alter als String still in einen Int umwandelt, der Grenztest sieht also echte Typen.") },
        { line: [10, 11], note: l("7 and 8 sit on both sides of the boundary, the place off-by-one bugs live.", "7 und 8 liegen auf beiden Seiten der Grenze, dort wohnen Off-by-one-Fehler.") },
        { line: [16, 17], note: l("Invalid input must throw, so the test fails if a negative age quietly yields a price.", "Ungültige Eingabe muss eine Exception werfen, der Test scheitert also, wenn ein negatives Alter still einen Preis liefert.") },
      ] },
    ],
    steps: [
      l('Pick one module with business logic and list its behaviours, including every error case.', 'Ein Modul mit Fachlogik wählen und seine Verhaltensweisen auflisten, inklusive jedes Fehlerfalls.'),
      l('Write one test per behaviour with a concrete input and an exact expected value; test boundaries explicitly.', 'Pro Verhalten einen Test mit konkreter Eingabe und exaktem Erwartungswert schreiben; Grenzen explizit testen.'),
      l('Make the tests fast (no network, no clock, no randomness) and run them in CI.', 'Die Tests schnell machen (kein Netz, keine Uhr, kein Zufall) und in der CI ausführen.'),
      l('Run mutation testing on the module and add tests until no meaningful mutant survives.', 'Mutation Testing auf dem Modul ausführen und Tests ergänzen, bis kein bedeutsamer Mutant überlebt.'),
    ],
    done: l('Every behaviour and error case has a test with an exact assertion; the suite runs in seconds; surviving mutants are explained.', 'Jedes Verhalten und jeder Fehlerfall hat einen Test mit exakter Assertion; die Suite läuft in Sekunden; überlebende Mutanten sind begründet.'),
    think: [
      q('Your test for "senior pets pay half" uses age 10. What bug can it not catch?', 'Dein Test für „Senioren zahlen die Hälfte“ nutzt Alter 10. Welchen Fehler kann er nicht finden?',
        'A wrong boundary: `age > 8` instead of `age >= 8` behaves identically at 10. You need the boundary itself, 8, and the value just below it, 7.',
        'Eine falsche Grenze: `age > 8` statt `age >= 8` verhält sich bei 10 identisch. Man braucht die Grenze selbst, 8, und den Wert knapp darunter, 7.'),
      q('Why does a test that only checks `toBeDefined()` count as "coverage" but not as verification?', 'Warum zählt ein Test, der nur `toBeDefined()` prüft, als „Abdeckung“, aber nicht als Verifikation?',
        'It executes the code (so coverage goes up) but would pass for almost any result. Mutation testing exposes this immediately.',
        'Er führt den Code aus (die Abdeckung steigt), würde aber bei fast jedem Ergebnis bestehen. Mutation Testing zeigt das sofort.'),
      q('Predict: a unit test for `reserve` mocks the repository to always return the pet as available. What does a passing test tell you about double booking?', 'Vorhersage: Ein Unit-Test für `reserve` mockt das Repository so, dass das Tier immer verfügbar ist. Was sagt ein bestandener Test über Doppelbuchungen aus?',
        'Nothing. The mock makes the interesting case impossible. Test the rule with a stateful fake, and the concurrent case against a real database.',
        'Nichts. Der Mock macht den interessanten Fall unmöglich. Die Regel mit einem zustandsbehafteten Fake testen, den nebenläufigen Fall gegen eine echte Datenbank.'),
    ],
    related: ['property-based-tests', 'mutation-tests', 'coverage', 'tdd'],
  },
  {
    id: 'functional-tests',
    viz: { kind: 'scope', mode: 'functional-tests' },
    name: l('Functional tests', 'Funktionale Tests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Check that a feature does what the requirement says, through its public interface, without caring how it is built.', 'Prüfen, dass eine Funktion über ihre öffentliche Schnittstelle tut, was die Anforderung sagt, egal wie sie gebaut ist.'),
    catches: l('features that are implemented but do the wrong thing for the user', 'Funktionen, die zwar umgesetzt sind, für den Nutzer aber das Falsche tun'),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('Survive refactoring, because they do not know the internals.', 'Überleben Refactorings, weil sie das Innere nicht kennen.'),
      l('Map one-to-one to requirements, which makes gaps visible.', 'Lassen sich eins zu eins auf Anforderungen abbilden; Lücken werden sichtbar.'),
      l('Requirement-based tests can be written before the implementation and reused when it is rewritten.', 'Anforderungsbasierte Tests lassen sich vor der Implementierung schreiben und bei einer Neuimplementierung wiederverwenden.'),
    ],
    limits: [
      l('Slower and less precise than unit tests when they fail.', 'Langsamer und bei Fehlschlag weniger präzise als Unit-Tests.'),
      l('They only cover the requirements someone wrote down; unwritten ones (concurrency, limits) stay unchecked.', 'Sie decken nur aufgeschriebene Anforderungen ab; unausgesprochene (Nebenläufigkeit, Grenzen) bleiben ungeprüft.'),
    ],
    ai: l('Black-box tests are good guardrails for agents because they keep passing while the agent restructures the inside, and fail only when behaviour changes.', 'Black-Box-Tests sind gute Leitplanken für Agenten: Sie bleiben grün, während der Agent das Innere umbaut, und scheitern nur, wenn sich das Verhalten ändert.'),
    evidence: { general: ev('weak', f('yuan2014', 'Testing in general: simple tests of error-handling paths would have prevented most catastrophic failures in the systems studied.', 'Testen allgemein: Einfache Tests der Fehlerbehandlung hätten die meisten katastrophalen Ausfälle in den untersuchten Systemen verhindert.')), ai: none() },
    tools: { ...RUNNERS, any: ['schemathesis'] },
    snippets: [{ lang: "js", file: "reservation-functional.test.ts",
      description: l("This self-contained Vitest example checks one user-visible rule through a small in-memory API. Replace the fixture with your application entry point. Remove the taken check and the last two assertions should fail.",
        "Dieses eigenständige Vitest-Beispiel prüft eine sichtbare Fachregel über eine kleine In-memory-API. Das Fixture durch den Anwendungseinstieg ersetzen. Die Taken-Prüfung entfernen: Die letzten beiden Assertions sollen scheitern."),
      code: `import { expect, test } from 'vitest';
function petstore() {
  let owner: string | null = null;
  return {
    reserve(person: string) {
      if (owner !== null) return 'taken';
      owner = person;
      return 'reserved';
    },
    owner: () => owner,
  };
}
test('a second person cannot take a reserved pet', () => {
  const store = petstore();
  expect(store.reserve('anna')).toBe('reserved');
  expect(store.reserve('ben')).toBe('taken');
  expect(store.owner()).toBe('anna');
});`,
      focus: [
        { line: 2, note: l("Each call gets its own `petstore()`, so tests cannot leak state into each other.", "Jeder Aufruf bekommt sein eigenes `petstore()`, damit Tests keinen Zustand teilen.") },
        { line: [5, 9], note: l("The rule under test: a taken pet is never overwritten, so the second person gets `taken`.", "Die Regel unter Test: Ein vergebenes Tier wird nie überschrieben, die zweite Person bekommt `taken`.") },
        { line: 17, note: l("Checking the owner afterwards proves the failed call did not change state, not just its return value.", "Der Blick auf den Besitzer danach beweist, dass der fehlgeschlagene Aufruf nichts verändert hat, nicht nur seinen Rückgabewert.") },
      ] }],
    steps: [
      l('For one feature, list its requirements as given/when/then sentences.', 'Für eine Funktion die Anforderungen als Gegeben/Wenn/Dann-Sätze auflisten.'),
      l('Write one test per sentence that uses only the public interface (API, exported function, CLI).', 'Pro Satz einen Test schreiben, der nur die öffentliche Schnittstelle nutzt (API, exportierte Funktion, CLI).'),
      l('Run the tests against a build without access to internals and confirm that they still pass after a refactoring.', 'Die Tests gegen einen Build ohne Zugriff auf Interna ausführen und prüfen, dass sie nach einem Refactoring weiter bestehen.'),
    ],
    done: l('Each requirement sentence has a passing test that uses only the public interface.', 'Jeder Anforderungssatz hat einen grünen Test, der nur die öffentliche Schnittstelle nutzt.'),
    think: [
      q('What is the difference between a functional test and an acceptance test?', 'Was ist der Unterschied zwischen funktionalem Test und Akzeptanztest?',
      'Mostly who signs off. A functional test checks behaviour against the spec; an acceptance test is the one the customer or product owner agreed decides "done".',
      'Vor allem, wer abzeichnet. Ein funktionaler Test prüft Verhalten gegen die Spezifikation; ein Akzeptanztest ist der, von dem Kunde oder Product Owner vereinbart haben, dass er über „fertig“ entscheidet.'),
      q('Predict: the requirement says "reserving an available pet succeeds". The agent implements it and the test passes. What does it do for an already reserved pet?', 'Vorhersage: Die Anforderung lautet „ein verfügbares Tier lässt sich reservieren“. Der Agent setzt sie um, der Test besteht. Was passiert bei einem bereits reservierten Tier?',
        'Unknown. A requirement that is not written has no test, and the agent may allow it. List the negative cases as requirements too: reserved, adopted, unknown id.',
        'Unbekannt. Eine nicht aufgeschriebene Anforderung hat keinen Test, und der Agent lässt es womöglich zu. Auch die Negativfälle als Anforderungen aufführen: reserviert, adoptiert, unbekannte ID.'),
      q('When is a functional test the wrong tool?', 'Wann ist ein Functional Test das falsche Werkzeug?',
        'For pinpointing a bug in a calculation or for exhaustive edge cases. A failure says the feature is wrong, not where; unit and property tests are faster and more precise.',
        'Um einen Fehler in einer Berechnung einzugrenzen oder für erschöpfende Grenzfälle. Ein Fehlschlag sagt, dass das Feature falsch ist, nicht wo; Unit- und Property-Tests sind schneller und genauer.'),
    ],
    related: ['unit-tests', 'acceptance-tests', 'component-tests'],
  },
  {
    id: 'component-tests',
    viz: { kind: 'scope', mode: 'component-tests' },
    name: l('Component tests', 'Komponententests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Test one component (a service, a UI component, a module) with its real internals but faked neighbours.', 'Eine Komponente (Dienst, UI-Komponente, Modul) mit echtem Innenleben, aber gefälschten Nachbarn testen.'),
    catches: l('wiring mistakes inside a component: wrong configuration, missing dependency injection, broken rendering', 'Verdrahtungsfehler innerhalb einer Komponente: falsche Konfiguration, fehlende Abhängigkeit, kaputtes Rendering'),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('Bigger than a unit, much cheaper than an end-to-end test.', 'Größer als eine Unit, viel billiger als ein End-to-End-Test.'), l('UI component tests can query by role and label, which also checks accessibility basics.', 'UI-Komponententests können nach Rolle und Label suchen und prüfen so auch Grundlagen der Barrierefreiheit.'),
      l('Fast enough to run on every change, yet close enough to real wiring to catch configuration and injection errors.', 'Schnell genug für jede Änderung, aber nah genug an der echten Verdrahtung, um Konfigurations- und Injektionsfehler zu finden.'),
    ],
    limits: [
      l('Fakes can drift from the real neighbours. Back them with contract tests.', 'Fakes können sich von den echten Nachbarn entfernen. Mit Contract-Tests absichern.'),
      l('Choosing the boundary is a judgement call; too many fakes and the test checks nothing real.', 'Die Wahl der Grenze ist eine Ermessensfrage; mit zu vielen Fakes prüft der Test nichts Reales.'),
    ],
    ai: l('Agents frequently break wiring (a forgotten provider, a renamed prop). Component tests catch that faster than end-to-end tests.', 'Agenten zerbrechen oft die Verdrahtung (vergessener Provider, umbenannte Prop). Komponententests fangen das schneller als End-to-End-Tests.'),
    evidence: { general: none(), ai: none() },
    tools: { php: ['phpunit', 'codeception'], js: ['testing-library', 'storybook', 'vitest'], python: ['pytest'], java: ['junit', 'testcontainers'], dotnet: ['xunit', 'testcontainers'], go: ['go-test', 'testcontainers'] },
    snippets: [{ lang: "js", file: "reserve-button.test.ts",
      description: l("Run with Vitest and jsdom installed. This isolated DOM component must emit the selected pet ID. Change the emitted ID to another pet to see the failure; this does not test a server reservation.",
        "Mit installiertem Vitest und jsdom ausführen. Diese isolierte DOM-Komponente muss die gewählte Tier-ID senden. Für den Fehler eine andere Tier-ID senden; dies prüft keine Serverreservierung."),
      code: `// @vitest-environment jsdom
import { expect, test, vi } from 'vitest';
function reserveButton(petId: string, reserve: (id: string) => void) {
  const button = document.createElement('button');
  button.textContent = 'Reserve';
  button.addEventListener('click', () => reserve(petId));
  return button;
}
test('sends the chosen pet, not a hard-coded one', () => {
  const reserve = vi.fn();
  const button = reserveButton('rex', reserve);
  button.click();
  expect(reserve).toHaveBeenCalledExactlyOnceWith('rex');
});`,
      focus: [
        { line: 1, note: l("`jsdom` gives the component a real DOM without a browser, which keeps the test fast.", "`jsdom` gibt der Komponente ein echtes DOM ohne Browser, das hält den Test schnell.") },
        { line: 6, note: l("The click handler closes over `petId`; the classic bug is a hard-coded or stale id here.", "Der Click-Handler fängt `petId` ein; der klassische Fehler ist hier eine fest verdrahtete oder veraltete id.") },
        { line: 13, note: l("Asserting “exactly once with `rex`” catches both the wrong pet and a double submit.", "„Genau einmal mit `rex`“ fängt sowohl das falsche Tier als auch ein doppeltes Absenden.") },
      ] }],
    steps: [
      l('Choose a component and fake only what crosses its boundary (HTTP, database, clock).', 'Eine Komponente wählen und nur fälschen, was ihre Grenze überquert (HTTP, Datenbank, Uhr).'), l('Test its behaviour through its own interface, e.g. render the UI component and interact by role.', 'Ihr Verhalten über ihre eigene Schnittstelle testen, z. B. die UI-Komponente rendern und über Rollen interagieren.'),
      l('Run it in CI and add one test where a fake returns an error, to check the component\'s failure handling.', 'In der CI ausführen und einen Test ergänzen, in dem ein Fake einen Fehler liefert, um die Fehlerbehandlung der Komponente zu prüfen.'),
    ],
    done: l('The component\'s main behaviours are tested with fakes only at its boundary.', 'Die wichtigsten Verhaltensweisen der Komponente sind getestet, mit Fakes nur an ihrer Grenze.'),
    think: [
      q('Why query a button by its accessible name rather than by a CSS class?', 'Warum einen Button über seinen zugänglichen Namen statt über eine CSS-Klasse suchen?', 'Users and screen readers find it by name, not by class. The test then fails when the button becomes unusable, not when someone renames a class.', 'Nutzer und Screenreader finden ihn über den Namen, nicht über die Klasse. Der Test scheitert dann, wenn der Button unbenutzbar wird, nicht wenn jemand eine Klasse umbenennt.'),
      q('Predict: the reservation component is tested with a fake pet service that always answers instantly. What happens in production when the pet service times out?', 'Vorhersage: Die Reservierungskomponente wird mit einem Fake-Tierdienst getestet, der immer sofort antwortet. Was passiert in Produktion, wenn der Tierdienst in ein Timeout läuft?',
        'The test never covered it, so behaviour is unknown: a hung request, a retry storm or a wrong error. Make the fake slow or failing in a second test.',
        'Der Test deckt es nie ab, das Verhalten ist unbekannt: ein hängender Request, ein Retry-Sturm oder ein falscher Fehler. In einem zweiten Test den Fake langsam oder fehlerhaft machen.'),
      q('Which bug does a component test with fakes miss that an integration test finds?', 'Welchen Fehler übersieht ein Component Test mit Fakes, den ein Integration Test findet?',
        'A mismatch with the real neighbour: a column that does not exist, a JSON field named differently, a transaction that does not isolate. The fake agrees with your assumption, not with reality.',
        'Eine Abweichung vom echten Nachbarn: eine Spalte, die es nicht gibt, ein anders benanntes JSON-Feld, eine Transaktion, die nicht isoliert. Der Fake stimmt mit deiner Annahme überein, nicht mit der Realität.'),
    ],
    related: ['unit-tests', 'integration-tests', 'contract-tests', 'ui-ux-tests'],
  },
  {
    id: 'integration-tests',
    viz: { kind: 'scope', mode: 'integration-tests' },
    name: l('Integration tests', 'Integrationstests'),
    layer: 'static',
    phases: ['deploy'],
    fromOverview: true,
    oneLiner: l('Check that components work together with their real dependencies: database, queue, other services.', 'Prüfen, dass Komponenten mit ihren echten Abhängigkeiten zusammenarbeiten: Datenbank, Queue, andere Dienste.'),
    catches: l('mismatched assumptions between parts: SQL that the real database rejects, wrong serialization, transactions that do not isolate', 'unpassende Annahmen zwischen Teilen: SQL, das die echte Datenbank ablehnt, falsche Serialisierung, Transaktionen, die nicht isolieren'),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('Finds bugs that no amount of mocking can, because mocks share your assumptions.', 'Findet Fehler, die kein Mocking findet, weil Mocks die eigenen Annahmen teilen.'), l('Testcontainers make real dependencies cheap to start in CI.', 'Testcontainers machen echte Abhängigkeiten in der CI billig startbar.'),
      l('Tests transactions, constraints and migrations as they really behave, such as a unique index that rejects a second reservation.', 'Testet Transaktionen, Constraints und Migrationen so, wie sie sich wirklich verhalten, etwa einen Unique Index, der eine zweite Reservierung ablehnt.'),
    ],
    limits: [
      l('Slower and flakier than unit tests; keep them few and focused on boundaries.', 'Langsamer und wackeliger als Unit-Tests; wenige, auf Grenzen fokussierte.'),
      l('Test data setup and cleanup are easy to get wrong; shared state between tests makes failures hard to reproduce.', 'Testdaten-Setup und Aufräumen sind leicht falsch gemacht; geteilter Zustand zwischen Tests macht Fehler schwer reproduzierbar.'),
    ],
    ai: l('Agents write mocks that agree with their own code. An integration test against the real database is an oracle the agent cannot bend.', 'Agenten schreiben Mocks, die ihrem eigenen Code zustimmen. Ein Integrationstest gegen die echte Datenbank ist ein Orakel, das der Agent nicht verbiegen kann.'),
    evidence: { general: none(), ai: none() },
    tools: { php: ['phpunit', 'codeception'], js: ['testcontainers', 'vitest'], python: ['testcontainers', 'pytest'], java: ['testcontainers', 'junit'], dotnet: ['testcontainers', 'xunit'], go: ['testcontainers', 'go-test'], rust: ['testcontainers', 'cargo-test'] },
    snippets: [{ lang: "js", file: "reservation-db.test.ts",
      description: l("Install vitest, pg, @types/pg and @testcontainers/postgresql; Docker must be running. This test uses a real disposable PostgreSQL database. Remove the IS NULL condition: both updates succeed and the test fails.",
        "vitest, pg, @types/pg und @testcontainers/postgresql installieren; Docker muss laufen. Dieser Test nutzt eine echte entbehrliche PostgreSQL-Datenbank. Die IS-NULL-Bedingung entfernen: Beide Updates gelingen, und der Test scheitert."),
      code: `import { expect, test } from 'vitest';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import pg from 'pg';
test('competing reservations leave exactly one owner', async () => {
  const db = await new PostgreSqlContainer('postgres:17-alpine').start();
  const pool = new pg.Pool({ connectionString: db.getConnectionUri() });
  try {
    await pool.query('CREATE TABLE pets (id text PRIMARY KEY, owner text)');
    await pool.query("INSERT INTO pets VALUES ('rex', NULL)");
    const reserve = (owner: string) => pool.query(
      'UPDATE pets SET owner=$1 WHERE id=$2 AND owner IS NULL RETURNING owner',
      [owner, 'rex']);
    const results = await Promise.all([reserve('anna'), reserve('ben')]);
    expect(results.map(r => r.rowCount).sort()).toEqual([0, 1]);
    const winner = results.find(r => r.rowCount === 1)!.rows[0].owner;
    const stored = await pool.query("SELECT owner FROM pets WHERE id='rex'");
    expect(stored.rows[0].owner).toBe(winner);
  } finally {
    await pool.end();
    await db.stop();
  }
}, 60_000);`,
      focus: [
        { line: 5, note: l("A real Postgres in a container, so the database’s actual locking and constraints are tested, not a mock.", "Ein echtes Postgres im Container, damit Locking und Constraints der Datenbank getestet werden, nicht ein Mock.") },
        { line: 11, note: l("`AND owner IS NULL` makes the update atomic: the check and the write happen in one statement.", "`AND owner IS NULL` macht das Update atomar: Prüfung und Schreiben passieren in einem Statement.") },
        { line: 13, note: l("Both reservations run concurrently; sequential calls would never expose a race condition.", "Beide Reservierungen laufen gleichzeitig; sequenzielle Aufrufe würden eine Race Condition nie zeigen.") },
        { line: 14, note: l("Exactly one row updated and one not: the “never twice” rule as an assertion.", "Genau eine Zeile geändert, eine nicht: die Regel „nie zweimal“ als Assertion.") },
      ] }],
    steps: [
      l('Start the real dependency (e.g. Postgres) in a container per test run.', 'Die echte Abhängigkeit (z. B. Postgres) pro Testlauf in einem Container starten.'), l('Test the boundary code (repository, client) against it, including a concurrent case: two reservations of the same pet at once.', 'Den Grenzcode (Repository, Client) dagegen testen, inklusive eines nebenläufigen Falls: zwei gleichzeitige Reservierungen desselben Tiers.'),
      l('Reset the database state per test (transaction rollback or fresh schema), so tests do not depend on each other.', 'Den Datenbankzustand pro Test zurücksetzen (Transaktions-Rollback oder frisches Schema), damit Tests nicht voneinander abhängen.'),
    ],
    done: l('Integration tests run in CI against real containers, including one concurrency test.', 'Integrationstests laufen in der CI gegen echte Container, inklusive eines Nebenläufigkeitstests.'),
    think: [
      q('Your mock repository makes the double-booking test pass. Why might production still double-book?', 'Dein Mock-Repository lässt den Doppelbuchungstest bestehen. Warum könnte die Produktion trotzdem doppelt buchen?', 'The mock runs one call at a time. The real database runs two transactions in parallel; without a unique constraint or row lock both can read "available" and both write.', 'Der Mock verarbeitet einen Aufruf nach dem anderen. Die echte Datenbank führt zwei Transaktionen parallel aus; ohne Unique-Constraint oder Zeilensperre lesen beide „frei“ und schreiben beide.'),
      q('Predict: you add a unique constraint on `(pet_id, status = \'reserved\')`. What does the second concurrent reservation get?', 'Vorhersage: Du ergänzt einen Unique Constraint auf `(pet_id, status = \'reserved\')`. Was bekommt die zweite gleichzeitige Reservierung?',
        'A constraint violation from the database. The code must turn it into a clean "already reserved" answer; an integration test with two parallel requests checks both.',
        'Eine Constraint-Verletzung der Datenbank. Der Code muss daraus eine saubere Antwort „bereits reserviert“ machen; ein Integration Test mit zwei parallelen Requests prüft beides.'),
      q('When would you not use a real database in tests?', 'Wann würdest du in Tests keine echte Datenbank verwenden?',
        'For pure logic such as pricing rules, where a database only slows the test down. Keep real dependencies for the boundary code and the invariants that depend on them.',
        'Für reine Logik wie Preisregeln, wo eine Datenbank den Test nur verlangsamt. Echte Abhängigkeiten für den Grenzcode und die Invarianten, die von ihnen abhängen.'),
    ],
    related: ['component-tests', 'contract-tests', 'e2e-tests', 'formal-verification'],
  },
  {
    id: 'e2e-tests',
    viz: { kind: 'scope', mode: 'e2e-tests' },
    name: l('End-to-end tests', 'End-to-End-Tests'),
    layer: 'static',
    phases: ['pre', 'deploy'],
    fromOverview: false,
    oneLiner: l('Drive the whole system through its real UI or API, like a user, and check the outcome.', 'Das ganze System über seine echte Oberfläche oder API steuern, wie ein Nutzer, und das Ergebnis prüfen.'),
    catches: l('pieces that each work but do not connect: a button wired to the wrong endpoint, a missing migration, broken routing', 'Teile, die einzeln funktionieren, aber nicht zusammenpassen: Button am falschen Endpunkt, fehlende Migration, kaputtes Routing'),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('The only test that sees what the user sees.', 'Der einzige Test, der sieht, was der Nutzer sieht.'), l('A handful of critical journeys (search, reserve, pay) gives a lot of confidence.', 'Eine Handvoll kritischer Abläufe (suchen, reservieren, bezahlen) gibt viel Sicherheit.'),
      l('Run against a deployed build, so they also catch configuration and migration mistakes.', 'Laufen gegen einen deployten Build und finden so auch Konfigurations- und Migrationsfehler.'),
    ],
    limits: [
      l('Slow, brittle and imprecise; keep the number small and push detail down to cheaper tests.', 'Langsam, brüchig und unpräzise; wenige halten und Details in billigere Tests verlagern.'),
      l('A failure tells you that a journey broke, not where; traces and screenshots are needed to debug it.', 'Ein Fehlschlag sagt, dass eine Strecke kaputt ist, nicht wo; zum Debuggen braucht man Traces und Screenshots.'),
    ],
    ai: l('Agents can make every unit test pass while the assembled app is broken. One end-to-end run of the main journey catches that, and Playwright traces give the agent a readable failure.', 'Agenten können jeden Unit-Test grün machen, während die zusammengesetzte App kaputt ist. Ein End-to-End-Lauf des Hauptablaufs fängt das, und Playwright-Traces geben dem Agenten einen lesbaren Fehler.'),
    evidence: { general: none(), ai: ev('weak', f('metr2026', 'Indirect evidence: METR had maintainers review 296 agent PRs; roughly half of test-passing SWE-bench Verified PRs would not be merged after adjusting for noise in maintainer decisions. This shows limits of benchmark tests, not the effect of adding E2E tests.', 'Indirekte Evidenz: Bei METR reviewten Maintainer 296 Agenten-PRs; nach Bereinigung um Schwankungen der Maintainer-Entscheidungen würde etwa die Hälfte der testbestehenden SWE-bench-Verified-PRs nicht gemergt. Das zeigt Grenzen der Benchmark-Tests, nicht die Wirkung zusätzlicher E2E-Tests.')) },
    tools: { php: ['codeception'], js: ['playwright', 'cypress'], python: ['playwright'], java: ['playwright'], dotnet: ['playwright'] },
    snippets: [{ lang: 'js', file: 'reserve.spec.ts', code: `import { test, expect } from '@playwright/test';

test('a visitor can reserve a pet, and it disappears from the list', async ({ page }) => {
  await page.goto('/pets');
  await page.getByRole('button', { name: 'Reserve Rex' }).click();
  await page.getByLabel('Your name').fill('Anna');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('Rex is reserved for you')).toBeVisible();
  await page.goto('/pets');
  await expect(page.getByRole('button', { name: 'Reserve Rex' })).toHaveCount(0);
});`,
      focus: [
        { line: 5, note: l("Selecting by role and accessible name tests what a user sees and survives markup changes.", "Die Auswahl per Rolle und Name testet, was Nutzer sehen, und übersteht Markup-Änderungen.") },
        { line: 8, note: l("Waits for visible feedback with auto-retry, avoiding sleeps that make tests flaky.", "Wartet mit Auto-Retry auf sichtbares Feedback und vermeidet Sleeps, die Tests flaky machen.") },
        { line: [9, 10], note: l("Reloading and checking the list proves the reservation was persisted, not just shown.", "Neu laden und die Liste prüfen beweist, dass die Reservierung gespeichert und nicht nur angezeigt wurde.") },
      ] }],
    steps: [l('Pick the 3–5 user journeys that must never break.', 'Die 3–5 Nutzerabläufe wählen, die nie brechen dürfen.'), l('Write one end-to-end test per journey using role/label selectors, against a freshly seeded environment.', 'Pro Ablauf einen End-to-End-Test mit Rollen-/Label-Selektoren schreiben, gegen eine frisch befüllte Umgebung.'), l('Record traces on failure and run the suite in CI.', 'Bei Fehlschlag Traces aufzeichnen und die Suite in der CI ausführen.')],
    done: l('The critical journeys pass end-to-end in CI, and a deliberately broken route makes one fail with a trace.', 'Die kritischen Abläufe laufen End-to-End in der CI, und eine absichtlich kaputte Route lässt einen mit Trace scheitern.'),
    think: [
      q('Why not test every edge case end-to-end?', 'Warum nicht jeden Randfall End-to-End testen?', 'Each E2E test costs seconds to minutes and fails for many unrelated reasons. Edge cases belong in unit and property tests; E2E proves the wiring.', 'Jeder E2E-Test kostet Sekunden bis Minuten und scheitert aus vielen fremden Gründen. Randfälle gehören in Unit- und Property-Tests; E2E beweist die Verdrahtung.'),
      q('Predict: an E2E test waits with `sleep(2000)` after clicking "Reserve". What happens on a slower CI machine?', 'Vorhersage: Ein E2E-Test wartet nach dem Klick auf „Reservieren“ mit `sleep(2000)`. Was passiert auf einer langsameren CI-Maschine?',
        'It fails intermittently, and people learn to re-run it. Wait for an observable condition instead (the confirmation text appears), with auto-waiting selectors.',
        'Er schlägt sporadisch fehl, und alle gewöhnen sich ans erneute Ausführen. Stattdessen auf eine beobachtbare Bedingung warten (der Bestätigungstext erscheint), mit automatisch wartenden Selektoren.'),
      q('Which bug does an E2E test of the reserve journey not find?', 'Welchen Fehler findet ein E2E-Test der Reservierungsstrecke nicht?',
        'Two users reserving the same pet at the same moment: the test drives one browser at a time. That needs a concurrent integration test or a model.',
        'Zwei Nutzer, die dasselbe Tier im selben Moment reservieren: Der Test steuert nur einen Browser. Dafür braucht es einen nebenläufigen Integration Test oder ein Modell.'),
    ],
    related: ['integration-tests', 'smoke-tests', 'acceptance-tests', 'ui-ux-tests'],
  },
  {
    id: 'acceptance-tests',
    viz: { kind: 'scope', mode: 'acceptance-tests' },
    name: l('Acceptance tests', 'Akzeptanztests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Tests the customer or product owner agreed on: if they pass, the feature is done.', 'Tests, auf die sich Kunde oder Product Owner geeinigt haben: Bestehen sie, ist die Funktion fertig.'),
    catches: l('misunderstood requirements, and "done" that is not done', 'missverstandene Anforderungen und „fertig“, das nicht fertig ist'),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('Written in domain language (Gherkin or plain tests), readable by non-developers.', 'In Fachsprache geschrieben (Gherkin oder einfache Tests), auch für Nicht-Entwickler lesbar.'), l('A natural contract between the person asking and the one (or the agent) building.', 'Ein natürlicher Vertrag zwischen Auftraggeber und dem, der baut, ob Mensch oder Agent.'),
      l('Agreeing on them first forces the unclear parts of a requirement into the open.', 'Sie vorab zu vereinbaren zwingt die unklaren Stellen einer Anforderung ans Licht.'),
    ],
    limits: [
      l('Gherkin layers can become a maintenance burden; plain tests with good names often suffice.', 'Gherkin-Schichten können zur Wartungslast werden; einfache Tests mit guten Namen genügen oft.'),
      l('Only as good as the criteria: vague criteria produce tests that pass for the wrong behaviour.', 'Nur so gut wie die Kriterien: Vage Kriterien erzeugen Tests, die für falsches Verhalten bestehen.'),
    ],
    ai: l('Acceptance tests are the natural "spec" to hand an agent. SWE-bench\'s fail-to-pass tests are exactly this. Keep them human-approved and protected.', 'Akzeptanztests sind die natürliche „Spezifikation“ für einen Agenten. Die Fail-to-Pass-Tests von SWE-bench sind genau das. Von Menschen freigegeben und geschützt halten.'),
    evidence: { general: none(), ai: ev('weak', f('patchdiff2026', 'Indirect evidence: PatchDiff found behavioral differences from reference fixes in 29.6% of test-passing agent patches. This exposes gaps in benchmark tests; it does not measure whether adding acceptance tests improves agent code.', 'Indirekte Evidenz: PatchDiff fand bei 29,6 % der testbestehenden Agenten-Patches Verhaltensunterschiede zur Referenzlösung. Das zeigt Lücken in Benchmark-Tests; die Wirkung zusätzlicher Akzeptanztests auf Agenten-Code wurde nicht gemessen.')) },
    tools: { php: ['behat', 'codeception'], js: ['cucumber', 'playwright'], python: ['behave', 'pytest'], java: ['cucumber'], dotnet: ['reqnroll'], go: ['cucumber'] },
    snippets: [{ lang: 'any', file: 'reserve.feature', code: `Feature: Reserving a pet for adoption
  Scenario: A pet cannot be reserved twice
    Given Rex is available
    And Anna has reserved Rex
    When Ben tries to reserve Rex
    Then Ben is told that Rex is already reserved
    And Rex is still reserved for Anna`,
      focus: [
        { line: 2, note: l("The title is a rule in business language; it is the sentence everyone agrees on.", "Der Titel ist eine Regel in Fachsprache; das ist der Satz, auf den sich alle einigen.") },
        { line: [3, 4], note: l("Given sets up the state with no technical detail, so the scenario stays readable.", "Given beschreibt den Zustand ohne technische Details, so bleibt das Szenario lesbar.") },
        { line: 6, note: l("The expected message is what the user is told, so the user-visible outcome is specified.", "Die erwartete Meldung ist das, was die Nutzerin erfährt, das sichtbare Ergebnis ist also festgelegt.") },
        { line: 7, note: l("The final `And` checks nothing was lost: the first reservation must survive.", "Das abschließende `And` prüft, dass nichts verloren ging: Die erste Reservierung muss bestehen bleiben.") },
      ] }],
    steps: [
      l('Write acceptance criteria for the next feature with the person who asked for it.', 'Akzeptanzkriterien für die nächste Funktion mit der Person schreiben, die sie wollte.'), l('Turn each criterion into an executable test before implementation and protect the files.', 'Jedes Kriterium vor der Implementierung in einen ausführbaren Test verwandeln und die Dateien schützen.'),
      l('Add the unhappy cases to the criteria (reserved pet, unknown id, expired voucher) and have the requester confirm them.', 'Die unglücklichen Fälle in die Kriterien aufnehmen (reserviertes Tier, unbekannte ID, abgelaufener Gutschein) und vom Auftraggeber bestätigen lassen.'),
    ],
    done: l('Each acceptance criterion has an executable test, approved by the requester, and all pass.', 'Jedes Akzeptanzkriterium hat einen ausführbaren, vom Auftraggeber freigegebenen Test, und alle sind grün.'),
    think: [
      q('All acceptance tests pass. Why might the feature still be wrong?', 'Alle Akzeptanztests sind grün. Warum könnte die Funktion trotzdem falsch sein?', 'The tests cover the scenarios people thought of. Everything else (other inputs, concurrency, performance) is unchecked, which is why the funnel has more layers.', 'Die Tests decken die Szenarien ab, an die gedacht wurde. Alles andere (andere Eingaben, Nebenläufigkeit, Performance) ist ungeprüft; deshalb hat der Trichter mehr Schichten.'),
      q('Predict: the criterion says "a customer can adopt a pet and pays the adoption fee". The agent charges the fee but never marks the pet adopted. Does the test pass?', 'Vorhersage: Das Kriterium lautet „ein Kunde kann ein Tier adoptieren und zahlt die Adoptionsgebühr“. Der Agent bucht die Gebühr, markiert das Tier aber nie als adoptiert. Besteht der Test?',
        'Only if the test also asserts the pet\'s new state. An acceptance test must check every outcome in the criterion, not just the visible one.',
        'Nur wenn der Test auch den neuen Zustand des Tieres prüft. Ein Acceptance Test muss jedes Ergebnis des Kriteriums prüfen, nicht nur das sichtbare.'),
      q('When are acceptance tests not enough on their own?', 'Wann reichen Acceptance Tests allein nicht aus?',
        'When the risk is not in the stated behaviour: security, performance, concurrency and rare inputs. They confirm what was agreed, not what nobody thought of.',
        'Wenn das Risiko nicht im vereinbarten Verhalten liegt: Sicherheit, Performance, Nebenläufigkeit und seltene Eingaben. Sie bestätigen, was vereinbart wurde, nicht was niemandem eingefallen ist.'),
    ],
    related: ['tdd', 'functional-tests', 'e2e-tests'],
  },
  {
    id: 'regression-tests',
    sim: 'regression',
    name: l('Regression tests', 'Regressionstests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Every bug that was fixed gets a test, so it can never come back unnoticed.', 'Jeder behobene Fehler bekommt einen Test, damit er nie unbemerkt zurückkommt.'),
    catches: l('old bugs reintroduced by new changes', 'alte Fehler, die durch neue Änderungen zurückkehren'),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('Bugs cluster; a regression test guards a place that has already proven fragile.', 'Fehler häufen sich; ein Regressionstest bewacht eine Stelle, die sich schon als zerbrechlich erwiesen hat.'), l('The failing test written before the fix also proves the fix works.', 'Der vor der Behebung geschriebene fehlschlagende Test beweist auch, dass die Behebung wirkt.'),
      l('Cheap to write while the failure is fresh: you already have the reproduction.', 'Günstig zu schreiben, solange der Fehler frisch ist: Die Reproduktion liegt schon vor.'),
    ],
    limits: [
      l('Large regression suites need test selection to stay fast.', 'Große Regressionssuiten brauchen Testauswahl, um schnell zu bleiben.'),
      l('Only protects against bugs you already know; it says nothing about new ones.', 'Schützt nur vor bekannten Fehlern; über neue sagt es nichts.'),
    ],
    ai: l('Ask the agent to write the failing test first and show it failing, then fix. That proves it understood the bug, not just changed something until the symptom went away.', 'Den Agenten zuerst den fehlschlagenden Test schreiben und scheitern lassen, dann beheben. Das beweist, dass er den Fehler verstanden und nicht nur geändert hat, bis das Symptom verschwand.'),
    evidence: { general: ev('weak', f('memon2017', 'In Google\'s CI only a tiny share of tests ever fail, and failures cluster near recently changed code, which motivates test selection.', 'In Googles CI schlägt nur ein winziger Teil der Tests je fehl, und Fehlschläge häufen sich nahe kürzlich geändertem Code; das motiviert Testauswahl.')), ai: none() },
    tools: RUNNERS,
    snippets: [{ lang: "js", file: "reservation-regression.test.ts",
      description: l("Adapt the import to your real reservation module and run with Vitest. Keep the incident input and expected behaviour from the bug report. It should fail on the pre-fix commit; a passing test on only the new code is weaker evidence.",
        "Den Import an das echte Reservierungsmodul anpassen und mit Vitest ausführen. Eingabe des Incidents und erwartetes Verhalten aus dem Fehlerbericht beibehalten. Der Test soll am Commit vor der Korrektur scheitern; nur mit neuem Code zu bestehen ist ein schwächerer Beleg."),
      code: `import { expect, test } from 'vitest';
import { reserve } from './reserve';
test('regression: a rejected reservation preserves the first owner', () => {
  const pets = { rex: { reservedBy: 'anna' } };
  expect(reserve(pets, 'rex', 'ben')).toBe('taken');
  expect(pets.rex.reservedBy).toBe('anna');
  // Incident: an earlier implementation returned "taken"
  // after already overwriting reservedBy with "ben".
});`,
      focus: [
        { line: 4, note: l("The test uses a fixed starting state, so the bug is reproduced the same way each run.", "Der Test nutzt einen festen Startzustand, der Fehler wird also in jedem Lauf gleich reproduziert.") },
        { line: 6, note: l("The bug was a side effect: checking only the return value would have missed it.", "Der Fehler war ein Seiteneffekt: Nur den Rückgabewert zu prüfen, hätte ihn verpasst.") },
        { line: [7, 8], note: l("The comment links the test to the incident, so nobody deletes it as “redundant”.", "Der Kommentar verknüpft den Test mit dem Vorfall, damit ihn niemand als „überflüssig“ löscht.") },
      ] }],
    steps: [l('Reproduce the bug as a failing test and commit it.', 'Den Fehler als fehlschlagenden Test reproduzieren und committen.'), l('Fix the code until the test passes, without changing the test.', 'Den Code reparieren, bis der Test grün ist, ohne den Test zu ändern.'), l('Reference the issue in the test name.', 'Das Issue im Testnamen referenzieren.')],
    done: l('The test fails on the commit before the fix and passes after it.', 'Der Test scheitert auf dem Commit vor der Behebung und ist danach grün.'),
    think: [
      q('How do you know a regression test really tests the bug?', 'Woher weiß man, dass ein Regressionstest wirklich den Fehler testet?', 'Run it against the old code. If it passes there too, it tests something else.', 'Ihn gegen den alten Code laufen lassen. Ist er dort auch grün, testet er etwas anderes.'),
      q('Predict: a regression test for a bug uses the exact customer data from the report. What happens if the bug returns with slightly different data?', 'Vorhersage: Ein Regression-Test für einen Fehler nutzt genau die Kundendaten aus dem Bericht. Was passiert, wenn der Fehler mit leicht anderen Daten zurückkehrt?',
        'The test may pass while the bug is back. Reduce the reproduction to the cause (for instance the boundary value), or add a property for the whole class.',
        'Der Test besteht womöglich, obwohl der Fehler zurück ist. Die Reproduktion auf die Ursache reduzieren (etwa den Grenzwert) oder eine Property für die ganze Klasse ergänzen.'),
      q('An agent fixes a bug and adds a regression test in the same commit. What should you check?', 'Ein Agent behebt einen Fehler und ergänzt im selben Commit einen Regression-Test. Was solltest du prüfen?',
        'That the test fails on the parent commit. Otherwise the agent may have written a test that matches its fix instead of the bug.',
        'Dass der Test auf dem Eltern-Commit fehlschlägt. Sonst hat der Agent womöglich einen Test passend zu seiner Lösung statt zum Fehler geschrieben.'),
    ],
    related: ['unit-tests', 'snapshot-tests', 'ci'],
  },
  {
    id: 'smoke-tests',
    viz: { kind: 'scope', mode: 'smoke-tests' },
    name: l('Smoke tests', 'Smoke-Tests'),
    layer: 'static',
    phases: ['pre', 'deploy'],
    fromOverview: true,
    oneLiner: l('A few quick checks that the system starts and its most basic functions respond, right after a build or deploy.', 'Wenige schnelle Prüfungen direkt nach Build oder Deploy, dass das System startet und die grundlegendsten Funktionen antworten.'),
    catches: l('dead-on-arrival builds: missing config, crash at startup, broken health endpoint', 'tot ausgelieferte Builds: fehlende Konfiguration, Absturz beim Start, kaputter Health-Endpunkt'),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('Seconds to run; stops the obviously broken release before anyone else is affected.', 'Sekunden Laufzeit; stoppt das offensichtlich kaputte Release, bevor jemand betroffen ist.'), l('Ideal gate before canarying.', 'Ideales Gate vor dem Canary.'),
      l('The same checks can run against production after a release as a cheap sanity probe.', 'Dieselben Prüfungen können nach einem Release gegen Produktion laufen, als günstiger Plausibilitätstest.'),
    ],
    limits: [
      l('Proves only that it is alive, not that it is right.', 'Beweist nur, dass es lebt, nicht dass es stimmt.'),
      l('If they grow into a full regression suite they stop being fast, and people start skipping them.', 'Wachsen sie zu einer vollen Regressionssuite, sind sie nicht mehr schnell, und man beginnt, sie zu überspringen.'),
    ],
    ai: l('Cheap insurance against an agent change that breaks startup (a renamed env variable, a missing import).', 'Billige Versicherung gegen eine Agentenänderung, die den Start zerbricht (umbenannte Umgebungsvariable, fehlender Import).'),
    evidence: { general: none(), ai: none() },
    tools: { php: ['codeception'], js: ['playwright', 'vitest'], any: ['k6', 'hyperfine'] },
    snippets: [{ lang: 'any', file: 'smoke.sh', code: `#!/usr/bin/env sh
set -e
curl -fsS "$BASE_URL/health"                 # service is up
curl -fsS "$BASE_URL/api/pets?limit=1" | grep -q '"id"'   # can read data`,
      focus: [
        { line: 2, note: l("`set -e` makes the first failing check abort the script, so the deploy gets a red result.", "`set -e` bricht beim ersten Fehler ab, damit der Deploy ein rotes Ergebnis bekommt.") },
        { line: 3, note: l("A health check only proves the process is up, not that it works.", "Ein Health-Check beweist nur, dass der Prozess läuft, nicht dass er funktioniert.") },
        { line: 4, note: l("A real read through the API with a content check catches a service that is up but empty.", "Ein echter Lesezugriff über die API mit Inhaltsprüfung fängt einen Dienst, der läuft, aber leer ist.") },
      ] }],
    steps: [
      l('Write 3–5 checks: health endpoint, one read, one page load.', '3–5 Prüfungen schreiben: Health-Endpunkt, ein Lesezugriff, ein Seitenaufruf.'), l('Run them after every deploy and block further rollout on failure.', 'Nach jedem Deploy ausführen und den weiteren Rollout bei Fehlschlag stoppen.'),
      l('Make the check fail on a wrong version or missing config, not just on connection refused, and fix every false alarm at once.', 'Die Prüfung auch bei falscher Version oder fehlender Konfiguration scheitern lassen, nicht nur bei „connection refused“, und jeden Fehlalarm sofort beheben.'),
    ],
    done: l('Smoke checks run automatically after deploy, take under a minute, and block rollout on failure.', 'Smoke-Prüfungen laufen automatisch nach dem Deploy, dauern unter einer Minute und stoppen bei Fehlschlag den Rollout.'),
    think: [
      q('Where does the name come from?', 'Woher kommt der Name?', 'From hardware: switch it on and see whether smoke comes out. If it does, no further testing is needed.', 'Aus der Hardware: Einschalten und schauen, ob Rauch aufsteigt. Wenn ja, erübrigt sich jeder weitere Test.'),
      q('Predict: the smoke test calls `GET /health` which always returns 200. A new deploy has a wrong database password. What happens?', 'Vorhersage: Der Smoke Test ruft `GET /health` auf, das immer 200 liefert. Ein neues Deployment hat ein falsches Datenbankpasswort. Was passiert?',
        'The smoke test passes while every reservation fails. A health check must exercise a real dependency, and one smoke check should read a pet from the database.',
        'Der Smoke Test besteht, während jede Reservierung fehlschlägt. Ein Health Check muss eine echte Abhängigkeit nutzen, und ein Smoke-Check sollte ein Tier aus der Datenbank lesen.'),
      q('Smoke tests pass after deploy. What bug is still very likely?', 'Die Smoke Tests bestehen nach dem Deployment. Welcher Fehler ist trotzdem sehr gut möglich?',
        'A logic bug in a rarely used path, such as a wrong senior discount. Smoke tests check that the system is alive; the layers above check that it is right.',
        'Ein Logikfehler in einem selten genutzten Pfad, etwa ein falscher Senioren-Rabatt. Smoke Tests prüfen, dass das System lebt; die Schichten darüber prüfen, ob es richtig ist.'),
    ],
    related: ['e2e-tests', 'canarying', 'ci'],
  },
  {
    id: 'snapshot-tests',
    sim: 'snapshot',
    name: l('Snapshot & characterization tests', 'Snapshot- & Charakterisierungstests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('Record the current output once, then fail whenever it changes, so changes have to be approved.', 'Die aktuelle Ausgabe einmal aufzeichnen und bei jeder Änderung scheitern, damit Änderungen freigegeben werden müssen.'),
    catches: l('unintended changes in output: a rendered page, a JSON response, an invoice text, behaviour of legacy code during a rewrite', 'ungewollte Änderungen der Ausgabe: gerenderte Seite, JSON-Antwort, Rechnungstext, Verhalten von Altcode bei einer Neufassung'),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('Pins legacy behaviour before refactoring, even when nobody knows what the correct behaviour is.', 'Hält das Verhalten von Altcode vor einem Refactoring fest, auch wenn niemand weiß, was korrekt ist.'), l('Very cheap to write for large outputs.', 'Sehr billig für große Ausgaben.'),
      l('Review of the snapshot diff in a pull request shows exactly what changed in the output.', 'Das Review des Snapshot-Diffs im Pull Request zeigt genau, was sich in der Ausgabe geändert hat.'),
    ],
    limits: [l('Blindly re-approving snapshots turns them into noise.', 'Snapshots blind neu freizugeben macht sie zu Rauschen.'), l('Tells you that something changed, not whether the change is right.', 'Sagt, dass sich etwas geändert hat, nicht ob die Änderung richtig ist.')],
    ai: l('Excellent guard for agent refactorings ("behaviour must not change"). Forbid the agent from updating snapshots in the same change; a snapshot update should be a separate, reviewed step.', 'Ausgezeichneter Schutz bei Agenten-Refactorings („Verhalten darf sich nicht ändern“). Dem Agenten verbieten, Snapshots in derselben Änderung zu aktualisieren; ein Snapshot-Update sollte ein eigener, reviewter Schritt sein.'),
    evidence: { general: none(), ai: none() },
    variants: [{ name: l('Golden master / approval tests', 'Golden Master / Approval Tests'), text: l('Same idea with a human-approved file next to the test. Characterization tests are snapshots taken deliberately before changing legacy code.', 'Dieselbe Idee mit einer von Menschen freigegebenen Datei neben dem Test. Charakterisierungstests sind Snapshots, die man bewusst vor Änderungen an Altcode aufnimmt.') }],
    tools: { php: ['phpunit-snapshots'], js: ['vitest', 'jest'], python: ['syrupy', 'approvaltests'], java: ['approvaltests'], dotnet: ['verify', 'approvaltests'], rust: ['insta'], cpp: ['approvaltests'] },
    snippets: [{ lang: 'js', file: 'invoice.test.ts', code: `it('renders the adoption invoice exactly as before', () => {
  expect(renderInvoice(sampleAdoption)).toMatchSnapshot();
});
// Update only deliberately:  npx vitest -u   (and review the diff)`,
      focus: [
        { line: 2, note: l("The snapshot pins the whole output, so any unintended change shows up as a diff.", "Der Snapshot hält die gesamte Ausgabe fest, jede unbeabsichtigte Änderung erscheint als Diff.") },
        { line: 4, note: l("Updating is a deliberate act with a diff review; blind `-u` turns the test into a rubber stamp.", "Aktualisieren ist eine bewusste Handlung mit Diff-Review; blindes `-u` macht den Test zum Abnicker.") },
      ] },
      { lang: 'php', file: 'InvoiceTest.php', code: `<?php declare(strict_types=1);
// composer require --dev spatie/phpunit-snapshot-assertions
use PHPUnit\\Framework\\TestCase;
use Spatie\\Snapshots\\MatchesSnapshots;

final class InvoiceTest extends TestCase
{
    use MatchesSnapshots;

    public function testAdoptionInvoice(): void
    {
        $invoice = renderAdoptionInvoice(['pet' => 'Rex', 'feeCents' => 12000]);
        $this->assertMatchesHtmlSnapshot($invoice);
    }
}
// Review newly created snapshots before committing them.
// Update deliberately: vendor/bin/update-snapshots tests/InvoiceTest.php`,
      focus: [
        { line: 8, note: l("The trait provides snapshot assertions, so output is compared against a stored file.", "Das Trait liefert Snapshot-Assertions, die Ausgabe wird mit einer gespeicherten Datei verglichen.") },
        { line: 12, note: l("The input is fixed and small, so a changed snapshot means the code changed, not the data.", "Die Eingabe ist fest und klein, ein geänderter Snapshot heißt also: Der Code hat sich geändert, nicht die Daten.") },
        { line: [16, 17], note: l("A new snapshot passes automatically, so review it before commit, or a wrong output becomes the baseline.", "Ein neuer Snapshot besteht automatisch, also vor dem Commit prüfen, sonst wird eine falsche Ausgabe zur Referenz.") },
      ] },
    ],
    steps: [l('Before refactoring, write snapshot tests over a representative set of inputs for the code you will change.', 'Vor dem Refactoring Snapshot-Tests über eine repräsentative Menge Eingaben für den betroffenen Code schreiben.'), l('Refactor; the snapshots must stay unchanged.', 'Refaktorieren; die Snapshots müssen unverändert bleiben.'), l('If a snapshot must change, do it in a separate commit and explain why.', 'Muss sich ein Snapshot ändern, in einem eigenen Commit mit Begründung.')],
    done: l('Snapshot files are unchanged by the refactoring commit(s).', 'Die Snapshot-Dateien sind durch die Refactoring-Commits unverändert.'),
    think: [
      q('A snapshot test fails after a change. What two very different things can that mean?', 'Ein Snapshot-Test scheitert nach einer Änderung. Welche zwei sehr verschiedenen Dinge kann das bedeuten?', 'Either you broke something, or you improved something on purpose. The test cannot tell; a human has to look at the diff.', 'Entweder man hat etwas kaputt gemacht oder absichtlich verbessert. Der Test kann das nicht unterscheiden; ein Mensch muss den Diff ansehen.'),
      q('Predict: a snapshot of the invoice text contains today\'s date. What happens tomorrow?', 'Vorhersage: Ein Snapshot des Rechnungstexts enthält das heutige Datum. Was passiert morgen?',
        'The test fails without any code change, and people start approving snapshots without reading. Freeze the clock or mask volatile values.',
        'Der Test schlägt ohne Codeänderung fehl, und man beginnt, Snapshots ungelesen zu bestätigen. Die Uhr einfrieren oder flüchtige Werte maskieren.'),
      q('An agent updates 40 snapshots with one command to make CI green. What do you do?', 'Ein Agent aktualisiert mit einem Befehl 40 Snapshots, damit die CI grün wird. Was tust du?',
        'Review the diff of the snapshot files like code. If the change was not intended, it is a regression that was just approved; require an explanation for each changed snapshot.',
        'Den Diff der Snapshot-Dateien wie Code lesen. War die Änderung nicht beabsichtigt, ist eine Regression gerade bestätigt worden; für jeden geänderten Snapshot eine Begründung verlangen.'),
    ],
    related: ['refactoring', 'regression-tests', 'differential-testing', 'ui-ux-tests'],
  },
  {
    id: 'contract-tests',
    sim: 'contract',
    name: l('Contract tests', 'Contract-Tests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Check that a service and its consumers agree on the API, without running both together.', 'Prüfen, dass ein Dienst und seine Konsumenten sich über die API einig sind, ohne beide zusammen laufen zu lassen.'),
    catches: l('breaking API changes: renamed field, changed type, removed endpoint, new required parameter', 'brechende API-Änderungen: umbenanntes Feld, geänderter Typ, entfernter Endpunkt, neuer Pflichtparameter'),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('Catches integration breakage early and cheaply, without a shared test environment.', 'Fängt Integrationsbrüche früh und billig, ohne gemeinsame Testumgebung.'), l('An OpenAPI schema plus schema-based testing is a light first step.', 'Ein OpenAPI-Schema plus schemabasiertes Testen ist ein leichter erster Schritt.'),
      l('Consumer-driven contracts show the provider team which fields consumers really use, so unused ones can be removed safely.', 'Consumer-driven Contracts zeigen dem Provider-Team, welche Felder Konsumenten wirklich nutzen, sodass ungenutzte sicher entfernt werden können.'),
    ],
    limits: [
      l('Checks the shape of messages, not the business meaning.', 'Prüft die Form der Nachrichten, nicht ihre fachliche Bedeutung.'),
      l('The contract must be kept in sync with reality; a stale one gives false confidence.', 'Der Contract muss mit der Realität synchron bleiben; ein veralteter gibt falsche Sicherheit.'),
    ],
    ai: l('Agents rename fields happily ("priceCents" → "price") and update the callers they can see. Contract tests catch the callers they cannot see.', 'Agenten benennen Felder gern um („priceCents“ → „price“) und passen die Aufrufer an, die sie sehen. Contract-Tests fangen die, die sie nicht sehen.'),
    evidence: { general: none(), ai: none() },
    tools: { php: ['pact-php'], js: ['pact', 'zod'], python: ['pact'], java: ['pact'], dotnet: ['pact'], go: ['pact'], rust: ['pact'], any: ['specmatic', 'schemathesis'] },
    snippets: [{ lang: "js", file: "reservation-contract.test.ts",
      description: l("Install vitest and zod, then run this consumer-schema fixture. Remove owner from the valid payload to see a failure. Wire the same schema to real provider responses; shape checks alone cannot prove that the recorded owner is correct.",
        "vitest und zod installieren, dann dieses Consumer-Schema-Fixture ausführen. owner aus dem gültigen Payload entfernen, um den Fehler zu sehen. Dasselbe Schema auf echte Provider-Antworten anwenden; die Form belegt nicht die korrekte reservierte Person."),
      code: `import { expect, test } from 'vitest';
import { z } from 'zod';
const ReservedPet = z.object({
  petId: z.string(),
  status: z.literal('reserved'),
  owner: z.string().min(1),
});
test('provider payload meets the consumer contract', () => {
  expect(ReservedPet.safeParse({
    petId: 'rex', status: 'reserved', owner: 'anna',
  }).success).toBe(true);
  expect(ReservedPet.safeParse({
    petId: 'rex', status: 'reserved',
  }).success).toBe(false);
});`,
      focus: [
        { line: 3, note: l("The contract states what the consumer needs: a non-empty owner for a reserved pet.", "Der Vertrag beschreibt, was der Consumer braucht: einen nicht leeren Besitzer bei einem reservierten Tier.") },
        { line: 6, note: l("`min(1)` forbids an empty owner, the kind of drift between provider and consumer this catches.", "`min(1)` verbietet einen leeren Besitzer, genau die Art Abweichung zwischen Provider und Consumer, die das fängt.") },
        { line: [12, 14], note: l("The negative case: a payload missing `owner` must be rejected, or the contract guards nothing.", "Der Negativfall: Ein Payload ohne `owner` muss abgelehnt werden, sonst schützt der Vertrag nichts.") },
      ] }],
    steps: [
      l('Write the API contract (OpenAPI schema or consumer pacts) and commit it.', 'Den API-Vertrag (OpenAPI-Schema oder Consumer-Pacts) schreiben und committen.'), l('Verify the provider against the contract in its CI; verify consumers against it in theirs.', 'Den Anbieter in seiner CI gegen den Vertrag prüfen, die Konsumenten in ihrer.'),
      l('Publish the contract where both teams (or agents) can read it, and break the build on any incompatible change.', 'Den Contract dort veröffentlichen, wo beide Teams (oder Agenten) ihn lesen können, und den Build bei jeder inkompatiblen Änderung scheitern lassen.'),
    ],
    done: l('Removing a field the consumer uses makes the provider\'s CI fail.', 'Entfernt man ein vom Konsumenten genutztes Feld, scheitert die CI des Anbieters.'),
    think: [
      q('Why not just run both services and test them together?', 'Warum nicht einfach beide Dienste laufen lassen und zusammen testen?', 'You can, but it is slow, needs a shared environment and fails for many reasons. A contract test checks just the agreement, in seconds, in each team\'s own pipeline.', 'Kann man, aber es ist langsam, braucht eine gemeinsame Umgebung und scheitert aus vielen Gründen. Ein Contract-Test prüft nur die Vereinbarung, in Sekunden, in der eigenen Pipeline jedes Teams.'),
      q('Predict: the provider changes `price` from euros (`12.5`) to cents (`1250`). The type stays `number`. Does the contract test fail?', 'Vorhersage: Der Provider ändert `price` von Euro (`12.5`) auf Cent (`1250`). Der Typ bleibt `number`. Schlägt der Contract Test fehl?',
        'Not if it only checks the shape. Meaning is not covered; add example values or a documented unit, and a test on the consumer side that uses a realistic price.',
        'Nicht, wenn er nur die Form prüft. Die Bedeutung ist nicht abgedeckt; Beispielwerte oder eine dokumentierte Einheit ergänzen und einen Test auf Konsumentenseite mit einem realistischen Preis.'),
      q('What changes when an agent edits the provider code?', 'Was ändert sich, wenn ein Agent den Provider-Code ändert?',
        'The agent cannot see consumers it was not told about. The contract check gives it fast, objective feedback about breaking changes that its own tests do not contain.',
        'Der Agent sieht Konsumenten nicht, von denen ihm niemand erzählt hat. Die Contract-Prüfung gibt ihm schnelles, objektives Feedback zu Breaking Changes, die seine eigenen Tests nicht enthalten.'),
    ],
    related: ['integration-tests', 'component-tests', 'architecture'],
  },
  {
    id: 'ui-ux-tests',
    viz: { kind: 'scope', mode: 'ui-ux-tests' },
    name: l('UI/UX tests (visual, accessibility)', 'UI/UX-Tests (visuell, Barrierefreiheit)'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Automatically check how the interface looks and whether everyone can use it: screenshots against a baseline, accessibility rules.', 'Automatisch prüfen, wie die Oberfläche aussieht und ob alle sie nutzen können: Screenshots gegen eine Baseline, Barrierefreiheitsregeln.'),
    catches: l('layout breakage, overlapping elements, missing labels, poor contrast, broken keyboard navigation', 'zerbrochenes Layout, überlappende Elemente, fehlende Labels, schlechter Kontrast, kaputte Tastaturnavigation'),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('Visual diffs catch what DOM assertions miss.', 'Visuelle Diffs fangen, was DOM-Assertions übersehen.'), l('Automated accessibility checks are cheap and catch a meaningful share of WCAG problems.', 'Automatische Barrierefreiheitsprüfungen sind billig und fangen einen relevanten Teil der WCAG-Probleme.'),
      l('Keyboard and focus checks can run in the same browser tests as the functional ones.', 'Tastatur- und Fokusprüfungen können in denselben Browsertests laufen wie die funktionalen.'),
    ],
    limits: [l('Automated a11y tools find only part of the problems; real users with assistive technology find the rest.', 'Automatische A11y-Werkzeuge finden nur einen Teil der Probleme; echte Nutzer mit Hilfstechnik finden den Rest.'), l('Screenshot baselines are sensitive to fonts and rendering; run them in a fixed container.', 'Screenshot-Baselines reagieren auf Schriften und Rendering; in einem festen Container ausführen.')],
    ai: l('An agent cannot see the UI it changes unless you give it screenshots. Visual diffs and axe reports turn "looks broken" into a signal it can read.', 'Ein Agent sieht die Oberfläche nicht, die er ändert, außer man gibt ihm Screenshots. Visuelle Diffs und axe-Berichte machen aus „sieht kaputt aus“ ein Signal, das er lesen kann.'),
    evidence: { general: none(), ai: none() },
    variants: [{ name: l('Visual regression', 'Visuelle Regression'), text: l('Pixel or DOM comparison against an approved baseline.', 'Pixel- oder DOM-Vergleich gegen eine freigegebene Baseline.') }, { name: l('Accessibility testing', 'Barrierefreiheitstests'), text: l('axe-core, Lighthouse or Pa11y in CI, plus manual keyboard and screen-reader checks.', 'axe-core, Lighthouse oder Pa11y in der CI, plus manuelle Tastatur- und Screenreader-Prüfung.') }],
    tools: { php: ['codeception'], js: ['playwright', 'axe-core', 'storybook'], python: ['playwright'], any: ['lighthouse', 'pa11y', 'backstopjs'] },
    snippets: [{ lang: 'js', file: 'pets.a11y.spec.ts', code: `import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('pet list has no detectable accessibility violations', async ({ page }) => {
  await page.goto('/pets');
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations).toEqual([]);
  await expect(page).toHaveScreenshot('pets.png', { maxDiffPixelRatio: 0.01 });
});`,
      focus: [
        { line: 2, note: l("axe finds missing labels and contrast problems that no unit test would notice.", "axe findet fehlende Labels und Kontrastprobleme, die kein Unit-Test bemerkt.") },
        { line: 7, note: l("An empty violation list is the contract; any new violation fails the test.", "Eine leere Liste von Verstößen ist der Vertrag; jede neue Verletzung lässt den Test scheitern.") },
        { line: 8, note: l("A screenshot with a small tolerance catches visual regressions; too strict a threshold makes it flaky.", "Ein Screenshot mit kleiner Toleranz fängt visuelle Regressionen; ein zu strenger Schwellwert macht ihn flaky.") },
      ] }],
    steps: [l('Add an automated accessibility scan for the main pages to CI.', 'Einen automatischen Barrierefreiheits-Scan der Hauptseiten in die CI aufnehmen.'), l('Add screenshot comparisons for 3–5 key screens in a fixed browser container.', 'Screenshot-Vergleiche für 3–5 Schlüsselansichten in einem festen Browser-Container ergänzen.'), l('Check keyboard-only navigation of the main journey by hand once.', 'Die Tastaturbedienung des Hauptablaufs einmal von Hand prüfen.')],
    done: l('No axe violations on main pages; screenshot tests pass and fail on a deliberate layout break.', 'Keine axe-Verstöße auf den Hauptseiten; Screenshot-Tests sind grün und scheitern bei einem absichtlichen Layoutbruch.'),
    think: [
      q('Automated tools report zero accessibility violations. Is the page accessible?', 'Automatische Werkzeuge melden null Barrierefreiheitsverstöße. Ist die Seite barrierefrei?', 'Not necessarily. Tools check rules like labels and contrast; they cannot judge whether the reading order makes sense or whether a screen-reader user can finish the task.', 'Nicht unbedingt. Werkzeuge prüfen Regeln wie Labels und Kontrast; ob die Lesereihenfolge Sinn ergibt oder ein Screenreader-Nutzer die Aufgabe schafft, können sie nicht beurteilen.'),
      q('Predict: a screenshot test runs on a developer laptop and in CI with a different font. What happens?', 'Vorhersage: Ein Screenshot-Test läuft auf dem Laptop und in der CI mit einer anderen Schriftart. Was passiert?',
        'Pixel differences everywhere, so the baseline is useless. Render in a fixed container with pinned fonts, and compare only there.',
        'Pixelunterschiede überall, die Baseline ist wertlos. In einem festen Container mit festgelegten Schriften rendern und nur dort vergleichen.'),
      q('An agent changes the layout and approves the new screenshots. What is the risk?', 'Ein Agent ändert das Layout und bestätigt die neuen Screenshots. Was ist das Risiko?',
        'The agent judges its own change, and a visual bug becomes the new baseline. A human should look at the diff images, or the baseline update needs approval.',
        'Der Agent bewertet seine eigene Änderung, und ein visueller Fehler wird zur neuen Baseline. Ein Mensch sollte die Diff-Bilder ansehen, oder die Baseline-Aktualisierung braucht eine Freigabe.'),
    ],
    related: ['usability-tests', 'e2e-tests', 'snapshot-tests', 'component-tests'],
  },
];
