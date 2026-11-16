/** Canary rollout simulation: stepped traffic shift with automated analysis. */
import { rng } from './rng';

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
  if (weight < 100 && rate(v2, 'err') > rate(v1, 'err') + 0.01) return { weight, v1, v2, decision: 'rollback', reason: 'errors' };
  if (weight < 100 && o.businessMetric && rate(v2, 'wrong') > rate(v1, 'wrong') + 0.01) return { weight, v1, v2, decision: 'rollback', reason: 'business' };
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
