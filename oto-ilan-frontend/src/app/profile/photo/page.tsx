'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth'
import { Header } from '@/components/layout/header'
import { 
  UserCircleIcon,
  CameraIcon,
  TrashIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ProfilePhotoPage() {
  const router = useRouter()
  const { user, isAuthenticated, loadUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    loadUser()
  }, [isAuthenticated, loadUser, router])

  useEffect(() => {
    if (user?.profile_photo) {
      setPhotoPreview(user.profile_photo)
    }
  }, [user])

  const handlePhotoChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Dosya boyutu 5MB\'dan küçük olmalı')
      return
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası seçin')
      return
    }
    
    setSelectedPhoto(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handlePhotoChange(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handlePhotoChange(file)
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

  const uploadPhoto = async () => {
    if (!selectedPhoto) {
      toast.error('Lütfen bir fotoğraf seçin')
      return
    }

    try {
      setIsLoading(true)
      
      const formData = new FormData()
      formData.append('profile_photo', selectedPhoto)

      const response = await fetch('/api/users/profile/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      })

      if (response.ok) {
        toast.success('Profil fotoğrafı başarıyla güncellendi!')
        await loadUser()
        setSelectedPhoto(null)
        router.push('/dashboard')
      } else {
        toast.error('Fotoğraf yüklenirken bir hata oluştu')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const removePhoto = async () => {
    try {
      setIsLoading(true)
      
      const formData = new FormData()
      formData.append('profile_photo', '')

      const response = await fetch('/api/users/profile/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      })

      if (response.ok) {
        toast.success('Profil fotoğrafı kaldırıldı!')
        await loadUser()
        setPhotoPreview(null)
        setSelectedPhoto(null)
      } else {
        toast.error('Fotoğraf kaldırılırken bir hata oluştu')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const cancelSelection = () => {
    setSelectedPhoto(null)
    setPhotoPreview(user?.profile_photo || null)
  }

  if (!isAuthenticated || !user) {
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Dashboard'a Dön
            </Link>
            
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CameraIcon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Profil Fotoğrafı</h1>
                  <p className="text-white/80">Profil fotoğrafınızı yönetin</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Photo */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <UserCircleIcon className="h-5 w-5 text-purple-600 mr-2" />
              Mevcut Fotoğraf
            </h2>
            
            <div className="flex items-center justify-center">
              <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserCircleIcon className="h-20 w-20 text-gray-500" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <PhotoIcon className="h-5 w-5 text-blue-600 mr-2" />
              Yeni Fotoğraf Yükle
            </h2>
            
            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                  <CameraIcon className="h-8 w-8 text-white" />
                </div>
                
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Fotoğrafı sürükleyin veya tıklayın
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    JPG, PNG veya GIF • En fazla 5MB
                  </p>
                  
                  <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl">
                    <CameraIcon className="h-4 w-4 mr-2" />
                    Dosya Seç
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {user?.profile_photo && (
                  <button
                    onClick={removePhoto}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Fotoğrafı Kaldır
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {selectedPhoto && (
                  <button
                    onClick={cancelSelection}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    İptal
                  </button>
                )}
                
                <button
                  onClick={uploadPhoto}
                  disabled={!selectedPhoto || isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Kaydet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 