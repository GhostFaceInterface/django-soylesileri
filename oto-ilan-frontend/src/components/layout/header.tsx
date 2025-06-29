'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/lib/stores/auth'
import { cn } from '@/lib/utils'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, isAuthenticated, logout, loadUser } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    loadUser()
  }, [loadUser])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const navigation = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'İlanlar', href: '/listings' },
    { name: 'Markalar', href: '/brands' },
    { name: 'İletişim', href: '/contact' },
  ]

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled 
        ? "bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50" 
        : "bg-slate-900/90 backdrop-blur-md"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Clean Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                </svg>
              </div>
              <span className="text-lg font-semibold text-white">Oto İlan</span>
            </Link>
          </div>

          {/* Clean Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Araç ara... (BMW, Mercedes, İstanbul)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-20 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-primary-400 focus:border-primary-400 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  Ara
                </button>
              </div>
            </form>
          </div>

          {/* Clean Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Clean User Actions */}
          <div className="flex items-center space-x-3 ml-6">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-white/70 hover:text-white transition-colors">
                  <BellIcon className="h-5 w-5" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></div>
                </button>

                {/* Messages */}
                <Link
                  href="/messages"
                  className="relative p-2 text-white/70 hover:text-white transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"></div>
                </Link>

                {/* Favorites */}
                <Link
                  href="/favorites"
                  className="p-2 text-white/70 hover:text-white transition-colors"
                >
                  <HeartIcon className="h-5 w-5" />
                </Link>

                {/* Add Listing */}
                <Link
                  href="/listings/new"
                  className="hidden sm:flex items-center space-x-1 bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>İlan Ver</span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
                    <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {user?.username}
                    </span>
                  </button>
                  
                  {/* Clean Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-white text-sm font-medium">{user?.username}</p>
                        <p className="text-white/60 text-xs">Kullanıcı</p>
                      </div>
                      
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Dashboard
                      </Link>
                      
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Profil
                      </Link>
                      
                      <Link
                        href="/my-listings"
                        className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        İlanlarım
                      </Link>
                      
                      <hr className="my-1 border-white/10" />
                      
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-white/80 hover:text-red-400 hover:bg-white/5 transition-colors"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Kayıt Ol
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Clean Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 mt-3">
            <div className="py-3 space-y-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                  <input
                    type="text"
                    placeholder="Araç ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-primary-400"
                  />
                </div>
              </form>

              {/* Mobile Navigation */}
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded-md text-sm font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Mobile Actions */}
              {isAuthenticated ? (
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <Link
                    href="/listings/new"
                    className="flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium w-full transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>İlan Ver</span>
                  </Link>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/messages"
                      className="flex items-center justify-center px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md text-sm transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Mesajlar
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center justify-center px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md text-sm transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Favoriler
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <Link
                    href="/auth/login"
                    className="block text-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block text-center bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 