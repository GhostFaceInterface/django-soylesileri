'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth'
import { authService } from '@/lib/services/auth'
import { Header } from '@/components/layout/header'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  StarIcon,
  TruckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Link from 'next/link'
import type { CarBrand, CarModel, CarVariant, CarTrim, Province, District, Neighborhood, LocationSelection } from '@/types'
import { LocationSelector } from '@/components/LocationSelector'

interface UploadedImage {
  id: string
  file: File
  preview: string
  isSelected: boolean
  isUploading: boolean
  uploadedImageId?: number
}

// Form validation schema
const listingSchema = z.object({
  // Araç seçimi
  brand_id: z.number().min(1, 'Marka seçiniz'),
  model_id: z.number().min(1, 'Model seçiniz'),
  variant_id: z.number().optional(),
  trim_id: z.number().optional(),
  
  // Araç detayları
  year: z.number().min(1885, 'Geçerli bir yıl giriniz').max(2025, 'Geçerli bir yıl giriniz'),
  mileage: z.number().min(0, 'Kilometre negatif olamaz'),
  fuel_type: z.enum(['petrol', 'diesel', 'electric', 'hybrid'], {
    required_error: 'Yakıt tipi seçiniz'
  }),
  transmission: z.enum(['manual', 'automatic'], {
    required_error: 'Şanzıman tipi seçiniz'
  }),
  color: z.string().min(1, 'Renk giriniz'),
  body_type: z.string().min(1, 'Kasa tipi giriniz'),
  engine_power: z.number().min(1, 'Motor gücü en az 1 HP olmalıdır'),
  
  // İlan bilgileri
  title: z.string().min(5, 'Başlık en az 5 karakter olmalıdır').max(150, 'Başlık en fazla 150 karakter olabilir'),
  description: z.string().min(20, 'Açıklama en az 20 karakter olmalıdır'),
  price: z.number().min(1, 'Fiyat 0\'dan büyük olmalıdır'),
  
  // Location
  province_id: z.number().min(1, 'İl seçiniz'),
  district_id: z.number().min(1, 'İlçe seçiniz'),
  neighborhood_id: z.number().min(1, 'Mahalle seçiniz'),
})

type ListingFormData = z.infer<typeof listingSchema>

