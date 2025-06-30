'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { listingsService } from '@/lib/services/listings';
import { carsService } from '@/lib/services/cars';
import { formatPrice, getFuelTypeLabel, getTransmissionLabel } from '@/lib/utils';
import { CarBrand, CarModel, Listing } from '@/types';
import Link from 'next/link';
import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CalendarIcon,
  TruckIcon,
  EyeIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface Filters {
  search: string
  brand: number[]
  model: number[]
  variant: number[]
  trim: number[]
  minPrice: string
  maxPrice: string
  minYear: string
  maxYear: string
  minMileage: string
  maxMileage: string
  fuelType: string[]
  sortBy: string
}

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    brand: [],
    model: [],
    variant: [],
    trim: [],
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    minMileage: '',
    maxMileage: '',
    fuelType: [],
    sortBy: '-created_at'
  });

  useEffect(() => {
    // Load initial data
    loadBrands();
    
    // Parse URL parameters on component mount
    const params = new URLSearchParams(window.location.search);
    const newFilters: Filters = {
      search: params.get('search') || '',
      brand: params.get('brand')?.split(',').map(Number).filter(Boolean) || [],
      model: params.get('model')?.split(',').map(Number).filter(Boolean) || [],
      variant: params.get('variant')?.split(',').map(Number).filter(Boolean) || [],
      trim: params.get('trim')?.split(',').map(Number).filter(Boolean) || [],
      minPrice: params.get('min_price') || '',
      maxPrice: params.get('max_price') || '',
      minYear: params.get('min_year') || '',
      maxYear: params.get('max_year') || '',
      minMileage: params.get('min_mileage') || '',
      maxMileage: params.get('max_mileage') || '',
      fuelType: params.get('fuel_type')?.split(',').filter(Boolean) || [],
      sortBy: params.get('ordering') || '-created_at',
    };
    setFilters(newFilters);
    
    // Load listings
    loadListings(newFilters);
  }, []);

  const loadBrands = async () => {
    try {
      const response = await carsService.getBrands();
      setBrands(response || []);
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  };

  const loadListings = async (filterParams = filters) => {
    setLoading(true);
    try {
      const params: any = {};
      
      if (filterParams.search) params.title_search = filterParams.search;
      if (filterParams.brand.length > 0) {
        params.brand = filterParams.brand.join(',');
      }
      if (filterParams.model.length > 0) {
        params.model = filterParams.model.join(',');
      }
      if (filterParams.variant.length > 0) {
        params.variant = filterParams.variant.join(',');
      }
      if (filterParams.trim.length > 0) {
        params.trim = filterParams.trim.join(',');
      }
      if (filterParams.minPrice) params.min_price = filterParams.minPrice;
      if (filterParams.maxPrice) params.max_price = filterParams.maxPrice;
      if (filterParams.minYear) params.min_year = filterParams.minYear;
      if (filterParams.maxYear) params.max_year = filterParams.maxYear;
      if (filterParams.minMileage) params.min_mileage = filterParams.minMileage;
      if (filterParams.maxMileage) params.max_mileage = filterParams.maxMileage;
      if (filterParams.fuelType.length > 0) params.fuel_type = filterParams.fuelType.join(',');
      if (filterParams.sortBy) params.ordering = filterParams.sortBy;
      
      const response = await listingsService.getListings(params, currentPage);
      setListings(response.results || []);
      setTotalPages(Math.ceil((response.count || 0) / 12));
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    loadListings(filters);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    const clearedFilters: Filters = {
      search: '',
      brand: [],
      model: [],
      variant: [],
      trim: [],
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      minMileage: '',
      maxMileage: '',
      fuelType: [],
      sortBy: '-created_at'
    };
    setFilters(clearedFilters);
    loadListings(clearedFilters);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 relative overflow-hidden">
      {/* Simplified Background - Performance Optimized */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Single subtle gradient instead of 3 animated circles */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-cyan-600/5"></div>
        
        {/* Static grid pattern instead of animated */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
      
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">İlanlar</h1>
            <p className="text-blue-100/70">
              {loading ? 'Yükleniyor...' : `${listings.length} ilan bulundu`}
            </p>
          </div>
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            Filtreler
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block md:w-80 flex-shrink-0`}>
            <div className="bg-slate-800/50 rounded-2xl p-6 shadow-xl sticky top-24 border border-blue-500/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Filtreler</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="md:hidden text-blue-200/60 hover:text-white"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold text-blue-100/90 mb-2">
                    Arama
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300/40" />
                    <input
                      type="text"
                      placeholder="Marka, model ara..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/40 border border-blue-400/30 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-blue-100/90 mb-2">
                    Fiyat Aralığı
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700/40 border border-blue-400/30 rounded-lg text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700/40 border border-blue-400/30 rounded-lg text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Year Range */}
                <div>
                  <label className="block text-sm font-semibold text-blue-100/90 mb-2">
                    Yıl Aralığı
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minYear}
                      onChange={(e) => setFilters(prev => ({ ...prev, minYear: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700/40 border border-blue-400/30 rounded-lg text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxYear}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxYear: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700/40 border border-blue-400/30 rounded-lg text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Yakıt Tipi Filter */}
                <div className="mb-6">
                  <label className="block text-blue-100/90 font-semibold text-sm mb-3">
                    Yakıt Tipi
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'petrol', label: 'Benzin' },
                      { value: 'diesel', label: 'Dizel' },
                      { value: 'electric', label: 'Elektrik' },
                      { value: 'hybrid', label: 'Hibrit' }
                    ].map(fuel => (
                      <label key={fuel.value} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          className="mr-3 w-4 h-4 text-blue-600 bg-slate-700/40 border-blue-400/30 rounded focus:ring-blue-500 focus:ring-2"
                          checked={filters.fuelType.includes(fuel.value)}
                          onChange={(e) => {
                            setFilters(prev => ({
                              ...prev,
                              fuelType: e.target.checked
                                ? [...prev.fuelType, fuel.value]
                                : prev.fuelType.filter(f => f !== fuel.value)
                            }))
                          }}
                        />
                        <span className="text-blue-100/80 group-hover:text-white font-medium transition-colors">{fuel.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sıralama Filter */}
                <div className="mb-6">
                  <label className="block text-blue-100/90 font-semibold text-sm mb-3">
                    Sıralama
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-700/40 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 backdrop-blur-sm"
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  >
                    <option value="-created_at" className="bg-slate-800 text-white">En yeni yüklenen</option>
                    <option value="created_at" className="bg-slate-800 text-white">En eski yüklenen</option>
                    <option value="price" className="bg-slate-800 text-white">Fiyat (Düşükten Yükseğe)</option>
                    <option value="-price" className="bg-slate-800 text-white">Fiyat (Yüksekten Düşüğe)</option>
                    <option value="car__year" className="bg-slate-800 text-white">Yıl (Eskiden Yeniye)</option>
                    <option value="-car__year" className="bg-slate-800 text-white">Yıl (Yeniden Eskiye)</option>
                    <option value="car__mileage" className="bg-slate-800 text-white">Kilometre (Az - Çok)</option>
                    <option value="-car__mileage" className="bg-slate-800 text-white">Kilometre (Çok - Az)</option>
                  </select>
                </div>

                {/* Donanım Filter */}
                <div className="mb-6">
                  <label className="block text-blue-100/90 font-semibold text-sm mb-3">
                    Donanım
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-700/40 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 backdrop-blur-sm"
                    onChange={(e) => {
                      const value = e.target.value
                      setFilters(prev => ({ 
                        ...prev, 
                        variant: value ? [parseInt(value)] : [] 
                      }))
                    }}
                  >
                    <option value="" className="bg-slate-800 text-white">Tüm Donanımlar</option>
                    {/* Variants will be loaded dynamically */}
                  </select>
                </div>

                {/* Trim Filter */}
                <div className="mb-6">
                  <label className="block text-blue-100/90 font-semibold text-sm mb-3">
                    Trim
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-700/40 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 backdrop-blur-sm"
                    onChange={(e) => {
                      const value = e.target.value
                      setFilters(prev => ({ 
                        ...prev, 
                        trim: value ? [parseInt(value)] : [] 
                      }))
                    }}
                  >
                    <option value="" className="bg-slate-800 text-white">Tüm Trimler</option>
                    {/* Trims will be loaded dynamically */}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-blue-400/20">
                  <button
                    onClick={applyFilters}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Filtrele
                  </button>
                  <button
                    onClick={clearAllFilters}
                    className="w-full bg-slate-700/40 text-white py-3 rounded-xl hover:bg-slate-600/40 transition-colors border border-blue-400/20"
                  >
                    Temizle
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-slate-800/40 rounded-2xl overflow-hidden border border-blue-500/20">
                    <div className="flex h-64">
                      <div className="w-80 flex-shrink-0">
                        <div className="w-full h-full bg-slate-700/40 animate-pulse"></div>
                      </div>
                      <div className="flex-1 p-6">
                        <div className="space-y-3">
                          <div className="h-6 bg-slate-700/40 rounded w-3/4 animate-pulse"></div>
                          <div className="h-4 bg-slate-700/40 rounded w-1/2 animate-pulse"></div>
                          <div className="h-4 bg-slate-700/40 rounded w-2/3 animate-pulse"></div>
                          <div className="flex gap-3 mt-4">
                            <div className="h-6 bg-slate-700/40 rounded w-16 animate-pulse"></div>
                            <div className="h-6 bg-slate-700/40 rounded w-12 animate-pulse"></div>
                            <div className="h-6 bg-slate-700/40 rounded w-14 animate-pulse"></div>
                          </div>
                          <div className="flex justify-between items-end pt-6">
                            <div className="h-8 bg-slate-700/40 rounded w-32 animate-pulse"></div>
                            <div className="h-6 bg-slate-700/40 rounded w-24 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="space-y-3">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-blue-500/20">
                  <TruckIcon className="h-16 w-16 text-blue-300/40 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">İlan bulunamadı</h3>
                  <p className="text-blue-100/70 mb-4">Arama kriterlerinizi değiştirerek tekrar deneyin.</p>
                  <button
                    onClick={clearAllFilters}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Vertical Listing Card Component - Performance Optimized
function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="bg-slate-800/40 rounded-2xl overflow-hidden hover:bg-slate-700/50 transition-colors duration-200 hover:shadow-xl border border-blue-500/20 hover:border-blue-400/40">
        
        <div className="flex h-64">
          {/* Image Section - Optimized */}
          <div className="w-80 flex-shrink-0">
            <div className="relative w-full h-full overflow-hidden bg-slate-700/20">
              {listing.primary_image ? (
                <img
                  src={listing.primary_image.thumbnail_url}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700/20 to-blue-600/20 flex items-center justify-center">
                  <TruckIcon className="h-16 w-16 text-blue-300/40" />
                </div>
              )}
            </div>
          </div>
          
          {/* Content Section - Simplified */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            {/* Header Section */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-200 line-clamp-2 leading-tight">
                {listing.title}
              </h3>
              
              {/* Car Details */}
              <div className="flex items-center gap-4 mb-4 text-sm text-blue-200/70">
                <div className="flex items-center gap-2">
                  <TruckIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">{listing.car.brand.name} {listing.car.model.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{listing.car.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{listing.city?.name || 'Belirtilmemiş'}</span>
                </div>
              </div>
              
              {/* Specifications - Simplified */}
              <div className="flex items-center gap-4 text-sm text-blue-200/50">
                <span className="bg-slate-700/40 px-2 py-1 rounded text-xs">
                  {new Intl.NumberFormat('tr-TR').format(listing.car.mileage)} km
                </span>
                <span className="bg-slate-700/40 px-2 py-1 rounded text-xs">
                  {getFuelTypeLabel(listing.car.fuel_type)}
                </span>
                <span className="bg-slate-700/40 px-2 py-1 rounded text-xs">
                  {getTransmissionLabel(listing.car.transmission)}
                </span>
              </div>
            </div>
            
            {/* Footer Section */}
            <div className="flex justify-between items-end pt-4 border-t border-blue-500/20">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {formatPrice(listing.price)}
              </div>
              
              <div className="flex items-center text-blue-300/60 text-sm group-hover:text-cyan-300 transition-colors bg-blue-500/10 px-3 py-2 rounded-lg">
                <EyeIcon className="h-4 w-4 mr-2" />
                <span className="font-medium">Detayları İncele</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 