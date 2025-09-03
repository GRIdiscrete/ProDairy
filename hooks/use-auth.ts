import { useSelector } from 'react-redux'
import type { RootState } from '@/lib/store'

export function useAuth() {
  const authState = useSelector((state: RootState) => state.auth)

  //log authState
  console.log('authState iyi', authState)
  
  // Return safe defaults when store is not ready
  if (!authState) {
    return {
      user: null,
      profile: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      isStoreReady: false,
    }
  }
  
  return {
    ...authState,
    isStoreReady: true,
  }
}
