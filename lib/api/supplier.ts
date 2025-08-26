import type { ApiResponse, Supplier, TableFilters } from "@/lib/types"
import { apiRequest, API_CONFIG } from '../config/api'

export const supplierApi = {
  // Get all suppliers
  async getSuppliers(params: {
    filters?: TableFilters
  } = {}): Promise<ApiResponse<Supplier[]>> {
    return apiRequest<ApiResponse<Supplier[]>>(API_CONFIG.ENDPOINTS.SUPPLIERS)
  },

  // Get single supplier by ID
  async getSupplier(id: string): Promise<ApiResponse<Supplier>> {
    return apiRequest<ApiResponse<Supplier>>(`${API_CONFIG.ENDPOINTS.SUPPLIERS}/${id}`)
  },

  // Create new supplier
  async createSupplier(supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Supplier>> {
    const requestData = {
      ...supplierData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    return apiRequest<ApiResponse<Supplier>>(API_CONFIG.ENDPOINTS.SUPPLIERS, {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  },

  // Update existing supplier
  async updateSupplier(supplierData: Supplier): Promise<ApiResponse<Supplier>> {
    const requestData = {
      ...supplierData,
      updated_at: new Date().toISOString(),
    }
    
    return apiRequest<ApiResponse<Supplier>>(API_CONFIG.ENDPOINTS.SUPPLIERS, {
      method: 'PATCH',
      body: JSON.stringify(requestData),
    })
  },

  // Delete supplier
  async deleteSupplier(id: string): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>(`${API_CONFIG.ENDPOINTS.SUPPLIERS}/${id}`, {
      method: 'DELETE',
    })
  },
}