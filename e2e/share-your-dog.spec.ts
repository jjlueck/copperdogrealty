import { test, expect } from '@playwright/test';

test.describe('Share Your Dog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/share-your-dog');
  });

  test('should display the hero section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Treat. Snap. Share.' })).toBeVisible();
    await expect(page.getByText('You found the Good Dog Library.')).toBeVisible();
  });

  test('should show the library photo and explain the page is legitimate', async ({ page }) => {
    await expect(page.getByRole('heading', { name: "Yes, you're in the right place" })).toBeVisible();
    await expect(page.getByRole('img', { name: /Good Dog Library/i })).toBeVisible();
    // The address also appears in the footer, so scope to the page body.
    await expect(page.locator('main').getByText('1715 Hill Ave')).toBeVisible();
  });

  test('should describe the Dog of the Month contest', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dog of the Month' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Treat', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Snap', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Share', exact: true })).toBeVisible();
  });

  test('should render the upload form with the photo picker and optional fields', async ({
    page,
  }) => {
    await expect(page.getByRole('button', { name: /Tap to add a photo/i })).toBeVisible();
    await expect(page.getByLabel("Your dog's name")).toBeVisible();
    await expect(page.getByLabel('Your name')).toBeVisible();
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    await expect(page.getByLabel(/feature my dog/i)).toBeVisible();
  });

  test('should disable submit until a photo is chosen', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Share my dog' })).toBeDisabled();
  });

  test('should preview a selected photo and enable submit', async ({ page }) => {
    await page.setInputFiles('#photo', 'public/images/little-free-library.jpg');

    await expect(page.getByRole('img', { name: 'The photo you selected' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share my dog' })).toBeEnabled();
    await expect(page.getByRole('button', { name: /Choose a different photo/i })).toBeVisible();
  });

  test('should not be indexed by search engines', async ({ page }) => {
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', /noindex/);
  });

  test('should display call to action', async ({ page }) => {
    const main = page.locator('main');
    await expect(main.getByRole('heading', { name: "While You're Here" })).toBeVisible();
    await expect(main.getByRole('link', { name: 'Browse Homes' })).toBeVisible();
    await expect(main.getByRole('link', { name: 'Get in Touch' })).toBeVisible();
  });
});
