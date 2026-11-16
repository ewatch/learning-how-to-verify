// Pure, seeded data for the 'observe' diagram family. No DOM access here.
import { rng } from '../../sim/engine/rng';

// ---------- tracing ----------
export interface Span { id: string; label: string; start: number; dur: number; depth: number; hot?: boolean }

/** Spans of GET /pets/rex/reserve (ms). Unbatched: inventory is called 12x sequentially (N+1). */
export function traceSpans(batched: boolean): Span[] {
  if (batched) {
    return [
      { id: 'gw', label: 'gateway', start: 0, dur: 278, depth: 0 },
      { id: 'res', label: 'reservation-svc', start: 8, dur: 262, depth: 1 },
      { id: 'inv', label: 'inventory ×1', start: 30, dur: 44, depth: 2 },
      { id: 'db', label: 'db', start: 80, dur: 80, depth: 2 },
      { id: 'pay', label: 'payment', start: 166, dur: 96, depth: 2 },
    ];
  }
  const inv: Span[] = Array.from({ length: 12 }, (_, i) => ({ id: `inv${i}`, label: `inventory #${i + 1}`, start: 30 + i * 34, dur: 28, depth: 2, hot: true }));
  return [
    { id: 'gw', label: 'gateway', start: 0, dur: 640, depth: 0 },
    { id: 'res', label: 'reservation-svc', start: 8, dur: 624, depth: 1 },
    ...inv,
    { id: 'db', label: 'db', start: 438, dur: 80, depth: 2 },
    { id: 'pay', label: 'payment', start: 524, dur: 96, depth: 2 },
  ];
}
export const traceTotal = (s: Span[]) => Math.max(...s.map((x) => x.start + x.dur));
export const inventoryCalls = (s: Span[]) => s.filter((x) => x.id.startsWith('inv')).length;

// ---------- profiling ----------
export type Release = '1.4' | '1.5';
export interface Frame { name: string; pct: number; x: number; depth: number; prev: number }
const FLAME: Record<Release, [string, number, number][]> = {
  // [name, pct, depth]; depth-2 frames belong to the preceding depth-1 frame
  '1.4': [['auth', 10, 1], ['parse JSON', 8, 1], ['reserve logic', 22, 1], ['db query', 45, 1], ['pg driver', 30, 2], ['serialize', 15, 1]],
  '1.5': [['auth', 6, 1], ['parse JSON', 38, 1], ['reserve logic', 14, 1], ['db query', 30, 1], ['pg driver', 20, 2], ['serialize', 12, 1]],
};
export function flameFrames(rel: Release): Frame[] {
  const other = FLAME[rel === '1.4' ? '1.5' : '1.4'];
  const prevOf = (n: string) => other.find((f) => f[0] === n)![1];
  const out: Frame[] = [{ name: 'POST /reserve', pct: 100, x: 0, depth: 0, prev: 100 }];
  let x = 0;
  let parentX = 0;
  for (const [name, pct, depth] of FLAME[rel]) {
    if (depth === 1) { parentX = x; out.push({ name, pct, x, depth, prev: prevOf(name) }); x += pct; }
    else out.push({ name, pct, x: parentX, depth, prev: prevOf(name) });
  }
  return out;
}
export const frameDelta = (f: Frame, rel: Release) => (rel === '1.5' ? f.pct - f.prev : 0);

// ---------- logs & events ----------
export interface PetEvent { t: number; type: 'reserved' | 'released' | 'adopted'; petId: string; person: string }
const PEOPLE = ['Anna', 'Ben', 'Carla', 'Dev', 'Eli', 'Fay'];
const PETS = ['mia', 'otto', 'luna', 'max', 'bella'];

/** Event stream where every pet is reserved/released cleanly, except Rex: Anna and Ben both hold it. */
export function eventStream(seed = 7): PetEvent[] {
  const r = rng(seed);
  const evs: PetEvent[] = [];
  let t = 0;
  const push = (type: PetEvent['type'], petId: string, person: string) => { t += 1 + Math.floor(r() * 4); evs.push({ t, type, petId, person }); };
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)]!;
  for (let i = 0; i < 6; i++) {
    const pet = PETS[i % PETS.length]!;
    const p = pick(PEOPLE.slice(2));
    push('reserved', pet, p);
    if (i === 2) { push('reserved', 'rex', 'Anna'); }
    if (i === 3) { push('reserved', 'rex', 'Ben'); }
    push(i % 3 === 0 ? 'adopted' : 'released', pet, p);
  }
  return evs;
}

/** Invariant: no pet has two active reservations. Returns the offending pair(s). */
export function findViolations(evs: PetEvent[]): [PetEvent, PetEvent][] {
  const active = new Map<string, PetEvent>();
  const out: [PetEvent, PetEvent][] = [];
  for (const e of evs) {
    if (e.type === 'reserved') {
      const cur = active.get(e.petId);
      if (cur) out.push([cur, e]);
      else active.set(e.petId, e);
    } else active.delete(e.petId);
  }
  return out;
}

