'use client'

import { useState, useEffect } from 'react'
import { 
  Search, MapPin, Phone, Video, Users, Loader2, 
  Star, CheckCircle, Mail, Globe, Filter
} from 'lucide-react'

interface Language {
  id: string
  name: string
  code: string
}

interface MatchedLinguist {
  id: string
  linguistNumber: number | null
  firstName: string
  lastName: string
  email: string
  phone: string | null
  city: string | null
  state: string | null
  hourlyRate: number | null
  distance: number | null
  languages: {
    sourceLanguage: string
    targetLanguage: string
    level: string
  }[]
  averageRating: number | null
  totalQuotesCompleted: number
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'Washington D.C.' },
]

export default function LinguistMatchingPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<MatchedLinguist[]>([])
  const [searched, setSearched] = useState(false)

  // Search criteria
  const [serviceType, setServiceType] = useState<'ON_SITE' | 'VIDEO' | 'PHONE'>('ON_SITE')
  const [sourceLanguage, setSourceLanguage] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [maxDistance, setMaxDistance] = useState(50)

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await fetch('/api/languages')
        if (res.ok) {
          const data = await res.json()
          setLanguages(data)
        }
      } catch (error) {
        console.error('Failed to fetch languages:', error)
      }
    }
    fetchLanguages()
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch('/api/linguists/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          sourceLanguageId: sourceLanguage || undefined,
          targetLanguageId: targetLanguage || undefined,
          state: state || undefined,
          city: city || undefined,
          maxDistance,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.linguists || [])
      } else {
        console.error('Search failed')
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const formatDistance = (miles: number | null) => {
    if (miles === null) return 'Remote'
    if (miles < 1) return '< 1 mi'
    return `${miles} mi`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Linguist Matching</h1>
        <p className="text-gray-600 mt-1">Find interpreters based on location and language</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Search Criteria</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setServiceType('ON_SITE')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 transition-all ${
                  serviceType === 'ON_SITE'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MapPin className="w-4 h-4" />
                On-Site
              </button>
              <button
                onClick={() => setServiceType('VIDEO')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 transition-all ${
                  serviceType === 'VIDEO'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Video className="w-4 h-4" />
                Video
              </button>
              <button
                onClick={() => setServiceType('PHONE')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 transition-all ${
                  serviceType === 'PHONE'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Phone className="w-4 h-4" />
                Phone
              </button>
            </div>
          </div>

          {/* Source Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Language
            </label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any language</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Language
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any language</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* State (only for on-site) */}
          {serviceType === 'ON_SITE' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select state</option>
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City (Optional)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Los Angeles"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Distance (miles)
                </label>
                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={25}>25 miles</option>
                  <option value={50}>50 miles</option>
                  <option value={75}>75 miles</option>
                  <option value={100}>100 miles</option>
                  <option value={150}>150 miles</option>
                  <option value={200}>200 miles</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSearch}
            disabled={loading || (serviceType === 'ON_SITE' && !state)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Find Linguists
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">
                {loading ? 'Searching...' : `${results.length} Linguist${results.length !== 1 ? 's' : ''} Found`}
              </h2>
            </div>
            {serviceType === 'ON_SITE' && state && (
              <span className="text-sm text-gray-500">
                Within {maxDistance} miles of {US_STATES.find(s => s.code === state)?.name || state}
                {city && `, ${city}`}
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Finding available linguists...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No linguists found matching your criteria</p>
              <p className="text-sm text-gray-500">Try adjusting your search parameters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {results.map((linguist) => (
                <div
                  key={linguist.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
                        {linguist.firstName.charAt(0)}{linguist.lastName.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {linguist.firstName} {linguist.lastName}
                          </h3>
                          {linguist.linguistNumber && (
                            <span className="text-sm text-gray-500">
                              #{linguist.linguistNumber}
                            </span>
                          )}
                          {linguist.averageRating && (
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm font-medium">{linguist.averageRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          {linguist.city && linguist.state && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {linguist.city}, {linguist.state}
                            </span>
                          )}
                          {serviceType === 'ON_SITE' && linguist.distance !== null && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              {formatDistance(linguist.distance)} away
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            {linguist.totalQuotesCompleted} jobs completed
                          </span>
                        </div>

                        {/* Languages */}
                        {linguist.languages.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {linguist.languages.slice(0, 3).map((lang, idx) => (
                              <span
                                key={idx}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                              >
                                <Globe className="w-3 h-3" />
                                {lang.sourceLanguage}
                              </span>
                            ))}
                            {linguist.languages.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{linguist.languages.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {linguist.hourlyRate && (
                        <div className="text-lg font-bold text-gray-900">
                          ${linguist.hourlyRate}/hr
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {linguist.email && (
                          <a
                            href={`mailto:${linguist.email}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        {linguist.phone && (
                          <a
                            href={`tel:${linguist.phone}`}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Call"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Invite to Job
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
