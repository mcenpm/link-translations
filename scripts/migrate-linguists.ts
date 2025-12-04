import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as csv from 'csv-parse/sync'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface WPLinguist {
  wp_user_id: string
  email: string
  username: string
  first_name: string
  created_at: string
  languages?: string
  discipline?: string
  rate?: string
  state?: string
  city?: string
  address?: string
}

async function migrateLinguists() {
  try {
    const csvPath = './data/wp_linguists.csv'
    
    if (!fs.existsSync(csvPath)) {
      console.log(`📁 CSV file not found at ${csvPath}`)
      console.log(`ℹ️  Place exported CSV files in ./data/ directory`)
      console.log(`   Expected file: wp_linguists.csv`)
      return
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    const records: WPLinguist[] = csv.parse(fileContent, { columns: true })

    console.log(`📥 Importing ${records.length} linguists from WordPress...`)

    let imported = 0
    let skipped = 0
    let failed = 0

    for (const record of records) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: record.email },
        })

        if (existingUser) {
          skipped++
          continue
        }

        // Create User
        const user = await prisma.user.create({
          data: {
            email: record.email,
            password: await bcrypt.hash('ChangeMe123!', 10),
            role: 'LINGUIST',
            firstName: record.first_name || record.username,
          },
        })

        // Create Linguist Profile
        await prisma.linguist.create({
          data: {
            userId: user.id,
            state: record.state?.toUpperCase().substring(0, 2),
            city: record.city,
            address: record.address,
            defaultRatePerWord: record.rate ? parseFloat(record.rate) : 0.16,
            isActive: true,
            createdAt: new Date(record.created_at),
          },
        })

        imported++
      } catch (error) {
        failed++
        console.error(`❌ Error importing linguist ${record.email}:`, error)
      }
    }

    console.log(`✅ Migration complete!`)
    console.log(`   Imported: ${imported}`)
    console.log(`   Skipped: ${skipped} (already exist)`)
    console.log(`   Failed: ${failed}`)
  } catch (error) {
    console.error('Migration error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateLinguists()
