import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

interface LinguistQueryParams {
  state?: string
  language?: string
  discipline?: string
  page?: number
  limit?: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const state = searchParams.get('state') || undefined
    const language = searchParams.get('language') || undefined
    const discipline = searchParams.get('discipline') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
      isVerified: true,
    }

    if (state) where.state = state
    if (discipline) {
      where.languages = {
        some: {
          discipline: discipline,
        },
      }
    }
    if (language) {
      where.languages = {
        some: {
          language: {
            code: language,
          },
        },
      }
    }

    const [linguists, total] = await Promise.all([
      prisma.linguist.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, phone: true }
          },
          languages: {
            include: {
              language: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.linguist.count({ where }),
    ])

    return NextResponse.json({
      data: linguists,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch linguists' }, { status: 500 })
  }
}
