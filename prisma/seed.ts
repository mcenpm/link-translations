import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.quote.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.linguist.deleteMany()
  await prisma.user.deleteMany()
  await prisma.languagePair.deleteMany()
  await prisma.state.deleteMany()
  await prisma.language.deleteMany()

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@linktranslations.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
      phone: '1-877-272-5465',
    },
  })
  console.log(`✅ Created admin user: ${adminUser.email}`)

  // Customer user
  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: hashedPassword,
      role: UserRole.CUSTOMER,
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-123-4567',
      customer: {
        create: {
          company: 'Acme Corporation',
          industry: 'Technology',
        },
      },
    },
  })
  console.log(`✅ Created customer user: ${customerUser.email}`)

  // Linguist user
  const linguistUser = await prisma.user.create({
    data: {
      email: 'linguist@example.com',
      password: hashedPassword,
      role: UserRole.LINGUIST,
      firstName: 'Maria',
      lastName: 'Garcia',
      phone: '555-987-6543',
      linguist: {
        create: {
          bio: 'Professional certified translator with 10+ years of experience.',
          experience: 10,
          isActive: true,
          isVerified: true,
        },
      },
    },
  })
  console.log(`✅ Created linguist user: ${linguistUser.email}`)

  // Seed US States

  // Seed US States
  const states = [
    { code: 'AL', name: 'Alabama', slug: 'alabama' },
    { code: 'AK', name: 'Alaska', slug: 'alaska' },
    { code: 'AZ', name: 'Arizona', slug: 'arizona' },
    { code: 'AR', name: 'Arkansas', slug: 'arkansas' },
    { code: 'CA', name: 'California', slug: 'california' },
    { code: 'CO', name: 'Colorado', slug: 'colorado' },
    { code: 'CT', name: 'Connecticut', slug: 'connecticut' },
    { code: 'DE', name: 'Delaware', slug: 'delaware' },
    { code: 'FL', name: 'Florida', slug: 'florida' },
    { code: 'GA', name: 'Georgia', slug: 'georgia' },
    { code: 'HI', name: 'Hawaii', slug: 'hawaii' },
    { code: 'ID', name: 'Idaho', slug: 'idaho' },
    { code: 'IL', name: 'Illinois', slug: 'illinois' },
    { code: 'IN', name: 'Indiana', slug: 'indiana' },
    { code: 'IA', name: 'Iowa', slug: 'iowa' },
    { code: 'KS', name: 'Kansas', slug: 'kansas' },
    { code: 'KY', name: 'Kentucky', slug: 'kentucky' },
    { code: 'LA', name: 'Louisiana', slug: 'louisiana' },
    { code: 'ME', name: 'Maine', slug: 'maine' },
    { code: 'MD', name: 'Maryland', slug: 'maryland' },
    { code: 'MA', name: 'Massachusetts', slug: 'massachusetts' },
    { code: 'MI', name: 'Michigan', slug: 'michigan' },
    { code: 'MN', name: 'Minnesota', slug: 'minnesota' },
    { code: 'MS', name: 'Mississippi', slug: 'mississippi' },
    { code: 'MO', name: 'Missouri', slug: 'missouri' },
    { code: 'MT', name: 'Montana', slug: 'montana' },
    { code: 'NE', name: 'Nebraska', slug: 'nebraska' },
    { code: 'NV', name: 'Nevada', slug: 'nevada' },
    { code: 'NH', name: 'New Hampshire', slug: 'new-hampshire' },
    { code: 'NJ', name: 'New Jersey', slug: 'new-jersey' },
    { code: 'NM', name: 'New Mexico', slug: 'new-mexico' },
    { code: 'NY', name: 'New York', slug: 'new-york' },
    { code: 'NC', name: 'North Carolina', slug: 'north-carolina' },
    { code: 'ND', name: 'North Dakota', slug: 'north-dakota' },
    { code: 'OH', name: 'Ohio', slug: 'ohio' },
    { code: 'OK', name: 'Oklahoma', slug: 'oklahoma' },
    { code: 'OR', name: 'Oregon', slug: 'oregon' },
    { code: 'PA', name: 'Pennsylvania', slug: 'pennsylvania' },
    { code: 'RI', name: 'Rhode Island', slug: 'rhode-island' },
    { code: 'SC', name: 'South Carolina', slug: 'south-carolina' },
    { code: 'SD', name: 'South Dakota', slug: 'south-dakota' },
    { code: 'TN', name: 'Tennessee', slug: 'tennessee' },
    { code: 'TX', name: 'Texas', slug: 'texas' },
    { code: 'UT', name: 'Utah', slug: 'utah' },
    { code: 'VT', name: 'Vermont', slug: 'vermont' },
    { code: 'VA', name: 'Virginia', slug: 'virginia' },
    { code: 'WA', name: 'Washington', slug: 'washington' },
    { code: 'WV', name: 'West Virginia', slug: 'west-virginia' },
    { code: 'WI', name: 'Wisconsin', slug: 'wisconsin' },
    { code: 'WY', name: 'Wyoming', slug: 'wyoming' },
    { code: 'DC', name: 'District of Columbia', slug: 'district-of-columbia' },
  ]

  for (const state of states) {
    await prisma.state.create({ data: state })
  }

  console.log(`✅ Created ${states.length} states`)

  // Seed Languages - Full list from link-translations.com quote form
  const languages = [
    { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
    { code: 'ak', name: 'Akan', nativeName: 'Akan' },
    { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'hy', name: 'Armenian', nativeName: 'Հայերdelays' },
    { code: 'aii', name: 'Assyrian', nativeName: 'ܐܬܘܪܝܐ' },
    { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
    { code: 'bah', name: 'Bahnar', nativeName: 'Bahnar' },
    { code: 'bm', name: 'Bambara', nativeName: 'Bamanankan' },
    { code: 'be', name: 'Belorussian', nativeName: 'Беларуская' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski' },
    { code: 'pt-br', name: 'Brazilian Portuguese', nativeName: 'Português Brasileiro' },
    { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
    { code: 'my', name: 'Burmese', nativeName: 'မြန်မာဘာသာ' },
    { code: 'km', name: 'Cambodian (Khmer)', nativeName: 'ភាសាខ្មែរ' },
    { code: 'ca', name: 'Catalan', nativeName: 'Català' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
    { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk' },
    { code: 'prs', name: 'Dari', nativeName: 'دری' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
    { code: 'ee', name: 'Ewe', nativeName: 'Eʋegbe' },
    { code: 'fa', name: 'Farsi', nativeName: 'فارسی' },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
    { code: 'vls', name: 'Flemish', nativeName: 'Vlaams' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'fuk', name: 'Fukienese', nativeName: '福建話' },
    { code: 'fzh', name: 'Fuzhou', nativeName: '福州話' },
    { code: 'gaa', name: 'Ga', nativeName: 'Ga' },
    { code: 'gd', name: 'Gaelic', nativeName: 'Gàidhlig' },
    { code: 'ka', name: 'Georgian', nativeName: 'ქართული' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen' },
    { code: 'hak', name: 'Hakka', nativeName: '客家話' },
    { code: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'hmn', name: 'Hmong', nativeName: 'Hmoob' },
    { code: 'hub', name: 'Hubei', nativeName: '湖北话' },
    { code: 'hsn', name: 'Hunanese', nativeName: '湖南話' },
    { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
    { code: 'ibg', name: 'Ibanag', nativeName: 'Ibanag' },
    { code: 'ig', name: 'Ibo', nativeName: 'Igbo' },
    { code: 'ilo', name: 'Ilocano', nativeName: 'Ilokano' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'knj', name: 'Kanjobal', nativeName: "Q'anjob'al" },
    { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'kri', name: 'Krio', nativeName: 'Krio' },
    { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî' },
    { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
    { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
    { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
    { code: 'lb', name: 'Luxembourgeois', nativeName: 'Lëtzebuergesch' },
    { code: 'mk', name: 'Macedonian', nativeName: 'Македонски' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'mt', name: 'Maltese', nativeName: 'Malti' },
    { code: 'mnk', name: 'Mandinka', nativeName: 'Mandinka' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'mie', name: 'Mien', nativeName: 'Iu Mien' },
    { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },
    { code: 'nv', name: 'Navajo', nativeName: 'Diné bizaad' },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
    { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo' },
    { code: 'pag', name: 'Pangasinan', nativeName: 'Pangasinan' },
    { code: 'ps', name: 'Pashto', nativeName: 'پښتو' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'ro', name: 'Romanian', nativeName: 'Română' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'snf', name: 'Senegalese', nativeName: 'Sénégalais' },
    { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
    { code: 'wuu', name: 'Shanghai', nativeName: '上海話' },
    { code: 'scn', name: 'Sicilian', nativeName: 'Sicilianu' },
    { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
    { code: 'si', name: 'Sinhalese', nativeName: 'සිංහල' },
    { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
    { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
    { code: 'so', name: 'Somali', nativeName: 'Soomaali' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
    { code: 'szc', name: 'Szechuan', nativeName: '四川话' },
    { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
    { code: 'nan', name: 'Taiwanese', nativeName: '臺灣話' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { code: 'bo', name: 'Tibetan', nativeName: 'བོད་སྐད་' },
    { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ' },
    { code: 'toi', name: 'Toishanese', nativeName: '台山話' },
    { code: 'to', name: 'Tongan', nativeName: 'Lea Faka-Tonga' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbek' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { code: 'ceb', name: 'Visayan', nativeName: 'Bisaya' },
    { code: 'wo', name: 'Wolof', nativeName: 'Wolof' },
    { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
    { code: 'yi', name: 'Yiddish', nativeName: 'ייִדיש' },
    { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  ]

  for (const lang of languages) {
    await prisma.language.create({ data: lang })
  }

  console.log(`✅ Created ${languages.length} languages`)

  // Seed Language Pairs with default pricing
  const pairs = [
    { source: 'en', target: 'es', rate: 0.16, min: 25 },
    { source: 'en', target: 'fr', rate: 0.16, min: 25 },
    { source: 'en', target: 'de', rate: 0.16, min: 25 },
    { source: 'en', target: 'it', rate: 0.16, min: 25 },
    { source: 'en', target: 'pt', rate: 0.16, min: 25 },
    { source: 'en', target: 'ja', rate: 0.28, min: 35 },
    { source: 'en', target: 'zh', rate: 0.28, min: 35 },
    { source: 'en', target: 'ar', rate: 0.28, min: 35 },
    { source: 'en', target: 'tr', rate: 0.18, min: 28 },
    { source: 'en', target: 'ru', rate: 0.18, min: 28 },
    { source: 'es', target: 'en', rate: 0.16, min: 25 },
    { source: 'fr', target: 'en', rate: 0.16, min: 25 },
    { source: 'de', target: 'en', rate: 0.16, min: 25 },
  ]

  for (const pair of pairs) {
    const source = await prisma.language.findUnique({ where: { code: pair.source } })
    const target = await prisma.language.findUnique({ where: { code: pair.target } })

    if (source && target) {
      await prisma.languagePair.create({
        data: {
          sourceLanguageId: source.id,
          targetLanguageId: target.id,
          ratePerWord: pair.rate,
          minimumCharge: pair.min,
        },
      })
    }
  }

  console.log(`✅ Created ${pairs.length} language pairs`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
