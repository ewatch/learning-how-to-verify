import { describe, expect, it } from 'vitest';
import {
  MODES, route, routeMany, Breaker, simulateBreaker, simulateShadow, makeResp, learnNoise, classifyDiff,
  scrub, Recorder, sampleReq, simulateChaos, ChaosSim, POOL, explore, serverStatus, BUG_SEQ, EXPLORE_SEED,
} from '../../src/viz/traffic/logic';
import { SPECS, L } from '../../src/viz/traffic/text';

describe('specs', () => {
  it('every mode has a one-sentence caption and takeaway in en and de', () => {
    for (const m of MODES) {
      for (const lang of ['en', 'de'] as const) {
        const { caption, takeaway } = SPECS[m];
        expect(caption[lang].length).toBeGreaterThan(20);
        expect(takeaway[lang].length).toBeGreaterThan(10);
        expect(caption[lang].match(/[.!?](\s|$)/g)?.length).toBe(1);
      }
    }
    expect(SPECS['chaos-testing'].hypothesis?.en).toBeTruthy();
    expect(SPECS['chaos-testing'].hypothesis?.de).toBeTruthy();
  });
  it('labels exist in both languages, at most three words', () => {
    expect(Object.keys(L.en).sort()).toEqual(Object.keys(L.de).sort());
    for (const lang of ['en', 'de'] as const) for (const v of Object.values(L[lang])) expect(v.split(/\s+/).length).toBeLessThanOrEqual(4);
  });
});

describe('traffic shaping', () => {
  it('weighted routing matches the weight within tolerance', () => {
    for (const w of [10, 50, 90]) {
      const r = routeMany(20000, w, 0, true, 42);
      expect(Math.abs(r.v2 / 20000 - w / 100)).toBeLessThan(0.02);
    }
  });
  it('header route sends staff to v2 even at 0%', () => {
    expect(route(0, true, true, 0.99)).toBe('v2');
    expect(route(0, true, false, 0.99)).toBe('v1');
    const r = routeMany(2000, 0, 0.2, true, 1);
    expect(r.staffV2).toBe(r.staffTotal);
    expect(r.v2).toBe(r.staffTotal);
  });
  it('breaker opens after consecutive failures and probes after the cooldown', () => {
    const b = new Breaker(3, 3);
    [0, 0.1, 0.2].forEach((t) => { expect(b.allow(t)).toBe(true); b.record(false, t); });
    expect(b.state).toBe('open');
    expect(b.allow(1)).toBe(false);
    expect(b.allow(3.3)).toBe(true);
    b.record(true, 3.3);
    expect(b.state).toBe('closed');
  });
  it('without a breaker a slow v2 triggers a retry storm; with one the load is shed', () => {
    const off = simulateBreaker({ breaker: false, slow: true, requests: 200, seed: 3 });
    const on = simulateBreaker({ breaker: true, slow: true, requests: 200, seed: 3 });
    expect(off.attempts).toBeGreaterThan(200 * 2);
    expect(off.retries).toBeGreaterThan(300);
    expect(on.attempts).toBeLessThan(off.attempts / 3);
    expect(on.shed).toBeGreaterThan(150);
    expect(simulateBreaker({ breaker: false, slow: false, requests: 200, seed: 3 }).retries).toBe(0);
  });
});

describe('shadowing', () => {
  it('users are always served by v1, shadow responses are discarded, side effects are stubbed', () => {
    const r = simulateShadow({ n: 1000, shadowErrorRate: 0.25, seed: 9 });
    expect(r.userOk).toBe(1000);
    expect(r.discarded).toBe(1000);
    expect(r.realEffects).toBe(0);
    expect(r.stubbedEffects).toBe(1000);
    expect(Math.abs(r.shadowErrors / 1000 - 0.25)).toBeLessThan(0.05);
  });
  it('without stubs the shadow would cause real side effects', () => {
    expect(simulateShadow({ n: 10, shadowErrorRate: 0, seed: 1, stubbed: false }).realEffects).toBe(10);
  });
});

