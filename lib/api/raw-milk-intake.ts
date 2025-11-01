import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export interface RawMilkIntakeSample {
  supplier_id: string
  amount_collected: number
  unit_of_measure: string
  serial_no: string
}

export interface CreateRawMilkIntakeFormRequest {
  operator_id: string
  operator_signature: string
  date: string
  quantity_received: number
  drivers_form_id: string
  destination_silo_name: string
  status: string
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

  // Create new form
  create: async (formData: CreateRawMilkIntakeFormRequest) => {
    return apiRequest<ApiResponse<RawMilkIntakeForm>>('/raw-milk-intake-form', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
  },

  // Update form
  update: async (id: string, formData: reateRawMilkIntakeFormRequest) => {
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
