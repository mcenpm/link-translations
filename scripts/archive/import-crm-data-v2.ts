import { PrismaClient, QuoteStatus } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

// === INTERFACES ===

interface AccountRow {
  id: string
  name: string
  website: string
  billing_address_street: string
  billing_address_city: string
  billing_address_state: string
  billing_address_postalcode: string
  billing_address_country: string
  phone_office: string
  date_entered: string
}

interface CustomerContactRow {
  id: string
  crm_contact_id: string
  first_name: string
  last_name: string
  phone_work: string
  phone_mobile: string
  primary_address_city: string
  primary_address_state: string
  date_entered: string
  account_id: string
  email_address: string
}

interface VendorRow {
  id: string
  first_name: string
  last_name: string
  phone_work: string
  phone_mobile: string
  primary_address_city: string
  primary_address_state: string
  primary_address_country: string
  language1: string
  language2: string
  language3: string
  nativelanguage: string
  experience: string
  discipline: string
  translationrate: string
  minimumrate: string
  profile: string
  date_entered: string
}

interface QuoteRow {
  id: string
  number: string
  name: string
  billing_contact_id: string
  billing_account_id: string
  stage: string
  total_amount: string
  subtotal_amount: string
  tax_amount: string
  date_entered: string
  languagerequested_c: string
  discipline_c: string
}

// === HELPERS ===

function parseTSV<T>(filePath: string): T[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  
  if (lines.length === 0) return []
  
  const headers = lines[0].split('\t')
  const rows: T[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t')
    const row: Record<string, string> = {}
    
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || ''
    }
    
    rows.push(row as T)
  }
  
  return rows
}

function mapState(state: string): string | null {
  const stateMap: Record<string, string> = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC'
  }
  
  if (!state || state === 'NULL') return null
  if (state.length === 2) return state.toUpperCase()
  return stateMap[state] || null
}

function mapQuoteStatus(stage: string): QuoteStatus {
  const statusMap: Record<string, QuoteStatus> = {
    'Draft': QuoteStatus.DRAFT,
    'Quote Sent': QuoteStatus.QUOTE_SENT,
    'Negotiation/Review': QuoteStatus.NEGOTIATION_REVIEW,
    'Follow Up': QuoteStatus.FOLLOW_UP,
    'Invoice Paid': QuoteStatus.INVOICE_PAID,
    'Invoice Not Paid': QuoteStatus.INVOICE_NOT_PAID,
    'Rejected due to Price': QuoteStatus.REJECTED_PRICE,
    'Rejected (Other)': QuoteStatus.REJECTED_OTHER,
    'Refund': QuoteStatus.REFUND,
    'Bad Debt': QuoteStatus.BAD_DEBT,
  }
  
  return statusMap[stage] || QuoteStatus.DRAFT
}

function cleanString(str: string | null | undefined): string | null {
  if (!str || str === 'NULL' || str.trim() === '') return null
  return str.trim()
}

// === IMPORT FUNCTIONS ===

async function importAccounts(): Promise<Map<string, string>> {
  console.log('📦 Importing Accounts (Corporate Customers)...')
  
  const dataPath = path.join(__dirname, '../data/customers.tsv')
  const accounts = parseTSV<AccountRow>(dataPath)
  
  let imported = 0
  let skipped = 0
  let failed = 0
  
  const accountIdMap = new Map<string, string>()
  
  for (const account of accounts) {
    try {
      const companyName = cleanString(account.name)
      if (!companyName) {
        skipped++
        continue
      }
      
      // Check if already exists
      const existing = await prisma.corporate.findFirst({
        where: { company: companyName }
      })
      
      if (existing) {
        accountIdMap.set(account.id, existing.id)
        skipped++
        continue
      }
      
      // Create user first
      const email = `account_${account.id.substring(0, 8)}@imported.local`
      
      const user = await prisma.user.create({
        data: {
          email,
          firstName: companyName.substring(0, 50),
          role: 'CUSTOMER',
          password: '',
          phone: cleanString(account.phone_office),
        }
      })
      
      // Create customer (Account)
      const customer = await prisma.corporate.create({
        data: {
          userId: user.id,
          company: companyName,
          website: cleanString(account.website),
          billingAddress: cleanString(account.billing_address_street),
          billingCity: cleanString(account.billing_address_city),
          billingState: mapState(account.billing_address_state),
          billingZip: cleanString(account.billing_address_postalcode),
          billingCountry: cleanString(account.billing_address_country),
          createdAt: account.date_entered ? new Date(account.date_entered) : new Date(),
        }
      })
      
      accountIdMap.set(account.id, customer.id)
      imported++
      
      if (imported % 500 === 0) {
        console.log(`  ✓ ${imported} accounts imported...`)
      }
    } catch (error) {
      failed++
    }
  }
  
  console.log(`✅ Accounts: ${imported} imported, ${skipped} skipped, ${failed} failed`)
  return accountIdMap
}

