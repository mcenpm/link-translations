'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Linguist {
  id: string
  user: {
    email: string
    firstName: string | null
    lastName: string | null
    phone: string | null
  }
  state?: string | null
  city?: string | null
  defaultRatePerWord?: number | null
  discipline?: string | null
  isActive?: boolean
  isVerified?: boolean
  bio?: string | null
}

export default function AdminLinguistsPage() {
  const [linguists, setLinguists] = useState<Linguist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchLinguists = async () => {
      try {
        const response = await fetch('/api/linguists?limit=1000')
        const data = await response.json()
        setLinguists(Array.isArray(data) ? data : data.data || [])
      } catch (error) {
        console.error('Error fetching linguists:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLinguists()
  }, [])

  const filteredLinguists = linguists.filter((linguist) => {
    const firstName = linguist.user?.firstName || ''
    const email = linguist.user?.email || ''
    const state = linguist.state || ''
    const search = searchTerm.toLowerCase()
    return firstName.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search) ||
      state.toLowerCase().includes(search)
  })

  const paginatedLinguists = filteredLinguists.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredLinguists.length / itemsPerPage)

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Linguists</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add New Linguist
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <input
            type="text"
            placeholder="Search by name, email, or state..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading linguists...</div>
        ) : paginatedLinguists.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No linguists found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rate</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Discipline</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLinguists.map((linguist) => (
                  <tr key={linguist.id} className="border-b hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/linguists/${linguist.id}`}>
                    <td className="px-6 py-4 text-sm text-blue-600 hover:underline font-medium">
                      {linguist.user?.firstName || '-'} {linguist.user?.lastName || ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{linguist.user?.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {linguist.city || '-'}{linguist.city && linguist.state ? ', ' : ''}{linguist.state || ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {linguist.defaultRatePerWord ? (
                        `$${linguist.defaultRatePerWord.toFixed(2)}/word`
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {linguist.discipline || 'BOTH'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link href={`/admin/linguists/${linguist.id}`} className="text-blue-600 hover:text-blue-800 mr-4" onClick={(e) => e.stopPropagation()}>View</Link>
                      <button className="text-red-600 hover:text-red-800" onClick={(e) => e.stopPropagation()}>Deactivate</button>
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
