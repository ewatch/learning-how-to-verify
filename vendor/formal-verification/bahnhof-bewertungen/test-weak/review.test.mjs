import { test } from 'node:test'
import assert from 'node:assert/strict'
import { averageStars, escapeHtml, validateReview } from '../src/review.mjs'

// Absichtlich schwach: führt jede Zeile aus, prüft aber kaum Grenzen.
test('eine Bewertung mit 3 Sternen geht durch', () => {
  assert.equal(validateReview({ stars: 3, title: 'Ok', author: 'Anna', description: 'Geht so' }).ok, true)
  assert.equal(validateReview({ stars: 9, title: '', author: 'Anna', description: 'x'.repeat(3000) }).ok, false)
  assert.equal(validateReview(null).ok, false)
})

test('Durchschnitt und Escaping liefern etwas', () => {
  assert.equal(averageStars([]), 0)
  assert.ok(averageStars([{ stars: 3 }]) > 0)
  assert.ok(escapeHtml('<a>').length > 0)
})
