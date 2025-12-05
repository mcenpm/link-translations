'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  title: string | null
  isPrimary: boolean
  customer: {
    id: string
    company: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function AdminCustomersPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchContacts = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ 
        page: page.toString(), 
        limit: '50',
        ...(search && { search })
      })
      const response = await fetch(`/api/contacts?${params}`)
      const data = await response.json()
      setContacts(data.data || [])
      setPagination(data.pagination || { page: 1, limit: 50, total: 0, pages: 0 })
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts(1, searchTerm)
  }, [searchTerm])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(searchInput)
  }

  const handlePageChange = (newPage: number) => {
    fetchContacts(newPage, searchTerm)
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Individual contacts from CRM</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Total: <span className="font-semibold text-gray-700">{pagination.total.toLocaleString()}</span> contacts
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="p-6 border-b">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No contacts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Company</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                      {contact.isPrimary && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Primary</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contact.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contact.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <Link href={`/admin/corporates/${contact.customer.id}`} className="text-blue-600 hover:underline">
                        {contact.customer.company}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contact.title || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <Link href={`/admin/customers/${contact.id}`} className="text-blue-600 hover:text-blue-800 mr-4">View</Link>
                      <button className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="p-6 flex justify-center gap-2">
            <button
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              disabled={pagination.page === pagination.pages}
              onClick={() => handlePageChange(pagination.page + 1)}
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
