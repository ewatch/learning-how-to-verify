/**
 * Progress through the "Start here" tour, kept in the reader's browser.
 * Pure functions only; the page script does the storage and DOM work.
 */
export const PROGRESS_KEY = 'lhtv:start-tour';

/** Reads a stored value; unknown ids and malformed input are ignored. */
export function parseProgress(raw: string | null | undefined, ids: readonly string[]): Set<string> {
  if (!raw) return new Set();
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return new Set();
    return new Set(value.filter((id): id is string => typeof id === 'string' && ids.includes(id)));
  } catch {
    return new Set();
  }
}

/** Serialises in tour order so the stored value is stable. */
export function serializeProgress(opened: ReadonlySet<string>, ids: readonly string[]): string {
  return JSON.stringify(ids.filter((id) => opened.has(id)));
}

/** Index of the first step not opened yet, or -1 when every step was opened. */
export function nextStep(opened: ReadonlySet<string>, ids: readonly string[]): number {
  return ids.findIndex((id) => !opened.has(id));
}

/** Fills {name} placeholders in a template. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
