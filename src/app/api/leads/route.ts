import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.LeadWhereInput = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { phoneMobile: { contains: search, mode: 'insensitive' } },
        { phoneWork: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status as Prisma.EnumLeadStatusFilter['equals']
    }

    // Get total count
    const total = await prisma.lead.count({ where })

    // Get leads
    const leads = await prisma.lead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        leadNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        phoneMobile: true,
        phoneWork: true,
        company: true,
        title: true,
        addressCity: true,
        addressState: true,
        source: true,
        status: true,
        isConverted: true,
        createdAt: true,
        discipline: true,
        sourceLanguage: true,
        targetLanguage: true,
        leadRanking: true,
      }
    })

    return NextResponse.json({
      leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}
