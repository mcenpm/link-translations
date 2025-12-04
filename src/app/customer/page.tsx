export default function CustomerDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome to Link Translations</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Active Quotes</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Completed Orders</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Spent</h3>
          <p className="text-3xl font-bold text-purple-600">$0</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Request a Quote</h2>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Source Language</label>
              <select className="w-full border rounded px-3 py-2">
                <option>Select...</option>
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Language</label>
              <select className="w-full border rounded px-3 py-2">
                <option>Select...</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Word Count</label>
            <input
              type="number"
              placeholder="Enter word count"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Get Quote
          </button>
        </form>
      </div>
    </div>
  )
}
