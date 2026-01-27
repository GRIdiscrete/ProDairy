import type { ApiResponse, Supplier, TableFilters } from "@/lib/types"
import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export const supplierApi = {
  // Get all suppliers with optional filters
  async getSuppliers(params: {
    filters?: TableFilters
  } = {}): Promise<ApiResponse<Supplier[]>> {
    const { filters } = params

    // If no filters, use the regular endpoint
    if (!filters || Object.keys(filters).length === 0) {
      return apiRequest<ApiResponse<Supplier[]>>(API_CONFIG.ENDPOINTS.SUPPLIERS)
    }

    // Build query parameters for filter endpoint
    const queryParams = new URLSearchParams()

    // Map common filters to API parameters
    if (filters.search) {
      queryParams.append('first_name', filters.search)
    }
    if (filters.first_name) {
      queryParams.append('first_name', filters.first_name)
    }
    if (filters.last_name) {
      queryParams.append('last_name', filters.last_name)
    }
    if (filters.email) {
      queryParams.append('email', filters.email)
    }
    if (filters.phone_number) {
      queryParams.append('phone_number', filters.phone_number)
    }
    if (filters.dateRange?.from) {
      queryParams.append('created_after', filters.dateRange.from)
    }
    if (filters.dateRange?.to) {
      queryParams.append('created_before', filters.dateRange.to)
    }

    // Add any other custom filters
    Object.keys(filters).forEach(key => {
      if (!['search', 'first_name', 'last_name', 'email', 'phone_number', 'dateRange'].includes(key) && filters[key]) {
        queryParams.append(key, filters[key])
      }
    })

    const endpoint = queryParams.toString()
      ? `${API_CONFIG.ENDPOINTS.SUPPLIERS}/filter?${queryParams.toString()}`
      : API_CONFIG.ENDPOINTS.SUPPLIERS

    return apiRequest<ApiResponse<Supplier[]>>(endpoint)
  },

  // Get single supplier by ID
  async getSupplier(id: string): Promise<ApiResponse<Supplier>> {
    return apiRequest<ApiResponse<Supplier>>(`${API_CONFIG.ENDPOINTS.SUPPLIERS}/${id}`)
  },

  // Create new supplier
  async createSupplier(supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Supplier>> {
    return apiRequest<ApiResponse<Supplier>>(API_CONFIG.ENDPOINTS.SUPPLIERS, {
      method: 'POST',
      body: JSON.stringify(supplierData),
    })
  },

  // Update existing supplier
  async updateSupplier(supplierData: Supplier): Promise<ApiResponse<Supplier>> {
    // Map suppliers_tanks to tanks for the update payload as per requested structure
    const { suppliers_tanks, tanks, ...rest } = supplierData
    const requestData = {
      ...rest,
      tanks: tanks || suppliers_tanks
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