'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  MapPin,
  DollarSign,
  Save,
  CheckCircle,
  Navigation
} from 'lucide-react'

interface LinguistProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  latitude: number | null
  longitude: number | null
  hourlyRate: number | null
  availableForOnSite: boolean
  maxTravelDistance: number | null
}

export default function LinguistSettingsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<LinguistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login/linguist')
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/linguist/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/linguist/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' })
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage({ type: 'error', text: 'Error saving settings' })
    } finally {
      setSaving(false)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' })
      return
    }

    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setProfile(prev => prev ? {
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        } : null)
        setGeoLoading(false)
        setMessage({ type: 'success', text: 'Location updated! Don\'t forget to save.' })
      },
      (error) => {
        setGeoLoading(false)
        setMessage({ type: 'error', text: `Failed to get location: ${error.message}` })
      }
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/linguist/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-blue-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-blue-600" />
              Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={profile.address || ''}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={profile.city || ''}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={profile.state || ''}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={profile.zipCode || ''}
                    onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location & On-Site Settings */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
              <Navigation className="w-5 h-5 text-blue-600" />
              On-Site Interpretation Settings
            </h2>
            
            <div className="space-y-6">
              {/* Availability Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Available for On-Site Jobs</p>
                  <p className="text-sm text-gray-500">Enable to receive on-site interpretation requests</p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, availableForOnSite: !profile.availableForOnSite })}
                  className={`relative w-14 h-7 rounded-full transition ${
                    profile.availableForOnSite ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition ${
                    profile.availableForOnSite ? 'left-8' : 'left-1'
                  }`} />
                </button>
              </div>

              {profile.availableForOnSite && (
                <>
                  {/* Geo Location */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium text-gray-900">Your Location</p>
                        <p className="text-sm text-gray-500">Used to find nearby jobs</p>
                      </div>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={geoLoading}
                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-medium hover:bg-blue-200 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        {geoLoading ? 'Getting...' : 'Use Current Location'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={profile.latitude || ''}
                          onChange={(e) => setProfile({ ...profile, latitude: parseFloat(e.target.value) || null })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="41.0534"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={profile.longitude || ''}
                          onChange={(e) => setProfile({ ...profile, longitude: parseFloat(e.target.value) || null })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="-73.5387"
                        />
                      </div>
                    </div>
                    {profile.latitude && profile.longitude && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Location set: {profile.latitude.toFixed(4)}, {profile.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>

                  {/* Max Travel Distance */}
                  <div className="border-t pt-6">
                    <label className="block font-medium text-gray-900 mb-1">Maximum Travel Distance</label>
                    <p className="text-sm text-gray-500 mb-3">How far are you willing to travel for jobs?</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={profile.maxTravelDistance || 50}
                        onChange={(e) => setProfile({ ...profile, maxTravelDistance: parseInt(e.target.value) || 50 })}
                        min="5"
                        max="500"
                        className="w-24 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-gray-600">miles</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Hourly Rate */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Interpretation Rate
            </h2>
            <div>
              <label className="block font-medium text-gray-900 mb-1">Hourly Rate</label>
              <p className="text-sm text-gray-500 mb-3">Your preferred hourly rate for interpretation jobs</p>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">$</span>
                <input
                  type="number"
                  value={profile.hourlyRate || ''}
                  onChange={(e) => setProfile({ ...profile, hourlyRate: parseFloat(e.target.value) || null })}
                  min="0"
                  step="5"
                  className="w-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50"
                />
                <span className="text-gray-600">/ hour</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