const VERB: Record<PetEvent['type'], string[]> = {
  reserved: ['{p} grabbed {a} for now', '{a} is now with {p}'],
  released: ['{p} gave {a} back', '{a} returned by {p}'],
  adopted: ['{p} took {a} home for good', '{a} found a home: {p}'],
};
/** The same events as unstructured prose. */
export function freeTextLines(evs: PetEvent[]): string[] {
  return evs.map((e, i) => VERB[e.type][i % 2]!.replace('{p}', e.person).replace('{a}', e.petId[0]!.toUpperCase() + e.petId.slice(1)));
}
/** Structured line format `type petId=x person=y`; prose does not parse. */
export const structuredLine = (e: PetEvent) => `${e.type} petId=${e.petId} person=${e.person}`;
export function parseLine(line: string): PetEvent | null {
  const m = /^(reserved|released|adopted) petId=(\w+) person=(\w+)$/.exec(line);
  return m ? { t: 0, type: m[1] as PetEvent['type'], petId: m[2]!, person: m[3]! } : null;
}
/** Run the invariant over raw lines: only parseable lines take part. */
export function queryLines(lines: string[]): { parsed: number; total: number; violations: [PetEvent, PetEvent][] } {
  const evs = lines.map(parseLine).filter((e): e is PetEvent => e !== null);
  return { parsed: evs.length, total: lines.length, violations: findViolations(evs) };
}

// ---------- monitoring ----------
export const SIGNALS = ['latency', 'traffic', 'errors', 'saturation', 'reservations'] as const;
export type Signal = (typeof SIGNALS)[number];
export const BREAK_MINUTE = 40;
export const MINUTES = 60;
export type Series = Record<Signal, number[]>;

/** One hour; at minute 40 a broken button stops reservations but nothing else changes. */
export function monitoringScenario(broken = true, seed = 3): Series {
  const r = rng(seed);
  const j = (base: number, amp: number) => base + (r() - 0.5) * 2 * amp;
  const s: Series = { latency: [], traffic: [], errors: [], saturation: [], reservations: [] };
  for (let m = 0; m < MINUTES; m++) {
    s.latency.push(j(180, 15));
    s.traffic.push(j(300, 20));
    s.errors.push(j(0.4, 0.15));
    s.saturation.push(j(45, 4));
    s.reservations.push(broken && m >= BREAK_MINUTE ? 0 : j(22, 3));
  }
  return s;
}
export const RULES: Record<Signal, { dir: 'up' | 'down'; limit: number }> = {
  latency: { dir: 'up', limit: 400 },
  traffic: { dir: 'down', limit: 150 },
  errors: { dir: 'up', limit: 2 },
  saturation: { dir: 'up', limit: 85 },
  reservations: { dir: 'down', limit: 8 },
};
/** Signals whose last three points (up to minute `upTo`) all breach their rule. */
export function alertsAt(s: Series, upTo = MINUTES - 1): Signal[] {
  return SIGNALS.filter((k) => {
    const pts = s[k].slice(Math.max(0, upTo - 2), upTo + 1);
    const { dir, limit } = RULES[k];
    return pts.length === 3 && pts.every((v) => (dir === 'up' ? v > limit : v < limit));
  });
}
export const SLO_BUDGET = 0.02;
export const BURN_ALERT = 14.4;
/** Burn rate over the last 10 minutes: share of bad minutes divided by the error budget. */
export function burnRate(s: Series, upTo = MINUTES - 1): number {
  const pts = s.reservations.slice(Math.max(0, upTo - 9), upTo + 1);
  const bad = pts.filter((v) => v < RULES.reservations.limit).length;
  return bad / 10 / SLO_BUDGET;
}

// ---------- exception tracking ----------
export const RELEASES = ['1.4.1', '1.4.2'] as const;
export interface ExGroup { fp: string; title: string; where: string; counts: Record<string, number>; trace: string[] }
export const EX_GROUPS: ExGroup[] = [
  { fp: 'a1f3', title: 'TimeoutError', where: 'db.query', counts: { '1.4.1': 120, '1.4.2': 115 }, trace: ['TimeoutError: query exceeded 2000 ms', 'at db.query (db.ts:88)', 'at loadPet (pets.ts:31)', 'at reservePet (reserve.ts:20)'] },
  { fp: 'c9d2', title: 'ValidationError', where: 'reserve.ts', counts: { '1.4.1': 60, '1.4.2': 58 }, trace: ['ValidationError: petId missing', 'at parseBody (reserve.ts:12)', 'at handler (reserve.ts:7)'] },
  { fp: '5b7e', title: 'RateLimitError', where: 'payment', counts: { '1.4.1': 40, '1.4.2': 44 }, trace: ['RateLimitError: 429 from payment', 'at charge (payment.ts:54)', 'at reservePet (reserve.ts:47)'] },
  { fp: 'e05a', title: 'TypeError', where: 'reservePet', counts: { '1.4.1': 0, '1.4.2': 37 }, trace: ["TypeError: cannot read 'email' of undefined", 'at notifyOwner (notify.ts:19)', 'at reservePet (reserve.ts:42)', 'user: ••••   ip: ••••'] },
];
export const groupsIn = (rel: string) => EX_GROUPS.filter((g) => (g.counts[rel] ?? 0) > 0).map((g) => g.fp);
/** Fingerprints seen in `cur` but never in `prev`. */
export const newGroups = (prev: string, cur: string) => groupsIn(cur).filter((f) => !groupsIn(prev).includes(f));

