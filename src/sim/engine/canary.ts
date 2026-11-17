/** Canary rollout simulation: stepped traffic shift with automated analysis. */
import { rng } from './rng';
import type { Outcome } from './outcome';

/** The analysis rolls back when v2's rate is above v1's rate + this margin (1 percentage point). */
export const MARGIN = 0.01;

export type Bug = 'none' | 'errors' | 'silent';
export interface CanaryOptions { bug: Bug; businessMetric: boolean; seed: number }
export const STAGES = [5, 25, 50, 100];
export interface Counts { req: number; err: number; wrong: number }
export interface StageResult { weight: number; v1: Counts; v2: Counts; decision: 'promote' | 'rollback'; reason: 'errors' | 'business' | null }

const BASE_ERR = 0.004;

export function serve(version: 1 | 2, bug: Bug, r: () => number): { error: boolean; wrong: boolean } {
  const error = r() < BASE_ERR + (version === 2 && bug === 'errors' ? 0.08 : 0);
  const wrong = !error && version === 2 && bug === 'silent' && r() < 0.3;
  return { error, wrong };
}

/** Run one analysis window (`n` requests) at the given canary weight. */
export function runStage(weight: number, o: CanaryOptions, r: () => number, n = 2000): StageResult {
  const v1: Counts = { req: 0, err: 0, wrong: 0 }, v2: Counts = { req: 0, err: 0, wrong: 0 };
  for (let i = 0; i < n; i++) {
    const ver: 1 | 2 = r() * 100 < weight ? 2 : 1;
    const c = ver === 1 ? v1 : v2;
    const s = serve(ver, o.bug, r);
    c.req++; if (s.error) c.err++; if (s.wrong) c.wrong++;
  }
  const rate = (c: Counts, k: 'err' | 'wrong') => (c.req ? c[k] / c.req : 0);
  if (weight < 100 && rate(v2, 'err') > rate(v1, 'err') + MARGIN) return { weight, v1, v2, decision: 'rollback', reason: 'errors' };
  if (weight < 100 && o.businessMetric && rate(v2, 'wrong') > rate(v1, 'wrong') + MARGIN) return { weight, v1, v2, decision: 'rollback', reason: 'business' };
  return { weight, v1, v2, decision: 'promote', reason: null };
}

export function simulate(o: CanaryOptions): StageResult[] {
  const r = rng(o.seed);
  const out: StageResult[] = [];
  for (const w of STAGES) {
    const s = runStage(w, o, r);
    out.push(s);
    if (s.decision === 'rollback') break;
  }
  return out;
}

/** How many users saw the bug before the rollout ended (vs. a big-bang release). */
export function affected(stages: StageResult[]): number {
  return stages.reduce((a, s) => a + s.v2.err + s.v2.wrong, 0);
}

/* ───── Outcome for the result panel (see src/sim/ui/kit.ts) ───── */

export type CanaryCause =
  | 'promoted' // no bug, v2 reached 100%
  | 'rollback-errors' // the crash bug pushed the error rate over the limit
  | 'rollback-business' // the silent bug pushed the wrong-price rate over the limit
  | 'silent-missed' // the silent bug reached 100%: the analysis did not measure prices
  | 'missed' // a bug reached 100% although its metric was watched (chance)
  | 'false-alarm'; // rolled back, but not because of v2's bug (random noise)

export interface StageRates { weight: number; v1Req: number; v2Req: number; v1Err: number; v2Err: number; v1Wrong: number; v2Wrong: number }
export interface CanaryValues {
  bug: Bug;
  businessMetric: boolean;
  /** 1-based number of the last stage that ran, and its traffic weight in % */
  stage: number;
  weight: number;
  /** the metric that crossed its limit (rollbacks only) */
  metric?: 'errors' | 'business';
  /** rates in % at the deciding stage, and the limit (v1 rate + 1 percentage point) */
  v1Rate?: number;
  v2Rate?: number;
  limit?: number;
  /** v2 requests and how many of them had the problem, at the deciding stage */
  v2Req?: number;
  v2Hits?: number;
  /** requests that hit the bug over the whole rollout */
  affected: number;
  /** all v2 requests over the whole rollout */
  v2Total: number;
  /** wrong prices over the whole rollout (silent bug) */
  wrong: number;
  stages: StageRates[];
}
export type CanaryOutcome = Outcome<CanaryCause, CanaryValues>;

