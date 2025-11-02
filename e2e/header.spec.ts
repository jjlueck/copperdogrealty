import { test, expect } from '@playwright/test';

test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display desktop navigation on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.getByRole('link', { name: 'Available Homes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Our Team' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get in Touch' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menu' })).not.toBeVisible();
  });

  test('should display mobile menu button on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 }); // iPhone SE viewport
    await expect(page.getByRole('link', { name: 'Available Homes' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
  });

  test('should open and close mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByRole('link', { name: 'Available Homes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Our Team' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get in Touch' })).toBeVisible();

    // Close menu by clicking outside or escape key
    await page.keyboard.press('Escape');
    await expect(page.getByRole('link', { name: 'Available Homes' })).not.toBeVisible();
  });

  test('should have correct image sizes in header on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const iconImage = page.locator('header img[alt="Copper Dog Realty"]').first();
    const wordMarkImage = page.locator('header img[alt="Copper Dog Realty"]').nth(1);

    // These are approximate values based on the h-6 and h-3 Tailwind classes
    // Playwright might return computed styles, so we'll check for reasonable values
    const iconBoundingBox = await iconImage.boundingBox();
    const wordMarkBoundingBox = await wordMarkImage.boundingBox();

    expect(iconBoundingBox?.height).toBeLessThanOrEqual(24); // h-6 is 24px
    expect(wordMarkBoundingBox?.height).toBeLessThanOrEqual(16); // h-3 is 12px, allowing some buffer
  });
});
