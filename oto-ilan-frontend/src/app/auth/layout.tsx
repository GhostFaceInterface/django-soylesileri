'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">


      {/* Header */}
      <header className={`absolute top-0 left-0 right-0 z-20 p-6 transition-all duration-1000 ${
        isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}>
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
              </svg>
            </div>
            <div className="text-white">
              <h1 className="text-xl font-semibold group-hover:text-primary-300 transition-colors duration-300">
                Oto İlan
              </h1>
              <p className="text-xs text-white/60">Premium Platform</p>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-2">
            {[
              { name: 'Ana Sayfa', href: '/' },
              { name: 'İlanlar', href: '/listings' },
              { name: 'Hakkımızda', href: '/about' },
              { name: 'İletişim', href: '/contact' }
            ].map((item, index) => (
              <Link 
                key={item.name}
                href={item.href} 
                className={`px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg backdrop-blur-sm transition-all duration-300 font-medium text-sm
                           ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-screen items-center justify-center px-4 py-24 relative z-10">
        <div className={`w-full max-w-md transition-all duration-1000 ${
          isLoaded ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
        }`} style={{ transitionDelay: '300ms' }}>
          
          {/* Dark Auth Card with Better Visibility */}
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700/40 relative overflow-hidden">
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-gray-900/30 rounded-2xl"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            
            {/* Content with High Contrast */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
          
          {/* Footer Info */}
          <div className={`mt-8 text-center transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`} style={{ transitionDelay: '600ms' }}>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-6 mb-6">
              <div className="flex items-center space-x-2 text-white/80">
                <div className="flex -space-x-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full border-2 border-white/30"></div>
                  ))}
                </div>
                <span className="text-sm font-medium">50.000+ Kullanıcı</span>
              </div>
              <div className="text-white/40">•</div>
              <div className="text-white/80 text-sm font-medium">
                ⭐ 4.8/5 Değerlendirme
              </div>
            </div>
            
            {/* Security Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-7-4z" clipRule="evenodd"/>
                <path fillRule="evenodd" d="M9 12l2 2 4-4" clipRule="evenodd" stroke="white" strokeWidth="2" fill="none"/>
              </svg>
              <span className="text-white/80 text-sm font-medium">SSL Güvenli</span>
            </div>
            
            {/* Footer */}
            <p className="text-white/60 text-sm mt-6">
              © 2024 Oto İlan • Güvenli • Hızlı • Güvenilir
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 