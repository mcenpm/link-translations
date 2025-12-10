import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as csv from 'csv-parse/sync'

const prisma = new PrismaClient()

interface CRMQuote {
  id: string
  quote_number: string
  customer_id: string
  name: string
  status: string
  total: string
  tax: string
  created_at: string
  updated_at: string
  expected_close?: string
}

async function migrateQuotes() {
  try {
    const csvPath = './data/crm_quotes.csv'
    
    if (!fs.existsSync(csvPath)) {
      console.log(`📁 CSV file not found at ${csvPath}`)
      console.log(`ℹ️  Place exported CSV files in ./data/ directory`)
      console.log(`   Expected file: crm_quotes.csv`)
      return
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    const records: CRMQuote[] = csv.parse(fileContent, { columns: true })

    console.log(`📥 Importing ${records.length} quotes from Sugar CRM...`)

    const statusMap: Record<string, any> = {
      'Pending Approval': 'SUBMITTED',
      'Accepted': 'ACCEPTED',
      'Rejected': 'REJECTED',
      'Invoice Paid': 'PAID',
      'In Progress': 'IN_PROGRESS',
      'Completed': 'COMPLETED',
    }

    let imported = 0
    let skipped = 0
    let failed = 0

    for (const record of records) {
      try {
        // Check if quote already exists
        const existingQuote = await prisma.quote.findUnique({
          where: { quoteNumber: record.quote_number },
        })

        if (existingQuote) {
          skipped++
          continue
        }

        // Find customer by CRM ID (need to map somehow)
        // For now, use first customer as default
        const customer = await prisma.corporate.findFirst()

        if (!customer) {
          console.warn(`⚠️  No customers found. Import customers first.`)
          failed++
          continue
        }

        // Get first available language pair
        let languagePair = await prisma.languagePair.findFirst()

        if (!languagePair) {
          console.warn(`⚠️  No language pairs found. Add language pairs first.`)
          failed++
          continue
        }

        await prisma.quote.create({
          data: {
            quoteNumber: record.quote_number,
            customerId: customer.id,
            languagePairId: languagePair.id,
            status: statusMap[record.status] || 'DRAFT',
            description: record.name,
            sourceLanguage: 'English',
            targetLanguage: 'Spanish',
            wordCount: 0,
            ratePerUnit: languagePair.ratePerWord,
            minimumCharge: languagePair.minimumCharge,
            subtotal: Math.max(parseFloat(record.total) - parseFloat(record.tax), 0),
            tax: parseFloat(record.tax),
            total: parseFloat(record.total),
            requestedDeliveryDate: record.expected_close
              ? new Date(record.expected_close)
              : null,
            createdAt: new Date(record.created_at),
            updatedAt: new Date(record.updated_at),
          },
        })

        imported++
      } catch (error) {
        failed++
        console.error(`❌ Error importing quote ${record.quote_number}:`, error)
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

migrateQuotes()
