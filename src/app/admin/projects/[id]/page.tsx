'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  FolderOpen,
  Building2,
  FileText,
  Clock,
  Calendar,
  CheckCircle,
  PauseCircle,
  XCircle,
  Play,
  User,
  Languages,
  DollarSign,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react'

interface Project {
  id: string
  projectNumber: string
  name: string | null
  description: string | null
  status: 'IN_PROGRESS' | 'PAUSED' | 'REMOVED' | 'COMPLETED' | 'SEEKING_INTERPRETER' | 'INTERPRETER_ASSIGNED'
  startDate: string
  dueDate: string | null
  completedDate: string | null
  notes: string | null
  internalNotes: string | null
  createdAt: string
  updatedAt: string
  corporate: {
    id: string
    company: string
  } | null
  quote: {
    id: string
    quoteNumber: string
    total: number | null
    status: string
    description: string | null
    sourceLanguage: string | null
    targetLanguage: string | null
    wordCount: number | null
    contact: {
      id: string
      firstName: string
      lastName: string
    } | null
  } | null
}

const statusConfig = {
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Clock },
  PAUSED: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800', icon: PauseCircle },
  REMOVED: { label: 'Removed', color: 'bg-red-100 text-red-800', icon: XCircle },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  SEEKING_INTERPRETER: { label: 'Seeking Interpreter', color: 'bg-orange-100 text-orange-800', icon: Clock },
  INTERPRETER_ASSIGNED: { label: 'Interpreter Assigned', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    status: 'IN_PROGRESS' as 'IN_PROGRESS' | 'PAUSED' | 'REMOVED' | 'COMPLETED' | 'SEEKING_INTERPRETER' | 'INTERPRETER_ASSIGNED',
    dueDate: '',
    notes: '',
    internalNotes: '',
  })

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProject(data)
        setEditData({
          name: data.name || '',
          description: data.description || '',
          status: data.status,
          dueDate: data.dueDate ? data.dueDate.split('T')[0] : '',
          notes: data.notes || '',
          internalNotes: data.internalNotes || '',
        })
      } else if (res.status === 404) {
        router.push('/admin/projects')
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name || null,
          description: editData.description || null,
          status: editData.status,
          dueDate: editData.dueDate || null,
          notes: editData.notes || null,
          internalNotes: editData.internalNotes || null,
        })
      })
      if (res.ok) {
        await fetchProject()
        setEditing(false)
      }
    } catch (error) {
      console.error('Error saving project:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleQuickStatusChange = async (newStatus: 'IN_PROGRESS' | 'PAUSED' | 'REMOVED' | 'COMPLETED') => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        await fetchProject()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/projects')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (!project) {
    return (
      <div className="p-8">
        <p>Project not found</p>
      </div>
    )
  }

  const StatusIcon = statusConfig[project.status].icon

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/projects"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <FolderOpen className="w-6 h-6 text-gray-400" />
              <h1 className="text-2xl font-bold text-gray-900">{project.projectNumber}</h1>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[project.status].color}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig[project.status].label}
              </span>
            </div>
            {project.name && (
              <p className="text-gray-500 mt-1">{project.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick Status Buttons */}
      {!editing && project.status !== 'COMPLETED' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <p className="text-sm text-gray-500 mb-3">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            {project.status !== 'IN_PROGRESS' && (
              <button
                onClick={() => handleQuickStatusChange('IN_PROGRESS')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                <Play className="w-4 h-4" />
                Resume
              </button>
            )}
            {!['PAUSED', 'COMPLETED'].includes(project.status) && (
              <button
                onClick={() => handleQuickStatusChange('PAUSED')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100"
              >
                <PauseCircle className="w-4 h-4" />
                Pause
              </button>
            )}
            <button
              onClick={() => handleQuickStatusChange('COMPLETED')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-green-700 bg-green-50 rounded-lg hover:bg-green-100"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Complete
            </button>
            {project.status !== 'REMOVED' && (
              <button
                onClick={() => handleQuickStatusChange('REMOVED')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <XCircle className="w-4 h-4" />
                Remove
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-gray-400" />
              Project Details
            </h2>
            
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional project name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Project description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value as typeof editData.status })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="PAUSED">Paused</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="REMOVED">Removed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={editData.dueDate}
                      onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Public notes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                  <textarea
                    value={editData.internalNotes}
                    onChange={(e) => setEditData({ ...editData, internalNotes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Internal notes (not visible to customer)"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(project.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium">{formatDate(project.dueDate)}</p>
                  </div>
                </div>
                {project.completedDate && (
                  <div>
                    <p className="text-sm text-gray-500">Completed Date</p>
                    <p className="font-medium text-green-600">{formatDate(project.completedDate)}</p>
                  </div>
                )}
                {project.description && (
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-gray-700">{project.description}</p>
                  </div>
                )}
                {project.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-gray-700">{project.notes}</p>
                  </div>
                )}
                {project.internalNotes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-700 font-medium">Internal Notes</p>
                    <p className="text-yellow-800">{project.internalNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quote Info */}
          {project.quote && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                Related Quote
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Link 
                      href={`/admin/quotes/${project.quote.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {project.quote.quoteNumber}
                    </Link>
                    <span className="ml-2 text-sm text-gray-500">({project.quote.status})</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {project.quote.total ? formatCurrency(project.quote.total) : '-'}
                  </p>
                </div>

                {project.quote.sourceLanguage && project.quote.targetLanguage && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Languages className="w-4 h-4" />
                    <span>{project.quote.sourceLanguage}</span>
                    <span>→</span>
                    <span>{project.quote.targetLanguage}</span>
                  </div>
                )}

                {project.quote.description && (
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-gray-700">{project.quote.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          {project.corporate && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-400" />
                Corporate
              </h2>
              
              <div className="space-y-3">
                <div>
                  <Link 
                    href={`/admin/corporates/${project.corporate.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {project.corporate.company}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              Timeline
            </h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700">{formatDate(project.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Started</span>
                <span className="text-gray-700">{formatDate(project.startDate)}</span>
              </div>
              {project.dueDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Due</span>
                  <span className="text-gray-700">{formatDate(project.dueDate)}</span>
                </div>
              )}
              {project.completedDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Completed</span>
                  <span className="text-green-600 font-medium">{formatDate(project.completedDate)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-700">{formatDate(project.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Value */}
          {project.quote?.total && (
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm opacity-90">Project Value</span>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(project.quote.total)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
