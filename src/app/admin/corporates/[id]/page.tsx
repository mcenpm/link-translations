'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Globe, MapPin, Users, FileText, FolderOpen, Phone, Mail, Calendar, DollarSign } from 'lucide-react'

interface Contact {
  id: string
  contactNumber: number | null
  firstName: string
  lastName: string
  title: string | null
  email: string | null
  phone: string | null
  isPrimary: boolean
}

interface Quote {
  id: string
  quoteNumber: string
  sourceLanguage: string[]
  targetLanguage: string[]
  total: number | null
  status: string
  createdAt: string
}

interface Project {
  id: string
  projectNumber: string
  name: string
  status: string
  createdAt: string
}

interface Stats {
  totalQuotes: number
  totalValue: number
  paidQuotes: number
  paidValue: number
}

interface Corporate {
  id: string
  legacyId: string | null
  company: string
  website: string | null
  industry: string | null
  billingAddress: string | null
  billingCity: string | null
  billingState: string | null
  billingZip: string | null
  billingCountry: string | null
  shippingAddress: string | null
  shippingCity: string | null
  shippingState: string | null
  shippingZip: string | null
  shippingCountry: string | null
  paymentTerms: string | null
  createdAt: string
  contacts: Contact[]
  quotes: Quote[]
  projects: Project[]
  stats?: Stats
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  QUOTE_SENT: 'bg-blue-100 text-blue-700',
  NEGOTIATION_REVIEW: 'bg-yellow-100 text-yellow-700',
  FOLLOW_UP: 'bg-orange-100 text-orange-700',
  INVOICE_PAID: 'bg-green-100 text-green-700',
  INVOICE_NOT_PAID: 'bg-red-100 text-red-700',
  REJECTED_PRICE: 'bg-red-100 text-red-700',
  REJECTED_OTHER: 'bg-red-100 text-red-700',
  REFUND: 'bg-purple-100 text-purple-700',
  BAD_DEBT: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  REMOVED: 'bg-gray-100 text-gray-700',
}

export default function CorporateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [corporate, setCorporate] = useState<Corporate | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'contacts' | 'quotes' | 'projects'>('contacts')

  useEffect(() => {
    const fetchCorporate = async () => {
      try {
        const res = await fetch(`/api/corporates/${resolvedParams.id}`)
        if (res.ok) {
          const data = await res.json()
          setCorporate(data)
        }
      } catch (error) {
        console.error('Error fetching corporate:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCorporate()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!corporate) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Corporate not found</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/corporates" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Corporates
        </Link>
        
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{corporate.company}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-500">
              {corporate.website && (
                <a 
                  href={corporate.website.startsWith('http') ? corporate.website : `https://${corporate.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  <Globe className="w-4 h-4" />
                  {corporate.website}
                </a>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {[corporate.billingCity, corporate.billingState, corporate.billingCountry].filter(Boolean).join(', ') || 'No location'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Since {new Date(corporate.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Legacy Info */}
      {corporate.legacyId && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-8">
          <div className="text-xs text-gray-500">Legacy ID (SugarCRM)</div>
          <div className="text-xs font-mono text-gray-600 truncate">{corporate.legacyId}</div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{corporate.contacts?.length || 0}</p>
              <p className="text-xs text-gray-500">Contacts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{corporate.stats?.totalQuotes || 0}</p>
              <p className="text-xs text-gray-500">Total Quotes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">${(corporate.stats?.totalValue || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">${(corporate.stats?.paidValue || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Paid ({corporate.stats?.paidQuotes || 0} quotes)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-6 py-4 font-medium transition-colors ${activeTab === 'contacts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Contacts ({corporate.contacts?.length || 0})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-6 py-4 font-medium transition-colors ${activeTab === 'quotes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Quotes ({corporate.quotes?.length || 0})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-4 font-medium transition-colors ${activeTab === 'projects' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <span className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Projects ({corporate.projects?.length || 0})
            </span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              {!corporate.contacts?.length ? (
                <p className="text-gray-500 text-center py-8">No contacts found</p>
              ) : (
                <div className="grid gap-4">
                  {corporate.contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-gray-400 w-12">
                          #{contact.contactNumber || '-'}
                        </span>
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-medium">
                            {contact.firstName?.[0]}{contact.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                            {contact.isPrimary && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Primary</span>
                            )}
                          </p>
                          {contact.title && <p className="text-sm text-gray-500">{contact.title}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-blue-600">
                            <Mail className="w-4 h-4" />
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {contact.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quotes' && (
            <div className="space-y-4">
              {!corporate.quotes?.length ? (
                <p className="text-gray-500 text-center py-8">No quotes found</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quote #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Languages</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {corporate.quotes.slice(0, 20).map((quote) => (
                      <tr key={quote.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link href={`/admin/quotes/${quote.id}`} className="font-medium text-blue-600 hover:underline">
                            {quote.quoteNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {quote.sourceLanguage?.join(', ') || '-'} → {quote.targetLanguage?.join(', ') || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[quote.status] || 'bg-gray-100 text-gray-700'}`}>
                            {quote.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {quote.total ? `$${quote.total.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4">
              {!corporate.projects?.length ? (
                <p className="text-gray-500 text-center py-8">No projects found</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {corporate.projects.slice(0, 20).map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link href={`/admin/projects/${project.id}`} className="font-medium text-blue-600 hover:underline">
                            {project.projectNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{project.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[project.status] || 'bg-gray-100 text-gray-700'}`}>
                            {project.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
