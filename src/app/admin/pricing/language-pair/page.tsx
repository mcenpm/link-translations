'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  MapPin,
  Phone,
  Video,
  Users,
  AlertCircle,
  Check,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'

interface Language {
  id: string
  code: string
  name: string
}

interface StateOverride {
  state: string
  perHourRate: string
  minimumHours: string
  travelFee: string
}

interface PricingData {
  // Translation
  translation: {
    perWordRate: string
    minimumCharge: string
    rush24hMultiplier: string
    rush48hMultiplier: string
  }
  // Interpretation - base rates (same for all states by default)
  interpretation: {
    onSite: {
      perHourRate: string
      minimumHours: string
      travelFee: string
      stateOverrides: StateOverride[]
    }
    videoRemote: {
      perHourRate: string
      minimumHours: string
    }
    phone: {
      perHourRate: string
      minimumHours: string
    }
  }
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'Washington D.C.' },
]

const defaultPricing: PricingData = {
  translation: {
    perWordRate: '',
    minimumCharge: '',
    rush24hMultiplier: '1.5',
    rush48hMultiplier: '1.25',
  },
  interpretation: {
    onSite: {
      perHourRate: '',
      minimumHours: '2',
      travelFee: '',
      stateOverrides: [],
    },
    videoRemote: {
      perHourRate: '',
      minimumHours: '1',
    },
    phone: {
      perHourRate: '',
      minimumHours: '1',
    },
  },
}

