# Link Translations - Veri Göçü Rehberi

Mevcut WordPress ve Sugar CRM sistemlerinden yeni Next.js platformuna verileri taşımak için adım adım rehber.

---

## 📋 Göç Planı Özeti

| Kaynak | Hedef | Kayıt | Durum |
|--------|-------|-------|-------|
| WordPress users | Linguist | 2,221 | 🟡 Hazır |
| WordPress usermeta | LinguistLanguage | ~5,000+ | 🟡 Hazır |
| Sugar CRM accounts | Customer | 6,357 | 🟡 Hazır |
| Sugar CRM contacts | CustomerContact | ~10,000 | 🟡 Hazır |
| Sugar CRM quotes | Quote | 35,546 | 🟡 Hazır |
| Sugar CRM language_price | LanguagePair | 120+ | 🟡 Hazır |
| WordPress posts (languages) | Language | 87+ | ✅ Seeded |
| WordPress posts (states) | State | 50 + D.C. | ✅ Seeded |

---

## 🚀 Adım 1: Veri Dışa Aktarma

### 1.1 WordPress Veritabanından

SSH ile WordPress sunucusuna bağlanın ve aşağıdaki query'leri çalıştırın:

#### Linguists (Çevirmenler)
```sql
-- WordPress users -> Linguist
SELECT 
  u.ID as wp_user_id,
  u.user_email as email,
  u.user_login as username,
  u.user_nicename as first_name,
  u.user_registered as created_at,
  um.meta_value as languages,  -- lingLanguage1a, lingLanguage1b, etc.
  um2.meta_value as discipline, -- lingDiscipline
  um3.meta_value as rate,      -- lingRateTranslation
  um4.meta_value as state,     -- lingState
  um5.meta_value as city,      -- lingCity
  um6.meta_value as address    -- lingAddress
FROM wp_users u
LEFT JOIN wp_usermeta um ON u.ID = um.user_id AND um.meta_key = 'lingLanguage1a'
LEFT JOIN wp_usermeta um2 ON u.ID = um2.user_id AND um2.meta_key = 'lingDiscipline'
LEFT JOIN wp_usermeta um3 ON u.ID = um3.user_id AND um3.meta_key = 'lingRateTranslation'
LEFT JOIN wp_usermeta um4 ON u.ID = um4.user_id AND um4.meta_key = 'lingState'
LEFT JOIN wp_usermeta um5 ON u.ID = um5.user_id AND um5.meta_key = 'lingCity'
LEFT JOIN wp_usermeta um6 ON u.ID = um6.user_id AND um6.meta_key = 'lingAddress'
WHERE u.ID > 1  -- Admin user'ı hariç tut
INTO OUTFILE '/tmp/wp_linguists.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

#### Languages
```sql
-- WordPress posts (post_type='languages') -> Language
SELECT 
  p.ID,
  p.post_title as name,
  p.post_name as code
FROM wp_posts p
WHERE p.post_type = 'languages' AND p.post_status = 'publish'
INTO OUTFILE '/tmp/wp_languages.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

#### States
```sql
-- WordPress posts (post_type='states') -> State
SELECT 
  p.ID,
  p.post_title as name,
  p.post_name as slug,
  pm.meta_value as code  -- Assuming state code is in postmeta
FROM wp_posts p
LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id AND pm.meta_key = 'state_code'
WHERE p.post_type = 'states' AND p.post_status = 'publish'
INTO OUTFILE '/tmp/wp_states.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

### 1.2 Sugar CRM Veritabanından

SSH ile Sugar CRM sunucusuna bağlanın:

#### Customers
```sql
-- SugarCRM accounts -> Customer
SELECT 
  a.id,
  a.name as company,
  a.website,
  a.billing_address_street,
  a.billing_address_city,
  a.billing_address_state,
  a.billing_address_postalcode,
  a.billing_address_country,
  a.shipping_address_street,
  a.shipping_address_city,
  a.shipping_address_state,
  a.shipping_address_postalcode,
  a.shipping_address_country,
  a.date_entered as created_at,
  a.date_modified as updated_at
