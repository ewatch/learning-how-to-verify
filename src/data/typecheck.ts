import type { L } from './types';

const types = `type Pet = { reservedBy: string | null };
type Pets = { [id: string]: Pet };
type Result = "reserved" | "taken" | "missing";

`;
const body = `  if (pet.reservedBy !== null) return "taken";
  pet.reservedBy = person;
  return "reserved";
}`;
const signature = 'function reserve(pets: Pets, id: string, person: string): Result {\n';

export const TYPE_REVISIONS = [
  {
    id: 'unchecked',
    label: { en: '1. Agent draft', de: '1. Agentenentwurf' },
    code: types + signature + '  const pet = pets[id];\n' + body,
  },
  {
    id: 'guard',
    label: { en: '2. Handle the missing pet', de: '2. Fehlendes Tier behandeln' },
    code: types + signature + '  const pet = pets[id];\n  if (!pet) return "missing";\n' + body,
  },
  {
    id: 'assertion',
    label: { en: '3. Silence the error with !', de: '3. Fehler mit ! unterdrücken' },
    code: types + signature + '  const pet = pets[id]!;\n' + body,
  },
  {
    id: 'overwrite',
    label: { en: '4. A bug that still compiles', de: '4. Fehler trotz grünem Compiler' },
    code: types + signature + `  const pet = pets[id];
  if (!pet) return "missing";
  pet.reservedBy = person;
  return "reserved";
}`,
  },
] as const satisfies { id: string; label: L; code: string }[];

export type TypeRevision = typeof TYPE_REVISIONS[number]['id'];

export const TYPECHECK_COPY = {
  intro: {
    en: 'An agent adds pet reservations. Predict what each revision will do, then run the compiler gate and three fixed behaviour checks. A pet must never be reserved twice.',
    de: 'Ein Agent ergänzt Tierreservierungen. Sage das Ergebnis jeder Version voraus, dann starte das Compiler-Gate und drei feste Verhaltenstests. Ein Tier darf nie doppelt reserviert werden.',
  },
  scope: {
    en: 'Real TypeScript compiler, run locally in a worker on these four presets. Settings: strict + noUncheckedIndexedAccess, or both off. Compiler messages stay in their original English. No server or agent is involved.',
    de: 'Ein echter TypeScript-Compiler läuft lokal in einem Worker auf diesen vier Vorlagen. Einstellungen: strict + noUncheckedIndexedAccess, oder beide aus. Compiler-Meldungen bleiben im englischen Original. Kein Server oder Agent ist beteiligt.',
  },
  strict: { en: 'Enable strict checks', de: 'Strenge Prüfungen aktivieren' },
  revision: { en: 'Agent revision', de: 'Agentenversion' },
  run: { en: 'Check this change', de: 'Änderung prüfen' },
  running: { en: 'Checking…', de: 'Prüfung läuft…' },
  ready: { en: 'Choose a revision and predict the first failure.', de: 'Wähle eine Version und sage den ersten Fehler voraus.' },
  blocked: { en: 'Compiler gate failed. Behaviour checks were not run.', de: 'Compiler-Gate fehlgeschlagen. Verhaltenstests wurden nicht ausgeführt.' },
  passed: { en: 'Compiler gate passed. Now check behaviour.', de: 'Compiler-Gate bestanden. Jetzt das Verhalten prüfen.' },
  failed: { en: 'The checker could not run. Try again.', de: 'Der Checker konnte nicht laufen. Erneut versuchen.' },
  checks: {
    available: { en: 'Available pet: reserve for Anna', de: 'Freies Tier: für Anna reservieren' },
    missing: { en: 'Missing pet: return missing', de: 'Fehlendes Tier: missing zurückgeben' },
    taken: { en: 'Taken pet: reject Ben and keep Anna', de: 'Reserviertes Tier: Ben ablehnen, Anna behalten' },
  },
};
