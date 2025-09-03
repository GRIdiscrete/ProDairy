import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface UseInactivityOptions {
  timeoutMinutes?: number
  warningMinutes?: number
  onTimeout?: () => void
  onWarning?: () => void
}

export function useInactivity({
  timeoutMinutes = 60, // 1 hour total timeout
  warningMinutes = 1, // Show warning 1 minute before timeout
  onTimeout,
  onWarning,
}: UseInactivityOptions = {}) {
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(warningMinutes * 60)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const warningRef = useRef<NodeJS.Timeout>()
  const { isAuthenticated } = useAuth()

  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)

    if (!isAuthenticated) return

    // Set warning timer
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000
    warningRef.current = setTimeout(() => {
      setShowWarning(true)
      setTimeRemaining(warningMinutes * 60)
      onWarning?.()
    }, warningTime)

    // Set timeout timer
    timeoutRef.current = setTimeout(() => {
      onTimeout?.()
    }, timeoutMinutes * 60 * 1000)
  }, [timeoutMinutes, warningMinutes, isAuthenticated, onTimeout, onWarning])

  const extendSession = useCallback(() => {
    setShowWarning(false)
    resetTimers()
  }, [resetTimers])

  const handleUserActivity = useCallback(() => {
    if (showWarning) {
      extendSession()
    } else {
      resetTimers()
    }
  }, [showWarning, extendSession, resetTimers])

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) return

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus',
    ]

    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true })
    })

    // Initial timer setup
    resetTimers()

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity)
      })
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
  }, [isAuthenticated, handleUserActivity, resetTimers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
  }, [])

  return {
    showWarning,
    timeRemaining,
    extendSession,
    resetTimers,
  }
}

