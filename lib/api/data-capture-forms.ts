import { apiRequest } from '@/lib/utils/api-request'

// BMT Control Form Types
export interface BMTControlForm {
  id?: string
  created_at?: string
  flow_meter_start: string
  flow_meter_start_reading: number
  flow_meter_end: string
  flow_meter_end_reading: number
  source_silo_id: string
  movement_start: string
  movement_end: string
  destination_silo_id: string
  volume: number
  llm_operator_id: string
  llm_signature: string
  dpp_operator_id: string
  dpp_signature: string
  product: string
  updated_at?: string
  // Relationship data
  bmt_control_form_source_silo_id_fkey?: {
    id: string
    name: string
    status: string
    capacity: number
    category: string
    location: string
    created_at: string
    updated_at: string
    milk_volume: number
    serial_number: string
  }
  bmt_control_form_destination_silo_id_fkey?: {
    id: string
    name: string
    status: string
    capacity: number
    category: string
    location: string
    created_at: string
    updated_at: string
    milk_volume: number
    serial_number: string
  }
  bmt_control_form_llm_operator_id_fkey?: {
    id: string
    email: string
    role_id: string
    password: string
    last_name: string
    created_at: string
    department: string
    first_name: string
    updated_at: string
  }
  bmt_control_form_dpp_operator_id_fkey?: {
    id: string
    email: string
    role_id: string
    password: string
    last_name: string
    created_at: string
    department: string
    first_name: string
    updated_at: string
  }
}

// CIP Control Form Types
export interface CIPControlForm {
  id?: string
  created_at?: string
  status: string
  machine_id: string
  operator_id: string
  date: string
  approver: string
  analyzer: string
  caustic_solution_strength: number
  acid_solution_strength: number
  rinse_water_test: string
  checked_by: string
  updated_at?: string
  // Relationship data
  cip_control_form_machine_id_fkey?: {
    id: string
    name: string
    status: string
    category: string
    location: string
    created_at: string
    updated_at: string
    serial_number: string
  }
  cip_control_form_operator_id_fkey?: {
    id: string
    email: string
    role_id: string
    password: string
    last_name: string
    created_at: string
    department: string
    first_name: string
    updated_at: string
  }
  cip_control_form_approver_fkey?: {
    id: string
    views: string[]
    role_name: string
    created_at: string
    updated_at: string
    role_operations: string[]
    user_operations: string[]
    devices_operations: string[]
    process_operations: string[]
    supplier_operations: string[]
    silo_item_operations: string[]
    machine_item_operations: string[]
  }
  cip_control_form_analyzer_fkey?: {
    id: string
    email: string
    role_id: string
    password: string
    last_name: string
    created_at: string
    department: string
    first_name: string
    updated_at: string
  }
  cip_control_form_checked_by_fkey?: {
    id: string
    email: string
    role_id: string
    password: string
    last_name: string
    created_at: string
    department: string
    first_name: string
    updated_at: string
  }
}

// CIP Control Form Stages Types
export interface CIPControlFormStages {
  id?: string
  created_at?: string
  cip_control_form_id: string
  stage_name: string
  start_time: string
  end_time: string
  temperature: number
  pressure: number
  flow_rate: number
  concentration: number
  notes?: string
  updated_at?: string
}

// Drivers Form Types
export interface DriversForm {
  id?: string
  created_at?: string
  driver_name: string
  license_number: string
  vehicle_registration: string
  route: string
  departure_time: string
  arrival_time: string
  distance_km: number
  fuel_consumption: number
  maintenance_notes?: string
  updated_at?: string
}

// Filler Log 2 Types
export interface FillerLog2 {
  id?: string
  created_at?: string
  shift: string
  date: string
  operator_id: string
  supervisor_id: string
  product_type: string
  batch_number: string
  start_time: string
  end_time: string
  total_production: number
  quality_checks: string
  notes?: string
  updated_at?: string
}

export interface FillerLog2ProcessControl {
  id?: string
  created_at?: string
  filler_log_id: string
  parameter_name: string
  target_value: number
  actual_value: number
  unit: string
  time_recorded: string
  operator_initials: string
  updated_at?: string
}

export interface FillerLog2ProcessControlParameters {
  id?: string
  created_at?: string
  process_control_id: string
  temperature: number
  pressure: number
  flow_rate: number
  ph_level: number
  conductivity: number
  updated_at?: string
}

export interface FillerLog2PackageIntegrity {
  id?: string
  created_at?: string
  filler_log_id: string
  package_type: string
  batch_number: string
  sample_size: number
  defects_found: number
  defect_rate: number
  inspector_id: string
  inspection_time: string
  updated_at?: string
}

export interface FillerLog2PackageIntegrityParameters {
  id?: string
  created_at?: string
  package_integrity_id: string
  seal_integrity: boolean
  print_quality: boolean
  dimensional_accuracy: boolean
  visual_defects: boolean
  weight_variance: number
  updated_at?: string
}

export interface FillerLog2PMSplice {
  id?: string
  created_at?: string
  filler_log_id: string
  splice_type: string
  material_used: string
  operator_id: string
  start_time: string
  completion_time: string
  quality_check: boolean
  notes?: string
  updated_at?: string
}

