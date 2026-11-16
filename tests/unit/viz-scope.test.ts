import { describe, expect, it } from 'vitest';
import { COMPARE, COMPARE_SPECS, MODES, SPECS, compareKeyFor, specFor } from '../../src/viz/scope/data';

describe('scope viz data', () => {
  for (const m of MODES) {
    it(`${m} has a complete spec`, () => {
      const sp = SPECS[m];
      expect(sp).toBeTruthy();
      expect(sp.boxes).toHaveLength(5);
      expect(sp.boxes).toContain('real');
      expect(sp.boxes.every((b) => ['real', 'fake', 'off', 'inner'].includes(b))).toBe(true);
      expect(sp.path.length).toBeGreaterThan(0);
      expect(sp.path.every((i) => i >= 0 && i < 5 && sp.boxes[i] !== 'off')).toBe(true);
      expect(sp.catch.box).toBeGreaterThanOrEqual(0);
      expect(sp.catch.box).toBeLessThan(5);
      for (const l of ['en', 'de'] as const) {
        expect(sp.catch.label[l].split(/\s+/).length).toBeLessThanOrEqual(3);
        expect(sp.caption[l].length).toBeGreaterThan(10);
        expect(sp.takeaway[l].length).toBeGreaterThan(5);
        for (const n of sp.notes ?? []) expect(n.label[l].split(/\s+/).length).toBeLessThanOrEqual(3);
      }
    });
  }
  it('mode-specific features', () => {
    expect(SPECS['integration-tests'].catch.label.en).toBe('SQL rejected');
    expect(SPECS['component-tests'].boxes[1]).toBe('fake');
    expect(SPECS['smoke-tests'].ping).toBe(true);
    expect(SPECS['ui-ux-tests'].frame).toBe(true);
    expect(SPECS['acceptance-tests'].notes).toHaveLength(3);
    expect(SPECS['e2e-tests'].catch.span).toEqual([0, 1]);
    expect(SPECS['functional-tests'].boxes).toContain('inner');
  });
  it('compare scopes grow: unit is domain only', () => {
    expect(COMPARE_SPECS.unit.boxes.filter((b) => b === 'real')).toHaveLength(1);
    expect(COMPARE_SPECS.unit.boxes[2]).toBe('real');
    const real = (k: (typeof COMPARE)[number]) => COMPARE_SPECS[k].boxes.filter((b) => b === 'real').length;
    expect(real('unit')).toBeLessThanOrEqual(real('component') + 0);
    expect(real('integration')).toBeGreaterThan(real('unit'));
    expect(real('e2e')).toBeGreaterThan(real('integration'));
  });
  it('compare key maps modes; unknown mode falls back', () => {
    expect(compareKeyFor('e2e-tests')).toBe('e2e');
    expect(compareKeyFor('smoke-tests')).toBeNull();
    expect(specFor('nope')).toBe(SPECS['e2e-tests']);
  });
});
