import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { generateQuotePDF } from '@/lib/utils/pdf'

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
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    // Fetch quote and company settings in parallel
    const [quote, companySettings] = await Promise.all([
      prisma.quote.findUnique({
        where: { id },
        include: {
          corporate: {
            include: {
              user: true
            }
          },
          contact: true,
          srcLanguage: true,
          tgtLanguage: true,
          languagePair: true,
        }
      }),
      getCompanySettings()
    ])

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Check authorization - admin or quote owner
    if (session?.user?.role !== 'ADMIN' && quote.corporate?.userId !== session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Format quote data for PDF
    const customerName = quote.contact 
      ? `${quote.contact.firstName || ''} ${quote.contact.lastName || ''}`.trim() 
      : quote.billingContactName || 'Customer'
    
    const validDate = new Date(quote.createdAt)
    validDate.setDate(validDate.getDate() + 30)
    
    const pdfData = {
      quoteNumber: quote.quoteNumber || `QT-${quote.id.substring(0, 8).toUpperCase()}`,
      createdAt: new Date(quote.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      validUntil: validDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      customer: {
        name: customerName,
        email: quote.contactPersonEmail || quote.contact?.email || '',
        company: quote.corporate?.company,
        address: quote.corporate?.billingAddress 
          ? `${quote.corporate.billingAddress}, ${quote.corporate.billingCity || ''} ${quote.corporate.billingState || ''} ${quote.corporate.billingZip || ''}`
          : undefined
      },
      items: [{
        description: quote.description || 'Translation Service',
        sourceLanguage: quote.srcLanguage?.name || quote.sourceLanguage?.[0] || 'English',
        targetLanguage: quote.tgtLanguage?.name || quote.targetLanguage?.[0] || 'Spanish',
        serviceType: quote.serviceType || 'Translation',
        quantity: quote.wordCount || 1,
        unit: quote.serviceType === 'interpretation' ? 'hours' : 'words',
        unitPrice: quote.languagePair?.ratePerWord || (quote.total ? quote.total / (quote.wordCount || 1) : 0.12),
        total: quote.totalPrice || quote.total || 0
      }],
      subtotal: quote.subtotal || quote.totalPrice || quote.total || 0,
      tax: quote.tax || 0,
      discount: 0,
      total: quote.totalPrice || quote.total || 0,
      notes: quote.notes || 'Thank you for choosing Link Translations. This quote is valid for 30 days from the date of issue.'
    }

    // Generate PDF with company settings
    const doc = generateQuotePDF(pdfData, companySettings)
    const pdfBuffer = doc.output('arraybuffer')

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Quote-${pdfData.quoteNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Quote PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
