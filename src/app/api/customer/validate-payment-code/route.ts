import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { valid: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { paymentCode, quoteId } = await request.json()

    if (!paymentCode || !quoteId) {
      return NextResponse.json(
        { valid: false, error: 'Payment code and quote ID are required' },
        { status: 400 }
      )
    }

    // Get user and their corporate info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        corporate: true
      }
    })

    if (!user || !user.corporate) {
      return NextResponse.json(
        { valid: false, error: 'Corporate account not found' },
        { status: 400 }
      )
    }

    // Check if payment code is enabled for this corporate
    if (!user.corporate.paymentCodeEnabled) {
      return NextResponse.json(
        { valid: false, error: 'Payment code is not enabled for your account' },
        { status: 400 }
      )
    }

    // Validate the payment code
    if (user.corporate.paymentCode !== paymentCode) {
      return NextResponse.json(
        { valid: false, error: 'Invalid payment code' },
        { status: 400 }
      )
    }

    // Payment code is valid - update quote status to PAID
    const quote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'INVOICE_PAID',
        paymentStatus: 'PAYMENT_CODE',
        paidAt: new Date(),
      }
    })

    // Create a project for the quote
    const project = await prisma.project.create({
      data: {
        name: `Project from Quote #${quote.quoteNumber}`,
        customerId: user.corporate.id,
        quoteId: quote.id,
        status: 'IN_PROGRESS',
        sourceLanguageId: quote.sourceLanguageId || undefined,
        targetLanguageId: quote.targetLanguageId || undefined,
        startDate: new Date(),
      }
    })

    return NextResponse.json({
      valid: true,
      message: 'Payment successful',
      projectId: project.id
    })

  } catch (error) {
    console.error('Error validating payment code:', error)
    return NextResponse.json(
      { valid: false, error: 'Failed to validate payment code' },
      { status: 500 }
    )
  }
}
