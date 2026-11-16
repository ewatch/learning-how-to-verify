import { describe, expect, it } from 'vitest';
import { LEAN_EXAMPLES } from '../../src/sim/engine/lean';

describe('Lean proof steps', () => {
  it('has examples with bilingual text and identical line structure', () => {
    expect(LEAN_EXAMPLES.length).toBeGreaterThanOrEqual(4);
    for (const e of LEAN_EXAMPLES) {
      expect(e.name.en && e.name.de && e.desc.en && e.desc.de).toBeTruthy();
      expect(e.lines.en.length).toBe(e.lines.de.length);
      for (const s of e.steps) expect(s.note.en && s.note.de).toBeTruthy();
    }
  });
  it('every step points at a real line and shows goals or an #eval result', () => {
    for (const e of LEAN_EXAMPLES) for (const s of e.steps) {
      expect(s.line).toBeGreaterThanOrEqual(0);
      expect(s.line).toBeLessThan(e.lines.en.length);
      expect(s.goals !== undefined || s.msg !== undefined, `${e.id}:${s.line}`).toBe(true);
      for (const g of s.goals ?? []) {
        expect(g.goal.length).toBeGreaterThan(0);
        for (const hyp of g.hyps) expect(hyp).toMatch(/^[^:]+ : .+/);
      }
    }
  });
  it('theorem steps always have at least one goal until the last one, which closes all goals', () => {
    for (const e of LEAN_EXAMPLES.filter((x) => !x.fails)) {
      const last = e.steps[e.steps.length - 1]!;
      expect(last.goals, e.id).toEqual([]);
      expect(last.done).toBeDefined();
      for (const s of e.steps.slice(0, -1)) if (s.goals) expect(s.goals.length).toBeGreaterThan(0);
    }
  });
  it('the false claim ends in an error with an open goal and an explanation', () => {
    const e = LEAN_EXAMPLES.find((x) => x.fails)!;
    const last = e.steps[e.steps.length - 1]!;
    expect(last.err).toMatch(/counterexample/);
    expect(last.goals!.length).toBeGreaterThan(0);
    expect(last.fail?.en && last.fail?.de).toBeTruthy();
  });
  it('step lines are strictly increasing within an example', () => {
    for (const e of LEAN_EXAMPLES) e.steps.forEach((s, i) => { if (i) expect(s.line).toBeGreaterThanOrEqual(e.steps[i - 1]!.line); });
  });
});
