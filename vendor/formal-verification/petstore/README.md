# Pet Store: alle Praktiken an einer Anwendung

Eine kleine Tierhandlung mit React und [MUI](https://mui.com), einer Fachlogik-Schicht
und einer REST-API nach dem Vorbild des [Swagger Petstore](https://petstore3.swagger.io).
Die Seiten unter `demos/` erklären die Techniken an Spielzeugbeispielen. Hier wirken
sie zusammen an einem System, in dem sie sich gegenseitig ergänzen.

```
React + MUI (src/ui)
      │
Fachlogik (src/domain)      pricing, allocate, search, checkout
      │
Client (src/api)            Typen aus openapi.yaml, Antworten mit zod geprüft
      │  REST
Server (server/)            Hono, Daten im Speicher
```

## Starten

```bash
npm install
npm run dev                  # http://localhost:5173
npm test                     # alle Tests
npm run showcase             # jede Praktik findet "ihren" Bug
```

Dafny, TLC und eine JRE installiert `scripts/setup-verifiers.sh` beim ersten Aufruf
nach `.tools/` (x86-64-Linux, nichts Systemweites). Ein vollständiges `npm run showcase`
dauert einige Minuten. Einzelne Schritte: `npm run showcase -- pbt fuzz tla`.

## Wo steckt die Schwierigkeit?

- **Rabatt verteilen:** Die API kennt pro Bestellung nur ein Tier. Ein Warenkorb wird
  zu mehreren Bestellungen, deren Preise exakt den Gesamtpreis ergeben müssen.
- **Saga:** Ist das dritte Tier schon vergeben, müssen die ersten zwei wieder frei werden.
- **Doppelverkauf:** Das Original-Petstore prüft bei `POST /store/order` nichts. Wer
  erst liest und dann bestellt, kann dasselbe Tier zweimal verkaufen. Der lokale Server
  antwortet deshalb mit `409`.
- **Suchsprache:** `wohnung -category:fische price<50` steht auch in geteilten Links,
  die Eingabe ist also nicht vertrauenswürdig.

## Praktiken

| Praktik | Sichert | Showcase-Fund | Befehl |
|---|---|---|---|
| Property-Based Testing ([`test/property/`](test/property/)) | Preis-Invarianten, `parse(print(q)) = q`, Server gegen Modell, Verschränkungen echter Checkouts | 1 Cent auf `[1,1]` verteilt, 0 Cent kommen an | `npm run test:property` |
| Mutation Testing ([`stryker.config.json`](stryker.config.json)) | die Tests selbst | volle Zeilenabdeckung, trotzdem überleben Mutanten | `npm run test:mutation` |
| Fuzzing ([`fuzz/`](fuzz/)) | Suchparser gegen beliebige Bytes | `"%"` wirft `URIError`, wenn die Fehlerbehandlung fehlt | `npm run fuzz` |
| Differential Testing ([`test/differential/`](test/differential/)) | Refactoring alt gegen neu, Dafny gegen TypeScript | bei 111,11 € und `TIER10`: alt 104,99 €, neu 100,00 € | `npm run test:differential` |
| Formaler Beweis ([`Allocate.dfy`](verification/dafny/Allocate.dfy)) | Rabattverteilung für alle Eingaben | die naive Fassung ist nicht beweisbar | `npm run verify:dafny` |
| Model Checking ([`Reservation.tla`](verification/tla/Reservation.tla)) | Bestellprotokoll in allen Verschränkungen | Doppelverkauf in 7, liegengebliebene Reservierung in 5 Schritten | `npm run verify:tla` |

`npm run test:differential:live` vergleicht die lokale API mit dem öffentlichen Swagger
Petstore, nur mit lesenden Anfragen. Die Statuscodes stimmen überein. Das Antwortformat
weicht gewollt ab (`priceCents`, JSON-Fehler bei 404, Inventar nach Tierstatus).

## Wie die Praktiken ineinandergreifen

- **Beweis und Code:** Dafny beweist sein eigenes Programm, nicht `allocate.ts`. Die
  Brücke ist der Differenztest gegen den aus `Allocate.dfy` erzeugten Code. Er ist eine
  Stichprobe, kein Beweis.
- **Modell und Code:** TLC prüft zwei Käufer mit zwei Tieren vollständig, aber nur das
  Modell. `test/race.ts` prüft dieselben Invarianten am echten Code, mit zufälligen
  Verschränkungen.
- **Tests und Mutanten:** Mutation Testing prüft alles andere. Beim Bau dieses Projekts
  hat es echte Lücken gezeigt, zum Beispiel keinen positiven Test für UND in der Suche
  und einen Tiefenzähler, der ungeprüft blieb.

## Grenzen

- Der Beweis deckt nur die Rabattverteilung ab, nicht `priceCart` als Ganzes.
- Das TLA+-Modell kennt weder Netzausfälle noch abstürzende Clients. Stürzt ein Client
  mitten in der Saga ab, bleibt die Reservierung liegen. Ein echtes System bräuchte
  Reservierungen mit Ablaufzeit.
- Gutscheine prüft nur der Client, und `priceCents` einer Bestellung wird dem Client
  geglaubt. Eine echte Kasse müsste beides auf dem Server rechnen.
- Daten liegen im Speicher und sind nach einem Neustart zurückgesetzt.
