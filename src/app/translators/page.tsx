import Link from 'next/link'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import TranslatorSearchForm from '@/components/TranslatorSearchForm'
import { MapPin, Users, Globe, ArrowRight, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Find Translators & Interpreters | LINK Translations',
  description: 'Find certified translators and interpreters in your state. LINK Translations has 26,563 linguists across all 50 US states.',
}

interface State {
  id: string
  name: string
  code: string
}

interface Language {
  id: string
  name: string
  code: string | null
}

export default async function TranslatorsPage() {
  // Fetch states from database
  const states: State[] = await prisma.state.findMany({
    orderBy: { name: 'asc' }
  })

  // Get linguist count per state
  const linguistCounts = await prisma.linguist.groupBy({
    by: ['state'],
    _count: { state: true }
  })

  // Convert to plain object for serialization
  const countMap: Record<string, number> = {}
  linguistCounts.forEach((c: { state: string | null; _count: { state: number } }) => {
    if (c.state) countMap[c.state] = c._count.state
  })

  // Fetch languages for the language filter
  const languages: Language[] = await prisma.language.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-6 relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Search className="w-4 h-4" />
            Find Your Expert
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Find Translators &
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Interpreters</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select your state to find certified translators and professional interpreters 
            in your area. We have linguists in all 50 states.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { icon: Users, value: '26,563', label: 'Certified Linguists' },
              { icon: MapPin, value: '51', label: 'States & Territories' },
              { icon: Globe, value: '150+', label: 'Languages Covered' }
            ].map((stat, i) => (
              <div key={i} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-3xl">
          <TranslatorSearchForm 
            states={states} 
            languages={languages} 
            countMap={countMap} 
          />
        </div>
      </section>

      {/* States Grid */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Browse by State
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {states.map((state) => (
              <Link
                key={state.id}
                href={`/translators/${state.code.toLowerCase()}`}
                className="group bg-white border border-gray-200 rounded-xl px-4 py-4 text-center hover:border-blue-400 hover:shadow-lg transition-all duration-300"
              >
                <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{state.name}</div>
                <div className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold">
                  {countMap[state.code] || 0} linguists
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Languages */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Languages
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Spanish', 'French', 'Portuguese', 'Chinese', 'Arabic', 'German', 'Russian', 'Korean', 'Japanese', 'Italian', 'Vietnamese', 'Hindi'].map((lang) => (
              <div 
                key={lang}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl px-4 py-4 text-center hover:shadow-md transition-all duration-300"
              >
                <span className="font-medium text-blue-800">{lang}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="container mx-auto px-6 relative text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Can&apos;t Find What You Need?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Contact us directly and we&apos;ll match you with the perfect translator or interpreter
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/quote"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Request a Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="tel:1-877-272-5465"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
            >
              Call 1-877-272-LINK
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
