/**
 * Test-integrity exercise: five patches an agent might propose to make a failing test pass,
 * and four gates that judge them. Gates are real checks on the diff text; the holdout gate
 * really runs hidden tests against the patched code.
 */
import { loadSuite, type TestResult } from './jsrun';

export type GateId = 'protected' | 'noskip' | 'count' | 'holdout';
export const GATES: GateId[] = ['protected', 'noskip', 'count', 'holdout'];
export type PatchId = 'a' | 'b' | 'c' | 'd' | 'e';

export const SRC_PATH = 'src/reservations.js';
export const TEST_PATH = 'tests/reservations.test.js';

export const SRC_BUGGY = `function reserve(pets, petId, person) {
  const pet = pets[petId];
  if (!pet) return { ok: false, reason: 'unknown' };
  pet.reservedBy = person;
  return { ok: true };
}`;

export const TEST_ORIG = `test('a reserved pet cannot be reserved again', () => {
  const pets = { rex: { reservedBy: null } };
  expect(reserve(pets, 'rex', 'ann')).toEqual({ ok: true });
  expect(reserve(pets, 'rex', 'ben')).toEqual({ ok: false, reason: 'taken' });
});`;

/** Hidden tests: other pets, other people. They only run in CI; the agent never sees them. */
export const HOLDOUT_TESTS = `test('holdout: mia cannot be reserved twice', () => {
  const pets = { mia: { reservedBy: null } };
  expect(reserve(pets, 'mia', 'eva')).toEqual({ ok: true });
  expect(reserve(pets, 'mia', 'tom')).toEqual({ ok: false, reason: 'taken' });
});
test('holdout: same person cannot reserve cleo twice', () => {
  const pets = { cleo: { reservedBy: null } };
  expect(reserve(pets, 'cleo', 'eva')).toEqual({ ok: true });
  expect(reserve(pets, 'cleo', 'eva')).toEqual({ ok: false, reason: 'taken' });
});
test('holdout: unknown pet is rejected', () => {
  expect(reserve({}, 'ghost', 'eva')).toEqual({ ok: false, reason: 'unknown' });
});`;

const FIXED_LINE = `  if (pet.reservedBy) return { ok: false, reason: 'taken' };`;
const SRC_FIXED = SRC_BUGGY.replace('  pet.reservedBy = person;', `${FIXED_LINE}\n  pet.reservedBy = person;`);
const SRC_SPECIAL = SRC_BUGGY.replace("  pet.reservedBy = person;", "  if (petId === 'rex' && person === 'ben') return { ok: false, reason: 'taken' };\n  pet.reservedBy = person;");

export interface PatchFile { path: string; before: string; after: string }
export interface Patch { id: PatchId; cheating: boolean; files: PatchFile[] }

const srcFile = (after: string): PatchFile => ({ path: SRC_PATH, before: SRC_BUGGY, after });
const testFile = (after: string): PatchFile => ({ path: TEST_PATH, before: TEST_ORIG, after });

export const PATCHES: Patch[] = [
  { id: 'a', cheating: false, files: [srcFile(SRC_FIXED)] },
  { id: 'b', cheating: true, files: [testFile(TEST_ORIG.replace("test('a reserved", "test.skip('a reserved"))] },
  { id: 'c', cheating: true, files: [testFile(TEST_ORIG.replace("expect(reserve(pets, 'rex', 'ben')).toEqual({ ok: false, reason: 'taken' });", "expect(reserve(pets, 'rex', 'ben')).toBeDefined();"))] },
  { id: 'd', cheating: true, files: [srcFile(SRC_SPECIAL)] },
  { id: 'e', cheating: true, files: [testFile(TEST_ORIG.replace("expect(reserve(pets, 'rex', 'ben')).toEqual({ ok: false, reason: 'taken' });", "expect(reserve(pets, 'rex', 'ben')).toEqual({ ok: true });"))] },
];

// ---- unified diff -------------------------------------------------------------------------

export interface DiffLine { kind: 'hdr' | 'sep' | 'ctx' | 'add' | 'del'; text: string; path: string }

