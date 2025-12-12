'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  DollarSign, Calendar, TrendingUp, Download, Filter,
  Loader2, CheckCircle, Clock
} from 'lucide-react'

interface Earning {
  id: string
  projectNumber: string
  eventDate: string
  eventDuration: number
  hourlyRate: number
  totalAmount: number
  status: 'PENDING' | 'PAID'
  paidDate: string | null
}

interface EarningsSummary {
  totalEarned: number
  pendingPayment: number
  thisMonth: number
  lastMonth: number
}

export default function LinguistEarningsPage() {
  const { data: session } = useSession()
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [summary, setSummary] = useState<EarningsSummary>({
    totalEarned: 0,
    pendingPayment: 0,
    thisMonth: 0,
    lastMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await fetch('/api/linguist/earnings')
        if (res.ok) {
          const data = await res.json()
          setEarnings(data.earnings || [])
          if (data.summary) {
            setSummary(data.summary)
          }
        }
      } catch (error) {
        console.error('Error fetching earnings:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchEarnings()
    }
  }, [session])

  const filteredEarnings = earnings.filter(e => {
    if (filter === 'all') return true
    return e.status === filter.toUpperCase()
  })

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
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600 mt-1">Track your income and payment history</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${summary.totalEarned.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Payment</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                ${summary.pendingPayment.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${summary.thisMonth.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Last Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${summary.lastMonth.toLocaleString()}
              </p>
              {summary.thisMonth > summary.lastMonth && summary.lastMonth > 0 && (
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +{Math.round(((summary.thisMonth - summary.lastMonth) / summary.lastMonth) * 100)}%
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Transactions</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Earnings Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Project</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Hours</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rate</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEarnings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No earnings found
                  </td>
                </tr>
              ) : (
                filteredEarnings.map((earning) => (
                  <tr key={earning.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {earning.projectNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(earning.eventDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {earning.eventDuration}h
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      ${earning.hourlyRate}/hr
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ${earning.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {earning.status === 'PAID' ? (
                        <span className="flex items-center gap-1.5 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          Paid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-yellow-700">
                          <Clock className="w-4 h-4" />
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
