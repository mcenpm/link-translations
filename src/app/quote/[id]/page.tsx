'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  FileText, User, MessageCircle, Share2, Pencil, Download,
  CreditCard, CheckCircle2, Loader2, ArrowLeft, AlertCircle,
  Clock, Globe, Tag, Receipt
} from 'lucide-react'

interface Quote {
  id: string
  quoteNumber: string
  status: string
  serviceType: string
  totalPrice: number
  paymentStatus: string
  createdAt: string
  wordCount?: number
  documentCount?: number
  duration?: number // for interpretation
  deliveryDate?: string
  rushDelivery?: boolean
  sourceLanguage?: { name: string }
  targetLanguage?: { name: string }
  srcLanguage?: { name: string }
  tgtLanguage?: { name: string }
  contact?: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  notes?: string
}

export default function QuoteDetailPage() {
  const params = useParams()
  const quoteId = params.id as string
  
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  
  // Form states
  const [customerNotes, setCustomerNotes] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const fetchQuote = useCallback(async () => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}`)
      if (response.ok) {
        const data = await response.json()
        setQuote(data)
      } else {
        setError('Quote not found')
      }
    } catch {
      setError('Failed to load quote')
    } finally {
      setLoading(false)
    }
  }, [quoteId])

  useEffect(() => {
    if (quoteId) {
      fetchQuote()
    }
  }, [quoteId, fetchQuote])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    
    setApplyingCoupon(true)
    setCouponError('')
    
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          quoteId: quote?.id,
        }),
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setCouponApplied(true)
        setCouponDiscount(data.discount || 0)
      } else {
        setCouponError(data.error || 'Invalid coupon code')
        setCouponApplied(false)
        setCouponDiscount(0)
      }
    } catch {
      setCouponError('Failed to validate coupon')
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handlePayment = async () => {
    setPaymentLoading(true)
    setError(null)
    
    try {
      // Update quote with customer notes and reference if provided
      if (customerNotes || referenceNumber) {
        await fetch(`/api/quotes/${quote?.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerNotes,
            referenceNumber,
          }),
        })
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quote?.id,
          couponCode: couponApplied ? couponCode : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create checkout session')
      }
    } catch {
      setError('Failed to process payment')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/quote/${quoteId}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quote #${quote?.quoteNumber}`,
          url: url,
        })
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url)
      alert('Quote link copied to clipboard!')
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Quote-${quote?.quoteNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch {
      setError('Failed to download PDF')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quote...</p>
        </div>
      </div>
    )
  }

  if (error && !quote) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Quote Not Found</h1>
              <p className="text-gray-600 mb-6">{error || 'The requested quote could not be found.'}</p>
              <Link 
                href="/quote"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Request New Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!quote) return null

  const isPaid = quote.paymentStatus === 'paid'
  const canPay = quote.status === 'SENT' && !isPaid && quote.totalPrice && quote.totalPrice > 0

  const srcLang = quote.srcLanguage?.name || quote.sourceLanguage?.name
  const tgtLang = quote.tgtLanguage?.name || quote.targetLanguage?.name
  
  const finalPrice = couponApplied 
    ? Math.max(0, (quote.totalPrice || 0) - couponDiscount)
    : (quote.totalPrice || 0)

  // Calculate delivery info
  const getDeliveryText = () => {
    if (quote.serviceType === 'interpretation') {
      if (quote.deliveryDate) {
        return new Date(quote.deliveryDate).toLocaleString()
      }
      return quote.duration ? `${quote.duration} hours` : 'TBD'
    }
    if (quote.rushDelivery) return '24 hours (Rush)'
    if (quote.deliveryDate) {
      const hours = Math.round((new Date(quote.deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60))
      return hours > 0 ? `${hours} hours` : 'ASAP'
    }
    return 'Standard (3-5 days)'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Quote #{quote.quoteNumber}</h1>
                <p className="text-blue-100 mt-1">
                  Created on {new Date(quote.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isPaid 
                  ? 'bg-emerald-500/20 text-emerald-100' 
                  : quote.status === 'SENT'
                  ? 'bg-yellow-500/20 text-yellow-100'
                  : 'bg-white/20 text-white'
              }`}>
                {isPaid ? 'Paid' : quote.status}
              </div>
            </div>
          </div>

          {/* Main Content - Two Columns */}
          <div className="bg-white rounded-b-2xl shadow-xl border border-gray-100 border-t-0">
            <div className="grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              
              {/* Left Panel - Summary */}
              <div className="lg:col-span-2 p-8">
                {/* Price */}
                <div className="mb-8">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ${finalPrice.toFixed(2)}
                  </div>
                  {couponApplied && couponDiscount > 0 && (
                    <div className="text-sm text-emerald-600 flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      Coupon applied: -${couponDiscount.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Summary Items */}
                <div className="space-y-4 mb-8">
                  {quote.serviceType === 'translation' && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span>
                        {quote.wordCount ? `${quote.wordCount.toLocaleString()} words` : 'Word count TBD'}
                        {quote.documentCount ? ` in ${quote.documentCount} document${quote.documentCount > 1 ? 's' : ''}` : ''}
                      </span>
                    </div>
                  )}
                  
                  {quote.serviceType === 'interpretation' && quote.duration && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span>{quote.duration} hours interpretation</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>Delivery: {getDeliveryText()}</span>
                  </div>

                  {srcLang && tgtLang && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Globe className="w-5 h-5 text-indigo-500" />
                      <span>{srcLang} → {tgtLang}</span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                {quote.contact && (
                  <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Contact
                    </h3>
                    <p className="font-medium text-gray-900">
                      {quote.contact.firstName} {quote.contact.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{quote.contact.email}</p>
                    {quote.contact.phone && (
                      <p className="text-sm text-gray-600">{quote.contact.phone}</p>
                    )}
                  </div>
                )}

                {/* Chat Button */}
                <a
                  href={`mailto:info@linktranslations.com?subject=Question about Quote %23${quote.quoteNumber}`}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat with us now
                </a>
              </div>

              {/* Right Panel - Form & Payment */}
              <div className="lg:col-span-3 p-8">
                {isPaid ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Complete</h2>
                    <p className="text-gray-600 mb-6">Thank you! Your order is being processed.</p>
                    <Link 
                      href="/customer/orders"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      View Your Orders
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Notes */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Enter your notes
                      </label>
                      <textarea
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="e.g. transliteration/romanization, specific terminology preferences..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                      />
                    </div>

                    {/* Coupon & Reference */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Coupon code
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase())
                              setCouponError('')
                              if (couponApplied) {
                                setCouponApplied(false)
                                setCouponDiscount(0)
                              }
                            }}
                            placeholder="SAVE10"
                            disabled={couponApplied}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={applyingCoupon || couponApplied || !couponCode.trim()}
                            className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            {applyingCoupon ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : couponApplied ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              'Apply'
                            )}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-sm text-red-500 mt-1">{couponError}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Reference number
                        </label>
                        <input
                          type="text"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          placeholder="PO-12345"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Payment method
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 p-4 border-2 border-blue-600 bg-blue-50 rounded-xl cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            defaultChecked
                            className="w-4 h-4 text-blue-600"
                          />
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900">Pay by credit card</span>
                        </label>
                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 opacity-50 pointer-events-none">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="invoice"
                            disabled
                            className="w-4 h-4 text-blue-600"
                          />
                          <Receipt className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-500">Pay by invoice (Corporate only)</span>
                        </label>
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                      </div>
                    )}

                    {/* Order Button */}
                    {canPay ? (
                      <button
                        onClick={handlePayment}
                        disabled={paymentLoading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25"
                      >
                        {paymentLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Order now - ${finalPrice.toFixed(2)}
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="bg-gray-100 rounded-xl p-4 text-center text-gray-600">
                        {quote.status === 'DRAFT' 
                          ? 'This quote is still being prepared. You will be able to pay once it is finalized.'
                          : 'Payment is not available for this quote.'}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="border-t border-gray-100 px-8 py-4 flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <Link
                href={`/quote?edit=${quoteId}`}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit Quote
              </Link>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Quote
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Need help with this quote? Contact us at{' '}
              <a href="mailto:info@linktranslations.com" className="text-blue-600 hover:underline">
                info@linktranslations.com
              </a>
              {' '}or call{' '}
              <a href="tel:+18005551234" className="text-blue-600 hover:underline">
                1-800-555-1234
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
