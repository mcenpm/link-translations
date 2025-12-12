import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendEmail, getAdminEmail } from '@/lib/email'
import { orderConfirmationEmail, adminNewOrderEmail } from '@/lib/email-templates'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutComplete(session)
      break
    }
    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutExpired(session)
      break
    }
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment intent succeeded:', paymentIntent.id)
      break
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment failed:', paymentIntent.id)
      break
    }
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const quoteId = session.metadata?.quoteId || session.client_reference_id

  if (!quoteId) {
    console.error('No quoteId in checkout session')
    return
  }

  try {
    // Update quote payment status
    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        paymentStatus: 'paid',
        stripePaymentIntentId: session.payment_intent as string,
        paidAt: new Date(),
        status: 'INVOICE_PAID', // Auto-approve paid quotes
      },
      include: {
        contact: true,
        srcLanguage: true,
        tgtLanguage: true,
      },
    })

    // Create a Project from the paid quote
    const project = await prisma.project.create({
      data: {
        name: `Project from Quote #${updatedQuote.quoteNumber}`,
        status: 'IN_PROGRESS',
        quoteId: updatedQuote.id,
        contactId: updatedQuote.contactId,
        customerId: updatedQuote.customerId,
        sourceLanguageId: updatedQuote.sourceLanguageId,
        targetLanguageId: updatedQuote.targetLanguageId,
        serviceType: updatedQuote.serviceType,
        totalPrice: updatedQuote.totalPrice,
        notes: updatedQuote.notes,
      },
    })

    console.log('Payment complete - Quote approved and Project created:', {
      quoteId: updatedQuote.id,
      quoteNumber: updatedQuote.quoteNumber,
      projectId: project.id,
      amount: session.amount_total,
    })

    // Get contact info for email
    const contact = updatedQuote.contact || await prisma.contact.findFirst({
      where: { corporateId: updatedQuote.customerId }
    })

    if (contact?.email) {
      // Send order confirmation email to customer
      const customerEmail = orderConfirmationEmail({
        firstName: contact.firstName,
        quoteNumber: updatedQuote.quoteNumber,
        projectId: project.id,
        amount: session.amount_total ? session.amount_total / 100 : updatedQuote.totalPrice || 0,
        serviceType: updatedQuote.serviceType || 'translation',
        sourceLanguage: updatedQuote.srcLanguage?.name || 'Unknown',
        targetLanguage: updatedQuote.tgtLanguage?.name || 'Unknown',
      })
      sendEmail({
        to: contact.email,
        subject: customerEmail.subject,
        html: customerEmail.html,
      }).catch(err => console.error('Order confirmation email failed:', err))
    }

    // Send notification to admin
    const adminAlert = adminNewOrderEmail({
      quoteNumber: updatedQuote.quoteNumber,
      customerName: contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown',
      customerEmail: contact?.email || 'Unknown',
      serviceType: updatedQuote.serviceType || 'translation',
      sourceLanguage: updatedQuote.srcLanguage?.name || 'Unknown',
      targetLanguage: updatedQuote.tgtLanguage?.name || 'Unknown',
      amount: session.amount_total ? session.amount_total / 100 : updatedQuote.totalPrice || 0,
      notes: updatedQuote.notes || undefined,
    })
    sendEmail({
      to: getAdminEmail(),
      subject: adminAlert.subject,
      html: adminAlert.html,
    }).catch(err => console.error('Admin order alert email failed:', err))

  } catch (error) {
    console.error('Error processing checkout complete:', error)
    throw error
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const quoteId = session.metadata?.quoteId || session.client_reference_id

  if (!quoteId) {
    console.error('No quoteId in expired session')
    return
  }

  try {
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        paymentStatus: 'expired',
      },
    })

    console.log('Checkout session expired for quote:', quoteId)
  } catch (error) {
    console.error('Error processing checkout expired:', error)
  }
}
