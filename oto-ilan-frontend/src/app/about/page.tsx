'use client'

import { Header } from '@/components/layout/header'
import { 
  ShieldCheckIcon,
  UsersIcon,
  TrophyIcon,
  GlobeAltIcon,
  StarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black">
      <Header />
      
      {/* Hero Section */}
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Hakkımızda
          </h1>
          <p className="text-xl text-gray-400/70 max-w-3xl mx-auto">
            Türkiye'nin en kapsamlı otomobil pazarı olarak, güvenilir ve kaliteli hizmet sunma misyonumuzla yola çıktık
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Misyonumuz</h2>
            <p className="text-lg text-gray-400/70 max-w-3xl mx-auto">
              Otomobil alım-satım sürecini dijitalleştirerek, kullanıcılarımıza güvenli, 
              şeffaf ve kullanıcı dostu bir platform sunmak. Hem alıcılar hem de satıcılar 
              için en iyi deneyimi sağlamak temel hedefimizdir.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <UsersIcon className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">50K+</div>
            <p className="text-gray-400/70">Aktif Kullanıcı</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">15K+</div>
            <p className="text-gray-400/70">Aylık İlan</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrophyIcon className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">98%</div>
            <p className="text-gray-400/70">Müşteri Memnuniyeti</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8">
            <ShieldCheckIcon className="h-12 w-12 text-indigo-300 mb-6" />
            <h3 className="text-xl font-semibold text-white mb-4">Güvenli İşlem</h3>
            <p className="text-gray-400/70">
              Tüm ilanlarımız doğrulanır ve güvenli ödeme sistemleri ile korunur
            </p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8">
            <StarIcon className="h-12 w-12 text-indigo-300 mb-6" />
            <h3 className="text-xl font-semibold text-white mb-4">Kaliteli Hizmet</h3>
            <p className="text-gray-400/70">
              7/24 müşteri desteği ve profesyonel ekibimizle yanınızdayız
            </p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8">
            <GlobeAltIcon className="h-12 w-12 text-indigo-300 mb-6" />
            <h3 className="text-xl font-semibold text-white mb-4">Geniş Ağ</h3>
            <p className="text-gray-400/70">
              Türkiye genelinde geniş bayii ve satıcı ağımızla hizmet veriyoruz
            </p>
          </div>

        </div>

        {/* Team Section */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Ekibimiz</h2>
            <p className="text-lg text-gray-400/70 max-w-3xl mx-auto">
              Deneyimli ve tutkulu ekibimiz ile otomotiv sektöründe dijital dönüşüme öncülük ediyoruz
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">AE</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ahmet Ergün</h3>
              <p className="text-indigo-300 mb-2">Kurucu & CEO</p>
              <p className="text-gray-400/70 text-sm">15 yıl otomotiv sektörü deneyimi</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">SY</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Selin Yılmaz</h3>
              <p className="text-indigo-300 mb-2">CTO</p>
              <p className="text-gray-400/70 text-sm">Teknoloji ve inovasyon lideri</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">MK</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Murat Kaya</h3>
              <p className="text-indigo-300 mb-2">Pazarlama Direktörü</p>
              <p className="text-gray-400/70 text-sm">Dijital pazarlama uzmanı</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 