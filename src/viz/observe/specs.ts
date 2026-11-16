// Bilingual copy for each mode. Captions: one sentence. Labels: <= 3 words.
export type Lang = 'en' | 'de';
export const MODES = ['tracing', 'profiling', 'logs-events', 'monitoring', 'exception-tracking', 'real-user-monitoring', 'auditing', 'ab-tests'] as const;
export type Mode = (typeof MODES)[number];
interface Text { caption: string; takeaway: string; toggle: string; toggleOn?: string }
export type Spec = Record<Lang, Text>;

export const SPECS: Record<Mode, Spec> = {
  tracing: {
    en: { caption: 'One reservation request as a trace: twelve inventory calls hide inside a single slow endpoint.', takeaway: 'A trace shows where the time goes, not just that it is slow.', toggle: 'Batch inventory calls' },
    de: { caption: 'Eine Reservierungsanfrage als Trace: zwölf inventory-Aufrufe verstecken sich in einem einzigen langsamen Endpoint.', takeaway: 'Ein Trace zeigt, wo die Zeit bleibt, nicht nur dass es langsam ist.', toggle: 'Inventory-Calls bündeln' },
  },
  profiling: {
    en: { caption: 'A flame graph of the reservation endpoint shows which function eats the CPU, release by release.', takeaway: 'Compare two profiles and the regression lights up.', toggle: 'Release 1.5' },
    de: { caption: 'Ein Flame Graph des Reservierungs-Endpoints zeigt, welche Funktion die CPU frisst, Release für Release.', takeaway: 'Zwei Profile vergleichen, und die Regression leuchtet auf.', toggle: 'Release 1.5' },
  },
  'logs-events': {
    en: { caption: 'Structured events can be queried for an invariant, free-text logs cannot.', takeaway: 'Log facts as fields, then ask questions of them.', toggle: 'Free-text logs' },
    de: { caption: 'Strukturierte Events lassen sich auf eine Invariante abfragen, Freitext-Logs nicht.', takeaway: 'Fakten als Felder loggen, dann Fragen stellen.', toggle: 'Freitext-Logs' },
  },
  monitoring: {
    en: { caption: 'When a button breaks, errors and latency stay green and only the business metric raises the alarm.', takeaway: 'Monitor what users do, not just what servers do.', toggle: 'Replay' },
    de: { caption: 'Wenn ein Button kaputtgeht, bleiben Fehler und Latenz grün und nur die Business-Metrik schlägt Alarm.', takeaway: 'Überwache, was Nutzer tun, nicht nur, was Server tun.', toggle: 'Replay' },
  },
  'exception-tracking': {
    en: { caption: 'Errors grouped by fingerprint make a brand-new failure in release 1.4.2 stand out at once.', takeaway: 'Group errors per release and a new group is a signal.', toggle: 'Show trace' },
    de: { caption: 'Nach Fingerprint gruppierte Fehler lassen einen neuen Fehler in Release 1.4.2 sofort auffallen.', takeaway: 'Fehler pro Release gruppieren, und eine neue Gruppe ist ein Signal.', toggle: 'Trace zeigen' },
  },
  'real-user-monitoring': {
    en: { caption: 'Lab runs on a fast laptop look fine while real users on phones and trains blow the load-time budget.', takeaway: 'Measure real users; the lab only shows the best case.', toggle: 'Phones and trains' },
    de: { caption: 'Lab-Läufe auf einem schnellen Laptop sehen gut aus, während echte Nutzer auf Handys und im Zug das Ladezeit-Budget sprengen.', takeaway: 'Echte Nutzer messen; das Lab zeigt nur den Bestfall.', toggle: 'Handys und Zug' },
  },
  auditing: {
    en: { caption: 'With a separate agent identity a scheduled query flags the out-of-scope delete, with a shared admin token nobody can say who did it.', takeaway: 'Give every agent its own identity.', toggle: 'Shared admin token' },
    de: { caption: 'Mit eigener Agent-Identität markiert eine geplante Abfrage das Löschen außerhalb des Scopes, mit geteiltem Admin-Token kann niemand sagen, wer es war.', takeaway: 'Jeder Agent bekommt eine eigene Identität.', toggle: 'Geteiltes Admin-Token' },
  },
  'ab-tests': {
    en: { caption: 'Peeking every day declares a false winner on day 2, while the planned sample on day 21 shows no difference.', takeaway: 'Fix the sample size first, then look once.', toggle: 'Peek daily' },
    de: { caption: 'Tägliches Nachschauen kürt an Tag 2 einen falschen Sieger, während die geplante Stichprobe an Tag 21 keinen Unterschied zeigt.', takeaway: 'Erst die Stichprobengröße festlegen, dann einmal schauen.', toggle: 'Täglich nachschauen' },
  },
};
export const isMode = (m: string): m is Mode => (MODES as readonly string[]).includes(m);
