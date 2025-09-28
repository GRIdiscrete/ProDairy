import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authApi } from '@/lib/api/auth'
import { userProfileApi } from '@/lib/api/user-profile'
import { CookieManager } from '@/lib/utils/cookies'
import type { 
  AuthState, 
  LoginCredentials, 
  LoginResponse, 
  ExtendedUserProfile,
  AuthUser 
} from '@/lib/types/auth'

// Initialize state from cookies
const getInitialState = (): AuthState => {
  try {
    const cookies = CookieManager.getAuthCookies()
    const { accessToken, refreshToken, user, profile } = cookies
    
    if (accessToken && refreshToken && user) {
      // Parse stored user data
      const parsedUser = typeof user === 'string' ? JSON.parse(user) : user
      const parsedProfile = profile && typeof profile === 'string' ? JSON.parse(profile) : profile

      //log profile
      console.log('profile iyi', parsedProfile)
      
      
      return {
        user: parsedUser,
        profile: parsedProfile,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    }
  } catch (error) {
    console.error('Error reading auth cookies:', error)
  }
  
  return {
    user: null,
    profile: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }
}

const initialState: AuthState = getInitialState()

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue, dispatch }) => {
    try {
      console.log('loginUser: Starting login process...')
      const loginResponse = await authApi.login(credentials)
      console.log('loginUser: Login API response received:', loginResponse)
      
      // Extract user and token from the response
      const { user, access_token, refresh_token } = loginResponse
      
      // Fetch detailed user profile
      console.log('loginUser: Fetching detailed user profile...')
      const profileResponse = await userProfileApi.getUserProfile(user.id)
      const profile = profileResponse.data
      console.log('loginUser: Detailed profile fetched:', profile)

      // Store in cookies
      console.log('loginUser: Setting auth cookies...')
      CookieManager.setAuthCookies(
        access_token,
        refresh_token,
        user,
        profile
      )
      console.log('loginUser: Auth cookies set successfully')
      
      // Verify cookies were set
      const cookies = CookieManager.getAuthCookies()
      console.log('loginUser: Cookie verification after setting:', {
        accessToken: cookies.accessToken ? 'present' : 'missing',
        user: cookies.user ? 'present' : 'missing'
      })

      return {
        user: user,
        profile,
        accessToken: access_token,
        refreshToken: refresh_token,
      }
    } catch (error: any) {
      console.log('loginUser: Login failed:', error)
      console.log('Error structure:', {
        message: error.message,
        statusCode: error.statusCode,
        fullError: error
      })
      
      // Handle API error response properly
      let errorMessage = "Login failed"
      let statusCode = 500
      
      // Check if error has the API response structure
      if (error && typeof error === 'object') {
        // Direct API response structure
        if (error.message && error.statusCode) {
          errorMessage = error.message
          statusCode = error.statusCode
        }
        // Nested in response or data
        else if (error.response && error.response.data) {
          const apiError = error.response.data
          if (apiError.message && apiError.statusCode) {
            errorMessage = apiError.message
            statusCode = apiError.statusCode
          }
        }
        // Fallback to error message
        else if (error.message) {
          errorMessage = error.message
        }
      }
      
      console.log('loginUser: Processed error:', { errorMessage, statusCode })
      
      // Pass serializable error data instead of the Error object
      return rejectWithValue({
        message: errorMessage,
        statusCode: statusCode,
        apiError: error
      })
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    CookieManager.clearAuthCookies()
    return null
  }
)

export const refreshUserToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState }
      const { refreshToken } = state.auth

      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authApi.refreshToken({ refresh_token: refreshToken })
      
      // Update cookies with new tokens
      CookieManager.setCookie('access_token', response.access_token)
      CookieManager.setCookie('refresh_token', response.refresh_token)

      return {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed')
    }
  }
)

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log('fetchUserProfile: Fetching user profile for ID:', userId)
      const response = await userProfileApi.getUserProfile(userId)
      console.log('fetchUserProfile: Profile fetched successfully:', response.data)
      return response.data
    } catch (error: any) {
      console.log('fetchUserProfile: Failed to fetch profile:', error)
      const message = error?.message || 'Failed to fetch user profile'
      return rejectWithValue(message)
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('changePassword: Changing password for user:', payload.email)
      const response = await userProfileApi.changePassword(payload)
      console.log('changePassword: Password changed successfully')
      return response.data
    } catch (error: any) {
      console.log('changePassword: Failed to change password:', error)
      const message = error?.message || 'Failed to change password'
      return rejectWithValue(message)
    }
  }
)

