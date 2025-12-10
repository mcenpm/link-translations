/**
 * Update quotes with billing contact information from CRM
 * This adds billingContactName and billingContactCrmId from quote_contacts.tsv
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface QuoteContactData {
  id: string           // CRM quote id (legacyId)
  number: string       // Quote number
  billingContact: string  // Contact name
  billingContactId: string // Contact CRM ID
}

async function parseQuoteContacts(filePath: string): Promise<QuoteContactData[]> {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.trim().split('\n')
  
  // Skip header
  const dataLines = lines.slice(1)
  
  const contacts: QuoteContactData[] = []
  
  for (const line of dataLines) {
    const parts = line.split('\t')
    if (parts.length >= 4) {
      contacts.push({
        id: parts[0]?.trim() || '',
        number: parts[1]?.trim() || '',
        billingContact: parts[2]?.trim() || '',
        billingContactId: parts[3]?.trim() || ''
      })
    }
  }
  
  return contacts
}

async function main() {
  console.log('🔄 Starting quote billing contact update...\n')
  
  const filePath = path.join(process.cwd(), 'data', 'quote_contacts.tsv')
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath)
    process.exit(1)
  }
  
  // Parse TSV
  console.log('📖 Parsing quote_contacts.tsv...')
  const contactData = await parseQuoteContacts(filePath)
  console.log(`   Found ${contactData.length} quote records with contact info`)
  
  // Build lookup map by quote number
  const contactByNumber = new Map<string, QuoteContactData>()
  const contactById = new Map<string, QuoteContactData>()
  
  for (const contact of contactData) {
    if (contact.number) {
      contactByNumber.set(contact.number, contact)
    }
    if (contact.id) {
      contactById.set(contact.id, contact)
    }
  }
  
  console.log(`   Created lookup maps: ${contactByNumber.size} by number, ${contactById.size} by id`)
  
  // Get all quotes from database
  console.log('\n📚 Fetching quotes from database...')
  const quotes = await prisma.quote.findMany({
    select: {
      id: true,
      quoteNumber: true,
      legacyId: true,
      billingContactName: true
    }
  })
  console.log(`   Found ${quotes.length} quotes in database`)
  
  // Update quotes in batches
  console.log('\n✏️  Updating quotes with billing contact info...')
  
  let updated = 0
  let notFound = 0
  
  for (let i = 0; i < quotes.length; i++) {
    const quote = quotes[i]
    
    // Find contact data by legacyId first, then by quoteNumber
    let contactInfo = quote.legacyId ? contactById.get(quote.legacyId) : null
    if (!contactInfo) {
      contactInfo = contactByNumber.get(quote.quoteNumber)
    }
    
    if (contactInfo && (contactInfo.billingContact || contactInfo.billingContactId)) {
      await prisma.quote.update({
        where: { id: quote.id },
        data: {
          billingContactName: contactInfo.billingContact || null,
          billingContactCrmId: contactInfo.billingContactId || null
        }
      })
      updated++
    } else {
      notFound++
    }
    
    // Progress
    if ((i + 1) % 5000 === 0) {
      console.log(`   Processed ${i + 1}/${quotes.length} quotes...`)
    }
  }
  
  console.log(`\n✅ Update complete!`)
  console.log(`   Updated: ${updated}`)
  console.log(`   Not found in TSV: ${notFound}`)
  
  // Verify
  const withContact = await prisma.quote.count({
    where: {
      billingContactName: { not: null }
    }
  })
  console.log(`\n📊 Verification: ${withContact} quotes now have billingContactName`)
  
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
