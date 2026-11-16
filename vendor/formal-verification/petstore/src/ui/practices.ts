export type PracticeId = 'pbt' | 'mutation' | 'fuzzing' | 'differential' | 'proof' | 'model'

export interface Practice {
  name: string
  guards: string
  finds: string
  command: string
  code: string
}

export const PRACTICES: Record<PracticeId, Practice> = {
  pbt: {
    name: 'Property-Based Testing',
    guards: 'Preisberechnung, Suche (parse/print), Bestellablauf',
    finds: 'Rundet man den Rabatt pro Position, geht ein Cent verloren.',
    command: 'npm run test:property',
    code: 'test/property/',
  },
  mutation: {
    name: 'Mutation Testing',
    guards: 'Qualität der Tests für die gesamte Fachlogik',
    finds: 'Eine Suite mit voller Zeilenabdeckung prüft die Grenzwerte nicht.',
    command: 'npm run test:mutation',
    code: 'stryker.config.json',
  },
  fuzzing: {
    name: 'Fuzzing',
    guards: 'Suchsprache, deren Eingaben aus URLs stammen',
    finds: 'Ein kaputter Prozent-Code in einem geteilten Link bringt die Seite zum Absturz.',
    command: 'npm run fuzz',
    code: 'fuzz/search.fuzz.ts',
  },
  differential: {
    name: 'Differential Testing',
    guards: 'Preis-Refactoring, Dafny-Modell gegen TypeScript, lokale API gegen Original',
    finds: 'Die alte Gleitkomma-Rechnung weicht von der neuen ab.',
    command: 'npm run test:differential',
    code: 'test/differential/',
  },
  proof: {
    name: 'Formaler Beweis (Dafny)',
    guards: 'Rabattverteilung: exakt für alle Eingaben, nicht nur für getestete',
    finds: 'Die naive Verteilung lässt sich nicht beweisen, Dafny nennt die verletzte Nachbedingung.',
    command: 'npm run verify:dafny',
    code: 'verification/dafny/Allocate.dfy',
  },
  model: {
    name: 'Model Checking (TLA+)',
    guards: 'Bestellprotokoll: alle Verschränkungen von zwei Käufern',
    finds: 'Prüfen und dann Kaufen verkauft dasselbe Tier doppelt.',
    command: 'npm run verify:tla',
    code: 'verification/tla/Reservation.tla',
  },
}