FROM accounts a
WHERE a.deleted = 0
INTO OUTFILE '/tmp/crm_customers.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

#### Customer Contacts
```sql
-- SugarCRM contacts -> CustomerContact
SELECT 
  c.id,
  c.account_id,
  c.first_name,
  c.last_name,
  c.title,
  c.email1 as email,
  c.phone_work as phone
FROM contacts c
WHERE c.deleted = 0
INTO OUTFILE '/tmp/crm_contacts.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

#### Quotes
```sql
-- SugarCRM quotes -> Quote (ilk 1000)
SELECT 
  q.id,
  q.quote_num as quote_number,
  q.account_id as customer_id,
  q.name,
  q.quote_stage as status,
  q.total_amt as total,
  q.tax_amount as tax,
  q.date_entered as created_at,
  q.date_modified as updated_at,
  q.date_quote_expected_close as expected_close
FROM quotes q
WHERE q.deleted = 0
LIMIT 1000
INTO OUTFILE '/tmp/crm_quotes.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

#### Language Pricing
```sql
-- SugarCRM language_price -> LanguagePair
SELECT 
  lp.id,
  lp.language,
  lp.to_language,
  lp.unit_of_issue,
  lp.rate as rate_per_word,
  lp.minimum_charge
FROM language_price lp
WHERE lp.deleted = 0
INTO OUTFILE '/tmp/crm_pricing.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

### 1.3 CSV Dosyalarını İndir

```bash
# WordPress sunucusundan:
scp -i your-key.pem ec2-user@ec2-52-206-108-160:/tmp/wp_*.csv ./exports/

# Sugar CRM sunucusundan:
scp -i your-key.pem ec2-user@ec2-52-207-134-130:/tmp/crm_*.csv ./exports/
```

---

## 📝 Adım 2: CSV Dosyalarını İşleme

`scripts/` klasöründe aşağıdaki TypeScript dosyalarını oluşturun:

### 2.1 Linguists Migration (WordPress)

```typescript
// scripts/migrate-wp-linguists.ts
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as csv from 'csv-parse/sync'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface WPLinguist {
  wp_user_id: string
  email: string
  username: string
  first_name: string
  created_at: string
  languages?: string
  discipline?: string
  rate?: string
  state?: string
  city?: string
  address?: string
}

async function migrateLinguists() {
  const fileContent = fs.readFileSync('./exports/wp_linguists.csv', 'utf-8')
  const records: WPLinguist[] = csv.parse(fileContent, { columns: true })

  console.log(`📥 Importing ${records.length} linguists from WordPress...`)

  for (const record of records) {
    try {
      // Create User
      const user = await prisma.user.create({
        data: {
          email: record.email,
          password: await bcrypt.hash('ChangeMe123!', 10),
          role: 'LINGUIST',
          firstName: record.first_name,
        },
      })

      // Create Linguist Profile
      await prisma.linguist.create({
        data: {
          userId: user.id,
          state: record.state?.toUpperCase(),
          city: record.city,
          address: record.address,
          defaultRatePerWord: record.rate ? parseFloat(record.rate) : 0.16,
          isActive: true,
          createdAt: new Date(record.created_at),
        },
      })
    } catch (error) {
      console.error(`❌ Error importing linguist ${record.email}:`, error)
    }
  }

  console.log('✅ Linguist migration completed!')
}

migrateLinguists()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

### 2.2 Customers Migration (Sugar CRM)

