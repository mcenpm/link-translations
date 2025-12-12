/**
 * Update quotes with source and target language arrays from CRM line items
 * Extracts "from X into Y" patterns from product_note field
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface LineItem {
  quoteId: string           // CRM quote id (legacyId)
  quoteNumber: string       // Quote number
  sourceLanguage: string    // Source language from quotes_cstm (may be NULL)
  languageRequested: string // Single language or "Multiple"
  productNote: string       // Contains "from X into Y" pattern
}

interface LanguagePair {
  source: string
  target: string
}

// Parse TSV file (new format with sourceLanguage)
function parseLineItems(filePath: string): LineItem[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.trim().split('\n')
  
  const items: LineItem[] = []
  
  for (const line of lines) {
    const parts = line.split('\t')
    if (parts.length >= 5) {
      items.push({
        quoteId: parts[0]?.trim() || '',
        quoteNumber: parts[1]?.trim() || '',
        sourceLanguage: parts[2]?.trim() || '',
        languageRequested: parts[3]?.trim() || '',
        productNote: parts[4]?.trim() || ''
      })
    } else if (parts.length >= 4) {
      items.push({
        quoteId: parts[0]?.trim() || '',
        quoteNumber: parts[1]?.trim() || '',
        sourceLanguage: parts[2]?.trim() || '',
        languageRequested: parts[3]?.trim() || '',
        productNote: ''
      })
    }
  }
  
  return items
}

// Extract language pairs from product_note using regex
// Patterns:
//   - "from English into Spanish"
//   - "from English into Spanish, German, and Italian"
//   - "English into Spanish"
//   - "Arabic<>English" (bidirectional interpretation)
function extractLanguagePairs(productNote: string, languageRequested: string): LanguagePair[] {
  const pairs: LanguagePair[] = []
  
  if (!productNote) {
    // Fallback: use languageRequested as target, assume English as source
    if (languageRequested && languageRequested !== 'Multiple' && languageRequested !== 'NULL') {
      pairs.push({ source: 'English', target: languageRequested })
    }
    return pairs
  }
  
  // Pattern 1: Bidirectional "X<>Y" (for interpretation) - check first
  const biPattern = /([A-Za-z]+)\s*<>\s*([A-Za-z]+)/gi
  let match
  let hasBidirectional = false
  
  while ((match = biPattern.exec(productNote)) !== null) {
    hasBidirectional = true
    // For bidirectional, first language is source, second is target
    pairs.push({ source: match[1].trim(), target: match[2].trim() })
  }
  
  // If bidirectional found, return early
  if (hasBidirectional) {
    return pairs
  }
  
  // Pattern 2: "from X into Y" or "from X into Y, Z, and W"
  const fromIntoPattern = /from\s+([A-Za-z\s]+?)\s+into\s+([A-Za-z\s,()]+?)(?:\s+at|\s+for|\s*<br>|\s*$|\.|\s+-|\s+translation)/gi
  
  while ((match = fromIntoPattern.exec(productNote)) !== null) {
    const source = match[1].trim()
    const targetStr = match[2].trim()
    
    // Split targets by comma and "and"
    const targets = targetStr
      .replace(/\s+and\s+/gi, ',')
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0 && !t.match(/^\d/)) // Filter out numbers and empty
    
    for (const target of targets) {
      // Clean up target (remove parenthetical notes)
      const cleanTarget = target.replace(/\s*\([^)]*\)\s*/g, '').trim()
      if (cleanTarget && source && cleanTarget.length < 30) {
        pairs.push({ source, target: cleanTarget })
      }
    }
  }
  
  // Pattern 3: Simple "X into Y" without "from" (only if no pairs found yet)
  if (pairs.length === 0) {
    const simplePattern = /([A-Za-z]+)\s+into\s+([A-Za-z\s,()]+?)(?:\s+at|\s+for|\s*<br>|\s*$|\.|\s+-)/gi
    while ((match = simplePattern.exec(productNote)) !== null) {
      const source = match[1].trim()
      const targetStr = match[2].trim()
      
      const targets = targetStr
        .replace(/\s+and\s+/gi, ',')
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0 && !t.match(/^\d/))
      
      for (const target of targets) {
        const cleanTarget = target.replace(/\s*\([^)]*\)\s*/g, '').trim()
        if (cleanTarget && source && cleanTarget.length < 30) {
          pairs.push({ source, target: cleanTarget })
        }
      }
    }
  }
  
  // Fallback: If no patterns found, use languageRequested
  if (pairs.length === 0 && languageRequested && languageRequested !== 'Multiple' && languageRequested !== 'NULL') {
    pairs.push({ source: 'English', target: languageRequested })
  }
  
  return pairs
}

