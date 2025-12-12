import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { generatePurchaseOrderPDF } from '@/lib/utils/pdf'

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
    
    // Only admins can generate POs
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    
    // Fetch purchase order with related data
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        linguist: true,
        project: {
          include: {
            srcLanguage: true,
            tgtLanguage: true,
          }
        },
      }
    })

    if (!purchaseOrder) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }

    // Get company settings
    const companySettings = await getCompanySettings()
    
    // Get linguist info
    const linguistName = purchaseOrder.linguist 
      ? `${purchaseOrder.linguist.firstName || ''} ${purchaseOrder.linguist.lastName || ''}`.trim()
      : 'Linguist'
    
    const linguistEmail = purchaseOrder.linguist?.email || ''
    const linguistAddress = purchaseOrder.linguist?.city && purchaseOrder.linguist?.state
      ? `${purchaseOrder.linguist.city}, ${purchaseOrder.linguist.state} ${purchaseOrder.linguist.country || ''}`
      : undefined

    // Calculate due date (default 30 days from PO date)
    const dueDate = new Date(purchaseOrder.createdAt)
    dueDate.setDate(dueDate.getDate() + 30)

    // Format PO data for PDF
    const pdfData = {
      poNumber: purchaseOrder.poNumber || `PO-${purchaseOrder.id.substring(0, 8).toUpperCase()}`,
      poDate: new Date(purchaseOrder.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      dueDate: dueDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      vendor: {
        name: linguistName,
        email: linguistEmail,
        address: linguistAddress
      },
      project: purchaseOrder.project ? {
        projectNumber: purchaseOrder.project.projectNumber || '',
        description: purchaseOrder.project.description || ''
      } : undefined,
      items: [{
        description: purchaseOrder.description || 'Translation/Interpretation Service',
        sourceLanguage: purchaseOrder.project?.srcLanguage?.name,
        targetLanguage: purchaseOrder.project?.tgtLanguage?.name,
        quantity: purchaseOrder.quantity || 1,
        unit: purchaseOrder.unit || 'words',
        rate: purchaseOrder.rate || 0,
        total: purchaseOrder.total || 0
      }],
      subtotal: purchaseOrder.total || 0,
      total: purchaseOrder.total || 0,
      notes: purchaseOrder.notes || undefined,
      termsAndConditions: companySettings?.pdfTermsAndConditions
    }

    // Generate PDF
    const doc = generatePurchaseOrderPDF(pdfData, companySettings)
    const pdfBuffer = doc.output('arraybuffer')

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="PO-${pdfData.poNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Purchase Order PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
