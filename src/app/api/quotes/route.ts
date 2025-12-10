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
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    const where: any = {}
    if (customerId) where.customerId = customerId
    if (status) where.status = status

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        select: {
          id: true,
          quoteNumber: true,
          sourceLanguage: true,
          targetLanguage: true,
          wordCount: true,
          total: true,
          status: true,
          createdAt: true,
          corporate: {
            select: {
              company: true,
              user: { select: { firstName: true, lastName: true, email: true } }
            }
          },
          languagePair: {
            include: {
              sourceLanguage: true,
              targetLanguage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.quote.count({ where })
    ])

    return NextResponse.json({
      data: quotes,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Fetch quotes error:', error)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}
