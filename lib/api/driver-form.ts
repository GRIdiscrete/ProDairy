import type { DriverForm, DriverFormCollectedProduct, TableFilters } from "@/lib/types"
import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export interface ApiEnvelope<T> {
  statusCode: number
  message: string
  data: T
}

export interface CreateDriverFormRequest {
  driver: string
  start_date: string
  end_date: string
  drivers_form_collected_products: DriverFormCollectedProduct[]
  delivered: boolean
  rejected: boolean
}

export interface UpdateDriverFormRequest {
  id: string
  driver: string
  start_date: string
  end_date: string
  drivers_form_collected_products: DriverFormCollectedProduct[]
  delivered: boolean
  rejected: boolean
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
      driver: formData.driver,
      start_date: formData.start_date,
      end_date: formData.end_date,
      delivered: formData.delivered,
      rejected: formData.rejected,
      drivers_form_collected_products: formData.drivers_form_collected_products,
    }
    
    return apiRequest<ApiEnvelope<DriverForm>>(API_CONFIG.ENDPOINTS.DRIVER_FORMS, {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  },

  // Update existing driver form
  async updateDriverForm(formData: UpdateDriverFormRequest): Promise<ApiEnvelope<DriverForm>> {
    const requestData = {
      id: formData.id,
      driver: formData.driver,
      start_date: formData.start_date,
      end_date: formData.end_date,
      delivered: formData.delivered,
      rejected: formData.rejected,
      updated_at: formData.updated_at,
      drivers_form_collected_products: formData.drivers_form_collected_products,
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
