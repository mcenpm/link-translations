import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(languages)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch languages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { code, name, nativeName } = await request.json()

    const language = await prisma.language.create({
      data: {
        code,
        name,
        nativeName,
      },
    })

    return NextResponse.json(language, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create language' }, { status: 500 })
  }
}
