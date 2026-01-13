"use client"

import React, { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useDispatch } from "react-redux"
import { Fingerprint, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { loginUser, clearError } from "@/lib/store/slices/authSlice"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import type { AppDispatch } from "@/lib/store"
import * as yup from "yup"
import { LoadingButton } from "@/components/ui/loading-button"

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [isUsingFingerprint, setIsUsingFingerprint] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [isFormValid, setIsFormValid] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error, isAuthenticated } = useAuth()


  // Yup validation schema
  const loginSchema = yup.object().shape({
    email: yup
      .string()
      .required("Email is required")
      .email("Please enter a valid email address"),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("Form submission started with data:", formData)

    // Clear previous errors and reset profile fetch success
    setValidationErrors({})
    setProfileFetchSuccess(false)
    dispatch(clearError())

    try {
      // Validate form data with Yup
      await loginSchema.validate(formData, { abortEarly: false })

      setSubmitting(true)

      try {
        const result = await dispatch(loginUser(formData)).unwrap()
        console.log("Login successful:", result)

        // Show success toast
        toast.success("Welcome back! Redirecting to dashboard...")

        // Set profile fetch success flag to trigger immediate redirect
        setProfileFetchSuccess(true)
      } catch (err: any) {
        console.error("Login failed:", err)
        console.log("Error details:", {
          statusCode: err.statusCode,
          message: err.message,
          fullError: err
        })

        // Handle API error responses with toast notifications
        console.log('Toast error handling - Full error object:', err)

        // Extract statusCode and message from the error structure
        let statusCode = err.statusCode || 500
        let message = err.message || "Login failed"

        console.log('Toast error handling - Extracted:', { statusCode, message })

        if (statusCode === 400) {
          if (err.message === "missing email or phone") {
            toast.error("Please provide both email and password")
          } else if (message === "Invalid login credentials") {
            console.log('Showing toast for Invalid login credentials')
            toast.error("Invalid email or password. Please check your credentials and try again.")
          } else {
            toast.error(message || "Invalid credentials")
          }
        } else if (statusCode === 401) {
          toast.error("Invalid email or password")
        } else if (statusCode === 500) {
          toast.error("Server error. Please try again later.")
        } else {
          toast.error(message || "Login failed. Please try again.")
        }
      }
    } catch (validationErr: any) {
      // Handle Yup validation errors
      if (validationErr.inner) {
        const errors: { [key: string]: string } = {}
        validationErr.inner.forEach((error: any) => {
          if (error.path) {
            errors[error.path] = error.message
          }
        })
        setValidationErrors(errors)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleFingerprintLogin = async () => {
    setIsUsingFingerprint(true)
    setSubmitting(true) // Also set submitting state for consistency
    setValidationErrors({})
    setProfileFetchSuccess(false) // Reset profile fetch success flag
    dispatch(clearError())

    try {
      // Simulated biometric auth; hook up WebAuthn later
      await new Promise((r) => setTimeout(r, 1600))
      // For demo purposes, use a default account
      const result = await dispatch(loginUser({
        email: "bmwale@gmail.com",
        password: "password"
      })).unwrap()
      console.log("Fingerprint login successful:", result)

      // Show success toast
      toast.success("Welcome back! Redirecting to dashboard...")

      // Set profile fetch success flag to trigger immediate redirect
      setProfileFetchSuccess(true)
    } catch (error: any) {
      console.error("Fingerprint authentication failed:", error)

      // Handle API error responses for fingerprint login with toast
      const statusCode = error.statusCode || error.apiError?.statusCode || 500
      const message = error.message || error.apiError?.message || "Authentication failed"

      if (statusCode === 400) {
        if (message === "missing email or phone") {
          toast.error("Authentication failed. Please try again.")
        } else if (message === "Invalid login credentials") {
          toast.error("Invalid credentials. Please try again.")
        } else {
          toast.error(message || "Authentication failed")
        }
      } else if (statusCode === 401) {
        toast.error("Authentication failed. Please try again.")
      } else {
        toast.error(message || "Authentication failed. Please try again.")
      }
    } finally {
      setIsUsingFingerprint(false)
      setSubmitting(false) // Reset submitting state
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name
    const fieldValue = e.target.value

    setFormData((prev) => ({ ...prev, [fieldName]: fieldValue }))

    // Clear validation error for this field when user starts typing
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }



    // Validate the field immediately if it has a value
    if (fieldValue.trim()) {
      validateField(fieldName, fieldValue)
    }
  }

  const validateField = async (fieldName: string, fieldValue: string) => {
    try {
      await loginSchema.validateAt(fieldName, { [fieldName]: fieldValue })
      // Field is valid, ensure no error is shown
      if (validationErrors[fieldName]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[fieldName]
          return newErrors
        })
      }

      // Check if entire form is now valid
      checkFormValidity()
    } catch (err: any) {
      // Field is invalid, but don't show error while user is typing
      // Error will be shown on blur
    }
  }

  const checkFormValidity = async () => {
    try {
      await loginSchema.validate(formData, { abortEarly: false })
      setIsFormValid(true)
    } catch (err: any) {
      setIsFormValid(false)
    }
  }

  const handleInputBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = e.target.name
    const fieldValue = e.target.value

    try {
      // Validate only this field
      await loginSchema.validateAt(fieldName, { [fieldName]: fieldValue })

      // Clear validation error for this field if validation passes
      if (validationErrors[fieldName]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[fieldName]
          return newErrors
        })
      }
    } catch (err: any) {
      // Set validation error for this field
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: err.message
      }))
    }
  }

  // Redirect if already authenticated (but only if not in the middle of a login)
  useEffect(() => {
    console.log("Login page useEffect - isAuthenticated:", isAuthenticated, "submitting:", submitting, "isUsingFingerprint:", isUsingFingerprint)

    if (isAuthenticated && !submitting && !isUsingFingerprint) {
      console.log("Authentication detected and login process complete, scheduling redirect...")
      // Add a small delay to ensure all state updates are complete
      const redirectTimer = setTimeout(() => {
        console.log("Executing redirect to dashboard...")
        // Use replace to prevent back button issues
        router.replace("/")
      }, 200) // 200ms delay to ensure state synchronization

      return () => clearTimeout(redirectTimer)
    } else if (isAuthenticated && (submitting || isUsingFingerprint)) {
      console.log("Authentication detected but login process still active, waiting...")
    }
  }, [isAuthenticated, submitting, isUsingFingerprint, router])

  // Direct listener for profile fetch success - more reliable than waiting for Redux state
  const [profileFetchSuccess, setProfileFetchSuccess] = useState(false)

  useEffect(() => {
    if (profileFetchSuccess) {
      console.log("Profile fetch success detected, redirecting to dashboard...")
      // Immediate redirect after profile fetch success
      router.replace("/")
    }
  }, [profileFetchSuccess, router])

  // Check form validity when form data changes
  useEffect(() => {
    checkFormValidity()
  }, [formData])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      setValidationErrors({})
      setProfileFetchSuccess(false)
    }
  }, [])



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
                <h1 className="text-2xl font-light tracking-wider uppercase">ProDairy DMS</h1>
                <p className="text-xs text-zinc-500 tracking-wide">Futuristic Dairy Manufacturing</p>
              </div>
            </div>

            <h2 className="mb-6 text-5xl font-thin leading-tight tracking-wide text-transparent bg-clip-text  from-blue-600 to-lime-600">
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
                    <span className="inline-block h-2.5 w-2.5 rounded-full  from-blue-500 to-lime-500" />
                    <p className="text-sm font-light tracking-wide text-zinc-700">{item}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Auth card */}
          <div className="order-1 md:order-2">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-[1.75rem]  from-blue-300 to-lime-300 opacity-40 blur-xl" aria-hidden />
              <div className="relative rounded-[1.5rem] border border-zinc-200/70 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-semibold tracking-tight">Sign in</h3>
                  <p className="text-sm text-zinc-500">Use  your company email</p>
                </div>

                {/* Fingerprint */}
                {/* <button
                  onClick={handleFingerprintLogin}
                  disabled={isUsingFingerprint || submitting}
                  className="group mb-6 flex w-full items-center justify-center gap-3 rounded-xl  from-blue-600 to-lime-600 px-4 py-3 font-medium text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
                >
                  <Fingerprint className={`h-5 w-5 ${isUsingFingerprint ? "animate-pulse" : ""}`} />
                  {isUsingFingerprint ? "Authenticating…" : "Sign in with Fingerprint"}
                </button> */}

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
                      onBlur={handleInputBlur}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-zinc-900 outline-none ring-0 transition placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500/30 ${validationErrors.email
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-zinc-200 focus:border-lime-400'
                        }`}
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
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
                      onBlur={handleInputBlur}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-zinc-900 outline-none ring-0 transition placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500/30 ${validationErrors.password
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-zinc-200 focus:border-lime-400'
                        }`}
                    />
                    {validationErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                    )}
                  </label>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-zinc-600">
                      <input type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
                      Remember me
                    </label>
                    <Link href="/forgot-password" className="font-medium text-blue-700 hover:underline">Forgot password?</Link>
                  </div>



                  {/* Show validation summary */}
                  {/* {Object.keys(validationErrors).length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-sm text-amber-800 font-medium mb-1">Please fix the following errors:</p>
                      <ul className="text-sm text-amber-700 space-y-1">
                        {Object.entries(validationErrors).map(([field, message]) => (
                          <li key={field} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                            <span className="capitalize">{field}:</span> {message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )} */}

                  {/* Show success message when form is valid */}
                  {/* {isFormValid && Object.keys(validationErrors).length === 0 && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Form is ready! You can now sign in.
                      </p>
                    </div>
                  )} */}

                  <LoadingButton
                    type="submit"
                    loading={submitting}
                    disabled={isUsingFingerprint}
                    loadingText="Signing in..."
                    className={`w-full rounded-xl px-4 py-4 font-semibold text-white shadow-lg transition-all ${Object.keys(validationErrors).length > 0
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : isFormValid
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-[#006BC4] hover:bg-[#0056a0]'
                      }`}
                  >
                    {Object.keys(validationErrors).length > 0 ? (
                      "Fix errors to continue"
                    ) : isFormValid ? (
                      "Ready to sign in ✓"
                    ) : (
                      "Sign in"
                    )}
                  </LoadingButton>
                </form>

                <p className="mt-6 text-center text-xs text-zinc-500">
                  By continuing, you agree to our{" "}
                  <a className="text-blue-700 hover:underline" href="https://prodairy.co.zw/">Terms of Service</a>{" "}
                  and{" "}
                  <a className="text-blue-700 hover:underline" href="https://prodairy.co.zw/">Privacy Policy</a>.
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
