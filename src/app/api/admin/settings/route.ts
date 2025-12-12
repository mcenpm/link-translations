import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { adminAuthOptions } from '@/lib/auth/admin-config'
import { prisma } from '@/lib/prisma'

const SETTINGS_ID = 'company_settings'

// GET - Get company settings
export async function GET() {
  try {
    const session = await getServerSession(adminAuthOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get or create settings
    let settings = await prisma.companySettings.findUnique({
      where: { id: SETTINGS_ID }
    })

    if (!settings) {
      // Create default settings
      settings = await prisma.companySettings.create({
        data: { id: SETTINGS_ID }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT - Update company settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(adminAuthOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()

    // Remove id and timestamps from body to prevent changing them
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...updateData } = body

    const settings = await prisma.companySettings.upsert({
      where: { id: SETTINGS_ID },
      update: updateData,
      create: { id: SETTINGS_ID, ...updateData }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
