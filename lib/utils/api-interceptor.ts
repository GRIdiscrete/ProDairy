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
      console.log('ApiInterceptor: Received 401 response, authentication required')
      // For now, we'll just return the response and let the calling code handle it
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
      throw new Error('Authentication failed')
    }
  } catch (error) {
    console.error('Error handling auth error:', error)
    throw error
  }
}

