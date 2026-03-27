import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export interface CreateAccountRequest {
  first_name: string
  last_name: string
  role_id: string
  department: string
  email: string
  password: string
  updated_at: string
}

export interface CreateAccountResponse {
  statusCode: number
  message: string
  data: {
    access_token: string
    user: {
      id: string
      email: string
      first_name: string
      last_name: string
      role: string
    }
    data: {
      email: string
      sub: string
    }
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  status: string
  statusCode: number
  message: string
  access_token: string
  refresh_token: string
  token_type: string
  user: {
    id: string
    email: string
    phone: string | null
    first_name: string
    last_name: string
    account_type: string
    created_at: string
    dob: string | null
    gender: string | null
    wallet_id: string | null
    cooperative_id: string | null
    business_id: string | null
    updated_at: string
    affliations: any
    coop_account_id: string | null
    push_token: string
    avatar: string | null
    national_id_url: string | null
    passport_url: string | null
    role: string
  }
  error: any
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>(`${API_CONFIG.ENDPOINTS.AUTH}/login`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  
  createAccount: async (payload: CreateAccountRequest): Promise<CreateAccountResponse> => {
    return apiRequest<CreateAccountResponse>(`${API_CONFIG.ENDPOINTS.AUTH}/create-account`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  
  refreshToken: async (payload: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    return apiRequest<RefreshTokenResponse>(`${API_CONFIG.ENDPOINTS.AUTH}/refresh`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
}