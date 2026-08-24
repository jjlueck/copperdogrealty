import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  isAllowedBlobUrl,
  isPlausiblePhone,
  hasContactMethod,
  validateSubmission,
  isHoneypotTripped,
  buildEmailSubject,
  buildAttachmentFilename,
  buildEmailHtml,
} from './dog-photo';

const VALID_BLOB_URL = 'https://abc123.public.blob.vercel-storage.com/dog-photos/waffles-xyz.jpg';

describe('escapeHtml', () => {
  it('neutralizes angle brackets and quotes', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
  });

  it('escapes ampersands first so entities are not double-broken', () => {
    expect(escapeHtml('a & <b>')).toBe('a &amp; &lt;b&gt;');
  });
});

describe('isAllowedBlobUrl', () => {
  it('accepts a Vercel Blob https URL', () => {
    expect(isAllowedBlobUrl(VALID_BLOB_URL)).toBe(true);
  });

  it('rejects an arbitrary host', () => {
    expect(isAllowedBlobUrl('https://evil.example.com/payload.jpg')).toBe(false);
  });

  it('rejects a lookalike host that only contains the suffix', () => {
    expect(
      isAllowedBlobUrl('https://public.blob.vercel-storage.com.evil.example.com/x.jpg'),
    ).toBe(false);
  });

  it('rejects plain http', () => {
    expect(
      isAllowedBlobUrl('http://abc123.public.blob.vercel-storage.com/dog-photos/x.jpg'),
    ).toBe(false);
  });

  it('rejects malformed input', () => {
    expect(isAllowedBlobUrl('not a url')).toBe(false);
    expect(isAllowedBlobUrl('')).toBe(false);
  });
});

describe('isPlausiblePhone', () => {
  it('accepts the formats people actually type', () => {
    expect(isPlausiblePhone('7125550134')).toBe(true);
    expect(isPlausiblePhone('(712) 555-0134')).toBe(true);
    expect(isPlausiblePhone('712.555.0134')).toBe(true);
    expect(isPlausiblePhone('+1 712 555 0134')).toBe(true);
    expect(isPlausiblePhone('555-0134')).toBe(true);
  });

  it('rejects too few or too many digits', () => {
    expect(isPlausiblePhone('12345')).toBe(false);
    expect(isPlausiblePhone('1234567890123456')).toBe(false);
  });

  it('rejects letters and junk', () => {
    expect(isPlausiblePhone('call me maybe')).toBe(false);
    expect(isPlausiblePhone('712-555-0134 x12')).toBe(false);
    expect(isPlausiblePhone('')).toBe(false);
  });
});

describe('hasContactMethod', () => {
  it('is true when either field has content', () => {
    expect(hasContactMethod({ email: 'a@b.com' })).toBe(true);
    expect(hasContactMethod({ phone: '712-555-0134' })).toBe(true);
    expect(hasContactMethod({ email: 'a@b.com', phone: '712-555-0134' })).toBe(true);
  });

  it('is false when both are empty, missing, or whitespace', () => {
    expect(hasContactMethod({})).toBe(false);
    expect(hasContactMethod({ email: '', phone: '' })).toBe(false);
    expect(hasContactMethod({ email: '   ', phone: '  ' })).toBe(false);
  });
});

