"use client"

import { useRouter } from 'next/navigation'
import { useInactivity } from '@/hooks/use-inactivity'
import { InactivityModal } from '@/components/auth/inactivity-modal'
import { useAuth } from '@/hooks/use-auth'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  // Handle inactivity timeout
  const handleTimeout = () => {
    router.push('/login')
  }

  const { showWarning, timeRemaining, extendSession } = useInactivity({
    timeoutMinutes: 60, // 1 hour total timeout
    warningMinutes: 1, // Show warning 1 minute before timeout
    onTimeout: handleTimeout,
  })

  return (
    <>
      {children}
      
      <InactivityModal
        isOpen={showWarning}
        onClose={() => {}}
        onExtend={extendSession}
        timeRemaining={timeRemaining}
      />
    </>
  )
}

