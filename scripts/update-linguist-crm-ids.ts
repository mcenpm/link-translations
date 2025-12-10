import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

async function main() {
  const tsvPath = path.join(__dirname, '../data/vendors_full.tsv')
  const content = fs.readFileSync(tsvPath, 'utf-8')
  const lines = content.trim().split('\n')
  
  // Skip first line if it's mysql warning
  const startIdx = lines[0].includes('Warning:') ? 1 : 0
  const headers = lines[startIdx].split('\t')
  
  // Find column indices
  const idIdx = headers.indexOf('id')
  const emailIdx = headers.indexOf('email')
  const firstNameIdx = headers.indexOf('first_name')
  const lastNameIdx = headers.indexOf('last_name')
  
  console.log('Headers:', headers.slice(0, 10))
  console.log('Column indices:', { idIdx, emailIdx, firstNameIdx, lastNameIdx })
  
  let updated = 0
  let notFound = 0
  
  for (let i = startIdx + 1; i < lines.length; i++) {
    const cols = lines[i].split('\t')
    const crmId = cols[idIdx]?.trim()
    const email = cols[emailIdx]?.trim()?.toLowerCase()
    const firstName = cols[firstNameIdx]?.trim()
    const lastName = cols[lastNameIdx]?.trim()
    
    if (!crmId || !email) continue
    
    // Try to find by email first, then by name
    let linguist = await prisma.linguist.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    })
    
    if (!linguist && firstName && lastName) {
      linguist = await prisma.linguist.findFirst({
        where: {
          firstName: { equals: firstName, mode: 'insensitive' },
          lastName: { equals: lastName, mode: 'insensitive' }
        }
      })
    }
    
    if (linguist) {
      await prisma.linguist.update({
        where: { id: linguist.id },
        data: { crmId }
      })
      updated++
    } else {
      notFound++
    }
    
    if ((i - startIdx) % 1000 === 0) {
      console.log(`Progress: ${i - startIdx}/${lines.length - startIdx - 1} - Updated: ${updated}, Not found: ${notFound}`)
    }
  }
  
  console.log(`\nCompleted!`)
  console.log(`Updated: ${updated}`)
  console.log(`Not found: ${notFound}`)
  
  // Count linguists with crmId
  const withCrmId = await prisma.linguist.count({ where: { crmId: { not: null } } })
  console.log(`\nLinguists with CRM ID: ${withCrmId}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
