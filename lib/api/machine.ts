import type { ApiResponse, Machine, TableFilters } from "@/lib/types"
import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export const machineApi = {
  // Get all machines with optional filters
  async getMachines(params: {
    filters?: TableFilters
  } = {}): Promise<ApiResponse<Machine[]>> {
    const { filters } = params
    
    // If no filters, use the regular endpoint
    if (!filters || Object.keys(filters).length === 0) {
      return apiRequest<ApiResponse<Machine[]>>(API_CONFIG.ENDPOINTS.MACHINES)
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
    if (filters.category) {
      queryParams.append('category', filters.category)
    }
    if (filters.location) {
      queryParams.append('location', filters.location)
    }
    if (filters.serial_number) {
      queryParams.append('serial_number', filters.serial_number)
    }
    if (filters.dateRange?.from) {
      queryParams.append('created_after', filters.dateRange.from)
    }
    if (filters.dateRange?.to) {
      queryParams.append('created_before', filters.dateRange.to)
    }
    
    // Add any other custom filters
    Object.keys(filters).forEach(key => {
      if (!['search', 'status', 'category', 'location', 'serial_number', 'dateRange'].includes(key) && filters[key]) {
        queryParams.append(key, filters[key])
      }
    })
    
    const endpoint = queryParams.toString() 
      ? `${API_CONFIG.ENDPOINTS.MACHINES}/filter?${queryParams.toString()}`
      : API_CONFIG.ENDPOINTS.MACHINES
      
    return apiRequest<ApiResponse<Machine[]>>(endpoint)
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