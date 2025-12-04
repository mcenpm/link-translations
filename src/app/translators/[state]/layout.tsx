import type { Metadata } from 'next'
import TranslatorsPageContent from './page'

interface Props {
  params: { state: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const state = params.state.toUpperCase()
  
  return {
    title: `Professional Translators in ${state} | Link Translations`,
    description: `Find professional translators and interpreters in ${state}. Expert linguists for business translation services.`,
    keywords: `translators ${state}, interpreters ${state}, translation services, professional linguists`,
  }
}

export default function Page({ params }: Props) {
  return <TranslatorsPageContent params={params} />
}
