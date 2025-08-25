import { apiRequest, API_CONFIG } from "../config/api"

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
  getUsers: async (): Promise<ApiEnvelope<UserEntity[]>> => {
    return apiRequest<ApiEnvelope<UserEntity[]>>(API_CONFIG.ENDPOINTS.USERS)
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
