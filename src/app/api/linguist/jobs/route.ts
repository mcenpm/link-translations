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
    // Get linguist record
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { linguist: true },
    })

    if (!user?.linguist) {
      return NextResponse.json({ jobs: [] })
    }

    // Get job invitations
    const invitations = await prisma.jobInvitation.findMany({
      where: {
        linguistId: user.linguist.id,
      },
      include: {
        project: {
          include: {
            srcLanguage: true,
            tgtLanguage: true,
          },
        },
      },
      orderBy: {
        eventDate: 'desc',
      },
    })

    // Get assignments (accepted jobs)
    const assignments = await prisma.assignment.findMany({
      where: {
        linguistId: user.linguist.id,
      },
      include: {
        order: {
          include: {
            quote: {
              include: {
                srcLanguage: true,
                tgtLanguage: true,
              },
            },
          },
        },
        quote: {
          include: {
            srcLanguage: true,
            tgtLanguage: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Format jobs for response
    const jobs = [
      ...invitations.map(inv => ({
        id: inv.id,
        status: inv.status,
        eventDate: inv.eventDate?.toISOString() || '',
        eventTime: inv.eventTime || '',
        eventDuration: inv.eventDuration || 0,
        eventLocation: inv.eventLocation || '',
        eventType: 'ON_SITE',
        hourlyRate: 0, // Not stored in JobInvitation
        totalAmount: 0,
        distance: inv.distance,
        project: {
          projectNumber: inv.project?.projectNumber || '',
          sourceLanguage: inv.project?.srcLanguage,
          targetLanguage: inv.project?.tgtLanguage,
        },
      })),
      ...assignments.map(asn => {
        const quote = asn.quote || asn.order?.quote
        return {
          id: asn.id,
          status: asn.status,
          eventDate: quote?.assignmentDate?.toISOString() || asn.assignedAt.toISOString(),
          eventTime: quote?.assignmentTime || '',
          eventDuration: parseFloat(quote?.estimatedDuration || '0') || 0,
          eventLocation: quote?.onSiteContact || '',
          eventType: quote?.serviceType || 'TRANSLATION',
          hourlyRate: quote?.ratePerUnit || 0,
          totalAmount: quote?.totalPrice || quote?.total || 0,
          distance: null,
          project: {
            projectNumber: asn.order?.orderNumber || '',
            sourceLanguage: quote?.srcLanguage,
            targetLanguage: quote?.tgtLanguage,
          },
        }
      }),
    ]

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Error fetching linguist jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}
