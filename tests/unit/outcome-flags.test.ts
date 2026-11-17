import { describe, expect, it } from 'vitest';
import { USERS, exposure, flagOn, flagsOutcome, flagsReport } from '../../src/sim/engine/flags';

const state = (target: 'off' | 'staff' | 'beta' | 'percent', pct = 10, incident = false, killedFrom: null | { target: 'off' | 'staff' | 'beta' | 'percent'; pct: number } = null) => ({ target, pct, incident, killedFrom });

describe('feature flag outcome', () => {
  it('exposure counts users per segment from the flag rule', () => {
    expect(exposure('off', 0)).toEqual({ staff: 0, beta: 0, all: 0, total: 0 });
    expect(exposure('staff', 0)).toMatchObject({ staff: 5, beta: 0, all: 0, total: 5 });
    expect(exposure('beta', 0)).toMatchObject({ staff: 5, beta: 15, all: 0, total: 20 });
    const p = exposure('percent', 30);
    expect(p.all).toBe(USERS.filter((u) => u.seg === 'all' && u.bucket < 30).length);
    expect(p.total).toBe(USERS.filter((u) => flagOn(u, 'percent', 30)).length);
  });
  it('nothing to report without an incident or a kill', () => {
    expect(flagsOutcome(state('beta'))).toBeNull();
  });
  it('an incident fails for exactly the users on v2; a dark flag protects everyone', () => {
    expect(flagsOutcome(state('beta', 0, true))).toMatchObject({ status: 'fail', causeId: 'incident-exposed', values: { exposed: { total: 20, staff: 5, beta: 15 } } });
    expect(flagsOutcome(state('off', 0, true))).toMatchObject({ status: 'pass', causeId: 'incident-dark', values: { exposed: { total: 0 } } });
  });
  it('the kill switch moves the users back without a deploy', () => {
    const o = flagsOutcome(state('off', 10, false, { target: 'beta', pct: 10 }))!;
    expect(o).toMatchObject({ status: 'pass', causeId: 'killed', values: { moved: 20, deploys: 1, exposed: { total: 0 } } });
    expect(flagsReport(o)).toContain('users moved to v1: 20');
    expect(flagsOutcome(state('off', 10, false, { target: 'off', pct: 10 }))).toMatchObject({ causeId: 'killed-none', values: { moved: 0 } });
  });
  it('the log names the rule and the users on the failing flow', () => {
    const out = flagsReport(flagsOutcome(state('percent', 20, true))!);
    expect(out).toContain('staff, beta + 20% of everyone');
    expect(out).toContain(`users on v2: ${exposure('percent', 20).total} of 100`);
  });
});
