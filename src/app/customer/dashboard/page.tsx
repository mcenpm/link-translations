'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText, Clock, CheckCircle2, AlertCircle, Loader2,
  ChevronRight, Plus, Calendar, Globe, Download
} from 'lucide-react'

interface Quote {
  id: string
  quoteNumber: string
  status: string
  serviceType: string | null
  totalPrice: number | null
  paymentStatus: string | null
  createdAt: string
  srcLanguage?: { name: string }
  tgtLanguage?: { name: string }
}

interface Project {
  id: string
  projectNumber: string
  name: string | null
  status: string
  serviceType: string | null
  createdAt: string
  dueDate: string | null
}

interface DashboardStats {
  totalQuotes: number
  pendingQuotes: number
  activeProjects: number
  completedProjects: number
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotes: 0,
    pendingQuotes: 0,
    activeProjects: 0,
    completedProjects: 0,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login/customer')
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quotesRes, projectsRes] = await Promise.all([
          fetch('/api/customer/quotes'),
          fetch('/api/customer/projects'),
        ])

        if (quotesRes.ok) {
          const quotesData = await quotesRes.json()
          setQuotes(quotesData.quotes || [])
          setStats(prev => ({
            ...prev,
            totalQuotes: quotesData.quotes?.length || 0,
            pendingQuotes: quotesData.quotes?.filter((q: Quote) => q.status === 'REVIEWING' || q.status === 'DRAFT').length || 0,
          }))
        }

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(projectsData.projects || [])
          setStats(prev => ({
            ...prev,
            activeProjects: projectsData.projects?.filter((p: Project) => p.status === 'IN_PROGRESS').length || 0,
            completedProjects: projectsData.projects?.filter((p: Project) => p.status === 'COMPLETED').length || 0,
          }))
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchData()
    }
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      DRAFT: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
      REVIEWING: { color: 'bg-yellow-100 text-yellow-700', label: 'Under Review' },
      NEGOTIATION: { color: 'bg-blue-100 text-blue-700', label: 'Negotiation' },
      INVOICE_PAID: { color: 'bg-green-100 text-green-700', label: 'Paid' },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-700', label: 'In Progress' },
      COMPLETED: { color: 'bg-green-100 text-green-700', label: 'Completed' },
    }
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700', label: status }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {session.user.name?.split(' ')[0]}!</h1>
              <p className="text-gray-600 mt-1">Manage your quotes and projects</p>
            </div>
            <Link
              href="/quote"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
            >
              <Plus className="w-4 h-4" />
              New Quote
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuotes}</p>
                <p className="text-sm text-gray-500">Total Quotes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingQuotes}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                <p className="text-sm text-gray-500">Active Projects</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Quotes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Quotes</h2>
              <Link href="/customer/quotes" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
            
            {quotes.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No quotes yet</p>
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Request Your First Quote
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {quotes.slice(0, 5).map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <Link href={`/quote/${quote.id}`} className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">#{quote.quoteNumber}</span>
                        {getStatusBadge(quote.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="capitalize">{quote.serviceType || 'Translation'}</span>
                        {quote.srcLanguage && quote.tgtLanguage && (
                          <span>{quote.srcLanguage.name} → {quote.tgtLanguage.name}</span>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center gap-3">
                      {quote.totalPrice && (
                        <span className="font-semibold text-gray-900">${quote.totalPrice.toFixed(2)}</span>
                      )}
                      <a
                        href={`/api/quotes/${quote.id}/pdf`}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <Link href={`/quote/${quote.id}`}>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Projects */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Active Projects</h2>
              <Link href="/customer/projects" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
            
            {projects.filter(p => p.status === 'IN_PROGRESS').length === 0 ? (
              <div className="p-8 text-center">
                <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active projects</p>
                <p className="text-sm text-gray-400 mt-1">Projects will appear here after payment</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {projects.filter(p => p.status === 'IN_PROGRESS').slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={`/customer/projects/${project.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{project.name || `Project #${project.projectNumber}`}</span>
                        {getStatusBadge(project.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="capitalize">{project.serviceType || 'Translation'}</span>
                        {project.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due {new Date(project.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/quote?service=translation"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Translation Quote</p>
                <p className="text-sm text-gray-500">Documents, websites, etc.</p>
              </div>
            </Link>
            
            <Link
              href="/quote?service=interpretation"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Interpretation Quote</p>
                <p className="text-sm text-gray-500">In-person, video, phone</p>
              </div>
            </Link>
            
            <Link
              href="/contact"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Need Help?</p>
                <p className="text-sm text-gray-500">Contact support</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
