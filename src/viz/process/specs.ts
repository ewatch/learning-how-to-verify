// Captions and takeaways (EN/DE) per mode. One sentence each.
export type L = 'en' | 'de';
export interface Spec { caption: Record<L, string>; takeaway: Record<L, string> }

export const SPECS: Record<string, Spec> = {
  'oncall-experience': {
    caption: { en: 'An incident in production becomes a check that stops the same bug higher up the funnel.', de: 'Ein Incident in Production wird zu einem Check, der denselben Bug weiter oben im Funnel stoppt.' },
    takeaway: { en: 'Every postmortem should end in a cheaper check.', de: 'Jedes Postmortem sollte in einem günstigeren Check enden.' },
  },
  'code-review': {
    caption: { en: 'The bigger the pull request, the fewer comments per line, until review turns into "LGTM".', de: 'Je größer der Pull Request, desto weniger Kommentare pro Zeile, bis das Review zu „LGTM“ wird.' },
    takeaway: { en: 'Keep changes small, or review stops being review.', de: 'Änderungen klein halten, sonst ist Review kein Review mehr.' },
  },
  evals: {
    caption: { en: 'Run the same 12 tasks before and after a change, three times each, and grade with more than tests.', de: 'Dieselben 12 Tasks vor und nach einer Änderung dreimal laufen lassen und nicht nur mit Tests bewerten.' },
    takeaway: { en: 'A score without spread and a second grader overstates progress.', de: 'Ein Score ohne Streuung und zweiten Grader übertreibt den Fortschritt.' },
  },
  'agent-rules': {
    caption: { en: 'A rule written in AGENTS.md is sometimes ignored, the same rule as a lint check is always enforced.', de: 'Eine Regel in AGENTS.md wird manchmal ignoriert, dieselbe Regel als Lint-Check immer durchgesetzt.' },
    takeaway: { en: 'Move rules down the funnel from prose to tools.', de: 'Regeln im Funnel von Prosa zu Tools verschieben.' },
  },
  'threat-modeling': {
    caption: { en: 'STRIDE walks every element of the data flow and pairs each threat with a mitigation and a guarding test.', de: 'STRIDE geht jedes Element des Datenflusses durch und verbindet jede Bedrohung mit Gegenmaßnahme und Test.' },
    takeaway: { en: 'A threat without a test is only a worry.', de: 'Eine Bedrohung ohne Test ist nur eine Sorge.' },
  },
  'penetration-tests': {
    caption: { en: 'A penetration test follows an attack chain, and one fix at the weakest step breaks it for good.', de: 'Ein Penetrationstest folgt einer Angriffskette, und ein Fix am schwächsten Glied unterbricht sie dauerhaft.' },
    takeaway: { en: 'Turn every finding into a regression test.', de: 'Jeden Fund in einen Regressionstest verwandeln.' },
  },
  'usability-tests': {
    caption: { en: 'Each extra test user finds fewer new problems, so a handful of users already uncovers most of them.', de: 'Jede weitere Testperson findet weniger neue Probleme, schon wenige Personen decken die meisten auf.' },
    takeaway: { en: 'Test with five, fix, then test again.', de: 'Mit fünf testen, beheben, erneut testen.' },
  },
  refactoring: {
    caption: { en: 'Characterization tests pin behaviour so the structure can change while the results stay the same.', de: 'Characterization Tests halten das Verhalten fest, damit sich die Struktur ändern kann und die Ergebnisse gleich bleiben.' },
    takeaway: { en: 'Pin behaviour first, then restructure.', de: 'Erst Verhalten festnageln, dann umbauen.' },
  },
  architecture: {
    caption: { en: 'An architecture test fails the build when an agent adds an import against the allowed direction.', de: 'Ein Architekturtest lässt den Build scheitern, wenn ein Agent einen Import gegen die erlaubte Richtung ergänzt.' },
    takeaway: { en: 'Rules that only live in prose get broken.', de: 'Regeln, die nur in Prosa stehen, werden gebrochen.' },
  },
};
export const MODES = Object.keys(SPECS);
