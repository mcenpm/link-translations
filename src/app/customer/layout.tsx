export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Link Translations</h1>
          <p className="text-blue-100">Customer Portal</p>
        </div>
      </header>
      <nav className="bg-gray-100 border-b p-4">
        <div className="max-w-6xl mx-auto flex space-x-6">
          <a href="/customer" className="text-gray-600 hover:text-gray-900 font-medium">
            Dashboard
          </a>
          <a href="/customer/quotes" className="text-gray-600 hover:text-gray-900 font-medium">
            My Quotes
          </a>
          <a href="/customer/orders" className="text-gray-600 hover:text-gray-900 font-medium">
            My Orders
          </a>
          <a href="/customer/invoices" className="text-gray-600 hover:text-gray-900 font-medium">
            Invoices
          </a>
          <a href="/customer/profile" className="text-gray-600 hover:text-gray-900 font-medium">
            Profile
          </a>
        </div>
      </nav>
      <main className="flex-1 max-w-6xl mx-auto w-full p-8">{children}</main>
    </div>
  )
}
