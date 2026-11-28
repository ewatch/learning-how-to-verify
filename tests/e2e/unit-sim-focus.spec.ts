import { test, expect, type Page } from '@playwright/test';

// The unit-test simulator re-evaluates on every committed value. Keyboard users must stay where they are.

async function open(page: Page) {
  await page.goto('/en/practices/unit-tests/');
  await page.locator('#try').scrollIntoViewIfNeeded();
  const rows = page.locator('#try .sim-table tbody tr');
  await expect(rows).toHaveCount(2, { timeout: 10000 });
  return rows;
}

test('focus moves to the next field after editing a value', async ({ page }) => {
  const rows = await open(page);
  const counter = page.locator('#try .sim-card-title b');
  const age = rows.nth(0).getByRole('spinbutton', { name: 'Age (years)' });
  const expected = rows.nth(0).getByRole('spinbutton', { name: 'Expected (cents)' });

  await age.fill('0');
  await age.press('Tab');
  await expect(expected).toBeFocused();
  // the value was committed and re-evaluated: a dog of age 0 costs 14000, so 12000 is now wrong
  await expect(age).toHaveValue('0');
  await expect(rows.nth(0)).toHaveClass(/cur/);

  await expected.fill('14000');
  await expected.press('Tab');
  await expect(rows.nth(0).getByRole('checkbox')).toBeFocused();
  await expect(rows.nth(0)).not.toHaveClass(/cur/);
  await expect(counter).toContainText('of 5 bugs caught');
});

test('focus stays on a select after changing it', async ({ page }) => {
  const rows = await open(page);
  const species = rows.nth(1).getByRole('combobox', { name: 'Species' });
  await species.focus();
  await species.selectOption('cat');
  await expect(species).toBeFocused();
  await expect(species).toHaveValue('cat');
});

test('removing an example moves focus to the next remove button, then to Add example', async ({ page }) => {
  const rows = await open(page);
  await rows.nth(0).getByRole('button', { name: 'Remove 1' }).press('Enter');
  await expect(rows).toHaveCount(1);
  // the row that moved up is now example 1
  const next = rows.nth(0).getByRole('button', { name: 'Remove 1' });
  await expect(next).toBeFocused();
  await expect(rows.nth(0).getByRole('spinbutton', { name: 'Age (years)' })).toHaveValue('10');

  await next.press('Enter');
  await expect(rows).toHaveCount(0);
  await expect(page.getByRole('button', { name: '+ Add example' })).toBeFocused();
});
