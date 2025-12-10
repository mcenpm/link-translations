/**
 * Update CustomerContacts with legacyId from CRM contact ID
 * Maps customer_contacts_v3.tsv crm_contact_id to CustomerContact.legacyId
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface ContactRow {
  crm_contact_id: string
  first_name: string
  last_name: string
  email_address: string
}

function parseTSV(filePath: string): ContactRow[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.trim().split('\n')
  const headers = lines[0].split('\t')
  
  return lines.slice(1).map(line => {
    const values = line.split('\t')
    const row: Record<string, string> = {}
    headers.forEach((header, i) => {
      row[header] = values[i] || ''
    })
    return row as unknown as ContactRow
  })
}

function cleanString(str: string | undefined): string {
  if (!str || str === 'NULL' || str === 'null') return ''
  return str.trim()
}

async function main() {
  console.log('🔄 Updating CustomerContact legacyId...\n')
  
  const filePath = path.join(process.cwd(), 'data', 'customer_contacts_v3.tsv')
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath)
    process.exit(1)
  }
  
  // Parse TSV
  console.log('📖 Parsing customer_contacts_v3.tsv...')
  const contacts = parseTSV(filePath)
  console.log(`   Found ${contacts.length} contact records`)
  
  // Build lookup by email+name combination
  const contactMap = new Map<string, string>() // key -> crm_contact_id
  
  for (const contact of contacts) {
    const crmId = cleanString(contact.crm_contact_id)
    const email = cleanString(contact.email_address)?.toLowerCase()
    const firstName = cleanString(contact.first_name)?.toLowerCase()
    const lastName = cleanString(contact.last_name)?.toLowerCase()
    
    if (crmId) {
      // Create multiple keys for matching
      if (email) {
        contactMap.set(`email:${email}`, crmId)
      }
      if (firstName && lastName) {
        contactMap.set(`name:${firstName}:${lastName}`, crmId)
      }
      if (email && firstName && lastName) {
        contactMap.set(`full:${email}:${firstName}:${lastName}`, crmId)
      }
    }
  }
  
  console.log(`   Created ${contactMap.size} lookup keys`)
  
  // Get all CustomerContacts
  console.log('\n📚 Fetching CustomerContacts from database...')
  const customerContacts = await prisma.contact.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      legacyId: true
    }
  })
  console.log(`   Found ${customerContacts.length} contacts in database`)
  
  // Update contacts with legacyId
  console.log('\n✏️  Updating contacts with legacyId...')
  
  let updated = 0
  let notFound = 0
  let alreadySet = 0
  
  for (let i = 0; i < customerContacts.length; i++) {
    const contact = customerContacts[i]
    
    if (contact.legacyId) {
      alreadySet++
      continue
    }
    
    const email = contact.email?.toLowerCase() || ''
    const firstName = contact.firstName?.toLowerCase() || ''
    const lastName = contact.lastName?.toLowerCase() || ''
    
    // Try to find CRM ID using various keys
    let crmId = contactMap.get(`full:${email}:${firstName}:${lastName}`)
    if (!crmId && email) {
      crmId = contactMap.get(`email:${email}`)
    }
    if (!crmId && firstName && lastName) {
      crmId = contactMap.get(`name:${firstName}:${lastName}`)
    }
    
    if (crmId) {
      try {
        await prisma.contact.update({
          where: { id: contact.id },
          data: { legacyId: crmId }
        })
        updated++
      } catch {
        // Likely duplicate legacyId, skip
        notFound++
      }
    } else {
      notFound++
    }
    
    // Progress
    if ((i + 1) % 5000 === 0) {
      console.log(`   Processed ${i + 1}/${customerContacts.length} contacts...`)
    }
  }
  
  console.log(`\n✅ Update complete!`)
  console.log(`   Updated: ${updated}`)
  console.log(`   Already set: ${alreadySet}`)
  console.log(`   Not matched: ${notFound}`)
  
  // Verify
  const withLegacyId = await prisma.contact.count({
    where: { legacyId: { not: null } }
  })
  console.log(`\n📊 Verification: ${withLegacyId} contacts now have legacyId`)
  
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
