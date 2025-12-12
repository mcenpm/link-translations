import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get single pricing rule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pricingRule = await prisma.pricingRule.findUnique({
      where: { id },
      include: {
        sourceLanguage: true,
        targetLanguage: true,
      },
    })

    if (!pricingRule) {
      return NextResponse.json(
        { success: false, error: 'Pricing rule not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: pricingRule,
    })
  } catch (error) {
    console.error('Failed to fetch pricing rule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pricing rule' },
      { status: 500 }
    )
  }
}

// PUT - Update pricing rule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const pricingRule = await prisma.pricingRule.update({
      where: { id },
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
        isDefault: body.isDefault,
        isActive: body.isActive,
        priority: body.priority,
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
    console.error('Failed to update pricing rule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update pricing rule' },
      { status: 500 }
    )
  }
}

// DELETE - Delete pricing rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.pricingRule.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Pricing rule deleted',
    })
  } catch (error) {
    console.error('Failed to delete pricing rule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete pricing rule' },
      { status: 500 }
    )
  }
}
