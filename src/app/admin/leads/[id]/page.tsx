'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  Globe, 
  FileText, 
  CheckCircle, 
  XCircle,
  Users,
  Mic2,
  Shield,
  DollarSign,
  Edit,
  Trash2
} from 'lucide-react'

interface Lead {
  id: string
  legacyId: string | null
  firstName: string | null
  lastName: string
  email: string | null
  phone: string | null
  phoneMobile: string | null
  phoneWork: string | null
  phoneFax: string | null
  company: string | null
  title: string | null
  department: string | null
  description: string | null
  
  addressStreet: string | null
  addressCity: string | null
  addressState: string | null
  addressPostalCode: string | null
  addressCountry: string | null
  
  source: string | null
  sourceDescription: string | null
  status: string
  statusDescription: string | null
  referredBy: string | null
  
  discipline: string | null
  sourceLanguage: string | null
  targetLanguage: string | null
  customerType: string | null
  leadRanking: string | null
  
  assignmentDate: string | null
  assignmentTime: string | null
  estimatedDuration: string | null
  onSiteContact: string | null
  contactPersonPhone: string | null
  assignmentAddress: string | null
  assignmentCity: string | null
  assignmentState: string | null
  assignmentZipCode: string | null
  isCertified: boolean
  estimatedFees: string | null
  numberOfParticipants: string | null
  numberOfSpeakers: string | null
  meetingType: string | null
  
  isConverted: boolean
  doNotCall: boolean
  createdAt: string
  updatedAt: string
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-yellow-100 text-yellow-700',
  IN_PROCESS: 'bg-purple-100 text-purple-700',
  CONVERTED: 'bg-green-100 text-green-700',
  RECYCLED: 'bg-orange-100 text-orange-700',
  DEAD: 'bg-gray-100 text-gray-700',
}

