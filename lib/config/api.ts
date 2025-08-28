export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ckwkcg0o80cckkg0oog8okk8.greatssystems.co.zw',
  ENDPOINTS: {
    USER_ROLES: '/user-roles',
    USERS: '/user',
    MACHINES: '/machine',
    SILOS: '/silo',
    SUPPLIERS: '/supplier',
    RAW_MATERIALS: '/raw-material',
    PROCESSES: '/process',
    PRODUCTION_PLANS: '/production-plan',
    DRIVER_FORMS: '/drivers-form',
  },
} as const

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)
  
  if (!response.ok) {
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
