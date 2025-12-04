import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowRight, CheckCircle2, Globe, Sparkles, Zap, Shield, Clock, Users, Star, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'LINK Translations | Professional Language Services Since 1995',
  description: 'Certified translations, court interpreters, and typesetting services in 150+ languages. Serving clients nationwide since 1995.',
}

export default function Home() {
  return (
    <>
      {/* Hero Section - Light, Clean, Attractive */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20">
        {/* Decorative elements */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        <div className="container relative mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-8 animate-fade-in-up">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Trusted by 10,000+ clients since 1995</span>
              </div>
              
              {/* Main headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 tracking-tight leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Professional
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">language services</span>
                <br />
                you can trust
              </h1>
              
              {/* Subheadline */}
              <p className="text-xl text-gray-600 mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Certified translations, expert interpreters, and professional typesetting in 
                <span className="font-semibold text-gray-900"> 150+ languages</span>. 
                Nearly 30 years of excellence.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Link 
                  href="/quote"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300"
                >
                  Get Free Quote
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a 
                  href="tel:1-877-272-5465"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                >
                  📞 1-877-272-LINK
                </a>
              </div>
              
              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 text-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                {[
                  'USCIS Accepted',
                  'Court Certified',
                  'Same-Day Available',
                ].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Featured Card */}
            <div className="hidden lg:block relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Quick Quote</h3>
                    <p className="text-gray-500">Response in 2 hours</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Languages</span>
                    <span className="font-bold text-blue-600">150+</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Expert Linguists</span>
                    <span className="font-bold text-blue-600">26,500+</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Projects Completed</span>
                    <span className="font-bold text-blue-600">35,000+</span>
                  </div>
                </div>

                <Link 
                  href="/quote"
                  className="block w-full text-center py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all"
                >
                  Request Quote Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos/Trust Section */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-8">Trusted by leading organizations nationwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {['Law Firms', 'Healthcare', 'Government', 'Corporations', 'Courts'].map((name) => (
              <div key={name} className="text-xl font-bold text-gray-400">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Bento Grid */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Complete language solutions for legal, medical, business, and personal needs.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {/* Large card */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-12 text-white hover-lift">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-6">
                  <Globe className="w-7 h-7" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Document Translation</h3>
                <p className="text-blue-100 text-lg mb-6 max-w-md">
                  Legal contracts, medical records, business documents, websites, and more. 
                  Certified and notarized translations ready for any purpose.
                </p>
                <Link href="/services" className="inline-flex items-center gap-2 text-white font-semibold hover:gap-3 transition-all">
                  Learn more <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3" />
            </div>

            {/* Small cards */}
            <div className="group rounded-3xl bg-white p-8 shadow-sm border border-gray-100 hover-lift">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-5">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Certified & Notarized</h3>
              <p className="text-gray-500">Court-ready translations accepted by USCIS, courts, and government agencies.</p>
            </div>

            <div className="group rounded-3xl bg-white p-8 shadow-sm border border-gray-100 hover-lift">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-5">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Interpretation</h3>
              <p className="text-gray-500">On-site and remote interpreters for depositions, trials, medical appointments.</p>
            </div>

            <div className="group rounded-3xl bg-white p-8 shadow-sm border border-gray-100 hover-lift">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Turnaround</h3>
              <p className="text-gray-500">Rush services available. Get quotes in hours, not days.</p>
            </div>

            {/* Wide card */}
            <div className="md:col-span-2 group rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-12 text-white hover-lift overflow-hidden relative">
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-6">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Typesetting & DTP</h3>
                <p className="text-gray-400 text-lg max-w-md">
                  Professional desktop publishing in all languages. Preserve your formatting, 
                  fonts, and layout across any platform.
                </p>
              </div>
              <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
                <Globe className="w-48 h-48" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Modern */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Why 10,000+ clients
                <br />
                <span className="gradient-text">trust us</span>
              </h2>
              <p className="text-xl text-gray-500 mb-10">
                In an AI-driven world, we combine cutting-edge technology with human expertise. 
                Every translation is reviewed by certified linguists.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: 'Human-First Approach', desc: 'Real experts, not just AI. Every project reviewed by certified linguists.' },
                  { title: 'Industry Expertise', desc: 'Specialized translators for legal, medical, technical, and more.' },
                  { title: 'Transparent Pricing', desc: 'Upfront quotes with no hidden fees. Pay only for what you need.' },
                  { title: 'Personal Support', desc: 'Dedicated project managers. Always a phone call away.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial Card */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20" />
              <div className="relative bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-xl text-gray-700 mb-8 leading-relaxed">
                  &ldquo;LINK has been our translation partner for over 15 years. Their attention to detail 
                  and understanding of legal terminology is unmatched. They&apos;re not just a vendor, 
                  they&apos;re an extension of our team.&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    JM
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">James Mitchell</div>
                    <div className="text-gray-500 text-sm">Partner, Morrison & Associates Law</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find Translators - Interactive Map Style */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nationwide coverage
            </h2>
            <p className="text-xl text-gray-500">
              Certified linguists in all 50 states, ready when you need them.
            </p>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-w-4xl mx-auto mb-12">
            {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
              'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
              'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
              'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
              'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map((state) => (
              <Link
                key={state}
                href={`/translators/${state.toLowerCase()}`}
                className="aspect-square flex items-center justify-center rounded-xl bg-white text-gray-600 font-semibold text-sm border border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-110 hover:shadow-lg transition-all duration-200"
              >
                {state}
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link 
              href="/translators"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
            >
              View all locations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Gradient */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Animated blobs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        
        <div className="container relative mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Get a free quote in minutes. No commitment, no hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/quote"
              className="group inline-flex items-center justify-center gap-2 px-10 py-5 text-lg font-semibold rounded-full bg-white text-gray-900 hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/20"
            >
              Request Free Quote
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="tel:1-877-272-5465"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 text-lg font-semibold rounded-full border-2 border-white/20 text-white hover:bg-white/10 transition-all duration-300"
            >
              📞 1-877-272-LINK
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
