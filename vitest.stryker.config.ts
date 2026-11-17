import { defineConfig, mergeConfig } from 'vitest/config';
import base from './vitest.config';

// Used only by StrykerJS. Its instrumentation (mutant switching + per-test coverage)
// makes loop-heavy engine tests such as the fuzzer run ~30x slower than normal,
// so the default 5 s limit fails the initial dry run. Normal `npm test` keeps 5 s.
// Stryker still applies its own per-mutant timeout (timeoutMS in stryker.config.json).
export default mergeConfig(base, defineConfig({ test: { testTimeout: 60_000 } }));
