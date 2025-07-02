'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  value = {},
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
    } else {
      setDistricts([])
      setNeighborhoods([])
    }
  }, [value.province_id])

  // Load neighborhoods when district changes
  useEffect(() => {
    if (value.district_id && showNeighborhood) {
      loadNeighborhoods(value.district_id)
    } else {
      setNeighborhoods([])
    }
  }, [value.district_id, showNeighborhood])

  const loadProvinces = async () => {
    try {
      setIsLoadingProvinces(true)
      // Using API to get correct database IDs (not JSON API_IDs)
      const response = await fetch('/api/provinces/')
      const data = await response.json()
      const provincesArray = Array.isArray(data) ? data : data?.results || []
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
      // Using nested API endpoint to get correct database IDs
      const response = await fetch(`/api/provinces/${provinceId}/districts/`)
      const data = await response.json()
      setDistricts(data)
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
      // Using nested API endpoint to get correct database IDs
      const response = await fetch(`/api/districts/${districtId}/neighborhoods/`)
      const data = await response.json()
      setNeighborhoods(data)
    } catch (error) {
      console.error('Error loading neighborhoods:', error)
      toast.error('Mahalleler yüklenirken hata oluştu')
    } finally {
      setIsLoadingNeighborhoods(false)
    }
  }

  const handleProvinceChange = useCallback((provinceId: string) => {
    const newProvinceId = provinceId ? parseInt(provinceId) : undefined
    onChange({
      province_id: newProvinceId,
      district_id: undefined,
      neighborhood_id: undefined
    })
  }, [onChange])

  const handleDistrictChange = useCallback((districtId: string) => {
    const newDistrictId = districtId ? parseInt(districtId) : undefined
    onChange({
      ...value,
      district_id: newDistrictId,
      neighborhood_id: undefined
    })
  }, [onChange, value])

  const handleNeighborhoodChange = useCallback((neighborhoodId: string) => {
    const newNeighborhoodId = neighborhoodId ? parseInt(neighborhoodId) : undefined
    onChange({
      ...value,
      neighborhood_id: newNeighborhoodId
    })
  }, [onChange, value])

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
        <MapPinIcon className="w-4 h-4 text-blue-400" />
        <span>Konum Seçimi {required && <span className="text-red-400">*</span>}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Province Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            İl {required && <span className="text-red-400">*</span>}
          </label>
          <div className="relative">
            <select
              value={value.province_id || ''}
              onChange={(e) => handleProvinceChange(e.target.value)}
              disabled={disabled || isLoadingProvinces}
              className="w-full bg-gray-800/60 border border-gray-600/40 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          <label className="block text-sm font-medium text-gray-300 mb-1">
            İlçe {required && <span className="text-red-400">*</span>}
          </label>
          <div className="relative">
            <select
              value={value.district_id || ''}
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={disabled || !value.province_id || isLoadingDistricts}
              className="w-full bg-gray-800/60 border border-gray-600/40 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Mahalle
            </label>
            <div className="relative">
              <select
                value={value.neighborhood_id || ''}
                onChange={(e) => handleNeighborhoodChange(e.target.value)}
                disabled={disabled || !value.district_id || isLoadingNeighborhoods}
                className="w-full bg-gray-800/60 border border-gray-600/40 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700/40 rounded-lg">
          <p className="text-sm text-blue-200">
            <span className="font-medium">Seçilen Konum:</span>{' '}
            {neighborhoods.find(n => n.id === value.neighborhood_id)?.name ||
             districts.find(d => d.id === value.district_id)?.name ||
             provinces.find(p => p.id === value.province_id)?.name ||
             'Konum seçiliyor...'}
            {value.neighborhood_id && neighborhoods.find(n => n.id === value.neighborhood_id) && (
              <span className="text-blue-300">
                {' '} → {neighborhoods.find(n => n.id === value.neighborhood_id)?.district_name}
                {' '} → {neighborhoods.find(n => n.id === value.neighborhood_id)?.province_name}
              </span>
            )}
            {!value.neighborhood_id && value.district_id && districts.find(d => d.id === value.district_id) && (
              <span className="text-blue-300">
                {' '} → {districts.find(d => d.id === value.district_id)?.province_name}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
} 