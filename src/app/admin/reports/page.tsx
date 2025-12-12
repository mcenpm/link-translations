'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, DollarSign, Users, FileText, 
  Globe, Download, Loader2, ArrowUp, ArrowDown
} from 'lucide-react'

interface ReportData {
  overview: {
    totalRevenue: number
    revenueChange: number
    totalQuotes: number
    quotesChange: number
    totalProjects: number
    projectsChange: number
    newCustomers: number
    customersChange: number
  }
  revenueByMonth: { month: string; revenue: number }[]
  quotesByStatus: { status: string; count: number }[]
  topLanguages: { language: string; count: number }[]
  recentActivity: { type: string; description: string; date: string }[]
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [data, setData] = useState<ReportData | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/reports?period=${period}`)
        if (res.ok) {
          const reportData = await res.json()
          setData(reportData)
        }
      } catch (error) {
        console.error('Failed to fetch report data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [period])

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  function ChangeIndicator({ value }: { value: number }) {
    const isPositive = value >= 0
    return (
      <span className={`inline-flex items-center gap-0.5 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
        {Math.abs(value)}%
      </span>
    )
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Default data if API not yet implemented
  const reportData = data || {
    overview: {
      totalRevenue: 125430,
      revenueChange: 12.5,
      totalQuotes: 156,
      quotesChange: 8.2,
      totalProjects: 89,
      projectsChange: 15.3,
      newCustomers: 24,
      customersChange: -5.1
    },
    revenueByMonth: [
      { month: 'Jan', revenue: 45000 },
      { month: 'Feb', revenue: 52000 },
      { month: 'Mar', revenue: 48000 },
      { month: 'Apr', revenue: 61000 },
      { month: 'May', revenue: 58000 },
      { month: 'Jun', revenue: 72000 },
    ],
    quotesByStatus: [
      { status: 'Accepted', count: 89 },
      { status: 'Pending', count: 34 },
      { status: 'Declined', count: 18 },
      { status: 'Expired', count: 15 },
    ],
    topLanguages: [
      { language: 'Spanish', count: 245 },
      { language: 'Chinese', count: 189 },
      { language: 'French', count: 156 },
      { language: 'German', count: 123 },
      { language: 'Portuguese', count: 98 },
    ],
    recentActivity: [
      { type: 'quote', description: 'New quote #QT-2024-0156 created', date: '2 hours ago' },
      { type: 'payment', description: 'Payment received for #ORD-2024-0089', date: '4 hours ago' },
      { type: 'project', description: 'Project #PRJ-2024-0067 completed', date: '6 hours ago' },
      { type: 'customer', description: 'New customer registration: ABC Corp', date: '1 day ago' },
    ]
  }

  const maxRevenue = Math.max(...reportData.revenueByMonth.map(m => m.revenue))
  const totalQuoteCount = reportData.quotesByStatus.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500">Monitor your business performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Total Revenue</span>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.overview.totalRevenue)}</span>
            <ChangeIndicator value={reportData.overview.revenueChange} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Total Quotes</span>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{reportData.overview.totalQuotes}</span>
            <ChangeIndicator value={reportData.overview.quotesChange} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">Active Projects</span>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{reportData.overview.totalProjects}</span>
            <ChangeIndicator value={reportData.overview.projectsChange} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">New Customers</span>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{reportData.overview.newCustomers}</span>
            <ChangeIndicator value={reportData.overview.customersChange} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">Revenue Overview</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>+12.5% vs last period</span>
            </div>
          </div>
          
          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2">
            {reportData.revenueByMonth.map((month, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                  style={{ height: `${(month.revenue / maxRevenue) * 200}px` }}
                  title={formatCurrency(month.revenue)}
                />
                <span className="text-xs text-gray-500">{month.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quote Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Quotes by Status</h2>
          <div className="space-y-4">
            {reportData.quotesByStatus.map((status, i) => {
              const percentage = Math.round((status.count / totalQuoteCount) * 100)
              const colors = ['bg-green-500', 'bg-amber-500', 'bg-red-500', 'bg-gray-400']
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{status.status}</span>
                    <span className="text-sm font-medium text-gray-900">{status.count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colors[i]} rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Languages */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Top Languages</h2>
          <div className="space-y-3">
            {reportData.topLanguages.map((lang, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{lang.language}</span>
                    <span className="text-sm text-gray-500">{lang.count} projects</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(lang.count / reportData.topLanguages[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {reportData.recentActivity.map((activity, i) => {
              const icons: { [key: string]: React.ReactNode } = {
                quote: <FileText className="w-4 h-4 text-blue-600" />,
                payment: <DollarSign className="w-4 h-4 text-green-600" />,
                project: <Globe className="w-4 h-4 text-purple-600" />,
                customer: <Users className="w-4 h-4 text-amber-600" />,
              }
              const bgColors: { [key: string]: string } = {
                quote: 'bg-blue-100',
                payment: 'bg-green-100',
                project: 'bg-purple-100',
                customer: 'bg-amber-100',
              }
              
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${bgColors[activity.type]}`}>
                    {icons[activity.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.date}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
