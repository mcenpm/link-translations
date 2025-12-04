import Link from 'next/link'
import { Metadata } from 'next'
import { FileText, Shield, Mic2, Film, Palette, ArrowRight, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Translation & Interpretation Services | LINK Translations',
  description: 'Professional translation, certified translations, court interpreters, transcription, and typesetting services in 150+ languages. Call 1-877-272-LINK.',
}

export default function ServicesPage() {
  const mainServices = [
    {
      id: 'translation',
      icon: FileText,
      color: 'blue',
      title: 'Document Translation',
      description: 'Professional translation services for all types of documents in over 150 languages.',
      features: [
        'Legal documents & contracts',
        'Corporate & business materials',
        'Marketing brochures & websites',
        'Technical manuals & data sheets',
        'Books & training modules',
        'Annual reports & newsletters',
      ],
    },
    {
      id: 'certified',
      icon: Shield,
      color: 'purple',
      title: 'Certified & Notarized Translations',
      description: 'Court-ready translations certified and notarized for legal proceedings.',
      features: [
        'Birth & marriage certificates',
        'Immigration documents (USCIS)',
        'Legal contracts & agreements',
        'Academic transcripts & diplomas',
        'Medical records',
        'Ready to file in court',
      ],
    },
    {
      id: 'interpretation',
      icon: Mic2,
      color: 'amber',
      title: 'Interpretation Services',
      description: 'Certified interpreters for all types of legal and business proceedings.',
      features: [
        'Depositions & hearings',
        'Trials & court proceedings',
        'Independent Medical Examinations (IME)',
        'Examinations Under Oath (EUO)',
        'Mediations & arbitrations',
        'Business conferences & meetings',
      ],
    },
    {
      id: 'transcription',
      icon: Film,
      color: 'emerald',
      title: 'Translation & Transcription',
      description: 'Complete audiovisual translation and transcription services for the legal field.',
      features: [
        'Audio & video transcription',
        'Numbered pages format',
        'Line-by-line transcription',
        'Certified & notarized',
        'Court-ready format',
        'All languages supported',
      ],
    },
    {
      id: 'typesetting',
      icon: Palette,
      color: 'rose',
      title: 'Professional Typesetting',
      description: 'Expert typesetting services to maintain document formatting across languages.',
      features: [
        'Desktop publishing (DTP)',
        'All file formats supported',
        'Right-to-left languages',
        'Complex scripts & fonts',
        'Print-ready output',
        'All platforms supported',
      ],
    },
  ]

  const legalServices = [
    'Depositions',
    'Hearings',
    'Trials',
    'IME (Independent Medical Examinations)',
    'EUO (Examinations Under Oath)',
    'Statements',
    'Client interviews',
    'Conferences',
    'Mediations',
    'Bankruptcy hearings',
    'Calendar calls',
    'Arraignments',
  ]

  const colorClasses: Record<string, { bg: string; text: string; bgLight: string }> = {
    blue: { bg: 'bg-blue-600', text: 'text-blue-600', bgLight: 'bg-blue-50' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-600', bgLight: 'bg-purple-50' },
    amber: { bg: 'bg-amber-600', text: 'text-amber-600', bgLight: 'bg-amber-50' },
    emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', bgLight: 'bg-emerald-50' },
    rose: { bg: 'bg-rose-600', text: 'text-rose-600', bgLight: 'bg-rose-50' },
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              Complete Language Solutions
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Professional services for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> every need</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              From certified translations to court interpretation, we provide comprehensive 
              language solutions for businesses, legal professionals, and individuals.
            </p>
            <Link 
              href="/quote"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              Get Free Quote <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="space-y-24">
            {mainServices.map((service, index) => {
              const colors = colorClasses[service.color]
              const Icon = service.icon
              return (
                <div 
                  key={service.id}
                  id={service.id}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? '' : ''}`}
                >
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${colors.bgLight} mb-6`}>
                      <Icon className={`w-7 h-7 ${colors.text}`} />
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{service.title}</h2>
                    <p className="text-lg text-gray-600 mb-8">{service.description}</p>
                    <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link 
                      href="/quote"
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl ${colors.bg} text-white font-semibold hover:opacity-90 transition-all`}
                    >
                      Request Quote <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className={`absolute -inset-4 ${colors.bgLight} rounded-3xl blur-xl opacity-50`} />
                    <div className="relative bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
                      <div className={`w-24 h-24 rounded-2xl ${colors.bgLight} flex items-center justify-center mx-auto mb-6`}>
                        <Icon className={`w-12 h-12 ${colors.text}`} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">{service.title}</h3>
                      <p className="text-gray-500 text-center">{service.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Legal Interpretation */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Certified Legal Interpreters</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Professional interpreters for all types of legal proceedings in all languages
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {legalServices.map((service, index) => (
              <div key={index} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
                {service}
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              All transcripts are generated on numbered pages, line-by-line format, certified, notarized and ready to file in court.
            </p>
            <a 
              href="tel:1-877-272-5465"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              📞 Call 1-877-272-LINK for a Quote
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Contact us to discuss your specific language service needs. We&apos;re here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/quote"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors"
            >
              Request Quote <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
