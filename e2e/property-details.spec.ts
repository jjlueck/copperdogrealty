import { test, expect } from '@playwright/test';

test.describe('Property Details Page', () => {
  test('should navigate to details and have correct metadata', async ({ page }) => {
    // 1. Navigate to the properties list
    await page.goto('/properties');
    
    // 2. Wait for the grid to load (increase timeout for external API)
    await expect(page.getByTestId('property-grid')).toBeVisible({ timeout: 15000 });
    
    // 3. Click the first property card (the whole card is a link, or use View Details)
    const firstCard = page.locator('[data-testid="property-grid"] > div').first();
    await expect(firstCard).toBeVisible();
    
    // Get the expected address from the card to verify on the next page
    const cardAddress = await firstCard.locator('h3').textContent();
    
    await firstCard.click();
    
    // 4. Verify URL has changed (contains /properties/)
    await expect(page).toHaveURL(/\/properties\/.+/);
    
    // 5. Verify the detail page content matches
    // Note: The detail page might format the address differently, but it should be present.
    if (cardAddress) {
       await expect(page.locator('h1')).toContainText(cardAddress.trim());
    }
    
    await expect(page.getByText('Contact Agent')).toBeVisible();

    // 6. Verify og:image metadata
    // We expect at least one og:image tag.
    const ogImages = page.locator('meta[property="og:image"]');
    const count = await ogImages.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify the first image has a content attribute that is not empty
    const imageUrl = await ogImages.first().getAttribute('content');
    expect(imageUrl).toBeTruthy();
    
    // Ideally, it should be a full URL
    expect(imageUrl).toMatch(/^https?:\/\//);
  });
});
