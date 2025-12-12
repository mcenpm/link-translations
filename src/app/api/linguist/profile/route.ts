import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const linguist = await prisma.linguist.findFirst({
      where: { email: session.user.email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        latitude: true,
        longitude: true,
        hourlyRate: true,
        availableForOnSite: true,
        maxTravelDistance: true
      }
    })

    if (!linguist) {
      return NextResponse.json({ error: 'Linguist not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      profile: linguist
    })
  } catch (error) {
    console.error('Error fetching linguist profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Find the linguist first
    const existingLinguist = await prisma.linguist.findFirst({
      where: { email: session.user.email }
    })

    if (!existingLinguist) {
      return NextResponse.json({ error: 'Linguist not found' }, { status: 404 })
    }

    // Update the linguist profile
    const updated = await prisma.linguist.update({
      where: { id: existingLinguist.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        latitude: body.latitude,
        longitude: body.longitude,
        hourlyRate: body.hourlyRate,
        availableForOnSite: body.availableForOnSite,
        maxTravelDistance: body.maxTravelDistance
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        latitude: true,
        longitude: true,
        hourlyRate: true,
        availableForOnSite: true,
        maxTravelDistance: true
      }
    })

    return NextResponse.json({
      success: true,
      profile: updated
    })
  } catch (error) {
    console.error('Error updating linguist profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
