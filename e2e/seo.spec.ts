import { test, expect } from '@playwright/test';

const SITE_URL = 'https://copperdogrealty.com';

test.describe('Search engine discovery', () => {
  test('robots.txt allows crawling and points at the sitemap', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toContain('Allow: /');
    expect(body).not.toContain('Disallow');
    expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  test('sitemap lists public pages and listings, but not noindex pages', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBe(true);
    const body = await res.text();
    for (const path of ['/properties', '/about', '/team', '/contact', '/resources']) {
      expect(body).toContain(`<loc>${SITE_URL}${path}</loc>`);
    }
    expect(body).toMatch(new RegExp(`<loc>${SITE_URL}/properties/[^<]+</loc>`));
    expect(body).not.toContain('/share-your-dog');
  });

  test('each page declares itself as canonical', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE_URL}/about`);
  });

  // Raw server HTML is what search engines index first, so listings must be in
  // it rather than a loading placeholder that client code later replaces.
  for (const path of ['/', '/properties']) {
    test(`${path} serves listings in its initial HTML`, async ({ request }) => {
      const html = await (await request.get(path)).text();
      expect(html).not.toMatch(/Loading (featured homes|properties)\.\.\./);
      expect(html).not.toContain('Fetching latest listings');
      expect(html).toMatch(/href="\/properties\/[^"]+"/);
    });
  }

  test('each page has its own title', async ({ request }) => {
    const titles = new Set<string>();
    for (const path of ['/', '/properties', '/about', '/team', '/resources', '/contact']) {
      const html = await (await request.get(path)).text();
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
      expect(title, path).toContain('Copper Dog Realty');
      titles.add(title!);
    }
    expect(titles.size).toBe(6);
  });

  test('filtered listing URLs point back to the unfiltered page', async ({ page }) => {
    await page.goto('/properties?city=Spirit%20Lake');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE_URL}/properties`);
  });
});
