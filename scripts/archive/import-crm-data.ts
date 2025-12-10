import { PrismaClient, QuoteStatus } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

interface CustomerRow {
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

interface QuoteRow {
  id: string
  number: string
  name: string
  billing_account_id: string
  stage: string
  total_amount: string
  subtotal_amount: string
  tax_amount: string
  date_entered: string
}

interface ContactRow {
  id: string
  first_name: string
  last_name: string
  phone_work: string
  phone_mobile: string
  primary_address_city: string
  primary_address_state: string
  date_entered: string
}

function parseTSV<T>(filePath: string): T[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  
  if (lines.length === 0) return []
  
  const headers = lines[0].split('\t')
  const rows: T[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t')
    const row: any = {}
    
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
  
  if (!state) return null
  
  // Already a code
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

async function importCustomers() {
  console.log('📦 Importing customers...')
  
  const dataPath = path.join(__dirname, '../data/customers.tsv')
  const customers = parseTSV<CustomerRow>(dataPath)
  
  let imported = 0
  let skipped = 0
  let failed = 0
  
  // Map to store CRM ID -> our customer ID
  const customerIdMap = new Map<string, string>()
  
  for (const customer of customers) {
    try {
      if (!customer.name || customer.name === 'NULL') {
        skipped++
        continue
      }
      
      // Check if already exists
      const existing = await prisma.corporate.findFirst({
        where: { company: customer.name }
      })
      
      if (existing) {
        customerIdMap.set(customer.id, existing.id)
        skipped++
        continue
      }
      
      // Create user first
      const email = `customer_${customer.id.substring(0, 8)}@imported.local`
      
      const user = await prisma.user.create({
        data: {
          email,
          firstName: customer.name.substring(0, 50),
          role: 'CUSTOMER',
          password: '',
          phone: customer.phone_office !== 'NULL' ? customer.phone_office : null,
        }
      })
      
      // Create customer
      const stateCode = mapState(customer.billing_address_state)
      
      const newCustomer = await prisma.corporate.create({
        data: {
          userId: user.id,
          company: customer.name,
          website: customer.website !== 'NULL' ? customer.website : null,
          billingAddress: customer.billing_address_street !== 'NULL' ? customer.billing_address_street : null,
          billingCity: customer.billing_address_city !== 'NULL' ? customer.billing_address_city : null,
          billingState: stateCode,
          billingZip: customer.billing_address_postalcode !== 'NULL' ? customer.billing_address_postalcode : null,
          billingCountry: customer.billing_address_country !== 'NULL' ? customer.billing_address_country : null,
        }
      })
      
      customerIdMap.set(customer.id, newCustomer.id)
      imported++
      
      if (imported % 500 === 0) {
        console.log(`  ✓ ${imported} customers imported...`)
      }
    } catch (error) {
      failed++
    }
  }
  
  console.log(`✅ Customers: ${imported} imported, ${skipped} skipped, ${failed} failed`)
  
  // Save mapping for quotes import
  fs.writeFileSync(
    path.join(__dirname, '../data/customer-id-map.json'),
    JSON.stringify(Object.fromEntries(customerIdMap))
  )
  
  return customerIdMap
}

async function importQuotes(customerIdMap: Map<string, string>) {
  console.log('📦 Importing quotes...')
  
  const dataPath = path.join(__dirname, '../data/quotes_new.tsv')
  const quotes = parseTSV<QuoteRow>(dataPath)
  
  let imported = 0
  let skipped = 0
  let failed = 0
  
  // Get default language pair for pricing
  const languagePair = await prisma.languagePair.findFirst()
  
  for (const quote of quotes) {
    try {
      const customerId = customerIdMap.get(quote.billing_account_id)
      
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
      
      await prisma.quote.create({
        data: {
          customerId,
          quoteNumber,
          description: quote.name || 'Imported Quote',
          status: mapQuoteStatus(quote.stage),
          sourceLanguage: 'en',
          targetLanguage: 'es',
          wordCount: 0,
          ratePerUnit: languagePair?.ratePerWord || 0.20,
          minimumCharge: languagePair?.minimumCharge || 25,
          subtotal: quote.subtotal_amount ? parseFloat(quote.subtotal_amount) : 0,
          tax: quote.tax_amount ? parseFloat(quote.tax_amount) : 0,
          total: quote.total_amount ? parseFloat(quote.total_amount) : 0,
          languagePairId: languagePair?.id || '',
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

async function importContacts(customerIdMap: Map<string, string>) {
  console.log('📦 Importing contacts...')
  
  const dataPath = path.join(__dirname, '../data/contacts.tsv')
  const contacts = parseTSV<ContactRow>(dataPath)
  
  let imported = 0
  let skipped = 0
  let failed = 0
  
  for (const contact of contacts) {
    try {
      const firstName = contact.first_name !== 'NULL' ? contact.first_name : ''
      const lastName = contact.last_name !== 'NULL' ? contact.last_name : ''
      
      if (!firstName && !lastName) {
        skipped++
        continue
      }
      
      // Create as linguist (since these are translators/interpreters)
      const email = `linguist_${contact.id.substring(0, 8)}@imported.local`
      
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (existingUser) {
        skipped++
        continue
      }
      
      const user = await prisma.user.create({
        data: {
          email,
          firstName: `${firstName} ${lastName}`.trim(),
          role: 'LINGUIST',
          password: '',
          phone: contact.phone_work !== 'NULL' ? contact.phone_work : contact.phone_mobile !== 'NULL' ? contact.phone_mobile : null,
        }
      })
      
      const stateCode = mapState(contact.primary_address_state)
      
      await prisma.linguist.create({
        data: {
          userId: user.id,
          city: contact.primary_address_city !== 'NULL' ? contact.primary_address_city : null,
          state: stateCode,
          isActive: true,
          isVerified: true,
        }
      })
      
      imported++
      
      if (imported % 2000 === 0) {
        console.log(`  ✓ ${imported} contacts imported...`)
      }
    } catch (error) {
      failed++
    }
  }
  
  console.log(`✅ Contacts/Linguists: ${imported} imported, ${skipped} skipped, ${failed} failed`)
}

async function main() {
  console.log('🚀 Starting CRM data import...\n')
  
  try {
    const customerIdMap = await importCustomers()
    await importQuotes(customerIdMap)
    await importContacts(customerIdMap)
    
    console.log('\n🎉 Import completed!')
    
    // Show stats
    const customerCount = await prisma.corporate.count()
    const quoteCount = await prisma.quote.count()
    const linguistCount = await prisma.linguist.count()
    
    console.log(`\n📊 Database stats:`)
    console.log(`   Customers: ${customerCount}`)
    console.log(`   Quotes: ${quoteCount}`)
    console.log(`   Linguists: ${linguistCount}`)
    
  } catch (error) {
    console.error('❌ Import failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
