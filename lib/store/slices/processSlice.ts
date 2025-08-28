import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { processApi, type CreateProcessRequest, type UpdateProcessRequest } from "@/lib/api/process"
import type { Process, TableFilters } from "@/lib/types"

export interface ProcessState {
  processes: Process[]
  selectedProcess: Process | null
  filters: TableFilters
  loading: boolean
  error: string | null
  operationLoading: {
    create: boolean
    update: boolean
    delete: boolean
    fetch: boolean
  }
}

const initialState: ProcessState = {
  processes: [],
  selectedProcess: null,
  filters: {},
  loading: false,
  error: null,
  operationLoading: {
    create: false,
    update: false,
    delete: false,
    fetch: false,
  },
}

// Async thunks
export const fetchProcesses = createAsyncThunk(
  "process/fetchProcesses", 
  async (params: { filters?: TableFilters } = {}, { rejectWithValue }) => {
    try {
      const response = await processApi.getProcesses(params)
      return response.data
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Failed to fetch processes'
      return rejectWithValue(message)
    }
  }
)

export const fetchProcess = createAsyncThunk(
  "process/fetchProcess",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await processApi.getProcess(id)
      return response.data
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Failed to fetch process'
      return rejectWithValue(message)
    }
  }
)

export const createProcess = createAsyncThunk(
  "process/createProcess",
  async (processData: CreateProcessRequest, { rejectWithValue }) => {
    try {
      const response = await processApi.createProcess(processData)
      return response.data
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Failed to create process'
      return rejectWithValue(message)
    }
  }
)

export const updateProcess = createAsyncThunk(
  "process/updateProcess",
  async (processData: UpdateProcessRequest, { rejectWithValue }) => {
    try {
      const response = await processApi.updateProcess(processData)
      return response.data
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Failed to update process'
      return rejectWithValue(message)
    }
  }
)

export const deleteProcess = createAsyncThunk(
  "process/deleteProcess",
  async (id: string, { rejectWithValue }) => {
    try {
      await processApi.deleteProcess(id)
      return id
    } catch (error: any) {
      const message = error?.body?.message || error?.message || 'Failed to delete process'
      return rejectWithValue(message)
    }
  }
)

const processSlice = createSlice({
  name: "process",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setSelectedProcess: (state, action: PayloadAction<Process | null>) => {
      state.selectedProcess = action.payload
    },
    clearSelectedProcess: (state) => {
      state.selectedProcess = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch processes
      .addCase(fetchProcesses.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchProcesses.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.processes = action.payload
      })
      .addCase(fetchProcesses.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Fetch single process
      .addCase(fetchProcess.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProcess.fulfilled, (state, action) => {
        state.loading = false
        state.selectedProcess = action.payload
      })
      .addCase(fetchProcess.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create process
      .addCase(createProcess.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createProcess.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.processes.push(action.payload)
      })
      .addCase(createProcess.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update process
      .addCase(updateProcess.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateProcess.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.processes.findIndex(process => process.id === action.payload.id)
        if (index !== -1) {
          state.processes[index] = action.payload
        }
        if (state.selectedProcess?.id === action.payload.id) {
          state.selectedProcess = action.payload
        }
      })
      .addCase(updateProcess.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete process
      .addCase(deleteProcess.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteProcess.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.processes = state.processes.filter(process => process.id !== action.payload)
        if (state.selectedProcess?.id === action.payload) {
          state.selectedProcess = null
        }
      })
      .addCase(deleteProcess.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { setFilters, clearError, setSelectedProcess, clearSelectedProcess } = processSlice.actions
export default processSlice.reducer
