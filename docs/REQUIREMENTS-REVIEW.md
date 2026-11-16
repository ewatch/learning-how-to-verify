# Requirements review — 2026-11-16

Scope authority: [PLAN.md](PLAN.md), agreed in the initial Q1–Q36 requirements session. This review checks the current implementation in `.worktrees/p1-review` on `fix/p1-review`, starting from `0e86283`. Both worktrees were clean and at that commit before this follow-up; the earlier P1/P2 fixes and PHP additions were already present.

The current request prioritises concrete examples and a Getting Started page that helps readers choose where to begin in their own project, using hands-on exercises and agent feedback loops. It does not change the original scope or require completing every milestone-two or release item now.

## Implemented in this follow-up

- **Choose a first check:** Start Here offers six project situations: unknown baseline, type errors, wrong behaviour, passing tests that miss bugs, boundary/concurrency failures, and failures after release. Each has an exercise, expected feedback, definition of done, next practice and a copyable agent task. The original eight-step tour now gives exercises rather than just descriptions. The page explains the requirement → cheap check → diagnostic/counterexample → fix → full gate loop.
- **Compiler feedback:** Type systems & compilers now has a real TypeScript compiler exercise on the petstore reservation example. Four revisions show an unsafe lookup, a guard, a non-null assertion, and an owner-overwrite bug. Strictness can be toggled. The compiler gate runs before three behaviour checks; a compiler failure stops that stage. It explains which feedback to give an agent and why compiler success alone is insufficient.
- **Examples:** The previous task list said 31 practices lacked snippets; the current starting commit had **30**. All 30 now have an example, configuration fragment, command or human-review worksheet, with bilingual setup/expected-feedback notes. All **56 practices** have at least one snippet. Examples requiring application fixtures, instrumentation or external services say so. Human activities such as usability testing use session/review worksheets rather than implying automation replaces participants or reviewers.
- **Render all matching examples:** Language tabs previously rendered only the first matching snippet. They now show all examples for the selected language plus language-independent examples, with an explicit fallback where needed. The compiler page displays both failing code and its configuration.
- **LLM access:** Start Here has EN/DE Markdown twins and an entry in `llms.txt`; snippet fences derive syntax from filenames, so JSON/TOML/YAML configurations no longer inherit the programming-language tab's label.
- **UI checks:** The compiler example exposed low-contrast string tokens and mobile grid overflow. Shared simulator styles now keep code within scrollable panels and give string tokens sufficient contrast.

## Original requirements against current state

| Requirement | Current state | Remaining work |
|---|---|---|
| Bilingual funnel, lifecycle, stack, glossary and agent angle | Present, including PHP | Owner review of German; existing parity details in TASKS.md |
| ~56 practice pages with definitions, placement, limits, evidence, tools and agent tasks | All 56 present in EN/DE | Content depth varies; usability has no tool entry, and static-analysis language mappings remain incomplete |
| Shared petstore example and agent feedback | Used in simulators, examples and the new starting routes | Some advanced examples demonstrate adjacent mechanics; transfer to the reservation invariant still needs explanation per practice |
| “See it” on every practice page | 10 practices have a simulator/animation, including shared simulators | Dedicated “See it” template layer is still absent; 46 practices have no simulator/animation. Build reusable families, then add practice-specific explanations |
| Minimal snippet on every practice, core practices in multiple languages | At least one on all 56; code + config visible together | Some examples are intentionally partial or worksheets. Broaden native examples beyond JS/TS/PHP/Python; core practices do not all have a second language |
| 2–3 think-first questions | Type systems now has three, including prediction and transfer | 48 practices still have fewer than two |
| 3–5 worth/limit bullets and concrete setup steps | Most pages have at least three combined bullets | Four remain below three combined bullets: soak-tests, teeing, dynamic-exploration, auditing. Seventeen practices still have fewer than three agent steps |
| Getting Started helps readers act | Six starting situations, project exercises, feedback loop, eight-step learning tour, copyable tasks | Observe readers using the chooser; refine routes from their actual points of confusion |
| Tool guides: install → real example → output → deliberate break → mistakes → agent prompt | TLA+ and Dafny present; recorded output checked by a separate GitHub CI job | Milestone two: Lean 4, Z3, fast-check/Hypothesis, Stryker/mutmut, Jazzer.js/Atheris, typescript-eslint/Ruff, Semgrep. TLA+ config-copy clarification and German install labels remain |
| Markdown version of every page | Practices, individual stack pages, individual guides, why-layers, and now Start Here | Home, lifecycle, glossary, about, guides index and stack index still lack twins |
| Tested pure simulator engines; UI only renders | New compiler host and behaviour probes are in `src/sim/engine/`; data in `src/data/`; worker keeps compilation off the main thread | Compiler is limited to four fixed revisions, with ES5 ambient declarations; it is not a general project editor. The worker bundle is approximately 3.6 MB before compression and loads only on the first check |
| Self-verification: types, lint, engine/data/property tests, browser/a11y, links, licenses, recorded guide output, mutation | Types, unit/property/data, build and browser checks in `npm run ci`; separate GitHub jobs for licenses, guide output and mutation | No dedicated lint command or automated site-wide link-check gate. Mutation and external guide/tool checks are separate from the local `ci` script |
| Lifecycle taxonomy and navigation | Present | Pre-production list is dense; deployed tests under static analysis need a deliberate taxonomy decision |
| Hosting and legal | Static build exists; SITE_URL is hard-coded to the planned Pages host | Deployment/access, configurable base URL, domain, public-launch legal pages and repository visibility remain owner/release work; deployment was not verified in this review |

