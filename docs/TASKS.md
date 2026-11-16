# Next tasks

Source: independent review of the build from 2026-11-16 (all 147 pages, 1,063 links, every simulator), plus known open plan items.
`S` = small, mechanical, suitable for a smaller model · `M` = needs judgement · `U` = needs the owner.

## P1 · Bugs (fix first)

- [x] **S** Run buttons stay disabled forever if the user changes options during a run: `formal.ts` (model checker), `pbt.ts`, `invariant.ts`. Re-enabled in `render()`/`clear()`; cancellation checks after animation waits prevent stale output.
- [x] **S** German headings overflow at 390 px (`/de/practices/threat-modeling/`, `tdd`, `snapshot-tests`): `h1 { overflow-wrap: anywhere; hyphens: auto }`.
- [x] **S** Mobile nav scrolls sideways and hides the language switch and theme toggle: pin both, or wrap the nav.
- [x] **S** Jazzer.js snippet (fuzz-tests): import `printSearch` and `SearchSyntaxError`.
- [x] **S** k6 snippet: add `Content-Type: application/json`. Contracts JS snippet: import `assert` (`node:assert/strict`).
- [x] **S** Model-checker lesson says "2 people" when 3–4 are selected.
- [x] **S** Simulator controls are read twice by screen readers (visible label plus legend): use `aria-labelledby`.
- [x] **S** "Human review" label overflows the tip of the mini funnel on practice pages.

Completed on branch `fix/p1-review`. Browser probes reproduced all three stuck-button bugs before the fix and checked cancellation, reruns, selected people counts, group labels and 390 px layout in EN/DE afterward. Full `npm run ci`: 206 unit/data/property tests, 147 built pages and 30 browser tests passed. Existing tests were unchanged. Snippets were checked structurally; their external application dependencies were not run.

## P2 · Honesty of the evidence

- [x] **S** "None found" text: change "nobody has measured it" to "we found no study of its effect" (EN and DE, `src/i18n/ui.ts`).
- [x] **M** Re-rate AI evidence that shows tests are *insufficient*, not that the practice helps: e2e (METR) and acceptance (PatchDiff) to "weak / indirect". Monitoring (DORA correlation): same. Config tests: move the hard-coded-credentials finding to security scanning.
- [x] **S** `gloaguen2026`: decide between ICLR and preprint, and make venue and badge consistent.

Completed on branch `fix/p1-review`. AI findings for E2E tests, acceptance tests and monitoring are weak and explicitly indirect; config tests show no AI effect study found. The credential finding was already present in security scanning and remains there without duplication. Gloaguen is identified as a MemAgents workshop publication at ICLR, with no preprint badge. See the P2 interpretation notes in `research/citation-check.md`. Full `npm run ci` passed (206 tests, 147 pages, 30 browser tests); generated EN/DE HTML, Markdown and LLM exports were checked. Existing tests were unchanged.

## PHP stack support (additional request)

- [x] Add PHP to language selection, stack pages, saved selection, agent prompts, Socratic prompts and Markdown/LLM exports in EN/DE.
- [x] Add 19 open-source tools with GitHub-verified SPDX licenses, practice mappings and 7 native PHP snippets.

Verified: full `npm run ci` (206 tests, 149 pages, 30 browser tests); `npm run check:licenses` (all licenses match, with the checker’s existing manual/non-GitHub exceptions); targeted desktop/mobile browser checks for PHP selection, routes, snippets, copied prompts and persistence. All 7 snippets passed `php -l`; temporary PHP dependencies and representative domain fixtures exercised the examples (8 tests / 1,308 assertions plus a reviewed snapshot test). Repository dependencies and existing tests were unchanged.

## P3 · Requirement gaps

- [ ] **M** Req 1: "See it" (template layer 3) is missing everywhere; 46 of 56 practices have no simulator/animation after the compiler addition. Build about 6 reusable animated diagrams by family:
  - rollout (traffic shaping, shadowing, tap compare, teeing; reuse the canary component)
  - load curve (load, soak, performance)
  - trace waterfall (tracing, profiling, RUM)
  - test pyramid / test scopes (unit, component, integration, e2e, acceptance, smoke)
  - pipeline (CI, lint, types, security scanning, config)
  - review / feedback loop (code review, evals, agent rules, on-call)
