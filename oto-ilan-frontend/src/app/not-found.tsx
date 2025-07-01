'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { 
  HomeIcon, 
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black">
      <Header />
      
      <div className="pt-24 pb-16 flex items-center justify-center min-h-[80vh]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="h-16 w-16 text-white" />
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-12">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              Sayfa Bulunamadı
            </h2>
            <p className="text-lg text-gray-400/70 max-w-md mx-auto mb-8">
              Aradığınız sayfa mevcut değil, taşınmış veya silinmiş olabilir. 
              Doğru URL'yi yazdığınızdan emin olun.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <button 
              onClick={() => window.history.back()}
              className="w-full md:w-auto inline-flex items-center px-8 py-4 bg-gray-800/60 border border-gray-600/40 text-white rounded-xl hover:bg-gray-700/60 transition-all duration-300 font-medium"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Geri Dön
            </button>
            
            <Link 
              href="/"
              className="w-full md:w-auto inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Ana Sayfa
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-16">
            <h3 className="text-xl font-semibold text-white mb-6">
              Popüler Sayfalar
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link 
                href="/listings"
                className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-xl p-4 text-center hover:bg-gray-800/60 transition-all duration-300 group"
              >
                <MagnifyingGlassIcon className="h-8 w-8 text-indigo-300 mx-auto mb-2" />
                <span className="text-white group-hover:text-indigo-300 transition-colors">
                  İlanlar
                </span>
              </Link>

              <Link 
                href="/brands"
                className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-xl p-4 text-center hover:bg-gray-800/60 transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-white group-hover:text-indigo-300 transition-colors">
                  Markalar
                </span>
              </Link>

              <Link 
                href="/contact"
                className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-xl p-4 text-center hover:bg-gray-800/60 transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-sm">İ</span>
                </div>
                <span className="text-white group-hover:text-indigo-300 transition-colors">
                  İletişim
                </span>
              </Link>

              <Link 
                href="/about"
                className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/40 rounded-xl p-4 text-center hover:bg-gray-800/60 transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-white group-hover:text-indigo-300 transition-colors">
                  Hakkımızda
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 