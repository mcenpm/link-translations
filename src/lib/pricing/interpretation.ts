import { prisma } from '@/lib/prisma'

// US State to Time Zone mapping
export const STATE_TIMEZONES: Record<string, string> = {
  // Eastern Time (ET)
  CT: 'America/New_York',
  DE: 'America/New_York',
  DC: 'America/New_York',
  FL: 'America/New_York', // Most of FL
  GA: 'America/New_York',
  IN: 'America/Indiana/Indianapolis', // Most of IN
  KY: 'America/Kentucky/Louisville', // Eastern KY
  ME: 'America/New_York',
  MD: 'America/New_York',
  MA: 'America/New_York',
  MI: 'America/Detroit',
  NH: 'America/New_York',
  NJ: 'America/New_York',
  NY: 'America/New_York',
  NC: 'America/New_York',
  OH: 'America/New_York',
  PA: 'America/New_York',
  RI: 'America/New_York',
  SC: 'America/New_York',
  VT: 'America/New_York',
  VA: 'America/New_York',
  WV: 'America/New_York',

  // Central Time (CT)
  AL: 'America/Chicago',
  AR: 'America/Chicago',
  IL: 'America/Chicago',
  IA: 'America/Chicago',
  KS: 'America/Chicago', // Most of KS
  LA: 'America/Chicago',
  MN: 'America/Chicago',
  MS: 'America/Chicago',
  MO: 'America/Chicago',
  NE: 'America/Chicago', // Most of NE
  ND: 'America/Chicago', // Most of ND
  OK: 'America/Chicago',
  SD: 'America/Chicago', // Most of SD
  TN: 'America/Chicago', // Most of TN
  TX: 'America/Chicago', // Most of TX
  WI: 'America/Chicago',

  // Mountain Time (MT)
  AZ: 'America/Phoenix', // No DST
  CO: 'America/Denver',
  ID: 'America/Boise', // Most of ID
  MT: 'America/Denver',
  NV: 'America/Los_Angeles', // Most follows Pacific
  NM: 'America/Denver',
  UT: 'America/Denver',
  WY: 'America/Denver',

  // Pacific Time (PT)
  CA: 'America/Los_Angeles',
  OR: 'America/Los_Angeles',
  WA: 'America/Los_Angeles',

  // Alaska Time
  AK: 'America/Anchorage',

  // Hawaii Time
  HI: 'America/Honolulu',
}

// Common time zones for video/phone interpretation
export const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'America/Honolulu', label: 'Hawaii Time (HST)' },
]

export interface InterpretationPricingInput {
  sourceLanguageId: string
  targetLanguageId: string
  interpretationSetting: 'in-person' | 'video-remote' | 'phone'
  state?: string // For on-site, required
  timeZone?: string // For video/phone
  dateTimeEntries: Array<{
    date: string // YYYY-MM-DD
    startTime: string // HH:mm
    endTime: string // HH:mm
  }>
}

export interface InterpretationPricingResult {
  totalHours: number
  hourlyRate: number
  hoursSubtotal: number
  travelFee: number
  rushFee: number
  isRush: boolean
  isSameDay: boolean
  minimumHours: number
  appliedMinimum: boolean
  total: number
  breakdown: string[]
  error?: string
}

/**
 * Calculate interpretation hours with ceiling rounding
 * Any minute over a full hour counts as an additional hour
 * Example: 9:00 - 13:01 = 5 hours (4h 1min → 5h)
 */
export function calculateHours(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  const totalMinutes = endMinutes - startMinutes
  
  if (totalMinutes <= 0) return 0
  
  // Ceiling: any minute over full hour = +1 hour
  const fullHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60
  
  return remainingMinutes > 0 ? fullHours + 1 : fullHours
}

/**
 * Check if appointment time is at least 1 hour from now
 * considering the appropriate time zone
 */
export function isValidAppointmentTime(
  date: string,
  startTime: string,
  timeZone: string
): { valid: boolean; error?: string } {
  try {
    // Get current time in the specified time zone
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    
    const parts = formatter.formatToParts(now)
    const currentDate = `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value}`
    const currentHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0')
    const currentMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0')
    
    // Create appointment datetime
    const [appointmentHour, appointmentMinute] = startTime.split(':').map(Number)
    
    // If appointment is on a future date, it's valid
    if (date > currentDate) {
      return { valid: true }
    }
    
    // If appointment is today, check if it's at least 1 hour from now
    if (date === currentDate) {
      const currentTotalMinutes = currentHour * 60 + currentMinute
      const appointmentTotalMinutes = appointmentHour * 60 + appointmentMinute
      
      // Must be at least 60 minutes (1 hour) from now
      if (appointmentTotalMinutes - currentTotalMinutes < 60) {
        return { 
          valid: false, 
          error: 'Appointment must be at least 1 hour from now' 
        }
      }
    }
    
    // If appointment is in the past
    if (date < currentDate) {
      return { 
        valid: false, 
        error: 'Cannot schedule appointments in the past' 
      }
    }
    
    return { valid: true }
  } catch {
    return { valid: true } // Default to valid if timezone calculation fails
  }
}

/**
 * Check if appointment is same-day (rush)
 */
export function isSameDayAppointment(date: string, timeZone: string): boolean {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    
    const parts = formatter.formatToParts(now)
    const currentDate = `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value}`
    
    return date === currentDate
  } catch {
    return false
  }
}

/**
 * Map interpretation setting to database enum
 */
