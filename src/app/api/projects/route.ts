import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const status = searchParams.get('status')

    const where = status ? { status: status as 'IN_PROGRESS' | 'PAUSED' | 'REMOVED' | 'COMPLETED' } : {}

    const projects = await prisma.project.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            company: true,
          }
        },
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            total: true,
            status: true,
            sourceLanguage: true,
            targetLanguage: true,
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { quoteId, customerId, name, description, status, dueDate, notes, internalNotes } = body

    // Generate project number
    const lastProject = await prisma.project.findFirst({
      orderBy: { projectNumber: 'desc' }
    })
    
    const projectNumber = lastProject 
      ? `PRJ-${(parseInt(lastProject.projectNumber.split('-')[1]) + 1).toString().padStart(6, '0')}`
      : 'PRJ-000001'

    const project = await prisma.project.create({
      data: {
        projectNumber,
        quoteId,
        customerId,
        name: name || `Project for Quote ${quoteId}`,
        description,
        status: status || 'IN_PROGRESS',
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        internalNotes,
      },
      include: {
        customer: true,
        quote: true,
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
