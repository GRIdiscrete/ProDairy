// Simple localStorage-based offline data service
export class LocalStorageService {
  private static readonly KEYS = {
    DRIVERS: 'offline_drivers',
    RAW_MATERIALS: 'offline_raw_materials',
    SUPPLIERS: 'offline_suppliers',
    DRIVER_FORMS: 'offline_driver_forms',
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

  static getDriverForms(): any[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.KEYS.DRIVER_FORMS)
    return data ? JSON.parse(data) : []
  }

  // Save a new driver form
  static saveDriverForm(form: any) {
    const forms = this.getDriverForms()
    const newForm = {
      ...form,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: 'pending'
    }
    forms.push(newForm)
    this.saveDriverForms(forms)
    return newForm
  }

  // Check if we have offline data
  static hasOfflineData(): boolean {
    return this.getDrivers().length > 0 || 
           this.getRawMaterials().length > 0 || 
           this.getSuppliers().length > 0
  }

  // Clear all offline data (SSR-safe)
  static clearAllData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.KEYS.DRIVERS)
      localStorage.removeItem(this.KEYS.RAW_MATERIALS)
      localStorage.removeItem(this.KEYS.SUPPLIERS)
      localStorage.removeItem(this.KEYS.DRIVER_FORMS)
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
