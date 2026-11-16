// Absichtlich fehlerhaft: lässt Kommazahlen wie 4.5 als Sterne durch.
export const LIMITS = { title: 100, author: 50, description: 2000 }

export function validateReview(input) {
  if (typeof input !== 'object' || input === null) return { ok: false, errors: ['Ungültige Daten'] }
  const errors = []
  const text = (key) => {
    const value = typeof input[key] === 'string' ? input[key].trim() : ''
    if (value.length === 0) errors.push(`${key} fehlt`)
    else if (value.length > LIMITS[key]) errors.push(`${key} ist zu lang`)
    return value
  }
  const stars = input.stars
  if (typeof stars !== 'number' || stars < 1 || stars > 5) errors.push('Sterne müssen 1 bis 5 sein')
  const review = { stars, title: text('title'), author: text('author'), description: text('description') }
  return errors.length ? { ok: false, errors } : { ok: true, review }
}

export function averageStars(reviews) {
  if (reviews.length === 0) return 0
  return Math.round((reviews.reduce((s, r) => s + r.stars, 0) / reviews.length) * 10) / 10
}

export function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}
