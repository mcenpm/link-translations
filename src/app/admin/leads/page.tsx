'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight, Users, Phone, MapPin, ArrowUpRight, Mail, Globe, Eye } from 'lucide-react'

interface Lead {
  id: string
  firstName: string | null
  lastName: string
  email: string | null
  phone: string | null
  phoneMobile: string | null
  phoneWork: string | null
  company: string | null
  title: string | null
  addressCity: string | null
  addressState: string | null
  source: string | null
  status: string
  isConverted: boolean
  createdAt: string
  discipline: string | null
  sourceLanguage: string | null
  targetLanguage: string | null
  leadRanking: string | null
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-yellow-100 text-yellow-700',
  IN_PROCESS: 'bg-purple-100 text-purple-700',
  CONVERTED: 'bg-green-100 text-green-700',
  RECYCLED: 'bg-orange-100 text-orange-700',
  DEAD: 'bg-gray-100 text-gray-700',
}

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 50

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/leads?${params}`)
      const data = await res.json()
      
      setLeads(data.leads || [])
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.total || 0)
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPhone = (lead: Lead) => {
    return lead.phone || lead.phoneMobile || lead.phoneWork || '-'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-600 mt-1">
          {totalCount.toLocaleString()} total leads from LinkCRM
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, company, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROCESS">In Process</option>
              <option value="CONVERTED">Converted</option>
              <option value="RECYCLED">Recycled</option>
              <option value="DEAD">Dead</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Service</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Languages</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Location</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Created</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/leads/${lead.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {lead.firstName} {lead.lastName}
                          </div>
                          {lead.company && (
                            <div className="text-sm text-gray-500">{lead.company}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {lead.email && (
                          <a 
                            href={`mailto:${lead.email}`} 
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
                          >
                            <Mail className="w-4 h-4 text-gray-400" />
                            {lead.email}
                          </a>
                        )}
                        {getPhone(lead) !== '-' && (
                          <a 
                            href={`tel:${getPhone(lead)}`} 
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
                          >
                            <Phone className="w-4 h-4 text-gray-400" />
                            {getPhone(lead)}
                          </a>
                        )}
                        {!lead.email && getPhone(lead) === '-' && (
                          <span className="text-gray-400 text-sm">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.discipline ? (
                        <span className="inline-flex px-2 py-1 rounded bg-blue-50 text-blue-700 text-sm">
                          {lead.discipline}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {lead.sourceLanguage || lead.targetLanguage ? (
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Globe className="w-4 h-4 text-gray-400" />
                          {lead.sourceLanguage || '?'} → {lead.targetLanguage || '?'}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {lead.addressCity || lead.addressState ? (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {[lead.addressCity, lead.addressState].filter(Boolean).join(', ')}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColors[lead.status] || 'bg-gray-100 text-gray-700'}`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                      {lead.isConverted && (
                        <ArrowUpRight className="inline-block w-4 h-4 ml-1 text-green-600" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/leads/${lead.id}`)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {totalCount.toLocaleString()} leads
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
