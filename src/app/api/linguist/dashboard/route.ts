import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get linguist by email
    const linguist = await prisma.linguist.findFirst({
      where: { email: session.user.email }
    })

    if (!linguist) {
      return NextResponse.json({ error: 'Linguist not found' }, { status: 404 })
    }

    // Get pending job invitations
    const pendingInvitations = await prisma.jobInvitation.findMany({
      where: {
        linguistId: linguist.id,
        status: 'PENDING',
        expiresAt: { gt: new Date() }
      },
      include: {
        project: {
          select: {
            id: true,
            projectNumber: true,
            sourceLanguageId: true,
            targetLanguageId: true
          }
        }
      },
      orderBy: { eventDate: 'asc' }
    })

    // Get language names for invitations
    const languageIds = [
      ...new Set(
        pendingInvitations.flatMap(inv => [
          inv.project.sourceLanguageId,
          inv.project.targetLanguageId
        ]).filter(Boolean)
      )
    ] as string[]

    const languages = await prisma.language.findMany({
      where: { id: { in: languageIds } },
      select: { id: true, name: true }
    })

    const languageMap = new Map(languages.map(l => [l.id, l.name]))

    // Map invitations with language names
    const invitationsWithLanguages = pendingInvitations.map(inv => ({
      ...inv,
      project: {
        ...inv.project,
        sourceLanguage: inv.project.sourceLanguageId 
          ? { name: languageMap.get(inv.project.sourceLanguageId) } 
          : null,
        targetLanguage: inv.project.targetLanguageId 
          ? { name: languageMap.get(inv.project.targetLanguageId) } 
          : null
      }
    }))

    // Get upcoming accepted assignments
    const upcomingAssignments = await prisma.jobInvitation.findMany({
      where: {
        linguistId: linguist.id,
        status: 'ACCEPTED',
        eventDate: { gte: new Date() }
      },
      include: {
        project: {
          include: {
            corporate: {
              select: { company: true }
            }
          }
        }
      },
      orderBy: { eventDate: 'asc' },
      take: 10
    })

    // Get completed this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const completedThisMonth = await prisma.jobInvitation.count({
      where: {
        linguistId: linguist.id,
        status: 'ACCEPTED',
        eventDate: {
          gte: startOfMonth,
          lt: new Date()
        }
      }
    })

    // Calculate earnings (rough estimate based on hourlyRate * hours)
    const completedJobs = await prisma.jobInvitation.findMany({
      where: {
        linguistId: linguist.id,
        status: 'ACCEPTED',
        eventDate: {
          gte: startOfMonth,
          lt: new Date()
        }
      },
      select: { eventDuration: true }
    })

    const hourlyRate = linguist.hourlyRate || 50
    const totalEarnings = completedJobs.reduce(
      (sum, job) => sum + (job.eventDuration * hourlyRate),
      0
    )

    // Get assignment language details
    const assignmentLanguageIds = [
      ...new Set(
        upcomingAssignments.flatMap(a => [
          a.project.sourceLanguageId,
          a.project.targetLanguageId
        ]).filter(Boolean)
      )
    ] as string[]

    const assignmentLanguages = assignmentLanguageIds.length > 0 
      ? await prisma.language.findMany({
          where: { id: { in: assignmentLanguageIds } },
          select: { id: true, name: true }
        })
      : []

    const assignmentLangMap = new Map(assignmentLanguages.map(l => [l.id, l.name]))

    const formattedAssignments = upcomingAssignments.map(a => ({
      id: a.id,
      status: a.status,
      eventDate: a.eventDate.toISOString(),
      eventTime: a.eventTime,
      eventDuration: a.eventDuration,
      eventLocation: a.eventLocation,
      sourceLanguage: a.project.sourceLanguageId 
        ? assignmentLangMap.get(a.project.sourceLanguageId) || 'Unknown'
        : 'Unknown',
      targetLanguage: a.project.targetLanguageId 
        ? assignmentLangMap.get(a.project.targetLanguageId) || 'Unknown'
        : 'Unknown',
      customerName: a.project.corporate?.company || 'Unknown'
    }))

    return NextResponse.json({
      success: true,
      stats: {
        pendingJobs: pendingInvitations.length,
        upcomingAssignments: upcomingAssignments.length,
        completedThisMonth,
        totalEarnings: Math.round(totalEarnings)
      },
      pendingInvitations: invitationsWithLanguages,
      upcomingAssignments: formattedAssignments
    })
  } catch (error) {
    console.error('Error fetching linguist dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
