import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { linguist: true },
    })

    if (!user?.linguist) {
      return NextResponse.json({ 
        earnings: [], 
        summary: {
          totalEarned: 0,
          pendingPayment: 0,
          thisMonth: 0,
          lastMonth: 0,
        }
      })
    }

    // Get all completed assignments with payment info
    const assignments = await prisma.assignment.findMany({
      where: {
        linguistId: user.linguist.id,
        status: { in: ['COMPLETED', 'IN_PROGRESS', 'ACCEPTED'] },
      },
      include: {
        order: {
          include: {
            quote: true,
          },
        },
        quote: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    // Get purchase orders for this linguist
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        linguistId: user.linguist.id,
      },
    })

    const poMap = new Map(purchaseOrders.map(po => [po.linguistId, po]))

    // Calculate summary
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    let totalEarned = 0
    let pendingPayment = 0
    let thisMonth = 0
    let lastMonth = 0

    const earnings = assignments.map(asn => {
      const quote = asn.quote || asn.order?.quote
      const totalAmount = quote?.totalPrice || quote?.total || 0
      const po = poMap.get(user.linguist!.id)
      const isPaid = po?.status === 'PAID'
      
      totalEarned += isPaid ? totalAmount : 0
      pendingPayment += !isPaid ? totalAmount : 0

      const eventDate = quote?.assignmentDate || asn.completedAt || asn.assignedAt
      if (eventDate) {
        if (eventDate >= thisMonthStart) {
          thisMonth += totalAmount
        } else if (eventDate >= lastMonthStart && eventDate <= lastMonthEnd) {
          lastMonth += totalAmount
        }
      }

      return {
        id: asn.id,
        projectNumber: asn.order?.orderNumber || '',
        eventDate: eventDate?.toISOString() || '',
        eventDuration: parseFloat(quote?.estimatedDuration || '0') || 0,
        hourlyRate: quote?.ratePerUnit || 0,
        totalAmount,
        status: isPaid ? 'PAID' : 'PENDING',
        paidDate: po?.paidAt?.toISOString() || null,
      }
    })

    return NextResponse.json({
      earnings,
      summary: {
        totalEarned,
        pendingPayment,
        thisMonth,
        lastMonth,
      },
    })
  } catch (error) {
    console.error('Error fetching linguist earnings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    )
  }
}
