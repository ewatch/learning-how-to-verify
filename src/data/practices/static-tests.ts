import type { Practice } from '../types';
import { ev, f, l, none, q } from './_h';

const RUNNERS = { js: ['vitest', 'jest', 'node-test'], python: ['pytest'], java: ['junit', 'kotest'], dotnet: ['xunit', 'nunit'], go: ['go-test'], rust: ['cargo-test'], cpp: ['googletest', 'catch2'] };

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
});` },
      { lang: 'python', file: 'test_fee.py', code: `import pytest
from fee import adoption_fee

def test_base_fee():
    assert adoption_fee(species="dog", age_years=3) == 12000

def test_senior_pets_pay_half():
    assert adoption_fee(species="dog", age_years=8) == 6000

def test_negative_age_is_rejected():
    with pytest.raises(ValueError):
        adoption_fee(species="dog", age_years=-1)` },
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
    ],
    related: ['property-based-tests', 'mutation-tests', 'coverage', 'tdd'],
  },
  {
    id: 'functional-tests',
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
    ],
    limits: [l('Slower and less precise than unit tests when they fail.', 'Langsamer und bei Fehlschlag weniger präzise als Unit-Tests.')],
    ai: l('Black-box tests are good guardrails for agents because they keep passing while the agent restructures the inside, and fail only when behaviour changes.', 'Black-Box-Tests sind gute Leitplanken für Agenten: Sie bleiben grün, während der Agent das Innere umbaut, und scheitern nur, wenn sich das Verhalten ändert.'),
    evidence: { general: ev('weak', f('yuan2014', 'Testing in general: simple tests of error-handling paths would have prevented most catastrophic failures in the systems studied.', 'Testen allgemein: Einfache Tests der Fehlerbehandlung hätten die meisten katastrophalen Ausfälle in den untersuchten Systemen verhindert.')), ai: none() },
    tools: { ...RUNNERS, any: ['schemathesis'] },
    steps: [
      l('For one feature, list its requirements as given/when/then sentences.', 'Für eine Funktion die Anforderungen als Gegeben/Wenn/Dann-Sätze auflisten.'),
      l('Write one test per sentence that uses only the public interface (API, exported function, CLI).', 'Pro Satz einen Test schreiben, der nur die öffentliche Schnittstelle nutzt (API, exportierte Funktion, CLI).'),
    ],
    done: l('Each requirement sentence has a passing test that uses only the public interface.', 'Jeder Anforderungssatz hat einen grünen Test, der nur die öffentliche Schnittstelle nutzt.'),
    think: [q('What is the difference between a functional test and an acceptance test?', 'Was ist der Unterschied zwischen funktionalem Test und Akzeptanztest?',
      'Mostly who signs off. A functional test checks behaviour against the spec; an acceptance test is the one the customer or product owner agreed decides "done".',
      'Vor allem, wer abzeichnet. Ein funktionaler Test prüft Verhalten gegen die Spezifikation; ein Akzeptanztest ist der, von dem Kunde oder Product Owner vereinbart haben, dass er über „fertig“ entscheidet.')],
    related: ['unit-tests', 'acceptance-tests', 'component-tests'],
  },
  {
    id: 'component-tests',
    name: l('Component tests', 'Komponententests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Test one component (a service, a UI component, a module) with its real internals but faked neighbours.', 'Eine Komponente (Dienst, UI-Komponente, Modul) mit echtem Innenleben, aber gefälschten Nachbarn testen.'),
    catches: l('wiring mistakes inside a component: wrong configuration, missing dependency injection, broken rendering', 'Verdrahtungsfehler innerhalb einer Komponente: falsche Konfiguration, fehlende Abhängigkeit, kaputtes Rendering'),
    cost: 1,
    feedback: 'minutes',
    worth: [l('Bigger than a unit, much cheaper than an end-to-end test.', 'Größer als eine Unit, viel billiger als ein End-to-End-Test.'), l('UI component tests can query by role and label, which also checks accessibility basics.', 'UI-Komponententests können nach Rolle und Label suchen und prüfen so auch Grundlagen der Barrierefreiheit.')],
    limits: [l('Fakes can drift from the real neighbours. Back them with contract tests.', 'Fakes können sich von den echten Nachbarn entfernen. Mit Contract-Tests absichern.')],
    ai: l('Agents frequently break wiring (a forgotten provider, a renamed prop). Component tests catch that faster than end-to-end tests.', 'Agenten zerbrechen oft die Verdrahtung (vergessener Provider, umbenannte Prop). Komponententests fangen das schneller als End-to-End-Tests.'),
    evidence: { general: none(), ai: none() },
    tools: { js: ['testing-library', 'storybook', 'vitest'], python: ['pytest'], java: ['junit', 'testcontainers'], dotnet: ['xunit', 'testcontainers'], go: ['go-test', 'testcontainers'] },
    steps: [l('Choose a component and fake only what crosses its boundary (HTTP, database, clock).', 'Eine Komponente wählen und nur fälschen, was ihre Grenze überquert (HTTP, Datenbank, Uhr).'), l('Test its behaviour through its own interface, e.g. render the UI component and interact by role.', 'Ihr Verhalten über ihre eigene Schnittstelle testen, z. B. die UI-Komponente rendern und über Rollen interagieren.')],
    done: l('The component\'s main behaviours are tested with fakes only at its boundary.', 'Die wichtigsten Verhaltensweisen der Komponente sind getestet, mit Fakes nur an ihrer Grenze.'),
    think: [q('Why query a button by its accessible name rather than by a CSS class?', 'Warum einen Button über seinen zugänglichen Namen statt über eine CSS-Klasse suchen?', 'Users and screen readers find it by name, not by class. The test then fails when the button becomes unusable, not when someone renames a class.', 'Nutzer und Screenreader finden ihn über den Namen, nicht über die Klasse. Der Test scheitert dann, wenn der Button unbenutzbar wird, nicht wenn jemand eine Klasse umbenennt.')],
    related: ['unit-tests', 'integration-tests', 'contract-tests', 'ui-ux-tests'],
  },
  {
    id: 'integration-tests',
    name: l('Integration tests', 'Integrationstests'),
    layer: 'static',
    phases: ['deploy'],
    fromOverview: true,
    oneLiner: l('Check that components work together with their real dependencies: database, queue, other services.', 'Prüfen, dass Komponenten mit ihren echten Abhängigkeiten zusammenarbeiten: Datenbank, Queue, andere Dienste.'),
    catches: l('mismatched assumptions between parts: SQL that the real database rejects, wrong serialization, transactions that do not isolate', 'unpassende Annahmen zwischen Teilen: SQL, das die echte Datenbank ablehnt, falsche Serialisierung, Transaktionen, die nicht isolieren'),
    cost: 2,
    feedback: 'minutes',
    worth: [l('Finds bugs that no amount of mocking can, because mocks share your assumptions.', 'Findet Fehler, die kein Mocking findet, weil Mocks die eigenen Annahmen teilen.'), l('Testcontainers make real dependencies cheap to start in CI.', 'Testcontainers machen echte Abhängigkeiten in der CI billig startbar.')],
    limits: [l('Slower and flakier than unit tests; keep them few and focused on boundaries.', 'Langsamer und wackeliger als Unit-Tests; wenige, auf Grenzen fokussierte.')],
    ai: l('Agents write mocks that agree with their own code. An integration test against the real database is an oracle the agent cannot bend.', 'Agenten schreiben Mocks, die ihrem eigenen Code zustimmen. Ein Integrationstest gegen die echte Datenbank ist ein Orakel, das der Agent nicht verbiegen kann.'),
    evidence: { general: none(), ai: none() },
    tools: { js: ['testcontainers', 'vitest'], python: ['testcontainers', 'pytest'], java: ['testcontainers', 'junit'], dotnet: ['testcontainers', 'xunit'], go: ['testcontainers', 'go-test'], rust: ['testcontainers', 'cargo-test'] },
    steps: [l('Start the real dependency (e.g. Postgres) in a container per test run.', 'Die echte Abhängigkeit (z. B. Postgres) pro Testlauf in einem Container starten.'), l('Test the boundary code (repository, client) against it, including a concurrent case: two reservations of the same pet at once.', 'Den Grenzcode (Repository, Client) dagegen testen, inklusive eines nebenläufigen Falls: zwei gleichzeitige Reservierungen desselben Tiers.')],
    done: l('Integration tests run in CI against real containers, including one concurrency test.', 'Integrationstests laufen in der CI gegen echte Container, inklusive eines Nebenläufigkeitstests.'),
    think: [q('Your mock repository makes the double-booking test pass. Why might production still double-book?', 'Dein Mock-Repository lässt den Doppelbuchungstest bestehen. Warum könnte die Produktion trotzdem doppelt buchen?', 'The mock runs one call at a time. The real database runs two transactions in parallel; without a unique constraint or row lock both can read "available" and both write.', 'Der Mock verarbeitet einen Aufruf nach dem anderen. Die echte Datenbank führt zwei Transaktionen parallel aus; ohne Unique-Constraint oder Zeilensperre lesen beide „frei“ und schreiben beide.')],
    related: ['component-tests', 'contract-tests', 'e2e-tests', 'formal-verification'],
  },
  {
    id: 'e2e-tests',
    name: l('End-to-end tests', 'End-to-End-Tests'),
    layer: 'static',
    phases: ['pre', 'deploy'],
    fromOverview: false,
    oneLiner: l('Drive the whole system through its real UI or API, like a user, and check the outcome.', 'Das ganze System über seine echte Oberfläche oder API steuern, wie ein Nutzer, und das Ergebnis prüfen.'),
    catches: l('pieces that each work but do not connect: a button wired to the wrong endpoint, a missing migration, broken routing', 'Teile, die einzeln funktionieren, aber nicht zusammenpassen: Button am falschen Endpunkt, fehlende Migration, kaputtes Routing'),
    cost: 2,
    feedback: 'minutes',
    worth: [l('The only test that sees what the user sees.', 'Der einzige Test, der sieht, was der Nutzer sieht.'), l('A handful of critical journeys (search, reserve, pay) gives a lot of confidence.', 'Eine Handvoll kritischer Abläufe (suchen, reservieren, bezahlen) gibt viel Sicherheit.')],
    limits: [l('Slow, brittle and imprecise; keep the number small and push detail down to cheaper tests.', 'Langsam, brüchig und unpräzise; wenige halten und Details in billigere Tests verlagern.')],
    ai: l('Agents can make every unit test pass while the assembled app is broken. One end-to-end run of the main journey catches that, and Playwright traces give the agent a readable failure.', 'Agenten können jeden Unit-Test grün machen, während die zusammengesetzte App kaputt ist. Ein End-to-End-Lauf des Hauptablaufs fängt das, und Playwright-Traces geben dem Agenten einen lesbaren Fehler.'),
    evidence: { general: none(), ai: ev('moderate', f('metr2026', 'Maintainers would merge only about half of 296 agent PRs that passed the automated tests, a reminder that unit-level green is not the same as working.', 'Maintainer würden nur etwa die Hälfte von 296 Agenten-PRs mergen, die die automatischen Tests bestanden: Grün auf Unit-Ebene ist nicht dasselbe wie funktionierend.')) },
    tools: { js: ['playwright', 'cypress'], python: ['playwright'], java: ['playwright'], dotnet: ['playwright'] },
    snippets: [{ lang: 'js', file: 'reserve.spec.ts', code: `import { test, expect } from '@playwright/test';

