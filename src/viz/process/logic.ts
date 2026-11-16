// Pure logic for the process diagrams (no DOM).

/** Nielsen/Landauer: share of usability problems found by n users, with per-user detection rate L. */
export const NIELSEN_L = 0.31;
export function nielsen(n: number, L = NIELSEN_L): number {
  return 1 - Math.pow(1 - L, Math.max(0, n));
}

/** Review attention: comments per 100 changed lines, falling with PR size. */
export function attention(lines: number): number {
  return 10 / (1 + Math.max(0, lines) / 100);
}
export const SPLIT_SIZE = 200;
/** Attention when the change is reviewed in steps of at most SPLIT_SIZE lines. */
export function attentionSplit(lines: number): number {
  return attention(Math.min(lines, SPLIT_SIZE));
}
export const stepsFor = (lines: number) => Math.max(1, Math.ceil(lines / SPLIT_SIZE));
export const isLgtm = (a: number) => a < 1;

// ---- evals: 12 tasks x 3 runs, before / after an AGENTS.md change ----
export type Variant = 'before' | 'after';
export type Grading = 'tests' | 'combined';
const PASS: Record<Variant, string[]> = {
  before: ['110100101000', '110110100000', '100100101001'],
  after: ['111101111010', '111101110010', '111111111010'],
};
/** Tasks that pass the tests but are wrong (found by differential check / human sample). */
export const HIDDEN = '010001001000';
export const TASKS = 12;
export function taskResult(v: Variant, run: number, task: number, g: Grading): 'pass' | 'fail' | 'overstated' {
  const pass = PASS[v][run]![task] === '1';
  if (!pass) return 'fail';
  if (g === 'combined' && HIDDEN[task] === '1') return 'overstated';
  return 'pass';
}
export function evalScores(v: Variant, g: Grading): { runs: number[]; mean: number; min: number; max: number } {
  const runs = PASS[v].map((_, r) => {
    let c = 0;
    for (let t = 0; t < TASKS; t++) if (taskResult(v, r, t, g) === 'pass') c++;
    return c / TASKS;
  });
  return { runs, mean: runs.reduce((a, b) => a + b, 0) / runs.length, min: Math.min(...runs), max: Math.max(...runs) };
}

// ---- agent rules ----
export type RuleLayer = 'prose' | 'static';
const FOLLOWED: Record<RuleLayer, number[]> = {
  prose: [1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
  static: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
};
export const ruleRuns = (l: RuleLayer) => FOLLOWED[l];
export const followedShare = (l: RuleLayer) => FOLLOWED[l].reduce((a, b) => a + b, 0) / FOLLOWED[l].length;

// ---- architecture ----
export type Mod = 'ui' | 'api' | 'domain' | 'db';
export type Edge = [Mod, Mod];
export const ALLOWED: Edge[] = [['ui', 'api'], ['api', 'domain'], ['domain', 'db']];
export function violations(edges: Edge[], allowed: Edge[] = ALLOWED): Edge[] {
  return edges.filter(([a, b]) => a !== b && !allowed.some(([x, y]) => x === a && y === b));
}
/** Does the build fail? Only if the rule is enforced as a test. */
export function archBuildFails(edges: Edge[], enforced: boolean): boolean {
  return enforced && violations(edges).length > 0;
}
