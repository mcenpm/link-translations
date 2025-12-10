'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Quote {
  id: string
  quoteNumber: string
  corporate: {
    company: string
    user: { firstName: string | null; lastName: string | null; email: string }
  }
  sourceLanguage?: string[]
  targetLanguage?: string[]
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
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const itemsPerPage = 20

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    try {
      const statusParam = filterStatus ? `&status=${filterStatus}` : ''
      const response = await fetch(`/api/quotes?page=${currentPage}&limit=${itemsPerPage}${statusParam}`)
      const data = await response.json()
      setQuotes(data.data || [])
      setTotalCount(data.pagination?.total || 0)
      setTotalPages(data.pagination?.pages || 0)
    } catch (error) {
      console.error('Error fetching quotes:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, filterStatus])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      REVIEWING: 'bg-yellow-100 text-yellow-800',
      NEGOTIATION: 'bg-blue-100 text-blue-800',
      FOLLOW_UP: 'bg-orange-100 text-orange-800',
      INVOICE_PAID: 'bg-green-100 text-green-800',
      INVOICE_NOT_PAID: 'bg-red-100 text-red-800',
      REJECTED_PRICE: 'bg-red-100 text-red-800',
      REJECTED_OTHER: 'bg-red-100 text-red-800',
      REFUND: 'bg-purple-100 text-purple-800',
      BAD_DEBT: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <p className="text-sm text-gray-500 mt-1">Total: {totalCount.toLocaleString()} quotes</p>
        </div>
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
            <option value="REVIEWING">Reviewing</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="FOLLOW_UP">Follow Up</option>
            <option value="INVOICE_PAID">Invoice Paid</option>
            <option value="INVOICE_NOT_PAID">Invoice Not Paid</option>
            <option value="REJECTED_PRICE">Rejected (Price)</option>
            <option value="REJECTED_OTHER">Rejected (Other)</option>
            <option value="REFUND">Refund</option>
            <option value="BAD_DEBT">Bad Debt</option>
          </select>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading quotes...</div>
        ) : quotes.length === 0 ? (
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
                {quotes.map((quote) => (
                  <tr key={quote.id} className="border-b hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/quotes/${quote.id}`}>
                    <td className="px-6 py-4 text-sm font-mono text-blue-600 hover:underline">{quote.quoteNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{quote.corporate?.company || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {quote.languagePair 
                        ? `${quote.languagePair.sourceLanguage.name} → ${quote.languagePair.targetLanguage.name}` 
                        : (quote.sourceLanguage?.length || quote.targetLanguage?.length)
                          ? `${quote.sourceLanguage?.join(', ') || '-'} → ${quote.targetLanguage?.join(', ') || '-'}`
                          : '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{(quote.wordCount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${(quote.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}>
                        {quote.status.replace(/_/g, ' ')}
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
          <div className="p-6 flex justify-center items-center gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="px-3 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              First
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {currentPage} of {totalPages.toLocaleString()}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Last
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
