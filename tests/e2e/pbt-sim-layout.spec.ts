import { test, expect, type Page } from '@playwright/test';

// The property-based-test simulator animates two logs. Showing or hiding the verdict must not move them.

const logTops = (page: Page) => page.evaluate(() =>
  [...document.querySelectorAll('#try .sim-log')].map((l) => Math.round(l.getBoundingClientRect().top + scrollY)));

test('the logs stay in place through a run and a rerun', async ({ page }) => {
  await page.goto('/en/practices/property-based-tests/');
  const sim = page.locator('#try .sim').first();
  await sim.scrollIntoViewIfNeeded();
  const run = sim.getByRole('button', { name: /Generate/ });
  const verdict = sim.locator('.sim-result:not([hidden])');

  await run.click();
  await expect(verdict).toBeVisible({ timeout: 10000 });
  const settled = await logTops(page);
  // the verdict follows the logs
  const panelTop = await verdict.evaluate((el) => el.getBoundingClientRect().top + scrollY);
  expect(panelTop).toBeGreaterThan(Math.max(...settled));

  // a rerun hides the verdict and refills the logs: they must not move while it runs
  await run.click();
  await expect(verdict).toBeHidden();
  expect(await logTops(page)).toEqual(settled);
  await expect(verdict).toBeVisible({ timeout: 10000 });
  expect(await logTops(page)).toEqual(settled);
});
