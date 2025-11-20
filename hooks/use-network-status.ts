"use client"

import { useCallback, useEffect, useState } from 'react'
import { useNetworkState } from 'react-use'

export function useNetworkStatus() {
  const networkState = useNetworkState()
  const [isChecking, setIsChecking] = useState(false)

  // Get online status from react-use
  const isOnline = networkState.online ?? true

  // Check actual network connectivity by making a request
  const checkNetworkConnectivity = useCallback(async () => {
    if (typeof window === 'undefined') return true

    try {
      setIsChecking(true)
      console.log('🔍 Checking network connectivity...')
      
      // Try to fetch a small resource with a timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch('/api/health-check', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const online = response.ok
      console.log('✅ Network check result:', online ? 'ONLINE' : 'OFFLINE')
      return online
    } catch (error) {
      // If fetch fails, we're offline
      console.log('❌ Network check failed:', error)
      return false
    } finally {
      setIsChecking(false)
    }
  }, [])

  // Log network state changes
  useEffect(() => {
    console.log('🌐 Network state changed:', {
      online: networkState.online,
      since: networkState.since,
      downlink: networkState.downlink,
      downlinkMax: networkState.downlinkMax,
      effectiveType: networkState.effectiveType,
      rtt: networkState.rtt,
      type: networkState.type
    })
  }, [networkState.online, networkState.since])

  return { 
    isOnline, 
    isChecking, 
    checkNetworkConnectivity,
    networkState // Expose full network state for debugging
  }
}
