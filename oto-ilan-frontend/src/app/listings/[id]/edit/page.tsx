'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/lib/stores/auth'
import { Header } from '@/components/layout/header'
import { listingsService } from '@/lib/services/listings'
import { carsService } from '@/lib/services/cars'
import { locationsService } from '@/lib/services/locations'
import { CarBrand, CarModel, CarVariant, CarTrim, Listing, Province, District, Neighborhood } from '@/types'
import { LocationSelector } from '@/components/LocationSelector'
import toast from 'react-hot-toast'
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// Form validation schema
const editListingSchema = z.object({
  title: z.string().min(10, 'Başlık en az 10 karakter olmalı').max(100, 'Başlık en fazla 100 karakter olabilir'),
  description: z.string().min(50, 'Açıklama en az 50 karakter olmalı').max(2000, 'Açıklama en fazla 2000 karakter olabilir'),
  price: z.number().min(1000, 'Fiyat en az 1.000 TL olmalı').max(50000000, 'Fiyat en fazla 50.000.000 TL olabilir'),
  
  // Araç bilgileri
  brand_id: z.number().min(1, 'Marka seçimi zorunludur'),
  model_id: z.number().min(1, 'Model seçimi zorunludur'),
  variant_id: z.number().optional(),
  trim_id: z.number().optional(),
  
  // Araç detayları
  year: z.number().min(1990, 'Yıl en az 1990 olmalı').max(2025, 'Yıl en fazla 2025 olabilir'),
  mileage: z.number().min(0, 'Kilometre negatif olamaz').max(1000000, 'Kilometre en fazla 1.000.000 olabilir'),
  fuel_type: z.string().min(1, 'Yakıt türü seçimi zorunludur'),
  transmission: z.string().min(1, 'Vites türü seçimi zorunludur'),
  color: z.string().min(1, 'Renk seçimi zorunludur'),
  body_type: z.string().min(1, 'Kasa tipi seçimi zorunludur'),
  engine_power: z.number().min(50, 'Motor gücü en az 50 HP olmalı').max(2000, 'Motor gücü en fazla 2000 HP olabilir'),
  
  // Lokasyon
  province_id: z.number().min(1, 'İl seçimi zorunludur'),
  district_id: z.number().min(1, 'İlçe seçimi zorunludur'),
  neighborhood_id: z.number().min(1, 'Mahalle seçimi zorunludur'),
  
  is_active: z.boolean()
})

