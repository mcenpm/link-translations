/**
 * Linguist Geo Matching Utilities
 * 
 * Provides geographic distance calculations and linguist matching
 * for interpretation jobs based on location.
 */

import { prisma } from '@/lib/prisma'

// Haversine formula to calculate distance between two points
export function calculateDistance(
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
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// US State coordinates (approximate center points)
export const STATE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'AL': { lat: 32.806671, lng: -86.791130 },
  'AK': { lat: 61.370716, lng: -152.404419 },
  'AZ': { lat: 33.729759, lng: -111.431221 },
  'AR': { lat: 34.969704, lng: -92.373123 },
  'CA': { lat: 36.116203, lng: -119.681564 },
  'CO': { lat: 39.059811, lng: -105.311104 },
  'CT': { lat: 41.597782, lng: -72.755371 },
  'DE': { lat: 39.318523, lng: -75.507141 },
  'FL': { lat: 27.766279, lng: -81.686783 },
  'GA': { lat: 33.040619, lng: -83.643074 },
  'HI': { lat: 21.094318, lng: -157.498337 },
  'ID': { lat: 44.240459, lng: -114.478828 },
  'IL': { lat: 40.349457, lng: -88.986137 },
  'IN': { lat: 39.849426, lng: -86.258278 },
  'IA': { lat: 42.011539, lng: -93.210526 },
  'KS': { lat: 38.526600, lng: -96.726486 },
  'KY': { lat: 37.668140, lng: -84.670067 },
  'LA': { lat: 31.169546, lng: -91.867805 },
  'ME': { lat: 44.693947, lng: -69.381927 },
  'MD': { lat: 39.063946, lng: -76.802101 },
  'MA': { lat: 42.230171, lng: -71.530106 },
  'MI': { lat: 43.326618, lng: -84.536095 },
  'MN': { lat: 45.694454, lng: -93.900192 },
  'MS': { lat: 32.741646, lng: -89.678696 },
  'MO': { lat: 38.456085, lng: -92.288368 },
  'MT': { lat: 46.921925, lng: -110.454353 },
  'NE': { lat: 41.125370, lng: -98.268082 },
  'NV': { lat: 38.313515, lng: -117.055374 },
  'NH': { lat: 43.452492, lng: -71.563896 },
  'NJ': { lat: 40.298904, lng: -74.521011 },
  'NM': { lat: 34.840515, lng: -106.248482 },
  'NY': { lat: 42.165726, lng: -74.948051 },
  'NC': { lat: 35.630066, lng: -79.806419 },
  'ND': { lat: 47.528912, lng: -99.784012 },
  'OH': { lat: 40.388783, lng: -82.764915 },
  'OK': { lat: 35.565342, lng: -96.928917 },
  'OR': { lat: 44.572021, lng: -122.070938 },
  'PA': { lat: 40.590752, lng: -77.209755 },
  'RI': { lat: 41.680893, lng: -71.511780 },
  'SC': { lat: 33.856892, lng: -80.945007 },
  'SD': { lat: 44.299782, lng: -99.438828 },
  'TN': { lat: 35.747845, lng: -86.692345 },
  'TX': { lat: 31.054487, lng: -97.563461 },
  'UT': { lat: 40.150032, lng: -111.862434 },
  'VT': { lat: 44.045876, lng: -72.710686 },
  'VA': { lat: 37.769337, lng: -78.169968 },
  'WA': { lat: 47.400902, lng: -121.490494 },
  'WV': { lat: 38.491226, lng: -80.954453 },
  'WI': { lat: 44.268543, lng: -89.616508 },
  'WY': { lat: 42.755966, lng: -107.302490 },
  'DC': { lat: 38.897438, lng: -77.026817 },
}

