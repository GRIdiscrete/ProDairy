"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { SyncService } from '@/lib/offline/sync-service'
import { OfflineDataService } from '@/lib/offline/database'
import { useAppDispatch } from '@/lib/store'

interface SyncModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pendingCount: number
}

export function SyncModal({ open, onOpenChange, pendingCount }: SyncModalProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncResults, setSyncResults] = useState<{ success: number, failed: number } | null>(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleSync = async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    setSyncProgress(0)
    setSyncResults(null)

    try {
      // Get pending forms count
      const pendingForms = await OfflineDataService.getPendingDriverForms()
      const totalForms = pendingForms.length
      
      if (totalForms === 0) {
        setSyncResults({ success: 0, failed: 0 })
        setIsSyncing(false)
        return
      }

      let success = 0
      let failed = 0

      // Sync forms one by one with progress
      for (let i = 0; i < pendingForms.length; i++) {
        const form = pendingForms[i]
        const synced = await SyncService.syncForm(form, dispatch)
        
        if (synced) {
          success++
        } else {
          failed++
        }

        // Update progress
        setSyncProgress(((i + 1) / totalForms) * 100)
      }

      setSyncResults({ success, failed })
    } catch (error) {
      console.error('Sync error:', error)
      setSyncResults({ success: 0, failed: pendingCount })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleClose = () => {
    if (!isSyncing) {
      onOpenChange(false)
      setSyncResults(null)
      setSyncProgress(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-light">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            {isOnline ? 'Sync Offline Data' : 'You\'re Offline'}
          </DialogTitle>
          <DialogDescription className="font-light">
            {isOnline 
              ? `You have ${pendingCount} form${pendingCount !== 1 ? 's' : ''} saved offline that can be synced.`
              : 'You\'re currently offline. Forms will be synced when you\'re back online.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isOnline ? (
            <>
              {!isSyncing && !syncResults && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-light mb-4">
                    Click sync to upload your offline forms to the server.
                  </p>
                  <Button
                    onClick={handleSync}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white border-0 rounded-full px-6 py-2 font-light"
                  >
                    Sync {pendingCount} Form{pendingCount !== 1 ? 's' : ''}
                  </Button>
                </div>
              )}

              {isSyncing && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-light">Syncing forms...</span>
                  </div>
                  <Progress value={syncProgress} className="w-full" />
                  <p className="text-xs text-gray-500 text-center font-light">
                    {Math.round(syncProgress)}% complete
                  </p>
                </div>
              )}

              {syncResults && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-light">{syncResults.success} synced</span>
                    </div>
                    {syncResults.failed > 0 && (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm font-light">{syncResults.failed} failed</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleClose}
                    className="w-full bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white border-0 rounded-full px-6 py-2 font-light"
                  >
                    Close
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 font-light">
                Your forms are saved locally and will be synced automatically when you're back online.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
