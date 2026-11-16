import { test, expect } from '@playwright/test';

const PAGES = ['tdd', 'regression-tests', 'snapshot-tests', 'contract-tests', 'contracts', 'lint', 'test-integrity', 'security-scanning'];

for (const lang of ['en', 'de'] as const) {
  for (const id of PAGES) {
    test(`${lang}: exercise on ${id} mounts without errors`, async ({ page }) => {
      const errs: string[] = [];
      page.on('pageerror', (e) => errs.push(e.message));
      await page.goto(`/${lang}/practices/${id}/`);
      await page.locator('#try').scrollIntoViewIfNeeded();
      await expect(page.locator('#try .sim').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#try')).not.toContainText(/Exercise coming soon|Übung folgt/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      expect(errs).toEqual([]);
    });
  }
}
