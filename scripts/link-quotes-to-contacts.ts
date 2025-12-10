/**
 * Link quotes to CustomerContacts using billing_contact_id from CRM data
 * 
 * Data file: data/quotes_full.tsv
 * Column 8: billing_contact_id (CRM contact ID)
 * 
 * This will update Quote.contactId to link quotes to their contacts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function linkQuotesToContacts() {
  console.log('Starting quote-contact linking...\n')

  // Read quotes data file
  const dataPath = path.join(process.cwd(), 'data', 'quotes_full.tsv')
  const content = fs.readFileSync(dataPath, 'utf-8')
  const lines = content.split('\n').filter(line => !line.startsWith('Warning:'))
  
  // Parse header
  const headers = lines[0].split('\t')
  const idIdx = headers.indexOf('id')
  const contactIdIdx = headers.indexOf('billing_contact_id')
  
  console.log('Column indexes:', { idIdx, contactIdIdx })
  
  // Build quote -> contact mapping from CRM data
  const quoteContactMap = new Map<string, string>() // quoteId -> contactLegacyId
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t')
    const quoteId = cols[idIdx]?.trim()
    const contactLegacyId = cols[contactIdIdx]?.trim()
    
    if (quoteId && contactLegacyId && contactLegacyId !== 'NULL' && contactLegacyId.length > 10) {
      quoteContactMap.set(quoteId, contactLegacyId)
    }
  }
  
  console.log(`Found ${quoteContactMap.size} quotes with billing_contact_id in CRM data\n`)

  // Get all contacts with their legacy IDs
  const contacts = await prisma.contact.findMany({
    where: { legacyId: { not: null } },
    select: { id: true, legacyId: true }
  })
  
  const contactIdMap = new Map<string, string>() // legacyId -> id
  for (const c of contacts) {
    if (c.legacyId) {
      contactIdMap.set(c.legacyId, c.id)
    }
  }
  console.log(`Found ${contactIdMap.size} contacts with legacy IDs\n`)

  // Get all quotes with their legacy IDs
  const quotes = await prisma.quote.findMany({
    where: { 
      legacyId: { not: null },
      contactId: null  // Only quotes without contact link
    },
    select: { id: true, legacyId: true }
  })
  
  console.log(`Found ${quotes.length} quotes without contactId\n`)

  // Link quotes to contacts
  let linked = 0
  let notFound = 0
  
  for (const quote of quotes) {
    if (!quote.legacyId) continue
    
    const contactLegacyId = quoteContactMap.get(quote.legacyId)
    if (!contactLegacyId) {
      notFound++
      continue
    }
    
    const contactId = contactIdMap.get(contactLegacyId)
    if (!contactId) {
      notFound++
      continue
    }
    
    await prisma.quote.update({
      where: { id: quote.id },
      data: { contactId }
    })
    
    linked++
    if (linked % 1000 === 0) {
      console.log(`Linked ${linked} quotes...`)
    }
  }

  console.log(`\n=== RESULTS ===`)
  console.log(`Linked: ${linked} quotes`)
  console.log(`Not found: ${notFound} (no matching contact)`)
  
  // Verify
  const withContact = await prisma.quote.count({ where: { contactId: { not: null } } })
  console.log(`\nTotal quotes with contactId: ${withContact}`)
}

linkQuotesToContacts()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
