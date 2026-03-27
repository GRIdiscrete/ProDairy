/**
 * Tablet-specific hooks and utilities
 * 
 * Provides hooks for tablet detection, orientation management,
 * and tablet-optimized UI patterns.
 */

import { useState, useEffect, useCallback } from 'react'

export interface TabletConfig {
  isTablet: boolean
  isLandscape: boolean
  isPortrait: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'landscape' | 'portrait' | 'unknown'
  isKeyboardOpen: boolean
  viewportHeight: number
}

/**
 * Hook to detect tablet and manage orientation
 */
export function useTablet() {
  const [config, setConfig] = useState<TabletConfig>({
    isTablet: false,
    isLandscape: false,
    isPortrait: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'unknown',
    isKeyboardOpen: false,
    viewportHeight: 0,
  })

  const updateConfig = useCallback(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    // Broaden tablet detection to include common landscape sizes (e.g., 1200x800)
    const isLandscape = width > height
    const isPortrait = height > width
    // Prefer touch-capable devices (coarse pointer) to distinguish from desktops
    const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches
    const isTablet = isCoarsePointer && (
      // Landscape tablet thresholds
      (isLandscape && width >= 1024 && width <= 1920 && height >= 600 && height <= 1400) ||
      // Portrait tablet thresholds
      (isPortrait && width >= 768 && width <= 1400 && height >= 900 && height <= 2048)
    )
    const orientation = isLandscape ? 'landscape' : isPortrait ? 'portrait' : 'unknown'
    
    // Detect keyboard open (viewport height significantly reduced)
    const initialHeight = window.screen.height || height
    const isKeyboardOpen = height < initialHeight * 0.75

    setConfig({
      isTablet,
      isLandscape,
      isPortrait,
      screenWidth: width,
      screenHeight: height,
      orientation,
      isKeyboardOpen,
      viewportHeight: height,
    })
  }, [])

  useEffect(() => {
    updateConfig()
    
    const handleResize = () => {
      updateConfig()
    }

    const handleOrientationChange = () => {
      // Small delay to ensure accurate measurements after orientation change
      setTimeout(updateConfig, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
    
    // Check for orientation lock support
    if ('screen' in window && 'orientation' in window.screen) {
      // Try to lock orientation to landscape on tablets
      if (config.isTablet && config.isPortrait) {
        // @ts-ignore - experimental API
        if (screen.orientation && screen.orientation.lock) {
          // @ts-ignore
          screen.orientation.lock('landscape').catch(() => {
            // Orientation lock failed, show warning
            console.warn('Could not lock orientation to landscape')
          })
        }
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [updateConfig, config.isTablet, config.isPortrait])

  return config
}

/**
 * Hook to manage floating form behavior
 */
export function useFloatingForm() {
  const { isKeyboardOpen, viewportHeight } = useTablet()
  const [isFormFloating, setIsFormFloating] = useState(false)

  useEffect(() => {
    if (isKeyboardOpen) {
      setIsFormFloating(true)
    } else {
      // Delay to prevent flickering
      const timer = setTimeout(() => {
        setIsFormFloating(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isKeyboardOpen])

  return {
    isFormFloating,
    isKeyboardOpen,
    viewportHeight,
  }
}

/**
 * Hook for tablet-specific navigation patterns
 */
export function useTabletNavigation() {
  const { isTablet, isLandscape } = useTablet()
  
  return {
    useBottomSheets: isTablet && isLandscape,
    useSideDrawers: !isTablet || !isLandscape,
    isTabletMode: isTablet && isLandscape,
  }
}
