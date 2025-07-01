'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { carsService } from '@/lib/services/cars'
import Link from 'next/link'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface CarBrand {
  id: number
  name: string
  models_count?: number
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<CarBrand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<CarBrand[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBrands()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = brands.filter(brand => 
        brand.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredBrands(filtered)
    } else {
      setFilteredBrands(brands)
    }
  }, [searchQuery, brands])

  const loadBrands = async () => {
    try {
      setIsLoading(true)
      const data = await carsService.getBrands()
      setBrands(data)
      setFilteredBrands(data)
    } catch (error) {
      console.error('Brands loading error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Markaları alfabetik olarak grupla
  const groupedBrands = filteredBrands.reduce((acc, brand) => {
    const firstLetter = brand.name[0].toUpperCase()
    if (!acc[firstLetter]) {
      acc[firstLetter] = []
    }
    acc[firstLetter].push(brand)
    return acc
  }, {} as Record<string, CarBrand[]>)

  const letters = Object.keys(groupedBrands).sort()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Tüm Markalar
            </h1>
            <p className="text-xl text-gray-400/70 max-w-3xl mx-auto">
              Araç modellerini keşfetmek için markayı seçin
            </p>
          </div>

          {/* Search */}
          <div className="mb-12 max-w-md mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Marka ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-300"></div>
            </div>
          ) : (
            <div className="space-y-12">
              {letters.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-400/70 text-lg">Aradığınız marka bulunamadı</p>
                </div>
              ) : (
                letters.map(letter => (
                  <div key={letter} className="space-y-6">
                    <h2 className="text-2xl font-bold text-white border-b border-gray-700/40 pb-2">
                      {letter}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {groupedBrands[letter].map(brand => (
                        <Link
                          key={brand.id}
                          href={`/listings?brand=${brand.id}`}
                          className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-xl p-6 text-center hover:bg-gray-800/60 transition-all duration-300 group"
                        >
                          <div className="mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
                              <span className="text-white font-bold text-lg">
                                {brand.name[0]}
                              </span>
                            </div>
                          </div>
                          <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                            {brand.name}
                          </h3>
                          {brand.models_count && (
                            <p className="text-sm text-gray-400/70 mt-1">
                              {brand.models_count} model
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Popular Brands */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Popüler Markalar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota', 'Honda', 'Ford', 'Renault'].map(brand => (
                <Link
                  key={brand}
                  href={`/listings?search=${brand}`}
                  className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-xl p-6 text-center hover:bg-gray-800/60 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">
                      {brand[0]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {brand}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 