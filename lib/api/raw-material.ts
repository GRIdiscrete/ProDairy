import type { ApiResponse, RawMaterial, TableFilters } from "@/lib/types"
import { apiRequest, API_CONFIG } from '../config/api'

export const rawMaterialApi = {
  // Get all raw materials
  async getRawMaterials(params: {
    filters?: TableFilters
  } = {}): Promise<ApiResponse<RawMaterial[]>> {
    return apiRequest<ApiResponse<RawMaterial[]>>(API_CONFIG.ENDPOINTS.RAW_MATERIALS)
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
