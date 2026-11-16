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
    lesson: {
      en: 'The lookup can return undefined. Give the agent the file, line and diagnostic; ask it to handle a missing pet without changing the checker settings.',
      de: 'Der Lookup kann undefined liefern. Dem Agenten Datei, Zeile und Diagnostic geben; er soll ein fehlendes Tier behandeln, ohne die Checker-Einstellungen zu ändern.',
    },
  },
  {
    id: 'guard',
    label: { en: '2. Handle the missing pet', de: '2. Fehlendes Tier behandeln' },
    code: types + signature + '  const pet = pets[id];\n  if (!pet) return "missing";\n' + body,
    lesson: {
      en: 'The guard narrows Pet | undefined to Pet. The compiler accepts the change, and the three example checks pass. Concurrent requests and untrusted input still need other checks.',
      de: 'Der Guard schränkt Pet | undefined auf Pet ein. Der Compiler akzeptiert die Änderung, und die drei Beispielprüfungen bestehen. Gleichzeitige Requests und ungeprüfte Eingaben brauchen weitere Prüfungen.',
    },
  },
  {
    id: 'assertion',
    label: { en: '3. Silence the error with !', de: '3. Fehler mit ! unterdrücken' },
    code: types + signature + '  const pet = pets[id]!;\n' + body,
    lesson: {
      en: 'The non-null assertion changes what the compiler trusts. It adds no runtime guard: a missing pet still throws. Ask the agent to fix the cause, then keep lint rules against escape hatches.',
      de: 'Die Non-null Assertion ändert, worauf der Compiler vertraut. Sie ergänzt keinen Runtime-Guard: Ein fehlendes Tier löst weiter einen Fehler aus. Der Agent soll die Ursache beheben; Lint-Regeln gegen solche Ausnahmen beibehalten.',
    },
  },
  {
    id: 'overwrite',
    label: { en: '4. A bug that still compiles', de: '4. Fehler trotz grünem Compiler' },
    code: types + signature + `  const pet = pets[id];
  if (!pet) return "missing";
  pet.reservedBy = person;
  return "reserved";
}`,
    lesson: {
      en: 'All values have valid types, but Ben can overwrite Anna’s reservation. Give the agent the failing business rule and test output. Type checks and behaviour tests provide different feedback.',
      de: 'Alle Werte haben gültige Typen, aber Ben kann Annas Reservierung überschreiben. Dem Agenten die verletzte Fachregel und die Testausgabe geben. Type-Checks und Verhaltenstests liefern unterschiedliches Feedback.',
    },
  },
] as const satisfies { id: string; label: L; code: string; lesson: L }[];

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
  next: { en: 'Feedback for the agent', de: 'Feedback für den Agenten' },
  off: { en: 'With strictness off, the compiler misses the unsafe lookup. The missing-pet check now fails at runtime. Enable the checks and compare.', de: 'Ohne strenge Einstellungen übersieht der Compiler den unsicheren Lookup. Der Test mit fehlendem Tier scheitert nun zur Laufzeit. Aktiviere die Prüfungen und vergleiche.' },
  failed: { en: 'The checker could not run. Try again.', de: 'Der Checker konnte nicht laufen. Erneut versuchen.' },
  checks: {
    available: { en: 'Available pet: reserve for Anna', de: 'Freies Tier: für Anna reservieren' },
    missing: { en: 'Missing pet: return missing', de: 'Fehlendes Tier: missing zurückgeben' },
    taken: { en: 'Taken pet: reject Ben and keep Anna', de: 'Reserviertes Tier: Ben ablehnen, Anna behalten' },
  },
};
