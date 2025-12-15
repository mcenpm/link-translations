'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  CheckCircle2, Loader2, ArrowRight, ArrowLeft, FileText, Mic, 
  Globe, User, Calendar, MessageSquare, Check, MapPin, Video, Phone, Users,
  CalendarRange, CalendarDays, Plus, X, Clock, ChevronDown, Search,
  MessageCircle, Share2, Download
} from 'lucide-react'

// US States list
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'Washington D.C.' },
]

// US Time Zones
const US_TIMEZONES = [
  { code: 'ET', name: 'Eastern Time (ET)', offset: 'UTC-5/UTC-4' },
  { code: 'CT', name: 'Central Time (CT)', offset: 'UTC-6/UTC-5' },
  { code: 'MT', name: 'Mountain Time (MT)', offset: 'UTC-7/UTC-6' },
  { code: 'PT', name: 'Pacific Time (PT)', offset: 'UTC-8/UTC-7' },
  { code: 'AKT', name: 'Alaska Time (AKT)', offset: 'UTC-9/UTC-8' },
  { code: 'HT', name: 'Hawaii Time (HT)', offset: 'UTC-10' },
]

interface Language {
  id: string
  name: string
  code: string | null
}

interface DateTimeEntry {
  id: string
  date: string
  startTime: string
  endTime: string
}

// Generate hours array (1-12)
const HOURS_12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
// Generate minutes array (00-59)
const MINUTES_60 = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

// Helper to convert 24h to 12h format
const to12Hour = (time24: string): { hour: string; minute: string; period: 'AM' | 'PM' } => {
  if (!time24) return { hour: '', minute: '', period: 'AM' }
  const [h, m] = time24.split(':')
  const hour24 = parseInt(h)
  const period = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
  return { hour: hour12.toString().padStart(2, '0'), minute: m, period }
}

// Helper to convert 12h to 24h format
const to24Hour = (hour: string, minute: string, period: 'AM' | 'PM'): string => {
  if (!hour || !minute) return ''
  let h = parseInt(hour)
  if (period === 'AM' && h === 12) h = 0
  else if (period === 'PM' && h !== 12) h += 12
  return `${h.toString().padStart(2, '0')}:${minute}`
}

// MUI-style TimePicker Component
interface TimePickerProps {
  value: string
  onChange: (value: string) => void
}