export interface FillerLog2PrepAndSterilization {
  id?: string
  created_at?: string
  filler_log_id: string
  prep_start_time: string
  prep_end_time: string
  sterilization_temperature: number
  sterilization_time: number
  chemical_concentration: number
  operator_id: string
  verification_status: boolean
  updated_at?: string
}

export interface FillerLog2StoppagesLog {
  id?: string
  created_at?: string
  filler_log_id: string
  stoppage_start: string
  stoppage_end: string
  reason: string
  category: string
  downtime_minutes: number
  corrective_action: string
  operator_id: string
  updated_at?: string
}

export interface FillerLog2StripSplice {
  id?: string
  created_at?: string
  filler_log_id: string
  strip_type: string
  splice_method: string
  operator_id: string
  timestamp: string
  quality_approved: boolean
  notes?: string
  updated_at?: string
}

// Flex One Sterilizer Process Types
export interface FlexOneSterilizerProcess {
  id?: string
  created_at?: string
  process_date: string
  operator_id: string
  batch_number: string
  product_type: string
  start_time: string
  end_time: string
  temperature_profile: string
  pressure_profile: string
  holding_time: number
  updated_at?: string
}

export interface FlexOneSterilizerProcessProduct {
  id?: string
  created_at?: string
  sterilizer_process_id: string
  product_name: string
  quantity: number
  unit: string
  quality_parameters: string
  test_results: string
  approval_status: boolean
  updated_at?: string
}

export interface FlexOneSterilizerProcessWaterStream {
  id?: string
  created_at?: string
  sterilizer_process_id: string
  stream_type: string
  flow_rate: number
  temperature: number
  quality_parameters: string
  monitoring_frequency: string
  operator_notes?: string
  updated_at?: string
}

// IST Control Form Types
export interface ISTControlForm {
  id?: string
  created_at?: string
  item_code: string
  item_description: string
  issued_by: string
  received_by: string
  approver: string
  item_trans: string
  from_warehouse: string
  to_warehouse: string
  updated_at?: string
  // Relationship data
  ist_control_form_issued_by_fkey?: {
    id: string
    email: string
    role_id: string
    password: string
    last_name: string
    created_at: string
    department: string
    first_name: string
    updated_at: string
  }
  ist_control_form_received_by_fkey?: {
    id: string
    email: string
    role_id: string
    password: string
    last_name: string
    created_at: string
    department: string
    first_name: string
    updated_at: string
  }
  ist_control_form_approver_fkey?: {
    id: string
    email: string
    role_id: string
    password: string
    last_name: string
    created_at: string
    department: string
    first_name: string
    updated_at: string
  }
}

// Legacy IST Form Types (keeping for backward compatibility)
export interface ISTForm {
  id?: string
  created_at?: string
  test_date: string
  operator_id: string
  equipment_id: string
  test_type: string
  parameters: string
  results: string
  pass_fail_status: boolean
  recommendations?: string
  updated_at?: string
}

// Palletiser Sheet Types
export interface PalletiserSheet {
  id?: string
  created_at?: string
  updated_at?: string
  machine_id: string
  manufacturing_date: string
  expiry_date: string
  batch_number: number
  product_type: string
  approved_by: string
  // Relationship data
  palletiser_sheet_approved_by_fkey?: {
    id: string
    views: string[]
    role_name: string
    created_at: string
    updated_at: string
    role_operations: string[]
    user_operations: string[]
    devices_operations: string[]
    process_operations: string[]
    supplier_operations: string[]
    silo_item_operations: string[]
    machine_item_operations: string[]
  }
  palletiser_sheet_machine_id_fkey?: {
    id: string
    name: string
    status: string
    category: string
    location: string
    created_at: string
    updated_at: string
    serial_number: string
  }
}

export interface PalletiserSheetDetails {
  id?: string
  created_at?: string
  updated_at?: string
  palletiser_sheet_id: string
  pallet_number: number
  start_time: string
  end_time: string
  cases_packed: number
  serial_number: string
  counter_id: string
  counter_signature: string
  // Relationship data
  palletiser_sheet_details_palletiser_sheet_id_fkey?: PalletiserSheet
  palletiser_sheet_details_counter_id_fkey?: {
    id: string
    created_at: string
    first_name: string
    last_name: string
    role_id: string
    department: string
    email: string
    password: string
    users_role_id_fkey?: {
      id: string
      role_name: string
      features: any
      views: string[]
      updated_at: string
    }
    updated_at: string
  }
}

// Sterilised Milk Process Types
export interface SterilisedMilkProcess {
  id?: string
  created_at?: string
  updated_at?: string
  approved_by: string
  operator_id: string
  operator_signature: string
  supervisor_id: string
  supervisor_signature: string
  // Relationship data
  sterilised_milk_process_approved_by_fkey?: {
    id: string
    created_at: string
    first_name: string
    last_name: string
    role_id: string
    department: string
    email: string
    password: string
    users_role_id_fkey?: {
      id: string
      role_name: string
      features: any
      views: string[]
      updated_at: string
    }
    updated_at: string
  }
  sterilised_milk_process_operator_id_fkey?: {
    id: string
    created_at: string
    first_name: string
    last_name: string
    role_id: string
    department: string
    email: string
    password: string
    users_role_id_fkey?: {
      id: string
      role_name: string
      features: any
      views: string[]
      updated_at: string
    }
    updated_at: string
  }
  sterilised_milk_process_supervisor_id_fkey?: {
    id: string
    created_at: string
    first_name: string
    last_name: string
    role_id: string
    department: string
    email: string
    password: string
    users_role_id_fkey?: {
      id: string
      role_name: string
      features: any
      views: string[]
      updated_at: string
    }
    updated_at: string
  }
}

