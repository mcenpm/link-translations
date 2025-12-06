import { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us | LINK Translations & Typesetting',
  description: 'Contact LINK Translations for a free quote. Call 1-877-272-LINK (5465), fax 954-433-5994, or visit us in Pembroke Pines, FL.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero - Clean design */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm mb-6 shadow-sm">
            <Phone className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">We&apos;re here to help</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Get in <span className="text-blue-600">Touch</span>
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
              { icon: Phone, label: 'Call Us', value: '1-877-272-LINK', href: 'tel:1-877-272-5465' },
              { icon: Mail, label: 'Email', value: 'info@linktranslations.com', href: 'mailto:info@linktranslations.com' },
              { icon: MapPin, label: 'Address', value: 'Pembroke Pines, FL', href: '#' },
              { icon: Clock, label: 'Hours', value: 'Mon-Fri 9am-6pm EST', href: '#' },
            ].map((item, index) => (
              <a 
                key={index}
                href={item.href}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-blue-600" />
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
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Why <span className="text-blue-600">call us?</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Dealing with a company solely online can be frustrating and even dangerous. 
                That&apos;s why we ask you to call us. You&apos;ll see what a difference it makes to 
                deal with a company with a <span className="font-semibold text-gray-900">proven track record of nearly 30 years</span> in the industry.
              </p>
              
              <div className="space-y-4 mb-12">
                <div className="flex gap-4 items-start p-5 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Toll Free</h3>
                    <a href="tel:1-877-272-5465" className="text-xl text-blue-600 font-bold hover:text-blue-700 transition-colors">
                      1-877-272-LINK (5465)
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-5 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:info@linktranslations.com" className="text-xl text-blue-600 font-bold hover:text-blue-700 transition-colors">
                      info@linktranslations.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-5 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600" />
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

              <div className="rounded-xl p-6 bg-blue-600 text-white">
                <h3 className="font-bold text-xl mb-2">Fax Your Documents</h3>
                <p className="text-blue-100 mb-2">
                  Send documents for quotation via fax
                </p>
                <p className="text-2xl font-bold">954-433-5994</p>
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
