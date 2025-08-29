"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Fingerprint } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [isUsingFingerprint, setIsUsingFingerprint] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // setError("")
    router.push("/")
    // setSubmitting(true)
    // try {
    //   const res = await fetch(
    //     "https://ckwkcg0o80cckkg0oog8okk8.greatssystems.co.zw/docs/api/users",
    //     { cache: "no-store" }
    //   )
    //   if (!res.ok) throw new Error("Failed to connect to authentication service")
    //   const users = await res.json()

    //   const user = users.find(
    //     (u: any) => u.email === formData.email && u.password === formData.password
    //   )

    //   if (user) {
    //     sessionStorage.setItem("userId", user.id)
    //     sessionStorage.setItem("role", user.role)
    //     sessionStorage.setItem("name", `${user.first_name} ${user.last_name}`)
    //     document.cookie = "auth-token=authenticated; path=/"
    //     router.push("/")
    //   } else {
    //     setError("Invalid email or password")
    //   }
    // } catch (err) {
    //   console.error(err)
    //   setError("Authentication failed. Please try again.")
    // } finally {
    //   setSubmitting(false)
    // }
  }

  const handleFingerprintLogin = async () => {
    setIsUsingFingerprint(true)
    setError("")
    try {
      // Simulated biometric auth; hook up WebAuthn later
      await new Promise((r) => setTimeout(r, 1600))
      document.cookie = "auth-token=authenticated; path=/"
      router.push("/")
    } catch (error) {
      console.error("Fingerprint authentication failed:", error)
      setError("Fingerprint authentication failed")
    } finally {
      setIsUsingFingerprint(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const dots = useMemo(() => Array.from({ length: 40 }), [])

  return (
    <div className="relative min-h-screen bg-white text-zinc-900 overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[38rem] w-[38rem] rounded-full bg-gradient-to-br from-lime-300/60 via-lime-400/30 to-blue-300/40 blur-3xl"
        initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
        animate={{ opacity: 1, scale: 1, rotate: 30 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-56 -right-56 h-[42rem] w-[42rem] rounded-full bg-gradient-to-br from-blue-200/60 via-blue-300/30 to-lime-200/40 blur-3xl"
        initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
        animate={{ opacity: 1, scale: 1, rotate: -20 }}
        transition={{ duration: 2.2, ease: "easeOut" }}
      />

      {/* Flowing blueprint lines */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40" viewBox="0 0 1440 900" aria-hidden>
        <defs>
          <linearGradient id="flow" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>
        </defs>
        {[0, 120, 240].map((y, i) => (
          <path
            key={i}
            d={`M -50 ${200 + y} C 200 ${120 + y}, 420 ${260 + y}, 720 ${160 + y} S 1300 ${280 + y}, 1500 ${220 + y}`}
            fill="none"
            stroke="url(#flow)"
            strokeWidth="1.5"
            className="animate-flow"
            style={{ animationDelay: `${i * 1.5}s` }}
          />
        ))}
      </svg>

      {/* Dotted nano-grid */}
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
        {dots.map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-zinc-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0.2, 0.5, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: i * 0.15 }}
            style={{
              top: `${(i * 57) % 90}vh`,
              left: `${(i * 89) % 95}vw`,
              filter: "blur(0.2px)",
            }}
            aria-hidden
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-[1100px] grid-cols-1 items-center gap-10 md:grid-cols-2">
          {/* Brand / hero side */}
          <div className="order-2 md:order-1 space-y-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="relative h-12 w-12">
                <Image src="/Prodairy-3D-Logo.png" alt="ProDairy" fill className="object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-light tracking-wider uppercase">ProDairy OS</h1>
                <p className="text-xs text-zinc-500 tracking-wide">Futuristic Dairy Manufacturing</p>
              </div>
            </div>

            <h2 className="mb-6 text-5xl font-thin leading-tight tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-lime-600">
              Welcome Back
            </h2>

            {/* Floating feature cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {["AI QC Alerts", "ISO 22000 Ready", "Real-time OEE", "Batch Traceability"].map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-md backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-r from-blue-500 to-lime-500" />
                    <p className="text-sm font-light tracking-wide text-zinc-700">{item}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Auth card */}
          <div className="order-1 md:order-2">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-[1.75rem] bg-gradient-to-r from-blue-300 to-lime-300 opacity-40 blur-xl" aria-hidden />
              <div className="relative rounded-[1.5rem] border border-zinc-200/70 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-semibold tracking-tight">Sign in</h3>
                  <p className="text-sm text-zinc-500">Use fingerprint or your company email</p>
                </div>

                {/* Fingerprint */}
                <button
                  onClick={handleFingerprintLogin}
                  disabled={isUsingFingerprint || submitting}
                  className="group mb-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-lime-600 px-4 py-3 font-medium text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
                >
                  <Fingerprint className={`h-5 w-5 ${isUsingFingerprint ? "animate-pulse" : ""}`} />
                  {isUsingFingerprint ? "Authenticating…" : "Sign in with Fingerprint"}
                </button>

                {/* Divider */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-zinc-200" />
                  <span className="text-xs text-zinc-500">or with email</span>
                  <div className="h-px flex-1 bg-zinc-200" />
                </div>

                {/* Email/password form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="block">
                    <span className="mb-1 block text-sm text-zinc-600">Email</span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@prodairy.co.zw"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none ring-0 transition placeholder:text-zinc-400 focus:border-lime-400 focus:ring-2 focus:ring-blue-500/30"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm text-zinc-600">Password</span>
                    <input
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none ring-0 transition placeholder:text-zinc-400 focus:border-lime-400 focus:ring-2 focus:ring-blue-500/30"
                      required
                    />
                  </label>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-zinc-600">
                      <input type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
                      Remember me
                    </label>
                    <a href="#" className="font-medium text-blue-700 hover:underline">Forgot password?</a>
                  </div>

                  {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || isUsingFingerprint}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-lime-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
                  >
                    {submitting ? "Signing in…" : "Sign in"}
                  </button>
                </form>

                <p className="mt-6 text-center text-xs text-zinc-500">
                  By continuing, you agree to our{" "}
                  <a className="text-blue-700 hover:underline" href="#">Terms of Service</a>{" "}
                  and{" "}
                  <a className="text-blue-700 hover:underline" href="#">Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>
          {/* End auth card */}
        </div>
      </div>

      {/* Decorative factory steam */}
      <svg className="pointer-events-none absolute bottom-0 left-0 right-0 mx-auto h-24 w-full max-w-5xl opacity-20" viewBox="0 0 1200 120" aria-hidden>
        <path d="M0,80 C150,120 350,20 600,80 C850,140 1050,20 1200,80 L1200,140 L0,140 Z" fill="url(#milk)" />
        <defs>
          <linearGradient id="milk" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#e5f3ff" />
            <stop offset="100%" stopColor="#eefbea" />
          </linearGradient>
        </defs>
      </svg>

      {/* Global animations */}
      <style jsx global>{`
        @keyframes flow { to { stroke-dashoffset: -2000; } }
        .animate-flow { stroke-dasharray: 12 10; animation: flow 18s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-flow { animation: none; }
        }
      `}</style>
    </div>
  )
}
