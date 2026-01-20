import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

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

export interface CreateRawMilkIntakeFormRequest {
  collection_voucher_id: string
  truck_compartment_number: number
  operator_id: string
  operator_signature: string
  driver_signature: string
  date: string
  quantity_received: number
  destination_silo_name: string
  destination_silo_id?: string
  drivers_form_id?: string
  status: string
  tag: string
  updated_at?: string
  id?: string | null
}

export interface RawMilkIntakeForm extends CreateRawMilkIntakeFormRequest {
  id: string
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
      return apiRequest<ApiResponse<RawMilkIntakeForm[]>>('/raw-milk-intake-form')
    }

    const queryParams = new URLSearchParams(filters as Record<string, string>)
    const endpoint = `/raw-milk-intake-form?${queryParams.toString()}`

    return apiRequest<ApiResponse<RawMilkIntakeForm[]>>(endpoint)
  },

  // Get single form by ID
  getById: async (id: string) => {
    return apiRequest<ApiResponse<RawMilkIntakeForm>>(`/raw-milk-intake-form/${id}`)
  },

  // Get vouchers pending transfer
  getVouchersPendingTransfer: async () => {
    return apiRequest<ApiResponse<RawMilkIntakePendingVoucher[]>>('/raw-milk-intake-form/vouchers-pending-transfer')
  },

  // Create new form
  create: async (formData: CreateRawMilkIntakeFormRequest) => {
    return apiRequest<ApiResponse<RawMilkIntakeForm>>('/raw-milk-intake-form', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
  },

  // Update form
  update: async (id: string, formData: CreateRawMilkIntakeFormRequest) => {
    return apiRequest<ApiResponse<RawMilkIntakeForm>>(`/raw-milk-intake-form`, {
      method: 'PATCH',
      body: JSON.stringify(formData),
    })
  },

  // Delete form
  delete: async (id: string) => {
    return apiRequest<ApiResponse<null>>(`/raw-milk-intake-form/${id}`, {
      method: 'DELETE',
    })
  }
}
