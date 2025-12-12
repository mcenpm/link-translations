import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quoteId, successUrl, cancelUrl } = body

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    // Get the quote from database
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        srcLanguage: true,
        tgtLanguage: true,
      },
    })

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    if (!quote.totalPrice || quote.totalPrice <= 0) {
      return NextResponse.json(
        { error: 'Quote does not have a valid price' },
        { status: 400 }
      )
    }

    // Get contact email if exists
    const contact = quote.contactId ? await prisma.contact.findUnique({
      where: { id: quote.contactId }
    }) : null

    // Build line item description
    const serviceType = quote.serviceType === 'interpretation' ? 'Interpretation' : 'Translation'
    const languagePair = `${quote.srcLanguage?.name || 'Unknown'} → ${quote.tgtLanguage?.name || 'Unknown'}`
    const description = `${serviceType} Service: ${languagePair}`

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: contact?.email || undefined,
      client_reference_id: quoteId,
      metadata: {
        quoteId: quoteId,
        quoteNumber: quote.quoteNumber || '',
        serviceType: quote.serviceType || '',
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: formatAmountForStripe(quote.totalPrice),
            product_data: {
              name: `Quote #${quote.quoteNumber}`,
              description: description,
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/quote/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/quote/${quoteId}`,
    })

    // Update quote with payment session ID
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        stripeSessionId: session.id,
        paymentStatus: 'pending',
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
