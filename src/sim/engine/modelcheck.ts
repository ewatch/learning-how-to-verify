/**
 * A tiny explicit-state model checker (breadth-first, like TLC) for the
 * "reserve a pet" protocol. Each person either checks then reserves in two
 * steps (like GET then POST), or does both in one atomic step (server-side).
 */
export type PC = 'idle' | 'sawFree' | 'done';
export interface State { pc: PC[]; owners: number[] }
export interface Step { actor: number; action: 'check' | 'reserve' | 'checkAndReserve'; state: State }
export interface Options { people: number; atomic: boolean }

export const key = (s: State) => `${s.pc.join(',')}|${[...s.owners].sort().join(',')}`;
export const init = (o: Options): State => ({ pc: Array.from({ length: o.people }, () => 'idle' as PC), owners: [] });

export function next(s: State, o: Options): Step[] {
  const out: Step[] = [];
  s.pc.forEach((pc, p) => {
    const set = (v: PC, owners = s.owners): State => ({ pc: s.pc.map((x, i) => (i === p ? v : x)), owners });
    if (o.atomic) {
      if (pc === 'idle') out.push({ actor: p, action: 'checkAndReserve', state: set('done', s.owners.length === 0 ? [p] : s.owners) });
    } else {
      if (pc === 'idle') out.push({ actor: p, action: 'check', state: set(s.owners.length === 0 ? 'sawFree' : 'done') });
      if (pc === 'sawFree') out.push({ actor: p, action: 'reserve', state: set('done', [...s.owners, p]) });
    }
  });
  return out;
}

export const onlyOneOwner = (s: State) => s.owners.length <= 1;

export interface CheckResult { distinct: number; generated: number; depth: number; violation: null | { trace: Step[]; initial: State } ; order: State[] }

export function modelCheck(o: Options, invariant = onlyOneOwner): CheckResult {
  const start = init(o);
  const parent = new Map<string, { from: string; step: Step } | null>([[key(start), null]]);
  const states = new Map<string, State>([[key(start), start]]);
  const depthOf = new Map<string, number>([[key(start), 0]]);
  const order: State[] = [start];
  let queue = [start];
  let generated = 1, depth = 0;
  const traceTo = (k: string): Step[] => {
    const tr: Step[] = [];
    let cur = parent.get(k);
    let ck = k;
    while (cur) { tr.unshift(cur.step); ck = cur.from; cur = parent.get(ck); }
    return tr;
  };
  if (!invariant(start)) return { distinct: 1, generated, depth, violation: { trace: [], initial: start }, order };
  while (queue.length) {
    const nq: State[] = [];
    for (const s of queue) {
      for (const st of next(s, o)) {
        generated++;
        const k = key(st.state);
        if (states.has(k)) continue;
        states.set(k, st.state);
        parent.set(k, { from: key(s), step: st });
        const d = depthOf.get(key(s))! + 1;
        depthOf.set(k, d);
        depth = Math.max(depth, d);
        order.push(st.state);
        if (!invariant(st.state)) return { distinct: states.size, generated, depth, violation: { trace: traceTo(k), initial: start }, order };
        nq.push(st.state);
      }
    }
    queue = nq;
  }
  return { distinct: states.size, generated, depth, violation: null, order };
}
