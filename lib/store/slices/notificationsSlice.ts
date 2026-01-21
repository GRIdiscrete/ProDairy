import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
    getRecentNotifications,
    getNotifications,
    getModuleNotifications,
    NotificationItem,
    GetNotificationsParams
} from '@/lib/api/notifications'

interface NotificationsState {
    items: NotificationItem[]
    recentItems: NotificationItem[]
    loading: boolean
    error: string | null
    page: number
    limit: number
    moduleFilter: string | undefined
}

const initialState: NotificationsState = {
    items: [],
    recentItems: [],
    loading: false,
    error: null,
    page: 1,
    limit: 20,
    moduleFilter: undefined,
}

// Async thunks
export const fetchRecentNotifications = createAsyncThunk(
    'notifications/fetchRecent',
    async (limit: number = 8, { rejectWithValue }) => {
        try {
            const notifications = await getRecentNotifications(limit)
            return notifications
        } catch (error: any) {
            const errorMessage = error?.message || 'Failed to fetch recent notifications'
            return rejectWithValue(errorMessage)
        }
    }
)

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchAll',
    async (params: GetNotificationsParams = {}, { rejectWithValue }) => {
        try {
            const notifications = await getNotifications(params)
            return notifications
        } catch (error: any) {
            const errorMessage = error?.message || 'Failed to fetch notifications'
            return rejectWithValue(errorMessage)
        }
    }
)

export const fetchModuleNotifications = createAsyncThunk(
    'notifications/fetchByModule',
    async ({ module, params }: { module: string; params?: GetNotificationsParams }, { rejectWithValue }) => {
        try {
            const notifications = await getModuleNotifications(module, params || {})
            return notifications
        } catch (error: any) {
            const errorMessage = error?.message || 'Failed to fetch module notifications'
            return rejectWithValue(errorMessage)
        }
    }
)

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload
        },
        setLimit: (state, action: PayloadAction<number>) => {
            state.limit = action.payload
        },
        setModuleFilter: (state, action: PayloadAction<string | undefined>) => {
            state.moduleFilter = action.payload
            state.page = 1 // Reset to first page when filter changes
        },
        clearNotifications: (state) => {
            state.items = []
            state.recentItems = []
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch recent notifications
            .addCase(fetchRecentNotifications.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchRecentNotifications.fulfilled, (state, action) => {
                state.loading = false
                state.recentItems = action.payload
            })
            .addCase(fetchRecentNotifications.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // Fetch all notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false
                state.items = action.payload
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // Fetch module notifications
            .addCase(fetchModuleNotifications.pending, (state) => {
                state.loading = false
                state.error = null
            })
            .addCase(fetchModuleNotifications.fulfilled, (state, action) => {
                state.loading = false
                state.items = action.payload
            })
            .addCase(fetchModuleNotifications.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    },
})

export const { clearError, setPage, setLimit, setModuleFilter, clearNotifications } = notificationsSlice.actions
export default notificationsSlice.reducer
