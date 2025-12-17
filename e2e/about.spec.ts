import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
  });

  test('should display about page hero section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Our Story', exact: true })).toBeVisible();
    await expect(page.getByText('Where loyalty, warmth, and expertise come together to help you find home.')).toBeVisible();
  });

  test('should display mission and values', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Why Copper Dog Realty?' })).toBeVisible();
    await expect(page.getByText('Copper Dog Realty was founded on a simple but powerful belief')).toBeVisible();
    
    await expect(page.getByRole('heading', { name: 'Our Values' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Integrity First' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Community Heart' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Personal Touch' })).toBeVisible();
  });

  test('should display call to action', async ({ page }) => {
    const main = page.locator('main');
    await expect(main.getByRole('heading', { name: "Let's Find Your Forever Home" })).toBeVisible();
    
    // Scope to main to avoid header/footer collisions
    await expect(main.getByRole('link', { name: 'Get in Touch' })).toBeVisible();
    await expect(main.getByRole('link', { name: 'Browse Homes' })).toBeVisible();
  });
});
