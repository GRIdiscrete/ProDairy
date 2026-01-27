import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface ForgotPasswordState {
    step: 1 | 2 | 3
    phone: string
    // OTP is usually not stored long-term for security, but user asked to resume state.
    // We'll store it to pre-fill if they refreshed during verify step.
    otp: string
    isLoading: boolean
    error: string | null
    expiresAt: number | null // Timestamp when the session/OTP expires
}

const initialState: ForgotPasswordState = {
    step: 1,
    phone: "",
    otp: "",
    isLoading: false,
    error: null,
    expiresAt: null
}

export const forgotPasswordSlice = createSlice({
    name: "forgotPassword",
    initialState,
    reducers: {
        setStep: (state, action: PayloadAction<1 | 2 | 3>) => {
            state.step = action.payload
        },
        setPhone: (state, action: PayloadAction<string>) => {
            state.phone = action.payload
        },
        setOtp: (state, action: PayloadAction<string>) => {
            state.otp = action.payload
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload
        },
        setExpiresAt: (state, action: PayloadAction<number | null>) => {
            state.expiresAt = action.payload
        },
        resetForgotPassword: (state) => {
            state.step = 1
            state.phone = ""
            state.otp = ""
            state.isLoading = false
            state.error = null
            state.expiresAt = null
        },
        // Action to hydrate state from local storage
        hydrateForgotPassword: (state, action: PayloadAction<ForgotPasswordState>) => {
            return { ...state, ...action.payload }
        }
    },
})

export const {
    setStep,
    setPhone,
    setOtp,
    setLoading,
    setError,
    setExpiresAt,
    resetForgotPassword,
    hydrateForgotPassword
} = forgotPasswordSlice.actions

export default forgotPasswordSlice.reducer
