import Link from 'next/link'
import { Metadata } from 'next'
import { Users, CheckCircle2, Zap, DollarSign, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | LINK Translations & Typesetting Since 1995',
  description: 'Learn about LINK Translations & Typesetting, Inc. - providing professional language services since 1995. A tradition of excellence.',
}

export default function AboutPage() {
  const milestones = [
    { year: '1995', event: 'LINK Translations & Typesetting founded in South Florida' },
    { year: '2000', event: 'Expanded to serve all 50 US states' },
    { year: '2005', event: 'Launched online quote system' },
    { year: '2010', event: 'Reached 10,000+ completed projects milestone' },
    { year: '2015', event: 'Celebrated 20 years of excellence' },
    { year: '2020', event: 'Modernized digital platform' },
    { year: '2024', event: '26,500+ linguists in our network' },
  ]

  const values = [
    {
      icon: Users,
      color: 'blue',
      title: 'Personal Service',
      description: 'We believe in the power of personal connection. Call us anytime - we\'re always here to help.',
    },
    {
      icon: CheckCircle2,
      color: 'emerald',
      title: 'Quality Assured',
      description: 'Every translation is reviewed for accuracy. We stand behind our work with our reputation.',
    },
    {
      icon: Zap,
      color: 'amber',
      title: 'Fast Turnaround',
      description: 'Get quotes in hours, not days. We understand deadlines and deliver on time.',
    },
    {
      icon: DollarSign,
      color: 'purple',
      title: 'Fair Pricing',
      description: 'Accurate and competitive pricing guaranteed. No hidden fees, no surprises.',
    },
  ]

  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              Since 1995
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              A tradition of
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> excellence</span>
            </h1>
            <p className="text-xl text-gray-600">
              You have reached the original LINK Translations. We have been providing 
              professional language services to our clients since 1995. There are many 
              copycats out there, but our unique approach to personal and professional 
              customer service will always set us apart from the rest.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">Our Story</h2>
              <div className="space-y-6 text-lg text-gray-600">
                <p>
                  LINK Translations & Typesetting, Inc. was founded in 1995 with a simple mission: 
                  provide the highest quality language services with a personal touch that clients 
                  can rely on.
                </p>
                <p>
                  In today&apos;s digital marketplace, dealing with a company solely online can be 
                  frustrating and even dangerous. That&apos;s why we still ask our clients to call us. 
                  There&apos;s no substitute for speaking with a real person who understands your needs.
                </p>
                <p>
                  Nearly 30 years later, we&apos;ve completed over 35,000 projects and built a network 
                  of 26,500+ professional linguists across all 50 states. But we&apos;ve never lost 
                  sight of what made us successful: treating every client like family.
                </p>
                <p className="font-medium text-gray-900">
                  LINK Translations has been here for nearly 30 years and will be here tomorrow, 
                  always just a phone call away.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl" />
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Our Journey</h3>
                <div className="space-y-6">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex gap-6 items-start">
                      <div className="flex-shrink-0 w-16 text-blue-600 font-bold text-lg">{milestone.year}</div>
                      <div className="flex-1 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="text-gray-700">{milestone.event}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">What Sets Us Apart</h2>
            <p className="text-xl text-gray-600">
              Our commitment to excellence in everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const colors = colorClasses[value.color]
              const Icon = value.icon
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover-lift">
                  <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center mb-6`}>
                    <Icon className={`w-7 h-7 ${colors.text}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: '30+', label: 'Years in Business' },
              { number: '26,500+', label: 'Professional Linguists' },
              { number: '35,000+', label: 'Projects Completed' },
              { number: '150+', label: 'Languages Supported' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Work With Us?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Experience the LINK difference. Call us today or request a quote online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:1-877-272-5465"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors"
            >
              📞 1-877-272-LINK
            </a>
            <Link 
              href="/quote"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              Get a Quote <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
