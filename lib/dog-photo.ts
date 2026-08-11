/**
 * Shared helpers for the Good Dog Library photo submissions (/share-your-dog).
 *
 * Kept free of Next.js and browser APIs so they can be unit tested under the
 * node-environment Vitest config.
 */

/** Content types accepted by the Blob upload token route. */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

/** Upper bound for a single submitted photo. Modern phone photos land well under this. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/** Every submission is stored under this prefix so the store stays browsable. */
export const BLOB_PATH_PREFIX = 'dog-photos/';

/** Host suffix for Vercel Blob public URLs. */
const BLOB_HOST_SUFFIX = '.public.blob.vercel-storage.com';

export interface DogPhotoSubmission {
  blobUrl: string;
  dogName: string;
  senderName: string;
  email: string;
  message: string;
  consent: boolean;
}

/**
 * Escape text for interpolation into an HTML email body.
 *
 * Everything on this page arrives from an unauthenticated public form, so no
 * submitted string reaches the owner's mail client without passing through here.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Confirm a URL points at Vercel Blob storage over https.
 *
 * Without this the notify route is an open relay: anyone could POST an arbitrary
 * URL and have us email it, with an attachment fetched from it, to the owner.
 */
export function isAllowedBlobUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:') return false;
  return parsed.hostname.endsWith(BLOB_HOST_SUFFIX);
}

/** Trim a submitted field to a sane length so one entry can't dominate the email. */
function clean(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export type ValidationResult =
  | { ok: true; data: DogPhotoSubmission }
  | { ok: false; error: string };

/**
 * Validate a raw request body.
 *
 * Only the photo is required. Every other field is optional by design: the
 * visitor is standing outside on a phone and we want one tap between them and
 * a submitted photo.
 */
export function validateSubmission(raw: unknown): ValidationResult {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, error: 'Invalid request body.' };
  }

  const body = raw as Record<string, unknown>;
  const blobUrl = clean(body.blobUrl, 2048);

  if (!blobUrl) {
    return { ok: false, error: 'Missing photo.' };
  }
  if (!isAllowedBlobUrl(blobUrl)) {
    return { ok: false, error: 'Photo URL is not a recognized upload.' };
  }

  const email = clean(body.email, 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'That email address does not look right.' };
  }

  return {
    ok: true,
    data: {
      blobUrl,
      dogName: clean(body.dogName, 100),
      senderName: clean(body.senderName, 100),
      email,
      message: clean(body.message, 2000),
      consent: body.consent === true,
    },
  };
}

/** True when a bot filled the hidden honeypot field. */
export function isHoneypotTripped(raw: unknown): boolean {
  if (typeof raw !== 'object' || raw === null) return false;
  return clean((raw as Record<string, unknown>).website, 200).length > 0;
}

export function buildEmailSubject(dogName: string): string {
  return dogName
    ? `🐾 New Good Dog Library photo: ${dogName}`
    : '🐾 New Good Dog Library photo';
}

/** Filename for the email attachment. Derived from the dog's name when given. */
export function buildAttachmentFilename(dogName: string, blobUrl: string): string {
  const extension = blobUrl.split('?')[0].split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeExtension = /^[a-z0-9]{2,5}$/.test(extension) ? extension : 'jpg';
  const slug = dogName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${slug || 'good-dog'}.${safeExtension}`;
}

export function buildEmailHtml(submission: DogPhotoSubmission): string {
  const { blobUrl, dogName, senderName, email, message, consent } = submission;

  // Every value below is either a literal or passed through escapeHtml first.
  const rows: Array<[string, string]> = [
    ['Dog', dogName ? escapeHtml(dogName) : 'Not given'],
    ['From', senderName ? escapeHtml(senderName) : 'Not given'],
    ['Email', email ? `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` : 'Not given'],
    [
      'OK to feature publicly',
      consent ? 'Yes' : 'No — do not post this photo without asking first',
    ],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#6b5b4d;white-space:nowrap;vertical-align:top;"><strong>${label}</strong></td><td style="padding:4px 0;">${value}</td></tr>`,
    )
    .join('');

  const messageHtml = message
    ? `<p style="margin:16px 0 0;"><strong>Message</strong></p><p style="margin:4px 0 0;white-space:pre-wrap;">${escapeHtml(message)}</p>`
    : '';

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#2c2118;max-width:640px;">
      <p style="margin:0 0 16px;">Someone just shared a dog photo from the Good Dog Library.</p>
      <img src="${escapeHtml(blobUrl)}" width="600" alt="Submitted dog photo" style="max-width:100%;height:auto;border-radius:12px;display:block;" />
      <table style="border-collapse:collapse;margin-top:16px;font-size:14px;">${rowsHtml}</table>
      ${messageHtml}
      <p style="margin:20px 0 0;font-size:14px;">
        <a href="${escapeHtml(blobUrl)}">View or download the full-resolution photo</a>
      </p>
    </div>
  `;
}
