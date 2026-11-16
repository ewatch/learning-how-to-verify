import { describe, expect, it } from 'vitest';
import { createFuzzer, step, execute, minimize, PARSER_SOURCE, TOTAL_BRANCHES } from '../../src/sim/engine/fuzz';

describe('toy fuzzer', () => {
  it('the instrumented parser crashes on "price<%" and accepts normal queries', () => {
    expect(execute('price<%').crash?.name).toBe('URIError');
    expect(execute('flat -category:fish price<50').crash).toBeNull();
    expect(execute('price=3').crash).toBeNull(); // syntax error is an expected rejection, not a crash
  });
  it('the displayed source contains the bug the instrumented version has', () => {
    expect(PARSER_SOURCE).toContain('decodeURIComponent');
  });
  it('coverage-guided fuzzing finds the crash within 30k iterations for most seeds; blind fuzzing does not', () => {
    let guidedFound = 0, blindFound = 0;
    for (const seed of [1, 2, 3, 4, 5]) {
      const g = createFuzzer('guided', seed); const b = createFuzzer('blind', seed);
      for (let k = 0; k < 60 && !g.crash; k++) step(g, 500);
      for (let k = 0; k < 60 && !b.crash; k++) step(b, 500);
      if (g.crash) guidedFound++;
      if (b.crash) blindFound++;
      expect(g.seen.size).toBeGreaterThanOrEqual(b.seen.size);
    }
    expect(guidedFound).toBeGreaterThanOrEqual(4);
    expect(blindFound).toBe(0);
  });
  it('minimisation keeps a crashing input crashing and makes it short', () => {
    const m = minimize('xx price<12%zz yy');
    expect(execute(m).crash).not.toBeNull();
    expect(m.length).toBeLessThanOrEqual(9);
  });
  it('branch total is consistent', () => { expect(TOTAL_BRANCHES).toBe(25); });
});
