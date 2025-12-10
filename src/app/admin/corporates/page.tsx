'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, Globe, MapPin, Users, FileText, FolderOpen, Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface Corporate {
  id: string
  customerNumber: number | null
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
  _count: {
    contacts: number
    quotes: number
    projects: number
  }
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export default function CorporatesPage() {
  const [corporates, setCorporates] = useState<Corporate[]>([])
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 50, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchCorporates = async (page = 1, searchQuery = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ 
        page: page.toString(), 
        limit: '50',
        ...(searchQuery && { search: searchQuery })
      })
      const res = await fetch(`/api/corporates?${params}`)
      const data = await res.json()
      setCorporates(data.data || [])
      setPagination(data.pagination || { total: 0, page: 1, limit: 50, pages: 0 })
    } catch (error) {
      console.error('Error fetching corporates:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCorporates(1, search)
  }, [search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const handlePageChange = (newPage: number) => {
    fetchCorporates(newPage, search)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Corporates</h1>
          <p className="text-gray-500 mt-1">Manage corporate accounts imported from CRM</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Total: <span className="font-semibold text-gray-700">{pagination.total.toLocaleString()}</span> corporates
          </span>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by company, city, or country..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">#</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Contacts</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Quotes</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Projects</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading corporates...
                    </div>
                  </td>
                </tr>
              ) : corporates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No corporates found
                  </td>
                </tr>
              ) : (
                corporates.map((corporate) => (
                  <tr key={corporate.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-500">
                        {corporate.customerNumber || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <Link 
                            href={`/admin/corporates/${corporate.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {corporate.company || 'N/A'}
                          </Link>
                          {corporate.website && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Globe className="w-3 h-3" />
                              <a 
                                href={corporate.website.startsWith('http') ? corporate.website : `https://${corporate.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-blue-600"
                              >
                                {corporate.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>
                          {[corporate.billingCity, corporate.billingState, corporate.billingCountry]
                            .filter(Boolean)
                            .join(', ') || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">{corporate._count.contacts}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">{corporate._count.quotes}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FolderOpen className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">{corporate._count.projects}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(corporate.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
