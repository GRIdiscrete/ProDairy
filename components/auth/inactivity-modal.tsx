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

  // Inactivity modal feature disabled for now
  return null
}

