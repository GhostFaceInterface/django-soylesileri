'use client'

import { Header } from '@/components/layout/header'
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black">
      <Header />
      
      {/* Hero Section */}
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            İletişim
          </h1>
          <p className="text-xl text-gray-400/70 max-w-2xl mx-auto">
            Sorularınız, önerileriniz veya işbirliği teklifleriniz için bizimle iletişime geçin
          </p>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Phone */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8 text-center hover:bg-gray-800/60 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <PhoneIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Telefon</h3>
            <p className="text-gray-400/70 mb-4">7/24 müşteri hizmetleri</p>
            <a 
              href="tel:+902121234567" 
              className="text-indigo-300 hover:text-indigo-200 font-medium transition-colors"
            >
              +90 (212) 123 45 67
            </a>
          </div>

          {/* Email */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8 text-center hover:bg-gray-800/60 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <EnvelopeIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">E-posta</h3>
            <p className="text-gray-400/70 mb-4">Detaylı sorularınız için</p>
            <a 
              href="mailto:info@otoilan.com" 
              className="text-indigo-300 hover:text-indigo-200 font-medium transition-colors"
            >
              info@otoilan.com
            </a>
          </div>

          {/* Address */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8 text-center hover:bg-gray-800/60 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPinIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Adres</h3>
            <p className="text-gray-400/70 mb-4">Merkez ofisimiz</p>
            <p className="text-indigo-300">
              Maslak Mahallesi<br />
              Büyükdere Caddesi No:123<br />
              Şişli / İstanbul
            </p>
          </div>

        </div>

        {/* Contact Form */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Bize Mesaj Gönderin
            </h2>
            
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Ad Soyad</label>
                  <input 
                    type="text" 
                    placeholder="Adınız ve soyadınız"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">E-posta</label>
                  <input 
                    type="email" 
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Konu</label>
                <input 
                  type="text" 
                  placeholder="Mesajınızın konusu"
                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Mesaj</label>
                <textarea 
                  rows={5}
                  placeholder="Mesajınızı buraya yazın..."
                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-102"
              >
                Mesajı Gönder
              </button>
            </form>
          </div>
        </div>

        {/* Working Hours */}
        <div className="mt-16 text-center">
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-8 max-w-md mx-auto">
            <ClockIcon className="h-12 w-12 text-indigo-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-4">Çalışma Saatleri</h3>
            <div className="space-y-2 text-gray-400/70">
              <p><span className="text-white">Pazartesi - Cuma:</span> 09:00 - 18:00</p>
              <p><span className="text-white">Cumartesi:</span> 10:00 - 16:00</p>
              <p><span className="text-white">Pazar:</span> Kapalı</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 