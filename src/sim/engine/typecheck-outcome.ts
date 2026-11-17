/**
 * Outcome of the compiler exercise for the shared result panel (see src/sim/ui/kit.ts).
 * Kept apart from typecheck.ts so the page does not load the TypeScript compiler for it.
 */
import type { Outcome } from './outcome';
import type { TypecheckResult } from './typecheck';
import { TYPECHECK_COPY, type TypeRevision } from '../../data/typecheck';

export type TypecheckCause =
  | 'possibly-undefined' // TS18048: the lookup can be undefined and is used without a check
  | 'compile-error' // another compiler error
  | 'assertion-crash' // `!` silenced the compiler, the missing pet crashes at runtime
  | 'unchecked-crash' // strict checks off: the compiler accepted the unsafe lookup, it crashes at runtime
  | 'runtime-error' // any other exception in a behaviour check
  | 'logic-bug' // compiles and runs, but a behaviour check gets a wrong result
  | 'pass';

export interface TypecheckValues {
  revision: TypeRevision;
  strict: boolean;
  errors: number;
  /** first diagnostic */
  diagnostic?: { code: number; line: number; column: number; message: string };
  passed: number;
  checks: number;
  /** first failing behaviour check */
  check?: { id: 'available' | 'missing' | 'taken'; got: string };
}
export type TypecheckOutcome = Outcome<TypecheckCause, TypecheckValues>;

/** Verdict, cause and numbers for one compiler + behaviour run. Pure. */
export function typecheckOutcome(revision: TypeRevision, strict: boolean, result: TypecheckResult, code = ''): TypecheckOutcome {
  const base: TypecheckValues = { revision, strict, errors: result.diagnostics.length, passed: result.checks.filter((c) => c.pass).length, checks: result.checks.length };
  const d = result.diagnostics[0];
  if (d) return { status: 'fail', causeId: d.code === 18048 ? 'possibly-undefined' : 'compile-error', values: { ...base, diagnostic: d } };
  const bad = result.checks.find((c) => !c.pass);
  if (!bad) return { status: 'pass', causeId: 'pass', values: base };
  const values = { ...base, check: { id: bad.id, got: bad.got } };
  if (/^\w*Error: /.test(bad.got)) {
    const asserted = /\]!/.test(code) || revision === 'assertion';
    return { status: 'fail', causeId: asserted ? 'assertion-crash' : !strict ? 'unchecked-crash' : 'runtime-error', values };
  }
  return { status: 'fail', causeId: 'logic-bug', values };
}

/** The expected result of each behaviour check (same probes as checkRevision). */
export const EXPECTED = { available: 'result=reserved; reservedBy=anna', missing: 'result=missing; reservedBy=undefined', taken: 'result=taken; reservedBy=anna' } as const;

/** What the agent sees: tsc output, or the behaviour test output when the compiler passes. */
export function typecheckReport(result: TypecheckResult): string {
  if (result.diagnostics.length) {
    const lines = result.diagnostics.map((d) => `reserve.ts(${d.line},${d.column}): error TS${d.code}: ${d.message}`);
    const n = result.diagnostics.length;
    return ['$ tsc --noEmit', ...lines, '', `Found ${n} error${n === 1 ? '' : 's'} in reserve.ts`].join('\n');
  }
  const out = ['$ tsc --noEmit', '(no output: 0 errors)', '$ vitest run'];
  for (const c of result.checks) {
    const name = TYPECHECK_COPY.checks[c.id].en;
    out.push(c.pass ? ` ✓ reserve.test.ts > ${name}` : ` FAIL  reserve.test.ts > ${name}\n${/^\w*Error: /.test(c.got) ? c.got : `AssertionError: expected "${c.got}" to be "${EXPECTED[c.id]}"`}`);
  }
  const failed = result.checks.filter((c) => !c.pass).length;
  out.push(`      Tests  ${failed ? `${failed} failed | ` : ''}${result.checks.length - failed} passed (${result.checks.length})`);
  return out.join('\n');
}
