import { API_CONFIG } from '@/lib/config/api'
import { authenticatedFetch } from '@/lib/utils/api-interceptor'
import type { 
  LoginCredentials, 
  LoginResponse, 
  ExtendedUserProfile, 
  TokenValidationResponse 
} from '@/lib/types/auth'

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  PROFILE: '/auth/profiles',
  USER_PROFILE: '/user',
} as const

export class AuthAPI {
  private static baseUrl = API_CONFIG.BASE_URL

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await authenticatedFetch(`${this.baseUrl}${AUTH_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Create a custom error object that preserves the API error structure
      const customError = new Error(errorData.message || `Login failed: ${response.status}`)
      ;(customError as any).statusCode = response.status
      ;(customError as any).apiError = errorData
      
      console.log('AuthAPI: Error response:', {
        status: response.status,
        errorData,
        customError: {
          message: customError.message,
          statusCode: (customError as any).statusCode,
          apiError: (customError as any).apiError
        }
      })
      
      // Also log the actual API response for debugging
      console.log('AuthAPI: Raw API error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      throw customError
    }

    return response.json()
  }

  static async getUserProfile(userId: string, accessToken?: string): Promise<ExtendedUserProfile> {
    // If accessToken is provided, use it directly; otherwise let the interceptor handle it
    const headers: Record<string, string> = {
      'Accept': '*/*',
    }
    
          if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
        console.log('AuthAPI: getUserProfile - Using provided token:', {
          userId,
          tokenLength: accessToken.length,
          tokenPreview: `${accessToken.substring(0, 20)}...`,
          headers
        })
        
        // Use native fetch when token is provided to avoid interceptor timing issues
        const response = await fetch(`${this.baseUrl}${AUTH_ENDPOINTS.USER_PROFILE}/${userId}`, {
          method: 'GET',
          headers,
        })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to fetch profile: ${response.status}`)
      }
      
            const result = await response.json()
      return result.data
    } else {
      // Use interceptor when no token provided
      const response = await authenticatedFetch(`${this.baseUrl}${AUTH_ENDPOINTS.USER_PROFILE}/${userId}`, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to fetch profile: ${response.status}`)
      }
      
      const result = await response.json()
      return result.data
    }
  }

  static async validateToken(accessToken: string): Promise<TokenValidationResponse> {
    try {
      // For now, we'll validate by trying to fetch the user profile
      // In a real implementation, you might want to call a dedicated token validation endpoint
      const response = await authenticatedFetch(`${this.baseUrl}/auth/validate`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          // Note: authenticatedFetch will automatically add the Bearer token
        },
      })

      if (response.ok) {
        return { valid: true }
      } else {
        return { valid: false, error: 'Token is invalid or expired' }
      }
    } catch (error) {
      return { valid: false, error: 'Failed to validate token' }
    }
  }

  static async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const response = await authenticatedFetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Token refresh failed: ${response.status}`)
    }

    return response.json()
  }
}