describe('tap and compare', () => {
  it('learns noise from two old instances, then flags only the real difference', () => {
    const a = makeResp('old', 0), b = makeResp('old', 1), n = makeResp('new', 2);
    const noise = learnNoise(a, b);
    expect(noise.sort()).toEqual(['id', 'ts']);
    const d = classifyDiff(a, n, noise);
    expect(d.real).toEqual(['price']);
    expect(d.noise.sort()).toEqual(['id', 'ts']);
    expect(d.same).toEqual(['status']);
  });
  it('without learned noise, id and timestamp would be false alarms', () => {
    const d = classifyDiff(makeResp('old', 0), makeResp('new', 2), []);
    expect(d.real.sort()).toEqual(['id', 'price', 'ts']);
  });
});

describe('teeing', () => {
  it('scrubs PII before recording and replays the tape', () => {
    const rec = new Recorder(3);
    for (let i = 0; i < 5; i++) rec.record(sampleReq(i));
    expect(rec.tape).toHaveLength(3);
    expect(JSON.stringify(rec.tape)).not.toMatch(/Ada|Linus|@mail/);
    expect(rec.tape[0]!.name).toBe('•••');
    expect(rec.replay()).toEqual(rec.tape);
    expect(scrub(sampleReq(0)).petId).toBe(sampleReq(0).petId);
  });
});

describe('chaos testing', () => {
  it('without timeout, slow payment exhausts the thread pool and the page fails', () => {
    const r = simulateChaos({ latencyMs: 3000, fallback: false });
    expect(r.failed).toBeGreaterThan(10);
    expect(r.page).toBe('down');
  });
  it('with timeout + fallback the same latency yields "payment pending", no failures', () => {
    const r = simulateChaos({ latencyMs: 3000, fallback: true });
    expect(r.failed).toBe(0);
    expect(r.pending).toBeGreaterThan(50);
    expect(r.page).toBe('degraded');
  });
  it('the verdict follows the pool: saturated threads mean the page is down, even before any request finished', () => {
    const s = new ChaosSim(2500, false);
    for (let i = 0; i < 24; i++) s.step(0.05); // 1.2 s: six requests in flight, nothing finished yet
    expect(s.threads).toBeLessThan(POOL);
    expect(s.counts).toEqual({ ok: 0, pending: 0, failed: 0 });
    expect(s.page).toBe('slow');
    for (let i = 0; i < 12; i++) s.step(0.05); // 1.8 s: pool exhausted, extra reservations are rejected
    expect(s.saturated).toBe(true);
    expect(s.page).toBe('down');
    expect(s.counts.failed).toBeGreaterThan(0);
  });
  it('with timeout + fallback the first slow requests become "pending" and the page degrades, not fails', () => {
    const s = new ChaosSim(2500, true);
    for (let i = 0; i < 40; i++) s.step(0.05); // 2 s
    expect(s.counts.pending).toBeGreaterThan(0);
    expect(s.counts.failed).toBe(0);
    expect(s.page).toBe('degraded');
  });
  it('fast payment is fine either way', () => {
    for (const fallback of [false, true]) {
      const r = simulateChaos({ latencyMs: 0, fallback });
      expect(r.failed).toBe(0);
      expect(r.pending).toBe(0);
      expect(r.page).toBe('ok');
    }
  });
});

describe('dynamic exploration', () => {
  it('only the rare reserve-cancel-reserve-reserve sequence yields 500', () => {
    expect(serverStatus(BUG_SEQ)).toBe(500);
    expect(serverStatus(['list', 'reserve', 'cancel', 'reserve'])).toBe(200);
    expect(serverStatus(['get', 'reserve', 'reserve', 'cancel'])).toBe(200);
  });
  it('the explorer finds it, deterministically, and reports the path', () => {
    const e = explore(EXPLORE_SEED);
    expect(e.found).toBeGreaterThan(8);
    expect(e.path).toEqual(BUG_SEQ);
    expect(explore(EXPLORE_SEED)).toEqual(e);
  });
});
