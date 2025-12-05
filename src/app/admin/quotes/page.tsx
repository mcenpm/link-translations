'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Quote {
  id: string
  quoteNumber: string
  customer: {
    company: string
    user: { firstName: string | null; lastName: string | null; email: string }
  }
  sourceLanguage?: string
  targetLanguage?: string
  languagePair?: {
    sourceLanguage: { name: string; code: string }
    targetLanguage: { name: string; code: string }
  } | null
  wordCount: number | null
  total: number | null
  status: string
  createdAt: string
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch('/api/quotes?limit=1000')
        const data = await response.json()
        setQuotes(Array.isArray(data) ? data : data.data || [])
      } catch (error) {
        console.error('Error fetching quotes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuotes()
  }, [])

  const filteredQuotes = filterStatus
    ? quotes.filter((quote) => quote.status === filterStatus)
    : quotes

  const paginatedQuotes = filteredQuotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-yellow-100 text-yellow-800',
      REVIEWED: 'bg-blue-100 text-blue-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      PAID: 'bg-emerald-100 text-emerald-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Create New Quote
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="PAID">Paid</option>
          </select>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading quotes...</div>
        ) : paginatedQuotes.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No quotes found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quote #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Language Pair</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Words</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedQuotes.map((quote) => (
                  <tr key={quote.id} className="border-b hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/quotes/${quote.id}`}>
                    <td className="px-6 py-4 text-sm font-mono text-blue-600 hover:underline">{quote.quoteNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{quote.customer?.company || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {quote.languagePair ? `${quote.languagePair.sourceLanguage.name} → ${quote.languagePair.targetLanguage.name}` : `${quote.sourceLanguage || '-'} → ${quote.targetLanguage || '-'}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{(quote.wordCount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${(quote.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link href={`/admin/quotes/${quote.id}`} className="text-blue-600 hover:text-blue-800 mr-4" onClick={(e) => e.stopPropagation()}>View</Link>
                      <button className="text-green-600 hover:text-green-800" onClick={(e) => e.stopPropagation()}>Assign</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-6 flex justify-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
