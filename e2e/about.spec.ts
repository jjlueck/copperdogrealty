import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
  });

  test('should display about page hero section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Our Story: A Foundation of Trust & Tail Wags' })).toBeVisible();
    await expect(page.getByText('At Copper Dog Realty, our journey began with a simple belief: finding your home should be a joyful and trustworthy experience.')).toBeVisible();
  });

  test('should display mission and values', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Our Mission' })).toBeVisible();
    await expect(page.getByText('To connect families with their perfect homes in the Iowa Great Lakes region, guided by integrity, warmth, and personalized service.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Our Values' })).toBeVisible();
    await expect(page.getByText('Integrity, Community, Personalization, Passion')).toBeVisible();
  });

  test('should display team introduction', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Meet Our Pack' })).toBeVisible();
    await expect(page.getByText('Serving the beautiful Iowa Great Lakes region with a deep commitment to our')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Meet the Team' })).toBeVisible();
  });
});
