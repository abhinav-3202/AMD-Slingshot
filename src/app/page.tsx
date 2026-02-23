import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-black">MedAssist</h1>
        <Link
          href="/signIn"
          className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6">
        <span className="text-sm font-medium bg-gray-100 text-gray-600 px-4 py-1 rounded-full mb-6">
          Your Personal Health Assistant
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight text-black mb-6 max-w-2xl leading-tight">
          Welcome to <span className="text-blue-600">MedAssist</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mb-10">
          Get instant answers to your health questions, powered by AI. 
          MedAssist is here to guide you 24/7 with personalized medical insights.
        </p>
        <div className="flex gap-4">
          <Link
            href="/signUp"
            className="bg-black text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/signIn"
            className="border border-gray-300 text-black px-8 py-3 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-12 py-16 bg-gray-50">
        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm">
          <span className="text-3xl mb-4">🩺</span>
          <h3 className="font-semibold text-lg mb-2">AI Health Guidance</h3>
          <p className="text-gray-500 text-sm">Ask any health related question and get instant reliable answers.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm">
          <span className="text-3xl mb-4">🔒</span>
          <h3 className="font-semibold text-lg mb-2">Private & Secure</h3>
          <p className="text-gray-500 text-sm">Your health data is private and protected at all times.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm">
          <span className="text-3xl mb-4">⚡</span>
          <h3 className="font-semibold text-lg mb-2">24/7 Available</h3>
          <p className="text-gray-500 text-sm">MedAssist is always available whenever you need it.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400 border-t border-gray-100">
        © 2026 MedAssist. All rights reserved.
      </footer>

    </div>
  );
}