export const validateAndRestoreSession = createAsyncThunk(
  'auth/validateAndRestoreSession',
  async (_, { rejectWithValue }) => {
    try {
      console.log('validateAndRestoreSession: Starting session validation...')
      const cookies = CookieManager.getAuthCookies()
      
      console.log('validateAndRestoreSession: Retrieved cookies:', {
        accessToken: cookies.accessToken ? 'present' : 'missing',
        refreshToken: cookies.refreshToken ? 'present' : 'missing',
        user: cookies.user ? 'present' : 'missing',
        profile: cookies.profile ? 'present' : 'missing'
      })
      
      if (!cookies.accessToken || !cookies.user) {
        console.log('validateAndRestoreSession: No authentication data found')
        throw new Error('No authentication data found')
      }

      // Check if token is expired
      if (CookieManager.isTokenExpired(cookies.accessToken)) {
        console.log('validateAndRestoreSession: Token expired')
        throw new Error('Token expired')
      }

      // Parse stored data
      const user = JSON.parse(cookies.user) as AuthUser
      const profile = cookies.profile ? JSON.parse(cookies.profile) as ExtendedUserProfile : null

      console.log('validateAndRestoreSession: Session restored successfully')
      return {
        user,
        profile,
        accessToken: cookies.accessToken,
        refreshToken: cookies.refreshToken,
      }
    } catch (error: any) {
      console.log('validateAndRestoreSession: Session validation failed:', error.message)
      // Clear invalid cookies
      CookieManager.clearAuthCookies()
      return rejectWithValue(error.message || 'Session validation failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUserProfile: (state, action: PayloadAction<ExtendedUserProfile>) => {
      state.profile = action.payload
    },
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    restoreSession: (state, action: PayloadAction<{
      user: AuthUser
      profile: ExtendedUserProfile | null
      accessToken: string
      refreshToken: string
      isAuthenticated: boolean
      isLoading: boolean
    }>) => {
      state.user = action.payload.user
      state.profile = action.payload.profile
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = action.payload.isAuthenticated
      state.isLoading = action.payload.isLoading
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login - Note: We don't set isLoading to true during login to prevent
      // the "restoring session" screen from showing in AuthProvider
      .addCase(loginUser.pending, (state) => {
        // Don't set isLoading to true during login - this prevents the "restoring session" screen
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('Redux: loginUser.fulfilled - Setting authentication state')
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.profile = action.payload.profile
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.error = null
        console.log('Redux: loginUser.fulfilled - Authentication state set successfully')
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.profile = null
        state.accessToken = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.error = null
      })
      
      // Refresh Token
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
      })
      .addCase(refreshUserToken.rejected, (state) => {
        // If refresh fails, logout the user
        state.user = null
        state.profile = null
        state.accessToken = null
        state.refreshToken = null
        state.isAuthenticated = false
      })
      
      // Validate and restore session
      .addCase(validateAndRestoreSession.pending, (state) => {
        console.log('Redux: validateAndRestoreSession.pending - Starting session restoration')
        state.isLoading = true
      })
      .addCase(validateAndRestoreSession.fulfilled, (state, action) => {
        console.log('Redux: validateAndRestoreSession.fulfilled - Session restored successfully')
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.profile = action.payload.profile
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.error = null
      })
      .addCase(validateAndRestoreSession.rejected, (state) => {
        console.log('Redux: validateAndRestoreSession.rejected - Session restoration failed')
        state.isLoading = false
        state.isAuthenticated = false
      })
      
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload as ExtendedUserProfile
        // Update cookies with new profile data
        CookieManager.setAuthCookies(
          state.accessToken!,
          state.refreshToken!,
          state.user!,
          action.payload as ExtendedUserProfile
        )
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false
        // After successful password change, logout the user
        state.user = null
        state.profile = null
        state.accessToken = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.error = null
        // Clear cookies
        CookieManager.clearAuthCookies()
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setUserProfile, updateUser, restoreSession } = authSlice.actions
export default authSlice.reducer

