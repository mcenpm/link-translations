import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        corporate: {
          select: {
            id: true,
            company: true,
            website: true,
            industry: true,
            billingAddress: true,
            billingCity: true,
            billingState: true,
            billingCountry: true,
          },
        },
        quotes: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            quoteNumber: true,
            status: true,
            sourceLanguage: true,
            targetLanguage: true,
            total: true,
            createdAt: true,
          },
        },
      },
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error fetching contact:', error)
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const body = await request.json()
    
    const contact = await prisma.contact.update({
      where: { id },
      data: body,
      include: {
        corporate: true,
      },
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    await prisma.contact.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
  }
}
