import { OfflineDataService, OfflineDriverForm } from './database'
import { createDriverForm } from '@/lib/store/slices/driverFormSlice'
import { AppDispatch } from '@/lib/store'
import { LocalStorageService } from './local-storage-service'

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

  // Sync pending forms when coming back online (just shows modal if pending)
  static async syncPendingForms(dispatch?: AppDispatch) {
    if (this.syncInProgress || !this.isOnline) return

    this.syncInProgress = true

    try {
      // collect pending forms from both stores
      const [dexiePending, localPending] = await Promise.all([
        OfflineDataService.getPendingDriverForms().catch(() => [] as OfflineDriverForm[]),
        Promise.resolve(LocalStorageService.getPendingDriverForms())
      ])

      const pendingCount = (dexiePending?.length || 0) + (localPending?.length || 0)

      if (pendingCount === 0) {
        this.syncInProgress = false
        return
      }

      // Show sync modal if there are pending forms
      this.showSyncModal(pendingCount, dispatch)

    } catch (error) {
      console.error('Error syncing pending forms:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  // Show sync modal
  private static showSyncModal(pendingCount: number, dispatch?: AppDispatch) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('show-sync-modal', {
        detail: { pendingCount, dispatch }
      }))
    }
  }

  // Sync a single form (source may be Dexie or LocalStorage)
  static async syncForm(form: any, dispatch: AppDispatch): Promise<boolean> {
    try {
      if (!this.isOnline) return false

      // Map form to API shape expected by createDriverForm
      // The offline format may use driver_id or driver; normalize to driver
      const apiForm: any = {
        driver: form.driver_id || form.driver,
        start_date: form.start_date,
        end_date: form.end_date,
        tanker: form.tanker || "",
        delivered: form.delivered ?? false,
        rejected: form.rejected ?? false,
        // Use drivers_form_collected_products to match the API expected by createDriverForm
        drivers_form_collected_products: (form.drivers_form_collected_products || form.collected_products || []).map((p: any) => ({
          raw_material_id: p.raw_material_id || p.rawMaterialId || p.raw_material,
          supplier_id: p.supplier_id || p.supplier,
          collected_amount: p.collected_amount ?? p.collectedAmount ?? p.collected,
          unit_of_measure: p.unit_of_measure || p.unit || p.uom || 'Kilograms',
          e_sign_supplier: p.e_sign_supplier || p['e-sign-supplier'] || "",
          e_sign_driver: p.e_sign_driver || p['e-sign-driver'] || ""
        }))
      }

      console.log('Syncing form with payload:', apiForm)

      // Submit to API via dispatch thunk
      const result = await dispatch(createDriverForm(apiForm)).unwrap()

      // Mark as synced in the correct store
      // If the original id matches local-storage offline id pattern, update LocalStorage, else Dexie
      if (String(form.id).startsWith('offline_')) {
        LocalStorageService.markFormAsSynced(form.id, result.id || result?.data?.id || result?.id)
      } else {
        await OfflineDataService.markFormAsSynced(form.id, result.id || result?.data?.id || result?.id)
      }

      return true
    } catch (error) {
      console.error('Error syncing form:', error)

      // Mark failed in appropriate store
      try {
        if (String(form.id).startsWith('offline_')) {
          LocalStorageService.markFormAsFailed(form.id)
        } else {
          await OfflineDataService.markFormAsFailed(form.id)
        }
      } catch (e) {
        console.error('Error marking form as failed:', e)
      }

      return false
    }
  }

  // Sync all pending forms (returns counts)
  static async syncAllPendingForms(dispatch: AppDispatch): Promise<{ success: number, failed: number }> {
    if (!this.isOnline) return { success: 0, failed: 0 }
    this.syncInProgress = true

    try {
      // Load pending from both stores
      const [dexiePending, localPending] = await Promise.all([
        OfflineDataService.getPendingDriverForms().catch(() => [] as OfflineDriverForm[]),
        Promise.resolve(LocalStorageService.getPendingDriverForms())
      ])

      // Combine (local first to keep ordering predictable)
      const allPending = [...(localPending || []), ...(dexiePending || [])]

      let success = 0
      let failed = 0

      for (const f of allPending) {
        // try syncing each; if dispatch fails, mark failed
        const ok = await this.syncForm(f, dispatch)
        if (ok) {
          success++
        } else {
          failed++
        }
      }

      return { success, failed }
    } catch (error) {
      console.error('Error syncing all pending forms:', error)
      return { success: 0, failed: 0 }
    } finally {
      this.syncInProgress = false
    }
  }

  // Get sync status aggregated across both stores
  static async getSyncStatus() {
    const [pendingFormsLocal, pendingFormsDexie] = await Promise.all([
      Promise.resolve(LocalStorageService.getPendingDriverForms()),
      OfflineDataService.getPendingDriverForms().catch(() => [] as OfflineDriverForm[])
    ])

    const [allLocal, allDexie] = await Promise.all([
      Promise.resolve(LocalStorageService.getDriverForms()),
      OfflineDataService.getDriverForms().catch(() => [] as OfflineDriverForm[])
    ])

    const pending = (pendingFormsLocal?.length || 0) + (pendingFormsDexie?.length || 0)
    const synced = (allLocal?.filter((f: any) => f.sync_status === 'synced')?.length || 0) + (allDexie?.filter((f: any) => (f as any).sync_status === 'synced')?.length || 0)
    const failed = (allLocal?.filter((f: any) => f.sync_status === 'failed')?.length || 0) + (allDexie?.filter((f: any) => (f as any).sync_status === 'failed')?.length || 0)

    return {
      pending,
      synced,
      failed,
      total: (allLocal?.length || 0) + (allDexie?.length || 0)
    }
  }
}
