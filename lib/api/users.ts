import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'
import type { TableFilters } from "@/lib/types"

export interface CreateUserRequest {
  first_name: string
  last_name: string
  department: string
  email: string
  password: string
  role_id: string
}

export interface UpdateUserRequest extends Omit<CreateUserRequest, 'password'> {
  id: string
  password?: string
}

export interface UserEntity {
  id: string
  created_at: string
  updated_at: string
  role_id: string
  first_name: string
  last_name: string
  email: string
  department: string
  password?: string
}

export interface ApiEnvelope<T> {
  statusCode: number
  message: string
  data: T
}

export const usersApi = {
  createUser: async (payload: CreateUserRequest): Promise<ApiEnvelope<UserEntity>> => {
    return apiRequest<ApiEnvelope<UserEntity>>(API_CONFIG.ENDPOINTS.USERS, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  getUsers: async (params: {
    filters?: TableFilters
  } = {}): Promise<ApiEnvelope<UserEntity[]>> => {
    const { filters } = params
    
    // If no filters, use the regular endpoint
    if (!filters || Object.keys(filters).length === 0) {
      return apiRequest<ApiEnvelope<UserEntity[]>>(API_CONFIG.ENDPOINTS.USERS)
    }
    
    // Build query parameters for filter endpoint
    const queryParams = new URLSearchParams()
    
    // Map common filters to API parameters
    if (filters.search) {
      queryParams.append('first_name', filters.search)
    }
    if (filters.email) {
      queryParams.append('email', filters.email)
    }
    if (filters.department) {
      queryParams.append('department', filters.department)
    }
    if (filters.role_id) {
      queryParams.append('role_id', filters.role_id)
    }
    if (filters.dateRange?.from) {
      queryParams.append('created_after', filters.dateRange.from)
    }
    if (filters.dateRange?.to) {
      queryParams.append('created_before', filters.dateRange.to)
    }
    
    // Add any other custom filters
    Object.keys(filters).forEach(key => {
      if (!['search', 'email', 'department', 'role_id', 'dateRange'].includes(key) && filters[key]) {
        queryParams.append(key, filters[key])
      }
    })
    
    const endpoint = queryParams.toString() 
      ? `${API_CONFIG.ENDPOINTS.USERS}/filter?${queryParams.toString()}`
      : API_CONFIG.ENDPOINTS.USERS
      
    return apiRequest<ApiEnvelope<UserEntity[]>>(endpoint)
  },
  getUser: async (id: string): Promise<ApiEnvelope<UserEntity>> => {
    return apiRequest<ApiEnvelope<UserEntity>>(`${API_CONFIG.ENDPOINTS.USERS}/${id}`)
  },
  updateUser: async (payload: UpdateUserRequest): Promise<ApiEnvelope<UserEntity>> => {
    return apiRequest<ApiEnvelope<UserEntity>>(API_CONFIG.ENDPOINTS.USERS, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },
  deleteUser: async (id: string): Promise<ApiEnvelope<null>> => {
    return apiRequest<ApiEnvelope<null>>(`${API_CONFIG.ENDPOINTS.USERS}/${id}`, {
      method: "DELETE",
    })
  },
}
