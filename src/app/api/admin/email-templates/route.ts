import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { adminAuthOptions } from '@/lib/auth/admin-config'
import { prisma } from '@/lib/prisma'

// Default email templates
const defaultTemplates = [
  {
    slug: 'quote-created',
    name: 'Quote Created',
    subject: 'Your Quote #{{quoteNumber}} from Link Translations',
    description: 'Sent when a new quote is created',
    category: 'TRANSACTIONAL',
    variables: ['quoteNumber', 'customerName', 'total', 'validUntil', 'quoteLink'],
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Your Quote is Ready</h1>
  <p>Dear {{customerName}},</p>
  <p>Thank you for your interest in our translation services. We have prepared a quote for your review.</p>
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Quote Number:</strong> {{quoteNumber}}</p>
    <p><strong>Total Amount:</strong> {{total}}</p>
    <p><strong>Valid Until:</strong> {{validUntil}}</p>
  </div>
  <p><a href="{{quoteLink}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Quote</a></p>
  <p>If you have any questions, please don't hesitate to contact us.</p>
  <p>Best regards,<br>Link Translations Team</p>
</div>
    `
  },
  {
    slug: 'quote-accepted',
    name: 'Quote Accepted - Order Confirmation',
    subject: 'Order Confirmed - Quote #{{quoteNumber}}',
    description: 'Sent when customer accepts a quote',
    category: 'TRANSACTIONAL',
    variables: ['quoteNumber', 'customerName', 'total', 'estimatedDelivery', 'orderLink'],
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #16a34a;">Order Confirmed!</h1>
  <p>Dear {{customerName}},</p>
  <p>Thank you for your order. We have received your acceptance and our team is now working on your project.</p>
  <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #22c55e;">
    <p><strong>Order Number:</strong> {{quoteNumber}}</p>
    <p><strong>Total:</strong> {{total}}</p>
    <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
  </div>
  <p><a href="{{orderLink}}" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Track Your Order</a></p>
  <p>Best regards,<br>Link Translations Team</p>
</div>
    `
  },
  {
    slug: 'project-completed',
    name: 'Project Completed',
    subject: 'Your Translation is Ready - {{quoteNumber}}',
    description: 'Sent when a project is completed',
    category: 'NOTIFICATION',
    variables: ['quoteNumber', 'customerName', 'projectName', 'downloadLink'],
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Your Translation is Ready!</h1>
  <p>Dear {{customerName}},</p>
  <p>Great news! Your translation project has been completed and is ready for download.</p>
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Project:</strong> {{projectName}}</p>
    <p><strong>Reference:</strong> {{quoteNumber}}</p>
  </div>
  <p><a href="{{downloadLink}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Download Files</a></p>
  <p>We hope you are satisfied with our work. If you have any feedback or questions, please let us know.</p>
  <p>Best regards,<br>Link Translations Team</p>
</div>
    `
  },
  {
    slug: 'invoice-created',
    name: 'Invoice Created',
    subject: 'Invoice #{{invoiceNumber}} from Link Translations',
    description: 'Sent when an invoice is generated',
    category: 'TRANSACTIONAL',
    variables: ['invoiceNumber', 'customerName', 'total', 'dueDate', 'invoiceLink'],
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Invoice</h1>
  <p>Dear {{customerName}},</p>
  <p>Please find below your invoice from Link Translations.</p>
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
    <p><strong>Amount Due:</strong> {{total}}</p>
    <p><strong>Due Date:</strong> {{dueDate}}</p>
  </div>
  <p><a href="{{invoiceLink}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Invoice</a></p>
  <p>Thank you for your business.</p>
  <p>Best regards,<br>Link Translations Team</p>
</div>
    `
  },
  {
    slug: 'payment-received',
    name: 'Payment Received',
    subject: 'Payment Received - Invoice #{{invoiceNumber}}',
    description: 'Sent when payment is received',
    category: 'TRANSACTIONAL',
    variables: ['invoiceNumber', 'customerName', 'amount', 'paymentDate'],
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #16a34a;">Payment Received</h1>
  <p>Dear {{customerName}},</p>
  <p>We have received your payment. Thank you!</p>
  <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #22c55e;">
    <p><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
    <p><strong>Amount Received:</strong> {{amount}}</p>
    <p><strong>Payment Date:</strong> {{paymentDate}}</p>
  </div>
  <p>Best regards,<br>Link Translations Team</p>
</div>
    `
  },
  {
    slug: 'welcome-customer',
    name: 'Welcome New Customer',
    subject: 'Welcome to Link Translations',
    description: 'Sent when a new customer account is created',
    category: 'SYSTEM',
    variables: ['customerName', 'email', 'loginLink'],
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Welcome to Link Translations!</h1>
  <p>Dear {{customerName}},</p>
  <p>Thank you for creating an account with Link Translations. We're excited to have you on board!</p>
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Email:</strong> {{email}}</p>
  </div>
  <p>With your account, you can:</p>
  <ul>
    <li>Request quotes online</li>
    <li>Track your orders</li>
    <li>Access your translation history</li>
    <li>Download completed projects</li>
  </ul>
  <p><a href="{{loginLink}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Login to Your Account</a></p>
  <p>Best regards,<br>Link Translations Team</p>
</div>
    `
  },
  {
    slug: 'password-reset',
    name: 'Password Reset',
    subject: 'Reset Your Password - Link Translations',
    description: 'Sent when user requests password reset',
    category: 'SYSTEM',
    variables: ['customerName', 'resetLink', 'expiresIn'],
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Reset Your Password</h1>
  <p>Dear {{customerName}},</p>
  <p>We received a request to reset your password. Click the button below to create a new password.</p>
  <p><a href="{{resetLink}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
  <p style="color: #6b7280; font-size: 14px;">This link will expire in {{expiresIn}}.</p>
  <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
  <p>Best regards,<br>Link Translations Team</p>
</div>
    `
  },
  {
    slug: 'linguist-assignment',
    name: 'Linguist Assignment',
    subject: 'New Project Assignment - {{projectName}}',
    description: 'Sent to linguist when assigned to a project',
    category: 'NOTIFICATION',
    variables: ['linguistName', 'projectName', 'sourceLanguage', 'targetLanguage', 'deadline', 'projectLink'],
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">New Project Assignment</h1>
  <p>Dear {{linguistName}},</p>
  <p>You have been assigned to a new translation project.</p>
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Project:</strong> {{projectName}}</p>
    <p><strong>Language Pair:</strong> {{sourceLanguage}} → {{targetLanguage}}</p>
    <p><strong>Deadline:</strong> {{deadline}}</p>
  </div>
  <p><a href="{{projectLink}}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Project Details</a></p>
  <p>Best regards,<br>Link Translations Team</p>
</div>
    `
  }
]

