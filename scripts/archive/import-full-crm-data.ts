import { PrismaClient, UserRole, QuoteStatus, Discipline } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

// Parse TSV file
function parseTSV<T>(filePath: string): T[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  
  if (lines.length === 0) return []
  
  // Skip the warning line if present
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

// Map state name to code
function mapState(state: string | null): string | null {
  if (!state) return null
  
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
  
  if (state.length === 2) return state.toUpperCase()
  return stateMap[state] || state.substring(0, 2).toUpperCase()
}

// Map quote status
function mapQuoteStatus(status: string | null): QuoteStatus {
  if (!status) return QuoteStatus.DRAFT
  
  const statusMap: Record<string, QuoteStatus> = {
    'Pending Approval': QuoteStatus.QUOTE_SENT,
    'Approved': QuoteStatus.INVOICE_PAID,
    'Rejected': QuoteStatus.REJECTED_OTHER,
    'Invoice Paid': QuoteStatus.INVOICE_PAID,
    'Invoiced': QuoteStatus.INVOICE_NOT_PAID,
    'In Progress': QuoteStatus.FOLLOW_UP,
    'Completed': QuoteStatus.INVOICE_PAID,
    'Cancelled': QuoteStatus.REJECTED_OTHER,
    'Draft': QuoteStatus.DRAFT,
    'Quote Sent': QuoteStatus.QUOTE_SENT,
    'Negotiation Review': QuoteStatus.NEGOTIATION_REVIEW,
    'Follow Up': QuoteStatus.FOLLOW_UP,
    'Rejected Price': QuoteStatus.REJECTED_PRICE,
    'Refund': QuoteStatus.REFUND,
    'Bad Debt': QuoteStatus.BAD_DEBT,
  }
  
  return statusMap[status] || QuoteStatus.DRAFT
}

// Map discipline
function mapDiscipline(discipline: string | null): Discipline {
  if (!discipline) return Discipline.BOTH
  const d = discipline.toLowerCase()
  if (d.includes('interpret')) return Discipline.INTERPRETATION
  if (d.includes('translat')) return Discipline.TRANSLATION
  return Discipline.BOTH
}

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...')
  await prisma.quote.deleteMany()
  await prisma.linguistLanguage.deleteMany()
  await prisma.linguist.deleteMany()
  await prisma.corporate.deleteMany()
  await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } })
  console.log('✅ Database cleared\n')
}

async function importAccounts() {
  console.log('📦 Importing accounts (customers)...')
  
  interface AccountRow {
    id: string
    name: string | null
    website: string | null
    industry: string | null
    annual_revenue: string | null
    phone_office: string | null
    phone_fax: string | null
    billing_address_street: string | null
    billing_address_city: string | null
    billing_address_state: string | null
    billing_address_postalcode: string | null
    billing_address_country: string | null
    shipping_address_street: string | null
    shipping_address_city: string | null
    shipping_address_state: string | null
    shipping_address_postalcode: string | null
    account_type: string | null
    employees: string | null
    date_entered: string | null
    email: string | null
  }
  
  const dataPath = path.join(__dirname, '../data/accounts_full.tsv')
  const accounts = parseTSV<AccountRow>(dataPath)
  
  const customerIdMap = new Map<string, string>()
  let imported = 0, skipped = 0, failed = 0
  
  for (const account of accounts) {
    try {
      if (!account.name) { skipped++; continue }
      
      // Get primary email
      let email = account.email?.split(',')[0]?.trim()
      if (!email || email.includes('@imported.local')) {
        email = `customer_${account.id.substring(0, 8)}@linktranslations.com`
      }
      
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        const existingCustomer = await prisma.corporate.findUnique({ where: { userId: existingUser.id } })
        if (existingCustomer) {
          customerIdMap.set(account.id, existingCustomer.id)
          skipped++
          continue
        }
      }
      
      const user = await prisma.user.create({
        data: {
          email,
          firstName: account.name.substring(0, 50),
          role: UserRole.CUSTOMER,
          password: '',
          phone: account.phone_office,
        }
      })
      
      const customer = await prisma.corporate.create({
        data: {
          userId: user.id,
          company: account.name,
          website: account.website,
          industry: account.industry,
          billingAddress: account.billing_address_street,
          billingCity: account.billing_address_city,
          billingState: mapState(account.billing_address_state),
          billingZip: account.billing_address_postalcode,
          billingCountry: account.billing_address_country,
          shippingAddress: account.shipping_address_street,
          shippingCity: account.shipping_address_city,
          shippingState: mapState(account.shipping_address_state),
          shippingZip: account.shipping_address_postalcode,
        }
      })
      
      customerIdMap.set(account.id, customer.id)
      imported++
      
      if (imported % 500 === 0) console.log(`  ✓ ${imported} accounts imported...`)
    } catch (error) {
      failed++
    }
  }
  
  console.log(`✅ Accounts: ${imported} imported, ${skipped} skipped, ${failed} failed\n`)
  
  // Save mapping
  fs.writeFileSync(
    path.join(__dirname, '../data/customer-id-map.json'),
    JSON.stringify(Object.fromEntries(customerIdMap))
  )
  
  return customerIdMap
}

