import { test } from 'node:test'
import assert from 'node:assert/strict'
import { averageStars, escapeHtml, validateReview } from '../src/review.mjs'

const base = { title: 'Sauber', author: 'Anna', description: 'Gute Anzeigen' }
const ok = (input) => validateReview(input).ok

test('Sterne: genau 1 bis 5, nur ganze Zahlen', () => {
  assert.equal(ok({ ...base, stars: 1 }), true)
  assert.equal(ok({ ...base, stars: 5 }), true)
  assert.equal(ok({ ...base, stars: 0 }), false)
  assert.equal(ok({ ...base, stars: 6 }), false)
  assert.equal(ok({ ...base, stars: 4.5 }), false)
  assert.equal(ok({ ...base, stars: '5' }), false)
})

test('Längen: genau an der Grenze erlaubt, eins darüber nicht', () => {
  assert.equal(ok({ ...base, stars: 3, title: 'x'.repeat(100) }), true)
  assert.equal(ok({ ...base, stars: 3, title: 'x'.repeat(101) }), false)
})

test('Leerzeichen werden entfernt, reine Leerzeichen fehlen', () => {
  const result = validateReview({ ...base, stars: 3, title: '  Zug  ' })
  assert.equal(result.review.title, 'Zug')
  assert.equal(ok({ ...base, stars: 3, author: '   ' }), false)
})

test('kein Objekt wird abgelehnt', () => {
  assert.deepEqual(validateReview(null), { ok: false, errors: ['Ungültige Daten'] })
})

test('Durchschnitt mit einer Nachkommastelle, 0 ohne Bewertungen', () => {
  assert.equal(averageStars([]), 0)
  assert.equal(averageStars([{ stars: 4 }, { stars: 5 }, { stars: 5 }]), 4.7)
})

test('escapeHtml entschärft HTML', () => {
  assert.equal(escapeHtml(`<b a="1">'&'</b>`), '&lt;b a=&quot;1&quot;&gt;&#39;&amp;&#39;&lt;/b&gt;')
})
