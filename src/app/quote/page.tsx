import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { FileText, Clock, Shield, Globe, Users, Zap, CheckCircle2 } from 'lucide-react'
import QuoteForm from '@/components/QuoteForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Request a Quote | LINK Translations',
  description: 'Get a free quote for professional translation, interpretation, or transcription services. Fast turnaround, competitive pricing.',
}

export default async function QuotePage() {
  // Fetch languages for dropdowns
  const languages = await prisma.language.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, code: true }
  })

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm mb-6 shadow-sm">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">Free Quote</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Request a <span className="text-blue-600">Free Quote</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fill out the form below and we&apos;ll provide a detailed quote within 2 hours 
            during business hours.
          </p>
        </div>
      </section>

      {/* Quote Form */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <QuoteForm languages={languages} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Contact */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-4">Need Faster Service?</h3>
                <p className="text-gray-700 mb-4">
                  Call us directly for immediate assistance with your translation needs.
                </p>
                <a 
                  href="tel:1-877-272-5465"
                  className="flex items-center gap-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  1-877-272-LINK
                </a>
                <p className="text-sm text-gray-600 mt-2">
                  Mon-Fri, 9am - 6pm EST
                </p>
              </div>

              {/* Pricing Info */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Pricing Guidelines</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Translation: Starting at $0.12/word</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Certified: Add $25 per document</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Notarized: Add $35 per document</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Rush service available (24-48 hours)</span>
                  </li>
                </ul>
                <p className="mt-4 text-xs text-gray-500">
                  Final pricing depends on language pair, complexity, and deadline.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Why Choose Us?</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span>29 years in business</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span>100% USCIS acceptance rate</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <span>150+ languages</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span>26,563 certified linguists</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span>Rush service available</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
