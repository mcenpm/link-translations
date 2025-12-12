'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Settings,
  Bell,
  FileText,
  TrendingUp
} from 'lucide-react'

interface JobInvitation {
  id: string
  token: string
  status: string
  eventDate: string
  eventTime: string
  eventDuration: number
  eventLocation: string
  eventDescription: string | null
  distance: number | null
  expiresAt: string
  project: {
    id: string
    projectNumber: string
    sourceLanguage?: { name: string }
    targetLanguage?: { name: string }
  }
}

interface Assignment {
  id: string
  status: string
  eventDate: string
  eventTime: string
  eventDuration: number
  eventLocation: string
  sourceLanguage: string
  targetLanguage: string
  customerName: string
}

interface Stats {
  pendingJobs: number
  upcomingAssignments: number
  completedThisMonth: number
  totalEarnings: number
}

export default function LinguistDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    pendingJobs: 0,
    upcomingAssignments: 0,
    completedThisMonth: 0,
    totalEarnings: 0
  })
  const [pendingInvitations, setPendingInvitations] = useState<JobInvitation[]>([])
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login/linguist')
    } else if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status, router])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/linguist/dashboard')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setPendingInvitations(data.pendingInvitations || [])
        setUpcomingAssignments(data.upcomingAssignments || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const respondToInvitation = async (token: string, action: 'accept' | 'decline') => {
    try {
      const res = await fetch('/api/jobs/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action })
      })
      
      if (res.ok) {
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Error responding to invitation:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">LINK</span>
                <span className="text-xs text-gray-500 block -mt-1">Linguist Portal</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 transition">
                <Bell className="w-5 h-5" />
                {stats.pendingJobs > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.pendingJobs}
                  </span>
                )}
              </button>
              <Link href="/linguist/settings" className="p-2 text-gray-500 hover:text-gray-700 transition">
                <Settings className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {session?.user?.name || 'Linguist'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Linguist'}!
          </h1>
          <p className="text-gray-600 mt-1">Here&apos;s what&apos;s happening with your assignments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Jobs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingJobs}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcomingAssignments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed (Month)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedThisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Earnings (Month)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${stats.totalEarnings.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Job Invitations */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-500" />
                Pending Job Invitations
              </h2>
            </div>
            <div className="divide-y">
              {pendingInvitations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No pending job invitations</p>
                </div>
              ) : (
                pendingInvitations.map((inv) => (
                  <div key={inv.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {inv.project.sourceLanguage?.name} ↔ {inv.project.targetLanguage?.name}
                        </p>
                        <p className="text-sm text-gray-500">{inv.project.projectNumber}</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(inv.eventDate).toLocaleDateString()} at {inv.eventTime}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {inv.eventDuration} hours
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {inv.eventLocation}
                        {inv.distance && (
                          <span className="text-blue-600">({inv.distance.toFixed(1)} mi)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => respondToInvitation(inv.token, 'accept')}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => respondToInvitation(inv.token, 'decline')}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Assignments */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Upcoming Assignments
              </h2>
            </div>
            <div className="divide-y">
              {upcomingAssignments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No upcoming assignments</p>
                </div>
              ) : (
                upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {assignment.sourceLanguage} ↔ {assignment.targetLanguage}
                        </p>
                        <p className="text-sm text-gray-500">{assignment.customerName}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Confirmed
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(assignment.eventDate).toLocaleDateString()} at {assignment.eventTime}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {assignment.eventDuration} hours
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {assignment.eventLocation}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/linguist/assignments"
            className="bg-white rounded-xl shadow-sm border p-6 hover:border-blue-300 hover:shadow-md transition group"
          >
            <FileText className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition" />
            <h3 className="font-semibold text-gray-900">All Assignments</h3>
            <p className="text-sm text-gray-500 mt-1">View your complete assignment history</p>
          </Link>
          <Link
            href="/linguist/availability"
            className="bg-white rounded-xl shadow-sm border p-6 hover:border-blue-300 hover:shadow-md transition group"
          >
            <Calendar className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition" />
            <h3 className="font-semibold text-gray-900">Set Availability</h3>
            <p className="text-sm text-gray-500 mt-1">Update your schedule and availability</p>
          </Link>
          <Link
            href="/linguist/earnings"
            className="bg-white rounded-xl shadow-sm border p-6 hover:border-blue-300 hover:shadow-md transition group"
          >
            <TrendingUp className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition" />
            <h3 className="font-semibold text-gray-900">Earnings Report</h3>
            <p className="text-sm text-gray-500 mt-1">Track your income and payments</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
