import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPricing() {
  console.log('Starting pricing seed...')
  
  // Get languages
  const english = await prisma.language.findFirst({ where: { code: 'en' } })
  const spanish = await prisma.language.findFirst({ where: { code: 'es' } })
  const turkish = await prisma.language.findFirst({ where: { code: 'tr' } })
  const french = await prisma.language.findFirst({ where: { code: 'fr' } })
  const chinese = await prisma.language.findFirst({ where: { code: 'zh' } })
  const arabic = await prisma.language.findFirst({ where: { code: 'ar' } })
  const german = await prisma.language.findFirst({ where: { code: 'de' } })
  const japanese = await prisma.language.findFirst({ where: { code: 'ja' } })
  const korean = await prisma.language.findFirst({ where: { code: 'ko' } })
  const portuguese = await prisma.language.findFirst({ where: { code: 'pt' } })
  
  console.log('Languages:', { 
    english: english?.name, 
    spanish: spanish?.name, 
    turkish: turkish?.name,
    french: french?.name,
    chinese: chinese?.name,
    arabic: arabic?.name,
    german: german?.name,
    japanese: japanese?.name,
    korean: korean?.name,
    portuguese: portuguese?.name
  })

  if (!english) {
    console.log('English not found!')
    return
  }

  const pricingData = [
    // Common language pairs from English
    { src: english, tgt: spanish, translation: { word: 0.12, min: 35 }, video: 75, phone: 65, onsite: 95, travel: 50 },
    { src: english, tgt: turkish, translation: { word: 0.15, min: 40 }, video: 85, phone: 75, onsite: 110, travel: 60 },
    { src: english, tgt: french, translation: { word: 0.14, min: 35 }, video: 80, phone: 70, onsite: 100, travel: 55 },
    { src: english, tgt: chinese, translation: { word: 0.18, min: 50 }, video: 95, phone: 85, onsite: 125, travel: 65 },
    { src: english, tgt: arabic, translation: { word: 0.16, min: 45 }, video: 90, phone: 80, onsite: 115, travel: 60 },
    { src: english, tgt: german, translation: { word: 0.14, min: 35 }, video: 80, phone: 70, onsite: 105, travel: 55 },
    { src: english, tgt: japanese, translation: { word: 0.20, min: 55 }, video: 100, phone: 90, onsite: 135, travel: 70 },
    { src: english, tgt: korean, translation: { word: 0.18, min: 50 }, video: 95, phone: 85, onsite: 125, travel: 65 },
    { src: english, tgt: portuguese, translation: { word: 0.13, min: 35 }, video: 78, phone: 68, onsite: 98, travel: 52 },
    // Reverse pairs
    { src: spanish, tgt: english, translation: { word: 0.12, min: 35 }, video: 75, phone: 65, onsite: 95, travel: 50 },
    { src: turkish, tgt: english, translation: { word: 0.15, min: 40 }, video: 85, phone: 75, onsite: 110, travel: 60 },
    { src: french, tgt: english, translation: { word: 0.14, min: 35 }, video: 80, phone: 70, onsite: 100, travel: 55 },
    { src: chinese, tgt: english, translation: { word: 0.18, min: 50 }, video: 95, phone: 85, onsite: 125, travel: 65 },
  ]

  for (const p of pricingData) {
    if (!p.src || !p.tgt) {
      console.log('Skipping - missing language')
      continue
    }

    const name = `${p.src.name} → ${p.tgt.name}`
    
    // Delete existing rules for this pair
    await prisma.pricingRule.deleteMany({
      where: { sourceLanguageId: p.src.id, targetLanguageId: p.tgt.id }
    })

    // Translation
    await prisma.pricingRule.create({
      data: {
        name: `${name} - Translation`,
        serviceType: 'TRANSLATION',
        sourceLanguageId: p.src.id,
        targetLanguageId: p.tgt.id,
        perWordRate: p.translation.word,
        minimumCharge: p.translation.min,
        rush24hMultiplier: 1.5,
        rush48hMultiplier: 1.25,
        isActive: true,
        priority: 10,
      }
    })

    // Video Remote Interpretation
    await prisma.pricingRule.create({
      data: {
        name: `${name} - Video Remote`,
        serviceType: 'INTERPRETATION',
        interpretationType: 'VIDEO_REMOTE',
        sourceLanguageId: p.src.id,
        targetLanguageId: p.tgt.id,
        perHourRate: p.video,
        minimumHours: 1,
        isActive: true,
        priority: 10,
      }
    })

    // Phone Interpretation
    await prisma.pricingRule.create({
      data: {
        name: `${name} - Phone`,
        serviceType: 'INTERPRETATION',
        interpretationType: 'PHONE',
        sourceLanguageId: p.src.id,
        targetLanguageId: p.tgt.id,
        perHourRate: p.phone,
        minimumHours: 1,
        isActive: true,
        priority: 10,
      }
    })

    // On-Site Base Rate
    await prisma.pricingRule.create({
      data: {
        name: `${name} - On-Site (Base)`,
        serviceType: 'INTERPRETATION',
        interpretationType: 'ON_SITE',
        sourceLanguageId: p.src.id,
        targetLanguageId: p.tgt.id,
        perHourRate: p.onsite,
        minimumHours: 2,
        travelFee: p.travel,
        isActive: true,
        priority: 5,
      }
    })

    // Add state overrides for Spanish and Chinese (common high-demand pairs)
    if (p.src.code === 'en' && (p.tgt.code === 'es' || p.tgt.code === 'zh')) {
      // California - higher rates
      await prisma.pricingRule.create({
        data: {
          name: `${name} - On-Site (CA)`,
          serviceType: 'INTERPRETATION',
          interpretationType: 'ON_SITE',
          sourceLanguageId: p.src.id,
          targetLanguageId: p.tgt.id,
          state: 'CA',
          perHourRate: Math.round(p.onsite * 1.3),
          minimumHours: 2,
          travelFee: Math.round(p.travel * 1.5),
          isActive: true,
          priority: 20,
        }
      })
      
      // New York - highest rates
      await prisma.pricingRule.create({
        data: {
          name: `${name} - On-Site (NY)`,
          serviceType: 'INTERPRETATION',
          interpretationType: 'ON_SITE',
          sourceLanguageId: p.src.id,
          targetLanguageId: p.tgt.id,
          state: 'NY',
          perHourRate: Math.round(p.onsite * 1.4),
          minimumHours: 2,
          travelFee: Math.round(p.travel * 1.6),
          isActive: true,
          priority: 20,
        }
      })

      // Texas
      await prisma.pricingRule.create({
        data: {
          name: `${name} - On-Site (TX)`,
          serviceType: 'INTERPRETATION',
          interpretationType: 'ON_SITE',
          sourceLanguageId: p.src.id,
          targetLanguageId: p.tgt.id,
          state: 'TX',
          perHourRate: Math.round(p.onsite * 1.15),
          minimumHours: 2,
          travelFee: Math.round(p.travel * 1.2),
          isActive: true,
          priority: 20,
        }
      })

      // Florida
      await prisma.pricingRule.create({
        data: {
          name: `${name} - On-Site (FL)`,
          serviceType: 'INTERPRETATION',
          interpretationType: 'ON_SITE',
          sourceLanguageId: p.src.id,
          targetLanguageId: p.tgt.id,
          state: 'FL',
          perHourRate: Math.round(p.onsite * 1.1),
          minimumHours: 2,
          travelFee: Math.round(p.travel * 1.1),
          isActive: true,
          priority: 20,
        }
      })
    }

    console.log(`✓ Created pricing for: ${name}`)
  }

  const count = await prisma.pricingRule.count()
  console.log(`\n✅ Done! Total pricing rules: ${count}`)
  
  await prisma.$disconnect()
}

seedPricing().catch(console.error)
