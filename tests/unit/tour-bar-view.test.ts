import { describe, it, expect } from 'vitest';
import { parseTour, serializeTour, emptyTour, enterStep, markDone, barCollapsed, chooseCollapsed, consumeReveal, revealNext } from '../../src/lib/start-progress';
import { START_TOUR } from '../../src/data/start';

const ids = START_TOUR.map((s) => s.id);

describe('tour bar view: strip or expanded task', () => {
  it('without a choice phones show the strip, wider screens the stored flag (default expanded)', () => {
    const s = { ...emptyTour(), active: true };
    expect(barCollapsed(s, true)).toBe(true);
    expect(barCollapsed(s, false)).toBe(false);
    expect(barCollapsed({ ...s, collapsed: true }, false)).toBe(true);
    expect(barCollapsed({ ...s, collapsed: true }, true)).toBe(true);
  });
  it('the reader\'s arrow choice counts on every screen', () => {
    const open = chooseCollapsed({ ...emptyTour(), active: true }, false);
    expect([barCollapsed(open, true), barCollapsed(open, false)]).toEqual([false, false]);
    const strip = chooseCollapsed(open, true);
    expect([barCollapsed(strip, true), barCollapsed(strip, false)]).toEqual([true, true]);
  });
  it('begin/continue and next show the task once, then the choice counts again', () => {
    const chosenStrip = chooseCollapsed({ ...emptyTour(), active: true }, true);
    const entered = enterStep(chosenStrip, 'funnel');
    expect(barCollapsed(entered, true)).toBe(false);
    expect(barCollapsed(consumeReveal(entered), true)).toBe(true);
    const next = revealNext(markDone(consumeReveal(entered), 'funnel', ids));
    expect([barCollapsed(next, true), barCollapsed(next, false)]).toEqual([false, false]);
    expect(barCollapsed(consumeReveal(next), false)).toBe(true);
  });
  it('helpers leave their input unchanged', () => {
    const s = enterStep(emptyTour(), 'funnel');
    consumeReveal(s);
    chooseCollapsed(s, true);
    expect([s.reveal, s.chosen, s.collapsed]).toEqual([true, undefined, false]);
  });
  it('stores chosen and reveal only when true; older values read as "no choice"', () => {
    const plain = { ...emptyTour(), active: true };
    expect(Object.keys(JSON.parse(serializeTour(plain, ids)))).toEqual(['v', 'opened', 'done', 'active', 'collapsed']);
    const both = revealNext(chooseCollapsed(plain, true));
    const raw = serializeTour(both, ids);
    expect(JSON.parse(raw)).toMatchObject({ collapsed: true, chosen: true, reveal: true });
    expect(parseTour(raw, ids)).toMatchObject({ collapsed: true, chosen: true, reveal: true });
    const old = parseTour('{"v":2,"opened":["funnel"],"done":[],"active":true,"collapsed":false}', ids);
    expect([old.chosen, old.reveal]).toEqual([undefined, undefined]);
    expect(barCollapsed(old, true)).toBe(true);
    const odd = parseTour('{"v":2,"active":true,"chosen":"yes","reveal":1}', ids);
    expect([odd.chosen, odd.reveal]).toEqual([undefined, undefined]);
  });
});
