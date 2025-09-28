// Core Entity Types
export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role_id: string
  department: string
  password?: string
  created_at: string
  updated_at: string
}

export type UserRole = "admin" | "manager" | "operator" | "lab_technician" | "quality_control"

export interface Supplier {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  physical_address: string
  raw_product: string
  volume_supplied: number
  volume_rejected: number
  updated_at: string
}

export interface Vehicle {
  id: string
  supplierId: string
  plateNumber: string
  driverName: string
  driverLicense: string
  capacity: number
  isActive: boolean
}

export interface RawMilkIntake {
  id: string
  voucherNumber: string
  supplierId: string
  vehicleId: string
  quantityKg: number
  quantityLitres: number
  temperature: number
  ph: number
  density: number
  fat: number
  protein: number
  receivedBy: string
  receivedAt: string
  status: "pending" | "accepted" | "rejected"
  qualityGrade: "A" | "B" | "C"
}

export interface Machine {
  id: string
  created_at: string
  name: string
  serial_number: string
  status: MachineStatus
  category: string
  location: string
  updated_at: string
}

export type MachineStatus = "active" | "inactive" | "maintenance" | "offline"

export interface Silo {
  id: string
  created_at: string
  name: string
  serial_number: string
  status: SiloStatus
  category: string
  location: string
  milk_volume: number
  capacity: number
  updated_at: string
}

export type SiloStatus = "active" | "inactive" | "maintenance" | "offline"

export interface RawMaterial {
  id: string
  created_at: string
  name: string
  description: string
  updated_at: string
}

// New Process Types
export interface Process {
  id: string
  created_at: string
  name: string
  raw_material_ids: string[]
  updated_at?: string
}

// New Production Plan Types
export interface ProductionPlanRawProduct {
  raw_material_id: string
  raw_material_name: string
  requested_amount: number
  unit_of_measure: string
}

export interface ProductionPlan {
  id: string
  created_at: string
  name: string
  description?: string
  start_date: string
  end_date: string
  raw_products: ProductionPlanRawProduct[]
  supervisor: string
  status: "planned" | "ongoing" | "completed" | "cancelled"
  updated_at?: string
  production_plan_supervisor_fkey?: UserEntity
  process_id?: string
  output?: {
    value: number
    unit_of_measure: string
  }
}

// New Driver Form Types
export interface DriverFormCollectedProduct {
  raw_material_id: string
  supplier_id: string
  collected_amount: number
  unit_of_measure: string
  "e-sign-supplier": string
  "e-sign-driver": string
}

export interface DriverForm {
  id: string
  created_at: string
  driver: string
  start_date: string
  end_date: string
  collected_products: DriverFormCollectedProduct[] | null
  delivered: boolean
  rejected: boolean
  updated_at: string
  drivers_driver_fkey?: UserEntity
}

// User Entity for API responses
export interface UserEntity {
  id: string
  email: string
  role_id: string
  password?: string
  last_name: string
  created_at: string
  department: string
  first_name: string
  updated_at: string
}

export interface MachineSpecification {
  capacity: number
  powerConsumption: number
  operatingTemperature: { min: number; max: number }
  operatingPressure: { min: number; max: number }
}

export interface ProductionBatch {
  id: string
  batchNumber: string
  productType: string
  rawMaterialIds: string[]
  machineIds: string[]
  targetQuantity: number
  actualQuantity: number
  startTime: string
  endTime?: string
  status: BatchStatus
  qualityTests: QualityTest[]
  operatorId: string
  supervisorId: string
}

export type BatchStatus = "planned" | "in_progress" | "completed" | "on_hold" | "cancelled" | "quality_check"

export interface QualityTest {
  id: string
  batchId: string
  testType: TestType
  parameters: TestParameter[]
  result: TestResult
  testedBy: string
  testedAt: string
  approvedBy?: string
  approvedAt?: string
  notes?: string
}

export type TestType = "microbiological" | "chemical" | "physical" | "organoleptic"
export type TestResult = "pass" | "fail" | "pending" | "retest"

export interface TestParameter {
  name: string
  value: number | string
  unit: string
  specification: { min?: number; max?: number; expected?: string }
  status: "pass" | "fail" | "warning"
}

export interface ProductionMetrics {
  targetProduction: number
  actualProduction: number
  efficiency: number
  wastage: number
  downtime: number
  qualityRate: number
  machineUtilization: number
  costPerUnit: number
}

export interface MachineInspection {
  id: string
  machineId: string
  inspectorId: string
  type: "daily" | "weekly" | "monthly" | "maintenance"
  checkedBy: string
  date: string
  problems: string[]
  status: "completed" | "issues_found" | "maintenance_required"
  notes?: string
}

// Dashboard specific types
export interface DashboardMetrics {
  production: ProductionMetrics
  machines: {
    total: number
    running: number
    idle: number
    maintenance: number
    fault: number
  }
  quality: {
    passRate: number
    testsPending: number
    batchesApproved: number
    batchesRejected: number
  }
  efficiency: {
    overall: number
    byDepartment: { [key: string]: number }
  }
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filter and Sort types
export interface TableFilters {
  search?: string
  status?: string
  dateRange?: {
    from: string
    to: string
  }
  department?: string
  [key: string]: any
}

export interface SortConfig {
  key: string
  direction: "asc" | "desc"
}
