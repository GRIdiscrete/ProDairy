"use client"

import { useEffect, useState } from 'react'
import { SyncService } from '@/lib/offline/sync-service'
import { OfflineDataService } from '@/lib/offline/database'
import { SyncModal } from '@/components/offline/sync-modal'
import { useAppDispatch } from '@/lib/store'

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [pendingDispatch, setPendingDispatch] = useState<any | undefined>(undefined)
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Initialize sync service
    SyncService.initialize()

    // Check for pending forms on mount
    checkPendingForms()

    // Listen for sync modal events
    const handleShowSyncModal = (event: CustomEvent) => {
      setPendingCount(event.detail.pendingCount)
      setPendingDispatch(event.detail.dispatch || undefined)
      setShowSyncModal(true)
    }

    window.addEventListener('show-sync-modal', handleShowSyncModal as EventListener)

    return () => {
      window.removeEventListener('show-sync-modal', handleShowSyncModal as EventListener)
    }
  }, [])

  const checkPendingForms = async () => {
    try {
      const pendingForms = await OfflineDataService.getPendingDriverForms()
      setPendingCount(pendingForms.length)
      
      // Show sync modal if there are pending forms and we're online
      if (pendingForms.length > 0 && navigator.onLine) {
        setShowSyncModal(true)
      }
    } catch (error) {
      console.error('Error checking pending forms:', error)
    }
  }

  return (
    <>
      {children}
      <SyncModal
        open={showSyncModal}
        onOpenChange={setShowSyncModal}
        pendingCount={pendingCount}
        dispatch={pendingDispatch || dispatch}
      />
    </>
  )
}
