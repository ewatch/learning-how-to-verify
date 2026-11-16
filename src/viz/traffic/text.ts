import type { Mode } from './logic';

export type Lang = 'en' | 'de';
type Bi = { en: string; de: string };
export interface Spec { caption: Bi; takeaway: Bi; hypothesis?: Bi }

/** One-sentence caption and one-line takeaway per mode (EN + DE). */
export const SPECS: Record<Mode, Spec> = {
  'traffic-shaping': {
    caption: { en: 'A proxy splits requests between v1 and v2 by weight or header, and a circuit breaker sheds load when v2 slows down.', de: 'Ein Proxy verteilt Anfragen per Gewicht oder Header auf v1 und v2, und ein Circuit Breaker wirft Last ab, wenn v2 langsam wird.' },
    takeaway: { en: 'Choose who meets the new version, and keep a slow one from dragging everything down.', de: 'Bestimme, wer die neue Version trifft, und verhindere, dass eine langsame alles mitreißt.' },
  },
  shadowing: {
    caption: { en: 'Every request is copied to a shadow version whose answers are thrown away, so users only ever see v1.', de: 'Jede Anfrage wird an eine Shadow-Version kopiert, deren Antworten verworfen werden, sodass Nutzer nur v1 sehen.' },
    takeaway: { en: 'Real traffic, zero user risk: see how v2 fails without anyone feeling it.', de: 'Echter Traffic ohne Nutzerrisiko: Sieh, wie v2 scheitert, ohne dass es jemand merkt.' },
  },
  'tap-compare': {
    caption: { en: 'Copies go to old and new, and a field-by-field diff separates harmless noise from real differences.', de: 'Kopien gehen an alt und neu, und ein Feld-für-Feld-Diff trennt harmloses Rauschen von echten Unterschieden.' },
    takeaway: { en: 'Compare two old instances first, so only the price change stays red.', de: 'Vergleiche zuerst zwei alte Instanzen, damit nur die Preisänderung rot bleibt.' },
  },
  teeing: {
    caption: { en: 'A copy of live requests is scrubbed of personal data, recorded, and later replayed against a test deployment.', de: 'Eine Kopie der Live-Requests wird von personenbezogenen Daten bereinigt, aufgezeichnet und später gegen ein Test-Deployment abgespielt.' },
    takeaway: { en: 'Record production once, replay it as often as you like, minus the personal data.', de: 'Einmal Produktion aufzeichnen, beliebig oft abspielen, ohne personenbezogene Daten.' },
  },
  'chaos-testing': {
    caption: { en: 'Injecting latency into payment shows whether the reservation page survives, with and without a timeout and fallback.', de: 'Latenz im Payment-Dienst zeigt, ob die Reservierungsseite überlebt, mit und ohne Timeout und Fallback.' },
    takeaway: { en: 'Test the hypothesis on purpose, before a real outage tests it for you.', de: 'Prüfe die Hypothese absichtlich, bevor ein echter Ausfall es für dich tut.' },
    hypothesis: { en: 'Hypothesis: if payment is slow, reservations still succeed.', de: 'Hypothese: Ist Payment langsam, klappen Reservierungen trotzdem.' },
  },
  'dynamic-exploration': {
    caption: { en: 'An explorer bot built from the OpenAPI spec tries request sequences until one rare order returns a 500.', de: 'Ein aus der OpenAPI-Spec gebauter Explorer-Bot probiert Request-Folgen, bis eine seltene Reihenfolge einen 500 liefert.' },
    takeaway: { en: 'Bugs hide in sequences nobody wrote a test for; the explorer finds them.', de: 'Fehler verstecken sich in Abläufen, für die niemand einen Test schrieb; der Explorer findet sie.' },
  },
};

/** Small labels (each at most three words). */
export const L: Record<Lang, Record<string, string>> = {
  en: {
    users: 'users', proxy: 'proxy', play: 'Play', pause: 'Pause', restart: 'Restart', replayTape: 'Replay tape',
    share: 'v2 share', staffRoute: 'staff → v2', slow: 'v2 slow', breaker: 'circuit breaker', open: 'open', closed: 'closed', half: 'probing',
    callsV2: 'calls to v2', retries: 'retries', shed: 'shed', staff: 'staff',
    shadow: 'shadow', bin: 'bin', discarded: 'discarded', shadowErr: 'shadow errors', usersSaw: 'users served', stubbed: 'mail, pay stubbed', shadowBug: 'shadow has bugs',
    oldA: 'old A', oldB: 'old B', neu: 'new', diff: 'diff', noise: 'noise', real: 'real', same: 'same', learn: 'learn noise', compare: 'compare',
    tee: 'tee', scrub: 'scrub PII', prod: 'prod', tape: 'tape', recorded: 'recorded', replayed: 'replayed', testDeploy: 'test deploy', nameMask: 'name → •••', lastRec: 'on tape',
    payment: 'payment', reserve: 'reservation', threads: 'threads', delay: 'payment delay', fallback: 'timeout + fallback', page: 'reservation page', pageOk: 'works', pageDegraded: 'works, payment pending', pageSlow: 'waits for payment', pageDown: 'fails', inflight: 'in flight',
    spec: 'OpenAPI', calls: 'calls', seq: 'sequence',
  },
  de: {
    users: 'Nutzer', proxy: 'Proxy', play: 'Start', pause: 'Pause', restart: 'Neu starten', replayTape: 'Band abspielen',
    share: 'v2-Anteil', staffRoute: 'Team → v2', slow: 'v2 langsam', breaker: 'Circuit Breaker', open: 'offen', closed: 'zu', half: 'Probeaufruf',
    callsV2: 'Aufrufe an v2', retries: 'Retries', shed: 'abgeworfen', staff: 'Team',
    shadow: 'Shadow', bin: 'Tonne', discarded: 'verworfen', shadowErr: 'Shadow-Fehler', usersSaw: 'Nutzer bedient', stubbed: 'Mail, Pay gestubbt', shadowBug: 'Shadow mit Bugs',
    oldA: 'alt A', oldB: 'alt B', neu: 'neu', diff: 'Diff', noise: 'Rauschen', real: 'echt', same: 'gleich', learn: 'Rauschen lernen', compare: 'vergleichen',
    tee: 'Tee', scrub: 'PII entfernen', prod: 'Prod', tape: 'Band', recorded: 'aufgezeichnet', replayed: 'abgespielt', testDeploy: 'Test-Deploy', nameMask: 'Name → •••', lastRec: 'auf Band',
    payment: 'Payment', reserve: 'Reservierung', threads: 'Threads', delay: 'Payment-Verzögerung', fallback: 'Timeout + Fallback', page: 'Reservierungsseite', pageOk: 'läuft', pageDegraded: 'läuft, Zahlung offen', pageSlow: 'wartet auf Zahlung', pageDown: 'fällt aus', inflight: 'in Arbeit',
    spec: 'OpenAPI', calls: 'Aufrufe', seq: 'Folge',
  },
};
