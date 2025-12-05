'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building, User, Mail, Phone, Briefcase, FileText, Calendar, Edit, DollarSign } from 'lucide-react'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  title: string | null
  isPrimary: boolean
  createdAt: string
  customer: {
    id: string
    company: string
    website: string | null
    industry: string | null
    billingAddress: string | null
    billingCity: string | null
    billingState: string | null
    billingCountry: string | null
  }
  quotes: {
    id: string
    quoteNumber: string
    status: string
    sourceLanguage: string
    targetLanguage: string
    total: number | null
    createdAt: string
  }[]
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await fetch(`/api/customers/${id}`)
        if (response.ok) {
          const data = await response.json()
          setContact(data)
        }
      } catch (error) {
        console.error('Error fetching contact:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContact()
  }, [id])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      QUOTE_SENT: 'bg-yellow-100 text-yellow-800',
      NEGOTIATION_REVIEW: 'bg-blue-100 text-blue-800',
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

  if (!contact) {
    return (
      <div className="p-8">
        <Link href="/admin/customers" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Link>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Contact not found.</p>
        </div>
      </div>
    )
  }

  const totalQuoteValue = contact.quotes?.reduce((sum, q) => sum + (q.total || 0), 0) || 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {contact.firstName[0]}{contact.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">{contact.firstName} {contact.lastName}</h1>
                {contact.isPrimary && (
                  <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">Primary</span>
                )}
              </div>
              <p className="text-gray-500">{contact.title || 'Contact'}</p>
            </div>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Edit className="w-4 h-4" /> Edit
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Quotes</p>
              <p className="text-2xl font-bold text-gray-900">{contact.quotes?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalQuoteValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <Link href={`/admin/corporates/${contact.customer.id}`} className="text-blue-600 hover:underline font-medium">
                {contact.customer.company}
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Since</p>
              <p className="text-lg font-bold text-gray-900">{new Date(contact.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
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
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                      {contact.email}
                    </a>
                  ) : (
                    <p className="text-gray-900">-</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{contact.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="text-gray-900">{contact.title || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="text-gray-900">{contact.customer.industry || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" /> Company Information
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Link href={`/admin/corporates/${contact.customer.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
                  {contact.customer.company}
                </Link>
                <p className="text-gray-500 mt-1">
                  {[contact.customer.billingCity, contact.customer.billingState, contact.customer.billingCountry]
                    .filter(Boolean)
                    .join(', ') || 'No address'}
                </p>
                {contact.customer.website && (
                  <a 
                    href={contact.customer.website.startsWith('http') ? contact.customer.website : `https://${contact.customer.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {contact.customer.website}
                  </a>
                )}
              </div>
              <Link 
                href={`/admin/corporates/${contact.customer.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Company
              </Link>
            </div>
          </div>

          {/* Recent Quotes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Quotes
              </h2>
            </div>
            {contact.quotes && contact.quotes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Quote #</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Languages</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Total</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contact.quotes.map((quote) => (
                      <tr key={quote.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/admin/quotes/${quote.id}`}>
                        <td className="px-4 py-3 text-sm text-blue-600 hover:underline font-mono">
                          {quote.quoteNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {quote.sourceLanguage} → {quote.targetLanguage}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(quote.status)}`}>
                            {quote.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          ${(quote.total || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No quotes yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Quotes</span>
                <span className="text-gray-900">{contact.quotes?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Value</span>
                <span className="text-green-600 font-semibold">${totalQuoteValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Avg Quote Value</span>
                <span className="text-gray-900">
                  ${contact.quotes?.length ? (totalQuoteValue / contact.quotes.length).toFixed(2) : '0'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Create New Quote
              </button>
              {contact.email && (
                <a 
                  href={`mailto:${contact.email}`}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 block text-center"
                >
                  Send Email
                </a>
              )}
              <Link 
                href={`/admin/corporates/${contact.customer.id}`}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 block text-center"
              >
                View Company
              </Link>
              <button className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                Delete Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
