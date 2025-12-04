import Link from 'next/link'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Globe, FileText, Mic2, Headphones, Shield, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Languages We Translate | LINK Translations',
  description: 'LINK Translations offers professional translation services in over 150 languages including Spanish, French, Portuguese, Chinese, Arabic, and more.',
}

// Major language groups for organization
const languageGroups = {
  'European Languages': ['Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Polish', 'Russian', 'Greek', 'Romanian', 'Bulgarian', 'Czech', 'Hungarian', 'Swedish', 'Norwegian', 'Danish', 'Finnish'],
  'Asian Languages': ['Chinese', 'Japanese', 'Korean', 'Vietnamese', 'Thai', 'Indonesian', 'Malay', 'Tagalog', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Urdu'],
  'Middle Eastern Languages': ['Arabic', 'Hebrew', 'Persian', 'Turkish', 'Dari', 'Pashto'],
  'African Languages': ['Swahili', 'Amharic', 'Somali', 'Hausa', 'Yoruba', 'Zulu'],
  'Other Languages': ['Haitian Creole']
}

export default async function LanguagesPage() {
  // Fetch languages from database
  const languages = await prisma.language.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-6 relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Globe className="w-4 h-4" />
            150+ Languages
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Languages we
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> translate</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            LINK Translations provides professional translation, interpretation, and 
            transcription services in over 150 languages. Our network of certified 
            linguists ensures accurate and culturally appropriate translations.
          </p>
        </div>
      </section>

      {/* Language Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              { value: '150+', label: 'Languages Supported' },
              { value: '26,563', label: 'Certified Linguists' },
              { value: '29', label: 'Years of Excellence' },
              { value: '100%', label: 'USCIS Acceptance Rate' }
            ].map((stat, i) => (
              <div key={i} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Database Languages */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Primary Languages
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These are our most frequently requested languages with extensive translator networks
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-4">
            {languages.map((lang) => (
              <div 
                key={lang.id}
                className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-300 text-center"
              >
                <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{lang.name}</span>
                {lang.code && (
                  <span className="text-xs text-gray-400 ml-2">({lang.code})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Languages by Group */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Complete Language List
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer translation services in over 150 languages. Below are our most commonly 
              requested languages, organized by region.
            </p>
          </div>

          <div className="space-y-12">
            {Object.entries(languageGroups).map(([group, langs]) => (
              <div key={group}>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </span>
                  {group}
                </h3>
                <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {langs.map((lang) => (
                    <div 
                      key={lang}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-center hover:border-blue-400 hover:shadow-md transition-all duration-300"
                    >
                      {lang}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Don&apos;t See Your Language?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We work with translators in over 150 languages. If your language isn&apos;t listed 
              above, please contact us. We likely have certified translators ready to help.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
            >
              Contact Us About Your Language
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Per Language */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Services Available in All Languages
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FileText, title: 'Document Translation', desc: 'Legal, medical, technical, and corporate documents translated with certified accuracy.' },
              { icon: Mic2, title: 'Interpretation', desc: 'On-site and remote interpretation for depositions, hearings, and medical appointments.' },
              { icon: Headphones, title: 'Transcription', desc: 'Audio and video transcription with translation services available.' },
              { icon: Shield, title: 'Certified Translations', desc: 'USCIS-accepted certified and notarized translations for immigration documents.' }
            ].map((service, i) => (
              <div key={i} className="group text-center bg-white rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="container mx-auto px-6 relative text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Get a free quote for your translation project in any language
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/quote"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Request a Free Quote
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