async function importCustomerContacts(accountIdMap: Map<string, string>): Promise<Map<string, string>> {
  console.log('📦 Importing Customer Contacts...')
  
  const dataPath = path.join(__dirname, '../data/customer_contacts_v3.tsv')
  const contacts = parseTSV<CustomerContactRow>(dataPath)
  
  let imported = 0
  let skipped = 0
  let failed = 0
  
  // Map CRM contact ID to our contact ID
  const contactIdMap = new Map<string, string>()
  
  for (const contact of contacts) {
    try {
      const firstName = cleanString(contact.first_name)
      const lastName = cleanString(contact.last_name)
      
      if (!firstName && !lastName) {
        skipped++
        continue
      }
      
      // Find customer by account_id
      const customerId = accountIdMap.get(contact.account_id)
      if (!customerId) {
        skipped++
        continue
      }
      
      // Get email
      const email = cleanString(contact.email_address)
      
      // Create customer contact
      const customerContact = await prisma.contact.create({
        data: {
          customerId,
          firstName: firstName || 'Unknown',
          lastName: lastName || '',
          email: email || null,
          phone: cleanString(contact.phone_work) || cleanString(contact.phone_mobile),
          createdAt: contact.date_entered ? new Date(contact.date_entered) : new Date(),
        }
      })
      
      // Store mapping from CRM contact ID to our contact ID
      if (contact.crm_contact_id) {
        contactIdMap.set(contact.crm_contact_id, customerContact.id)
      }
      
      imported++
      
      if (imported % 2000 === 0) {
        console.log(`  ✓ ${imported} customer contacts imported...`)
      }
    } catch (error) {
      failed++
    }
  }
  
  console.log(`✅ Customer Contacts: ${imported} imported, ${skipped} skipped, ${failed} failed`)
  return contactIdMap
}
async function importVendors() {
  console.log('📦 Importing Vendors (Linguists)...')
  
  const dataPath = path.join(__dirname, '../data/vendors.tsv')
  const vendors = parseTSV<VendorRow>(dataPath)
  
  let imported = 0
  let skipped = 0
  let failed = 0
  
  for (const vendor of vendors) {
    try {
      const firstName = cleanString(vendor.first_name)
      const lastName = cleanString(vendor.last_name)
      
      if (!firstName && !lastName) {
        skipped++
        continue
      }
      
      // Create user first
      const email = `vendor_${vendor.id.substring(0, 8)}@imported.local`
      
      const user = await prisma.user.create({
        data: {
          email,
          firstName: firstName || 'Unknown',
          lastName: lastName || '',
          role: 'LINGUIST',
          password: '',
          phone: cleanString(vendor.phone_work) || cleanString(vendor.phone_mobile),
        }
      })
      
      // Build languages array
      const languages: string[] = []
      if (cleanString(vendor.language1)) languages.push(vendor.language1)
      if (cleanString(vendor.language2)) languages.push(vendor.language2)
      if (cleanString(vendor.language3)) languages.push(vendor.language3)
      
      // Create linguist
      await prisma.linguist.create({
        data: {
          userId: user.id,
          firstName: firstName || 'Unknown',
          lastName: lastName || '',
          email,
          phone: cleanString(vendor.phone_work) || cleanString(vendor.phone_mobile),
          city: cleanString(vendor.primary_address_city),
          state: mapState(vendor.primary_address_state || ''),
          country: cleanString(vendor.primary_address_country),
          nativeLanguage: cleanString(vendor.nativelanguage),
          languages: languages.length > 0 ? languages : [],
          experience: cleanString(vendor.experience),
          specializations: cleanString(vendor.discipline) ? [vendor.discipline] : [],
          bio: cleanString(vendor.profile),
          ratePerWord: vendor.translationrate ? parseFloat(vendor.translationrate.replace(/[^0-9.]/g, '')) / 100 : null,
          minimumCharge: vendor.minimumrate ? parseFloat(vendor.minimumrate.replace(/[^0-9.]/g, '')) : null,
          createdAt: vendor.date_entered ? new Date(vendor.date_entered) : new Date(),
        }
      })
      
      imported++
      
      if (imported % 1000 === 0) {
        console.log(`  ✓ ${imported} vendors imported...`)
      }
    } catch (error) {
      failed++
    }
  }
  
  console.log(`✅ Vendors (Linguists): ${imported} imported, ${skipped} skipped, ${failed} failed`)
}

