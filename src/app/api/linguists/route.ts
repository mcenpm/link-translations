import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const state = searchParams.get('state') || undefined
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 1000)

    const skip = (page - 1) * limit

    const where: any = {}

    if (state) where.state = state
    
    // Add search functionality
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [linguists, total] = await Promise.all([
      prisma.linguist.findMany({
        where,
        select: {
          id: true,
          linguistNumber: true,
          crmId: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          city: true,
          state: true,
          country: true,
          nativeLanguage: true,
          languages: true,
          specializations: true,
          ratePerWord: true,
          minimumCharge: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy: { linguistNumber: 'asc' },
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
