import { PrismaClient, QuoteStatus } from '@prisma/client'
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

// Map SugarCRM quote status to our status
function mapQuoteStatus(stage: string | null): QuoteStatus {
  if (!stage) return QuoteStatus.DRAFT
  
  const statusMap: Record<string, QuoteStatus> = {
    'Draft': QuoteStatus.DRAFT,
    'Quote Sent': QuoteStatus.QUOTE_SENT,
    'Negotiation': QuoteStatus.NEGOTIATION_REVIEW,
    'Delivered': QuoteStatus.INVOICE_PAID,
    'On Hold': QuoteStatus.FOLLOW_UP,
    'Confirmed': QuoteStatus.INVOICE_PAID,
    'Invoice Paid': QuoteStatus.INVOICE_PAID,
    'Invoice Sent': QuoteStatus.INVOICE_NOT_PAID,
    'Closed Accepted': QuoteStatus.INVOICE_PAID,
    'Closed Lost': QuoteStatus.REJECTED_OTHER,
    'Closed Dead': QuoteStatus.REJECTED_OTHER,
    'Cancelled': QuoteStatus.REJECTED_OTHER,
  }
  
  return statusMap[stage] || QuoteStatus.DRAFT
}

interface QuoteRow {
  id: string
  number: string | null
  name: string | null
  description: string | null
  billing_account_id: string | null
  billing_account: string | null
  billing_contact: string | null
  billing_contact_id: string | null
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

async function reimportQuotes() {
  console.log('📦 Re-importing quotes with full data...\n')
  
  // Load customer ID map
  const customerIdMapPath = path.join(__dirname, '../data/customer-id-map.json')
  let customerIdMap = new Map<string, string>()
  if (fs.existsSync(customerIdMapPath)) {
    const mapData = JSON.parse(fs.readFileSync(customerIdMapPath, 'utf-8'))
    customerIdMap = new Map(Object.entries(mapData))
    console.log(`  Loaded ${customerIdMap.size} customer ID mappings`)
  }
  
  // Get language pair
  const languagePair = await prisma.languagePair.findFirst()
  if (!languagePair) {
    console.log('⚠️  No language pairs found. Creating default...')
    const enLang = await prisma.language.findFirst({ where: { code: 'en' } })
    const esLang = await prisma.language.findFirst({ where: { code: 'es' } })
    if (enLang && esLang) {
      await prisma.languagePair.create({
        data: {
          sourceLanguageId: enLang.id,
          targetLanguageId: esLang.id,
          ratePerWord: 0.12,
          minimumCharge: 35,
        }
      })
    }
  }
  
  const defaultLanguagePair = await prisma.languagePair.findFirst()!
  
  const dataPath = path.join(__dirname, '../data/quotes_full.tsv')
  const quotes = parseTSV<QuoteRow>(dataPath)
  
  console.log(`  Found ${quotes.length} quotes to update\n`)
  
  let updated = 0, created = 0, failed = 0
  const errors: string[] = []
  
  // Get a random customer for quotes without mapping
  const randomCustomer = await prisma.corporate.findFirst()
  
  for (const quote of quotes) {
    try {
      const subtotal = quote.subtotal_amount ? parseFloat(quote.subtotal_amount) : 0
      const tax = quote.tax_amount ? parseFloat(quote.tax_amount) : 0
      const total = quote.total_amount ? parseFloat(quote.total_amount) : subtotal
      
      // Calculate word count from total (assuming $0.12/word rate)
      const wordCount = total > 0 ? Math.round(total / 0.12) : 0
      
      // Try to find existing quote by legacyId
      const existingQuote = await prisma.quote.findFirst({
        where: { legacyId: quote.id }
      })
      
      if (existingQuote) {
        // Update existing quote
        await prisma.quote.update({
          where: { id: existingQuote.id },
          data: {
            description: quote.description || quote.name || existingQuote.description,
            wordCount,
            subtotal,
            tax,
            total,
            status: mapQuoteStatus(quote.stage),
            requestedDeliveryDate: quote.estimated_completion ? new Date(quote.estimated_completion) : existingQuote.requestedDeliveryDate,
          }
        })
        updated++
      } else {
        // Create new quote
        let customerId = customerIdMap.get(quote.billing_account_id || '')
        if (!customerId && randomCustomer) {
          customerId = randomCustomer.id
        }
        if (!customerId) {
          continue
        }
        
        await prisma.quote.create({
          data: {
            legacyId: quote.id,
            quoteNumber: quote.number || `Q-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            customerId,
            description: quote.description || quote.name,
            sourceLanguage: 'en',
            targetLanguage: quote.languagerequested_c?.toLowerCase().substring(0, 2) || 'es',
            languagePairId: defaultLanguagePair!.id,
            status: mapQuoteStatus(quote.stage),
            wordCount,
            ratePerUnit: defaultLanguagePair!.ratePerWord,
            minimumCharge: defaultLanguagePair!.minimumCharge,
            subtotal,
            tax,
            total,
            requestedDeliveryDate: quote.estimated_completion ? new Date(quote.estimated_completion) : null,
            createdAt: quote.date_entered ? new Date(quote.date_entered) : new Date(),
          }
        })
        created++
      }
      
      if ((updated + created) % 2000 === 0) {
        console.log(`  ✓ ${updated} updated, ${created} created...`)
      }
    } catch (error: any) {
      errors.push(`${quote.id}: ${error.message}`)
      failed++
    }
  }
  
  console.log(`\n✅ Quotes: ${updated} updated, ${created} created, ${failed} failed`)
  
  if (errors.length > 0 && errors.length <= 10) {
    console.log('\nErrors:')
    errors.forEach(e => console.log('  -', e))
  }
  
  // Show sample with amounts
  const sample = await prisma.quote.findFirst({
    where: { total: { gt: 0 } },
    select: { quoteNumber: true, wordCount: true, subtotal: true, total: true, status: true }
  })
  console.log('\nSample quote with amounts:', sample)
  
  // Show stats
  const stats = await prisma.quote.aggregate({
    _sum: { total: true },
    _avg: { total: true },
    _count: true
  })
  console.log('\nQuote stats:', {
    totalQuotes: stats._count,
    totalRevenue: stats._sum.total?.toFixed(2),
    avgQuoteValue: stats._avg.total?.toFixed(2)
  })
}

reimportQuotes()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