const rankingColors: Record<string, string> = {
  Hot: 'bg-red-100 text-red-700',
  Warm: 'bg-orange-100 text-orange-700',
  Cold: 'bg-blue-100 text-blue-700',
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLead = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads/${params.id}`)
      if (!res.ok) throw new Error('Lead not found')
      const data = await res.json()
      setLead(data)
    } catch (error) {
      console.error('Error fetching lead:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchLead()
  }, [fetchLead])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getFullAddress = () => {
    if (!lead) return null
    const parts = [
      lead.addressStreet,
      lead.addressCity,
      lead.addressState,
      lead.addressPostalCode,
      lead.addressCountry
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  }

  const getAssignmentAddress = () => {
    if (!lead) return null
    const parts = [
      lead.assignmentAddress,
      lead.assignmentCity,
      lead.assignmentState,
      lead.assignmentZipCode
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead not found</h2>
          <p className="text-gray-600 mb-4">The lead you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/admin/leads" className="text-blue-600 hover:underline">
            ← Back to leads
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lead.firstName} {lead.lastName}
            </h1>
            <p className="text-gray-500">
              {lead.company || 'Individual'} {lead.title && `• ${lead.title}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[lead.status] || 'bg-gray-100'}`}>
            {lead.status.replace('_', ' ')}
          </span>
          {lead.leadRanking && (
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${rankingColors[lead.leadRanking] || 'bg-gray-100'}`}>
              {lead.leadRanking}
            </span>
          )}
          {lead.isCertified && (
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-700 flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Certified
            </span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              Contact Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="text-gray-900">{lead.email}</div>
                  </div>
                </a>
              )}
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="text-gray-900">{lead.phone}</div>
                  </div>
                </a>
              )}
              {lead.phoneMobile && (
                <a href={`tel:${lead.phoneMobile}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-500">Mobile</div>
                    <div className="text-gray-900">{lead.phoneMobile}</div>
                  </div>
                </a>
              )}
              {lead.phoneWork && (
                <a href={`tel:${lead.phoneWork}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-500">Work</div>
                    <div className="text-gray-900">{lead.phoneWork}</div>
                  </div>
                </a>
              )}
              {getFullAddress() && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                  <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="text-gray-900">{getFullAddress()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service Request */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Service Request
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {lead.discipline && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-sm text-blue-600 font-medium">Discipline</div>
                  <div className="text-gray-900 font-semibold">{lead.discipline}</div>
                </div>
              )}
              {(lead.sourceLanguage || lead.targetLanguage) && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="text-sm text-purple-600 font-medium flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    Languages
                  </div>
                  <div className="text-gray-900 font-semibold">
                    {lead.sourceLanguage || '?'} → {lead.targetLanguage || '?'}
                  </div>
                </div>
              )}
              {lead.customerType && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Customer Type</div>
                  <div className="text-gray-900">{lead.customerType}</div>
                </div>
              )}
              {lead.estimatedFees && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Estimated Fees
                  </div>
                  <div className="text-gray-900 font-semibold">{lead.estimatedFees}</div>
                </div>
              )}
            </div>
            
            {lead.description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-2">Description</div>
                <div className="text-gray-700 whitespace-pre-wrap">{lead.description}</div>
              </div>
            )}
          </div>

          {/* Assignment Details */}
          {(lead.assignmentDate || lead.assignmentCity || lead.onSiteContact || lead.numberOfParticipants) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mic2 className="w-5 h-5 text-gray-400" />
                Assignment Details
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {lead.assignmentDate && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="text-sm text-amber-600 font-medium">Date of Assignment</div>
                      <div className="text-gray-900 font-semibold">{formatDate(lead.assignmentDate)}</div>
                    </div>
                  </div>
                )}
                {lead.assignmentTime && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="text-sm text-amber-600 font-medium">Time</div>
                      <div className="text-gray-900 font-semibold">{lead.assignmentTime}</div>
                    </div>
                  </div>
                )}
                {lead.estimatedDuration && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Estimated Duration</div>
                    <div className="text-gray-900">{lead.estimatedDuration}</div>
                  </div>
                )}
                {lead.meetingType && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Meeting Type</div>
                    <div className="text-gray-900">{lead.meetingType}</div>
                  </div>
                )}
                {lead.numberOfParticipants && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Participants</div>
                      <div className="text-gray-900">{lead.numberOfParticipants}</div>
                    </div>
                  </div>
                )}
                {lead.numberOfSpeakers && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Speakers</div>
                    <div className="text-gray-900">{lead.numberOfSpeakers}</div>
                  </div>
                )}
                {getAssignmentAddress() && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100 md:col-span-2">
                    <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-red-600 font-medium">Assignment Location</div>
                      <div className="text-gray-900">{getAssignmentAddress()}</div>
                    </div>
                  </div>
                )}
                {lead.onSiteContact && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">On-Site Contact</div>
                    <div className="text-gray-900">{lead.onSiteContact}</div>
                  </div>
                )}
                {lead.contactPersonPhone && (
                  <a href={`tel:${lead.contactPersonPhone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Contact Phone</div>
                      <div className="text-gray-900">{lead.contactPersonPhone}</div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <CheckCircle className="w-5 h-5" />
                Convert to Customer
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Edit className="w-5 h-5" />
                Edit Lead
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="w-5 h-5" />
                Delete Lead
              </button>
            </div>
          </div>

          {/* Lead Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Info</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Source</div>
                <div className="text-gray-900">{lead.source || '-'}</div>
              </div>
              {lead.referredBy && (
                <div>
                  <div className="text-sm text-gray-500">Referred By</div>
                  <div className="text-gray-900">{lead.referredBy}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div className="text-gray-900">{formatDate(lead.createdAt)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="text-gray-900">{formatDate(lead.updatedAt)}</div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  {lead.isConverted ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Converted
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-500">
                      <XCircle className="w-4 h-4" />
                      Not Converted
                    </span>
                  )}
                </div>
                {lead.doNotCall && (
                  <div className="mt-2 text-red-600 text-sm flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    Do Not Call
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legacy Info */}
          {lead.legacyId && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500">Legacy ID (SugarCRM)</div>
              <div className="text-xs font-mono text-gray-600 truncate">{lead.legacyId}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
