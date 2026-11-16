import { describe, expect, it } from 'vitest';
import { simulate, affected } from '../../src/sim/engine/canary';

describe('canary simulation', () => {
  it('a healthy version is promoted to 100%', () => {
    const s = simulate({ bug: 'none', businessMetric: true, seed: 1 });
    expect(s.at(-1)!.weight).toBe(100);
    expect(s.every((x) => x.decision === 'promote')).toBe(true);
  });
  it('an erroring version is rolled back at the first stage', () => {
    const s = simulate({ bug: 'errors', businessMetric: false, seed: 1 });
    expect(s).toHaveLength(1);
    expect(s[0].decision).toBe('rollback');
  });
  it('a silent wrong-price bug slips through without a business metric, and is caught with one', () => {
    expect(simulate({ bug: 'silent', businessMetric: false, seed: 1 }).at(-1)!.weight).toBe(100);
    const caught = simulate({ bug: 'silent', businessMetric: true, seed: 1 });
    expect(caught.at(-1)!.decision).toBe('rollback');
    expect(caught.at(-1)!.reason).toBe('business');
    expect(affected(caught)).toBeLessThan(affected(simulate({ bug: 'silent', businessMetric: false, seed: 1 })));
  });
});
