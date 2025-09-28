import { apiRequest } from "@/lib/utils/api-request"
import { Silo } from "@/lib/types"

export interface ApiEnvelope<T> {
  statusCode: number
  message: string
  data: T
}

export const silosApi = {
  // Get all silos
  async getSilos(params: {
    filters?: { search?: string }
  } = {}): Promise<ApiEnvelope<Silo[]>> {
    const { filters } = params
    
    // Build query parameters
    const queryParams = new URLSearchParams()
    
    if (filters?.search) {
      queryParams.append('search', filters.search)
    }
    
    const queryString = queryParams.toString()
    const endpoint = queryString ? `/silo?${queryString}` : '/silo'
    
    return apiRequest<ApiEnvelope<Silo[]>>(endpoint, {
      method: 'GET',
    })
  },

  // Get silo by ID
  async getSilo(id: string): Promise<ApiEnvelope<Silo>> {
    return apiRequest<ApiEnvelope<Silo>>(`/silo/${id}`, {
      method: 'GET',
    })
  },

  // Create new silo
  async createSilo(data: Partial<Silo>): Promise<ApiEnvelope<Silo>> {
    return apiRequest<ApiEnvelope<Silo>>('/silo', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update silo
  async updateSilo(id: string, data: Partial<Silo>): Promise<ApiEnvelope<Silo>> {
    return apiRequest<ApiEnvelope<Silo>>(`/silo/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // Delete silo
  async deleteSilo(id: string): Promise<ApiEnvelope<void>> {
    return apiRequest<ApiEnvelope<void>>(`/silo/${id}`, {
      method: 'DELETE',
    })
  },
}
