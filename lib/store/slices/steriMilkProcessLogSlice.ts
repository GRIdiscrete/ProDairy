import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { steriMilkProcessLogApi, SteriMilkProcessLog, CreateSteriMilkProcessLogRequest } from '@/lib/api/steri-milk-process-log'
import { RootState } from '@/lib/store'

interface SteriMilkProcessLogState {
  logs: SteriMilkProcessLog[]
  loading: {
    fetch: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  error: string | null
  isInitialized: boolean
}

const initialState: SteriMilkProcessLogState = {
  logs: [],
  loading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
  },
  error: null,
  isInitialized: false,
}

// Async thunks
export const fetchSteriMilkProcessLogs = createAsyncThunk(
  'steriMilkProcessLog/fetchLogs',
  async (params: { filters?: { filmatic_form_id?: string; search?: string } } = {}, { rejectWithValue }) => {
    try {
      const response = await steriMilkProcessLogApi.getLogs(params)
      return response.data || response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch Steri Milk Process Logs')
    }
  }
)

export const createSteriMilkProcessLog = createAsyncThunk(
  'steriMilkProcessLog/createLog',
  async (logData: CreateSteriMilkProcessLogRequest, { rejectWithValue }) => {
    try {
      const response = await steriMilkProcessLogApi.createLog(logData)
      return response.data || response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create Steri Milk Process Log')
    }
  }
)

export const updateSteriMilkProcessLog = createAsyncThunk(
  'steriMilkProcessLog/updateLog',
  async ({ id, data }: { id: string; data: Partial<CreateSteriMilkProcessLogRequest> }, { rejectWithValue }) => {
    try {
      const response = await steriMilkProcessLogApi.updateLog(id, data)
      return response.data || response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update Steri Milk Process Log')
    }
  }
)

export const deleteSteriMilkProcessLog = createAsyncThunk(
  'steriMilkProcessLog/deleteLog',
  async (id: string, { rejectWithValue }) => {
    try {
      await steriMilkProcessLogApi.deleteLog(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete Steri Milk Process Log')
    }
  }
)

const steriMilkProcessLogSlice = createSlice({
  name: 'steriMilkProcessLog',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch logs
      .addCase(fetchSteriMilkProcessLogs.pending, (state) => {
        state.loading.fetch = true
        state.error = null
      })
      .addCase(fetchSteriMilkProcessLogs.fulfilled, (state, action: PayloadAction<SteriMilkProcessLog[]>) => {
        state.loading.fetch = false
        state.logs = action.payload
        state.isInitialized = true
      })
      .addCase(fetchSteriMilkProcessLogs.rejected, (state, action) => {
        state.loading.fetch = false
        state.error = action.payload as string
        state.isInitialized = true
      })
      // Create log
      .addCase(createSteriMilkProcessLog.pending, (state) => {
        state.loading.create = true
        state.error = null
      })
      .addCase(createSteriMilkProcessLog.fulfilled, (state, action: PayloadAction<SteriMilkProcessLog>) => {
        state.loading.create = false
        state.logs.unshift(action.payload)
      })
      .addCase(createSteriMilkProcessLog.rejected, (state, action) => {
        state.loading.create = false
        state.error = action.payload as string
      })
      // Update log
      .addCase(updateSteriMilkProcessLog.pending, (state) => {
        state.loading.update = true
        state.error = null
      })
      .addCase(updateSteriMilkProcessLog.fulfilled, (state, action: PayloadAction<SteriMilkProcessLog>) => {
        state.loading.update = false
        const index = state.logs.findIndex((log) => log.id === action.payload.id)
        if (index !== -1) {
          state.logs[index] = action.payload
        }
      })
      .addCase(updateSteriMilkProcessLog.rejected, (state, action) => {
        state.loading.update = false
        state.error = action.payload as string
      })
      // Delete log
      .addCase(deleteSteriMilkProcessLog.pending, (state) => {
        state.loading.delete = true
        state.error = null
      })
      .addCase(deleteSteriMilkProcessLog.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading.delete = false
        state.logs = state.logs.filter((log) => log.id !== action.payload)
      })
      .addCase(deleteSteriMilkProcessLog.rejected, (state, action) => {
        state.loading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, resetState } = steriMilkProcessLogSlice.actions
export default steriMilkProcessLogSlice.reducer