```typescript
// scripts/migrate-crm-customers.ts
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as csv from 'csv-parse/sync'

const prisma = new PrismaClient()

interface CRMCustomer {
  id: string
  company: string
  website?: string
  billing_address_street?: string
  billing_address_city?: string
  billing_address_state?: string
  billing_address_postalcode?: string
  billing_address_country?: string
  shipping_address_street?: string
  shipping_address_city?: string
  shipping_address_state?: string
  shipping_address_postalcode?: string
  shipping_address_country?: string
  created_at: string
  updated_at: string
}

async function migrateCustomers() {
  const fileContent = fs.readFileSync('./exports/crm_customers.csv', 'utf-8')
  const records: CRMCustomer[] = csv.parse(fileContent, { columns: true })

  console.log(`📥 Importing ${records.length} customers from Sugar CRM...`)

  for (const record of records) {
    try {
      // Create User
      const user = await prisma.user.create({
        data: {
          email: `customer-${record.id}@link-translations.local`,
          password: '', // Will be set via forgot password
          role: 'CUSTOMER',
          firstName: record.company.split(' ')[0],
        },
      })

      // Create Customer Profile
      await prisma.customer.create({
        data: {
          userId: user.id,
          company: record.company,
          website: record.website,
          billingAddress: record.billing_address_street,
          billingCity: record.billing_address_city,
          billingState: record.billing_address_state,
          billingZip: record.billing_address_postalcode,
          billingCountry: record.billing_address_country || 'United States',
          shippingAddress: record.shipping_address_street,
          shippingCity: record.shipping_address_city,
          shippingState: record.shipping_address_state,
          shippingZip: record.shipping_address_postalcode,
          shippingCountry: record.shipping_address_country || 'United States',
          createdAt: new Date(record.created_at),
          updatedAt: new Date(record.updated_at),
        },
      })
    } catch (error) {
      console.error(`❌ Error importing customer ${record.company}:`, error)
    }
  }

  console.log('✅ Customer migration completed!')
}

migrateCustomers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

### 2.3 Quotes Migration (Sugar CRM)

```typescript
// scripts/migrate-crm-quotes.ts
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as csv from 'csv-parse/sync'

const prisma = new PrismaClient()

interface CRMQuote {
  id: string
  quote_number: string
  customer_id: string
  name: string
  status: string
  total: string
  tax: string
  created_at: string
  updated_at: string
  expected_close?: string
}

async function migrateQuotes() {
  const fileContent = fs.readFileSync('./exports/crm_quotes.csv', 'utf-8')
  const records: CRMQuote[] = csv.parse(fileContent, { columns: true })

  console.log(`📥 Importing ${records.length} quotes from Sugar CRM...`)

  const statusMap: Record<string, any> = {
    'Pending Approval': 'SUBMITTED',
    'Accepted': 'ACCEPTED',
    'Rejected': 'REJECTED',
    'Invoice Paid': 'PAID',
    'In Progress': 'IN_PROGRESS',
    'Completed': 'COMPLETED',
  }

  for (const record of records) {
    try {
      const customer = await prisma.customer.findFirst({
        where: { id: record.customer_id },
      })

      if (!customer) {
        console.warn(`⚠️ Customer not found for quote ${record.quote_number}`)
        continue
      }

      // Get first available language pair
      const languagePair = await prisma.languagePair.findFirst()

      if (!languagePair) {
        console.warn(`⚠️ No language pairs found for quote ${record.quote_number}`)
        continue
      }

      await prisma.quote.create({
        data: {
          quoteNumber: record.quote_number,
          customerId: customer.id,
          languagePairId: languagePair.id,
          status: statusMap[record.status] || 'DRAFT',
          description: record.name,
          sourceLanguage: 'English',
          targetLanguage: 'Spanish',
          wordCount: 0, // Set from original data if available
          ratePerUnit: languagePair.ratePerWord,
          minimumCharge: languagePair.minimumCharge,
          subtotal: parseFloat(record.total) - parseFloat(record.tax),
          tax: parseFloat(record.tax),
          total: parseFloat(record.total),
          requestedDeliveryDate: record.expected_close
            ? new Date(record.expected_close)
            : null,
          createdAt: new Date(record.created_at),
          updatedAt: new Date(record.updated_at),
        },
      })
    } catch (error) {
      console.error(`❌ Error importing quote ${record.quote_number}:`, error)
    }
  }

  console.log('✅ Quote migration completed!')
}

