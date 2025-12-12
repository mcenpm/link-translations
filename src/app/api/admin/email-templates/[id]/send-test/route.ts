import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { adminAuthOptions } from '@/lib/auth/admin-config'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// POST - Send test email using a template
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(adminAuthOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { testEmail, testVariables } = await request.json()

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      )
    }

    // Fetch the template
    const template = await prisma.emailTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Replace variables in subject and content
    let subject = template.subject
    let htmlContent = template.htmlContent

    // Use test variables or placeholder values
    const variables = testVariables || {}
    for (const varName of template.variables) {
      const value = variables[varName] || `[${varName}]`
      const regex = new RegExp(`{{${varName}}}`, 'g')
      subject = subject.replace(regex, value)
      htmlContent = htmlContent.replace(regex, value)
    }

    if (!resend) {
      // If no Resend API key, just return success with preview
      return NextResponse.json({
        success: true,
        preview: true,
        subject,
        htmlContent,
        message: 'Preview mode - no email was sent (Resend API key not configured)'
      })
    }

    const fromEmail = process.env.EMAIL_FROM || 'Link Translations <no-reply@linktranslations.com>'
    
    // Send the email
    const result = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: `[TEST] ${subject}`,
      html: htmlContent
    })

    // Log the email
    await prisma.emailLog.create({
      data: {
        templateId: template.id,
        to: [testEmail],
        from: fromEmail,
        subject: `[TEST] ${subject}`,
        htmlContent,
        status: 'SENT',
        externalId: (result as { id?: string }).id,
      }
    })

    return NextResponse.json({
      success: true,
      messageId: (result as { id?: string }).id,
      message: 'Test email sent successfully'
    })
  } catch (error) {
    console.error('Failed to send test email:', error)
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}
