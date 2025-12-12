'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  DollarSign, 
  Languages, 
  Loader2,
  Search,
  Filter,
  ChevronDown,
  X,
  Check
} from 'lucide-react'

type ServiceType = 'TRANSLATION' | 'INTERPRETATION' | 'TRANSCRIPTION'
type InterpretationType = 'ON_SITE' | 'VIDEO_REMOTE' | 'PHONE'

interface Language {
  id: string
  code: string
  name: string
}

interface PricingRule {
  id: string
  name: string
  serviceType: ServiceType
  sourceLanguageId: string | null
  targetLanguageId: string | null
  sourceLanguage: Language | null
  targetLanguage: Language | null
  interpretationType: InterpretationType | null
  state: string | null
  perWordRate: number | null
  perHourRate: number | null
  minimumHours: number | null
  travelFee: number | null
  minimumCharge: number | null
  rush24hMultiplier: number | null
  rush48hMultiplier: number | null
  sameDayMultiplier: number | null
  volumeDiscount1kWords: number | null
  volumeDiscount5kWords: number | null
  volumeDiscount10kWords: number | null
  documentTypeLegal: number | null
  documentTypeMedical: number | null
  documentTypeTechnical: number | null
  isDefault: boolean
  isActive: boolean
  priority: number
  createdAt: string
}

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'TRANSLATION', label: 'Translation' },
  { value: 'INTERPRETATION', label: 'Interpretation' },
  { value: 'TRANSCRIPTION', label: 'Transcription' },
]

const INTERPRETATION_TYPES: { value: InterpretationType; label: string }[] = [
  { value: 'ON_SITE', label: 'On-Site (In-Person)' },
  { value: 'VIDEO_REMOTE', label: 'Video Remote' },
  { value: 'PHONE', label: 'Phone' },
]

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