type EditListingForm = z.infer<typeof editListingSchema>

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Data states
  const [brands, setBrands] = useState<CarBrand[]>([])
  const [models, setModels] = useState<CarModel[]>([])
  const [variants, setVariants] = useState<CarVariant[]>([])
  const [trims, setTrims] = useState<CarTrim[]>([])
  
  // Location states for form values
  const [locationSelection, setLocationSelection] = useState<{
    province_id?: number
    district_id?: number
    neighborhood_id?: number
  }>({})
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EditListingForm>({
    resolver: zodResolver(editListingSchema),
  })
  
  const selectedBrandId = watch('brand_id')
  const selectedModelId = watch('model_id')
  const selectedVariantId = watch('variant_id')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }
    if (isAuthenticated && params.id) {
      loadListing()
      loadInitialData()
    }
  }, [isAuthenticated, authLoading, params.id, router])

  const loadListing = async () => {
    try {
      setIsLoading(true)
      const data = await listingsService.getById(params.id as string)
      
      // Ilan sahibi kontrolü
      if (data.user.id !== user?.id) {
        toast.error('Bu ilanı düzenleme yetkiniz yok!')
        router.push('/dashboard')
        return
      }
      
      setListing(data)
      
      // Form verilerini populate et
      setValue('title', data.title)
      setValue('description', data.description)
      setValue('price', data.price)
      setValue('brand_id', data.car.brand.id)
      setValue('model_id', data.car.model.id)
      setValue('variant_id', data.car.variant?.id || 0)
      setValue('trim_id', data.car.trim?.id || 0)
      setValue('year', data.car.year)
      setValue('mileage', data.car.mileage)
      setValue('fuel_type', data.car.fuel_type)
      setValue('transmission', data.car.transmission)
      setValue('color', data.car.color)
      setValue('body_type', data.car.body_type)
      setValue('engine_power', data.car.engine_power)
      setValue('province_id', data.province?.id || 0)
      setValue('district_id', data.district?.id || 0)
      setValue('neighborhood_id', data.neighborhood?.id || 0)
      setValue('is_active', data.is_active)
      
      // Set location state for LocationSelector
      setLocationSelection({
        province_id: data.province?.id,
        district_id: data.district?.id,
        neighborhood_id: data.neighborhood?.id
      })
      
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('İlan bulunamadı!')
        router.push('/listings')
      } else if (error.response?.status === 403) {
        toast.error('Bu ilanı düzenleme yetkiniz yok!')
        router.push('/dashboard')
      } else {
        toast.error('İlan yüklenirken hata oluştu!')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadInitialData = async () => {
    try {
      const brandsData = await carsService.getBrands()
      setBrands(brandsData)
    } catch (error) {
      toast.error('Veriler yüklenirken hata oluştu!')
    }
  }

  // Filter models when brand changes
  useEffect(() => {
    if (selectedBrandId && selectedBrandId > 0) {
      fetchModelsByBrand(selectedBrandId)
      setValue('model_id', 0)
      setValue('variant_id', 0)
      setValue('trim_id', 0)
      setVariants([])
      setTrims([])
    }
  }, [selectedBrandId, setValue])

  // Filter variants when model changes
  useEffect(() => {
    if (selectedModelId && selectedModelId > 0) {
      fetchVariantsByModel(selectedModelId)
      setValue('variant_id', 0)
      setValue('trim_id', 0)
      setTrims([])
    }
  }, [selectedModelId, setValue])

  // Filter trims when variant changes
  useEffect(() => {
    if (selectedVariantId && selectedVariantId > 0) {
      fetchTrimsByVariant(selectedVariantId)
      setValue('trim_id', 0)
    }
  }, [selectedVariantId, setValue])

  const fetchModelsByBrand = async (brandId: number) => {
    try {
      const data = await carsService.getModelsByBrand(brandId)
      setModels(data)
    } catch (error) {
      console.error('Models loading error:', error)
    }
  }

  const fetchVariantsByModel = async (modelId: number) => {
    try {
      const data = await carsService.getVariantsByModel(modelId)
      setVariants(data)
    } catch (error) {
      console.error('Variants loading error:', error)
    }
  }

  const fetchTrimsByVariant = async (variantId: number) => {
    try {
      const data = await carsService.getTrimsByVariant(variantId)
      setTrims(data)
    } catch (error) {
      console.error('Trims loading error:', error)
    }
  }

  const onSubmit = async (data: EditListingForm) => {
    try {
      setIsSubmitting(true)
      
      // Sıfır değerleri null'a çevir
      const submitData = {
        ...data,
        variant_id: data.variant_id && data.variant_id > 0 ? data.variant_id : null,
        trim_id: data.trim_id && data.trim_id > 0 ? data.trim_id : null,
      }
      
      await listingsService.update(params.id as string, submitData)
      
      toast.success('İlan başarıyla güncellendi!')
      router.push(`/listings/${params.id}`)
      
    } catch (error: any) {
      console.error('Update error:', error)
      
      if (error.response?.data) {
        // Validation errors
        const errors = error.response.data
        Object.keys(errors).forEach(key => {
          if (errors[key] && errors[key].length > 0) {
            toast.error(`${key}: ${errors[key][0]}`)
          }
        })
      } else {
        toast.error('İlan güncellenirken hata oluştu!')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const fuelTypes = [
    { value: 'gasoline', label: 'Benzin' },
    { value: 'diesel', label: 'Dizel' },
    { value: 'lpg', label: 'LPG' },
    { value: 'electric', label: 'Elektrik' },
    { value: 'hybrid', label: 'Hibrit' }
  ]

  const transmissionTypes = [
    { value: 'manual', label: 'Manuel' },
    { value: 'automatic', label: 'Otomatik' },
    { value: 'semi_automatic', label: 'Yarı Otomatik' }
  ]

  const bodyTypes = [
    { value: 'sedan', label: 'Sedan' },
    { value: 'hatchback', label: 'Hatchback' },
    { value: 'suv', label: 'SUV' },
    { value: 'coupe', label: 'Coupe' },
    { value: 'wagon', label: 'Station Wagon' },
    { value: 'convertible', label: 'Cabrio' },
    { value: 'pickup', label: 'Pickup' },
    { value: 'minivan', label: 'Minivan' }
  ]

  const colors = [
    { value: 'white', label: 'Beyaz' },
    { value: 'black', label: 'Siyah' },
    { value: 'gray', label: 'Gri' },
    { value: 'silver', label: 'Gümüş' },
    { value: 'red', label: 'Kırmızı' },
    { value: 'blue', label: 'Mavi' },
    { value: 'green', label: 'Yeşil' },
    { value: 'yellow', label: 'Sarı' },
    { value: 'orange', label: 'Turuncu' },
    { value: 'brown', label: 'Kahverengi' },
    { value: 'beige', label: 'Bej' },
    { value: 'purple', label: 'Mor' }
  ]

  // Auth loading durumu
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-300"></div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-300"></div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">İlan bulunamadı</h1>
            <Link 
              href="/listings" 
              className="text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              İlanlar sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link 
                href={`/listings/${params.id}`}
                className="flex items-center gap-2 text-gray-400/70 hover:text-indigo-300 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                İlana Geri Dön
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-white">İlan Düzenle</h1>
            <p className="text-gray-400/70 mt-2">İlan bilgilerinizi güncelleyin</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* İlan Bilgileri */}
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">İlan Bilgileri</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Başlık</label>
                  <input
                    {...register('title')}
                    type="text"
                    placeholder="İlan başlığı"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Açıklama</label>
                  <textarea
                    {...register('description')}
                    rows={5}
                    placeholder="İlan açıklaması"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Fiyat (TL)</label>
                  <input
                    {...register('price', { valueAsNumber: true })}
                    type="number"
                    placeholder="Fiyat"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  {errors.price && (
                    <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Lokasyon</label>
                  <LocationSelector
                    value={locationSelection}
                    onChange={(location) => {
                      setLocationSelection(location)
                      setValue('province_id', location.province_id || 0)
                      setValue('district_id', location.district_id || 0)  
                      setValue('neighborhood_id', location.neighborhood_id || 0)
                    }}
                    required={true}
                    showNeighborhood={true}
                  />
                  {(errors.province_id || errors.district_id || errors.neighborhood_id) && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.province_id?.message || errors.district_id?.message || errors.neighborhood_id?.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    {...register('is_active')}
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 bg-gray-800 border-gray-600 rounded focus:ring-indigo-500"
                  />
                  <label className="ml-2 text-white">İlan aktif</label>
                </div>
              </div>
            </div>

            {/* Araç Bilgileri */}
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Araç Bilgileri</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Marka</label>
                  <select
                    {...register('brand_id', { valueAsNumber: true })}
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Marka seçin</option>
                    {brands && brands.map ? brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    )) : null}
                  </select>
                  {errors.brand_id && (
                    <p className="text-red-400 text-sm mt-1">{errors.brand_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Model</label>
                  <select
                    {...register('model_id', { valueAsNumber: true })}
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={!selectedBrandId}
                  >
                    <option value="">Model seçin</option>
                    {models && models.map ? models.map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    )) : null}
                  </select>
                  {errors.model_id && (
                    <p className="text-red-400 text-sm mt-1">{errors.model_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Donanım (Opsiyonel)</label>
                  <select
                    {...register('variant_id', { valueAsNumber: true })}
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={!selectedModelId}
                  >
                    <option value="0">Donanım seçin (opsiyonel)</option>
                    {variants && variants.map ? variants.map(variant => (
                      <option key={variant.id} value={variant.id}>{variant.name}</option>
                    )) : null}
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Trim (Opsiyonel)</label>
                  <select
                    {...register('trim_id', { valueAsNumber: true })}
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={!selectedVariantId}
                  >
                    <option value="0">Trim seçin (opsiyonel)</option>
                    {trims && trims.map ? trims.map(trim => (
                      <option key={trim.id} value={trim.id}>{trim.name}</option>
                    )) : null}
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Yıl</label>
                  <input
                    {...register('year', { valueAsNumber: true })}
                    type="number"
                    placeholder="Yıl"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  {errors.year && (
                    <p className="text-red-400 text-sm mt-1">{errors.year.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Kilometre</label>
                  <input
                    {...register('mileage', { valueAsNumber: true })}
                    type="number"
                    placeholder="Kilometre"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  {errors.mileage && (
                    <p className="text-red-400 text-sm mt-1">{errors.mileage.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Yakıt Türü</label>
                  <select
                    {...register('fuel_type')}
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Yakıt türü seçin</option>
                    {fuelTypes && fuelTypes.map ? fuelTypes.map(fuel => (
                      <option key={fuel.value} value={fuel.value}>{fuel.label}</option>
                    )) : null}
                  </select>
                  {errors.fuel_type && (
                    <p className="text-red-400 text-sm mt-1">{errors.fuel_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Vites</label>
                  <select
                    {...register('transmission')}
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Vites türü seçin</option>
                    {transmissionTypes && transmissionTypes.map ? transmissionTypes.map(transmission => (
                      <option key={transmission.value} value={transmission.value}>{transmission.label}</option>
                    )) : null}
                  </select>
                  {errors.transmission && (
                    <p className="text-red-400 text-sm mt-1">{errors.transmission.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Renk</label>
                  <select
                    {...register('color')}
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Renk seçin</option>
                    {colors && colors.map ? colors.map(color => (
                      <option key={color.value} value={color.value}>{color.label}</option>
                    )) : null}
                  </select>
                  {errors.color && (
                    <p className="text-red-400 text-sm mt-1">{errors.color.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Kasa Tipi</label>
                  <select
                    {...register('body_type')}
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Kasa tipi seçin</option>
                    {bodyTypes && bodyTypes.map ? bodyTypes.map(body => (
                      <option key={body.value} value={body.value}>{body.label}</option>
                    )) : null}
                  </select>
                  {errors.body_type && (
                    <p className="text-red-400 text-sm mt-1">{errors.body_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Motor Gücü (HP)</label>
                  <input
                    {...register('engine_power', { valueAsNumber: true })}
                    type="number"
                    placeholder="Motor gücü"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  {errors.engine_power && (
                    <p className="text-red-400 text-sm mt-1">{errors.engine_power.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-4">
              <Link
                href={`/listings/${params.id}`}
                className="px-8 py-3 bg-gray-800/60 border border-gray-600/40 text-white rounded-xl hover:bg-gray-700/60 transition-all duration-300 font-medium"
              >
                İptal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 