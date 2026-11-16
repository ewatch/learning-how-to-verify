import { describe, expect, it } from 'vitest';
import { BASE_RESPONSE, CONTRACT, applyChanges, contractLine, jsonLines, verify, verifyAll, verifyEach, violationPaths } from '../../src/sim/engine/contract';

const only = (id: string) => verifyEach([id])[0];

describe('contract checker', () => {
  it('base response satisfies the contract', () => expect(verify(BASE_RESPONSE)).toEqual([]));
  it('rename breaks: priceCents missing', () => {
    expect(only('rename').compatible).toBe(false);
    expect(only('rename').violations.map((v) => [v.field, v.reason])).toEqual([['priceCents', 'missing'], ['priceCents', 'missing']]);
  });
  it('adding breed is compatible', () => expect(only('breed')).toMatchObject({ compatible: true, violations: [] }));
  it('enum change breaks status', () => {
    expect(only('status').violations).toEqual([{ index: 1, field: 'status', reason: 'enum', got: 'on_hold' }]);
  });
  it('nullable name breaks', () => expect(only('nullable').violations).toMatchObject([{ field: 'name', reason: 'type', got: null }]));
  it('string price breaks with a type error', () => expect(only('string').violations.every((v) => v.field === 'priceCents' && v.reason === 'type')).toBe(true));
  it('negative price violates the range', () => expect(verify([{ ...BASE_RESPONSE[0], priceCents: -1 }])[0].reason).toBe('range'));
  it('non-integer price is a type error', () => expect(verify([{ ...BASE_RESPONSE[0], priceCents: 1.5 }])[0].reason).toBe('type'));
  it('combinations: breed + status breaks only on status', () => {
    expect(verifyAll(['breed', 'status']).map((v) => v.field)).toEqual(['status']);
  });
  it('combination of all breaks four fields', () => {
    expect(new Set(verifyAll(['rename', 'breed', 'status', 'nullable', 'string']).map((v) => v.field))).toEqual(new Set(['priceCents', 'status', 'name']));
  });
  it('no changes is compatible', () => expect(verifyAll([])).toEqual([]));
  it('does not mutate the base', () => { applyChanges(['rename', 'status']); expect(verify(BASE_RESPONSE)).toEqual([]); });
});

describe('rendering helpers', () => {
  it('contract lines read well', () => expect(CONTRACT.map(contractLine)).toContain('priceCents: integer ≥ 0'));
  it('json lines carry paths and violation paths match', () => {
    const lines = jsonLines(applyChanges(['status']));
    const bad = violationPaths(verifyAll(['status']));
    expect(lines.filter((l) => bad.has(l.path)).map((l) => l.text.trim())).toEqual(['"status": "on_hold"']);
  });
});
