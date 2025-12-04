import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateQuoteNumber, calculateQuotePrice } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const {
      customerId,
      languagePairId,
      description,
      sourceLanguage,
      targetLanguage,
      wordCount,
      requestedDeliveryDate,
    } = await request.json()

    // Get language pair pricing
    const languagePair = await prisma.languagePair.findUnique({
      where: { id: languagePairId },
    })

    if (!languagePair) {
      return NextResponse.json({ error: 'Language pair not found' }, { status: 404 })
    }

    // Calculate pricing
    const { subtotal, tax, total } = calculateQuotePrice(
      wordCount,
      languagePair.ratePerWord,
      languagePair.minimumCharge
    )

    const quote = await prisma.quote.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        customerId,
        languagePairId,
        description,
        sourceLanguage,
        targetLanguage,
        wordCount,
        ratePerUnit: languagePair.ratePerWord,
        minimumCharge: languagePair.minimumCharge,
        subtotal,
        tax,
        total,
        requestedDeliveryDate: requestedDeliveryDate ? new Date(requestedDeliveryDate) : null,
        unitOfIssue: 'word',
      },
      include: {
        languagePair: {
          include: {
            sourceLanguage: true,
            targetLanguage: true,
          },
        },
      },
    })

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    console.error('Quote creation error:', error)
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 })
    }

    const quotes = await prisma.quote.findMany({
      where: { customerId },
      include: {
        languagePair: {
          include: {
            sourceLanguage: true,
            targetLanguage: true,
          },
        },
        orders: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(quotes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}
