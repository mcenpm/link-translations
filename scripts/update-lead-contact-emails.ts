import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  const tsvPath = path.join(__dirname, '../data/lead_contact_emails.tsv')
  const content = fs.readFileSync(tsvPath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  
  // Skip header
  const dataLines = lines.slice(1)
  
  console.log(`Processing ${dataLines.length} lead contact email records...`)
  
  let updated = 0
  let notFound = 0
  let errors = 0
  
  for (const line of dataLines) {
    const [legacyId, contactPersonEmail, contactPersonPhone] = line.split('\t')
    
    if (!legacyId) continue
    
    try {
      // Find lead by legacy ID
      const lead = await prisma.lead.findFirst({
        where: { legacyId: legacyId }
      })
      
      if (!lead) {
        notFound++
        continue
      }
      
      // Update with contact person email (and phone if available from quote)
      const updateData: { contactPersonEmail?: string; contactPersonPhone?: string } = {}
      
      if (contactPersonEmail && contactPersonEmail.trim()) {
        updateData.contactPersonEmail = contactPersonEmail.trim()
      }
      
      // Only update phone if lead doesn't have one and quote has one
      if (contactPersonPhone && contactPersonPhone.trim() && !lead.contactPersonPhone) {
        updateData.contactPersonPhone = contactPersonPhone.trim()
      }
      
      if (Object.keys(updateData).length > 0) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: updateData
        })
        updated++
      }
    } catch (error) {
      errors++
      console.error(`Error updating lead ${legacyId}:`, error)
    }
  }
  
  console.log(`\nUpdate complete:`)
  console.log(`  - Updated: ${updated}`)
  console.log(`  - Not found: ${notFound}`)
  console.log(`  - Errors: ${errors}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
