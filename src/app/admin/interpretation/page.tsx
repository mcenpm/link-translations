'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  Send, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Phone,
  Mail,
  Navigation
} from 'lucide-react'

interface Project {
  id: string
  projectNumber: string
  name: string | null
  description: string | null
  status: string
  serviceType: string | null
  sourceLanguageId: string | null
  targetLanguageId: string | null
  sourceLanguage?: { name: string }
  targetLanguage?: { name: string }
  customer?: { company: string }
  contact?: { firstName: string; lastName: string; email: string; phone: string }
  createdAt: string
  jobInvitations: JobInvitation[]
}

interface JobInvitation {
  id: string
  status: string
  eventDate: string
  eventTime: string
  eventDuration: number
  eventLocation: string
  distance: number | null
  linguist: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
  }
  respondedAt: string | null
  declineReason: string | null
}

interface MatchedInterpreter {
  id: string
  name: string
  email: string
  phone: string | null
  distance: number
  hourlyRate: number | null
  city: string | null
  state: string | null
  languages: { name: string; level: string; discipline: string }[]
}

export default function InterpretationManagementPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [matchedInterpreters, setMatchedInterpreters] = useState<MatchedInterpreter[]>([])
  const [matchLoading, setMatchLoading] = useState(false)
  const [dispatchForm, setDispatchForm] = useState({
    latitude: '',
    longitude: '',
    eventDate: '',
    eventTime: '',
    eventDuration: '2',
    eventLocation: '',
    eventDescription: '',
    maxDistance: '50'
  })
  const [dispatchLoading, setDispatchLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/admin/interpretation/projects')
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const findInterpreters = async () => {
    if (!selectedProject?.sourceLanguageId || !selectedProject?.targetLanguageId) {
      alert('Project must have source and target languages')
      return
    }

    if (!dispatchForm.latitude || !dispatchForm.longitude) {
      alert('Please enter location coordinates')
      return
    }

    setMatchLoading(true)
    try {
      const res = await fetch('/api/interpreters/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: parseFloat(dispatchForm.latitude),
          longitude: parseFloat(dispatchForm.longitude),
          sourceLanguageId: selectedProject.sourceLanguageId,
          targetLanguageId: selectedProject.targetLanguageId,
          maxDistance: parseInt(dispatchForm.maxDistance)
        })
      })
      const data = await res.json()
      setMatchedInterpreters(data.interpreters || [])
    } catch (error) {
      console.error('Error finding interpreters:', error)
    } finally {
      setMatchLoading(false)
    }
  }

  const dispatchToInterpreters = async () => {
    if (!selectedProject) return

    if (!dispatchForm.eventDate || !dispatchForm.eventTime || !dispatchForm.eventLocation) {
      alert('Please fill in all event details')
      return
    }

    setDispatchLoading(true)
    try {
      const res = await fetch('/api/interpreters/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          latitude: parseFloat(dispatchForm.latitude),
          longitude: parseFloat(dispatchForm.longitude),
          eventDate: dispatchForm.eventDate,
          eventTime: dispatchForm.eventTime,
          eventDuration: parseFloat(dispatchForm.eventDuration),
          eventLocation: dispatchForm.eventLocation,
          eventDescription: dispatchForm.eventDescription,
          maxDistance: parseInt(dispatchForm.maxDistance)
        })
      })
      const data = await res.json()
      
      if (data.success) {
        alert(`Successfully notified ${data.count} interpreters!`)
        fetchProjects()
        setSelectedProject(null)
        setMatchedInterpreters([])
      } else {
        alert(data.message || 'Failed to dispatch')
      }
    } catch (error) {
      console.error('Error dispatching:', error)
      alert('Error dispatching to interpreters')
    } finally {
      setDispatchLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      'IN_PROGRESS': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Clock className="w-3 h-3" /> },
      'SEEKING_INTERPRETER': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Users className="w-3 h-3" /> },
      'INTERPRETER_ASSIGNED': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      'COMPLETED': { bg: 'bg-gray-100', text: 'text-gray-800', icon: <CheckCircle className="w-3 h-3" /> }
    }
    const badge = badges[status] || badges['IN_PROGRESS']
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {status.replace(/_/g, ' ')}
      </span>
    )
  }

  const filteredProjects = projects.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const matchesSearch = searchTerm === '' || 
      p.projectNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer?.company?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interpretation Dispatch</h1>
          <p className="text-gray-600 mt-1">Manage interpretation projects and assign interpreters</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by project # or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="SEEKING_INTERPRETER">Seeking Interpreter</option>
              <option value="INTERPRETER_ASSIGNED">Assigned</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Interpretation Projects</h2>
            <p className="text-sm text-gray-500">{filteredProjects.length} projects</p>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filteredProjects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No interpretation projects found
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedProject?.id === project.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900">{project.projectNumber}</span>
                      <p className="text-sm text-gray-500">{project.customer?.company || 'No customer'}</p>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {project.sourceLanguage?.name || 'Unknown'} → {project.targetLanguage?.name || 'Unknown'}
                      </span>
                    </div>
                    {project.jobInvitations?.length > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <Users className="w-3 h-3" />
                        {project.jobInvitations.filter(j => j.status === 'ACCEPTED').length > 0 ? (
                          <span className="text-green-600">
                            Assigned to {project.jobInvitations.find(j => j.status === 'ACCEPTED')?.linguist.firstName}
                          </span>
                        ) : (
                          <span className="text-yellow-600">
                            {project.jobInvitations.filter(j => j.status === 'PENDING').length} pending invitations
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dispatch Panel */}
        <div className="bg-white rounded-xl shadow-sm border">
          {selectedProject ? (
            <div className="divide-y">
              {/* Project Details */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Project Details</h2>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Project #</span>
                    <span className="font-medium">{selectedProject.projectNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Languages</span>
                    <span className="font-medium">
                      {selectedProject.sourceLanguage?.name} → {selectedProject.targetLanguage?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Customer</span>
                    <span className="font-medium">{selectedProject.customer?.company}</span>
                  </div>
                  {selectedProject.contact && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact</span>
                      <span className="font-medium">
                        {selectedProject.contact.firstName} {selectedProject.contact.lastName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Existing Invitations */}
              {selectedProject.jobInvitations?.length > 0 && (
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Invitations Sent</h3>
                  <div className="space-y-2">
                    {selectedProject.jobInvitations.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">
                            {inv.linguist.firstName} {inv.linguist.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{inv.distance?.toFixed(1)} miles away</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          inv.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          inv.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                          inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dispatch Form */}
              {selectedProject.status !== 'INTERPRETER_ASSIGNED' && (
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    {selectedProject.jobInvitations?.length > 0 ? 'Send More Invitations' : 'Dispatch Interpreters'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
                        <input
                          type="text"
                          value={dispatchForm.latitude}
                          onChange={(e) => setDispatchForm({...dispatchForm, latitude: e.target.value})}
                          placeholder="41.0534"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
                        <input
                          type="text"
                          value={dispatchForm.longitude}
                          onChange={(e) => setDispatchForm({...dispatchForm, longitude: e.target.value})}
                          placeholder="-73.5387"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Event Location</label>
                      <input
                        type="text"
                        value={dispatchForm.eventLocation}
                        onChange={(e) => setDispatchForm({...dispatchForm, eventLocation: e.target.value})}
                        placeholder="123 Main St, Stamford, CT"
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={dispatchForm.eventDate}
                          onChange={(e) => setDispatchForm({...dispatchForm, eventDate: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                        <input
                          type="time"
                          value={dispatchForm.eventTime}
                          onChange={(e) => setDispatchForm({...dispatchForm, eventTime: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Duration (hours)</label>
                        <input
                          type="number"
                          value={dispatchForm.eventDuration}
                          onChange={(e) => setDispatchForm({...dispatchForm, eventDuration: e.target.value})}
                          min="0.5"
                          step="0.5"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Max Distance (miles)</label>
                        <input
                          type="number"
                          value={dispatchForm.maxDistance}
                          onChange={(e) => setDispatchForm({...dispatchForm, maxDistance: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description (optional)</label>
                      <textarea
                        value={dispatchForm.eventDescription}
                        onChange={(e) => setDispatchForm({...dispatchForm, eventDescription: e.target.value})}
                        rows={2}
                        placeholder="Medical appointment, court hearing, etc."
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={findInterpreters}
                        disabled={matchLoading}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        {matchLoading ? 'Searching...' : 'Find Interpreters'}
                      </button>
                      <button
                        onClick={dispatchToInterpreters}
                        disabled={dispatchLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {dispatchLoading ? 'Sending...' : 'Dispatch All'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Matched Interpreters */}
              {matchedInterpreters.length > 0 && (
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Available Interpreters ({matchedInterpreters.length})
                  </h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {matchedInterpreters.map((interp) => (
                      <div key={interp.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{interp.name}</p>
                            <p className="text-xs text-gray-500">
                              {interp.city}, {interp.state}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-green-600">
                              <Navigation className="w-3 h-3" />
                              {interp.distance} mi
                            </div>
                            {interp.hourlyRate && (
                              <p className="text-xs text-gray-500">${interp.hourlyRate}/hr</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                          <a href={`mailto:${interp.email}`} className="flex items-center gap-1 hover:text-blue-600">
                            <Mail className="w-3 h-3" /> {interp.email}
                          </a>
                          {interp.phone && (
                            <a href={`tel:${interp.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                              <Phone className="w-3 h-3" /> {interp.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned Interpreter Info */}
              {selectedProject.status === 'INTERPRETER_ASSIGNED' && (
                <div className="p-4 bg-green-50">
                  <div className="flex items-center gap-2 text-green-800 mb-3">
                    <CheckCircle className="w-5 h-5" />
                    <h3 className="font-medium">Interpreter Assigned</h3>
                  </div>
                  {selectedProject.jobInvitations?.filter(j => j.status === 'ACCEPTED').map((inv) => (
                    <div key={inv.id} className="bg-white p-3 rounded-lg">
                      <p className="font-medium">{inv.linguist.firstName} {inv.linguist.lastName}</p>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(inv.eventDate).toLocaleDateString()} at {inv.eventTime}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {inv.eventLocation}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {inv.linguist.email}
                        </div>
                        {inv.linguist.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {inv.linguist.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">Select a Project</h3>
              <p className="text-sm text-gray-500">
                Choose an interpretation project from the list to dispatch interpreters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
