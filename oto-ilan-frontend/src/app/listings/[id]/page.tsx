'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth';
import { getLocationDisplay } from '@/lib/utils/locationDisplay';
import {
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  CalendarIcon,
  TruckIcon,
  CogIcon,
  FireIcon,
  PaintBrushIcon,
  BoltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface ListingDetail {
  id: number;
  title: string;
  description: string;
  price: string;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  car: {
    id: number;
    brand: {
      name: string;
    };
    model: {
      name: string;
    };
    variant?: {
      name: string;
    };
    trim?: {
      name: string;
    };
    year: number;
    mileage: number;
    fuel_type: string;
    transmission: string;
    color: string;
    body_type: string;
    engine_power: number;
  };
  city?: {
    name: string;
  };
  province?: {
    id: number;
    name: string;
  };
  district?: {
    id: number;
    name: string;
  };
  neighborhood?: {
    id: number;
    name: string;
  };
  full_address?: string;
  images: Array<{
    id: number;
    thumbnail_url: string;
    original_url: string;
    is_primary: boolean;
    order: number;
  }>;
  created_at: string;
  updated_at: string;
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('specs');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/listings/${id}/`);
      if (response.ok) {
        const data = await response.json();
        setListing(data);
        
        // Primary image'ı ilk sırada göster
        if (data.images.length > 0) {
          const primaryIndex = data.images.findIndex((img: any) => img.is_primary);
          if (primaryIndex > 0) {
            setActiveImageIndex(primaryIndex);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('tr-TR').format(parseFloat(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getFuelTypeLabel = (fuelType: string) => {
    const labels = {
      'petrol': 'Benzin',
      'diesel': 'Dizel',
      'electric': 'Elektrik',
      'hybrid': 'Hibrit'
    };
    return labels[fuelType as keyof typeof labels] || fuelType;
  };

  const getTransmissionLabel = (transmission: string) => {
    const labels = {
      'manual': 'Manuel',
      'automatic': 'Otomatik'
    };
    return labels[transmission as keyof typeof labels] || transmission;
  };

  const nextImage = () => {
    if (listing && listing.images.length > 0) {
      setActiveImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing && listing.images.length > 0) {
      setActiveImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-gray-300 rounded-2xl h-96 mb-4"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-300 rounded-lg h-20"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-300 rounded-2xl h-32"></div>
                <div className="bg-gray-300 rounded-2xl h-64"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">İlan bulunamadı</h1>
          <p className="text-slate-600 mb-4">Aradığınız ilan mevcut değil veya kaldırılmış olabilir.</p>
          <Link
            href="/listings"
            className="inline-flex items-center px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2" />
            İlanlara Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-gray-200">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-6">
          <Link href="/" className="text-slate-600 hover:text-slate-800">Ana Sayfa</Link>
          <span className="text-slate-400">/</span>
          <Link href="/listings" className="text-slate-600 hover:text-slate-800">İlanlar</Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-medium">
            {listing.car.brand.name} {listing.car.model.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Taraf - Resim Galerisi */}
          <div className="lg:col-span-2">
            {/* Ana Resim */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl mb-4 group">
              {listing.images.length > 0 ? (
                <>
                  <div className="relative aspect-[16/9]">
                    <img
                      src={listing.images[activeImageIndex]?.original_url || '/placeholder-car.jpg'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation Arrows */}
                    {listing.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <ChevronLeftIcon className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <ChevronRightIcon className="h-6 w-6" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {activeImageIndex + 1} / {listing.images.length}
                    </div>

                    {/* Full Screen Button */}
                    <button
                      onClick={() => setIsGalleryOpen(true)}
                      className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <TruckIcon className="h-16 w-16 mx-auto mb-2" />
                    <p>Resim bulunmuyor</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Galerisi */}
            {listing.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {listing.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative aspect-[16/9] rounded-lg overflow-hidden transition-all duration-300 ${
                      index === activeImageIndex
                        ? 'ring-2 ring-blue-500 shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                  >
                    <img
                      src={image.thumbnail_url}
                      alt={`${listing.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Tabbed Content */}
            <div className="mt-8">
              <div className="border-b border-slate-300">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'specs'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Teknik Bilgiler
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'details'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Açıklama
                  </button>
                </nav>
              </div>

              <div className="py-6">
                {activeTab === 'specs' && (
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Teknik Bilgiler</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                          <div className="flex items-center">
                            <TruckIcon className="h-5 w-5 text-slate-500 mr-3" />
                            <span className="text-slate-600">Marka</span>
                          </div>
                          <span className="font-semibold text-slate-800">{listing.car.brand.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                          <div className="flex items-center">
                            <CogIcon className="h-5 w-5 text-slate-500 mr-3" />
                            <span className="text-slate-600">Model</span>
                          </div>
                          <span className="font-semibold text-slate-800">{listing.car.model.name}</span>
                        </div>

                        {listing.car.variant && (
                          <div className="flex items-center justify-between py-3 border-b border-slate-100">
                            <div className="flex items-center">
                              <BoltIcon className="h-5 w-5 text-slate-500 mr-3" />
                              <span className="text-slate-600">Varyant</span>
                            </div>
                            <span className="font-semibold text-slate-800">{listing.car.variant.name}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                          <div className="flex items-center">
                            <CalendarIcon className="h-5 w-5 text-slate-500 mr-3" />
                            <span className="text-slate-600">Yıl</span>
                          </div>
                          <span className="font-semibold text-slate-800">{listing.car.year}</span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                          <div className="flex items-center">
                            <TruckIcon className="h-5 w-5 text-slate-500 mr-3" />
                            <span className="text-slate-600">Kilometre</span>
                          </div>
                          <span className="font-semibold text-slate-800">
                            {new Intl.NumberFormat('tr-TR').format(listing.car.mileage)} km
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                          <div className="flex items-center">
                            <FireIcon className="h-5 w-5 text-slate-500 mr-3" />
                            <span className="text-slate-600">Yakıt Tipi</span>
                          </div>
                          <span className="font-semibold text-slate-800">{getFuelTypeLabel(listing.car.fuel_type)}</span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                          <div className="flex items-center">
                            <CogIcon className="h-5 w-5 text-slate-500 mr-3" />
                            <span className="text-slate-600">Vites</span>
                          </div>
                          <span className="font-semibold text-slate-800">{getTransmissionLabel(listing.car.transmission)}</span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                          <div className="flex items-center">
                            <PaintBrushIcon className="h-5 w-5 text-slate-500 mr-3" />
                            <span className="text-slate-600">Renk</span>
                          </div>
                          <span className="font-semibold text-slate-800">{listing.car.color}</span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                          <div className="flex items-center">
                            <TruckIcon className="h-5 w-5 text-slate-500 mr-3" />
                            <span className="text-slate-600">Kasa Tipi</span>
                          </div>
                          <span className="font-semibold text-slate-800">{listing.car.body_type}</span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                          <div className="flex items-center">
                            <BoltIcon className="h-5 w-5 text-slate-500 mr-3" />
                            <span className="text-slate-600">Motor Gücü</span>
                          </div>
                          <span className="font-semibold text-slate-800">{listing.car.engine_power} HP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Açıklama</h3>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {listing.description}
                      </p>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <div className="flex items-center text-sm text-slate-600">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>İlan Tarihi: {formatDate(listing.created_at)}</span>
                        {listing.updated_at !== listing.created_at && (
                          <>
                            <span className="mx-3">•</span>
                            <span>Güncelleme: {formatDate(listing.updated_at)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Fiyat & İletişim */}
          <div className="space-y-6">
            {/* Fiyat Kartı */}
            <div className="bg-gradient-to-br from-blue-50/90 to-blue-100/80 backdrop-blur-xl border border-blue-200/40 rounded-2xl p-6 shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatPrice(listing.price)}
                </div>
                <h1 className="text-xl font-bold text-slate-800 mb-2">{listing.title}</h1>
                <div className="flex items-center justify-center text-slate-600">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>{getLocationDisplay(listing)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center">
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Telefon: {listing.user.phone_number}
                </button>
                
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Mesaj Gönder
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
                      isFavorite 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="h-5 w-5 mr-2" />
                    ) : (
                      <HeartIcon className="h-5 w-5 mr-2" />
                    )}
                    Favori
                  </button>
                  
                  <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center">
                    <ShareIcon className="h-5 w-5 mr-2" />
                    Paylaş
                  </button>
                </div>
              </div>
            </div>

            {/* Satıcı Bilgisi */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-300/40 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Satıcı Bilgileri</h3>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white font-bold">
                    {listing.user.first_name.charAt(0)}{listing.user.last_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      {listing.user.first_name} {listing.user.last_name}
                    </h4>
                    <p className="text-slate-600 text-sm">@{listing.user.username}</p>
                  </div>
                </div>
                
                {/* Edit Button - sadece ilan sahibi görebilir */}
                {user && user.id === listing.user.id && (
                  <Link 
                    href={`/listings/${listing.id}/edit`}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 text-indigo-600 rounded-lg hover:bg-indigo-600/30 transition-all duration-300 text-sm"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Düzenle
                  </Link>
                )}
              </div>

              <Link 
                href={`/profile/${listing.user.id}`}
                className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-xl transition-all duration-300"
              >
                Profili Görüntüle
              </Link>
            </div>

            {/* Güvenlik İpuçları */}
            <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/80 backdrop-blur-xl border border-amber-200/40 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-amber-800 mb-4">🛡️ Güvenlik İpuçları</h3>
              <ul className="space-y-2 text-sm text-amber-700">
                <li>• İlgilendiğiniz aracı görmeden para göndermeyiniz</li>
                <li>• Araç görme ödemesi talep ediliyorsa şüphelenin</li>
                <li>• Detaylı bilgi için tıklayın</li>
              </ul>
              <button className="mt-4 text-amber-600 hover:text-amber-700 font-medium text-sm">
                Güvenli Alışveriş İpuçları →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Gallery Modal */}
      {isGalleryOpen && listing.images.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setIsGalleryOpen(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="relative max-w-6xl max-h-full">
              <img
                src={listing.images[activeImageIndex]?.original_url}
                alt={listing.title}
                className="max-w-full max-h-full object-contain"
              />
              
              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronLeftIcon className="h-8 w-8" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronRightIcon className="h-8 w-8" />
                  </button>
                </>
              )}
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
                {activeImageIndex + 1} / {listing.images.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 