// Major city coordinates
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'Phoenix': { lat: 33.4484, lng: -112.0740 },
  'Philadelphia': { lat: 39.9526, lng: -75.1652 },
  'San Antonio': { lat: 29.4241, lng: -98.4936 },
  'San Diego': { lat: 32.7157, lng: -117.1611 },
  'Dallas': { lat: 32.7767, lng: -96.7970 },
  'San Jose': { lat: 37.3382, lng: -121.8863 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'Jacksonville': { lat: 30.3322, lng: -81.6557 },
  'Fort Worth': { lat: 32.7555, lng: -97.3308 },
  'Columbus': { lat: 39.9612, lng: -82.9988 },
  'Charlotte': { lat: 35.2271, lng: -80.8431 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'Indianapolis': { lat: 39.7684, lng: -86.1581 },
  'Seattle': { lat: 47.6062, lng: -122.3321 },
  'Denver': { lat: 39.7392, lng: -104.9903 },
  'Washington DC': { lat: 38.9072, lng: -77.0369 },
  'Boston': { lat: 42.3601, lng: -71.0589 },
  'Nashville': { lat: 36.1627, lng: -86.7816 },
  'Detroit': { lat: 42.3314, lng: -83.0458 },
  'Portland': { lat: 45.5152, lng: -122.6784 },
  'Las Vegas': { lat: 36.1699, lng: -115.1398 },
  'Memphis': { lat: 35.1495, lng: -90.0490 },
  'Louisville': { lat: 38.2527, lng: -85.7585 },
  'Baltimore': { lat: 39.2904, lng: -76.6122 },
  'Milwaukee': { lat: 43.0389, lng: -87.9065 },
  'Albuquerque': { lat: 35.0844, lng: -106.6504 },
  'Tucson': { lat: 32.2226, lng: -110.9747 },
  'Fresno': { lat: 36.7378, lng: -119.7871 },
  'Sacramento': { lat: 38.5816, lng: -121.4944 },
  'Atlanta': { lat: 33.7490, lng: -84.3880 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
  'Orlando': { lat: 28.5383, lng: -81.3792 },
  'Tampa': { lat: 27.9506, lng: -82.4572 },
  'Minneapolis': { lat: 44.9778, lng: -93.2650 },
  'New Orleans': { lat: 29.9511, lng: -90.0715 },
  'Cleveland': { lat: 41.4993, lng: -81.6944 },
  'Pittsburgh': { lat: 40.4406, lng: -79.9959 },
  'St. Louis': { lat: 38.6270, lng: -90.1994 },
  'Kansas City': { lat: 39.0997, lng: -94.5786 },
  'Salt Lake City': { lat: 40.7608, lng: -111.8910 },
  'Raleigh': { lat: 35.7796, lng: -78.6382 },
  'Cincinnati': { lat: 39.1031, lng: -84.5120 },
  'Honolulu': { lat: 21.3069, lng: -157.8583 },
  'Anchorage': { lat: 61.2181, lng: -149.9003 },
}

export interface MatchingCriteria {
  sourceLanguageId?: string
  targetLanguageId?: string
  serviceType: 'ON_SITE' | 'VIDEO' | 'PHONE'
  state?: string
  city?: string
  latitude?: number
  longitude?: number
  maxDistance?: number // in miles, default 50
  requiredDate?: Date
}

export interface MatchedLinguist {
  id: string
  linguistNumber: number | null
  firstName: string
  lastName: string
  email: string
  phone: string | null
  city: string | null
  state: string | null
  hourlyRate: number | null
  distance: number | null // distance in miles, null for remote
  languages: {
    sourceLanguage: string
    targetLanguage: string
    level: string
  }[]
  averageRating: number | null
  totalQuotesCompleted: number
}

/**
 * Find matching linguists for an interpretation job
 */
export async function findMatchingLinguists(
  criteria: MatchingCriteria
): Promise<MatchedLinguist[]> {
  const { 
    sourceLanguageId, 
    targetLanguageId, 
    serviceType, 
    state, 
    city,
    latitude,
    longitude,
    maxDistance = 50 
  } = criteria

  // Build base query
  const whereClause: Record<string, unknown> = {
    isActive: true,
    isVerified: true,
  }

  // For on-site, filter by availableForOnSite
  if (serviceType === 'ON_SITE') {
    whereClause.availableForOnSite = true
  }

  // Language filter via LinguistLanguage
  if (sourceLanguageId || targetLanguageId) {
    whereClause.linguistLanguages = {
      some: {
        ...(sourceLanguageId && { languageId: sourceLanguageId }),
      }
    }
  }

  // State filter for initial narrowing
  if (serviceType === 'ON_SITE' && state) {
    whereClause.state = state
  }

  const linguists = await prisma.linguist.findMany({
    where: whereClause,
    include: {
      linguistLanguages: {
        include: {
          language: true,
        },
      },
    },
    orderBy: [
      { averageRating: 'desc' },
      { totalQuotesCompleted: 'desc' },
    ],
  })

  // Process and filter results
  const results: MatchedLinguist[] = []

  for (const linguist of linguists) {
    // Calculate distance for on-site jobs
    let distance: number | null = null

    if (serviceType === 'ON_SITE') {
      // Get job location coordinates
      let jobLat = latitude
      let jobLng = longitude

      // Try to get coordinates from city or state if not provided
      if (!jobLat || !jobLng) {
        if (city && CITY_COORDINATES[city]) {
          jobLat = CITY_COORDINATES[city].lat
          jobLng = CITY_COORDINATES[city].lng
        } else if (state && STATE_COORDINATES[state]) {
          jobLat = STATE_COORDINATES[state].lat
          jobLng = STATE_COORDINATES[state].lng
        }
      }

      // Get linguist coordinates
      let linguistLat = linguist.latitude
      let linguistLng = linguist.longitude

      // Try to get linguist coordinates from city/state if not set
      if (!linguistLat || !linguistLng) {
        if (linguist.city && CITY_COORDINATES[linguist.city]) {
          linguistLat = CITY_COORDINATES[linguist.city].lat
          linguistLng = CITY_COORDINATES[linguist.city].lng
        } else if (linguist.state && STATE_COORDINATES[linguist.state]) {
          linguistLat = STATE_COORDINATES[linguist.state].lat
          linguistLng = STATE_COORDINATES[linguist.state].lng
        }
      }

      // Calculate distance if we have both coordinates
      if (jobLat && jobLng && linguistLat && linguistLng) {
        distance = calculateDistance(jobLat, jobLng, linguistLat, linguistLng)

        // Filter by max distance
        const linguistMaxDistance = linguist.maxTravelDistance || 50
        if (distance > Math.min(maxDistance, linguistMaxDistance)) {
          continue // Skip this linguist
        }
      } else if (linguist.state !== state) {
        // If we can't calculate distance, at least match by state
        continue
      }
    }

    // Format languages
    const languages = linguist.linguistLanguages.map(ll => ({
      sourceLanguage: ll.language.name,
      targetLanguage: ll.language.name, // This would need to be adjusted based on your data model
      level: ll.level,
    }))

    results.push({
      id: linguist.id,
      linguistNumber: linguist.linguistNumber,
      firstName: linguist.firstName,
      lastName: linguist.lastName,
      email: linguist.email,
      phone: linguist.phone,
      city: linguist.city,
      state: linguist.state,
      hourlyRate: linguist.hourlyRate,
      distance,
      languages,
      averageRating: linguist.averageRating,
      totalQuotesCompleted: linguist.totalQuotesCompleted,
    })
  }

  // Sort by distance for on-site, by rating for remote
  if (serviceType === 'ON_SITE') {
    results.sort((a, b) => (a.distance || 999) - (b.distance || 999))
  } else {
    results.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
  }

  return results
}

/**
 * Get coordinates from address using city/state lookup
 */
export function getCoordinatesFromLocation(
  city?: string,
  state?: string
): { lat: number; lng: number } | null {
  if (city && CITY_COORDINATES[city]) {
    return CITY_COORDINATES[city]
  }
  if (state && STATE_COORDINATES[state]) {
    return STATE_COORDINATES[state]
  }
  return null
}

/**
 * Format distance for display
 */
export function formatDistance(miles: number | null): string {
  if (miles === null) return 'Remote'
  if (miles < 1) return 'Less than 1 mile'
  if (miles === 1) return '1 mile'
  return `${miles} miles`
}
