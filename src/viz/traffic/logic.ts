// Pure simulation logic for the `traffic` diagram family (no DOM). Seeded, deterministic, unit-tested.
import { rng } from '../../sim/engine/rng';

export const MODES = ['traffic-shaping', 'shadowing', 'tap-compare', 'teeing', 'chaos-testing', 'dynamic-exploration'] as const;
export type Mode = (typeof MODES)[number];

/* ---------- traffic shaping ---------- */
export type Route = 'v1' | 'v2';

/** Header route "staff -> v2" wins over the weighted split. `r` is a uniform [0,1) draw. */
export function route(weightV2: number, staff: boolean, headerRoute: boolean, r: number): Route {
  if (staff && headerRoute) return 'v2';
  return r * 100 < weightV2 ? 'v2' : 'v1';
}

export function routeMany(n: number, weightV2: number, staffShare: number, headerRoute: boolean, seed: number) {
  const r = rng(seed);
  const out = { v1: 0, v2: 0, staffV2: 0, staffTotal: 0 };
  for (let i = 0; i < n; i++) {
    const staff = r() < staffShare;
    const to = route(weightV2, staff, headerRoute, r());
    out[to]++;
    if (staff) { out.staffTotal++; if (to === 'v2') out.staffV2++; }
  }
  return out;
}

/** Circuit breaker: opens after `threshold` consecutive failures, probes once after `cooldown` seconds. */
export class Breaker {
  state: 'closed' | 'open' | 'half' = 'closed';
  fails = 0;
  openedAt = 0;
  probing = false;
  constructor(public threshold = 3, public cooldown = 3) {}
  allow(now: number): boolean {
    if (this.state === 'closed') return true;
    if (this.state === 'open' && now - this.openedAt >= this.cooldown) { this.state = 'half'; this.probing = false; }
    if (this.state === 'half' && !this.probing) { this.probing = true; return true; }
    return false;
  }
  record(ok: boolean, now: number) {
    this.probing = false;
    if (ok) { this.fails = 0; this.state = 'closed'; return; }
    this.fails++;
    if (this.state === 'half' || this.fails >= this.threshold) { this.state = 'open'; this.openedAt = now; }
  }
  reset() { this.state = 'closed'; this.fails = 0; this.openedAt = 0; this.probing = false; }
}

export const MAX_RETRIES = 2;
export const SLOW_FAIL_RATE = 0.9;

/** All requests target v2 (the slow service). Without a breaker every failure is retried; with one, load is shed. */
export function simulateBreaker(o: { breaker: boolean; slow: boolean; requests: number; seed: number; interval?: number }) {
  const r = rng(o.seed);
  const b = new Breaker();
  const dt = o.interval ?? 0.1;
  let attempts = 0, retries = 0, shed = 0, failed = 0, ok = 0;
  for (let i = 0; i < o.requests; i++) {
    const now = i * dt;
    if (o.breaker && !b.allow(now)) { shed++; continue; }
    let tries = 0;
    for (;;) {
      attempts++;
      const good = !o.slow || r() >= SLOW_FAIL_RATE;
      if (o.breaker) b.record(good, now);
      if (good) { ok++; break; }
      if (o.breaker || tries >= MAX_RETRIES) { failed++; break; }
      tries++; retries++;
    }
  }
  return { attempts, retries, shed, failed, ok };
}

/* ---------- shadowing ---------- */
export interface SideEffects { stubbed: boolean; sent: number; stub: number }
export function shadowCall(effects: SideEffects, errorRate: number, r: () => number) {
  // The shadow would send mail / take payment; the stub swallows it.
  if (effects.stubbed) effects.stub++; else effects.sent++;
  return { ok: r() >= errorRate };
}

export function simulateShadow(o: { n: number; shadowErrorRate: number; seed: number; stubbed?: boolean }) {
  const r = rng(o.seed);
  const fx: SideEffects = { stubbed: o.stubbed ?? true, sent: 0, stub: 0 };
  let userOk = 0, shadowErrors = 0, discarded = 0;
  for (let i = 0; i < o.n; i++) {
    userOk++; // users are always answered by v1
    const s = shadowCall(fx, o.shadowErrorRate, r);
    discarded++; // shadow responses never reach the user
    if (!s.ok) shadowErrors++;
  }
  return { userOk, shadowErrors, discarded, realEffects: fx.sent, stubbedEffects: fx.stub };
}

/* ---------- tap and compare ---------- */
export type Resp = Record<string, string | number>;
const pad = (n: number) => String(n % 60).padStart(2, '0');
/** A reservation response. id and timestamp differ on every call (noise); `new` has a real price change. */
export function makeResp(version: 'old' | 'new', seq: number): Resp {
  return { id: `r-${1040 + seq}`, ts: `12:00:${pad(seq)}`, price: version === 'old' ? '12.00' : '14.00', status: 200 };
}
/** Noise = fields that differ between two instances of the SAME (old) version. */
export function learnNoise(a: Resp, b: Resp): string[] {
  return Object.keys(a).filter((k) => a[k] !== b[k]);
}
export function classifyDiff(oldR: Resp, newR: Resp, noise: string[]) {
  const out = { noise: [] as string[], real: [] as string[], same: [] as string[] };
  for (const k of Object.keys(oldR)) {
    if (oldR[k] === newR[k]) out.same.push(k);
    else if (noise.includes(k)) out.noise.push(k);
    else out.real.push(k);
  }
  return out;
}

