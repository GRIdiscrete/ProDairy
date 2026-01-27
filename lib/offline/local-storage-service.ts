// Simple localStorage-based offline data service
export class LocalStorageService {
  private static readonly KEYS = {
    DRIVERS: 'offline_drivers',
    RAW_MATERIALS: 'offline_raw_materials',
    SUPPLIERS: 'offline_suppliers',
    TANKERS: 'offline_tankers',
    DRIVER_FORMS: 'offline_driver_forms',
    COLLECTION_VOUCHERS: 'offline_collection_vouchers',
    IS_OFFLINE: 'is_offline_mode'
  }

  // Save data to localStorage (SSR-safe)
  static saveDrivers(drivers: any[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.KEYS.DRIVERS, JSON.stringify(drivers))
    }
  }

  static saveRawMaterials(materials: any[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.KEYS.RAW_MATERIALS, JSON.stringify(materials))
    }
  }

  static saveSuppliers(suppliers: any[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.KEYS.SUPPLIERS, JSON.stringify(suppliers))
    }
  }

  static saveTankers(tankers: any[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.KEYS.TANKERS, JSON.stringify(tankers))
    }
  }

  static saveDriverForms(forms: any[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.KEYS.DRIVER_FORMS, JSON.stringify(forms))
    }
  }

  // Get data from localStorage (SSR-safe)
  static getDrivers(): any[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.KEYS.DRIVERS)
    return data ? JSON.parse(data) : []
  }

  static getRawMaterials(): any[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.KEYS.RAW_MATERIALS)
    return data ? JSON.parse(data) : []
  }

  static getSuppliers(): any[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.KEYS.SUPPLIERS)
    return data ? JSON.parse(data) : []
  }

  static getTankers(): any[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.KEYS.TANKERS)
    return data ? JSON.parse(data) : []
  }

  static getDriverForms(): any[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.KEYS.DRIVER_FORMS)
    return data ? JSON.parse(data) : []
  }

  static saveCollectionVouchers(vouchers: any[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.KEYS.COLLECTION_VOUCHERS, JSON.stringify(vouchers))
    }
  }

  static getCollectionVouchers(): any[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.KEYS.COLLECTION_VOUCHERS)
    return data ? JSON.parse(data) : []
  }

  // Save a new driver form
  static saveDriverForm(form: any) {
    const forms = this.getDriverForms()
    const newForm = {
      ...form,
      id: form.id || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: form.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: form.sync_status || 'pending'
    }
    forms.push(newForm)
    this.saveDriverForms(forms)
    return newForm
  }

  // Update an existing offline driver form (merge by id)
  static updateDriverForm(updated: any) {
    const forms = this.getDriverForms()
    const idx = forms.findIndex((f: any) => f.id === updated.id)
    if (idx === -1) {
      // if not found, add as new
      const toSave = {
        ...updated,
        id: updated.id || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: updated.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: updated.sync_status || 'pending'
      }
      forms.push(toSave)
    } else {
      forms[idx] = {
        ...forms[idx],
        ...updated,
        updated_at: new Date().toISOString()
      }
    }
    this.saveDriverForms(forms)
  }

  // Return pending driver forms
  static getPendingDriverForms(): any[] {
    return this.getDriverForms().filter((f: any) => f.sync_status === 'pending')
  }

  // Save a new collection voucher
  static saveCollectionVoucher(voucher: any) {
    const vouchers = this.getCollectionVouchers()
    const newVoucher = {
      ...voucher,
      id: voucher.id || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: voucher.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: voucher.sync_status || 'pending'
    }
    vouchers.push(newVoucher)
    this.saveCollectionVouchers(vouchers)
    return newVoucher
  }

  // Update an existing collection voucher
  static updateCollectionVoucher(updated: any) {
    const vouchers = this.getCollectionVouchers()
    const idx = vouchers.findIndex((v: any) => v.id === updated.id)
    if (idx === -1) {
      const toSave = {
        ...updated,
        id: updated.id || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: updated.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: updated.sync_status || 'pending'
      }
      vouchers.push(toSave)
    } else {
      vouchers[idx] = {
        ...vouchers[idx],
        ...updated,
        updated_at: new Date().toISOString()
      }
    }
    this.saveCollectionVouchers(vouchers)
  }

  // Return pending collection vouchers
  static getPendingCollectionVouchers(): any[] {
    return this.getCollectionVouchers().filter((v: any) => v.sync_status === 'pending')
  }

  // Mark collection voucher as synced
  static markCollectionVoucherAsSynced(id: string, serverId?: string) {
    const vouchers = this.getCollectionVouchers()
    const idx = vouchers.findIndex((v: any) => v.id === id)
    if (idx !== -1) {
      vouchers[idx] = {
        ...vouchers[idx],
        sync_status: 'synced',
        server_id: serverId || vouchers[idx].server_id,
        updated_at: new Date().toISOString()
      }
      this.saveCollectionVouchers(vouchers)
    }
  }

  // Mark collection voucher as failed
  static markCollectionVoucherAsFailed(id: string) {
    const vouchers = this.getCollectionVouchers()
    const idx = vouchers.findIndex((v: any) => v.id === id)
    if (idx !== -1) {
      vouchers[idx] = {
        ...vouchers[idx],
        sync_status: 'failed',
        updated_at: new Date().toISOString()
      }
      this.saveCollectionVouchers(vouchers)
    }
  }

  // Mark offline form as synced (set server id if returned)
  static markFormAsSynced(id: string, serverId?: string) {
    const forms = this.getDriverForms()
    const idx = forms.findIndex((f: any) => f.id === id)
    if (idx !== -1) {
      forms[idx] = {
        ...forms[idx],
        sync_status: 'synced',
        server_id: serverId || forms[idx].server_id,
        updated_at: new Date().toISOString()
      }
      this.saveDriverForms(forms)
    }
  }

  // Mark offline form as failed
  static markFormAsFailed(id: string) {
    const forms = this.getDriverForms()
    const idx = forms.findIndex((f: any) => f.id === id)
    if (idx !== -1) {
      forms[idx] = {
        ...forms[idx],
        sync_status: 'failed',
        updated_at: new Date().toISOString()
      }
      this.saveDriverForms(forms)
    }
  }

  // Check if we have offline data
  static hasOfflineData(): boolean {
    return this.getDrivers().length > 0 ||
      this.getRawMaterials().length > 0 ||
      this.getSuppliers().length > 0 ||
      this.getTankers().length > 0
  }

  // Clear all offline data (SSR-safe)
  static clearAllData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.KEYS.DRIVERS)
      localStorage.removeItem(this.KEYS.RAW_MATERIALS)
      localStorage.removeItem(this.KEYS.SUPPLIERS)
      localStorage.removeItem(this.KEYS.TANKERS)
      localStorage.removeItem(this.KEYS.DRIVER_FORMS)
      localStorage.removeItem(this.KEYS.COLLECTION_VOUCHERS)
    }
  }

  // Set offline mode (SSR-safe)
  static setOfflineMode(isOffline: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.KEYS.IS_OFFLINE, isOffline.toString())
    }
  }

  static isOfflineMode(): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(this.KEYS.IS_OFFLINE) === 'true'
  }
}
