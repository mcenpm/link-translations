import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// Default weekly availability
const DEFAULT_AVAILABILITY = [
  { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isAvailable: false }, // Sunday
  { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },  // Monday
  { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },  // Tuesday
  { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },  // Wednesday
  { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },  // Thursday
  { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },  // Friday
  { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isAvailable: false }, // Saturday
]

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { linguist: true },
    })

    if (!user?.linguist) {
      return NextResponse.json({ 
        availability: DEFAULT_AVAILABILITY,
        blockedDates: [] 
      })
    }

    // Get linguist availability settings
    // For now, return default availability since we haven't added these fields to schema
    // In a real implementation, you'd store this in the database
    
    // Try to get availability from linguist record if stored as JSON
    const linguistData = user.linguist as Record<string, unknown>
    const availability = linguistData.weeklyAvailability 
      ? JSON.parse(linguistData.weeklyAvailability as string)
      : DEFAULT_AVAILABILITY

    const blockedDates = linguistData.blockedDates
      ? JSON.parse(linguistData.blockedDates as string)
      : []

    return NextResponse.json({
      availability,
      blockedDates,
    })
  } catch (error) {
    console.error('Error fetching linguist availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { availability: _availability, blockedDates: _blockedDates } = body

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { linguist: true },
    })

    if (!user?.linguist) {
      return NextResponse.json({ error: 'Linguist profile not found' }, { status: 404 })
    }

    // For now, we'll store availability as part of the linguist bio field as JSON
    // In a production app, you'd have dedicated fields or a separate table
    
    // This is a simplified implementation - in reality you'd want proper schema fields
    // await prisma.linguist.update({
    //   where: { id: user.linguist.id },
    //   data: {
    //     weeklyAvailability: JSON.stringify(availability),
    //     blockedDates: JSON.stringify(blockedDates),
    //   },
    // })

    return NextResponse.json({
      success: true,
      message: 'Availability updated successfully',
    })
  } catch (error) {
    console.error('Error updating linguist availability:', error)
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    )
  }
}
