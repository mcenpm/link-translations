'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Search, Tag, Percent, DollarSign, 
  Trash2, Edit2, CheckCircle, XCircle, Loader2, Copy
} from 'lucide-react'

interface Coupon {
  id: string
  code: string
  description: string | null
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minimumOrder: number | null
  maxDiscount: number | null
  maxUses: number | null
  usedCount: number
  validFrom: string
  validUntil: string | null
  isActive: boolean
  serviceType: string | null
  firstOrderOnly: boolean
  _count: { usages: number }
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    minimumOrder: '',
    maxDiscount: '',
    maxUses: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    serviceType: '',
    firstOrderOnly: false
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  async function fetchCoupons() {
    try {
      const res = await fetch('/api/admin/coupons')
      if (res.ok) {
        const data = await res.json()
        setCoupons(data)
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingCoupon(null)
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minimumOrder: '',
      maxDiscount: '',
      maxUses: '',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      serviceType: '',
      firstOrderOnly: false
    })
    setShowModal(true)
  }

  function openEditModal(coupon: Coupon) {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minimumOrder: coupon.minimumOrder?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      maxUses: coupon.maxUses?.toString() || '',
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      serviceType: coupon.serviceType || '',
      firstOrderOnly: coupon.firstOrderOnly
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingCoupon 
        ? `/api/admin/coupons/${editingCoupon.id}`
        : '/api/admin/coupons'
      
      const res = await fetch(url, {
        method: editingCoupon ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setShowModal(false)
        fetchCoupons()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save coupon')
      }
    } catch (error) {
      console.error('Failed to save coupon:', error)
      alert('Failed to save coupon')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(coupon: Coupon) {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive })
      })

      if (res.ok) {
        fetchCoupons()
      }
    } catch (error) {
      console.error('Failed to toggle coupon:', error)
    }
  }

  async function deleteCoupon(coupon: Coupon) {
    if (!confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) return

    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchCoupons()
      }
    } catch (error) {
      console.error('Failed to delete coupon:', error)
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    // Could add a toast notification here
  }

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Discounts</h1>
          <p className="text-gray-500">Manage promotional codes and discounts</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search coupons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Coupons Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`bg-white rounded-xl border ${coupon.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'} p-5 space-y-4`}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${coupon.discountType === 'PERCENTAGE' ? 'bg-purple-100' : 'bg-green-100'}`}>
                  {coupon.discountType === 'PERCENTAGE' ? (
                    <Percent className="w-5 h-5 text-purple-600" />
                  ) : (
                    <DollarSign className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900">{coupon.code}</span>
                    <button 
                      onClick={() => copyCode(coupon.code)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {coupon.description && (
                    <p className="text-sm text-gray-500">{coupon.description}</p>
                  )}
                </div>
              </div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {coupon.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Discount Value */}
            <div className="text-center py-3 bg-gray-50 rounded-lg">
              <span className="text-3xl font-bold text-gray-900">
                {coupon.discountType === 'PERCENTAGE' ? (
                  <>{coupon.discountValue}%</>
                ) : (
                  <>${coupon.discountValue}</>
                )}
              </span>
              <span className="text-gray-500 ml-1">off</span>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              {coupon.minimumOrder && (
                <div className="flex justify-between text-gray-600">
                  <span>Min. order:</span>
                  <span className="font-medium">${coupon.minimumOrder}</span>
                </div>
              )}
              {coupon.maxDiscount && (
                <div className="flex justify-between text-gray-600">
                  <span>Max discount:</span>
                  <span className="font-medium">${coupon.maxDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Usage:</span>
                <span className="font-medium">
                  {coupon.usedCount} / {coupon.maxUses || '∞'}
                </span>
              </div>
              {coupon.validUntil && (
                <div className="flex justify-between text-gray-600">
                  <span>Expires:</span>
                  <span className="font-medium">
                    {new Date(coupon.validUntil).toLocaleDateString()}
                  </span>
                </div>
              )}
              {coupon.serviceType && (
                <div className="flex justify-between text-gray-600">
                  <span>Service:</span>
                  <span className="font-medium capitalize">{coupon.serviceType}</span>
                </div>
              )}
              {coupon.firstOrderOnly && (
                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  First order only
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => toggleActive(coupon)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  coupon.isActive 
                    ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                    : 'text-green-700 bg-green-50 hover:bg-green-100'
                }`}
              >
                {coupon.isActive ? (
                  <><XCircle className="w-4 h-4" /> Deactivate</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Activate</>
                )}
              </button>
              <button
                onClick={() => openEditModal(coupon)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteCoupon(coupon)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredCoupons.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No coupons found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 text-blue-600 hover:underline"
            >
              Create your first coupon
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER20"
                  required
                  disabled={!!editingCoupon}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase disabled:bg-gray-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summer promotion discount"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.discountType === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount ($)'} *
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === 'PERCENTAGE' ? '20' : '50'}
                    required
                    min="0"
                    max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min. Order ($)
                  </label>
                  <input
                    type="number"
                    value={formData.minimumOrder}
                    onChange={(e) => setFormData({ ...formData, minimumOrder: e.target.value })}
                    placeholder="100"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Discount ($)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="50"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Max Uses & Service Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Uses
                  </label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    placeholder="Unlimited"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Services</option>
                    <option value="translation">Translation Only</option>
                    <option value="interpretation">Interpretation Only</option>
                  </select>
                </div>
              </div>

              {/* Valid Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* First Order Only */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="firstOrderOnly"
                  checked={formData.firstOrderOnly}
                  onChange={(e) => setFormData({ ...formData, firstOrderOnly: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="firstOrderOnly" className="text-sm text-gray-700">
                  First order only (new customers)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : editingCoupon ? (
                    'Save Changes'
                  ) : (
                    'Create Coupon'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
