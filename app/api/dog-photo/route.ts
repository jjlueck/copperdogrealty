import { NextResponse } from 'next/server';
import {
  buildAttachmentFilename,
  buildEmailHtml,
  buildEmailSubject,
  isHoneypotTripped,
  validateSubmission,
} from '@/lib/dog-photo';

/**
 * Emails a submitted Good Dog Library photo to the office.
 *
 * The photo itself was already uploaded to Vercel Blob by the browser; this
 * route receives only the resulting URL plus the optional text fields. Resend
 * fetches the image server-side for the attachment, so nothing large ever
 * passes through here.
 */
export async function POST(request: Request) {
  try {
    const raw = await request.json();

    // Bots that fill the hidden field get a success-shaped response so they
    // learn nothing from the difference.
    if (isHoneypotTripped(raw)) {
      return NextResponse.json({ message: 'Thanks for sharing!' }, { status: 200 });
    }

    const validation = validateSubmission(raw);
    if (!validation.ok) {
      return NextResponse.json({ message: validation.error }, { status: 400 });
    }

    const submission = validation.data;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured.');
      return NextResponse.json(
        { message: 'Photo uploads are not configured right now.' },
        { status: 500 },
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
    const toEmail = process.env.RESEND_TO_EMAIL ?? 'info@copperdogrealty.com';

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        // Only set reply_to when the visitor actually left an address.
        ...(submission.email ? { reply_to: submission.email } : {}),
        subject: buildEmailSubject(submission.dogName),
        html: buildEmailHtml(submission),
        attachments: [
          {
            filename: buildAttachmentFilename(submission.dogName, submission.blobUrl),
            // Resend fetches this URL itself, so we never buffer the image.
            path: submission.blobUrl,
          },
        ],
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json().catch(() => ({}));
      console.error('Resend API Error:', errorData);
      return NextResponse.json(
        { message: 'We saved your photo but could not notify the office. Please try again.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ message: 'Thanks for sharing!' }, { status: 200 });
  } catch (error) {
    console.error('Error handling dog photo submission:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
