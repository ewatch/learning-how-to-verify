# Learning how to verify

A bilingual (English / Deutsch) static site that explains how to verify software, especially when AI coding agents
write it. 56 practices are ordered along a funnel from cheap, automatic checks to expensive, human ones. Each has
tools per language, evidence ratings with sources, and a ready-to-paste agent task. Ten practices have simulators
or animations that run in the browser. Start Here helps readers choose a first check for their own project.

- Plan and scope decisions: [`docs/PLAN.md`](docs/PLAN.md)
- Requirements review and remaining gaps: [`docs/REQUIREMENTS-REVIEW.md`](docs/REQUIREMENTS-REVIEW.md)
- Research base: [`research/`](research/) (evidence review, citation check)
- Funnel after a talk by Lauren Tan (@poteto); lifecycle overview after Cindy Sridharan (@copyconstruct).

## Develop

```bash
npm install
npm run dev          # http://localhost:4321
npm run ci           # types, data + engine tests, build, Playwright (what CI runs)
# If another worktree already uses port 4321:
PLAYWRIGHT_PORT=4324 npm run ci
```

| Command | What it checks |
|---|---|
| `npm run check` | TypeScript strict via `astro check` |
| `npm test` | every practice complete in both languages; references to tools, sources, guides valid; simulator engines (unit + property tests) |
| `npm run test:e2e` | Playwright smoke + axe accessibility, EN/DE, desktop/mobile |
| `npm run test:mutation` | StrykerJS on `src/sim/engine/` |
| `npm run check:licenses` | tool licenses vs. what GitHub reports (needs `gh` login) |
| `npm run check:guides` | re-runs the TLA+/Dafny guide examples and diffs the recorded output (needs Java, `TLA2TOOLS`, `dafny`) |

## Where things live

- `src/data/practices/*.ts`: practice content, one file per funnel layer, EN and DE side by side
- `src/data/tools.ts`, `sources.ts`, `guides.ts`, `glossary.ts`: registries
- `src/data/start.ts`, `typecheck.ts`: starting-point exercises, agent tasks and compiler lesson presets
- `src/sim/engine/`: pure simulator logic (tested); `src/sim/ui/`: DOM for each simulator
- `guides-src/`: the real TLA+/Dafny files and their recorded output
- `vendor/formal-verification/`: copy of the original German demos (reference only, not built)

## License

Code: MIT (`LICENSE`). Content: CC BY 4.0 (`LICENSE-CONTENT.md`).
