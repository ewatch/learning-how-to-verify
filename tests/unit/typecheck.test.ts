import { describe, expect, it } from 'vitest';
import { checkRevision } from '../../src/sim/engine/typecheck';

describe('compiler feedback exercise', () => {
  it('blocks the unsafe lookup before running behaviour checks', () => {
    const result = checkRevision('unchecked', true);
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.diagnostics.every((d) => d.code === 18048 && d.line >= 7 && d.column > 0)).toBe(true);
    expect(result.checks).toEqual([]);
  });

  it('exposes the runtime failure when compiler protections are disabled', () => {
    const result = checkRevision('unchecked', false);
    expect(result.diagnostics).toEqual([]);
    expect(result.checks.filter((c) => !c.pass).map((c) => c.id)).toEqual(['missing']);
    expect(result.checks.find((c) => c.id === 'missing')?.got).toContain('TypeError');
  });

  it('handles missing pets without losing the double-reservation protection', () => {
    const result = checkRevision('guard', true);
    expect(result.diagnostics).toEqual([]);
    expect(result.checks.map((c) => [c.id, c.pass])).toEqual([
      ['available', true], ['missing', true], ['taken', true],
    ]);
  });

  it('distinguishes suppressing a diagnostic from fixing the runtime bug', () => {
    const result = checkRevision('assertion', true);
    expect(result.diagnostics).toEqual([]);
    expect(result.checks.filter((c) => !c.pass).map((c) => c.id)).toEqual(['missing']);
  });

  it('catches the business-rule bug that the compiler accepts', () => {
    const result = checkRevision('overwrite', true);
    expect(result.diagnostics).toEqual([]);
    expect(result.checks.filter((c) => !c.pass).map((c) => c.id)).toEqual(['taken']);
    expect(result.checks.find((c) => c.id === 'taken')?.got).toContain('reservedBy=ben');
  });
});
