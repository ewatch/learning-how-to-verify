import { describe, expect, it } from 'vitest';
import * as D from '../../src/viz/load/data';
import { SPECS } from '../../src/viz/load/spec';

describe('viz load specs', () => {
  for (const m of ['load-tests', 'soak-tests', 'performance-tests', 'benchmark-tests']) {
    it(`${m} has en+de caption and takeaway`, () => {
      const s = SPECS[m];
      for (const l of ['en', 'de'] as const) { expect(s.caption[l].length).toBeGreaterThan(10); expect(s.takeaway[l].length).toBeGreaterThan(10); }
    });
  }
});
describe('load data', () => {
  it('latency is monotone with a knee', () => {
    let prev = 0;
    for (let u = 0; u <= 400; u += 5) { const v = D.p95At(u); expect(v).toBeGreaterThanOrEqual(prev); prev = v; }
    expect(D.p95At(D.KNEE)).toBeLessThan(D.TARGET_MS);
    expect(D.p95At(D.KNEE + 60)).toBeGreaterThan(D.TARGET_MS);
    expect(D.errorRateAt(D.KNEE)).toBe(0);
    expect(D.errorRateAt(300)).toBeGreaterThan(0);
  });
  it('invariant breaks without unique constraint', () => {
    expect(D.reservedTwice(300, false)).toBe(2);
    expect(D.reservedTwice(300, true)).toBe(0);
  });
  it('leak climbs, no leak stays bounded, traffic x10 is faster', () => {
    expect(D.memoryAt(10, true, false)).toBeGreaterThan(D.memoryAt(1, true, false));
    for (let h = 0; h <= 24; h += 0.1) expect(D.memoryAt(h, false, false)).toBeLessThan(500);
    expect(D.oomHour(true, true)!).toBeLessThan(D.oomHour(true, false)! / 9);
    expect(D.oomHour(false, false)).toBeNull();
    expect(D.memoryAt(D.WINDOW_H, true, false)).toBeLessThan(500);
  });
  it('percentiles are ordered and N+1 raises p95', () => {
    const a = D.stats(D.latencies(false)), b = D.stats(D.latencies(true));
    for (const s of [a, b]) { expect(s.p50).toBeLessThanOrEqual(s.p95); expect(s.p95).toBeLessThanOrEqual(s.p99); expect(s.avg).toBeLessThanOrEqual(s.p95); }
    expect(b.p95).toBeGreaterThan(a.p95);
    expect(D.latencies(false)).toEqual(D.latencies(false));
    expect(D.latencies(false)).toHaveLength(1000);
  });
  it('quadratic matches linear at n=10 and diverges later', () => {
    expect(D.quadraticMs(10) / D.linearMs(10)).toBeLessThan(1.05);
    expect(D.regressed(10)).toBe(false);
    for (const n of [1000, 10000, 100000]) expect(D.quadraticMs(n)).toBeGreaterThanOrEqual(D.linearMs(n));
    expect(D.quadraticMs(100000)).toBeGreaterThan(10 * D.linearMs(100000));
    expect(D.regressed(100000)).toBe(true);
  });
});
