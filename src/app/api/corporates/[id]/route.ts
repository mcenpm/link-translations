import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const corporate = await prisma.customer.findUnique({
      where: { id },
      include: {
        contacts: {
          orderBy: [
            { isPrimary: 'desc' },
            { firstName: 'asc' }
          ]
        },
        quotes: {
          select: {
            id: true,
            quoteNumber: true,
            sourceLanguage: true,
            targetLanguage: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        projects: {
          select: {
            id: true,
            projectNumber: true,
            name: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    })

    if (!corporate) {
      return NextResponse.json(
        { error: 'Corporate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(corporate)
  } catch (error) {
    console.error('Error fetching corporate:', error)
    return NextResponse.json(
      { error: 'Failed to fetch corporate' },
      { status: 500 }
    )
  }
}
