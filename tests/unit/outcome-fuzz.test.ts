import { describe, expect, it } from 'vitest';
import { createFuzzer, step, fuzzOutcome, jazzerReport, BUG_LINE, PARSER_SOURCE, execute } from '../../src/sim/engine/fuzz';

const fuzz = (mode: 'guided' | 'blind', seed: number) => { const s = createFuzzer(mode, seed); for (let k = 0; k < 60 && !s.crash; k++) step(s, 500); return s; };

describe('fuzz outcome', () => {
  it('BUG_LINE points at the decodeURIComponent line of the shown parser', () => {
    expect(PARSER_SOURCE.split('\n')[BUG_LINE - 1]).toContain('decodeURIComponent');
  });
  it('guided finds the crash, blind does not: guided-only, with a minimal URIError input', () => {
    const g = fuzz('guided', 1), b = fuzz('blind', 1);
    expect(g.crash).not.toBeNull();
    const o = fuzzOutcome(b, g);
    expect(o).toMatchObject({ status: 'fail', causeId: 'guided-only', values: { crash: { by: 'guided', errorName: 'URIError' } } });
    expect(execute(o.values.crash!.minimal).crash?.name).toBe('URIError');
    expect(o.values.blind.branches).toBeLessThanOrEqual(o.values.guided.branches);
    const out = jazzerReport(o);
    expect(out).toContain('Uncaught Exception: URIError');
    expect(out).toContain(`search.js:${BUG_LINE}`);
    expect(out).toContain(`Minimized input: ${JSON.stringify(o.values.crash!.minimal)}`);
  });
  it('no crash is a warning, not a pass (the parser has a known bug)', () => {
    const b = createFuzzer('blind', 3), g = createFuzzer('guided', 3);
    step(b, 10); step(g, 10);
    expect(fuzzOutcome(b, g)).toMatchObject({ status: 'warn', causeId: 'none' });
    expect(jazzerReport(fuzzOutcome(b, g))).toContain('no crash found');
  });
  it('classifies who found the crash', () => {
    const crash = { input: 'price<%', error: 'URIError: URI malformed', at: 5, minimal: 'price<%' };
    const g = createFuzzer('guided', 1), b = createFuzzer('blind', 1);
    expect(fuzzOutcome({ ...b, crash }, g).causeId).toBe('blind-only');
    expect(fuzzOutcome({ ...b, crash }, { ...g, crash }).causeId).toBe('both');
  });
});
