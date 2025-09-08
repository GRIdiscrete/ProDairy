import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { 
  getSterilisedMilkProcesses, 
  getSterilisedMilkProcess, 
  createSterilisedMilkProcess, 
  updateSterilisedMilkProcess, 
  deleteSterilisedMilkProcess,
  getSterilisedMilkProcessDetails,
  getSterilisedMilkProcessDetail,
  createSterilisedMilkProcessDetails,
  updateSterilisedMilkProcessDetails,
  deleteSterilisedMilkProcessDetails,
  SterilisedMilkProcess,
  SterilisedMilkProcessDetails
} from '@/lib/api/data-capture-forms'

interface SterilisedMilkProcessState {
  processes: SterilisedMilkProcess[]
  currentProcess: SterilisedMilkProcess | null
  processDetails: SterilisedMilkProcessDetails[]
  currentProcessDetails: SterilisedMilkProcessDetails | null
  loading: boolean
  operationLoading: {
    create: boolean
    update: boolean
    delete: boolean
    fetch: boolean
  }
  error: string | null
  lastFetched: number | null
  isInitialized: boolean
}

const initialState: SterilisedMilkProcessState = {
  processes: [],
  currentProcess: null,
  processDetails: [],
  currentProcessDetails: null,
  loading: false,
  operationLoading: {
    create: false,
    update: false,
    delete: false,
    fetch: false,
  },
  error: null,
  lastFetched: null,
  isInitialized: false,
}

// Async thunks
export const fetchSterilisedMilkProcesses = createAsyncThunk(
  'sterilisedMilkProcesses/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { sterilisedMilkProcesses: SterilisedMilkProcessState }
      const { lastFetched, isInitialized } = state.sterilisedMilkProcesses
      
      // Skip if recently fetched (within 5 seconds)
      if (isInitialized && lastFetched && Date.now() - lastFetched < 5000) {
        return state.sterilisedMilkProcesses.processes
      }
      
      const processes = await getSterilisedMilkProcesses()
      return processes
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch sterilised milk processes'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchSterilisedMilkProcess = createAsyncThunk(
  'sterilisedMilkProcesses/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const process = await getSterilisedMilkProcess(id)
      return process
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch sterilised milk process'
      return rejectWithValue(errorMessage)
    }
  }
)

export const createSterilisedMilkProcessAction = createAsyncThunk(
  'sterilisedMilkProcesses/create',
  async (data: Omit<SterilisedMilkProcess, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const process = await createSterilisedMilkProcess(data)
      return process
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to create sterilised milk process'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updateSterilisedMilkProcessAction = createAsyncThunk(
  'sterilisedMilkProcesses/update',
  async (data: SterilisedMilkProcess, { rejectWithValue }) => {
    try {
      const process = await updateSterilisedMilkProcess(data)
      return process
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to update sterilised milk process'
      return rejectWithValue(errorMessage)
    }
  }
)

export const deleteSterilisedMilkProcessAction = createAsyncThunk(
  'sterilisedMilkProcesses/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteSterilisedMilkProcess(id)
      return id
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to delete sterilised milk process'
      return rejectWithValue(errorMessage)
    }
  }
)

// Process Details Async thunks
export const fetchSterilisedMilkProcessDetails = createAsyncThunk(
  'sterilisedMilkProcessDetails/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { sterilisedMilkProcesses: SterilisedMilkProcessState }
      const { lastFetched, isInitialized } = state.sterilisedMilkProcesses
      
      // Skip if recently fetched (within 5 seconds)
      if (isInitialized && lastFetched && Date.now() - lastFetched < 5000) {
        return state.sterilisedMilkProcesses.processDetails
      }
      
      const processDetails = await getSterilisedMilkProcessDetails()
      return processDetails
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch sterilised milk process details'
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchSterilisedMilkProcessDetail = createAsyncThunk(
  'sterilisedMilkProcessDetails/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const processDetail = await getSterilisedMilkProcessDetail(id)
      return processDetail
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to fetch sterilised milk process detail'
      return rejectWithValue(errorMessage)
    }
  }
)

export const createSterilisedMilkProcessDetailsAction = createAsyncThunk(
  'sterilisedMilkProcessDetails/create',
  async (data: Omit<SterilisedMilkProcessDetails, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const processDetails = await createSterilisedMilkProcessDetails(data)
      return processDetails
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to create sterilised milk process details'
      return rejectWithValue(errorMessage)
    }
  }
)

