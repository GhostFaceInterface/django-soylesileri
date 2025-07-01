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
import { Listing, CarBrand, CarModel, CarVariant, CarTrim } from '@/types'

interface SearchRow {
  id: string
  brand: number | null
  model: number | null
  variant: number | null
  trim: number | null
}

interface AdvancedSearchData {
  searchRows: SearchRow[]
  minPrice: string
  maxPrice: string
  minYear: string
  maxYear: string
  minMileage: string
  maxMileage: string
  fuelType: string
}

export default function HomePage() {
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

  // Premium listings - Backend'den is_premium kullan
  const premiumListings = recentListings.filter(listing => listing.is_premium)

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black relative overflow-hidden">
      {/* Simplified Background - Performance Optimized */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Single subtle gradient instead of animated circles */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-purple-950/10"></div>
        
        {/* Static grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(79,70,229,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>

      <Header />
      
      {/* Hero Section with Advanced Search */}
      <section className="relative overflow-hidden pt-24 pb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 backdrop-blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
              Otomobil Ara
              </h1>
            <p className="text-xl text-blue-100/80 max-w-2xl mx-auto">
              Türkiye'nin en kapsamlı otomobil pazarında aradığınız aracı kolayca bulun
            </p>
          </div>

          {/* Advanced Search Form */}
          <AdvancedSearchForm />

        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: '50,000+', description: 'Aktif Kullanıcı', icon: '👤', color: 'from-indigo-600 to-purple-600' },
              { title: '100,000+', description: 'Aylık İlan Görüntüleme', icon: '👁️', color: 'from-purple-600 to-indigo-600' },
              { title: '15,000+', description: 'Başarılı Satış', icon: '✅', color: 'from-gray-600 to-indigo-600' },
              { title: '4.8/5', description: 'Kullanıcı Memnuniyeti', icon: '⭐', color: 'from-indigo-500 to-purple-500' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.title}</div>
                <div className="text-gray-400/70">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Son Eklenen İlanlar</h2>
            <Link 
              href="/listings"
              className="text-cyan-300 hover:text-white transition-colors font-medium"
            >
              Tümünü Gör →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentListings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`} className="group">
                <div className="bg-gray-900/60 rounded-2xl overflow-hidden hover:bg-gray-800/70 transition-colors duration-200 hover:shadow-xl border border-gray-700/40 h-80">
                  <div className="relative h-48 overflow-hidden">
                    {listing.primary_image ? (
                      <img
                        src={listing.primary_image.thumbnail_url}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800/40 to-gray-900/60 flex items-center justify-center">
                        <svg className="h-12 w-12 text-gray-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 h-32 flex flex-col justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors duration-200 text-sm line-clamp-1 leading-tight">
                        {listing.title}
                      </h3>
                      <div className="text-xs text-gray-400/70 mb-3 truncate">
                        {listing.car.brand.name} {listing.car.model.name} • {listing.car.year}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="text-base font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        {formatPrice(listing.price)}
                      </div>
                      <div className="text-xs text-gray-500/50">
                        {formatRelativeTime(listing.created_at)}
                      </div>
                    </div>
                  </div>
              </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Listings */}
      <section className="py-16 bg-gray-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Premium İlanlar</h2>
            <Link 
              href="/listings?min_price=15000000" 
              className="text-indigo-300 hover:text-white transition-colors font-medium"
            >
              Tümünü Gör →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {premiumListings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`} className="group">
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl overflow-hidden hover:from-amber-500/15 hover:to-orange-500/15 transition-colors duration-200 hover:shadow-xl border border-amber-500/30 h-80">
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                        PREMIUM
                      </span>
              </div>
                    {listing.primary_image ? (
                      <img
                        src={listing.primary_image.thumbnail_url}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                        <svg className="h-12 w-12 text-amber-300/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
            </div>
          )}
                  </div>
                  
                  <div className="p-4 h-32 flex flex-col justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-2 group-hover:text-amber-300 transition-colors duration-200 text-sm line-clamp-1 leading-tight">
                        {listing.title}
                      </h3>
                      <div className="text-xs text-amber-200/70 mb-3 truncate">
                        {listing.car.brand.name} {listing.car.model.name} • {listing.car.year}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="text-base font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        {formatPrice(listing.price)}
                      </div>
                      <div className="text-xs text-amber-300/50">
                        {formatRelativeTime(listing.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Moved Down */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`} style={{ transitionDelay: '2800ms' }}>
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
                style={{ transitionDelay: `${3000 + index * 200}ms` }}
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
          }`} style={{ transitionDelay: '3600ms' }}>
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
function PremiumListingCard({ listing, isPremium = false }: { listing: Listing; isPremium?: boolean }) {
  const primaryImage = listing.primary_image || listing.images[0]
  
  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border border-white/20">
        
        {/* Image Container - Fixed Aspect Ratio */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
          {primaryImage ? (
            <>
              <img
                src={primaryImage.thumbnail_url || primaryImage.original_url}
                alt={listing.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Subtle overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Premium badge - top right */}
              <div className={`absolute top-3 right-3 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg ${
                isPremium 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}>
                {isPremium ? 'PREMIUM' : 'YENİ'}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
              <div className="text-center">
                <EyeIcon className="h-8 w-8 text-white/40 mx-auto mb-2" />
                <span className="text-white/60 text-xs">Resim Yükleniyor</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Content Container - Fixed Height */}
        <div className="p-4 h-32 flex flex-col justify-between">
          
          {/* Title - Single line with ellipsis */}
          <div>
            <h3 className={`font-bold text-base leading-tight mb-2 truncate group-hover:transition-colors duration-300 ${
              isPremium ? 'text-white group-hover:text-yellow-300' : 'text-white group-hover:text-blue-300'
            }`}>
            {listing.title}
          </h3>
          
            {/* Car Info - Compact badges */}
            <div className="flex items-center gap-1 mb-2 flex-wrap">
              <span className="bg-white/20 text-white/90 px-2 py-0.5 rounded text-xs font-medium truncate max-w-[60px]">
              {listing.car.brand.name}
            </span>
              <span className="bg-white/20 text-white/90 px-2 py-0.5 rounded text-xs font-medium truncate max-w-[60px]">
              {listing.car.model.name}
            </span>
              <span className="bg-white/20 text-white/90 px-2 py-0.5 rounded text-xs font-medium">
              {listing.car.year}
            </span>
            </div>
          </div>
          
          {/* Price - Bottom aligned */}
          <div className="flex justify-between items-end">
            <span className={`text-xl font-bold bg-clip-text text-transparent ${
              isPremium 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                : 'bg-gradient-to-r from-blue-400 to-blue-500'
            }`}>
              {formatPrice(listing.price)}
            </span>
            
            {/* View indicator */}
            <div className="flex items-center text-white/50 text-xs">
              <EyeIcon className="h-3 w-3 mr-1" />
              <span>Görüntüle</span>
            </div>
          </div>
        </div>
        
        {/* Hover glow effect */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500 pointer-events-none ${
          isPremium
            ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10'
            : 'bg-gradient-to-r from-blue-500/10 to-blue-600/10'
        }`}></div>
      </div>
    </Link>
  )
}

// Advanced Search Form Component
function AdvancedSearchForm() {
  const [searchData, setSearchData] = useState<AdvancedSearchData>({
    searchRows: [{ id: '1', brand: null, model: null, variant: null, trim: null }],
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    minMileage: '',
    maxMileage: '',
    fuelType: '',
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const [brands, setBrands] = useState<CarBrand[]>([])
  const [modelsPerRow, setModelsPerRow] = useState<{[key: string]: CarModel[]}>({})
  const [variantsPerRow, setVariantsPerRow] = useState<{[key: string]: CarVariant[]}>({})
  const [trimsPerRow, setTrimsPerRow] = useState<{[key: string]: CarTrim[]}>({})

  useEffect(() => {
    // Load brands on component mount
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      const response = await carsService.getBrands()
      setBrands(response || [])
    } catch (error) {
      console.error('Error loading brands:', error)
    }
  }

  const handleBrandChangeForRow = async (rowId: string, brandId: string) => {
    if (brandId) {
      try {
        const response = await carsService.getModelsByBrand(parseInt(brandId))
        setModelsPerRow(prev => ({ ...prev, [rowId]: response || [] }))
        // Reset dependent dropdowns for this row
        setVariantsPerRow(prev => ({ ...prev, [rowId]: [] }))
        setTrimsPerRow(prev => ({ ...prev, [rowId]: [] }))
        updateSearchRow(rowId, 'brand', parseInt(brandId))
        updateSearchRow(rowId, 'model', null)
        updateSearchRow(rowId, 'variant', null)
        updateSearchRow(rowId, 'trim', null)
      } catch (error) {
        console.error('Error loading models:', error)
      }
    } else {
      setModelsPerRow(prev => ({ ...prev, [rowId]: [] }))
      setVariantsPerRow(prev => ({ ...prev, [rowId]: [] }))
      setTrimsPerRow(prev => ({ ...prev, [rowId]: [] }))
      updateSearchRow(rowId, 'brand', null)
      updateSearchRow(rowId, 'model', null)
      updateSearchRow(rowId, 'variant', null)
      updateSearchRow(rowId, 'trim', null)
    }
  }

  const handleModelChangeForRow = async (rowId: string, modelId: string) => {
    if (modelId) {
      try {
        const response = await carsService.getVariantsByModel(parseInt(modelId))
        setVariantsPerRow(prev => ({ ...prev, [rowId]: response || [] }))
        // Reset dependent dropdown
        setTrimsPerRow(prev => ({ ...prev, [rowId]: [] }))
        updateSearchRow(rowId, 'model', parseInt(modelId))
        updateSearchRow(rowId, 'variant', null)
        updateSearchRow(rowId, 'trim', null)
      } catch (error) {
        console.error('Error loading variants:', error)
      }
    } else {
      setVariantsPerRow(prev => ({ ...prev, [rowId]: [] }))
      setTrimsPerRow(prev => ({ ...prev, [rowId]: [] }))
      updateSearchRow(rowId, 'variant', null)
      updateSearchRow(rowId, 'trim', null)
    }
  }

  const handleVariantChangeForRow = async (rowId: string, variantId: string) => {
    if (variantId) {
      try {
        const response = await carsService.getTrimsByVariant(parseInt(variantId))
        setTrimsPerRow(prev => ({ ...prev, [rowId]: response || [] }))
        updateSearchRow(rowId, 'variant', parseInt(variantId))
        updateSearchRow(rowId, 'trim', null)
      } catch (error) {
        console.error('Error loading trims:', error)
      }
    } else {
      setTrimsPerRow(prev => ({ ...prev, [rowId]: [] }))
      updateSearchRow(rowId, 'trim', null)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build search params
    const params = new URLSearchParams()
    
    searchData.searchRows.forEach((row) => {
      if (row.brand) {
        params.append('brand', row.brand.toString())
      }
      if (row.model) {
        params.append('model', row.model.toString())
      }
      if (row.variant) {
        params.append('variant', row.variant.toString())
      }
      if (row.trim) {
        params.append('trim', row.trim.toString())
      }
    })
    if (searchData.minPrice) {
      params.append('min_price', searchData.minPrice)
    }
    if (searchData.maxPrice) {
      params.append('max_price', searchData.maxPrice)
    }
    if (searchData.minYear) {
      params.append('min_year', searchData.minYear)
    }
    if (searchData.maxYear) {
      params.append('max_year', searchData.maxYear)
    }
    if (searchData.minMileage) {
      params.append('min_mileage', searchData.minMileage)
    }
    if (searchData.maxMileage) {
      params.append('max_mileage', searchData.maxMileage)
    }
    if (searchData.fuelType) {
      params.append('fuel_type', searchData.fuelType)
    }

    // Navigate to listings with search params
    window.location.href = `/listings?${params.toString()}`
  }

  const addSearchRow = () => {
    const newId = Date.now().toString()
    setSearchData(prev => ({
      ...prev,
      searchRows: [...prev.searchRows, { id: newId, brand: null, model: null, variant: null, trim: null }]
    }))
  }

  const removeSearchRow = (id: string) => {
    if (searchData.searchRows.length > 1) {
      setSearchData(prev => ({
        ...prev,
        searchRows: prev.searchRows.filter(row => row.id !== id)
      }))
      // Cleanup states
      setModelsPerRow(prev => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
      setVariantsPerRow(prev => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
      setTrimsPerRow(prev => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
    }
  }

  const updateSearchRow = (id: string, field: keyof SearchRow, value: number | null) => {
    setSearchData(prev => ({
      ...prev,
      searchRows: prev.searchRows.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
    }))
  }

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSearch} className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
        
        {/* Multi-Row Search Section */}
        <div className="space-y-4 mb-6">
          {searchData.searchRows.map((row, index) => (
            <div key={row.id} className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-xl border border-gray-600/30">
              
              {/* Marka */}
              <div className="flex-1">
                <select
                  value={row.brand || ''}
                  className="w-full bg-gray-800/60 text-white placeholder-gray-300/60 border border-gray-600/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  onChange={(e) => {
                    const brandId = e.target.value
                    handleBrandChangeForRow(row.id, brandId)
                  }}
                >
                  <option value="" className="bg-gray-900 text-white">Marka</option>
                  {brands.map((brand: any) => (
                    <option key={brand.id} value={brand.id} className="bg-gray-900 text-white">
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div className="flex-1">
                <select
                  value={row.model || ''}
                  className="w-full bg-gray-800/60 text-white placeholder-gray-300/60 border border-gray-600/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={!modelsPerRow[row.id]?.length}
                  onChange={(e) => {
                    const modelId = e.target.value
                    handleModelChangeForRow(row.id, modelId)
                  }}
                >
                  <option value="" className="bg-gray-900 text-white">Model</option>
                  {modelsPerRow[row.id]?.map((model: any) => (
                    <option key={model.id} value={model.id} className="bg-gray-900 text-white">
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Donanım */}
              <div className="flex-1">
                <select
                  value={row.variant || ''}
                  className="w-full bg-gray-800/60 text-white placeholder-gray-300/60 border border-gray-600/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={!variantsPerRow[row.id]?.length}
                  onChange={(e) => {
                    const variantId = e.target.value
                    handleVariantChangeForRow(row.id, variantId)
                  }}
                >
                  <option value="" className="bg-gray-900 text-white">Donanım</option>
                  {variantsPerRow[row.id]?.map((variant: any) => (
                    <option key={variant.id} value={variant.id} className="bg-gray-900 text-white">
                      {variant.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trim */}
              <div className="flex-1">
                <select
                  value={row.trim || ''}
                  className="w-full bg-gray-800/60 text-white placeholder-gray-300/60 border border-gray-600/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={!trimsPerRow[row.id]?.length}
                  onChange={(e) => {
                    const trimId = e.target.value
                    updateSearchRow(row.id, 'trim', trimId ? parseInt(trimId) : null)
                  }}
                >
                  <option value="" className="bg-gray-900 text-white">Trim</option>
                  {trimsPerRow[row.id]?.map((trim: any) => (
                    <option key={trim.id} value={trim.id} className="bg-gray-900 text-white">
                      {trim.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remove Button */}
              {searchData.searchRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSearchRow(row.id)}
                  className="p-2 text-gray-400/60 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Bu arama satırını kaldır"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {/* Add Search Row Button */}
          <button
            type="button"
            onClick={addSearchRow}
            className="w-full p-3 border-2 border-dashed border-gray-600/40 rounded-xl text-gray-400/60 hover:text-white hover:border-gray-500/60 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Araç Kombinasyonu Ekle
          </button>
        </div>

        {/* Price, Year, Mileage Filters */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
          <div>
            <input
              type="number"
              placeholder="Min Fiyat"
              value={searchData.minPrice}
              onChange={(e) => setSearchData(prev => ({ ...prev, minPrice: e.target.value }))}
              className="w-full bg-gray-800/60 text-white placeholder-gray-300/60 border border-gray-600/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max Fiyat"
              value={searchData.maxPrice}
              onChange={(e) => setSearchData(prev => ({ ...prev, maxPrice: e.target.value }))}
              className="w-full bg-gray-800/60 text-white placeholder-gray-300/60 border border-gray-600/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Min Yıl"
              value={searchData.minYear}
              onChange={(e) => setSearchData(prev => ({ ...prev, minYear: e.target.value }))}
              className="w-full bg-gray-800/60 text-white placeholder-gray-300/60 border border-gray-600/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max Yıl"
              value={searchData.maxYear}
              onChange={(e) => setSearchData(prev => ({ ...prev, maxYear: e.target.value }))}
              className="w-full bg-gray-800/60 text-white placeholder-gray-300/60 border border-gray-600/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Min KM"
              value={searchData.minMileage}
              onChange={(e) => setSearchData(prev => ({ ...prev, minMileage: e.target.value }))}
              className="w-full bg-gray-800/60 text-white placeholder-gray-300/60 border border-gray-600/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max KM"
              value={searchData.maxMileage}
              onChange={(e) => setSearchData(prev => ({ ...prev, maxMileage: e.target.value }))}
              className="w-full bg-gray-800/60 text-white placeholder-gray-300/60 border border-gray-600/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Fuel Type & Search Button */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-48">
            <select
              value={searchData.fuelType}
              onChange={(e) => setSearchData(prev => ({ ...prev, fuelType: e.target.value }))}
              className="w-full bg-gray-800/60 text-white placeholder-gray-300/60 border border-gray-600/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" className="bg-gray-900 text-white">Yakıt Tipi</option>
              <option value="petrol" className="bg-gray-900 text-white">Benzin</option>
              <option value="diesel" className="bg-gray-900 text-white">Dizel</option>
              <option value="electric" className="bg-gray-900 text-white">Elektrik</option>
              <option value="hybrid" className="bg-gray-900 text-white">Hibrit</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Ara
            </button>
            
            <button
              type="button"
              onClick={() => {
                setSearchData({
                  searchRows: [{ id: '1', brand: null, model: null, variant: null, trim: null }],
                  minPrice: '',
                  maxPrice: '',
                  minYear: '',
                  maxYear: '',
                  minMileage: '',
                  maxMileage: '',
                  fuelType: '',
                })
                setModelsPerRow({})
                setVariantsPerRow({})
                setTrimsPerRow({})
              }}
              className="text-gray-400/60 hover:text-white transition-colors text-sm px-4"
            >
              Temizle
            </button>
          </div>
        </div>
      </form>

      {/* Quick Brand Links */}
      <div className="flex justify-center gap-4 mt-8 flex-wrap">
        {['BMW', 'Mercedes', 'Audi', 'Porsche'].map((brand) => (
          <button
            key={brand}
            onClick={() => {
              const brandObj = brands?.find(b => b.name === brand)
              if (brandObj) {
                handleBrandChangeForRow(searchData.searchRows[0].id, brandObj.id.toString())
              }
            }}
            className="px-6 py-2 bg-gray-800/40 text-gray-300/80 rounded-lg hover:bg-gray-700/40 hover:text-white transition-all duration-300 border border-gray-600/30 backdrop-blur-sm"
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  )
}
