'use client'

import { useState, useEffect } from 'react'
import { 
  Mail, Search, Edit2, Eye, Send, X, Loader2,
  CheckCircle, FileText, Bell, Settings
} from 'lucide-react'

interface EmailTemplate {
  id: string
  slug: string
  name: string
  subject: string
  description: string | null
  category: string
  variables: string[]
  htmlContent: string
  plainContent: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const categoryIcons: Record<string, typeof Mail> = {
  TRANSACTIONAL: FileText,
  NOTIFICATION: Bell,
  MARKETING: Mail,
  SYSTEM: Settings
}

const categoryColors: Record<string, string> = {
  TRANSACTIONAL: 'bg-blue-100 text-blue-700',
  NOTIFICATION: 'bg-amber-100 text-amber-700',
  MARKETING: 'bg-green-100 text-green-700',
  SYSTEM: 'bg-gray-100 text-gray-700'
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const [testEmailAddress, setTestEmailAddress] = useState('')
  const [sendingTest, setSendingTest] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/admin/email-templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveTemplate() {
    if (!editingTemplate) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/email-templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate)
      })

      if (res.ok) {
        await fetchTemplates()
        setEditingTemplate(null)
      } else {
        alert('Failed to save template')
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      alert('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  async function handleSendTest() {
    if (!previewTemplate || !testEmailAddress) return

    setSendingTest(true)
    try {
      const res = await fetch(`/api/admin/email-templates/${previewTemplate.id}/send-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail: testEmailAddress })
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.preview 
          ? 'Preview mode - email not sent (API key not configured)'
          : 'Test email sent successfully!')
      } else {
        alert(data.error || 'Failed to send test email')
      }
    } catch (error) {
      console.error('Failed to send test:', error)
      alert('Failed to send test email')
    } finally {
      setSendingTest(false)
    }
  }

  async function handleToggleActive(template: EmailTemplate) {
    try {
      const res = await fetch(`/api/admin/email-templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...template, isActive: !template.isActive })
      })

      if (res.ok) {
        await fetchTemplates()
      }
    } catch (error) {
      console.error('Failed to toggle template:', error)
    }
  }

  // Get unique categories
  const categories = Array.from(new Set(templates.map(t => t.category)))

  // Filter templates
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                         t.subject.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-500">Manage your transactional email templates</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4">
        {filteredTemplates.map(template => {
          const CategoryIcon = categoryIcons[template.category] || Mail
          return (
            <div
              key={template.id}
              className={`bg-white rounded-xl border p-4 ${
                !template.isActive ? 'opacity-60 border-gray-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${categoryColors[template.category] || 'bg-gray-100 text-gray-700'}`}>
                    <CategoryIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      {!template.isActive && (
                        <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="text-gray-500">Subject:</span> {template.subject}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.variables.map(v => (
                        <span key={v} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded font-mono">
                          {`{{${v}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Preview & Test"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(template)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      template.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {template.isActive ? 'Active' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No templates found</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Edit Template</h2>
              <button
                onClick={() => setEditingTemplate(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TRANSACTIONAL">Transactional</option>
                    <option value="NOTIFICATION">Notification</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="SYSTEM">System</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={editingTemplate.description || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variables (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingTemplate.variables.join(', ')}
                  onChange={(e) => setEditingTemplate({ 
                    ...editingTemplate, 
                    variables: e.target.value.split(',').map(v => v.trim()).filter(Boolean) 
                  })}
                  placeholder="customerName, quoteNumber, total"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HTML Content
                </label>
                <textarea
                  value={editingTemplate.htmlContent}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, htmlContent: e.target.value })}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Preview: {previewTemplate.name}</h2>
              <button
                onClick={() => {
                  setPreviewTemplate(null)
                  setTestEmailAddress('')
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {/* Subject */}
              <div className="px-4 py-3 bg-gray-50 border-b">
                <p className="text-sm text-gray-500">Subject</p>
                <p className="font-medium">{previewTemplate.subject}</p>
              </div>
              
              {/* HTML Preview */}
              <div className="p-4">
                <div 
                  className="border border-gray-200 rounded-lg p-4"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.htmlContent }}
                />
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="Enter email to send test..."
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSendTest}
                  disabled={sendingTest || !testEmailAddress}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
