import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        languagePair: {
          include: {
            sourceLanguage: true,
            targetLanguage: true,
          },
        },
        assignments: {
          include: {
            linguist: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            projectNumber: true,
            status: true,
          }
        },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Find linked CustomerContact by billingContactCrmId
    let billingContact = null
    if (quote.billingContactCrmId) {
      billingContact = await prisma.customerContact.findUnique({
        where: { legacyId: quote.billingContactCrmId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          customerId: true,
        }
      })
    }

    return NextResponse.json({ ...quote, billingContact })
  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const body = await request.json()
    
    // Get current quote to check status change
    const currentQuote = await prisma.quote.findUnique({
      where: { id },
      include: { project: true }
    })
    
    if (!currentQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }
    
    const quote = await prisma.quote.update({
      where: { id },
      data: body,
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        languagePair: {
          include: {
            sourceLanguage: true,
            targetLanguage: true,
          },
        },
      },
    })

    // If status changed to INVOICE_PAID or INVOICE_NOT_PAID, create a project automatically
    const invoiceStatuses = ['INVOICE_PAID', 'INVOICE_NOT_PAID']
    if (
      body.status && 
      invoiceStatuses.includes(body.status) && 
      !invoiceStatuses.includes(currentQuote.status) &&
      !currentQuote.project
    ) {
      // Generate project number
      const lastProject = await prisma.project.findFirst({
        orderBy: { projectNumber: 'desc' }
      })
      
      const projectNumber = lastProject 
        ? `PRJ-${(parseInt(lastProject.projectNumber.split('-')[1]) + 1).toString().padStart(6, '0')}`
        : 'PRJ-000001'

      await prisma.project.create({
        data: {
          projectNumber,
          quoteId: id,
          customerId: quote.customerId,
          name: `Project for ${quote.quoteNumber}`,
          status: 'IN_PROGRESS',
        }
      })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    await prisma.quote.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 })
  }
}
