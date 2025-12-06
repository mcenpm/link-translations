'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Users, 
  Languages, 
  FileText, 
  FolderOpen, 
  DollarSign, 
  Settings,
  LogOut,
  Building2,
  UserPlus,
  Home,
  User
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Don't show layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/admin/login' })
  }

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin'
    return pathname.startsWith(path)
  }

  const navLinkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive(path)
        ? 'bg-blue-600 text-white'
        : 'hover:bg-gray-800 text-gray-300 hover:text-white'
    }`
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white h-screen fixed top-0 left-0 z-50 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-gray-800 flex-shrink-0">
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

        {/* Navigation - scrollable */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link 
            href="/admin" 
            className={navLinkClass('/admin')}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link 
            href="/admin/corporates" 
            className={navLinkClass('/admin/corporates')}
          >
            <Building2 className="w-5 h-5" />
            Corporates
          </Link>
          <Link 
            href="/admin/leads" 
            className={navLinkClass('/admin/leads')}
          >
            <UserPlus className="w-5 h-5" />
            Leads
          </Link>
          <Link 
            href="/admin/customers" 
            className={navLinkClass('/admin/customers')}
          >
            <Users className="w-5 h-5" />
            Contacts
          </Link>
          <Link 
            href="/admin/linguists" 
            className={navLinkClass('/admin/linguists')}
          >
            <Languages className="w-5 h-5" />
            Linguists
          </Link>
          <Link 
            href="/admin/quotes" 
            className={navLinkClass('/admin/quotes')}
          >
            <FileText className="w-5 h-5" />
            Quotes
          </Link>
          <Link 
            href="/admin/projects" 
            className={navLinkClass('/admin/projects')}
          >
            <FolderOpen className="w-5 h-5" />
            Projects
          </Link>
          <Link 
            href="/admin/pricing" 
            className={navLinkClass('/admin/pricing')}
          >
            <DollarSign className="w-5 h-5" />
            Pricing
          </Link>
          <Link 
            href="/admin/settings" 
            className={navLinkClass('/admin/settings')}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>

        {/* Bottom - User & Actions */}
        <div className="p-3 border-t border-gray-800 flex-shrink-0">
          {/* User Info */}
          {session?.user && (
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">
                  {session.user.name}
                </div>
                <div className="text-[10px] text-gray-400 truncate">
                  {session.user.email}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Link 
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white text-xs"
            >
              <Home className="w-3.5 h-3.5" />
              Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  )
}
