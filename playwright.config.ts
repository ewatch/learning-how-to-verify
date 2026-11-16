import { defineConfig, devices } from '@playwright/test';
// Separate worktree checks from a developer's already-running preview.
const port = Number(process.env.PLAYWRIGHT_PORT ?? 4321);
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:${port}` },
  webServer: { command: `npx astro preview --port ${port} --ignore-lock`, port, reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
