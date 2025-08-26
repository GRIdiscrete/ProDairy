import type { ApiResponse, Machine, TableFilters } from "@/lib/types"
import { apiRequest, API_CONFIG } from '../config/api'

export const machineApi = {
  // Get all machines
  async getMachines(params: {
    filters?: TableFilters
  } = {}): Promise<ApiResponse<Machine[]>> {
    return apiRequest<ApiResponse<Machine[]>>(API_CONFIG.ENDPOINTS.MACHINES)
  },

  // Get single machine by ID
  async getMachine(id: string): Promise<ApiResponse<Machine>> {
    return apiRequest<ApiResponse<Machine>>(`${API_CONFIG.ENDPOINTS.MACHINES}/${id}`)
  },

  // Create new machine
  async createMachine(machineData: Omit<Machine, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Machine>> {
    const requestData = {
      ...machineData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    return apiRequest<ApiResponse<Machine>>(API_CONFIG.ENDPOINTS.MACHINES, {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  },

  // Update existing machine
  async updateMachine(machineData: Machine): Promise<ApiResponse<Machine>> {
    const requestData = {
      ...machineData,
      updated_at: new Date().toISOString(),
    }
    
    return apiRequest<ApiResponse<Machine>>(API_CONFIG.ENDPOINTS.MACHINES, {
      method: 'PATCH',
      body: JSON.stringify(requestData),
    })
  },

  // Delete machine
  async deleteMachine(id: string): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>(`${API_CONFIG.ENDPOINTS.MACHINES}/${id}`, {
      method: 'DELETE',
    })
  },
}