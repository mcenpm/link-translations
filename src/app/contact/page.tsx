import { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock, Sparkles } from 'lucide-react'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us | LINK Translations & Typesetting',
  description: 'Contact LINK Translations for a free quote. Call 1-877-272-LINK (5465), fax 954-433-5994, or visit us in Pembroke Pines, FL.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero - Modern gradient */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-blue-50" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl animate-float-slow" />
        
        <div className="container mx-auto px-6 relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-violet-100 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-semibold text-gray-700">We're here to help · Fast response</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-slide-in-down">
            Get in
            <span className="block gradient-text">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Our customer service team is ready to assist you with all your language translation needs. 
            <span className="block mt-2 font-semibold text-gray-900">Call us today—it makes a difference.</span>
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-8">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Phone, label: 'Call Us', value: '1-877-272-LINK', href: 'tel:1-877-272-5465', gradient: 'from-violet-500 to-purple-600' },
              { icon: Mail, label: 'Email', value: 'info@linktranslations.com', href: 'mailto:info@linktranslations.com', gradient: 'from-blue-500 to-cyan-600' },
              { icon: MapPin, label: 'Address', value: 'Pembroke Pines, FL', href: '#', gradient: 'from-pink-500 to-rose-600' },
              { icon: Clock, label: 'Hours', value: 'Mon-Fri 9am-6pm EST', href: '#', gradient: 'from-purple-500 to-indigo-600' },
            ].map((item, index) => (
              <a 
                key={index}
                href={item.href}
                className="card hover-lift text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm text-gray-500 mb-1 font-medium">{item.label}</div>
                <div className="font-semibold text-gray-900">{item.value}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div className="animate-fade-in-up">
              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Why <span className="gradient-text">call us?</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Dealing with a company solely online can be frustrating and even dangerous. 
                That&apos;s why we ask you to call us. You&apos;ll see what a difference it makes to 
                deal with a company with a <span className="font-semibold text-gray-900">proven track record of nearly 30 years</span> in the industry.
              </p>
              
              <div className="space-y-6 mb-12">
                <div className="flex gap-4 items-start p-5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Toll Free</h3>
                    <a href="tel:1-877-272-5465" className="text-xl text-violet-600 font-bold hover:text-violet-700 transition-colors">
                      1-877-272-LINK (5465)
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:info@linktranslations.com" className="text-xl text-blue-600 font-bold hover:text-blue-700 transition-colors">
                      info@linktranslations.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-5 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Mailing Address</h3>
                    <p className="text-gray-700 leading-relaxed">
                      LINK Translations & Typesetting<br />
                      16560 NW 1st Street<br />
                      Pembroke Pines, FL 33028
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600" />
                <div className="relative z-10">
                  <h3 className="font-bold text-2xl mb-3">Fax Your Documents</h3>
                  <p className="text-violet-100 mb-4">
                    Send documents for quotation via fax
                  </p>
                  <p className="text-3xl font-bold">954-433-5994</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}
