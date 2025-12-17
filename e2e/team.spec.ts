import { test, expect } from '@playwright/test';

test.describe('Team Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/team');
  });

  test('should display team members', async ({ page }) => {
      // Check for human members
      await expect(page.getByRole('heading', { name: 'Beth Toliver' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Jason Grinnen' })).toBeVisible();
      
      // Check for dog members
      await expect(page.getByRole('heading', { name: 'Dobby Dean' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Neville' })).toBeVisible();
  });

  test('should display carousel for mascot team members', async ({ page }) => {
    // Find the specific card for Dobby Dean.
    // Use .first() to grab the main card container in case internal divs also match.
    const dobbyCard = page.locator('.grid > div')
        .filter({ hasText: 'Dobby Dean' })
        .filter({ has: page.getByRole('heading', { name: 'Dobby Dean' }) })
        .first();

    await expect(dobbyCard).toBeVisible();

    // Within that card, find the images. 
    const dobbyImg = dobbyCard.locator('img').first();
    
    await expect(dobbyImg).toBeVisible();
    
    // Verify it's a "dog" image (src contains /images/dogs/)
    await expect(dobbyImg).toHaveAttribute('src', /\/images\/dogs\//);
  });
});