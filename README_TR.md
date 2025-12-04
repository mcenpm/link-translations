# Link Translations - Modern Platform

Resim çevirisi ve yerelleştirme hizmetleri için Next.js tabanlı tam stack platform.

## 📋 Özellikler

- **Next.js 14 App Router** - Modern React framework
- **TypeScript** - Tip güvenliği
- **Prisma ORM** - PostgreSQL veritabanı
- **NextAuth** - Güvenli kimlik doğrulama
- **Stripe** - Ödeme işlemleri
- **Tailwind CSS** - Modern UI
- **Admin Panel** - Yönetim arayüzü
- **Customer Portal** - Müşteri portalı
- **Linguist Management** - Çevirmen yönetimi
- **Quote System** - Otomatik fiyatlandırma sistemi

## 🚀 Başlangıç

### Gereksinimler
- Node.js 18+
- PostgreSQL 12+
- npm veya yarn

### Kurulum

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Veritabanı URL'ini ayarlayın (.env dosyası):**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/link_translations"
```

3. **Prisma migration'ları çalıştırın:**
```bash
npx prisma migrate dev --name init
```

4. **Seed data ekleyin (isteğe bağlı):**
```bash
npx prisma db seed
```

5. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

Uygulamaya `http://localhost:3000` adresinden erişin.

## 📁 Proje Yapısı

```
src/
├── app/              # Next.js App Router
│   ├── api/         # API routes
│   ├── admin/       # Admin panel
│   ├── customer/    # Customer portal
│   └── page.tsx     # Home page
├── lib/
│   ├── db/          # Prisma client ve DB utilities
│   ├── auth/        # NextAuth configuration
│   └── utils/       # Formatting, pricing calculations
├── components/      # Reusable React components
└── generated/       # Prisma generated types
prisma/
├── schema.prisma    # Database schema
└── migrations/      # Database migrations
```

## 🗄️ Veritabanı Modeli

### Temel Modeller
- **User** - Sistem kullanıcıları (müşteri, çevirmen, admin)
- **Customer** - Hizmet alan şirketler
- **Linguist** - Çevirmen ve tercümanlar
- **Language** - Desteklenen diller (87+)
- **LanguagePair** - Dil çiftleri ve fiyatlandırma
- **Quote** - Hizmet teklifleri
- **Order** - Kabul edilen teklifler
- **Assignment** - Çevirmene verilen görevler
- **Invoice** - Faturalar
- **Payment** - Ödeme kayıtları

## 🔄 İş Akışı

### Müşteri Açısından
1. Kullanıcı giriş yapar
2. Kaynak ve hedef dil seçer
3. Metin/dosya yükler ve word sayısı girer
4. Otomatik fiyat hesaplanır
5. Teklife kabul eder
6. Ödemeyi yapar
7. Çevirmen atanır

### Çevirmen Açısından
1. Çevirmen hesabı oluşturur
2. Dil çiftleri ve ücretleri belirler
3. Teklifleri görür ve kabuleder
4. İşi tamamlar ve teslim eder
5. Ödemeyi alır

## 🔑 API Endpoints

### Public Endpoints
- `GET /api/languages` - Tüm dilleri al
- `GET /api/language-pairs` - Tüm dil çiftlerini al
- `GET /api/states` - Tüm US eyaletlerini al
- `GET /api/linguists` - Çevirmenleri ara (filtrelenebilir)

### Protected Endpoints (Kimlik doğrulama gerekli)
- `POST /api/quotes` - Yeni teklife oluştur
- `GET /api/quotes?customerId=xxx` - Müşterinin tekliflerini al
- `POST /api/orders` - Siparişi onayla
- `GET /api/assignments` - Atanan görevleri al

## 🔐 Güvenlik

- JWT token tabanlı kimlik doğrulama
- Password hashing (bcryptjs)
- Rate limiting (API endpoints)
- CSRF protection
- SQL injection prevention (Prisma ORM)

## 📊 Veritabanı İstatistikleri

Mevcut sistem (WordPress + Sugar CRM):
- **Müşteriler:** 6,357
- **Çevirmen/Tercümanlar:** 10,575
- **Teklifler:** 35,546+
- **Diller:** 87+
- **US Eyaletleri:** 50 + D.C.

## 🚀 Deployment

### Vercel'e Deploy Etme

1. **Git'e push edin:**
```bash
git push origin main
```

2. **Vercel CLI ile deploy edin:**
```bash
npm install -g vercel
vercel
```

3. **Environment variables'ları ayarlayın:**
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`

## 📝 Veri Göçü

### WordPress'ten Linguist verisi taşıyacak scripts:
- `scripts/migrate-wp-linguists.ts` - WordPress kullanıcılarını import et
- `scripts/migrate-languages.ts` - Dilleri import et
- `scripts/migrate-states.ts` - US eyaletlerini import et

### Sugar CRM'den veri taşıyacak scripts:
- `scripts/migrate-crm-customers.ts` - Müşterileri import et
- `scripts/migrate-crm-quotes.ts` - Teklifleri import et
- `scripts/migrate-crm-pricing.ts` - Fiyatlandırmayı import et

## 🔗 301 Redirect Yapılandırması

Eski WordPress URL'lerini yeni sisteme yönlendirmek için next.config.ts'de redirects tanımlanacak:

```typescript
redirects: [
  {
    source: '/state/:state/',
    destination: '/translators/:state',
    permanent: true, // 301
  },
  // ...
]
```

## 📚 Teknoloji Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js 16, Node.js 20
- **Database:** PostgreSQL 12+, Prisma 5
- **Auth:** NextAuth 4, bcryptjs
- **Payments:** Stripe
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions

## 📖 Docs

- [NextAuth Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Stripe Documentation](https://stripe.com/docs/api)
- [Next.js Documentation](https://nextjs.org/docs)

## 👨‍💻 Geliştirme

### Scripts

```bash
# Development
npm run dev

# Production build
npm run build

# Production start
npm run start

# Type check
npm run lint

# Database migration
npx prisma migrate dev --name <migration-name>

# Database studio (web interface)
npx prisma studio

# Generate Prisma client
npx prisma generate
```

## 📞 İletişim

Link Translations - modernize sistem projesi

## 📄 Lisans

Proprietary
