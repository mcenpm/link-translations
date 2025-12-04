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
      recentCustomers,
      languageStats
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.linguist.count(),
      prisma.quote.count({ where: { status: 'SUBMITTED' } }),
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
      prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } }
        }
      }),
      prisma.languagePair.findMany({
        include: {
          sourceLanguage: true,
          targetLanguage: true,
          _count: { select: { quotes: true } }
        },
        orderBy: { quotes: { _count: 'desc' } },
        take: 5
      })
    ])

    // Calculate total revenue from completed quotes
    const completedQuotes = await prisma.quote.findMany({
      where: { status: 'COMPLETED' },
      select: { total: true }
    })
    const totalRevenue = completedQuotes.reduce((sum, q) => sum + (q.total || 0), 0)

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
        recentQuotes,
        recentCustomers,
        languageStats
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
