import type { Practice } from '../data/types';
import { PRACTICES } from '../data/practices';
import { PARTS, PART_BY_ID, type PartId, type DomainPart } from '../data/petstore';

/** Practices whose example, exercise or diagram uses a part, in funnel order. */
export const practicesFor = (id: PartId): Practice[] => PRACTICES.filter((p) => p.domain.parts.includes(id));

/** Operations that apply a rule. */
export const operationsFor = (rule: PartId): DomainPart[] => PARTS.filter((p) => p.rules?.includes(rule));

export const partsOf = (p: Practice): DomainPart[] => p.domain.parts.map((id) => PART_BY_ID.get(id)!);
