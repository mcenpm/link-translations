import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating default language pair...')
  
  const english = await prisma.language.findFirst({ where: { name: 'English' } })
  const spanish = await prisma.language.findFirst({ where: { name: 'Spanish' } })
  
  if (!english || !spanish) {
    console.log('English or Spanish not found!')
    return
  }
  
  // Check if already exists
  const existing = await prisma.languagePair.findFirst({
    where: {
      sourceLanguageId: english.id,
      targetLanguageId: spanish.id
    }
  })
  
  if (existing) {
    console.log('Language pair already exists:', existing.id)
    return
  }
  
  const lp = await prisma.languagePair.create({
    data: {
      sourceLanguageId: english.id,
      targetLanguageId: spanish.id,
      ratePerWord: 0.12,
      minimumCharge: 35
    }
  })
  
  console.log('✅ Created language pair EN -> ES:', lp.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