async function importVendors() {
  console.log('📦 Importing vendors (linguists)...')
  
  interface VendorRow {
    id: string
    first_name: string | null
    last_name: string | null
    title: string | null
    phone_work: string | null
    phone_mobile: string | null
    phone_home: string | null
    primary_address_street: string | null
    primary_address_city: string | null
    primary_address_state: string | null
    primary_address_postalcode: string | null
    primary_address_country: string | null
    language1: string | null
    language2: string | null
    language3: string | null
    language4: string | null
    experience: string | null
    discipline: string | null
    subjects: string | null
    date_entered: string | null
    email: string | null
  }
  
  const dataPath = path.join(__dirname, '../data/vendors_full.tsv')
  const vendors = parseTSV<VendorRow>(dataPath)
  
  let imported = 0, skipped = 0, failed = 0
  
  for (const vendor of vendors) {
    try {
      const firstName = vendor.first_name || ''
      const lastName = vendor.last_name || ''
      
      if (!firstName && !lastName) { skipped++; continue }
      
      let email = vendor.email?.trim()
      if (!email) {
        email = `linguist_${vendor.id?.substring(0, 8) || Math.random().toString(36).substring(2, 10)}@linktranslations.com`
      }
      
      // Make email unique by appending random if exists
      let finalEmail = email
      let attempts = 0
      while (attempts < 5) {
        const existingUser = await prisma.user.findUnique({ where: { email: finalEmail } })
        if (!existingUser) break
        finalEmail = `${email.split('@')[0]}_${Math.random().toString(36).substring(2, 6)}@${email.split('@')[1]}`
        attempts++
      }
      if (attempts === 5) { skipped++; continue }
      
      const phone = vendor.phone_work || vendor.phone_mobile || vendor.phone_home
      
      const user = await prisma.user.create({
        data: {
          email: finalEmail,
          firstName,
          lastName,
          role: UserRole.LINGUIST,
          password: '',
          phone,
        }
      })
      
      // Parse experience years
      let experienceStr = ''
      if (vendor.experience) {
        experienceStr = vendor.experience
      }
      
      await prisma.linguist.create({
        data: {
          userId: user.id,
          firstName: firstName || 'Unknown',
          lastName: lastName || 'Unknown',
          email: finalEmail,
          phone,
          bio: vendor.subjects ? `Specializes in: ${vendor.subjects}` : null,
          city: vendor.primary_address_city,
          state: mapState(vendor.primary_address_state),
          country: vendor.primary_address_country,
          experience: experienceStr || null,
          specializations: vendor.discipline ? [vendor.discipline] : [],
          isActive: true,
          isVerified: true,
        }
      })
      
      imported++
      if (imported % 500 === 0) console.log(`  ✓ ${imported} vendors imported...`)
    } catch (error: any) {
      if (imported < 5) console.log('Vendor error:', error.message)
      failed++
    }
  }
  
  console.log(`✅ Vendors: ${imported} imported, ${skipped} skipped, ${failed} failed\n`)
}

