'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, User, Globe, Mail, Phone, MapPin, Award, Calendar, Star, Edit, Check, X } from 'lucide-react'

interface Linguist {
  id: string
  linguistNumber: number | null
  crmId: string | null
  userId: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  dateOfBirth: string | null
  gender: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  bio: string | null
  experience: string | null
  specializations: string[]
  education: string | null
  certifications: string | null
  ratePerWord: number | null
  minimumCharge: number | null
  isActive: boolean
  isVerified: boolean
  verificationDate: string | null
  portfolioUrl: string | null
  languages: string[]
  nativeLanguage: string | null
  totalQuotesCompleted: number
  averageRating: number | null
  createdAt: string
  updatedAt: string
  user?: {
    email: string
    firstName: string | null
    lastName: string | null
    phone: string | null
  } | null
  linguistLanguages: {
    id: string
    level: string
    discipline: string
    ratePerWord: number | null
    minimumCharge: number | null
    yearsOfExperience: number | null
    language: {
      id: string
      code: string
      name: string
    }
  }[]
  assignments: {
    id: string
    status: string
    quote?: {
      quoteNumber: string
      sourceLanguage: string
      targetLanguage: string
    }
  }[]
}

export default function LinguistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [linguist, setLinguist] = useState<Linguist | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLinguist = async () => {
      try {
        const response = await fetch(`/api/linguists/${id}`)
        if (response.ok) {
          const data = await response.json()
          setLinguist(data)
        }
      } catch (error) {
        console.error('Error fetching linguist:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLinguist()
  }, [id])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!linguist) {
    return (
      <div className="p-8">
        <Link href="/admin/linguists" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Linguists
        </Link>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Linguist not found.</p>
        </div>
      </div>
    )
  }

  const fullName = `${linguist.firstName || linguist.user?.firstName || ''} ${linguist.lastName || linguist.user?.lastName || ''}`.trim() || 'Unknown'
  const displayEmail = linguist.email || linguist.user?.email || '-'
  const displayPhone = linguist.phone || linguist.user?.phone || '-'
  const displayInitial = (linguist.firstName?.[0] || linguist.user?.firstName?.[0] || 'L').toUpperCase()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/linguists" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {displayInitial}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-gray-500">{linguist.specializations || 'Translator/Interpreter'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {linguist.isVerified ? (
            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <Check className="w-4 h-4" /> Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              <X className="w-4 h-4" /> Not Verified
            </span>
          )}
          {linguist.isActive ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Active</span>
          ) : (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Inactive</span>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Edit className="w-4 h-4" /> Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Contact Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a href={`mailto:${displayEmail}`} className="text-blue-600 hover:underline">
                    {displayEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{displayPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 col-span-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-900">
                    {[linguist.address, linguist.city, linguist.state, linguist.zipCode, linguist.country]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" /> Languages
            </h2>
            {linguist.linguistLanguages && linguist.linguistLanguages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {linguist.linguistLanguages.map((lang) => (
                  <div key={lang.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{lang.language.name}</h3>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {lang.level}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Discipline: {lang.discipline}</p>
                      {lang.ratePerWord && <p>Rate: ${lang.ratePerWord.toFixed(4)}/word</p>}
                      {lang.yearsOfExperience && <p>Experience: {lang.yearsOfExperience} years</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No languages specified.</p>
            )}
          </div>

          {/* Bio & Education */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" /> Background
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Bio</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {linguist.bio || 'No bio provided.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Education</p>
                  <p className="text-gray-900">{linguist.education || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Years of Experience</p>
                  <p className="text-gray-900">{linguist.experience || '-'} years</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Certifications</p>
                <p className="text-gray-900">{linguist.certifications || 'No certifications listed.'}</p>
              </div>
              {linguist.portfolioUrl && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Portfolio</p>
                  <a 
                    href={linguist.portfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {linguist.portfolioUrl}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Recent Assignments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Assignments</h2>
            {linguist.assignments && linguist.assignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Quote</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Languages</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linguist.assignments.slice(0, 10).map((assignment) => (
                      <tr key={assignment.id} className="border-b">
                        <td className="px-4 py-3 text-sm">
                          {assignment.quote?.quoteNumber || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {assignment.quote ? `${assignment.quote.sourceLanguage} → ${assignment.quote.targetLanguage}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                            {assignment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No assignments yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Projects Completed</span>
                <span className="text-2xl font-bold text-gray-900">{linguist.totalQuotesCompleted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xl font-bold text-gray-900">
                    {linguist.averageRating?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Rates</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Rate per Word</span>
                <span className="text-gray-900 font-medium">
                  ${linguist.ratePerWord?.toFixed(4) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Minimum Charge</span>
                <span className="text-gray-900 font-medium">
                  ${linguist.minimumCharge?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Timeline
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Linguist ID</p>
                <p className="text-gray-900 font-semibold">#{linguist.linguistNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-gray-900">{new Date(linguist.createdAt).toLocaleDateString()}</p>
              </div>
              {linguist.verificationDate && (
                <div>
                  <p className="text-sm text-gray-500">Verified On</p>
                  <p className="text-gray-900">{new Date(linguist.verificationDate).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-gray-900">{new Date(linguist.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Legacy Info */}
          {linguist.crmId && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500">Legacy ID (SugarCRM)</div>
              <div className="text-xs font-mono text-gray-600 truncate">{linguist.crmId}</div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Assign to Project
              </button>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Send Message
              </button>
              {!linguist.isVerified && (
                <button className="w-full px-4 py-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-50">
                  Verify Linguist
                </button>
              )}
              <button className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                {linguist.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
