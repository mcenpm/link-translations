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

interface QuoteRow {
  id: string
  number: string | null
  name: string | null
}

async function updateQuoteNumbers() {
  console.log('📦 Updating quote numbers from TSV...\n')
  
  const dataPath = path.join(__dirname, '../data/quotes_full.tsv')
  const quotes = parseTSV<QuoteRow>(dataPath)
  
  console.log(`  Found ${quotes.length} quotes in TSV\n`)
  
  let updated = 0, notFound = 0, failed = 0
  
  for (const quote of quotes) {
    if (!quote.number) continue
    
    try {
      const result = await prisma.quote.updateMany({
        where: { legacyId: quote.id },
        data: { quoteNumber: quote.number }
      })
      
      if (result.count > 0) {
        updated++
      } else {
        notFound++
      }
      
      if (updated % 5000 === 0 && updated > 0) {
        console.log(`  ✓ ${updated} quote numbers updated...`)
      }
    } catch (error: any) {
      failed++
    }
  }
  
  console.log(`\n✅ Quote numbers: ${updated} updated, ${notFound} not found, ${failed} failed`)
  
  // Show sample
  const samples = await prisma.quote.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { quoteNumber: true, total: true, status: true }
  })
  console.log('\nSample quotes:')
  samples.forEach(q => console.log(`  - ${q.quoteNumber}: $${q.total?.toFixed(2)} (${q.status})`))
}

updateQuoteNumbers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
