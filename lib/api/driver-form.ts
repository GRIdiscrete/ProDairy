import type { DriverForm, DriverFormCollectedProduct, TableFilters } from "@/lib/types"
import { apiRequest, API_CONFIG } from '../config/api'

export interface ApiEnvelope<T> {
  statusCode: number
  message: string
  data: T
}

export interface CreateDriverFormRequest {
  driver: string
  start_date: string
  end_date: string
  collected_products?: DriverFormCollectedProduct[]
  delivered: boolean
  rejected: boolean
}

export interface UpdateDriverFormRequest extends CreateDriverFormRequest {
  id: string
  created_at: string
  updated_at: string
}

export const driverFormApi = {
  // Get all driver forms
  async getDriverForms(params: {
    filters?: TableFilters
  } = {}): Promise<ApiEnvelope<DriverForm[]>> {
    return apiRequest<ApiEnvelope<DriverForm[]>>(API_CONFIG.ENDPOINTS.DRIVER_FORMS)
  },

  // Get single driver form by ID
  async getDriverForm(id: string): Promise<ApiEnvelope<DriverForm>> {
    return apiRequest<ApiEnvelope<DriverForm>>(`${API_CONFIG.ENDPOINTS.DRIVER_FORMS}/${id}`)
  },

  // Create new driver form
  async createDriverForm(formData: CreateDriverFormRequest): Promise<ApiEnvelope<DriverForm>> {
    const requestData = {
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    return apiRequest<ApiEnvelope<DriverForm>>(API_CONFIG.ENDPOINTS.DRIVER_FORMS, {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  },

  // Update existing driver form
  async updateDriverForm(formData: UpdateDriverFormRequest): Promise<ApiEnvelope<DriverForm>> {
    const requestData = {
      ...formData,
      updated_at: new Date().toISOString(),
    }
    
    return apiRequest<ApiEnvelope<DriverForm>>(API_CONFIG.ENDPOINTS.DRIVER_FORMS, {
      method: 'PATCH',
      body: JSON.stringify(requestData),
    })
  },

  // Delete driver form
  async deleteDriverForm(id: string): Promise<ApiEnvelope<null>> {
    return apiRequest<ApiEnvelope<null>>(`${API_CONFIG.ENDPOINTS.DRIVER_FORMS}/${id}`, {
      method: 'DELETE',
    })
  },
}
