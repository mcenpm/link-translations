import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  Languages, 
  FileText, 
  ShoppingCart, 
  DollarSign, 
  Settings,
  LogOut
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white min-h-screen fixed top-0 left-0 z-50">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <div>
              <span className="text-lg font-bold text-white">LINK</span>
              <span className="text-xs text-gray-400 block -mt-1">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link 
            href="/admin/customers" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Users className="w-5 h-5" />
            Customers
          </Link>
          <Link 
            href="/admin/linguists" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Languages className="w-5 h-5" />
            Linguists
          </Link>
          <Link 
            href="/admin/quotes" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FileText className="w-5 h-5" />
            Quotes
          </Link>
          <Link 
            href="/admin/orders" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            Orders
          </Link>
          <Link 
            href="/admin/pricing" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            Pricing
          </Link>
          <Link 
            href="/admin/settings" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <Link 
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  )
}
