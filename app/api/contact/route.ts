import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    const { firstName, lastName, email, phone, interest, message, preferredContact } = formData;

    // Basic validation
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Resend API Key from environment variables
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      return NextResponse.json({ message: 'Resend API Key not configured.' }, { status: 500 });
    }

    // Construct the email content for Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
    const toEmail = process.env.RESEND_TO_EMAIL ?? 'info@copperdogreality.com';

    const resendPayload = {
      from: fromEmail,
      to: toEmail,
      subject: `Copper Dog Realty Form Submission 🎉 from ${firstName} ${lastName}`,
      html: `
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Interest:</strong> ${interest || 'N/A'}</p>
      <p><strong>Preferred Contact Method:</strong> ${preferredContact || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      `,
    };

    // Send the email using Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(resendPayload),
    });

    if (resendResponse.ok) {
      return NextResponse.json({ message: 'Email sent successfully via Resend!' }, { status: 200 });
    } else {
      const errorData = await resendResponse.json();
      console.error('Resend API Error:', errorData);
      return NextResponse.json({ message: `Failed to send email via Resend: ${errorData.message || 'Unknown error'}` }, { status: resendResponse.status });
    }

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
