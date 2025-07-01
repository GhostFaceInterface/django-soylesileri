'use client'

import React, { useState, useEffect } from 'react'
import { authService } from '@/lib/services/auth'
import type { Province, District, Neighborhood, LocationSelection } from '@/types'
import { ChevronDownIcon, MapPinIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface LocationSelectorProps {
  value: LocationSelection
  onChange: (location: LocationSelection) => void
  required?: boolean
  disabled?: boolean
  placeholder?: {
    province?: string
    district?: string
    neighborhood?: string
  }
  showNeighborhood?: boolean // Mahalle seçimi opsiyonel olsun
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = {
    province: 'İl Seçiniz',
    district: 'İlçe Seçiniz', 
    neighborhood: 'Mahalle Seçiniz'
  },
  showNeighborhood = true
}) => {
  // State
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  
  // Loading states
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false)
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false)
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false)

  // Load provinces on mount
  useEffect(() => {
    loadProvinces()
  }, [])

  // Load districts when province changes
  useEffect(() => {
    if (value.province_id) {
      loadDistricts(value.province_id)
      // Clear district and neighborhood if province changed
      if (value.district_id || value.neighborhood_id) {
        onChange({
          province_id: value.province_id,
          district_id: undefined,
          neighborhood_id: undefined
        })
      }
    } else {
      setDistricts([])
      setNeighborhoods([])
    }
  }, [value.province_id])

  // Load neighborhoods when district changes
  useEffect(() => {
    if (value.district_id && showNeighborhood) {
      loadNeighborhoods(value.district_id)
      // Clear neighborhood if district changed
      if (value.neighborhood_id) {
        onChange({
          ...value,
          neighborhood_id: undefined
        })
      }
    } else {
      setNeighborhoods([])
    }
  }, [value.district_id, showNeighborhood])

  const loadProvinces = async () => {
    try {
      setIsLoadingProvinces(true)
      const response = await authService.getProvinces()
      const provincesArray = Array.isArray(response) ? response : response?.results || []
      setProvinces(provincesArray)
    } catch (error) {
      console.error('Error loading provinces:', error)
      toast.error('İller yüklenirken hata oluştu')
    } finally {
      setIsLoadingProvinces(false)
    }
  }

  const loadDistricts = async (provinceId: number) => {
    try {
      setIsLoadingDistricts(true)
      const response = await authService.getDistrictsByProvince(provinceId)
      const districtsArray = Array.isArray(response) ? response : response?.results || []
      setDistricts(districtsArray)
    } catch (error) {
      console.error('Error loading districts:', error)
      toast.error('İlçeler yüklenirken hata oluştu')
    } finally {
      setIsLoadingDistricts(false)
    }
  }

  const loadNeighborhoods = async (districtId: number) => {
    try {
      setIsLoadingNeighborhoods(true)
      const response = await authService.getNeighborhoodsByDistrict(districtId)
      const neighborhoodsArray = Array.isArray(response) ? response : response?.results || []
      setNeighborhoods(neighborhoodsArray)
    } catch (error) {
      console.error('Error loading neighborhoods:', error)
      toast.error('Mahalleler yüklenirken hata oluştu')
    } finally {
      setIsLoadingNeighborhoods(false)
    }
  }

  const handleProvinceChange = (provinceId: string) => {
    const newProvinceId = provinceId ? parseInt(provinceId) : undefined
    onChange({
      province_id: newProvinceId,
      district_id: undefined,
      neighborhood_id: undefined
    })
  }

  const handleDistrictChange = (districtId: string) => {
    const newDistrictId = districtId ? parseInt(districtId) : undefined
    onChange({
      ...value,
      district_id: newDistrictId,
      neighborhood_id: undefined
    })
  }

  const handleNeighborhoodChange = (neighborhoodId: string) => {
    const newNeighborhoodId = neighborhoodId ? parseInt(neighborhoodId) : undefined
    onChange({
      ...value,
      neighborhood_id: newNeighborhoodId
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
        <MapPinIcon className="w-4 h-4 text-blue-600" />
        <span>Konum Seçimi {required && <span className="text-red-500">*</span>}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Province Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            İl {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <select
              value={value.province_id || ''}
              onChange={(e) => handleProvinceChange(e.target.value)}
              disabled={disabled || isLoadingProvinces}
              className="w-full bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{placeholder.province}</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            {isLoadingProvinces && (
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* District Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            İlçe {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <select
              value={value.district_id || ''}
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={disabled || !value.province_id || isLoadingDistricts}
              className="w-full bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{placeholder.district}</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            {isLoadingDistricts && (
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Neighborhood Selection */}
        {showNeighborhood && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Mahalle
            </label>
            <div className="relative">
              <select
                value={value.neighborhood_id || ''}
                onChange={(e) => handleNeighborhoodChange(e.target.value)}
                disabled={disabled || !value.district_id || isLoadingNeighborhoods}
                className="w-full bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{placeholder.neighborhood}</option>
                {neighborhoods.map((neighborhood) => (
                  <option key={neighborhood.id} value={neighborhood.id}>
                    {neighborhood.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              {isLoadingNeighborhoods && (
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {(value.province_id || value.district_id || value.neighborhood_id) && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Seçilen Konum:</span>{' '}
            {neighborhoods.find(n => n.id === value.neighborhood_id)?.name ||
             districts.find(d => d.id === value.district_id)?.name ||
             provinces.find(p => p.id === value.province_id)?.name ||
             'Konum seçiliyor...'}
            {value.neighborhood_id && neighborhoods.find(n => n.id === value.neighborhood_id) && (
              <span className="text-blue-600">
                {' '} → {neighborhoods.find(n => n.id === value.neighborhood_id)?.district_name}
                {' '} → {neighborhoods.find(n => n.id === value.neighborhood_id)?.province_name}
              </span>
            )}
            {!value.neighborhood_id && value.district_id && districts.find(d => d.id === value.district_id) && (
              <span className="text-blue-600">
                {' '} → {districts.find(d => d.id === value.district_id)?.province_name}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
} 