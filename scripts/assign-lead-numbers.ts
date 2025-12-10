import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function assignLeadNumbers() {
  console.log('Starting lead number assignment...\n')

  // Assign leadNumber to Leads using raw SQL
  console.log('=== ASSIGNING LEAD NUMBERS ===')
  
  const result = await prisma.$executeRaw`
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
  console.log(`Updated ${result} leads`)
  
  const leadCount = await prisma.lead.count({ where: { leadNumber: { not: null } } })
  console.log(`Total leads with numbers: ${leadCount}`)

  console.log('\n=== DONE ===')
}

assignLeadNumbers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
