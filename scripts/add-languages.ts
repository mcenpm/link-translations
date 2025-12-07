import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Main languages that should always be included
const mainLanguages = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
]

// Additional languages from link-translations.com quote form
const languages = [
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'ak', name: 'Akan', nativeName: 'Akan' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հdelays' },
  { code: 'aii', name: 'Assyrian', nativeName: 'ܐ' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
  { code: 'bah', name: 'Bahnar', nativeName: 'Bahnar' },
  { code: 'bm', name: 'Bambara', nativeName: 'Bamanankan' },
  { code: 'be', name: 'Belorussian', nativeName: 'Беларуская' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski' },
  { code: 'pt-br', name: 'Brazilian Portuguese', nativeName: 'Português Brasileiro' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ' },
  { code: 'km', name: 'Cambodian (Khmer)', nativeName: 'ភាសាខ្មែរ' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'prs', name: 'Dari', nativeName: 'دری' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'ee', name: 'Ewe', nativeName: 'Eʋegbe' },
  { code: 'fa', name: 'Farsi', nativeName: 'فارسی' },
  { code: 'vls', name: 'Flemish', nativeName: 'Vlaams' },
  { code: 'fuk', name: 'Fukienese', nativeName: '福建話' },
  { code: 'fzh', name: 'Fuzhou', nativeName: '福州話' },
  { code: 'gaa', name: 'Ga', nativeName: 'Ga' },
  { code: 'gd', name: 'Gaelic', nativeName: 'Gàidhlig' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen' },
  { code: 'hak', name: 'Hakka', nativeName: '客家話' },
  { code: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi' },
  { code: 'hmn', name: 'Hmong', nativeName: 'Hmoob' },
  { code: 'hub', name: 'Hubei', nativeName: '湖北话' },
  { code: 'hsn', name: 'Hunanese', nativeName: '湖南話' },
  { code: 'ibg', name: 'Ibanag', nativeName: 'Ibanag' },
  { code: 'ig', name: 'Ibo', nativeName: 'Igbo' },
  { code: 'ilo', name: 'Ilocano', nativeName: 'Ilokano' },
  { code: 'knj', name: 'Kanjobal', nativeName: "Q'anjob'al" },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर' },
  { code: 'kri', name: 'Krio', nativeName: 'Krio' },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'lb', name: 'Luxembourgeois', nativeName: 'Lëtzebuergesch' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti' },
  { code: 'mnk', name: 'Mandinka', nativeName: 'Mandinka' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'mie', name: 'Mien', nativeName: 'Iu Mien' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },
  { code: 'nv', name: 'Navajo', nativeName: 'Diné bizaad' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo' },
  { code: 'pag', name: 'Pangasinan', nativeName: 'Pangasinan' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'snf', name: 'Senegalese', nativeName: 'Sénégalais' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'wuu', name: 'Shanghai', nativeName: '上海話' },
  { code: 'scn', name: 'Sicilian', nativeName: 'Sicilianu' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'si', name: 'Sinhalese', nativeName: 'සිංහල' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'szc', name: 'Szechuan', nativeName: '四川话' },
  { code: 'nan', name: 'Taiwanese', nativeName: '臺灣話' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'bo', name: 'Tibetan', nativeName: 'བོད་སྐད་' },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ' },
  { code: 'toi', name: 'Toishanese', nativeName: '台山話' },
  { code: 'to', name: 'Tongan', nativeName: 'Lea Faka-Tonga' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'uz', name: 'Uzbek', nativeName: "Oʻzbek" },
  { code: 'ceb', name: 'Visayan', nativeName: 'Bisaya' },
  { code: 'wo', name: 'Wolof', nativeName: 'Wolof' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
  { code: 'yi', name: 'Yiddish', nativeName: 'ייִדיש' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
]

async function addLanguages() {
  console.log('Adding missing languages to database...')
  let added = 0
  let skipped = 0
  
  for (const lang of languages) {
    const exists = await prisma.language.findFirst({ 
      where: { 
        OR: [
          { code: lang.code }, 
          { name: lang.name }
        ] 
      } 
    })
    
    if (!exists) {
      await prisma.language.create({ data: lang })
      added++
      console.log(`✅ Added: ${lang.name}`)
    } else {
      skipped++
    }
  }
  
  const total = await prisma.language.count()
  console.log(`\n✅ Added ${added} new languages (${skipped} already existed)`)
  console.log(`📊 Total languages in database: ${total}`)
  
  await prisma.$disconnect()
}

addLanguages().catch(console.error)
