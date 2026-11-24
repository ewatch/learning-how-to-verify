export const EXERCISE_DE = {
  invariant: {
    intro: "Dafny braucht ein Loop Invariant. Es muss vor und nach jeder Iteration gelten. Daraus entstehen vier Proof Obligations. Nach der Schleife verwendet Dafny das Loop Invariant. Diese Übung prüft kleine Arrays. Dafny prüft alle zulässigen Arrays symbolisch.",
    note: 'Die Übung prüft Arrays der Länge 1 bis 4 mit Werten von −2 bis 2. Dafny führt einen symbolischen Beweis für alle zulässigen Arrays aus.',
  },
  formal: {
    intro: "Mehrere Personen versuchen gleichzeitig, Rex zu reservieren. Wähle eine Implementierung. Der Model Checker prüft jede mögliche Reihenfolge im Modell.",
  },
  integrity: {
    intro: "Ein Coding-Agent schlägt fünf Änderungen für einen fehlschlagenden Test vor. Aktiviere die Checks einzeln. Prüfe, welche Änderungen jeder Check erkennt. Vergleiche die Ergebnisse mit den Holdout-Tests.",
  },
  fuzz: {
    intro: "Zwei Fuzzer erzeugen Eingaben für den Suchparser. Ein Fuzzer erzeugt sie zufällig. Der andere behält Eingaben, die zusätzlichen Code ausführen. Vergleiche, welcher Fuzzer den Absturz findet.",
    lesson: 'Der blinde Fuzzer muss die Zeichenfolge zufällig erzeugen. Der Coverage-guided Fuzzer speichert Eingaben, die weiteren Code ausführen. Er kann eine gespeicherte Eingabe beim nächsten Versuch verändern.',
  },
  wp: {
    intro: "Der Verifier beginnt mit der Postcondition Q. Er berechnet Zeile für Zeile rückwärts die Weakest Precondition wp. Dann prüft er, ob aus P die Bedingung wp folgt. Der Solver in der Übung prüft einen endlichen Wertebereich.",
    note: 'Die Übung prüft einen kleinen Bereich ganzer Zahlen. Ein Verifier wie Dafny verwendet einen SMT Solver für einen symbolischen Beweis für alle zulässigen Eingaben.',
  },
  unit: {
    intro: "Eine von sechs Implementierungen der Adoptionsgebühr ist korrekt. Die anderen fünf enthalten je einen Fehler. Ergänze Beispiele mit Eingabe und erwartetem Ergebnis. Jedes Beispiel muss mit der korrekten Implementierung bestehen. Ergänze Beispiele, bis sie alle Fehler erkennen.",
  },
  tdd: {
    intro: "Die vier Tests sind freigegeben und gesperrt. Schreibe `reserve`. Führe die Tests aus, bis alle bestehen. Führe danach ein Refactoring durch. Prüfe nach jeder Änderung, dass die Tests weiter bestehen.",
  },
  dbc: {
    intro: "Wähle eine Eingabe. Führe die Operation mit Contracts aus. Wiederhole sie ohne Contracts. Vergleiche, bei welchem Schritt der Fehler auftritt.",
    hint: "Ändere den Schalter. Vergleiche die Ergebnisse.",
  },
  differential: {
    intro: "Ein Coding-Agent hat die Gutscheinberechnung geändert. Die vorhandenen Tests bestehen. Führe beide Versionen mit denselben 2.000 zufälligen Preisen und Gutscheincodes aus. Vergleiche die Ergebnisse.",
  },
  flags: {
    intro: "v2 läuft bereits in Produktion. Das Feature Flag ist aus. Aktiviere das Flag für Mitarbeitende, Beta-Nutzer oder einen Teil des Traffic. Deaktiviere es beim Incident.",
  },
  snapshot: {
    intro: "Ein Coding-Agent hat `renderInvoice` geändert. Der Snapshot Test meldet jede Abweichung. Gib eine beabsichtigte Änderung frei. Lehne eine fehlerhafte Änderung ab.",
  },
  secrets: {
    intro: "Ein Coding-Agent hat den Pull Request geöffnet. Aktiviere die Scanner einzeln. Prüfe, welche Probleme jeder Scanner meldet.",
    hint: "Der Scan für bekannte Schwachstellen meldet left-padd nicht. Für dieses Paket liegen noch keine Einträge vor.",
  },
  regression: {
    intro: "Ben konnte Rex reservieren, obwohl Anna ihn bereits reserviert hatte. Die Tier-ID `\"rex \"` endete mit einem Leerzeichen. Schreibe einen Test. Er muss vor der Korrektur fehlschlagen und danach bestehen.",
  },
  lean: {
    intro: "In Lean 4 schreibst du einen Beweis mit Tactics. Der Infoview zeigt bekannte Fakten oberhalb von ⊢. Darunter stehen offene Ziele. Der Kernel prüft den fertigen Beweis.",
    note: 'Die Übung zeigt aufgezeichnete Goal States aus dem Infoview. Einige Fehlermeldungen sind gekürzt. Führe den Code in Lean unter live.lean-lang.org aus.',
  },
  canary: {
    intro: "Der Rollout gibt v2 nacheinander 5 %, 25 %, 50 % und 100 % des Traffic. Nach jeder Stufe vergleicht ein Check v2 mit v1. Wähle einen Fehler in v2. Lege fest, ob der Check die Geschäftsmetrik verwendet.",
  },
  contract: {
    intro: "Die Reservierungs-UI benötigt vier Felder. Ein Coding-Agent ändert den Provider. Aktiviere eine Änderung. Prüfe den Contract.",
  },
  lint: {
    intro: "Der Linter meldet Verstöße im Code. Korrigiere jeden Fund im Editor.",
    ciIntro: 'Ein Coding-Agent öffnet einen Pull Request. Vergleiche die Textregel mit dem CI-Check.',
  },
};
