'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface State {
  id: string
  name: string
  code: string
}

interface Language {
  id: string
  name: string
  code: string | null
}

interface TranslatorSearchFormProps {
  states: State[]
  languages: Language[]
  countMap: Record<string, number>
}

export default function TranslatorSearchForm({ states, languages, countMap }: TranslatorSearchFormProps) {
  const router = useRouter()
  const [selectedState, setSelectedState] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [serviceType, setServiceType] = useState('translation')

  const handleSearch = () => {
    if (selectedState) {
      let url = `/translators/${selectedState.toLowerCase()}`
      const params = new URLSearchParams()
      if (selectedLanguage) params.set('language', selectedLanguage)
      if (serviceType) params.set('type', serviceType)
      if (params.toString()) url += '?' + params.toString()
      router.push(url)
    } else {
      alert('Please select a state')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Search</h2>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <select 
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a state...</option>
              {states.map((state) => (
                <option key={state.id} value={state.code}>
                  {state.name} ({countMap[state.code] || 0})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Languages</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.name}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="type" 
                value="translation" 
                checked={serviceType === 'translation'}
                onChange={(e) => setServiceType(e.target.value)}
                className="mr-2" 
              />
              Translation
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="type" 
                value="interpretation" 
                checked={serviceType === 'interpretation'}
                onChange={(e) => setServiceType(e.target.value)}
                className="mr-2" 
              />
              Interpretation
            </label>
          </div>
        </div>
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Search Translators
        </button>
      </form>
    </div>
  )
}
