import { describe, expect, it } from 'vitest';
import { vitestReport, vitestMessage } from '../../src/sim/engine/outcome';

describe('shared report formatters', () => {
  it('a green run lists every test and the pass counts', () => {
    const out = vitestReport('fee.test.ts', [{ name: 'a', ok: true }, { name: 'b', ok: true }], 'fee');
    expect(out).toContain('✓ fee > a');
    expect(out).toContain('Tests  2 passed (2)');
    expect(out).not.toContain('FAIL');
  });
  it('a red run expands only the failing tests, with their message', () => {
    const out = vitestReport('fee.test.ts', [{ name: 'a', ok: true }, { name: 'b', ok: false, msg: 'AssertionError: x' }]);
    expect(out).toContain('FAIL  fee.test.ts > b');
    expect(out).toContain('AssertionError: x');
    expect(out).not.toContain('> a');
    expect(out).toContain('Tests  1 failed | 1 passed (2)');
  });
  it('turns the mini-runner message into the Vitest wording', () => {
    expect(vitestMessage('expected 6000, got 12000')).toBe('AssertionError: expected 12000 to be 6000');
    expect(vitestMessage('expected {"ok":true}, got undefined', true)).toBe('AssertionError: expected undefined to deeply equal {"ok":true}');
    expect(vitestMessage('TypeError: x is undefined')).toBe('TypeError: x is undefined');
    expect(vitestMessage(undefined)).toBe('');
  });
});
