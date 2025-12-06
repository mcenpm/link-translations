import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Importing admin users from SugarCRM...')
  
  const filePath = path.join(__dirname, '../data/admin_users.tsv')
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  
  // Skip header
  const dataLines = lines.slice(1)
  
  // Track seen emails and usernames to avoid duplicates
  const seenEmails = new Set<string>()
  const seenUsernames = new Set<string>()
  
  let imported = 0
  let skipped = 0
  
  for (const line of dataLines) {
    const [id, username, firstName, lastName, passwordHash, email] = line.split('\t')
    
    // Skip if no email or already seen
    if (!email || email === 'NULL') {
      console.log(`Skipping ${username}: no email`)
      skipped++
      continue
    }
    
    const emailLower = email.toLowerCase()
    if (seenEmails.has(emailLower)) {
      console.log(`Skipping ${username}: duplicate email ${email}`)
      skipped++
      continue
    }
    
    if (seenUsernames.has(username)) {
      console.log(`Skipping ${username}: duplicate username`)
      skipped++
      continue
    }
    
    seenEmails.add(emailLower)
    seenUsernames.add(username)
    
    try {
      await prisma.adminUser.upsert({
        where: { legacyId: id },
        update: {
          email: emailLower,
          passwordHash: passwordHash,
          username: username,
          firstName: firstName === 'NULL' ? null : firstName,
          lastName: lastName,
          isActive: true,
        },
        create: {
          legacyId: id,
          email: emailLower,
          passwordHash: passwordHash,
          username: username,
          firstName: firstName === 'NULL' ? null : firstName,
          lastName: lastName,
          isActive: true,
        }
      })
      console.log(`Imported: ${username} (${email})`)
      imported++
    } catch (error) {
      console.error(`Error importing ${username}:`, error)
    }
  }
  
  console.log(`\n=== Import Complete ===`)
  console.log(`Imported: ${imported}`)
  console.log(`Skipped: ${skipped}`)
  
  // List all admin users
  const users = await prisma.adminUser.findMany({
    select: { email: true, username: true, firstName: true, lastName: true }
  })
  console.log('\nAdmin Users:')
  console.table(users)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
