import { API_CONFIG } from '@/lib/config/api'
import { authenticatedFetch, handleAuthError } from '@/lib/utils/api-interceptor'
import { CookieManager } from '@/lib/utils/cookies'

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`
  
  // Get authentication state directly from cookies instead of Redux store
  const cookies = CookieManager.getAuthCookies()
  const { accessToken } = cookies
  
  console.log('API Request Debug:', {
    url,
    endpoint,
    cookiesRetrieved: !!cookies,
    accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'null',
    hasToken: !!accessToken
  })
  
  const config: RequestInit = {
    mode: 'cors',
    // credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  }
  
  //console the config
  console.log('token iri', accessToken)
  
  // Add Authorization header if we have a token from cookies
  if (accessToken) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${accessToken}`,
    }
    console.log('Added Authorization header with token from cookies')
  } else {
    console.log('No Authorization header added: no token found in cookies')
  }
  
  // Add additional CORS headers for greatssystems.co.zw domain
  if (url.includes('greatssystems.co.zw')) {
    config.headers = {
      ...config.headers,
      'Origin': typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost:3000',
      'X-Requested-With': 'XMLHttpRequest',
    }
  }

  const response = await authenticatedFetch(url, config)
  
  if (!response.ok) {
    // Handle authentication errors specifically
    if (response.status === 401 || response.status === 403) {
      await handleAuthError(response)
    }
    
    let errorBody: any = null
    try {
      errorBody = await response.json()
    } catch (_) {
      // ignore json parse errors
    }
    const err: any = new Error(`API Error: ${response.status} ${response.statusText}`)
    err.status = response.status
    err.body = errorBody
    err.url = url
    throw err
  }

  return response.json()
}
