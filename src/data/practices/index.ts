import type { LayerId, Practice } from '../types';
import { LAYERS } from '../taxonomy';
import { codebase } from './codebase';
import { proseReview } from './prose-review';
import { staticChecks } from './static-checks';
import { staticDeep } from './static-deep';
import { staticTests } from './static-tests';
import { verification } from './verification';

const all = [...codebase, ...staticChecks, ...staticTests, ...staticDeep, ...verification, ...proseReview];
const layerOrder = new Map<LayerId, number>(LAYERS.map((x, i) => [x.id, i]));

/** All practices, ordered by funnel layer (stable within a layer). */
export const PRACTICES: Practice[] = all
  .map((p, i) => ({ p, i }))
  .sort((a, b) => layerOrder.get(a.p.layer)! - layerOrder.get(b.p.layer)! || a.i - b.i)
  .map((x) => x.p);

export const PRACTICE_BY_ID = new Map(PRACTICES.map((p) => [p.id, p]));
