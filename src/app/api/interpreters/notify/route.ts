import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { interpreterJobAlertEmail } from '@/lib/email-templates'
import crypto from 'crypto'

// Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

interface NotifyRequest {
  projectId: string
  latitude: number
  longitude: number
  eventDate: string
  eventTime: string
  eventDuration: number // hours
  eventLocation: string
  eventDescription?: string
  maxDistance?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: NotifyRequest = await request.json()
    const {
      projectId,
      latitude,
      longitude,
      eventDate,
      eventTime,
      eventDuration,
      eventLocation,
      eventDescription,
      maxDistance = 50
    } = body

    // Get the project with customer info
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        corporate: true,
        contact: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (!project.sourceLanguageId || !project.targetLanguageId) {
      return NextResponse.json(
        { error: 'Project must have source and target languages' },
        { status: 400 }
      )
    }

    // Get language names
    const [sourceLanguage, targetLanguage] = await Promise.all([
      prisma.language.findUnique({ where: { id: project.sourceLanguageId } }),
      prisma.language.findUnique({ where: { id: project.targetLanguageId } })
    ])

    // Find matching interpreters
    // Linguists who have BOTH source and target languages in their profile
    const linguists = await prisma.linguist.findMany({
      where: {
        availableForOnSite: true,
        latitude: { not: null },
        longitude: { not: null },
        AND: [
          {
            linguistLanguages: {
              some: {
                languageId: project.sourceLanguageId,
                discipline: { in: ['INTERPRETATION', 'BOTH'] }
              }
            }
          },
          {
            linguistLanguages: {
              some: {
                languageId: project.targetLanguageId,
                discipline: { in: ['INTERPRETATION', 'BOTH'] }
              }
            }
          }
        ]
      },
      include: {
        linguistLanguages: {
          include: {
            language: true
          }
        }
      }
    })

    // Filter by distance
    const matchedLinguists = linguists
      .map((linguist) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          linguist.latitude!,
          linguist.longitude!
        )
        const linguistMaxTravel = linguist.maxTravelDistance || 50
        return {
          ...linguist,
          distance: Math.round(distance * 10) / 10,
          withinRange: distance <= Math.min(maxDistance, linguistMaxTravel)
        }
      })
      .filter((l) => l.withinRange)
      .sort((a, b) => a.distance - b.distance)

    if (matchedLinguists.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No interpreters found within range',
        count: 0
      })
    }

    // Create job invitations for each matched interpreter
    const invitations = []
    const emailResults = []

    for (const linguist of matchedLinguists) {
      // Generate unique token for accept/decline
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours

      // Create job invitation record
      const invitation = await prisma.jobInvitation.create({
        data: {
          projectId: project.id,
          linguistId: linguist.id,
          token,
          expiresAt,
          status: 'PENDING',
          eventDate: new Date(eventDate),
          eventTime,
          eventDuration,
          eventLocation,
          eventDescription,
          distance: linguist.distance
        }
      })

      invitations.push(invitation)

      // Send notification email
      const acceptUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/jobs/respond?token=${token}&action=accept`
      const declineUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/jobs/respond?token=${token}&action=decline`

      const { subject, html: emailHtml } = interpreterJobAlertEmail({
        linguistName: `${linguist.firstName} ${linguist.lastName}`,
        sourceLanguage: sourceLanguage?.name || 'Unknown',
        targetLanguage: targetLanguage?.name || 'Unknown',
        date: eventDate,
        time: eventTime,
        duration: `${eventDuration} hours`,
        setting: 'in-person',
        location: eventLocation,
        rate: linguist.hourlyRate || 50,
        acceptUrl,
        declineUrl
      })

      try {
        await sendEmail({
          to: linguist.email,
          subject,
          html: emailHtml
        })

        emailResults.push({
          linguistId: linguist.id,
          email: linguist.email,
          status: 'sent'
        })
      } catch (error) {
        console.error(`Failed to send email to ${linguist.email}:`, error)
        emailResults.push({
          linguistId: linguist.id,
          email: linguist.email,
          status: 'failed',
          error: String(error)
        })
      }
    }

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'SEEKING_INTERPRETER'
      }
    })

    return NextResponse.json({
      success: true,
      message: `Notified ${matchedLinguists.length} interpreters`,
      count: matchedLinguists.length,
      invitations: invitations.map((inv) => ({
        id: inv.id,
        linguistId: inv.linguistId,
        status: inv.status,
        expiresAt: inv.expiresAt
      })),
      emailResults
    })
  } catch (error) {
    console.error('Error notifying interpreters:', error)
    return NextResponse.json(
      { error: 'Failed to notify interpreters' },
      { status: 500 }
    )
  }
}
