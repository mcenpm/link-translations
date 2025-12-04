import { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us | LINK Translations & Typesetting',
  description: 'Contact LINK Translations for a free quote. Call 1-877-272-LINK (5465), fax 954-433-5994, or visit us in Pembroke Pines, FL.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-6 relative text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Get in
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We would love to talk to you. Our customer service staff is ready to assist 
            you with all your language translation needs.
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
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center hover-lift"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-sm text-gray-500 mb-1">{item.label}</div>
                <div className="font-semibold text-gray-900">{item.value}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Call Us?</h2>
              <p className="text-lg text-gray-600 mb-8">
                Dealing with a company solely online can be frustrating and even dangerous. 
                That&apos;s why we ask you to call us. You&apos;ll see what a difference it makes to 
                deal with a company with a proven track record of nearly 30 years in the industry.
              </p>
              
              <div className="space-y-6 mb-12">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Toll Free</h3>
                    <a href="tel:1-877-272-5465" className="text-xl text-blue-600 font-bold hover:text-blue-700">
                      1-877-272-LINK (5465)
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:info@linktranslations.com" className="text-xl text-blue-600 hover:text-blue-700">
                      info@linktranslations.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Mailing Address</h3>
                    <p className="text-gray-700">
                      LINK Translations & Typesetting<br />
                      16560 NW 1st Street<br />
                      Pembroke Pines, FL 33028
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
                <h3 className="font-bold text-xl mb-3">Fax Your Documents</h3>
                <p className="text-blue-100 mb-4">
                  Send documents for quotation via fax
                </p>
                <p className="text-2xl font-bold">954-433-5994</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl" />
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                
                <form className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input 
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select 
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select a subject...</option>
                      <option value="quote">Request a Quote</option>
                      <option value="translation">Translation Services</option>
                      <option value="interpretation">Interpretation Services</option>
                      <option value="certified">Certified Translations</option>
                      <option value="employment">Employment Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Please describe your needs or request..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                  >
                    Send Message <Send className="w-5 h-5" />
                  </button>

                  <p className="text-sm text-gray-500 text-center">
                    We typically respond within 2 hours during business hours.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