/* ---------- teeing ---------- */
export interface PetReq { name: string; email: string; petId: number }
const NAMES = ['Ada', 'Linus', 'Grace', 'Alan', 'Edsger', 'Barbara'];
export function sampleReq(i: number): PetReq {
  const name = NAMES[i % NAMES.length]!;
  return { name, email: `${name.toLowerCase()}@mail.example`, petId: 7 + (i % 5) };
}
export const MASK = '•••';
export function scrub(req: PetReq): PetReq { return { ...req, name: MASK, email: MASK }; }
export class Recorder {
  tape: PetReq[] = [];
  constructor(public cap = 12) {}
  record(req: PetReq): boolean {
    if (this.tape.length >= this.cap) return false;
    this.tape.push(scrub(req));
    return true;
  }
  replay(): PetReq[] { return this.tape.map((x) => ({ ...x })); }
}

/* ---------- chaos testing ---------- */
export const POOL = 8;
export const RATE = 6; // reservations per second
export const BASE_MS = 100;
export const TIMEOUT_MS = 800;
export type Outcome = 'ok' | 'pending' | 'failed';

/** Thread-pool model: each reservation holds a thread while it waits for payment. */
export class ChaosSim {
  t = 0;
  acc = 0;
  busy: { start: number; end: number; outcome: Outcome }[] = [];
  counts: Record<Outcome, number> = { ok: 0, pending: 0, failed: 0 };
  recent: Outcome[] = [];
  peak = 0;
  hooks: { arrive?: (accepted: boolean) => void; done?: (o: Outcome) => void } = {};
  constructor(public latencyMs: number, public fallback: boolean) {}
  get threads() { return this.busy.length; }
  private finish(o: Outcome) {
    this.counts[o]++;
    this.recent.push(o);
    if (this.recent.length > 12) this.recent.shift();
    this.hooks.done?.(o);
  }
  step(dt: number) {
    this.t += dt;
    const still: typeof this.busy = [];
    for (const b of this.busy) { if (b.end <= this.t) this.finish(b.outcome); else still.push(b); }
    this.busy = still;
    this.acc += dt * RATE;
    while (this.acc >= 1) {
      this.acc -= 1;
      const lat = this.latencyMs + BASE_MS;
      const timedOut = this.fallback && lat > TIMEOUT_MS;
      if (this.busy.length >= POOL) { this.hooks.arrive?.(false); this.finish('failed'); }
      else {
        this.hooks.arrive?.(true);
        this.busy.push({ start: this.t, end: this.t + (timedOut ? TIMEOUT_MS : lat) / 1000, outcome: timedOut ? 'pending' : 'ok' });
      }
    }
    this.peak = Math.max(this.peak, this.busy.length);
  }
  /** True while every thread is held: new reservations are rejected. */
  get saturated() { return this.busy.length >= POOL; }
  /** Reservation page verdict from the pool state and the most recent outcomes. */
  get page(): 'ok' | 'slow' | 'degraded' | 'down' {
    if (this.saturated) return 'down';
    const n = this.recent.length || 1;
    const failed = this.recent.filter((x) => x === 'failed').length;
    if (failed / n >= 1 / 3) return 'down';
    if (this.recent.includes('pending')) return 'degraded';
    // without a timeout, requests that already wait longer than the timeout would are hanging
    if (this.busy.some((b) => b.outcome === 'ok' && this.t - b.start > TIMEOUT_MS / 1000)) return 'slow';
    return 'ok';
  }
}

export function simulateChaos(o: { latencyMs: number; fallback: boolean; seconds?: number }) {
  const s = new ChaosSim(o.latencyMs, o.fallback);
  const steps = Math.round((o.seconds ?? 20) / 0.05);
  for (let i = 0; i < steps; i++) s.step(0.05);
  return { ...s.counts, peak: s.peak, page: s.page };
}

/* ---------- dynamic exploration ---------- */
export const API_NODES = ['list', 'get', 'reserve', 'cancel', 'pay'] as const;
export type ApiNode = (typeof API_NODES)[number];
export const API_EDGES: [ApiNode, ApiNode][] = [
  ['list', 'get'], ['get', 'list'], ['get', 'reserve'], ['reserve', 'cancel'], ['cancel', 'reserve'],
  ['reserve', 'reserve'], ['reserve', 'pay'], ['pay', 'list'], ['cancel', 'pay'],
];
export const BUG_SEQ: ApiNode[] = ['reserve', 'cancel', 'reserve', 'reserve'];
export const EXPLORE_SEED = 4;

/** The server under test: only this exact rare sequence of the last four calls crashes it. */
export function serverStatus(history: ApiNode[]): 200 | 500 {
  const last = history.slice(-BUG_SEQ.length);
  return last.length === BUG_SEQ.length && last.every((x, i) => x === BUG_SEQ[i]) ? 500 : 200;
}

/** Coverage-guided random walk: prefers edges it has used least. */
export function explore(seed: number, maxSteps = 200) {
  const r = rng(seed);
  const visits = new Map<string, number>();
  const steps: ApiNode[] = ['list'];
  let found = -1;
  for (let i = 0; i < maxSteps; i++) {
    const at = steps[steps.length - 1]!;
    const outs = API_EDGES.filter(([a]) => a === at);
    const w = outs.map(([a, b]) => 1 / (1 + (visits.get(a + '>' + b) ?? 0)) ** 2);
    let x = r() * w.reduce((p, q) => p + q, 0);
    let pick = outs[outs.length - 1]!;
    for (let k = 0; k < outs.length; k++) { x -= w[k]!; if (x <= 0) { pick = outs[k]!; break; } }
    const key = pick[0] + '>' + pick[1];
    visits.set(key, (visits.get(key) ?? 0) + 1);
    steps.push(pick[1]);
    if (serverStatus(steps) === 500) { found = steps.length - 1; break; }
  }
  const path = found >= 0 ? steps.slice(found - BUG_SEQ.length + 1, found + 1) : [];
  return { steps, found, path };
}
