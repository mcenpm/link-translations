'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Calendar, Clock, Save, Loader2, CheckCircle, X, Plus
} from 'lucide-react'

interface Availability {
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface BlockedDate {
  id: string
  date: string
  reason: string | null
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

export default function LinguistAvailabilityPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [availability, setAvailability] = useState<Availability[]>(
    DAYS_OF_WEEK.map((_, index) => ({
      dayOfWeek: index,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: index > 0 && index < 6, // Mon-Fri by default
    }))
  )
  
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [newBlockedDate, setNewBlockedDate] = useState('')
  const [newBlockedReason, setNewBlockedReason] = useState('')

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await fetch('/api/linguist/availability')
        if (res.ok) {
          const data = await res.json()
          if (data.availability) setAvailability(data.availability)
          if (data.blockedDates) setBlockedDates(data.blockedDates)
        }
      } catch (error) {
        console.error('Error fetching availability:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchAvailability()
    }
  }, [session])

  const handleAvailabilityChange = (index: number, field: keyof Availability, value: string | boolean) => {
    setAvailability(prev => prev.map((a, i) => 
      i === index ? { ...a, [field]: value } : a
    ))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/linguist/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability, blockedDates }),
      })
      
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving availability:', error)
    } finally {
      setSaving(false)
    }
  }

  const addBlockedDate = () => {
    if (!newBlockedDate) return
    
    setBlockedDates(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        date: newBlockedDate,
        reason: newBlockedReason || null,
      },
    ])
    setNewBlockedDate('')
    setNewBlockedReason('')
    setSaved(false)
  }

  const removeBlockedDate = (id: string) => {
    setBlockedDates(prev => prev.filter(d => d.id !== id))
    setSaved(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
          <p className="text-gray-600 mt-1">Set your weekly schedule and block specific dates</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Schedule */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Weekly Schedule</h2>
          </div>

          <div className="space-y-4">
            {availability.map((day, index) => (
              <div
                key={day.dayOfWeek}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  day.isAvailable ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                <label className="flex items-center gap-3 min-w-[140px]">
                  <input
                    type="checkbox"
                    checked={day.isAvailable}
                    onChange={(e) => handleAvailabilityChange(index, 'isAvailable', e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className={`font-medium ${day.isAvailable ? 'text-gray-900' : 'text-gray-400'}`}>
                    {DAYS_OF_WEEK[day.dayOfWeek]}
                  </span>
                </label>

                {day.isAvailable && (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Blocked Dates */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Blocked Dates</h2>
          </div>

          {/* Add New Block */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="date"
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              value={newBlockedReason}
              onChange={(e) => setNewBlockedReason(e.target.value)}
              placeholder="Reason (optional)"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={addBlockedDate}
              disabled={!newBlockedDate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Blocked Dates List */}
          {blockedDates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No blocked dates</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((blocked) => (
                <div
                  key={blocked.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(blocked.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {blocked.reason && (
                      <p className="text-sm text-gray-500">{blocked.reason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeBlockedDate(blocked.id)}
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Your availability helps us match you with interpretation jobs. 
          Make sure to keep it up to date, especially when your schedule changes.
        </p>
      </div>
    </div>
  )
}
