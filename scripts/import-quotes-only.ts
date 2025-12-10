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

async function importQuotes() {
  console.log('📦 Importing quotes...')
  
  // Load customer id map
  const customerIdMapPath = path.join(__dirname, '../data/customer-id-map.json')
  let customerIdMap = new Map<string, string>()
  
  if (fs.existsSync(customerIdMapPath)) {
    const mapData = JSON.parse(fs.readFileSync(customerIdMapPath, 'utf-8'))
    customerIdMap = new Map(Object.entries(mapData))
    console.log(`  Loaded ${customerIdMap.size} customer ID mappings`)
  } else {
    console.log('  ⚠️ No customer ID map found, will use random customer')
  }
  
  // Get default language pair
  const languagePair = await prisma.languagePair.findFirst()
  if (!languagePair) {
    console.log('⚠️  No language pairs found. Skipping quotes import.')
    return
  }
  
  interface QuoteRow {
    id: string
    name: string | null
    quote_num: string | null
    billing_account_id: string | null
    stage: string | null
    subtotal: string | null
    tax: string | null
    total: string | null
    date_entered: string | null
    date_quote_expected_closed: string | null
    description: string | null
    languagerequested_c: string | null
  }
  
  const dataPath = path.join(__dirname, '../data/quotes_full.tsv')
  const quotes = parseTSV<QuoteRow>(dataPath)
  
  let imported = 0, skipped = 0, failed = 0
  
  // Get a random customer for quotes without mapping
  const randomCustomer = await prisma.customer.findFirst()
  
  for (const quote of quotes) {
    try {
      // Get customer ID
      let customerId = customerIdMap.get(quote.billing_account_id || '')
      if (!customerId && randomCustomer) {
        customerId = randomCustomer.id
      }
      if (!customerId) {
        skipped++
        continue
      }
      
      await prisma.quote.create({
        data: {
          legacyId: quote.id,
          quoteNumber: quote.quote_num || `Q-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          customerId,
          description: quote.description || quote.name,
          sourceLanguage: 'en',
          targetLanguage: quote.languagerequested_c?.toLowerCase().substring(0, 2) || 'es',
          languagePairId: languagePair.id,
          status: mapQuoteStatus(quote.stage),
          ratePerUnit: languagePair.ratePerWord,
          minimumCharge: languagePair.minimumCharge,
          subtotal: quote.subtotal ? parseFloat(quote.subtotal) : null,
          tax: quote.tax ? parseFloat(quote.tax) : null,
          total: quote.total ? parseFloat(quote.total) : null,
          requestedDeliveryDate: quote.date_quote_expected_closed ? new Date(quote.date_quote_expected_closed) : null,
          createdAt: quote.date_entered ? new Date(quote.date_entered) : new Date(),
        }
      })
      
      imported++
      if (imported % 1000 === 0) console.log(`  ✓ ${imported} quotes imported...`)
    } catch (error: any) {
      if (imported < 5) console.log('Quote error:', error.message)
      failed++
    }
  }
  
  console.log(`✅ Quotes: ${imported} imported, ${skipped} skipped, ${failed} failed\n`)
}

importQuotes()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
