import { test, expect } from '@playwright/test';

test.describe('Properties Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/properties');
  });

  test('should display properties page hero section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Homes Waiting for Their Forever Families' })).toBeVisible();
    await expect(page.getByText('Each of these wonderful properties is ready to welcome the right family.')).toBeVisible();
  });

  test('should display at least one property card', async ({ page }) => {
    await expect(page.locator('.grid > div.overflow-hidden').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sunny Lakefront Retreat' })).toBeVisible();
    await expect(page.getByText('$425,000')).toBeVisible();
  });

  test('should have a working "Contact Our Team" link', async ({ page }) => {
    await page.getByRole('link', { name: 'Contact Our Team' }).click();
    await expect(page).toHaveURL(/.*\/team/);
  });
});
