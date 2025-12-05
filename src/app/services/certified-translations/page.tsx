import Link from 'next/link'
import { Metadata } from 'next'
import { Shield, CheckCircle2, ArrowRight, FileCheck, Stamp, Globe, Building, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Certified & Notarized Translations | USCIS Accepted | LINK Translations',
  description: 'Court-ready certified translations accepted by USCIS, courts, and government agencies. Birth certificates, marriage certificates, diplomas, and more. 24-hour service available.',
}

export default function CertifiedTranslationsPage() {
  const acceptedBy = [
    'USCIS (Immigration)',
    'Federal & State Courts',
    'Universities & Colleges',
    'Government Agencies',
    'Embassies & Consulates',
    'Medical Institutions',
  ]

  const commonDocuments = [
    {
      category: 'Personal Documents',
      items: [
        'Birth certificates',
        'Marriage certificates',
        'Divorce decrees',
        'Death certificates',
        'Passports & IDs',
        'Driver\'s licenses',
      ],
    },
    {
      category: 'Immigration Documents',
      items: [
        'I-485 support documents',
        'I-130 evidence',
        'Green card applications',
        'Visa petitions',
        'Asylum applications',
        'Citizenship documents',
      ],
    },
    {
      category: 'Academic Records',
      items: [
        'Diplomas & degrees',
        'Transcripts',
        'Course descriptions',
        'Letters of recommendation',
        'Academic certificates',
        'Syllabi',
      ],
    },
    {
      category: 'Legal Documents',
      items: [
        'Contracts & agreements',
        'Power of attorney',
        'Court orders',
        'Affidavits',
        'Wills & trusts',
        'Legal notices',
      ],
    },
  ]

  const process = [
    {
      step: '1',
      title: 'Submit Documents',
      description: 'Send us your documents via email, fax, or mail. We accept scanned copies and photos.',
    },
    {
      step: '2',
      title: 'Expert Translation',
      description: 'A certified translator translates your document with precision and accuracy.',
    },
    {
      step: '3',
      title: 'Quality Review',
      description: 'Independent reviewer verifies translation accuracy and formatting.',
    },
    {
      step: '4',
      title: 'Certification & Notarization',
      description: 'We certify the translation accuracy and notarize if required.',
    },
    {
      step: '5',
      title: 'Delivery',
      description: 'Receive your certified translation via email, mail, or pickup. Ready to file!',
    },
  ]

  return (
    <div className="min-h-screen pt-20">
      {/* Hero - Modern Gradient */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '1.5s' }} />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center animate-slide-in-down">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 mb-6 shadow-sm">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">USCIS & Court Accepted · Legally Valid</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Certified &
              <span className="block gradient-text">Notarized Translations</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Court-ready translations accepted by USCIS, federal courts, state agencies, and universities. 
              Certified by <span className="font-semibold text-gray-900">professional translators</span>, notarized for legal validity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                href="/quote"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Get Certified Quote
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="tel:1-877-272-5465"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                📞 1-877-272-LINK
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {['24-Hour Rush Available', 'Notarization Included', 'Money-Back Guarantee'].map((badge) => (
                <div key={badge} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Accepted By */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-500 mb-8">Accepted by official institutions nationwide</p>
          <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
            {acceptedBy.map((org) => (
              <div key={org} className="flex items-center gap-2 text-gray-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                {org}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Documents */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What documents can we certify?
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              We certify all types of personal, legal, academic, and business documents
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {commonDocuments.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{category.category}</h3>
                <ul className="space-y-3">
                  {category.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Simple, fast, and reliable process
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {process.map((item, index) => (
                <div key={index} className="flex gap-6 items-start group">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-2xl p-6 group-hover:bg-white group-hover:shadow-lg transition-all border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-24 bg-gradient-to-br from-purple-600 to-blue-700 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">What's included in certification?</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-5">
                  <FileCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Certificate of Accuracy</h3>
                <p className="text-purple-100">
                  Official certificate signed by certified translator stating the translation is accurate and complete.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-5">
                  <Stamp className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Notarization</h3>
                <p className="text-purple-100">
                  Notary public seal and signature verifying the translator's identity and credentials.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-5">
                  <Building className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Company Letterhead</h3>
                <p className="text-purple-100">
                  Printed on official LINK Translations letterhead with contact information for verification.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-4">USCIS Compliance Guaranteed</h3>
              <p className="text-purple-100 text-lg">
                Our certified translations meet all USCIS requirements under 8 CFR 103.2(b)(3). 
                We have successfully completed thousands of immigration translations with a 100% acceptance rate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Need your documents certified?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Get your certified translation in as little as 24 hours. 100% acceptance guarantee.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/quote"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 text-lg font-semibold rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl transition-all"
            >
              Get Certified Quote
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
