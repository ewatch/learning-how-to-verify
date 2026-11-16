import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type Request = MessageEvent<{ revision: string; strict: boolean }>;
const channel = {
  onmessage: undefined as ((event: Request) => void) | undefined,
  postMessage: vi.fn(),
};
const send = (revision: string, strict: boolean) => channel.onmessage!({ data: { revision, strict } } as Request);

beforeAll(async () => {
  vi.stubGlobal('self', channel);
  await import('../../src/sim/engine/typecheck.worker');
});
beforeEach(() => channel.postMessage.mockClear());
afterAll(() => vi.unstubAllGlobals());

describe('compiler worker message interface', () => {
  it('delivers the real compiler result for the selected revision and strictness', () => {
    send('unchecked', true);
    expect(channel.postMessage).toHaveBeenCalledExactlyOnceWith({ result: {
      diagnostics: [
        { code: 18048, line: 7, column: 7, message: "'pet' is possibly 'undefined'." },
        { code: 18048, line: 8, column: 3, message: "'pet' is possibly 'undefined'." },
      ],
      checks: [],
    } });
  });

  it('delivers behaviour failures when the same unsafe revision bypasses strictness', () => {
    send('unchecked', false);
    expect(channel.postMessage).toHaveBeenCalledTimes(1);
    const response = channel.postMessage.mock.calls[0][0];
    expect(response.result.diagnostics).toEqual([]);
    expect(response.result.checks.map((check: { id: string; pass: boolean }) => [check.id, check.pass])).toEqual([
      ['available', true], ['missing', false], ['taken', true],
    ]);
  });

  it('returns an explicit error response for an invalid revision instead of stalling the UI', () => {
    send('unknown-revision', true);
    expect(channel.postMessage).toHaveBeenCalledExactlyOnceWith({ error: true });
  });
});
