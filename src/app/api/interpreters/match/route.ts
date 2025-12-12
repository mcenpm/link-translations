import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

interface MatchRequest {
  latitude: number
  longitude: number
  sourceLanguageId: string
  targetLanguageId: string
  maxDistance?: number // default 50 miles
  eventDate?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: MatchRequest = await request.json()
    const {
      latitude,
      longitude,
      sourceLanguageId,
      targetLanguageId,
      maxDistance = 50
    } = body

    // Validate required fields
    if (!latitude || !longitude || !sourceLanguageId || !targetLanguageId) {
      return NextResponse.json(
        { error: 'Missing required fields: latitude, longitude, sourceLanguageId, targetLanguageId' },
        { status: 400 }
      )
    }

    // Find linguists who:
    // 1. Are available for on-site interpretation
    // 2. Have geo coordinates set
    // 3. Have BOTH required languages for interpretation
    const linguists = await prisma.linguist.findMany({
      where: {
        availableForOnSite: true,
        latitude: { not: null },
        longitude: { not: null },
        // Check if they have BOTH languages for interpretation
        AND: [
          {
            linguistLanguages: {
              some: {
                languageId: sourceLanguageId,
                discipline: { in: ['INTERPRETATION', 'BOTH'] }
              }
            }
          },
          {
            linguistLanguages: {
              some: {
                languageId: targetLanguageId,
                discipline: { in: ['INTERPRETATION', 'BOTH'] }
              }
            }
          }
        ]
      },
      include: {
        linguistLanguages: {
          include: {
            language: true
          }
        }
      }
    })

    // Filter by distance and sort by closest
    const matchedLinguists = linguists
      .map((linguist) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          linguist.latitude!,
          linguist.longitude!
        )
        
        // Check if within linguist's max travel distance AND requested max distance
        const linguistMaxTravel = linguist.maxTravelDistance || 50
        const withinRange = distance <= Math.min(maxDistance, linguistMaxTravel)

        return {
          ...linguist,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          withinRange
        }
      })
      .filter((linguist) => linguist.withinRange)
      .sort((a, b) => a.distance - b.distance)

    // Return matched interpreters with relevant info
    const results = matchedLinguists.map((linguist) => ({
      id: linguist.id,
      name: `${linguist.firstName} ${linguist.lastName}`,
      email: linguist.email,
      phone: linguist.phone,
      distance: linguist.distance,
      hourlyRate: linguist.hourlyRate,
      maxTravelDistance: linguist.maxTravelDistance,
      languages: linguist.linguistLanguages.map((ll) => ({
        name: ll.language.name,
        level: ll.level,
        discipline: ll.discipline
      })),
      city: linguist.city,
      state: linguist.state
    }))

    return NextResponse.json({
      success: true,
      count: results.length,
      maxDistanceUsed: maxDistance,
      interpreters: results
    })
  } catch (error) {
    console.error('Error matching interpreters:', error)
    return NextResponse.json(
      { error: 'Failed to match interpreters' },
      { status: 500 }
    )
  }
}

// GET endpoint for testing / simple queries
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const srcLang = searchParams.get('sourceLanguageId')
  const tgtLang = searchParams.get('targetLanguageId')
  const maxDist = searchParams.get('maxDistance')

  if (!lat || !lng || !srcLang || !tgtLang) {
    return NextResponse.json(
      { error: 'Missing required query params: lat, lng, sourceLanguageId, targetLanguageId' },
      { status: 400 }
    )
  }

  // Forward to POST handler
  const mockRequest = {
    json: async () => ({
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      sourceLanguageId: srcLang,
      targetLanguageId: tgtLang,
      maxDistance: maxDist ? parseInt(maxDist) : 50
    })
  } as NextRequest

  return POST(mockRequest)
}