test('a visitor can reserve a pet, and it disappears from the list', async ({ page }) => {
  await page.goto('/pets');
  await page.getByRole('button', { name: 'Reserve Rex' }).click();
  await page.getByLabel('Your name').fill('Anna');
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('Rex is reserved for you')).toBeVisible();
  await page.goto('/pets');
  await expect(page.getByRole('button', { name: 'Reserve Rex' })).toHaveCount(0);
});` }],
    steps: [l('Pick the 3–5 user journeys that must never break.', 'Die 3–5 Nutzerabläufe wählen, die nie brechen dürfen.'), l('Write one end-to-end test per journey using role/label selectors, against a freshly seeded environment.', 'Pro Ablauf einen End-to-End-Test mit Rollen-/Label-Selektoren schreiben, gegen eine frisch befüllte Umgebung.'), l('Record traces on failure and run the suite in CI.', 'Bei Fehlschlag Traces aufzeichnen und die Suite in der CI ausführen.')],
    done: l('The critical journeys pass end-to-end in CI, and a deliberately broken route makes one fail with a trace.', 'Die kritischen Abläufe laufen End-to-End in der CI, und eine absichtlich kaputte Route lässt einen mit Trace scheitern.'),
    think: [q('Why not test every edge case end-to-end?', 'Warum nicht jeden Randfall End-to-End testen?', 'Each E2E test costs seconds to minutes and fails for many unrelated reasons. Edge cases belong in unit and property tests; E2E proves the wiring.', 'Jeder E2E-Test kostet Sekunden bis Minuten und scheitert aus vielen fremden Gründen. Randfälle gehören in Unit- und Property-Tests; E2E beweist die Verdrahtung.')],
    related: ['integration-tests', 'smoke-tests', 'acceptance-tests', 'ui-ux-tests'],
  },
  {
    id: 'acceptance-tests',
    name: l('Acceptance tests', 'Akzeptanztests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Tests the customer or product owner agreed on: if they pass, the feature is done.', 'Tests, auf die sich Kunde oder Product Owner geeinigt haben: Bestehen sie, ist die Funktion fertig.'),
    catches: l('misunderstood requirements, and "done" that is not done', 'missverstandene Anforderungen und „fertig“, das nicht fertig ist'),
    cost: 2,
    feedback: 'minutes',
    worth: [l('Written in domain language (Gherkin or plain tests), readable by non-developers.', 'In Fachsprache geschrieben (Gherkin oder einfache Tests), auch für Nicht-Entwickler lesbar.'), l('A natural contract between the person asking and the one (or the agent) building.', 'Ein natürlicher Vertrag zwischen Auftraggeber und dem, der baut, ob Mensch oder Agent.')],
    limits: [l('Gherkin layers can become a maintenance burden; plain tests with good names often suffice.', 'Gherkin-Schichten können zur Wartungslast werden; einfache Tests mit guten Namen genügen oft.')],
    ai: l('Acceptance tests are the natural "spec" to hand an agent. SWE-bench\'s fail-to-pass tests are exactly this. Keep them human-approved and protected.', 'Akzeptanztests sind die natürliche „Spezifikation“ für einen Agenten. Die Fail-to-Pass-Tests von SWE-bench sind genau das. Von Menschen freigegeben und geschützt halten.'),
    evidence: { general: none(), ai: ev('moderate', f('patchdiff2026', '29.6% of agent patches that passed SWE-bench\'s acceptance tests behaved differently from the reference fix: acceptance tests are necessary, not sufficient.', '29,6 % der Agenten-Patches, die die Akzeptanztests von SWE-bench bestanden, verhielten sich anders als die Referenzlösung: Akzeptanztests sind notwendig, nicht hinreichend.')) },
    tools: { js: ['cucumber', 'playwright'], python: ['behave', 'pytest'], java: ['cucumber'], dotnet: ['reqnroll'], go: ['cucumber'] },
    snippets: [{ lang: 'any', file: 'reserve.feature', code: `Feature: Reserving a pet for adoption
  Scenario: A pet cannot be reserved twice
    Given Rex is available
    And Anna has reserved Rex
    When Ben tries to reserve Rex
    Then Ben is told that Rex is already reserved
    And Rex is still reserved for Anna` }],
    steps: [l('Write acceptance criteria for the next feature with the person who asked for it.', 'Akzeptanzkriterien für die nächste Funktion mit der Person schreiben, die sie wollte.'), l('Turn each criterion into an executable test before implementation and protect the files.', 'Jedes Kriterium vor der Implementierung in einen ausführbaren Test verwandeln und die Dateien schützen.')],
    done: l('Each acceptance criterion has an executable test, approved by the requester, and all pass.', 'Jedes Akzeptanzkriterium hat einen ausführbaren, vom Auftraggeber freigegebenen Test, und alle sind grün.'),
    think: [q('All acceptance tests pass. Why might the feature still be wrong?', 'Alle Akzeptanztests sind grün. Warum könnte die Funktion trotzdem falsch sein?', 'The tests cover the scenarios people thought of. Everything else (other inputs, concurrency, performance) is unchecked, which is why the funnel has more layers.', 'Die Tests decken die Szenarien ab, an die gedacht wurde. Alles andere (andere Eingaben, Nebenläufigkeit, Performance) ist ungeprüft; deshalb hat der Trichter mehr Schichten.')],
    related: ['tdd', 'functional-tests', 'e2e-tests'],
  },
  {
    id: 'regression-tests',
    name: l('Regression tests', 'Regressionstests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Every bug that was fixed gets a test, so it can never come back unnoticed.', 'Jeder behobene Fehler bekommt einen Test, damit er nie unbemerkt zurückkommt.'),
    catches: l('old bugs reintroduced by new changes', 'alte Fehler, die durch neue Änderungen zurückkehren'),
    cost: 1,
    feedback: 'minutes',
    worth: [l('Bugs cluster; a regression test guards a place that has already proven fragile.', 'Fehler häufen sich; ein Regressionstest bewacht eine Stelle, die sich schon als zerbrechlich erwiesen hat.'), l('The failing test written before the fix also proves the fix works.', 'Der vor der Behebung geschriebene fehlschlagende Test beweist auch, dass die Behebung wirkt.')],
    limits: [l('Large regression suites need test selection to stay fast.', 'Große Regressionssuiten brauchen Testauswahl, um schnell zu bleiben.')],
    ai: l('Ask the agent to write the failing test first and show it failing, then fix. That proves it understood the bug, not just changed something until the symptom went away.', 'Den Agenten zuerst den fehlschlagenden Test schreiben und scheitern lassen, dann beheben. Das beweist, dass er den Fehler verstanden und nicht nur geändert hat, bis das Symptom verschwand.'),
    evidence: { general: ev('weak', f('memon2017', 'In Google\'s CI only a tiny share of tests ever fail, and failures cluster near recently changed code, which motivates test selection.', 'In Googles CI schlägt nur ein winziger Teil der Tests je fehl, und Fehlschläge häufen sich nahe kürzlich geändertem Code; das motiviert Testauswahl.')), ai: none() },
    tools: RUNNERS,
    steps: [l('Reproduce the bug as a failing test and commit it.', 'Den Fehler als fehlschlagenden Test reproduzieren und committen.'), l('Fix the code until the test passes, without changing the test.', 'Den Code reparieren, bis der Test grün ist, ohne den Test zu ändern.'), l('Reference the issue in the test name.', 'Das Issue im Testnamen referenzieren.')],
    done: l('The test fails on the commit before the fix and passes after it.', 'Der Test scheitert auf dem Commit vor der Behebung und ist danach grün.'),
    think: [q('How do you know a regression test really tests the bug?', 'Woher weiß man, dass ein Regressionstest wirklich den Fehler testet?', 'Run it against the old code. If it passes there too, it tests something else.', 'Ihn gegen den alten Code laufen lassen. Ist er dort auch grün, testet er etwas anderes.')],
    related: ['unit-tests', 'snapshot-tests', 'ci'],
  },
  {
    id: 'smoke-tests',
    name: l('Smoke tests', 'Smoke-Tests'),
    layer: 'static',
    phases: ['pre', 'deploy'],
    fromOverview: true,
    oneLiner: l('A few quick checks that the system starts and its most basic functions respond, right after a build or deploy.', 'Wenige schnelle Prüfungen direkt nach Build oder Deploy, dass das System startet und die grundlegendsten Funktionen antworten.'),
    catches: l('dead-on-arrival builds: missing config, crash at startup, broken health endpoint', 'tot ausgelieferte Builds: fehlende Konfiguration, Absturz beim Start, kaputter Health-Endpunkt'),
    cost: 1,
    feedback: 'seconds',
    worth: [l('Seconds to run; stops the obviously broken release before anyone else is affected.', 'Sekunden Laufzeit; stoppt das offensichtlich kaputte Release, bevor jemand betroffen ist.'), l('Ideal gate before canarying.', 'Ideales Gate vor dem Canary.')],
    limits: [l('Proves only that it is alive, not that it is right.', 'Beweist nur, dass es lebt, nicht dass es stimmt.')],
    ai: l('Cheap insurance against an agent change that breaks startup (a renamed env variable, a missing import).', 'Billige Versicherung gegen eine Agentenänderung, die den Start zerbricht (umbenannte Umgebungsvariable, fehlender Import).'),
    evidence: { general: none(), ai: none() },
    tools: { js: ['playwright', 'vitest'], any: ['k6', 'hyperfine'] },
    snippets: [{ lang: 'any', file: 'smoke.sh', code: `#!/usr/bin/env sh
