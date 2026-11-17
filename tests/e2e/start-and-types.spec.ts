import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const lang of ['en', 'de'] as const) {
  test(`${lang}: choose a first check and copy a project-specific agent task`, async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(`/${lang}/diagnose/`);
    const choices = page.locator('[data-start-choice]');
    await expect(choices).toHaveCount(6);
    for (const id of ['baseline', 'compiler', 'behaviour', 'green', 'boundaries', 'production']) {
      await page.locator(`[data-start-choice="${id}"]`).click();
      await expect(page.locator('[data-start-result]:visible')).toHaveCount(1);
      const panel = page.locator(`#start-${id}`);
      await expect(panel).toBeVisible();
      await panel.locator('[data-copy]').click();
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toBe(await panel.locator('pre').textContent());
      expect(copied).toContain(lang === 'en' ? 'exit codes' : 'Exit-Codes');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    const md = await page.request.get(`/${lang}/diagnose/index.md`);
    expect(md.ok()).toBe(true);
    expect(await md.text()).toContain(lang === 'en' ? 'Where should I start?' : 'Wo sollte ich anfangen?');
  });

  test(`${lang}: compiler feedback distinguishes a fix, a suppression and a logic bug`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/${lang}/practices/type-systems/#try`);
    const sim = page.locator('[data-sim="typecheck"]');
    const output = sim.locator('[data-typecheck-output]');
    const run = sim.locator('button.btn');
    await run.click();
    await expect(output).toContainText('TS18048');
    await expect(output).not.toContainText('PASS');
    await sim.locator('input[value=\"guard\"] + label').click();
    await run.click();
    await expect(output.locator('li.ok')).toHaveCount(3);
    await sim.locator('input[value=\"assertion\"] + label').click();
    await run.click();
    await expect(output.locator('li.bad')).toHaveCount(1);
    await expect(output).toContainText('TypeError');
    await sim.locator('input[value=\"overwrite\"] + label').click();
    await run.click();
    await expect(output.locator('li.bad')).toContainText('reservedBy=ben');
    await sim.locator('input[value=\"unchecked\"] + label').click();
    await sim.locator('input[type="checkbox"]').uncheck();
    await run.click();
    await expect(output.locator('li.bad')).toHaveCount(1);
    // Changing a revision while checking cancels the old output and permits reruns.
    await run.click();
    await sim.locator('input[value=\"guard\"] + label').click();
    await expect(run).toBeEnabled();
    await run.click();
    await expect(output.locator('li.ok')).toHaveCount(3);
    await expect(page.locator('#panel-js')).toContainText('reserve.ts');
    await expect(page.locator('#panel-js')).toContainText('tsconfig.json');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect(errors).toEqual([]);
  });

  test(`${lang}: starting points and compiler exercise are accessible`, async ({ page }) => {
    for (const path of ['start/', 'practices/type-systems/#try']) {
      await page.goto(`/${lang}/${path}`);
      if (path.includes('#try')) await expect(page.locator('[data-sim="typecheck"] .sim')).toBeVisible();
      const { violations } = await new AxeBuilder({ page }).disableRules(['region']).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    }
  });
}
