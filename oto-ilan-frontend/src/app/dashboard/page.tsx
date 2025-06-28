'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth'
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/lib/services/auth'
import { Header } from '@/components/layout/header'
import Link from 'next/link'
import { 
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { formatPrice, formatRelativeTime } from '@/lib/utils'

export default function DashboardPage() {
  const { user, isAuthenticated, loadUser } = useAuthStore()

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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Giriş Yapın</h1>
            <p className="text-muted-foreground">Dashboard'a erişmek için giriş yapmanız gerekiyor.</p>
            <Link 
              href="/auth/login"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center space-y-4">
            <ExclamationTriangleIcon className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Bir Hata Oluştu</h1>
            <p className="text-muted-foreground">Dashboard yüklenirken bir hata oluştu.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Hoş geldiniz, {user?.first_name || user?.username}!
          </h1>
          <p className="text-muted-foreground">
            Dashboard'da hesabınızın özetini görüntüleyebilir ve hızlı işlemler yapabilirsiniz.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/listings/new"
              className="bg-primary text-primary-foreground p-6 rounded-lg hover:bg-primary/90 transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <PlusIcon className="h-8 w-8 group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="font-semibold">Yeni İlan Ver</h3>
                  <p className="text-sm opacity-90">Aracınızı sat</p>
                </div>
              </div>
            </Link>

            <Link
              href="/listings"
              className="bg-card border border-border p-6 rounded-lg hover:shadow-lg transition-all group"
            >
              <div className="flex items-center space-x-4">
                <EyeIcon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="font-semibold text-foreground">İlanları Gözat</h3>
                  <p className="text-sm text-muted-foreground">Araç ara</p>
                </div>
              </div>
            </Link>

            <Link
              href="/messages"
              className="bg-card border border-border p-6 rounded-lg hover:shadow-lg transition-all group"
            >
              <div className="flex items-center space-x-4">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <h3 className="font-semibold text-foreground">Mesajlar</h3>
                  <p className="text-sm text-muted-foreground">
                    {dashboard?.stats.unread_messages ? `${dashboard.stats.unread_messages} okunmamış` : 'İletişim'}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">İstatistikler</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam İlan</p>
                  <p className="text-2xl font-bold text-foreground">{dashboard?.stats.total_listings || 0}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <EyeIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aktif İlan</p>
                  <p className="text-2xl font-bold text-green-600">{dashboard?.stats.active_listings || 0}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pasif İlan</p>
                  <p className="text-2xl font-bold text-yellow-600">{dashboard?.stats.inactive_listings || 0}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Okunmamış Mesaj</p>
                  <p className="text-2xl font-bold text-blue-600">{dashboard?.stats.unread_messages || 0}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Listings */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Son İlanlarım</h3>
              <Link 
                href="/my-listings" 
                className="text-primary hover:text-primary/80 transition-colors text-sm"
              >
                Tümünü Gör
              </Link>
            </div>
            
            <div className="space-y-4">
              {dashboard?.recent_listings?.length ? (
                dashboard.recent_listings.map((listing) => (
                  <div key={listing.id} className="flex items-center space-x-4 p-3 bg-accent/50 rounded-lg">
                    <div className="flex-shrink-0">
                      {listing.primary_image ? (
                        <img
                          src={listing.primary_image.thumbnail_url}
                          alt={listing.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <EyeIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{listing.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {listing.car.brand.name} {listing.car.model.name} • {listing.car.year}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-semibold text-primary">
                          {formatPrice(listing.price)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(listing.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <EyeIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Henüz ilan yok</p>
                  <Link 
                    href="/listings/new"
                    className="text-primary hover:text-primary/80 transition-colors text-sm"
                  >
                    İlk ilanınızı verin
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Son Mesajlar</h3>
              <Link 
                href="/messages" 
                className="text-primary hover:text-primary/80 transition-colors text-sm"
              >
                Tümünü Gör
              </Link>
            </div>
            
            <div className="space-y-4">
              {dashboard?.recent_messages?.length ? (
                dashboard.recent_messages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3 p-3 bg-accent/50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {message.sender.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground text-sm">
                          {message.sender.id === user?.id ? 'Siz' : message.sender.username}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {message.text}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Henüz mesaj yok</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 