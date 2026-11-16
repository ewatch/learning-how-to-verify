import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

export interface Bug {
  file: string
  from: string
  to: string
}

/**
 * Kopiert den echten Code und baut per Textersetzung einen Bug ein. Passt die
 * Stelle nicht mehr, bricht das Showcase ab, statt still nichts zu zeigen.
 */
export function seedBug(name: string, bug: Bug): string {
  const root = resolve('.tmp/seeded', name)
  rmSync(root, { recursive: true, force: true })
  mkdirSync(root, { recursive: true })
  for (const path of ['src', 'server', 'fuzz', 'test/helpers.ts', 'test/race.ts']) cpSync(path, join(root, path), { recursive: true })

  const target = join(root, bug.file)
  const source = readFileSync(target, 'utf8')
  if (!source.includes(bug.from)) throw new Error(`Bug "${name}" passt nicht mehr auf ${bug.file}`)
  writeFileSync(target, source.replace(bug.from, bug.to))
  return root
}
