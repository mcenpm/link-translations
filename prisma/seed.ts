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

  // Seed Languages
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk' },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
    { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
    { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
    { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
    { code: 'ro', name: 'Romanian', nativeName: 'Română' },
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
