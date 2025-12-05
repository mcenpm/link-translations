import Link from 'next/link'
import { Metadata } from 'next'
import { FileText, CheckCircle2, ArrowRight, Globe, Building2, Stethoscope, Scale, Megaphone, Cog, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Professional Document Translation Services | LINK Translations',
  description: 'Expert document translation in 150+ languages. Legal, medical, technical, business, and personal documents. Fast turnaround, certified translations available.',
}

export default function TranslationServicesPage() {
  const industries = [
    {
      icon: Scale,
      name: 'Legal',
      description: 'Contracts, court documents, depositions, patents, litigation support',
    },
    {
      icon: Stethoscope,
      name: 'Medical & Healthcare',
      description: 'Medical records, clinical trials, pharmaceutical documents, patient forms',
    },
    {
      icon: Building2,
      name: 'Business & Corporate',
      description: 'Annual reports, marketing materials, HR documents, financial statements',
    },
    {
      icon: Cog,
      name: 'Technical',
      description: 'Manuals, specifications, engineering documents, software localization',
    },
    {
      icon: Megaphone,
      name: 'Marketing',
      description: 'Websites, brochures, advertising, social media, brand materials',
    },
    {
      icon: Globe,
      name: 'Government',
      description: 'RFPs, policies, public notices, immigration documents, permits',
    },
  ]

  const documentTypes = [
    'Legal contracts & agreements',
    'Birth & marriage certificates',
    'Medical records & prescriptions',
    'Academic transcripts & diplomas',
    'Business documents & reports',
    'Immigration documents',
    'Financial statements',
    'Technical manuals',
    'Marketing materials',
    'Websites & software',
    'Books & manuscripts',
    'Patents & trademarks',
  ]

  const features = [
    {
      title: 'Native-Speaking Translators',
      description: 'Every translation is performed by a native speaker of the target language with subject matter expertise.',
    },
    {
      title: 'Two-Step Review Process',
      description: 'Translation + independent review ensures accuracy and quality in every document.',
    },
    {
      title: 'Industry Specialization',
      description: 'Our translators specialize in specific industries and understand technical terminology.',
    },
    {
      title: 'Confidentiality Guaranteed',
      description: 'All projects are covered by strict NDAs. Your documents are secure and confidential.',
    },
    {
      title: 'Fast Turnaround',
      description: 'Rush service available. Most documents completed within 24-48 hours.',
    },
    {
      title: 'Affordable Pricing',
      description: 'Competitive rates with no hidden fees. Volume discounts available.',
    },
  ]

  return (
    <div className="min-h-screen pt-20">
      {/* Hero - Modern with gradient */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-blue-50" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center animate-slide-in-down">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-violet-100 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-gray-700">150+ Languages · Expert Linguists</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Professional
              <span className="block gradient-text">Document Translation</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Accurate, certified translations for legal, medical, technical, and business documents. 
              Trusted by <span className="font-semibold text-gray-900">10,000+ clients</span> since 1995.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/quote"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Get Free Quote
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="tel:1-877-272-5465"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-white border-2 border-gray-200 text-gray-700 hover:border-violet-300 hover:shadow-lg transition-all duration-300"
              >
                📞 1-877-272-LINK
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Expertise */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Industry <span className="gradient-text">Expertise</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Specialized translators with deep domain knowledge in every sector
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {industries.map((industry, index) => (
              <div 
                key={index} 
                className="card hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <industry.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{industry.name}</h3>
                <p className="text-gray-600 leading-relaxed">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Document Types */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-violet-50/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="animate-fade-in-up">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  We translate <span className="gradient-text">any type</span> of document
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  From personal certificates to complex technical manuals, our expert translators 
                  handle all document types with precision and care.
                </p>
                
                <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4">Need it certified?</h3>
                    <p className="text-violet-100 mb-6 leading-relaxed">
                      We provide certified and notarized translations accepted by USCIS, courts, 
                      universities, and government agencies worldwide.
                    </p>
                    <Link 
                      href="/services/certified-translations"
                      className="inline-flex items-center gap-2 text-white font-semibold hover:gap-3 transition-all"
                    >
                      Learn about certified translations <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {documentTypes.map((type, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why choose LINK Translations?
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Quality, speed, and expertise you can trust
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to translate your documents?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Get a free quote in minutes. No commitment, no hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/quote"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 text-lg font-semibold rounded-full bg-white text-gray-900 hover:bg-gray-100 transition-all"
            >
              Request Free Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="tel:1-877-272-5465"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 text-lg font-semibold rounded-full border-2 border-white/20 text-white hover:bg-white/10 transition-all"
            >
              📞 1-877-272-LINK
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
