import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const states = await prisma.state.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(states)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch states' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { code, name, slug } = await request.json()

    const state = await prisma.state.create({
      data: {
        code,
        name,
        slug,
      },
    })

    return NextResponse.json(state, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create state' }, { status: 500 })
  }
}
