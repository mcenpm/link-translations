import { PrismaClient, UserRole } from '@prisma/client'
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

async function reimportLinguists() {
  console.log('🗑️ Clearing existing linguists...')
  
  // Delete linguists and their users
  await prisma.linguistLanguage.deleteMany()
  await prisma.linguist.deleteMany()
  await prisma.user.deleteMany({ where: { role: 'LINGUIST' } })
  
  console.log('📦 Importing vendors (linguists) with full data...')
  
  const dataPath = path.join(__dirname, '../data/vendors_full.tsv')
  const vendors = parseTSV<VendorRow>(dataPath)
  
  console.log(`  Found ${vendors.length} vendors to import`)
  
  // Track used emails to ensure uniqueness
  const usedEmails = new Set<string>()
  
  // First get all existing emails
  const existingEmails = await prisma.user.findMany({
    where: { role: { not: 'LINGUIST' } },
    select: { email: true }
  })
  existingEmails.forEach(u => usedEmails.add(u.email.toLowerCase()))
  
  let imported = 0, failed = 0
  const errors: string[] = []
  
  for (const vendor of vendors) {
    try {
      const firstName = vendor.first_name || ''
      const lastName = vendor.last_name || ''
      const vendorId = vendor.id || `unknown_${Math.random().toString(36).substring(2, 10)}`
      
      // Generate base email
      let baseEmail = vendor.email?.trim()
      if (!baseEmail) {
        // Generate email from name or id
        if (firstName || lastName) {
          baseEmail = `${firstName.toLowerCase().replace(/\s+/g, '')}.${lastName.toLowerCase().replace(/\s+/g, '')}@linktranslations.com`
        } else {
          baseEmail = `linguist_${vendorId.substring(0, 8)}@linktranslations.com`
        }
      }
      
      // Make email unique
      let finalEmail = baseEmail.toLowerCase()
      let counter = 1
      while (usedEmails.has(finalEmail)) {
        const [localPart, domain] = baseEmail.split('@')
        finalEmail = `${localPart}_${counter}@${domain}`.toLowerCase()
        counter++
        if (counter > 100) {
          // Use vendor id as fallback
          finalEmail = `linguist_${vendorId.substring(0, 8)}_${Math.random().toString(36).substring(2, 6)}@linktranslations.com`
          break
        }
      }
      usedEmails.add(finalEmail)
      
      const phone = vendor.phone_work || vendor.phone_mobile || vendor.phone_home
      
      // Collect languages
      const languages: string[] = []
      if (vendor.language1) languages.push(vendor.language1)
      if (vendor.language2) languages.push(vendor.language2)
      if (vendor.language3) languages.push(vendor.language3)
      if (vendor.language4) languages.push(vendor.language4)
      
      // Create user
      const user = await prisma.user.create({
        data: {
          email: finalEmail,
          firstName: firstName || null,
          lastName: lastName || null,
          role: UserRole.LINGUIST,
          password: '',
          phone,
        }
      })
      
      // Create linguist with all required fields
      await prisma.linguist.create({
        data: {
          userId: user.id,
          firstName: firstName || 'Unknown',
          lastName: lastName || 'Unknown',
          email: finalEmail,
          phone,
          address: vendor.primary_address_street,
          city: vendor.primary_address_city,
          state: mapState(vendor.primary_address_state),
          zipCode: vendor.primary_address_postalcode,
          country: vendor.primary_address_country,
          languages,
          experience: vendor.experience,
          specializations: vendor.subjects ? vendor.subjects.split(',').map(s => s.trim()) : [],
          bio: vendor.discipline ? `Discipline: ${vendor.discipline}` : null,
          isActive: true,
          isVerified: true,
        }
      })
      
      imported++
      if (imported % 1000 === 0) console.log(`  ✓ ${imported} linguists imported...`)
    } catch (error: any) {
      errors.push(`${vendor.id}: ${error.message}`)
      failed++
    }
  }
  
  console.log(`\n✅ Linguists: ${imported} imported, ${failed} failed`)
  console.log(`Expected: ${vendors.length}, Got: ${imported}`)
  
  if (errors.length > 0 && errors.length <= 20) {
    console.log('\nFirst few errors:')
    errors.slice(0, 10).forEach(e => console.log('  -', e))
  }
  
  // Final count
  const finalCount = await prisma.linguist.count()
  console.log(`\n📊 Final count in database: ${finalCount}`)
  
  // Show sample
  const sample = await prisma.linguist.findFirst({
    select: { firstName: true, lastName: true, email: true, city: true, state: true }
  })
  console.log('Sample linguist:', sample)
}

reimportLinguists()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
