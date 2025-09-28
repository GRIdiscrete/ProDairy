import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export interface ApiEnvelope<T> {
  statusCode: number
  message: string
  data: T
}

export interface UserProfileResponse {
  id: string
  created_at: string
  role_id: string
  first_name: string
  last_name: string
  email: string
  department: string
  password: string
  updated_at: string | null
  users_role_id_fkey: {
    id: string
    views: string[]
    dispatch: string | null
    role_name: string
    created_at: string
    incubation: string | null
    updated_at: string | null
    pasteurizing: string | null
    production_plan: string | null
    raw_milk_intake: string | null
    role_operations: string[]
    user_operations: string[]
    raw_milk_lab_test: string | null
    devices_operations: string[]
    filmatic_operation: string | null
    process_operations: string[]
    incubation_lab_test: string | null
    supplier_operations: string[]
    silo_item_operations: string[]
    raw_product_collection: string | null
    machine_item_operations: string[]
    steri_process_operation: string | null
    before_and_after_autoclave_lab_test: string | null
  }
}

export interface ChangePasswordRequest {
  email: string
  password: string
}

export interface ChangePasswordResponse {
  id: string
  created_at: string
  role_id: string
  first_name: string
  last_name: string
  email: string
  department: string
  password: string
  updated_at: string | null
}

export const userProfileApi = {
  // Get user profile by ID
  async getUserProfile(userId: string): Promise<ApiEnvelope<UserProfileResponse>> {
    return apiRequest<ApiEnvelope<UserProfileResponse>>(`${API_CONFIG.ENDPOINTS.USERS}/${userId}`)
  },

  // Change user password
  async changePassword(payload: ChangePasswordRequest): Promise<ApiEnvelope<ChangePasswordResponse>> {
    return apiRequest<ApiEnvelope<ChangePasswordResponse>>(`${API_CONFIG.ENDPOINTS.AUTH}/change-password`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
