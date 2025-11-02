import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should display all contact form fields', async ({ page }) => {
    await expect(page.getByLabel('First Name')).toBeVisible();
    await expect(page.getByLabel('Last Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Phone Number')).toBeVisible();
    await expect(page.getByLabel('I\'m Interested In')).toBeVisible();
    await expect(page.getByLabel('Message')).toBeVisible();
    await expect(page.getByLabel('Preferred Contact Method')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeVisible();
  });

  test('should allow filling and submitting the form (frontend validation)', async ({ page }) => {
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email').fill('john.doe@example.com');
    await page.getByLabel('Phone Number').fill('555-123-4567');
    await page.getByLabel('I\'m Interested In').selectOption('buying');
    await page.getByLabel('Message').fill('I am interested in buying a home.');
    await page.getByLabel('Preferred Contact Method').selectOption('email');

    await page.getByRole('button', { name: 'Send Message' }).click();

    // Expect a success message (assuming the API call is mocked or a success message is displayed on the frontend)
    // Since we cannot mock the API in this context, we'll check for the frontend status message.
    await expect(page.getByText('Message sent successfully!')).toBeVisible();
  });
});
