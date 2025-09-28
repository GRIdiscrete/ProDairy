import { OfflineDataService } from './database'
import { OfflineDriver, OfflineRawMaterial, OfflineSupplier } from './database'

export class DataSyncService {
  // Sync drivers data
  static async syncDrivers(apiDrivers: any[]): Promise<void> {
    const offlineDrivers: OfflineDriver[] = apiDrivers.map(driver => ({
      id: driver.id,
      first_name: driver.first_name,
      last_name: driver.last_name,
      email: driver.email,
      phone: driver.phone,
      created_at: driver.created_at,
      updated_at: driver.updated_at
    }))

    await OfflineDataService.saveDrivers(offlineDrivers)
  }

  // Sync raw materials data
  static async syncRawMaterials(apiMaterials: any[]): Promise<void> {
    const offlineMaterials: OfflineRawMaterial[] = apiMaterials.map(material => ({
      id: material.id,
      name: material.name,
      description: material.description,
      unit_of_measure: material.unit_of_measure,
      created_at: material.created_at,
      updated_at: material.updated_at
    }))

    await OfflineDataService.saveRawMaterials(offlineMaterials)
  }

  // Sync suppliers data
  static async syncSuppliers(apiSuppliers: any[]): Promise<void> {
    const offlineSuppliers: OfflineSupplier[] = apiSuppliers.map(supplier => ({
      id: supplier.id,
      name: supplier.name || `${supplier.first_name} ${supplier.last_name}`,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      created_at: supplier.created_at,
      updated_at: supplier.updated_at
    }))

    await OfflineDataService.saveSuppliers(offlineSuppliers)
  }

  // Sync all reference data
  static async syncAllReferenceData(apiData: {
    drivers: any[]
    rawMaterials: any[]
    suppliers: any[]
  }): Promise<void> {
    await Promise.all([
      this.syncDrivers(apiData.drivers),
      this.syncRawMaterials(apiData.rawMaterials),
      this.syncSuppliers(apiData.suppliers)
    ])
  }

  // Sync driver forms with driver data
  static async syncDriverForms(apiForms: any[], drivers: OfflineDriver[]): Promise<void> {
    const offlineForms = apiForms.map(form => ({
      id: form.id,
      driver_id: form.driver_id,
      driver: drivers.find(d => d.id === form.driver_id),
      start_date: form.start_date,
      end_date: form.end_date,
      delivered: form.delivered || false,
      rejected: form.rejected || false,
      collected_products: form.collected_products || [],
      created_at: form.created_at,
      updated_at: form.updated_at,
      sync_status: 'synced' as const
    }))

    // Clear existing forms and add new ones
    await OfflineDataService.clearDriverForms()
    for (const form of offlineForms) {
      await OfflineDataService.saveDriverForm(form)
    }
  }

  // Check if offline data exists
  static async hasOfflineData(): Promise<boolean> {
    const [drivers, materials, suppliers] = await Promise.all([
      OfflineDataService.getDrivers(),
      OfflineDataService.getRawMaterials(),
      OfflineDataService.getSuppliers()
    ])

    return drivers.length > 0 || materials.length > 0 || suppliers.length > 0
  }

  // Clear all offline data
  static async clearOfflineData(): Promise<void> {
    await OfflineDataService.clearAllData()
  }
}
