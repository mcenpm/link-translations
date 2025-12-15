import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    let linguist = null
    
    // Try to find by linguistNumber first (if numeric)
    const numId = parseInt(id)
    if (!isNaN(numId)) {
      linguist = await prisma.linguist.findUnique({
        where: { linguistNumber: numId },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          linguistLanguages: {
            include: {
              language: true,
            },
          },
          assignments: {
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
              quote: {
                select: {
                  quoteNumber: true,
                  sourceLanguage: true,
                  targetLanguage: true,
                },
              },
            },
          },
        },
      })
    }
    
    // If not found, try by crmId
    if (!linguist) {
      linguist = await prisma.linguist.findUnique({
        where: { crmId: id },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          linguistLanguages: {
            include: {
              language: true,
            },
          },
          assignments: {
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
              quote: {
                select: {
                  quoteNumber: true,
                  sourceLanguage: true,
                  targetLanguage: true,
                },
              },
            },
          },
        },
      })
    }
    
    // If still not found, try by id
    if (!linguist) {
      linguist = await prisma.linguist.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          linguistLanguages: {
            include: {
              language: true,
            },
          },
          assignments: {
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
              quote: {
                select: {
                  quoteNumber: true,
                  sourceLanguage: true,
                  targetLanguage: true,
                },
              },
            },
          },
        },
      })
    }

    if (!linguist) {
      return NextResponse.json({ error: 'Linguist not found' }, { status: 404 })
    }

    return NextResponse.json(linguist)
  } catch (error) {
    console.error('Error fetching linguist:', error)
    return NextResponse.json({ error: 'Failed to fetch linguist' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const body = await request.json()
    
    const linguist = await prisma.linguist.update({
      where: { id },
      data: body,
      include: {
        user: true,
        linguistLanguages: {
          include: {
            language: true,
          },
        },
      },
    })

    return NextResponse.json(linguist)
  } catch (error) {
    console.error('Error updating linguist:', error)
    return NextResponse.json({ error: 'Failed to update linguist' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    // Delete linguist (will cascade to user due to relation)
    await prisma.linguist.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting linguist:', error)
    return NextResponse.json({ error: 'Failed to delete linguist' }, { status: 500 })
  }
}
