import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get counts
    const [
      totalContacts,
      totalLinguists,
      pendingQuotes,
      totalQuotes,
      recentQuotes,
      recentContacts,
      languageStats
    ] = await Promise.all([
      prisma.customerContact.count(),
      prisma.linguist.count(),
      prisma.quote.count({ where: { status: 'QUOTE_SENT' } }),
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
      prisma.customerContact.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
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

    // Calculate total revenue from paid quotes
    const completedQuotes = await prisma.quote.findMany({
      where: { status: 'INVOICE_PAID' },
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
        totalCustomers: totalContacts,
        totalLinguists,
        pendingQuotes,
        totalQuotes,
        totalRevenue,
        quotesThisMonth,
        recentQuotes,
        recentCustomers: recentContacts,
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
