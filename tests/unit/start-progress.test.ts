import { describe, it, expect } from 'vitest';
import { parseProgress, serializeProgress, nextStep, fill } from '../../src/lib/start-progress';
import { START_TOUR } from '../../src/data/start';

const ids = START_TOUR.map((s) => s.id);

describe('start tour progress', () => {
  it('tour step ids are unique', () => {
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('empty, malformed or foreign values give no progress', () => {
    for (const raw of [null, undefined, '', 'not json', '{"a":1}', '42', '[1,2]']) expect(parseProgress(raw, ids).size).toBe(0);
    expect([...parseProgress('["lint","gone","lint"]', ids)]).toEqual(['lint']);
  });
  it('round-trips in tour order', () => {
    const opened = new Set(['canarying', 'funnel']);
    const raw = serializeProgress(opened, ids);
    expect(raw).toBe('["funnel","canarying"]');
    expect(parseProgress(raw, ids)).toEqual(opened);
  });
  it('the next step is the first one not opened', () => {
    expect(nextStep(new Set(), ids)).toBe(0);
    expect(nextStep(new Set(['funnel', 'why-layers', 'lint']), ids)).toBe(2);
    expect(nextStep(new Set(ids), ids)).toBe(-1);
  });
  it('fills placeholders and keeps unknown ones', () => {
    expect(fill('{n} of {total} {x}', { n: 3, total: 8 })).toBe('3 of 8 {x}');
  });
});
