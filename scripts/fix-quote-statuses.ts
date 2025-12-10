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

// CORRECT mapping from SugarCRM stage to our QuoteStatus
function mapQuoteStatus(stage: string | null): QuoteStatus {
  if (!stage) return QuoteStatus.DRAFT
  
  // Exact mapping based on CRM values
  // Quote Sent → REVIEWING (as requested)
  // Negotiation/Review → NEGOTIATION (to avoid confusion)
  const statusMap: Record<string, QuoteStatus> = {
    'Draft': QuoteStatus.DRAFT,
    'Quote Sent': QuoteStatus.REVIEWING,           // CRM "Quote Sent" → Our "REVIEWING"
    'Negotiation/Review': QuoteStatus.NEGOTIATION, // CRM "Negotiation/Review" → Our "NEGOTIATION"
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

interface QuoteRow {
  id: string
  stage: string | null
}

async function fixQuoteStatuses() {
  console.log('🔧 Fixing quote statuses from TSV...\n')
  
  const dataPath = path.join(__dirname, '../data/quotes_full.tsv')
  const quotes = parseTSV<QuoteRow>(dataPath)
  
  console.log(`  Found ${quotes.length} quotes in TSV\n`)
  
  // Count statuses before
  const beforeCounts = await prisma.quote.groupBy({
    by: ['status'],
    _count: true
  })
  console.log('Before fix:')
  beforeCounts.forEach(s => console.log(`  ${s.status}: ${s._count}`))
  
  let updated = 0, failed = 0
  
  for (const quote of quotes) {
    if (!quote.stage) continue
    
    try {
      const correctStatus = mapQuoteStatus(quote.stage)
      
      const result = await prisma.quote.updateMany({
        where: { legacyId: quote.id },
        data: { status: correctStatus }
      })
      
      if (result.count > 0) updated++
      
      if (updated % 5000 === 0 && updated > 0) {
        console.log(`\n  ✓ ${updated} statuses updated...`)
      }
    } catch (error: any) {
      failed++
    }
  }
  
  console.log(`\n\n✅ Statuses fixed: ${updated} updated, ${failed} failed`)
  
  // Count statuses after
  const afterCounts = await prisma.quote.groupBy({
    by: ['status'],
    _count: true
  })
  console.log('\nAfter fix:')
  afterCounts.forEach(s => console.log(`  ${s.status}: ${s._count}`))
}

fixQuoteStatuses()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
