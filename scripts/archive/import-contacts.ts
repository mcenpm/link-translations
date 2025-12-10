import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

// Parse TSV file
function parseTSV<T>(filePath: string): T[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  
  if (lines.length === 0) return []
  
  const startLine = lines[0].includes('Warning') ? 1 : 0
  const headers = lines[startLine].split('\t').map(h => h.trim())
  const rows: T[] = []
  
  for (let i = startLine + 1; i < lines.length; i++) {
    const values = lines[i].split('\t')
    const row: any = {}
    
    for (let j = 0; j < headers.length; j++) {
      const value = values[j]?.trim() || ''
      row[headers[j]] = value === 'NULL' || value === '' ? null : value
    }
    
    rows.push(row as T)
  }
  
  return rows
}

interface ContactRow {
  id: string
  first_name: string | null
  last_name: string | null
  title: string | null
  department: string | null
  phone_work: string | null
  phone_mobile: string | null
  phone_home: string | null
  phone_fax: string | null
  primary_address_street: string | null
  primary_address_city: string | null
  primary_address_state: string | null
  primary_address_postalcode: string | null
  primary_address_country: string | null
  date_entered: string | null
  email: string | null
  account_id: string | null
}

async function importContacts() {
  console.log('📦 Importing contacts (CustomerContact)...')
  
  // Load customer id map
  const customerIdMapPath = path.join(__dirname, '../data/customer-id-map.json')
  let customerIdMap = new Map<string, string>()
  
  if (fs.existsSync(customerIdMapPath)) {
    const mapData = JSON.parse(fs.readFileSync(customerIdMapPath, 'utf-8'))
    customerIdMap = new Map(Object.entries(mapData))
    console.log(`  Loaded ${customerIdMap.size} customer ID mappings`)
  }
  
  const dataPath = path.join(__dirname, '../data/contacts_full.tsv')
  const contacts = parseTSV<ContactRow>(dataPath)
  
  console.log(`  Found ${contacts.length} contacts to import`)
  
  let imported = 0, skipped = 0, failed = 0
  
  for (const contact of contacts) {
    try {
      // Get customer ID from mapping
      const customerId = customerIdMap.get(contact.account_id || '')
      
      if (!customerId) {
        skipped++
        continue
      }
      
      const firstName = contact.first_name || ''
      const lastName = contact.last_name || 'Unknown'
      
      // Skip if no name
      if (!firstName && lastName === 'Unknown') {
        skipped++
        continue
      }
      
      await prisma.contact.create({
        data: {
          customerId,
          firstName,
          lastName,
          title: contact.title,
          email: contact.email,
          phone: contact.phone_work || contact.phone_mobile || contact.phone_home,
          isPrimary: false,
        }
      })
      
      imported++
      if (imported % 1000 === 0) console.log(`  ✓ ${imported} contacts imported...`)
    } catch (error: any) {
      failed++
    }
  }
  
  console.log(`✅ Contacts: ${imported} imported, ${skipped} skipped, ${failed} failed\n`)
}

importContacts()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
