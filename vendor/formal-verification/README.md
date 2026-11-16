<img src="assets/icon.svg" width="64" height="64" alt="">

# Formal Verification

Created in [T3 Code](https://t3.codes).

## Interaktive Demos

Eigenständige HTML-Seiten (ohne Abhängigkeiten). Einfach im Browser öffnen:

| Datei | Inhalt |
|---|---|
| [`demos/index.html`](demos/index.html) | Übersicht, Animation des Eingaberaums, Vergleichstabelle |
| [`demos/verifikation.html`](demos/verifikation.html) | Formale Verifikation: wp-Kalkül mit Mini-Solver, Dafny-Schleifeninvarianten (4 Beweisverpflichtungen), Model Checking einer Race Condition, TLA+ an Alltagsbeispielen (Konto, Überweisung, Aufzug, Deadlock) mit TLC-artigem Checker, Lean-4-Beweise Schritt für Schritt |
| [`demos/mutation-testing.html`](demos/mutation-testing.html) | Mutation Testing: echte Mutanten, die gegen eine Testsuite laufen, mit Coverage vs. Mutation Score, Grenzwerten, Seiteneffekten, äquivalenten Mutanten und Timeouts |
| [`demos/property-based-testing.html`](demos/property-based-testing.html) | Property-Based Testing: Generatoren, Live-Prüfung, Shrinking zum minimalen Gegenbeispiel, Statistik, Seeds |
| [`demos/fuzzing.html`](demos/fuzzing.html) | Fuzzing: blinder vs. Coverage-geführter Fuzzer im Wettlauf, Korpus, Wörterbuch, Speicherlimit, Crash-Minimierung |
| [`demos/differential-testing.html`](demos/differential-testing.html) | Differential Testing: URL-Validator vs. WHATWG-Parser (SSRF), Refactoring alt vs. neu, Reduktion und Gruppierung von Abweichungen |

Code und Tests sind in den Demos editierbar und werden direkt im Browser ausgeführt. Jeder Bereich endet mit „Wozu ist das gut?“: Einsatzgebiete, Möglichkeiten, Grenzen und Werkzeuge.

## Pet Store: alle Praktiken an einer Anwendung

[`petstore/`](petstore/) wendet alle Praktiken auf eine kleine Anwendung an: Frontend mit React und MUI, Fachlogik und eine REST-API nach dem Swagger Petstore. Im Unterschied zu den Demos braucht sie `npm install`. Siehe [`petstore/README.md`](petstore/README.md).
