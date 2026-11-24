/**
 * Marks a section that was edited during the bloat-reduction pass so `astro dev`
 * renders a visible review border and label around it. In production builds
 * (`astro build` / `astro preview`), `import.meta.env.DEV` is false and nothing is emitted.
 */
export const devMark = (label: string): Record<string, string> =>
  import.meta.env.DEV ? { 'data-dev-changed': label } : {};
