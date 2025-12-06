import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

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

async function updateAllFields() {
  console.log('Starting full fields update for ALL leads...')
  
  const filePath = path.join(__dirname, '..', 'data', 'leads_interpretation.tsv')
  const content = fs.readFileSync(filePath, 'utf-8')
  const leads = parseTSV(content)
  
  console.log(`Found ${leads.length} leads to update`)
  
  let updated = 0
  let errors = 0
  const batchSize = 100
  
  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize)
    
    const promises = batch.map(async (lead) => {
      try {
        await prisma.lead.update({
          where: { legacyId: lead.id },
          data: {
            assignmentDate: lead.assignmentdate_c ? new Date(lead.assignmentdate_c) : null,
            assignmentTime: lead.assignmenttime_c,
            estimatedDuration: lead.estimatedduration_c,
            onSiteContact: lead.onsitecontact_c,
            contactPersonPhone: lead.contactpersonphone_c,
            assignmentAddress: lead.assignmentlocationaddress_c,
            assignmentCity: lead.assignmentlocationcity_c,
            assignmentState: lead.assignmentlocationstate_c,
            assignmentZipCode: lead.assignmentlocationzipcode_c,
            isCertified: lead.cert_c === '1',
            estimatedFees: lead.estimatedfees_c,
            numberOfParticipants: lead.number_of_participants_c,
            numberOfSpeakers: lead.number_of_speakers_c,
            meetingType: lead.meeting_type_c,
            requestedVendorId: lead.vend_ven_contacts_id_c,
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
  console.log(`Updated: ${updated}`)
  console.log(`Errors: ${errors}`)
  
  // Stats
  const stats = await prisma.lead.groupBy({
    by: ['isCertified'],
    _count: true,
  })
  console.log('\nCertified stats:')
  console.table(stats)
}

updateAllFields()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
