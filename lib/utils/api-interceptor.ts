import { CookieManager } from './cookies'

class ApiInterceptor {
  private static instance: ApiInterceptor
  private constructor() {}

  static getInstance(): ApiInterceptor {
    if (!ApiInterceptor.instance) {
      ApiInterceptor.instance = new ApiInterceptor()
    }
    return ApiInterceptor.instance
  }

  async interceptRequest(url: string, options: RequestInit = {}): Promise<RequestInit> {
    try {
      // Get authentication state directly from cookies instead of Redux store
      const cookies = CookieManager.getAuthCookies()
      const { accessToken } = cookies
      
      // Check if Authorization header is already present
      const hasAuthHeader = options.headers && 
        (options.headers as any)['Authorization'] || 
        (options.headers as any).Authorization
      
      console.log('ApiInterceptor: interceptRequest', {
        url,
        hasAccessToken: !!accessToken,
        hasAuthHeader: !!hasAuthHeader,
        providedHeaders: options.headers
      })
      
      // Only add authorization header if not already present and we have a token from cookies
      if (accessToken && !hasAuthHeader) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`,
        }
       
      } else if (hasAuthHeader) {
       
      } else if (!accessToken) {
        
      }
      
      return options
    } catch (error) {
      console.error('Error in interceptRequest:', error)
      return options
    }
  }

  async interceptResponse(response: Response, request: Request): Promise<Response> {
    if (response.status === 401) {
      console.log('ApiInterceptor: Received 401 response, logging out user', {
        url: request.url,
        status: response.status,
        statusText: response.statusText
      })
      
      try {
        // Dispatch logout action to clear auth state and redirect
        console.log('ApiInterceptor: Dispatching logout action')
        store.dispatch(logoutUser())
        
        // Clear cookies immediately
        console.log('ApiInterceptor: Clearing auth cookies')
        CookieManager.clearAuthCookies()
        
        // Redirect to login page if we're in the browser
        if (typeof window !== 'undefined') {
          console.log('ApiInterceptor: Redirecting to login page')
          // Use a small delay to ensure the logout action completes
          setTimeout(() => {
            window.location.href = '/login'
          }, 100)
        }
      } catch (error) {
        console.error('Error during logout on 401:', error)
        // Even if logout fails, still try to redirect
        if (typeof window !== 'undefined') {
          console.log('ApiInterceptor: Fallback redirect to login page')
          window.location.href = '/login'
        }
      }
    }

    return response
  }

  // Enhanced fetch function with automatic token handling
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      // Intercept request to add token
      const interceptedOptions = await this.interceptRequest(url, options)
      
      // Make the request
      const response = await fetch(url, interceptedOptions)
      
      // Intercept response to handle token expiration
      return this.interceptResponse(response, new Request(url, interceptedOptions))
    } catch (error) {
      console.error('Error in fetch:', error)
      throw error
    }
  }
}

// Create a global instance
export const apiInterceptor = ApiInterceptor.getInstance()

// Enhanced fetch function that automatically handles authentication
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    return await apiInterceptor.fetch(url, options)
  } catch (error) {
    console.error('Error in authenticatedFetch:', error)
    throw error
  }
}

// Utility function to check if a response indicates authentication failure
export const isAuthError = (response: Response): boolean => {
  return response.status === 401 || response.status === 403
}

// Utility function to handle authentication errors
export const handleAuthError = async (response: Response): Promise<void> => {
  try {
    if (isAuthError(response)) {
      console.log('handleAuthError: Authentication failed, response status:', response.status)
      
      // Note: Store dispatch removed to avoid circular dependency
      
      // Clear cookies immediately
      CookieManager.clearAuthCookies()
      
      // Redirect to login page if we're in the browser
      if (typeof window !== 'undefined') {
        // Use a small delay to ensure the logout action completes
        setTimeout(() => {
          window.location.href = '/login'
        }, 100)
      }
      
      throw new Error('Authentication failed')
    }
  } catch (error) {
    console.error('Error handling auth error:', error)
    // Even if logout fails, still try to redirect
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw error
  }
}

// Test function to verify interceptor is working (for development/testing)
export const testInterceptor = async (): Promise<void> => {
  console.log('Testing API interceptor...')
  
  try {
    // Make a request that should return 401 (using a test endpoint)
    const response = await authenticatedFetch('/test-401-endpoint', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    })
    
    console.log('Test response status:', response.status)
  } catch (error) {
    console.log('Test completed with error (expected):', error)
  }
}

