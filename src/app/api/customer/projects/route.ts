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
      return NextResponse.json({ projects: [] })
    }

    // Get projects for this customer
    const projects = await prisma.project.findMany({
      where: {
        customerId: user.corporate.id,
      },
      include: {
        quote: {
          select: {
            quoteNumber: true,
            serviceType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching customer projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