- [ ] **M** Req 4: 48 pages have only one think-first question (plan: 2–3). Add a prediction question and a transfer question ("which bug would this miss?") to each, in EN and DE. Type systems now has three.
- [ ] **M** Thin pages: soak-tests, teeing, dynamic-exploration and auditing have fewer than 3 worth/limit bullets; 17 practices have fewer than 3 agent steps.
- [x] **M** Req 2, example coverage: all 56 practices now have at least one snippet, configuration, command or review worksheet. The starting commit had 30 missing, rather than the previously recorded 31. New examples include bilingual prerequisites and expected feedback. Language tabs render all matching examples, including code plus configuration.
- [ ] **M** Req 2, language/tool depth: add a second native language for core practices. `usability-tests` has no tools; `static-analysis` lacks its own JS, Python, .NET and Rust analysers.
- [x] **S** Markdown code fences: derive the language from the file extension (`.json`, `.toml`, `.yml`) instead of the programming language.
- [ ] **S** Req 3: Markdown twins are missing for home, lifecycle, glossary, about, guides index and stack index. Start Here now has EN/DE twins and an entry in `llms.txt`.
- [ ] **S** Glossary popovers are rarely triggered (about 1–3 per page): add aliases for common inflections and check coverage per page.

## Hands-on starting points and examples (current request)

- [x] Review the initial scope against the current implementation: [REQUIREMENTS-REVIEW.md](REQUIREMENTS-REVIEW.md), including a prioritised list of remaining work.
- [x] Extend Start Here with six project situations, exercises, expected feedback, completion criteria, follow-up practices and copyable agent tasks in EN/DE. Keep the eight-step tour, now with exercises, and explain the agent feedback loop.
- [x] Add the real TypeScript compiler exercise: unsafe lookup, guard, non-null assertion and a business-rule bug that still compiles; show compiler feedback before behaviour checks.
- [x] Fill all 30 missing example slots, show multiple matching snippets in language tabs, and fix file-based Markdown syntax labels.
- [x] Add Start Here Markdown twins and an `llms.txt` entry.
- [x] Verify new recommendations, copying, compiler revisions, cancellation/reruns, EN/DE desktop/mobile and accessibility. Fix simulator string contrast and grid overflow found by these checks.

Verified on `fix/p1-review` in `.worktrees/p1-review`: `PLAYWRIGHT_PORT=4324 npm run ci` passed (211 unit/data/engine tests, 149 built HTML pages and 42 browser tests). A separate preview port avoids the other checkout already listening on 4321; the Playwright config now supports this and keeps its managed preview in the foreground. All pre-existing tests are unchanged; five engine tests and twelve browser cases were added. Four self-contained example files passed six separate Vitest test cases; a deliberately broken refactor was rejected. JS/TS snippets parse, new shell snippets pass `bash -n`, and the Vector TOML parses. External-service examples were not all run end to end; see the review for the verification boundary. Tool and source registries were unchanged.

## P4 · Language parity (EN/DE)

- [ ] **S** Guide install labels are English on German pages (`os` field in `guides.ts`): make them bilingual.
- [ ] **S** Tools table headers "License", "Repo" and the link text "source" are hard-coded English (`LangTabs.astro`).
- [ ] **S** Differential simulator prints "old / new" in English. German Markdown uses "Q:/A:"; change to "F:/A:".
- [ ] **U** Owner reads the German text (start with home, start-here, 5 core practices, both guides).

## P5 · Information architecture

- [ ] **M** Lifecycle map: the pre-production column (35 items) is overloaded. Group it by funnel layer with subheadings, or make it collapsible.
- [ ] **M** Layer tags: load, soak, config and integration tests are tagged "static analysis" but run against deployed systems. Decide: move them to "verification (runtime)", or explain that tests count as static analysis in the funnel.
- [ ] **S** TLA+ guide: say "copy `Adopt.cfg` to `AdoptFixed.cfg`".

## P6 · Release

- [ ] **U** Cloudflare login (`! npx wrangler login`), then deploy to `*.pages.dev` and optionally put Cloudflare Access in front.
- [ ] **S** Until it is deployed, make the base URL in prompts and `llms.txt` configurable (`SITE_URL`).
- [ ] **U** Domain choice, then Impressum and privacy page (German law), then switch the repo to public with the MIT and CC BY 4.0 licenses.

## Milestone 2 (agreed earlier)

- [ ] **M** Getting-started guides with recorded output: Lean 4, Z3 (in-browser WASM), fast-check / Hypothesis, Stryker / mutmut, Jazzer.js / Atheris, typescript-eslint / Ruff, Semgrep.
