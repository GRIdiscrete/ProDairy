"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, CheckCircle2, Loader2, Lock, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import type { AppDispatch, RootState } from "@/lib/store"
import { LoadingButton } from "@/components/ui/loading-button"
import { PhoneInput } from "@/components/ui/phone-input"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { authApi } from "@/lib/api/auth"
import {
    setStep,
    setPhone,
    setOtp,
    setLoading,
    setError,
    hydrateForgotPassword,
    resetForgotPassword
} from "@/lib/store/slices/forgotPasswordSlice"

// Persistence key
const PERSIST_KEY = "prodairy_forgot_password_state"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const { step, phone, otp, isLoading } = useSelector((state: RootState) => state.forgotPassword)

    // Local state for password reset form (only needed in step 3)
    const [resetForm, setResetForm] = useState({ email: "", password: "", confirmPassword: "" })
    const [showPassword, setShowPassword] = useState(false)

    // 1. Hydrate state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem(PERSIST_KEY)
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState)
                // Optional: check expiry
                if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
                    localStorage.removeItem(PERSIST_KEY)
                    dispatch(resetForgotPassword())
                } else {
                    dispatch(hydrateForgotPassword(parsed))
                }
            } catch (e) {
                console.error("Failed to parse saved state", e)
            }
        }
    }, [dispatch])

    // 2. Persist state to localStorage on change
    useEffect(() => {
        const stateToSave = {
            step,
            phone,
            otp,
            expiresAt: Date.now() + 1000 * 60 * 15 // 15 minutes expiry
        }
        localStorage.setItem(PERSIST_KEY, JSON.stringify(stateToSave))
    }, [step, phone, otp])


    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!phone || phone.length < 10) {
            toast.error("Please enter a valid phone number")
            return
        }

        dispatch(setLoading(true))
        try {
            await authApi.sendOtp(phone)
            toast.success("OTP sent successfully!")
            dispatch(setStep(2))
        } catch (error: any) {
            // Mock success for now if API fails (as per requirement to copy page structure but endpoint might be fresh)
            console.error("Send OTP Error", error)
            toast.error(error.message || "Failed to send OTP")
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!otp || otp.length < 6) {
            toast.error("Please enter the 6-digit code")
            return
        }

        dispatch(setLoading(true))
        try {
            await authApi.verifyOtp({ phone, otp, request: "verify_login" })
            toast.success("Phone verified!")
            dispatch(setStep(3))
        } catch (error: any) {
            console.error("Verify OTP Error", error)

            // Handle specific error object if available
            if (error.statusCode === 500 && error.message === "verifyOtp error") {
                toast.error("Verification failed. Please check the code.")
            } else {
                toast.error(error.message || "Invalid OTP")
            }
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!resetForm.email || !resetForm.password) {
            toast.error("Please fill in all fields")
            return
        }
        if (resetForm.password !== resetForm.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        dispatch(setLoading(true))
        try {
            await authApi.changePassword({
                email: resetForm.email,
                password: resetForm.password
            })
            toast.success("Password reset successfully! Please login.")

            // Clear persistence and state
            localStorage.removeItem(PERSIST_KEY)
            dispatch(resetForgotPassword())

            router.push("/login")
        } catch (error: any) {
            console.error("Reset Password Error", error)
            toast.error(error.message || "Failed to reset password")
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <div className="relative min-h-screen bg-white text-zinc-900 overflow-hidden font-sans">
            {/* Reusing the login page background elements */}
            <motion.div
                aria-hidden
                className="pointer-events-none absolute -top-40 -left-40 h-[38rem] w-[38rem] rounded-full bg-gradient-to-br from-lime-300/60 via-lime-400/30 to-blue-300/40 blur-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
            />
            <motion.div
                aria-hidden
                className="pointer-events-none absolute -bottom-56 -right-56 h-[42rem] w-[42rem] rounded-full bg-gradient-to-br from-blue-200/60 via-blue-300/30 to-lime-200/40 blur-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
            />

            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
                <div className="w-full max-w-md">

                    {/* Header / Logo Area */}
                    <div className="mb-8 text-center space-y-2">
                        <div className="relative h-12 w-12 mx-auto mb-4">
                            <Image src="/Prodairy-3D-Logo.png" alt="ProDairy" fill className="object-contain" />
                        </div>
                        <h1 className="text-3xl font-light text-zinc-800">Reset Password</h1>
                        <p className="text-sm text-zinc-500">
                            {step === 1 && "Enter your mobile number to receive a verification code."}
                            {step === 2 && `Enter the code sent to ${phone}`}
                            {step === 3 && "Create a new strong password for your account."}
                        </p>
                    </div>

                    <div className="relative rounded-[1.5rem] border border-zinc-200/70 bg-white/80 p-8 shadow-xl backdrop-blur-xl">

                        <AnimatePresence mode="wait">

                            {/* STEP 1: REQUEST OTP */}
                            {step === 1 && (
                                <motion.form
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleSendOtp}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-700">Phone Number</label>
                                        <PhoneInput
                                            value={phone}
                                            onChange={(val) => dispatch(setPhone(val))}
                                            error={false}
                                        />
                                    </div>

                                    <LoadingButton
                                        type="submit"
                                        loading={isLoading}
                                        className="w-full rounded-xl bg-[#006BC4] py-6 text-white hover:bg-[#0056a0]"
                                    >
                                        Send Verification Code
                                    </LoadingButton>
                                </motion.form>
                            )}

                            {/* STEP 2: VERIFY OTP */}
                            {step === 2 && (
                                <motion.form
                                    key="step2"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleVerifyOtp}
                                    className="space-y-6"
                                >
                                    <div className="flex flex-col items-center space-y-4">
                                        <label className="text-sm font-medium text-zinc-700">One-Time Password</label>
                                        <InputOTP
                                            maxLength={6}
                                            value={otp}
                                            onChange={(val) => dispatch(setOtp(val))}
                                        >
                                            <InputOTPGroup>
                                                <InputOTPSlot index={0} />
                                                <InputOTPSlot index={1} />
                                                <InputOTPSlot index={2} />
                                                <InputOTPSlot index={3} />
                                                <InputOTPSlot index={4} />
                                                <InputOTPSlot index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                        <p className="text-xs text-zinc-400">
                                            Didn't receive code? <button type="button" onClick={() => dispatch(setStep(1))} className="text-blue-600 hover:underline">Resend</button>
                                        </p>
                                    </div>

                                    <LoadingButton
                                        type="submit"
                                        loading={isLoading}
                                        className="w-full rounded-xl bg-[#006BC4] py-6 text-white hover:bg-[#0056a0]"
                                    >
                                        Verify Code
                                    </LoadingButton>

                                    <Button variant="ghost" type="button" onClick={() => dispatch(setStep(1))} className="w-full">
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Change Phone Number
                                    </Button>
                                </motion.form>
                            )}

                            {/* STEP 3: RESET PASSWORD */}
                            {step === 3 && (
                                <motion.form
                                    key="step3"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleResetPassword}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-700">Email Address</label>
                                        <Input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={resetForm.email}
                                            onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                                            required
                                            className="rounded-xl"
                                        />
                                        <p className="text-[10px] text-zinc-400">Please confirm your email address for security.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-700">New Password</label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Min 8 characters"
                                                value={resetForm.password}
                                                onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
                                                required
                                                className="rounded-xl pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                            >
                                                {showPassword ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-700">Confirm Password</label>
                                        <Input
                                            type="password"
                                            placeholder="Repeat new password"
                                            value={resetForm.confirmPassword}
                                            onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                                            required
                                            className="rounded-xl"
                                        />
                                    </div>

                                    <LoadingButton
                                        type="submit"
                                        loading={isLoading}
                                        className="w-full rounded-xl bg-green-600 py-6 text-white hover:bg-green-700 mt-2"
                                    >
                                        Reset Password
                                    </LoadingButton>
                                </motion.form>
                            )}

                        </AnimatePresence>

                    </div>

                    <div className="mt-8 text-center">
                        <Button
                            variant="link"
                            className="text-zinc-500 hover:text-zinc-800"
                            onClick={() => router.push("/login")}
                        >
                            Back to Login
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    )
}
