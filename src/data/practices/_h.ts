import type { Evidence, Finding, L, Rating, ThinkFirst } from '../types';

export const l = (en: string, de: string): L => ({ en, de });
export const f = (src: string, en: string, de: string): Finding => ({ src, text: { en, de } });
export const ev = (rating: Rating, ...findings: Finding[]): Evidence => ({ rating, findings });
export const none = (): Evidence => ({ rating: 'none', findings: [] });
export const q = (qen: string, qde: string, aen: string, ade: string): ThinkFirst => ({ q: { en: qen, de: qde }, a: { en: aen, de: ade } });
