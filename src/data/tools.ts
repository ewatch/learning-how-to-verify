import type { LangId, Tool } from './types';

const gh = (r: string) => `https://github.com/${r}`;
function t(id: string, name: string, url: string, repo: string, license: string, langs: LangId[]): Tool {
  return { id, name, url, repo: repo.startsWith('http') ? repo : gh(repo), license, langs };
}

/**
 * Open-source tools only. `license` is the SPDX id as reported by the repository.
 * `npm run verify:data` checks GitHub-hosted repos against the GitHub API.
 */
export const TOOLS: Tool[] = [
  // ---------- test runners ----------
  t('vitest', 'Vitest', 'https://vitest.dev', 'vitest-dev/vitest', 'MIT', ['js']),
  t('jest', 'Jest', 'https://jestjs.io', 'jestjs/jest', 'MIT', ['js']),
  t('node-test', 'node:test', 'https://nodejs.org/api/test.html', 'nodejs/node', 'MIT', ['js']),
  t('pytest', 'pytest', 'https://pytest.org', 'pytest-dev/pytest', 'MIT', ['python']),
  t('junit', 'JUnit', 'https://junit.org', 'junit-team/junit-framework', 'EPL-2.0', ['java']),
  t('kotest', 'Kotest', 'https://kotest.io', 'kotest/kotest', 'Apache-2.0', ['java']),
  t('xunit', 'xUnit.net', 'https://xunit.net', 'xunit/xunit', 'Apache-2.0', ['dotnet']),
  t('nunit', 'NUnit', 'https://nunit.org', 'nunit/nunit', 'MIT', ['dotnet']),
  t('go-test', 'go test', 'https://pkg.go.dev/testing', 'golang/go', 'BSD-3-Clause', ['go']),
  t('cargo-test', 'cargo test', 'https://doc.rust-lang.org/cargo/commands/cargo-test.html', 'rust-lang/cargo', 'Apache-2.0', ['rust']),
  t('googletest', 'GoogleTest', 'https://google.github.io/googletest/', 'google/googletest', 'BSD-3-Clause', ['cpp']),
  t('catch2', 'Catch2', 'https://github.com/catchorg/Catch2', 'catchorg/Catch2', 'BSL-1.0', ['cpp']),

  // ---------- property-based ----------
  t('fast-check', 'fast-check', 'https://fast-check.dev', 'dubzzz/fast-check', 'MIT', ['js']),
  t('hypothesis', 'Hypothesis', 'https://hypothesis.works', 'HypothesisWorks/hypothesis', 'MPL-2.0', ['python']),
  t('jqwik', 'jqwik', 'https://jqwik.net', 'jqwik-team/jqwik', 'EPL-2.0', ['java']),
  t('fscheck', 'FsCheck', 'https://fscheck.github.io/FsCheck/', 'fscheck/FsCheck', 'BSD-3-Clause', ['dotnet']),
  t('rapid', 'rapid', 'https://pkg.go.dev/pgregory.net/rapid', 'flyingmutant/rapid', 'MPL-2.0', ['go']),
  t('proptest', 'proptest', 'https://proptest-rs.github.io/proptest/', 'proptest-rs/proptest', 'Apache-2.0', ['rust']),
  t('rapidcheck', 'RapidCheck', 'https://github.com/emil-e/rapidcheck', 'emil-e/rapidcheck', 'BSD-2-Clause', ['cpp']),

  // ---------- fuzzing ----------
  t('jazzer-js', 'Jazzer.js', 'https://github.com/CodeIntelligenceTesting/jazzer.js', 'CodeIntelligenceTesting/jazzer.js', 'Apache-2.0', ['js']),
  t('atheris', 'Atheris', 'https://github.com/google/atheris', 'google/atheris', 'Apache-2.0', ['python']),
  t('jazzer', 'Jazzer', 'https://github.com/CodeIntelligenceTesting/jazzer', 'CodeIntelligenceTesting/jazzer', 'Apache-2.0', ['java']),
  t('sharpfuzz', 'SharpFuzz', 'https://github.com/Metalnem/sharpfuzz', 'Metalnem/sharpfuzz', 'MIT', ['dotnet']),
  t('go-fuzz', 'Go native fuzzing', 'https://go.dev/doc/security/fuzz/', 'golang/go', 'BSD-3-Clause', ['go']),
  t('cargo-fuzz', 'cargo-fuzz', 'https://rust-fuzz.github.io/book/cargo-fuzz.html', 'rust-fuzz/cargo-fuzz', 'Apache-2.0', ['rust']),
  t('libfuzzer', 'libFuzzer', 'https://llvm.org/docs/LibFuzzer.html', 'llvm/llvm-project', 'Apache-2.0 WITH LLVM-exception', ['cpp']),
  t('aflplusplus', 'AFL++', 'https://aflplus.plus', 'AFLplusplus/AFLplusplus', 'AGPL-3.0', ['cpp']),
  t('oss-fuzz', 'OSS-Fuzz', 'https://google.github.io/oss-fuzz/', 'google/oss-fuzz', 'Apache-2.0', ['any']),

  // ---------- mutation ----------
  t('stryker-js', 'StrykerJS', 'https://stryker-mutator.io', 'stryker-mutator/stryker-js', 'Apache-2.0', ['js']),
  t('mutmut', 'mutmut', 'https://mutmut.readthedocs.io', 'boxed/mutmut', 'BSD-3-Clause', ['python']),
  t('cosmic-ray', 'Cosmic Ray', 'https://cosmic-ray.readthedocs.io', 'sixty-north/cosmic-ray', 'MIT', ['python']),
  t('pitest', 'PIT', 'https://pitest.org', 'hcoles/pitest', 'Apache-2.0', ['java']),
  t('stryker-net', 'Stryker.NET', 'https://stryker-mutator.io', 'stryker-mutator/stryker-net', 'Apache-2.0', ['dotnet']),
  t('gremlins', 'Gremlins', 'https://gremlins.dev', 'go-gremlins/gremlins', 'Apache-2.0', ['go']),
  t('cargo-mutants', 'cargo-mutants', 'https://mutants.rs', 'sourcefrog/cargo-mutants', 'MIT', ['rust']),
  t('mull', 'Mull', 'https://mull.readthedocs.io', 'mull-project/mull', 'Apache-2.0', ['cpp']),

  // ---------- coverage ----------
  t('c8', 'c8', 'https://github.com/bcoe/c8', 'bcoe/c8', 'ISC', ['js']),
  t('coveragepy', 'Coverage.py', 'https://coverage.readthedocs.io', 'coveragepy/coveragepy', 'Apache-2.0', ['python']),
  t('jacoco', 'JaCoCo', 'https://www.jacoco.org', 'jacoco/jacoco', 'EPL-2.0', ['java']),
  t('coverlet', 'Coverlet', 'https://github.com/coverlet-coverage/coverlet', 'coverlet-coverage/coverlet', 'MIT', ['dotnet']),
  t('go-cover', 'go test -cover', 'https://go.dev/doc/build-cover', 'golang/go', 'BSD-3-Clause', ['go']),
  t('cargo-llvm-cov', 'cargo-llvm-cov', 'https://github.com/taiki-e/cargo-llvm-cov', 'taiki-e/cargo-llvm-cov', 'Apache-2.0', ['rust']),
  t('lcov', 'gcov + lcov', 'https://github.com/linux-test-project/lcov', 'linux-test-project/lcov', 'GPL-2.0', ['cpp']),

  // ---------- types & compilers ----------
  t('typescript', 'TypeScript', 'https://www.typescriptlang.org', 'microsoft/TypeScript', 'Apache-2.0', ['js']),
  t('mypy', 'mypy', 'https://mypy-lang.org', 'python/mypy', 'MIT', ['python']),
  t('pyright', 'Pyright', 'https://microsoft.github.io/pyright/', 'microsoft/pyright', 'MIT', ['python']),
  t('nullaway', 'NullAway', 'https://github.com/uber/NullAway', 'uber/NullAway', 'MIT', ['java']),
  t('roslyn', 'Roslyn (C# compiler, nullable reference types)', 'https://github.com/dotnet/roslyn', 'dotnet/roslyn', 'MIT', ['dotnet']),
  t('go-vet', 'go vet', 'https://pkg.go.dev/cmd/vet', 'golang/go', 'BSD-3-Clause', ['go']),
  t('rustc', 'rustc (borrow checker)', 'https://www.rust-lang.org', 'rust-lang/rust', 'Apache-2.0', ['rust']),
  t('clang', 'Clang / LLVM', 'https://clang.llvm.org', 'llvm/llvm-project', 'Apache-2.0 WITH LLVM-exception', ['cpp']),

  // ---------- lint ----------
  t('eslint', 'ESLint', 'https://eslint.org', 'eslint/eslint', 'MIT', ['js']),
  t('typescript-eslint', 'typescript-eslint', 'https://typescript-eslint.io', 'typescript-eslint/typescript-eslint', 'MIT', ['js']),
  t('biome', 'Biome', 'https://biomejs.dev', 'biomejs/biome', 'Apache-2.0', ['js']),
  t('ruff', 'Ruff', 'https://docs.astral.sh/ruff/', 'astral-sh/ruff', 'MIT', ['python']),
  t('checkstyle', 'Checkstyle', 'https://checkstyle.org', 'checkstyle/checkstyle', 'LGPL-2.1', ['java']),
  t('detekt', 'detekt', 'https://detekt.dev', 'detekt/detekt', 'Apache-2.0', ['java']),
  t('roslyn-analyzers', '.NET analyzers', 'https://learn.microsoft.com/dotnet/fundamentals/code-analysis/overview', 'dotnet/sdk', 'MIT', ['dotnet']),
  t('golangci-lint', 'golangci-lint', 'https://golangci-lint.run', 'golangci/golangci-lint', 'GPL-3.0', ['go']),
  t('clippy', 'Clippy', 'https://doc.rust-lang.org/clippy/', 'rust-lang/rust-clippy', 'Apache-2.0', ['rust']),
  t('clang-tidy', 'clang-tidy', 'https://clang.llvm.org/extra/clang-tidy/', 'llvm/llvm-project', 'Apache-2.0 WITH LLVM-exception', ['cpp']),

  // ---------- static analysis (bug finders) ----------
  t('semgrep', 'Semgrep CE', 'https://semgrep.dev', 'semgrep/semgrep', 'LGPL-2.1', ['any']),
  t('error-prone', 'Error Prone', 'https://errorprone.info', 'google/error-prone', 'Apache-2.0', ['java']),
  t('spotbugs', 'SpotBugs', 'https://spotbugs.github.io', 'spotbugs/spotbugs', 'LGPL-2.1', ['java']),
  t('infer', 'Infer', 'https://fbinfer.com', 'meta/infer', 'MIT', ['java', 'cpp']),
  t('staticcheck', 'Staticcheck', 'https://staticcheck.dev', 'dominikh/go-tools', 'MIT', ['go']),
  t('cppcheck', 'Cppcheck', 'https://cppcheck.sourceforge.io', 'cppcheck-opensource/cppcheck', 'GPL-3.0', ['cpp']),
  t('clang-analyzer', 'Clang Static Analyzer', 'https://clang-analyzer.llvm.org', 'llvm/llvm-project', 'Apache-2.0 WITH LLVM-exception', ['cpp']),

  // ---------- security scanning ----------
  t('bandit', 'Bandit', 'https://bandit.readthedocs.io', 'PyCQA/bandit', 'Apache-2.0', ['python']),
  t('gosec', 'gosec', 'https://github.com/securego/gosec', 'securego/gosec', 'Apache-2.0', ['go']),
  t('govulncheck', 'govulncheck', 'https://go.dev/doc/security/vuln/', 'golang/vuln', 'BSD-3-Clause', ['go']),
  t('cargo-audit', 'cargo-audit', 'https://rustsec.org', 'rustsec/rustsec', 'Apache-2.0 OR MIT', ['rust']),
  t('osv-scanner', 'OSV-Scanner', 'https://google.github.io/osv-scanner/', 'google/osv-scanner', 'Apache-2.0', ['any']),
  t('trivy', 'Trivy', 'https://trivy.dev', 'aquasecurity/trivy', 'Apache-2.0', ['any']),
  t('gitleaks', 'Gitleaks', 'https://gitleaks.io', 'gitleaks/gitleaks', 'MIT', ['any']),
  t('zap', 'ZAP', 'https://www.zaproxy.org', 'zaproxy/zaproxy', 'Apache-2.0', ['any']),
  t('syft', 'Syft (SBOM)', 'https://github.com/anchore/syft', 'anchore/syft', 'Apache-2.0', ['any']),
  t('nuclei', 'Nuclei', 'https://docs.projectdiscovery.io/tools/nuclei', 'projectdiscovery/nuclei', 'MIT', ['any']),
  t('sqlmap', 'sqlmap', 'https://sqlmap.org', 'sqlmapproject/sqlmap', 'GPL-2.0', ['any']),
  t('threat-dragon', 'OWASP Threat Dragon', 'https://www.threatdragon.com', 'OWASP/threat-dragon', 'Apache-2.0', ['any']),
  t('pytm', 'pytm', 'https://github.com/OWASP/pytm', 'OWASP/pytm', 'MIT', ['python']),
  t('threagile', 'Threagile', 'https://threagile.io', 'Threagile/threagile', 'MIT', ['any']),

  // ---------- CI ----------
  t('woodpecker', 'Woodpecker CI', 'https://woodpecker-ci.org', 'woodpecker-ci/woodpecker', 'Apache-2.0', ['any']),
  t('jenkins', 'Jenkins', 'https://www.jenkins.io', 'jenkinsci/jenkins', 'MIT', ['any']),
  t('act', 'act (run GitHub Actions locally)', 'https://nektosact.com', 'nektos/act', 'MIT', ['any']),
  t('pre-commit', 'pre-commit', 'https://pre-commit.com', 'pre-commit/pre-commit', 'MIT', ['any']),

  // ---------- architecture & refactoring ----------
  t('dependency-cruiser', 'dependency-cruiser', 'https://github.com/sverweij/dependency-cruiser', 'sverweij/dependency-cruiser', 'MIT', ['js']),
  t('import-linter', 'Import Linter', 'https://import-linter.readthedocs.io', 'import-linter/import-linter', 'BSD-2-Clause', ['python']),
  t('archunit', 'ArchUnit', 'https://www.archunit.org', 'TNG/ArchUnit', 'Apache-2.0', ['java']),
  t('archunitnet', 'ArchUnitNET', 'https://github.com/TNG/ArchUnitNET', 'TNG/ArchUnitNET', 'Apache-2.0', ['dotnet']),
  t('go-arch-lint', 'go-arch-lint', 'https://github.com/fe3dback/go-arch-lint', 'fe3dback/go-arch-lint', 'MIT', ['go']),
  t('ast-grep', 'ast-grep', 'https://ast-grep.github.io', 'ast-grep/ast-grep', 'MIT', ['any']),
  t('openrewrite', 'OpenRewrite', 'https://docs.openrewrite.org', 'openrewrite/rewrite', 'Apache-2.0', ['java']),
  t('jscodeshift', 'jscodeshift', 'https://github.com/meta/jscodeshift', 'meta/jscodeshift', 'MIT', ['js']),
  t('libcst', 'LibCST', 'https://libcst.readthedocs.io', 'Instagram/LibCST', 'MIT', ['python']),
  t('comby', 'Comby', 'https://comby.dev', 'comby-tools/comby', 'Apache-2.0', ['any']),

  // ---------- integration / component / e2e / BDD ----------
  t('testcontainers', 'Testcontainers', 'https://testcontainers.com', 'testcontainers/testcontainers-java', 'MIT', ['java', 'js', 'python', 'dotnet', 'go', 'rust']),
  t('playwright', 'Playwright', 'https://playwright.dev', 'microsoft/playwright', 'Apache-2.0', ['js', 'python', 'java', 'dotnet']),
  t('cypress', 'Cypress', 'https://www.cypress.io', 'cypress-io/cypress', 'MIT', ['js']),
  t('testing-library', 'Testing Library', 'https://testing-library.com', 'testing-library/dom-testing-library', 'MIT', ['js']),
  t('storybook', 'Storybook', 'https://storybook.js.org', 'storybookjs/storybook', 'MIT', ['js']),
  t('cucumber', 'Cucumber', 'https://cucumber.io', 'cucumber/cucumber-js', 'MIT', ['js', 'java', 'go']),
  t('behave', 'behave', 'https://behave.readthedocs.io', 'behave/behave', 'BSD-2-Clause', ['python']),
  t('reqnroll', 'Reqnroll', 'https://reqnroll.net', 'reqnroll/Reqnroll', 'BSD-3-Clause', ['dotnet']),
  t('schemathesis', 'Schemathesis', 'https://schemathesis.io', 'schemathesis/schemathesis', 'MIT', ['any']),
  t('restler', 'RESTler', 'https://github.com/microsoft/restler-fuzzer', 'microsoft/restler-fuzzer', 'MIT', ['any']),

  // ---------- contracts (consumer-driven) ----------
  t('pact', 'Pact', 'https://docs.pact.io', 'pact-foundation/pact-js', 'MIT', ['js', 'python', 'java', 'dotnet', 'go', 'rust']),
  t('specmatic', 'Specmatic', 'https://specmatic.io', 'specmatic/specmatic', 'MIT', ['any']),

  // ---------- snapshot / approval ----------
  t('syrupy', 'syrupy', 'https://github.com/syrupy-project/syrupy', 'syrupy-project/syrupy', 'MIT', ['python']),
  t('approvaltests', 'ApprovalTests', 'https://approvaltests.com', 'approvals/ApprovalTests.Java', 'Apache-2.0', ['java', 'dotnet', 'python', 'cpp', 'js']),
  t('verify', 'Verify', 'https://github.com/VerifyTests/Verify', 'VerifyTests/Verify', 'MIT', ['dotnet']),
  t('insta', 'insta', 'https://insta.rs', 'mitsuhiko/insta', 'Apache-2.0', ['rust']),

  // ---------- UI / a11y / visual ----------
  t('axe-core', 'axe-core', 'https://github.com/dequelabs/axe-core', 'dequelabs/axe-core', 'MPL-2.0', ['js', 'any']),
  t('lighthouse', 'Lighthouse', 'https://developer.chrome.com/docs/lighthouse', 'GoogleChrome/lighthouse', 'Apache-2.0', ['any']),
  t('pa11y', 'Pa11y', 'https://pa11y.org', 'pa11y/pa11y', 'LGPL-3.0', ['any']),
  t('backstopjs', 'BackstopJS', 'https://github.com/garris/BackstopJS', 'garris/BackstopJS', 'MIT', ['any']),

  // ---------- benchmark / performance / load ----------
  t('tinybench', 'tinybench', 'https://github.com/tinylibs/tinybench', 'tinylibs/tinybench', 'MIT', ['js']),
  t('pytest-benchmark', 'pytest-benchmark', 'https://pytest-benchmark.readthedocs.io', 'ionelmc/pytest-benchmark', 'BSD-2-Clause', ['python']),
  t('jmh', 'JMH', 'https://github.com/openjdk/jmh', 'openjdk/jmh', 'GPL-2.0', ['java']),
  t('benchmarkdotnet', 'BenchmarkDotNet', 'https://benchmarkdotnet.org', 'dotnet/BenchmarkDotNet', 'MIT', ['dotnet']),
  t('go-bench', 'go test -bench', 'https://pkg.go.dev/testing#hdr-Benchmarks', 'golang/go', 'BSD-3-Clause', ['go']),
  t('criterion', 'Criterion.rs', 'https://bheisler.github.io/criterion.rs/book/', 'bheisler/criterion.rs', 'Apache-2.0', ['rust']),
  t('google-benchmark', 'Google Benchmark', 'https://github.com/google/benchmark', 'google/benchmark', 'Apache-2.0', ['cpp']),
  t('hyperfine', 'hyperfine', 'https://github.com/sharkdp/hyperfine', 'sharkdp/hyperfine', 'Apache-2.0', ['any']),
  t('k6', 'Grafana k6', 'https://k6.io', 'grafana/k6', 'AGPL-3.0', ['any']),
  t('locust', 'Locust', 'https://locust.io', 'locustio/locust', 'MIT', ['any', 'python']),
  t('gatling', 'Gatling', 'https://gatling.io', 'gatling/gatling', 'Apache-2.0', ['any', 'java']),
  t('vegeta', 'Vegeta', 'https://github.com/tsenart/vegeta', 'tsenart/vegeta', 'MIT', ['any', 'go']),

  // ---------- profiling ----------
  t('clinic', 'Clinic.js', 'https://clinicjs.org', 'clinicjs/node-clinic', 'MIT', ['js']),
  t('py-spy', 'py-spy', 'https://github.com/benfred/py-spy', 'benfred/py-spy', 'MIT', ['python']),
  t('async-profiler', 'async-profiler', 'https://github.com/async-profiler/async-profiler', 'async-profiler/async-profiler', 'Apache-2.0', ['java']),
  t('dotnet-trace', 'dotnet-trace', 'https://learn.microsoft.com/dotnet/core/diagnostics/dotnet-trace', 'dotnet/diagnostics', 'MIT', ['dotnet']),
  t('pprof', 'pprof', 'https://github.com/google/pprof', 'google/pprof', 'Apache-2.0', ['go', 'cpp']),
  t('samply', 'samply', 'https://github.com/mstange/samply', 'mstange/samply', 'Apache-2.0', ['rust', 'cpp']),
  t('pyroscope', 'Grafana Pyroscope', 'https://grafana.com/oss/pyroscope/', 'grafana/pyroscope', 'AGPL-3.0', ['any']),
  t('parca', 'Parca', 'https://www.parca.dev', 'parca-dev/parca', 'Apache-2.0', ['any']),

  // ---------- formal ----------
  t('tlaplus', 'TLA+ (TLC model checker)', 'https://lamport.azurewebsites.net/tla/tla.html', 'tlaplus/tlaplus', 'MIT', ['any']),
  t('dafny', 'Dafny', 'https://dafny.org', 'dafny-lang/dafny', 'MIT', ['any']),
  t('lean', 'Lean 4', 'https://lean-lang.org', 'leanprover/lean4', 'Apache-2.0', ['any']),
  t('z3', 'Z3', 'https://github.com/Z3Prover/z3', 'Z3Prover/z3', 'MIT', ['any']),
  t('p-lang', 'P', 'https://p-org.github.io/P/', 'p-org/P', 'MIT', ['any']),
  t('rocq', 'Rocq (formerly Coq)', 'https://rocq-prover.org', 'rocq-prover/rocq', 'LGPL-2.1', ['any']),
  t('crosshair', 'CrossHair', 'https://crosshair.readthedocs.io', 'pschanely/CrossHair', 'MIT', ['python']),
  t('openjml', 'OpenJML', 'https://www.openjml.org', 'OpenJML/OpenJML', 'GPL-2.0', ['java']),
  t('kani', 'Kani', 'https://model-checking.github.io/kani/', 'model-checking/kani', 'Apache-2.0', ['rust']),
  t('verus', 'Verus', 'https://verus-lang.github.io/verus/guide/', 'verus-lang/verus', 'MIT', ['rust']),
  t('prusti', 'Prusti', 'https://www.pm.inf.ethz.ch/research/prusti.html', 'prusti/prusti', 'MPL-2.0', ['rust']),
  t('cbmc', 'CBMC', 'https://www.cprover.org/cbmc/', 'diffblue/cbmc', 'BSD-4-Clause', ['cpp']),
  t('frama-c', 'Frama-C', 'https://frama-c.com', 'https://git.frama-c.com/pub/frama-c', 'LGPL-2.1', ['cpp']),
  t('klee', 'KLEE', 'https://klee-se.org', 'klee/klee', 'NCSA', ['cpp']),

  // ---------- contracts / runtime checks ----------
  t('zod', 'Zod', 'https://zod.dev', 'colinhacks/zod', 'MIT', ['js']),
  t('icontract', 'icontract', 'https://github.com/Parquery/icontract', 'Parquery/icontract', 'MIT', ['python']),
  t('deal', 'deal', 'https://deal.readthedocs.io', 'life4/deal', 'MIT', ['python']),
  t('gsl', 'Guidelines Support Library', 'https://github.com/microsoft/GSL', 'microsoft/GSL', 'MIT', ['cpp']),

  // ---------- sanitizers ----------
  t('sanitizers', 'ASan / UBSan / TSan / MSan', 'https://clang.llvm.org/docs/AddressSanitizer.html', 'google/sanitizers', 'Apache-2.0', ['cpp', 'rust']),
  t('go-race', 'Go race detector', 'https://go.dev/doc/articles/race_detector', 'golang/go', 'BSD-3-Clause', ['go']),
  t('miri', 'Miri', 'https://github.com/rust-lang/miri', 'rust-lang/miri', 'Apache-2.0', ['rust']),
  t('loom', 'loom', 'https://github.com/tokio-rs/loom', 'tokio-rs/loom', 'MIT', ['rust']),
  t('valgrind', 'Valgrind', 'https://valgrind.org', 'https://sourceware.org/git/valgrind.git', 'GPL-2.0', ['cpp']),

  // ---------- production: rollout, traffic, flags ----------
  t('argo-rollouts', 'Argo Rollouts', 'https://argoproj.github.io/rollouts/', 'argoproj/argo-rollouts', 'Apache-2.0', ['any']),
  t('flagger', 'Flagger', 'https://flagger.app', 'fluxcd/flagger', 'Apache-2.0', ['any']),
  t('envoy', 'Envoy', 'https://www.envoyproxy.io', 'envoyproxy/envoy', 'Apache-2.0', ['any']),
  t('istio', 'Istio', 'https://istio.io', 'istio/istio', 'Apache-2.0', ['any']),
  t('diffy', 'Diffy', 'https://github.com/opendiffy/diffy', 'opendiffy/diffy', 'Apache-2.0', ['any']),
  t('openfeature', 'OpenFeature', 'https://openfeature.dev', 'open-feature/spec', 'Apache-2.0', ['any']),
  t('unleash', 'Unleash', 'https://www.getunleash.io', 'Unleash/unleash', 'AGPL-3.0', ['any']),
  t('flagsmith', 'Flagsmith', 'https://www.flagsmith.com', 'Flagsmith/flagsmith', 'BSD-3-Clause', ['any']),

  // ---------- observability ----------
  t('opentelemetry', 'OpenTelemetry', 'https://opentelemetry.io', 'open-telemetry/opentelemetry-specification', 'Apache-2.0', ['any']),
  t('prometheus', 'Prometheus', 'https://prometheus.io', 'prometheus/prometheus', 'Apache-2.0', ['any']),
  t('alertmanager', 'Alertmanager', 'https://prometheus.io/docs/alerting/latest/alertmanager/', 'prometheus/alertmanager', 'Apache-2.0', ['any']),
  t('grafana', 'Grafana', 'https://grafana.com/oss/grafana/', 'grafana/grafana', 'AGPL-3.0', ['any']),
  t('jaeger', 'Jaeger', 'https://www.jaegertracing.io', 'jaegertracing/jaeger', 'Apache-2.0', ['any']),
  t('loki', 'Grafana Loki', 'https://grafana.com/oss/loki/', 'grafana/loki', 'AGPL-3.0', ['any']),
  t('vector', 'Vector', 'https://vector.dev', 'vectordotdev/vector', 'MPL-2.0', ['any']),
  t('glitchtip', 'GlitchTip', 'https://glitchtip.com', 'https://gitlab.com/glitchtip/glitchtip-backend', 'MIT', ['any']),
  t('web-vitals', 'web-vitals', 'https://github.com/GoogleChrome/web-vitals', 'GoogleChrome/web-vitals', 'Apache-2.0', ['js']),
  t('boomerang', 'Boomerang', 'https://akamai.github.io/boomerang/', 'akamai/boomerang', 'BSD-3-Clause', ['js']),
  t('growthbook', 'GrowthBook', 'https://www.growthbook.io', 'growthbook/growthbook', 'MIT', ['any']),

  // ---------- chaos ----------
  t('chaos-mesh', 'Chaos Mesh', 'https://chaos-mesh.org', 'chaos-mesh/chaos-mesh', 'Apache-2.0', ['any']),
  t('litmus', 'LitmusChaos', 'https://litmuschaos.io', 'litmuschaos/litmus', 'Apache-2.0', ['any']),
  t('toxiproxy', 'Toxiproxy', 'https://github.com/Shopify/toxiproxy', 'Shopify/toxiproxy', 'MIT', ['any']),
  t('chaostoolkit', 'Chaos Toolkit', 'https://chaostoolkit.org', 'chaostoolkit/chaostoolkit', 'Apache-2.0', ['any']),

  // ---------- config ----------
  t('conftest', 'Conftest (OPA)', 'https://www.conftest.dev', 'open-policy-agent/conftest', 'Apache-2.0', ['any']),
  t('kubeconform', 'kubeconform', 'https://github.com/yannh/kubeconform', 'yannh/kubeconform', 'Apache-2.0', ['any']),
  t('checkov', 'Checkov', 'https://www.checkov.io', 'bridgecrewio/checkov', 'Apache-2.0', ['any']),
  t('cue', 'CUE', 'https://cuelang.org', 'cue-lang/cue', 'Apache-2.0', ['any']),

  // ---------- auditing ----------
  t('falco', 'Falco', 'https://falco.org', 'falcosecurity/falco', 'Apache-2.0', ['any']),
  t('osquery', 'osquery', 'https://osquery.io', 'osquery/osquery', 'Apache-2.0 OR GPL-2.0', ['any']),

  // ---------- review & agents ----------
  t('reviewdog', 'reviewdog', 'https://github.com/reviewdog/reviewdog', 'reviewdog/reviewdog', 'MIT', ['any']),
  t('danger', 'Danger', 'https://danger.systems/js/', 'danger/danger-js', 'MIT', ['any']),
  t('gerrit', 'Gerrit', 'https://www.gerritcodereview.com', 'https://gerrit.googlesource.com/gerrit', 'Apache-2.0', ['any']),
  t('agents-md', 'AGENTS.md (format)', 'https://agents.md', 'agentsmd/agents.md', 'MIT', ['any']),
  t('spec-kit', 'Spec Kit', 'https://github.com/github/spec-kit', 'github/spec-kit', 'MIT', ['any']),
  t('inspect-ai', 'Inspect', 'https://inspect.aisi.org.uk', 'UKGovernmentBEIS/inspect_ai', 'MIT', ['any']),
  t('promptfoo', 'promptfoo', 'https://www.promptfoo.dev', 'promptfoo/promptfoo', 'MIT', ['any']),
  t('swe-bench', 'SWE-bench harness', 'https://www.swebench.com', 'SWE-bench/SWE-bench', 'MIT', ['any']),
];

export const TOOL_BY_ID = new Map(TOOLS.map((x) => [x.id, x]));
