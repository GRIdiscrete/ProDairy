"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Fingerprint } from "lucide-react"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  })
  const [isUsingFingerprint, setIsUsingFingerprint] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate authentication - replace with your actual auth logic
    document.cookie = "auth-token=authenticated; path=/"
    router.push("/")
  }

  const handleFingerprintLogin = async () => {
    setIsUsingFingerprint(true)
    try {
      // Simulate fingerprint authentication
      await new Promise(resolve => setTimeout(resolve, 2000))
      document.cookie = "auth-token=authenticated; path=/"
      router.push("/")
    } catch (error) {
      console.error('Fingerprint authentication failed:', error)
    } finally {
      setIsUsingFingerprint(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-[#f0f2ff] to-[#e8ebff] flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-[#4f46e5]/20 to-[#7c3aed]/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-[#06b6d4]/20 to-[#3b82f6]/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-[#f59e0b]/20 to-[#ef4444]/20 rounded-full blur-xl"></div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Main login card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-10">
          {/* Logo and header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6">
              <Image
                src="/Prodairy-3D-Logo.png"
                alt="ProDairy Logo"
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? "Welcome to ProDairy" : "Join ProDairy"}
            </h1>
            <p className="text-gray-600 text-base">
              {isLogin ? "Sign in to your dairy management dashboard" : "Create your account to get started"}
            </p>
          </div>

          {/* Fingerprint login */}
          <div className="mb-6">
            <button 
              onClick={handleFingerprintLogin}
              disabled={isUsingFingerprint}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#0068BD] to-[#A7CF48] text-white rounded-xl py-4 px-4 hover:from-[#005a9f] hover:to-[#96b840] transition-all transform hover:scale-105 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Fingerprint className={`w-6 h-6 ${isUsingFingerprint ? 'animate-pulse' : ''}`} />
              {isUsingFingerprint ? 'Authenticating...' : 'Sign in with Fingerprint'}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">or continue with email</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0068BD] focus:border-transparent transition-all"
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0068BD] focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0068BD] focus:border-transparent transition-all"
                required
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-[#0068BD] focus:ring-[#0068BD]" />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-[#0068BD] hover:text-[#005a9f] font-medium">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#0068BD] to-[#A7CF48] text-white font-semibold py-3 px-4 rounded-xl hover:from-[#005a9f] hover:to-[#96b840] transition-all transform hover:scale-105 shadow-lg"
            >
              {isLogin ? "Sign in" : "Create account"}
            </button>
          </form>

          {/* Toggle between login/signup */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#0068BD] hover:text-[#005a9f] font-semibold"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer text */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            By continuing, you agree to our{" "}
            <a href="#" className="text-[#0068BD] hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-[#0068BD] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}