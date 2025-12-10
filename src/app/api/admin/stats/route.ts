import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get counts
    const [
      totalCustomers,
      totalLinguists,
      pendingQuotes,
      totalQuotes,
      recentQuotes,
      activeLinguists
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.linguist.count(),
      prisma.quote.count({ where: { status: 'REVIEWING' } }),
      prisma.quote.count(),
      prisma.quote.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } }
            }
          },
          languagePair: {
            include: {
              sourceLanguage: true,
              targetLanguage: true
            }
          }
        }
      }),
      prisma.linguist.count({ where: { isActive: true } })
    ])

    // Calculate total revenue from paid AND unpaid invoices
    const revenueResult = await prisma.quote.aggregate({
      where: { status: { in: ['INVOICE_PAID', 'INVOICE_NOT_PAID'] } },
      _sum: { total: true }
    })
    const totalRevenue = revenueResult._sum.total || 0

    // Get quotes this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const quotesThisMonth = await prisma.quote.count({
      where: { createdAt: { gte: startOfMonth } }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        totalLinguists,
        pendingQuotes,
        totalQuotes,
        totalRevenue,
        quotesThisMonth,
        activeLinguists,
        recentQuotes
      }
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
