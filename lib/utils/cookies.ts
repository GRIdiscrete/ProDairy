import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode'

export interface AuthCookies {
  accessToken: string | null
  refreshToken: string | null
  user: string | null
  profile: string | null
}

export interface DecodedToken {
  email: string
  sub: string
  role: string
  iat: number
  exp: number
}

export class CookieManager {
  private static readonly COOKIE_NAMES = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    PROFILE_DATA: 'profile_data',
  } as const

  private static readonly COOKIE_OPTIONS = {
    httpOnly: false, // Must be false for client-side
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  }

  static setCookie(name: string, value: string, options?: any) {
    if (typeof document !== 'undefined') {
      // Client-side
      const cookieOptions = {
        ...this.COOKIE_OPTIONS,
        ...options,
      }
      
      let cookieString = `${name}=${encodeURIComponent(value)}`
      
      if (cookieOptions.maxAge) {
        const expires = new Date(Date.now() + cookieOptions.maxAge * 1000)
        cookieString += `; expires=${expires.toUTCString()}`
      }
      
      if (cookieOptions.path) cookieString += `; path=${cookieOptions.path}`
      if (cookieOptions.sameSite) cookieString += `; samesite=${cookieOptions.sameSite}`
      if (cookieOptions.secure) cookieString += '; secure'
      
      console.log(`Setting cookie: ${name}`, cookieString)
      document.cookie = cookieString
      
      // Verify cookie was set
      const setCookie = this.getCookie(name)
      console.log(`Cookie verification: ${name} = ${setCookie ? 'set' : 'not set'}`)
    }
  }

  static getCookie(name: string): string | null {
    if (typeof document !== 'undefined') {
      // Client-side
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) {
        return decodeURIComponent(parts.pop()?.split(';').shift() || '')
      }
    }
    return null
  }

  static deleteCookie(name: string) {
    if (typeof document !== 'undefined') {
      // Client-side
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  }

  static setAuthCookies(accessToken: string, refreshToken: string, userData: any, profileData: any) {
    console.log('Setting auth cookies:', {
      accessToken: accessToken ? 'present' : 'missing',
      refreshToken: refreshToken ? 'present' : 'missing',
      userData: userData ? 'present' : 'missing',
      profileData: profileData ? 'present' : 'missing'
    })
    
    this.setCookie(this.COOKIE_NAMES.ACCESS_TOKEN, accessToken)
    this.setCookie(this.COOKIE_NAMES.REFRESH_TOKEN, refreshToken)
    this.setCookie(this.COOKIE_NAMES.USER_DATA, JSON.stringify(userData))
    this.setCookie(this.COOKIE_NAMES.PROFILE_DATA, JSON.stringify(profileData))
    
    console.log('Cookies set successfully')
  }

  static getAuthCookies(): AuthCookies {
    const cookies = {
      accessToken: this.getCookie(this.COOKIE_NAMES.ACCESS_TOKEN),
      refreshToken: this.getCookie(this.COOKIE_NAMES.REFRESH_TOKEN),
      user: this.getCookie(this.COOKIE_NAMES.USER_DATA),
      profile: this.getCookie(this.COOKIE_NAMES.PROFILE_DATA),
    }
    
    console.log('Retrieved cookies:', {
      accessToken: cookies.accessToken ? 'present' : 'missing',
      refreshToken: cookies.refreshToken ? 'present' : 'missing',
      user: cookies.user ? 'present' : 'missing',
      profile: cookies.profile ? 'present' : 'missing'
    })
    
    return cookies
  }

  static clearAuthCookies() {
    this.deleteCookie(this.COOKIE_NAMES.ACCESS_TOKEN)
    this.deleteCookie(this.COOKIE_NAMES.REFRESH_TOKEN)
    this.deleteCookie(this.COOKIE_NAMES.USER_DATA)
    this.deleteCookie(this.COOKIE_NAMES.PROFILE_DATA)
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      const currentTime = Date.now() / 1000
      return decoded.exp < currentTime
    } catch {
      return true
    }
  }

  static getTokenExpiryTime(token: string): number | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      return decoded.exp * 1000 // Convert to milliseconds
    } catch {
      return null
    }
  }

  static getTokenTimeUntilExpiry(token: string): number {
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      const currentTime = Date.now() / 1000
      return Math.max(0, decoded.exp - currentTime) * 1000 // Convert to milliseconds
    } catch {
      return 0
    }
  }

  // Debug function to check all cookies
  static debugCookies() {
    if (typeof document !== 'undefined') {
      console.log('=== Cookie Debug Info ===')
      console.log('All cookies:', document.cookie)
      console.log('Auth cookies:', this.getAuthCookies())
      
      // Check each cookie individually
      Object.entries(this.COOKIE_NAMES).forEach(([key, name]) => {
        const value = this.getCookie(name)
        console.log(`${key}: ${name} = ${value ? value.substring(0, 50) + '...' : 'null'}`)
      })
      console.log('========================')
    }
  }
}

// Make debug function available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).debugCookies = () => CookieManager.debugCookies()
  ;(window as any).checkAuthToken = () => {
    const cookies = CookieManager.getAuthCookies()
    return cookies
  }
  
  ;(window as any).setTestToken = (token: string) => {
    CookieManager.setCookie('access_token', token)
    console.log('Test token set:', token.substring(0, 50) + '...')
    return CookieManager.getAuthCookies()
  }
}

