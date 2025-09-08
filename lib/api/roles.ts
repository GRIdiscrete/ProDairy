import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'
import { 
  UserRole, 
  CreateRoleRequest, 
  UpdateRoleRequest, 
  RolesResponse, 
  RoleResponse, 
  DeleteRoleResponse 
} from '../types/roles'
import type { TableFilters } from "@/lib/types"

export const rolesApi = {
  // Get all user roles with optional filters
  getRoles: async (params: {
    filters?: TableFilters
  } = {}): Promise<RolesResponse> => {
    const { filters } = params
    
    // If no filters, use the regular endpoint
    if (!filters || Object.keys(filters).length === 0) {
      return apiRequest<RolesResponse>(API_CONFIG.ENDPOINTS.USER_ROLES)
    }
    
    // Build query parameters for filter endpoint
    const queryParams = new URLSearchParams()
    
    // Map common filters to API parameters
    if (filters.search) {
      queryParams.append('role_name', filters.search)
    }
    if (filters.description) {
      queryParams.append('description', filters.description)
    }
    if (filters.dateRange?.from) {
      queryParams.append('created_after', filters.dateRange.from)
    }
    if (filters.dateRange?.to) {
      queryParams.append('created_before', filters.dateRange.to)
    }
    
    // Add any other custom filters
    Object.keys(filters).forEach(key => {
      if (!['search', 'description', 'dateRange'].includes(key) && filters[key]) {
        queryParams.append(key, filters[key])
      }
    })
    
    const endpoint = queryParams.toString() 
      ? `${API_CONFIG.ENDPOINTS.USER_ROLES}/filter?${queryParams.toString()}`
      : API_CONFIG.ENDPOINTS.USER_ROLES
      
    return apiRequest<RolesResponse>(endpoint)
  },

  // Get single user role by ID
  getRole: async (id: string): Promise<RoleResponse> => {
    return apiRequest<RoleResponse>(`${API_CONFIG.ENDPOINTS.USER_ROLES}/${id}`)
  },

  // Create new user role
  createRole: async (roleData: CreateRoleRequest): Promise<RoleResponse> => {
    return apiRequest<RoleResponse>(API_CONFIG.ENDPOINTS.USER_ROLES, {
      method: 'POST',
      body: JSON.stringify(roleData),
    })
  },

  // Update existing user role
  updateRole: async (roleData: UpdateRoleRequest): Promise<RoleResponse> => {
    return apiRequest<RoleResponse>(API_CONFIG.ENDPOINTS.USER_ROLES, {
      method: 'PATCH',
      body: JSON.stringify(roleData),
    })
  },

  // Delete user role
  deleteRole: async (id: string): Promise<DeleteRoleResponse> => {
    return apiRequest<DeleteRoleResponse>(`${API_CONFIG.ENDPOINTS.USER_ROLES}/${id}`, {
      method: 'DELETE',
    })
  },
}
