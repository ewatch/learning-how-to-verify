import { defineConfig } from 'vitest/config'

// Ohne UI- und Vergleichstests: Die Fachlogik ist hier abgedeckt, und jeder Mutant
// würde sonst das Rendering und den Dafny-Vergleich mitbezahlen.
export default defineConfig({
  test: { include: ['test/**/*.test.ts'], exclude: ['test/weak/**', 'test/differential/**'] },
})
