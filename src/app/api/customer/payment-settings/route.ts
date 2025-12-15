import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user and their corporate info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        corporate: true
      }
    })

    if (!user || !user.corporate) {
      return NextResponse.json({
        paymentCodeEnabled: false
      })
    }

    return NextResponse.json({
      paymentCodeEnabled: user.corporate.paymentCodeEnabled || false,
      company: user.corporate.company
    })

  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment settings' },
      { status: 500 }
    )
  }
}
