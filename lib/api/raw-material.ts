import type { ApiResponse, RawMaterial, TableFilters } from "@/lib/types"
import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export const rawMaterialApi = {
  // Get all raw materials with optional filters
  async getRawMaterials(params: {
    filters?: TableFilters
  } = {}): Promise<ApiResponse<RawMaterial[]>> {
    const { filters } = params
    
    // If no filters, use the regular endpoint
    if (!filters || Object.keys(filters).length === 0) {
      return apiRequest<ApiResponse<RawMaterial[]>>(API_CONFIG.ENDPOINTS.RAW_MATERIALS)
    }
    
    // Build query parameters for filter endpoint
    const queryParams = new URLSearchParams()
    
    // Map common filters to API parameters
    if (filters.search) {
      queryParams.append('name', filters.search)
    }
    if (filters.category) {
      queryParams.append('category', filters.category)
    }
    if (filters.supplier) {
      queryParams.append('supplier', filters.supplier)
    }
    if (filters.status) {
      queryParams.append('status', filters.status)
    }
    if (filters.dateRange?.from) {
      queryParams.append('created_after', filters.dateRange.from)
    }
    if (filters.dateRange?.to) {
      queryParams.append('created_before', filters.dateRange.to)
    }
    
    // Add any other custom filters
    Object.keys(filters).forEach(key => {
      if (!['search', 'category', 'supplier', 'status', 'dateRange'].includes(key) && filters[key]) {
        queryParams.append(key, filters[key])
      }
    })
    
    const endpoint = queryParams.toString() 
      ? `${API_CONFIG.ENDPOINTS.RAW_MATERIALS}/filter?${queryParams.toString()}`
      : API_CONFIG.ENDPOINTS.RAW_MATERIALS
      
    return apiRequest<ApiResponse<RawMaterial[]>>(endpoint)
  },

  // Get single raw material by ID
  async getRawMaterial(id: string): Promise<ApiResponse<RawMaterial>> {
    return apiRequest<ApiResponse<RawMaterial>>(`${API_CONFIG.ENDPOINTS.RAW_MATERIALS}/${id}`)
  },

  // Create new raw material
  async createRawMaterial(rawMaterialData: Omit<RawMaterial, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<RawMaterial>> {
    const requestData = {
      ...rawMaterialData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    return apiRequest<ApiResponse<RawMaterial>>(API_CONFIG.ENDPOINTS.RAW_MATERIALS, {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  },

  // Update existing raw material
  async updateRawMaterial(rawMaterialData: RawMaterial): Promise<ApiResponse<RawMaterial>> {
    const requestData = {
      ...rawMaterialData,
      updated_at: new Date().toISOString(),
    }
    
    return apiRequest<ApiResponse<RawMaterial>>(API_CONFIG.ENDPOINTS.RAW_MATERIALS, {
      method: 'PATCH',
      body: JSON.stringify(requestData),
    })
  },

  // Delete raw material
  async deleteRawMaterial(id: string): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>(`${API_CONFIG.ENDPOINTS.RAW_MATERIALS}/${id}`, {
      method: 'DELETE',
    })
  },
}
