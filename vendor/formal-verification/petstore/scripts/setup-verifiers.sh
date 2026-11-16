#!/usr/bin/env bash
# Installiert Dafny, eine JRE und TLC projektlokal nach .tools/ (nichts Systemweites).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .tools

DAFNY_VERSION=4.11.0
TLA_VERSION=1.7.4
JRE_URL="https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.13%2B9/OpenJDK21U-jre_x64_linux_hotspot_21.0.13_9.tar.gz"
JRE_SHA256=a535a1df9c6284d9618872984e026ae0352d1f7e9e0605425c0e6114f47351dd

if [ ! -x .tools/dafny/dafny ]; then
  curl -fsSL -o .tools/dafny.zip \
    "https://github.com/dafny-lang/dafny/releases/download/v${DAFNY_VERSION}/dafny-${DAFNY_VERSION}-x64-ubuntu-22.04.zip"
  python3 -m zipfile -e .tools/dafny.zip .tools/
  chmod +x .tools/dafny/dafny .tools/dafny/z3/bin/* 2>/dev/null || true
  rm .tools/dafny.zip
fi

if [ ! -x .tools/jre/bin/java ]; then
  curl -fsSL -o .tools/jre.tar.gz "$JRE_URL"
  echo "$JRE_SHA256  .tools/jre.tar.gz" | sha256sum -c -
  mkdir -p .tools/jre
  tar -xzf .tools/jre.tar.gz -C .tools/jre --strip-components=1
  rm .tools/jre.tar.gz
fi

if [ ! -f .tools/tla2tools.jar ]; then
  curl -fsSL -o .tools/tla2tools.jar \
    "https://github.com/tlaplus/tlaplus/releases/download/v${TLA_VERSION}/tla2tools.jar"
fi

.tools/dafny/dafny --version
.tools/jre/bin/java -version 2>&1 | head -1