// Normalize language names
function normalizeLanguage(lang: string): string | null {
  const normalized = lang.trim()
  
  // Filter out non-language words
  const invalidWords = [
    'translated', 'translation', 'output', 'input', 'document', 'file',
    'word', 'page', 'estimated', 'the', 'a', 'an', 'and', 'or', 'for',
    'from', 'into', 'to', 'of', 'in', 'on', 'at', 'by', 'with'
  ]
  
  if (invalidWords.includes(normalized.toLowerCase())) {
    return null
  }
  
  // Filter out if contains parentheses with non-language content
  if (/\(.*word|count|estimated|page/i.test(normalized)) {
    return null
  }
  
  // Common variations
  const map: Record<string, string> = {
    'Brazilian Portuguese': 'Portuguese (Brazilian)',
    'Chinese Simplified': 'Chinese (Simplified)',
    'Chinese Traditional': 'Chinese (Traditional)',
    'Mandarin': 'Chinese (Mandarin)',
    'Cantonese': 'Chinese (Cantonese)',
    'Simplified Chinese': 'Chinese (Simplified)',
    'Traditional Chinese': 'Chinese (Traditional)',
    'Canadian French': 'French (Canadian)',
  }
  
  return map[normalized] || normalized
}

async function main() {
  console.log('🔄 Starting quote language update...\n')
  
  const filePath = path.join(process.cwd(), 'data', 'quote_languages_full.tsv')
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath)
    process.exit(1)
  }
  
  // Parse TSV
  console.log('📖 Parsing quote_languages_full.tsv...')
  const lineItems = parseLineItems(filePath)
  console.log(`   Found ${lineItems.length} line items`)
  
  // Group line items by quote - NEW LOGIC
  // For single language: use sourceLanguage + languageRequested directly
  // For multiple: extract from line items
  const quoteLanguages = new Map<string, { 
    sources: Set<string>, 
    targets: Set<string>,
    isMultiple: boolean,
    crmSourceLang: string,
    crmTargetLang: string
  }>()
  
  for (const item of lineItems) {
    const key = item.quoteId
    if (!key) continue
    
    const isMultiple = item.languageRequested === 'Multiple'
    
    if (!quoteLanguages.has(key)) {
      quoteLanguages.set(key, { 
        sources: new Set(), 
        targets: new Set(),
        isMultiple,
        crmSourceLang: item.sourceLanguage,
        crmTargetLang: item.languageRequested
      })
    }
    
    const entry = quoteLanguages.get(key)!
    
    if (isMultiple) {
      // Multiple: extract from line items
      const pairs = extractLanguagePairs(item.productNote, item.languageRequested)
      for (const pair of pairs) {
        const normalizedSource = normalizeLanguage(pair.source)
        const normalizedTarget = normalizeLanguage(pair.target)
        if (normalizedSource) entry.sources.add(normalizedSource)
        if (normalizedTarget) entry.targets.add(normalizedTarget)
      }
    }
    // Single language quotes will be handled below
  }
  
  // Process single language quotes - use CRM fields directly
  for (const [, entry] of quoteLanguages.entries()) {
    if (!entry.isMultiple) {
      // Single language: source = CRM source (or "English"), target = languageRequested
      const source = entry.crmSourceLang && entry.crmSourceLang !== 'NULL' 
        ? normalizeLanguage(entry.crmSourceLang) 
        : 'English'
      const target = entry.crmTargetLang && entry.crmTargetLang !== 'NULL' && entry.crmTargetLang !== 'Multiple'
        ? normalizeLanguage(entry.crmTargetLang)
        : null
      
      if (source) entry.sources.add(source)
      if (target) entry.targets.add(target)
    }
  }
  
  console.log(`   Grouped into ${quoteLanguages.size} unique quotes with language data`)
  
  // Count multiple vs single
  let multipleCount = 0
  let singleCount = 0
  for (const entry of quoteLanguages.values()) {
    if (entry.isMultiple) multipleCount++
    else singleCount++
  }
  console.log(`   Single language quotes: ${singleCount}`)
  console.log(`   Multiple language quotes: ${multipleCount}`)
  
  // Get all quotes from database
  console.log('\n📚 Fetching quotes from database...')
  const quotes = await prisma.quote.findMany({
    select: {
      id: true,
      quoteNumber: true,
      legacyId: true
    }
  })
  console.log(`   Found ${quotes.length} quotes in database`)
  
  // Build lookup by legacyId
  const quoteByLegacyId = new Map<string, typeof quotes[0]>()
  for (const quote of quotes) {
    if (quote.legacyId) {
      quoteByLegacyId.set(quote.legacyId, quote)
    }
  }
  
  // Update quotes
  console.log('\n✏️  Updating quotes with language data...')
  
  let updated = 0
  let notFound = 0
  let noLanguageData = 0
  
  const batchSize = 100
  const entries = Array.from(quoteLanguages.entries())
  
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize)
    
    await Promise.all(batch.map(async ([crmQuoteId, langData]) => {
      const quote = quoteByLegacyId.get(crmQuoteId)
      
      if (!quote) {
        notFound++
        return
      }
      
      const sources = Array.from(langData.sources)
      const targets = Array.from(langData.targets)
      
      if (sources.length === 0 && targets.length === 0) {
        noLanguageData++
        return
      }
      
      await prisma.quote.update({
        where: { id: quote.id },
        data: {
          sourceLanguage: sources.length > 0 ? sources : [],
          targetLanguage: targets.length > 0 ? targets : []
        }
      })
      updated++
    }))
    
    // Progress
    if ((i + batchSize) % 5000 === 0 || i + batchSize >= entries.length) {
      console.log(`   Processed ${Math.min(i + batchSize, entries.length)}/${entries.length} quotes...`)
    }
  }
  
  console.log(`\n✅ Update complete!`)
  console.log(`   Updated: ${updated}`)
  console.log(`   Quote not in DB: ${notFound}`)
  console.log(`   No language data: ${noLanguageData}`)
  
  // Sample verification
  console.log('\n📊 Sample results:')
  const samples = await prisma.quote.findMany({
    take: 10,
    where: {
      targetLanguage: { isEmpty: false }
    },
    select: {
      quoteNumber: true,
      sourceLanguage: true,
      targetLanguage: true
    }
  })
  
  for (const sample of samples) {
    console.log(`   ${sample.quoteNumber}: [${sample.sourceLanguage.join(', ')}] → [${sample.targetLanguage.join(', ')}]`)
  }
  
  // Stats
  const withLanguage = await prisma.quote.count({
    where: {
      targetLanguage: { isEmpty: false }
    }
  })
  const withoutLanguage = await prisma.quote.count({
    where: {
      targetLanguage: { isEmpty: true }
    }
  })
  
  console.log(`\n📈 Final stats:`)
  console.log(`   Quotes with language data: ${withLanguage}`)
  console.log(`   Quotes without language data: ${withoutLanguage}`)
  
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
