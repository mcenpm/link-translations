import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Dil adından kod oluştur (küçük harf, boşlukları tire yap)
function generateCode(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// SugarCRM language_list tablosundan alınan diller (121 dil)
const sugarCRMLanguages = [
  { id: 1, name: 'Afrikaans', code: 'af' },
  { id: 2, name: 'Akan', code: 'ak' },
  { id: 3, name: 'Aklanon', code: 'akl' },
  { id: 4, name: 'Albanian', code: 'sq' },
  { id: 5, name: 'Amharic', code: 'am' },
  { id: 6, name: 'Arabic', code: 'ar' },
  { id: 7, name: 'Armenian', code: 'hy' },
  { id: 8, name: 'Assyrian', code: 'aii' },
  { id: 9, name: 'Azerbaijani', code: 'az' },
  { id: 10, name: 'Bahnar', code: 'bdq' },
  { id: 11, name: 'Bambara', code: 'bm' },
  { id: 12, name: 'Belorussian', code: 'be' },
  { id: 13, name: 'Bengali', code: 'bn' },
  { id: 14, name: 'Bosnian', code: 'bs' },
  { id: 15, name: 'Brazilian Portuguese', code: 'pt-BR' },
  { id: 16, name: 'Bulgarian', code: 'bg' },
  { id: 17, name: 'Burmese', code: 'my' },
  { id: 18, name: 'Cambodian', code: 'km' },
  { id: 120, name: 'Cambodian (Khmer)', code: 'km-KH' },
  { id: 19, name: 'Catalan', code: 'ca' },
  { id: 20, name: 'Chechen', code: 'ce' },
  { id: 21, name: 'Chinese', code: 'zh' },
  { id: 22, name: 'Croatian', code: 'hr' },
  { id: 23, name: 'Czech', code: 'cs' },
  { id: 24, name: 'Danish', code: 'da' },
  { id: 25, name: 'Dari', code: 'prs' },
  { id: 26, name: 'Dutch', code: 'nl' },
  { id: 121, name: 'English', code: 'en' },
  { id: 27, name: 'Estonian', code: 'et' },
  { id: 28, name: 'Ewe', code: 'ee' },
  { id: 29, name: 'Farsi', code: 'fa' },
  { id: 30, name: 'Finnish', code: 'fi' },
  { id: 31, name: 'Flemish', code: 'nl-BE' },
  { id: 32, name: 'French', code: 'fr' },
  { id: 33, name: 'Fukienese', code: 'nan' },
  { id: 34, name: 'Fuzhou', code: 'fzho' },
  { id: 35, name: 'Ga', code: 'gaa' },
  { id: 36, name: 'Gaelic', code: 'gd' },
  { id: 37, name: 'Georgian', code: 'ka' },
  { id: 38, name: 'German', code: 'de' },
  { id: 39, name: 'Grebo', code: 'grb' },
  { id: 40, name: 'Greek', code: 'el' },
  { id: 41, name: 'Gujarati', code: 'gu' },
  { id: 42, name: 'Haitian Creole', code: 'ht' },
  { id: 43, name: 'Hakka', code: 'hak' },
  { id: 44, name: 'Hawaiian', code: 'haw' },
  { id: 45, name: 'Hebrew', code: 'he' },
  { id: 46, name: 'Hindi', code: 'hi' },
  { id: 47, name: 'Hmong', code: 'hmn' },
  { id: 48, name: 'Hubei', code: 'hbe' },
  { id: 49, name: 'Hunanese', code: 'hsn' },
  { id: 50, name: 'Hungarian', code: 'hu' },
  { id: 51, name: 'Ibanaq', code: 'ibg' },
  { id: 52, name: 'Ibo', code: 'ig' },
  { id: 53, name: 'Icelandic', code: 'is' },
  { id: 54, name: 'Ilocano', code: 'ilo' },
  { id: 55, name: 'Indonesian', code: 'id' },
  { id: 56, name: 'Italian', code: 'it' },
  { id: 57, name: 'Japanese', code: 'ja' },
  { id: 58, name: 'Kanjobal', code: 'kjb' },
  { id: 59, name: 'Kashmiri', code: 'ks' },
  { id: 60, name: 'Korean', code: 'ko' },
  { id: 61, name: 'Krio', code: 'kri' },
  { id: 62, name: 'Kurdish', code: 'ku' },
  { id: 63, name: 'Lao', code: 'lo' },
  { id: 64, name: 'Latvian', code: 'lv' },
  { id: 65, name: 'Lithuanian', code: 'lt' },
  { id: 66, name: 'Luxembourgeois', code: 'lb' },
  { id: 67, name: 'Macedonian', code: 'mk' },
  { id: 68, name: 'Malay', code: 'ms' },
  { id: 69, name: 'Malayalam', code: 'ml' },
  { id: 70, name: 'Maltese', code: 'mt' },
  { id: 71, name: 'Mandinka', code: 'mnk' },
  { id: 72, name: 'Marathi', code: 'mr' },
  { id: 73, name: 'Marshallese', code: 'mh' },
  { id: 74, name: 'Mien', code: 'ium' },
  { id: 75, name: 'Mongolian', code: 'mn' },
  { id: 76, name: 'Navajo', code: 'nv' },
  { id: 77, name: 'Nepali', code: 'ne' },
  { id: 78, name: 'Norwegian', code: 'no' },
  { id: 79, name: 'Oromo', code: 'om' },
  { id: 80, name: 'Pangasinan', code: 'pag' },
  { id: 81, name: 'Pashto', code: 'ps' },
  { id: 82, name: 'Polish', code: 'pl' },
  { id: 83, name: 'Portuguese', code: 'pt' },
  { id: 84, name: 'Punjabi', code: 'pa' },
  { id: 85, name: 'Romanian', code: 'ro' },
  { id: 86, name: 'Russian', code: 'ru' },
  { id: 87, name: 'Senegalese', code: 'sen' },
  { id: 88, name: 'Serbian', code: 'sr' },
  { id: 89, name: 'Shanghai', code: 'wuu' },
  { id: 90, name: 'Sicilian', code: 'scn' },
  { id: 91, name: 'Sindhi', code: 'sd' },
  { id: 92, name: 'Singhalese', code: 'si' },
  { id: 93, name: 'Slovak', code: 'sk' },
  { id: 94, name: 'Slovenian', code: 'sl' },
  { id: 95, name: 'Somali', code: 'so' },
  { id: 96, name: 'Spanish', code: 'es' },
  { id: 97, name: 'Swahili', code: 'sw' },
  { id: 98, name: 'Swedish', code: 'sv' },
  { id: 99, name: 'Szechuan', code: 'szh' },
  { id: 100, name: 'Tagalog', code: 'tl' },
  { id: 101, name: 'Taiwanese', code: 'zh-TW' },
  { id: 102, name: 'Tamil', code: 'ta' },
  { id: 103, name: 'Thai', code: 'th' },
  { id: 104, name: 'Tibetan', code: 'bo' },
  { id: 105, name: 'Tigrinya', code: 'ti' },
  { id: 106, name: 'Toishanese', code: 'toi' },
  { id: 107, name: 'Tongan', code: 'to' },
  { id: 108, name: 'Turkish', code: 'tr' },
  { id: 109, name: 'Twi Akan', code: 'tw' },
  { id: 110, name: 'Ukrainian', code: 'uk' },
  { id: 111, name: 'Urdu', code: 'ur' },
  { id: 112, name: 'Uzbek', code: 'uz' },
  { id: 113, name: 'Vai', code: 'vai' },
  { id: 114, name: 'Vietnamese', code: 'vi' },
  { id: 115, name: 'Visayan', code: 'ceb' },
  { id: 116, name: 'Wolof', code: 'wo' },
  { id: 117, name: 'Xhosa', code: 'xh' },
  { id: 118, name: 'Yiddish', code: 'yi' },
  { id: 119, name: 'Yoruba', code: 'yo' },
]

async function syncLanguages() {
  console.log('🔄 Syncing languages from SugarCRM...\n')
  
  // Önce mevcut dilleri kontrol et - bağlı veriler var mı?
  const languagesWithRelations = await prisma.language.findMany({
    include: {
      _count: {
        select: {
          sourceLanguagePairs: true,
          targetLanguagePairs: true,
          linguistLanguages: true,
        }
      }
    }
  })
  
  const usedLanguages = languagesWithRelations.filter(
    l => l._count.sourceLanguagePairs > 0 || l._count.targetLanguagePairs > 0 || l._count.linguistLanguages > 0
  )
  
  if (usedLanguages.length > 0) {
    console.log(`⚠️  ${usedLanguages.length} languages have related data and will be preserved:`)
    usedLanguages.forEach(l => console.log(`   - ${l.name} (pairs: ${l._count.sourceLanguagePairs + l._count.targetLanguagePairs}, linguists: ${l._count.linguistLanguages})`))
    console.log('')
  }
  
  // Kullanılmayan dilleri sil
  const unusedLanguages = languagesWithRelations.filter(
    l => l._count.sourceLanguagePairs === 0 && l._count.targetLanguagePairs === 0 && l._count.linguistLanguages === 0
  )
  
  if (unusedLanguages.length > 0) {
    console.log(`🗑️  Deleting ${unusedLanguages.length} unused languages...`)
    await prisma.language.deleteMany({
      where: {
        id: { in: unusedLanguages.map(l => l.id) }
      }
    })
  }
  
  // SugarCRM dillerini ekle (zaten varsa atla)
  console.log(`\n➕ Adding SugarCRM languages...`)
  let added = 0
  let skipped = 0
  
  for (const lang of sugarCRMLanguages) {
    const exists = await prisma.language.findFirst({
      where: { name: lang.name }
    })
    
    if (!exists) {
      await prisma.language.create({
        data: {
          name: lang.name,
          code: lang.code,
          nativeName: lang.name,
        }
      })
      added++
      console.log(`   ✅ Added: ${lang.name}`)
    } else {
      skipped++
    }
  }
  
  const total = await prisma.language.count()
  console.log(`\n📊 Summary:`)
  console.log(`   - Added: ${added}`)
  console.log(`   - Already existed: ${skipped}`)
  console.log(`   - Total languages in database: ${total}`)
  
  await prisma.$disconnect()
}

syncLanguages().catch(console.error)
