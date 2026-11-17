import { describe, expect, it } from 'vitest';
import { checkRevision } from '../../src/sim/engine/typecheck';
import { typecheckOutcome, typecheckReport } from '../../src/sim/engine/typecheck-outcome';
import { TYPE_REVISIONS, type TypeRevision } from '../../src/data/typecheck';

const outcome = (id: TypeRevision, strict: boolean) => {
  const r = checkRevision(id, strict);
  return { r, o: typecheckOutcome(id, strict, r, TYPE_REVISIONS.find((x) => x.id === id)!.code) };
};

describe('compiler exercise outcome', () => {
  it('agent draft with strict checks: the gate fails with TS18048 at the first unsafe use', () => {
    const { r, o } = outcome('unchecked', true);
    expect(o).toMatchObject({ status: 'fail', causeId: 'possibly-undefined', values: { errors: 2, diagnostic: { code: 18048, line: 7, column: 7 } } });
    const out = typecheckReport(r);
    expect(out).toContain("reserve.ts(7,7): error TS18048: 'pet' is possibly 'undefined'.");
    expect(out).toContain('Found 2 errors');
  });
  it('agent draft without strict checks compiles and crashes at runtime', () => {
    expect(outcome('unchecked', false).o).toMatchObject({ status: 'fail', causeId: 'unchecked-crash', values: { errors: 0, check: { id: 'missing' } } });
  });
  it('the non-null assertion compiles and crashes at runtime, with or without strict checks', () => {
    for (const strict of [true, false]) {
      const { r, o } = outcome('assertion', strict);
      expect(o).toMatchObject({ status: 'fail', causeId: 'assertion-crash', values: { check: { id: 'missing' } } });
      expect(o.values.check!.got).toMatch(/^TypeError: /);
      expect(typecheckReport(r)).toContain('FAIL  reserve.test.ts > Missing pet: return missing');
    }
  });
  it('the overwrite bug compiles but breaks the business rule', () => {
    const { r, o } = outcome('overwrite', true);
    expect(o).toMatchObject({ status: 'fail', causeId: 'logic-bug', values: { passed: 2, checks: 3, check: { id: 'taken', got: 'result=reserved; reservedBy=ben' } } });
    expect(typecheckReport(r)).toContain('expected "result=reserved; reservedBy=ben" to be "result=taken; reservedBy=anna"');
  });
  it('the guard passes the gate and all checks', () => {
    for (const strict of [true, false]) expect(outcome('guard', strict).o).toMatchObject({ status: 'pass', causeId: 'pass', values: { passed: 3, checks: 3 } });
  });
});
