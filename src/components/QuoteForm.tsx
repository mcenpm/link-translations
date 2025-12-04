'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

interface Language {
  id: string
  name: string
  code: string | null
}

interface QuoteFormProps {
  languages: Language[]
}

export default function QuoteForm({ languages }: QuoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [quoteNumber, setQuoteNumber] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [formData, setFormData] = useState({
    // Contact Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    
    // Service Details
    serviceType: '',
    sourceLanguageId: '',
    targetLanguageId: '',
    documentType: '',
    wordCount: '',
    deadline: '',
    
    // Interpretation Details
    interpretationType: '',
    interpretationDate: '',
    interpretationLocation: '',
    
    // Additional Info
    description: '',
    howDidYouHear: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus('success')
        setQuoteNumber(data.quoteNumber)
        // Reset form
        setFormData({
          firstName: '', lastName: '', email: '', phone: '', company: '',
          serviceType: '', sourceLanguageId: '', targetLanguageId: '',
          documentType: '', wordCount: '', deadline: '',
          interpretationType: '', interpretationDate: '', interpretationLocation: '',
          description: '', howDidYouHear: '',
        })
      } else {
        setSubmitStatus('error')
        setErrorMessage(data.error || 'Something went wrong')
      }
    } catch {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success State
  if (submitStatus === 'success') {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 md:p-12 text-center border border-emerald-100">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quote Request Submitted!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your request. Your quote number is:
        </p>
        <div className="inline-block bg-white rounded-xl px-6 py-3 mb-6 border border-emerald-200">
          <span className="text-2xl font-bold text-emerald-600">{quoteNumber}</span>
        </div>
        <p className="text-gray-600 mb-8">
          We will contact you within 2 business hours with a detailed quote.
        </p>
        <button
          onClick={() => setSubmitStatus('idle')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Submit Another Quote
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Submission Failed</p>
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Contact Information
        </h2>
        <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input 
                type="text" 
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input 
                type="text" 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input 
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company/Organization
              </label>
              <input 
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Service Details
        </h2>
        <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type *
            </label>
            <select 
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select a service...</option>
              <option value="translation">Document Translation</option>
              <option value="certified">Certified Translation</option>
              <option value="notarized">Notarized Translation</option>
              <option value="interpretation">Interpretation</option>
              <option value="transcription">Transcription</option>
              <option value="typesetting">Typesetting/DTP</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Language *
              </label>
              <select 
                name="sourceLanguageId"
                value={formData.sourceLanguageId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select language...</option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Language *
              </label>
              <select 
                name="targetLanguageId"
                value={formData.targetLanguageId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select language...</option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select 
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select document type...</option>
              <option value="birth-certificate">Birth Certificate</option>
              <option value="marriage-certificate">Marriage Certificate</option>
              <option value="divorce-decree">Divorce Decree</option>
              <option value="diploma">Diploma/Degree</option>
              <option value="transcript">Academic Transcript</option>
              <option value="passport">Passport</option>
              <option value="drivers-license">Driver&apos;s License</option>
              <option value="legal-contract">Legal Contract</option>
              <option value="medical-records">Medical Records</option>
              <option value="patent">Patent/Technical Document</option>
              <option value="business">Business Document</option>
              <option value="website">Website Content</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Word/Page Count (Estimated)
              </label>
              <input 
                type="text"
                name="wordCount"
                value={formData.wordCount}
                onChange={handleChange}
                placeholder="e.g., 500 words or 3 pages"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline
              </label>
              <input 
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interpretation Details (conditional) */}
      {formData.serviceType === 'interpretation' && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
            Interpretation Details
          </h2>
          <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Interpretation
              </label>
              <select 
                name="interpretationType"
                value={formData.interpretationType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select type...</option>
                <option value="deposition">Deposition</option>
                <option value="court">Court Hearing/Trial</option>
                <option value="ime">Independent Medical Exam (IME)</option>
                <option value="euo">Examination Under Oath (EUO)</option>
                <option value="medical">Medical Appointment</option>
                <option value="conference">Conference/Meeting</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Needed
                </label>
                <input 
                  type="date"
                  name="interpretationDate"
                  value={formData.interpretationDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (City, State)
                </label>
                <input 
                  type="text"
                  name="interpretationLocation"
                  value={formData.interpretationLocation}
                  onChange={handleChange}
                  placeholder="e.g., Miami, FL"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
            {formData.serviceType === 'interpretation' ? '4' : '3'}
          </span>
          Additional Information
        </h2>
        <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description / Special Instructions
            </label>
            <textarea 
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please provide any additional details about your project, special requirements, or questions..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How did you hear about us?
            </label>
            <select 
              name="howDidYouHear"
              value={formData.howDidYouHear}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select...</option>
              <option value="google">Google Search</option>
              <option value="referral">Referral</option>
              <option value="returning">Returning Customer</option>
              <option value="attorney">Attorney Referral</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Quote Request'
        )}
      </button>

      <p className="text-sm text-gray-500 text-center">
        We typically respond within 2 hours during business hours (M-F, 9am-6pm EST)
      </p>
    </form>
  )
}
