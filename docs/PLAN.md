# Plan — Learning how to verify (DE/EN)

Decided in a grilling session on 2026-11-16 (Q1–Q36). This file is the source of truth for scope; change it deliberately.

## Goal

A bilingual (English/German) static website that makes it easy to understand how to verify software across contexts, languages and environments — with first-class attention to code written by AI agents.

## Narrative

- **Primary story: the funnel** (Lauren Tan, @poteto): codebase → static analysis → verification (formal, runtime) → prose (rules, skills, AGENTS.md) → human review. *Catch problems as early and as cheaply as possible.* Presented honestly as a practitioner heuristic, with a note on where evidence is strong (middle layers), mixed (prose) and missing (the codebase premise).
- **Secondary view: the lifecycle map** (after Cindy Sridharan, @copyconstruct): pre-production → deploy → release → post-release. Redrawn as clickable SVG.
- Every practice is tagged with **funnel layer** + **lifecycle phase(s)**.
- Every practice has an **"with AI agents"** angle.
- **Shared running example:** petstore pet reservation for adoption — "a pet must never be reserved twice".
- Cross-cutting page **"Why one layer isn't enough with agents"** (PatchDiff, METR, ImpossibleBench, Perry et al.) — step 2 of "Start here".

## Practices (~56)

Cindy's list (Monitoring merged into one page tagged release + post-release; performance/load/soak/benchmark separate but cross-linked), plus:
- Funnel layers not in her list: API design/architecture/refactoring, type systems & compilers, CI (incl. flaky tests), prose rules (AGENTS.md/skills, sandboxing note), code review (incl. AI/LLM-as-judge first pass).
- Differential testing (cross-linked with tap compare & shadowing).
- Research-backed additions: end-to-end tests; snapshot/approval/golden-master/characterization; design by contract & assertions (incl. runtime verification); sanitizers; security scanning (SAST/DAST/SCA/secrets/supply chain); evals for the agent setup; TDD & spec-driven development as agent loop; test integrity (agents must not edit/game tests).
- Folded in: metamorphic + model-based → PBT; symbolic execution + BMC → formal verification; visual regression + accessibility → UI/UX; agent test generation → unit & mutation.

Inclusion rule for new practices: widely recognised **and** catches a distinct bug class **and** ≥1 open-source tool in a covered language. Otherwise fold in as a variant.

## Practice page template (progressive disclosure)

1. **Introduction** — 2–3 short sentences with a concrete problem (field `intro`), then **In one sentence** — what, and which bug it catches; under it a one-line "where it sits" strip (funnel layer, lifecycle phases, cost, feedback speed). Not a numbered section.
2. **Try it / See it** — in-browser simulator on the shared example, or one visual/animation. First numbered section, visible on the first screen.
3. **Worth it / limits / evidence** — 3–5 bullets; evidence block with two ratings (general SE, with AI agents: strong / moderate / weak / none found), one plain sentence per finding + citation; "none found" stays visible; preprints badged.
4. **Your language** — tabs (selection persists): tools, minimal snippet.
5. **Use with your agent** — one block with two named copy actions: the task for a coding agent, and the self-contained Socratic prompt (page content, chosen language, example code) for the reader's own LLM.
6. **Go deeper** — 2–3 "think first" questions with reveal, guides, related practices.

Revised 2026-11-16 after a UI review: the simulator moved ahead of "where it sits", and the two prompt blocks were merged.

One new concept per screen; glossary popovers instead of inline definitions.

## Design rule: show, don't tell (decided 2026-11-16)

Human pages minimise reading; visual and interactive guidance comes first. The Markdown twins, `llms.txt` and agent prompts keep the full text.
- Above the fold: name, one sentence, what it catches, the funnel position, then "Try it" / "See it".
- Long content is collapsed by default (details, notes on demand, sources behind a disclosure).
- Evidence is shown as two compact meters; the findings and citations open on request.
- Code notes appear on the marked lines (badge → note) and in the walkthrough, not as a list under the code.
- New explanations are a visual, animation or interaction first, a sentence second.

## Wording (decided 2026-11-17)

