import type { ApiResponse, Silo, TableFilters } from "@/lib/types"
import { apiRequest, API_CONFIG } from '../config/api'

export const siloApi = {
  // Get all silos with optional filters
  async getSilos(params: {
    filters?: TableFilters
  } = {}): Promise<ApiResponse<Silo[]>> {
    const { filters } = params
    
    // If no filters, use the regular endpoint
    if (!filters || Object.keys(filters).length === 0) {
      return apiRequest<ApiResponse<Silo[]>>(API_CONFIG.ENDPOINTS.SILOS)
    }
    
    // Build query parameters for filter endpoint
    const queryParams = new URLSearchParams()
    
    // Map common filters to API parameters
    if (filters.search) {
      queryParams.append('name', filters.search)
    }
    if (filters.status) {
      queryParams.append('status', filters.status)
    }
    if (filters.location) {
      queryParams.append('location', filters.location)
    }
    if (filters.capacity) {
      queryParams.append('capacity', filters.capacity)
    }
    if (filters.dateRange?.from) {
      queryParams.append('created_after', filters.dateRange.from)
    }
    if (filters.dateRange?.to) {
      queryParams.append('created_before', filters.dateRange.to)
    }
    
    // Add any other custom filters
    Object.keys(filters).forEach(key => {
      if (!['search', 'status', 'location', 'capacity', 'dateRange'].includes(key) && filters[key]) {
        queryParams.append(key, filters[key])
      }
    })
    
    const endpoint = queryParams.toString() 
      ? `${API_CONFIG.ENDPOINTS.SILOS}/filter?${queryParams.toString()}`
      : API_CONFIG.ENDPOINTS.SILOS
      
    return apiRequest<ApiResponse<Silo[]>>(endpoint)
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
