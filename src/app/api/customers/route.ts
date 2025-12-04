import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const customers = await prisma.customer.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const total = await prisma.customer.count()

    return NextResponse.json({
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, companyName, website, taxId, billingAddress, shippingAddress } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    let userId: string

    if (existingUser) {
      userId = existingUser.id
    } else {
      // Create new user
      const user = await prisma.user.create({
        data: {
          email,
          firstName: firstName || '',
          role: 'CUSTOMER',
          password: '', // Will be set via reset link
        },
      })
      userId = user.id
    }

    // Create or update customer
    const customer = await prisma.customer.upsert({
      where: { userId },
      update: {
        company: companyName,
        website,
        taxId,
        billingAddress,
        shippingAddress,
      },
      create: {
        userId,
        company: companyName,
        website,
        taxId,
        billingAddress,
        shippingAddress,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
          },
        },
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}
