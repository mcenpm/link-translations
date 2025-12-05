'use client'

import Link from 'next/link'
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

  // All pages now have light headers
  const isHomepage = false // Hero is now light themed

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (hideHeader) return null

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5' 
        : isHomepage 
          ? 'bg-transparent' 
          : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - Text Based */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-all group-hover:scale-110 ${
              isScrolled || !isHomepage ? 'bg-black text-white' : 'bg-white text-black'
            }`}>
              L
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${
              isScrolled || !isHomepage ? 'text-gray-900' : 'text-white'
            }`}>
              LINK
            </span>
          </Link>

          {/* Desktop Navigation - Minimal */}
          <nav className="hidden lg:flex items-center">
            <div className={`flex items-center gap-1 px-2 py-2 rounded-full backdrop-blur-sm ${
              isScrolled || !isHomepage ? 'bg-gray-100' : 'bg-white/10'
            }`}>
              {[
                { href: '/services', label: 'Services' },
                { href: '/languages', label: 'Languages' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    isScrolled || !isHomepage
                      ? 'text-gray-600 hover:text-black hover:bg-white' 
                      : 'text-white/80 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-5">
            <a 
              href="tel:1-877-272-5465" 
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isScrolled || !isHomepage ? 'text-gray-600 hover:text-black' : 'text-white/80 hover:text-white'
              }`}
            >
              <Phone className="h-4 w-4" />
              <span className="hidden xl:inline">1-877-272-LINK</span>
            </a>
            
            {status === 'loading' ? (
              <div className="w-24 h-10 bg-gray-100 rounded-full animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-2">
                <Link 
                  href="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full transition-all ${
                    isScrolled || !isHomepage
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href="/login"
                  className={`px-4 py-2.5 text-sm font-medium rounded-full transition-all ${
                    isScrolled || !isHomepage
                      ? 'text-gray-600 hover:text-black'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Sign In
                </Link>
                <Link 
                  href="/quote"
                  className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-full bg-white text-black hover:scale-105 transition-all duration-300 shadow-lg shadow-black/10"
                >
                  Get Quote
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`lg:hidden p-3 rounded-xl transition-colors ${
              isScrolled || !isHomepage
                ? 'text-gray-900 hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Full Screen Takeover */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-500 ${
        isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="absolute inset-0 bg-black" onClick={() => setIsMenuOpen(false)} />
        <div className={`absolute inset-x-0 top-0 bg-black transition-transform duration-500 ${
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}>
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-6 h-20">
            <Link href="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
              <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black text-lg">
                L
              </div>
              <span className="text-xl font-bold text-white tracking-tight">LINK</span>
            </Link>
            <button 
              className="p-3 rounded-xl text-white hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Mobile Nav */}
          <div className="px-6 py-8 space-y-1">
            {[
              { href: '/services', label: 'Services' },
              { href: '/languages', label: 'Languages' },
              { href: '/translators', label: 'Translators' },
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' },
            ].map((link, i) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="block py-4 text-3xl font-bold text-white hover:text-cyan-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* Mobile CTA */}
          <div className="px-6 py-8 border-t border-white/10 space-y-4">
            <a 
              href="tel:1-877-272-5465" 
              className="flex items-center gap-3 text-xl text-white/60 hover:text-white"
            >
              <Phone className="h-5 w-5" />
              1-877-272-LINK
            </a>
            <Link 
              href="/quote"
              className="flex items-center justify-center gap-3 w-full py-4 text-lg font-bold text-black bg-white rounded-full hover:bg-cyan-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Free Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
