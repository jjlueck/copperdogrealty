import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have correct title', async ({ page }) => {
    // Basic title check, assuming metadata is set defaults or layout
    // Since we didn't inspect layout.tsx, skipping specific metadata check if it's dynamic
    // But checking for visible content is safer.
    await expect(page).toHaveTitle(/Copper Dog Realty/); 
  });

  test('should display main hero section content', async ({ page }) => {
    // Use regex 'i' flag for case-insensitive matching
    await expect(page.getByRole('heading', { name: /Every Home Deserves a Loving Family/i })).toBeVisible();
    await expect(page.getByText('Welcome to Copper Dog Realty, where we believe finding your perfect home')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Browse Available Homes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Meet Our Team' })).toBeVisible();
  });

  test('should display "Why Choose Copper Dog Realty?" section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Why Choose Copper Dog Realty\?/i })).toBeVisible();
    await expect(page.getByText('We bring small-town warmth and big-time expertise')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Personalized Service' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Local Expertise' })).toBeVisible();
  });

  test('should display "Homes Waiting For Their Forever Families" section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Homes Waiting for Their Forever Families/i })).toBeVisible();
    await expect(page.getByText('Just like rescue dogs, these wonderful homes are ready')).toBeVisible();
    await expect(page.getByRole('link', { name: 'View All Available Homes' })).toBeVisible();
  });
});