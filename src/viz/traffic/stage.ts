// Tiny SVG helpers and a dot-flow stage (dots travelling along polylines).
export const NS = 'http://www.w3.org/2000/svg';
export type Pt = [number, number];
type A = Record<string, string | number | undefined>;

export function s<K extends keyof SVGElementTagNameMap>(tag: K, attrs: A = {}, ...kids: (Node | string)[]): SVGElementTagNameMap[K] {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined) el.setAttribute(k, String(v));
  for (const c of kids) el.append(c);
  return el;
}
/** Text; `opt` labels are hidden on narrow screens. */
export function text(x: number, y: number, str: string, cls = '', anchor: 'start' | 'middle' | 'end' = 'middle') {
  return s('text', { x, y, class: `tv-t ${cls}`.trim(), 'text-anchor': anchor }, str);
}
export function box(x: number, y: number, w: number, hgt: number, cls: string, label?: string) {
  const g = s('g', { class: 'tv-box' });
  g.append(s('rect', { x, y, width: w, height: hgt, rx: 6, class: `tv-rect ${cls}` }));
  if (label) g.append(text(x + w / 2, y + hgt / 2 + 4, label, 'tv-b'));
  return g;
}
export const line = (pts: Pt[], cls = '') => s('polyline', { points: pts.map((p) => p.join(',')).join(' '), class: `tv-line ${cls}`.trim(), fill: 'none' });

/** Sample a quadratic curve a->b bulging sideways by `bend` (antiparallel edges separate). */
export function curve(a: Pt, b: Pt, bend = 14, n = 8): Pt[] {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  const c: Pt = [mx - (dy / len) * bend * 2, my + (dx / len) * bend * 2];
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  return out;
}

export interface FlyOpts { cls: string; speed?: number; r?: number; onEnd?: () => void; fadeEnd?: boolean }
interface Dot { el: SVGCircleElement; pts: Pt[]; cum: number[]; len: number; d: number; speed: number; fade: boolean; fading: number; onEnd?: () => void }

export class Stage {
  layer = s('g', { class: 'tv-dots' });
  dots: Dot[] = [];
  max = 90;
  fly(pts: Pt[], o: FlyOpts): SVGCircleElement | null {
    if (this.dots.length >= this.max || pts.length < 2) return null;
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1]! + Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]));
    const el = s('circle', { r: o.r ?? 4, cx: pts[0]![0], cy: pts[0]![1], class: `tv-dot ${o.cls}` });
    this.layer.append(el);
    this.dots.push({ el, pts, cum, len: cum[cum.length - 1]!, d: 0, speed: o.speed ?? 120, fade: !!o.fadeEnd, fading: 0, onEnd: o.onEnd });
    return el;
  }
  step(dt: number) {
    for (const dot of [...this.dots]) {
      if (dot.fading > 0) {
        dot.fading -= dt;
        dot.el.style.opacity = String(Math.max(0, dot.fading / 0.6));
        if (dot.fading <= 0) this.drop(dot);
        continue;
      }
      dot.d = Math.min(dot.len, dot.d + dot.speed * dt);
      let i = 1;
      while (i < dot.cum.length - 1 && dot.cum[i]! < dot.d) i++;
      const a = dot.pts[i - 1]!, b = dot.pts[i]!, seg = dot.cum[i]! - dot.cum[i - 1]! || 1;
      const t = (dot.d - dot.cum[i - 1]!) / seg;
      dot.el.setAttribute('cx', String(a[0] + (b[0] - a[0]) * t));
      dot.el.setAttribute('cy', String(a[1] + (b[1] - a[1]) * t));
      if (dot.d >= dot.len) {
        dot.onEnd?.();
        if (dot.fade) dot.fading = 0.6; else this.drop(dot);
      }
    }
  }
  private drop(dot: Dot) { dot.el.remove(); this.dots = this.dots.filter((x) => x !== dot); }
  clear() { for (const d of this.dots) d.el.remove(); this.dots = []; }
}