async function importQuotes(customerIdMap: Map<string, string>) {
  console.log('📦 Importing quotes...')
  
  interface QuoteRow {
    id: string
    number: string | null
    name: string | null
    description: string | null
    billing_account_id: string | null
    billing_account: string | null
    billing_contact: string | null
    billing_address: string | null
    billing_city: string | null
    billing_state: string | null
    billing_postal: string | null
    billing_country: string | null
    approval_status: string | null
    stage: string | null
    subtotal_amount: string | null
    tax_amount: string | null
    shipping_amount: string | null
    total_amount: string | null
    languagerequested_c: string | null
    discipline_c: string | null
    date_entered: string | null
    expiration: string | null
    estimated_completion: string | null
  }
  
  const dataPath = path.join(__dirname, '../data/quotes_full.tsv')
  const quotes = parseTSV<QuoteRow>(dataPath)
  
  // Get default language pair
  const languagePair = await prisma.languagePair.findFirst()
  if (!languagePair) {
    console.log('⚠️  No language pairs found. Skipping quotes import.')
    return
  }
  
  let imported = 0, skipped = 0, failed = 0
  
  for (const quote of quotes) {
    try {
      const customerId = quote.billing_account_id ? customerIdMap.get(quote.billing_account_id) : null
      
      if (!customerId) { skipped++; continue }
      
      const quoteNumber = quote.number || `QT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      
      // Check if exists
      const existing = await prisma.quote.findFirst({ where: { quoteNumber } })
      if (existing) { skipped++; continue }
      
      const subtotal = quote.subtotal_amount ? parseFloat(quote.subtotal_amount) : 0
      const tax = quote.tax_amount ? parseFloat(quote.tax_amount) : 0
      const total = quote.total_amount ? parseFloat(quote.total_amount) : subtotal + tax
      
      await prisma.quote.create({
        data: {
          customerId,
          quoteNumber,
          description: quote.name || quote.description || 'Imported Quote',
          status: mapQuoteStatus(quote.approval_status),
          sourceLanguage: 'en',
          targetLanguage: quote.languagerequested_c?.toLowerCase().substring(0, 2) || 'es',
          languagePairId: languagePair.id,
          wordCount: 0,
          ratePerUnit: languagePair.ratePerWord,
          minimumCharge: languagePair.minimumCharge,
          subtotal,
          tax,
          total,
          notes: quote.billing_contact ? `Contact: ${quote.billing_contact}` : null,
          createdAt: quote.date_entered ? new Date(quote.date_entered) : new Date(),
          requestedDeliveryDate: quote.estimated_completion ? new Date(quote.estimated_completion) : null,
        }
      })
      
      imported++
      if (imported % 2000 === 0) console.log(`  ✓ ${imported} quotes imported...`)
    } catch (error) {
      failed++
    }
  }
  
  console.log(`✅ Quotes: ${imported} imported, ${skipped} skipped, ${failed} failed\n`)
}

async function createAdminUser() {
  console.log('👤 Creating admin user...')
  
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@linktranslations.com' } })
  if (existingAdmin) {
    console.log('✅ Admin user already exists\n')
    return
  }
  
  const hashedPassword = await bcrypt.hash('LinkAdmin2024!', 10)
  
  await prisma.user.create({
    data: {
      email: 'admin@linktranslations.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
      phone: '1-877-272-5465',
    }
  })
  
  console.log('✅ Admin user created: admin@linktranslations.com / LinkAdmin2024!\n')
}

async function main() {
  console.log('🚀 Starting FULL CRM data import...\n')
  console.log('=' .repeat(50) + '\n')
  
  try {
    await clearDatabase()
    await createAdminUser()
    
    const customerIdMap = await importAccounts()
    await importVendors()
    await importQuotes(customerIdMap)
    
    // Final stats
    console.log('=' .repeat(50))
    console.log('\n📊 Final Database Stats:')
    const [customerCount, linguistCount, quoteCount, userCount] = await Promise.all([
      prisma.corporate.count(),
      prisma.linguist.count(),
      prisma.quote.count(),
      prisma.user.count(),
    ])
    
    console.log(`   👥 Users: ${userCount}`)
    console.log(`   🏢 Customers: ${customerCount}`)
    console.log(`   🗣️  Linguists: ${linguistCount}`)
    console.log(`   📝 Quotes: ${quoteCount}`)
    
    console.log('\n🎉 Import completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Import failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
