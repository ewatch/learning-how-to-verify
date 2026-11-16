# Bahnhof-Bewertungen: drei Testtechniken ohne Bibliotheken

Fachlogik für Bahnhofsbewertungen (1 bis 5 Sterne, Titel, Autor, Beschreibung) mit
Property-Based Testing, Fuzzing und Mutation Testing. Es braucht nur Node.js 22 oder
neuer, kein `npm install`.

| Datei | Inhalt |
|---|---|
| `src/review.mjs` | `validateReview`, `averageStars`, `escapeHtml` |
| `test/review.test.mjs` | Beispieltests mit Grenzwerten |
| `test/property.test.mjs` | Property-Based Testing mit eigenem Zufallsgenerator |
| `test-weak/review.test.mjs` | absichtlich schwache Tests für die Mutation-Demo |
| `fuzz/review.fuzz.mjs` | blinder, mutationsbasierter Fuzzer |
| `fuzz/review-buggy.mjs` | Kopie mit eingebautem Fehler (Kommazahlen als Sterne) |
| `scripts/mutate.mjs` | Mutation Testing mit 11 handgeschriebenen Mutanten |

## Befehle

```bash
npm test              # Beispiel- und Property-Tests
npm run fuzz          # Fuzzer gegen den echten Code: kein Fund
npm run fuzz:buggy    # Fuzzer gegen die fehlerhafte Kopie: findet z. B. 4.54 Sterne
npm run mutate:weak   # schwache Tests: nur 1 von 11 Mutanten erkannt
npm run mutate        # starke Tests: 11 von 11 erkannt
```

Schlägt ein Property-Test fehl, steht der Startwert in der Meldung. Mit
`SEED=<Wert> npm test` lässt sich der Lauf wiederholen.

## Grenzen gegenüber Bibliotheken

- Property-Based Testing: kein Shrinking, das erste Gegenbeispiel wird gemeldet (fast-check verkleinert es).
- Fuzzing: blind, ohne Coverage-Führung (Jazzer.js findet tief verschachtelte Fehler besser).
- Mutation Testing: Mutanten sind von Hand gelistet (Stryker erzeugt Hunderte automatisch).
