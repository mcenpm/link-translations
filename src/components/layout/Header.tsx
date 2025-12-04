'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Phone, Menu, X, ArrowRight, User, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export function Header() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  // Hide header on admin and login pages
  const hideHeader = pathname?.startsWith('/admin') || pathname === '/login'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (hideHeader) return null

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100' 
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="LINK Translations" 
              width={180} 
              height={50} 
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { href: '/services', label: 'Services' },
              { href: '/languages', label: 'Languages' },
              { href: '/translators', label: 'Translators' },
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' },
            ].map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-full transition-all duration-200 hover:bg-blue-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a 
              href="tel:1-877-272-5465" 
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>1-877-272-LINK</span>
            </a>
            
            {status === 'loading' ? (
              <div className="w-24 h-10 bg-gray-100 rounded-full animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                >
                  Sign In
                </Link>
                <Link 
                  href="/quote"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300"
                >
                  Get Quote
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
        isMenuOpen ? 'max-h-screen' : 'max-h-0'
      }`}>
        <div className="bg-white border-t border-gray-100 shadow-xl">
          <div className="container mx-auto px-6 py-6 space-y-6">
            <nav className="flex flex-col gap-1">
              {[
                { href: '/services', label: 'Services' },
                { href: '/languages', label: 'Languages' },
                { href: '/translators', label: 'Find Translators' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
              <a 
                href="tel:1-877-272-5465" 
                className="flex items-center justify-center gap-2 px-5 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>1-877-272-LINK</span>
              </a>
              
              {session ? (
                <>
                  <Link 
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 px-5 py-3 text-base font-medium text-gray-700 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-3 text-base font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="flex items-center justify-center gap-2 px-5 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Sign In
                  </Link>
                  <Link 
                    href="/quote"
                    className="flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Free Quote
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
