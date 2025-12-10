'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  FolderOpen, 
  Search, 
  Filter, 
  Plus,
  Clock,
  CheckCircle,
  PauseCircle,
  XCircle,
  ArrowUpRight
} from 'lucide-react'

interface Project {
  id: string
  projectNumber: string
  name: string | null
  description: string | null
  status: 'IN_PROGRESS' | 'PAUSED' | 'REMOVED' | 'COMPLETED'
  startDate: string
  dueDate: string | null
  completedDate: string | null
  createdAt: string
  corporate: {
    id: string
    company: string
  } | null
  quote: {
    id: string
    quoteNumber: string
    total: number | null
    status: string
    sourceLanguage: string | null
    targetLanguage: string | null
    contact: {
      id: string
      firstName: string
      lastName: string
      email: string | null
    } | null
  } | null
}

const statusConfig = {
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Clock },
  PAUSED: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800', icon: PauseCircle },
  REMOVED: { label: 'Removed', color: 'bg-red-100 text-red-800', icon: XCircle },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    fetchProjects()
  }, [statusFilter])

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams()
      params.set('limit', '1000')
      if (statusFilter) params.set('status', statusFilter)
      
      const res = await fetch(`/api/projects?${params}`)
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      project.projectNumber.toLowerCase().includes(searchLower) ||
      project.name?.toLowerCase().includes(searchLower) ||
      project.corporate?.company?.toLowerCase().includes(searchLower) ||
      project.quote?.quoteNumber.toLowerCase().includes(searchLower)
    )
  })

  // Calculate stats
  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
    paused: projects.filter(p => p.status === 'PAUSED').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    removed: projects.filter(p => p.status === 'REMOVED').length,
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-8 h-8 text-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-sm text-gray-500">{stats.total} total projects</p>
          </div>
        </div>
        <Link 
          href="/admin/projects/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div 
          className={`p-4 rounded-lg border cursor-pointer transition-all ${statusFilter === 'IN_PROGRESS' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
          onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? '' : 'IN_PROGRESS')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div 
          className={`p-4 rounded-lg border cursor-pointer transition-all ${statusFilter === 'PAUSED' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-white hover:border-yellow-300'}`}
          onClick={() => setStatusFilter(statusFilter === 'PAUSED' ? '' : 'PAUSED')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Paused</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.paused}</p>
            </div>
            <PauseCircle className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        <div 
          className={`p-4 rounded-lg border cursor-pointer transition-all ${statusFilter === 'COMPLETED' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'}`}
          onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? '' : 'COMPLETED')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div 
          className={`p-4 rounded-lg border cursor-pointer transition-all ${statusFilter === 'REMOVED' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-red-300'}`}
          onClick={() => setStatusFilter(statusFilter === 'REMOVED' ? '' : 'REMOVED')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Removed</p>
              <p className="text-2xl font-bold text-red-600">{stats.removed}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {statusFilter && (
          <button
            onClick={() => setStatusFilter('')}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <Filter className="w-4 h-4" />
            Clear filter
          </button>
        )}
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Corporate</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Quote</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Languages</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  {projects.length === 0 ? (
                    <div>
                      <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-lg font-medium">No projects yet</p>
                      <p className="text-sm">Projects are created from quotes with Invoice Paid or Invoice Not Paid status</p>
                    </div>
                  ) : (
                    'No projects found matching your search'
                  )}
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => {
                const StatusIcon = statusConfig[project.status].icon
                return (
                  <tr 
                    key={project.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/projects/${project.id}`)}
                  >
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/projects/${project.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {project.projectNumber}
                      </Link>
                      {project.name && (
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">{project.name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {project.corporate ? (
                        <Link 
                          href={`/admin/corporates/${project.corporate.id}`}
                          className="text-gray-900 hover:text-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {project.corporate.company}
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {project.quote?.contact ? (
                        <span className="text-gray-900">
                          {project.quote.contact.firstName} {project.quote.contact.lastName}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {project.quote ? (
                        <Link 
                          href={`/admin/quotes/${project.quote.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {project.quote.quoteNumber}
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {project.quote?.sourceLanguage && project.quote?.targetLanguage ? (
                        <span>
                          {project.quote.sourceLanguage} → {project.quote.targetLanguage}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[project.status].color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[project.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(project.dueDate)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {project.quote?.total ? formatCurrency(project.quote.total) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/projects/${project.id}`}
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowUpRight className="w-4 h-4 inline" />
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
