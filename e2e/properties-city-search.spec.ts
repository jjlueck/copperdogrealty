import { test, expect } from '@playwright/test';

test.describe('Properties Page City Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/properties');
  });

  test('should allow searching and selecting a city', async ({ page }) => {
    // 0. Toggle to "City" mode (default is text now)
    await page.getByText('Search by City').click();

    // 1. Click the "Select cities..." button
    const cityTrigger = page.locator('#city');
    
    await expect(cityTrigger).toBeVisible();
    await cityTrigger.click();

    // 2. Verify the popover appears
    const popoverContent = page.locator('[cmdk-root]'); // Command component usually has this attribute or class
    // Or just look for the input
    const searchInput = page.getByPlaceholder('Search city...');
    await expect(searchInput).toBeVisible();

    // 3. Type "Spirit"
    await searchInput.fill('Spirit');

    // 4. Wait for results
    // We expect "Spirit Lake" to appear
    const resultItem = page.getByRole('option', { name: 'Spirit Lake' }).or(page.locator('[cmdk-item]').filter({ hasText: 'Spirit Lake' }));
    await expect(resultItem).toBeVisible();

    // 5. Click "Spirit Lake"
    await resultItem.click();

    // 6. Verify "Spirit Lake" is displayed in the trigger button
    await expect(cityTrigger).toHaveText(/Spirit Lake/);

    // 7. Verify "Selected" text exists (Popover should still be open)
    await expect(page.getByText('Selected', { exact: true })).toBeVisible();
    
    // 8. Deselect
    // Since search is cleared, only the selected item should be visible with this name
    const itemToDeselect = page.getByRole('option', { name: 'Spirit Lake' });
    await itemToDeselect.click();

    // 9. Verify reset
    await expect(cityTrigger).toHaveText(/Select cities.../);
  });
});