export default function NewListingPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()
  
  // States
  const [images, setImages] = useState<UploadedImage[]>([])
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Data states
  const [brands, setBrands] = useState<CarBrand[]>([])
  const [models, setModels] = useState<CarModel[]>([])
  const [variants, setVariants] = useState<CarVariant[]>([])
  const [trims, setTrims] = useState<CarTrim[]>([])
  
  // Location selection state
  const [locationSelection, setLocationSelection] = useState<LocationSelection>({})
  
  // Form
  const { register, handleSubmit, watch, setValue, control, formState: { errors, isSubmitting } } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
  })
  
  const selectedBrandId = watch('brand_id')
  const selectedModelId = watch('model_id')
  const selectedVariantId = watch('variant_id')

  useEffect(() => {
    // Loading tamamlandıktan sonra auth kontrolü yap
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }
    if (isAuthenticated) {
    loadInitialData()
    }
  }, [isAuthenticated, authLoading, router])

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

  // Filter models when brand changes
  useEffect(() => {
    if (selectedBrandId) {
      // API'den o markanın modellerini al
      fetchModelsByBrand(selectedBrandId)
      setValue('model_id', 0) // Reset model selection
      setValue('variant_id', 0) // Reset variant selection
      setValue('trim_id', 0) // Reset trim selection
      setVariants([]) // Clear variants
      setTrims([]) // Clear trims
    } else {
      setModels([])
      setVariants([])
      setTrims([])
    }
  }, [selectedBrandId, setValue])

  // Filter variants when model changes
  useEffect(() => {
    if (selectedModelId) {
      // API'den o modelin varyantlarını al
      fetchVariantsByModel(selectedModelId)
      setValue('variant_id', 0) // Reset variant selection
      setValue('trim_id', 0) // Reset trim selection
      setTrims([]) // Clear trims
    } else {
      setVariants([])
      setTrims([])
    }
  }, [selectedModelId, setValue])

  // Filter trims when variant changes
  useEffect(() => {
    if (selectedVariantId) {
      // API'den o varyantın donanımlarını al
      fetchTrimsByVariant(selectedVariantId)
      setValue('trim_id', 0) // Reset trim selection
    } else {
      setTrims([])
    }
  }, [selectedVariantId, setValue])

  // Sync location selection with form values
  useEffect(() => {
    setValue('province_id', locationSelection.province_id || undefined)
    setValue('district_id', locationSelection.district_id || undefined) 
    setValue('neighborhood_id', locationSelection.neighborhood_id || undefined)
  }, [locationSelection, setValue])

  const fetchModelsByBrand = async (brandId: number) => {
    try {
      const response = await authService.getModelsByBrand(brandId)
      const modelsArray = Array.isArray(response) ? response : response?.results || []
      setModels(modelsArray)
    } catch (error) {
      console.error('Error loading models:', error)
      toast.error('Modeller yüklenirken hata oluştu')
    }
  }

  const fetchVariantsByModel = async (modelId: number) => {
    try {
      const response = await authService.getVariantsByModel(modelId)
      const variantsArray = Array.isArray(response) ? response : response?.results || []
      setVariants(variantsArray)
    } catch (error) {
      console.error('Error loading variants:', error)
      toast.error('Varyantlar yüklenirken hata oluştu')
    }
  }

  const fetchTrimsByVariant = async (variantId: number) => {
    try {
      const response = await authService.getTrimsByVariant(variantId)
      const trimsArray = Array.isArray(response) ? response : response?.results || []
      setTrims(trimsArray)
    } catch (error) {
      console.error('Error loading trims:', error)
      toast.error('Donanımlar yüklenirken hata oluştu')
    }
  }

  const loadInitialData = async () => {
    try {
      const brandsData = await authService.getBrands()
      
      // Ensure all data are arrays
      const brandsArray = Array.isArray(brandsData) ? brandsData : brandsData?.results || []
      
      setBrands(brandsArray)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Veriler yüklenirken hata oluştu')
    }
  }

  const handleImageSelect = (files: FileList) => {
    const newImages: UploadedImage[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} dosyası çok büyük. Maksimum 5MB olabilir.`)
        continue
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} geçerli bir resim dosyası değil.`)
        continue
      }
      
      const imageId = Math.random().toString(36).substr(2, 9)
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const newImage: UploadedImage = {
          id: imageId,
          file,
          preview: e.target?.result as string,
          isSelected: false,
          isUploading: false
        }
        
        setImages(prev => [...prev, newImage])
      }
      
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleImageSelect(e.target.files)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files) {
      handleImageSelect(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
    if (selectedThumbnail === id) {
      setSelectedThumbnail(null)
    }
  }

  const selectThumbnail = (id: string) => {
    setSelectedThumbnail(id)
    toast.success('Ana resim seçildi!')
  }

  const onSubmit = async (data: ListingFormData) => {
    if (images.length === 0) {
      toast.error('En az bir resim yüklemelisiniz!')
      return
    }

    try {
      setIsLoading(true)
      
      // Create listing
      const listing = await authService.createListing(data)
      
      // Upload images
      const imageFiles = images.map(img => img.file)
      await authService.uploadImages(listing.id, imageFiles)
      
      // Set thumbnail ONLY if user manually selected one
      // If no selection, backend automatically sets first image as primary
      if (selectedThumbnail) {
      const thumbnailImage = images.find(img => img.id === selectedThumbnail)
      if (thumbnailImage?.uploadedImageId) {
        await authService.setPrimaryImage(thumbnailImage.uploadedImageId)
        }
      }
      
      toast.success('İlan başarıyla oluşturuldu!')
      router.push('/dashboard')
      
    } catch (error: any) {
      console.error('Listing creation error:', error)
      const errorMessage = error.response?.data?.detail || 'İlan oluşturulurken hata oluştu!'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const ImagePreview = ({ image }: { image: UploadedImage }) => (
    <div className="relative group">
      <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden shadow-md">
        <img
          src={image.preview}
          alt="Preview"
          className="w-full h-full object-contain bg-black"
        />
      </div>
      
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
      
      <div className="absolute top-2 right-2 flex items-center space-x-2">
        <button
          type="button"
          onClick={() => selectThumbnail(image.id)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            selectedThumbnail === image.id
              ? 'bg-yellow-500 text-white'
              : 'bg-white/80 text-gray-700 hover:bg-yellow-500 hover:text-white'
          }`}
        >
          <StarIcon className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => removeImage(image.id)}
          className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
      
      {selectedThumbnail === image.id && (
        <div className="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
          Ana Resim
        </div>
      )}
    </div>
  )

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[80vh]">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Dashboard'a Dön
            </Link>
            
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <PlusIcon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Yeni İlan Oluştur</h1>
                  <p className="text-white/80">Aracınızın tüm bilgilerini eksiksiz doldurun</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Car Selection */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <TruckIcon className="h-5 w-5 text-blue-600 mr-2" />
                Araç Seçimi
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Marka */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marka *
                  </label>
                  <select
                    {...register('brand_id', { valueAsNumber: true })}
                    className="input-glass"
                  >
                    <option value="">Marka Seçiniz</option>
                    {Array.isArray(brands) && brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  {errors.brand_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.brand_id.message}</p>
                  )}
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <select
                    {...register('model_id', { valueAsNumber: true })}
                    className="input-glass"
                    disabled={!selectedBrandId}
                  >
                    <option value="">Model Seçiniz</option>
                    {Array.isArray(models) && models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  {errors.model_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.model_id.message}</p>
                  )}
                </div>

                {/* Varyant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Varyant
                  </label>
                  <select
                    {...register('variant_id', { valueAsNumber: true })}
                    className="input-glass"
                    disabled={!selectedModelId}
                  >
                    <option value="">Varyant Seçiniz</option>
                    {Array.isArray(variants) && variants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Donanım */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Donanım
                  </label>
                  <select
                    {...register('trim_id', { valueAsNumber: true })}
                    className="input-glass"
                    disabled={!selectedVariantId}
                  >
                    <option value="">Donanım Seçiniz</option>
                    {Array.isArray(trims) && trims.map((trim) => (
                      <option key={trim.id} value={trim.id}>
                        {trim.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Car Details */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <InformationCircleIcon className="h-5 w-5 text-purple-600 mr-2" />
                Araç Detayları
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Yıl */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Yılı *
                  </label>
                  <input
                    type="number"
                    {...register('year', { valueAsNumber: true })}
                    className="input-glass"
                    placeholder="2020"
                    min="1885"
                    max="2025"
                  />
                  {errors.year && (
                    <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
                  )}
                </div>

                {/* Kilometre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kilometre *
                  </label>
                  <input
                    type="number"
                    {...register('mileage', { valueAsNumber: true })}
                    className="input-glass"
                    placeholder="50000"
                    min="0"
                  />
                  {errors.mileage && (
                    <p className="text-red-500 text-sm mt-1">{errors.mileage.message}</p>
                  )}
                </div>

                {/* Motor Gücü */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motor Gücü (HP) *
                  </label>
                  <input
                    type="number"
                    {...register('engine_power', { valueAsNumber: true })}
                    className="input-glass"
                    placeholder="150"
                    min="1"
                  />
                  {errors.engine_power && (
                    <p className="text-red-500 text-sm mt-1">{errors.engine_power.message}</p>
                  )}
                </div>

                {/* Yakıt Tipi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yakıt Tipi *
                  </label>
                  <select
                    {...register('fuel_type')}
                    className="input-glass"
                  >
                    <option value="">Yakıt Tipi Seçiniz</option>
                    <option value="petrol">Benzin</option>
                    <option value="diesel">Dizel</option>
                    <option value="electric">Elektrik</option>
                    <option value="hybrid">Hibrit</option>
                  </select>
                  {errors.fuel_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.fuel_type.message}</p>
                  )}
                </div>

                {/* Şanzıman */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şanzıman *
                  </label>
                  <select
                    {...register('transmission')}
                    className="input-glass"
                  >
                    <option value="">Şanzıman Seçiniz</option>
                    <option value="manual">Manuel</option>
                    <option value="automatic">Otomatik</option>
                  </select>
                  {errors.transmission && (
                    <p className="text-red-500 text-sm mt-1">{errors.transmission.message}</p>
                  )}
                </div>

                {/* Renk */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renk *
                  </label>
                  <input
                    type="text"
                    {...register('color')}
                    className="input-glass"
                    placeholder="Beyaz"
                  />
                  {errors.color && (
                    <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>
                  )}
                </div>

                {/* Kasa Tipi */}
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kasa Tipi *
                  </label>
                  <input
                    type="text"
                    {...register('body_type')}
                    className="input-glass"
                    placeholder="Sedan"
                  />
                  {errors.body_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.body_type.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Listing Details */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <InformationCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                İlan Bilgileri
              </h2>
              
              <div className="space-y-6">
                {/* Başlık */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İlan Başlığı *
                  </label>
                  <input
                    type="text"
                    {...register('title')}
                    className="input-glass"
                    placeholder="2020 BMW 320i Temiz Bakımlı"
                    maxLength={150}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Açıklama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    {...register('description')}
                    className="input-glass"
                    rows={4}
                    placeholder="Aracınızın detaylı açıklamasını yazınız..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fiyat */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fiyat (₺) *
                    </label>
                    <input
                      type="number"
                      {...register('price', { valueAsNumber: true })}
                      className="input-glass"
                      placeholder="250000"
                      min="1"
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                    )}
                  </div>

                  {/* Location Selection */}
                  <div className="md:col-span-2">
                    <LocationSelector
                      value={locationSelection}
                      onChange={setLocationSelection}
                      required={true}
                      showNeighborhood={true}  // İl/ilçe/mahalle seçimi zorunlu
                    />
                    {errors.province_id && (
                      <p className="text-red-500 text-sm mt-1">{errors.province_id.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <PhotoIcon className="h-5 w-5 text-blue-600 mr-2" />
                  İlan Resimleri
                </h2>
                <div className="text-sm text-gray-600">
                  {images.length}/10 resim
                </div>
              </div>
              
              {/* Drag & Drop Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 mb-6 ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                    <PhotoIcon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      Resimleri sürükleyin veya tıklayın
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      JPG, PNG veya WEBP • En fazla 5MB • 4:3 format (boşluklar siyah doldurulur)
                    </p>
                    
                    <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl">
                      <PhotoIcon className="h-4 w-4 mr-2" />
                      Dosya Seç
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Image Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {images.map((image) => (
                    <ImagePreview key={image.id} image={image} />
                  ))}
                </div>
              )}

              {/* Thumbnail Selection Info */}
              {images.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <StarIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-800">Ana Resim Seçimi (İsteğe Bağlı)</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        {selectedThumbnail 
                          ? 'Ana resim seçildi! Bu resim ilan kartlarında görünecek.'
                          : 'Seçim yapmazsanız ilk yüklenen resim otomatik olarak ana resim olacak.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setImages([])
                      setSelectedThumbnail(null)
                    }}
                    disabled={images.length === 0}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Temizle
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting || isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        İlan Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        İlanı Oluştur
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 