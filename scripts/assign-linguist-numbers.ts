import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get all linguists ordered by createdAt
  const linguists = await prisma.linguist.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true }
  })
  
  console.log(`Total linguists: ${linguists.length}`)
  
  // Update each with sequential number
  for (let i = 0; i < linguists.length; i++) {
    await prisma.linguist.update({
      where: { id: linguists[i].id },
      data: { linguistNumber: i + 1 }
    })
    
    if ((i + 1) % 1000 === 0) {
      console.log(`Progress: ${i + 1}/${linguists.length}`)
    }
  }
  
  console.log(`\nCompleted! Assigned numbers 1-${linguists.length}`)
  
  // Show first 5
  const first5 = await prisma.linguist.findMany({
    orderBy: { linguistNumber: 'asc' },
    take: 5,
    select: { linguistNumber: true, firstName: true, lastName: true, createdAt: true }
  })
  console.log('\nFirst 5 linguists:')
  first5.forEach(l => console.log(`  #${l.linguistNumber}: ${l.firstName} ${l.lastName} (${l.createdAt.toISOString().split('T')[0]})`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
