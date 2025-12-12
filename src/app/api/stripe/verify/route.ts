import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    )
  }

  try {
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    const quoteId = session.metadata?.quoteId || session.client_reference_id

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID not found in session' },
        { status: 404 }
      )
    }

    // Get quote details
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        contact: true,
        project: true,
      },
    })

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      quoteNumber: quote.quoteNumber,
      amount: session.amount_total ? session.amount_total / 100 : quote.totalPrice,
      email: quote.contact?.email || session.customer_email,
      serviceType: quote.serviceType || 'translation',
      projectId: quote.project?.id,
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
