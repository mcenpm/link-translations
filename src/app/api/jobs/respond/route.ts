import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { token, action, declineReason } = await request.json()

    if (!token || !action) {
      return NextResponse.json(
        { error: 'Token and action are required' },
        { status: 400 }
      )
    }

    if (action !== 'accept' && action !== 'decline') {
      return NextResponse.json(
        { error: 'Action must be accept or decline' },
        { status: 400 }
      )
    }

    // Find the job invitation with project data
    const invitationData = await prisma.jobInvitation.findUnique({
      where: { token },
      include: {
        project: {
          include: {
            srcLanguage: true,
            tgtLanguage: true,
            corporate: true,
            contact: true
          }
        }
      }
    })

    if (!invitationData) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      )
    }

    // Extract project for easier access
    const invitation = invitationData
    const project = invitationData.project

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

    // Get linguist info
    const linguist = await prisma.linguist.findUnique({
      where: { id: invitation.linguistId }
    })

    if (!linguist) {
      return NextResponse.json(
        { error: 'Linguist not found' },
        { status: 404 }
      )
    }

    if (action === 'accept') {
      // Update invitation status
      await prisma.jobInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date()
        }
      })

      // Update project status
      await prisma.project.update({
        where: { id: invitation.projectId },
        data: {
          status: 'INTERPRETER_ASSIGNED'
        }
      })

      // Decline all other pending invitations for this project
      await prisma.jobInvitation.updateMany({
        where: {
          projectId: invitation.projectId,
          id: { not: invitation.id },
          status: 'PENDING'
        },
        data: {
          status: 'EXPIRED'
        }
      })

      // Send confirmation email to linguist
      await sendEmail({
        to: linguist.email,
        subject: `Job Confirmed: ${project.srcLanguage?.name} ↔ ${project.tgtLanguage?.name}`,
        html: `
          <h2>Job Confirmed!</h2>
          <p>Hi ${linguist.firstName},</p>
          <p>Thank you for accepting the interpretation job. Here are the details:</p>
          <ul>
            <li><strong>Date:</strong> ${invitation.eventDate.toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${invitation.eventTime}</li>
            <li><strong>Duration:</strong> ${invitation.eventDuration} hours</li>
            <li><strong>Location:</strong> ${invitation.eventLocation}</li>
            <li><strong>Languages:</strong> ${project.srcLanguage?.name} ↔ ${project.tgtLanguage?.name}</li>
          </ul>
          <p>We will send you more details shortly.</p>
          <p>Thank you,<br/>Link Translations Team</p>
        `
      })

      // Notify admin
      await sendEmail({
        to: 'admin@linktranslations.com',
        subject: `Interpreter Assigned - Project ${project.projectNumber}`,
        html: `
          <h2>Interpreter Assigned</h2>
          <p>An interpreter has accepted a job:</p>
          <ul>
            <li><strong>Interpreter:</strong> ${linguist.firstName} ${linguist.lastName} (${linguist.email})</li>
            <li><strong>Project:</strong> ${project.projectNumber}</li>
            <li><strong>Event Date:</strong> ${invitation.eventDate.toLocaleDateString()}</li>
            <li><strong>Location:</strong> ${invitation.eventLocation}</li>
          </ul>
        `
      })

      return NextResponse.json({
        success: true,
        status: 'ACCEPTED',
        message: 'Job accepted successfully',
        job: {
          id: invitation.id,
          eventDate: invitation.eventDate.toLocaleDateString(),
          eventTime: invitation.eventTime,
          eventDuration: invitation.eventDuration,
          eventLocation: invitation.eventLocation,
          eventDescription: invitation.eventDescription,
          sourceLanguage: project.srcLanguage?.name,
          targetLanguage: project.tgtLanguage?.name,
          distance: invitation.distance
        }
      })
    } else {
      // Decline
      await prisma.jobInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'DECLINED',
          respondedAt: new Date(),
          declineReason
        }
      })

      // Check if all invitations are declined/expired
      const pendingInvitations = await prisma.jobInvitation.count({
        where: {
          projectId: invitation.projectId,
          status: 'PENDING'
        }
      })

      if (pendingInvitations === 0) {
        // Notify admin that all interpreters declined
        await sendEmail({
          to: 'admin@linktranslations.com',
          subject: `⚠️ All Interpreters Declined - Project ${project.projectNumber}`,
          html: `
            <h2>All Interpreters Declined</h2>
            <p>All invited interpreters have declined or their invitations have expired for this project:</p>
            <ul>
              <li><strong>Project:</strong> ${project.projectNumber}</li>
              <li><strong>Event Date:</strong> ${invitation.eventDate.toLocaleDateString()}</li>
              <li><strong>Location:</strong> ${invitation.eventLocation}</li>
            </ul>
            <p>Please take action to find an interpreter.</p>
          `
        })
      }

      return NextResponse.json({
        success: true,
        status: 'DECLINED',
        message: 'Job declined successfully',
        job: {
          id: invitation.id,
          eventDate: invitation.eventDate.toLocaleDateString(),
          eventTime: invitation.eventTime,
          eventDuration: invitation.eventDuration,
          eventLocation: invitation.eventLocation,
          eventDescription: invitation.eventDescription,
          sourceLanguage: project.srcLanguage?.name,
          targetLanguage: project.tgtLanguage?.name,
          distance: invitation.distance
        }
      })
    }
  } catch (error) {
    console.error('Error responding to job:', error)
    return NextResponse.json(
      { error: 'Failed to process response' },
      { status: 500 }
    )
  }
}
