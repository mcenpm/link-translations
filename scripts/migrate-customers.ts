import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as csv from 'csv-parse/sync'

const prisma = new PrismaClient()

interface CRMCustomer {
  id: string
  company: string
  website?: string
  billing_address_street?: string
  billing_address_city?: string
  billing_address_state?: string
  billing_address_postalcode?: string
  billing_address_country?: string
  shipping_address_street?: string
  shipping_address_city?: string
  shipping_address_state?: string
  shipping_address_postalcode?: string
  shipping_address_country?: string
  created_at: string
  updated_at: string
}

async function migrateCustomers() {
  try {
    const csvPath = './data/crm_customers.csv'
    
    if (!fs.existsSync(csvPath)) {
      console.log(`📁 CSV file not found at ${csvPath}`)
      console.log(`ℹ️  Place exported CSV files in ./data/ directory`)
      console.log(`   Expected file: crm_customers.csv`)
      return
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    const records: CRMCustomer[] = csv.parse(fileContent, { columns: true })

    console.log(`📥 Importing ${records.length} customers from Sugar CRM...`)

    let imported = 0
    let skipped = 0
    let failed = 0

    for (const record of records) {
      try {
        // Check if customer already exists
        const existingCustomer = await prisma.customer.findFirst({
          where: { company: record.company },
        })

        if (existingCustomer) {
          skipped++
          continue
        }

        // Create User
        const user = await prisma.user.create({
          data: {
            email: `customer-${record.id}@link-translations.local`,
            password: '', // Will be set via password reset
            role: 'CUSTOMER',
            firstName: record.company.split(' ')[0],
          },
        })

        // Create Customer Profile
        await prisma.customer.create({
          data: {
            userId: user.id,
            company: record.company,
            website: record.website,
            billingAddress: record.billing_address_street,
            billingCity: record.billing_address_city,
            billingState: record.billing_address_state?.toUpperCase().substring(0, 2),
            billingZip: record.billing_address_postalcode,
            billingCountry: record.billing_address_country || 'United States',
            shippingAddress: record.shipping_address_street,
            shippingCity: record.shipping_address_city,
            shippingState: record.shipping_address_state?.toUpperCase().substring(0, 2),
            shippingZip: record.shipping_address_postalcode,
            shippingCountry: record.shipping_address_country || 'United States',
            createdAt: new Date(record.created_at),
            updatedAt: new Date(record.updated_at),
          },
        })

        imported++
      } catch (error) {
        failed++
        console.error(`❌ Error importing customer ${record.company}:`, error)
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

migrateCustomers()
