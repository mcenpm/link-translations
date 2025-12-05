import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Quick import starting...')
  
  // 100 Linguist ekle
  const vendorData = fs.readFileSync('data/vendors_full.tsv', 'utf-8')
  const vendorLines = vendorData.split('\n').slice(1, 101)
  let lingCount = 0
  
  for (const line of vendorLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const email = cols[5] || `linguist_${Math.random().toString(36).substring(7)}@link.com`
    try {
      const user = await prisma.user.create({
        data: { 
          email, 
          firstName: cols[1] || 'Linguist', 
          lastName: cols[2] || null, 
          role: 'LINGUIST', 
          password: '' 
        }
      })
      await prisma.linguist.create({
        data: { 
          userId: user.id, 
          city: cols[9] || null, 
          state: 'NY', 
          country: cols[11] || 'USA', 
          isActive: true 
        }
      })
      lingCount++
    } catch(e) {
      // Skip duplicates
    }
  }
  console.log('✅ Linguists:', lingCount)
  
  // 50 Quote ekle
  let quoteCount = 0
  const customer = await prisma.customer.findFirst()
  const languagePair = await prisma.languagePair.findFirst()
  if (customer && languagePair) {
    for (let i = 0; i < 50; i++) {
      try {
        await prisma.quote.create({
          data: { 
            customerId: customer.id,
            languagePairId: languagePair.id,
            quoteNumber: `QR-${Date.now()}-${i}`,
            sourceLanguage: 'English',
            targetLanguage: 'Spanish',
            ratePerUnit: 0.12,
            minimumCharge: 35,
            wordCount: Math.floor(Math.random() * 5000) + 500,
            subtotal: Math.random() * 800 + 200,
            total: Math.random() * 1000 + 100,
            status: 'SUBMITTED'
          }
        })
        quoteCount++
      } catch(e: any) {
        console.log('Quote error:', e.message)
      }
    }
  }
  console.log('✅ Quotes:', quoteCount)
  
  // Stats
  const stats = {
    users: await prisma.user.count(),
    customers: await prisma.customer.count(),
    linguists: await prisma.linguist.count(),
    quotes: await prisma.quote.count(),
  }
  console.log('\n📊 Database Stats:', stats)
}

main()
  .finally(() => prisma.$disconnect())
