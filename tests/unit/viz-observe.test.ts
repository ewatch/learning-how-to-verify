import { describe, expect, it } from 'vitest';
import { MODES, SPECS } from '../../src/viz/observe/specs';
import * as D from '../../src/viz/observe/data';

const oneSentence = (s: string) => (s.match(/[.!?](\s|$)/g) ?? []).length === 1;

describe('specs', () => {
  it('has all 8 modes with en+de caption and takeaway', () => {
    expect(MODES).toHaveLength(8);
    for (const m of MODES) for (const l of ['en', 'de'] as const) {
      const t = SPECS[m][l];
      expect(t.caption.length).toBeGreaterThan(10);
      expect(t.takeaway.length).toBeGreaterThan(5);
      expect(oneSentence(t.caption), `${m}/${l}`).toBe(true);
      expect(t.toggle.split(/\s+/).length).toBeLessThanOrEqual(3);
    }
  });
});

describe('tracing', () => {
  it('batching the N+1 inventory calls shrinks the total', () => {
    const a = D.traceSpans(false), b = D.traceSpans(true);
    expect(D.inventoryCalls(a)).toBe(12);
    expect(D.inventoryCalls(b)).toBe(1);
    expect(D.traceTotal(b)).toBeLessThan(D.traceTotal(a) / 2);
  });
});

describe('profiling', () => {
  it('JSON parsing grows from 8% to 38% and shares sum to 100', () => {
    const pct = (r: D.Release) => D.flameFrames(r).find((f) => f.name === 'parse JSON')!.pct;
    expect([pct('1.4'), pct('1.5')]).toEqual([8, 38]);
    for (const r of ['1.4', '1.5'] as const) expect(D.flameFrames(r).filter((f) => f.depth === 1).reduce((a, f) => a + f.pct, 0)).toBe(100);
  });
});

describe('logs-events', () => {
  const evs = D.eventStream();
  it('finds exactly the Rex pair (Anna + Ben)', () => {
    const v = D.findViolations(evs);
    expect(v).toHaveLength(1);
    expect(v[0]!.map((e) => [e.petId, e.person])).toEqual([['rex', 'Anna'], ['rex', 'Ben']]);
    expect(D.queryLines(evs.map(D.structuredLine)).violations).toHaveLength(1);
  });
  it('fails on free-text lines', () => {
    const q = D.queryLines(D.freeTextLines(evs));
    expect(q.parsed).toBe(0);
    expect(q.violations).toHaveLength(0);
  });
});

describe('monitoring', () => {
  it('only the business metric alerts when the button breaks', () => {
    expect(D.alertsAt(D.monitoringScenario(true))).toEqual(['reservations']);
    expect(D.alertsAt(D.monitoringScenario(true), D.BREAK_MINUTE - 1)).toEqual([]);
    expect(D.alertsAt(D.monitoringScenario(false))).toEqual([]);
  });
  it('burn rate crosses the alert threshold after the break', () => {
    const s = D.monitoringScenario(true);
    expect(D.burnRate(s, D.BREAK_MINUTE - 1)).toBe(0);
    expect(D.burnRate(s)).toBeGreaterThan(D.BURN_ALERT);
  });
});

describe('exception-tracking', () => {
  it('detects a new group only in 1.4.2', () => {
    expect(D.newGroups('1.4.1', '1.4.2')).toEqual(['e05a']);
    expect(D.newGroups('1.4.2', '1.4.1')).toEqual([]);
    expect(D.EX_GROUPS.find((g) => g.fp === 'e05a')!.trace.join(' ')).toContain('user: ••••');
  });
});

describe('real-user-monitoring', () => {
  it('lab p75 is inside the budget, real users are not (unless desktop only)', () => {
    expect(D.percentile(D.labSamples(), 75)).toBeLessThan(D.LCP_BUDGET);
    expect(D.percentile(D.realSamples(D.MIX_ALL), 75)).toBeGreaterThan(D.LCP_BUDGET);
    expect(D.percentile(D.realSamples(D.MIX_DESKTOP), 75)).toBeLessThan(D.LCP_BUDGET);
  });
  it('is deterministic', () => { expect(D.realSamples(D.MIX_ALL)).toEqual(D.realSamples(D.MIX_ALL)); });
});

describe('auditing', () => {
  it('flags the agent delete with its own identity, nothing with a shared token', () => {
    const f = D.auditFlags(D.auditEvents(false));
    expect(f).toHaveLength(1);
    expect([f[0]!.actor, f[0]!.count]).toEqual(['agent-7', 40]);
    expect(D.auditFlags(D.auditEvents(true))).toHaveLength(0);
    expect(new Set(D.auditEvents(true).map((e) => e.actor))).toEqual(new Set(['admin']));
  });
});

describe('ab-tests', () => {
  const s = D.abSeries();
  it('peeking declares a false early winner on day 2', () => { expect(D.peekStopDay(s)).toBe(2); });
  it('the planned sample and the full sample show no significant difference', () => {
    expect(D.isSignificant(s[D.AB_PLANNED_DAY - 1]!)).toBe(false);
    expect(D.isSignificant(s[D.AB_DAYS - 1]!)).toBe(false);
  });
  it('intervals narrow over time', () => { expect(s[27]!.ciA).toBeLessThan(s[1]!.ciA / 3); });
});