## Recommended next order

1. **Make every practice observable:** implement the six reusable visual families already listed in TASKS.md. Pair each with an input, a failure signal and a limit. A diagram alone should not be presented as a check the reader ran.
2. **Deepen the exercises:** add prediction and transfer questions to the 48 short pages; expand the four thin pages and 17 short agent procedures. Prioritise practices linked from Start Here.
3. **Make first tool use reproducible:** start milestone-two guides with typescript-eslint/Ruff and fast-check/Hypothesis, since they extend the cheap-feedback path. Keep recorded output and deliberate failures as in the existing tool guides.
4. **Finish parity and navigation:** remaining Markdown twins, German labels, glossary aliases, lifecycle grouping and taxonomy decision.
5. **Prepare release:** add lint/link gates, confirm the existing independent CI jobs on the final change, then resolve hosting and public-launch requirements with the owner.

## Verification and limits

Existing tests were left unchanged. New engine tests cover compiler rejection, strictness disabled, a genuine guard, suppressed diagnostics with a runtime failure, and the business-rule bug that still compiles. New browser tests cover all six recommendations and copied tasks, the compiler revisions and reruns, EN/DE, mobile/desktop and accessibility.

Eight practice examples were exercised in eleven separate Vitest cases: refactoring, tap-compare, real GrowthBook assignment, functional tests, a jsdom component, a Zod contract, and the tracing/exception helpers with a real in-memory OpenTelemetry exporter. The deliberately broken refactor fails on the empty-string owner. The benchmark was corrected after its Vitest API failed during execution; its two Tinybench tasks now run successfully. Temporary dependencies stayed outside the repository. All practice JS/TS snippets parse; new shell examples pass `bash -n`, and the Vector TOML parses. External APIs/CLI shapes were checked against primary documentation where needed. Infrastructure examples, Docker/PostgreSQL integration, ZAP, Vector, remote telemetry receivers, k6 workloads and participant-led worksheets were not all executed end to end. They are examples with stated prerequisites, not newly recorded tool guides.

Pre-merge validation added five tests for exact compiler diagnostics, reported reservation state and worker success/error messages, without changing any pre-existing tests. The full local gate passes 216 unit/data/engine tests and 42 browser tests. A one-off check resolved 4,731 internal link/anchor references across all 149 generated HTML pages.

The first full mutation run scored 69.99%, below the unchanged 70% gate. The new diagnostic and worker tests kill nine additional mutants. Stryker's incremental rerun reused 2,933 unchanged results, revalidated the affected mutants and passed at 70.30% across the same 2,967 mutations; the worker adapter is at 100%. No mutation exclusions, thresholds or pre-existing tests were weakened. Surviving mutants remain, so this is a passing gate rather than a claim of exhaustive correctness. All 15 engine files were checked against the report's source snapshots.

An independent no-mistakes review did not complete: its default provider hit a quota limit before reviewing code, and automatic approval rejected the fallback reviewer because of private-code exposure and persistent remote changes. The merge decision uses local manual review and the executed evidence above, not a claimed no-mistakes pipeline pass. Final local commands and results are recorded in TASKS.md. Tool/source registries were not changed; no new research citation or license assertion was introduced. Owner German review, remote CI and deployment remain separate checks.
