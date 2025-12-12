import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Get the user and their corporate/customer record
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        corporate: true,
      },
    })

    if (!user?.corporate) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get the project and verify ownership
    const project = await prisma.project.findFirst({
      where: {
        id,
        customerId: user.corporate.id,
      },
      include: {
        quote: {
          include: {
            srcLanguage: true,
            tgtLanguage: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}
