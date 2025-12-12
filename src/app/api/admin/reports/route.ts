import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'month'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3))
        previousStartDate = new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        previousStartDate = new Date(startDate.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default: // month
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Current period data
    const [
      currentRevenue,
      currentQuotes,
      currentProjects,
      currentCustomers,
      previousRevenue,
      previousQuotes,
      previousProjects,
      previousCustomers,
      quotesByStatus,
      recentQuotes
    ] = await Promise.all([
      // Current period revenue
      prisma.quote.aggregate({
        where: {
          paymentStatus: 'paid',
          paidAt: { gte: startDate }
        },
        _sum: { totalPrice: true }
      }),
      // Current period quotes
      prisma.quote.count({
        where: { createdAt: { gte: startDate } }
      }),
      // Current period projects
      prisma.project.count({
        where: { createdAt: { gte: startDate } }
      }),
      // Current period new customers
      prisma.corporate.count({
        where: { createdAt: { gte: startDate } }
      }),
      // Previous period revenue
      prisma.quote.aggregate({
        where: {
          paymentStatus: 'paid',
          paidAt: { gte: previousStartDate, lt: startDate }
        },
        _sum: { totalPrice: true }
      }),
      // Previous period quotes
      prisma.quote.count({
        where: { createdAt: { gte: previousStartDate, lt: startDate } }
      }),
      // Previous period projects
      prisma.project.count({
        where: { createdAt: { gte: previousStartDate, lt: startDate } }
      }),
      // Previous period new customers
      prisma.corporate.count({
        where: { createdAt: { gte: previousStartDate, lt: startDate } }
      }),
      // Quotes by status
      prisma.quote.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate } },
        _count: true
      }),
      // Recent quotes for language stats
      prisma.quote.findMany({
        where: { createdAt: { gte: startDate } },
        include: {
          srcLanguage: true,
          tgtLanguage: true
        },
        take: 500
      })
    ])

    // Calculate percentage changes
    function calcChange(current: number, previous: number): number {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100 * 10) / 10
    }

    const totalRevenue = currentRevenue._sum.totalPrice || 0
    const prevRevenue = previousRevenue._sum.totalPrice || 0

    // Build language stats
    const languageCounts: { [key: string]: number } = {}
    recentQuotes.forEach(quote => {
      if (quote.srcLanguage?.name) {
        languageCounts[quote.srcLanguage.name] = (languageCounts[quote.srcLanguage.name] || 0) + 1
      }
      if (quote.tgtLanguage?.name) {
        languageCounts[quote.tgtLanguage.name] = (languageCounts[quote.tgtLanguage.name] || 0) + 1
      }
    })

    const topLanguages = Object.entries(languageCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Build monthly revenue data (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const revenueByMonth = []
    const currentMonth = new Date().getMonth()
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const year = currentMonth - i < 0 ? new Date().getFullYear() - 1 : new Date().getFullYear()
      const monthStart = new Date(year, monthIndex, 1)
      const monthEnd = new Date(year, monthIndex + 1, 0)
      
      const monthRevenue = await prisma.quote.aggregate({
        where: {
          paymentStatus: 'paid',
          paidAt: { gte: monthStart, lte: monthEnd }
        },
        _sum: { totalPrice: true }
      })
      
      revenueByMonth.push({
        month: monthNames[monthIndex],
        revenue: monthRevenue._sum.totalPrice || 0
      })
    }

    // Status mapping
    const statusMap: { [key: string]: string } = {
      ACCEPTED: 'Accepted',
      DRAFT: 'Draft',
      PENDING: 'Pending',
      SENT: 'Sent',
      EXPIRED: 'Expired',
      REJECTED: 'Declined',
      COMPLETED: 'Completed'
    }

    const formattedQuotesByStatus = quotesByStatus.map(s => ({
      status: statusMap[s.status] || s.status,
      count: s._count
    })).sort((a, b) => b.count - a.count).slice(0, 4)

    // Get recent activity
    const [recentQuoteActivity, recentProjectActivity] = await Promise.all([
      prisma.quote.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { quoteNumber: true, createdAt: true, paymentStatus: true }
      }),
      prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { projectNumber: true, createdAt: true, status: true }
      })
    ])

    const recentActivity = [
      ...recentQuoteActivity.map(q => ({
        type: q.paymentStatus === 'paid' ? 'payment' : 'quote',
        description: q.paymentStatus === 'paid' 
          ? `Payment received for #${q.quoteNumber}`
          : `New quote #${q.quoteNumber} created`,
        date: formatTimeAgo(q.createdAt)
      })),
      ...recentProjectActivity.map(p => ({
        type: 'project',
        description: p.status === 'COMPLETED'
          ? `Project #${p.projectNumber} completed`
          : `Project #${p.projectNumber} started`,
        date: formatTimeAgo(p.createdAt)
      }))
    ].slice(0, 5)

    return NextResponse.json({
      overview: {
        totalRevenue,
        revenueChange: calcChange(totalRevenue, prevRevenue),
        totalQuotes: currentQuotes,
        quotesChange: calcChange(currentQuotes, previousQuotes),
        totalProjects: currentProjects,
        projectsChange: calcChange(currentProjects, previousProjects),
        newCustomers: currentCustomers,
        customersChange: calcChange(currentCustomers, previousCustomers)
      },
      revenueByMonth,
      quotesByStatus: formattedQuotesByStatus,
      topLanguages,
      recentActivity
    })
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    )
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}
