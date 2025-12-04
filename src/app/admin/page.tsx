export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Customers</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Linguists</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Pending Quotes</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">$0</p>
        </div>
      </div>
    </div>
  )
}
