import { describe, expect, it } from 'vitest';
import { checkRevision } from '../../src/sim/engine/typecheck';

describe('compiler feedback delivered to the learner', () => {
  // Oracle: the worked reservation example dereferences the lookup at
  // line 7, column 7 and line 8, column 3. Those are the edits an agent sees.
  it('reports both unsafe dereferences at their exact source locations', () => {
    expect(checkRevision('unchecked', true).diagnostics).toEqual([
      { code: 18048, line: 7, column: 7, message: "'pet' is possibly 'undefined'." },
      { code: 18048, line: 8, column: 3, message: "'pet' is possibly 'undefined'." },
    ]);
  });

  // Oracle: reserve an available pet for Anna, reject an unknown pet,
  // and reject Ben without changing Anna's existing reservation.
  it('reports actual return values and stored owners for all three behaviours', () => {
    expect(checkRevision('guard', true).checks).toEqual([
      { id: 'available', pass: true, got: 'result=reserved; reservedBy=anna' },
      { id: 'missing', pass: true, got: 'result=missing; reservedBy=undefined' },
      { id: 'taken', pass: true, got: 'result=taken; reservedBy=anna' },
    ]);
  });
});
