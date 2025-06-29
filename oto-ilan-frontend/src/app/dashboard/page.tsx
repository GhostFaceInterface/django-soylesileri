'use client'

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth'
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/lib/services/auth'
import { Header } from '@/components/layout/header'
import Link from 'next/link'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import { 
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CogIcon,
  UserCircleIcon,
  DocumentTextIcon,
  ChartBarIcon,
  StarIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  ChevronRightIcon,
  CameraIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user, isAuthenticated, loadUser } = useAuthStore()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    loadUser()
  }, [loadUser])
  
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: authService.getDashboard,
    enabled: isAuthenticated,
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[80vh]">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center space-y-6 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <UserCircleIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
              Giriş Yapın
            </h1>
            <p className="text-gray-600 text-lg">
              Premium dashboard'a erişmek için giriş yapmanız gerekiyor.
            </p>
            <Link 
              href="/auth/login"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[80vh]">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center space-y-6 border border-white/20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600 text-lg font-medium">Dashboard yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[80vh]">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center space-y-6 border border-white/20">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="text-3xl font-bold text-gray-900">Bir Hata Oluştu</h1>
            <p className="text-gray-600 text-lg">Dashboard yüklenirken bir hata oluştu.</p>
          </div>
        </div>
      </div>
    )
  }

  const ProfileMenuContent = () => (
    <div className="absolute top-full right-0 mt-4 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
            {user?.profile_photo ? (
              <img 
                src={user.profile_photo} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-8 w-8 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{user?.username}</h3>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Link
            href="/profile/edit"
            className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-xl transition-colors group"
            onClick={() => setShowProfileMenu(false)}
          >
            <div className="flex items-center space-x-3">
              <UserCircleIcon className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-700">Profil Düzenle</span>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
          </Link>
          
          <Link
            href="/profile/photo"
            className="flex items-center justify-between p-3 hover:bg-purple-50 rounded-xl transition-colors group"
            onClick={() => setShowProfileMenu(false)}
          >
            <div className="flex items-center space-x-3">
              <CameraIcon className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-gray-700">Profil Fotoğrafı</span>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
          </Link>
          
          <Link
            href="/settings"
            className="flex items-center justify-between p-3 hover:bg-green-50 rounded-xl transition-colors group"
            onClick={() => setShowProfileMenu(false)}
          >
            <div className="flex items-center space-x-3">
              <CogIcon className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-700">Hesap Ayarları</span>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
          </Link>
        </div>
      </div>
    </div>
  )

  const HeroSection = () => (
    <div className="mb-8 relative">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-grid-pattern animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between">
          <div className="flex-1 mb-6 lg:mb-0">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm overflow-hidden">
                {user?.profile_photo ? (
                  <img 
                    src={user.profile_photo} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Hoş geldiniz, {user?.first_name || user?.username}! 👋
                </h1>
                <p className="text-white/80 text-lg">
                  Premium dashboard'da tüm özelliklerinizi keşfedin
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center space-x-2 transition-all duration-300 border border-white/20"
            >
              <CogIcon className="h-5 w-5" />
              <span className="font-medium">Profil Ayarları</span>
            </button>
            
            <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <TrophyIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {showProfileMenu && <ProfileMenuContent />}
    </div>
  )

  const QuickActions = () => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <FireIcon className="h-6 w-6 text-orange-500 mr-2" />
        Hızlı İşlemler
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/listings/new"
          className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-8 rounded-2xl transition-all duration-300 group shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <PlusIcon className="h-8 w-8 group-hover:scale-110 transition-transform" />
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <SparklesIcon className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">Yeni İlan Ver</h3>
          <p className="text-blue-100">Aracınızı premium listede satın</p>
        </Link>

        <Link
          href="/listings"
          className="bg-white/80 backdrop-blur-xl border border-white/20 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <EyeIcon className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <ChartBarIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">İlanları Gözat</h3>
          <p className="text-gray-600">Binlerce araç arasından seçin</p>
        </Link>

        <Link
          href="/messages"
          className="bg-white/80 backdrop-blur-xl border border-white/20 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <span className="text-green-600 font-bold text-sm">
                {dashboard?.stats?.unread_messages || 0}
              </span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Mesajlarım</h3>
          <p className="text-gray-600">
            {dashboard?.stats?.unread_messages ? `${dashboard.stats.unread_messages} okunmamış mesaj` : 'Tüm mesajlar okundu'}
          </p>
        </Link>
      </div>
    </div>
  )

  const StatisticsSection = () => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <ChartBarIcon className="h-6 w-6 text-blue-500 mr-2" />
        İstatistiklerim
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{dashboard?.stats?.total_listings || 0}</p>
              <p className="text-sm text-gray-600">Toplam İlan</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl group-hover:bg-green-200 transition-colors">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">{dashboard?.stats?.active_listings || 0}</p>
              <p className="text-sm text-gray-600">Aktif İlan</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-xl group-hover:bg-yellow-200 transition-colors">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-yellow-600">{dashboard?.stats?.inactive_listings || 0}</p>
              <p className="text-sm text-gray-600">Beklemede</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl group-hover:bg-purple-200 transition-colors">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-600">{dashboard?.stats?.unread_messages || 0}</p>
              <p className="text-sm text-gray-600">Yeni Mesaj</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const RecentListingsSection = () => (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
          Son İlanlarım
        </h3>
        <Link 
          href="/my-listings" 
          className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium flex items-center"
        >
          Tümünü Gör
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      <div className="space-y-4">
        {dashboard?.recent_listings?.length ? (
          dashboard.recent_listings.map((listing) => (
            <div key={listing.id} className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors">
              <div className="flex-shrink-0">
                {listing.primary_image ? (
                  <img
                    src={listing.primary_image.thumbnail_url}
                    alt={listing.title}
                    className="w-16 h-16 object-cover rounded-xl shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                    <EyeIcon className="h-6 w-6 text-gray-500" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{listing.title}</h4>
                <p className="text-sm text-gray-600">
                  {listing.car?.brand?.name} {listing.car?.model?.name} • {listing.car?.year}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold text-blue-600">
                    {formatPrice(listing.price)}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {formatRelativeTime(listing.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <EyeIcon className="h-8 w-8 text-gray-500" />
            </div>
            <p className="text-gray-600 font-medium mb-2">Henüz ilan yok</p>
            <Link 
              href="/listings/new"
              className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
            >
              İlk ilanınızı verin →
            </Link>
          </div>
        )}
      </div>
    </div>
  )

  const RecentMessagesSection = () => (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-500 mr-2" />
          Son Mesajlar
        </h3>
        <Link 
          href="/messages" 
          className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium flex items-center"
        >
          Tümünü Gör
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      <div className="space-y-4">
        {dashboard?.recent_messages?.length ? (
          dashboard.recent_messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3 p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">
                    {message.sender?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {message.sender?.id === user?.id ? 'Siz' : message.sender?.username}
                  </h4>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {formatRelativeTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {message.text}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-green-200 to-blue-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-600 font-medium">Henüz mesaj yok</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection />
          <QuickActions />
          <StatisticsSection />
          <div className="grid lg:grid-cols-2 gap-8">
            <RecentListingsSection />
            <RecentMessagesSection />
          </div>
        </div>
      </div>
    </div>
  )
} 