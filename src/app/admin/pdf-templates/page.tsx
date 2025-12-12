'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, Search, Edit2, Eye, X, Loader2, CheckCircle,
  FileIcon, Receipt, ShoppingCart,
  Palette, FileCheck
} from 'lucide-react'

interface PdfTemplate {
  id: string
  type: string
  name: string
  showLogo: boolean
  headerBackgroundColor: string
  headerTextColor: string
  showCompanyAddress: boolean
  showContactInfo: boolean
  tableHeaderColor: string
  alternateRowColor: string
  footerText: string | null
  showPageNumbers: boolean
  termsTitle: string | null
  termsContent: string | null
  defaultNotes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const typeIcons: Record<string, typeof FileText> = {
  QUOTE: FileIcon,
  INVOICE: Receipt,
  PURCHASE_ORDER: ShoppingCart
}

const typeColors: Record<string, string> = {
  QUOTE: 'bg-blue-100 text-blue-700',
  INVOICE: 'bg-emerald-100 text-emerald-700',
  PURCHASE_ORDER: 'bg-amber-100 text-amber-700'
}

const typeLabels: Record<string, string> = {
  QUOTE: 'Quote',
  INVOICE: 'Invoice',
  PURCHASE_ORDER: 'Purchase Order'
}

export default function PdfTemplatesPage() {
  const [templates, setTemplates] = useState<PdfTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [editingTemplate, setEditingTemplate] = useState<PdfTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<PdfTemplate | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'header' | 'table' | 'footer'>('header')

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/admin/pdf-templates')
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
      const res = await fetch(`/api/admin/pdf-templates/${editingTemplate.id}`, {
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

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || t.type === typeFilter
    return matchesSearch && matchesType
  })

  const uniqueTypes = Array.from(new Set(templates.map(t => t.type)))

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
          <h1 className="text-2xl font-bold text-gray-900">PDF Templates</h1>
          <p className="text-gray-600 mt-1">
            Customize the appearance of quotes, invoices, and purchase orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Types</option>
          {uniqueTypes.map(type => (
            <option key={type} value={type}>{typeLabels[type] || type}</option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const Icon = typeIcons[template.type] || FileText
          const colorClass = typeColors[template.type] || 'bg-gray-100 text-gray-700'
          
          return (
            <div 
              key={template.id} 
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                        {typeLabels[template.type] || template.type}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    template.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Preview Card */}
                <div 
                  className="border border-gray-200 rounded-lg p-3 mb-4 relative overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, ${template.headerBackgroundColor}10, ${template.tableHeaderColor}10)` 
                  }}
                >
                  <div 
                    className="h-4 w-full rounded mb-2 flex items-center px-2"
                    style={{ backgroundColor: template.headerBackgroundColor }}
                  >
                    <span className="text-[8px] font-bold" style={{ color: template.headerTextColor }}>
                      {typeLabels[template.type].toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div 
                      className="h-2 rounded w-full"
                      style={{ backgroundColor: template.tableHeaderColor }}
                    />
                    <div className="h-2 rounded w-full" style={{ backgroundColor: template.alternateRowColor }} />
                    <div className="h-2 bg-white rounded w-full" />
                    <div className="h-2 rounded w-full" style={{ backgroundColor: template.alternateRowColor }} />
                  </div>
                  <div className="mt-3 flex gap-2">
                    {template.showLogo && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-white/80 rounded text-gray-500">Logo</span>
                    )}
                    {template.showCompanyAddress && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-white/80 rounded text-gray-500">Address</span>
                    )}
                    {template.termsContent && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-white/80 rounded text-gray-500">Terms</span>
                    )}
                  </div>
                </div>

