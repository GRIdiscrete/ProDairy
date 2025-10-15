import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { 
  getUHTQualityCheckAfterIncubations, 
  createUHTQualityCheckAfterIncubation, 
  updateUHTQualityCheckAfterIncubation, 
  deleteUHTQualityCheckAfterIncubation,
  createUHTQualityCheckAfterIncubationDetails,
  updateUHTQualityCheckAfterIncubationDetails,
  UHTQualityCheckAfterIncubation,
  UHTQualityCheckAfterIncubationDetails
} from '@/lib/api/data-capture-forms'

interface UHTQualityCheckState {
  qualityChecks: UHTQualityCheckAfterIncubation[]
  loading: boolean
  error: string | null
  operationLoading: {
    create: boolean
    update: boolean
    delete: boolean
    fetch: boolean
    createDetails: boolean
    updateDetails: boolean
  }
  isInitialized: boolean
}

const initialState: UHTQualityCheckState = {
  qualityChecks: [],
  loading: false,
  error: null,
  operationLoading: {
    create: false,
    update: false,
    delete: false,
    fetch: false,
    createDetails: false,
    updateDetails: false
  },
  isInitialized: false
}

// Async thunks
export const fetchUHTQualityChecks = createAsyncThunk(
  'uhtQualityChecks/fetchUHTQualityChecks',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getUHTQualityCheckAfterIncubations()
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch Incubation quality  checks')
    }
  }
)

export const createUHTQualityCheckAction = createAsyncThunk(
  'uhtQualityChecks/createUHTQualityCheck',
  async (qualityCheckData: Omit<UHTQualityCheckAfterIncubation, 'id' | 'created_at' | 'updated_at' | 'details'>, { rejectWithValue }) => {
    try {
      const data = await createUHTQualityCheckAfterIncubation(qualityCheckData)
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create Incubation quality  check')
    }
  }
)

export const updateUHTQualityCheckAction = createAsyncThunk(
  'uhtQualityChecks/updateUHTQualityCheck',
  async (qualityCheckData: UHTQualityCheckAfterIncubation, { rejectWithValue }) => {
    try {
      const data = await updateUHTQualityCheckAfterIncubation(qualityCheckData)
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update Incubation quality  check')
    }
  }
)

export const deleteUHTQualityCheckAction = createAsyncThunk(
  'uhtQualityChecks/deleteUHTQualityCheck',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteUHTQualityCheckAfterIncubation(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete Incubation quality  check')
    }
  }
)

export const createUHTQualityCheckDetailsAction = createAsyncThunk(
  'uhtQualityChecks/createUHTQualityCheckDetails',
  async (detailsData: Omit<UHTQualityCheckAfterIncubationDetails, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const data = await createUHTQualityCheckAfterIncubationDetails(detailsData)
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create Incubation quality  check details')
    }
  }
)

export const updateUHTQualityCheckDetailsAction = createAsyncThunk(
  'uhtQualityChecks/updateUHTQualityCheckDetails',
  async (detailsData: UHTQualityCheckAfterIncubationDetails, { rejectWithValue }) => {
    try {
      const data = await updateUHTQualityCheckAfterIncubationDetails(detailsData)
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update Incubation quality  check details')
    }
  }
)

const uhtQualityCheckSlice = createSlice({
  name: 'uhtQualityChecks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload
    }
  },
  extraReducers: (builder) => {
    // Fetch quality checks
    builder
      .addCase(fetchUHTQualityChecks.pending, (state) => {
        state.loading = true
        state.operationLoading.fetch = true
        state.error = null
      })
      .addCase(fetchUHTQualityChecks.fulfilled, (state, action) => {
        state.loading = false
        state.operationLoading.fetch = false
        state.qualityChecks = action.payload
        state.isInitialized = true
      })
      .addCase(fetchUHTQualityChecks.rejected, (state, action) => {
        state.loading = false
        state.operationLoading.fetch = false
        state.error = action.payload as string
      })

    // Create quality check
    builder
      .addCase(createUHTQualityCheckAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createUHTQualityCheckAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.qualityChecks.unshift(action.payload)
      })
      .addCase(createUHTQualityCheckAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.payload as string
      })

    // Update quality check
    builder
      .addCase(updateUHTQualityCheckAction.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateUHTQualityCheckAction.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.qualityChecks.findIndex(qualityCheck => qualityCheck.id === action.payload.id)
        if (index !== -1) {
          state.qualityChecks[index] = action.payload
        }
      })
      .addCase(updateUHTQualityCheckAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.payload as string
      })

    // Delete quality check
    builder
      .addCase(deleteUHTQualityCheckAction.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteUHTQualityCheckAction.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.qualityChecks = state.qualityChecks.filter(qualityCheck => qualityCheck.id !== action.payload)
      })
      .addCase(deleteUHTQualityCheckAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.payload as string
      })

    // Create quality check details
    builder
      .addCase(createUHTQualityCheckDetailsAction.pending, (state) => {
        state.operationLoading.createDetails = true
        state.error = null
      })
      .addCase(createUHTQualityCheckDetailsAction.fulfilled, (state, action) => {
        state.operationLoading.createDetails = false
        // Update the quality check with the new details
        const qualityCheckIndex = state.qualityChecks.findIndex(qc => qc.id === action.payload.uht_qa_check_after_incubation_id)
        if (qualityCheckIndex !== -1) {
          state.qualityChecks[qualityCheckIndex].details = action.payload.id
          state.qualityChecks[qualityCheckIndex].uht_qa_check_after_incubation_details_fkey = action.payload
        }
      })
      .addCase(createUHTQualityCheckDetailsAction.rejected, (state, action) => {
        state.operationLoading.createDetails = false
        state.error = action.payload as string
      })

    // Update quality check details
    builder
      .addCase(updateUHTQualityCheckDetailsAction.pending, (state) => {
        state.operationLoading.updateDetails = true
        state.error = null
      })
      .addCase(updateUHTQualityCheckDetailsAction.fulfilled, (state, action) => {
        state.operationLoading.updateDetails = false
        // Update the quality check details
        const qualityCheckIndex = state.qualityChecks.findIndex(qc => qc.id === action.payload.uht_qa_check_after_incubation_id)
        if (qualityCheckIndex !== -1) {
          state.qualityChecks[qualityCheckIndex].uht_qa_check_after_incubation_details_fkey = action.payload
        }
      })
      .addCase(updateUHTQualityCheckDetailsAction.rejected, (state, action) => {
        state.operationLoading.updateDetails = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, setInitialized } = uhtQualityCheckSlice.actions
export default uhtQualityCheckSlice.reducer
