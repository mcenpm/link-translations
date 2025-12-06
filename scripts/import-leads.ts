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

async function importLeads() {
  console.log('Starting leads import...')
  
  // Read TSV file
  const filePath = path.join(__dirname, '..', 'data', 'leads.tsv')
  const content = fs.readFileSync(filePath, 'utf-8')
  const leads = parseTSV(content)
  
  console.log(`Found ${leads.length} leads to import`)
  
  let imported = 0
  let skipped = 0
  let errors = 0
  
  // Process in batches of 100
  const batchSize = 100
  
  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize)
    
    const createData = batch.map(lead => ({
      legacyId: lead.id,
      firstName: lead.first_name,
      lastName: lead.last_name || 'Unknown',
      phone: lead.phone_home,
      phoneMobile: lead.phone_mobile,
      phoneWork: lead.phone_work,
      phoneFax: lead.phone_fax,
      company: lead.account_name,
      title: lead.title,
      department: lead.department,
      description: lead.description,
      addressStreet: lead.primary_address_street,
      addressCity: lead.primary_address_city,
      addressState: lead.primary_address_state,
      addressPostalCode: lead.primary_address_postalcode,
      addressCountry: lead.primary_address_country,
      source: lead.lead_source,
      sourceDescription: lead.lead_source_description,
      status: mapStatus(lead.status),
      statusDescription: lead.status_description,
      referredBy: lead.refered_by,
      isConverted: lead.converted === '1',
      doNotCall: lead.do_not_call === '1',
      createdAt: lead.date_entered ? new Date(lead.date_entered) : new Date(),
      updatedAt: lead.date_modified ? new Date(lead.date_modified) : new Date(),
    }))
    
    try {
      // Use createMany for batch insert
      const result = await prisma.lead.createMany({
        data: createData,
        skipDuplicates: true,
      })
      
      imported += result.count
      skipped += batch.length - result.count
      
      if ((i + batchSize) % 1000 === 0 || i + batchSize >= leads.length) {
        console.log(`Progress: ${Math.min(i + batchSize, leads.length)}/${leads.length} (${imported} imported, ${skipped} skipped, ${errors} errors)`)
      }
    } catch (error) {
      console.error(`Error importing batch at index ${i}:`, error)
      errors += batch.length
    }
  }
  
  console.log('\n=== Import Complete ===')
  console.log(`Total: ${leads.length}`)
  console.log(`Imported: ${imported}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Errors: ${errors}`)
}

importLeads()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
