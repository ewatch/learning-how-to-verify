import type { Practice } from '../types';
import { ev, f, l, none, q } from './_h';

const RUNNERS = { php: ['phpunit', 'pest'], js: ['vitest', 'jest', 'node-test'], python: ['pytest'], java: ['junit', 'kotest'], dotnet: ['xunit', 'nunit'], go: ['go-test'], rust: ['cargo-test'], cpp: ['googletest', 'catch2'] };

export const staticTests: Practice[] = [
  {
    id: 'unit-tests',
    domain: { parts: ['fee', 'fee-rules', 'valid-age'], what: l('Unit tests examine the four fee rules and the age check in `adoptionFee`.', 'Unit Tests prüfen in `adoptionFee` die vier Gebührenregeln und die Altersprüfung.') },
    name: l('Unit tests', 'Unit-Tests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    core: true,
    oneLiner: l('A unit test runs a small part of the code in isolation. It compares the observed result for a specific input with the expected result.', 'Ein Unit Test führt einen kleinen Teil des Codes isoliert aus. Er vergleicht das tatsächliche Ergebnis für eine konkrete Eingabe mit dem erwarteten Ergebnis.'),
    catches: l('Logic errors such as an incorrect boundary, an incorrect branch or incorrect handling of an error.', 'Fehler an einer Grenze, falsche Verzweigungen und falsche Fehlerbehandlung.'),
    intro: l(
      'The base adoption fee is €120 for dogs and €80 for cats. Pets aged 8 or more pay half. Pets under 1 year cost €20 more. A coding agent changes one line, and older pets no longer get the discount. A unit test for the discount can find the error in seconds.',
      'Hunde kosten 120 €. Katzen kosten 80 €. Ab 8 Jahren gilt der halbe Preis. Unter 1 Jahr kommen 20 € hinzu. Eine Änderung entfernt den Rabatt für ältere Tiere. Ein Unit Test für den Rabatt kann den Fehler in Sekunden finden.',
    ),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('A unit test can give a result in seconds. A failure can identify the function that has an error.', 'Ein Unit Test liefert schnell ein Ergebnis. Der fehlschlagende Test kann die betroffene Funktion zeigen.'),
      l('Test the code that handles errors. Incorrect error handling can cause severe failures in production.', 'Prüfe den Code für die Fehlerbehandlung. Falsche Fehlerbehandlung kann zu schweren Ausfällen führen.'),
      l('Test cases give examples of the required behavior.', 'Testfälle dokumentieren Beispiele für das erwartete Verhalten.'),
    ],
    limits: [
      l('Unit tests examine the cases that you specify. Use property-based tests to examine generated cases.', 'Unit Tests prüfen die festgelegten Beispiele. Verwende Property-Based Tests für erzeugte Fälle.'),
      l('Unit tests can pass when the units fail to operate together.', 'Unit Tests können bestehen, obwohl die Einheiten nicht zusammenarbeiten.'),
    ],
    ai: l(
      'Studies support unit tests as a source of feedback for coding agents. A test that only repeats the behavior of the code can miss errors. Use mutation testing to examine test quality.',
      'Studien stützen Unit Tests als Feedback für Coding-Agenten. Ein Test, der nur das Verhalten des Codes wiederholt, kann Fehler übersehen. Prüfe die Qualität mit Mutation Testing.',
    ),
    evidence: {
      general: ev('strong', f('yuan2014', 'The study examined catastrophic failures in five distributed systems. Incorrect handling of non-fatal errors caused 92% of the failures. Simple tests of error handling could have found 58% of the failures.', '92 % der katastrophalen Ausfälle in fünf verteilten Systemen kamen von falscher Behandlung nicht fataler Fehler; 58 % wären mit einfachen Tests der Fehlerbehandlung aufgefallen.')),
      ai: ev('strong',
        f('reflexion2023', 'Repeated use of unit-test feedback increased HumanEval pass@1 to 91%.', 'Iteration auf Unit-Test-Feedback hob pass@1 auf HumanEval auf 91 %.'),
        f('codet2023', 'The study ranked candidate programs by how well they matched generated tests. HumanEval pass@1 increased by 18.8 percentage points.', 'Kandidatenprogramme nach Übereinstimmung mit generierten Tests zu ranken hob pass@1 auf HumanEval um 18,8 Punkte.'),
        f('swebench2024', 'SWE-bench uses tests to assess the solutions for 2,294 GitHub issues.', 'SWE-bench, der wichtigste Benchmark für Coding-Agenten, nutzt Tests als Orakel für 2.294 echte GitHub-Issues.')),
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
        { line: 5, note: l("The test uses a fixed expected result of 12000. The test does not calculate the fee again.", "Der Basisfall verankert die Tests: ein konkreter Erwartungswert (12000) statt die Formel nachzurechnen.") },
        { line: 6, note: l("Age 8 is the boundary. This case detects a change between `>` and `>=`.", "Alter 8 ist genau die Grenze; Off-by-one-Fehler bei `>` gegen `>=` verstecken sich hier.") },
        { line: 7, note: l("The test requires the function to reject the invalid input.", "Der Test sagt, was nicht funktionieren darf; ungültige Eingabe soll laut scheitern, nicht einen Preis liefern.") },
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
        { line: 5, note: l("The expected value is a literal. A defect in the fee formula cannot change that value.", "Der Erwartungswert ist ein Literal, ein Fehler in der Formel kann sich also nicht im Test mitverstecken.") },
        { line: 8, note: l("The test uses age 8, the first age that qualifies for the senior discount.", "Die Senior-Regel beginnt bei 8, dieser Test hält also genau den Rabatt fest, nicht irgendeine Zahl.") },
        { line: [11, 12], note: l("`pytest.raises` makes the test fail if the function does not raise the specified error.", "`pytest.raises` macht die Ablehnung zum Teil des Vertrags und scheitert, wenn kein Fehler kommt.") },
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
        { line: 1, note: l("With `strict_types`, PHP does not convert a string age to an integer at the call.", "`strict_types` verhindert, dass PHP ein Alter als String still in einen Int umwandelt, der Grenztest sieht also echte Typen.") },
        { line: [10, 11], note: l("Ages 7 and 8 test the values immediately before and at the boundary.", "7 und 8 liegen auf beiden Seiten der Grenze, dort wohnen Off-by-one-Fehler.") },
        { line: [16, 17], note: l("The test fails if a negative age produces a price instead of an exception.", "Ungültige Eingabe muss eine Exception werfen, der Test scheitert also, wenn ein negatives Alter still einen Preis liefert.") },
      ] },
    ],
    steps: [
      l('Select a module that contains business rules. Record its required behavior, including the error cases.', 'Wähle ein Modul mit Domain Code. Liste das erwartete Verhalten einschließlich der Fehlerfälle auf.'),
      l('Write one test for each behavior with a specific input and an exact expected result. Include the boundary values.', 'Schreibe für jedes Verhalten einen Test mit konkreter Eingabe und genauem Erwartungswert. Prüfe auch die Grenzwerte.'),
      l('Keep the tests independent of the network, the clock and random values. Run the tests in CI.', 'Halte die Tests unabhängig von Netzwerk, Uhr und Zufall. Führe die Tests in CI aus.'),
      l('Run mutation testing on the module. Add tests for surviving mutants that change behavior.', 'Führe Mutation Testing für das Modul aus. Ergänze Tests für verbliebene Mutanten mit geändertem Verhalten.'),
    ],
    done: l('Each behavior and error case has a test with an exact assertion. The suite runs in seconds. Each surviving mutant has an explanation.', 'Jedes erwartete Verhalten und jeder Fehlerfall hat einen Test mit einer genauen Assertion. Die Tests laufen in Sekunden. Für jeden verbliebenen Mutant gibt es eine Erklärung.'),
    think: [
      q('A test checks the senior discount at age 10. Which boundary error can the test miss?', 'Dein Test für „Senioren zahlen die Hälfte“ nutzt Alter 10. Welchen Fehler kann er nicht finden?',
        'At age 10, `age > 8` and `age >= 8` give the same result. Include age 8 and the value immediately below it, age 7.',
        'Eine falsche Grenze: `age > 8` statt `age >= 8` verhält sich bei 10 identisch. Man braucht die Grenze selbst, 8, und den Wert knapp darunter, 7.'),
      q('A test uses only `toBeDefined()` as its assertion. What does line coverage show about this test?', 'Warum zählt ein Test, der nur `toBeDefined()` prüft, als „Abdeckung“, aber nicht als Verifikation?',
        'Line coverage shows that the test ran the code. This assertion can pass for almost any result. Mutation testing can show changes that the assertion cannot detect.',
        'Er führt den Code aus (die Abdeckung steigt), würde aber bei fast jedem Ergebnis bestehen. Mutation Testing zeigt das sofort.'),
      q('A unit test replaces the repository with a mock that always returns the pet as available. Can it detect a double reservation?', 'Vorhersage: Ein Unit-Test für `reserve` mockt das Repository so, dass das Tier immer verfügbar ist. Was sagt ein bestandener Test über Doppelbuchungen aus?',
        'The mock never returns a reserved pet, so the test cannot detect a second reservation. Use a fake that stores reservation state. Use a real database to test concurrent requests.',
        'Nichts. Der Mock macht den interessanten Fall unmöglich. Die Regel mit einem zustandsbehafteten Fake testen, den nebenläufigen Fall gegen eine echte Datenbank.'),
    ],
    related: ['property-based-tests', 'mutation-tests', 'coverage', 'tdd'],
  },
  {
    id: 'functional-tests',
    domain: { parts: ['api', 'reserve'], what: l('A test sends "reserve Rex" to the public API and checks only the response.', 'Ein Test sendet einen Reservierungsrequest für Rex an die öffentliche API und prüft die Antwort.') },
    viz: { kind: 'scope', mode: 'functional-tests' },
    name: l('Functional tests', 'Funktionale Tests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('A functional test uses a public interface to check that a feature meets its requirements.', 'Ein Functional Test prüft eine Anforderung über eine öffentliche Schnittstelle.'),
    catches: l('features that are implemented but do the wrong thing for the user', 'Abweichungen zwischen erwartetem und tatsächlichem Verhalten an der öffentlichen Schnittstelle.'),
    intro: l(
      'A coding agent changes the reservation module and its unit tests. A functional test can still check the reservation through the public API. This check remains valid when the internal code changes.',
      'Ein Coding-Agent ändert das Reservierungsmodul und dessen Unit Tests. Ein Functional Test prüft die Reservierung weiter über die öffentliche API. Bei unverändertem Verhalten kann derselbe Test bestehen.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('A functional test uses the public interface. It can remain valid after a refactoring.', 'Ein Functional Test verwendet die öffentliche Schnittstelle. Er kann nach einem Refactoring weiterhin gelten.'),
      l('A test for each requirement shows which requirements have no test.', 'Ein Test pro Anforderung zeigt, für welche Anforderungen Tests fehlen.'),
      l('A functional test can describe behavior before implementation. You can use the same test after a rewrite.', 'Schreibe den Test vor der Implementierung. Verwende ihn nach einem Rewrite erneut.'),
    ],
    limits: [
      l('Functional tests can take longer than unit tests. A failure can give less detail about the faulty function.', 'Functional Tests können länger dauern. Bei einem Fehler können sie weniger genau auf die betroffene Funktion zeigen als Unit Tests.'),
      l('A functional test can miss a requirement that no one wrote down, such as a concurrency limit.', 'Ein Functional Test kann Anforderungen übersehen, die niemand festgelegt hat.'),
    ],
    ai: l('A coding agent can change the internal code without changes to a functional test. The test checks the result at the public interface.', 'Ein Coding-Agent kann den internen Code ändern, ohne den Functional Test zu ändern. Der Test prüft das Ergebnis an der öffentlichen Schnittstelle.'),
    evidence: { general: ev('weak', f('yuan2014', 'Testing in general: simple tests of error-handling paths would have prevented most catastrophic failures in the systems studied.', 'Testen allgemein: Einfache Tests der Fehlerbehandlung hätten die meisten katastrophalen Ausfälle in den untersuchten Systemen verhindert.')), ai: none() },
    tools: { ...RUNNERS, any: ['schemathesis'] },
    snippets: [{ lang: "js", file: "reservation-functional.test.ts",
      description: l("Run this example with Vitest. It checks a user-visible rule through an in-memory API. Replace the example API with your application entry point. Remove the check for `taken` to make the last two assertions fail.",
        "Führe das Beispiel mit Vitest aus. Es prüft eine Regel über eine In-Memory-API. Ersetze die Beispiel-API durch deinen Anwendungseinstieg. Entferne zum Test die Prüfung auf `taken`. Die letzten beiden Assertions müssen fehlschlagen."),
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
      l('Describe each requirement for one feature with Given, When and Then.', 'Beschreibe jede Anforderung für eine Funktion mit Given, When und Then.'),
      l('Write one test per requirement. Use only the public API, exported function or command-line interface.', 'Schreibe einen Test pro Anforderung. Verwende nur die öffentliche API, die exportierte Funktion oder die CLI.'),
      l('Run the tests using only the public interface. Run the same tests after the refactoring.', 'Führe die Tests nur über die öffentliche Schnittstelle aus. Wiederhole dieselben Tests nach dem Refactoring.'),
    ],
    done: l('Each requirement has a passing test that uses only the public interface.', 'Für jede Anforderung besteht ein Test, der nur die öffentliche Schnittstelle verwendet.'),
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
    domain: { parts: ['ui'], what: l('A test renders the reservation component and replaces the API with a fake.', 'Ein Component Test rendert das Reservierungsformular und ersetzt die API durch einen Fake.') },
    viz: { kind: 'scope', mode: 'component-tests' },
    name: l('Component tests', 'Komponententests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('A component test runs one complete component. It uses fakes for the dependencies outside the component.', 'Ein Component Test führt eine vollständige Komponente aus. Fakes ersetzen die Abhängigkeiten außerhalb der Komponente.'),
    catches: l('wiring mistakes inside a component: wrong configuration, missing dependency injection, broken rendering', 'Falsche Konfiguration, fehlende Abhängigkeiten und Fehler beim Rendering.'),
    intro: l(
      'The reservation functions pass their unit tests. The application still cannot use the service because its registration is absent. A component test can show this error.',
      'Alle Funktionen des Reservierungsservice bestehen ihre Unit Tests. Die Anwendung kann den Service nicht verwenden, weil er nicht registriert ist. Ein Component Test kann diesen Fehler zeigen.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('A component test runs more code than a unit test. It can run faster than an end-to-end test.', 'Ein Component Test führt mehr Code als ein Unit Test aus. Er kann schneller als ein End-to-End Test laufen.'), l('Tests that find UI elements by role or label can also find some accessibility problems.', 'Tests, die UI-Elemente nach Rolle oder Label suchen, können auch Accessibility-Probleme zeigen.'),
      l('A component test can run on each change and detect some configuration and dependency injection errors.', 'Component Tests können bei jeder Änderung laufen. Sie können Konfigurationsfehler und Fehler bei Dependency Injection erkennen.'),
    ],
    limits: [
      l('A fake can behave differently from the dependency. Use contract tests to check the interaction.', 'Ein Fake kann sich anders verhalten als die echte Abhängigkeit. Prüfe die Interaktion mit Contract Tests.'),
      l('A test with too many fakes can run too little of the component.', 'Ein Test mit zu vielen Fakes kann zu wenig von der Komponente ausführen.'),
    ],
    ai: l('A coding agent can omit a provider or change a property name. A component test can find that error without running the full system.', 'Ein Coding-Agent kann einen Provider vergessen oder eine Prop umbenennen. Ein Component Test kann diesen Fehler ohne das vollständige System erkennen.'),
    evidence: { general: none(), ai: none() },
    tools: { php: ['phpunit', 'codeception'], js: ['testing-library', 'storybook', 'vitest'], python: ['pytest'], java: ['junit', 'testcontainers'], dotnet: ['xunit', 'testcontainers'], go: ['go-test', 'testcontainers'] },
    snippets: [{ lang: "js", file: "reserve-button.test.ts",
      description: l("Run the example with Vitest and jsdom. The component must emit the selected pet ID. Change the emitted ID to make the test fail. Add a separate test for the server reservation.",
        "Führe das Beispiel mit Vitest und jsdom aus. Die Komponente muss die gewählte Tier-ID senden. Ändere die gesendete ID, um den Test fehlschlagen zu lassen. Prüfe die Reservierung auf dem Server separat."),
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
      l('Select a component. Use fakes only for external dependencies, such as a database or clock.', 'Wähle eine Komponente. Verwende Fakes nur für externe Abhängigkeiten.'), l('Use the component\'s interface to check its behavior. For a user interface component, select elements by role.', 'Prüfe das Verhalten über die Schnittstelle der Komponente. Wähle bei einer UI-Komponente Elemente nach ihrer Rolle aus.'),
      l('Run the tests in CI. Add a test that makes a fake return an error. Check how the component handles the error.', 'Führe die Tests in CI aus. Ergänze einen Test, bei dem ein Fake einen Fehler meldet. Prüfe die Fehlerbehandlung.'),
    ],
    done: l('Tests cover the main behavior of the component. The tests use fakes only at its external interfaces.', 'Tests prüfen das wichtigste Verhalten der Komponente. Fakes stehen nur an ihren externen Schnittstellen.'),
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
    domain: { parts: ['api', 'db', 'never-twice'], what: l('API, domain code and a real database must reject a second reservation.', 'Ein Integration Test prüft, ob die echte Datenbank eine zweite Reservierung ablehnt.') },
    viz: { kind: 'scope', mode: 'integration-tests' },
    name: l('Integration tests', 'Integrationstests'),
    layer: 'static',
    phases: ['deploy'],
    fromOverview: true,
    oneLiner: l('An integration test examines how components operate together with real dependencies, such as a database or queue.', 'Ein Integration Test prüft das Zusammenspiel von Komponenten mit realen Abhängigkeiten, etwa einer Datenbank oder Queue.'),
    catches: l('mismatched assumptions between parts: SQL that the real database rejects, wrong serialization, transactions that do not isolate', 'SQL-Fehler in der echten Datenbank, falsche Serialisierung und fehlende Transaction Isolation.'),
    intro: l(
      'Two people try to reserve the same pet at the same time. A mocked database can hide the conflict. An integration test shows whether the real database rejects the second reservation.',
      'Zwei Personen wollen gleichzeitig dasselbe Tier reservieren. Ein Mock der Datenbank kann den Konflikt verdecken. Ein Integration Test zeigt, ob die echte Datenbank die zweite Reservierung ablehnt.',
    ),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('An integration test can detect behavior of a dependency that a mock does not reproduce.', 'Ein Integration Test kann Verhalten einer echten Abhängigkeit zeigen, das ein Mock nicht nachbildet.'), l('Testcontainers can start real dependencies on a CI runner.', 'Testcontainers kann echte Abhängigkeiten auf einem CI Runner starten.'),
      l('You can check transactions, constraints and migrations against the real database.', 'Prüfe Transaktionen, Constraints und Migrationen mit der echten Datenbank.'),
    ],
    limits: [
      l('Integration tests can be slower and less stable than unit tests. Test the interactions that require a real dependency.', 'Integration Tests können langsamer und weniger stabil als Unit Tests sein. Prüfe damit Interaktionen, die echte Abhängigkeiten brauchen.'),
      l('Shared state can cause results to depend on test order. Set up and clear the data for each test.', 'Gemeinsamer Zustand kann die Ergebnisse von der Reihenfolge der Tests abhängig machen. Bereite die Daten für jeden Test separat vor.'),
    ],
    ai: l('A mock can repeat an assumption in the coding agent\'s implementation. Run an integration test with the real database to check that assumption.', 'Ein Mock kann eine Annahme aus dem Code wiederholen. Prüfe die Annahme mit einem Integration Test gegen die echte Datenbank.'),
    evidence: { general: none(), ai: none() },
    tools: { php: ['phpunit', 'codeception'], js: ['testcontainers', 'vitest'], python: ['testcontainers', 'pytest'], java: ['testcontainers', 'junit'], dotnet: ['testcontainers', 'xunit'], go: ['testcontainers', 'go-test'], rust: ['testcontainers', 'cargo-test'] },
    snippets: [{ lang: "js", file: "reservation-db.test.ts",
      description: l("Install Vitest, `pg`, `@types/pg` and `@testcontainers/postgresql`. Start Docker. The test uses a disposable PostgreSQL database. Remove the `IS NULL` condition. Both updates then succeed, and the test fails.",
        "Installiere Vitest, `pg`, `@types/pg` und `@testcontainers/postgresql`. Starte Docker. Der Test verwendet eine temporäre PostgreSQL-Datenbank. Entferne zum Test die `IS NULL`-Bedingung. Beide Updates gelingen dann und der Test schlägt fehl."),
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
      l('Start the real dependency in a container for each test run.', 'Starte die echte Abhängigkeit für jeden Testlauf in einem Container.'), l('Use the real dependency to test the repository or client. Include a test with two concurrent reservations for the same pet.', 'Prüfe das Repository oder den Client mit der echten Abhängigkeit. Teste auch zwei gleichzeitige Reservierungen für dasselbe Tier.'),
      l('Reset the database before each test. For example, roll back the transaction or create a clean schema.', 'Setze die Datenbank vor jedem Test zurück. Verwende einen Transaction Rollback oder ein frisches Schema.'),
    ],
    done: l('CI runs integration tests with real dependencies in containers. The suite includes a test with concurrent requests.', 'CI führt Integration Tests mit realen Abhängigkeiten in Containern aus. Ein Test prüft gleichzeitige Requests.'),
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
    domain: { parts: ['ui', 'api', 'reserve'], what: l('A visitor reserves Rex in the browser, through every layer.', 'Ein End-to-End Test reserviert Rex im Browser.') },
    viz: { kind: 'scope', mode: 'e2e-tests' },
    name: l('End-to-end tests', 'End-to-End-Tests'),
    layer: 'static',
    phases: ['pre', 'deploy'],
    fromOverview: false,
    oneLiner: l('An end-to-end test uses the real user interface or API to check a complete task.', 'Ein End-to-End Test prüft einen vollständigen Ablauf über die echte UI oder API.'),
    catches: l('broken wiring across layers: wrong endpoint, missing migration, broken routing', 'Falsche Endpoints, fehlende Migrationen und Routing-Fehler zwischen Komponenten.'),
    intro: l(
      'The unit tests pass, but the reservation page shows no content. An end-to-end test performs the reservation in the browser and checks the result.',
      'Die Unit Tests bestehen. Die Reservierungsseite bleibt leer. Ein End-to-End Test führt die Reservierung im Browser aus und prüft das Ergebnis.',
    ),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('The test uses the same interface as a user.', 'Ein End-to-End Test verwendet dieselbe Schnittstelle wie ein Nutzer.'),
      l('A small suite can cover critical tasks such as search, reservation and payment.', 'Wenige Tests können kritische Abläufe wie Suche, Reservierung und Zahlung prüfen.'),
      l('A test of the deployed build can detect configuration and migration errors.', 'Ein Test des bereitgestellten Builds kann Konfigurations- und Migrationsfehler zeigen.'),
      l('Use the list of critical tasks to assess the coding agent\'s result.', 'Verwende die Liste der kritischen Abläufe, um das Ergebnis des Coding-Agenten zu beurteilen.'),
    ],
    limits: [
      l('End-to-end tests can be slow and sensitive to changes. Use narrower tests for cases that do not require the full system.', 'End-to-End Tests können langsam und empfindlich für Änderungen sein. Prüfe Einzelheiten mit Tests, die weniger vom System ausführen.'),
      l('A failed journey may not identify the faulty component. Use traces and screenshots to examine the failure.', 'Ein Fehler im Ablauf zeigt nicht immer die betroffene Komponente. Untersuche den Fehler mit Traces und Screenshots.'),
    ],
    ai: l(
      'Give the coding agent a driver for the browser or API. It can run a complete task and examine a failure trace before it reports completion.',
      'Gib dem Coding-Agenten einen Browser- oder API-Driver. Lass ihn den vollständigen Ablauf ausführen. Bei einem Fehler kann er den Trace prüfen.',
    ),
    evidence: { general: none(), ai: ev('weak', f('metr2026', 'METR asked maintainers to review 296 agent pull requests. After an adjustment for variation in reviewers\' decisions, maintainers would merge approximately half of the requests that passed the benchmark tests. The study measured the limits of benchmark tests.', 'Indirekte Evidenz: Bei METR reviewten Maintainer 296 Agenten-PRs; nach Bereinigung um Schwankungen der Maintainer-Entscheidungen würde etwa die Hälfte der testbestehenden SWE-bench-Verified-PRs nicht gemergt. Das zeigt Grenzen der Benchmark-Tests, nicht die Wirkung zusätzlicher E2E-Tests.')) },
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
    steps: [l('Select three to five critical user tasks.', 'Wähle drei bis fünf kritische Nutzerabläufe.'), l('Write one end-to-end test for each task. Use role or label selectors. Start each run with known test data.', 'Schreibe einen End-to-End Test pro Ablauf. Verwende Selektoren für Rollen oder Labels. Beginne jeden Lauf mit bekannten Testdaten.'), l('Record a trace for each failure. Run the suite in CI.', 'Zeichne bei jedem Fehler einen Trace auf. Führe die Tests in CI aus.')],
    done: l('The critical end-to-end tests pass in CI. A test of an intentionally incorrect route fails and records a trace.', 'Die erforderlichen End-to-End Tests bestehen in CI. Eine absichtlich fehlerhafte Route lässt einen Test fehlschlagen. Der Test zeichnet einen Trace auf.'),
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
    domain: { parts: ['reserve', 'never-twice'], what: l('The rule "a pet cannot be reserved twice" is written as Given, When, Then.', 'Ein Gherkin-Szenario prüft, ob der Petstore eine zweite aktive Reservierung ablehnt.') },
    viz: { kind: 'scope', mode: 'acceptance-tests' },
    name: l('Acceptance tests', 'Akzeptanztests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('An acceptance test states a condition that the requester approves. The feature must meet that condition.', 'Ein Acceptance Test prüft eine Bedingung, die der Auftraggeber freigibt. Die Funktion muss diese Bedingung erfüllen.'),
    catches: l('misunderstood requirements, and "done" that is not done', 'Missverstandene Anforderungen und fehlende Bedingungen für die Freigabe.'),
    intro: l(
      'A reservation expires after 24 hours. This requirement leaves the behavior at exactly 24 hours unclear. The requester can specify that case in an acceptance test before implementation.',
      'Eine Reservierung verfällt nach 24 Stunden. Das Verhalten bei genau 24 Stunden ist offen. Halte diesen Fall vor der Implementierung in einem Acceptance Test fest.',
    ),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('The requester can read an acceptance test when it uses the terms from the requirement.', 'Der Auftraggeber kann einen Acceptance Test lesen, wenn er die Begriffe aus der Anforderung verwendet.'), l('The test records the agreement between the requester and the person or agent who implements the feature.', 'Der Test hält fest, worauf sich Auftraggeber und Umsetzung geeinigt haben.'),
      l('An example can show when two people understand a requirement differently.', 'Ein Beispiel kann zeigen, dass zwei Personen eine Anforderung unterschiedlich verstehen.'),
    ],
    limits: [
      l('An additional Gherkin layer can need maintenance. A clear test name can be sufficient.', 'Eine zusätzliche Gherkin-Schicht erhöht den Wartungsaufwand. Ein Test mit einem klaren Namen kann ausreichen.'),
      l('Unclear criteria can permit a test to pass for incorrect behavior.', 'Ein ungenaues Kriterium kann zulassen, dass ein Test bei falschem Verhalten besteht.'),
    ],
    ai: l('Give the coding agent the approved acceptance tests as requirements. Protect the tests so the same change cannot change its target.', 'Gib dem Coding-Agenten die freigegebenen Acceptance Tests als Anforderungen. Schütze die Tests vor Änderungen durch denselben Pull Request.'),
    evidence: { general: none(), ai: ev('weak', f('patchdiff2026', 'Indirect evidence: PatchDiff found behavioral differences from reference fixes in 29.6% of test-passing agent patches. This exposes gaps in benchmark tests; it does not measure whether adding acceptance tests improves agent code.', 'Indirekte Evidenz: PatchDiff fand bei 29,6 % der testbestehenden Agenten-Patches Verhaltensunterschiede zur Referenzlösung. Das zeigt Lücken in Benchmark-Tests; die Wirkung zusätzlicher Akzeptanztests auf Agenten-Code wurde nicht gemessen.')) },
    tools: { php: ['behat', 'codeception'], js: ['cucumber', 'playwright'], python: ['behave', 'pytest'], java: ['cucumber'], dotnet: ['reqnroll'], go: ['cucumber'] },
    snippets: [{ lang: 'any', file: 'reserve.feature',
      enforcedBy: l('A BDD runner such as Cucumber, Behat, behave or Reqnroll parses this Gherkin file and runs its step definitions. Without step definitions and a runner, a `.feature` file is plain text.', 'Ein BDD-Runner wie Cucumber, Behat, behave oder Reqnroll liest diese Gherkin-Datei und führt passende Step Definitions aus. Ohne Step Definitions und Runner ist eine `.feature`-Datei nur Text.'),
      code: `Feature: Reserving a pet for adoption
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
      l('Write acceptance criteria with the person who requested the feature.', 'Schreibe die Acceptance Criteria zusammen mit dem Auftraggeber.'), l('Write an executable test for each criterion before implementation. Protect these test files.', 'Schreibe vor der Implementierung einen ausführbaren Test für jedes Kriterium. Schütze diese Testdateien.'),
      l('Include failure cases such as a second reservation, an unknown ID and an expired voucher. Get approval from the requester.', 'Nimm Fehlerfälle auf, etwa eine zweite Reservierung, eine unbekannte ID oder einen abgelaufenen Gutschein. Lass sie vom Auftraggeber freigeben.'),
    ],
    done: l('Each acceptance criterion has an executable test with approval from the requester. All these tests pass.', 'Jedes Kriterium hat einen ausführbaren Test mit Freigabe des Auftraggebers. Alle Tests bestehen.'),
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
    domain: { parts: ['reserve', 'never-twice'], what: l('A test reproduces a bug report: a pet id with a space at the end.', 'Ein Regression Test prüft eine Tier-ID mit einem Leerzeichen am Ende.') },
    sim: 'regression',
    name: l('Regression tests', 'Regressionstests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('A regression test records an error that you corrected. The test fails if the error occurs again.', 'Ein Regression Test reproduziert einen behobenen Fehler. Der Test schlägt fehl, wenn der Fehler erneut auftritt.'),
    catches: l('old bugs reintroduced by new changes', 'Bekannte Fehler, die nach einer späteren Änderung erneut auftreten.'),
    intro: l(
      'A defect let two people reserve one pet. A later change causes the same defect. A regression test for the first correction detects it.',
      'Ein Fehler erlaubte zwei Reservierungen für dasselbe Tier. Eine spätere Änderung führt denselben Fehler wieder ein. Der Regression Test für die erste Korrektur erkennt den Fehler.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('A regression test protects a part of the code where a known defect occurred.', 'Ein Regression Test prüft eine Stelle, an der ein bekannter Fehler auftrat.'), l('Run the same test before and after the correction to examine its effect.', 'Führe denselben Test vor und nach der Korrektur aus. Vergleiche die Ergebnisse.'),
      l('The steps in a defect report can give the inputs for a regression test.', 'Der Fehlerbericht kann die Eingaben für den Regression Test liefern.'),
    ],
    limits: [
      l('A large suite can require test selection to keep runtime low.', 'Eine große Test Suite kann Test Selection brauchen, damit sie schnell bleibt.'),
      l('A regression test detects the specific failure that it reproduces. Other defects can still occur.', 'Der Regression Test erkennt den Fehler, den er reproduziert. Andere Fehler können weiter auftreten.'),
    ],
    ai: l('Ask the coding agent to write a test that reproduces the defect. Run the test before the correction. Run the same test after the correction.', 'Lass den Coding-Agenten einen Test schreiben, der den Fehler reproduziert. Führe den Test vor der Korrektur aus. Führe denselben Test danach erneut aus.'),
    evidence: { general: ev('weak', f('memon2017', 'In Google\'s CI only a tiny share of tests ever fail, and failures cluster near recently changed code, which motivates test selection.', 'In Googles CI schlägt nur ein winziger Teil der Tests je fehl, und Fehlschläge häufen sich nahe kürzlich geändertem Code; das motiviert Testauswahl.')), ai: none() },
    tools: RUNNERS,
    snippets: [{ lang: "js", file: "reservation-regression.test.ts",
      description: l("Set the import to your reservation module. Use the input and expected result from the incident report. Run Vitest at the commit before the correction. Confirm that it fails. Run the same test after the correction.",
        "Verwende das Reservierungsmodul deines Projekts. Übernimm Eingabe und Erwartungswert aus dem Fehlerbericht. Führe den Test beim Commit vor der Korrektur aus. Prüfe, dass er fehlschlägt. Wiederhole den Test nach der Korrektur."),
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
    steps: [l('Write a test that reproduces the defect and fails. Commit the test.', 'Schreibe einen Test, der den Fehler reproduziert und fehlschlägt. Committe den Test.'), l('Correct the code until the test passes. Make no changes to the test.', 'Korrigiere den Code, bis der Test besteht. Lass den Test unverändert.'), l('Include the issue identifier in the test name.', 'Nimm die Issue-ID in den Testnamen auf.')],
    done: l('The test fails on the commit before the correction. It passes on the commit with the correction.', 'Der Test schlägt beim Commit vor der Korrektur fehl. Mit der Korrektur besteht er.'),
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
    domain: { parts: ['rollout', 'api'], what: l('After each deploy, a health ping and one pet read pass through all parts.', 'Nach dem Deploy senden die Smoke Tests einen Health Request und lesen ein Tier.') },
    viz: { kind: 'scope', mode: 'smoke-tests' },
    name: l('Smoke tests', 'Smoke-Tests'),
    layer: 'static',
    phases: ['pre', 'deploy'],
    fromOverview: true,
    oneLiner: l('After a build or deployment, a smoke test checks that the service starts and that its basic functions respond.', 'Ein Smoke Test prüft nach einem Build oder Deploy, ob der Service startet und seine Grundfunktionen antworten.'),
    catches: l('dead-on-arrival builds: missing config, crash at startup, broken health endpoint', 'Fehlende Konfiguration, Abstürze beim Start und Fehler am Health Endpoint.'),
    intro: l(
      'A coding agent changes the name of an environment variable. The build passes, but the new version cannot read its configuration. A smoke test can stop the release when the service fails to respond.',
      'Ein Coding-Agent benennt eine Umgebungsvariable um. Der Build besteht. Die neue Version findet ihre Konfiguration nicht. Ein Smoke Test kann den Rollout stoppen, wenn der Service nicht antwortet.',
    ),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('A short smoke test can stop a rollout when basic functions fail.', 'Ein kurzer Smoke Test kann den Rollout stoppen, wenn Grundfunktionen ausfallen.'), l('A smoke test can check startup before a canary receives traffic.', 'Ein Smoke Test kann den Start prüfen, bevor der Canary Traffic erhält.'),
      l('Run the same basic checks in production after release.', 'Führe dieselben Checks nach dem Release in Produktion aus.'),
    ],
    limits: [
      l('A service can pass a smoke test and still return an incorrect business result.', 'Ein Service kann den Smoke Test bestehen und ein falsches fachliches Ergebnis liefern.'),
      l('A long smoke suite can delay the rollout. Use separate tests for detailed cases.', 'Eine lange Smoke Suite kann den Rollout verzögern. Verwende eigene Tests für Details.'),
    ],
    ai: l(
      'Give the coding agent a command that starts the service and runs the smoke checks. Keep the checks short so the coding agent can run them before each commit.',
      'Gib dem Coding-Agenten einen Befehl, der den Service startet und die Smoke Tests ausführt. Halte die Checks kurz, damit der Coding-Agent sie vor jedem Commit ausführen kann.',
    ),
    evidence: { general: none(), ai: none() },
    tools: { php: ['codeception'], js: ['playwright', 'vitest'], any: ['k6', 'hyperfine'] },
    snippets: [{ lang: 'any', file: 'smoke.sh',
      enforcedBy: l('Your CI/CD deployment pipeline runs this shell script (using `curl`) immediately after deploy; a non-zero exit code blocks the rollout.', 'Deine CI/CD-Deploy-Pipeline führt dieses Shell-Skript (mit `curl`) direkt nach dem Deploy aus; ein Exit-Code ungleich 0 stoppt den Rollout.'),
      code: `#!/usr/bin/env sh
set -e
curl -fsS "$BASE_URL/health"                 # service is up
curl -fsS "$BASE_URL/api/pets?limit=1" | grep -q '"id"'   # can read data`,
      focus: [
        { line: 2, note: l("`set -e` makes the first failing check abort the script, so the deploy gets a red result.", "`set -e` bricht beim ersten Fehler ab, damit der Deploy ein rotes Ergebnis bekommt.") },
        { line: 3, note: l("A health check only proves the process is up, not that it works.", "Ein Health-Check beweist nur, dass der Prozess läuft, nicht dass er funktioniert.") },
        { line: 4, note: l("A real read through the API with a content check catches a service that is up but empty.", "Ein echter Lesezugriff über die API mit Inhaltsprüfung fängt einen Dienst, der läuft, aber leer ist.") },
      ] }],
    steps: [
      l('Write three to five basic checks. Include a health request, a data request and a page load.', 'Schreibe drei bis fünf grundlegende Checks. Prüfe zum Beispiel den Health Endpoint, einen Lesezugriff und einen Seitenaufruf.'), l('Run the checks after each deployment. Block the rollout if a check fails.', 'Führe die Checks nach jedem Deploy aus. Stoppe den Rollout, wenn ein Check fehlschlägt.'),
      l('Make the check fail if the service has an incorrect version, lacks configuration or refuses a connection. Correct each false alarm.', 'Lass den Check bei einer falschen Version, fehlender Konfiguration oder abgelehnter Verbindung fehlschlagen. Korrigiere jeden Fehlalarm.'),
    ],
    done: l('Smoke checks run automatically after deployment and complete in less than one minute. A failure blocks the rollout.', 'Die Smoke Tests laufen nach jedem Deploy automatisch. Sie dauern weniger als eine Minute. Ein fehlgeschlagener Test stoppt den Rollout.'),
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
    domain: { parts: ['invoice', 'voucher'], what: l('The adoption invoice is compared line by line with the approved text.', 'Ein Snapshot Test vergleicht die Rechnung mit dem freigegebenen Text.') },
    sim: 'snapshot',
    name: l('Snapshot & characterization tests', 'Snapshot- & Charakterisierungstests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('A snapshot test compares current output with an approved copy. A difference makes the test fail until a person approves the change.', 'Ein Snapshot Test vergleicht die aktuelle Ausgabe mit einer freigegebenen Kopie. Eine Abweichung lässt den Test fehlschlagen, bis eine Person die Änderung freigibt.'),
    catches: l('unintended changes in output: a rendered page, a JSON response, an invoice text, behaviour of legacy code during a rewrite', 'Unbeabsichtigte Änderungen an Seiten, JSON-Antworten, Rechnungen oder anderen Ausgaben.'),
    intro: l(
      'A refactoring preserves the invoice total but removes the voucher line. A snapshot test compares the invoice with the approved output. The comparison shows the missing line.',
      'Nach einem Refactoring stimmt die Rechnungssumme weiterhin. In der Ausgabe fehlt die Gutscheinzeile. Ein Snapshot Test zeigt diese Abweichung von der freigegebenen Ausgabe.',
    ),
    cost: 1,
    feedback: 'seconds',
    worth: [
      l('A snapshot records existing output before a refactoring.', 'Ein Snapshot zeichnet die bestehende Ausgabe vor dem Refactoring auf.'), l('One snapshot can record a large output.', 'Ein Snapshot kann eine große Ausgabe speichern.'),
      l('A snapshot diff shows exactly which parts of the output changed.', 'Ein Snapshot Diff zeigt im Pull Request die geänderten Teile der Ausgabe.'),
    ],
    limits: [l('A snapshot update without review can accept an incorrect result.', 'Eine Freigabe ohne Prüfung kann eine falsche Ausgabe übernehmen.'), l('A difference identifies a change in output. A person must decide if the change is correct.', 'Der Diff zeigt die Abweichung. Eine Person beurteilt, ob das neue Ergebnis korrekt ist.')],
    ai: l('A snapshot can detect a change in output after a refactoring. Review intended snapshot changes separately from the refactoring.', 'Ein Snapshot kann eine Änderung an der Ausgabe nach einem Refactoring zeigen. Prüfe beabsichtigte Änderungen an Snapshots getrennt vom Refactoring.'),
    evidence: { general: none(), ai: none() },
    variants: [{ name: l('Golden master / approval tests', 'Golden Master / Approval Tests'), text: l('Keep an approved copy of the output with the test. Write a characterization test before changing legacy code.', 'Speichere die freigegebene Ausgabe zusammen mit dem Test. Schreibe vor einem Refactoring einen Characterization Test.') }],
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
    steps: [l('Write snapshot tests for the code that you will refactor. Use a representative set of inputs.', 'Schreibe vor dem Refactoring Snapshot Tests mit repräsentativen Eingaben.'), l('Refactor the code. Keep the approved snapshots intact.', 'Führe das Refactoring durch. Lass die freigegebenen Snapshots unverändert.'), l('If a snapshot must change, change it in a separate commit. Record the reason.', 'Wenn sich ein Snapshot ändern muss, ändere ihn in einem eigenen Commit. Halte den Grund fest.')],
    done: l('The snapshot files have the same content before and after the refactoring.', 'Die Snapshots enthalten vor und nach dem Refactoring dieselbe Ausgabe.'),
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
    domain: { parts: ['api', 'pet'], what: l('The pet fields that the reservation UI reads must keep their names and types.', 'Der Contract Test prüft Namen und Typen der Felder, die die Reservierungs-UI verwendet.') },
    sim: 'contract',
    name: l('Contract tests', 'Contract-Tests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('A contract test checks that a service and its consumers agree on the format and behavior of the API.', 'Ein Contract Test prüft, ob ein Service und seine Consumer dasselbe Format und dasselbe Verhalten der API erwarten.'),
    catches: l('breaking API changes: renamed field, changed type, removed endpoint, new required parameter', 'Inkompatible API-Änderungen wie umbenannte Felder, andere Typen, entfernte Endpoints und neue Pflichtparameter.'),
    intro: l(
      'A coding agent renames `priceCents` to `price` and updates the web app. The mobile app still uses `priceCents`. A contract test can detect the missing field before release.',
      'Ein Coding-Agent benennt `priceCents` in `price` um und passt die Web-App an. Die Mobile-App erwartet weiter `priceCents`. Ein Contract Test kann das fehlende Feld vor dem Release melden.',
    ),
    cost: 2,
    feedback: 'minutes',
    worth: [
      l('A contract test can detect an incompatible change before two services run together.', 'Ein Contract Test kann eine inkompatible Änderung finden, bevor zwei Services zusammen laufen.'), l('An OpenAPI schema gives a contract for schema-based tests.', 'Ein OpenAPI-Schema liefert einen Contract für Schema Tests.'),
      l('Consumer-driven contracts can show which fields each consumer uses.', 'Consumer-driven Contracts können zeigen, welche Felder jeder Consumer verwendet.'),
    ],
    limits: [
      l('A contract that describes only the message structure can miss errors in business behavior.', 'Ein Contract für die Nachrichtenstruktur kann Fehler im fachlichen Verhalten übersehen.'),
      l('Update the contract when the real interface changes.', 'Aktualisiere den Contract, wenn sich die Schnittstelle ändert.'),
    ],
    ai: l('A coding agent can rename a field and update the consumers that it knows about. Contract tests can detect other consumers that still use the field.', 'Ein Coding-Agent kann ein Feld umbenennen und nur die ihm bekannten Consumer anpassen. Contract Tests können weitere Consumer finden, die das Feld verwenden.'),
    evidence: { general: none(), ai: none() },
    tools: { php: ['pact-php'], js: ['pact', 'zod'], python: ['pact'], java: ['pact'], dotnet: ['pact'], go: ['pact'], rust: ['pact'], any: ['specmatic', 'schemathesis'] },
    snippets: [{ lang: "js", file: "reservation-contract.test.ts",
      description: l("Install Vitest and Zod. Run this consumer schema test. Remove `owner` from the valid payload to make the test fail. Use the same schema for real provider responses. Use an additional test to check the owner value.",
        "Installiere Vitest und Zod. Führe den Test mit dem Consumer-Schema aus. Entferne zum Test `owner` aus dem gültigen Payload. Verwende dasselbe Schema für echte Provider-Antworten. Prüfe die reservierende Person mit einem eigenen Test."),
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
      l('Write the API contract as an OpenAPI schema or as consumer pacts. Commit it.', 'Schreibe den API Contract als OpenAPI-Schema oder Consumer Pacts. Committe den Contract.'), l('Check the provider against the contract in its CI. Check each consumer against the same contract in its CI.', 'Prüfe den Provider in seiner CI gegen den Contract. Prüfe jeden Consumer in seiner CI gegen denselben Contract.'),
      l('Publish the contract where both teams can read it. Make CI fail on an incompatible change.', 'Veröffentliche den Contract für beide Teams. Lass CI bei inkompatiblen Änderungen fehlschlagen.'),
    ],
    done: l('CI fails for the provider if a change removes a field that a consumer uses.', 'Entferne zum Test ein Feld, das ein Consumer verwendet. CI muss beim Provider fehlschlagen.'),
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
    domain: { parts: ['ui'], what: l('A screenshot and an accessibility scan check the pet list.', 'Ein Screenshot-Vergleich und ein Accessibility Check prüfen die Tierliste.') },
    viz: { kind: 'scope', mode: 'ui-ux-tests' },
    name: l('UI/UX tests (visual, accessibility)', 'UI/UX-Tests (visuell, Barrierefreiheit)'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('User interface tests compare screenshots with an approved baseline. Automatic accessibility checks examine the interface against specified rules.', 'UI Tests vergleichen Screenshots mit einer Baseline. Automatische Accessibility Checks prüfen die UI anhand festgelegter Regeln.'),
    catches: l('layout breakage, overlapping elements, missing labels, poor contrast, broken keyboard navigation', 'Überlappende Elemente, fehlende Labels, geringer Kontrast und Fehler bei der Tastaturbedienung.'),
    intro: l(
      'A CSS change puts the reservation button below the footer. Other tests still pass. A screenshot comparison can show the unexpected position.',
      'Eine CSS-Änderung verschiebt den Button unter den Footer. Andere Tests bestehen weiterhin. Ein Screenshot-Vergleich zeigt die neue Position.',
    ),
    cost: 1,
    feedback: 'minutes',
    worth: [
      l('A screenshot comparison can find a layout change that a DOM assertion does not find.', 'Ein Screenshot-Vergleich kann Layoutänderungen zeigen, die eine DOM-Assertion nicht erkennt.'), l('An automatic accessibility check can find some violations of the Web Content Accessibility Guidelines (WCAG).', 'Automatische Accessibility Checks können einige Verstöße gegen WCAG finden.'),
      l('A functional browser test can also check keyboard navigation and focus.', 'Browser-Tests können zusätzlich Tastaturbedienung und Fokus prüfen.'),
    ],
    limits: [l('Automatic checks detect some accessibility problems. Tests with people and assistive technology can detect more.', 'Automatische Checks finden einen Teil der Accessibility-Probleme. Tests mit Personen und Hilfstechnologie können weitere Probleme zeigen.'), l('Fonts and browser rendering can change the screenshots. Use a fixed browser environment.', 'Schriftarten und Browser Rendering können Screenshots verändern. Verwende eine feste Browser-Umgebung.')],
    ai: l('Give the coding agent screenshot comparisons and accessibility findings. These results identify changes that functional tests can miss.', 'Gib dem Coding-Agenten Screenshot-Vergleiche und Accessibility Findings. Sie können Änderungen zeigen, die Functional Tests übersehen.'),
    evidence: { general: none(), ai: none() },
    variants: [{ name: l('Visual regression', 'Visuelle Regression'), text: l('Compare pixels or DOM output with an approved baseline.', 'Vergleiche Pixel oder DOM-Ausgaben mit einer freigegebenen Baseline.') }, { name: l('Accessibility testing', 'Barrierefreiheitstests'), text: l('Run axe-core, Lighthouse or Pa11y in CI. Do manual keyboard and screen-reader checks.', 'Führe axe-core, Lighthouse oder Pa11y in CI aus. Prüfe Tastaturbedienung und Screenreader manuell.') }],
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
    steps: [l('Run an automatic accessibility check on the main pages in CI.', 'Führe einen automatischen Accessibility Check für die Hauptseiten in CI aus.'), l('Compare screenshots for three to five critical screens in a fixed browser environment.', 'Vergleiche Screenshots für drei bis fünf wichtige Ansichten in einer festen Browser-Umgebung.'), l('Do the main user task once with only the keyboard.', 'Führe den Hauptablauf einmal nur mit der Tastatur aus.')],
    done: l('axe reports no violations on the main pages. Screenshot tests pass on the current layout and fail after a test change that breaks it.', 'axe meldet keine Verstöße auf den Hauptseiten. Die Screenshot-Tests bestehen mit dem aktuellen Layout. Eine absichtlich fehlerhafte Layoutänderung lässt einen Test fehlschlagen.'),
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
