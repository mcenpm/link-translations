'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Calendar, MapPin, Clock, CheckCircle, XCircle,
  AlertCircle, Loader2, Filter, Globe
} from 'lucide-react'

interface Job {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED'
  eventDate: string
  eventTime: string
  eventDuration: number
  eventLocation: string
  eventType: string
  hourlyRate: number
  totalAmount: number
  distance: number | null
  project: {
    projectNumber: string
    sourceLanguage?: { name: string }
    targetLanguage?: { name: string }
    customer?: { name: string }
  }
}

type StatusFilter = 'all' | 'pending' | 'upcoming' | 'completed'

export default function LinguistJobsPage() {
  const { data: session } = useSession()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/linguist/jobs')
        if (res.ok) {
          const data = await res.json()
          setJobs(data.jobs || [])
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchJobs()
    }
  }, [session])

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true
    if (filter === 'pending') return job.status === 'PENDING'
    if (filter === 'upcoming') return job.status === 'ACCEPTED' && new Date(job.eventDate) > new Date()
    if (filter === 'completed') return job.status === 'COMPLETED'
    return true
  })

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: typeof CheckCircle; label: string }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle, label: 'Pending' },
      ACCEPTED: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Accepted' },
      DECLINED: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Declined' },
      COMPLETED: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle, label: 'Completed' },
      CANCELLED: { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'Cancelled' },
    }
    const config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon
    return (
      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-600 mt-1">Manage your interpretation assignments</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Jobs</option>
            <option value="pending">Pending</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? "You don't have any jobs yet. New job invitations will appear here."
              : `No ${filter} jobs at the moment.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {job.project.projectNumber}
                    </h3>
                    {getStatusBadge(job.status)}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {new Date(job.eventDate).toLocaleDateString()} at {job.eventTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{job.eventDuration} hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{job.eventLocation}</span>
                      {job.distance !== null && (
                        <span className="text-xs text-gray-400">({job.distance} mi)</span>
                      )}
                    </div>
                    {job.project.sourceLanguage && job.project.targetLanguage && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span>
                          {job.project.sourceLanguage.name} → {job.project.targetLanguage.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold text-gray-900">
                      ${job.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">${job.hourlyRate}/hr</p>
                  </div>

                  {job.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                        Accept
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
