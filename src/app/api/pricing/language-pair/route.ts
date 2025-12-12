import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch existing pricing for a language pair
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sourceLanguageId = searchParams.get('source')
  const targetLanguageId = searchParams.get('target')

  if (!sourceLanguageId || !targetLanguageId) {
    return NextResponse.json({
      success: false,
      error: 'Source and target language IDs are required',
    }, { status: 400 })
  }

  try {
    const rules = await prisma.pricingRule.findMany({
      where: {
        sourceLanguageId,
        targetLanguageId,
        isActive: true,
      },
      include: {
        sourceLanguage: true,
        targetLanguage: true,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ success: true, data: rules })
  } catch (error) {
    console.error('Failed to fetch pricing rules:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pricing rules',
    }, { status: 500 })
  }
}

// POST - Save pricing for a language pair (creates/updates multiple rules)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sourceLanguageId, targetLanguageId, pricing } = body

    if (!sourceLanguageId || !targetLanguageId) {
      return NextResponse.json({
        success: false,
        error: 'Source and target language IDs are required',
      }, { status: 400 })
    }

    // Get language names for rule naming
    const sourceLanguage = await prisma.language.findUnique({
      where: { id: sourceLanguageId },
    })
    const targetLanguage = await prisma.language.findUnique({
      where: { id: targetLanguageId },
    })

    if (!sourceLanguage || !targetLanguage) {
      return NextResponse.json({
        success: false,
        error: 'Invalid language IDs',
      }, { status: 400 })
    }

    const langPairName = `${sourceLanguage.name} → ${targetLanguage.name}`

    // Delete existing rules for this language pair
    await prisma.pricingRule.deleteMany({
      where: {
        sourceLanguageId,
        targetLanguageId,
      },
    })

    const rulesToCreate = []

    // Translation rule
    if (pricing.translation.perWordRate || pricing.translation.minimumCharge) {
      rulesToCreate.push({
        name: `${langPairName} - Translation`,
        serviceType: 'TRANSLATION' as const,
        sourceLanguageId,
        targetLanguageId,
        perWordRate: pricing.translation.perWordRate ? parseFloat(pricing.translation.perWordRate) : null,
        minimumCharge: pricing.translation.minimumCharge ? parseFloat(pricing.translation.minimumCharge) : null,
        rush24hMultiplier: pricing.translation.rush24hMultiplier ? parseFloat(pricing.translation.rush24hMultiplier) : null,
        rush48hMultiplier: pricing.translation.rush48hMultiplier ? parseFloat(pricing.translation.rush48hMultiplier) : null,
        isActive: true,
        priority: 10,
      })
    }

    // Video Remote interpretation rule
    if (pricing.interpretation.videoRemote.perHourRate) {
      rulesToCreate.push({
        name: `${langPairName} - Video Remote Interpretation`,
        serviceType: 'INTERPRETATION' as const,
        sourceLanguageId,
        targetLanguageId,
        interpretationType: 'VIDEO_REMOTE' as const,
        perHourRate: parseFloat(pricing.interpretation.videoRemote.perHourRate),
        minimumHours: pricing.interpretation.videoRemote.minimumHours ? parseFloat(pricing.interpretation.videoRemote.minimumHours) : null,
        isActive: true,
        priority: 10,
      })
    }

    // Phone interpretation rule
    if (pricing.interpretation.phone.perHourRate) {
      rulesToCreate.push({
        name: `${langPairName} - Phone Interpretation`,
        serviceType: 'INTERPRETATION' as const,
        sourceLanguageId,
        targetLanguageId,
        interpretationType: 'PHONE' as const,
        perHourRate: parseFloat(pricing.interpretation.phone.perHourRate),
        minimumHours: pricing.interpretation.phone.minimumHours ? parseFloat(pricing.interpretation.phone.minimumHours) : null,
        isActive: true,
        priority: 10,
      })
    }

    // On-Site interpretation - Base rate (no state)
    if (pricing.interpretation.onSite.perHourRate) {
      rulesToCreate.push({
        name: `${langPairName} - On-Site Interpretation (Base)`,
        serviceType: 'INTERPRETATION' as const,
        sourceLanguageId,
        targetLanguageId,
        interpretationType: 'ON_SITE' as const,
        state: null,
        perHourRate: parseFloat(pricing.interpretation.onSite.perHourRate),
        minimumHours: pricing.interpretation.onSite.minimumHours ? parseFloat(pricing.interpretation.onSite.minimumHours) : null,
        travelFee: pricing.interpretation.onSite.travelFee ? parseFloat(pricing.interpretation.onSite.travelFee) : null,
        isActive: true,
        priority: 5, // Lower priority than state-specific rules
      })
    }

    // On-Site interpretation - State overrides
    for (const override of pricing.interpretation.onSite.stateOverrides) {
      rulesToCreate.push({
        name: `${langPairName} - On-Site Interpretation (${override.state})`,
        serviceType: 'INTERPRETATION' as const,
        sourceLanguageId,
        targetLanguageId,
        interpretationType: 'ON_SITE' as const,
        state: override.state,
        perHourRate: override.perHourRate ? parseFloat(override.perHourRate) : null,
        minimumHours: override.minimumHours ? parseFloat(override.minimumHours) : null,
        travelFee: override.travelFee ? parseFloat(override.travelFee) : null,
        isActive: true,
        priority: 20, // Higher priority - state-specific overrides base
      })
    }

    // Create all rules
    if (rulesToCreate.length > 0) {
      await prisma.pricingRule.createMany({
        data: rulesToCreate,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Created ${rulesToCreate.length} pricing rules for ${langPairName}`,
    })
  } catch (error) {
    console.error('Failed to save pricing:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to save pricing',
    }, { status: 500 })
  }
}
