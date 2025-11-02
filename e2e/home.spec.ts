import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have correct title and description', async ({ page }) => {
    await expect(page).toHaveTitle(/Copper Dog Realty/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Boutique real estate brokerage serving the Iowa Great Lakes region/);
  });

  test('should display main hero section content', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'EVERY HOME DESERVES A LOVING FAMILY' })).toBeVisible();
    await expect(page.getByText('Welcome to Copper Dog Realty, where we believe finding your perfect home should feel as joyful as adopting a loyal companion.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Browse Available Homes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Meet Our Team' })).toBeVisible();
  });

  test('should display "Why Choose Copper Dog Realty?" section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'WHY CHOOSE COPPER DOG REALTY?' })).toBeVisible();
    await expect(page.getByText('We bring small-town warmth and big-time expertise to every transaction')).toBeVisible();
    await expect(page.getByText('PERSONALIZED SERVICE')).toBeVisible();
    await expect(page.getByText('LOCAL EXPERTISE')).toBeVisible();
  });

  test('should display "Homes Waiting For Their Forever Families" section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'HOMES WAITING FOR THEIR FOREVER FAMILIES' })).toBeVisible();
    await expect(page.getByText('Just like rescue dogs, these wonderful homes are ready to bring joy to the right family')).toBeVisible();
    await expect(page.getByRole('link', { name: 'View All Available Homes' })).toBeVisible();
  });
});
