// Core Entity Types
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type UserRole = "admin" | "manager" | "operator" | "lab_technician" | "quality_control"

export interface Supplier {
  id: string
  name: string
  code: string
  contactPerson: string
  phone: string
  email: string
  address: string
  registrationNumber: string
  isActive: boolean
  performanceRating: number
  vehicles: Vehicle[]
  createdAt: string
  updatedAt: string
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
  name: string
  code: string
  type: MachineType
  location: string
  floor: string
  warehouse: string
  status: MachineStatus
  operator?: string
  temperature?: number
  pressure?: number
  speed?: number
  efficiency: number
  lastMaintenance: string
  nextMaintenance: string
  specifications: MachineSpecification
}

export type MachineType = "pasteurizer" | "homogenizer" | "separator" | "filler" | "packaging" | "sterilizer"
export type MachineStatus = "running" | "idle" | "maintenance" | "fault" | "offline"

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