// GET - List all email templates
export async function GET() {
  try {
    const session = await getServerSession(adminAuthOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if templates exist, if not, seed defaults
    const count = await prisma.emailTemplate.count()
    
    if (count === 0) {
      // Seed default templates
      for (const template of defaultTemplates) {
        await prisma.emailTemplate.create({
          data: {
            slug: template.slug,
            name: template.name,
            subject: template.subject,
            description: template.description,
            category: template.category as 'TRANSACTIONAL' | 'MARKETING' | 'NOTIFICATION',
            variables: template.variables,
            htmlContent: template.htmlContent.trim(),
            isActive: true
          }
        })
      }
    }

    const templates = await prisma.emailTemplate.findMany({
      orderBy: { category: 'asc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Failed to fetch email templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email templates' },
      { status: 500 }
    )
  }
}

// POST - Create new email template
export async function POST(request: Request) {
  try {
    const session = await getServerSession(adminAuthOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const template = await prisma.emailTemplate.create({
      data: {
        slug: data.slug,
        name: data.name,
        subject: data.subject,
        description: data.description,
        category: data.category,
        variables: data.variables || [],
        htmlContent: data.htmlContent,
        textContent: data.textContent,
        isActive: data.isActive ?? true
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Failed to create email template:', error)
    return NextResponse.json(
      { error: 'Failed to create email template' },
      { status: 500 }
    )
  }
}
