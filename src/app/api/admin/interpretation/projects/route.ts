import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get interpretation projects (serviceType = 'interpretation')
    const projects = await prisma.project.findMany({
      where: {
        serviceType: 'interpretation'
      },
      include: {
        corporate: {
          select: {
            company: true
          }
        },
        contact: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        jobInvitations: {
          include: {
            linguist: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get language names separately
    const languageIds = [
      ...new Set(
        projects
          .flatMap(p => [p.sourceLanguageId, p.targetLanguageId])
          .filter(Boolean)
      )
    ] as string[]

    const languages = await prisma.language.findMany({
      where: { id: { in: languageIds } },
      select: { id: true, name: true }
    })

    const languageMap = new Map(languages.map(l => [l.id, l.name]))

    // Map projects with language names
    const projectsWithLanguages = projects.map(project => ({
      ...project,
      sourceLanguage: project.sourceLanguageId ? { name: languageMap.get(project.sourceLanguageId) } : null,
      targetLanguage: project.targetLanguageId ? { name: languageMap.get(project.targetLanguageId) } : null,
      customer: project.corporate
    }))

    return NextResponse.json({
      success: true,
      projects: projectsWithLanguages
    })
  } catch (error) {
    console.error('Error fetching interpretation projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
