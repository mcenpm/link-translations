'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, FileText, ArrowRight, Mail, Phone, Loader2 } from 'lucide-react'

interface PaymentDetails {
  quoteNumber: string
  amount: number
  email: string
  serviceType: string
  projectId?: string
}

export default function QuoteSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/stripe/verify?session_id=${sessionId}`)
        const data = await response.json()
        
        if (response.ok) {
          setPaymentDetails(data)
        } else {
          setError(data.error || 'Unable to verify payment')
        }
      } catch {
        setError('Failed to verify payment status')
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Verification Failed</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link 
                href="/quote"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Request New Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your payment. Your order has been confirmed and a project has been created.
            </p>

            {paymentDetails && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quote Number:</span>
                    <span className="font-semibold text-gray-900">{paymentDetails.quoteNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service:</span>
                    <span className="font-semibold text-gray-900 capitalize">{paymentDetails.serviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount Paid:</span>
                    <span className="font-semibold text-emerald-600">${paymentDetails.amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Confirmation sent to:</span>
                    <span className="font-medium text-gray-900">{paymentDetails.email}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link 
                href="/customer/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link 
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>You&apos;ll receive a confirmation email with your order details</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Our team will review your request and assign a qualified linguist</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>You can track your project status in your dashboard</span>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p className="mb-2">Questions about your order?</p>
            <div className="flex items-center justify-center gap-4">
              <a href="mailto:info@linktranslations.com" className="flex items-center gap-1 text-blue-600 hover:underline">
                <Mail className="w-4 h-4" />
                info@linktranslations.com
              </a>
              <a href="tel:+12032541181" className="flex items-center gap-1 text-blue-600 hover:underline">
                <Phone className="w-4 h-4" />
                (203) 254-1181
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
