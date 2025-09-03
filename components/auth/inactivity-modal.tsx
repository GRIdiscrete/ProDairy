"use client"

import { useState, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, LogOut, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutUser } from '@/lib/store/slices/authSlice'

interface InactivityModalProps {
  isOpen: boolean
  onClose: () => void
  onExtend: () => void
  timeRemaining: number
}

export function InactivityModal({ 
  isOpen, 
  onClose, 
  onExtend, 
  timeRemaining 
}: InactivityModalProps) {
  const [countdown, setCountdown] = useState(timeRemaining)
  const dispatch = useDispatch()
  const router = useRouter()

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Auto logout when countdown reaches 0
            handleLogout()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isOpen, countdown])

  const handleLogout = useCallback(async () => {
    await dispatch(logoutUser())
    router.push('/login')
    onClose()
  }, [dispatch, router, onClose])

  const handleExtend = () => {
    onExtend()
    setCountdown(timeRemaining) // Reset countdown
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-lime-600 p-6 text-white text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Clock className="h-8 w-8" />
                <h2 className="text-xl font-semibold">Session Timeout</h2>
              </div>
              <p className="text-blue-100 text-sm">
                You've been inactive for a while
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <UserCheck className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Time remaining to stay logged in:
                  </span>
                </div>
                
                {/* Countdown Timer */}
                <div className="text-4xl font-mono font-bold text-red-600 mb-2">
                  {formatTime(countdown)}
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: `${(countdown / timeRemaining) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleExtend}
                  className="w-full bg-gradient-to-r from-blue-600 to-lime-600 hover:from-blue-700 hover:to-lime-700 text-white"
                  size="lg"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Stay Logged In
                </Button>
                
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  size="lg"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout Now
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Click "Stay Logged In" to continue your session, or you'll be automatically logged out.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

