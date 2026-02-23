import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

// New data structure for raw-milk-intake-2
export interface RawMilkIntakeDetail {
  id?: string
  status: string
  quantity: number
  silo_name: string
  created_at?: string
  updated_at?: string | null
  flow_meter_end: string
  flow_meter_start: string
  flow_meter_end_reading: number
  flow_meter_start_reading: number
  truck_compartment_number: number
  raw_milk_intake_form_2_id?: string
}

export interface RawMilkIntakeForm {
  id: string
  created_at: string
  updated_at: string | null
  operator: string  // Operator ID
  truck: string     // Truck name
  updated_by: string | null
  tag: string
  details: RawMilkIntakeDetail[]
}

// Truck pending intake from /raw-milk-intake-2/trucks
export interface VoucherContribution {
  volume: number
  voucher_tag: string
  voucher_date: string
  supplier_tank: string
  supplier_last_name: string
  supplier_first_name: string
}

export interface TruckPendingIntake {
  truck_number: string
  truck_compartment_number: number
  total_compartment_volume: number
  voucher_contributions: VoucherContribution[]
}

// Create/Update request structure
export interface CreateRawMilkIntakeFormRequest {
  id?: string
  operator: string
  truck: string
  details: Omit<RawMilkIntakeDetail, 'id' | 'created_at' | 'updated_at' | 'raw_milk_intake_form_2_id'>[]
}

// Legacy types (kept for backward compatibility during migration)
export interface RawMaterialSample {
  supplier_id: string
  amount_collected: number
  unit_of_measure: string
  serial_no: string
}

export interface RawMilkIntakePendingVoucher {
  id: string
  tag: string
  date: string
  route: string
  supplier: string
  truck_number: string
  truck_compartment_number: number
  driver: string
  driver_first_name: string
  driver_last_name: string
  driver_signature: string
  time_in: string
  time_out: string
  ot_result: string | null
  cob_result: string | null
  remark: string | null
  lab_test: any | null
  number_of_compartments: number | null
  route_total: number | null
  created_at: string
  updated_at: string
}

export const rawMilkIntakeApi = {
  // Get all raw milk intake forms
  getAll: async (params: {
    filters?: Record<string, any>
  } = {}) => {
    const { filters } = params

    if (!filters || Object.keys(filters).length === 0) {
      return apiRequest<ApiResponse<RawMilkIntakeForm[]>>('/raw-milk-intake-2')
    }

    const queryParams = new URLSearchParams(filters as Record<string, string>)
    const endpoint = `/raw-milk-intake-2?${queryParams.toString()}`

    return apiRequest<ApiResponse<RawMilkIntakeForm[]>>(endpoint)
  },

  // Get single form by ID
  getById: async (id: string) => {
    return apiRequest<ApiResponse<RawMilkIntakeForm>>(`/raw-milk-intake-2/${id}`)
  },

  // Get trucks pending intake
  getTrucks: async () => {
    return apiRequest<ApiResponse<TruckPendingIntake[]>>('/raw-milk-intake-2/trucks')
  },

  // Get vouchers pending transfer (legacy - kept for backward compatibility)
  getVouchersPendingTransfer: async () => {
    return apiRequest<ApiResponse<RawMilkIntakePendingVoucher[]>>('/raw-milk-intake-form/vouchers-pending-transfer')
  },

  // Create new form
  create: async (formData: CreateRawMilkIntakeFormRequest) => {
    return apiRequest<ApiResponse<RawMilkIntakeForm>>('/raw-milk-intake-2', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
  },

  // Update form
  update: async (formData: CreateRawMilkIntakeFormRequest) => {
    if (!formData.id) throw new Error('Form ID is required for update')
    return apiRequest<ApiResponse<RawMilkIntakeForm>>(`/raw-milk-intake-2`, {
      method: 'PATCH',
      body: JSON.stringify(formData),
    })
  },

  // Delete form
  delete: async (id: string) => {
    return apiRequest<ApiResponse<null>>(`/raw-milk-intake-2/${id}`, {
      method: 'DELETE',
    })
  }
}
