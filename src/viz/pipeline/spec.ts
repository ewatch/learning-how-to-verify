export type Lang = 'en' | 'de';
export type GateId = 'lint' | 'types' | 'unit' | 'static' | 'config' | 'build' | 'san' | 'merge';
export type BugType = 'unused-var' | 'type-error' | 'null-deref' | 'price-trusted' | 'missing-limit' | 'timeout-zero' | 'buffer-overflow' | 'untested-branch' | 'clean';
export type Mode = 'ci' | 'static-analysis' | 'config-tests' | 'sanitizers' | 'coverage';
type L = Record<Lang, string>;

export const GATE_ORDER: GateId[] = ['lint', 'types', 'unit', 'static', 'config', 'build', 'san', 'merge'];
export const GATES: Record<GateId, { name: L; time: string }> = {
  lint: { name: { en: 'lint', de: 'Lint' }, time: '5s' },
  types: { name: { en: 'types', de: 'Typen' }, time: '10s' },
  unit: { name: { en: 'unit tests', de: 'Unit-Tests' }, time: '40s' },
  static: { name: { en: 'static', de: 'Analyse' }, time: '1m' },
  config: { name: { en: 'config', de: 'Config' }, time: '5s' },
  build: { name: { en: 'build', de: 'Build' }, time: '1m' },
  san: { name: { en: 'sanitizer', de: 'Sanitizer' }, time: '3m' },
  merge: { name: { en: 'merge', de: 'Merge' }, time: '' },
};
/** gates that only exist for some stacks (C/C++/Rust/Go for the sanitizer build) */
export const OPTIONAL_GATES: GateId[] = ['san'];

export const BUG_LABEL: Record<BugType, L> = {
  'unused-var': { en: 'unused var', de: 'ungenutzt' },
  'type-error': { en: 'type error', de: 'Typfehler' },
  'null-deref': { en: 'null deref', de: 'Null-Zugriff' },
  'price-trusted': { en: 'client price', de: 'Client-Preis' },
  'missing-limit': { en: 'no memory limit', de: 'Limit fehlt' },
  'timeout-zero': { en: 'timeout: 0', de: 'timeout: 0' },
  'buffer-overflow': { en: 'buffer overflow', de: 'buffer overflow' },
  'untested-branch': { en: 'untested branch', de: 'Branch ungetestet' },
  clean: { en: 'clean', de: 'sauber' },
};

/** Which gate catches which bug type (first gate in pipeline order that can see it). */
const CATCHER: Record<BugType, GateId | null> = {
  'unused-var': 'lint', 'type-error': 'types', 'untested-branch': 'unit', 'null-deref': 'static', 'price-trusted': 'static',
  'missing-limit': 'config', 'timeout-zero': 'config', 'buffer-overflow': 'san', clean: null,
};

/** Pure: the gate that stops a commit, or 'merge' when it gets through. Without a sanitizer build, memory bugs slip through. */
export function catchingGate(bug: BugType, opts: { sanitizers?: boolean } = {}): GateId {
  const g = CATCHER[bug];
  if (g === null) return 'merge';
  if (g === 'san' && opts.sanitizers === false) return 'merge';
  return g;
}

export interface Commit { id: string; bug: BugType; label?: L; sanitizers?: boolean; note?: L; expect: GateId }
export interface ModeSpec { gates: GateId[]; focus: GateId; commits: Commit[]; caption: L; takeaway: L; takeawaySlow?: L }

const c = (id: string, bug: BugType, extra: Partial<Commit> = {}): Commit => ({ id, bug, expect: catchingGate(bug, { sanitizers: extra.sanitizers }), ...extra });

