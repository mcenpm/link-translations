'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, DollarSign, FileText, User, Globe, Clock, Edit, Trash2, FolderOpen, CheckCircle } from 'lucide-react'

interface Quote {
  id: string
  legacyId: string | null
  quoteNumber: string
  status: string
  description: string | null
  sourceLanguage: string[]
  targetLanguage: string[]
  wordCount: number | null
  unitOfIssue: string | null
  ratePerUnit: number
  minimumCharge: number
  subtotal: number | null
  tax: number | null
  total: number | null
  requestedDeliveryDate: string | null
  actualDeliveryDate: string | null
  notes: string | null
  internalNotes: string | null
  billingContactName: string | null      // Person who ordered
  billingContactCrmId: string | null     // CRM Contact ID
  billingContact: {                      // Linked CustomerContact
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    customerId: string
  } | null
  createdAt: string
  updatedAt: string
  corporate: {
    id: string
    company: string
    user: {
      email: string
      firstName: string | null
      lastName: string | null
      phone: string | null
    }
  }
  languagePair: {
    id: string
    sourceLanguage: { name: string; code: string }
    targetLanguage: { name: string; code: string }
    ratePerWord: number
  } | null
  project?: {
    id: string
    projectNumber: string
    status: string
  } | null
}

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'INVOICE_NOT_PAID', label: 'Invoice Not Paid' },
  { value: 'INVOICE_PAID', label: 'Invoice Paid' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchQuote()
  }, [id])

  const fetchQuote = async () => {
    try {
      const response = await fetch(`/api/quotes/${id}`)
      if (response.ok) {
        const data = await response.json()
        setQuote(data)
      }
    } catch (error) {
      console.error('Error fetching quote:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/quotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        await fetchQuote()
        // If status is INVOICE_PAID or INVOICE_NOT_PAID, a project was created
        if (newStatus === 'INVOICE_PAID' || newStatus === 'INVOICE_NOT_PAID') {
          alert('Status updated and a new project was created!')
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800 border-gray-300',
      SUBMITTED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      REVIEWED: 'bg-blue-100 text-blue-800 border-blue-300',
      ACCEPTED: 'bg-green-100 text-green-800 border-green-300',
      REJECTED: 'bg-red-100 text-red-800 border-red-300',
      IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-300',
      COMPLETED: 'bg-green-100 text-green-800 border-green-300',
      INVOICE_NOT_PAID: 'bg-orange-100 text-orange-800 border-orange-300',
      INVOICE_PAID: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="p-8">
        <Link href="/admin/quotes" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Quotes
        </Link>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Quote not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/quotes" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quote {quote.quoteNumber}</h1>
            <p className="text-gray-500">Created {new Date(quote.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={quote.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className={`px-4 py-2 rounded-full text-sm font-semibold border cursor-pointer appearance-none pr-8 ${getStatusColor(quote.status)} ${updatingStatus ? 'opacity-50' : ''}`}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Edit className="w-4 h-4" /> Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Customer Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <Link href={`/admin/customers/${quote.corporate.id}`} className="text-blue-600 hover:underline font-medium">
                  {quote.corporate.company}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Name</p>
                {quote.billingContact ? (
                  <Link 
                    href={`/admin/customers/${quote.billingContact.id}`} 
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {quote.billingContactName || `${quote.billingContact.firstName} ${quote.billingContact.lastName}`}
                  </Link>
                ) : (
                  <p className="text-gray-900 font-medium">
                    {quote.billingContactName || `${quote.corporate.user.firstName || ''} ${quote.corporate.user.lastName || ''}`.trim() || '-'}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a href={`mailto:${quote.billingContact?.email || quote.corporate.user.email}`} className="text-blue-600 hover:underline">
                  {quote.billingContact?.email || quote.corporate.user.email}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{quote.billingContact?.phone || quote.corporate.user.phone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Language Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" /> Translation Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Source Language</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {quote.sourceLanguage && quote.sourceLanguage.length > 0 ? (
                    quote.sourceLanguage.map((lang, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{lang}</span>
                    ))
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Target Language</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {quote.targetLanguage && quote.targetLanguage.length > 0 ? (
                    quote.targetLanguage.map((lang, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">{lang}</span>
                    ))
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Word Count</p>
                <p className="text-gray-900">{quote.wordCount?.toLocaleString() || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Unit of Issue</p>
                <p className="text-gray-900">{quote.unitOfIssue || '-'}</p>
              </div>
            </div>
          </div>

          {/* Description & Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Description & Notes
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {quote.description || 'No description provided.'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Customer Notes</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {quote.notes || 'No notes.'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Internal Notes</p>
                <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  {quote.internalNotes || 'No internal notes.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" /> Pricing
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Rate per Unit</span>
                <span className="text-gray-900">${quote.ratePerUnit?.toFixed(4) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Minimum Charge</span>
                <span className="text-gray-900">${quote.minimumCharge?.toFixed(2) || '0.00'}</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">${quote.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900">${quote.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-green-600">${quote.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" /> Timeline
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-gray-900">{new Date(quote.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-gray-900">{new Date(quote.updatedAt).toLocaleString()}</p>
              </div>
              {quote.requestedDeliveryDate && (
                <div>
                  <p className="text-sm text-gray-500">Requested Delivery</p>
                  <p className="text-gray-900">{new Date(quote.requestedDeliveryDate).toLocaleDateString()}</p>
                </div>
              )}
              {quote.actualDeliveryDate && (
                <div>
                  <p className="text-sm text-gray-500">Actual Delivery</p>
                  <p className="text-gray-900">{new Date(quote.actualDeliveryDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-2">
              {quote.project ? (
                <Link 
                  href={`/admin/projects/${quote.project.id}`}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  View Project ({quote.project.projectNumber})
                </Link>
              ) : (
                <button 
                  onClick={() => handleStatusChange('INVOICE_NOT_PAID')}
                  disabled={updatingStatus}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  Create Project
                </button>
              )}
              <button 
                onClick={() => handleStatusChange('INVOICE_PAID')}
                disabled={updatingStatus || quote.status === 'INVOICE_PAID'}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Invoice Paid
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Download PDF
              </button>
              <button 
                onClick={() => handleStatusChange('CANCELLED')}
                disabled={updatingStatus}
                className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                Cancel Quote
              </button>
            </div>
          </div>

          {/* Legacy Info */}
          {quote.legacyId && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500">Legacy ID (SugarCRM)</div>
              <div className="text-xs font-mono text-gray-600 truncate">{quote.legacyId}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
