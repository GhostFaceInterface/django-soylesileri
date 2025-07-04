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
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalı')
    .max(30, 'Kullanıcı adı en fazla 30 karakter olabilir')
    .regex(/^[a-zA-Z0-9_]+$/, 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'),
  email: z.string().email('Geçerli bir email adresi girin'),
  first_name: z.string().min(2, 'Ad en az 2 karakter olmalı').optional(),
  last_name: z.string().min(2, 'Soyad en az 2 karakter olmalı').optional(),
  password: z.string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermeli')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermeli'),
  password_confirm: z.string(),
  phone_number: z.string().optional(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Şifreler eşleşmiyor",
  path: ["password_confirm"],
})

type RegisterForm = {
  username: string
  email: string
  first_name?: string
  last_name?: string
  password: string
  password_confirm: string
  phone_number?: string
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

function RegisterPageContent() {
  const router = useRouter()
  const { register: registerUser, googleLogin, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isAnimated, setIsAnimated] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  // Terms checkbox - Using simple state instead of useController
  const handleTermsToggle = () => {
    setTermsAccepted(!termsAccepted)
    console.log('Terms toggled:', !termsAccepted)
  }

  const password = watch('password')

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Calculate password strength
    if (!password) {
      setPasswordStrength(0)
      return
    }
    
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    setPasswordStrength(strength)
  }, [password])

  const onSubmit = async (data: RegisterForm) => {
    try {
      clearError()
      
      // Terms validation
      if (!termsAccepted) {
        toast.error('Kullanım koşullarını kabul etmelisiniz')
        return
      }
      
      await registerUser({...data, terms: termsAccepted})
      toast.success('Hesabınız başarıyla oluşturuldu!')
      router.push('/dashboard')
    } catch (error) {
      // Error handling auth store'da yapılıyor
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      clearError()
      await googleLogin(credentialResponse.credential)
      toast.success('Google ile başarıyla kayıt oldunuz!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Google ile kayıt başarısız oldu')
    }
  }

  const handleGoogleError = () => {
    toast.error('Google ile kayıt başarısız oldu')
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Zayıf'
    if (passwordStrength <= 3) return 'Orta'
    return 'Güçlü'
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className={`text-center space-y-3 transition-all duration-1000 ${
        isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        <div className="relative inline-block">
          <h1 className="text-3xl font-bold text-white font-display">
            Hesap Oluşturun
          </h1>
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed">
          Premium araç pazarımıza katılın ve ayrıcalıklı deneyimi yaşayın
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Fields Row */}
        <div className={`grid grid-cols-2 gap-4 transition-all duration-1000 ${
          isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ transitionDelay: '200ms' }}>
          {/* First Name */}
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-semibold tracking-wide">
              Ad
            </label>
            <div className="relative group">
              <input
                {...register('first_name')}
                type="text"
                placeholder="Adınız"
                className="input-glass group-hover:ring-2 group-hover:ring-white group-hover:ring-opacity-30"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {errors.first_name && (
              <p className="text-red-500 text-sm font-medium animate-fade-in-up">{errors.first_name.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-semibold tracking-wide">
              Soyad
            </label>
            <div className="relative group">
              <input
                {...register('last_name')}
                type="text"
                placeholder="Soyadınız"
                className="input-glass group-hover:ring-2 group-hover:ring-white group-hover:ring-opacity-30"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {errors.last_name && (
              <p className="text-red-500 text-sm font-medium animate-fade-in-up">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* Username & Email Row */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-1000 ${
          isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ transitionDelay: '300ms' }}>
          {/* Username */}
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-semibold tracking-wide">
              Kullanıcı Adı
            </label>
            <div className="relative group">
              <input
                {...register('username')}
                type="text"
                placeholder="username"
                className="input-glass group-hover:ring-2 group-hover:ring-white group-hover:ring-opacity-30"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm font-medium animate-fade-in-up">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
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
        </div>

        {/* Phone Field */}
        <div className={`space-y-2 transition-all duration-1000 ${
          isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ transitionDelay: '400ms' }}>
          <label className="block text-gray-300 text-sm font-semibold tracking-wide">
            Telefon Numarası
          </label>
          <div className="relative group">
            <input
              {...register('phone_number')}
              type="tel"
              placeholder="05XX XXX XX XX"
              className="input-glass group-hover:ring-2 group-hover:ring-white group-hover:ring-opacity-30"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
          </div>
          {errors.phone_number && (
            <p className="text-red-500 text-sm font-medium animate-fade-in-up">{errors.phone_number.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className={`space-y-2 transition-all duration-1000 ${
          isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ transitionDelay: '500ms' }}>
          <label className="block text-gray-300 text-sm font-semibold tracking-wide">
            Şifre
          </label>
          <div className="relative group">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Güçlü bir şifre oluşturun"
              className="input-glass pr-12 group-hover:ring-2 group-hover:ring-white group-hover:ring-opacity-30"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-all duration-200 p-1 rounded-lg hover:bg-gray-100"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
          </div>

          {/* Password Strength Indicator */}
          {password && password.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  ></div>
                </div>
                <span className="text-gray-600 text-xs font-medium">
                  {getPasswordStrengthText()}
                </span>
              </div>
              
              {/* Password Requirements */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  {(password?.length || 0) >= 8 ? (
                    <CheckIcon className="h-4 w-4 text-green-400" />
                  ) : (
                    <XMarkIcon className="h-4 w-4 text-red-400" />
                  )}
                  <span className={(password?.length || 0) >= 8 ? 'text-green-600' : 'text-red-500'}>
                    En az 8 karakter
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {/[A-Z]/.test(password || '') ? (
                    <CheckIcon className="h-4 w-4 text-green-400" />
                  ) : (
                    <XMarkIcon className="h-4 w-4 text-red-400" />
                  )}
                  <span className={/[A-Z]/.test(password || '') ? 'text-green-600' : 'text-red-500'}>
                    Büyük harf
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {/[0-9]/.test(password || '') ? (
                    <CheckIcon className="h-4 w-4 text-green-400" />
                  ) : (
                    <XMarkIcon className="h-4 w-4 text-red-400" />
                  )}
                  <span className={/[0-9]/.test(password || '') ? 'text-green-600' : 'text-red-500'}>
                    Rakam
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="text-red-500 text-sm font-medium animate-fade-in-up">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className={`space-y-2 transition-all duration-1000 ${
          isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ transitionDelay: '600ms' }}>
          <label className="block text-gray-300 text-sm font-semibold tracking-wide">
            Şifre Tekrarı
          </label>
          <div className="relative group">
            <input
              {...register('password_confirm')}
              type={showPasswordConfirm ? 'text' : 'password'}
              placeholder="Şifrenizi tekrar girin"
              className="input-glass pr-12 group-hover:ring-2 group-hover:ring-white group-hover:ring-opacity-30"
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-all duration-200 p-1 rounded-lg hover:bg-gray-100"
            >
              {showPasswordConfirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
          </div>
          {errors.password_confirm && (
            <p className="text-red-500 text-sm font-medium animate-fade-in-up">{errors.password_confirm.message}</p>
          )}
        </div>

        {/* Terms Acceptance */}
        <div className={`transition-all duration-1000 ${
          isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ transitionDelay: '700ms' }}>
          <label className="flex items-start space-x-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={termsAccepted}
              onChange={handleTermsToggle}
            />
            <div className="relative mt-1">
              <div className={`w-6 h-6 border-2 rounded-lg transition-all duration-300 transform ${
                termsAccepted 
                  ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/50 scale-105' 
                  : 'bg-gray-700 border-gray-400 group-hover:border-blue-400 group-hover:shadow-lg group-hover:bg-gray-600 group-hover:scale-105'
              }`}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckIcon className={`w-5 h-5 transition-all duration-300 transform ${
                  termsAccepted 
                    ? 'text-white opacity-100 scale-100 rotate-0' 
                    : 'text-gray-400 opacity-0 scale-50 rotate-12'
                }`} />
              </div>
            </div>
            <div>
              <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors duration-200">
                <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200">
                  Kullanım Koşulları
                </Link>{' '}
                ve{' '}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200">
                  Gizlilik Politikası
                </Link>
                'nı kabul ediyorum
              </span>

            </div>
          </label>
        </div>

        {/* Submit Button */}
        <div className={`transition-all duration-1000 ${
          isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ transitionDelay: '800ms' }}>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="btn-glass w-full relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="relative z-10 flex items-center justify-center space-x-2">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Hesap oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <span className="font-semibold">Hesap Oluştur</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-accent-600 to-primary-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className={`flex items-center space-x-4 transition-all duration-1000 ${
        isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`} style={{ transitionDelay: '900ms' }}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
        <span className="text-gray-400 text-sm font-medium">veya</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
      </div>

      {/* Google Register */}
      <div className={`transition-all duration-1000 ${
        isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`} style={{ transitionDelay: '1000ms' }}>
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-1 hover:bg-opacity-20 transition-all duration-300 group">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            size="large"
            theme="filled_blue"
            width="100%"
          />
        </div>
      </div>

      {/* Sign In Link */}
      <div className={`text-center transition-all duration-1000 ${
        isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`} style={{ transitionDelay: '1100ms' }}>
        <p className="text-gray-300 text-sm">
          Zaten hesabınız var mı?{' '}
          <Link 
            href="/auth/login" 
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 hover:underline"
          >
            Giriş yapın
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RegisterPageContent />
    </GoogleOAuthProvider>
  )
} 