export default function PricingPage() {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null)
  const [filterServiceType, setFilterServiceType] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    serviceType: 'TRANSLATION' as ServiceType,
    sourceLanguageId: '',
    targetLanguageId: '',
    interpretationType: '' as InterpretationType | '',
    state: '',
    perWordRate: '',
    perHourRate: '',
    minimumHours: '',
    travelFee: '',
    minimumCharge: '',
    rush24hMultiplier: '',
    rush48hMultiplier: '',
    sameDayMultiplier: '',
    volumeDiscount1kWords: '',
    volumeDiscount5kWords: '',
    volumeDiscount10kWords: '',
    documentTypeLegal: '',
    documentTypeMedical: '',
    documentTypeTechnical: '',
    isDefault: false,
    isActive: true,
    priority: 0,
  })

  useEffect(() => {
    fetchPricingRules()
    fetchLanguages()
  }, [])

  const fetchPricingRules = async () => {
    try {
      const res = await fetch('/api/pricing')
      const data = await res.json()
      if (data.success) {
        setPricingRules(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch pricing rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLanguages = async () => {
    try {
      const res = await fetch('/api/languages')
      const data = await res.json()
      if (data.success) {
        setLanguages(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error)
    }
  }

  const openCreateModal = () => {
    setEditingRule(null)
    setFormData({
      name: '',
      serviceType: 'TRANSLATION',
      sourceLanguageId: '',
      targetLanguageId: '',
      interpretationType: '',
      state: '',
      perWordRate: '',
      perHourRate: '',
      minimumHours: '',
      travelFee: '',
      minimumCharge: '',
      rush24hMultiplier: '',
      rush48hMultiplier: '',
      sameDayMultiplier: '',
      volumeDiscount1kWords: '',
      volumeDiscount5kWords: '',
      volumeDiscount10kWords: '',
      documentTypeLegal: '',
      documentTypeMedical: '',
      documentTypeTechnical: '',
      isDefault: false,
      isActive: true,
      priority: 0,
    })
    setShowModal(true)
  }

  const openEditModal = (rule: PricingRule) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      serviceType: rule.serviceType,
      sourceLanguageId: rule.sourceLanguageId || '',
      targetLanguageId: rule.targetLanguageId || '',
      interpretationType: rule.interpretationType || '',
      state: rule.state || '',
      perWordRate: rule.perWordRate?.toString() || '',
      perHourRate: rule.perHourRate?.toString() || '',
      minimumHours: rule.minimumHours?.toString() || '',
      travelFee: rule.travelFee?.toString() || '',
      minimumCharge: rule.minimumCharge?.toString() || '',
      rush24hMultiplier: rule.rush24hMultiplier?.toString() || '',
      rush48hMultiplier: rule.rush48hMultiplier?.toString() || '',
      sameDayMultiplier: rule.sameDayMultiplier?.toString() || '',
      volumeDiscount1kWords: rule.volumeDiscount1kWords?.toString() || '',
      volumeDiscount5kWords: rule.volumeDiscount5kWords?.toString() || '',
      volumeDiscount10kWords: rule.volumeDiscount10kWords?.toString() || '',
      documentTypeLegal: rule.documentTypeLegal?.toString() || '',
      documentTypeMedical: rule.documentTypeMedical?.toString() || '',
      documentTypeTechnical: rule.documentTypeTechnical?.toString() || '',
      isDefault: rule.isDefault,
      isActive: rule.isActive,
      priority: rule.priority,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        serviceType: formData.serviceType,
        sourceLanguageId: formData.sourceLanguageId || null,
        targetLanguageId: formData.targetLanguageId || null,
        interpretationType: formData.interpretationType || null,
        state: formData.state || null,
        perWordRate: formData.perWordRate ? parseFloat(formData.perWordRate) : null,
        perHourRate: formData.perHourRate ? parseFloat(formData.perHourRate) : null,
        minimumHours: formData.minimumHours ? parseFloat(formData.minimumHours) : null,
        travelFee: formData.travelFee ? parseFloat(formData.travelFee) : null,
        minimumCharge: formData.minimumCharge ? parseFloat(formData.minimumCharge) : null,
        rush24hMultiplier: formData.rush24hMultiplier ? parseFloat(formData.rush24hMultiplier) : null,
        rush48hMultiplier: formData.rush48hMultiplier ? parseFloat(formData.rush48hMultiplier) : null,
        sameDayMultiplier: formData.sameDayMultiplier ? parseFloat(formData.sameDayMultiplier) : null,
        volumeDiscount1kWords: formData.volumeDiscount1kWords ? parseFloat(formData.volumeDiscount1kWords) : null,
        volumeDiscount5kWords: formData.volumeDiscount5kWords ? parseFloat(formData.volumeDiscount5kWords) : null,
        volumeDiscount10kWords: formData.volumeDiscount10kWords ? parseFloat(formData.volumeDiscount10kWords) : null,
        documentTypeLegal: formData.documentTypeLegal ? parseFloat(formData.documentTypeLegal) : null,
        documentTypeMedical: formData.documentTypeMedical ? parseFloat(formData.documentTypeMedical) : null,
        documentTypeTechnical: formData.documentTypeTechnical ? parseFloat(formData.documentTypeTechnical) : null,
        isDefault: formData.isDefault,
        isActive: formData.isActive,
        priority: formData.priority,
      }

      const url = editingRule ? `/api/pricing/${editingRule.id}` : '/api/pricing'
      const method = editingRule ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        fetchPricingRules()
      } else {
        alert('Failed to save pricing rule')
      }
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save pricing rule')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return

    try {
      const res = await fetch(`/api/pricing/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchPricingRules()
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const filteredRules = pricingRules.filter((rule) => {
    if (filterServiceType && rule.serviceType !== filterServiceType) return false
    if (searchQuery) {
      const search = searchQuery.toLowerCase()
      return (
        rule.name.toLowerCase().includes(search) ||
        rule.sourceLanguage?.name.toLowerCase().includes(search) ||
        rule.targetLanguage?.name.toLowerCase().includes(search) ||
        rule.state?.toLowerCase().includes(search)
      )
    }
    return true
  })

  const formatRate = (value: number | null, prefix = '$', suffix = '') => {
    if (value === null) return '-'
    return `${prefix}${value}${suffix}`
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing Rules</h1>
          <p className="text-gray-500 mt-1">Manage pricing for translation and interpretation services</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pricing/language-pair"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Languages className="w-5 h-5" />
            Language Pair Pricing
          </Link>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Pricing Rule
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search pricing rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterServiceType}
              onChange={(e) => setFilterServiceType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">All Services</option>
              {SERVICE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Pricing Rules Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Languages</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Region</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No pricing rules found</p>
                    <button
                      onClick={openCreateModal}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Create your first pricing rule
                    </button>
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          rule.serviceType === 'TRANSLATION' ? 'bg-blue-100' :
                          rule.serviceType === 'INTERPRETATION' ? 'bg-purple-100' :
                          'bg-green-100'
                        }`}>
                          {rule.serviceType === 'TRANSLATION' ? (
                            <Languages className={`w-5 h-5 text-blue-600`} />
                          ) : (
                            <DollarSign className={`w-5 h-5 ${
                              rule.serviceType === 'INTERPRETATION' ? 'text-purple-600' : 'text-green-600'
                            }`} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{rule.name}</p>
                          {rule.isDefault && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.serviceType === 'TRANSLATION' ? 'bg-blue-100 text-blue-800' :
                        rule.serviceType === 'INTERPRETATION' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rule.serviceType}
                      </span>
                      {rule.interpretationType && (
                        <p className="text-xs text-gray-500 mt-1">
                          {INTERPRETATION_TYPES.find(t => t.value === rule.interpretationType)?.label}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {rule.sourceLanguage && rule.targetLanguage ? (
                        <span className="text-sm text-gray-700">
                          {rule.sourceLanguage.name} → {rule.targetLanguage.name}
                        </span>
                      ) : rule.sourceLanguage ? (
                        <span className="text-sm text-gray-700">From: {rule.sourceLanguage.name}</span>
                      ) : rule.targetLanguage ? (
                        <span className="text-sm text-gray-700">To: {rule.targetLanguage.name}</span>
                      ) : (
                        <span className="text-sm text-gray-400">All languages</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {rule.serviceType === 'TRANSLATION' ? (
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{formatRate(rule.perWordRate, '$', '/word')}</p>
                          {rule.minimumCharge && (
                            <p className="text-gray-500 text-xs">Min: ${rule.minimumCharge}</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{formatRate(rule.perHourRate, '$', '/hr')}</p>
                          {rule.minimumHours && (
                            <p className="text-gray-500 text-xs">Min: {rule.minimumHours}h</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {rule.state ? (
                        <span className="text-sm text-gray-700">
                          {US_STATES.find(s => s.code === rule.state)?.name || rule.state}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">All regions</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(rule)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingRule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Spanish Translation Standard Rate"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SERVICE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {formData.serviceType === 'INTERPRETATION' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interpretation Type</label>
                    <select
                      value={formData.interpretationType}
                      onChange={(e) => setFormData({ ...formData, interpretationType: e.target.value as InterpretationType | '' })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      {INTERPRETATION_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Language Pair */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Language Pair (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source Language</label>
                    <select
                      value={formData.sourceLanguageId}
                      onChange={(e) => setFormData({ ...formData, sourceLanguageId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any Language</option>
                      {languages.map((lang) => (
                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Language</label>
                    <select
                      value={formData.targetLanguageId}
                      onChange={(e) => setFormData({ ...formData, targetLanguageId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any Language</option>
                      {languages.map((lang) => (
                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Regional Pricing */}
              {formData.serviceType === 'INTERPRETATION' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Regional Pricing (Optional)</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">US State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All States</option>
                      {US_STATES.map((state) => (
                        <option key={state.code} value={state.code}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Rates */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Rates</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formData.serviceType === 'TRANSLATION' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Per Word Rate ($)</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={formData.perWordRate}
                          onChange={(e) => setFormData({ ...formData, perWordRate: e.target.value })}
                          placeholder="0.12"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Charge ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.minimumCharge}
                          onChange={(e) => setFormData({ ...formData, minimumCharge: e.target.value })}
                          placeholder="25.00"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Per Hour Rate ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.perHourRate}
                          onChange={(e) => setFormData({ ...formData, perHourRate: e.target.value })}
                          placeholder="75.00"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Hours</label>
                        <input
                          type="number"
                          step="0.5"
                          value={formData.minimumHours}
                          onChange={(e) => setFormData({ ...formData, minimumHours: e.target.value })}
                          placeholder="2"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Travel Fee ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.travelFee}
                          onChange={(e) => setFormData({ ...formData, travelFee: e.target.value })}
                          placeholder="50.00"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Rush Multipliers */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Rush Delivery Multipliers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Same Day (×)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sameDayMultiplier}
                      onChange={(e) => setFormData({ ...formData, sameDayMultiplier: e.target.value })}
                      placeholder="2.00"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">24 Hour (×)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.rush24hMultiplier}
                      onChange={(e) => setFormData({ ...formData, rush24hMultiplier: e.target.value })}
                      placeholder="1.50"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">48 Hour (×)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.rush48hMultiplier}
                      onChange={(e) => setFormData({ ...formData, rush48hMultiplier: e.target.value })}
                      placeholder="1.25"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Volume Discounts (Translation only) */}
              {formData.serviceType === 'TRANSLATION' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Volume Discounts (%)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">1,000+ Words</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.volumeDiscount1kWords}
                        onChange={(e) => setFormData({ ...formData, volumeDiscount1kWords: e.target.value })}
                        placeholder="5"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">5,000+ Words</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.volumeDiscount5kWords}
                        onChange={(e) => setFormData({ ...formData, volumeDiscount5kWords: e.target.value })}
                        placeholder="10"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">10,000+ Words</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.volumeDiscount10kWords}
                        onChange={(e) => setFormData({ ...formData, volumeDiscount10kWords: e.target.value })}
                        placeholder="15"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Document Type Multipliers (Translation only) */}
              {formData.serviceType === 'TRANSLATION' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Document Type Multipliers (×)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Legal Documents</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.documentTypeLegal}
                        onChange={(e) => setFormData({ ...formData, documentTypeLegal: e.target.value })}
                        placeholder="1.25"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medical Documents</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.documentTypeMedical}
                        onChange={(e) => setFormData({ ...formData, documentTypeMedical: e.target.value })}
                        placeholder="1.30"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Technical Documents</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.documentTypeTechnical}
                        onChange={(e) => setFormData({ ...formData, documentTypeTechnical: e.target.value })}
                        placeholder="1.20"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Settings */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Higher = more specific (overrides lower)</p>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Default Rate</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {editingRule ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
