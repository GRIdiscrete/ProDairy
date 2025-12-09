"use client"

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  return (
    <>
      {children}
    </>
  )
}

