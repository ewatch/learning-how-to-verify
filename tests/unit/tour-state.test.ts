import { describe, it, expect } from 'vitest';
import { parseTour, serializeTour, emptyTour, firstNotDone, stepAfter, stepStatuses, enterStep, markOpened, markDone, stepForPath, serializeProgress } from '../../src/lib/start-progress';
import { START_TOUR, TOUR_BAR, tourStepPath } from '../../src/data/start';

const ids = START_TOUR.map((s) => s.id);
const paths = START_TOUR.map(tourStepPath);

describe('tour state (version 2)', () => {
  it('empty, malformed or foreign values give the empty state', () => {
    for (const raw of [null, undefined, '', 'not json', '42', 'null', '"x"', '{"done":"lint"}']) {
      const s = parseTour(raw, ids);
      expect([s.opened.size, s.done.size, s.active, s.collapsed]).toEqual([0, 0, false, false]);
    }
  });
  it('migrates the version 1 array of opened steps', () => {
    const old = serializeProgress(new Set(['funnel', 'lint']), ids);
    const s = parseTour(old, ids);
    expect([...s.opened]).toEqual(['funnel', 'lint']);
    expect(s.done.size).toBe(0);
    expect(s.active).toBe(false);
    expect(parseTour('["lint","gone",3]', ids).opened).toEqual(new Set(['lint']));
  });
  it('round-trips in tour order and drops unknown ids', () => {
    const s = { opened: new Set(['canarying', 'funnel', 'gone']), done: new Set(['lint']), active: true, collapsed: true };
    const raw = serializeTour(s, ids);
    expect(JSON.parse(raw)).toEqual({ v: 2, opened: ['funnel', 'lint', 'canarying'], done: ['lint'], active: true, collapsed: true });
    expect(parseTour(raw, ids)).toEqual({ opened: new Set(['funnel', 'lint', 'canarying']), done: new Set(['lint']), active: true, collapsed: true });
  });
  it('a done step counts as opened, and flags must be true booleans', () => {
    const s = parseTour('{"v":2,"done":["lint"],"active":"yes","collapsed":1}', ids);
    expect(s.opened.has('lint')).toBe(true);
    expect([s.active, s.collapsed]).toEqual([false, false]);
  });
  it('the next step to continue is the first one not done', () => {
    expect(firstNotDone(emptyTour(), ids)).toBe(0);
    expect(firstNotDone({ ...emptyTour(), done: new Set(['funnel', 'why-layers', 'lint']), opened: new Set(ids) }, ids)).toBe(2);
    expect(firstNotDone({ ...emptyTour(), done: new Set(ids) }, ids)).toBe(-1);
  });
  it('step after', () => {
    expect(stepAfter(0, ids)).toBe(1);
    expect(stepAfter(ids.length - 1, ids)).toBe(-1);
    expect(stepAfter(-1, ids)).toBe(-1);
  });
  it('statuses: done, current, opened and open', () => {
    const s = { ...emptyTour(), done: new Set(['funnel']), opened: new Set(['funnel', 'lint']) };
    expect(stepStatuses(s, ids)).toEqual(['done', 'current', 'open', 'opened', 'open', 'open', 'open', 'open']);
    expect(stepStatuses({ ...emptyTour(), done: new Set(ids) }, ids).every((x) => x === 'done')).toBe(true);
  });
  it('entering a step activates the tour; opening does not; inputs stay unchanged', () => {
    const s0 = emptyTour();
    const s1 = enterStep(s0, 'funnel');
    expect(s1.active).toBe(true);
    expect(s1.opened.has('funnel')).toBe(true);
    expect(s0.opened.size).toBe(0);
    const s2 = markOpened({ ...s0, collapsed: true }, 'lint');
    expect([s2.active, s2.collapsed, s2.opened.has('lint')]).toEqual([false, true, true]);
  });
  it('marking done keeps the tour active until the last open step is done', () => {
    let s = enterStep(emptyTour(), 'funnel');
    s = markDone(s, 'funnel', ids);
    expect([s.active, s.done.has('funnel'), s.opened.has('funnel')]).toEqual([true, true, true]);
    for (const id of ids.slice(1, -1)) s = markDone(s, id, ids);
    expect(s.active).toBe(true);
    s = markDone(s, ids.at(-1)!, ids);
    expect(s.active).toBe(false);
    expect(firstNotDone(s, ids)).toBe(-1);
  });
  it('finds the step for a URL path, with and without a base path', () => {
    for (const base of ['', '/learning-how-to-verify']) {
      expect(stepForPath(`${base}/en/`, base, paths)).toBe(0);
      expect(stepForPath(`${base}/de`, base, paths)).toBe(0);
      expect(stepForPath(`${base}/en/why-layers/`, base, paths)).toBe(1);
      expect(stepForPath(`${base}/de/practices/unit-tests/`, base, paths)).toBe(paths.indexOf('practices/unit-tests/'));
      expect(stepForPath(`${base}/en/practices/canarying`, base, paths)).toBe(ids.length - 1);
      expect(stepForPath(`${base}/en/practices/lint/index.html`, base, paths)).toBe(3);
      expect(stepForPath(`${base}/en/practices/coverage/`, base, paths)).toBe(-1);
      expect(stepForPath(`${base}/en/start/`, base, paths)).toBe(-1);
      expect(stepForPath(`${base}/fr/`, base, paths)).toBe(-1);
      expect(stepForPath(`${base}/en/practices/lint/index.md`, base, paths)).toBe(-1);
    }
    expect(stepForPath('/en/why-layers/', '/learning-how-to-verify', paths)).toBe(-1);
    expect(stepForPath('/learning-how-to-verify-x/en/', '/learning-how-to-verify', paths)).toBe(-1);
    expect(stepForPath('/learning-how-to-verify/en/why-layers/', '', paths)).toBe(-1);
  });
  it('every step has a task, a done criterion and a target in both languages', () => {
    for (const s of START_TOUR) {
      for (const lang of ['en', 'de'] as const) {
        expect(s.task[lang].length).toBeGreaterThan(20);
        expect(s.doneWhen[lang].length).toBeGreaterThan(10);
      }
      expect(s.target).toMatch(/^[a-z0-9-]+$/);
    }
    for (const v of Object.values(TOUR_BAR)) expect(v.en && v.de).toBeTruthy();
  });
});