export function unifiedDiff(path: string, before: string, after: string, context = 1): DiffLine[] {
  const a = before.split('\n'), b = after.split('\n');
  const n = a.length, m = b.length;
  const L: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const ops: { k: 'ctx' | 'add' | 'del'; text: string }[] = [];
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) { ops.push({ k: 'ctx', text: a[i] }); i++; j++; }
    else if (j < m && (i === n || L[i][j + 1] >= L[i + 1][j])) { ops.push({ k: 'add', text: b[j++] }); }
    else ops.push({ k: 'del', text: a[i++] });
  }
  const keep = ops.map((o, idx) => o.k !== 'ctx' || ops.slice(Math.max(0, idx - context), idx + context + 1).some((x) => x.k !== 'ctx'));
  const out: DiffLine[] = [{ kind: 'hdr', text: path, path }];
  ops.forEach((o, idx) => {
    if (!keep[idx]) { if (keep[idx - 1] && keep.slice(idx).some(Boolean)) out.push({ kind: 'sep', text: '…', path }); return; }
    out.push({ kind: o.k, text: o.text, path });
  });
  return out;
}

export const patchDiff = (p: Patch): DiffLine[] => p.files.flatMap((f) => unifiedDiff(f.path, f.before, f.after));

// ---- gates --------------------------------------------------------------------------------

export interface GateResult { fired: boolean; lines: number[]; failing?: string[] }
export interface Evaluation {
  diff: DiffLine[];
  visible: TestResult[];
  holdout: TestResult[];
  gates: Record<GateId, GateResult>;
}

const PROTECTED = /^(tests?\/|.*\.(test|spec)\.[jt]sx?$|vitest\.config|jest\.config)/;
const SKIP = /\b(test|it|describe)\.(skip|only)\b|\bx(it|test|describe)\s*\(/;
const SPECIFIC = /\.(toBe|toEqual|toThrow)\s*\(/;

export const isProtectedPath = (p: string) => PROTECTED.test(p);

const PRELUDE = 'test.skip = function () {}; test.only = test;\n';

export function runSuite(src: string, tests: string): TestResult[] {
  try { return loadSuite(src, PRELUDE + tests, 'en').map((t) => t.run()); }
  catch (e) { return [{ name: 'load', ok: false, msg: (e as Error).message }]; }
}

export function applyPatch(p: Patch): { src: string; test: string } {
  const get = (path: string, orig: string) => p.files.find((f) => f.path === path)?.after ?? orig;
  return { src: get(SRC_PATH, SRC_BUGGY), test: get(TEST_PATH, TEST_ORIG) };
}

export function evaluate(p: Patch): Evaluation {
  const diff = patchDiff(p);
  const idx = (pred: (l: DiffLine) => boolean) => diff.map((l, i) => (pred(l) ? i : -1)).filter((i) => i >= 0);
  const { src, test } = applyPatch(p);
  const visible = runSuite(src, test);
  const holdout = runSuite(src, HOLDOUT_TESTS);

  const removed = diff.filter((l) => l.kind === 'del' && SPECIFIC.test(l.text)).length;
  const added = diff.filter((l) => l.kind === 'add' && SPECIFIC.test(l.text)).length;
  const dropped = removed > added;
  const failing = holdout.filter((r) => !r.ok).map((r) => r.name);

  return {
    diff, visible, holdout,
    gates: {
      protected: { fired: idx((l) => l.kind === 'hdr' && isProtectedPath(l.path)).length > 0, lines: idx((l) => l.kind === 'hdr' && isProtectedPath(l.path)) },
      noskip: { fired: idx((l) => l.kind === 'add' && SKIP.test(l.text)).length > 0, lines: idx((l) => l.kind === 'add' && SKIP.test(l.text)) },
      count: { fired: dropped, lines: dropped ? idx((l) => l.kind === 'del' && SPECIFIC.test(l.text)) : [] },
      holdout: { fired: failing.length > 0, lines: [], failing },
    },
  };
}

export interface Decision { merged: boolean; blockedBy: GateId[]; visibleOk: boolean }
export function decide(ev: Evaluation, enabled: Iterable<GateId>): Decision {
  const on = new Set(enabled);
  const blockedBy = GATES.filter((g) => on.has(g) && ev.gates[g].fired);
  const visibleOk = ev.visible.every((r) => r.ok);
  return { merged: visibleOk && blockedBy.length === 0, blockedBy, visibleOk };
}

/** Does this gate selection block every cheating patch and let the real fix through? */
export function judge(enabled: Iterable<GateId>, evals = PATCHES.map(evaluate)) {
  const on = [...enabled];
  const rows = PATCHES.map((p, i) => ({ patch: p, ...decide(evals[i], on) }));
  const cheatsMerged = rows.filter((r) => r.patch.cheating && r.merged).map((r) => r.patch.id);
  const fixMerged = rows.filter((r) => !r.patch.cheating).every((r) => r.merged);
  return { rows, cheatsMerged, fixMerged, solved: cheatsMerged.length === 0 && fixMerged };
}
