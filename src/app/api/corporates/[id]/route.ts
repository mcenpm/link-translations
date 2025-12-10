import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const corporate = await prisma.corporate.findUnique({
      where: { id },
      include: {
        contacts: {
          orderBy: [
            { isPrimary: 'desc' },
            { firstName: 'asc' }
          ]
        },
        quotes: {
          select: {
            id: true,
            quoteNumber: true,
            sourceLanguage: true,
            targetLanguage: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        projects: {
          select: {
            id: true,
            projectNumber: true,
            name: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    })

    if (!corporate) {
      return NextResponse.json(
        { error: 'Corporate not found' },
        { status: 404 }
      )
    }

    // Calculate aggregate stats
    const quoteStats = await prisma.quote.aggregate({
      where: { customerId: id },
      _sum: { total: true },
      _count: true
    })

    const paidQuotes = await prisma.quote.aggregate({
      where: { 
        customerId: id,
        status: 'INVOICE_PAID'
      },
      _sum: { total: true },
      _count: true
    })

    return NextResponse.json({
      ...corporate,
      stats: {
        totalQuotes: quoteStats._count,
        totalValue: quoteStats._sum.total || 0,
        paidQuotes: paidQuotes._count,
        paidValue: paidQuotes._sum.total || 0
      }
    })
  } catch (error) {
    console.error('Error fetching corporate:', error)
    return NextResponse.json(
      { error: 'Failed to fetch corporate' },
      { status: 500 }
    )
  }
}
