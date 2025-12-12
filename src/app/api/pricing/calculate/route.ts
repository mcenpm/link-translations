import { NextRequest, NextResponse } from 'next/server'
import { calculateInterpretationPrice, InterpretationPricingInput } from '@/lib/pricing/interpretation'

export async function POST(request: NextRequest) {
  try {
    const body: InterpretationPricingInput = await request.json()
    
    // Validate required fields
    if (!body.sourceLanguageId || !body.targetLanguageId || !body.interpretationSetting) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    if (!body.dateTimeEntries || body.dateTimeEntries.length === 0) {
      return NextResponse.json(
        { error: 'At least one date/time entry is required' },
        { status: 400 }
      )
    }
    
    // On-site requires state
    if (body.interpretationSetting === 'in-person' && !body.state) {
      return NextResponse.json(
        { error: 'State is required for on-site interpretation' },
        { status: 400 }
      )
    }
    
    // Video/phone requires time zone
    if ((body.interpretationSetting === 'video-remote' || body.interpretationSetting === 'phone') && !body.timeZone) {
      return NextResponse.json(
        { error: 'Time zone is required for video/phone interpretation' },
        { status: 400 }
      )
    }
    
    const result = await calculateInterpretationPrice(body)
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Pricing calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate price' },
      { status: 500 }
    )
  }
}
