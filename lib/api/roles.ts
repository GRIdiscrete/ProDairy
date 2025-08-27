import { apiRequest, API_CONFIG } from '../config/api'
import { 
  UserRole, 
  CreateRoleRequest, 
  UpdateRoleRequest, 
  RolesResponse, 
  RoleResponse, 
  DeleteRoleResponse 
} from '../types/roles'

export const rolesApi = {
  // Get all user roles
  getRoles: async (): Promise<RolesResponse> => {
    return apiRequest<RolesResponse>(API_CONFIG.ENDPOINTS.USER_ROLES)
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
