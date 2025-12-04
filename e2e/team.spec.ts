import { test, expect } from '@playwright/test';

test.describe('Team Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/team');
  });

  test('should display a rotating carousel for the last two team members', async ({ page }) => {
    // Assuming the carousel is within the last two team member cards
    const carouselCards = page.locator('.grid > div:nth-last-child(1) .relative.aspect-square, .grid > div:nth-last-child(2) .relative.aspect-square');
    await expect(carouselCards.first()).toBeVisible();
    await expect(carouselCards.nth(1)).toBeVisible();

    // Check if the carousel images are present and rotating
    const firstCarouselImage = carouselCards.first().locator('img');
    const secondCarouselImage = carouselCards.nth(1).locator('img');

    const initialSrc1 = await firstCarouselImage.getAttribute('src');
    const initialSrc2 = await secondCarouselImage.getAttribute('src');

    // Wait for a few seconds to allow rotation
    await page.waitForTimeout(4000); // Carousel rotates every 3 seconds

    const newSrc1 = await firstCarouselImage.getAttribute('src');
    const newSrc2 = await secondCarouselImage.getAttribute('src');

    expect(newSrc1).not.toEqual(initialSrc1);
    expect(newSrc2).not.toEqual(initialSrc2);
  });
});