migrateQuotes()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## 🔄 Adım 3: Migration Scriptlerini Çalıştırma

```bash
# ts-node gerekli
npm install -D ts-node @types/node csv-parse

# Her script'i sırasıyla çalıştır
npx ts-node scripts/migrate-crm-customers.ts
npx ts-node scripts/migrate-wp-linguists.ts
npx ts-node scripts/migrate-crm-quotes.ts

# Sonuçları kontrol et
npm run db:studio  # Web interface'de kontrol
```

---

## ✅ Doğrulama Checklist

- [ ] CSV dosyaları başarıyla exported edildi
- [ ] TypeScript migration scripts yazıldı
- [ ] `npm run db:seed` with initial data çalıştı
- [ ] 50 US states import edildi
- [ ] 87+ languages import edildi
- [ ] Language pairs pricing set edildi
- [ ] Customers imported edildi (6,357)
- [ ] Linguists imported edildi (2,221)
- [ ] Quotes imported edildi (35,546+)
- [ ] Data validation completed
- [ ] No duplicate records
- [ ] All foreign keys valid
- [ ] Timestamps preserved correctly

---

## 🔗 URL Redirect Konfigürasyonu

Eski WordPress URL'lerinden yeni sisteme yönlendirmek için `next.config.ts` güncelle:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // State sayfa redirects
      {
        source: '/state/:state/',
        destination: '/translators/:state',
        permanent: true,
      },
      {
        source: '/state/:state/:language/translators',
        destination: '/translators/:state?language=:language&type=translation',
        permanent: true,
      },
      {
        source: '/state/:state/:language/interpreters',
        destination: '/translators/:state?language=:language&type=interpretation',
        permanent: true,
      },
      // Legacy API redirects
      {
        source: '/api/linguists-by-state',
        destination: '/api/linguists',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
```

---

## 📊 Veri Bütünlüğü Kontrolleri

```sql
-- PostgreSQL'de kontrol etmek için
-- Tüm linguistlerin valid state'i var mı?
SELECT COUNT(*) FROM "Linguist" WHERE state IS NULL;

-- Tüm quote'ların valid customer'ı var mı?
SELECT COUNT(*) FROM "Quote" WHERE "customerId" NOT IN (SELECT id FROM "Customer");

-- Tüm assignment'ların valid linguist'i var mı?
SELECT COUNT(*) FROM "Assignment" WHERE "linguistId" NOT IN (SELECT id FROM "Linguist");
```

---

## 🚨 Sorun Giderme

### Problem: UTF-8 encoding issues
```bash
# CSV export sırasında charset belirt
iconv -f utf-8 -t utf-8 exports/file.csv > exports/file-clean.csv
```

### Problem: Quote pricing hatalı
```sql
-- Price validation
SELECT COUNT(*) FROM "Quote" WHERE total < "minimumCharge";
-- Düzelt
UPDATE "Quote" SET total = "minimumCharge" WHERE total < "minimumCharge";
```

### Problem: Duplicate records
```sql
-- Find duplicates
SELECT email, COUNT(*) FROM "User" GROUP BY email HAVING COUNT(*) > 1;
-- Delete duplicates
DELETE FROM "User" WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY "createdAt") as rn
    FROM "User"
  ) t WHERE rn > 1
);
```

---

## ✨ Başarı Metrikleri

Migration tamamlandıktan sonra şunu doğrulayın:

| Metric | Target | Status |
|--------|--------|--------|
| Customers imported | 6,357 | ⏳ |
| Linguists imported | 2,221 | ⏳ |
| Quotes migrated | 35,546 | ⏳ |
| Languages available | 87+ | ⏳ |
| States mapped | 50 + DC | ✅ |
| Language pairs | 100+ | ⏳ |
| Data accuracy | 99.5%+ | ⏳ |
| Migration time | < 1 hour | ⏳ |

---

**Oluşturulma Tarihi:** December 4, 2025
**Son Güncelleme:** Initial Setup
