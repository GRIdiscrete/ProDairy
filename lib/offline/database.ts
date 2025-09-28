import Dexie, { Table } from 'dexie'

// Define interfaces for offline data
export interface OfflineDriver {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface OfflineRawMaterial {
  id: string
  name: string
  description: string
  unit_of_measure: string
  created_at: string
  updated_at: string
}

export interface OfflineSupplier {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface OfflineDriverForm {
  id: string
  driver_id: string
  driver?: OfflineDriver // Include driver data for display
  start_date: string
  end_date: string
  delivered: boolean
  rejected: boolean
  collected_products: OfflineCollectedProduct[]
  created_at: string
  updated_at: string
  sync_status: 'pending' | 'synced' | 'failed'
  server_id?: string // ID from server after sync
}

export interface OfflineCollectedProduct {
  raw_material_id: string
  supplier_id: string
  collected_amount: number
  unit_of_measure: string
  'e-sign-supplier': string
  'e-sign-driver': string
}

// Database class
export class OfflineDatabase extends Dexie {
  drivers!: Table<OfflineDriver>
  rawMaterials!: Table<OfflineRawMaterial>
  suppliers!: Table<OfflineSupplier>
  driverForms!: Table<OfflineDriverForm>

  constructor() {
    super('ProdairyOfflineDB')
    
    this.version(1).stores({
      drivers: 'id, first_name, last_name, email, created_at',
      rawMaterials: 'id, name, description, unit_of_measure, created_at',
      suppliers: 'id, name, email, phone, created_at',
      driverForms: 'id, driver_id, start_date, end_date, sync_status, created_at'
    })
  }
}

// Create database instance
export const db = new OfflineDatabase()

// Utility functions for offline operations
export class OfflineDataService {
  // Driver operations
  static async saveDrivers(drivers: OfflineDriver[]) {
    await db.drivers.clear()
    await db.drivers.bulkAdd(drivers)
  }

  static async getDrivers(): Promise<OfflineDriver[]> {
    return await db.drivers.toArray()
  }

  // Raw Material operations
  static async saveRawMaterials(materials: OfflineRawMaterial[]) {
    await db.rawMaterials.clear()
    await db.rawMaterials.bulkAdd(materials)
  }

  static async getRawMaterials(): Promise<OfflineRawMaterial[]> {
    return await db.rawMaterials.toArray()
  }

  // Supplier operations
  static async saveSuppliers(suppliers: OfflineSupplier[]) {
    await db.suppliers.clear()
    await db.suppliers.bulkAdd(suppliers)
  }

  static async getSuppliers(): Promise<OfflineSupplier[]> {
    return await db.suppliers.toArray()
  }

  // Driver Form operations
  static async saveDriverForm(form: OfflineDriverForm) {
    await db.driverForms.add(form)
  }

  static async updateDriverForm(id: string, form: Partial<OfflineDriverForm>) {
    await db.driverForms.update(id, form)
  }

  static async getDriverForms(): Promise<OfflineDriverForm[]> {
    return await db.driverForms.toArray()
  }

  static async getPendingDriverForms(): Promise<OfflineDriverForm[]> {
    return await db.driverForms.where('sync_status').equals('pending').toArray()
  }

  static async markFormAsSynced(id: string, serverId: string) {
    await db.driverForms.update(id, {
      sync_status: 'synced',
      server_id: serverId
    })
  }

  static async markFormAsFailed(id: string) {
    await db.driverForms.update(id, {
      sync_status: 'failed'
    })
  }

  static async deleteDriverForm(id: string) {
    await db.driverForms.delete(id)
  }

  static async clearDriverForms() {
    await db.driverForms.clear()
  }

  // Clear all offline data
  static async clearAllData() {
    await db.drivers.clear()
    await db.rawMaterials.clear()
    await db.suppliers.clear()
    await db.driverForms.clear()
  }
}
