import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

// This fixes the "characters outside of the Latin1 range" error
if (typeof globalThis.btoa === "undefined") {
  globalThis.btoa = (str: string) => Buffer.from(str, "binary").toString("base64")
}

if (typeof globalThis.atob === "undefined") {
  globalThis.atob = (str: string) => Buffer.from(str, "base64").toString("binary")
}

export async function POST(request: Request) {
  try {
    const formData = await request.json()
    const { firstName, lastName, email, phone, interest, message, preferredContact } = formData;

    // Basic validation
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create a Nodemailer transporter
    // IMPORTANT: Replace with your actual SMTP configuration using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number.parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true", // Use 'true' for 465, 'false' for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Construct the email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: "beth@copperdogreality.com", // Recipient address
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      html: `
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Interest:</strong> ${interest || 'N/A'}</p>
        <p><strong>Preferred Contact Method:</strong> ${preferredContact || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    }

    // Send the email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ message: "Email sent successfully!" }, { status: 200 })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ message: "Failed to send email." }, { status: 500 })
  }
}
