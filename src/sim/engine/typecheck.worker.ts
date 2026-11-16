import { checkRevision } from './typecheck';
import type { TypeRevision } from '../../data/typecheck';

self.onmessage = (event: MessageEvent<{ revision: TypeRevision; strict: boolean }>) => {
  try {
    self.postMessage({ result: checkRevision(event.data.revision, event.data.strict) });
  } catch {
    self.postMessage({ error: true });
  }
};
