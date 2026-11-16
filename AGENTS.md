# Agents

- Verify before you finish: `npm run ci` must pass. Do not edit, skip or weaken tests in `tests/`.
- Content changes go in `src/data/`; every practice needs both `en` and `de`. Only cite sources in `src/data/sources.ts`, and only add a source after checking it against its DOI/arXiv page.
- Tool entries: open source only, SPDX license as GitHub reports it (`npm run check:licenses`).
- German text: technical terms stay English; plain, factual tone, no marketing.
- Simulator logic belongs in `src/sim/engine/` with tests; `src/sim/ui/` only renders.
