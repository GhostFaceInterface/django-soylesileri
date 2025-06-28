'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { 
  MagnifyingGlassIcon,
  ChevronRightIcon,
  StarIcon,
  UsersIcon,
  CheckCircleIcon,
  EyeIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { Header } from '@/components/layout/header'
import { listingsService } from '@/lib/services/listings'
import { carsService } from '@/lib/services/cars'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import { Listing, CarBrand } from '@/types'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Fetch recent listings
  const { data: listingsData } = useQuery({
    queryKey: ['listings', { page: 1 }],
    queryFn: () => listingsService.getListings({}, 1),
  })

  // Fetch popular brands
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => carsService.getBrands(),
  })

  const recentListings = listingsData?.results?.slice(0, 8) || []
  const popularBrands = brands?.slice(0, 8) || []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/listings?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const stats = [
    {
      icon: UsersIcon,
      value: '50,000+',
      label: 'Aktif Kullanıcı',
      description: 'Güvenilir alıcı ve satıcılar',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: EyeIcon,
      value: '100,000+',
      label: 'Aylık İlan Görüntüleme',
      description: 'Yüksek erişim oranı',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: CheckCircleIcon,
      value: '15,000+',
      label: 'Başarılı Satış',
      description: 'Güvenli işlemler',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: StarIcon,
      value: '4.8/5',
      label: 'Kullanıcı Memnuniyeti',
      description: 'Yüksek değerlendirme',
      color: 'from-yellow-500 to-orange-500'
    },
  ]

  const features = [
    {
      title: 'Güvenli Alışveriş',
      description: 'Doğrulanmış kullanıcılar ve güvenli ödeme sistemi ile huzurlu alışveriş deneyimi.',
      icon: ShieldCheckIcon,
      color: 'from-green-500 to-emerald-500',
      delay: '200ms'
    },
    {
      title: 'Premium Deneyim',
      description: 'AI destekli öneriler ve gelişmiş filtreleme ile kişiselleştirilmiş araç arama.',
      icon: SparklesIcon,
      color: 'from-purple-500 to-pink-500',
      delay: '400ms'
    },
    {
      title: 'Hızlı İletişim',
      description: 'Entegre mesajlaşma sistemi ve anında bildirimler ile satıcılarla doğrudan iletişim.',
      icon: RocketLaunchIcon,
      color: 'from-blue-500 to-cyan-500',
      delay: '600ms'
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-mesh opacity-40 animate-gradient-shift"></div>
      
      {/* Floating Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full opacity-20 blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-15 blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full opacity-10 blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-15 blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="relative inline-block mb-6">
              <h1 className="text-5xl lg:text-7xl font-bold text-white font-display leading-tight">
                Hayalinizdeki
                <span className="relative block">
                  <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent animate-gradient-shift">
                    Lüks Aracı
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent"></div>
                </span>
                <span className="block text-white/90">Bulmanın En Kolay Yolu</span>
              </h1>
              
              {/* Floating particles around title */}
              <div className="absolute -top-4 -left-4 w-2 h-2 bg-primary-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
              <div className="absolute -top-2 right-8 w-1 h-1 bg-accent-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-4 -right-4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <p className={`text-xl lg:text-2xl text-white/70 mb-12 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`} style={{ transitionDelay: '200ms' }}>
              Türkiye'nin en <span className="text-primary-300 font-semibold">premium</span> otomobil pazarında 
              <span className="text-accent-300 font-semibold"> binlerce</span> araç ilanı arasından 
              size en uygun lüks aracı bulun.
            </p>

            {/* Premium Search Box */}
            <div className={`max-w-3xl mx-auto mb-12 transition-all duration-1000 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`} style={{ transitionDelay: '400ms' }}>
              <form onSubmit={handleSearch} className="relative group">
                <div className="glass rounded-2xl p-2 backdrop-blur-xl">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-white/60" />
                    <input
                      type="text"
                      placeholder="Marka, model veya şehir ara... (ör: BMW, Mercedes, İstanbul)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-16 pr-40 py-6 text-lg bg-transparent text-white placeholder-white/60 focus:outline-none rounded-xl"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-3 rounded-xl hover:from-primary-600 hover:to-accent-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <span className="flex items-center space-x-2">
                        <span>Ara</span>
                        <ChevronRightIcon className="h-5 w-5" />
                      </span>
                    </button>
                  </div>
                </div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </form>
            </div>

            {/* Quick Brand Links */}
            <div className={`flex flex-wrap justify-center gap-4 transition-all duration-1000 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`} style={{ transitionDelay: '600ms' }}>
              {['BMW', 'Mercedes', 'Audi', 'Porsche'].map((brand, index) => (
                <Link 
                  key={brand}
                  href={`/listings?brand=${brand.toLowerCase()}`} 
                  className="glass px-6 py-3 rounded-xl text-white/80 hover:text-white transition-all duration-300 hover:scale-105 hover:bg-white/10 backdrop-blur-sm"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`card-glass text-center group hover:scale-105 transition-all duration-500 ${
                  isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${800 + index * 200}ms` }}
              >
                <div className="relative">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${stat.color} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-slate-900/90 rounded-full flex items-center justify-center">
                      <stat.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-white/90 mb-1">{stat.label}</div>
                  <div className="text-sm text-white/60">{stat.description}</div>
                  
                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500 -z-10 blur-xl`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center mb-12 transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`} style={{ transitionDelay: '1400ms' }}>
            <h2 className="text-4xl font-bold text-white font-display">
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Premium
              </span>
              <span className="text-primary-400 ml-2">İlanlar</span>
            </h2>
            <Link 
              href="/listings"
              className="glass px-6 py-3 rounded-xl text-white/80 hover:text-white transition-all duration-300 hover:scale-105 hover:bg-white/10 backdrop-blur-sm flex items-center space-x-2"
            >
              <span>Tümünü Gör</span>
              <ChevronRightIcon className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {recentListings.map((listing, index) => (
              <div
                key={listing.id}
                className={`transition-all duration-1000 ${
                  isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${1600 + index * 100}ms` }}
              >
                <PremiumListingCard listing={listing} />
              </div>
            ))}
          </div>

          {recentListings.length === 0 && (
            <div className="text-center py-12">
              <div className="card-glass inline-block px-8 py-6">
                <p className="text-white/60 text-lg">Premium ilanlar yükleniyor...</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`} style={{ transitionDelay: '2000ms' }}>
            <h2 className="text-4xl lg:text-5xl font-bold text-white font-display mb-6">
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Premium
              </span>
              <span className="text-white ml-2">Özellikler</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Gelişmiş teknoloji ve premium hizmet anlayışıyla araç alım-satımında yeni standartlar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`card-glass group hover:scale-105 transition-all duration-500 ${
                  isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: feature.delay }}
              >
                <div className="relative">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${feature.color} p-0.5 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-slate-900/90 rounded-full flex items-center justify-center">
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                  
                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500 -z-10 blur-xl`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`card-glass transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`} style={{ transitionDelay: '2400ms' }}>
            <div className="relative">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-display">
                <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  Premium
                </span>
                <span className="text-white ml-2">İlan Verin</span>
              </h2>
              <p className="text-xl text-white/70 mb-10 leading-relaxed">
                Aracınızı satmaya hazır mısınız? Premium platformumuzda ücretsiz ilan verin ve 
                binlerce potansiyel alıcıya ulaşın.
              </p>
              
              <Link
                href="/listings/new"
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-10 py-4 rounded-xl hover:from-primary-600 hover:to-accent-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105"
              >
                <SparklesIcon className="h-6 w-6" />
                <span>Premium İlan Ver</span>
                <ChevronRightIcon className="h-5 w-5" />
              </Link>
              
              {/* Background particles */}
              <div className="absolute top-4 left-4 w-2 h-2 bg-primary-400 rounded-full animate-ping opacity-40"></div>
              <div className="absolute bottom-8 right-8 w-1 h-1 bg-accent-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Premium Listing Card Component
function PremiumListingCard({ listing }: { listing: Listing }) {
  const primaryImage = listing.primary_image || listing.images[0]
  
  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="card-glass overflow-hidden hover:scale-105 transition-all duration-500">
        <div className="relative aspect-[16/9] overflow-hidden">
          {primaryImage ? (
            <div className="relative w-full h-full">
              <img
                src={primaryImage.medium_url || primaryImage.thumbnail_url}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Premium badge */}
              <div className="absolute top-3 left-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Premium
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="text-center">
                <EyeIcon className="h-12 w-12 text-white/40 mx-auto mb-2" />
                <span className="text-white/60 text-sm">Resim Yükleniyor</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="font-bold text-white mb-3 line-clamp-1 text-lg group-hover:text-primary-300 transition-colors duration-300">
            {listing.title}
          </h3>
          
          <div className="text-white/60 mb-4 flex items-center space-x-2">
            <span className="bg-white/10 px-2 py-1 rounded text-sm">
              {listing.car.brand.name}
            </span>
            <span className="bg-white/10 px-2 py-1 rounded text-sm">
              {listing.car.model.name}
            </span>
            <span className="bg-white/10 px-2 py-1 rounded text-sm">
              {listing.car.year}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              {formatPrice(listing.price)}
            </span>
            <span className="text-sm text-white/50">
              {formatRelativeTime(listing.created_at)}
            </span>
          </div>
        </div>
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500 -z-10 blur-xl"></div>
      </div>
    </Link>
  )
}
