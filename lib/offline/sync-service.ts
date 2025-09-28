import { OfflineDataService, OfflineDriverForm } from './database'
import { createDriverForm } from '@/lib/store/slices/driverFormSlice'
import { AppDispatch } from '@/lib/store'

export class SyncService {
  private static isOnline = typeof window !== 'undefined' ? navigator.onLine : true
  private static syncInProgress = false

  // Initialize online/offline detection
  static initialize() {
    if (typeof window === 'undefined') return
    
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncPendingForms()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  // Check if device is online
  static getOnlineStatus(): boolean {
    return this.isOnline
  }

  // Sync pending forms when coming back online
  static async syncPendingForms(dispatch?: AppDispatch) {
    if (this.syncInProgress || !this.isOnline) return

    this.syncInProgress = true

    try {
      const pendingForms = await OfflineDataService.getPendingDriverForms()
      
      if (pendingForms.length === 0) {
        this.syncInProgress = false
        return
      }

      // Show sync modal if there are pending forms
      if (pendingForms.length > 0) {
        this.showSyncModal(pendingForms.length, dispatch)
      }

    } catch (error) {
      console.error('Error syncing pending forms:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  // Show sync modal
  private static showSyncModal(pendingCount: number, dispatch?: AppDispatch) {
    // This will be handled by the sync modal component
    // For now, we'll dispatch a custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-sync-modal', {
        detail: { pendingCount, dispatch }
      }))
    }
  }

  // Sync a single form
  static async syncForm(form: OfflineDriverForm, dispatch: AppDispatch): Promise<boolean> {
    try {
      if (!this.isOnline) return false

      // Convert offline form to API format
      const apiForm = {
        driver: form.driver_id,
        delivered: false, // Default value for offline forms
        start_date: form.start_date,
        end_date: form.end_date,
        rejected: form.rejected,
        collected_products: form.collected_products.map(product => ({
          raw_material_id: product.raw_material_id,
          supplier_id: product.supplier_id,
          collected_amount: product.collected_amount,
          unit_of_measure: product.unit_of_measure,
          'e-sign-supplier': product['e-sign-supplier'],
          'e-sign-driver': product['e-sign-driver']
        }))
      }

      // Submit to API
      const result = await dispatch(createDriverForm(apiForm)).unwrap()
      
      // Mark as synced
      await OfflineDataService.markFormAsSynced(form.id, result.id)
      
      return true
    } catch (error) {
      console.error('Error syncing form:', error)
      await OfflineDataService.markFormAsFailed(form.id)
      return false
    }
  }

  // Sync all pending forms
  static async syncAllPendingForms(dispatch: AppDispatch): Promise<{ success: number, failed: number }> {
    const pendingForms = await OfflineDataService.getPendingDriverForms()
    let success = 0
    let failed = 0

    for (const form of pendingForms) {
      const synced = await this.syncForm(form, dispatch)
      if (synced) {
        success++
      } else {
        failed++
      }
    }

    return { success, failed }
  }

  // Get sync status
  static async getSyncStatus() {
    const pendingForms = await OfflineDataService.getPendingDriverForms()
    const syncedForms = await OfflineDataService.getDriverForms()
      .then(forms => forms.filter(f => f.sync_status === 'synced'))
    const failedForms = await OfflineDataService.getDriverForms()
      .then(forms => forms.filter(f => f.sync_status === 'failed'))

    return {
      pending: pendingForms.length,
      synced: syncedForms.length,
      failed: failedForms.length,
      total: pendingForms.length + syncedForms.length + failedForms.length
    }
  }
}