// ---------- real user monitoring ----------
export const LCP_BUDGET = 2.5;
export const RUM_MAX = 8;
export interface Mix { desktop: number; phone: number; train: number }
export const MIX_ALL: Mix = { desktop: 0.5, phone: 0.35, train: 0.15 };
export const MIX_DESKTOP: Mix = { desktop: 1, phone: 0, train: 0 };
function logn(r: () => number, median: number, sigma: number) {
  const u = Math.max(r(), 1e-9), v = r();
  return median * Math.exp(sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
}
export function labSamples(n = 600, seed = 11): number[] {
  const r = rng(seed);
  return Array.from({ length: n }, () => logn(r, 1.1, 0.15));
}
export function realSamples(mix: Mix, n = 600, seed = 12): number[] {
  const r = rng(seed);
  return Array.from({ length: n }, () => {
    const x = r();
    return x < mix.desktop ? logn(r, 1.3, 0.3) : x < mix.desktop + mix.phone ? logn(r, 2.6, 0.4) : logn(r, 4.5, 0.45);
  });
}
export function percentile(xs: number[], p: number): number {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]!;
}
export function histogram(xs: number[], step = 0.25): number[] {
  const bins = new Array(Math.round(RUM_MAX / step)).fill(0) as number[];
  for (const x of xs) bins[Math.min(bins.length - 1, Math.floor(x / step))]!++;
  return bins.map((b) => (b / xs.length) * 100);
}

// ---------- auditing ----------
export interface AuditEvent { time: string; actor: string; kind: 'human' | 'agent' | 'unknown'; action: string; count: number }
export const AGENT_SCOPE = ['read', 'update', 'reserve'];
const AUDIT: AuditEvent[] = [
  { time: '09:02', actor: 'maria', kind: 'human', action: 'read', count: 1 },
  { time: '09:10', actor: 'maria', kind: 'human', action: 'update', count: 1 },
  { time: '09:31', actor: 'agent-7', kind: 'agent', action: 'update', count: 3 },
  { time: '09:47', actor: 'agent-7', kind: 'agent', action: 'reserve', count: 1 },
  { time: '10:05', actor: 'tom', kind: 'human', action: 'export', count: 1 },
  { time: '10:20', actor: 'agent-7', kind: 'agent', action: 'delete', count: 40 },
  { time: '10:41', actor: 'maria', kind: 'human', action: 'read', count: 1 },
];
export function auditEvents(shared: boolean): AuditEvent[] {
  return AUDIT.map((e) => (shared ? { ...e, actor: 'admin', kind: 'unknown' as const } : e));
}
/** Scheduled query: agent identities acting outside their scope. */
export const auditFlags = (evs: AuditEvent[]) => evs.filter((e) => e.kind === 'agent' && !AGENT_SCOPE.includes(e.action));

// ---------- A/B tests ----------
export const AB_DAYS = 28;
export const AB_PLANNED_DAY = 21;
export const AB_DAILY = 500;
export const AB_SEED = 91; // fixed: a peeker sees B "win" on day 2; the planned day-21 result is flat
export interface AbDay { day: number; nA: number; cA: number; nB: number; cB: number; rA: number; rB: number; ciA: number; ciB: number; z: number }
/** Cumulative A/B data with no real difference (both arms 10 %). */
export function abSeries(seed: number = AB_SEED): AbDay[] {
  const r = rng(seed);
  let cA = 0, cB = 0;
  const out: AbDay[] = [];
  for (let d = 1; d <= AB_DAYS; d++) {
    for (let i = 0; i < AB_DAILY; i++) { if (r() < 0.1) cA++; if (r() < 0.1) cB++; }
    const n = d * AB_DAILY, rA = cA / n, rB = cB / n;
    const pool = (cA + cB) / (2 * n);
    const se = Math.sqrt(pool * (1 - pool) * (2 / n));
    out.push({ day: d, nA: n, cA, nB: n, cB, rA, rB, ciA: 1.96 * Math.sqrt((rA * (1 - rA)) / n), ciB: 1.96 * Math.sqrt((rB * (1 - rB)) / n), z: se ? (rB - rA) / se : 0 });
  }
  return out;
}
export const isSignificant = (d: AbDay) => Math.abs(d.z) > 1.96;
/** First day a daily peeker would stop because B "wins". */
export const peekStopDay = (s: AbDay[]) => s.find((d) => d.day >= 2 && isSignificant(d) && d.z > 0)?.day ?? null;
