#!/usr/bin/env bash
# Re-runs the TLA+ and Dafny examples of the guides and fails if the output differs
# from what the site shows. Needs: java (11+), TLA2TOOLS (path to tla2tools.jar), dafny.
set -euo pipefail
cd "$(dirname "$0")/.."; root="$PWD"
jar="${TLA2TOOLS:-tla2tools.jar}"
work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT
fail=0
check() { # name, expected file, command...
  local name="$1" expected="$2"; shift 2
  "$@" > "$work/$name.raw" 2>&1 || true
  node "$root/scripts/normalize-output.mjs" < "$work/$name.raw" > "$work/$name.out"
  if diff -u "$expected" "$work/$name.out"; then echo "ok    $name"; else echo "DIFF  $name"; fail=1; fi
}
cp guides-src/tla/*.tla guides-src/tla/*.cfg "$work/"
for m in Adopt AdoptFixed; do
  (cd "$work" && check "$m" "$root/guides-src/tla/$m.out" java -XX:+UseParallelGC -cp "$jar" tlc2.TLC -nowarning -workers 1 -metadir "$work/states-$m" -config "$m.cfg" "$m.tla")
done
cp guides-src/dafny/*.dfy "$work/"
sed 's/if ageYears >= 8 {/if ageYears > 8 {/' guides-src/dafny/Fee.dfy > "$work/FeeBroken.dfy"
grep -v 'invariant total == Sum(fees\[..i\])' guides-src/dafny/Total.dfy > "$work/TotalNoInvariant.dfy"
for f in Fee FeeBroken Total TotalNoInvariant; do
  (cd "$work" && check "$f" "$root/guides-src/dafny/$f.out" dafny verify "$f.dfy")
done
exit $fail
