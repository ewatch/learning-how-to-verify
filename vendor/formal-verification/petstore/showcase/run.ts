// Lässt jede Praktik den Fehler finden, für den sie gedacht ist: mit dem echten
// Werkzeug, gegen eine Kopie des echten Codes mit genau einem eingebauten Bug.
// Aufruf: npm run showcase [-- pbt mutation fuzz differential dafny tla race]
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import fc from 'fast-check'
import { findCoupon, type Coupon } from '../src/domain/pricing.ts'
import { compare, type Divergence } from '../test/differential/classify.ts'
import { carts } from '../test/differential/carts.ts'
import { seedBug } from './seed.ts'

const load = <T>(root: string, file: string) => import(pathToFileURL(join(root, file)).href) as Promise<T>
const run = (command: string, args: string[]) => {
  const result = spawnSync(command, args, { encoding: 'utf8' })
  return { status: result.status, output: `${result.stdout}${result.stderr}` }
}

type Step = () => Promise<string>

const steps: Record<string, { title: string; run: Step }> = {
  pbt: {
    title: 'Property-Based Testing: Rabatt pro Position runden',
    async run() {
      const root = seedBug('pbt', {
        file: 'src/domain/allocate.ts',
        from: `const next = (scaled * cumulative) / total
    const share = next - allocated
    allocated = next
    return Number(share)`,
        to: 'return Number((scaled * BigInt(weight)) / total)',
      })
      const { allocate } = await load<typeof import('../src/domain/allocate.ts')>(root, 'src/domain/allocate.ts')
      const details = fc.check(
        fc.property(fc.array(fc.integer({ min: 1, max: 100_000 }), { minLength: 1, maxLength: 8 }), fc.nat(), (weights, n) => {
          const total = weights.reduce((a, b) => a + b)
          const amount = n % (total + 1)
          return allocate(amount, weights).reduce((a, b) => a + b, 0) === amount
        }),
      )
      if (!details.failed || !details.counterexample) throw new Error('PBT hat den Bug nicht gefunden')
      const [weights, n] = details.counterexample
      const total = weights.reduce((a, b) => a + b)
      const amount = n % (total + 1)
      const sum = allocate(amount, weights).reduce((a, b) => a + b, 0)
      return `Nach Lauf ${details.numRuns}, geschrumpft in ${details.numShrinks} Schritten: ` +
        `${amount} Cent auf Gewichte [${weights}] verteilt, angekommen sind ${sum} Cent.`
    },
  },

  mutation: {
    title: 'Mutation Testing: volle Abdeckung, schwache Prüfungen',
    async run() {
      const { status, output } = run('npx', ['stryker', 'run', 'stryker.weak.config.json'])
      if (status !== 0) throw new Error(output)
      interface Mutant { status: string; mutatorName: string; replacement?: string; location: { start: { line: number } } }
      const report = JSON.parse(readFileSync('reports/mutation-weak/mutation.json', 'utf8')) as {
        files: Record<string, { mutants: Mutant[] }>
      }
      const all = Object.entries(report.files).flatMap(([file, { mutants }]) => mutants.map((m) => ({ ...m, file })))
      const count = (s: string) => all.filter((m) => m.status === s).length
      const survivors = all.filter((m) => m.status === 'Survived')
      const killed = count('Killed') + count('Timeout')
      const examples = survivors.slice(0, 4).map((m) => `  ${m.file}:${m.location.start.line} ${m.mutatorName}: ${m.replacement}`)
      return `Alle Zeilen laufen, aber ${survivors.length} Mutanten überleben, ${count('NoCoverage')} ohne Abdeckung, ${killed} erkannt.\n${examples.join('\n')}`
    },
  },

  fuzz: {
    title: 'Fuzzing: Fehlerbehandlung beim Prozent-Dekodieren fehlt',
    async run() {
      const root = seedBug('fuzz', {
        file: 'src/domain/search.ts',
        from: `  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }`,
        to: '  return decodeURIComponent(raw)',
      })
      const dir = join(root, 'out')
      const { status, output } = run('node', ['scripts/fuzz.mjs', '60', join(root, 'fuzz/search.fuzz.ts'), join(dir, 'search.cjs')])
      const artifact = existsSync(dir) ? readdirSync(dir).find((f) => f.startsWith('crash-')) : undefined
      if (status === 0 || !artifact) throw new Error(`Der Fuzzer hat nichts gefunden:\n${output.slice(-500)}`)
      const input = readFileSync(join(dir, artifact))
      const error = /URIError: [^\n]*/.exec(output)?.[0] ?? 'Absturz'
      return `Eingabe ${JSON.stringify(input.toString('utf8'))} führt zu ${error}.`
    },
  },

  differential: {
    title: 'Differential Testing: alte Gleitkomma- gegen neue Cent-Rechnung',
    async run() {
      const tier10 = findCoupon('TIER10') as Extract<Coupon, { kind: 'percent' }>
      const euro = (cents: number) => `${(cents / 100).toFixed(2)} €`
      const lines = (['rundung', 'mindestbestellwert', 'versandschwelle'] as Divergence[]).map((kind) => {
        const details = fc.check(fc.property(carts, (cart) => compare(cart, tier10).kind !== kind), { numRuns: 20_000 })
        if (!details.failed || !details.counterexample) throw new Error(`Klasse ${kind} nicht gefunden`)
        const [cart] = details.counterexample
        const { legacyCents, newCents } = compare(cart, tier10)
        return `  ${kind}: Warenkorb [${cart.map(euro).join(', ')}], alt ${euro(legacyCents)}, neu ${euro(newCents)}`
      })
      return `Drei Unterschiede, jeder auf ein kleines Beispiel geschrumpft:\n${lines.join('\n')}`
    },
  },

  dafny: {
    title: 'Formaler Beweis: naive Verteilung gegen die Spezifikation',
    async run() {
      const proved = run('npm', ['run', '-s', 'verify:dafny'])
      if (proved.status !== 0) throw new Error(proved.output)
      const dafny = resolve('.tools/dafny/dafny')
      const { status, output } = run(dafny, ['verify', 'verification/dafny/AllocateNaive.dfy'])
      if (status === 0) throw new Error('Dafny hat die naive Fassung akzeptiert')
      const verdict = /Allocate\.dfy|finished with \d+ verified, \d+ errors?/.exec(output.split('\n').filter((l) => l.includes('finished with')).at(-1) ?? '')
      const proof = /\d+ verified, \d+ errors?/.exec(proved.output)?.[0]
      return `Allocate.dfy: ${proof}. AllocateNaive.dfy: ${verdict?.[0]}, die Nachbedingung Sum(shares) == amount ist nicht beweisbar.`
    },
  },

  tla: {
    title: 'Model Checking: Bestellprotokoll ohne Serverprüfung und ohne Rollback',
    async run() {
      const lines = ['Safe', 'CheckThenBuy', 'NoRollback'].map((config) => {
        const { output } = run('./scripts/verify-tla.sh', [config])
        const states = /(\d+) distinct states found/.exec(output)?.[1]
        const violated = /Invariant (\w+) is violated/.exec(output)?.[1]
        const length = [...output.matchAll(/^State (\d+):/gm)].at(-1)?.[1]
        if (config === 'Safe') {
          if (!output.includes('No error has been found')) throw new Error(output)
          return `  ${config}: kein Fehler in allen ${states} erreichbaren Zuständen`
        }
        if (!violated) throw new Error(`${config}: TLC hat nichts gefunden`)
        return `  ${config}: ${violated} verletzt, Gegenbeispiel mit ${length} Schritten`
      })
      return lines.join('\n')
    },
  },

  race: {
    title: 'Vom Modell zum Code: dieselben Fehler im echten Ablauf',
    async run() {
      const bugs = {
        'ohne Serverprüfung': seedBug('race-server', {
          file: 'server/store.ts',
          from: "if (target.status !== 'available') return { kind: 'conflict' }",
          to: '',
        }),
        'ohne Rollback': seedBug('race-rollback', {
          file: 'src/domain/checkout.ts',
          from: 'await compensate(api, orders)',
          to: '{ rolledBack: [] as number[], stuckOrders: [] as number[] }',
        }),
      }
      const lines = await Promise.all(
        Object.entries(bugs).map(async ([label, root]) => {
          const { raceProperty } = await load<typeof import('../test/race.ts')>(root, 'test/race.ts')
          const details = await fc.check(raceProperty, { numRuns: 300 })
          if (!details.failed) throw new Error(`${label}: nichts gefunden`)
          return `  ${label}: ${(details.errorInstance as Error).message} (Lauf ${details.numRuns})`
        }),
      )
      return lines.join('\n')
    },
  },
}

const selected = process.argv.slice(2).filter((arg) => arg !== '--')
let failed = false
for (const [id, step] of Object.entries(steps)) {
  if (selected.length > 0 && !selected.includes(id)) continue
  console.log(`\n=== ${step.title}`)
  try {
    console.log(await step.run())
  } catch (error) {
    failed = true
    console.log(`FEHLGESCHLAGEN: ${error instanceof Error ? error.message : String(error)}`)
  }
}
process.exit(failed ? 1 : 0)
