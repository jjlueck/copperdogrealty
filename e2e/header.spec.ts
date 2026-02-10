import { test, expect } from '@playwright/test';

test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display desktop navigation on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Scope locators to the header element
    const header = page.locator('header');
    
    await expect(header.getByRole('link', { name: 'Available Homes' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Our Team' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Resources' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Get in Touch' })).toBeVisible();
    
    // Menu button (mobile trigger) should not be visible
    await expect(header.getByRole('button', { name: 'Menu' })).not.toBeVisible();
  });

  test('should display mobile menu button on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 }); // iPhone SE viewport
    
    const header = page.locator('header');

    // Desktop nav links should not be visible in the header bar itself
    await expect(header.getByRole('link', { name: 'Available Homes' })).not.toBeVisible();
    
    // Mobile menu trigger should be visible
    await expect(header.getByRole('button', { name: 'Menu' })).toBeVisible();
  });

  test('should open and close mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    
    const header = page.locator('header');
    await header.getByRole('button', { name: 'Menu' }).click();
    
    // The menu opens in a Dialog/Portal, so it might not be inside 'header' anymore.
    // We check for the links being visible generally (as they are now in the open menu).
    // But we must distinguish them from footer links. 
    // The dialog content usually has a specific role or class.
    // Let's assume standard Dialog role="dialog".
    const dialog = page.getByRole('dialog');
    
    await expect(dialog.getByRole('link', { name: 'Available Homes' })).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Our Team' })).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Resources' })).toBeVisible();
    
    // Close menu by clicking outside or escape key
    await page.keyboard.press('Escape');
    
    // Dialog should be gone
    await expect(dialog).not.toBeVisible();
  });

  test('should have correct image sizes in header on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const iconImage = page.locator('header img[alt="Copper Dog Realty"]').first();
    const wordMarkImage = page.locator('header img[alt="Copper Dog Realty"]').nth(1);

    const iconBoundingBox = await iconImage.boundingBox();
    const wordMarkBoundingBox = await wordMarkImage.boundingBox();

    expect(iconBoundingBox?.height).toBeLessThanOrEqual(24); // h-6 is 24px
    expect(wordMarkBoundingBox?.height).toBeLessThanOrEqual(16); // h-3 is 12px
  });
});