set -e
curl -fsS "$BASE_URL/health"                 # service is up
curl -fsS "$BASE_URL/api/pets?limit=1" | grep -q '"id"'   # can read data` }],
    steps: [l('Write 3–5 checks: health endpoint, one read, one page load.', '3–5 Prüfungen schreiben: Health-Endpunkt, ein Lesezugriff, ein Seitenaufruf.'), l('Run them after every deploy and block further rollout on failure.', 'Nach jedem Deploy ausführen und den weiteren Rollout bei Fehlschlag stoppen.')],
    done: l('Smoke checks run automatically after deploy, take under a minute, and block rollout on failure.', 'Smoke-Prüfungen laufen automatisch nach dem Deploy, dauern unter einer Minute und stoppen bei Fehlschlag den Rollout.'),
    think: [q('Where does the name come from?', 'Woher kommt der Name?', 'From hardware: switch it on and see whether smoke comes out. If it does, no further testing is needed.', 'Aus der Hardware: Einschalten und schauen, ob Rauch aufsteigt. Wenn ja, erübrigt sich jeder weitere Test.')],
    related: ['e2e-tests', 'canarying', 'ci'],
  },
  {
    id: 'snapshot-tests',
    name: l('Snapshot & characterization tests', 'Snapshot- & Charakterisierungstests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: false,
    oneLiner: l('Record the current output once, then fail whenever it changes, so changes have to be approved.', 'Die aktuelle Ausgabe einmal aufzeichnen und bei jeder Änderung scheitern, damit Änderungen freigegeben werden müssen.'),
    catches: l('unintended changes in output: a rendered page, a JSON response, an invoice text, behaviour of legacy code during a rewrite', 'ungewollte Änderungen der Ausgabe: gerenderte Seite, JSON-Antwort, Rechnungstext, Verhalten von Altcode bei einer Neufassung'),
    cost: 1,
    feedback: 'seconds',
    worth: [l('Pins legacy behaviour before refactoring, even when nobody knows what the correct behaviour is.', 'Hält das Verhalten von Altcode vor einem Refactoring fest, auch wenn niemand weiß, was korrekt ist.'), l('Very cheap to write for large outputs.', 'Sehr billig für große Ausgaben.')],
    limits: [l('Blindly re-approving snapshots turns them into noise.', 'Snapshots blind neu freizugeben macht sie zu Rauschen.'), l('Tells you that something changed, not whether the change is right.', 'Sagt, dass sich etwas geändert hat, nicht ob die Änderung richtig ist.')],
    ai: l('Excellent guard for agent refactorings ("behaviour must not change"). Forbid the agent from updating snapshots in the same change; a snapshot update should be a separate, reviewed step.', 'Ausgezeichneter Schutz bei Agenten-Refactorings („Verhalten darf sich nicht ändern“). Dem Agenten verbieten, Snapshots in derselben Änderung zu aktualisieren; ein Snapshot-Update sollte ein eigener, reviewter Schritt sein.'),
    evidence: { general: none(), ai: none() },
    variants: [{ name: l('Golden master / approval tests', 'Golden Master / Approval Tests'), text: l('Same idea with a human-approved file next to the test. Characterization tests are snapshots taken deliberately before changing legacy code.', 'Dieselbe Idee mit einer von Menschen freigegebenen Datei neben dem Test. Charakterisierungstests sind Snapshots, die man bewusst vor Änderungen an Altcode aufnimmt.') }],
    tools: { js: ['vitest', 'jest'], python: ['syrupy', 'approvaltests'], java: ['approvaltests'], dotnet: ['verify', 'approvaltests'], rust: ['insta'], cpp: ['approvaltests'] },
    snippets: [{ lang: 'js', file: 'invoice.test.ts', code: `it('renders the adoption invoice exactly as before', () => {
  expect(renderInvoice(sampleAdoption)).toMatchSnapshot();
});
// Update only deliberately:  npx vitest -u   (and review the diff)` }],
    steps: [l('Before refactoring, write snapshot tests over a representative set of inputs for the code you will change.', 'Vor dem Refactoring Snapshot-Tests über eine repräsentative Menge Eingaben für den betroffenen Code schreiben.'), l('Refactor; the snapshots must stay unchanged.', 'Refaktorieren; die Snapshots müssen unverändert bleiben.'), l('If a snapshot must change, do it in a separate commit and explain why.', 'Muss sich ein Snapshot ändern, in einem eigenen Commit mit Begründung.')],
    done: l('Snapshot files are unchanged by the refactoring commit(s).', 'Die Snapshot-Dateien sind durch die Refactoring-Commits unverändert.'),
    think: [q('A snapshot test fails after a change. What two very different things can that mean?', 'Ein Snapshot-Test scheitert nach einer Änderung. Welche zwei sehr verschiedenen Dinge kann das bedeuten?', 'Either you broke something, or you improved something on purpose. The test cannot tell; a human has to look at the diff.', 'Entweder man hat etwas kaputt gemacht oder absichtlich verbessert. Der Test kann das nicht unterscheiden; ein Mensch muss den Diff ansehen.')],
    related: ['refactoring', 'regression-tests', 'differential-testing', 'ui-ux-tests'],
  },
  {
    id: 'contract-tests',
    name: l('Contract tests', 'Contract-Tests'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Check that a service and its consumers agree on the API, without running both together.', 'Prüfen, dass ein Dienst und seine Konsumenten sich über die API einig sind, ohne beide zusammen laufen zu lassen.'),
    catches: l('breaking API changes: renamed field, changed type, removed endpoint, new required parameter', 'brechende API-Änderungen: umbenanntes Feld, geänderter Typ, entfernter Endpunkt, neuer Pflichtparameter'),
    cost: 2,
    feedback: 'minutes',
    worth: [l('Catches integration breakage early and cheaply, without a shared test environment.', 'Fängt Integrationsbrüche früh und billig, ohne gemeinsame Testumgebung.'), l('An OpenAPI schema plus schema-based testing is a light first step.', 'Ein OpenAPI-Schema plus schemabasiertes Testen ist ein leichter erster Schritt.')],
    limits: [l('Checks the shape of messages, not the business meaning.', 'Prüft die Form der Nachrichten, nicht ihre fachliche Bedeutung.')],
    ai: l('Agents rename fields happily ("priceCents" → "price") and update the callers they can see. Contract tests catch the callers they cannot see.', 'Agenten benennen Felder gern um („priceCents“ → „price“) und passen die Aufrufer an, die sie sehen. Contract-Tests fangen die, die sie nicht sehen.'),
    evidence: { general: none(), ai: none() },
    tools: { js: ['pact', 'zod'], python: ['pact'], java: ['pact'], dotnet: ['pact'], go: ['pact'], rust: ['pact'], any: ['specmatic', 'schemathesis'] },
    steps: [l('Write the API contract (OpenAPI schema or consumer pacts) and commit it.', 'Den API-Vertrag (OpenAPI-Schema oder Consumer-Pacts) schreiben und committen.'), l('Verify the provider against the contract in its CI; verify consumers against it in theirs.', 'Den Anbieter in seiner CI gegen den Vertrag prüfen, die Konsumenten in ihrer.')],
    done: l('Removing a field the consumer uses makes the provider\'s CI fail.', 'Entfernt man ein vom Konsumenten genutztes Feld, scheitert die CI des Anbieters.'),
    think: [q('Why not just run both services and test them together?', 'Warum nicht einfach beide Dienste laufen lassen und zusammen testen?', 'You can, but it is slow, needs a shared environment and fails for many reasons. A contract test checks just the agreement, in seconds, in each team\'s own pipeline.', 'Kann man, aber es ist langsam, braucht eine gemeinsame Umgebung und scheitert aus vielen Gründen. Ein Contract-Test prüft nur die Vereinbarung, in Sekunden, in der eigenen Pipeline jedes Teams.')],
    related: ['integration-tests', 'component-tests', 'architecture'],
  },
  {
    id: 'ui-ux-tests',
    name: l('UI/UX tests (visual, accessibility)', 'UI/UX-Tests (visuell, Barrierefreiheit)'),
    layer: 'static',
    phases: ['pre'],
    fromOverview: true,
    oneLiner: l('Automatically check how the interface looks and whether everyone can use it: screenshots against a baseline, accessibility rules.', 'Automatisch prüfen, wie die Oberfläche aussieht und ob alle sie nutzen können: Screenshots gegen eine Baseline, Barrierefreiheitsregeln.'),
    catches: l('layout breakage, overlapping elements, missing labels, poor contrast, broken keyboard navigation', 'zerbrochenes Layout, überlappende Elemente, fehlende Labels, schlechter Kontrast, kaputte Tastaturnavigation'),
    cost: 1,
    feedback: 'minutes',
    worth: [l('Visual diffs catch what DOM assertions miss.', 'Visuelle Diffs fangen, was DOM-Assertions übersehen.'), l('Automated accessibility checks are cheap and catch a meaningful share of WCAG problems.', 'Automatische Barrierefreiheitsprüfungen sind billig und fangen einen relevanten Teil der WCAG-Probleme.')],
    limits: [l('Automated a11y tools find only part of the problems; real users with assistive technology find the rest.', 'Automatische A11y-Werkzeuge finden nur einen Teil der Probleme; echte Nutzer mit Hilfstechnik finden den Rest.'), l('Screenshot baselines are sensitive to fonts and rendering; run them in a fixed container.', 'Screenshot-Baselines reagieren auf Schriften und Rendering; in einem festen Container ausführen.')],
    ai: l('An agent cannot see the UI it changes unless you give it screenshots. Visual diffs and axe reports turn "looks broken" into a signal it can read.', 'Ein Agent sieht die Oberfläche nicht, die er ändert, außer man gibt ihm Screenshots. Visuelle Diffs und axe-Berichte machen aus „sieht kaputt aus“ ein Signal, das er lesen kann.'),
    evidence: { general: none(), ai: none() },
    variants: [{ name: l('Visual regression', 'Visuelle Regression'), text: l('Pixel or DOM comparison against an approved baseline.', 'Pixel- oder DOM-Vergleich gegen eine freigegebene Baseline.') }, { name: l('Accessibility testing', 'Barrierefreiheitstests'), text: l('axe-core, Lighthouse or Pa11y in CI, plus manual keyboard and screen-reader checks.', 'axe-core, Lighthouse oder Pa11y in der CI, plus manuelle Tastatur- und Screenreader-Prüfung.') }],
    tools: { js: ['playwright', 'axe-core', 'storybook'], python: ['playwright'], any: ['lighthouse', 'pa11y', 'backstopjs'] },
    snippets: [{ lang: 'js', file: 'pets.a11y.spec.ts', code: `import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('pet list has no detectable accessibility violations', async ({ page }) => {
  await page.goto('/pets');
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations).toEqual([]);
  await expect(page).toHaveScreenshot('pets.png', { maxDiffPixelRatio: 0.01 });
});` }],
    steps: [l('Add an automated accessibility scan for the main pages to CI.', 'Einen automatischen Barrierefreiheits-Scan der Hauptseiten in die CI aufnehmen.'), l('Add screenshot comparisons for 3–5 key screens in a fixed browser container.', 'Screenshot-Vergleiche für 3–5 Schlüsselansichten in einem festen Browser-Container ergänzen.'), l('Check keyboard-only navigation of the main journey by hand once.', 'Die Tastaturbedienung des Hauptablaufs einmal von Hand prüfen.')],
    done: l('No axe violations on main pages; screenshot tests pass and fail on a deliberate layout break.', 'Keine axe-Verstöße auf den Hauptseiten; Screenshot-Tests sind grün und scheitern bei einem absichtlichen Layoutbruch.'),
    think: [q('Automated tools report zero accessibility violations. Is the page accessible?', 'Automatische Werkzeuge melden null Barrierefreiheitsverstöße. Ist die Seite barrierefrei?', 'Not necessarily. Tools check rules like labels and contrast; they cannot judge whether the reading order makes sense or whether a screen-reader user can finish the task.', 'Nicht unbedingt. Werkzeuge prüfen Regeln wie Labels und Kontrast; ob die Lesereihenfolge Sinn ergibt oder ein Screenreader-Nutzer die Aufgabe schafft, können sie nicht beurteilen.')],
    related: ['usability-tests', 'e2e-tests', 'snapshot-tests', 'component-tests'],
  },
];