async function importQuotes(accountIdMap: Map<string, string>, contactIdMap: Map<string, string>) {
  console.log('📦 Importing Quotes...')
  
  const dataPath = path.join(__dirname, '../data/quotes_with_contact.tsv')
  const quotes = parseTSV<QuoteRow>(dataPath)
  
  let imported = 0
  let skipped = 0
  let failed = 0
  
  // Get default language pair for pricing
  const languagePair = await prisma.languagePair.findFirst()
  
  for (const quote of quotes) {
    try {
      const customerId = accountIdMap.get(quote.billing_account_id)
      
      if (!customerId) {
        skipped++
        continue
      }
      
      // Check if quote number already exists
      if (quote.number) {
        const existing = await prisma.quote.findFirst({
          where: { quoteNumber: quote.number }
        })
        
        if (existing) {
          skipped++
          continue
        }
      }
      
      const quoteNumber = quote.number || `QT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      
      // Get contact ID from the map
      const contactId = quote.billing_contact_id ? contactIdMap.get(quote.billing_contact_id) : null
      
      // Parse language from languagerequested_c
      const targetLang = cleanString(quote.languagerequested_c) || 'es'
      
      await prisma.quote.create({
        data: {
          customerId,
          contactId: contactId || null,
          quoteNumber,
          description: cleanString(quote.name) || 'Imported Quote',
          status: mapQuoteStatus(quote.stage),
          sourceLanguage: 'en',
          targetLanguage: targetLang.toLowerCase().substring(0, 10),
          wordCount: 0,
          ratePerUnit: languagePair?.ratePerWord || 0.20,
          minimumCharge: languagePair?.minimumCharge || 25,
          subtotal: quote.subtotal_amount && quote.subtotal_amount !== 'NULL' ? parseFloat(quote.subtotal_amount) : 0,
          tax: quote.tax_amount && quote.tax_amount !== 'NULL' ? parseFloat(quote.tax_amount) : 0,
          total: quote.total_amount && quote.total_amount !== 'NULL' ? parseFloat(quote.total_amount) : 0,
          languagePairId: languagePair?.id || null,
          createdAt: quote.date_entered ? new Date(quote.date_entered) : new Date(),
        }
      })
      
      imported++
      
      if (imported % 2000 === 0) {
        console.log(`  ✓ ${imported} quotes imported...`)
      }
    } catch (error) {
      failed++
    }
  }
  
  console.log(`✅ Quotes: ${imported} imported, ${skipped} skipped, ${failed} failed`)
}

async function createProjectsFromQuotes() {
  console.log('📦 Creating Projects from Invoice Paid/Not Paid Quotes...')
  
  const quotes = await prisma.quote.findMany({
    where: {
      status: {
        in: ['INVOICE_PAID', 'INVOICE_NOT_PAID']
      }
    }
  })
  
  let created = 0
  let failed = 0
  
  for (const quote of quotes) {
    try {
      // Use quote number as project number
      const projectNumber = quote.quoteNumber
      
      await prisma.project.create({
        data: {
          projectNumber,
          quoteId: quote.id,
          customerId: quote.customerId,
          name: `Project for ${quote.quoteNumber}`,
          status: quote.status === 'INVOICE_PAID' ? 'COMPLETED' : 'IN_PROGRESS',
        }
      })
      
      created++
      
      if (created % 2000 === 0) {
        console.log(`  ✓ ${created} projects created...`)
      }
    } catch (error) {
      failed++
    }
  }
  
  console.log(`✅ Projects: ${created} created, ${failed} failed`)
}

// === MAIN ===

async function main() {
  console.log('🚀 Starting CRM data import (v2)...\n')
  
  // 1. Import Accounts (Corporate Customers)
  const accountIdMap = await importAccounts()
  
  // 2. Import Customer Contacts (linked to Accounts) - returns contactIdMap
  const contactIdMap = await importCustomerContacts(accountIdMap)
  
  // 3. Import Vendors (Linguists)
  await importVendors()
  
  // 4. Import Quotes (with contact relationship)
  await importQuotes(accountIdMap, contactIdMap)
  
  // 5. Create Projects from Invoice Paid/Not Paid quotes
  await createProjectsFromQuotes()
  
  // Stats
  const stats = await prisma.$transaction([
    prisma.corporate.count(),
    prisma.contact.count(),
    prisma.linguist.count(),
    prisma.quote.count(),
    prisma.project.count(),
  ])
  
  console.log('\n🎉 Import completed!')
  console.log('\n📊 Database stats:')
  console.log(`   Accounts (Customers): ${stats[0]}`)
  console.log(`   Customer Contacts: ${stats[1]}`)
  console.log(`   Vendors (Linguists): ${stats[2]}`)
  console.log(`   Quotes: ${stats[3]}`)
  console.log(`   Projects: ${stats[4]}`)
  
  await prisma.$disconnect()
}

main().catch(console.error)