function TimePicker({ value, onChange }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hourInput, setHourInput] = useState('')
  const [minuteInput, setMinuteInput] = useState('')
  const [periodInput, setPeriodInput] = useState<'AM' | 'PM' | ''>('')
  const [focusedSection, setFocusedSection] = useState<'hour' | 'minute' | 'period' | null>(null)
  const [inputBuffer, setInputBuffer] = useState('')
  
  const containerRef = useRef<HTMLDivElement>(null)
  const hourRef = useRef<HTMLInputElement>(null)
  const minuteRef = useRef<HTMLInputElement>(null)
  const periodRef = useRef<HTMLInputElement>(null)
  const hourScrollRef = useRef<HTMLDivElement>(null)
  const minuteScrollRef = useRef<HTMLDivElement>(null)
  
  // Sync internal state with value prop
  useEffect(() => {
    const { hour, minute, period } = to12Hour(value)
    setHourInput(hour)
    setMinuteInput(minute)
    setPeriodInput(value ? period : '')
  }, [value])
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setFocusedSection(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Scroll to selected value when opening
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        const scrollToSelected = (ref: React.RefObject<HTMLDivElement | null>, val: string) => {
          if (ref.current && val) {
            const selected = ref.current.querySelector(`[data-value="${val}"]`) as HTMLElement
            if (selected) {
              ref.current.scrollTop = selected.offsetTop - ref.current.offsetHeight / 2 + selected.offsetHeight / 2
            }
          }
        }
        scrollToSelected(hourScrollRef, hourInput)
        scrollToSelected(minuteScrollRef, minuteInput)
      })
    }
  }, [isOpen, hourInput, minuteInput])
  
  // Update parent value
  const updateValue = (h: string, m: string, p: 'AM' | 'PM' | '') => {
    if (h && m && p && !h.includes('_') && !m.includes('_')) {
      onChange(to24Hour(h, m, p as 'AM' | 'PM'))
    }
  }
  
  // Move focus to next section
  const goToMinute = () => {
    setInputBuffer('')
    setFocusedSection('minute')
    requestAnimationFrame(() => minuteRef.current?.focus())
  }
  
  const goToPeriod = () => {
    setInputBuffer('')
    setFocusedSection('period')
    requestAnimationFrame(() => periodRef.current?.focus())
  }
  
  const goToHour = () => {
    setInputBuffer('')
    setFocusedSection('hour')
    requestAnimationFrame(() => hourRef.current?.focus())
  }

  // Handle hour input
  const handleHourKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'Tab') {
      e.preventDefault()
      goToMinute()
      return
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      let h = parseInt(hourInput || '12') + (e.key === 'ArrowUp' ? 1 : -1)
      if (h > 12) h = 1
      if (h < 1) h = 12
      const newHour = h.toString().padStart(2, '0')
      setHourInput(newHour)
      updateValue(newHour, minuteInput || '00', periodInput)
      return
    }
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault()
      const newBuffer = inputBuffer + e.key
      const num = parseInt(newBuffer)
      
      if (newBuffer.length === 1) {
        if (num >= 2) {
          // 2-9: set hour and go to minute
          const newHour = num.toString().padStart(2, '0')
          setHourInput(newHour)
          updateValue(newHour, minuteInput || '00', periodInput)
          goToMinute()
        } else {
          // 0 or 1: wait for second digit
          setInputBuffer(newBuffer)
          setHourInput(num + '_')
        }
      } else {
        // Second digit
        let h = num
        if (h > 12) h = parseInt(e.key)
        if (h === 0) h = 12
        const newHour = h.toString().padStart(2, '0')
        setHourInput(newHour)
        updateValue(newHour, minuteInput || '00', periodInput)
        goToMinute()
      }
    }
  }

  // Handle minute input  
  const handleMinuteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'Tab') {
      e.preventDefault()
      goToPeriod()
      return
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goToHour()
      return
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      let m = parseInt(minuteInput || '0') + (e.key === 'ArrowUp' ? 1 : -1)
      if (m > 59) m = 0
      if (m < 0) m = 59
      const newMin = m.toString().padStart(2, '0')
      setMinuteInput(newMin)
      updateValue(hourInput || '12', newMin, periodInput)
      return
    }
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault()
      const newBuffer = inputBuffer + e.key
      const num = parseInt(newBuffer)
      
      if (newBuffer.length === 1) {
        if (num >= 6) {
          // 6-9: set minute and go to period
          const newMin = num.toString().padStart(2, '0')
          setMinuteInput(newMin)
          updateValue(hourInput || '12', newMin, periodInput)
          goToPeriod()
        } else {
          // 0-5: wait for second digit
          setInputBuffer(newBuffer)
          setMinuteInput(num + '_')
        }
      } else {
        // Second digit
        let m = num
        if (m > 59) m = parseInt(e.key)
        const newMin = m.toString().padStart(2, '0')
        setMinuteInput(newMin)
        updateValue(hourInput || '12', newMin, periodInput)
        goToPeriod()
      }
    }
  }

  // Handle period input
  const handlePeriodKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goToMinute()
      return
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const newPeriod: 'AM' | 'PM' = !periodInput
        ? (e.key === 'ArrowDown' ? 'PM' : 'AM')
        : periodInput === 'AM'
          ? 'PM'
          : 'AM'
      setPeriodInput(newPeriod)
      updateValue(hourInput || '12', minuteInput || '00', newPeriod)
      return
    }
    if (e.key === 'a' || e.key === 'A') {
      e.preventDefault()
      setPeriodInput('AM')
      updateValue(hourInput || '12', minuteInput || '00', 'AM')
    }
    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault()
      setPeriodInput('PM')
      updateValue(hourInput || '12', minuteInput || '00', 'PM')
    }
  }
  
  const handleSelectFromPicker = (type: 'hour' | 'minute' | 'period', val: string) => {
    if (type === 'hour') {
      setHourInput(val)
      updateValue(val, minuteInput || '00', periodInput || 'AM')
    } else if (type === 'minute') {
      setMinuteInput(val)
      updateValue(hourInput || '12', val, periodInput || 'AM')
    } else {
      const p = val as 'AM' | 'PM'
      setPeriodInput(p)
      updateValue(hourInput || '12', minuteInput || '00', p)
    }
  }
  
  const getSectionStyle = (section: 'hour' | 'minute' | 'period'): { className: string; style: React.CSSProperties } => {
    const isFocused = focusedSection === section
    const hasValue = section === 'hour' 
      ? hourInput && !hourInput.includes('_') && hourInput !== ''
      : section === 'minute'
        ? minuteInput && !minuteInput.includes('_') && minuteInput !== ''
        : periodInput !== ''
    
    const baseClasses = 'w-7 text-center outline-none cursor-pointer transition-all rounded px-0.5 py-0.5'
    
    if (isFocused) {
      return {
        className: `${baseClasses}`,
        style: { backgroundColor: '#9333ea', color: '#ffffff', caretColor: 'transparent' }
      }
    }
    
    // Not focused
    if (hasValue) {
      return {
        className: `${baseClasses} hover:bg-purple-100`,
        style: { backgroundColor: 'transparent', color: '#374151', caretColor: 'transparent' }
      }
    }
    
    // Placeholder (hh, mm, aa)
    return {
      className: `${baseClasses} hover:bg-purple-100`,
      style: { backgroundColor: 'transparent', color: '#9ca3af', caretColor: 'transparent' }
    }
  }
  
  const getDisplayValue = (section: 'hour' | 'minute' | 'period') => {
    if (section === 'hour') return hourInput.replace('_', ' ') || 'hh'
    if (section === 'minute') return minuteInput.replace('_', ' ') || 'mm'
    return periodInput || 'aa'
  }
  
  return (
    <div className="relative min-w-0" ref={containerRef}>
      {/* Input Field */}
      <div className={`flex items-center border rounded-lg bg-white transition-all ${
        focusedSection ? 'border-purple-500 ring-2 ring-purple-200 shadow-sm' : 'border-gray-200 hover:border-purple-300'
      }`}>
        <div className="flex items-center px-2 py-1.5 flex-1 text-sm font-mono min-w-0">
          {/* Hour */}
          <input
            ref={hourRef}
            type="text"
            readOnly
            value={getDisplayValue('hour')}
            className={getSectionStyle('hour').className}
            style={getSectionStyle('hour').style}
            onFocus={() => { setInputBuffer(''); setFocusedSection('hour') }}
            onBlur={() => {
              if (hourInput.includes('_')) {
                const h = parseInt(hourInput) || 12
                setHourInput(h.toString().padStart(2, '0'))
                updateValue(h.toString().padStart(2, '0'), minuteInput || '00', periodInput)
              }
              setInputBuffer('')
            }}
            onKeyDown={handleHourKeyDown}
          />
          <span className="text-gray-400 font-bold mx-0.5">:</span>
          {/* Minute */}
          <input
            ref={minuteRef}
            type="text"
            readOnly
            value={getDisplayValue('minute')}
            className={getSectionStyle('minute').className}
            style={getSectionStyle('minute').style}
            onFocus={() => { setInputBuffer(''); setFocusedSection('minute') }}
            onBlur={() => {
              if (minuteInput.includes('_')) {
                const m = parseInt(minuteInput) || 0
                setMinuteInput(m.toString().padStart(2, '0'))
                updateValue(hourInput || '12', m.toString().padStart(2, '0'), periodInput)
              }
              setInputBuffer('')
            }}
            onKeyDown={handleMinuteKeyDown}
          />
          <span className="w-1" />
          {/* Period */}
          <input
            ref={periodRef}
            type="text"
            readOnly
            value={getDisplayValue('period')}
            className={getSectionStyle('period').className}
            style={getSectionStyle('period').style}
            onFocus={() => { setInputBuffer(''); setFocusedSection('period') }}
            onKeyDown={handlePeriodKeyDown}
          />
        </div>
        
        {/* Clock Icon Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 py-2 hover:bg-purple-50 rounded-r-lg transition-colors border-l border-gray-200 flex-shrink-0"
        >
          <Clock className="w-4 h-4 text-purple-500" />
        </button>
      </div>
      
      {/* Dropdown Picker */}
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden" style={{ width: '220px' }}>
          <div className="flex h-52">
            {/* Hours Column */}
            <div 
              ref={hourScrollRef}
              className="flex-1 overflow-y-auto border-r border-gray-100"
              style={{ scrollbarWidth: 'thin' }}
            >
              {HOURS_12.map(h => (
                <div
                  key={h}
                  data-value={h}
                  onClick={() => handleSelectFromPicker('hour', h)}
                  className={`px-3 py-2 text-center cursor-pointer transition-colors text-sm ${
                    hourInput === h 
                      ? 'bg-purple-600 text-white font-medium' 
                      : 'hover:bg-purple-50 text-gray-700'
                  }`}
                >
                  {h}
                </div>
              ))}
            </div>
            
            {/* Minutes Column */}
            <div 
              ref={minuteScrollRef}
              className="flex-1 overflow-y-auto border-r border-gray-100"
              style={{ scrollbarWidth: 'thin' }}
            >
              {MINUTES_60.map(m => (
                <div
                  key={m}
                  data-value={m}
                  onClick={() => handleSelectFromPicker('minute', m)}
                  className={`px-3 py-2 text-center cursor-pointer transition-colors text-sm ${
                    minuteInput === m 
                      ? 'bg-purple-600 text-white font-medium' 
                      : 'hover:bg-purple-50 text-gray-700'
                  }`}
                >
                  {m}
                </div>
              ))}
            </div>
            
            {/* AM/PM Column */}
            <div className="w-14 flex flex-col">
              {(['AM', 'PM'] as const).map(p => (
                <div
                  key={p}
                  onClick={() => handleSelectFromPicker('period', p)}
                  className={`flex-1 flex items-center justify-center cursor-pointer transition-colors text-sm font-medium ${
                    periodInput === p 
                      ? 'bg-purple-600 text-white' 
                      : 'hover:bg-purple-50 text-gray-700'
                  }`}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// DatePicker Component with MM/DD/YYYY format
interface DatePickerProps {
  value: string // ISO format: YYYY-MM-DD
  onChange: (value: string) => void
  disabled?: boolean
  minDate?: string // ISO format: YYYY-MM-DD, defaults to today
}

// Get today's date in ISO format
const getTodayISO = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

function DatePicker({ value, onChange, disabled = false, minDate }: DatePickerProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [error, setError] = useState('')
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  
  // Use today as default minimum date
  const minimumDate = minDate ?? getTodayISO()
  
  // Convert ISO to MM/DD/YYYY for display
  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split('-')
      setDisplayValue(`${month}/${day}/${year}`)
    } else {
      setDisplayValue('')
    }
  }, [value])
  
  // Check if date is valid (not in the past)
  const isDateValid = (isoDate: string): boolean => {
    return isoDate >= minimumDate
  }
  
  // Handle text input with auto-formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^\d/]/g, '')
    
    // Auto-add slashes
    if (input.length === 2 && !input.includes('/')) {
      input = input + '/'
    } else if (input.length === 5 && input.split('/').length === 2) {
      input = input + '/'
    }
    
    // Limit to MM/DD/YYYY format (10 chars)
    if (input.length > 10) {
      input = input.slice(0, 10)
    }
    
    setDisplayValue(input)
    setError('')
    
    // Parse and validate when complete
    if (input.length === 10) {
      const parts = input.split('/')
      if (parts.length === 3) {
        const [month, day, year] = parts
        const m = parseInt(month)
        const d = parseInt(day)
        const y = parseInt(year)
        
        if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
          // Convert to ISO format for storage
          const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
          
          if (isDateValid(isoDate)) {
            onChange(isoDate)
          } else {
            setError('Past dates not allowed')
            // Reset to empty or keep showing error
            setTimeout(() => setError(''), 2000)
          }
        }
      }
    } else if (input === '') {
      onChange('')
    }
  }
  
  // Handle native date picker change
  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoValue = e.target.value
    if (isoValue) {
      if (isDateValid(isoValue)) {
        onChange(isoValue)
      }
    }
  }
  
  // Open native date picker when clicking the calendar icon
  const openDatePicker = () => {
    if (!disabled && hiddenInputRef.current) {
      hiddenInputRef.current.showPicker()
    }
  }
  
  return (
    <div className="relative min-w-0">
      <div className={`flex border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent ${error ? 'border-red-400' : 'border-gray-200'}`}>
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          placeholder="mm/dd/yyyy"
          disabled={disabled}
          className="flex-1 min-w-0 px-3 py-2 text-sm focus:outline-none bg-transparent"
        />
        <input
          ref={hiddenInputRef}
          type="date"
          value={value}
          min={minimumDate}
          onChange={handleNativeDateChange}
          className="sr-only"
          tabIndex={-1}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={openDatePicker}
          disabled={disabled}
          className="px-2 py-2 hover:bg-purple-50 transition-colors border-l border-gray-200 flex-shrink-0"
        >
          <Calendar className="w-4 h-4 text-purple-500" />
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

interface QuoteWizardProps {
  languages: Language[]
}

type Step = 1 | 2 | 3 | 4
type DateSelectionMode = 'single' | 'range' | 'multiple'
type TimeMode = 'same' | 'different'

// Parse step name to number
const getStepFromName = (name: string): Step => {
  const stepMap: Record<string, Step> = { service: 1, details: 2, contact: 3, review: 4 }
  return stepMap[name] || 1
}

// Generate date entries for a date range
const generateDateEntriesForRange = (startDate: string, endDate: string): DateTimeEntry[] => {
  const entries: DateTimeEntry[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (start > end) return entries
  
  const current = new Date(start)
  let id = 1
  while (current <= end) {
    entries.push({
      id: id.toString(),
      date: current.toISOString().split('T')[0],
      startTime: '',
      endTime: ''
    })
    current.setDate(current.getDate() + 1)
    id++
  }
  
  return entries
}

export default function QuoteWizard({ languages }: QuoteWizardProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, update: updateSession } = useSession()
  const initialService = searchParams.get('service') || ''
  const stepParam = searchParams.get('step') || 'service'
  const resetParam = searchParams.get('reset')
  
  const [currentStep, setCurrentStep] = useState<Step>(getStepFromName(stepParam))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [quoteNumber, setQuoteNumber] = useState('')
  const [projectId, setProjectId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showConsecutiveWarning, setShowConsecutiveWarning] = useState(false)
  
  // Review step fields
  const [couponCode, setCouponCode] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'payment-code' | null>(null)
  const [paymentCode, setPaymentCode] = useState('')
  const [paymentCodeError, setPaymentCodeError] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [createdQuoteId, setCreatedQuoteId] = useState('')
  const [corporatePaymentEnabled, setCorporatePaymentEnabled] = useState(false)
  
  // Auth mode for contact step: null = choose, 'signin' = sign in form, 'signup' = sign up form
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>(null)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [signUpData, setSignUpData] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [signInData, setSignInData] = useState({ email: '', password: '' })
  
  // Pricing state for interpretation
  const [pricing, setPricing] = useState<{
    loading: boolean
    error: string | null
    data: {
      totalHours: number
      hourlyRate: number
      hoursSubtotal: number
      travelFee: number
      rushFee: number
      isRush: boolean
      isSameDay: boolean
      minimumHours: number
      appliedMinimum: boolean
      total: number
      breakdown: string[]
    } | null
  }>({ loading: false, error: null, data: null })
  
  // Subject matters that require consecutive mode only
  const consecutiveOnlySubjects = ['deposition', 'uscis', 'hearing', 'mediation']
  
  // State dropdown states
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false)
  const [stateSearchTerm, setStateSearchTerm] = useState('')
  const stateDropdownRef = useRef<HTMLDivElement>(null)
  
  // Target language dropdown states (for interpretation)
  const [targetLangDropdownOpen, setTargetLangDropdownOpen] = useState(false)
  const [targetLangSearchTerm, setTargetLangSearchTerm] = useState('')
  const targetLangDropdownRef = useRef<HTMLDivElement>(null)

  // Default form data
  const defaultFormData = {
    // Step 1: Service Type
    serviceType: '',
    
    // Step 2: Languages & Details
    sourceLanguageId: '',
    targetLanguageId: '',
    documentType: '',
    wordCount: '',
    deadline: '',
    interpretationType: '',
    interpretationSetting: '', // In-Person, Video-Remote, Over the Phone
    interpretationMode: '', // Consecutive, Simultaneous
    subjectMatterType: '' as 'deposition' | 'uscis' | 'hearing' | 'mediation' | 'other' | '',
    subjectMatter: '',
    // New date/time structure
    dateSelectionMode: '' as DateSelectionMode | '',
    timeMode: 'same' as TimeMode,
    dateRangeStart: '',
    dateRangeEnd: '',
    sharedStartTime: '',
    sharedEndTime: '',
    dateTimeEntries: [] as DateTimeEntry[],
    interpretationLocation: '',
    interpretationCity: '',
    interpretationState: '',
    timeZone: '', // For video/phone interpretation
    
    // Step 3: Contact Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    
    // Step 4: Additional Info
    description: '',
    howDidYouHear: '',
  }

  const [formData, setFormData] = useState({
    ...defaultFormData,
    serviceType: initialService,
  })

  // Reset form when navigating to /quote fresh (step=service or no step)
  useEffect(() => {
    if (stepParam === 'service' || resetParam === 'true') {
      setCurrentStep(1)
      setSubmitStatus('idle')
      setErrorMessage('')
      setFormData({
        ...defaultFormData,
        serviceType: initialService,
      })
      // Remove reset param from URL
      if (resetParam) {
        router.replace(pathname, { scroll: false })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetParam])

  // Close state dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
        setStateDropdownOpen(false)
      }
      if (targetLangDropdownRef.current && !targetLangDropdownRef.current.contains(event.target as Node)) {
        setTargetLangDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Find English language and set as default for interpretation
  const englishLanguage = languages.find(lang => lang.name.toLowerCase() === 'english')
  
  useEffect(() => {
    if (englishLanguage && formData.serviceType === 'interpretation' && !formData.sourceLanguageId) {
      setFormData(prev => ({ ...prev, sourceLanguageId: englishLanguage.id }))
    }
  }, [englishLanguage, formData.serviceType, formData.sourceLanguageId])
  
  // Filter target languages (exclude English for interpretation)
  const filteredTargetLanguages = formData.serviceType === 'interpretation'
    ? languages.filter(lang => lang.name.toLowerCase() !== 'english' && 
        lang.name.toLowerCase().includes(targetLangSearchTerm.toLowerCase()))
    : languages

  // Filter states based on search term
  const filteredStates = US_STATES.filter(state => 
    state.name.toLowerCase().includes(stateSearchTerm.toLowerCase()) ||
    state.code.toLowerCase().includes(stateSearchTerm.toLowerCase())
  )

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

  // Check for saved form data after Google login callback
  useEffect(() => {
    if (session?.user && typeof window !== 'undefined') {
      const savedData = localStorage.getItem('quoteFormData')
      const savedPricing = localStorage.getItem('quotePricingData')
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          setFormData(parsed)
          
          // Restore pricing data if available
          if (savedPricing) {
            try {
              const parsedPricing = JSON.parse(savedPricing)
              setPricing({ loading: false, error: null, data: parsedPricing })
              localStorage.removeItem('quotePricingData')
            } catch {
              // Pricing will be recalculated
            }
          }
          
          // Move to review step
          const isCustomer = (session.user as { role?: string }).role === 'CUSTOMER'
          const reviewStep = isCustomer ? 3 : 4
          setCurrentStep(reviewStep as Step)
          
          localStorage.removeItem('quoteFormData')
        } catch {
          localStorage.removeItem('quoteFormData')
          localStorage.removeItem('quotePricingData')
        }
      }
    }
  }, [session])

  // Create quote when entering review step
  useEffect(() => {
    const createQuoteOnReview = async () => {
      const isCustomer = (session?.user as { role?: string })?.role === 'CUSTOMER'
      const reviewStep = isCustomer ? 3 : 4
      
      // Only create quote if we're on review step, have session, pricing data, and haven't created quote yet
      if (
        currentStep === reviewStep && 
        session?.user && 
        pricing.data && 
        !createdQuoteId &&
        !isSubmitting
      ) {
        try {
          // Build submit data
          const submitData = {
            firstName: formData.firstName || session.user.name?.split(' ')[0] || '',
            lastName: formData.lastName || session.user.name?.split(' ').slice(1).join(' ') || '',
            email: formData.email || session.user.email || '',
            phone: formData.phone || '',
            company: formData.company || '',
            serviceType: formData.serviceType,
            sourceLanguageId: formData.sourceLanguageId,
            targetLanguageId: formData.targetLanguageId,
            interpretationSetting: formData.interpretationSetting,
            interpretationMode: formData.interpretationMode,
            subjectMatter: formData.subjectMatter,
            interpretationCity: formData.interpretationCity,
            interpretationState: formData.interpretationState,
            timeZone: formData.timeZone,
            dateTimeEntries: formData.dateTimeEntries,
            description: formData.description,
            pricingData: pricing.data,
          }

          const response = await fetch('/api/quote-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submitData)
          })

          const data = await response.json()

          if (response.ok && data.success) {
            setQuoteNumber(data.quoteNumber)
            setCreatedQuoteId(data.quoteId)
            
            // Update URL to quote page
            window.history.replaceState({}, '', `/quote/${data.quoteNumber}`)
          }
        } catch (error) {
          console.error('Failed to create quote on review:', error)
        }
      }
    }

    createQuoteOnReview()
  }, [currentStep, session, pricing.data, createdQuoteId, isSubmitting, formData])

  // Check if corporate has payment code enabled
  useEffect(() => {
    const checkCorporatePayment = async () => {
      if (session?.user && (session.user as { role?: string }).role === 'CUSTOMER') {
        try {
          const response = await fetch('/api/customer/payment-settings')
          if (response.ok) {
            const data = await response.json()
            setCorporatePaymentEnabled(data.paymentCodeEnabled || false)
          }
        } catch {
          setCorporatePaymentEnabled(false)
        }
      }
    }
    checkCorporatePayment()
  }, [session])

  // Auto-populate contact info from session if logged in
  useEffect(() => {
    if (session?.user) {
      const nameParts = session.user.name?.split(' ') || ['', '']
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || nameParts[0] || '',
        lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
        email: prev.email || session.user?.email || '',
      }))
    }
  }, [session])

  // Calculate interpretation pricing when relevant fields change
  useEffect(() => {
    const calculatePrice = async () => {
      // Only calculate for interpretation with required fields
      if (
        formData.serviceType !== 'interpretation' ||
        !formData.sourceLanguageId ||
        !formData.targetLanguageId ||
        !formData.interpretationSetting
      ) {
        setPricing({ loading: false, error: null, data: null })
        return
      }
      
      // Check for on-site requirements
      if (formData.interpretationSetting === 'in-person' && !formData.interpretationState) {
        setPricing({ loading: false, error: null, data: null })
        return
      }
      
      // Check for video/phone requirements
      if ((formData.interpretationSetting === 'video-remote' || formData.interpretationSetting === 'phone') && !formData.timeZone) {
        setPricing({ loading: false, error: null, data: null })
        return
      }
      
      // Build date/time entries based on selection mode
      let entriesToCalculate: Array<{ date: string; startTime: string; endTime: string }> = []
      
      if (formData.dateSelectionMode === 'range' && formData.dateRangeStart && formData.dateRangeEnd) {
        // Date range mode
        if (formData.timeMode === 'same' && formData.sharedStartTime && formData.sharedEndTime) {
          // Same time for all days - generate entries for each day in range
          const startDate = new Date(formData.dateRangeStart)
          const endDate = new Date(formData.dateRangeEnd)
          const currentDate = new Date(startDate)
          
          while (currentDate <= endDate) {
            entriesToCalculate.push({
              date: currentDate.toISOString().split('T')[0],
              startTime: formData.sharedStartTime,
              endTime: formData.sharedEndTime,
            })
            currentDate.setDate(currentDate.getDate() + 1)
          }
        } else if (formData.timeMode === 'different') {
          // Different times per day - use dateTimeEntries
          entriesToCalculate = formData.dateTimeEntries.filter(
            entry => entry.date && entry.startTime && entry.endTime
          ).map(entry => ({
            date: entry.date,
            startTime: entry.startTime,
            endTime: entry.endTime,
          }))
        }
      } else if (formData.dateSelectionMode === 'multiple') {
        // Multiple specific dates mode
        if (formData.timeMode === 'same' && formData.sharedStartTime && formData.sharedEndTime) {
          // Same time for all selected dates
          entriesToCalculate = formData.dateTimeEntries.filter(
            entry => entry.date
          ).map(entry => ({
            date: entry.date,
            startTime: formData.sharedStartTime,
            endTime: formData.sharedEndTime,
          }))
        } else {
          // Different times per date
          entriesToCalculate = formData.dateTimeEntries.filter(
            entry => entry.date && entry.startTime && entry.endTime
          ).map(entry => ({
            date: entry.date,
            startTime: entry.startTime,
            endTime: entry.endTime,
          }))
        }
      } else if (formData.dateSelectionMode === 'single') {
        // Single date mode - use first entry or generate from shared times
        if (formData.dateTimeEntries.length > 0 && formData.dateTimeEntries[0].date) {
          const entry = formData.dateTimeEntries[0]
          const startTime = entry.startTime || formData.sharedStartTime
          const endTime = entry.endTime || formData.sharedEndTime
          if (startTime && endTime) {
            entriesToCalculate.push({
              date: entry.date,
              startTime,
              endTime,
            })
          }
        }
      }
      
      // Check if we have valid entries to calculate
      if (entriesToCalculate.length === 0) {
        setPricing({ loading: false, error: null, data: null })
        return
      }
      
      setPricing(prev => ({ ...prev, loading: true, error: null }))
      
      try {
        const response = await fetch('/api/pricing/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceLanguageId: formData.sourceLanguageId,
            targetLanguageId: formData.targetLanguageId,
            interpretationSetting: formData.interpretationSetting,
            state: formData.interpretationState,
            timeZone: formData.timeZone,
            dateTimeEntries: entriesToCalculate,
          }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          setPricing({ loading: false, error: data.error || 'Failed to calculate price', data: null })
        } else {
          setPricing({ loading: false, error: null, data })
        }
      } catch {
        setPricing({ loading: false, error: 'Failed to calculate price', data: null })
      }
    }
    
    // Debounce the calculation
    const timeoutId = setTimeout(calculatePrice, 500)
    return () => clearTimeout(timeoutId)
  }, [
    formData.serviceType,
    formData.sourceLanguageId,
    formData.targetLanguageId,
    formData.interpretationSetting,
    formData.interpretationState,
    formData.timeZone,
    formData.dateSelectionMode,
    formData.timeMode,
    formData.dateRangeStart,
    formData.dateRangeEnd,
    formData.sharedStartTime,
    formData.sharedEndTime,
    formData.dateTimeEntries,
  ])

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

  // Check if user is logged in as CUSTOMER - skip contact step only for customers
  const isCustomerLoggedIn = !!session?.user && (session.user as { role?: string }).role === 'CUSTOMER'
  
  // Total steps based on login status
  const totalSteps = isCustomerLoggedIn ? 3 : 4
  
  // Check if current step is the review step
  const isReviewStep = isCustomerLoggedIn ? currentStep === 3 : currentStep === 4

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.serviceType
      case 2:
        if (!formData.sourceLanguageId || !formData.targetLanguageId) return false
        
        // Interpretation-specific validations
        if (formData.serviceType === 'interpretation') {
          // Subject matter is required
          if (!formData.subjectMatterType || !formData.subjectMatter.trim()) return false
          
          // Date selection is required
          if (!formData.dateSelectionMode) return false
          
          // Check date and time requirements based on selection mode
          if (formData.dateSelectionMode === 'range') {
            if (!formData.dateRangeStart || !formData.dateRangeEnd) return false
            // Time validation for range
            if (formData.timeMode === 'same') {
              if (!formData.sharedStartTime || !formData.sharedEndTime) return false
            } else {
              // Different times - check each entry
              const hasValidEntries = formData.dateTimeEntries.some(e => e.date && e.startTime && e.endTime)
              if (!hasValidEntries) return false
            }
          } else if (formData.dateSelectionMode === 'multiple') {
            if (formData.dateTimeEntries.length === 0 || !formData.dateTimeEntries[0].date) return false
            // Time validation for multiple
            if (formData.timeMode === 'same') {
              if (!formData.sharedStartTime || !formData.sharedEndTime) return false
            } else {
              const hasValidEntries = formData.dateTimeEntries.some(e => e.date && e.startTime && e.endTime)
              if (!hasValidEntries) return false
            }
          } else {
            // Single date mode
            if (formData.dateTimeEntries.length === 0 || !formData.dateTimeEntries[0].date) return false
            const entry = formData.dateTimeEntries[0]
            if (!entry.startTime || !entry.endTime) return false
          }
          
          // In-person requires location
          if (formData.interpretationSetting === 'in-person') {
            if (!formData.interpretationLocation.trim() || !formData.interpretationCity.trim() || !formData.interpretationState) return false
          }
          
          // Video/Phone requires time zone
          if ((formData.interpretationSetting === 'video-remote' || formData.interpretationSetting === 'phone') && !formData.timeZone) return false
        }
        
        return true
      case 3:
        // If customer is logged in, step 3 is the Review step (no validation needed)
        // If not logged in as customer, step 3 is Contact Information - user must sign in/up
        if (isCustomerLoggedIn) {
          return true // Review step
        }
        // Contact step requires authentication - cannot proceed without signing in/up
        return false
      case 4:
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps && canProceed()) {
      setCurrentStep((currentStep + 1) as Step)
      // Scroll to top of page when changing steps
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
      // Scroll to top of page when changing steps
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setIsProcessingPayment(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      let quoteId = createdQuoteId
      let currentQuoteNumber = quoteNumber

      // Only create quote if not already created
      if (!quoteId) {
        // If customer is logged in, use session data for contact info
        const submitData = isCustomerLoggedIn && session?.user ? {
          ...formData,
          firstName: session.user.name?.split(' ')[0] || formData.firstName || 'Customer',
          lastName: session.user.name?.split(' ').slice(1).join(' ') || formData.lastName || '',
          email: session.user.email || formData.email,
          phone: formData.phone || 'Not provided',
          couponCode,
          referenceNumber,
          paymentMethod,
          pricingData: pricing.data,
        } : {
          ...formData,
          couponCode,
          referenceNumber,
          paymentMethod,
          pricingData: pricing.data,
        }

        // Create quote in database
        const quoteResponse = await fetch('/api/quote-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        })

        const quoteData = await quoteResponse.json()

        if (!quoteResponse.ok || !quoteData.success) {
          throw new Error(quoteData.error || 'Failed to create quote')
        }

        // Store the created quote info
        quoteId = quoteData.quoteId
        currentQuoteNumber = quoteData.quoteNumber
        setQuoteNumber(quoteData.quoteNumber)
        setCreatedQuoteId(quoteData.quoteId)
        
        // Update URL to include quote number (without page reload)
        window.history.replaceState({}, '', `/quote/${quoteData.quoteNumber}`)
      }

      // If payment code method, validate and process
      if (paymentMethod === 'payment-code') {
        // Validate payment code
        const validateResponse = await fetch('/api/customer/validate-payment-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentCode, quoteId })
        })
        
        const validateData = await validateResponse.json()
        
        if (!validateResponse.ok || !validateData.valid) {
          setPaymentCodeError(validateData.error || 'Invalid payment code')
          throw new Error(validateData.error || 'Invalid payment code')
        }
        
        // Payment code valid - mark as paid and redirect to dashboard
        setSubmitStatus('success')
        router.push('/customer/dashboard')
        return
      }

      // Create Stripe checkout session for card payment
      const customerEmail = session?.user?.email || formData.email
      const customerName = session?.user?.name || `${formData.firstName} ${formData.lastName}`
      
      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId,
          amount: pricing.data?.total || 0,
          customerEmail,
          customerName,
          description: `Interpretation Service - ${languages.find(l => l.id === formData.sourceLanguageId)?.name} to ${languages.find(l => l.id === formData.targetLanguageId)?.name}`,
        })
      })

      const checkoutData = await checkoutResponse.json()

      if (!checkoutResponse.ok || !checkoutData.url) {
        throw new Error(checkoutData.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = checkoutData.url

    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
      setIsProcessingPayment(false)
    }
  }

  // Define steps - if customer is logged in, we skip the Contact step
  const steps = isCustomerLoggedIn 
    ? [
        { number: 1, title: 'Service', icon: FileText },
        { number: 2, title: 'Details', icon: Globe },
        { number: 3, title: 'Review', icon: MessageSquare },
      ]
    : [
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
                      interpretationType: '', interpretationSetting: '', interpretationMode: '',
                      subjectMatterType: '', subjectMatter: '', dateSelectionMode: '', timeMode: 'same',
                      dateRangeStart: '', dateRangeEnd: '', sharedStartTime: '', sharedEndTime: '',
                      dateTimeEntries: [], interpretationLocation: '',
                      interpretationCity: '', interpretationState: '', timeZone: '',
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
        <div className={`mx-auto transition-all duration-300 ${isReviewStep ? 'max-w-4xl' : 'max-w-xl'}`}>
          {/* Header - Hide on Review step */}
          {!isReviewStep && (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Get a Free Quote
              </h1>
              <p className="text-sm text-gray-600">
                Tell us about your project and we&apos;ll provide a detailed quote within 2 hours.
              </p>
            </div>
          )}

          {/* Progress Steps - Hide on Review step */}
          {!isReviewStep && (
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
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
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
                      {formData.serviceType === 'interpretation' ? (
                        <div className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-sm text-gray-700 cursor-not-allowed">
                          English
                        </div>
                      ) : (
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
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        {formData.serviceType === 'interpretation' ? 'Requested Language *' : 'Target Language *'}
                      </label>
                      {formData.serviceType === 'interpretation' ? (
                        <div className="relative" ref={targetLangDropdownRef}>
                          <div
                            onClick={() => setTargetLangDropdownOpen(!targetLangDropdownOpen)}
                            className={`w-full px-3 py-2.5 border rounded-lg transition-all bg-white text-sm cursor-pointer flex items-center justify-between ${
                              targetLangDropdownOpen ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <span className={formData.targetLanguageId ? 'text-gray-900' : 'text-gray-400'}>
                              {formData.targetLanguageId 
                                ? languages.find(l => l.id === formData.targetLanguageId)?.name 
                                : 'Search and select language...'}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${targetLangDropdownOpen ? 'rotate-180' : ''}`} />
                          </div>
                          {targetLangDropdownOpen && (
                            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                              <div className="p-2 border-b border-gray-100">
                                <div className="relative">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <input
                                    type="text"
                                    placeholder="Search languages..."
                                    value={targetLangSearchTerm}
                                    onChange={(e) => setTargetLangSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {filteredTargetLanguages.length > 0 ? (
                                  filteredTargetLanguages.map(lang => (
                                    <div
                                      key={lang.id}
                                      onClick={() => {
                                        setFormData(prev => ({ ...prev, targetLanguageId: lang.id }))
                                        setTargetLangDropdownOpen(false)
                                        setTargetLangSearchTerm('')
                                      }}
                                      className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                                        formData.targetLanguageId === lang.id
                                          ? 'bg-purple-100 text-purple-700 font-medium'
                                          : 'hover:bg-purple-50 text-gray-700'
                                      }`}
                                    >
                                      {lang.name}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                                    No languages found
                                  </div>
                                )}
                              </div>
                              {filteredTargetLanguages.length > 5 && (
                                <div className="px-3 py-1.5 text-xs text-gray-400 text-center border-t border-gray-100 bg-gray-50">
                                  ↓ Scroll for more languages
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
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
                      )}
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
                          <DatePicker
                            value={formData.deadline}
                            onChange={(value) => setFormData(prev => ({ ...prev, deadline: value }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interpretation-specific fields */}
                  {formData.serviceType === 'interpretation' && (
                    <div className="space-y-4 pt-3 border-t border-gray-100">
                      {/* Setting Selection - Quick Icons */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Setting *</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, interpretationSetting: 'in-person' }))}
                            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                              formData.interpretationSetting === 'in-person'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                            }`}
                          >
                            {formData.interpretationSetting === 'in-person' && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <MapPin className={`w-5 h-5 ${formData.interpretationSetting === 'in-person' ? 'text-purple-600' : 'text-gray-500'}`} />
                            <span className={`text-xs font-semibold ${formData.interpretationSetting === 'in-person' ? 'text-purple-700' : 'text-gray-600'}`}>In-Person</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, interpretationSetting: 'video-remote' }))}
                            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                              formData.interpretationSetting === 'video-remote'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                            }`}
                          >
                            {formData.interpretationSetting === 'video-remote' && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <Video className={`w-5 h-5 ${formData.interpretationSetting === 'video-remote' ? 'text-purple-600' : 'text-gray-500'}`} />
                            <span className={`text-xs font-semibold ${formData.interpretationSetting === 'video-remote' ? 'text-purple-700' : 'text-gray-600'}`}>Video</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              interpretationSetting: 'phone',
                              interpretationMode: 'consecutive' // Phone requires consecutive mode
                            }))}
                            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                              formData.interpretationSetting === 'phone'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                            }`}
                          >
                            {formData.interpretationSetting === 'phone' && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <Phone className={`w-5 h-5 ${formData.interpretationSetting === 'phone' ? 'text-purple-600' : 'text-gray-500'}`} />
                            <span className={`text-xs font-semibold ${formData.interpretationSetting === 'phone' ? 'text-purple-700' : 'text-gray-600'}`}>Phone</span>
                          </button>
                        </div>
                      </div>

                      {/* Mode of Interpretation - Quick Icons */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Mode of Interpretation *</label>
                        {(consecutiveOnlySubjects.includes(formData.subjectMatterType) || formData.interpretationSetting === 'phone') && (
                          <p className="text-[10px] text-amber-600 mb-2">
                            {formData.interpretationSetting === 'phone' 
                              ? 'Only consecutive interpretation is available for phone interpretation.'
                              : 'Only consecutive interpretation is available for this service type.'}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, interpretationMode: 'consecutive' }))}
                            className={`relative flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                              formData.interpretationMode === 'consecutive'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                            }`}
                          >
                            {formData.interpretationMode === 'consecutive' && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <Users className={`w-5 h-5 ${formData.interpretationMode === 'consecutive' ? 'text-purple-600' : 'text-gray-500'}`} />
                            <div className="text-left">
                              <span className={`text-xs font-semibold block ${formData.interpretationMode === 'consecutive' ? 'text-purple-700' : 'text-gray-700'}`}>Consecutive</span>
                              <span className={`text-[10px] ${formData.interpretationMode === 'consecutive' ? 'text-purple-500' : 'text-gray-500'}`}>Speaker pauses for interpreter</span>
                            </div>
                          </button>
                          <button
                            type="button"
                            disabled={consecutiveOnlySubjects.includes(formData.subjectMatterType) || formData.interpretationSetting === 'phone'}
                            onClick={() => !(consecutiveOnlySubjects.includes(formData.subjectMatterType) || formData.interpretationSetting === 'phone') && setFormData(prev => ({ ...prev, interpretationMode: 'simultaneous' }))}
                            className={`relative flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                              (consecutiveOnlySubjects.includes(formData.subjectMatterType) || formData.interpretationSetting === 'phone')
                                ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                                : formData.interpretationMode === 'simultaneous'
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                            }`}
                          >
                            {formData.interpretationMode === 'simultaneous' && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <Mic className={`w-5 h-5 ${formData.interpretationMode === 'simultaneous' ? 'text-purple-600' : 'text-gray-500'}`} />
                            <div className="text-left">
                              <span className={`text-xs font-semibold block ${formData.interpretationMode === 'simultaneous' ? 'text-purple-700' : 'text-gray-700'}`}>Simultaneous</span>
                              <span className={`text-[10px] ${formData.interpretationMode === 'simultaneous' ? 'text-purple-500' : 'text-gray-500'}`}>Real-time interpretation</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Subject Matter */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Subject Matter *</label>
                        <div className="grid grid-cols-5 gap-2 mb-3">
                          {[
                            { id: 'deposition', label: 'Deposition' },
                            { id: 'uscis', label: 'USCIS Interview' },
                            { id: 'hearing', label: 'Hearing' },
                            { id: 'mediation', label: 'Mediation' },
                            { id: 'other', label: 'Other' },
                          ].map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                const isConsecutiveOnly = consecutiveOnlySubjects.includes(option.id)
                                const wasSimultaneous = formData.interpretationMode === 'simultaneous'
                                
                                setFormData(prev => ({ 
                                  ...prev, 
                                  subjectMatterType: option.id as typeof prev.subjectMatterType,
                                  subjectMatter: '',
                                  // Auto-set consecutive for these subject matters
                                  interpretationMode: isConsecutiveOnly ? 'consecutive' : prev.interpretationMode
                                }))
                                
                                // Show warning if switching from simultaneous
                                if (isConsecutiveOnly && wasSimultaneous) {
                                  setShowConsecutiveWarning(true)
                                  setTimeout(() => setShowConsecutiveWarning(false), 5000)
                                }
                              }}
                              className={`px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                                formData.subjectMatterType === option.id
                                  ? 'border-emerald-600 bg-emerald-500 text-white shadow-md'
                                  : 'border-teal-200 bg-teal-50 text-teal-600 hover:border-teal-400 hover:bg-teal-100'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                        
                        {/* Consecutive-only warning */}
                        {showConsecutiveWarning && (
                          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-800 font-medium">
                              ⚠️ We provide interpretation ONLY IN CONSECUTIVE MODE for this subject matter.
                            </p>
                          </div>
                        )}
                        {formData.subjectMatterType && (
                          <textarea
                            name="subjectMatter"
                            placeholder={formData.subjectMatterType === 'other' 
                              ? 'Enter the subject matter of this request in detail.' 
                              : `Enter the details of the ${formData.subjectMatterType === 'uscis' ? 'USCIS Interview' : formData.subjectMatterType.charAt(0).toUpperCase() + formData.subjectMatterType.slice(1)}...`}
                            value={formData.subjectMatter}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
                          />
                        )}
                      </div>

                      {/* Date Selection Mode */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          <Calendar className="w-3.5 h-3.5 inline mr-1.5 text-purple-600" />
                          Date Selection
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              dateSelectionMode: 'single',
                              dateTimeEntries: prev.dateTimeEntries.length === 0 ? [{ id: '1', date: '', startTime: '', endTime: '' }] : prev.dateTimeEntries.slice(0, 1)
                            }))}
                            className={`relative flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all ${
                              formData.dateSelectionMode === 'single'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 bg-white hover:border-purple-300'
                            }`}
                          >
                            <Calendar className={`w-4 h-4 ${formData.dateSelectionMode === 'single' ? 'text-purple-600' : 'text-gray-500'}`} />
                            <span className={`text-[11px] font-medium ${formData.dateSelectionMode === 'single' ? 'text-purple-700' : 'text-gray-600'}`}>Single Date</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, dateSelectionMode: 'range', dateTimeEntries: [] }))}
                            className={`relative flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all ${
                              formData.dateSelectionMode === 'range'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 bg-white hover:border-purple-300'
                            }`}
                          >
                            <CalendarRange className={`w-4 h-4 ${formData.dateSelectionMode === 'range' ? 'text-purple-600' : 'text-gray-500'}`} />
                            <span className={`text-[11px] font-medium ${formData.dateSelectionMode === 'range' ? 'text-purple-700' : 'text-gray-600'}`}>Date Range</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              dateSelectionMode: 'multiple',
                              dateTimeEntries: prev.dateTimeEntries.length === 0 ? [{ id: '1', date: '', startTime: '', endTime: '' }] : prev.dateTimeEntries
                            }))}
                            className={`relative flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all ${
                              formData.dateSelectionMode === 'multiple'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 bg-white hover:border-purple-300'
                            }`}
                          >
                            <CalendarDays className={`w-4 h-4 ${formData.dateSelectionMode === 'multiple' ? 'text-purple-600' : 'text-gray-500'}`} />
                            <span className={`text-[11px] font-medium ${formData.dateSelectionMode === 'multiple' ? 'text-purple-700' : 'text-gray-600'}`}>Multiple</span>
                          </button>
                        </div>
                      </div>

                      {/* Date Range Mode */}
                      {formData.dateSelectionMode === 'range' && (
                        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                              <DatePicker
                                value={formData.dateRangeStart}
                                onChange={(startDate) => {
                                  setFormData(prev => {
                                    // Generate date entries for range if timeMode is different
                                    if (prev.timeMode === 'different' && startDate && prev.dateRangeEnd) {
                                      const entries = generateDateEntriesForRange(startDate, prev.dateRangeEnd)
                                      return { ...prev, dateRangeStart: startDate, dateTimeEntries: entries }
                                    }
                                    return { ...prev, dateRangeStart: startDate }
                                  })
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                              <DatePicker
                                value={formData.dateRangeEnd}
                                onChange={(endDate) => {
                                  setFormData(prev => {
                                    // Generate date entries for range if timeMode is different
                                    if (prev.timeMode === 'different' && prev.dateRangeStart && endDate) {
                                      const entries = generateDateEntriesForRange(prev.dateRangeStart, endDate)
                                      return { ...prev, dateRangeEnd: endDate, dateTimeEntries: entries }
                                    }
                                    return { ...prev, dateRangeEnd: endDate }
                                  })
                                }}
                              />
                            </div>
                          </div>

                          {/* Time Mode Toggle for Range */}
                          <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                            <span className="text-xs text-gray-600">Time:</span>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, timeMode: 'same', dateTimeEntries: [] }))}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                                formData.timeMode === 'same' 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-white text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              Same for all days
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (formData.dateRangeStart && formData.dateRangeEnd) {
                                  const entries = generateDateEntriesForRange(formData.dateRangeStart, formData.dateRangeEnd)
                                  setFormData(prev => ({ ...prev, timeMode: 'different', dateTimeEntries: entries }))
                                } else {
                                  setFormData(prev => ({ ...prev, timeMode: 'different' }))
                                }
                              }}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                                formData.timeMode === 'different' 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-white text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              Different per day
                            </button>
                          </div>

                          {/* Same time for all days */}
                          {formData.timeMode === 'same' && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  Start Time (all days)
                                </label>
                                <TimePicker
                                  value={formData.sharedStartTime}
                                  onChange={(value) => {
                                    // If start time is after or equal to end time, clear end time
                                    if (formData.sharedEndTime && value >= formData.sharedEndTime) {
                                      setFormData(prev => ({ ...prev, sharedStartTime: value, sharedEndTime: '' }))
                                    } else {
                                      setFormData(prev => ({ ...prev, sharedStartTime: value }))
                                    }
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">End Time (all days)</label>
                                <TimePicker
                                  value={formData.sharedEndTime}
                                  onChange={(value) => setFormData(prev => ({ ...prev, sharedEndTime: value }))}
                                />
                              </div>
                            </div>
                          )}

                          {/* Different time per day */}
                          {formData.timeMode === 'different' && formData.dateTimeEntries.length > 0 && (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {formData.dateTimeEntries.map((entry, index) => (
                                <div key={entry.id} className="grid grid-cols-3 gap-2 p-2 bg-white rounded border border-gray-100">
                                  <div>
                                    <label className="block text-[10px] font-medium text-gray-500 mb-1">
                                      {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </label>
                                    <DatePicker
                                      value={entry.date}
                                      onChange={() => {}}
                                      disabled
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Start</label>
                                    <TimePicker
                                      value={entry.startTime}
                                      onChange={(value) => {
                                        const newEntries = [...formData.dateTimeEntries]
                                        // If start time is after or equal to end time, clear end time
                                        if (entry.endTime && value >= entry.endTime) {
                                          newEntries[index] = { ...entry, startTime: value, endTime: '' }
                                        } else {
                                          newEntries[index] = { ...entry, startTime: value }
                                        }
                                        setFormData(prev => ({ ...prev, dateTimeEntries: newEntries }))
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-medium text-gray-500 mb-1">End</label>
                                    <TimePicker
                                      value={entry.endTime}
                                      onChange={(value) => {
                                        const newEntries = [...formData.dateTimeEntries]
                                        newEntries[index] = { ...entry, endTime: value }
                                        setFormData(prev => ({ ...prev, dateTimeEntries: newEntries }))
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Single or Multiple Dates Mode */}
                      {(formData.dateSelectionMode === 'single' || formData.dateSelectionMode === 'multiple') && (
                        <div className="space-y-3">
                          {/* Time Mode Toggle (only for multiple) */}
                          {formData.dateSelectionMode === 'multiple' && formData.dateTimeEntries.length > 1 && (
                            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                              <span className="text-xs text-gray-600">Time:</span>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, timeMode: 'same' }))}
                                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                                  formData.timeMode === 'same' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                Same for all
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, timeMode: 'different' }))}
                                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                                  formData.timeMode === 'different' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                Different per date
                              </button>
                            </div>
                          )}

                          {/* Shared Time (when same for all) */}
                          {formData.dateSelectionMode === 'multiple' && formData.timeMode === 'same' && formData.dateTimeEntries.length > 1 && (
                            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  Start Time (all dates)
                                </label>
                                <TimePicker
                                  value={formData.sharedStartTime}
                                  onChange={(value) => {
                                    // If start time is after or equal to end time, clear end time
                                    if (formData.sharedEndTime && value >= formData.sharedEndTime) {
                                      setFormData(prev => ({ ...prev, sharedStartTime: value, sharedEndTime: '' }))
                                    } else {
                                      setFormData(prev => ({ ...prev, sharedStartTime: value }))
                                    }
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">End Time (all dates)</label>
                                <TimePicker
                                  value={formData.sharedEndTime}
                                  onChange={(value) => setFormData(prev => ({ ...prev, sharedEndTime: value }))}
                                />
                              </div>
                            </div>
                          )}

                          {/* Date Entries */}
                          <div className="space-y-2">
                            {formData.dateTimeEntries.map((entry, index) => (
                              <div key={entry.id} className="p-2.5 bg-gray-50 rounded-lg">
                                <div className="flex gap-2 items-end">
                                  <div className="flex-1 min-w-0">
                                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Date {formData.dateSelectionMode === 'multiple' ? index + 1 : ''}</label>
                                    <DatePicker
                                      value={entry.date}
                                      onChange={(value) => {
                                        const newEntries = [...formData.dateTimeEntries]
                                        newEntries[index] = { ...entry, date: value }
                                        setFormData(prev => ({ ...prev, dateTimeEntries: newEntries }))
                                      }}
                                    />
                                  </div>
                                  {(formData.dateSelectionMode === 'single' || formData.timeMode === 'different' || (formData.dateSelectionMode === 'multiple' && formData.dateTimeEntries.length === 1)) && (
                                    <>
                                      <div className="flex-1 min-w-0">
                                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Start Time</label>
                                        <TimePicker
                                          value={entry.startTime}
                                          onChange={(value) => {
                                            const newEntries = [...formData.dateTimeEntries]
                                            // If start time is after or equal to end time, clear end time
                                            if (entry.endTime && value >= entry.endTime) {
                                              newEntries[index] = { ...entry, startTime: value, endTime: '' }
                                            } else {
                                              newEntries[index] = { ...entry, startTime: value }
                                            }
                                            setFormData(prev => ({ ...prev, dateTimeEntries: newEntries }))
                                          }}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <label className="block text-[10px] font-medium text-gray-500 mb-1">End Time</label>
                                        <TimePicker
                                          value={entry.endTime}
                                          onChange={(value) => {
                                            const newEntries = [...formData.dateTimeEntries]
                                            newEntries[index] = { ...entry, endTime: value }
                                            setFormData(prev => ({ ...prev, dateTimeEntries: newEntries }))
                                          }}
                                        />
                                      </div>
                                    </>
                                  )}
                                  {formData.dateSelectionMode === 'multiple' && formData.timeMode === 'same' && formData.dateTimeEntries.length > 1 && (
                                    <div className="flex-[2] flex items-center pb-1.5">
                                      <span className="text-xs text-gray-400">Using shared time</span>
                                    </div>
                                  )}
                                  {formData.dateSelectionMode === 'multiple' && formData.dateTimeEntries.length > 1 ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newEntries = formData.dateTimeEntries.filter(e => e.id !== entry.id)
                                        setFormData(prev => ({ ...prev, dateTimeEntries: newEntries }))
                                      }}
                                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors mb-0.5 flex-shrink-0"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add Date Button (only for multiple mode) */}
                          {formData.dateSelectionMode === 'multiple' && (
                            <button
                              type="button"
                              onClick={() => {
                                const newEntry: DateTimeEntry = {
                                  id: Date.now().toString(),
                                  date: '',
                                  startTime: '',
                                  endTime: ''
                                }
                                setFormData(prev => ({ ...prev, dateTimeEntries: [...prev.dateTimeEntries, newEntry] }))
                              }}
                              className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm"
                            >
                              <Plus className="w-4 h-4" />
                              Add Another Date
                            </button>
                          )}
                        </div>
                      )}

                      {/* Location - only for In-Person */}
                      {formData.interpretationSetting === 'in-person' && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            <MapPin className="w-3.5 h-3.5 inline mr-1.5 text-purple-600" />
                            Location
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              name="interpretationLocation"
                              placeholder="Address"
                              value={formData.interpretationLocation}
                              onChange={handleChange}
                              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                            />
                            <input
                              type="text"
                              name="interpretationCity"
                              placeholder="City"
                              value={formData.interpretationCity}
                              onChange={handleChange}
                              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                            />
                            {/* State Searchable Dropdown */}
                            <div className="relative" ref={stateDropdownRef}>
                              <input
                                type="text"
                                placeholder="State"
                                autoComplete="new-password"
                                data-lpignore="true"
                                data-form-type="other"
                                value={stateDropdownOpen ? stateSearchTerm : formData.interpretationState}
                                onChange={(e) => {
                                  setStateSearchTerm(e.target.value)
                                  if (!stateDropdownOpen) setStateDropdownOpen(true)
                                }}
                                onFocus={() => {
                                  setStateDropdownOpen(true)
                                  setStateSearchTerm('')
                                }}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                              />
                              {stateDropdownOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                  {filteredStates.length > 0 ? (
                                    filteredStates.map((state) => (
                                      <button
                                        key={state.code}
                                        type="button"
                                        onClick={() => {
                                          setFormData(prev => ({ ...prev, interpretationState: state.name }))
                                          setStateDropdownOpen(false)
                                          setStateSearchTerm('')
                                        }}
                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-purple-50 transition-colors ${
                                          formData.interpretationState === state.name ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700'
                                        }`}
                                      >
                                        <span className="font-medium">{state.code}</span> - {state.name}
                                      </button>
                                    ))
                                  ) : (
                                    <div className="px-3 py-2 text-sm text-gray-500">No states found</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Time Zone - Only for Video or Phone */}
                      {(formData.interpretationSetting === 'video-remote' || formData.interpretationSetting === 'phone') && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            <Clock className="w-3.5 h-3.5 inline mr-1.5 text-purple-600" />
                            Time Zone *
                          </label>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {US_TIMEZONES.map((tz) => (
                              <button
                                key={tz.code}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, timeZone: tz.code }))}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                  formData.timeZone === tz.code
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                                }`}
                              >
                                {tz.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Contact Information - Only show if NOT logged in as customer */}
              {currentStep === 3 && !isCustomerLoggedIn && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Your Contact Information</h2>
                    <p className="text-sm text-gray-600">Sign in or create an account to continue with your quote.</p>
                  </div>

                  {/* Auth Mode Selection */}
                  {!authMode && (
                    <div className="space-y-4">
                      {/* Sign In Option */}
                      <button
                        type="button"
                        onClick={() => setAuthMode('signin')}
                        className="w-full p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">Sign In</h3>
                            <p className="text-sm text-gray-600">Already have an account? Sign in to continue.</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>

                      {/* Sign Up Option */}
                      <button
                        type="button"
                        onClick={() => setAuthMode('signup')}
                        className="w-full p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                            <Plus className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">Create Account</h3>
                            <p className="text-sm text-gray-600">New here? Create an account to track your quotes.</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Sign In Form */}
                  {authMode === 'signin' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 text-lg">Sign In</h3>
                        <button
                          type="button"
                          onClick={() => { setAuthMode(null); setAuthError(''); }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          ← Back
                        </button>
                      </div>

                      {authError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                          {authError}
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={signInData.email}
                            onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="your@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                          <input
                            type="password"
                            value={signInData.password}
                            onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="••••••••"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            // Save form data and pricing before auth
                            localStorage.setItem('quoteFormData', JSON.stringify(formData));
                            if (pricing.data) {
                              localStorage.setItem('quotePricingData', JSON.stringify(pricing.data));
                            }
                            setAuthLoading(true);
                            setAuthError('');
                            try {
                              const { signIn } = await import('next-auth/react');
                              const result = await signIn('credentials', {
                                email: signInData.email,
                                password: signInData.password,
                                redirect: false,
                              });
                              if (result?.error) {
                                setAuthError('Invalid email or password');
                                localStorage.removeItem('quoteFormData');
                              } else {
                                // Restore form data from localStorage
                                const savedData = localStorage.getItem('quoteFormData');
                                if (savedData) {
                                  try {
                                    const parsed = JSON.parse(savedData);
                                    setFormData(parsed);
                                  } catch {
                                    // ignore
                                  }
                                  localStorage.removeItem('quoteFormData');
                                }
                                // Update session and move to review step
                                await updateSession();
                                setCurrentStep(4); // Move to Review step
                                setAuthMode(null);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            } catch {
                              setAuthError('Something went wrong. Please try again.');
                              localStorage.removeItem('quoteFormData');
                            } finally {
                              setAuthLoading(false);
                            }
                          }}
                          disabled={authLoading || !signInData.email || !signInData.password}
                          className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {authLoading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white text-gray-500">or</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            // Save form data and pricing before Google auth
                            localStorage.setItem('quoteFormData', JSON.stringify(formData));
                            if (pricing.data) {
                              localStorage.setItem('quotePricingData', JSON.stringify(pricing.data));
                            }
                            const { signIn } = await import('next-auth/react');
                            signIn('google', { callbackUrl: window.location.href });
                          }}
                          className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Continue with Google
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sign Up Form */}
                  {authMode === 'signup' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 text-lg">Create Account</h3>
                        <button
                          type="button"
                          onClick={() => { setAuthMode(null); setAuthError(''); }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          ← Back
                        </button>
                      </div>

                      {authError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                          {authError}
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                              type="text"
                              value={signUpData.firstName}
                              onChange={(e) => setSignUpData(prev => ({ ...prev, firstName: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                              type="text"
                              value={signUpData.lastName}
                              onChange={(e) => setSignUpData(prev => ({ ...prev, lastName: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={signUpData.email}
                            onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="your@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                          <input
                            type="password"
                            value={signUpData.password}
                            onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Min. 6 characters"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            // Save form data before auth
                            localStorage.setItem('quoteFormData', JSON.stringify(formData));
                            setAuthLoading(true);
                            setAuthError('');
                            try {
                              const res = await fetch('/api/auth/register', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  name: `${signUpData.firstName} ${signUpData.lastName}`.trim(),
                                  email: signUpData.email,
                                  password: signUpData.password,
                                }),
                              });
                              const data = await res.json();
                              if (!res.ok) {
                                setAuthError(data.error || 'Registration failed');
                                localStorage.removeItem('quoteFormData');
                              } else {
                                // Auto sign in after registration
                                const { signIn } = await import('next-auth/react');
                                await signIn('credentials', {
                                  email: signUpData.email,
                                  password: signUpData.password,
                                  redirect: false,
                                });
                                // Restore form data from localStorage
                                const savedData = localStorage.getItem('quoteFormData');
                                if (savedData) {
                                  try {
                                    const parsed = JSON.parse(savedData);
                                    setFormData(parsed);
                                  } catch {
                                    // ignore
                                  }
                                  localStorage.removeItem('quoteFormData');
                                }
                                // Update session and move to review step
                                await updateSession();
                                setCurrentStep(4); // Move to Review step
                                setAuthMode(null);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            } catch {
                              setAuthError('Something went wrong. Please try again.');
                              localStorage.removeItem('quoteFormData');
                            } finally {
                              setAuthLoading(false);
                            }
                          }}
                          disabled={authLoading || !signUpData.firstName || !signUpData.email || !signUpData.password}
                          className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {authLoading ? 'Creating account...' : 'Create Account'}
                        </button>

                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white text-gray-500">or</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            // Save form data and pricing before Google auth
                            localStorage.setItem('quoteFormData', JSON.stringify(formData));
                            if (pricing.data) {
                              localStorage.setItem('quotePricingData', JSON.stringify(pricing.data));
                            }
                            const { signIn } = await import('next-auth/react');
                            signIn('google', { callbackUrl: window.location.href });
                          }}
                          className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Continue with Google
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review & Payment (or Step 3 if logged in) */}
              {isReviewStep && (
                <div className="space-y-5">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Review & Pay</h2>
                    <p className="text-sm text-gray-600">Review your quote details and complete your order.</p>
                  </div>

                  {/* Two Column Layout - Reference Design */}
                  <div className="grid md:grid-cols-5 gap-6">
                    {/* Left Column - Price & Details Summary (2/5) */}
                    <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Price Header */}
                      <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-white">
                        <div className="text-4xl font-bold mb-2">
                          ${pricing.data?.total?.toFixed(2) || '0.00'}
                        </div>
                        {pricing.data?.isSameDay && (
                          <span className="inline-block px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                            ⚡ Same-day Rush Rate Applied
                          </span>
                        )}
                      </div>
                      
                      {/* Checkmark Details */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <span className="text-gray-700 text-sm">
                            {pricing.data?.totalHours || 0} hours of {formData.interpretationMode || 'consecutive'} interpretation
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <span className="text-gray-700 text-sm">
                            {formData.dateTimeEntries[0]?.date || formData.dateRangeStart} 
                            {formData.dateTimeEntries[0]?.startTime && ` at ${formData.dateTimeEntries[0].startTime}`}
                            {formData.sharedStartTime && ` at ${formData.sharedStartTime}`}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <span className="text-gray-700 text-sm">
                            {languages.find(l => l.id === formData.sourceLanguageId)?.name} to {languages.find(l => l.id === formData.targetLanguageId)?.name}
                          </span>
                        </div>
                        
                        {formData.interpretationSetting === 'in-person' && formData.interpretationCity && (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <span className="text-gray-700 text-sm">
                              📍 {formData.interpretationCity}, {formData.interpretationState}
                            </span>
                          </div>
                        )}
                        
                        {formData.interpretationSetting !== 'in-person' && (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <span className="text-gray-700 text-sm">
                              {formData.interpretationSetting === 'video-remote' ? '🎥 Video Remote' : '📞 Phone'} session
                            </span>
                          </div>
                        )}
                        
                        {/* Price Breakdown */}
                        {pricing.data && (
                          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>{pricing.data.appliedMinimum ? `${pricing.data.minimumHours}h min` : `${pricing.data.totalHours}h`} × ${pricing.data.hourlyRate}/hr</span>
                              <span>${pricing.data.hoursSubtotal.toFixed(2)}</span>
                            </div>
                            {pricing.data.travelFee > 0 && (
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Travel fee</span>
                                <span>${pricing.data.travelFee.toFixed(2)}</span>
                              </div>
                            )}
                            {pricing.data.rushFee > 0 && (
                              <div className="flex justify-between text-sm text-amber-600">
                                <span>Rush fee (35%)</span>
                                <span>+${pricing.data.rushFee.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Chat Link */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                            <MessageCircle className="w-4 h-4" />
                            Chat with us now
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column - Notes, Coupon, Payment (3/5) */}
                    <div className="md:col-span-3 space-y-4">
                      {/* Notes */}
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📝 Enter your notes
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={3}
                          placeholder="e.g. special requirements, case details..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                        />
                      </div>
                      
                      {/* Coupon & Reference */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Coupon code</label>
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Enter code"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Reference number</label>
                          <input
                            type="text"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            placeholder="Optional"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      {/* Payment Method */}
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Payment method</label>
                        <div className="space-y-2">
                          <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="card"
                              checked={paymentMethod === 'card'}
                              onChange={() => setPaymentMethod('card')}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Pay by credit card</span>
                            <div className="ml-auto flex items-center gap-1">
                              <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-[8px] flex items-center justify-center font-bold">VISA</div>
                              <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded text-white text-[8px] flex items-center justify-center font-bold">MC</div>
                            </div>
                          </label>
                          
                          {/* Payment Code option - only shown for corporates with this feature enabled */}
                          {corporatePaymentEnabled && (
                            <div>
                              <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${paymentMethod === 'payment-code' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="payment-code"
                                  checked={paymentMethod === 'payment-code'}
                                  onChange={() => setPaymentMethod('payment-code')}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">Pay by Payment Code</span>
                                <div className="ml-auto">
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                  </svg>
                                </div>
                              </label>
                              
                              {/* Payment Code Input */}
                              {paymentMethod === 'payment-code' && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter your payment code</label>
                                  <input
                                    type="text"
                                    value={paymentCode}
                                    onChange={(e) => {
                                      setPaymentCode(e.target.value.toUpperCase())
                                      setPaymentCodeError('')
                                    }}
                                    placeholder="e.g. CORP-2024-XXXX"
                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${paymentCodeError ? 'border-red-300' : 'border-gray-200'}`}
                                  />
                                  {paymentCodeError && (
                                    <p className="mt-1 text-xs text-red-500">{paymentCodeError}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Order Button */}
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isProcessingPayment || !pricing.data || !(pricing.data.total > 0) || !paymentMethod || (paymentMethod === 'payment-code' && !paymentCode)}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                      >
                        {isSubmitting || isProcessingPayment ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Order now
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                      
                      {/* Security Note */}
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Secure payment powered by Stripe
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Actions */}
                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
                    <button 
                      onClick={async () => {
                        const quoteUrl = quoteNumber 
                          ? `${window.location.origin}/quote/${quoteNumber}`
                          : window.location.href
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: `Quote ${quoteNumber ? `#${quoteNumber}` : ''}`,
                              text: `Check out my quote from Link Translations`,
                              url: quoteUrl,
                            })
                          } catch {
                            // User cancelled or share failed
                          }
                        } else {
                          await navigator.clipboard.writeText(quoteUrl)
                          alert('Quote link copied to clipboard!')
                        }
                      }}
                      className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button 
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Edit Quote
                    </button>
                    <button 
                      onClick={async () => {
                        // Generate a simple PDF quote
                        const sourceLanguageName = languages.find(l => l.id === formData.sourceLanguageId)?.name || 'Source'
                        const targetLanguageName = languages.find(l => l.id === formData.targetLanguageId)?.name || 'Target'
                        
                        // Create a printable HTML
                        const printContent = `
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <title>Quote ${quoteNumber ? `#${quoteNumber}` : ''}</title>
                            <style>
                              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
                              .header h1 { color: #2563eb; margin: 0; }
                              .header p { color: #666; margin-top: 5px; }
                              .quote-number { background: #f3f4f6; padding: 10px 20px; border-radius: 8px; display: inline-block; margin: 20px 0; }
                              .section { margin: 20px 0; }
                              .section h3 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
                              .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
                              .total { font-size: 24px; font-weight: bold; color: #059669; text-align: right; margin-top: 20px; }
                              .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <h1>LINK TRANSLATIONS</h1>
                              <p>Professional Translation & Interpretation Services</p>
                            </div>
                            
                            ${quoteNumber ? `<div class="quote-number"><strong>Quote #${quoteNumber}</strong></div>` : ''}
                            
                            <div class="section">
                              <h3>Service Details</h3>
                              <div class="detail-row"><span>Service Type:</span><span>Interpretation</span></div>
                              <div class="detail-row"><span>Languages:</span><span>${sourceLanguageName} → ${targetLanguageName}</span></div>
                              <div class="detail-row"><span>Mode:</span><span>${formData.interpretationMode || 'Consecutive'}</span></div>
                              <div class="detail-row"><span>Setting:</span><span>${formData.interpretationSetting === 'in-person' ? 'In-Person' : formData.interpretationSetting === 'video-remote' ? 'Video Remote' : 'Phone'}</span></div>
                              ${formData.interpretationCity ? `<div class="detail-row"><span>Location:</span><span>${formData.interpretationCity}, ${formData.interpretationState}</span></div>` : ''}
                              <div class="detail-row"><span>Duration:</span><span>${pricing.data?.totalHours || 0} hours</span></div>
                              ${formData.dateTimeEntries[0]?.date ? `<div class="detail-row"><span>Date:</span><span>${formData.dateTimeEntries[0].date} at ${formData.dateTimeEntries[0].startTime}</span></div>` : ''}
                            </div>
                            
                            <div class="section">
                              <h3>Pricing</h3>
                              <div class="detail-row"><span>Hourly Rate:</span><span>$${pricing.data?.hourlyRate?.toFixed(2) || '0.00'}/hr</span></div>
                              <div class="detail-row"><span>Hours:</span><span>${pricing.data?.totalHours || 0} hours</span></div>
                              ${pricing.data?.travelFee ? `<div class="detail-row"><span>Travel Fee:</span><span>$${pricing.data.travelFee.toFixed(2)}</span></div>` : ''}
                              ${pricing.data?.rushFee ? `<div class="detail-row"><span>Rush Fee:</span><span>$${pricing.data.rushFee.toFixed(2)}</span></div>` : ''}
                            </div>
                            
                            <div class="total">Total: $${pricing.data?.total?.toFixed(2) || '0.00'}</div>
                            
                            <div class="footer">
                              <p>Link Translations | 1-877-272-LINK (5465) | info@linktranslations.com</p>
                              <p>This quote is valid for 7 days from the date of issue.</p>
                            </div>
                          </body>
                          </html>
                        `
                        
                        // Open print dialog
                        const printWindow = window.open('', '_blank')
                        if (printWindow) {
                          printWindow.document.write(printContent)
                          printWindow.document.close()
                          printWindow.print()
                        }
                      }}
                      className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download Quote
                    </button>
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
              
              {/* Hide continue button on Contact step - user must sign in/up */}
              {currentStep === 3 && !isCustomerLoggedIn ? (
                <div className="text-sm text-gray-500">
                  Please sign in or create an account to continue
                </div>
              ) : !isReviewStep && (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 text-sm"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
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