export default function LanguagePairPricingPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [sourceLanguageId, setSourceLanguageId] = useState('')
  const [targetLanguageId, setTargetLanguageId] = useState('')
  const [pricing, setPricing] = useState<PricingData>(defaultPricing)
  
  const [activeTab, setActiveTab] = useState<'translation' | 'interpretation'>('interpretation')
  const [showStateOverrideModal, setShowStateOverrideModal] = useState(false)
  const [newOverride, setNewOverride] = useState<StateOverride>({
    state: '',
    perHourRate: '',
    minimumHours: '',
    travelFee: '',
  })

  useEffect(() => {
    fetchLanguages()
  }, [])

  const fetchLanguages = async () => {
    try {
      const res = await fetch('/api/languages')
      const data = await res.json()
      if (data.success) {
        setLanguages(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingPricing = useCallback(async () => {
    if (!sourceLanguageId || !targetLanguageId) return
    
    try {
      const res = await fetch(`/api/pricing/language-pair?source=${sourceLanguageId}&target=${targetLanguageId}`)
      const data = await res.json()
      
      if (data.success && data.data) {
        // Map existing pricing rules to our form
        const rules = data.data
        const newPricing = { ...defaultPricing }
        
        rules.forEach((rule: {
          serviceType: string
          interpretationType: string | null
          state: string | null
          perWordRate: number | null
          perHourRate: number | null
          minimumHours: number | null
          minimumCharge: number | null
          travelFee: number | null
          rush24hMultiplier: number | null
          rush48hMultiplier: number | null
        }) => {
          if (rule.serviceType === 'TRANSLATION') {
            newPricing.translation.perWordRate = rule.perWordRate?.toString() || ''
            newPricing.translation.minimumCharge = rule.minimumCharge?.toString() || ''
            newPricing.translation.rush24hMultiplier = rule.rush24hMultiplier?.toString() || '1.5'
            newPricing.translation.rush48hMultiplier = rule.rush48hMultiplier?.toString() || '1.25'
          } else if (rule.serviceType === 'INTERPRETATION') {
            if (rule.interpretationType === 'ON_SITE') {
              if (rule.state) {
                // This is a state override
                const existingOverrides = newPricing.interpretation.onSite.stateOverrides
                existingOverrides.push({
                  state: rule.state,
                  perHourRate: rule.perHourRate?.toString() || '',
                  minimumHours: rule.minimumHours?.toString() || '',
                  travelFee: rule.travelFee?.toString() || '',
                })
              } else {
                // Base rate
                newPricing.interpretation.onSite.perHourRate = rule.perHourRate?.toString() || ''
                newPricing.interpretation.onSite.minimumHours = rule.minimumHours?.toString() || '2'
                newPricing.interpretation.onSite.travelFee = rule.travelFee?.toString() || ''
              }
            } else if (rule.interpretationType === 'VIDEO_REMOTE') {
              newPricing.interpretation.videoRemote.perHourRate = rule.perHourRate?.toString() || ''
              newPricing.interpretation.videoRemote.minimumHours = rule.minimumHours?.toString() || '1'
            } else if (rule.interpretationType === 'PHONE') {
              newPricing.interpretation.phone.perHourRate = rule.perHourRate?.toString() || ''
              newPricing.interpretation.phone.minimumHours = rule.minimumHours?.toString() || '1'
            }
          }
        })
        
        setPricing(newPricing)
      } else {
        setPricing(defaultPricing)
      }
    } catch (error) {
      console.error('Failed to fetch existing pricing:', error)
    }
  }, [sourceLanguageId, targetLanguageId])

  useEffect(() => {
    fetchExistingPricing()
  }, [fetchExistingPricing])

  const addStateOverride = () => {
    if (!newOverride.state) return
    
    // Check if state already exists
    const exists = pricing.interpretation.onSite.stateOverrides.some(
      o => o.state === newOverride.state
    )
    if (exists) {
      alert('This state already has an override')
      return
    }
    
    setPricing(prev => ({
      ...prev,
      interpretation: {
        ...prev.interpretation,
        onSite: {
          ...prev.interpretation.onSite,
          stateOverrides: [...prev.interpretation.onSite.stateOverrides, { ...newOverride }],
        },
      },
    }))
    
    setNewOverride({ state: '', perHourRate: '', minimumHours: '', travelFee: '' })
    setShowStateOverrideModal(false)
  }

  const removeStateOverride = (state: string) => {
    setPricing(prev => ({
      ...prev,
      interpretation: {
        ...prev.interpretation,
        onSite: {
          ...prev.interpretation.onSite,
          stateOverrides: prev.interpretation.onSite.stateOverrides.filter(o => o.state !== state),
        },
      },
    }))
  }

  const updateStateOverride = (state: string, field: keyof StateOverride, value: string) => {
    setPricing(prev => ({
      ...prev,
      interpretation: {
        ...prev.interpretation,
        onSite: {
          ...prev.interpretation.onSite,
          stateOverrides: prev.interpretation.onSite.stateOverrides.map(o =>
            o.state === state ? { ...o, [field]: value } : o
          ),
        },
      },
    }))
  }

  const handleSave = async () => {
    if (!sourceLanguageId || !targetLanguageId) {
      alert('Please select both source and target languages')
      return
    }
    
    setSaving(true)
    setSaved(false)
    
    try {
      const res = await fetch('/api/pricing/language-pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLanguageId,
          targetLanguageId,
          pricing,
        }),
      })
      
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert('Failed to save pricing: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save pricing')
    } finally {
      setSaving(false)
    }
  }

  const getStateName = (code: string) => {
    return US_STATES.find(s => s.code === code)?.name || code
  }

  const availableStatesForOverride = US_STATES.filter(
    s => !pricing.interpretation.onSite.stateOverrides.some(o => o.state === s.code)
  )

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/pricing"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Language Pair Pricing</h1>
          <p className="text-gray-500 mt-1">Set pricing for a specific language pair</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !sourceLanguageId || !targetLanguageId}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-lg transition-colors"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : saved ? (
            <Check className="w-5 h-5" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Pricing'}
        </button>
      </div>

      {/* Language Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Language Pair</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Language
            </label>
            <div className="relative">
              <select
                value={sourceLanguageId}
                onChange={(e) => setSourceLanguageId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">Select source language...</option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Language
            </label>
            <div className="relative">
              <select
                value={targetLanguageId}
                onChange={(e) => setTargetLanguageId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">Select target language...</option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Service Type Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab('translation')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'translation'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Translation
            </button>
            <button
              onClick={() => setActiveTab('interpretation')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'interpretation'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Interpretation
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Translation Tab */}
          {activeTab === 'translation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per Word Rate
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={pricing.translation.perWordRate}
                      onChange={(e) => setPricing(prev => ({
                        ...prev,
                        translation: { ...prev.translation, perWordRate: e.target.value }
                      }))}
                      placeholder="0.12"
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Charge
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={pricing.translation.minimumCharge}
                      onChange={(e) => setPricing(prev => ({
                        ...prev,
                        translation: { ...prev.translation, minimumCharge: e.target.value }
                      }))}
                      placeholder="25.00"
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Rush Multipliers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      24-Hour Rush (multiplier)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={pricing.translation.rush24hMultiplier}
                      onChange={(e) => setPricing(prev => ({
                        ...prev,
                        translation: { ...prev.translation, rush24hMultiplier: e.target.value }
                      }))}
                      placeholder="1.5"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">e.g., 1.5 = 50% extra</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      48-Hour Rush (multiplier)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={pricing.translation.rush48hMultiplier}
                      onChange={(e) => setPricing(prev => ({
                        ...prev,
                        translation: { ...prev.translation, rush48hMultiplier: e.target.value }
                      }))}
                      placeholder="1.25"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">e.g., 1.25 = 25% extra</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interpretation Tab */}
          {activeTab === 'interpretation' && (
            <div className="space-y-8">
              {/* Video Remote */}
              <div className="bg-purple-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Video className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Video Remote</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Per Hour Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.interpretation.videoRemote.perHourRate}
                        onChange={(e) => setPricing(prev => ({
                          ...prev,
                          interpretation: {
                            ...prev.interpretation,
                            videoRemote: { ...prev.interpretation.videoRemote, perHourRate: e.target.value }
                          }
                        }))}
                        placeholder="75.00"
                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={pricing.interpretation.videoRemote.minimumHours}
                      onChange={(e) => setPricing(prev => ({
                        ...prev,
                        interpretation: {
                          ...prev.interpretation,
                          videoRemote: { ...prev.interpretation.videoRemote, minimumHours: e.target.value }
                        }
                      }))}
                      placeholder="1"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-green-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Per Hour Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={pricing.interpretation.phone.perHourRate}
                        onChange={(e) => setPricing(prev => ({
                          ...prev,
                          interpretation: {
                            ...prev.interpretation,
                            phone: { ...prev.interpretation.phone, perHourRate: e.target.value }
                          }
                        }))}
                        placeholder="65.00"
                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={pricing.interpretation.phone.minimumHours}
                      onChange={(e) => setPricing(prev => ({
                        ...prev,
                        interpretation: {
                          ...prev.interpretation,
                          phone: { ...prev.interpretation.phone, minimumHours: e.target.value }
                        }
                      }))}
                      placeholder="1"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* On-Site (In-Person) */}
              <div className="bg-orange-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">On-Site (In-Person)</h3>
                </div>

                {/* Base Rate - Same for all states */}
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Base Rate (Same for all states)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Per Hour Rate
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={pricing.interpretation.onSite.perHourRate}
                          onChange={(e) => setPricing(prev => ({
                            ...prev,
                            interpretation: {
                              ...prev.interpretation,
                              onSite: { ...prev.interpretation.onSite, perHourRate: e.target.value }
                            }
                          }))}
                          placeholder="95.00"
                          className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Minimum Hours
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={pricing.interpretation.onSite.minimumHours}
                        onChange={(e) => setPricing(prev => ({
                          ...prev,
                          interpretation: {
                            ...prev.interpretation,
                            onSite: { ...prev.interpretation.onSite, minimumHours: e.target.value }
                          }
                        }))}
                        placeholder="2"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Travel Fee
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={pricing.interpretation.onSite.travelFee}
                          onChange={(e) => setPricing(prev => ({
                            ...prev,
                            interpretation: {
                              ...prev.interpretation,
                              onSite: { ...prev.interpretation.onSite, travelFee: e.target.value }
                            }
                          }))}
                          placeholder="50.00"
                          className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* State Overrides */}
                <div className="border-t border-orange-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">State-Specific Overrides</span>
                    </div>
                    <button
                      onClick={() => setShowStateOverrideModal(true)}
                      className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add State Override
                    </button>
                  </div>

                  {pricing.interpretation.onSite.stateOverrides.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No state overrides. Base rate applies to all states.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {pricing.interpretation.onSite.stateOverrides.map((override) => (
                        <div 
                          key={override.state}
                          className="bg-white rounded-lg p-3 flex items-center gap-4"
                        >
                          <div className="w-24">
                            <span className="font-medium text-gray-900">{override.state}</span>
                            <span className="text-xs text-gray-500 block">{getStateName(override.state)}</span>
                          </div>
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">$/hour</label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={override.perHourRate}
                                  onChange={(e) => updateStateOverride(override.state, 'perHourRate', e.target.value)}
                                  className="w-full pl-5 pr-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Min hrs</label>
                              <input
                                type="number"
                                step="0.5"
                                value={override.minimumHours}
                                onChange={(e) => updateStateOverride(override.state, 'minimumHours', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Travel</label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={override.travelFee}
                                  onChange={(e) => updateStateOverride(override.state, 'travelFee', e.target.value)}
                                  className="w-full pl-5 pr-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeStateOverride(override.state)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* State Override Modal */}
      {showStateOverrideModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add State Override</h3>
              <button
                onClick={() => setShowStateOverrideModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select State
                </label>
                <select
                  value={newOverride.state}
                  onChange={(e) => setNewOverride(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Choose a state...</option>
                  {availableStatesForOverride.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name} ({state.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    $/Hour
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOverride.perHourRate}
                    onChange={(e) => setNewOverride(prev => ({ ...prev, perHourRate: e.target.value }))}
                    placeholder="95"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newOverride.minimumHours}
                    onChange={(e) => setNewOverride(prev => ({ ...prev, minimumHours: e.target.value }))}
                    placeholder="2"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travel Fee
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOverride.travelFee}
                    onChange={(e) => setNewOverride(prev => ({ ...prev, travelFee: e.target.value }))}
                    placeholder="50"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Leave fields empty to inherit from base rate
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowStateOverrideModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addStateOverride}
                disabled={!newOverride.state}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              >
                Add Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
