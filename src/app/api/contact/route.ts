import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, subject, message } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // TODO: Send email notification
    // For now, just log the contact form submission
    console.log('Contact form submission:', {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      timestamp: new Date().toISOString(),
    })

    // TODO: Save to database if needed
    // await prisma.contactSubmission.create({ data: { ... } })

    // TODO: Send email using Resend, SendGrid, or AWS SES
    // await sendEmail({
    //   to: 'info@link-translations.com',
    //   subject: `Contact Form: ${subject}`,
    //   body: `From: ${firstName} ${lastName} (${email})\nPhone: ${phone}\n\n${message}`
    // })

    return NextResponse.json(
      { 
        success: true,
        message: 'Your message has been sent successfully. We will contact you soon!' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
