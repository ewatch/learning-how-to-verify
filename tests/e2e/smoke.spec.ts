import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const errorsOf = (page: Page) => { const errs: string[] = []; page.on('pageerror', (e) => errs.push(e.message)); return errs; };
const noHorizontalScroll = async (page: Page) => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

for (const lang of ['en', 'de'] as const) {
  test.describe(lang, () => {
    test('home shows the funnel and switching a layer shows its practices', async ({ page }) => {
      const errs = errorsOf(page);
      await page.goto(`/${lang}/`);
      await expect(page.locator('h1')).toBeVisible();
      await page.locator('[data-band="verification"]').click();
      await expect(page.locator('#layer-verification')).toBeVisible();
      await expect(page.locator('#layer-static')).toBeHidden();
      await noHorizontalScroll(page);
      expect(errs).toEqual([]);
    });

    test('glossary terms on a practice page link to the glossary', async ({ page }) => {
      await page.goto(`/${lang}/practices/mutation-tests/`);
      await expect(page.locator('a.gloss[data-gloss="mutant"]').first()).toHaveAttribute('href', `/${lang}/glossary/#mutant`);
    });

    test('language switch keeps the page', async ({ page }) => {
      await page.goto(`/${lang}/practices/mutation-tests/`);
      await page.locator('[data-lang-switch]').click();
      const other = lang === 'en' ? 'de' : 'en';
      await expect(page).toHaveURL(new RegExp(`/${other}/practices/mutation-tests/`));
    });

    test('mutation simulator runs and reports survivors for weak tests', async ({ page }) => {
      const errs = errorsOf(page);
      await page.goto(`/${lang}/practices/mutation-tests/`);
      await page.locator('#try').scrollIntoViewIfNeeded();
      await page.locator('#try .sim button.btn:not(.ghost)').first().click();
      await expect(page.locator('#try .sim-callout.bad')).toBeVisible({ timeout: 15000 });
      expect(errs).toEqual([]);
    });

    test('model checker finds the double booking', async ({ page }) => {
      await page.goto(`/${lang}/practices/formal-verification/`);
      await page.locator('#try').scrollIntoViewIfNeeded();
      await page.locator('#try .sim button.btn').first().click();
      await expect(page.locator('#try .sim-callout.bad')).toBeVisible({ timeout: 10000 });
    });

    test('language tabs switch tools and the agent prompt can be copied', async ({ page, context, browserName }) => {
      await page.goto(`/${lang}/practices/property-based-tests/`);
      await page.locator('[role="tab"][data-lang="python"]').click();
      await expect(page.locator('#panel-python')).toBeVisible();
      await expect(page.locator('#panel-python')).toContainText('Hypothesis');
      await expect(page.locator('#panel-js')).toBeHidden();
      if (browserName === 'chromium') {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.locator('#panel-python [data-copy^="prompt-"]').click();
        const text = await page.evaluate(() => navigator.clipboard.readText());
        expect(text).toContain('Hypothesis');
      }
    });

    test('key pages have no detectable accessibility violations', async ({ page }) => {
      for (const path of ['', 'practices/unit-tests/', 'lifecycle/', 'guides/tla/']) {
        await page.goto(`/${lang}/${path}`);
        const { violations } = await new AxeBuilder({ page }).disableRules(['region']).analyze();
        expect(violations.map((v) => `${v.id}: ${v.nodes.length}`), path).toEqual([]);
      }
    });
  });
}

test('llms.txt and Markdown twins are served', async ({ request }) => {
  const llms = await request.get('/llms.txt');
  expect(llms.ok()).toBe(true);
  expect(await llms.text()).toContain('/en/practices/unit-tests/index.md');
  const md = await request.get('/de/practices/unit-tests/index.md');
  expect(await md.text()).toContain('# Unit-Tests');
});

test('code walkthrough opens, advances and closes with Escape', async ({ page }) => {
  await page.goto('/en/practices/unit-tests/');
  const block = page.locator('[data-fc]:visible').first();
  await expect(block).toBeVisible();
  await block.locator('[data-fc-start]').click();
  await expect(block.locator('[data-fc-count]')).toHaveText('1 / ' + (await block.getAttribute('data-total')));
  await block.locator('[data-fc-next]').click();
  await expect(block.locator('[data-fc-count]')).toContainText('2 /');
  await page.keyboard.press('Escape');
  await expect(block.locator('[data-fc-guide]')).toBeHidden();
});

test('evidence findings stay hidden until the sources disclosure is opened', async ({ page }) => {
  await page.goto('/en/practices/mutation-tests/');
  const details = page.locator('.evidence details');
  const finding = details.locator('li').first();
  await expect(finding).toBeHidden();
  await details.locator('summary').click();
  await expect(finding).toBeVisible();
});

test('clicking a code badge opens its note popover, Escape closes it', async ({ page }) => {
  await page.goto('/en/practices/load-tests/');
  const btn = page.locator('[data-fc]:visible .badge-btn').first();
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  const pop = page.locator(`#${await btn.getAttribute('aria-controls')}`);
  await expect(pop).toBeVisible();
  expect((await pop.textContent())!.length).toBeGreaterThan(10);
  await page.keyboard.press('Escape');
  await expect(pop).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
