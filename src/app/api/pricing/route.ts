import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List all pricing rules
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const serviceType = searchParams.get('serviceType')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    
    if (serviceType) {
      where.serviceType = serviceType
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const pricingRules = await prisma.pricingRule.findMany({
      where,
      include: {
        sourceLanguage: true,
        targetLanguage: true,
      },
      orderBy: [
        { serviceType: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({
      success: true,
      data: pricingRules,
    })
  } catch (error) {
    console.error('Failed to fetch pricing rules:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pricing rules' },
      { status: 500 }
    )
  }
}

// POST - Create a new pricing rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const pricingRule = await prisma.pricingRule.create({
      data: {
        name: body.name,
        serviceType: body.serviceType,
        sourceLanguageId: body.sourceLanguageId || null,
        targetLanguageId: body.targetLanguageId || null,
        interpretationType: body.interpretationType || null,
        state: body.state || null,
        perWordRate: body.perWordRate || null,
        perHourRate: body.perHourRate || null,
        minimumHours: body.minimumHours || null,
        travelFee: body.travelFee || null,
        minimumCharge: body.minimumCharge || null,
        rush24hMultiplier: body.rush24hMultiplier || null,
        rush48hMultiplier: body.rush48hMultiplier || null,
        sameDayMultiplier: body.sameDayMultiplier || null,
        volumeDiscount1kWords: body.volumeDiscount1kWords || null,
        volumeDiscount5kWords: body.volumeDiscount5kWords || null,
        volumeDiscount10kWords: body.volumeDiscount10kWords || null,
        documentTypeLegal: body.documentTypeLegal || null,
        documentTypeMedical: body.documentTypeMedical || null,
        documentTypeTechnical: body.documentTypeTechnical || null,
        isDefault: body.isDefault || false,
        isActive: body.isActive !== false,
        priority: body.priority || 0,
      },
      include: {
        sourceLanguage: true,
        targetLanguage: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: pricingRule,
    })
  } catch (error) {
    console.error('Failed to create pricing rule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create pricing rule' },
      { status: 500 }
    )
  }
}