export const updateSterilisedMilkProcessDetailsAction = createAsyncThunk(
  'sterilisedMilkProcessDetails/update',
  async (data: SterilisedMilkProcessDetails, { rejectWithValue }) => {
    try {
      const processDetails = await updateSterilisedMilkProcessDetails(data)
      return processDetails
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to update sterilised milk process details'
      return rejectWithValue(errorMessage)
    }
  }
)

export const deleteSterilisedMilkProcessDetailsAction = createAsyncThunk(
  'sterilisedMilkProcessDetails/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteSterilisedMilkProcessDetails(id)
      return id
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to delete sterilised milk process details'
      return rejectWithValue(errorMessage)
    }
  }
)

const sterilisedMilkProcessSlice = createSlice({
  name: 'sterilisedMilkProcesses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentProcess: (state, action: PayloadAction<SterilisedMilkProcess | null>) => {
      state.currentProcess = action.payload
    },
    clearCurrentProcess: (state) => {
      state.currentProcess = null
    },
    setCurrentProcessDetails: (state, action: PayloadAction<SterilisedMilkProcessDetails | null>) => {
      state.currentProcessDetails = action.payload
    },
    clearCurrentProcessDetails: (state) => {
      state.currentProcessDetails = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all processes
      .addCase(fetchSterilisedMilkProcesses.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchSterilisedMilkProcesses.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.processes = action.payload
        state.lastFetched = Date.now()
        state.isInitialized = true
      })
      .addCase(fetchSterilisedMilkProcesses.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Fetch single process
      .addCase(fetchSterilisedMilkProcess.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSterilisedMilkProcess.fulfilled, (state, action) => {
        state.loading = false
        state.currentProcess = action.payload
      })
      .addCase(fetchSterilisedMilkProcess.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create process
      .addCase(createSterilisedMilkProcessAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createSterilisedMilkProcessAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.processes.push(action.payload)
        state.lastFetched = null // Force refresh on next fetch
      })
      .addCase(createSterilisedMilkProcessAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update process
      .addCase(updateSterilisedMilkProcessAction.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateSterilisedMilkProcessAction.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.processes.findIndex(process => process.id === action.payload.id)
        if (index !== -1) {
          state.processes[index] = action.payload
        }
        state.lastFetched = null // Force refresh on next fetch
      })
      .addCase(updateSterilisedMilkProcessAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete process
      .addCase(deleteSterilisedMilkProcessAction.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteSterilisedMilkProcessAction.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.processes = state.processes.filter(process => process.id !== action.payload)
      })
      .addCase(deleteSterilisedMilkProcessAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
      
      // Fetch all process details
      .addCase(fetchSterilisedMilkProcessDetails.pending, (state) => {
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchSterilisedMilkProcessDetails.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.processDetails = action.payload
        state.lastFetched = Date.now()
        state.isInitialized = true
      })
      .addCase(fetchSterilisedMilkProcessDetails.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })
      
      // Fetch single process detail
      .addCase(fetchSterilisedMilkProcessDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSterilisedMilkProcessDetail.fulfilled, (state, action) => {
        state.loading = false
        state.currentProcessDetails = action.payload
      })
      .addCase(fetchSterilisedMilkProcessDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Create process details
      .addCase(createSterilisedMilkProcessDetailsAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createSterilisedMilkProcessDetailsAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.processDetails.push(action.payload)
        state.lastFetched = null // Force refresh on next fetch
      })
      .addCase(createSterilisedMilkProcessDetailsAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })
      
      // Update process details
      .addCase(updateSterilisedMilkProcessDetailsAction.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateSterilisedMilkProcessDetailsAction.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.processDetails.findIndex(detail => detail.id === action.payload.id)
        if (index !== -1) {
          state.processDetails[index] = action.payload
        }
        state.lastFetched = null // Force refresh on next fetch
      })
      .addCase(updateSterilisedMilkProcessDetailsAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })
      
      // Delete process details
      .addCase(deleteSterilisedMilkProcessDetailsAction.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteSterilisedMilkProcessDetailsAction.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.processDetails = state.processDetails.filter(detail => detail.id !== action.payload)
      })
      .addCase(deleteSterilisedMilkProcessDetailsAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })
  },
})

export const { 
  clearError, 
  setCurrentProcess, 
  clearCurrentProcess,
  setCurrentProcessDetails,
  clearCurrentProcessDetails
} = sterilisedMilkProcessSlice.actions

export default sterilisedMilkProcessSlice.reducer
