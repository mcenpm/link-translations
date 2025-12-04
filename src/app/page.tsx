export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-blue-600">🌍</div>
            <h1 className="text-2xl font-bold text-gray-900">Link Translations</h1>
          </div>
          <nav className="flex gap-4">
            <a href="/customer" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium">
              Customer Portal
            </a>
            <a href="/admin" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium">
              Admin Panel
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20 text-white">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">Professional Translation Services</h2>
          <p className="text-xl text-blue-100 mb-8">
            Connect with expert linguists in all 50 US states
          </p>
          <p className="text-lg text-blue-50 mb-8">
            87+ languages • Instant quotes • Certified translators
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 text-center">
            <div className="text-4xl font-bold mb-2">10,575+</div>
            <div className="text-blue-100">Professional Translators</div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 text-center">
            <div className="text-4xl font-bold mb-2">6,357+</div>
            <div className="text-blue-100">Happy Clients</div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 text-center">
            <div className="text-4xl font-bold mb-2">35,546+</div>
            <div className="text-blue-100">Projects Completed</div>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6 text-center">
            <div className="text-4xl font-bold mb-2">87+</div>
            <div className="text-blue-100">Languages Supported</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href="/customer"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
          >
            Get a Quote
          </a>
          <a
            href="/admin"
            className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors border border-blue-400 text-center"
          >
            Admin Dashboard
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Instant Quotes</h3>
            <p className="text-blue-100">Get pricing in seconds. No waiting, no hidden costs.</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Expert Linguists</h3>
            <p className="text-blue-100">Hand-picked professionals in 87+ languages across all 50 states.</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
            <p className="text-blue-100">Certified translators with proven track records and ratings.</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-8">
          <h3 className="text-2xl font-semibold mb-6">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <h4 className="font-semibold mb-1">Search by State</h4>
                <p className="text-blue-100 text-sm">Find translators in your state or nationwide</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <h4 className="font-semibold mb-1">Multiple Languages</h4>
                <p className="text-blue-100 text-sm">Support for all major world languages</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h4 className="font-semibold mb-1">Secure Platform</h4>
                <p className="text-blue-100 text-sm">Safe and encrypted communication</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <h4 className="font-semibold mb-1">Easy Payment</h4>
                <p className="text-blue-100 text-sm">Multiple payment options available</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 bg-opacity-50 text-center py-6 mt-16">
        <p className="text-blue-100">
          Link Translations • Connecting Quality Translators with Clients Nationwide
        </p>
        <p className="text-blue-200 text-sm mt-2">
          © 2025 Link Translations. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
