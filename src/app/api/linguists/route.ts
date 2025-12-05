import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const state = searchParams.get('state') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 1000)

    const skip = (page - 1) * limit

    const where: any = {}

    if (state) where.state = state

    const [linguists, total] = await Promise.all([
      prisma.linguist.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          nativeLanguage: true,
          languages: true,
          specializations: true,
          ratePerWord: true,
          minimumCharge: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
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
    console.error('Error fetching linguists:', error)
    return NextResponse.json({ error: 'Failed to fetch linguists' }, { status: 500 })
  }
}