export interface SterilisedMilkProcessDetails {
  id?: string
  created_at?: string
  updated_at?: string
  sterilised_milk_process_id: string
  parameter_name: string
  batch_number: number
  filling_start_reading: number
  autoclave_start_reading: number
  heating_start_reading: number
  heating_finish_reading: number
  sterilization_start_reading: number
  sterilisation_after_five_six_minutes_reading: number
  sterilisation_finish_reading: number
  precooling_start_reading: number
  precooling_finish_reading: number
  cooling_one_start_reading: number
  cooling_one_finish_reading: number
  cooling_two_start_reading: number
  cooling_two_finish_reading: number
  // Relationship data
  sterilised_milk_process_details_sterilised_milk_process_id_fkey?: SterilisedMilkProcess
}

// API Functions

// BMT Control Form APIs
export const getBMTControlForms = async () => {
  const res = await apiRequest<any>('/bmt-control-form')
  return Array.isArray(res) ? (res as BMTControlForm[]) : ((res?.data ?? []) as BMTControlForm[])
}
export const getBMTControlForm = (id: string) => apiRequest<BMTControlForm>(`/bmt-control-form/${id}`)
export const createBMTControlForm = (data: Omit<BMTControlForm, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<BMTControlForm>('/bmt-control-form', { method: 'POST', body: JSON.stringify(data) })
export const updateBMTControlForm = (data: BMTControlForm) => 
  apiRequest<BMTControlForm>('/bmt-control-form', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteBMTControlForm = (id: string) => 
  apiRequest<void>(`/bmt-control-form/${id}`, { method: 'DELETE' })

// CIP Control Form APIs
export const getCIPControlForms = async () => {
  const res = await apiRequest<any>('/cip-control-form')
  return Array.isArray(res) ? (res as CIPControlForm[]) : ((res?.data ?? []) as CIPControlForm[])
}
export const getCIPControlForm = (id: string) => apiRequest<CIPControlForm>(`/cip-control-form/${id}`)
export const createCIPControlForm = (data: Omit<CIPControlForm, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<CIPControlForm>('/cip-control-form', { method: 'POST', body: JSON.stringify(data) })
export const updateCIPControlForm = (data: CIPControlForm) => 
  apiRequest<CIPControlForm>('/cip-control-form', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteCIPControlForm = (id: string) => 
  apiRequest<void>(`/cip-control-form/${id}`, { method: 'DELETE' })

// CIP Control Form Stages APIs
export const getCIPControlFormStages = () => apiRequest<CIPControlFormStages[]>('/cip-control-form/stages')
export const getCIPControlFormStage = (id: string) => apiRequest<CIPControlFormStages>(`/cip-control-form/stages/${id}`)
export const createCIPControlFormStage = (data: Omit<CIPControlFormStages, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<CIPControlFormStages>('/cip-control-form/stages', { method: 'POST', body: JSON.stringify(data) })
export const updateCIPControlFormStage = (data: CIPControlFormStages) => 
  apiRequest<CIPControlFormStages>('/cip-control-form/stages', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteCIPControlFormStage = (id: string) => 
  apiRequest<void>(`/cip-control-form/stages/${id}`, { method: 'DELETE' })

// Drivers Form APIs
export const getDriversForms = () => apiRequest<DriversForm[]>('/drivers-form')
export const getDriversForm = (id: string) => apiRequest<DriversForm>(`/drivers-form/${id}`)
export const createDriversForm = (data: Omit<DriversForm, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<DriversForm>('/drivers-form', { method: 'POST', body: JSON.stringify(data) })
export const updateDriversForm = (data: DriversForm) => 
  apiRequest<DriversForm>('/drivers-form', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteDriversForm = (id: string) => 
  apiRequest<void>(`/drivers-form/${id}`, { method: 'DELETE' })

// Filler Log 2 APIs
export const getFillerLog2s = () => apiRequest<FillerLog2[]>('/filler-log-2')
export const getFillerLog2 = (id: string) => apiRequest<FillerLog2>(`/filler-log-2/${id}`)
export const createFillerLog2 = (data: Omit<FillerLog2, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<FillerLog2>('/filler-log-2', { method: 'POST', body: JSON.stringify(data) })
export const updateFillerLog2 = (data: FillerLog2) => 
  apiRequest<FillerLog2>('/filler-log-2', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteFillerLog2 = (id: string) => 
  apiRequest<void>(`/filler-log-2/${id}`, { method: 'DELETE' })

// Filler Log 2 Process Control APIs
export const getFillerLog2ProcessControls = () => apiRequest<FillerLog2ProcessControl[]>('/filler-log-2/process-control')
export const getFillerLog2ProcessControl = (id: string) => apiRequest<FillerLog2ProcessControl>(`/filler-log-2/process-control/${id}`)
export const createFillerLog2ProcessControl = (data: Omit<FillerLog2ProcessControl, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<FillerLog2ProcessControl>('/filler-log-2/process-control', { method: 'POST', body: JSON.stringify(data) })
export const updateFillerLog2ProcessControl = (data: FillerLog2ProcessControl) => 
  apiRequest<FillerLog2ProcessControl>('/filler-log-2/process-control', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteFillerLog2ProcessControl = (id: string) => 
  apiRequest<void>(`/filler-log-2/process-control/${id}`, { method: 'DELETE' })

// Filler Log 2 Process Control Parameters APIs
export const getFillerLog2ProcessControlParameters = () => apiRequest<FillerLog2ProcessControlParameters[]>('/filler-log-2/process-control/parameters')
export const getFillerLog2ProcessControlParameter = (id: string) => apiRequest<FillerLog2ProcessControlParameters>(`/filler-log-2/process-control/parameters/${id}`)
export const createFillerLog2ProcessControlParameter = (data: Omit<FillerLog2ProcessControlParameters, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<FillerLog2ProcessControlParameters>('/filler-log-2/process-control/parameters', { method: 'POST', body: JSON.stringify(data) })
export const updateFillerLog2ProcessControlParameter = (data: FillerLog2ProcessControlParameters) => 
  apiRequest<FillerLog2ProcessControlParameters>('/filler-log-2/process-control/parameters', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteFillerLog2ProcessControlParameter = (id: string) => 
  apiRequest<void>(`/filler-log-2/process-control/parameters/${id}`, { method: 'DELETE' })

// Continue with remaining APIs...
// (Package Integrity, PM Splice, Prep and Sterilization, Stoppages Log, Strip Splice)
// (Flex One Sterilizer Process, Product, Water Stream)
// (IST Form, Palletiser Sheet, Sterilised Milk Process)

// Package Integrity APIs
export const getFillerLog2PackageIntegrities = () => apiRequest<FillerLog2PackageIntegrity[]>('/filler-log-2/package-integrity')
export const getFillerLog2PackageIntegrity = (id: string) => apiRequest<FillerLog2PackageIntegrity>(`/filler-log-2/package-integrity/${id}`)
export const createFillerLog2PackageIntegrity = (data: Omit<FillerLog2PackageIntegrity, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<FillerLog2PackageIntegrity>('/filler-log-2/package-integrity', { method: 'POST', body: JSON.stringify(data) })
export const updateFillerLog2PackageIntegrity = (data: FillerLog2PackageIntegrity) => 
  apiRequest<FillerLog2PackageIntegrity>('/filler-log-2/package-integrity', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteFillerLog2PackageIntegrity = (id: string) => 
  apiRequest<void>(`/filler-log-2/package-integrity/${id}`, { method: 'DELETE' })

// Package Integrity Parameters APIs
export const getFillerLog2PackageIntegrityParameters = () => apiRequest<FillerLog2PackageIntegrityParameters[]>('/filler-log-2/package-integrity/parameters')
export const getFillerLog2PackageIntegrityParameter = (id: string) => apiRequest<FillerLog2PackageIntegrityParameters>(`/filler-log-2/package-integrity/parameters/${id}`)
export const createFillerLog2PackageIntegrityParameter = (data: Omit<FillerLog2PackageIntegrityParameters, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<FillerLog2PackageIntegrityParameters>('/filler-log-2/package-integrity/parameters', { method: 'POST', body: JSON.stringify(data) })
export const updateFillerLog2PackageIntegrityParameter = (data: FillerLog2PackageIntegrityParameters) => 
  apiRequest<FillerLog2PackageIntegrityParameters>('/filler-log-2/package-integrity/parameters', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteFillerLog2PackageIntegrityParameter = (id: string) => 
  apiRequest<void>(`/filler-log-2/package-integrity/parameters/${id}`, { method: 'DELETE' })

// Flex One Sterilizer Process APIs
export const getFlexOneSterilizerProcesses = () => apiRequest<FlexOneSterilizerProcess[]>('/flex-one-sterilizer-process')
export const getFlexOneSterilizerProcess = (id: string) => apiRequest<FlexOneSterilizerProcess>(`/flex-one-sterilizer-process/${id}`)
export const createFlexOneSterilizerProcess = (data: Omit<FlexOneSterilizerProcess, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<FlexOneSterilizerProcess>('/flex-one-sterilizer-process', { method: 'POST', body: JSON.stringify(data) })
export const updateFlexOneSterilizerProcess = (data: FlexOneSterilizerProcess) => 
  apiRequest<FlexOneSterilizerProcess>('/flex-one-sterilizer-process', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteFlexOneSterilizerProcess = (id: string) => 
  apiRequest<void>(`/flex-one-sterilizer-process/${id}`, { method: 'DELETE' })

// IST Control Form APIs
export const getISTControlForms = async () => {
  const res = await apiRequest<any>('/ist-control-form')
  return Array.isArray(res) ? (res as ISTControlForm[]) : ((res?.data ?? []) as ISTControlForm[])
}
export const getISTControlForm = async (id: string) => {
  const res = await apiRequest<any>(`/ist-control-form/${id}`)
  return Array.isArray(res) ? (res[0] as ISTControlForm) : ((res?.data ?? null) as ISTControlForm)
}
export const createISTControlForm = async (data: Omit<ISTControlForm, 'id' | 'created_at' | 'updated_at'>) => {
  const res = await apiRequest<any>('/ist-control-form', { method: 'POST', body: JSON.stringify(data) })
  return Array.isArray(res) ? (res[0] as ISTControlForm) : ((res?.data ?? null) as ISTControlForm)
}
export const updateISTControlForm = async (data: ISTControlForm) => {
  const res = await apiRequest<any>('/ist-control-form', { method: 'PATCH', body: JSON.stringify(data) })
  return Array.isArray(res) ? (res[0] as ISTControlForm) : ((res?.data ?? null) as ISTControlForm)
}
export const deleteISTControlForm = (id: string) => 
  apiRequest<void>(`/ist-control-form/${id}`, { method: 'DELETE' })

// Legacy IST Form APIs (keeping for backward compatibility)
export const getISTForms = () => apiRequest<ISTForm[]>('/ist-control-form')
export const getISTForm = (id: string) => apiRequest<ISTForm>(`/ist-control-form/${id}`)
export const createISTForm = (data: Omit<ISTForm, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<ISTForm>('/ist-control-form', { method: 'POST', body: JSON.stringify(data) })
export const updateISTForm = (data: ISTForm) => 
  apiRequest<ISTForm>('/ist-control-form', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteISTForm = (id: string) => 
  apiRequest<void>(`/ist-control-form/${id}`, { method: 'DELETE' })

// Palletiser Sheet APIs
export const getPalletiserSheets = async () => {
  try {
    const res = await apiRequest<any>('/palletiser-sheet')
    return Array.isArray(res) ? (res as PalletiserSheet[]) : ((res?.data ?? []) as PalletiserSheet[])
  } catch (error: any) {
    console.error('Error fetching palletiser sheets:', error)
    return []
  }
}

export const getPalletiserSheet = async (id: string) => {
  try {
    // Note: GET endpoint might not be available yet, returning null for now
    console.warn('GET /palletiser-sheet/{id} endpoint not available in API docs. Returning null.')
    return null
  } catch (error: any) {
    console.error('Error fetching palletiser sheet:', error)
    return null
  }
}

export const createPalletiserSheet = (data: Omit<PalletiserSheet, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<PalletiserSheet>('/palletiser-sheet', { method: 'POST', body: JSON.stringify(data) })
export const updatePalletiserSheet = (data: PalletiserSheet) => 
  apiRequest<PalletiserSheet>('/palletiser-sheet', { method: 'PATCH', body: JSON.stringify(data) })
export const deletePalletiserSheet = (id: string) => 
  apiRequest<void>(`/palletiser-sheet/${id}`, { method: 'DELETE' })

// Palletiser Sheet Details APIs
export const getPalletiserSheetDetails = async () => {
  try {
    const res = await apiRequest<any>('/palletiser-sheet-details')
    return Array.isArray(res) ? (res as PalletiserSheetDetails[]) : ((res?.data ?? []) as PalletiserSheetDetails[])
  } catch (error: any) {
    console.error('Error fetching palletiser sheet details:', error)
    return []
  }
}

export const createPalletiserSheetDetails = (data: Omit<PalletiserSheetDetails, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<PalletiserSheetDetails>('/palletiser-sheet-details', { method: 'POST', body: JSON.stringify(data) })
export const updatePalletiserSheetDetails = (data: PalletiserSheetDetails) => 
  apiRequest<PalletiserSheetDetails>('/palletiser-sheet-details', { method: 'PATCH', body: JSON.stringify(data) })
export const deletePalletiserSheetDetails = (id: string) => 
  apiRequest<void>(`/palletiser-sheet-details/${id}`, { method: 'DELETE' })

// Sterilised Milk Process APIs
export const getSterilisedMilkProcesses = async () => {
  try {
    const res = await apiRequest<any>('/sterilised-milk-process')
    return Array.isArray(res) ? (res as SterilisedMilkProcess[]) : ((res?.data ?? []) as SterilisedMilkProcess[])
  } catch (error: any) {
    console.error('Error fetching sterilised milk processes:', error)
    return []
  }
}

export const getSterilisedMilkProcess = async (id: string) => {
  try {
    // Note: GET endpoint might not be available yet, returning null for now
    console.warn('GET /sterilised-milk-process/{id} endpoint not available in API docs. Returning null.')
    return null
  } catch (error: any) {
    console.error('Error fetching sterilised milk process:', error)
    return null
  }
}

export const createSterilisedMilkProcess = async (data: Omit<SterilisedMilkProcess, 'id' | 'created_at' | 'updated_at'>) => {
  const res = await apiRequest<any>('/sterilised-milk-process', { method: 'POST', body: JSON.stringify(data) })
  return Array.isArray(res) ? (res[0] as SterilisedMilkProcess) : ((res?.data ?? null) as SterilisedMilkProcess)
}

export const updateSterilisedMilkProcess = async (data: SterilisedMilkProcess) => {
  const res = await apiRequest<any>('/sterilised-milk-process', { method: 'PATCH', body: JSON.stringify(data) })
  return Array.isArray(res) ? (res[0] as SterilisedMilkProcess) : ((res?.data ?? null) as SterilisedMilkProcess)
}

export const deleteSterilisedMilkProcess = async (id: string) => {
  try {
    // Note: DELETE endpoint might not be available yet
    console.warn('DELETE /sterilised-milk-process/{id} endpoint not available in API docs.')
    throw new Error('Delete endpoint not available')
  } catch (error: any) {
    console.error('Error deleting sterilised milk process:', error)
    throw error
  }
}

// Sterilised Milk Process Details APIs
export const getSterilisedMilkProcessDetails = async () => {
  try {
    const res = await apiRequest<any>('/sterilised-milk-process-details')
    return Array.isArray(res) ? (res as SterilisedMilkProcessDetails[]) : ((res?.data ?? []) as SterilisedMilkProcessDetails[])
  } catch (error: any) {
    console.error('Error fetching sterilised milk process details:', error)
    return []
  }
}

export const getSterilisedMilkProcessDetail = async (id: string) => {
  const res = await apiRequest<any>(`/sterilised-milk-process-details/${id}`)
  return Array.isArray(res) ? (res[0] as SterilisedMilkProcessDetails) : ((res?.data ?? null) as SterilisedMilkProcessDetails)
}

export const createSterilisedMilkProcessDetails = async (data: Omit<SterilisedMilkProcessDetails, 'id' | 'created_at' | 'updated_at'>) => {
  const res = await apiRequest<any>('/sterilised-milk-process-details', { method: 'POST', body: JSON.stringify(data) })
  return Array.isArray(res) ? (res[0] as SterilisedMilkProcessDetails) : ((res?.data ?? null) as SterilisedMilkProcessDetails)
}

export const updateSterilisedMilkProcessDetails = async (data: SterilisedMilkProcessDetails) => {
  const res = await apiRequest<any>('/sterilised-milk-process-details', { method: 'PATCH', body: JSON.stringify(data) })
  return Array.isArray(res) ? (res[0] as SterilisedMilkProcessDetails) : ((res?.data ?? null) as SterilisedMilkProcessDetails)
}

export const deleteSterilisedMilkProcessDetails = async (id: string) => {
  await apiRequest(`/sterilised-milk-process-details/${id}`, { method: 'DELETE' })
}

// Flex 1 Steriliser Process Types
export interface FlexOneSteriliserProcess {
  id?: string
  created_at?: string
  updated_at?: string
  approved_by: string
  product_being_processed: string
  machine_id: string
  production_date: string
  process_operator: string
  preheating_start: string
  sterile_water_circulation: string
  production_start: string
  production_end: string
  // Relationship data
  flex_one_steriliser_process_approved_by_fkey?: {
    id: string
    email: string
    role_id: string
    password: string
    last_name: string
    created_at: string
    department: string
    first_name: string
    updated_at: string
  }
  flex_one_steriliser_process_machine_id_fkey?: {
    id: string
    name: string
    status: string
    category: string
    location: string
    created_at: string
    updated_at: string
    serial_number: string
  }
  flex_one_steriliser_process_process_operator_fkey?: {
    id: string
    email: string
    role_id: string
    password: string
    last_name: string
    created_at: string
    department: string
    first_name: string
    updated_at: string
  }
}

export interface FlexOneSteriliserProcessProduct {
  id?: string
  created_at?: string
  updated_at?: string
  flex_one_steriliser_process_id: string
  time: string
  temp_product_btd: number
  temp_after_homogenizer: number
  temp_before_deaerator: number
  temp_before_holding_cell: number
  temp_after_holding_cell: number
  temp_guard_holding_cell: number
  temp_to_filling: number
  temp_from_filling: number
  homogenisation_pressure: number
  holding_cell: number
  flow_rate: number
  product_level_balance_tank: number
}

export interface FlexOneSteriliserProcessWaterStream {
  id?: string
  created_at?: string
  updated_at?: string
  flex_1_steriliser_process_id: string
  temp_after_steam_injection: number
  temp_deaerator_cooling_circuit: number
  steam_injection_valve_position: number
}

// Flex 1 Steriliser Process APIs
export const getFlexOneSteriliserProcesses = async () => {
  try {
    const res = await apiRequest<any>('/flex-one-sterilizer-process')
    return Array.isArray(res) ? (res as FlexOneSteriliserProcess[]) : ((res?.data ?? []) as FlexOneSteriliserProcess[])
  } catch (error: any) {
    console.error('Error fetching flex one steriliser processes:', error)
    return []
  }
}

export const getFlexOneSteriliserProcess = async (id: string) => {
  try {
    const res = await apiRequest<any>(`/flex-one-sterilizer-process/${id}`)
    return res?.data as FlexOneSteriliserProcess
  } catch (error: any) {
    console.error('Error fetching flex one steriliser process:', error)
    return null
  }
}

export const createFlexOneSteriliserProcess = (data: Omit<FlexOneSteriliserProcess, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<FlexOneSteriliserProcess>('/flex-one-sterilizer-process', { method: 'POST', body: JSON.stringify(data) })
export const updateFlexOneSteriliserProcess = (data: FlexOneSteriliserProcess) => 
  apiRequest<FlexOneSteriliserProcess>('/flex-one-sterilizer-process', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteFlexOneSteriliserProcess = (id: string) => 
  apiRequest<void>(`/flex-one-sterilizer-process/${id}`, { method: 'DELETE' })

// Flex 1 Steriliser Process Product APIs
export const getFlexOneSteriliserProcessProducts = async () => {
  try {
    const res = await apiRequest<any>('/flex-one-sterilizer-process/product')
    return Array.isArray(res) ? (res as FlexOneSteriliserProcessProduct[]) : ((res?.data ?? []) as FlexOneSteriliserProcessProduct[])
  } catch (error: any) {
    console.error('Error fetching flex one steriliser process products:', error)
    return []
  }
}

export const createFlexOneSteriliserProcessProduct = (data: Omit<FlexOneSteriliserProcessProduct, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<FlexOneSteriliserProcessProduct>('/flex-one-sterilizer-process/product', { method: 'POST', body: JSON.stringify(data) })
export const updateFlexOneSteriliserProcessProduct = (data: FlexOneSteriliserProcessProduct) => 
  apiRequest<FlexOneSteriliserProcessProduct>('/flex-one-sterilizer-process/product', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteFlexOneSteriliserProcessProduct = (id: string) => 
  apiRequest<void>(`/flex-one-sterilizer-process/product/${id}`, { method: 'DELETE' })

// Flex 1 Steriliser Process Water Stream APIs
export const getFlexOneSteriliserProcessWaterStreams = async () => {
  try {
    const res = await apiRequest<any>('/flex-one-sterilizer-process/water-stream')
    return Array.isArray(res) ? (res as FlexOneSteriliserProcessWaterStream[]) : ((res?.data ?? []) as FlexOneSteriliserProcessWaterStream[])
  } catch (error: any) {
    console.error('Error fetching flex one steriliser process water streams:', error)
    return []
  }
}

export const createFlexOneSteriliserProcessWaterStream = (data: Omit<FlexOneSteriliserProcessWaterStream, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<FlexOneSteriliserProcessWaterStream>('/flex-one-sterilizer-process/water-stream', { method: 'POST', body: JSON.stringify(data) })
export const updateFlexOneSteriliserProcessWaterStream = (data: FlexOneSteriliserProcessWaterStream) => 
  apiRequest<FlexOneSteriliserProcessWaterStream>('/flex-one-sterilizer-process/water-stream', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteFlexOneSteriliserProcessWaterStream = (id: string) => 
  apiRequest<void>(`/flex-one-sterilizer-process/water-stream/${id}`, { method: 'DELETE' })

// Filler Log 2 Types
export interface FillerLog2 {
  id?: string
  created_at?: string
  date: string
  sku: string
  machine_id: string
  shift: string
  packages_counter: number
  product_counter: number
  filler_waste: number
  operator_id: string
  operator_id_signature: string
  flat_packs: number
  shift_handling_waste: string
  inline_damages: string
  counted_waste: string
  supervisor_id: string
  supervisor_id_signature: string
  shift_comment: string
  shift_technician_id: string
  shift_technician_id_signature: string
  updated_at?: string
  // Foreign key relationships
  filler_log_2_machine_id_fkey?: any
  filler_log_2_operator_id_fkey?: any
  filler_log_2_supervisor_id_fkey?: any
  filler_log_2_shift_technician_id_fkey?: any
}

export interface FillerLog2PackageIntegrity {
  id?: string
  created_at?: string
  filler_log_2_id: string
  time: string
  target: number
  updated_at?: string
  // Foreign key relationships
  filler_log_2_package_integrity_filler_log_2_id_fkey?: FillerLog2
}

export interface FillerLog2PackageIntegrityParameters {
  id?: string
  created_at?: string
  filler_log_2_package_integrity_id: string
  time: string
  category_name: string
  updated_at?: string
  // Foreign key relationships
  filler_log_2_package_integrit_filler_log_2_package_integri_fkey?: FillerLog2PackageIntegrity
}

export interface FillerLog2ProcessControl {
  id?: string
  created_at?: string
  filler_log_2_id: string
  time: string
  target: number
  updated_at?: string
  // Foreign key relationships
  filler_log_2_process_control_filler_log_2_id_fkey?: FillerLog2
}

export interface FillerLog2ProcessControlParameters {
  id?: string
  created_at?: string
  filler_log_2_process_control_id: string
  parameter_name: string
  updated_at?: string
  // Foreign key relationships
  filler_log_2_process_control__filler_log_2_process_control_fkey?: FillerLog2ProcessControl
}

export interface FillerLog2PMSplice {
  id?: string
  created_at?: string
  filler_log_2_id: string
  time: string
  p_order: string
  packs_rejected: number
  lane_number: number
  updated_at?: string
  // Foreign key relationships
  filler_log_2_pm_splice_filler_log_2_id_fkey?: FillerLog2
}

export interface FillerLog2PrepAndSterilization {
  id?: string
  created_at?: string
  filler_log_2_id: string
  preparation_start: string
  preparation_end: string
  sterilization_start: string
  sterilization_end: string
  updated_at?: string
  // Foreign key relationships
  filler_log_2_prep_and_sterilization_filler_log_2_id_fkey?: FillerLog2
}

export interface FillerLog2StoppagesLog {
  id?: string
  created_at?: string
  filler_log_2_id: string
  start: string
  stop: string
  reason_for_stoppage: string
  updated_at?: string
  // Foreign key relationships
  filler_log_2_stoppages_log_filler_log_2_id_fkey?: FillerLog2
}

export interface FillerLog2StripSplice {
  id?: string
  created_at?: string
  filler_log_2_id: string
  time: string
  p_order: string
  packs_rejected: number
  lane_number: number
  updated_at?: string
  // Foreign key relationships
  filler_log_2_strip_splice_filler_log_2_id_fkey?: FillerLog2
}

// Filler Log 2 Package Integrity Parameters APIs
export const createFillerLog2PackageIntegrityParameters = (data: Omit<FillerLog2PackageIntegrityParameters, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<FillerLog2PackageIntegrityParameters>('/filler-log-2/package-integrity/parameters', { method: 'POST', body: JSON.stringify(data) })
export const updateFillerLog2PackageIntegrityParameters = (data: FillerLog2PackageIntegrityParameters) => 
  apiRequest<FillerLog2PackageIntegrityParameters>('/filler-log-2/package-integrity/parameters', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteFillerLog2PackageIntegrityParameters = (id: string) => 
  apiRequest<void>(`/filler-log-2/package-integrity/parameters/${id}`, { method: 'DELETE' })

// Filler Log 2 PM Splice APIs
export const getFillerLog2PMSplices = async () => {
  try {
    const response = await apiRequest<FillerLog2PMSplice[]>('/filler-log-2/pm-splice', { method: 'GET' })
    return response
  } catch (error) {
    console.error('Error fetching filler log 2 pm splices:', error)
    return []
  }
}

export const getFillerLog2PMSplice = (id: string) => 
  apiRequest<FillerLog2PMSplice>(`/filler-log-2/pm-splice/${id}`, { method: 'GET' })

export const createFillerLog2PMSplice = (data: Omit<FillerLog2PMSplice, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<FillerLog2PMSplice>('/filler-log-2/pm-splice', { method: 'POST', body: JSON.stringify(data) })
export const updateFillerLog2PMSplice = (data: FillerLog2PMSplice) => 
  apiRequest<FillerLog2PMSplice>('/filler-log-2/pm-splice', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteFillerLog2PMSplice = (id: string) => 
  apiRequest<void>(`/filler-log-2/pm-splice/${id}`, { method: 'DELETE' })

// Filler Log 2 Prep and Sterilization APIs
export const getFillerLog2PrepAndSterilizations = async () => {
  try {
    const response = await apiRequest<FillerLog2PrepAndSterilization[]>('/filler-log-2/prep-and-sterilization', { method: 'GET' })
    return response
  } catch (error) {
    console.error('Error fetching filler log 2 prep and sterilizations:', error)
    return []
  }
}

export const getFillerLog2PrepAndSterilization = (id: string) => 
  apiRequest<FillerLog2PrepAndSterilization>(`/filler-log-2/prep-and-sterilization/${id}`, { method: 'GET' })

export const createFillerLog2PrepAndSterilization = (data: Omit<FillerLog2PrepAndSterilization, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<FillerLog2PrepAndSterilization>('/filler-log-2/prep-and-sterilization', { method: 'POST', body: JSON.stringify(data) })
export const updateFillerLog2PrepAndSterilization = (data: FillerLog2PrepAndSterilization) => 
  apiRequest<FillerLog2PrepAndSterilization>('/filler-log-2/prep-and-sterilization', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteFillerLog2PrepAndSterilization = (id: string) => 
  apiRequest<void>(`/filler-log-2/prep-and-sterilization/${id}`, { method: 'DELETE' })

// Filler Log 2 Stoppages Log APIs
export const getFillerLog2StoppagesLogs = async () => {
  try {
    const response = await apiRequest<FillerLog2StoppagesLog[]>('/filler-log-2/stoppages-log', { method: 'GET' })
    return response
  } catch (error) {
    console.error('Error fetching filler log 2 stoppages logs:', error)
    return []
  }
}

export const getFillerLog2StoppagesLog = (id: string) => 
  apiRequest<FillerLog2StoppagesLog>(`/filler-log-2/stoppages-log/${id}`, { method: 'GET' })

export const createFillerLog2StoppagesLog = (data: Omit<FillerLog2StoppagesLog, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<FillerLog2StoppagesLog>('/filler-log-2/stoppages-log', { method: 'POST', body: JSON.stringify(data) })
export const updateFillerLog2StoppagesLog = (data: FillerLog2StoppagesLog) => 
  apiRequest<FillerLog2StoppagesLog>('/filler-log-2/stoppages-log', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteFillerLog2StoppagesLog = (id: string) => 
  apiRequest<void>(`/filler-log-2/stoppages-log/${id}`, { method: 'DELETE' })

// Filler Log 2 Strip Splice APIs
export const getFillerLog2StripSplices = async () => {
  try {
    const response = await apiRequest<FillerLog2StripSplice[]>('/filler-log-2/strip-splice', { method: 'GET' })
    return response
  } catch (error) {
    console.error('Error fetching filler log 2 strip splices:', error)
    return []
  }
}

export const getFillerLog2StripSplice = (id: string) => 
  apiRequest<FillerLog2StripSplice>(`/filler-log-2/strip-splice/${id}`, { method: 'GET' })

export const createFillerLog2StripSplice = (data: Omit<FillerLog2StripSplice, 'id' | 'created_at' | 'updated_at'>) => 
  apiRequest<FillerLog2StripSplice>('/filler-log-2/strip-splice', { method: 'POST', body: JSON.stringify(data) })
export const updateFillerLog2StripSplice = (data: FillerLog2StripSplice) => 
  apiRequest<FillerLog2StripSplice>('/filler-log-2/strip-splice', { method: 'PATCH', body: JSON.stringify(data) })
export const deleteFillerLog2StripSplice = (id: string) => 
  apiRequest<void>(`/filler-log-2/strip-splice/${id}`, { method: 'DELETE' })
