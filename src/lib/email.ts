import { Resend } from 'resend'
import { prisma } from './prisma'

// Initialize Resend client (only if API key exists)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Email from address
const FROM_EMAIL = process.env.EMAIL_FROM || 'Link Translations <noreply@linktranslations.com>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@linktranslations.com'

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export async function sendEmail({ to, subject, html, text, replyTo }: EmailOptions) {
  if (!resend) {
    console.log('📧 Email skipped (no API key):', { to, subject })
    return { success: false, error: 'No API key configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      replyTo: replyTo || ADMIN_EMAIL,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    console.log('📧 Email sent:', { to, subject, id: data?.id })
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error: String(error) }
  }
}

// Helper to get admin email
export function getAdminEmail(): string {
  return ADMIN_EMAIL
}

// Send email using a database template
interface TemplateEmailOptions {
  templateSlug: string
  to: string | string[]
  variables: Record<string, string>
  replyTo?: string
  customerId?: string
  quoteId?: string
  projectId?: string
}

export async function sendTemplateEmail({
  templateSlug,
  to,
  variables,
  replyTo,
  customerId,
  quoteId,
  projectId
}: TemplateEmailOptions) {
  try {
    // Fetch template from database
    const template = await prisma.emailTemplate.findUnique({
      where: { slug: templateSlug }
    })

    if (!template) {
      console.error(`Email template not found: ${templateSlug}`)
      return { success: false, error: `Template not found: ${templateSlug}` }
    }

    if (!template.isActive) {
      console.log(`Email template is inactive: ${templateSlug}`)
      return { success: false, error: 'Template is inactive' }
    }

    // Replace variables in subject and content
    let subject = template.subject
    let htmlContent = template.htmlContent

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      subject = subject.replace(regex, value)
      htmlContent = htmlContent.replace(regex, value)
    }

    // Send the email
    const toAddresses = Array.isArray(to) ? to : [to]
    
    if (!resend) {
      console.log('📧 Template email skipped (no API key):', { templateSlug, to, subject })
      
      // Still log the email even if not sent
      await prisma.emailLog.create({
        data: {
          templateId: template.id,
          to: toAddresses,
          from: FROM_EMAIL,
          subject,
          htmlContent,
          status: 'FAILED',
          error: 'No API key configured',
          customerId,
          quoteId,
          projectId,
        }
      })
      
      return { success: false, error: 'No API key configured' }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toAddresses,
      subject,
      html: htmlContent,
      text: template.textContent || htmlContent.replace(/<[^>]*>/g, ''),
      replyTo: replyTo || ADMIN_EMAIL,
    })

    // Log the email
    await prisma.emailLog.create({
      data: {
        templateId: template.id,
        to: toAddresses,
        from: FROM_EMAIL,
        subject,
        htmlContent,
        status: error ? 'FAILED' : 'SENT',
        externalId: data?.id,
        error: error?.message,
        customerId,
        quoteId,
        projectId,
      }
    })

    if (error) {
      console.error('Template email send error:', error)
      return { success: false, error: error.message }
    }

    console.log('📧 Template email sent:', { templateSlug, to, subject, id: data?.id })
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Template email error:', error)
    return { success: false, error: String(error) }
  }
}

// Get a rendered template (for preview)
export async function renderTemplate(
  templateSlug: string, 
  variables: Record<string, string>
): Promise<{ subject: string; html: string } | null> {
  const template = await prisma.emailTemplate.findUnique({
    where: { slug: templateSlug }
  })

  if (!template) return null

  let subject = template.subject
  let html = template.htmlContent

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    subject = subject.replace(regex, value)
    html = html.replace(regex, value)
  }

  return { subject, html }
}
