import Link from 'next/link'
import { Metadata } from 'next'
import { Mic2, CheckCircle2, ArrowRight, Users, Video, Phone, UserCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Professional Interpretation Services | Court & Medical Interpreters | LINK',
  description: 'Certified interpreters for depositions, trials, medical appointments, and business meetings. On-site and remote interpretation in 150+ languages. Available 24/7.',
}

export default function InterpretationServicesPage() {
  const interpretationTypes = [
    {
      icon: Users,
      title: 'Consecutive Interpretation',
      description: 'Speaker pauses after each statement for interpretation. Ideal for small meetings, medical appointments, and legal consultations.',
      bestFor: ['Medical appointments', 'Attorney-client meetings', 'Small group meetings', 'Interviews'],
    },
    {
      icon: Mic2,
      title: 'Simultaneous Interpretation',
      description: 'Real-time interpretation using specialized equipment. Perfect for conferences, large meetings, and courtrooms.',
      bestFor: ['Conferences', 'Large meetings', 'Court proceedings', 'Webinars'],
    },
    {
      icon: Phone,
      title: 'Telephone Interpretation',
      description: 'Remote interpretation via phone for immediate language support. Available 24/7 for urgent needs.',
      bestFor: ['Emergency situations', 'Quick consultations', '24/7 availability', 'Cost-effective'],
    },
    {
      icon: Video,
      title: 'Video Remote Interpretation (VRI)',
      description: 'Live video interpretation combining visual cues with language support. Ideal for telehealth and remote meetings.',
      bestFor: ['Telehealth', 'Remote depositions', 'Virtual meetings', 'Deaf/hard of hearing'],
    },
  ]

  const legalServices = [
    'Depositions',
    'Trials & hearings',
    'Attorney-client meetings',
    'Witness interviews',
    'IME (Independent Medical Examinations)',
    'EUO (Examinations Under Oath)',
    'Mediations & arbitrations',
    'Contract negotiations',
  ]

  const medicalServices = [
    'Doctor appointments',
    'Hospital visits',
    'Surgery consultations',
    'Mental health sessions',
    'Physical therapy',
    'Telehealth appointments',
    'Patient intake',
    'Medical record reviews',
  ]

  const businessServices = [
    'Board meetings',
    'Client presentations',
    'Training sessions',
    'Site visits',
    'Product demonstrations',
    'Conferences',
    'Negotiations',
    'International calls',
  ]

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 mb-6">
              <Mic2 className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Available 24/7 Nationwide</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Professional
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600"> Interpretation Services</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Certified interpreters for legal proceedings, medical appointments, and business meetings. 
              On-site, remote, and telephone interpretation in 150+ languages.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                href="/quote"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-xl hover:shadow-amber-500/30 transition-all"
              >
                Request Interpreter
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="tel:1-877-272-5465"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50 transition-all"
              >
                📞 1-877-272-LINK
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {['Court Certified', 'Bonded & Insured', 'Same-Day Available'].map((badge) => (
                <div key={badge} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Types of Interpretation */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Types of Interpretation
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Choose the right interpretation method for your needs
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {interpretationTypes.map((type, index) => (
              <div key={index} className="group rounded-2xl border-2 border-gray-200 p-8 hover:border-amber-300 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-6 group-hover:bg-amber-600 transition-colors">
                  <type.icon className="w-7 h-7 text-amber-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{type.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{type.description}</p>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900">Best for:</p>
                  <div className="flex flex-wrap gap-2">
                    {type.bestFor.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Industries We Serve
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Specialized interpreters for every sector
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Legal */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-3">
                {legalServices.map((service, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Medical */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-5">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Medical</h3>
              <ul className="space-y-3">
                {medicalServices.map((service, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Business */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-5">
                <Mic2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Business</h3>
              <ul className="space-y-3">
                {businessServices.map((service, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-1" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Interpreters */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Why choose LINK interpreters?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Our interpreters are not just bilingual—they're trained professionals 
                  with industry expertise and cultural competency.
                </p>
                
                <div className="space-y-6">
                  {[
                    { title: 'Certified & Trained', desc: 'Court-certified interpreters with formal training and ongoing education.' },
                    { title: 'Industry Expertise', desc: 'Specialized in legal, medical, and technical terminology.' },
                    { title: 'Cultural Competency', desc: 'Deep understanding of cultural nuances and professional etiquette.' },
                    { title: 'Confidentiality', desc: 'Bonded, insured, and bound by strict confidentiality agreements.' },
                    { title: 'Reliable & Punctual', desc: '99% on-time rate. We understand time-sensitive situations.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl blur-2xl opacity-20" />
                <div className="relative bg-gradient-to-br from-amber-600 to-orange-700 rounded-3xl p-10 text-white shadow-2xl">
                  <h3 className="text-3xl font-bold mb-6">Need an interpreter today?</h3>
                  <p className="text-amber-100 text-lg mb-8">
                    We offer same-day and emergency interpretation services. 
                    Call us now for immediate assistance.
                  </p>
                  <div className="space-y-4">
                    <a 
                      href="tel:1-877-272-5465"
                      className="block w-full text-center py-4 rounded-xl bg-white text-amber-700 font-bold hover:bg-amber-50 transition-all"
                    >
                      📞 Call Now: 1-877-272-LINK
                    </a>
                    <Link 
                      href="/quote"
                      className="block w-full text-center py-4 rounded-xl border-2 border-white/30 text-white font-bold hover:bg-white/10 transition-all"
                    >
                      Request Online Quote
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to book an interpreter?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Available nationwide. Same-day service. Call us 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/quote"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 text-lg font-semibold rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-xl transition-all"
            >
              Request Interpreter
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
