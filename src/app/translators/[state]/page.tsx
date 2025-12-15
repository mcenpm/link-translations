'use client'

import { useSearchParams, useParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { MapPin, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Linguist {
  id: string
  user: {
    firstName: string
    email: string
  }
  state?: string
  city?: string
  defaultRatePerWord?: number
  averageRating?: number
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

function TranslatorsContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const [linguists, setLinguists] = useState<Linguist[]>([])
  const [loading, setLoading] = useState(true)

  const state = (params.state as string)?.toUpperCase() || ''
  const language = searchParams.get('language')
  const type = searchParams.get('type') || 'translation'

  useEffect(() => {
    const fetchLinguists = async () => {
      try {
        const query = new URLSearchParams({
          state,
          ...(language && { language }),
          ...(type && { discipline: type === 'interpretation' ? 'INTERPRETATION' : 'TRANSLATION' }),
        })
        
        const response = await fetch(`/api/linguists?${query}`)
        const data = await response.json()
        setLinguists(data.data || [])
      } catch (error) {
        console.error('Error fetching linguists:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLinguists()
  }, [state, language, type])

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-6 relative">
          <Link 
            href="/translators" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All States
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              {type === 'interpretation' ? 'Interpreters' : 'Translators'} in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{state}</span>
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Find professional {type === 'interpretation' ? 'interpreters' : 'translators'} in {state}
            {language && ` for ${language}`}
          </p>
        </div>
      </section>

      <main className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading translators...</p>
          </div>
        ) : linguists.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-lg text-gray-600 mb-6">
              No translators found for your search criteria.
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {linguists.map((linguist) => (
              <div key={linguist.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {linguist.user.firstName}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {linguist.city}, {linguist.state}
                  </p>
                </div>
                
                {linguist.averageRating && (
                  <div className="flex items-center mb-4">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm text-gray-600">
                      {linguist.averageRating.toFixed(1)} rating
                    </span>
                  </div>
                )}

                {linguist.defaultRatePerWord && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <p className="text-sm text-gray-600">Rate</p>
                    <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      ${linguist.defaultRatePerWord.toFixed(2)}/word
                    </p>
                  </div>
                )}

                <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
                  Request Quote
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function TranslatorsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TranslatorsContent />
    </Suspense>
  )
}
