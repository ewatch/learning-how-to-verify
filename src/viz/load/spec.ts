export type Lang = 'en' | 'de';
export interface Spec { caption: Record<Lang, string>; takeaway: Record<Lang, string> }

export const SPECS: Record<string, Spec> = {
  'load-tests': {
    caption: { en: 'Latency stays flat until the connection pool runs out, then it shoots up and requests start to fail.', de: 'Die Latenz bleibt flach, bis der Connection-Pool erschöpft ist, dann schießt sie hoch und Requests schlagen fehl.' },
    takeaway: { en: 'Test at twice the expected peak, and check the invariant afterwards.', de: 'Teste bei doppelter erwarteter Spitze und prüfe danach die Invariante.' },
  },
  'soak-tests': {
    caption: { en: 'A five-minute test looks fine, but a small leak per request fills the memory over hours.', de: 'Ein Fünf-Minuten-Test sieht gut aus, aber ein kleines Leck pro Request füllt über Stunden den Speicher.' },
    takeaway: { en: 'Slow failures only show up if you run long enough.', de: 'Langsame Fehler zeigen sich nur, wenn der Test lange genug läuft.' },
  },
  'performance-tests': {
    caption: { en: 'Averages hide the slow tail, and a page with many requests hits that tail almost every time.', de: 'Mittelwerte verstecken den langsamen Tail, und eine Seite mit vielen Requests trifft ihn fast immer.' },
    takeaway: { en: 'Judge latency by p95 and p99, not by the average.', de: 'Bewerte Latenz nach p95 und p99, nicht nach dem Durchschnitt.' },
  },
  'benchmark-tests': {
    caption: { en: 'At ten pets both versions look the same, but at a hundred thousand the O(n²) version is far slower.', de: 'Bei zehn Pets sehen beide Versionen gleich aus, bei hunderttausend ist die O(n²)-Version weit langsamer.' },
    takeaway: { en: 'Benchmark at realistic sizes and fail the build on regressions.', de: 'Benchmarke mit realistischen Größen und lass den Build bei Regressionen fehlschlagen.' },
  },
};

export const T = {
  en: {
    users: 'users', p95: 'p95 latency', target: 'target', peak: '2× peak', errors: 'errors', check: 'after run: check invariant', unique: 'unique constraint',
    twice: 'Rex reserved twice', ms: 'ms', knee: 'pool exhausted',
    leak: 'leak per request', traffic: 'traffic ×10', hours: 'hours', memory: 'memory', oom: 'OOM', fine: 'looks fine here', mb: 'MB', gc: 'GC sawtooth',
    nplus: 'N+1 query', count: 'requests', avg: 'average', p50: 'p50', p99: 'p99', note: 'A page with 20 requests: most users hit the p95.', pageHit: (p: string) => `${p} of 20-request pages hit a slow one`,
    n: 'n (pets)', time: 'time', linear: 'O(n) search', quad: 'dedupe + search', same: 'looks the same', thresh: '+20% vs baseline', fail: 'regression',
  },
  de: {
    users: 'Nutzer', p95: 'p95-Latenz', target: 'Ziel', peak: '2× Spitze', errors: 'Fehler', check: 'nach dem Lauf: Invariante prüfen', unique: 'Unique Constraint',
    twice: 'Rex doppelt reserviert', ms: 'ms', knee: 'Pool erschöpft',
    leak: 'Leak pro Request', traffic: 'Traffic ×10', hours: 'Stunden', memory: 'Speicher', oom: 'OOM', fine: 'sieht hier gut aus', mb: 'MB', gc: 'GC-Sägezahn',
    nplus: 'N+1-Query', count: 'Requests', avg: 'Durchschnitt', p50: 'p50', p99: 'p99', note: 'Eine Seite mit 20 Requests: Die meisten Nutzer treffen den p95.', pageHit: (p: string) => `${p} der Seiten mit 20 Requests treffen einen langsamen`,
    n: 'n (Pets)', time: 'Zeit', linear: 'O(n)-Suche', quad: 'Dedupe + Suche', same: 'sieht gleich aus', thresh: '+20 % vs. Baseline', fail: 'Regression',
  },
};
