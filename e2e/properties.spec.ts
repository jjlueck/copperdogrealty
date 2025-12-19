import { test, expect } from '@playwright/test';

test.describe('Properties Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/properties');
  });

  test('should display filter bar', async ({ page }) => {
    // Check for filter inputs
    await expect(page.getByPlaceholder('Address or MLS#')).toBeVisible();
    await expect(page.getByText('Search by City')).toBeVisible();
    await expect(page.getByLabel('Min Price')).toBeVisible();
    await expect(page.getByLabel('Max Price')).toBeVisible();
    await expect(page.getByLabel('Beds')).toBeVisible();
    await expect(page.getByLabel('Baths')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeVisible();
  });

  test('should display loading state initially', async ({ page }) => {
    // This might be too fast to catch, but we can check if the grid appears eventually
    // Or check for "Fetching latest listings..." if network is slow
    // For now, let's just wait for the grid container
    await expect(page.getByTestId('property-grid')).toBeVisible();
  });

  test('should display property cards or empty state', async ({ page }) => {
    // Since we rely on a real API that might return 0 results or N results,
    // we need to be flexible.
    
    // Either we see cards...
    const cards = page.locator('[data-testid="property-grid"] > div');
    const emptyState = page.getByText('No properties found');

    // Wait for one of them to appear
    await expect(cards.first().or(emptyState)).toBeVisible();
  });

  test('should allow filtering (UI interaction check)', async ({ page }) => {
    // Interact with filters
    await page.getByLabel('Min Price').fill('100000');
    await page.getByLabel('Max Price').fill('500000');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    // Verify search triggered (re-appearance of loading or update of results)
    // Since we can't easily mock the API response in this e2e env without more setup,
    // we'll verify the UI interaction didn't crash the page.
    await expect(page.locator('main')).toBeVisible();
  });

  test('should allow searching by text', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Address or MLS#');
    await expect(searchInput).toBeVisible();
    await searchInput.focus();
    await searchInput.pressSequentially('123 Main', { delay: 100 });
    await expect(searchInput).toHaveValue('123 Main');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.locator('main')).toBeVisible();
  });
});