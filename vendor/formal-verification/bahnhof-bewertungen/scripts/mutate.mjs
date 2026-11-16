// Mutation Testing ohne Bibliothek. Aufruf: node scripts/mutate.mjs [Testordner]
//   node scripts/mutate.mjs            -> starke Tests aus test/
//   node scripts/mutate.mjs test-weak  -> absichtlich schwache Tests
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const testDir = process.argv[2] ?? 'test'
const file = 'src/review.mjs'
const source = readFileSync(file, 'utf8')
const mutants = [
  ['stars < 1', 'stars < 0'],
  ['stars < 1', 'stars <= 1'],
  ['stars > 5', 'stars >= 5'],
  ['stars > 5', 'stars > 6'],
  ['!Number.isInteger(stars) || ', ''],
  ['value.length > LIMITS[key]', 'value.length >= LIMITS[key]'],
  ['value.length === 0', 'false'],
  ['.trim()', ''],
  ['* 10) / 10', ') '],
  ["'<': '&lt;'", "'<': '<'"],
  ['reviews.length === 0', 'false'],
]

// Führt die Tests gegen eine Kopie aus, in der `from` durch `to` ersetzt ist.
function runTests(from, to) {
  const dir = mkdtempSync(join(tmpdir(), 'mutant-'))
  cpSync('src', join(dir, 'src'), { recursive: true })
  cpSync(testDir, join(dir, 'test'), { recursive: true })
  writeFileSync(join(dir, file), source.replace(from, to))
  const { status } = spawnSync(process.execPath, ['--test', 'test/*.test.mjs'], { cwd: dir, env: { ...process.env, SEED: '1' } })
  rmSync(dir, { recursive: true, force: true })
  return status
}

// Ohne grünen Ausgangslauf wäre jeder Mutant scheinbar "erkannt".
if (runTests('', '') !== 0) {
  console.error(`Die Tests aus ${testDir} schlagen schon ohne Mutation fehl.`)
  process.exit(2)
}

let survived = 0
for (const [from, to] of mutants) {
  if (!source.includes(from)) throw new Error(`Stelle nicht gefunden: ${from}`)
  const status = runTests(from, to)
  if (status === 0) survived++
  console.log(`${status === 0 ? 'ÜBERLEBT' : 'erkannt '}  ${from}  →  ${to.trim() || '(entfernt)'}`)
}
console.log(`\nTests aus ${testDir}: ${mutants.length - survived} von ${mutants.length} Mutanten erkannt`)
process.exit(survived > 0 ? 1 : 0)
