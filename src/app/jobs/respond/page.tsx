'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

interface JobDetails {
  id: string
  eventDate: string
  eventTime: string
  eventDuration: number
  eventLocation: string
  eventDescription: string | null
  sourceLanguage: string
  targetLanguage: string
  distance: number | null
}

export default function JobResponsePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const action = searchParams.get('action')
  const hasInitialized = useRef(false)

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'already_responded'>('loading')
  const [message, setMessage] = useState('')
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [showDeclineForm, setShowDeclineForm] = useState(false)

  const submitResponse = useCallback(async (responseAction: 'accept' | 'decline', reason?: string) => {
    setStatus('loading')

    try {
      const res = await fetch('/api/jobs/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action: responseAction,
          declineReason: responseAction === 'decline' ? reason : undefined
        })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'expired') {
          setStatus('expired')
          setMessage('This job invitation has expired.')
        } else if (data.error === 'already_responded') {
          setStatus('already_responded')
          setMessage(`You have already ${data.currentStatus?.toLowerCase()} this job.`)
        } else {
          setStatus('error')
          setMessage(data.error || 'Failed to submit response.')
        }
        return
      }

      setStatus('success')
      setJobDetails(data.job)
      setMessage(responseAction === 'accept' 
        ? 'You have accepted this job! We will send you confirmation details shortly.'
        : 'You have declined this job. Thank you for letting us know.')
      setShowDeclineForm(false)
    } catch {
      setStatus('error')
      setMessage('Failed to connect to server.')
    }
  }, [token])

  const fetchJobDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/details?token=${token}`)
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'expired') {
          setStatus('expired')
          setMessage('This job invitation has expired.')
        } else if (data.error === 'already_responded') {
          setStatus('already_responded')
          setMessage(`You have already ${data.currentStatus?.toLowerCase()} this job.`)
        } else {
          setStatus('error')
          setMessage(data.error || 'Failed to load job details.')
        }
        return
      }

      setJobDetails(data.job)
      setShowDeclineForm(true)
      setStatus('loading') // Keep loading while form is shown
    } catch {
      setStatus('error')
      setMessage('Failed to connect to server.')
    }
  }, [token])

  useEffect(() => {
    // Skip effect and handle invalid state in render
    if (!token || !action || hasInitialized.current) {
      return
    }

    // Mark as initialized to prevent double execution
    hasInitialized.current = true

    // If action is accept, submit immediately
    // If action is decline, show form first
    // Use setTimeout to avoid synchronous setState in effect
    if (action === 'accept') {
      setTimeout(() => submitResponse('accept'), 0)
    } else if (action === 'decline') {
      setTimeout(() => fetchJobDetails(), 0)
    }
  }, [token, action, submitResponse, fetchJobDetails])

  // Handle invalid states in render instead of effect
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600">No token provided.</p>
        </div>
      </div>
    )
  }

  if (action && action !== 'accept' && action !== 'decline') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Action</h1>
          <p className="text-gray-600">Must be accept or decline.</p>
        </div>
      </div>
    )
  }

  if (status === 'loading' && !showDeclineForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your response...</p>
        </div>
      </div>
    )
  }

  // Decline form
  if (showDeclineForm && jobDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Decline Job</h1>
              <p className="text-gray-600 mt-2">Are you sure you want to decline this job?</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Languages</span>
                  <span className="font-medium">{jobDetails.sourceLanguage} ↔ {jobDetails.targetLanguage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{jobDetails.eventDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium">{jobDetails.eventTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{jobDetails.eventDuration} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium">{jobDetails.eventLocation}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for declining (optional)
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="e.g., Schedule conflict, too far, not available..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => submitResponse('decline', declineReason)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Confirm Decline
              </button>
              <button
                onClick={() => submitResponse('accept')}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Accept Instead
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (status === 'success') {
    const isAccepted = action === 'accept' || message.includes('accepted')
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className={`w-16 h-16 ${isAccepted ? 'bg-green-100' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {isAccepted ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-gray-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isAccepted ? 'Job Accepted!' : 'Job Declined'}
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>

            {jobDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-gray-900 mb-3">Job Details</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Languages</span>
                    <span className="font-medium">{jobDetails.sourceLanguage} ↔ {jobDetails.targetLanguage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">{jobDetails.eventDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium">{jobDetails.eventTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium">{jobDetails.eventLocation}</span>
                  </div>
                </div>
              </div>
            )}

            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Error states
  const iconConfig = {
    expired: { icon: Clock, color: 'yellow', bg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    already_responded: { icon: AlertCircle, color: 'blue', bg: 'bg-blue-100', iconColor: 'text-blue-600' },
    error: { icon: XCircle, color: 'red', bg: 'bg-red-100', iconColor: 'text-red-600' }
  }

  const config = iconConfig[status as keyof typeof iconConfig] || iconConfig.error
  const Icon = config.icon

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className={`w-16 h-16 ${config.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'expired' ? 'Link Expired' : status === 'already_responded' ? 'Already Responded' : 'Error'}
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
