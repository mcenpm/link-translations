import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const pairs = await prisma.languagePair.findMany({
      include: {
        sourceLanguage: true,
        targetLanguage: true,
      },
      orderBy: {
        ratePerWord: 'desc',
      },
    })

    return NextResponse.json(pairs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch language pairs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { sourceLanguageId, targetLanguageId, ratePerWord, minimumCharge } =
      await request.json()

    const pair = await prisma.languagePair.create({
      data: {
        sourceLanguageId,
        targetLanguageId,
        ratePerWord,
        minimumCharge,
      },
      include: {
        sourceLanguage: true,
        targetLanguage: true,
      },
    })

    return NextResponse.json(pair, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create language pair' }, { status: 500 })
  }
}
