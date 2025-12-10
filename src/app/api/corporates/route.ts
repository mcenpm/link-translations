import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 1000)
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { company: { contains: search, mode: 'insensitive' as const } },
        { billingCity: { contains: search, mode: 'insensitive' as const } },
        { billingCountry: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {}

    const [corporates, total] = await Promise.all([
      prisma.corporate.findMany({
        where,
        select: {
          id: true,
          customerNumber: true,
          company: true,
          website: true,
          industry: true,
          billingAddress: true,
          billingCity: true,
          billingState: true,
          billingZip: true,
          billingCountry: true,
          shippingAddress: true,
          shippingCity: true,
          shippingState: true,
          shippingZip: true,
          shippingCountry: true,
          paymentTerms: true,
          createdAt: true,
          _count: {
            select: {
              contacts: true,
              quotes: true,
              projects: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.corporate.count({ where }),
    ])

    return NextResponse.json({
      data: corporates,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching corporates:', error)
    return NextResponse.json({ error: 'Failed to fetch corporates' }, { status: 500 })
  }
}
