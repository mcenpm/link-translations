'use client'

import Link from 'next/link'
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()
  
  // Hide footer on admin and login pages
  const hideFooter = pathname?.startsWith('/admin') || pathname === '/login'
  
  if (hideFooter) return null

  return (
    <footer className="bg-gray-900 text-white">
      {/* Simple CTA Banner */}
      <div className="bg-blue-600">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Ready to get started?</h3>
              <p className="text-blue-100 text-sm">Get a free quote in minutes.</p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/quote"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-colors"
              >
                Get a Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a 
                href="tel:1-877-272-5465"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div>
        <div className="container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-4">
              <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                <div className="w-10 h-10 bg-white text-gray-900 rounded-lg flex items-center justify-center font-bold text-lg">
                  L
                </div>
                <span className="text-xl font-bold">LINK</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
                Certified translations and professional interpretation in 150+ languages since 1995.
              </p>
              <div className="space-y-3 text-sm">
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>16560 NW 1st Street, Pembroke Pines, FL 33028</span>
                </a>
                <a 
                  href="tel:1-877-272-5465" 
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>1-877-272-LINK (5465)</span>
                </a>
                <a 
                  href="mailto:info@linktranslations.com" 
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>info@linktranslations.com</span>
                </a>
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-8">
              <div className="grid sm:grid-cols-3 gap-8">
                {/* Services */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-4">Services</h4>
                  <ul className="space-y-2">
                    {[
                      { href: '/services/translation', label: 'Document Translation' },
                      { href: '/services/certified-translations', label: 'Certified Translations' },
                      { href: '/services/interpretation', label: 'Interpretation' },
                      { href: '/services/transcription', label: 'Transcription' },
                      { href: '/services/typesetting', label: 'Typesetting / DTP' },
                    ].map((link) => (
                      <li key={link.href}>
                        <Link 
                          href={link.href} 
                          className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Company */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
                  <ul className="space-y-2">
                    {[
                      { href: '/about', label: 'About Us' },
                      { href: '/languages', label: 'Languages' },
                      { href: '/translators', label: 'Find Translators' },
                      { href: '/contact', label: 'Contact' },
                      { href: '/careers', label: 'Careers' },
                    ].map((link) => (
                      <li key={link.href}>
                        <Link 
                          href={link.href} 
                          className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hours */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-4">Business Hours</h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Monday – Friday</span>
                      <span className="text-white">9AM – 6PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekend</span>
                      <span>By appointment</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-6">
                    Certified Woman-Owned Business Enterprise
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} LINK Translations & Typesetting, Inc.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
