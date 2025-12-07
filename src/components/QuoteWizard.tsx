'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircle2, Loader2, ArrowRight, ArrowLeft, FileText, Mic, 
  Globe, User, Calendar, MessageSquare, Check
} from 'lucide-react'

interface Language {
  id: string
  name: string
  code: string | null
}

interface QuoteWizardProps {
  languages: Language[]
}

type Step = 1 | 2 | 3 | 4

// Parse step name to number
const getStepFromName = (name: string): Step => {
  const stepMap: Record<string, Step> = { service: 1, details: 2, contact: 3, review: 4 }
  return stepMap[name] || 1
}

export default function QuoteWizard({ languages }: QuoteWizardProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const initialService = searchParams.get('service') || ''
  const stepParam = searchParams.get('step') || 'service'
  
  const [currentStep, setCurrentStep] = useState<Step>(getStepFromName(stepParam))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [quoteNumber, setQuoteNumber] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [formData, setFormData] = useState({
    // Step 1: Service Type
    serviceType: initialService,
    
    // Step 2: Languages & Details
    sourceLanguageId: '',
    targetLanguageId: '',
    documentType: '',
    wordCount: '',
    deadline: '',
    interpretationType: '',
    interpretationDate: '',
    interpretationTime: '',
    interpretationDuration: '',
    interpretationLocation: '',
    
    // Step 3: Contact Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    
    // Step 4: Additional Info
    description: '',
    howDidYouHear: '',
  })

  // Step names for URL
  const stepNames = ['service', 'details', 'contact', 'review'] as const

  // Update URL when step or service changes
  const updateURL = (step: Step, service?: string) => {
    const params = new URLSearchParams()
    params.set('step', stepNames[step - 1])
    const currentService = service ?? formData.serviceType
    if (currentService) {
      params.set('service', currentService)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    if (initialService) {
      setFormData(prev => ({ ...prev, serviceType: initialService }))
    }
  }, [initialService])

  // Sync URL on initial load and step changes
  useEffect(() => {
    updateURL(currentStep)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const setServiceType = (type: string) => {
    setFormData(prev => ({ ...prev, serviceType: type }))
    // Update URL immediately when service type changes
    updateURL(currentStep, type)
  }

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.serviceType
      case 2:
        return !!formData.sourceLanguageId && !!formData.targetLanguageId
      case 3:
        return !!formData.firstName && !!formData.lastName && !!formData.email && !!formData.phone
      case 4:
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep((currentStep + 1) as Step)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const handleSubmit = async () => {
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

  const steps = [
    { number: 1, title: 'Service', icon: FileText },
    { number: 2, title: 'Details', icon: Globe },
    { number: 3, title: 'Contact', icon: User },
    { number: 4, title: 'Review', icon: MessageSquare },
  ]

  // Success State
  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-sm mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Quote Request Submitted!</h1>
              <p className="text-gray-600 text-sm mb-3">
                Thank you for your request. Your quote number is:
              </p>
              <div className="inline-block bg-gray-50 rounded-lg px-5 py-2 mb-4 border border-gray-200">
                <span className="text-xl font-bold text-blue-600">{quoteNumber}</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                We will contact you within <strong>2 business hours</strong> with a detailed quote.
              </p>
              <div className="space-y-2">
                <Link 
                  href="/"
                  className="block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity text-center"
                >
                  Return to Homepage
                </Link>
                <button
                  onClick={() => {
                    setSubmitStatus('idle')
                    setCurrentStep(1)
                    setFormData({
                      serviceType: '', sourceLanguageId: '', targetLanguageId: '',
                      documentType: '', wordCount: '', deadline: '',
                      interpretationType: '', interpretationDate: '', interpretationTime: '',
                      interpretationDuration: '', interpretationLocation: '',
                      firstName: '', lastName: '', email: '', phone: '', company: '',
                      description: '', howDidYouHear: '',
                    })
                  }}
                  className="block w-full py-2 px-4 text-gray-600 text-sm font-medium hover:text-blue-600 transition-colors"
                >
                  Submit Another Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-28 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Get a Free Quote
            </h1>
            <p className="text-sm text-gray-600">
              Tell us about your project and we&apos;ll provide a detailed quote within 2 hours.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                />
              </div>
              
              {steps.map((step) => {
                const Icon = step.icon
                const isCompleted = currentStep > step.number
                const isCurrent = currentStep === step.number
                
                return (
                  <div key={step.number} className="relative flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md' 
                        : isCurrent 
                          ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-md' 
                          : 'bg-white border-2 border-gray-200 text-gray-400'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`mt-1 text-xs font-medium ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Error Message */}
            {submitStatus === 'error' && (
              <div className="bg-red-50 border-b border-red-100 px-4 py-3 text-red-600 text-sm">
                {errorMessage}
              </div>
            )}

            <div className="p-5 md:p-6">
              {/* Step 1: Service Type */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">What service do you need?</h2>
                    <p className="text-sm text-gray-600">Select the type of language service you require.</p>
                  </div>
                  
                  <div className="grid gap-3">
                    <button
                      type="button"
                      onClick={() => setServiceType('translation')}
                      className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        formData.serviceType === 'translation'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                        formData.serviceType === 'translation'
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md'
                          : 'bg-gray-100 group-hover:bg-blue-100'
                      }`}>
                        <FileText className={`w-6 h-6 ${
                          formData.serviceType === 'translation' ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900">Document Translation</h3>
                        <p className="text-sm text-gray-600">
                          Certified translations for legal, medical, business documents.
                        </p>
                      </div>
                      {formData.serviceType === 'translation' && (
                        <div className="absolute top-3 right-3">
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setServiceType('interpretation')}
                      className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        formData.serviceType === 'interpretation'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                        formData.serviceType === 'interpretation'
                          ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-md'
                          : 'bg-gray-100 group-hover:bg-purple-100'
                      }`}>
                        <Mic className={`w-6 h-6 ${
                          formData.serviceType === 'interpretation' ? 'text-white' : 'text-gray-600 group-hover:text-purple-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900">Interpretation Services</h3>
                        <p className="text-sm text-gray-600">
                          Court, medical, conference interpreters nationwide.
                        </p>
                      </div>
                      {formData.serviceType === 'interpretation' && (
                        <div className="absolute top-3 right-3">
                          <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Languages & Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">
                      {formData.serviceType === 'translation' ? 'Translation Details' : 'Interpretation Details'}
                    </h2>
                    <p className="text-sm text-gray-600">Tell us more about your project requirements.</p>
                  </div>

                  {/* Language Selection */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Source Language *
                      </label>
                      <select
                        name="sourceLanguageId"
                        value={formData.sourceLanguageId}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-sm"
                      >
                        <option value="">Select language</option>
                        {languages.map(lang => (
                          <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Target Language *
                      </label>
                      <select
                        name="targetLanguageId"
                        value={formData.targetLanguageId}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-sm"
                      >
                        <option value="">Select language</option>
                        {languages.map(lang => (
                          <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Translation-specific fields */}
                  {formData.serviceType === 'translation' && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Document Type</label>
                        <select
                          name="documentType"
                          value={formData.documentType}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-sm"
                        >
                          <option value="">Select document type (optional)</option>
                          <option value="birth-certificate">Birth Certificate</option>
                          <option value="marriage-certificate">Marriage Certificate</option>
                          <option value="divorce-decree">Divorce Decree</option>
                          <option value="diploma">Diploma/Degree</option>
                          <option value="transcript">Academic Transcript</option>
                          <option value="passport">Passport</option>
                          <option value="drivers-license">Driver&apos;s License</option>
                          <option value="legal-contract">Legal Contract</option>
                          <option value="medical-records">Medical Records</option>
                          <option value="business">Business Document</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Word/Page Count</label>
                          <input
                            type="text"
                            name="wordCount"
                            placeholder="e.g., 500 words or 3 pages"
                            value={formData.wordCount}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            <Calendar className="w-3.5 h-3.5 inline mr-1.5 text-blue-600" />
                            Deadline
                          </label>
                          <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interpretation-specific fields */}
                  {formData.serviceType === 'interpretation' && (
                    <div className="space-y-4 pt-3 border-t border-gray-100">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Type of Interpretation</label>
                        <select
                          name="interpretationType"
                          value={formData.interpretationType}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-sm"
                        >
                          <option value="">Select type</option>
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
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            <Calendar className="w-3.5 h-3.5 inline mr-1.5 text-purple-600" />
                            Date Needed
                          </label>
                          <input
                            type="date"
                            name="interpretationDate"
                            value={formData.interpretationDate}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Time</label>
                          <input
                            type="time"
                            name="interpretationTime"
                            value={formData.interpretationTime}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Estimated Duration</label>
                          <input
                            type="text"
                            name="interpretationDuration"
                            placeholder="e.g., 2 hours"
                            value={formData.interpretationDuration}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">Location (City, State)</label>
                          <input
                            type="text"
                            name="interpretationLocation"
                            placeholder="e.g., Miami, FL"
                            value={formData.interpretationLocation}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Contact Information */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Your Contact Information</h2>
                    <p className="text-sm text-gray-600">We&apos;ll use this to send you your quote.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">First Name *</label>
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
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name *</label>
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
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address *</label>
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
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number *</label>
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
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Company (Optional)</label>
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
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Review & Submit</h2>
                    <p className="text-sm text-gray-600">Please review your information before submitting.</p>
                  </div>

                  {/* Summary */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Service Details
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Service Type:</span>
                          <span className="ml-2 font-medium text-gray-900 capitalize">{formData.serviceType}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Languages:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {languages.find(l => l.id === formData.sourceLanguageId)?.name} → {languages.find(l => l.id === formData.targetLanguageId)?.name}
                          </span>
                        </div>
                        {formData.documentType && (
                          <div>
                            <span className="text-gray-500">Document Type:</span>
                            <span className="ml-2 font-medium text-gray-900 capitalize">{formData.documentType.replace('-', ' ')}</span>
                          </div>
                        )}
                        {formData.interpretationType && (
                          <div>
                            <span className="text-gray-500">Interpretation Type:</span>
                            <span className="ml-2 font-medium text-gray-900 capitalize">{formData.interpretationType}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-blue-600" />
                        Contact Information
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Name:</span>
                          <span className="ml-2 font-medium text-gray-900">{formData.firstName} {formData.lastName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <span className="ml-2 font-medium text-gray-900">{formData.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <span className="ml-2 font-medium text-gray-900">{formData.phone}</span>
                        </div>
                        {formData.company && (
                          <div>
                            <span className="text-gray-500">Company:</span>
                            <span className="ml-2 font-medium text-gray-900">{formData.company}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Additional Notes or Instructions (Optional)
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Any special requirements or questions..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        How did you hear about us?
                      </label>
                      <select
                        name="howDidYouHear"
                        value={formData.howDidYouHear}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-sm"
                      >
                        <option value="">Select (optional)</option>
                        <option value="google">Google Search</option>
                        <option value="referral">Referral</option>
                        <option value="returning">Returning Customer</option>
                        <option value="attorney">Attorney Referral</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="px-5 md:px-8 pb-5 md:pb-8 flex items-center justify-between gap-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-4 py-2.5 text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 text-sm"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Quote Request
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Free Quote
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              2-Hour Response
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              No Obligation
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
