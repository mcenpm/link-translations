import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { findMatchingLinguists, MatchingCriteria } from '@/lib/utils/geo-matching'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      sourceLanguageId,
      targetLanguageId,
      serviceType,
      state,
      city,
      latitude,
      longitude,
      maxDistance,
      requiredDate,
    } = body

    // Validate service type
    if (!serviceType || !['ON_SITE', 'VIDEO', 'PHONE'].includes(serviceType)) {
      return NextResponse.json(
        { error: 'Invalid service type. Must be ON_SITE, VIDEO, or PHONE' },
        { status: 400 }
      )
    }

    // For on-site, require location info
    if (serviceType === 'ON_SITE' && !state && !latitude) {
      return NextResponse.json(
        { error: 'Location (state or coordinates) required for on-site interpretation' },
        { status: 400 }
      )
    }

    const criteria: MatchingCriteria = {
      sourceLanguageId,
      targetLanguageId,
      serviceType,
      state,
      city,
      latitude,
      longitude,
      maxDistance: maxDistance || 50,
      requiredDate: requiredDate ? new Date(requiredDate) : undefined,
    }

    const matchedLinguists = await findMatchingLinguists(criteria)

    return NextResponse.json({
      success: true,
      count: matchedLinguists.length,
      linguists: matchedLinguists,
      criteria: {
        serviceType,
        state,
        city,
        maxDistance: maxDistance || 50,
      },
    })
  } catch (error) {
    console.error('Error finding matching linguists:', error)
    return NextResponse.json(
      { error: 'Failed to find matching linguists' },
      { status: 500 }
    )
  }
}

// GET endpoint for simple queries
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const serviceType = searchParams.get('serviceType') as 'ON_SITE' | 'VIDEO' | 'PHONE'
    const state = searchParams.get('state') || undefined
    const city = searchParams.get('city') || undefined
    const maxDistance = searchParams.get('maxDistance') 
      ? parseInt(searchParams.get('maxDistance')!) 
      : 50

    if (!serviceType || !['ON_SITE', 'VIDEO', 'PHONE'].includes(serviceType)) {
      return NextResponse.json(
        { error: 'Invalid service type. Must be ON_SITE, VIDEO, or PHONE' },
        { status: 400 }
      )
    }

    const criteria: MatchingCriteria = {
      serviceType,
      state,
      city,
      maxDistance,
    }

    const matchedLinguists = await findMatchingLinguists(criteria)

    return NextResponse.json({
      success: true,
      count: matchedLinguists.length,
      linguists: matchedLinguists,
    })
  } catch (error) {
    console.error('Error finding matching linguists:', error)
    return NextResponse.json(
      { error: 'Failed to find matching linguists' },
      { status: 500 }
    )
  }
}
