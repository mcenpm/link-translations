import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function assignSequentialIds() {
  console.log('Starting sequential ID assignment...\n')

  // 1. Assign customerNumber to Customers using raw SQL for speed
  console.log('=== ASSIGNING CUSTOMER NUMBERS ===')
  await prisma.$executeRaw`
    WITH numbered AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as rn
      FROM "Customer"
      WHERE "customerNumber" IS NULL
    )
    UPDATE "Customer" 
    SET "customerNumber" = numbered.rn + COALESCE((SELECT MAX("customerNumber") FROM "Customer"), 0)
    FROM numbered
    WHERE "Customer".id = numbered.id
  `
  const customerCount = await prisma.corporate.count({ where: { customerNumber: { not: null } } })
  console.log(`Total customers with numbers: ${customerCount}`)

  // 2. Assign contactNumber to CustomerContacts
  console.log('\n=== ASSIGNING CONTACT NUMBERS ===')
  await prisma.$executeRaw`
    WITH numbered AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as rn
      FROM "CustomerContact"
      WHERE "contactNumber" IS NULL
    )
    UPDATE "CustomerContact" 
    SET "contactNumber" = numbered.rn + COALESCE((SELECT MAX("contactNumber") FROM "CustomerContact"), 0)
    FROM numbered
    WHERE "CustomerContact".id = numbered.id
  `
  const contactCount = await prisma.contact.count({ where: { contactNumber: { not: null } } })
  console.log(`Total contacts with numbers: ${contactCount}`)

  // 3. Assign leadNumber to Leads
  console.log('\n=== ASSIGNING LEAD NUMBERS ===')
  await prisma.$executeRaw`
    WITH numbered AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as rn
      FROM "Lead"
      WHERE "leadNumber" IS NULL
    )
    UPDATE "Lead" 
    SET "leadNumber" = numbered.rn + COALESCE((SELECT MAX("leadNumber") FROM "Lead"), 0)
    FROM numbered
    WHERE "Lead".id = numbered.id
  `
  const leadCount = await prisma.lead.count({ where: { leadNumber: { not: null } } })
  console.log(`Total leads with numbers: ${leadCount}`)

  console.log('\n=== DONE ===')
}

assignSequentialIds()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
