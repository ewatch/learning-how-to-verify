/**
 * Progress through the "Getting Started" tour, kept in the reader's browser.
 * Pure functions only; the start page and the tour bar do the storage and DOM work.
 *
 * Stored format (key PROGRESS_KEY):
 * - version 1 (before the tour bar): a JSON array of opened step ids, e.g. ["funnel","lint"].
 * - version 2: {"v":2,"opened":[…],"done":[…],"active":true,"collapsed":false}.
 *   Optional, written only when true: "chosen" (the reader set "collapsed" with the arrow) and
 *   "reveal" (show the task once on the next step page, after a begin/continue/next action).
 * parseTour reads both, so readers keep their progress; serializeTour always writes version 2.
 */
export const PROGRESS_KEY = 'lhtv:start-tour';

/** Media query for "phone": narrow window or touch screen. There the tour bar starts as the one-line strip. */
export const PHONE_QUERY = '(max-width: 35rem), (pointer: coarse)';

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

// ---------- version 2: opened + done + tour mode ----------

export interface TourState {
  /** steps whose page the reader opened */
  opened: Set<string>;
  /** steps the reader marked as done; a done step also counts as opened */
  done: Set<string>;
  /** tour mode: the bar shows on tour pages */
  active: boolean;
  /** the bar shows as a one-line strip */
  collapsed: boolean;
  /** the reader chose `collapsed` with the arrow; without a choice phones show the strip */
  chosen?: boolean;
  /** show the task expanded once on the next step page (set by begin/continue/next) */
  reveal?: boolean;
}

export const emptyTour = (): TourState => ({ opened: new Set(), done: new Set(), active: false, collapsed: false });

const idSet = (value: unknown, ids: readonly string[]): Set<string> =>
  new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string' && ids.includes(id)) : []);

/** Reads version 2 and migrates version 1 (an array of opened ids). Malformed input gives the empty state. */
export function parseTour(raw: string | null | undefined, ids: readonly string[]): TourState {
  if (!raw) return emptyTour();
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return emptyTour(); }
  if (Array.isArray(value)) return { ...emptyTour(), opened: idSet(value, ids) };
  if (!value || typeof value !== 'object') return emptyTour();
  const v = value as Record<string, unknown>;
  const done = idSet(v.done, ids);
  const opened = idSet(v.opened, ids);
  for (const id of done) opened.add(id);
  return {
    opened, done, active: v.active === true, collapsed: v.collapsed === true,
    ...(v.chosen === true && { chosen: true }), ...(v.reveal === true && { reveal: true }),
  };
}

/** Writes version 2, ids in tour order, so the stored value is stable. */
export function serializeTour(state: TourState, ids: readonly string[]): string {
  const ordered = (set: ReadonlySet<string>) => ids.filter((id) => set.has(id));
  return JSON.stringify({ v: 2, opened: ordered(new Set([...state.opened, ...state.done])), done: ordered(state.done), active: state.active, collapsed: state.collapsed,
    ...(state.chosen === true && { chosen: true }), ...(state.reveal === true && { reveal: true }) });
}

/**
 * Whether the tour bar shows as the one-line strip on this page. `phone`: narrow window or coarse pointer.
 * Once after a begin/continue/next action the task shows expanded; otherwise the reader's choice counts,
 * and without a choice phones show the strip and wider screens the stored flag (default: expanded).
 * The inline script in src/components/TourBar.astro repeats this rule before first paint.
 */
export function barCollapsed(state: TourState, phone: boolean): boolean {
  if (state.reveal === true) return false;
  if (state.chosen === true || !phone) return state.collapsed;
  return true;
}

/** Returns a copy with the reader's arrow choice stored. */
export const chooseCollapsed = (state: TourState, collapsed: boolean): TourState => ({ ...state, collapsed, chosen: true });

/** Returns a copy without the one-time reveal (the step page has shown the task). */
export function consumeReveal(state: TourState): TourState {
  const copy = { ...state };
  delete copy.reveal;
  return copy;
}

/** Returns a copy that shows the task once on the next step page. */
export const revealNext = (state: TourState): TourState => ({ ...state, reveal: true });

/** Index of the first step that is not done, or -1 when every step is done. */
export const firstNotDone = (state: TourState, ids: readonly string[]): number => nextStep(state.done, ids);

/** Index of the step after `index`, or -1 after the last step. */
export const stepAfter = (index: number, ids: readonly string[]): number => (index >= 0 && index + 1 < ids.length ? index + 1 : -1);

export type StepStatus = 'done' | 'opened' | 'current' | 'open';

/** Status of each step for the start page list: "current" is the first step that is not done. */
export function stepStatuses(state: TourState, ids: readonly string[]): StepStatus[] {
  const current = firstNotDone(state, ids);
  return ids.map((id, i) => (state.done.has(id) ? 'done' : i === current ? 'current' : state.opened.has(id) ? 'opened' : 'open'));
}

/** Returns a copy with the step opened and the tour active (the reader entered a step from the start page). */
export function enterStep(state: TourState, id: string): TourState {
  return { ...state, opened: new Set([...state.opened, id]), active: true, reveal: true };
}

/** Returns a copy with the step opened (the reader is on its page). */
export function markOpened(state: TourState, id: string): TourState {
  return { ...state, opened: new Set([...state.opened, id]) };
}

/** Returns a copy with the step done. When every step is done, the tour ends. */
export function markDone(state: TourState, id: string, ids: readonly string[]): TourState {
  const done = new Set([...state.done, id]);
  const opened = new Set([...state.opened, id]);
  return { ...state, opened, done, active: state.active && ids.some((x) => !done.has(x)) };
}

/**
 * Index of the tour step for a URL path, or -1. `base` is the deployment prefix without a trailing slash
 * ('' or e.g. '/learning-how-to-verify'); `paths` are the step paths after /{lang}/ ('' for the home page).
 */
export function stepForPath(pathname: string, base: string, paths: readonly string[]): number {
  let p = pathname;
  try { p = decodeURI(p); } catch { /* keep the raw path */ }
  const prefix = base.replace(/\/+$/, '');
  if (prefix) {
    if (p !== prefix && !p.startsWith(prefix + '/')) return -1;
    p = p.slice(prefix.length);
  }
  const m = /^\/(?:en|de)(?:\/(.*))?$/.exec(p.replace(/\/index\.html$/, '/'));
  if (!m) return -1;
  let rest = (m[1] ?? '').replace(/\/{2,}/g, '/');
  if (rest && !rest.endsWith('/')) rest += '/';
  return paths.indexOf(rest);
}
