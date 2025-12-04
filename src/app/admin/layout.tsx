export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-8">Link Translations</h2>
        <nav className="space-y-2">
          <a href="/admin" className="block px-4 py-2 rounded hover:bg-gray-800">
            Dashboard
          </a>
          <a href="/admin/customers" className="block px-4 py-2 rounded hover:bg-gray-800">
            Customers
          </a>
          <a href="/admin/linguists" className="block px-4 py-2 rounded hover:bg-gray-800">
            Linguists
          </a>
          <a href="/admin/quotes" className="block px-4 py-2 rounded hover:bg-gray-800">
            Quotes
          </a>
          <a href="/admin/orders" className="block px-4 py-2 rounded hover:bg-gray-800">
            Orders
          </a>
          <a href="/admin/pricing" className="block px-4 py-2 rounded hover:bg-gray-800">
            Pricing
          </a>
          <a href="/admin/settings" className="block px-4 py-2 rounded hover:bg-gray-800">
            Settings
          </a>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  )
}
