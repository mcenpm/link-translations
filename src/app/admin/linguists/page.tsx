'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Linguist {
  id: string
  linguistNumber: number | null
  crmId: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  state: string | null
  city: string | null
  country: string | null
  nativeLanguage: string | null
  languages: string[]
  specializations: string[]
  ratePerWord: number | null
  minimumCharge: number | null
  isActive: boolean
  isVerified: boolean
  createdAt: string
  user?: {
    email: string
    firstName: string | null
    lastName: string | null
    phone: string | null
  } | null
}

export default function AdminLinguistsPage() {
  const [linguists, setLinguists] = useState<Linguist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const itemsPerPage = 20

  const fetchLinguists = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/linguists?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      setLinguists(data.data || [])
      setTotalCount(data.pagination?.total || 0)
      setTotalPages(data.pagination?.pages || 0)
    } catch (error) {
      console.error('Error fetching linguists:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm])

  useEffect(() => {
    fetchLinguists()
  }, [fetchLinguists])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchTerm) {
        setSearchTerm(searchInput)
        setCurrentPage(1)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, searchTerm])

  // Helper to get name - check both direct fields and nested user object
  const getName = (linguist: Linguist) => {
    const first = linguist.firstName || linguist.user?.firstName || ''
    const last = linguist.lastName || linguist.user?.lastName || ''
    return `${first} ${last}`.trim() || '-'
  }

  const getEmail = (linguist: Linguist) => {
    return linguist.email || linguist.user?.email || '-'
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Linguists</h1>
          <p className="text-sm text-gray-500 mt-1">Total: {totalCount.toLocaleString()} linguists</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add New Linguist
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <input
            type="text"
            placeholder="Search by name, email, city, or state..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading linguists...</div>
        ) : linguists.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No linguists found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">#</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rate</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {linguists.map((linguist) => (
                  <tr key={linguist.id} className="border-b hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/linguists/${linguist.linguistNumber || linguist.id}`}>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {linguist.linguistNumber || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600 hover:underline font-medium">
                      {getName(linguist)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{getEmail(linguist)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {linguist.city || '-'}{linguist.city && linguist.state ? ', ' : ''}{linguist.state || ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {linguist.ratePerWord ? (
                        `$${linguist.ratePerWord.toFixed(2)}/word`
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className={`px-3 py-1 rounded-full text-xs ${linguist.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {linguist.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link href={`/admin/linguists/${linguist.linguistNumber || linguist.id}`} className="text-blue-600 hover:text-blue-800 mr-4" onClick={(e) => e.stopPropagation()}>View</Link>
                      <button className="text-red-600 hover:text-red-800" onClick={(e) => e.stopPropagation()}>Deactivate</button>
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
              Page {currentPage} of {totalPages}
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
