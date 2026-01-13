import { apiRequest } from '@/lib/utils/api-request'
import { API_CONFIG } from '@/lib/config/api'

export interface CreateAccountRequest {
  first_name: string
  last_name: string
  role_id: string
  department: string
  email: string
  password: string
  phone_number?: string
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
  errorObject?: {
    code: string
    [key: string]: any
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

export interface SendOtpResponse {
  statusCode: number
  message: string
  // Add any other fields if known, or generic wrapper
  data?: any
}

export interface VerifyOtpRequest {
  phone: string
  otp: string
  request: string // e.g., "verify_login"
}

export interface VerifyOtpResponse {
  statusCode: number
  message: string
  errorObject?: any
  data?: any
}

export interface ChangePasswordRequest {
  email: string
  password: string
}

export interface ChangePasswordResponse {
  statusCode: number
  message: string
  errorObject?: any
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

  sendOtp: async (phone: string): Promise<SendOtpResponse> => {
    // The user provided API example:
    // POST https://dms.prodairyims.co.zw/api/auth/send-otp/%2B263772440088
    // We need to encode the phone number component
    const encodedPhone = encodeURIComponent(phone);
    return apiRequest<SendOtpResponse>(`${API_CONFIG.ENDPOINTS.AUTH}/send-otp/${encodedPhone}`, {
      method: "POST",
      body: JSON.stringify({}) // Empty body as per curl example
    })
  },

  verifyOtp: async (payload: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    return apiRequest<VerifyOtpResponse>(`${API_CONFIG.ENDPOINTS.AUTH}/verify-otp`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    return apiRequest<ChangePasswordResponse>(`${API_CONFIG.ENDPOINTS.AUTH}/change-password`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }
}