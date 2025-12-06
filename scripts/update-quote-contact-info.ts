import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  const tsvPath = path.join(__dirname, '../data/legacy_quotes.tsv')
  const content = fs.readFileSync(tsvPath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  
  // Parse header
  const headers = lines[0].split('\t')
  const idIdx = headers.indexOf('id')
  const numberIdx = headers.indexOf('number')
  const disciplineIdx = headers.indexOf('discipline_c')
  const assignmentDateIdx = headers.indexOf('assignmentdate_c')
  const assignmentTimeIdx = headers.indexOf('assignmenttime_c')
  const estimatedDurationIdx = headers.indexOf('estimatedduration_c')
  const onSiteContactIdx = headers.indexOf('onsitecontact_c')
  const contactPersonPhoneIdx = headers.indexOf('contactpersonphone_c')
  const contactPersonEmailIdx = headers.indexOf('contactpersonemail_c')
  
  console.log('Column indices:')
  console.log(`  id: ${idIdx}, number: ${numberIdx}, discipline: ${disciplineIdx}, assignmentDate: ${assignmentDateIdx}`)
  console.log(`  contactPersonPhone: ${contactPersonPhoneIdx}, contactPersonEmail: ${contactPersonEmailIdx}`)
  
  const dataLines = lines.slice(1)
  console.log(`\nProcessing ${dataLines.length} quotes...`)
  
  let updated = 0
  let notFound = 0
  let noData = 0
  let errors = 0
  
  // Process in batches
  const batchSize = 500
  for (let i = 0; i < dataLines.length; i += batchSize) {
    const batch = dataLines.slice(i, i + batchSize)
    
    const updates = batch.map(async (line) => {
      const cols = line.split('\t')
      const legacyId = cols[idIdx]
      const quoteNumber = cols[numberIdx]
      
      if (!quoteNumber) return 'nodata'
      
      const discipline = cols[disciplineIdx]?.trim() || null
      const assignmentDateStr = cols[assignmentDateIdx]?.trim() || null
      const assignmentTime = cols[assignmentTimeIdx]?.trim() || null
      const estimatedDuration = cols[estimatedDurationIdx]?.trim() || null
      const onSiteContact = cols[onSiteContactIdx]?.trim() || null
      const contactPersonPhone = cols[contactPersonPhoneIdx]?.trim() || null
      const contactPersonEmail = cols[contactPersonEmailIdx]?.trim() || null
      
      // Skip if no relevant data
      if (!discipline && !assignmentDateStr && !contactPersonPhone && !contactPersonEmail) {
        return 'nodata'
      }
      
      try {
        // Find quote by quoteNumber
        const quote = await prisma.quote.findUnique({
          where: { quoteNumber: quoteNumber }
        })
        
        if (!quote) {
          return 'notfound'
        }
        
        const updateData: Record<string, any> = {}
        
        // Also update legacyId if not set
        if (legacyId && !quote.legacyId) {
          updateData.legacyId = legacyId
        }
        
        if (discipline) updateData.discipline = discipline
        if (assignmentDateStr && assignmentDateStr !== 'NULL') {
          const date = new Date(assignmentDateStr)
          if (!isNaN(date.getTime())) {
            updateData.assignmentDate = date
          }
        }
        if (assignmentTime && assignmentTime !== 'NULL') updateData.assignmentTime = assignmentTime
        if (estimatedDuration && estimatedDuration !== 'NULL') updateData.estimatedDuration = estimatedDuration
        if (onSiteContact && onSiteContact !== 'NULL') updateData.onSiteContact = onSiteContact
        if (contactPersonPhone && contactPersonPhone !== 'NULL') updateData.contactPersonPhone = contactPersonPhone
        if (contactPersonEmail && contactPersonEmail !== 'NULL') updateData.contactPersonEmail = contactPersonEmail
        
        if (Object.keys(updateData).length > 0) {
          await prisma.quote.update({
            where: { id: quote.id },
            data: updateData
          })
          return 'updated'
        }
        return 'nodata'
      } catch (error) {
        console.error(`Error updating quote ${legacyId}:`, error)
        return 'error'
      }
    })
    
    const results = await Promise.all(updates)
    updated += results.filter(r => r === 'updated').length
    notFound += results.filter(r => r === 'notfound').length
    noData += results.filter(r => r === 'nodata').length
    errors += results.filter(r => r === 'error').length
    
    if ((i + batchSize) % 5000 === 0 || i + batchSize >= dataLines.length) {
      console.log(`Progress: ${Math.min(i + batchSize, dataLines.length)}/${dataLines.length}`)
    }
  }
  
  console.log(`\nUpdate complete:`)
  console.log(`  - Updated: ${updated}`)
  console.log(`  - Not found: ${notFound}`)
  console.log(`  - No relevant data: ${noData}`)
  console.log(`  - Errors: ${errors}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
