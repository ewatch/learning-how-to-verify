#!/usr/bin/env bash
# Beweist Allocate.dfy und erzeugt daraus JavaScript für den Differenzvergleich.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -x .tools/dafny/dafny ] || ./scripts/setup-verifiers.sh
.tools/dafny/dafny verify verification/dafny/Allocate.dfy
.tools/dafny/dafny translate js --no-verify --include-runtime --output verification/dafny/generated/Allocate verification/dafny/Allocate.dfy
cat >> verification/dafny/generated/Allocate.js <<'JS'

module.exports.allocateVerified = (amount, weights) => {
  const seq = _dafny.Seq.of(...weights.map((w) => new BigNumber(w)))
  return Array.from(Allocation.__default.Allocate(new BigNumber(amount), seq)).map((n) => n.toNumber())
}
JS
mv verification/dafny/generated/Allocate.js verification/dafny/generated/Allocate.cjs
