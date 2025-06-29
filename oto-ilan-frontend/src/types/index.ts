// User types
export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone_number?: string
  profile_photo?: string
  bio?: string
  is_seller: boolean
  is_email_verified: boolean
  date_joined: string
  updated_at?: string
}

export interface UserRegistration {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
  phone_number?: string
  is_seller?: boolean
}

export interface RegisterData {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
  phone_number?: string
  is_seller?: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginData {
  username: string
  password: string
}

export interface EmailLoginData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface GoogleOAuthResponse {
  access_token: string
  user: User
}

// Car types
export interface CarBrand {
  id: number
  name: string
}

export interface CarModel {
  id: number
  name: string
  brand: CarBrand
}

export interface CarVariant {
  id: number
  name: string
  car: CarModel
}

export interface CarTrim {
  id: number
  name: string
  variant: CarVariant
}

export interface Car {
  id: number
  brand: CarBrand
  model: CarModel
  variant?: CarVariant
  trim?: CarTrim
  year: number
  mileage: number
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid'
  transmission: 'manual' | 'automatic'
  color: string
  body_type: string
  engine_power: number
}

// Location types
export interface City {
  id: number
  name: string
}

// Listing Image types
export interface ListingImage {
  id: number
  listing: number
  image: string
  order: number
  is_primary: boolean
  thumbnail_url: string
  original_url: string
  file_size?: number
  file_size_mb?: number
  dimensions?: string
  uploaded_at: string
}

// Listing types
export interface Listing {
  id: number
  user: User
  car: Car
  title: string
  description: string
  price: number
  city?: City
  is_active: boolean
  created_at: string
  updated_at: string
  images: ListingImage[]
  primary_image?: ListingImage
  image_count: number
}

export interface ListingCreate {
  car_id: number
  title: string
  description: string
  price: number
  city_id?: number
}

export interface ListingFilters {
  min_price?: number
  max_price?: number
  min_mileage?: number
  max_mileage?: number
  min_year?: number
  max_year?: number
  fuel_type?: string[]
  transmission?: string[]
  color?: string
  min_engine_power?: number
  max_engine_power?: number
  city?: number[]
  brand?: number[]
  title_search?: string
  description_search?: string
  ordering?: string
}

// Message types
export interface Message {
  id: number
  sender: User
  receiver: User
  text: string
  is_read: boolean
  timestamp: string
}

export interface MessageCreate {
  receiver_id: number
  text: string
}

export interface Conversation {
  contact: User
  last_message: {
    id: number
    text: string
    timestamp: string
    sender_id: number
  }
  unread_count: number
}

// Dashboard types
export interface DashboardStats {
  total_listings: number
  active_listings: number
  inactive_listings: number
  total_messages_sent: number
  total_messages_received: number
  unread_messages: number
}

export interface Dashboard {
  user: User
  stats: DashboardStats
  recent_listings: Listing[]
  recent_messages: Message[]
}

// API Response types
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  detail?: string
  non_field_errors?: string[]
  [key: string]: any
}

// Form types
export interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
}

export interface PasswordResetData {
  email: string
}

// Search types
export interface SearchParams {
  q?: string
  brand?: string
  model?: string
  min_price?: number
  max_price?: number
  city?: string
  fuel_type?: string
  transmission?: string
  sort?: string
  page?: number
}

// Common types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface Option {
  value: string | number
  label: string
}

export interface FileUpload {
  file: File
  preview: string
  id?: string
} 