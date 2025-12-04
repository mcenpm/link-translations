import type { Metadata } from 'next'
import TranslatorsPageContent from './page'

interface Props {
  params: Promise<{ state: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params
  const stateUpper = state.toUpperCase()
  
  return {
    title: `Professional Translators in ${stateUpper} | Link Translations`,
    description: `Find professional translators and interpreters in ${stateUpper}. Expert linguists for business translation services.`,
    keywords: `translators ${stateUpper}, interpreters ${stateUpper}, translation services, professional linguists`,
  }
}

export default async function Layout({ params, children }: Props) {
  return <>{children}</>
}
