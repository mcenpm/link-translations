import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  DollarSign,
  ArrowRight,
  Plus
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const { user } = session

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-6 py-12">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name || user.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            {user.role === 'ADMIN' && 'Admin Dashboard'}
            {user.role === 'CUSTOMER' && 'Customer Portal'}
            {user.role === 'LINGUIST' && 'Linguist Portal'}
            {user.role === 'MANAGER' && 'Manager Dashboard'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Quotes</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">$0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* New Quote */}
          <Link 
            href="/quote"
            className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white hover:opacity-90 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold mb-2">Request New Quote</h3>
            <p className="text-white/80">Start a new translation or interpretation project</p>
          </Link>

          {/* Recent Quotes */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Quotes</h3>
              <Link 
                href="/dashboard/quotes"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No quotes yet</p>
              <p className="text-sm mt-1">Your quote history will appear here</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <Link 
              href="/dashboard/orders"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="text-center py-12 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No orders yet</p>
            <p className="text-sm mt-1">Your order history will appear here</p>
          </div>
        </div>
      </div>
    </div>
  )
}
