import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const lang of ['en', 'de'] as const) {
  test(`${lang}: search dialog finds CODEOWNERS, navigates and has no accessibility violations`, async ({ page }) => {
    const errs: string[] = [];
    page.on('pageerror', (e) => errs.push(e.message));

    await page.goto(`/${lang}/`);
    await page.locator('#search-open').click();
    const dialog = page.locator('#site-search');
    await expect(dialog).toBeVisible();

    const input = dialog.locator('[data-search-input]');
    await input.fill('CODEOWNERS');
    const results = dialog.locator('[data-search-results] a');
    await expect(results.first()).toBeVisible();
    await expect(dialog.locator('[data-search-results]')).toContainText(lang === 'en' ? 'Test integrity' : 'Testintegrität');

    const { violations } = await new AxeBuilder({ page }).disableRules(['region']).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);

    // Navigate to Test integrity via search result
    await dialog.locator(`[data-search-results] a[href$="/${lang}/practices/test-integrity/"]`).click();
    await expect(page).toHaveURL(new RegExp(`/${lang}/practices/test-integrity/`));
    await page.waitForLoadState('load');
    await expect(page.locator('.codeblock .enforcer').first()).toContainText('GitHub');

    // Keyboard shortcut "/" opens search and Escape closes it
    await page.keyboard.press('/');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    expect(errs).toEqual([]);
  });
}
