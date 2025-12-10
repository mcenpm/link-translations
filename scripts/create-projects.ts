import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createProjectsFromQuotes() {
  console.log('📦 Creating projects from paid quotes...')
  
  // Get all quotes with INVOICE_PAID or INVOICE_NOT_PAID status
  const paidQuotes = await prisma.quote.findMany({
    where: {
      status: {
        in: ['INVOICE_PAID', 'INVOICE_NOT_PAID']
      },
      project: null // Only quotes without a project
    },
    select: {
      id: true,
      quoteNumber: true,
      customerId: true,
      description: true,
      status: true,
      createdAt: true,
    }
  })
  
  console.log(`  Found ${paidQuotes.length} paid quotes without projects`)
  
  let created = 0, failed = 0
  
  for (const quote of paidQuotes) {
    try {
      // Generate project number
      const projectNumber = `P-${quote.quoteNumber.replace('Q-', '').replace('QR-', '')}`
      
      await prisma.project.create({
        data: {
          projectNumber,
          quoteId: quote.id,
          customerId: quote.customerId,
          name: quote.description || `Project for ${quote.quoteNumber}`,
          status: quote.status === 'INVOICE_PAID' ? 'COMPLETED' : 'IN_PROGRESS',
          startDate: quote.createdAt,
        }
      })
      
      created++
      if (created % 1000 === 0) console.log(`  ✓ ${created} projects created...`)
    } catch (error: any) {
      if (created < 5) console.log('Project error:', error.message)
      failed++
    }
  }
  
  console.log(`✅ Projects: ${created} created, ${failed} failed\n`)
  
  // Show stats
  const stats = {
    totalQuotes: await prisma.quote.count(),
    paidQuotes: await prisma.quote.count({ where: { status: 'INVOICE_PAID' } }),
    unpaidQuotes: await prisma.quote.count({ where: { status: 'INVOICE_NOT_PAID' } }),
    projects: await prisma.project.count(),
  }
  
  console.log('📊 Stats:', stats)
}

createProjectsFromQuotes()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
