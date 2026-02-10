import { test, expect } from '@playwright/test';

test.describe('Resources Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resources');
  });

  test('should display resources page hero section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Utility Providers by City', exact: true })).toBeVisible();
    await expect(page.getByText('Local utility contact information for cities served by Copper Dog Realty')).toBeVisible();
  });

  test('should display Download All Cities button', async ({ page }) => {
    const downloadAllLink = page.getByRole('link', { name: 'Download All Cities' });
    await expect(downloadAllLink).toBeVisible();
    await expect(downloadAllLink).toHaveAttribute('href', '/resources/utilities-all-cities.pdf');
  });

  test('should display city sections with download buttons', async ({ page }) => {
    await expect(page.getByText('Arnolds Park', { exact: true })).toBeVisible();
    const downloadButtons = page.getByRole('link', { name: 'Download' });
    await expect(downloadButtons.first()).toBeVisible();
    expect(await downloadButtons.count()).toBeGreaterThan(1);
  });

  test('should have Download link for Arnolds Park pointing to correct PDF', async ({ page }) => {
    const arnoldsPdfLink = page.locator('a[href="/resources/utilities-arnolds-park.pdf"]');
    await expect(arnoldsPdfLink).toBeVisible();
  });

  test('should display call to action', async ({ page }) => {
    const main = page.locator('main');
    await expect(main.getByRole('heading', { name: 'Need Help Finding the Right Home?' })).toBeVisible();
    await expect(main.getByRole('link', { name: 'Get in Touch' })).toBeVisible();
  });
});
