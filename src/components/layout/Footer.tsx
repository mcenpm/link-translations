'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()
  
  // Hide footer on admin and login pages
  const hideFooter = pathname?.startsWith('/admin') || pathname === '/login'
  
  if (hideFooter) return null

  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-4">
            <div className="mb-6">
              <Image 
                src="/logo.png" 
                alt="LINK Translations" 
                width={160} 
                height={45} 
                className="h-11 w-auto brightness-0 invert opacity-90"
              />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              A tradition of excellence since 1995. Providing certified translations, 
              interpretation, and professional language services nationwide.
            </p>
            <div className="space-y-3 text-sm">
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:text-white transition-colors group"
              >
                <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                <span>16560 NW 1st Street, Pembroke Pines, FL 33028</span>
              </a>
              <a 
                href="tel:1-877-272-5465" 
                className="flex items-center gap-3 hover:text-white transition-colors"
              >
                <Phone className="h-5 w-5 text-blue-500 shrink-0" />
                <span>1-877-272-LINK (5465)</span>
              </a>
              <a 
                href="mailto:info@linktranslations.com" 
                className="flex items-center gap-3 hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                <span>info@linktranslations.com</span>
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-3 text-sm">
              {[
                'Document Translation',
                'Certified Translations',
                'Legal Interpretation',
                'Medical Interpretation',
                'Transcription',
                'Typesetting / DTP',
              ].map((service) => (
                <li key={service}>
                  <Link 
                    href="/services" 
                    className="hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    {service}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/translators', label: 'Find Translators' },
                { href: '/languages', label: 'Languages' },
                { href: '/contact', label: 'Contact' },
                { href: '/quote', label: 'Request Quote' },
                { href: '/careers', label: 'Careers' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours & CTA */}
          <div className="lg:col-span-4">
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Business Hours</h4>
            <div className="bg-gray-900 rounded-2xl p-5 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Monday – Friday</span>
                  <span className="text-white font-medium">9:00 AM – 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weekend</span>
                  <span className="text-gray-500">Closed</span>
                </div>
              </div>
            </div>
            <Link 
              href="/quote"
              className="block w-full text-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Get Free Quote
            </Link>
            <p className="text-xs text-gray-600 text-center mt-4">
              Certified Woman-Owned Business Enterprise
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} LINK Translations & Typesetting, Inc.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
