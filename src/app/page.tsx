import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowRight, Clock, Award, Shield, Globe, CheckCircle2, FileText, Mic } from 'lucide-react'

export const metadata: Metadata = {
  title: 'LINK Translations | Professional Language Services Since 1995',
  description: 'Certified translations, court interpreters, and typesetting services in 150+ languages. Serving clients nationwide since 1995.',
}

export default function Home() {
  return (
    <>
      {/* Hero Section - Split Layout */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm mb-6 shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-gray-600">Trusted by 10,000+ clients since 1995</span>
              </div>
              
              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
                Translation & Interpretation{' '}
                <span className="text-blue-600">Done Right</span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Certified translations and professional interpreters in 150+ languages. 
                Fast turnaround, accurate results, always human-reviewed.
              </p>
              
              {/* Trust Points */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>100% USCIS acceptance rate</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>24-48 hour turnaround available</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Certified native-speaking translators</span>
                </div>
              </div>

              {/* Phone CTA */}
              <div className="flex items-center gap-4">
                <a href="tel:1-877-272-5465" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-semibold border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
                  📞 1-877-272-LINK
                </a>
                <span className="text-sm text-gray-500">Mon-Fri, 9am - 6pm EST</span>
              </div>
              
              {/* Stats Row */}
              <div className="flex flex-wrap gap-8 pt-8 mt-8 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">150+</div>
                    <div className="text-xs text-gray-500">Languages</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">29 Years</div>
                    <div className="text-xs text-gray-500">Experience</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">24-48h</div>
                    <div className="text-xs text-gray-500">Turnaround</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Service Selection Cards */}
            <div className="lg:pl-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-center">
                  <h2 className="text-xl font-bold text-white">Get a Free Quote</h2>
                  <p className="text-blue-100 text-sm mt-1">Select the service you need</p>
                </div>

                {/* Service Cards */}
                <div className="p-6 space-y-4">
                  {/* Translation Card */}
                  <Link 
                    href="/quote?service=translation"
                    className="group block bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-transparent hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          Document Translation
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Certified translations for legal, medical, business & personal documents
                        </p>
                        <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                          Request Quote
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Interpretation Card */}
                  <Link 
                    href="/quote?service=interpretation"
                    className="group block bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-transparent hover:border-purple-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/25">
                        <Mic className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                          Interpretation Services
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Court, medical, conference & on-site interpreters nationwide
                        </p>
                        <div className="flex items-center gap-2 text-purple-600 font-medium text-sm">
                          Request Quote
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Quick Contact */}
                  <div className="pt-4 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500 mb-2">Need immediate assistance?</p>
                    <a href="tel:1-877-272-5465" className="text-lg font-bold text-blue-600 hover:text-blue-700">
                      📞 1-877-272-LINK
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-4">
              Our Services
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Expert language solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From legal contracts to medical records, immigration documents to marketing materials—we translate with precision.
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Document Translation */}
            <Link href="/services/translation" className="group bg-white border border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Document Translation</h3>
              <p className="text-gray-600 mb-4">Legal, medical, technical, and business documents translated by certified native speakers.</p>
              <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Certified Translations */}
            <Link href="/services/certified-translations" className="group bg-white border border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Certified Translations</h3>
              <p className="text-gray-600 mb-4">USCIS-accepted, court-ready translations with official certification included.</p>
              <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Interpretation */}
            <Link href="/services/interpretation" className="group bg-white border border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Interpretation</h3>
              <p className="text-gray-600 mb-4">Court, medical, and conference interpreters available on-demand nationwide.</p>
              <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* View All Services */}
          <div className="text-center mt-12">
            <Link href="/services" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">
              View all services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by industry leaders</h2>
            <p className="text-gray-600">See what our clients have to say</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                quote: "LINK has been our trusted partner for over 15 years. Their legal terminology expertise is exceptional.",
                author: "James Mitchell",
                role: "Partner, Morrison & Associates"
              },
              {
                quote: "Fast, accurate, and professional. Certified translations for immigration delivered perfectly in 24 hours.",
                author: "Sarah Rodriguez", 
                role: "Immigration Attorney"
              },
              {
                quote: "The quality of their medical translations is unmatched. Critical for our patient care documentation.",
                author: "Dr. Michael Chen",
                role: "Chief Medical Officer"
              },
              {
                quote: "Their court interpreters are highly skilled and professional. Essential for our depositions.",
                author: "Lisa Thompson",
                role: "Litigation Partner"
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{testimonial.author}</div>
                  <div className="text-xs text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose - Light Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-4">
                Why Choose LINK
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Nearly 30 years of trusted language services
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We&apos;ve learned that great translation isn&apos;t just about words—it&apos;s about understanding context, culture, and nuance.
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
                Learn more about us <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: '99.8%', label: 'Accuracy Rate', desc: 'Every translation reviewed by certified native speakers' },
                { number: '24h', label: 'Turnaround', desc: 'Most documents delivered within 24-48 hours' },
                { number: '$0', label: 'Hidden Fees', desc: 'Clear, upfront pricing on every project' },
                { number: '30', label: 'Years', desc: 'Industry experience you can trust' },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-sm text-blue-600 font-medium mb-2">{stat.label}</div>
                  <div className="text-sm text-gray-500">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
