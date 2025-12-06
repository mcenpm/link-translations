import { PrismaClient, LeadStatus } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Map SugarCRM status to our LeadStatus enum
function mapStatus(status: string | null): LeadStatus {
  if (!status) return LeadStatus.NEW
  
  const statusMap: Record<string, LeadStatus> = {
    'New': LeadStatus.NEW,
    'Assigned': LeadStatus.ASSIGNED,
    'In Process': LeadStatus.IN_PROCESS,
    'Converted': LeadStatus.CONVERTED,
    'Recycled': LeadStatus.RECYCLED,
    'Dead': LeadStatus.DEAD,
  }
  
  return statusMap[status] || LeadStatus.NEW
}

// Parse TSV file
function parseTSV(content: string): Record<string, string | null>[] {
  const lines = content.split('\n').filter((line: string) => line.trim())
  if (lines.length === 0) return []
  
  const headers = lines[0].split('\t').map((h: string) => h.trim())
  const rows: Record<string, string | null>[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t')
    const row: Record<string, string | null> = {}
    
    headers.forEach((header: string, index: number) => {
      const value = values[index]?.trim()
      row[header] = value === 'NULL' || value === '' ? null : value
    })
    
    rows.push(row)
  }
  
  return rows
}

async function updateLeads() {
  console.log('Starting leads update with full data...')
  
  // Read full TSV file
  const filePath = path.join(__dirname, '..', 'data', 'leads_full.tsv')
  const content = fs.readFileSync(filePath, 'utf-8')
  const leads = parseTSV(content)
  
  console.log(`Found ${leads.length} leads to update`)
  
  let updated = 0
  let errors = 0
  
  // Process in batches
  const batchSize = 100
  
  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize)
    
    const promises = batch.map(async (lead) => {
      try {
        await prisma.lead.update({
          where: { legacyId: lead.id },
          data: {
            email: lead.email,
            description: lead.description,
            discipline: lead.discipline_c,
            sourceLanguage: lead.sourcelanguage_c,
            targetLanguage: lead.languagerequested_c,
            customerType: lead.customertype_c,
            leadRanking: lead.lead_ranking_c,
          }
        })
        return true
      } catch {
        return false
      }
    })
    
    const results = await Promise.all(promises)
    updated += results.filter(r => r).length
    errors += results.filter(r => !r).length
    
    if ((i + batchSize) % 5000 === 0 || i + batchSize >= leads.length) {
      console.log(`Progress: ${Math.min(i + batchSize, leads.length)}/${leads.length} (${updated} updated, ${errors} errors)`)
    }
  }
  
  console.log('\n=== Update Complete ===')
  console.log(`Total: ${leads.length}`)
  console.log(`Updated: ${updated}`)
  console.log(`Errors: ${errors}`)
  
  // Show sample with email
  const sample = await prisma.lead.findMany({
    where: { email: { not: null } },
    take: 5,
    select: { firstName: true, lastName: true, email: true, discipline: true, sourceLanguage: true, targetLanguage: true }
  })
  console.log('\nSample leads with email:')
  console.table(sample)
}

updateLeads()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