                {/* Color Preview */}
                <div className="flex gap-2 mb-4">
                  <div 
                    className="flex-1 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: template.headerBackgroundColor }}
                  >
                    <span className="text-[9px]" style={{ color: template.headerTextColor }}>Header</span>
                  </div>
                  <div 
                    className="flex-1 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: template.tableHeaderColor }}
                  >
                    <span className="text-[9px] text-white">Table</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => {
                      setEditingTemplate(template)
                      setActiveTab('header')
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${typeColors[editingTemplate.type]} flex items-center justify-center`}>
                  {(() => {
                    const Icon = typeIcons[editingTemplate.type] || FileText
                    return <Icon className="w-4 h-4" />
                  })()}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{editingTemplate.name}</h2>
                  <p className="text-sm text-gray-500">{typeLabels[editingTemplate.type]}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingTemplate(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('header')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'header' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Palette className="w-4 h-4 inline-block mr-2" />
                Header & Colors
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'table' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4 inline-block mr-2" />
                Table & Content
              </button>
              <button
                onClick={() => setActiveTab('footer')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'footer' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileCheck className="w-4 h-4 inline-block mr-2" />
                Footer & Terms
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {activeTab === 'header' && (
                <div className="space-y-6">
                  {/* Name & Status */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template Name
                      </label>
                      <input
                        type="text"
                        value={editingTemplate.name}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          name: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={editingTemplate.isActive ? 'active' : 'inactive'}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          isActive: e.target.value === 'active'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Header Colors */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Header Background Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={editingTemplate.headerBackgroundColor}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            headerBackgroundColor: e.target.value
                          })}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editingTemplate.headerBackgroundColor}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            headerBackgroundColor: e.target.value
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Header Text Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={editingTemplate.headerTextColor}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            headerTextColor: e.target.value
                          })}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editingTemplate.headerTextColor}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            headerTextColor: e.target.value
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Display Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Display Options
                    </label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingTemplate.showLogo}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            showLogo: e.target.checked
                          })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Show Logo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingTemplate.showCompanyAddress}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            showCompanyAddress: e.target.checked
                          })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Show Company Address</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingTemplate.showContactInfo}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            showContactInfo: e.target.checked
                          })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Show Contact Info</span>
                      </label>
                    </div>
                  </div>

                  {/* Header Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Header Preview
                    </label>
                    <div 
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: editingTemplate.headerBackgroundColor }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          {editingTemplate.showLogo && (
                            <div 
                              className="w-16 h-8 rounded mb-2 flex items-center justify-center text-xs"
                              style={{ 
                                backgroundColor: editingTemplate.headerTextColor + '20',
                                color: editingTemplate.headerTextColor 
                              }}
                            >
                              LOGO
                            </div>
                          )}
                          {editingTemplate.showCompanyAddress && (
                            <p className="text-xs" style={{ color: editingTemplate.headerTextColor + 'cc' }}>
                              123 Main Street, City, ST 12345
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <h3 
                            className="text-xl font-bold"
                            style={{ color: editingTemplate.headerTextColor }}
                          >
                            {typeLabels[editingTemplate.type].toUpperCase()}
                          </h3>
                          <p 
                            className="text-xs"
                            style={{ color: editingTemplate.headerTextColor + 'cc' }}
                          >
                            #DOC-001
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'table' && (
                <div className="space-y-6">
                  {/* Table Colors */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Table Header Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={editingTemplate.tableHeaderColor}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            tableHeaderColor: e.target.value
                          })}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editingTemplate.tableHeaderColor}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            tableHeaderColor: e.target.value
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternate Row Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={editingTemplate.alternateRowColor}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            alternateRowColor: e.target.value
                          })}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editingTemplate.alternateRowColor}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            alternateRowColor: e.target.value
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Table Preview
                    </label>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: editingTemplate.tableHeaderColor }}>
                            <th className="text-left px-4 py-2 text-white">Description</th>
                            <th className="text-right px-4 py-2 text-white">Qty</th>
                            <th className="text-right px-4 py-2 text-white">Rate</th>
                            <th className="text-right px-4 py-2 text-white">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ backgroundColor: editingTemplate.alternateRowColor }}>
                            <td className="px-4 py-2">Translation Service</td>
                            <td className="text-right px-4 py-2">1,000</td>
                            <td className="text-right px-4 py-2">$0.12</td>
                            <td className="text-right px-4 py-2">$120.00</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2">Editing & Proofreading</td>
                            <td className="text-right px-4 py-2">1,000</td>
                            <td className="text-right px-4 py-2">$0.04</td>
                            <td className="text-right px-4 py-2">$40.00</td>
                          </tr>
                          <tr style={{ backgroundColor: editingTemplate.alternateRowColor }}>
                            <td className="px-4 py-2">Rush Fee</td>
                            <td className="text-right px-4 py-2">1</td>
                            <td className="text-right px-4 py-2">$25.00</td>
                            <td className="text-right px-4 py-2">$25.00</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Default Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Notes (Optional)
                    </label>
                    <textarea
                      value={editingTemplate.defaultNotes || ''}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        defaultNotes: e.target.value || null
                      })}
                      rows={3}
                      placeholder="Add any default notes that should appear on this document type..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'footer' && (
                <div className="space-y-6">
                  {/* Footer Options */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={editingTemplate.showPageNumbers}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          showPageNumbers: e.target.checked
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Show Page Numbers</span>
                    </label>
                  </div>

                  {/* Footer Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Footer Text
                    </label>
                    <textarea
                      value={editingTemplate.footerText || ''}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        footerText: e.target.value || null
                      })}
                      rows={2}
                      placeholder="Thank you for your business!"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Terms Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Terms Title
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.termsTitle || ''}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        termsTitle: e.target.value || null
                      })}
                      placeholder="Terms & Conditions"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Terms Content
                    </label>
                    <textarea
                      value={editingTemplate.termsContent || ''}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        termsContent: e.target.value || null
                      })}
                      rows={4}
                      placeholder="Enter terms and conditions..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Footer Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Footer Preview
                    </label>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      {editingTemplate.termsTitle && editingTemplate.termsContent && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-1">
                            {editingTemplate.termsTitle}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {editingTemplate.termsContent}
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-t pt-3">
                        <p className="text-xs text-gray-500">
                          {editingTemplate.footerText || 'No footer text'}
                        </p>
                        {editingTemplate.showPageNumbers && (
                          <p className="text-xs text-gray-400">Page 1 of 1</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Template Preview</h2>
              </div>
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* PDF Preview Mock */}
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="bg-white shadow-lg mx-auto max-w-[500px]">
                  {/* Header */}
                  <div 
                    className="p-4"
                    style={{ backgroundColor: previewTemplate.headerBackgroundColor }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        {previewTemplate.showLogo && (
                          <div 
                            className="w-20 h-10 rounded mb-2 flex items-center justify-center text-xs"
                            style={{ 
                              backgroundColor: previewTemplate.headerTextColor + '20',
                              color: previewTemplate.headerTextColor 
                            }}
                          >
                            LOGO
                          </div>
                        )}
                        {previewTemplate.showCompanyAddress && (
                          <div style={{ color: previewTemplate.headerTextColor + 'cc' }}>
                            <p className="text-xs">Link Translations LLC</p>
                            <p className="text-[10px]">123 Main St, City, ST 12345</p>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <h1 
                          className="text-xl font-bold"
                          style={{ color: previewTemplate.headerTextColor }}
                        >
                          {typeLabels[previewTemplate.type].toUpperCase()}
                        </h1>
                        <p 
                          className="text-xs"
                          style={{ color: previewTemplate.headerTextColor + 'cc' }}
                        >
                          #{previewTemplate.type.charAt(0)}-001
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: previewTemplate.headerTextColor + 'cc' }}
                        >
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Customer Info */}
                    {previewTemplate.showContactInfo && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-600">Bill To:</p>
                        <p className="text-sm">John Smith</p>
                        <p className="text-xs text-gray-500">ABC Company</p>
                      </div>
                    )}

                    {/* Table */}
                    <table className="w-full text-xs mb-4">
                      <thead>
                        <tr style={{ backgroundColor: previewTemplate.tableHeaderColor }}>
                          <th className="text-left px-2 py-1.5 text-white">Description</th>
                          <th className="text-right px-2 py-1.5 text-white">Qty</th>
                          <th className="text-right px-2 py-1.5 text-white">Rate</th>
                          <th className="text-right px-2 py-1.5 text-white">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ backgroundColor: previewTemplate.alternateRowColor }}>
                          <td className="px-2 py-1.5">Translation Service</td>
                          <td className="text-right px-2 py-1.5">1,000</td>
                          <td className="text-right px-2 py-1.5">$0.12</td>
                          <td className="text-right px-2 py-1.5">$120.00</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-1.5">Editing</td>
                          <td className="text-right px-2 py-1.5">1,000</td>
                          <td className="text-right px-2 py-1.5">$0.04</td>
                          <td className="text-right px-2 py-1.5">$40.00</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-4">
                      <div className="w-40">
                        <div className="flex justify-between text-xs py-1">
                          <span>Subtotal</span>
                          <span>$160.00</span>
                        </div>
                        <div className="flex justify-between text-xs py-1">
                          <span>Tax</span>
                          <span>$12.80</span>
                        </div>
                        <div 
                          className="flex justify-between text-sm font-bold py-1 border-t"
                          style={{ color: previewTemplate.headerBackgroundColor }}
                        >
                          <span>Total</span>
                          <span>$172.80</span>
                        </div>
                      </div>
                    </div>

                    {/* Terms */}
                    {previewTemplate.termsTitle && previewTemplate.termsContent && (
                      <div className="bg-gray-50 rounded p-2 mb-4">
                        <p className="text-xs font-semibold text-gray-700">
                          {previewTemplate.termsTitle}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {previewTemplate.termsContent}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="border-t pt-2 flex justify-between items-center">
                      <p className="text-[10px] text-gray-500">
                        {previewTemplate.footerText || ''}
                      </p>
                      {previewTemplate.showPageNumbers && (
                        <p className="text-[10px] text-gray-400">Page 1 of 1</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
