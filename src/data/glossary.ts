import type { L } from './types';

export interface Term {
  id: string; term: L; def: L; see?: string;
  /** extra spellings that should link to this entry (plurals, synonyms), per language */
  aliases?: { en: string[]; de: string[] };
  /** false: never auto-link in running text (too generic); the glossary page still lists it */
  autolink?: boolean;
}
const g = (id: string, ten: string, tde: string, en: string, de: string, see?: string): Term => ({ id, term: { en: ten, de: tde }, def: { en, de }, see });

const BASE: Term[] = [
  g('oracle', 'Oracle', 'Orakel', 'Whatever decides whether an output is correct: an expected value, a rule, a second implementation, a human.', 'Das, was entscheidet, ob eine Ausgabe korrekt ist: ein Erwartungswert, eine Regel, eine zweite Implementierung, ein Mensch.', 'differential-testing'),
  g('invariant', 'Invariant', 'Invariante', 'A statement that must be true in every state, e.g. "no pet is reserved by two people".', 'Eine Aussage, die in jedem Zustand gelten muss, z. B. „kein Tier ist von zwei Personen reserviert“.', 'formal-verification'),
  g('property', 'Property', 'Eigenschaft (Property)', 'A rule that must hold for all inputs, checked with many generated inputs.', 'Eine Regel, die für alle Eingaben gelten muss, geprüft mit vielen erzeugten Eingaben.', 'property-based-tests'),
  g('shrinking', 'Shrinking', 'Shrinking', 'Reducing a failing generated input to the smallest input that still fails.', 'Eine fehlschlagende erzeugte Eingabe auf die kleinste reduzieren, die noch scheitert.', 'property-based-tests'),
  g('mutant', 'Mutant', 'Mutant', 'A copy of the code with one small deliberate change. A good test suite "kills" it by failing.', 'Eine Kopie des Codes mit einer kleinen absichtlichen Änderung. Eine gute Testsuite „tötet“ ihn, indem sie scheitert.', 'mutation-tests'),
  g('equivalent-mutant', 'Equivalent mutant', 'Äquivalenter Mutant', 'A mutant that behaves exactly like the original. No test can kill it; a human has to dismiss it.', 'Ein Mutant, der sich genau wie das Original verhält. Kein Test kann ihn töten; ein Mensch muss ihn aussortieren.', 'mutation-tests'),
  g('mutation-score', 'Mutation score', 'Mutation Score', 'Share of mutants killed by the tests. A measure of test quality.', 'Anteil der von den Tests getöteten Mutanten. Ein Maß für Testqualität.', 'mutation-tests'),
  g('coverage', 'Coverage', 'Abdeckung (Coverage)', 'Share of lines or branches executed by the tests. Says what ran, not what was checked.', 'Anteil der von den Tests ausgeführten Zeilen oder Zweige. Sagt, was lief, nicht was geprüft wurde.', 'coverage'),
  g('corpus', 'Corpus', 'Korpus', 'The set of saved inputs a fuzzer mutates further; each one reached new code at some point.', 'Die Menge gespeicherter Eingaben, die ein Fuzzer weiter mutiert; jede erreichte irgendwann neuen Code.', 'fuzz-tests'),
  g('harness', 'Fuzz harness / target', 'Fuzz-Harness / Target', 'The small function that takes the fuzzer\'s bytes and calls your code with them.', 'Die kleine Funktion, die die Bytes des Fuzzers entgegennimmt und damit den eigenen Code aufruft.', 'fuzz-tests'),
  g('precondition', 'Precondition / postcondition', 'Vor- / Nachbedingung', 'What a function requires from its caller (pre) and guarantees when it returns (post).', 'Was eine Funktion vom Aufrufer verlangt (vor) und bei Rückkehr garantiert (nach).', 'contracts'),
  g('loop-invariant', 'Loop invariant', 'Schleifeninvariante', 'A statement true before and after every loop iteration; it lets a verifier reason about loops.', 'Eine Aussage, die vor und nach jeder Schleifeniteration gilt; damit kann ein Verifizierer über Schleifen schließen.', 'formal-verification'),
  g('model-checking', 'Model checking', 'Model Checking', 'Exhaustively exploring all reachable states of a (small) model to check invariants.', 'Alle erreichbaren Zustände eines (kleinen) Modells vollständig durchsuchen, um Invarianten zu prüfen.', 'formal-verification'),
  g('interleaving', 'Interleaving', 'Verschränkung (Interleaving)', 'One possible order in which the steps of concurrent processes happen.', 'Eine mögliche Reihenfolge, in der die Schritte nebenläufiger Prozesse ablaufen.', 'formal-verification'),
  g('counterexample', 'Counterexample', 'Gegenbeispiel', 'A concrete input or trace that violates a property. The most useful output of any checker.', 'Eine konkrete Eingabe oder Spur, die eine Eigenschaft verletzt. Die nützlichste Ausgabe jeder Prüfung.', 'formal-verification'),
  g('smt', 'SMT solver', 'SMT-Solver', 'A program that decides whether logical formulas over numbers, arrays etc. can be satisfied. Dafny and Kani use one (e.g. Z3).', 'Ein Programm, das entscheidet, ob logische Formeln über Zahlen, Arrays usw. erfüllbar sind. Dafny und Kani nutzen einen (z. B. Z3).', 'formal-verification'),
  g('flaky', 'Flaky test', 'Wackeliger Test (flaky)', 'A test that passes and fails on the same code. Teaches everyone to ignore red.', 'Ein Test, der auf demselben Code mal besteht, mal scheitert. Bringt allen bei, Rot zu ignorieren.', 'ci'),
  g('blast-radius', 'Blast radius', 'Wirkungsradius', 'How many users or systems a failure can affect. Canaries and flags keep it small.', 'Wie viele Nutzer oder Systeme ein Fehler treffen kann. Canaries und Flags halten ihn klein.', 'canarying'),
  g('slo', 'SLO', 'SLO', 'Service level objective: a target for a user-visible metric, e.g. 99.5% of reservations succeed within 1 s.', 'Service Level Objective: ein Ziel für eine nutzersichtbare Metrik, z. B. 99,5 % der Reservierungen gelingen binnen 1 s.', 'monitoring'),
  g('p95', 'p95 / p99', 'p95 / p99', 'The value below which 95% (99%) of measurements fall. Shows the slow tail that averages hide.', 'Der Wert, unter dem 95 % (99 %) der Messungen liegen. Zeigt das langsame Ende, das Durchschnitte verstecken.', 'performance-tests'),
  g('sast', 'SAST / DAST / SCA', 'SAST / DAST / SCA', 'Static application security testing (source code), dynamic testing (running app), software composition analysis (dependencies).', 'Statische Sicherheitsanalyse (Quellcode), dynamische Tests (laufende App), Analyse der Abhängigkeiten.', 'security-scanning'),
  g('sbom', 'SBOM', 'SBOM', 'Software bill of materials: a list of every component in a build.', 'Software-Stückliste: eine Liste jeder Komponente in einem Build.', 'security-scanning'),
  g('preprint', 'Preprint', 'Preprint', 'A paper published before (or without) peer review, often on arXiv. Treat with more caution.', 'Ein Paper, das vor (oder ohne) Begutachtung veröffentlicht wurde, oft auf arXiv. Mit mehr Vorsicht behandeln.'),
  g('agent', 'Coding agent', 'Coding-Agent', 'An LLM that edits code, runs commands and iterates on their output with little human input per step.', 'Ein LLM, das Code ändert, Befehle ausführt und mit wenig menschlichem Eingriff pro Schritt auf deren Ausgabe reagiert.', 'agent-rules'),
  g('eval', 'Eval', 'Eval', 'A repeatable set of tasks with grading, used to measure a model or agent setup.', 'Ein wiederholbarer Aufgabensatz mit Bewertung, um ein Modell oder Agenten-Setup zu messen.', 'evals'),
  g('reward-hacking', 'Test gaming / reward hacking', 'Tests austricksen (Reward Hacking)', 'Meeting the measured goal (green tests) without meeting the real one (working code), e.g. by editing tests.', 'Das gemessene Ziel (grüne Tests) erreichen, ohne das eigentliche (funktionierender Code), z. B. durch Ändern der Tests.', 'test-integrity'),
];

