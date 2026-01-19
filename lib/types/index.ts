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
  phone_number?: string | null
  users_role_id_fkey?: UserRoleFkey
}

export interface UserRoleFkey {
  id: string
  role_name: string
  created_at: string
  updated_at: string | null
  views: string[]
  bmt_operations: string[]
  role_operations: string[]
  user_operations: string[]
  devices_operations: string[]
  process_operations: string[]
  dispatch_operations: string[]
  supplier_operations: string[]
  silo_item_operations: string[]
  incubation_operations: string[]
  machine_item_operations: string[]
  pasteurizing_operations: string[]
  production_plan_operations: string[]
  raw_milk_intake_operations: string[]
  raw_milk_lab_test_operations: string[]
  filmatic_operation_operations: string[]
  incubation_lab_test_operations: string[]
  raw_product_collection_operations: string[]
  steri_process_operation_operations: string[]
  before_and_after_autoclave_lab_test_operations: string[]
}

export type UserRole = "admin" | "manager" | "operator" | "lab_technician" | "quality_control"

export interface SupplierTank {
  id: string
  code: string
  name: string
  capacity: number
  quantity: number | null
  supplier: string
  created_at: string
  updated_at: string | null
}

export interface Supplier {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  physical_address: string
  raw_product: string
  company_name: string | null
  number_of_tanks: number | null
  tank_id?: string | null
  volume_supplied: number | null
  volume_rejected: number | null
  updated_at: string
  suppliers_tanks?: SupplierTank[]
  tanks?: Partial<SupplierTank>[]
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

// New Tanker Interface
export interface Tanker {
  id: string
  age: number
  mileage: number
  capacity: number
  condition: string
  driver_id: string
  created_at: string
  reg_number: string
  updated_at: string | null
  compartments: number
}

// New Raw Milk Intake Lab Test Interface
export interface RawMilkIntakeLabTest {
  id: string
  cob: boolean | null
  tag: string | null
  date: string
  alcohol: number | null
  remarks: string | null
  accepted: boolean
  no_water: string | null
  no_starch: string | null
  created_at: string
  updated_at: string | null
  bacteria_load: string | null
  organol_eptic: string
  milk_freshness: string | null
  drivers_form_id: string | null
  collected_product_id: string
}

// New Driver Form Types
export interface DriverFormCollectedProduct {
  id?: string
  created_at?: string
  updated_at?: string | null
  drivers_form_id?: string
  raw_material_id: string
  supplier_id: string
  collected_amount: number
  unit_of_measure: string
  e_sign_supplier: string
  e_sign_driver: string
  tanker_compartment?: number
  raw_milk_intake_lab_test: RawMilkIntakeLabTest[]
}

export interface DriverForm {
  id: string
  created_at: string
  driver: string
  start_date: string
  end_date: string
  tanker: Tanker
  tag: string
  collected_products?: any[] | null
  collected_products_?: string | null
  drivers_form_collected_products: DriverFormCollectedProduct[]
  delivered: boolean
  rejected: boolean
  updated_at: string | null
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

// Raw Milk Collection Voucher Types
export interface CollectionVoucherDetails {
  id?: string
  created_at?: string
  updated_at?: string
  raw_milk_collection_voucher_id?: string
  temperature: number
  dip_reading: number
  meter_start: number
  meter_finish: number
  volume: number
  dairy_total: number
  farmer_tank_number: number[]
  truck_compartment_number: number
  route_total: number
}

export interface CollectionVoucherLabTest {
  id?: string
  created_at?: string
  updated_at?: string
  raw_milk_collection_voucher_id?: string
  ot_result?: string
  cob_result?: boolean
  organoleptic?: string
  alcohol?: string
}

export interface CollectionVoucher {
  id: string
  created_at: string
  updated_at: string
  driver: string
  date: string
  route: string
  farmer: string | Supplier
  number_of_compartments: number
  details: string | CollectionVoucherDetails[]
  raw_milk_collection_voucher_details: CollectionVoucherDetails[]
  truck_number: string
  time_in: string
  time_out: string
  lab_test: string | CollectionVoucherLabTest[]
  raw_milk_collection_voucher_lab_test: CollectionVoucherLabTest[]
  remark: string
  driver_signature: string
  tag?: string
}

export interface LabTest2 {
  id?: string
  alcohol?: string
  ot_result?: string
  cob_result?: boolean
  organoleptic?: string
  created_at?: string
  updated_at?: string | null
  raw_milk_collection_voucher_2_details_farmer_tank_id?: string
}

export interface FarmerTank {
  id?: string
  volume?: number
  dairy_total?: number
  dip_reading?: number
  meter_start?: number
  temperature?: number
  meter_finish?: number
  supplier_tank_id?: string
  truck_compartment_number?: number
  raw_milk_collection_voucher_2_details_id?: string
  lab_test?: LabTest2 | null
  created_at?: string
  updated_at?: string | null
  scientist_lab_test?: string | null
}

export interface CollectionVoucherDetails2 {
  id?: string
  created_at?: string
  updated_at?: string | null
  supplier_tanks?: string | null
  raw_milk_collection_voucher_2_id?: string
  raw_milk_collection_voucher_2_details_farmer_tank: FarmerTank[]
}

export interface CollectionVoucher2 {
  id: string
  created_at: string
  updated_at: string | null
  driver: string
  date: string
  route: string
  supplier: string | Supplier
  truck_number: string
  time_in: string
  time_out: string
  remark: string
  driver_signature: string
  tag: string
  details?: string | null
  ot_result?: string | null
  cob_result?: boolean | null
  lab_test?: any | null
  number_of_compartments?: number | null
  route_total?: number | null
  raw_milk_collection_voucher_2_details: CollectionVoucherDetails2[]
}
export interface RawMilkResultSlipBeforeIntakeLabTest {
  id: string
  ot: string
  ph: number | null
  cob: boolean | null
  fat: number | null
  fpd: number | null
  scc: number | null
  pass: boolean
  time: string
  lr_snf: string | null
  remark: string | null
  starch: boolean | null
  alcohol: number | null
  density: number | null
  protein: number | null
  accepted: boolean
  resazurin: string | null
  created_at: string
  updated_at: string | null
  antibiotics: boolean | null
  temperature: number | null
  total_solids: number | null
  titratable_acidity: number | null
  raw_milk_result_slip_before_intake_id: string
}

export interface RawMilkResultSlipBeforeIntake {
  id: string
  created_at: string
  updated_at: string | null
  date: string
  time_in: string
  time_out: string
  approved_by: string
  approver_signature: string
  analyst: string
  results_collected_by: string
  tag: string
  lab_test: RawMilkResultSlipBeforeIntakeLabTest
  truck_compartment_number: number
  voucher_id: string
}

export interface UntestedCompartment {
  voucher_id: string
  voucher_created_at: string
  farmer_tank: string
  truck_compartment_number: number
  driver_first_name: string
  driver_last_name: string
  truck_number: string
}
