'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, CheckCircle2, Clock, Calendar,
  FileText, Globe, DollarSign, AlertCircle
} from 'lucide-react'

interface Project {
  id: string
  projectNumber: string
  name: string | null
  status: string
  serviceType: string | null
  totalPrice: number | null
  createdAt: string
  startDate: string
  dueDate: string | null
  completedDate: string | null
  notes: string | null
  quote?: {
    quoteNumber: string
    serviceType: string | null
    srcLanguage?: { name: string }
    tgtLanguage?: { name: string }
  }
}

export default function ProjectDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login/customer')
    }
  }, [status, router])

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/customer/projects/${projectId}`)
        if (response.ok) {
          const data = await response.json()
          setProject(data.project)
        } else {
          setError('Project not found')
        }
      } catch {
        setError('Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user && projectId) {
      fetchProject()
    }
  }, [session, projectId])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/customer/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { color: string; bgColor: string; label: string; icon: typeof CheckCircle2 }> = {
      IN_PROGRESS: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'In Progress', icon: Clock },
      COMPLETED: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Completed', icon: CheckCircle2 },
      ON_HOLD: { color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: 'On Hold', icon: AlertCircle },
    }
    return statusMap[status] || { color: 'text-gray-700', bgColor: 'bg-gray-100', label: status, icon: Clock }
  }

  const statusInfo = getStatusInfo(project.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/customer/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {project.name || `Project #${project.projectNumber}`}
              </h1>
              <p className="text-gray-500 mt-1">Project #{project.projectNumber}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bgColor}`}>
              <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
              <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Project Timeline</h2>
              
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6">
                  {/* Created */}
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center z-10">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-medium text-gray-900">Project Created</p>
                      <p className="text-sm text-gray-500">{new Date(project.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {/* Started */}
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center z-10">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-medium text-gray-900">Work Started</p>
                      <p className="text-sm text-gray-500">{new Date(project.startDate).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {/* Due Date */}
                  {project.dueDate && (
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        project.status === 'COMPLETED' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        <Calendar className={`w-4 h-4 ${
                          project.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-medium text-gray-900">
                          {project.status === 'COMPLETED' ? 'Delivered' : 'Expected Delivery'}
                        </p>
                        <p className="text-sm text-gray-500">{new Date(project.dueDate).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Completed */}
                  {project.completedDate && (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center z-10">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-medium text-gray-900">Completed</p>
                        <p className="text-sm text-gray-500">{new Date(project.completedDate).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {project.notes && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Project Notes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{project.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Project Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service Type</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {project.serviceType || project.quote?.serviceType || 'Translation'}
                    </p>
                  </div>
                </div>
                
                {project.quote?.srcLanguage && project.quote?.tgtLanguage && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Languages</p>
                      <p className="font-medium text-gray-900">
                        {project.quote.srcLanguage.name} → {project.quote.tgtLanguage.name}
                      </p>
                    </div>
                  </div>
                )}
                
                {project.totalPrice && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-medium text-gray-900">${project.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                )}
                
                {project.quote && (
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      href={`/quote/${project.quote.quoteNumber}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Original Quote #{project.quote.quoteNumber}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-4">
                Questions about your project? Our team is here to help.
              </p>
              <a
                href="mailto:info@linktranslations.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
