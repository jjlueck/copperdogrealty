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
    await expect(page.getByLabel('Phone', { exact: true })).toBeVisible();
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

  test('should block submission when neither email nor phone is given', async ({ page }) => {
    // Nothing should reach the network, so fail loudly if anything tries.
    let apiCalls = 0;
    await page.route('**/api/dog-photo/**', async (route) => {
      apiCalls += 1;
      await route.abort();
    });

    await page.setInputFiles('#photo', 'public/images/little-free-library.jpg');
    await page.getByRole('button', { name: 'Share my dog' }).click();

    // Scoped to the form: Next.js keeps its own role="alert" route announcer
    // on the page at all times.
    const formAlert = page.locator('form [role="alert"]');
    await expect(formAlert).toContainText('Please add an email address or a phone number');
    await expect(page.getByLabel('Email', { exact: true })).toBeFocused();
    expect(apiCalls).toBe(0);

    // The complaint should clear as soon as they start filling one in.
    await page.getByLabel('Phone', { exact: true }).fill('712-555-0134');
    await expect(formAlert).toHaveCount(0);
  });

  test('should accept a phone number as the only contact detail', async ({ page }) => {
    // Stub the upload-token route so the guard can be observed passing without
    // a real photo reaching Blob storage or a real email being sent.
    await page.route('**/api/dog-photo/upload', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'stubbed in test' }),
      });
    });

    await page.setInputFiles('#photo', 'public/images/little-free-library.jpg');
    await page.getByLabel('Phone', { exact: true }).fill('712-555-0134');
    await page.getByRole('button', { name: 'Share my dog' }).click();

    // Past the contact check and into the upload, which is where the stub bites.
    const formAlert = page.locator('form [role="alert"]');
    await expect(formAlert).toContainText("We couldn't upload that photo");
    await expect(page.getByText('Please add an email address')).toHaveCount(0);
  });

  test('should reject a malformed phone number before uploading anything', async ({ page }) => {
    let apiCalls = 0;
    await page.route('**/api/dog-photo/**', async (route) => {
      apiCalls += 1;
      await route.abort();
    });

    await page.setInputFiles('#photo', 'public/images/little-free-library.jpg');
    await page.getByLabel('Phone', { exact: true }).fill('12345');
    await page.getByRole('button', { name: 'Share my dog' }).click();

    const formAlert = page.locator('form [role="alert"]');
    await expect(formAlert).toContainText("That phone number doesn't look right");
    await expect(page.getByLabel('Phone', { exact: true })).toBeFocused();
    // The photo must not reach Blob storage only to be rejected afterwards.
    expect(apiCalls).toBe(0);
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
