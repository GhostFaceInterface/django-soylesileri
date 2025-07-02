'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth'
import { useForm, useController } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GoogleLogin } from '@react-oauth/google'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(1, 'Şifre alanı zorunludur'),
  rememberMe: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

function LoginPageContent() {
  const router = useRouter()
  const { emailLogin, googleLogin, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [isAnimated, setIsAnimated] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  // Remember Me checkbox - Using simple state instead of useController
  const handleRememberMeToggle = () => {
    setRememberMe(!rememberMe)
    console.log('Remember me toggled:', !rememberMe)
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const onSubmit = async (data: LoginForm) => {
    try {
      clearError()
      console.log('Login attempt:', { 
        email: data.email, 
        password: data.password, 
        rememberMe: rememberMe 
      })
      
      await emailLogin(data.email, data.password, rememberMe)
      
      toast.success('Giriş başarılı! Hoş geldiniz 🎉', {
        duration: 4000,
        style: {
          background: 'rgba(59, 130, 246, 0.9)',
          color: 'white',
          backdropFilter: 'blur(16px)',
        },
      })
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      
      // Hatayı detaylı göster
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      console.log('Error message:', errorMessage)
      
      toast.error(`Giriş başarısız! ${errorMessage}`, {
        style: {
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          backdropFilter: 'blur(16px)',
        },
      })
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      clearError()
      await googleLogin(credentialResponse.credential)
      toast.success('Google ile giriş başarılı! 🚀', {
        duration: 4000,
        style: {
          background: 'rgba(34, 197, 94, 0.9)',
          color: 'white',
          backdropFilter: 'blur(16px)',
        },
      })
      router.push('/dashboard')
    } catch {
      toast.error('Google giriş başarısız!')
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error('Lütfen email adresinizi giriniz')
      return
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Şifre sıfırlama maili gönderildi! 📧')
      setShowForgotPassword(false)
      setForgotEmail('')
    } catch (error) {
      toast.error('Bir hata oluştu, tekrar deneyin')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className={`text-center space-y-3 transition-all duration-1000 ${
        isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        <div className="relative inline-block">
          <h1 className="text-3xl font-bold text-white font-display">
            Hoş Geldiniz
          </h1>
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed">
          Hesabınıza giriş yapın ve premium deneyimi yaşayın
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className={`space-y-2 transition-all duration-1000 ${
          isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ transitionDelay: '200ms' }}>
          <label className="block text-gray-300 text-sm font-semibold tracking-wide">
            Email Adresi
          </label>
          <div className="relative group">
            <input
              {...register('email')}
              type="email"
              placeholder="ornek@email.com"
              className="input-glass group-hover:ring-2 group-hover:ring-white group-hover:ring-opacity-30"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm font-medium animate-fade-in-up">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className={`space-y-2 transition-all duration-1000 ${
          isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ transitionDelay: '300ms' }}>
          <label className="block text-gray-300 text-sm font-semibold tracking-wide">
            Şifre
          </label>
          <div className="relative group">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Şifrenizi giriniz"
              className="input-glass pr-12 group-hover:ring-2 group-hover:ring-white group-hover:ring-opacity-30"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-all duration-200 p-1 rounded-lg hover:bg-gray-100"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm font-medium animate-fade-in-up">{errors.password.message}</p>
          )}
        </div>

        {/* Remember & Forgot */}
        <div className={`flex items-center justify-between transition-all duration-1000 ${
          isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ transitionDelay: '400ms' }}>
          <label 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={rememberMe}
              onChange={handleRememberMeToggle}
            />
            <div className="relative">
              <div className={`w-6 h-6 border-2 rounded-lg transition-all duration-300 transform ${
                rememberMe 
                  ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/50 scale-105' 
                  : 'bg-gray-700 border-gray-400 group-hover:border-blue-400 group-hover:shadow-lg group-hover:bg-gray-600 group-hover:scale-105'
              }`}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckIcon className={`w-5 h-5 transition-all duration-300 transform ${
                  rememberMe 
                    ? 'text-white opacity-100 scale-100 rotate-0' 
                    : 'text-gray-400 opacity-0 scale-50 rotate-12'
                }`} />
              </div>
            </div>
            <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors duration-200">
              Beni hatırla
            </span>
          </label>

          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors duration-200 hover:underline"
          >
            Şifremi unuttum
          </button>
        </div>

        {/* Submit Button */}
        <div className={`transition-all duration-1000 ${
          isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ transitionDelay: '500ms' }}>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="btn-glass w-full relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="relative z-10 flex items-center justify-center space-x-2">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <>
                  <span className="font-semibold">Giriş Yap</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className={`flex items-center space-x-4 transition-all duration-1000 ${
        isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`} style={{ transitionDelay: '600ms' }}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
        <span className="text-gray-400 text-sm font-medium">veya</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
      </div>

      {/* Google Login */}
      <div className={`transition-all duration-1000 ${
        isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`} style={{ transitionDelay: '700ms' }}>
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-1 hover:bg-opacity-20 transition-all duration-300 group">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google giriş hatası')}
            size="large"
            theme="filled_blue"
            width="100%"
          />
        </div>
      </div>

      {/* Sign Up Link */}
      <div className={`text-center transition-all duration-1000 ${
        isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`} style={{ transitionDelay: '800ms' }}>
        <p className="text-gray-300 text-sm">
          Hesabınız yok mu?{' '}
          <Link 
            href="/auth/register" 
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 hover:underline"
          >
            Kayıt olun
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-2xl animate-scale-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Şifre Sıfırlama</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </p>
            <input
              type="email"
              placeholder="Email adresiniz"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 placeholder-gray-500 text-gray-800 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleForgotPassword}
                className="btn-primary flex-1"
              >
                Gönder
              </button>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginPageContent />
    </GoogleOAuthProvider>
  )
} 