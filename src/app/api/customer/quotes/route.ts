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
    // Get the user and their corporate/customer record
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        corporate: true,
      },
    })

    if (!user?.corporate) {
      return NextResponse.json({ quotes: [] })
    }

    // Get quotes for this customer
    const quotes = await prisma.quote.findMany({
      where: {
        customerId: user.corporate.id,
      },
      include: {
        srcLanguage: true,
        tgtLanguage: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json({ quotes })
  } catch (error) {
    console.error('Error fetching customer quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
