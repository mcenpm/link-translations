import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import QuoteWizard from '@/components/QuoteWizard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Request a Quote | LINK Translations',
  description: 'Get a free quote for professional translation, interpretation, or transcription services. Fast turnaround, competitive pricing.',
}

export default async function QuotePage() {
  const languages = await prisma.language.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, code: true }
  })

  return <QuoteWizard languages={languages} />
}
