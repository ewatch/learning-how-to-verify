/**
 * Feature-flag exercise: 100 users in three segments, a flag "reservation-v2" with a target rule,
 * an incident in v2 and a kill switch. Pure logic; the UI only renders.
 */
import type { Outcome } from './outcome';

export type Target = 'off' | 'staff' | 'beta' | 'percent';
export type Segment = 'staff' | 'beta' | 'all';
export interface User { id: number; seg: Segment; bucket: number }

/** Users 1–5 are staff, 6–20 beta, 21–100 everyone else. `bucket` is a stable hash of the user id (0–99). */
export const USERS: User[] = Array.from({ length: 100 }, (_, i) => ({ id: i, seg: i < 5 ? 'staff' : i < 20 ? 'beta' : 'all', bucket: (i * 37 + 11) % 100 }));

/** Does the flag serve v2 to this user? Staff and beta stay on when the percentage rule is active. */
export function flagOn(u: User, target: Target, pct: number): boolean {
  if (target === 'staff') return u.seg === 'staff';
  if (target === 'beta') return u.seg !== 'all';
  if (target === 'percent') return u.seg !== 'all' || u.bucket < pct;
  return false;
}

export interface Exposure { staff: number; beta: number; all: number; total: number }
export function exposure(target: Target, pct: number, users: User[] = USERS): Exposure {
  const on = users.filter((u) => flagOn(u, target, pct));
  const n = (s: Segment) => on.filter((u) => u.seg === s).length;
  return { staff: n('staff'), beta: n('beta'), all: n('all'), total: on.length };
}

export type FlagsCause =
  | 'incident-exposed' // v2 fails, and the flag serves v2 to some users
  | 'incident-dark' // v2 fails, but the flag is off for everyone: nobody sees it
  | 'killed' // the kill switch moved the users on v2 back to v1
  | 'killed-none'; // the kill switch was used, but nobody was on v2

export interface FlagsValues { target: Target; pct: number; exposed: Exposure; users: number; moved: number; deploys: number }
export type FlagsOutcome = Outcome<FlagsCause, FlagsValues>;

/** Deploys in this exercise: v2 shipped once, switched off. Flag changes are not deploys. */
export const DEPLOYS = 1;

/**
 * Outcome after an incident or a kill switch. `killedFrom` is the flag state just before the kill switch,
 * or null when the flag is still on. Returns null when there is nothing to report (no incident, no kill).
 */
export function flagsOutcome(s: { target: Target; pct: number; incident: boolean; killedFrom: { target: Target; pct: number } | null }): FlagsOutcome | null {
  if (s.killedFrom) {
    const moved = exposure(s.killedFrom.target, s.killedFrom.pct);
    const values: FlagsValues = { target: s.killedFrom.target, pct: s.killedFrom.pct, exposed: exposure('off', 0), users: USERS.length, moved: moved.total, deploys: DEPLOYS };
    return { status: 'pass', causeId: moved.total ? 'killed' : 'killed-none', values };
  }
  if (!s.incident) return null;
  const exposed = exposure(s.target, s.pct);
  const values: FlagsValues = { target: s.target, pct: s.pct, exposed, users: USERS.length, moved: 0, deploys: DEPLOYS };
  return exposed.total ? { status: 'fail', causeId: 'incident-exposed', values } : { status: 'pass', causeId: 'incident-dark', values };
}

const RULE: Record<Target, (pct: number) => string> = {
  off: () => 'off for everyone',
  staff: () => 'on for segment staff',
  beta: () => 'on for segments staff, beta',
  percent: (pct) => `on for segments staff, beta + ${pct}% of everyone (hash of user id)`,
};

/** The flag service log in a neutral format (not the output of a specific flag product). */
export function flagsReport(o: FlagsOutcome): string {
  const v = o.values;
  if (o.causeId === 'killed' || o.causeId === 'killed-none') {
    return [
      `flag reservation-v2  before: ${RULE[v.target](v.pct)}`,
      `                     now:    ${RULE.off(0)}`,
      `users moved to v1: ${v.moved}   users on v2: 0`,
      `deploys: ${v.deploys} (v2 shipped dark)   builds for this change: 0`,
    ].join('\n');
  }
  const e = v.exposed;
  return [
    `flag reservation-v2  ${RULE[v.target](v.pct)}`,
    `users on v2: ${e.total} of ${v.users}  (staff ${e.staff}, beta ${e.beta}, everyone else ${e.all})`,
    `v2 error rate: 100% of v2 requests fail${e.total ? '' : ' (no v2 traffic)'}`,
    `alert: ${e.total ? `reservation-v2 failing for ${e.total} users` : 'none'}`,
  ].join('\n');
}
