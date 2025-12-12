import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find the job invitation
    const invitation = await prisma.jobInvitation.findUnique({
      where: { token },
      include: {
        project: {
          include: {
            srcLanguage: true,
            tgtLanguage: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      )
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: 'expired', message: 'This invitation has expired' },
        { status: 410 }
      )
    }

    // Check if already responded
    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { 
          error: 'already_responded', 
          currentStatus: invitation.status,
          message: `You have already ${invitation.status.toLowerCase()} this job`
        },
        { status: 409 }
      )
    }

    return NextResponse.json({
      success: true,
      job: {
        id: invitation.id,
        eventDate: invitation.eventDate.toLocaleDateString(),
        eventTime: invitation.eventTime,
        eventDuration: invitation.eventDuration,
        eventLocation: invitation.eventLocation,
        eventDescription: invitation.eventDescription,
        sourceLanguage: invitation.project.srcLanguage?.name,
        targetLanguage: invitation.project.tgtLanguage?.name,
        distance: invitation.distance
      }
    })
  } catch (error) {
    console.error('Error fetching job details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job details' },
      { status: 500 }
    )
  }
}