const pct = (n: number, d: number) => (d ? (100 * n) / d : 0);
const rates = (s: StageResult): StageRates => ({ weight: s.weight, v1Req: s.v1.req, v2Req: s.v2.req, v1Err: pct(s.v1.err, s.v1.req), v2Err: pct(s.v2.err, s.v2.req), v1Wrong: pct(s.v1.wrong, s.v1.req), v2Wrong: pct(s.v2.wrong, s.v2.req) });

/** Verdict, cause and numbers of one rollout. Pure. */
export function canaryOutcome(o: Pick<CanaryOptions, 'bug' | 'businessMetric'>, stages: StageResult[]): CanaryOutcome {
  const last = stages[stages.length - 1]!;
  const base: CanaryValues = {
    bug: o.bug, businessMetric: o.businessMetric, stage: stages.length, weight: last.weight,
    affected: affected(stages), v2Total: stages.reduce((a, s) => a + s.v2.req, 0), wrong: stages.reduce((a, s) => a + s.v2.wrong, 0), stages: stages.map(rates),
  };
  if (last.decision === 'rollback') {
    const metric = last.reason!;
    const k = metric === 'errors' ? 'err' : 'wrong';
    const v1Rate = pct(last.v1[k], last.v1.req), v2Rate = pct(last.v2[k], last.v2.req);
    const values = { ...base, metric, v1Rate, v2Rate, limit: v1Rate + 100 * MARGIN, v2Req: last.v2.req, v2Hits: last.v2[k] };
    const matches = (metric === 'errors' && o.bug === 'errors') || (metric === 'business' && o.bug === 'silent');
    if (!matches) return { status: 'warn', causeId: 'false-alarm', values };
    return { status: 'fail', causeId: metric === 'errors' ? 'rollback-errors' : 'rollback-business', values };
  }
  if (o.bug === 'none') return { status: 'pass', causeId: 'promoted', values: base };
  if (o.bug === 'silent' && !o.businessMetric) return { status: 'warn', causeId: 'silent-missed', values: base };
  return { status: 'warn', causeId: 'missed', values: base };
}

const f1 = (x: number) => `${x.toFixed(1)}%`;
/** The analysis log in a neutral format (modelled on canary analysis tools such as Argo Rollouts or Flagger, not their exact output). */
export function canaryReport(o: Pick<CanaryOptions, 'bug' | 'businessMetric'>, stages: StageResult[]): string {
  const out = ['rollout reservation-service v1 → v2'];
  stages.forEach((s, i) => {
    const r = rates(s);
    const state = (v1: number, v2: number, reason: 'errors' | 'business') => (s.weight >= 100 ? 'not checked' : v2 > v1 + 100 * MARGIN ? (s.reason === reason ? 'FAILED' : 'above limit') : 'ok');
    out.push(`step ${i + 1}  weight ${s.weight}%  (${s.v2.req} requests to v2)`);
    out.push(`  error-rate   v1 ${f1(r.v1Err)}  v2 ${f1(r.v2Err)}  limit ${f1(r.v1Err + 100 * MARGIN)}  ${state(r.v1Err, r.v2Err, 'errors')}`);
    if (o.businessMetric) out.push(`  wrong-price  v1 ${f1(r.v1Wrong)}  v2 ${f1(r.v2Wrong)}  limit ${f1(r.v1Wrong + 100 * MARGIN)}  ${state(r.v1Wrong, r.v2Wrong, 'business')}`);
  });
  const last = stages[stages.length - 1]!;
  out.push(last.decision === 'rollback' ? `result: ABORTED at ${last.weight}%, all traffic back to v1` : 'result: PROMOTED, v2 serves 100%');
  return out.join('\n');
}
