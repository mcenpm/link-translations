import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Validate and apply coupon code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, orderTotal, serviceType, customerId, isFirstOrder } = body

    if (!code || !orderTotal) {
      return NextResponse.json(
        { error: 'Coupon code and order total are required' },
        { status: 400 }
      )
    }

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code', valid: false },
        { status: 400 }
      )
    }

    // Validation checks
    const now = new Date()

    if (!coupon.isActive) {
      return NextResponse.json(
        { error: 'This coupon is no longer active', valid: false },
        { status: 400 }
      )
    }

    if (coupon.validFrom > now) {
      return NextResponse.json(
        { error: 'This coupon is not yet valid', valid: false },
        { status: 400 }
      )
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json(
        { error: 'This coupon has expired', valid: false },
        { status: 400 }
      )
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { error: 'This coupon has reached its usage limit', valid: false },
        { status: 400 }
      )
    }

    if (coupon.minimumOrder && orderTotal < coupon.minimumOrder) {
      return NextResponse.json(
        { 
          error: `Minimum order of $${coupon.minimumOrder.toFixed(2)} required`, 
          valid: false 
        },
        { status: 400 }
      )
    }

    if (coupon.serviceType && serviceType && coupon.serviceType !== serviceType) {
      return NextResponse.json(
        { 
          error: `This coupon is only valid for ${coupon.serviceType} services`, 
          valid: false 
        },
        { status: 400 }
      )
    }

    if (coupon.firstOrderOnly && !isFirstOrder) {
      return NextResponse.json(
        { error: 'This coupon is only valid for first-time orders', valid: false },
        { status: 400 }
      )
    }

    // Check if customer already used this coupon
    if (customerId) {
      const existingUsage = await prisma.couponUsage.findFirst({
        where: { couponId: coupon.id, customerId }
      })

      if (existingUsage) {
        return NextResponse.json(
          { error: 'You have already used this coupon', valid: false },
          { status: 400 }
        )
      }
    }

    // Calculate discount
    let discount = 0
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderTotal * coupon.discountValue) / 100
      // Apply max discount cap if set
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
    } else {
      // Fixed amount
      discount = Math.min(coupon.discountValue, orderTotal)
    }

    const newTotal = orderTotal - discount

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discount: Math.round(discount * 100) / 100,
      originalTotal: orderTotal,
      newTotal: Math.round(newTotal * 100) / 100
    })
  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}
