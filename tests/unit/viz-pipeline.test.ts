import { describe, expect, it } from 'vitest';
import { SPECS, GATE_ORDER, catchingGate, type BugType, type Mode } from '../../src/viz/pipeline/spec';

describe('pipeline catchingGate', () => {
  const table: [BugType, string][] = [
    ['unused-var', 'lint'], ['type-error', 'types'], ['untested-branch', 'unit'], ['null-deref', 'static'], ['price-trusted', 'static'],
    ['missing-limit', 'config'], ['timeout-zero', 'config'], ['buffer-overflow', 'san'], ['clean', 'merge'],
  ];
  it.each(table)('%s stops at %s', (bug, gate) => expect(catchingGate(bug, { sanitizers: true })).toBe(gate));
  it('without a sanitizer build, a buffer overflow reaches merge', () => expect(catchingGate('buffer-overflow', { sanitizers: false })).toBe('merge'));
});

describe('pipeline mode specs', () => {
  const modes = ['ci', 'static-analysis', 'config-tests', 'sanitizers', 'coverage'] as Mode[];
  it.each(modes)('%s is complete', (m) => {
    const sp = SPECS[m];
    expect(sp.gates.length).toBeGreaterThan(5);
    expect(sp.gates).toContain(sp.focus);
    expect(sp.commits.length).toBeGreaterThan(1);
    for (const c of sp.commits) {
      expect(c.expect).toBe(catchingGate(c.bug, { sanitizers: c.sanitizers }));
      expect(GATE_ORDER).toContain(c.expect);
    }
    for (const l of ['en', 'de'] as const) {
      expect(sp.caption[l].length).toBeGreaterThan(10);
      expect(sp.caption[l].match(/[.!?](\s|$)/g)).toHaveLength(1);
      expect(sp.takeaway[l].length).toBeGreaterThan(10);
    }
    expect(sp.commits.some((c) => c.bug === 'clean' && c.expect === 'merge')).toBe(true);
  });
});
