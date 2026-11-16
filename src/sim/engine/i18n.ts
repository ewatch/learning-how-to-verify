/** A bilingual value. Engines return these (or codes) instead of hard-coded one-language strings. */
export interface Bi<T = string> { en: T; de: T }
