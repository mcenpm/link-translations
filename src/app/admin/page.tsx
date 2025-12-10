'use client'

import { useState, useEffect } from 'react'
import { Users, Languages, FileText, DollarSign, Clock, CheckCircle, Loader2 } from 'lucide-react'

interface Stats {
  totalCorporates: number
  totalContacts: number
  totalLinguists: number
  pendingQuotes: number
  totalQuotes: number
  totalRevenue: number
  quotesThisMonth: number
  recentQuotes: Array<{
    id: string
    quoteNumber: string
    status: string
    createdAt: string
    corporate: {
      company: string
      user: { firstName: string | null; lastName: string | null; email: string }
    }
    languagePair: {
      sourceLanguage: { name: string }
      targetLanguage: { name: string }
    } | null
  }>
  recentCustomers: Array<{
    id: string
    firstName: string
    lastName: string
    email: string | null
    company: string | null
    createdAt: string
  }>
  languageStats: Array<{
    sourceLanguage: { name: string }
    targetLanguage: { name: string }
    _count: { quotes: number }
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        const data = await res.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 60) return `${minutes} min ago`
    if (hours < 24) return `${hours} hours ago`
    return `${days} days ago`
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Total Corporates</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalCorporates?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Total Contacts</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalContacts?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Languages className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Total Linguists</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalLinguists || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            {(stats?.pendingQuotes || 0) > 0 && (
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                {stats?.pendingQuotes} pending
              </span>
            )}
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Total Quotes</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalQuotes || 0}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            ${(stats?.totalRevenue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Quotes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Quotes</h2>
          </div>
          <div className="p-6">
            {stats?.recentQuotes && stats.recentQuotes.length > 0 ? (
              <div className="space-y-4">
                {stats.recentQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {quote.quoteNumber} - {quote.corporate?.company || quote.corporate?.user?.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {quote.languagePair 
                          ? `${quote.languagePair.sourceLanguage.name} → ${quote.languagePair.targetLanguage.name}`
                          : 'Language pair not set'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        quote.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-700' :
                        quote.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        quote.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {quote.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(quote.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No quotes yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Quick Stats</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Quotes This Month</span>
                <span className="text-sm font-bold text-gray-900">{stats?.quotesThisMonth || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((stats?.quotesThisMonth || 0) * 10, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Pending Quotes</span>
                <span className="text-sm font-bold text-gray-900">{stats?.pendingQuotes || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((stats?.pendingQuotes || 0) * 20, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Active Linguists</span>
                <span className="text-sm font-bold text-gray-900">{stats?.totalLinguists || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((stats?.totalLinguists || 0) * 10, 100)}%` }}
                />
              </div>
            </div>

            {stats?.languageStats && stats.languageStats.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Top Language Pairs</h3>
                <div className="space-y-2">
                  {stats.languageStats.slice(0, 3).map((pair, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {pair.sourceLanguage.name} → {pair.targetLanguage.name}
                      </span>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                        {pair._count.quotes} quotes
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats?.recentCustomers && stats.recentCustomers.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Customers</h3>
                <div className="space-y-2">
                  {stats.recentCustomers.slice(0, 3).map((customer) => (
                    <div key={customer.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{customer.firstName} {customer.lastName}</p>
                        <p className="text-xs text-gray-500">{customer.email || customer.company || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
