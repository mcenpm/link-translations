'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Customer {
  id: string
  user: {
    email: string
    firstName: string | null
    lastName: string | null
    phone: string | null
  }
  company: string
  website?: string | null
  billingCity?: string | null
  billingState?: string | null
  billingAddress?: string | null
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers')
        const data = await response.json()
        setCustomers(Array.isArray(data) ? data : data.data || [])
      } catch (error) {
        console.error('Error fetching customers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter((customer) => {
    const companyName = customer.company || ''
    const email = customer.user?.email || ''
    const search = searchTerm.toLowerCase()
    return companyName.toLowerCase().includes(search) || email.toLowerCase().includes(search)
  })

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add New Customer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <input
            type="text"
            placeholder="Search by company name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading customers...</div>
        ) : paginatedCustomers.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Company</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Website</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{customer.company || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{customer.user?.email || '-'}</div>
                      {customer.user?.phone && <div className="text-xs text-gray-400">{customer.user.phone}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.billingCity || customer.billingState ? `${customer.billingCity || ''}${customer.billingCity && customer.billingState ? ', ' : ''}${customer.billingState || ''}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.website ? (
                        <a
                          href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {customer.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-blue-600 hover:text-blue-800 mr-4">Edit</button>
                      <button className="text-red-600 hover:text-red-800">Delete</button>
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
