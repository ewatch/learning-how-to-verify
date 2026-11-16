#!/usr/bin/env bash
# Prüft das Bestellprotokoll. Aufruf: verify-tla.sh [Safe|CheckThenBuy|NoRollback]
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .tools/tla2tools.jar ] || ./scripts/setup-verifiers.sh
java="$PWD/.tools/jre/bin/java"
jar="$PWD/.tools/tla2tools.jar"
config="${1:-Safe}"
cd verification/tla
exec "$java" -XX:+UseParallelGC -cp "$jar" tlc2.TLC -workers auto \
  -metadir states -config "$config.cfg" Reservation.tla
