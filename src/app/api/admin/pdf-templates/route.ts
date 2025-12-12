import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// Default PDF templates
const defaultPdfTemplates = [
  {
    id: 'quote_template',
    type: 'QUOTE',
    name: 'Quote PDF',
    showLogo: true,
    headerBackgroundColor: '#1e40af',
    headerTextColor: '#ffffff',
    showCompanyAddress: true,
    showContactInfo: true,
    tableHeaderColor: '#1e40af',
    alternateRowColor: '#f9fafb',
    footerText: 'Thank you for your business!',
    showPageNumbers: true,
    termsTitle: 'Terms & Conditions',
    termsContent: 'Quote valid for 30 days from the date of issue.',
    defaultNotes: null,
    isActive: true
  },
  {
    id: 'invoice_template',
    type: 'INVOICE',
    name: 'Invoice PDF',
    showLogo: true,
    headerBackgroundColor: '#065f46',
    headerTextColor: '#ffffff',
    showCompanyAddress: true,
    showContactInfo: true,
    tableHeaderColor: '#065f46',
    alternateRowColor: '#f9fafb',
    footerText: 'Payment is due within the terms specified above.',
    showPageNumbers: true,
    termsTitle: 'Payment Terms',
    termsContent: 'Net 30 days. Late payments may incur interest charges.',
    defaultNotes: null,
    isActive: true
  },
  {
    id: 'purchase_order_template',
    type: 'PURCHASE_ORDER',
    name: 'Purchase Order PDF',
    showLogo: true,
    headerBackgroundColor: '#92400e',
    headerTextColor: '#ffffff',
    showCompanyAddress: true,
    showContactInfo: true,
    tableHeaderColor: '#92400e',
    alternateRowColor: '#fffbeb',
    footerText: 'Please confirm receipt of this purchase order.',
    showPageNumbers: true,
    termsTitle: 'Terms & Conditions',
    termsContent: 'By accepting this PO, you agree to complete the work as specified.',
    defaultNotes: null,
    isActive: true
  }
]

// GET - List all PDF templates
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let templates = await prisma.pdfTemplate.findMany({
      orderBy: { type: 'asc' }
    })

    // Initialize with defaults if empty
    if (templates.length === 0) {
      for (const template of defaultPdfTemplates) {
        await prisma.pdfTemplate.create({
          data: {
            type: template.type as 'QUOTE' | 'INVOICE' | 'PURCHASE_ORDER',
            name: template.name,
            showLogo: template.showLogo,
            headerBackgroundColor: template.headerBackgroundColor,
            headerTextColor: template.headerTextColor,
            showCompanyAddress: template.showCompanyAddress,
            showContactInfo: template.showContactInfo,
            tableHeaderColor: template.tableHeaderColor,
            alternateRowColor: template.alternateRowColor,
            footerText: template.footerText,
            showPageNumbers: template.showPageNumbers,
            termsTitle: template.termsTitle,
            termsContent: template.termsContent,
            defaultNotes: template.defaultNotes,
            isActive: template.isActive
          }
        })
      }
      templates = await prisma.pdfTemplate.findMany({
        orderBy: { type: 'asc' }
      })
    }

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Failed to fetch PDF templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST - Create new PDF template
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const template = await prisma.pdfTemplate.create({
      data: {
        type: body.type,
        name: body.name,
        showLogo: body.showLogo ?? true,
        headerBackgroundColor: body.headerBackgroundColor || '#2563eb',
        headerTextColor: body.headerTextColor || '#ffffff',
        showCompanyAddress: body.showCompanyAddress ?? true,
        showContactInfo: body.showContactInfo ?? true,
        tableHeaderColor: body.tableHeaderColor || '#2563eb',
        alternateRowColor: body.alternateRowColor || '#f9fafb',
        footerText: body.footerText,
        showPageNumbers: body.showPageNumbers ?? true,
        termsTitle: body.termsTitle || 'Terms & Conditions',
        termsContent: body.termsContent,
        defaultNotes: body.defaultNotes,
        isActive: body.isActive ?? true
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Failed to create PDF template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
