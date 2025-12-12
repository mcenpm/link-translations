import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { generateInvoicePDF } from '@/lib/utils/pdf'

// Get company settings for PDF
async function getCompanySettings() {
  const settings = await prisma.companySettings.findUnique({
    where: { id: 'company_settings' }
  })
  
  if (!settings) return undefined
  
  return {
    companyName: settings.companyName,
    legalName: settings.legalName,
    tagline: settings.tagline,
    email: settings.email,
    phone: settings.phone,
    tollFree: settings.tollFree,
    website: settings.website,
    address: settings.address,
    city: settings.city,
    state: settings.state,
    zipCode: settings.zipCode,
    primaryColor: settings.primaryColor,
    pdfHeaderText: settings.pdfHeaderText,
    pdfFooterText: settings.pdfFooterText,
    pdfTermsAndConditions: settings.pdfTermsAndConditions,
    invoicePaymentTerms: settings.invoicePaymentTerms,
    invoiceBankDetails: settings.invoiceBankDetails,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    // Fetch invoice with related data
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            quote: {
              include: {
                corporate: true,
                contact: true,
                srcLanguage: true,
                tgtLanguage: true,
              }
            }
          }
        },
        corporate: true,
        payments: true,
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Check authorization
    if (session?.user?.role !== 'ADMIN' && invoice.corporate?.userId !== session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get company settings
    const companySettings = await getCompanySettings()
    
    // Calculate amounts
    const totalPaid = invoice.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const amountDue = (invoice.total || 0) - totalPaid

    // Get customer info
    const quote = invoice.order?.quote
    const customerName = quote?.contact 
      ? `${quote.contact.firstName || ''} ${quote.contact.lastName || ''}`.trim()
      : quote?.billingContactName || invoice.corporate?.company || 'Customer'
    
    const customerEmail = quote?.contactPersonEmail || quote?.contact?.email || ''
    const customerCompany = quote?.corporate?.company || invoice.corporate?.company
    const customerAddress = invoice.corporate?.billingAddress 
      ? `${invoice.corporate.billingAddress}, ${invoice.corporate.billingCity || ''} ${invoice.corporate.billingState || ''} ${invoice.corporate.billingZip || ''}`
      : undefined

    // Format invoice data for PDF
    const pdfData = {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: new Date(invoice.issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      dueDate: new Date(invoice.dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      customer: {
        name: customerName,
        email: customerEmail,
        company: customerCompany,
        address: customerAddress
      },
      items: [{
        description: quote?.description || 'Translation Service',
        sourceLanguage: quote?.srcLanguage?.name,
        targetLanguage: quote?.tgtLanguage?.name,
        quantity: quote?.wordCount || 1,
        unit: quote?.serviceType === 'interpretation' ? 'hours' : 'words',
        unitPrice: invoice.total ? invoice.total / (quote?.wordCount || 1) : 0,
        total: invoice.total || 0
      }],
      subtotal: invoice.subtotal || invoice.total || 0,
      tax: invoice.tax || 0,
      discount: 0,
      total: invoice.total || 0,
      amountPaid: totalPaid,
      amountDue: amountDue,
      paymentTerms: companySettings?.invoicePaymentTerms || 'Net 30',
      bankDetails: companySettings?.invoiceBankDetails,
      notes: invoice.notes || undefined
    }

    // Generate PDF
    const doc = generateInvoicePDF(pdfData, companySettings)
    const pdfBuffer = doc.output('arraybuffer')

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${pdfData.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Invoice PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
