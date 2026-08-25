import { test, expect } from '@playwright/test';
import jsQR from 'jsqr';

const SHARE_URL = 'https://copperdogrealty.com/share-your-dog';
const CARD = '/resources/share-your-dog-qr.svg';

/**
 * This is the only test that exercises the card's real colours.
 *
 * scripts/qr-poster.test.mjs rasterises to pure black on white, so it proves
 * the matrix survives the logo knockout but says nothing about copper modules
 * on a cream background, which measure 5.33:1 rather than the 14.67:1 the dark
 * palette would give. It also cannot cover the rounded modules and rounded
 * finder eyes, applied at draw time and exactly the sort of styling that
 * quietly breaks a scan.
 *
 * So decode the committed artifact itself, in colour, at the size it ships.
 */
async function decodeCard(page: import('@playwright/test').Page, scale: number) {
  await page.goto('/');
  const { data, width, height } = await page.evaluate(
    async ({ path, scale }) => {
      const svg = await (await fetch(path)).text();
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
      await img.decode();

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return { data: Array.from(pixels.data), width: pixels.width, height: pixels.height };
    },
    { path: CARD, scale },
  );

  return jsQR(Uint8ClampedArray.from(data), width, height)?.data ?? null;
}

test.describe('Good Dog Library QR card', () => {
  test('the printed card decodes to the live share-your-dog URL', async ({ page }) => {
    expect(await decodeCard(page, 2)).toBe(SHARE_URL);
  });

  test('still decodes when rendered small', async ({ page }) => {
    // Approximates a phone reading the card from across the path rather than
    // up close. Copper has less contrast headroom than the dark palette, so
    // this margin is worth pinning down rather than assuming.
    expect(await decodeCard(page, 0.6)).toBe(SHARE_URL);
  });
});
