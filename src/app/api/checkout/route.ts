import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quoteId, amount, customerEmail, customerName, description } = body

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    if (amount === undefined || amount === null || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required (must be greater than 0)' },
        { status: 400 }
      )
    }

    // Get quote from database
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        corporate: true,
      }
    })

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Link Translations - ${description || 'Interpretation Service'}`,
              description: `Quote #${quote.quoteNumber}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/quote/success?session_id={CHECKOUT_SESSION_ID}&quote_id=${quoteId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/quote?step=review`,
      customer_email: customerEmail,
      metadata: {
        quoteId,
        quoteNumber: quote.quoteNumber,
        customerName,
      },
      payment_intent_data: {
        metadata: {
          quoteId,
          quoteNumber: quote.quoteNumber,
        },
      },
    })

    // Update quote with Stripe session ID
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        stripeSessionId: session.id,
        paymentStatus: 'pending',
      }
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
