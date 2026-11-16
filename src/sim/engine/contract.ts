// Consumer-contract exercise: a tiny schema checker plus five provider changes.
export type Bi = { en: string; de: string };
export type Rule =
  | { type: 'string' }
  | { type: 'integer'; min?: number }
  | { type: 'enum'; values: string[] };
export interface Field { name: string; rule: Rule }

/** What the reservation UI uses. Anything not listed here is ignored. */
export const CONTRACT: Field[] = [
  { name: 'id', rule: { type: 'string' } },
  { name: 'name', rule: { type: 'string' } },
  { name: 'priceCents', rule: { type: 'integer', min: 0 } },
  { name: 'status', rule: { type: 'enum', values: ['available', 'reserved', 'adopted'] } },
];

export const describeRule = (r: Rule): string =>
  r.type === 'integer' ? `integer${r.min !== undefined ? ` ≥ ${r.min}` : ''}` : r.type === 'enum' ? `one of ${r.values.map((v) => `"${v}"`).join(' | ')}` : r.type;
export const contractLine = (f: Field) => `${f.name}: ${describeRule(f.rule)}`;

export type Pet = Record<string, unknown>;
export const BASE_RESPONSE: Pet[] = [
  { id: 'p-17', name: 'Bella', priceCents: 12095, status: 'available' },
  { id: 'p-23', name: 'Rex', priceCents: 9000, status: 'reserved' },
];

export type Reason = 'missing' | 'type' | 'enum' | 'range';
export interface Violation { index: number; field: string; reason: Reason; got: unknown }

export function checkField(value: unknown, rule: Rule, present: boolean): Reason | null {
  if (!present) return 'missing';
  if (rule.type === 'string') return typeof value === 'string' ? null : 'type';
  if (rule.type === 'integer') {
    if (typeof value !== 'number' || !Number.isInteger(value)) return 'type';
    return rule.min !== undefined && value < rule.min ? 'range' : null;
  }
  return typeof value !== 'string' ? 'type' : rule.values.includes(value) ? null : 'enum';
}

/** Check every item of a response against the contract. Extra fields are ignored. */
export function verify(response: Pet[], contract: Field[] = CONTRACT): Violation[] {
  const out: Violation[] = [];
  response.forEach((item, index) => {
    for (const f of contract) {
      const present = Object.prototype.hasOwnProperty.call(item, f.name);
      const reason = checkField(item[f.name], f.rule, present);
      if (reason) out.push({ index, field: f.name, reason, got: item[f.name] });
    }
  });
  return out;
}

export interface ProviderChange { id: string; title: Bi; apply: (r: Pet[]) => Pet[] }
const map = (r: Pet[], fn: (p: Pet) => Pet) => r.map((p) => fn({ ...p }));

export const CHANGES: ProviderChange[] = [
  { id: 'rename', title: { en: 'Rename priceCents to price', de: 'priceCents in price umbenennen' },
    apply: (r) => map(r, (p) => { if ('priceCents' in p) { p.price = p.priceCents; delete p.priceCents; } return p; }) },
  { id: 'breed', title: { en: 'Add optional field breed', de: 'Optionales Feld breed hinzufügen' },
    apply: (r) => map(r, (p) => ({ ...p, breed: 'Labrador' })) },
  { id: 'status', title: { en: 'Status "reserved" becomes "on_hold"', de: 'Status „reserved“ wird zu „on_hold“' },
    apply: (r) => map(r, (p) => { if (p.status === 'reserved') p.status = 'on_hold'; return p; }) },
  { id: 'nullable', title: { en: 'Make name nullable', de: 'name nullable machen' },
    apply: (r) => map(r, (p) => (p.id === 'p-23' ? { ...p, name: null } : p)) },
  { id: 'string', title: { en: 'priceCents becomes a string', de: 'priceCents wird ein String' },
    apply: (r) => map(r, (p) => { const k = 'priceCents' in p ? 'priceCents' : 'price'; if (k in p) p[k] = String(p[k]); return p; }) },
];

export function applyChanges(ids: string[], base: Pet[] = BASE_RESPONSE): Pet[] {
  return CHANGES.filter((c) => ids.includes(c.id)).reduce((r, c) => c.apply(r), base.map((p) => ({ ...p })));
}

export interface Verdict { id: string; compatible: boolean; violations: Violation[] }
/** Verdict per change (each applied alone to the base response). */
export function verifyEach(ids: string[]): Verdict[] {
  return ids.map((id) => { const violations = verify(applyChanges([id])); return { id, compatible: violations.length === 0, violations }; });
}
export function verifyAll(ids: string[]): Violation[] { return verify(applyChanges(ids)); }

export interface JsonLine { text: string; path: string }
/** Pretty-print with a path per line, so the UI can mark failing lines. */
export function jsonLines(response: Pet[]): JsonLine[] {
  const out: JsonLine[] = [{ text: '[', path: '' }];
  response.forEach((item, i) => {
    out.push({ text: '  {', path: '' });
    const keys = Object.keys(item);
    keys.forEach((k, ki) => out.push({ text: `    ${JSON.stringify(k)}: ${JSON.stringify(item[k])}${ki < keys.length - 1 ? ',' : ''}`, path: `${i}.${k}` }));
    out.push({ text: `  }${i < response.length - 1 ? ',' : ''}`, path: '' });
  });
  out.push({ text: ']', path: '' });
  return out;
}
/** For a missing field the "line" is the one holding the renamed field, if any; otherwise nothing is marked. */
export const violationPaths = (vs: Violation[]) => new Set(vs.filter((v) => v.reason !== 'missing').map((v) => `${v.index}.${v.field}`));
