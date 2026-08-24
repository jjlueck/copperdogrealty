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
    // The real route needs RESEND_API_KEY, which CI does not have (and which
    // would send a live email locally). Intercept it, but still assert the
    // payload so a form that submits empty values fails instead of passing on
    // an unconditional 200.
    let submitted: any = null;
    await page.route('**/api/contact', async (route) => {
      submitted = route.request().postDataJSON();
      const missing = ['firstName', 'lastName', 'email', 'message'].filter(
        (field) => !submitted?.[field]
      );
      if (missing.length > 0) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: `Missing required fields: ${missing.join(', ')}` }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Email sent successfully via Resend!' }),
      });
    });

    // These are controlled inputs. Any fill that lands before React finishes
    // hydrating is discarded when hydration re-renders from empty state, which
    // previously reached the API as "Missing required fields". Retry the whole
    // sequence until every required value has actually stuck.
    await expect(async () => {
      await page.getByLabel('First Name').fill('John');
      await page.getByLabel('Last Name').fill('Doe');
      await page.getByLabel('Email').fill('john.doe@example.com');
      await page.getByLabel('Phone Number').fill('555-123-4567');
      await page.getByLabel('I\'m Interested In').selectOption('buying');
      await page.getByLabel('Message').fill('I am interested in buying a home.');
      await page.getByLabel('Preferred Contact Method').selectOption('email');

      await expect(page.getByLabel('First Name')).toHaveValue('John');
      await expect(page.getByLabel('Last Name')).toHaveValue('Doe');
      await expect(page.getByLabel('Email')).toHaveValue('john.doe@example.com');
      await expect(page.getByLabel('Message')).toHaveValue('I am interested in buying a home.');
    }).toPass({ timeout: 20000 });

    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByText('Message sent successfully!')).toBeVisible();

    expect(submitted).toMatchObject({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      interest: 'buying',
      message: 'I am interested in buying a home.',
      preferredContact: 'email',
    });
  });

  test('should not display property context to the user even when provided in URL', async ({ page }) => {
    const listingId = '12345';
    const address = '123 Main St';
    await page.goto(`/contact?listingId=${listingId}&address=${encodeURIComponent(address)}`);

    await expect(page.getByText('Inquiring about:')).not.toBeVisible();
    await expect(page.getByText(`MLS# ${listingId} - ${address}`)).not.toBeVisible();
  });
});
