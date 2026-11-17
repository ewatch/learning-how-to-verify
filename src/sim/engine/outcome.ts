/**
 * The result of one simulator run, as structured data.
 *
 * Every engine that feeds the shared result panel (`resultPanel` in `src/sim/ui/kit.ts`)
 * exports a pure function `<sim>Outcome(...)` that returns an `Outcome`:
 * - `status`: 'pass' (the check holds / the gate passes), 'fail' (the check finds a failure),
 *   'warn' (no failure, but the run proves less than it seems, e.g. rules switched off).
 * - `causeId`: a short code for WHY this run ended like this (e.g. 'lost-cents').
 * - `values`: the numbers and inputs behind the explanation (e.g. the minimal counterexample).
 * The UI maps `causeId` + `values` to bilingual text. It never decides the verdict itself.
 */
export type OutcomeStatus = 'pass' | 'fail' | 'warn';

export interface Outcome<C extends string = string, V = Record<string, unknown>> {
  status: OutcomeStatus;
  causeId: C;
  values: V;
}

/** One test in a runner report. */
export interface ReportTest { name: string; ok: boolean; msg?: string }

/**
 * A Vitest-style run summary, as an agent sees it in the terminal.
 * Only failing tests are expanded; passing ones are listed with ✓.
 */
export function vitestReport(file: string, tests: ReportTest[], suite = ''): string {
  const prefix = suite ? `${suite} > ` : '';
  const failed = tests.filter((t) => !t.ok);
  const lines: string[] = [];
  if (!failed.length) {
    lines.push(` ✓ ${file} (${tests.length} test${tests.length === 1 ? '' : 's'})`);
    for (const t of tests) lines.push(`   ✓ ${prefix}${t.name}`);
  } else {
    for (const t of failed) {
      lines.push(` FAIL  ${file} > ${prefix}${t.name}`);
      if (t.msg) lines.push(t.msg);
      lines.push('');
    }
  }
  lines.push(` Test Files  ${failed.length ? '1 failed' : '1 passed'} (1)`);
  const passed = tests.length - failed.length;
  const counts = failed.length ? `${failed.length} failed${passed ? ` | ${passed} passed` : ''}` : `${passed} passed`;
  lines.push(`      Tests  ${counts} (${tests.length})`);
  return lines.join('\n');
}

/** Turn a mini-runner message ("expected X, got Y") into the Vitest wording ("expected Y to be X"). */
export function vitestMessage(msg: string | undefined, deep = false): string {
  if (!msg) return '';
  const m = /^expected (.+), got (.+)$/s.exec(msg);
  // toEqual on objects/arrays reads "deeply equal"; on primitives Vitest's toBe wording is the honest guess
  if (m) return `AssertionError: expected ${m[2]} to ${deep && /^[[{]/.test(m[1]) ? 'deeply equal' : 'be'} ${m[1]}`;
  return msg.includes(':') ? msg : `Error: ${msg}`;
}