type Extra = { en?: string[]; de?: string[]; autolink?: boolean };
const EXTRA: Record<string, Extra> = {
  oracle: { en: ['oracle', 'oracles', 'test oracle'], de: ['Orakel', 'Test-Orakel'] },
  invariant: { en: ['invariants'], de: ['Invarianten'] },
  property: { autolink: false },
  mutant: { en: ['mutants'], de: ['Mutanten'] },
  'equivalent-mutant': { en: ['equivalent mutants'], de: ['äquivalente Mutanten', 'äquivalenten Mutanten'] },
  'mutation-score': { en: ['mutation scores'], de: [] },
  coverage: { en: ['code coverage', 'test coverage'], de: ['Coverage', 'Code Coverage', 'Testabdeckung'] },
  corpus: { de: ['Corpus'] },
  harness: { en: ['fuzz harness', 'fuzz harnesses', 'harness', 'fuzz target', 'fuzz targets'], de: ['Fuzz-Harness', 'Harness', 'Fuzz-Target', 'Fuzz-Targets'] },
  precondition: { en: ['preconditions', 'postcondition', 'postconditions'], de: ['Vorbedingung', 'Vorbedingungen', 'Nachbedingung', 'Nachbedingungen'] },
  'loop-invariant': { en: ['loop invariants'], de: ['Schleifeninvarianten'] },
  'model-checking': { en: ['model checker', 'model checkers'], de: ['Model Checker'] },
  interleaving: { en: ['interleavings'], de: ['Verschränkung', 'Verschränkungen', 'Interleavings'] },
  counterexample: { en: ['counterexamples', 'counter-example'], de: ['Gegenbeispiele', 'Gegenbeispielen'] },
  smt: { en: ['SMT solver', 'SMT solvers', 'SMT'], de: ['SMT-Solver', 'SMT'] },
  flaky: { en: ['flaky test', 'flaky tests', 'flaky', 'flakiness'], de: ['wackeliger Test', 'wackelige Tests', 'flaky Test', 'flaky Tests', 'flaky'] },
  'blast-radius': { de: ['Blast Radius'] },
  slo: { en: ['SLOs'], de: ['SLOs'] },
  p95: { en: ['p95', 'p99', 'p95/p99', 'p95 / p99'], de: ['p95', 'p99', 'p95/p99', 'p95 / p99'] },
  sast: { en: ['SAST', 'DAST', 'SCA'], de: ['SAST', 'DAST', 'SCA'] },
  sbom: { en: ['SBOMs'], de: ['SBOMs'] },
  preprint: { en: ['preprints'], de: ['Preprints'] },
  agent: { en: ['coding agent', 'coding agents'], de: ['Coding-Agent', 'Coding-Agenten', 'Coding-Agents'] },
  eval: { en: ['evals'], de: ['Evals'] },
  'reward-hacking': { en: ['reward hacking', 'test gaming'], de: ['Reward Hacking'] },
};

export const GLOSSARY: Term[] = BASE.map((t) => {
  const x = EXTRA[t.id];
  if (!x) return t;
  return { ...t, aliases: { en: x.en ?? [], de: x.de ?? [] }, ...(x.autolink === false ? { autolink: false } : {}) };
});