function getInterpretationType(setting: string): 'ON_SITE' | 'VIDEO_REMOTE' | 'PHONE' {
  switch (setting) {
    case 'in-person': return 'ON_SITE'
    case 'video-remote': return 'VIDEO_REMOTE'
    case 'phone': return 'PHONE'
    default: return 'VIDEO_REMOTE'
  }
}

/**
 * Calculate interpretation pricing
 */
export async function calculateInterpretationPrice(
  input: InterpretationPricingInput
): Promise<InterpretationPricingResult> {
  const breakdown: string[] = []
  
  // Determine time zone
  const timeZone = input.interpretationSetting === 'in-person' && input.state
    ? STATE_TIMEZONES[input.state] || 'America/New_York'
    : input.timeZone || 'America/New_York'
  
  // Validate appointment times
  for (const entry of input.dateTimeEntries) {
    const validation = isValidAppointmentTime(entry.date, entry.startTime, timeZone)
    if (!validation.valid) {
      return {
        totalHours: 0,
        hourlyRate: 0,
        hoursSubtotal: 0,
        travelFee: 0,
        rushFee: 0,
        isRush: false,
        isSameDay: false,
        minimumHours: 0,
        appliedMinimum: false,
        total: 0,
        breakdown: [],
        error: validation.error,
      }
    }
  }
  
  // Calculate total hours
  let totalHours = 0
  for (const entry of input.dateTimeEntries) {
    const hours = calculateHours(entry.startTime, entry.endTime)
    totalHours += hours
  }
  
  // Determine minimum hours based on setting
  const minimumHours = input.interpretationSetting === 'in-person' ? 3 : 2
  const appliedMinimum = totalHours < minimumHours
  const billedHours = Math.max(totalHours, minimumHours)
  
  if (appliedMinimum) {
    breakdown.push(`Minimum ${minimumHours} hours applied (requested: ${totalHours}h)`)
  } else {
    breakdown.push(`${totalHours} hour${totalHours > 1 ? 's' : ''} of interpretation`)
  }
  
  // Get pricing rule from database
  const interpretationType = getInterpretationType(input.interpretationSetting)
  
  // Try to find state-specific pricing first (for on-site), then fall back to base rate
  let pricingRule = null
  
  if (input.interpretationSetting === 'in-person' && input.state) {
    // Look for state-specific on-site rate
    pricingRule = await prisma.pricingRule.findFirst({
      where: {
        sourceLanguageId: input.sourceLanguageId,
        targetLanguageId: input.targetLanguageId,
        serviceType: 'INTERPRETATION',
        interpretationType: 'ON_SITE',
        state: input.state,
        isActive: true,
      },
      orderBy: { priority: 'desc' },
    })
  }
  
  // Fall back to base rate for the interpretation type
  if (!pricingRule) {
    pricingRule = await prisma.pricingRule.findFirst({
      where: {
        sourceLanguageId: input.sourceLanguageId,
        targetLanguageId: input.targetLanguageId,
        serviceType: 'INTERPRETATION',
        interpretationType,
        state: null, // Base rate (no state)
        isActive: true,
      },
      orderBy: { priority: 'desc' },
    })
  }
  
  // Fall back to any interpretation rate for this language pair
  if (!pricingRule) {
    pricingRule = await prisma.pricingRule.findFirst({
      where: {
        sourceLanguageId: input.sourceLanguageId,
        targetLanguageId: input.targetLanguageId,
        serviceType: 'INTERPRETATION',
        isActive: true,
      },
      orderBy: { priority: 'desc' },
    })
  }
  
  // Default rates if no rule found
  const defaultRates = {
    'in-person': 95,
    'video-remote': 75,
    'phone': 65,
  }
  
  const hourlyRate = pricingRule?.perHourRate 
    ? Number(pricingRule.perHourRate) 
    : defaultRates[input.interpretationSetting]
  
  breakdown.push(`Rate: $${hourlyRate.toFixed(2)}/hour`)
  
  // Calculate hours subtotal
  const hoursSubtotal = billedHours * hourlyRate
  breakdown.push(`Subtotal: ${billedHours}h × $${hourlyRate.toFixed(2)} = $${hoursSubtotal.toFixed(2)}`)
  
  // Travel fee for on-site
  let travelFee = 0
  if (input.interpretationSetting === 'in-person') {
    travelFee = pricingRule?.travelFee ? Number(pricingRule.travelFee) : 50 // Default $50 travel fee
    breakdown.push(`Travel fee: $${travelFee.toFixed(2)}`)
  }
  
  // Check for same-day rush
  const isSameDay = input.dateTimeEntries.some(entry => 
    isSameDayAppointment(entry.date, timeZone)
  )
  
  let rushFee = 0
  if (isSameDay) {
    // 35% rush fee for same-day
    rushFee = (hoursSubtotal + travelFee) * 0.35
    breakdown.push(`Same-day rush fee (35%): $${rushFee.toFixed(2)}`)
  }
  
  const total = hoursSubtotal + travelFee + rushFee
  breakdown.push(`Total: $${total.toFixed(2)}`)
  
  return {
    totalHours,
    hourlyRate,
    hoursSubtotal,
    travelFee,
    rushFee,
    isRush: isSameDay,
    isSameDay,
    minimumHours,
    appliedMinimum,
    total,
    breakdown,
  }
}

/**
 * Get time zone for a US state
 */
export function getStateTimeZone(stateCode: string): string {
  return STATE_TIMEZONES[stateCode] || 'America/New_York'
}

/**
 * Format time zone for display
 */
export function formatTimeZone(timeZone: string): string {
  const found = COMMON_TIMEZONES.find(tz => tz.value === timeZone)
  return found?.label || timeZone
}