export const SPECS: Record<Mode, ModeSpec> = {
  ci: {
    gates: GATE_ORDER, focus: 'merge',
    commits: [c('a', 'clean'), c('b', 'unused-var'), c('c', 'type-error'), c('d', 'clean')],
    caption: { en: 'Every commit runs the same gates, and a required status check keeps red commits from merging.', de: 'Jeder Commit durchläuft dieselben Gates, und ein Required Status Check hält rote Commits vom Merge ab.' },
    takeaway: { en: 'A gate only protects you if it is required and fast enough to be run.', de: 'Ein Gate schützt nur, wenn es Pflicht ist und schnell genug, um es auszuführen.' },
    takeawaySlow: { en: 'At 40 minutes people batch commits or skip checks, so the gates stop catching anything.', de: 'Bei 40 Minuten bündeln Leute Commits oder überspringen Checks, und die Gates fangen nichts mehr.' },
  },
  'static-analysis': {
    gates: GATE_ORDER, focus: 'static',
    commits: [c('a', 'clean'), c('b', 'price-trusted', { note: { en: '3 files', de: '3 Dateien' } }), c('c', 'null-deref')],
    caption: { en: 'The analyser follows the client-supplied price through three files and stops the commit that trusts it.', de: 'Der Analyzer verfolgt den vom Client gelieferten Preis durch drei Dateien und stoppt den Commit, der ihm vertraut.' },
    takeaway: { en: 'Static analysis finds patterns that span files, which a single unit test never sees.', de: 'Statische Analyse findet Muster über Dateigrenzen hinweg, die ein einzelner Unit-Test nie sieht.' },
  },
  'config-tests': {
    gates: GATE_ORDER, focus: 'config',
    commits: [c('a', 'clean'), c('b', 'missing-limit'), c('c', 'timeout-zero')],
    caption: { en: 'A config policy blocks YAML that sets no memory limit or an infinite timeout, before it ships.', de: 'Eine Config-Policy blockiert YAML ohne Memory-Limit oder mit endlosem Timeout, bevor es ausgeliefert wird.' },
    takeaway: { en: 'Config is code that never runs in tests, so give it its own five-second gate.', de: 'Config ist Code, der in Tests nie läuft, also gib ihm ein eigenes Fünf-Sekunden-Gate.' },
  },
  sanitizers: {
    gates: GATE_ORDER, focus: 'san',
    commits: [
      c('a', 'buffer-overflow', { sanitizers: false, label: { en: 'normal build', de: 'normaler Build' }, note: { en: 'passes, bug unseen', de: 'grün, Bug unsichtbar' } }),
      c('b', 'buffer-overflow', { sanitizers: true, label: { en: 'ASan build', de: 'ASan-Build' }, note: { en: 'crash', de: 'Absturz' } }),
      c('c', 'clean'),
    ],
    caption: { en: 'The same test passes in the normal build but crashes in the ASan lane, which sees the out-of-bounds write.', de: 'Derselbe Test ist im normalen Build grün, stürzt aber in der ASan-Lane ab, die den Out-of-bounds-Zugriff sieht.' },
    takeaway: { en: 'Run the same tests again with sanitizers on; memory bugs hide in green builds.', de: 'Führe dieselben Tests mit Sanitizern erneut aus; Speicherfehler verstecken sich in grünen Builds.' },
  },
  coverage: {
    gates: GATE_ORDER, focus: 'unit',
    commits: [c('a', 'clean', { note: { en: 'diff 95%', de: 'Diff 95 %' } }), c('b', 'untested-branch', { note: { en: 'diff 40%', de: 'Diff 40 %' } })],
    caption: { en: 'The test gate reports diff coverage and flags the uncovered lines before a human reviews the change.', de: 'Das Test-Gate meldet die Diff-Coverage und markiert ungetestete Zeilen, bevor ein Mensch den Change reviewt.' },
    takeaway: { en: 'Covered is not checked: a line that runs without an assertion proves nothing.', de: 'Abgedeckt heißt nicht geprüft: Eine Zeile, die ohne Assertion läuft, beweist nichts.' },
  },
};

export const isMode = (m: string): m is Mode => m in SPECS;
