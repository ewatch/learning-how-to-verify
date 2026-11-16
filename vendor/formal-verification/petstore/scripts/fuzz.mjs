// Bündelt den Fuzz-Target nach CommonJS und startet Jazzer.js.
// Aufruf: node scripts/fuzz.mjs [Sekunden] [Target.ts] [Ausgabe.cjs]
import { spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildSync } from 'esbuild'

const [seconds = '60', target = 'fuzz/search.fuzz.ts', output = '.tmp/fuzz/search.fuzz.cjs'] = process.argv.slice(2)
const out = resolve(output)
const corpus = resolve(dirname(out), 'corpus')
mkdirSync(corpus, { recursive: true })
buildSync({ entryPoints: [target], bundle: true, platform: 'node', format: 'cjs', outfile: out })

const { status } = spawnSync(
  'npx',
  [
    'jazzer', out, corpus,
    '--sync', '--includes', out,
    '--', `-max_total_time=${seconds}`, `-dict=${resolve('fuzz/search.dict')}`, '-max_len=200', `-artifact_prefix=${dirname(out)}/`,
  ],
  { stdio: 'inherit' },
)
process.exit(status ?? 1)