Introductions and UI text follow the writing rules of ASD-STE100 Simplified Technical English: short sentences (instructions ≤ 20 words, descriptions ≤ 25), active voice, simple tenses, one word for one meaning, no idioms or contractions. German uses the same plain style. The site makes no claim of STE conformance. Deeper practice content, guides and glossary keep their wording.

Term list: *check* = any step that can reject a change; *test* = code that runs examples and compares results; *bug* = wrong code; *failure* = a failed check or run; *mistake* = a wrong action by a person or an agent; *simulator* = the tool, *exercise* = the reader's task in it; *coding agent* at first mention, then *agent*.

## Getting-started guides (per tool)

Structure: outcome → install (per OS / in-browser) → first spec/test on the petstore example → run & read annotated output → break it on purpose → 3–5 beginner mistakes → next steps (official tutorials) → "Copy for your agent" setup prompt. Real recorded output, re-checked in CI.
- Milestone 1: TLA+ (TLC), Dafny.
- Milestone 2: Lean 4, Z3 (in-browser WASM), fast-check / Hypothesis, Stryker / mutmut, Jazzer.js / Atheris, typescript-eslint / Ruff, Semgrep.

## Entry points

Home (who it is for, one primary action to Start here, then the interactive funnel as the map with no layer pre-opened) · Start here (the 8-step guided tour, opening with the petstore example; progress kept in the browser) · Diagnose my project (pick a symptom, get a first check and the feedback loop; linked from the tour) · Lifecycle map · My stack (pick language) · Glossary · Guides.

About 10 practices are flagged **core** (`core: true`): the tour practices plus CI, test integrity, code review and agent rules. Long lists show them first.

Revised 2026-11-16 after a UI review.

## For LLMs

`llms.txt`, `llms-full.txt`, `.md` version of every page in both languages. Agent prompts are instructions: concrete steps, commands, definition of done. Plain, factual tone.

## Languages

- Programming languages in tables: JS/TS, Python, PHP, Java/Kotlin, C#/.NET, Go, Rust, C/C++ (+ others only where tooling is notable). Open-source tools only, single data file, each with license + repo.
- Site languages: EN and DE at full parity, `/en/…` and `/de/…`; switch keeps the page. EN authored first, DE reviewed by the owner. Technical terms stay English with German gloss.

## Tech

- Astro + TypeScript, content collections; no backend.
- Runnable examples: CodeMirror 6 (replaceable). Mostly hand-written JS/TS teaching simulators (ported from the `formal-verification` demos on the Hetzner server, which stays untouched), real WASM only where worth it (Z3, Pyodide), lazy-loaded.
- Fresh design: information architecture first, light design touch; light + dark mode.
- No cookies, no analytics, no external fonts.
- The site verifies itself: unit + property tests for engines, typecheck, lint, Playwright smoke tests (both languages), link checker, tool-data schema check, mutation testing of engines → "How this site verifies itself" page.

## Process

- Claude drafts content with sources; citations from memory are re-verified before publishing; owner reviews German and spot-checks tools.
- Research base: `research/evidence-and-missing-practices.md`.

## Repo, hosting, legal

- Public GitHub repo `ewatch/learning-how-to-verify`; first public version on GitHub Pages at `https://ewatch.github.io/learning-how-to-verify/` (workflow `.github/workflows/pages.yml`, base path from `PUBLIC_BASE_PATH`). Decided 2026-11-17; replaces the earlier plan of a private repo on Cloudflare Pages.
- License at public launch: MIT (code), CC BY 4.0 (content).
- Impressum + privacy page when a public domain exists.

## Credits

Funnel and lifecycle pictures as presented by Lauren Tan (@poteto); lifecycle overview originally by Cindy Sridharan (@copyconstruct).

## Milestone 1 (to be judged)

- Funnel home + lifecycle map.
- All ~56 practice pages with layers 1, 2, 5, 6, 7 filled from data.
- Ported simulators: mutation, PBT, fuzzing, differential, formal verification (wp, Dafny, TLA+, Lean); new unit-test simulator; canary/feature-flag animation.
- Getting-started guides: TLA+, Dafny.
- EN + DE, `llms.txt`, deployment.
