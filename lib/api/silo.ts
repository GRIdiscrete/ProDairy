import type { ApiResponse, Silo, TableFilters } from "@/lib/types"
import { apiRequest, API_CONFIG } from '../config/api'

export const siloApi = {
  // Get all silos
  async getSilos(params: {
    filters?: TableFilters
  } = {}): Promise<ApiResponse<Silo[]>> {
    return apiRequest<ApiResponse<Silo[]>>(API_CONFIG.ENDPOINTS.SILOS)
  },

  // Get single silo by ID
  async getSilo(id: string): Promise<ApiResponse<Silo>> {
    return apiRequest<ApiResponse<Silo>>(`${API_CONFIG.ENDPOINTS.SILOS}/${id}`)
  },

  // Create new silo
  async createSilo(siloData: Omit<Silo, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Silo>> {
    const requestData = {
      ...siloData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    return apiRequest<ApiResponse<Silo>>(API_CONFIG.ENDPOINTS.SILOS, {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  },

  // Update existing silo
  async updateSilo(siloData: Silo): Promise<ApiResponse<Silo>> {
    const requestData = {
      ...siloData,
      updated_at: new Date().toISOString(),
    }
    
    return apiRequest<ApiResponse<Silo>>(API_CONFIG.ENDPOINTS.SILOS, {
      method: 'PATCH',
      body: JSON.stringify(requestData),
    })
  },

  // Delete silo
  async deleteSilo(id: string): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>(`${API_CONFIG.ENDPOINTS.SILOS}/${id}`, {
      method: 'DELETE',
    })
  },
}
