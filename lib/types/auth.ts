export interface LoginCredentials {
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
  user: AuthUser
  error: string | null
}

export interface AuthUser {
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
  affliations: string | null
  coop_account_id: string | null
  push_token: string
  avatar: string | null
  national_id_url: string | null
  passport_url: string | null
  role: string
}

export interface UserProfile {
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

export interface UserRole {
  id: string
  views: string[]
  role_name: string
  created_at: string
  updated_at: string
  role_operations: string[]
  user_operations: string[]
  devices_operations: string[]
  process_operations: string[]
  supplier_operations: string[]
  silo_item_operations: string[]
  machine_item_operations: string[]
}

export interface ExtendedUserProfile extends UserProfile {
  users_role_id_fkey: UserRole
}

export interface AuthState {
  user: AuthUser | null
  profile: ExtendedUserProfile | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface TokenValidationResponse {
  valid: boolean
  user?: AuthUser
  error?: string
}

