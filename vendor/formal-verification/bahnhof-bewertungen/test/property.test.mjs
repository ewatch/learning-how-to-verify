import { test } from 'node:test'
import assert from 'node:assert/strict'
import { averageStars, escapeHtml, validateReview } from '../src/review.mjs'

// Fester Startwert über SEED, damit ein Fund wiederholbar ist.
const seed = Number(process.env.SEED ?? Date.now() % 2 ** 31)
let state = seed
const rand = () => (state = (state * 1103515245 + 12345) % 2 ** 31) / 2 ** 31
const int = (min, max) => min + Math.floor(rand() * (max - min + 1))
const str = (max) => Array.from({ length: int(0, max) }, () => String.fromCharCode(int(0, 0x2fff))).join('')
const reviews = () => Array.from({ length: int(1, 20) }, () => ({ stars: int(1, 5) }))

function property(name, generate, check, runs = 500) {
  test(name, () => {
    for (let i = 0; i < runs; i++) {
      const input = generate()
      assert.ok(check(input), `Gegenbeispiel (SEED=${seed}): ${JSON.stringify(input)}`)
    }
  })
}

property('Durchschnitt liegt zwischen 1 und 5', reviews, (rs) => averageStars(rs) >= 1 && averageStars(rs) <= 5)
property('eine 5 senkt den Durchschnitt nie', reviews, (rs) => averageStars([...rs, { stars: 5 }]) >= averageStars(rs))
property('escapter Text enthält keine spitzen Klammern', () => str(50), (s) => !/[<>]/.test(escapeHtml(s)))
property(
  'jede gültige Bewertung wird angenommen',
  () => ({ stars: int(1, 5), title: 'T' + str(98), author: 'A' + str(48), description: 'D' + str(500) }),
  (input) => validateReview(input).ok,
)
property(
  'Sterne außerhalb von 1 bis 5 werden immer abgelehnt',
  () => ({ stars: rand() < 0.5 ? int(-100, 0) : int(6, 100), title: 'T', author: 'A', description: 'D' }),
  (input) => !validateReview(input).ok,
)
