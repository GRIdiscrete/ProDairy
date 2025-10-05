/**
 * Orientation Lock Component
 * 
 * Forces landscape orientation on tablets and shows
 * a message when device is in portrait mode.
 */

"use client"

import { useEffect, useState } from 'react'
import { useTablet } from '@/hooks/use-tablet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCcw, Smartphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OrientationLockProps {
  children: React.ReactNode
}

export function OrientationLock({ children }: OrientationLockProps) {
  const { isTablet, isPortrait, isLandscape } = useTablet()
  const [showPortraitWarning, setShowPortraitWarning] = useState(false)

  useEffect(() => {
    if (isTablet && isPortrait) {
      setShowPortraitWarning(true)
      
      // Try to lock orientation to landscape
      if ('screen' in window && 'orientation' in window.screen) {
        // @ts-ignore - experimental API
        if (screen.orientation && screen.orientation.lock) {
          // @ts-ignore
          screen.orientation.lock('landscape').catch((error) => {
            console.warn('Could not lock orientation:', error)
          })
        }
      }
    } else {
      setShowPortraitWarning(false)
    }
  }, [isTablet, isPortrait, isLandscape])

  // Show portrait warning for tablets in portrait mode
  if (isTablet && showPortraitWarning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md mx-auto shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <RotateCcw className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Please Rotate Your Device
              </CardTitle>
              <CardDescription className="text-gray-600">
                This application is optimized for landscape mode on tablets. 
                Please rotate your device to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-16 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-500">Portrait</span>
                </div>
                <div className="text-gray-400">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-12 border-2 border-green-500 rounded-lg flex items-center justify-center bg-green-50">
                    <Smartphone className="h-6 w-6 text-green-600 rotate-90" />
                  </div>
                  <span className="text-xs text-green-600 font-medium">Landscape</span>
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refresh After Rotation
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
