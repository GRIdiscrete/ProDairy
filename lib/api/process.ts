import type { Process, TableFilters } from "@/lib/types"
import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export interface ApiEnvelope<T> {
  statusCode: number
  message: string
  data: T
}

export interface CreateProcessRequest {
  name: string
  raw_material_ids: string[]
}

export interface UpdateProcessRequest extends CreateProcessRequest {
  id: string
  created_at: string
  updated_at: string
}

export const processApi = {
  // Get all processes
  async getProcesses(params: {
    filters?: TableFilters
  } = {}): Promise<ApiEnvelope<Process[]>> {
    return apiRequest<ApiEnvelope<Process[]>>(API_CONFIG.ENDPOINTS.PROCESSES)
  },

  // Get single process by ID
  async getProcess(id: string): Promise<ApiEnvelope<Process>> {
    return apiRequest<ApiEnvelope<Process>>(`${API_CONFIG.ENDPOINTS.PROCESSES}/${id}`)
  },

  // Create new process
  async createProcess(processData: CreateProcessRequest): Promise<ApiEnvelope<Process>> {
    const requestData = {
      ...processData,
      created_at: new Date().toISOString(),
    }
    
    return apiRequest<ApiEnvelope<Process>>(API_CONFIG.ENDPOINTS.PROCESSES, {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  },

  // Update existing process
  async updateProcess(processData: UpdateProcessRequest): Promise<ApiEnvelope<Process>> {
    const requestData = {
      ...processData,
      updated_at: new Date().toISOString(),
    }
    
    return apiRequest<ApiEnvelope<Process>>(API_CONFIG.ENDPOINTS.PROCESSES, {
      method: 'PATCH',
      body: JSON.stringify(requestData),
    })
  },

  // Delete process
  async deleteProcess(id: string): Promise<ApiEnvelope<null>> {
    return apiRequest<ApiEnvelope<null>>(`${API_CONFIG.ENDPOINTS.PROCESSES}/${id}`, {
      method: 'DELETE',
    })
  },
}