describe('validateSubmission', () => {
  it('accepts a photo with no other fields', () => {
    const result = validateSubmission({ blobUrl: VALID_BLOB_URL });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.dogName).toBe('');
      expect(result.data.consent).toBe(false);
    }
  });

  it('rejects a missing photo', () => {
    expect(validateSubmission({}).ok).toBe(false);
  });

  it('rejects an off-host photo URL', () => {
    const result = validateSubmission({ blobUrl: 'https://evil.example.com/x.jpg' });
    expect(result.ok).toBe(false);
  });

  it('rejects a malformed email but allows an empty one', () => {
    expect(validateSubmission({ blobUrl: VALID_BLOB_URL, email: 'nope' }).ok).toBe(false);
    expect(validateSubmission({ blobUrl: VALID_BLOB_URL, email: '' }).ok).toBe(true);
  });

  it('rejects a malformed phone but allows an empty one', () => {
    expect(validateSubmission({ blobUrl: VALID_BLOB_URL, phone: 'nope' }).ok).toBe(false);
    expect(validateSubmission({ blobUrl: VALID_BLOB_URL, phone: '' }).ok).toBe(true);
  });

  it('keeps a valid phone number', () => {
    const result = validateSubmission({ blobUrl: VALID_BLOB_URL, phone: ' (712) 555-0134 ' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.phone).toBe('(712) 555-0134');
  });

  it('still accepts a submission with no contact details at all', () => {
    // The form requires email or phone; the server deliberately does not, so a
    // photo that arrives without either is delivered rather than dropped.
    const result = validateSubmission({ blobUrl: VALID_BLOB_URL });
    expect(result.ok).toBe(true);
  });

  it('trims and length-caps free text', () => {
    const result = validateSubmission({
      blobUrl: VALID_BLOB_URL,
      dogName: `  ${'a'.repeat(500)}  `,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.dogName).toHaveLength(100);
  });

  it('only treats a literal true as consent', () => {
    const yes = validateSubmission({ blobUrl: VALID_BLOB_URL, consent: true });
    const stringy = validateSubmission({ blobUrl: VALID_BLOB_URL, consent: 'true' });
    expect(yes.ok && yes.data.consent).toBe(true);
    expect(stringy.ok && stringy.data.consent).toBe(false);
  });

  it('rejects non-object bodies', () => {
    expect(validateSubmission(null).ok).toBe(false);
    expect(validateSubmission('string').ok).toBe(false);
  });
});

describe('isHoneypotTripped', () => {
  it('is false when the hidden field is untouched', () => {
    expect(isHoneypotTripped({ blobUrl: VALID_BLOB_URL })).toBe(false);
    expect(isHoneypotTripped({ website: '   ' })).toBe(false);
  });

  it('is true when the hidden field has content', () => {
    expect(isHoneypotTripped({ website: 'http://spam.example' })).toBe(true);
  });
});

describe('buildEmailSubject', () => {
  it('includes the dog name when given', () => {
    expect(buildEmailSubject('Waffles')).toContain('Waffles');
  });

  it('falls back cleanly with no name', () => {
    expect(buildEmailSubject('')).toBe('🐾 New Good Dog Library photo');
  });
});

describe('buildAttachmentFilename', () => {
  it('slugifies the dog name and keeps the extension', () => {
    expect(buildAttachmentFilename('Sir Waffles III', VALID_BLOB_URL)).toBe('sir-waffles-iii.jpg');
  });

  it('falls back when the name has no usable characters', () => {
    expect(buildAttachmentFilename('!!!', VALID_BLOB_URL)).toBe('good-dog.jpg');
  });

  it('defaults the extension when the URL has none', () => {
    expect(
      buildAttachmentFilename('Rex', 'https://abc.public.blob.vercel-storage.com/dog-photos/rex'),
    ).toBe('rex.jpg');
  });
});

describe('buildEmailHtml', () => {
  const base = {
    blobUrl: VALID_BLOB_URL,
    dogName: '',
    senderName: '',
    email: '',
    phone: '',
    message: '',
    consent: false,
  };

  it('escapes every user-supplied field', () => {
    const html = buildEmailHtml({
      ...base,
      dogName: '<img src=x onerror=alert(1)>',
      senderName: '<b>bold</b>',
      message: '<script>alert(2)</script>',
      email: 'a<b@example.com',
    });

    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>bold</b>');
    expect(html).toContain('&lt;img src=x');
    expect(html).toContain('&lt;script&gt;');
  });

  it('states the consent answer explicitly in both directions', () => {
    expect(buildEmailHtml({ ...base, consent: true })).toContain('Yes');
    expect(buildEmailHtml({ ...base, consent: false })).toContain('do not post this photo');
  });

  it('embeds the photo and a full-resolution link', () => {
    const html = buildEmailHtml(base);
    expect(html).toContain(`<img src="${VALID_BLOB_URL}"`);
    expect(html).toContain(`<a href="${VALID_BLOB_URL}"`);
  });

  it('links a phone number and marks it absent otherwise', () => {
    expect(buildEmailHtml({ ...base, phone: '(712) 555-0134' })).toContain(
      '<a href="tel:(712) 555-0134">',
    );
    expect(buildEmailHtml(base)).toContain('<strong>Phone</strong>');
  });

  it('omits the message block entirely when no message was left', () => {
    expect(buildEmailHtml(base)).not.toContain('<strong>Message</strong>');
  });
});
